import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

import { SAMPLE_SCHOLARSHIPS } from "@/lib/sample-data";
import {
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/lib/supabase/env";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const STATIC_ROUTES = ["/", "/about", "/privacy-policy", "/terms", "/contact"];

type SitemapScholarship = {
  slug: string;
  updated_at: string;
};

type Database = {
  public: {
    Tables: {
      scholarships: {
        Row: SitemapScholarship & { status: "draft" | "published" | "expired" };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

async function getSitemapScholarships(): Promise<SitemapScholarship[]> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_SCHOLARSHIPS.map(({ slug, updated_at }) => ({
      slug,
      updated_at,
    }));
  }

  const supabase = createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("scholarships")
    .select("slug, updated_at")
    .eq("status", "published");

  if (error) {
    console.error("[sitemap] scholarship query failed:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const scholarships = await getSitemapScholarships();
  const now = new Date();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: route === "/" ? 1 : 0.7,
    })),
    ...scholarships.map((scholarship) => ({
      url: absoluteUrl(`/scholarships/${scholarship.slug}`),
      lastModified: new Date(scholarship.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
