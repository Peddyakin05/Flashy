"use client";

import * as React from "react";
import { Check, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COUNTRY_OPTIONS,
  DISCIPLINE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  FUNDING_OPTIONS,
} from "@/lib/constants";
import { countActiveFilters } from "@/lib/filtering";
import { cn } from "@/lib/utils";
import type { EducationLevel, FilterParams } from "@/types";

export const EMPTY_FILTERS: FilterParams = {
  disciplines: [],
  levels: [],
  countries: [],
  funding: "all",
  q: "",
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {active && <Check className="size-3" aria-hidden />}
      {children}
    </button>
  );
}

function ChipGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
      <span className="w-20 shrink-0 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

/**
 * Interactive filter bar: multi-select chips (Discipline, Level, Country), a
 * tri-state funding segmented control, and free-text search. It is fully
 * controlled — it renders `filters` and reports changes via `onChange`. The
 * parent (ScholarshipExplorer) owns state + URL sync, keeping this component
 * pure and reusable.
 */
export function FilterBar({
  filters,
  total,
  shown,
  onChange,
}: {
  filters: FilterParams;
  total: number;
  shown: number;
  onChange: (next: FilterParams) => void;
}) {
  const active = countActiveFilters(filters);

  const toggleLevel = (value: EducationLevel) =>
    onChange({
      ...filters,
      levels: filters.levels.includes(value)
        ? filters.levels.filter((v) => v !== value)
        : [...filters.levels, value],
    });

  const toggleDiscipline = (value: string) =>
    onChange({
      ...filters,
      disciplines: filters.disciplines.includes(value)
        ? filters.disciplines.filter((v) => v !== value)
        : [...filters.disciplines, value],
    });

  const toggleCountry = (value: string) =>
    onChange({
      ...filters,
      countries: filters.countries.includes(value)
        ? filters.countries.filter((v) => v !== value)
        : [...filters.countries, value],
    });

  return (
    <section
      aria-label="Filter opportunities"
      className="rounded-xl border bg-card p-4 shadow-sm"
    >
      {/* Search + funding */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={filters.q}
            onChange={(e) => onChange({ ...filters, q: e.target.value })}
            placeholder="Search scholarships or providers…"
            className="pl-9"
            aria-label="Search scholarships"
          />
        </div>

        <div
          role="group"
          aria-label="Funding status"
          className="inline-flex shrink-0 rounded-md border p-0.5"
        >
          {FUNDING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...filters, funding: opt.value })}
              aria-pressed={filters.funding === opt.value}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filters.funding === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chip groups */}
      <div className="mt-4 space-y-3">
        <ChipGroup label="Level">
          {EDUCATION_LEVEL_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              active={filters.levels.includes(o.value)}
              onClick={() => toggleLevel(o.value)}
            >
              {o.label}
            </Chip>
          ))}
        </ChipGroup>

        <ChipGroup label="Discipline">
          {DISCIPLINE_OPTIONS.map((d) => (
            <Chip
              key={d}
              active={filters.disciplines.includes(d)}
              onClick={() => toggleDiscipline(d)}
            >
              {d}
            </Chip>
          ))}
        </ChipGroup>

        <ChipGroup label="Country">
          {COUNTRY_OPTIONS.map((c) => (
            <Chip
              key={c}
              active={filters.countries.includes(c)}
              onClick={() => toggleCountry(c)}
            >
              {c}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      {/* Result count + clear */}
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <SlidersHorizontal className="size-4" aria-hidden />
          <span className="font-semibold text-foreground">{shown}</span>
          <span>of {total} opportunities</span>
        </p>
        {active > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            <X className="size-4" aria-hidden />
            Clear ({active})
          </Button>
        )}
      </div>
    </section>
  );
}
