/**
 * Seed script — inserts the sample opportunities into Supabase.
 *
 *   pnpm seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * The service-role key bypasses RLS (server-only — never ship it to the
 * browser). Rows are validated with the same Zod insert schema the app uses,
 * then upserted on `slug` so re-running is idempotent.
 *
 * Imports use RELATIVE paths (not the "@/" alias) so this runs under tsx with
 * no path-resolution config. sample-data.ts imports only types, so it loads
 * cleanly here.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

import { SAMPLE_SCHOLARSHIPS } from "../src/lib/sample-data";
import { scholarshipInsertSchema } from "../src/types/index";

// Load .env.local first (Next's convention), then fall back to .env.
config({ path: ".env.local" });
config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    fail(
      "Missing Supabase credentials.\n" +
        "  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local\n" +
        "  (copy .env.local.example and fill in your project values).",
    );
  }

  // Validate every record up front — a bad row should fail loudly, not silently
  // land malformed data in the database. Unknown keys (id, timestamps) are
  // stripped by the insert schema; we force status=published so they're live.
  const rows = SAMPLE_SCHOLARSHIPS.map((sample, i) => {
    const parsed = scholarshipInsertSchema.safeParse(sample);
    if (!parsed.success) {
      fail(
        `Sample #${i + 1} (${sample.slug}) is invalid:\n` +
          JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
      );
    }
    return { ...parsed.data, status: "published" as const };
  });

  console.log(`\nSeeding ${rows.length} scholarships → ${SUPABASE_URL}`);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("scholarships")
    .upsert(rows, { onConflict: "slug" })
    .select("slug");

  if (error) {
    fail(`Upsert failed: ${error.message}`);
  }

  for (const row of data ?? []) {
    console.log(`  ✓ ${row.slug}`);
  }
  console.log(`\n✔ Done — ${data?.length ?? 0} rows upserted.\n`);
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
