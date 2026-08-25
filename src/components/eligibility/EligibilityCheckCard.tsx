"use client";

import * as React from "react";
import {
  CheckCircle2,
  CircleHelp,
  Minus,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COUNTRY_OPTIONS,
  DISCIPLINE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  OPEN_COUNTRY_SENTINELS,
  OPEN_DISCIPLINE_SENTINELS,
} from "@/lib/constants";
import {
  type CriterionStatus,
  type EligibilityVerdict,
  evaluateEligibility,
} from "@/lib/eligibility";
import { cn } from "@/lib/utils";
import type { EducationLevel, EligibilityInput, Scholarship } from "@/types";

type Criteria = Pick<
  Scholarship,
  "min_cgpa" | "education_levels" | "target_disciplines" | "target_countries"
>;

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Applicants pick their *own* profile, so drop the "Any/Open" sentinels.
const DISCIPLINE_CHOICES = DISCIPLINE_OPTIONS.filter(
  (d) => !OPEN_DISCIPLINE_SENTINELS.includes(d),
);
const COUNTRY_CHOICES = COUNTRY_OPTIONS.filter(
  (c) => !OPEN_COUNTRY_SENTINELS.includes(c),
);

const STATUS_ICON: Record<CriterionStatus, React.ReactNode> = {
  pass: <CheckCircle2 className="size-4 text-success" aria-hidden />,
  fail: <XCircle className="size-4 text-destructive" aria-hidden />,
  unknown: <CircleHelp className="size-4 text-muted-foreground" aria-hidden />,
  open: <Minus className="size-4 text-muted-foreground" aria-hidden />,
};

const VERDICT_META: Record<
  EligibilityVerdict,
  { title: string; blurb: string; className: string }
> = {
  eligible: {
    title: "You look eligible",
    blurb: "Your profile meets every criterion we list.",
    className: "border-success/30 bg-success/10 text-success",
  },
  not_eligible: {
    title: "Some criteria aren't met",
    blurb: "One or more requirements don't match your profile.",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  needs_info: {
    title: "Check your eligibility",
    blurb: "Fill in your details for an instant, private assessment.",
    className: "border-border bg-muted/50 text-foreground",
  },
};

/**
 * Deliverable #4 — the lightweight eligibility checker.
 *
 * Everything runs in the browser against {@link evaluateEligibility}: no API
 * calls, no LLM, no network. Inputs are self-reported and never leave the
 * device, so the check is instant and private. CGPA is range-validated (0–5)
 * before it's fed to the engine so an out-of-range value can't produce a
 * misleading "pass".
 */
export function EligibilityCheckCard({
  scholarship,
}: {
  scholarship: Criteria;
}) {
  const [cgpa, setCgpa] = React.useState("");
  const [level, setLevel] = React.useState<EducationLevel | "">("");
  const [discipline, setDiscipline] = React.useState("");
  const [country, setCountry] = React.useState("");

  const cgpaNum = cgpa.trim() === "" ? undefined : Number(cgpa);
  const cgpaError =
    cgpaNum !== undefined &&
    (!Number.isFinite(cgpaNum) || cgpaNum < 0 || cgpaNum > 5);

  const input = React.useMemo<EligibilityInput>(() => {
    const next: EligibilityInput = {};
    if (cgpaNum !== undefined && Number.isFinite(cgpaNum) && !cgpaError) {
      next.cgpa = cgpaNum;
    }
    if (level) next.level = level;
    if (discipline) next.discipline = discipline;
    if (country) next.country = country;
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cgpaNum, cgpaError, level, discipline, country]);

  const result = React.useMemo(
    () => evaluateEligibility(input, scholarship),
    [input, scholarship],
  );

  const touched =
    cgpa !== "" || level !== "" || discipline !== "" || country !== "";
  const meta = VERDICT_META[result.verdict];

  const reset = () => {
    setCgpa("");
    setLevel("");
    setDiscipline("");
    setCountry("");
  };

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-primary" aria-hidden />
        <h2 className="text-base font-semibold">Am I eligible?</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        A quick, private check against this scholarship&rsquo;s criteria. Your
        answers stay on your device.
      </p>

      {/* Inputs */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="elig-cgpa">Your CGPA</Label>
          <Input
            id="elig-cgpa"
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            max={5}
            placeholder="e.g. 4.20"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            aria-invalid={cgpaError || undefined}
            aria-describedby={cgpaError ? "elig-cgpa-error" : undefined}
          />
          {cgpaError && (
            <p id="elig-cgpa-error" className="text-xs text-destructive">
              Enter a CGPA between 0.00 and 5.00.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="elig-level">Study level</Label>
          <select
            id="elig-level"
            className={SELECT_CLASS}
            value={level}
            onChange={(e) => setLevel(e.target.value as EducationLevel | "")}
          >
            <option value="">Select level…</option>
            {EDUCATION_LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="elig-discipline">Field of study</Label>
          <select
            id="elig-discipline"
            className={SELECT_CLASS}
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
          >
            <option value="">Select field…</option>
            {DISCIPLINE_CHOICES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="elig-country">Destination</Label>
          <select
            id="elig-country"
            className={SELECT_CLASS}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Select destination…</option>
            {COUNTRY_CHOICES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Verdict */}
      <div
        role="status"
        aria-live="polite"
        className={cn("mt-4 rounded-lg border p-3", meta.className)}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">{meta.title}</p>
          {result.evaluated > 0 && (
            <span className="shrink-0 text-xs font-medium tabular-nums opacity-80">
              {result.passed}/{result.evaluated} met
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs opacity-90">{meta.blurb}</p>
      </div>

      {/* Per-criterion breakdown */}
      <ul className="mt-3 space-y-2">
        {result.criteria.map((c) => (
          <li key={c.key} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 shrink-0">{STATUS_ICON[c.status]}</span>
            <div className="min-w-0">
              <p className="font-medium leading-tight">
                {c.label}
                <span className="ml-1.5 font-normal text-muted-foreground">
                  · {c.requirement}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Guidance only — always confirm on the official page.
        </p>
        {touched && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        )}
      </div>
    </section>
  );
}
