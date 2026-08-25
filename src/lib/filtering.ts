import {
  OPEN_COUNTRY_SENTINELS,
  OPEN_DISCIPLINE_SENTINELS,
} from "@/lib/constants";
import {
  filterParamsSchema,
  type EducationLevel,
  type FilterParams,
  type Scholarship,
} from "@/types";

/**
 * Pure filtering utilities shared by the server (initial SSR render for
 * shareable URLs) and the client explorer (instant re-filtering). Keeping this
 * logic in one pure module guarantees SSR and client agree — no hydration drift.
 *
 * Facet semantics: OR within a facet, AND across facets. "Open to all"
 * opportunities (empty / sentinel arrays) always match a facet, since they are
 * genuinely available to that discipline/country.
 */

const norm = (v: string) => v.trim().toLowerCase();

function isOpen(list: string[], sentinels: string[]): boolean {
  if (list.length === 0) return true;
  const set = new Set(list.map(norm));
  return sentinels.some((s) => set.has(norm(s)));
}

function overlaps(list: string[], selected: string[]): boolean {
  const set = new Set(list.map(norm));
  return selected.some((s) => set.has(norm(s)));
}

const splitCsv = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

/** Read + validate filter state from Next's searchParams object. */
export function parseFilterParams(
  searchParams: Record<string, string | string[] | undefined>,
): FilterParams {
  const candidate = {
    disciplines: splitCsv(searchParams.disciplines),
    levels: splitCsv(searchParams.levels),
    countries: splitCsv(searchParams.countries),
    funding: (Array.isArray(searchParams.funding)
      ? searchParams.funding[0]
      : searchParams.funding) as FilterParams["funding"],
    q: (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q) ?? "",
  };
  // safeParse drops anything invalid (e.g. an unknown education level) and
  // applies defaults, so the UI never receives malformed state.
  const result = filterParamsSchema.safeParse(candidate);
  return result.success ? result.data : filterParamsSchema.parse({});
}

/** Serialize filter state back to URLSearchParams (omit empties for clean URLs). */
export function serializeFilterParams(filters: FilterParams): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.disciplines.length)
    params.set("disciplines", filters.disciplines.join(","));
  if (filters.levels.length) params.set("levels", filters.levels.join(","));
  if (filters.countries.length)
    params.set("countries", filters.countries.join(","));
  if (filters.funding !== "all") params.set("funding", filters.funding);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  return params;
}

export function countActiveFilters(filters: FilterParams): number {
  return (
    filters.disciplines.length +
    filters.levels.length +
    filters.countries.length +
    (filters.funding !== "all" ? 1 : 0) +
    (filters.q.trim() ? 1 : 0)
  );
}

export function filterScholarships(
  list: Scholarship[],
  filters: FilterParams,
): Scholarship[] {
  const q = norm(filters.q);

  return list.filter((s) => {
    if (q) {
      const haystack = `${s.title} ${s.provider_name}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.funding === "fully_funded" && !s.fully_funded) return false;
    if (filters.funding === "partial" && s.fully_funded) return false;

    if (filters.levels.length) {
      const openLevels = s.education_levels.length === 0;
      if (
        !openLevels &&
        !overlaps(s.education_levels as EducationLevel[], filters.levels)
      )
        return false;
    }

    if (filters.disciplines.length) {
      const open = isOpen(s.target_disciplines, OPEN_DISCIPLINE_SENTINELS);
      if (!open && !overlaps(s.target_disciplines, filters.disciplines))
        return false;
    }

    if (filters.countries.length) {
      const open = isOpen(s.target_countries, OPEN_COUNTRY_SENTINELS);
      if (!open && !overlaps(s.target_countries, filters.countries))
        return false;
    }

    return true;
  });
}
