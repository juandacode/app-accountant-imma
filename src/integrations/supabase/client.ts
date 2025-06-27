
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nzeznexjuzrnnrvfekkn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZXpuZXhqdXpybm5ydmZla2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MDk1OTQsImV4cCI6MjA2NTE4NTU5NH0.Kwr6hMlMoUqByYdaKm28LGC3vszOC6wDzhD5ugDljz8";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
