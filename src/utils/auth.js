import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_SESSION_KEY = 'daily_expenses_user_session_v1';

export const signUpUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (isSupabaseConfigured()) {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) throw error;
    return {
      user: data.user,
      session: data.session,
      needsVerification: !data.session // Supabase requires email verification when session is null
    };
  }

  // Fallback demo user simulation
  const dummyUser = { id: 'guest-' + Date.now(), email };
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

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return {
      user: data.user,
      session: data.session
    };
  }

  // Fallback demo user simulation
  const dummyUser = { id: 'guest-1', email };
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
    return session?.user || null;
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }

  // Fallback trigger
  getCurrentUser().then(user => callback(user));
  return () => {};
};
