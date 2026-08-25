import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Supabase client for Client Components (runs in the browser).
 * Safe to call on every render — @supabase/ssr memoizes the singleton.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
