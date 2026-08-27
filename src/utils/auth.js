import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_SESSION_KEY = 'daily_expenses_user_session_v1';

export const signUpUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) throw error;

    const userObj = data.user
      ? { ...data.user, username: data.user.email?.split('@')[0] || cleanEmail.split('@')[0] }
      : null;

    return {
      user: userObj,
      session: data.session,
      needsVerification: !data.session
    };
  }

  // Fallback demo user simulation
  const dummyUser = {
    id: 'guest-' + Date.now(),
    email: cleanEmail,
    username: cleanEmail.split('@')[0]
  };
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(dummyUser));
  return {
    user: dummyUser,
    session: { user: dummyUser },
    needsVerification: false
  };
};

export const signInUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) throw error;

    const userObj = {
      ...data.user,
      username: data.user.email?.split('@')[0] || cleanEmail.split('@')[0]
    };

    return {
      user: userObj,
      session: data.session
    };
  }

  // Fallback demo user simulation
  const dummyUser = {
    id: 'guest-1',
    email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@expensetracker.local`,
    username: cleanEmail.split('@')[0]
  };
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(dummyUser));
  return {
    user: dummyUser,
    session: { user: dummyUser }
  };
};

export const resetPasswordForEmail = async (email) => {
  if (!email) {
    throw new Error('Email address is required');
  }

  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl
    });

    if (error) throw error;
    return { success: true };
  }

  // Fallback demo simulation
  return { success: true };
};

export const updateUserPassword = async (newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    const userObj = data.user
      ? { ...data.user, username: data.user.email?.split('@')[0] }
      : null;

    return {
      user: userObj,
      session: data.session
    };
  }

  // Fallback demo simulation
  const existing = localStorage.getItem(LOCAL_SESSION_KEY);
  const user = existing ? JSON.parse(existing) : { id: 'guest-1', email: 'guest@expensetracker.local', username: 'guest' };
  return {
    user,
    session: { user }
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
    await supabase.auth.signOut();
  }
  localStorage.removeItem(LOCAL_SESSION_KEY);
};

export const getCurrentUser = async () => {
  if (isSupabaseConfigured()) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      try {
        const data = localStorage.getItem(LOCAL_SESSION_KEY);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        return null;
      }
    }

    return {
      ...session.user,
      username: session.user.email?.split('@')[0]
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        const fallback = localStorage.getItem(LOCAL_SESSION_KEY);
        callback(fallback ? JSON.parse(fallback) : null, event);
        return;
      }
      callback({
        ...session.user,
        username: session.user.email?.split('@')[0]
      }, event);
    });
    return () => subscription.unsubscribe();
  }

  // Fallback trigger
  getCurrentUser().then(user => callback(user, 'INITIAL'));
  return () => {};
};
