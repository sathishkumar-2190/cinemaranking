// ─────────────────────────────────────────────
//  Supabase client — frontend only
//  Uses the ANON key (safe for browser)
//  Never use service role key here
// ─────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.error("Missing Supabase env vars — check your .env file");
}

export const supabase = createClient(supabaseUrl, supabaseAnon);