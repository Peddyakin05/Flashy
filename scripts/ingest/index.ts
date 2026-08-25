import { readFile } from "node:fs/promises";
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { extractOpportunity } from "./extractor";
import type { ScholarshipInsert } from "../../src/types/index";

type ExistingScholarship = {
  id: string;
  slug: string;
  official_apply_url: string;
};

type ScholarshipRow = ScholarshipInsert & {
  id: string;
  views_count: number;
  created_at: string;
  updated_at: string;
};

type Database = {
  public: {
    Tables: {
      scholarships: {
        Row: ScholarshipRow;
        Insert: ScholarshipInsert;
        Update: Partial<ScholarshipInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type AdminClient = SupabaseClient<Database>;

type CliInput =
  | { kind: "url"; source: string; dryRun: boolean }
  | { kind: "text"; source: string; officialApplyUrl?: string; dryRun: boolean }
  | { kind: "file"; source: string; officialApplyUrl?: string; dryRun: boolean };

config({ path: ".env.local" });
config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function fail(message: string): never {
  console.error(`\n[ingest] ${message}\n`);
  process.exit(1);
}

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function collectFlagValues(argv: string[]): Map<string, string> {
  const knownFlags = new Set(["--url", "--text", "--file", "--dry-run"]);
  const flags = new Map<string, string>();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      fail(`Unexpected positional argument: ${token}`);
    }

    if (!knownFlags.has(token)) {
      fail(`Unknown flag: ${token}`);
    }

    if (token === "--dry-run") {
      flags.set(token, "true");
      continue;
    }

    const valueParts: string[] = [];
    while (argv[i + 1] && !argv[i + 1].startsWith("--")) {
      valueParts.push(argv[i + 1]);
      i += 1;
    }

    const value = valueParts.join(" ").trim();
    if (!value) fail(`${token} requires a value.`);
    flags.set(token, value);
  }

  return flags;
}

function parseArgs(argv: string[]): CliInput {
  const flags = collectFlagValues(argv);
  const url = flags.get("--url");
  const text = flags.get("--text");
  const file = flags.get("--file");
  const dryRun = flags.has("--dry-run");

  if (!url && !text && !file) {
    fail(
      "Missing source.\n" +
        "Usage:\n" +
        "  pnpm ingest -- --url https://example.edu/scholarship\n" +
        "  pnpm ingest -- --file ./opportunity.txt\n" +
        "  pnpm ingest -- --text \"Scholarship title: ...\"\n" +
        "  pnpm ingest -- --dry-run --text \"Scholarship title: ...\" --url https://example.edu/apply",
    );
  }

  if (url && !isUrl(url)) fail("--url requires a valid http(s) URL.");

  if (text) {
    return {
      kind: "text",
      source: text,
      officialApplyUrl: url,
      dryRun,
    };
  }

  if (file) {
    return {
      kind: "file",
      source: file,
      officialApplyUrl: url,
      dryRun,
    };
  }

  return { kind: "url", source: url!, dryRun };
}

async function readInput(
  input: CliInput,
): Promise<{ kind: "url" | "text"; source: string; officialApplyUrl?: string }> {
  if (input.kind === "file") {
    return {
      kind: "text",
      source: await readFile(input.source, "utf8"),
      officialApplyUrl: input.officialApplyUrl,
    };
  }

  return input;
}

async function findExistingScholarship(
  supabase: AdminClient,
  row: ScholarshipInsert,
): Promise<ExistingScholarship | null> {
  const bySlug = await supabase
    .from("scholarships")
    .select("id, slug, official_apply_url")
    .eq("slug", row.slug)
    .maybeSingle<ExistingScholarship>();

  if (bySlug.error) {
    throw new Error(`Slug lookup failed: ${bySlug.error.message}`);
  }

  if (bySlug.data) return bySlug.data;

  const byUrl = await supabase
    .from("scholarships")
    .select("id, slug, official_apply_url")
    .eq("official_apply_url", row.official_apply_url)
    .maybeSingle<ExistingScholarship>();

  if (byUrl.error) {
    throw new Error(`URL lookup failed: ${byUrl.error.message}`);
  }

  return byUrl.data;
}

async function upsertScholarship(
  supabase: AdminClient,
  row: ScholarshipInsert,
): Promise<{ action: "inserted" | "updated"; slug: string }> {
  const existing = await findExistingScholarship(supabase, row);

  if (existing) {
    const { data, error } = await supabase
      .from("scholarships")
      .update(row)
      .eq("id", existing.id)
      .select("slug")
      .single<{ slug: string }>();

    if (error) throw new Error(`Update failed: ${error.message}`);
    return { action: "updated", slug: data.slug };
  }

  const { data, error } = await supabase
    .from("scholarships")
    .insert(row)
    .select("slug")
    .single<{ slug: string }>();

  if (error) throw new Error(`Insert failed: ${error.message}`);
  return { action: "inserted", slug: data.slug };
}

async function main() {
  const cliInput = parseArgs(process.argv.slice(2));
  const extractionInput = await readInput(cliInput);
  const row = await extractOpportunity(extractionInput);

  if (cliInput.dryRun) {
    console.log(JSON.stringify(row, null, 2));
    return;
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    fail(
      "Missing Supabase credentials.\n" +
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await upsertScholarship(supabase, row);
  console.log(`[ingest] ${result.action}: ${result.slug}`);
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
