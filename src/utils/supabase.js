import { createClient } from '@supabase/supabase-js';

// Default public sandbox credentials or fallback configuration
//const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
//const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';

// Default public sandbox credentials or fallback configuration
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://aemcpapcsgjbyskqkstl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_IvyMF5TQn5-tQe7jAqgrCQ_kSF458dY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Utility helper to test connection or fallback gracefully
export const isSupabaseConfigured = () => {
  return Boolean(
    import.meta.env?.VITE_SUPABASE_URL &&
    import.meta.env?.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('dummy')
  );
};
