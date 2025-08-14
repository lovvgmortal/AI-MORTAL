import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://lqcphqhczaknmalnrnli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY3BocWhjemFrbm1hbG5ybmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDg5MTksImV4cCI6MjA3MDYyNDkxOX0.KSzR2xgR7ZhTQQI_zoVDRRuIc7VN5nvBlVZgY3Pt3sQ';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);