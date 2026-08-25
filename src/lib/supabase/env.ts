/**
 * Central place to read Supabase env vars. `NEXT_PUBLIC_*` values are inlined
 * into the client bundle at build time; the service-role key is server-only
 * and intentionally NOT read here.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True when both public Supabase credentials are present. The data layer uses
 * this to decide whether to hit the database or fall back to bundled sample
 * data, so the app is runnable before Supabase is wired up.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
