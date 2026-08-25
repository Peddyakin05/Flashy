import type { EducationLevel } from "@/types";

/**
 * Human-readable labels + curated option lists that power the filter bar and
 * the eligibility form. Disciplines/countries are open sets in the DB, but we
 * surface a curated shortlist relevant to Nigerian + international applicants.
 */

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  undergraduate: "Undergraduate",
  masters: "Master's",
  phd: "PhD",
  postdoc: "Postdoctoral",
};

export const EDUCATION_LEVEL_OPTIONS = (
  Object.keys(EDUCATION_LEVEL_LABELS) as EducationLevel[]
).map((value) => ({ value, label: EDUCATION_LEVEL_LABELS[value] }));

export const DISCIPLINE_OPTIONS = [
  "Any Discipline",
  "Engineering",
  "Computer Science",
  "Medicine & Health",
  "Natural Sciences",
  "Business & Economics",
  "Law",
  "Social Sciences",
  "Arts & Humanities",
  "Agriculture",
  "Education",
] as const;

export const COUNTRY_OPTIONS = [
  "Nigeria",
  "United Kingdom",
  "United States",
  "Canada",
  "Germany",
  "China",
  "Australia",
  "Any Country",
] as const;

export const FUNDING_OPTIONS = [
  { value: "all", label: "All funding" },
  { value: "fully_funded", label: "Fully funded" },
  { value: "partial", label: "Partial" },
] as const;

/** Sentinel values that mean "no restriction" in the DB arrays. */
export const OPEN_DISCIPLINE_SENTINELS = ["Any Discipline", "All Disciplines"];
export const OPEN_COUNTRY_SENTINELS = ["Any Country", "International"];
