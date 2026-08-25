import { getSampleBySlug, SAMPLE_SCHOLARSHIPS } from "@/lib/sample-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { scholarshipSchema, type Scholarship } from "@/types";

/**
 * Server-side data access. Every read is validated with Zod so a malformed row
 * can never crash a page. When Supabase isn't configured we transparently serve
 * bundled sample data, so the app is runnable the moment you clone it.
 *
 * NOTE: filtering is done client-side over the published set (see
 * lib/filtering.ts) for an instant feel. As the catalogue grows, push the
 * filters down into the query below (`.overlaps`, `.contains`, `.textSearch`).
 */

function parseRows(rows: unknown[]): Scholarship[] {
  return rows
    .map((row) => {
      const parsed = scholarshipSchema.safeParse(row);
      if (!parsed.success) {
        console.error("[scholarships] skipping malformed row", parsed.error.issues);
        return null;
      }
      return parsed.data;
    })
    .filter((s): s is Scholarship => s !== null);
}

export async function getPublishedScholarships(): Promise<Scholarship[]> {
  if (!isSupabaseConfigured()) return SAMPLE_SCHOLARSHIPS;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scholarships")
      .select("*")
      .eq("status", "published")
      // Soonest deadlines first; rolling (null) deadlines last.
      .order("deadline", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("[scholarships] query failed:", error.message);
      return [];
    }
    return parseRows(data ?? []);
  } catch (err) {
    console.error("[scholarships] unexpected error:", err);
    return [];
  }
}

export async function getScholarshipBySlug(
  slug: string,
): Promise<Scholarship | null> {
  if (!isSupabaseConfigured()) return getSampleBySlug(slug) ?? null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scholarships")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error("[scholarships] slug query failed:", error.message);
      return null;
    }
    if (!data) return null;

    const parsed = scholarshipSchema.safeParse(data);
    return parsed.success ? parsed.data : null;
  } catch (err) {
    console.error("[scholarships] unexpected error:", err);
    return null;
  }
}

/**
 * Best-effort view counter. Relies on a SECURITY DEFINER RPC
 * (`increment_scholarship_views`) so the public anon key can bump the count
 * without being granted table-level UPDATE. Never throws.
 */
export async function incrementScholarshipViews(slug: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await createClient();
    await supabase.rpc("increment_scholarship_views", { p_slug: slug });
  } catch {
    // Non-critical — swallow.
  }
}
