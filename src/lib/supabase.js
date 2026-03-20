import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase Environment Variables!");
    console.error("Expected values for: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY");
    throw new Error("Supabase is not configured properly. Missing env vars.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
