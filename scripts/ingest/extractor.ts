import { scholarshipInsertSchema, type EducationLevel, type ScholarshipInsert } from "../../src/types/index";

type SourceKind = "text" | "url";

export type ExtractOpportunityInput =
  | string
  | {
      source: string;
      kind?: SourceKind;
      officialApplyUrl?: string;
    };

const EDUCATION_LEVEL_MATCHERS: Array<[EducationLevel, RegExp]> = [
  ["undergraduate", /\b(undergraduate|bachelor'?s?|b\.?sc|beng|first degree)\b/i],
  ["masters", /\b(master'?s?|msc|m\.?sc|mba|postgraduate)\b/i],
  ["phd", /\b(ph\.?d|doctorate|doctoral)\b/i],
  ["postdoc", /\b(postdoc|post-doctoral|postdoctoral)\b/i],
];

const DISCIPLINE_KEYWORDS = [
  "Agriculture",
  "Any Discipline",
  "Business",
  "Computer Science",
  "Data Science",
  "Education",
  "Engineering",
  "Law",
  "Medicine & Health",
  "Natural Sciences",
  "Social Sciences",
];

const COUNTRY_KEYWORDS = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
  "Germany",
  "France",
  "Australia",
  "Global",
];

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const NEXT_LABEL_LOOKAHEAD =
  String.raw`(?=\s+(?:provider|sponsor|organization|organisation|minimum\s+cgpa|min\.?\s+cgpa|cgpa|award value|value|worth|benefits?|funding|amount|deadline|closes?|closing date|apply by|apply|application link|portal|website|link|source)\s*:|\s+(?:undergraduate|masters?|phd|postdoc)\b|\s*$)`;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(h[1-6]|p|li|div|section|article|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (!slug) {
    throw new Error("Unable to build a slug from the parsed title.");
  }

  return slug;
}

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return normalizeWhitespace(match[1]);
  }

  return null;
}

function parseTitle(text: string, sourceUrl: string | null): string {
  const labelled = firstMatch(text, [
    new RegExp(String.raw`\b(?:title|scholarship|opportunity)\s*:\s*(.{3,160}?)${NEXT_LABEL_LOOKAHEAD}`, "i"),
    /\bapplications?\s+(?:are\s+)?(?:open\s+)?for\s+(?:the\s+)?([^\n.]{3,160})/i,
  ]);

  if (labelled) return labelled;

  const line = text
    .split(/\r?\n/)
    .map(normalizeWhitespace)
    .find((candidate) => candidate.length >= 3 && candidate.length <= 160);

  if (line) return line;

  if (sourceUrl) {
    const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
    return `${host} Opportunity`;
  }

  throw new Error("Unable to parse a scholarship title.");
}

function parseProviderName(text: string, sourceUrl: string | null): string {
  const labelled = firstMatch(text, [
    new RegExp(String.raw`\b(?:provider|sponsor|organization|organisation|offered by|funded by)\s*:\s*(.{2,120}?)${NEXT_LABEL_LOOKAHEAD}`, "i"),
    /\b(?:by|from)\s+([A-Z][A-Za-z0-9&.,'() -]{2,100})\s+(?:scholarship|foundation|program|programme)/,
  ]);

  if (labelled) return labelled;
  if (sourceUrl) return new URL(sourceUrl).hostname.replace(/^www\./, "");

  return "Unknown Provider";
}

function parseLogoUrl(text: string): string | null {
  const logo = firstMatch(text, [
    /\b(?:logo|provider_logo_url)\s*:\s*(https?:\/\/\S+)/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  ]);

  return logo && isUrl(logo) ? logo : null;
}

function parseMinCgpa(text: string): number | null {
  const match = text.match(/\b(?:minimum|min\.?|at least|required)?\s*cgpa(?:\s+of)?\s*(?:is|:|-)?\s*([0-5](?:\.\d{1,2})?)\b/i);
  if (!match?.[1]) return null;

  const value = Number(match[1]);
  return Number.isFinite(value) && value >= 0 && value <= 5 ? value : null;
}

function parseEducationLevels(text: string): EducationLevel[] {
  const levels = EDUCATION_LEVEL_MATCHERS.filter(([, pattern]) => pattern.test(text)).map(
    ([level]) => level,
  );

  return [...new Set(levels)];
}

function parseKeywordList(text: string, keywords: string[]): string[] {
  const found = keywords.filter((keyword) => {
    if (keyword === "Any Discipline") {
      return /\b(any|all)\s+(discipline|field|course|programme|program)s?\b/i.test(text);
    }

    return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
      text,
    );
  });

  return [...new Set(found)];
}

function parseFundingStatus(text: string): boolean {
  if (/\b(partial(?:ly)? funded|tuition discount|grant only)\b/i.test(text)) return false;
  return /\b(fully funded|full(?:y)? scholarship|full funding|covers tuition(?:,|\sand)\s*(?:stipend|living|travel|accommodation))\b/i.test(
    text,
  );
}

function parseAwardValue(text: string, fullyFunded: boolean): string {
  const labelled = firstMatch(text, [
    new RegExp(String.raw`\b(?:award value|value|worth|benefits?|funding|amount)\s*:\s*(.{2,180}?)${NEXT_LABEL_LOOKAHEAD}`, "i"),
    /((?:NGN|N|₦|USD|US\$|\$|EUR|€|GBP|£)\s?[0-9][0-9,]*(?:\.\d+)?(?:\s*(?:per|\/)\s*(?:year|annum|session|month))?)/i,
  ]);

  if (labelled) return labelled.replace(/^N(?=\s?\d)/, "₦");
  return fullyFunded ? "Fully funded" : "See official opportunity page";
}

function parseDeadline(text: string): string | null {
  const isoMatch = text.match(/\b(20\d{2}-\d{2}-\d{2})(?:[T\s]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?)?\b/);
  if (isoMatch?.[1]) return new Date(`${isoMatch[1]}T23:59:00.000Z`).toISOString();

  const natural = text.match(
    /\b(?:deadline|closes?|closing date|apply by)[:\s-]*(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+),?\s+(20\d{2})\b/i,
  );

  if (!natural?.[1] || !natural[2] || !natural[3]) return null;

  const month = MONTHS[natural[2].toLowerCase()];
  if (month === undefined) return null;

  return new Date(Date.UTC(Number(natural[3]), month, Number(natural[1]), 23, 59)).toISOString();
}

function parseOfficialApplyUrl(text: string, sourceUrl: string | null): string {
  const labelled = firstMatch(text, [
    /(?:apply\s*(?:url|link)?|application\s*link|portal|website|link|source)\s*[:=-]?\s*(https?:\/\/[^\s]+)/i,
  ]);

  const cleaned = labelled?.replace(/[),.;\]]+$/g, "");
  if (cleaned && isUrl(cleaned)) return cleaned;

  const fallback = text.match(/\bhttps?:\/\/[^\s<>"']+/i)?.[0]?.replace(/[),.;\]]+$/g, "");
  if (fallback && isUrl(fallback)) return fallback;

  if (sourceUrl) return sourceUrl;

  throw new Error("Unable to parse official_apply_url. Provide a source URL or an application link in the text.");
}

function buildContentMarkdown(args: {
  title: string;
  providerName: string;
  minCgpa: number | null;
  educationLevels: EducationLevel[];
  targetDisciplines: string[];
  targetCountries: string[];
  awardValue: string;
  officialApplyUrl: string;
  sourceText: string;
}): string {
  const levelText = args.educationLevels.length
    ? args.educationLevels.join(", ")
    : "All eligible education levels listed by the provider";
  const disciplineText = args.targetDisciplines.length
    ? args.targetDisciplines.join(", ")
    : "All eligible or provider-specified disciplines";
  const countryText = args.targetCountries.length
    ? args.targetCountries.join(", ")
    : "Provider-specified applicant countries";
  const cgpaText = args.minCgpa === null ? "No fixed CGPA parsed from the source." : `${args.minCgpa} minimum CGPA`;
  const summary = normalizeWhitespace(args.sourceText).slice(0, 420);

  return `## Overview
${args.title} is an academic opportunity from ${args.providerName}. ${summary}

## Eligibility
- Education level: ${levelText}
- Target disciplines: ${disciplineText}
- Target countries: ${countryText}
- CGPA requirement: ${cgpaText}

## Benefits
- Award value: ${args.awardValue}

## Step-by-Step Application Guide
1. Review the official opportunity page and confirm the current eligibility criteria.
2. Prepare academic transcripts, identification, recommendation letters, and any provider-specific documents.
3. Complete the official application form before the published deadline.
4. Submit only through the official portal: ${args.officialApplyUrl}
5. Save your confirmation email or application reference for follow-up.`;
}

async function fetchTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      "user-agent": "FlashyScholarshipIngest/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function extractOpportunity(input: ExtractOpportunityInput): Promise<ScholarshipInsert> {
  const source = typeof input === "string" ? input : input.source;
  const kind = typeof input === "string" ? (isUrl(input) ? "url" : "text") : input.kind ?? (isUrl(input.source) ? "url" : "text");
  const explicitApplyUrl = typeof input === "string" ? null : input.officialApplyUrl ?? null;
  const sourceUrl = explicitApplyUrl ?? (kind === "url" ? source : null);
  const raw = kind === "url" ? await fetchTextFromUrl(source) : source;
  const text = stripHtml(raw);

  const title = parseTitle(text, sourceUrl);
  const providerName = parseProviderName(text, sourceUrl);
  const fullyFunded = parseFundingStatus(text);
  const awardValue = parseAwardValue(text, fullyFunded);
  const minCgpa = parseMinCgpa(text);
  const educationLevels = parseEducationLevels(text);
  const targetDisciplines = parseKeywordList(text, DISCIPLINE_KEYWORDS);
  const targetCountries = parseKeywordList(text, COUNTRY_KEYWORDS);
  const officialApplyUrl = parseOfficialApplyUrl(text, sourceUrl);

  const candidate = {
    title,
    provider_name: providerName,
    provider_logo_url: parseLogoUrl(raw),
    slug: slugify(title),
    min_cgpa: minCgpa,
    education_levels: educationLevels,
    target_disciplines: targetDisciplines,
    target_countries: targetCountries,
    fully_funded: fullyFunded,
    award_value: awardValue,
    deadline: parseDeadline(text),
    official_apply_url: officialApplyUrl,
    content_markdown: buildContentMarkdown({
      title,
      providerName,
      minCgpa,
      educationLevels,
      targetDisciplines,
      targetCountries,
      awardValue,
      officialApplyUrl,
      sourceText: text,
    }),
    status: "published" as const,
  };

  return scholarshipInsertSchema.parse(candidate);
}
