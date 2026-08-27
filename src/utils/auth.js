import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_SESSION_KEY = 'daily_expenses_user_session_v1';
const USERS_DB_KEY = 'daily_expenses_users_db_v1';

// Helper to retrieve all registered users from local storage user database table
export const getUsersFromDb = () => {
  try {
    const data = localStorage.getItem(USERS_DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading users database table:', err);
    return [];
  }
};

// Helper to save a user to local storage and Supabase database tables
export const saveUserToDb = async (userObj) => {
  const users = getUsersFromDb();
  const existingIdx = users.findIndex(u => u.id === userObj.id || u.username === userObj.username || u.email === userObj.email);

  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...userObj };
  } else {
    users.push(userObj);
  }

  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

  if (isSupabaseConfigured()) {
    try {
      // Sync user to Supabase users and profiles database tables
      await supabase.from('users').upsert([{
        id: userObj.id,
        username: userObj.username,
        email: userObj.email,
        password_hash: userObj.password || 'managed_auth'
      }]).catch(() => {});

      await supabase.from('profiles').upsert([{
        id: userObj.id,
        username: userObj.username,
        email: userObj.email
      }]).catch(() => {});
    } catch (err) {
      console.error('Supabase user database sync error:', err);
    }
  }
};

export const signUpUser = async (email, username, password) => {
  if (!email || !username || !password) {
    throw new Error('Email, username, and password are required');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim().toLowerCase();

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Check duplicate in local user DB
  const localUsers = getUsersFromDb();
  const duplicateUser = localUsers.find(
    u => u.username === cleanUsername || u.email === cleanEmail
  );

  if (duplicateUser) {
    if (duplicateUser.username === cleanUsername) {
      throw new Error('Username is already taken. Please choose another one.');
    } else {
      throw new Error('An account with this email already exists. Please log in.');
    }
  }

  // Check duplicate in Supabase DB if configured
  if (isSupabaseConfigured()) {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username, email')
        .or(`username.eq.${cleanUsername},email.eq.${cleanEmail}`)
        .maybeSingle();

      if (existingProfile) {
        if (existingProfile.username === cleanUsername) {
          throw new Error('Username is already taken. Please choose another one.');
        } else {
          throw new Error('An account with this email already exists. Please log in.');
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('already taken')) throw err;
    }
  }

  let createdUserId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  let sessionData = null;

  if (isSupabaseConfigured()) {
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { username: cleanUsername }
        }
      });

      if (!error && data.user) {
        createdUserId = data.user.id;
        sessionData = data.session;
      }
    } catch (err) {
      console.warn('Supabase Auth signUp fallback to local user DB:', err);
    }
  }

  const newUserRecord = {
    id: createdUserId,
    email: cleanEmail,
    username: cleanUsername,
    password: password,
    created_at: new Date().toISOString()
  };

  await saveUserToDb(newUserRecord);

  const sessionUser = {
    id: createdUserId,
    email: cleanEmail,
    username: cleanUsername
  };

  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));

  return {
    user: sessionUser,
    session: sessionData || { user: sessionUser },
    needsVerification: false
  };
};

export const signInUser = async (usernameOrEmail, password) => {
  if (!usernameOrEmail || !password) {
    throw new Error('Username or email and password are required');
  }

  const input = usernameOrEmail.trim().toLowerCase();

  // Look up user in local DB users table
  const localUsers = getUsersFromDb();
  let foundLocalUser = localUsers.find(
    u => u.username === input || u.email === input
  );

  let authenticatedUser = null;

  if (isSupabaseConfigured()) {
    let emailToUse = input;
    if (!input.includes('@')) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, username')
          .eq('username', input)
          .maybeSingle();

        if (profile) {
          emailToUse = profile.email;
        }
      } catch (err) {
        // ignore profile lookup error
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password
      });

      if (!error && data.user) {
        const username = data.user.user_metadata?.username || input.split('@')[0];
        authenticatedUser = {
          id: data.user.id,
          email: data.user.email,
          username: username
        };
      }
    } catch (err) {
      // ignore, fallback to local DB check
    }
  }

  // Fallback to local DB check if Supabase did not authenticate
  if (!authenticatedUser) {
    if (!foundLocalUser) {
      // Try fetching user from Supabase 'users' or 'profiles' table if local DB empty
      if (isSupabaseConfigured()) {
        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .or(`username.eq.${input},email.eq.${input}`)
            .maybeSingle();

          if (dbUser) {
            foundLocalUser = {
              id: dbUser.id,
              username: dbUser.username,
              email: dbUser.email,
              password: dbUser.password_hash
            };
            await saveUserToDb(foundLocalUser);
          }
        } catch (err) {}
      }
    }

    if (!foundLocalUser) {
      throw new Error('User not found. Please check your credentials or register a new account.');
    }

    if (foundLocalUser.password && foundLocalUser.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }

    authenticatedUser = {
      id: foundLocalUser.id,
      email: foundLocalUser.email,
      username: foundLocalUser.username
    };
  }

  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(authenticatedUser));

  return {
    user: authenticatedUser,
    session: { user: authenticatedUser }
  };
};

export const updateUserProfile = async (userId, updates) => {
  if (!userId) throw new Error('User ID is required');

  const localUsers = getUsersFromDb();
  const userIdx = localUsers.findIndex(u => u.id === userId);

  if (userIdx >= 0) {
    localUsers[userIdx] = { ...localUsers[userIdx], ...updates };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(localUsers));
  }

  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    const updatedSessionUser = { ...currentUser, ...updates };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updatedSessionUser));
  }

  if (isSupabaseConfigured()) {
    try {
      if (updates.username || updates.email || updates.theme) {
        await supabase.from('users').update({
          ...(updates.username ? { username: updates.username } : {}),
          ...(updates.email ? { email: updates.email } : {}),
          ...(updates.theme ? { theme: updates.theme } : {})
        }).eq('id', userId);

        await supabase.from('profiles').update({
          ...(updates.username ? { username: updates.username } : {}),
          ...(updates.email ? { email: updates.email } : {}),
          ...(updates.theme ? { theme: updates.theme } : {})
        }).eq('id', userId);
      }
    } catch (err) {
      console.error('Error updating profile in Supabase:', err);
    }
  }

  return await getCurrentUser();
};

export const signOutUser = async () => {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (err) {}
  }
  localStorage.removeItem(LOCAL_SESSION_KEY);
};

export const getCurrentUser = async () => {
  try {
    const data = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!data) return null;
    const user = JSON.parse(data);

    // Purge legacy guest / demo accounts
    if (!user || user.id?.startsWith('guest-') || user.username === 'demo_user' || user.username === 'guest') {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      return null;
    }

    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let username = session.user.user_metadata?.username || user.username;
        return {
          id: session.user.id,
          email: session.user.email,
          username: username
        };
      }
    }

    return user;
  } catch (err) {
    return null;
  }
};

export const onAuthStateChange = (callback) => {
  if (isSupabaseConfigured()) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        const localUser = await getCurrentUser();
        callback(localUser);
        return;
      }
      let username = session.user.user_metadata?.username;
      if (!username) {
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();
          if (prof) username = prof.username;
        } catch (e) {}
      }
      const user = {
        id: session.user.id,
        email: session.user.email,
        username: username || session.user.email?.split('@')[0]
      };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
      callback(user);
    });
    return () => subscription.unsubscribe();
  }

  getCurrentUser().then(user => callback(user));
  return () => {};
};
