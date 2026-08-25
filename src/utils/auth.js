import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_SESSION_KEY = 'daily_expenses_user_session_v1';

export const signUpUser = async (email, username, password) => {
  if (!email || !username || !password) {
    throw new Error('Email, username, and password are required');
  }

  const cleanUsername = username.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    // 1. Check if username is already taken in profiles table
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existingUser) {
      throw new Error('Username is already taken. Please choose another one.');
    }

    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;

    // 2. Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: cleanUsername
        }
      }
    });

    if (error) throw error;

    // 3. Create profile record if user created immediately
    if (data.user) {
      await supabase.from('profiles').upsert([
        {
          id: data.user.id,
          username: cleanUsername,
          email: email.trim().toLowerCase()
        }
      ]).catch(console.error);
    }

    return {
      user: data.user ? { ...data.user, username: cleanUsername } : null,
      session: data.session,
      needsVerification: !data.session
    };
  }

  // Fallback demo user simulation
  const dummyUser = { id: 'guest-' + Date.now(), email, username: cleanUsername };
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(dummyUser));
  return {
    user: dummyUser,
    session: { user: dummyUser },
    needsVerification: false
  };
};

export const signInUser = async (usernameOrEmail, password) => {
  if (!usernameOrEmail || !password) {
    throw new Error('Username/email and password are required');
  }

  const input = usernameOrEmail.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    let emailToUse = input;

    // If input is a username (not an email address containing '@'), resolve email from profiles
    if (!input.includes('@')) {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('email, username')
        .eq('username', input)
        .maybeSingle();

      if (profileErr || !profile) {
        throw new Error('Username not found');
      }
      emailToUse = profile.email;
    }

    // Authenticate with resolved email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password
    });

    if (error) throw error;

    // Fetch profile username if available
    let username = data.user?.user_metadata?.username;
    if (!username && data.user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .maybeSingle();
      if (prof) username = prof.username;
    }

    const userWithUsername = {
      ...data.user,
      username: username || data.user.email.split('@')[0]
    };

    return {
      user: userWithUsername,
      session: data.session
    };
  }

  // Fallback demo user simulation
  const dummyUser = { id: 'guest-1', email: input.includes('@') ? input : `${input}@expensetracker.local`, username: input };
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(dummyUser));
  return {
    user: dummyUser,
    session: { user: dummyUser }
  };
};

export const signOutUser = async () => {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(LOCAL_SESSION_KEY);
};

export const getCurrentUser = async () => {
  if (isSupabaseConfigured()) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    let username = session.user.user_metadata?.username;
    if (!username) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .maybeSingle();
      if (prof) username = prof.username;
    }

    return {
      ...session.user,
      username: username || session.user.email?.split('@')[0]
    };
  }

  try {
    const data = localStorage.getItem(LOCAL_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

export const onAuthStateChange = (callback) => {
  if (isSupabaseConfigured()) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      let username = session.user.user_metadata?.username;
      if (!username) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .maybeSingle();
        if (prof) username = prof.username;
      }
      callback({
        ...session.user,
        username: username || session.user.email?.split('@')[0]
      });
    });
    return () => subscription.unsubscribe();
  }

  // Fallback trigger
  getCurrentUser().then(user => callback(user));
  return () => {};
};
