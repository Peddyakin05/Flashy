import type { Scholarship } from "@/types";

/**
 * Bundled sample opportunities. This is the SINGLE source of truth for both:
 *   1. the seed script (scripts/seed.ts imports it via a relative path), and
 *   2. the app's graceful fallback when Supabase isn't configured yet.
 *
 * It imports only *types* (erased at build time), so the seed script can load
 * it under tsx without any path-alias resolution.
 *
 * Data reflects real, well-known opportunities for Nigerian + international
 * applicants. Deadlines are illustrative. Provider logos are left null so the
 * UI renders its crisp initials avatar (no broken images, zero layout shift).
 */
export const SAMPLE_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "0f8b1c2d-1111-4a1a-9b01-000000000001",
    title: "Chevening Scholarship 2027/28",
    slug: "chevening-scholarship-2027-28",
    provider_name: "UK Government (FCDO)",
    provider_logo_url: null,
    min_cgpa: null,
    education_levels: ["masters"],
    target_disciplines: ["Any Discipline"],
    target_countries: ["United Kingdom"],
    fully_funded: true,
    award_value: "Fully funded: tuition, monthly stipend, flights & visa",
    deadline: "2026-11-03T23:59:00.000Z",
    official_apply_url: "https://www.chevening.org/scholarships/",
    content_markdown: `## Overview
Chevening is the UK government's flagship international scholarship programme,
funding one-year master's degrees at any UK university. It targets emerging
leaders with a track record of achievement and the ambition to drive change.

## What it covers
- Full tuition fees
- A monthly living stipend
- Return economy airfare to the UK
- Arrival and departure allowances, visa costs

## Eligibility (summary)
- Be a citizen of a Chevening-eligible country (Nigeria included)
- Hold an undergraduate degree good enough for a UK master's
- Have at least **2 years** of work experience
- Return to your home country for a minimum of two years after the award

> Chevening does not set a fixed CGPA cut-off — selection is holistic and
> leadership-focused.`,
    status: "published",
    views_count: 4120,
    created_at: "2026-08-01T09:00:00.000Z",
    updated_at: "2026-08-01T09:00:00.000Z",
  },
  {
    id: "0f8b1c2d-2222-4a2a-9b02-000000000002",
    title: "PTDF Overseas Scholarship Scheme (OSS)",
    slug: "ptdf-overseas-scholarship-scheme-oss",
    provider_name: "Petroleum Technology Development Fund",
    provider_logo_url: null,
    min_cgpa: 3.5,
    education_levels: ["masters", "phd"],
    target_disciplines: ["Engineering", "Natural Sciences"],
    target_countries: ["United Kingdom"],
    fully_funded: true,
    award_value: "Fully funded: tuition, stipend, flights & health cover",
    deadline: "2026-08-29T23:59:00.000Z",
    official_apply_url: "https://scholarship.ptdf.gov.ng/",
    content_markdown: `## Overview
The PTDF Overseas Scholarship Scheme sponsors Nigerian graduates for master's
and doctoral study in oil & gas and allied fields at partner universities
abroad, supporting capacity building for the nation's petroleum sector.

## What it covers
- Full tuition
- Monthly living allowance
- Return airfare and health insurance

## Eligibility (summary)
- Nigerian citizen with a strong first degree (minimum **Second Class Upper**)
- Fields aligned to the oil & gas value chain (engineering, geosciences, etc.)
- Meet the university's admission requirements`,
    status: "published",
    views_count: 8890,
    created_at: "2026-08-02T09:00:00.000Z",
    updated_at: "2026-08-10T09:00:00.000Z",
  },
  {
    id: "0f8b1c2d-3333-4a3a-9b03-000000000003",
    title: "DAAD EPOS Development-Related Postgraduate Courses",
    slug: "daad-epos-development-related-postgraduate",
    provider_name: "DAAD (German Academic Exchange Service)",
    provider_logo_url: null,
    min_cgpa: 3.0,
    education_levels: ["masters", "phd"],
    target_disciplines: [
      "Engineering",
      "Natural Sciences",
      "Agriculture",
      "Social Sciences",
    ],
    target_countries: ["Germany"],
    fully_funded: true,
    award_value: "Fully funded: ~€992/month stipend, tuition, travel & insurance",
    deadline: "2026-09-18T23:59:00.000Z",
    official_apply_url: "https://www.daad.de/en/",
    content_markdown: `## Overview
Through EPOS, DAAD funds professionals from developing countries to pursue
development-related postgraduate courses at German universities, strengthening
skills that contribute to sustainable development at home.

## What it covers
- Monthly stipend (approx. €992 for master's candidates)
- Tuition where applicable
- Travel allowance and health/accident insurance

## Eligibility (summary)
- Bachelor's degree (typically above average) in a relevant field
- At least **two years** of relevant professional experience
- Applicants from eligible developing countries, Nigeria included`,
    status: "published",
    views_count: 3010,
    created_at: "2026-08-03T09:00:00.000Z",
    updated_at: "2026-08-03T09:00:00.000Z",
  },
  {
    id: "0f8b1c2d-4444-4a4a-9b04-000000000004",
    title: "Mastercard Foundation Scholars Program",
    slug: "mastercard-foundation-scholars-program-toronto",
    provider_name: "University of Toronto",
    provider_logo_url: null,
    min_cgpa: null,
    education_levels: ["undergraduate"],
    target_disciplines: ["Any Discipline"],
    target_countries: ["Canada"],
    fully_funded: true,
    award_value: "Fully funded: tuition, residence, books, living costs & travel",
    deadline: "2026-12-01T23:59:00.000Z",
    official_apply_url:
      "https://future.utoronto.ca/finances/awards/mastercard-foundation-scholars-program/",
    content_markdown: `## Overview
The Mastercard Foundation Scholars Program supports academically talented yet
economically disadvantaged young people from Africa to access quality
university education, with comprehensive financial and holistic support.

## What it covers
- Full tuition and compulsory fees
- Residence, meal plan, books and supplies
- Living expenses and travel

## Eligibility (summary)
- Citizen of an African country, ordinarily resident in Africa
- Demonstrated financial need
- Strong academic promise and leadership potential`,
    status: "published",
    views_count: 15230,
    created_at: "2026-08-04T09:00:00.000Z",
    updated_at: "2026-08-12T09:00:00.000Z",
  },
  {
    id: "0f8b1c2d-5555-4a5a-9b05-000000000005",
    title: "Agbami Medical & Engineering Professionals Scholarship",
    slug: "agbami-medical-engineering-professionals-scholarship",
    provider_name: "Agbami Partners (Chevron, NNPC & others)",
    provider_logo_url: null,
    min_cgpa: null,
    education_levels: ["undergraduate"],
    target_disciplines: ["Engineering", "Medicine & Health", "Natural Sciences"],
    target_countries: ["Nigeria"],
    fully_funded: false,
    award_value: "₦100,000 per academic session",
    deadline: null,
    official_apply_url: "https://agbamischolarships.com/",
    content_markdown: `## Overview
The Agbami Scholarship supports Nigerian undergraduates studying medical and
engineering disciplines at accredited Nigerian universities, easing the cost of
study for high-performing students.

## What it covers
- ₦100,000 grant per academic session (renewable on merit)

## Eligibility (summary)
- Full-time undergraduate in an eligible medical or engineering programme
- Enrolled at a Nigerian university (typically 100–300 level at time of award)
- Not currently benefiting from another corporate scholarship

> Applications typically open on a rolling/annual cycle — check the portal for
> the current window.`,
    status: "published",
    views_count: 20450,
    created_at: "2026-08-05T09:00:00.000Z",
    updated_at: "2026-08-05T09:00:00.000Z",
  },
];

export function getSampleBySlug(slug: string): Scholarship | undefined {
  return SAMPLE_SCHOLARSHIPS.find((s) => s.slug === slug);
}
