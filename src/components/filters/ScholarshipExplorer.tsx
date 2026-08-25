"use client";

import * as React from "react";
import { SearchX } from "lucide-react";

import { ScholarshipCard } from "@/components/cards/ScholarshipCard";
import { EMPTY_FILTERS, FilterBar } from "@/components/filters/FilterBar";
import { Button } from "@/components/ui/button";
import {
  filterScholarships,
  parseFilterParams,
  serializeFilterParams,
} from "@/lib/filtering";
import type { FilterParams, Scholarship } from "@/types";

/**
 * Client explorer: owns filter state and renders the filtered grid instantly.
 *
 * The full published set is passed in from the server once. Filtering happens
 * entirely on the client against that in-memory list — no network per keystroke
 * — while the URL is kept in sync with a shallow `history.replaceState` so
 * results stay shareable and refresh-safe. `initialFilters` (parsed on the
 * server) makes the first SSR paint match any incoming query string exactly.
 */
export function ScholarshipExplorer({
  scholarships,
  initialFilters,
}: {
  scholarships: Scholarship[];
  initialFilters: FilterParams;
}) {
  const [filters, setFilters] = React.useState<FilterParams>(initialFilters);

  const applyFilters = React.useCallback((next: FilterParams) => {
    setFilters(next);
    const qs = serializeFilterParams(next).toString();
    const url = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, []);

  // Reflect browser back/forward navigation.
  React.useEffect(() => {
    const onPop = () => {
      const sp = Object.fromEntries(
        new URLSearchParams(window.location.search),
      );
      setFilters(parseFilterParams(sp));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const results = React.useMemo(
    () => filterScholarships(scholarships, filters),
    [scholarships, filters],
  );

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        filters={filters}
        total={scholarships.length}
        shown={results.length}
        onChange={applyFilters}
      />

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-semibold">No matching opportunities</p>
            <p className="text-sm text-muted-foreground">
              Try removing a filter or broadening your search.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFilters(EMPTY_FILTERS)}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {results.map((s) => (
            <div role="listitem" key={s.id}>
              <ScholarshipCard scholarship={s} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
