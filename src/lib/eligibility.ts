import {
  EDUCATION_LEVEL_LABELS,
  OPEN_COUNTRY_SENTINELS,
  OPEN_DISCIPLINE_SENTINELS,
} from "@/lib/constants";
import { formatCgpa } from "@/lib/format";
import type { EligibilityInput, Scholarship } from "@/types";

/**
 * DETERMINISTIC eligibility engine — pure functions, no network, no LLM.
 *
 * Given a visitor's self-reported profile and a scholarship's criteria, it
 * returns a per-criterion breakdown and an overall verdict. Because it's a
 * plain function it is instant, free, offline-capable and unit-testable.
 */

export type CriterionStatus = "pass" | "fail" | "unknown" | "open";

export interface CriterionResult {
  key: "cgpa" | "level" | "discipline" | "country";
  label: string;
  /** What the scholarship requires, human-readable. */
  requirement: string;
  status: CriterionStatus;
  /** Explanation of the outcome for this criterion. */
  detail: string;
}

export type EligibilityVerdict = "eligible" | "not_eligible" | "needs_info";

export interface EligibilityResult {
  verdict: EligibilityVerdict;
  /** Fraction (0–1) of *evaluated* criteria that passed. */
  score: number;
  passed: number;
  evaluated: number;
  criteria: CriterionResult[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function isOpenList(list: string[], sentinels: string[]): boolean {
  if (list.length === 0) return true;
  const set = new Set(list.map(normalize));
  return sentinels.some((s) => set.has(normalize(s)));
}

function listIncludes(list: string[], value: string): boolean {
  const set = new Set(list.map(normalize));
  return set.has(normalize(value));
}

export function evaluateEligibility(
  input: EligibilityInput,
  scholarship: Pick<
    Scholarship,
    "min_cgpa" | "education_levels" | "target_disciplines" | "target_countries"
  >,
): EligibilityResult {
  const criteria: CriterionResult[] = [];

  /* ---- CGPA ---- */
  if (scholarship.min_cgpa === null) {
    criteria.push({
      key: "cgpa",
      label: "Minimum CGPA",
      requirement: "No minimum",
      status: "open",
      detail: "This opportunity has no CGPA cut-off.",
    });
  } else if (input.cgpa === undefined) {
    criteria.push({
      key: "cgpa",
      label: "Minimum CGPA",
      requirement: formatCgpa(scholarship.min_cgpa),
      status: "unknown",
      detail: "Enter your CGPA to check this requirement.",
    });
  } else {
    const ok = input.cgpa >= scholarship.min_cgpa;
    criteria.push({
      key: "cgpa",
      label: "Minimum CGPA",
      requirement: formatCgpa(scholarship.min_cgpa),
      status: ok ? "pass" : "fail",
      detail: ok
        ? `Your ${input.cgpa.toFixed(2)} meets the minimum.`
        : `Your ${input.cgpa.toFixed(2)} is below the ${scholarship.min_cgpa.toFixed(2)} minimum.`,
    });
  }

  /* ---- Education level ---- */
  if (scholarship.education_levels.length === 0) {
    criteria.push({
      key: "level",
      label: "Study level",
      requirement: "All levels",
      status: "open",
      detail: "Open to all study levels.",
    });
  } else {
    const requirement = scholarship.education_levels
      .map((l) => EDUCATION_LEVEL_LABELS[l] ?? l)
      .join(", ");
    if (input.level === undefined) {
      criteria.push({
        key: "level",
        label: "Study level",
        requirement,
        status: "unknown",
        detail: "Select your study level to check.",
      });
    } else {
      const ok = scholarship.education_levels.includes(input.level);
      criteria.push({
        key: "level",
        label: "Study level",
        requirement,
        status: ok ? "pass" : "fail",
        detail: ok
          ? `${EDUCATION_LEVEL_LABELS[input.level]} is eligible.`
          : `Only ${requirement} applicants are eligible.`,
      });
    }
  }

  /* ---- Discipline ---- */
  if (isOpenList(scholarship.target_disciplines, OPEN_DISCIPLINE_SENTINELS)) {
    criteria.push({
      key: "discipline",
      label: "Field of study",
      requirement: "Any discipline",
      status: "open",
      detail: "Open to all fields of study.",
    });
  } else {
    const requirement = scholarship.target_disciplines.join(", ");
    if (!input.discipline) {
      criteria.push({
        key: "discipline",
        label: "Field of study",
        requirement,
        status: "unknown",
        detail: "Tell us your field to check.",
      });
    } else {
      const ok = listIncludes(scholarship.target_disciplines, input.discipline);
      criteria.push({
        key: "discipline",
        label: "Field of study",
        requirement,
        status: ok ? "pass" : "fail",
        detail: ok
          ? `${input.discipline} is an eligible field.`
          : `Restricted to: ${requirement}.`,
      });
    }
  }

  /* ---- Country / destination ---- */
  if (isOpenList(scholarship.target_countries, OPEN_COUNTRY_SENTINELS)) {
    criteria.push({
      key: "country",
      label: "Destination",
      requirement: "Any country",
      status: "open",
      detail: "No destination restriction.",
    });
  } else {
    const requirement = scholarship.target_countries.join(", ");
    if (!input.country) {
      criteria.push({
        key: "country",
        label: "Destination",
        requirement,
        status: "unknown",
        detail: "Pick a destination to check.",
      });
    } else {
      const ok = listIncludes(scholarship.target_countries, input.country);
      criteria.push({
        key: "country",
        label: "Destination",
        requirement,
        status: ok ? "pass" : "fail",
        detail: ok
          ? `${input.country} is covered.`
          : `Only available for: ${requirement}.`,
      });
    }
  }

  /* ---- Verdict ---- */
  const evaluated = criteria.filter(
    (c) => c.status === "pass" || c.status === "fail",
  ).length;
  const passed = criteria.filter((c) => c.status === "pass").length;
  const hasFail = criteria.some((c) => c.status === "fail");
  const hasUnknown = criteria.some((c) => c.status === "unknown");

  const verdict: EligibilityVerdict = hasFail
    ? "not_eligible"
    : hasUnknown
      ? "needs_info"
      : "eligible";

  return {
    verdict,
    score: evaluated === 0 ? 1 : passed / evaluated,
    passed,
    evaluated,
    criteria,
  };
}
