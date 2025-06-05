
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mmcmimmzgvovmvnbsznv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY21pbW16Z3Zvdm12bmJzem52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTE2ODIsImV4cCI6MjA2MTc2NzY4Mn0.Uz2UXr9llQCxDJNY-OJaspAmie1v9gfVCYmyEm3SdiU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
