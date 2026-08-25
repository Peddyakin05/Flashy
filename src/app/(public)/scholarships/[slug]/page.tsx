import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Award, ArrowLeft, BookOpen, GraduationCap, MapPin, TrendingUp } from "lucide-react";

import { Markdown } from "@/components/Markdown";
import { NewsletterCapture } from "@/components/common/NewsletterCapture";
import { ShareButtons } from "@/components/common/ShareButtons";
import { ActionBar } from "@/components/scholarship/ActionBar";
import { DeadlineBadge } from "@/components/scholarship/DeadlineBadge";
import { ProviderAvatar } from "@/components/scholarship/ProviderAvatar";
import { Badge } from "@/components/ui/badge";
import { EDUCATION_LEVEL_LABELS } from "@/lib/constants";
import {
  getScholarshipBySlug,
  incrementScholarshipViews,
} from "@/lib/scholarships";
import type { Scholarship } from "@/types";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const loadScholarship = cache(getScholarshipBySlug);

function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

function plainText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function metadataDescription(scholarship: Scholarship): string {
  const funding = scholarship.fully_funded ? "Fully funded" : "Partial funding";
  return `${funding} scholarship from ${scholarship.provider_name}. ${scholarship.award_value}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const scholarship = await loadScholarship(slug);
  if (!scholarship) return { title: "Scholarship not found" };

  const url = absoluteUrl(`/scholarships/${scholarship.slug}`);
  const description = metadataDescription(scholarship);
  const images = scholarship.provider_logo_url
    ? [{ url: scholarship.provider_logo_url, alt: scholarship.provider_name }]
    : undefined;

  return {
    title: scholarship.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: scholarship.title,
      description,
      url,
      siteName: "Flashy",
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: scholarship.title,
      description,
      images: scholarship.provider_logo_url
        ? [scholarship.provider_logo_url]
        : undefined,
    },
  };
}

export default async function ScholarshipPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scholarship = await loadScholarship(slug);
  if (!scholarship) notFound();

  void incrementScholarshipViews(slug);

  const {
    title,
    provider_name,
    provider_logo_url,
    education_levels,
    min_cgpa,
    fully_funded,
    target_countries,
    deadline,
    award_value,
    official_apply_url,
    content_markdown,
    target_disciplines,
  } = scholarship;

  const levelText =
    education_levels.length > 0
      ? education_levels.map((level) => EDUCATION_LEVEL_LABELS[level] ?? level).join(" / ")
      : "All levels";
  const pageUrl = absoluteUrl(`/scholarships/${scholarship.slug}`);
  const description = metadataDescription(scholarship);
  const disciplineText =
    target_disciplines.length > 0 ? target_disciplines.join(" / ") : "All disciplines";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: title,
    description: plainText(content_markdown) || description,
    provider: {
      "@type": "Organization",
      name: provider_name,
      ...(provider_logo_url ? { logo: provider_logo_url } : {}),
    },
    startDate: scholarship.created_at,
    ...(deadline ? { validThrough: deadline } : {}),
    url: pageUrl,
    educationalCredentialAwarded: levelText,
  };

  return (
    <div className="mx-auto max-w-6xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <article className="min-w-0 lg:col-span-2">
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              All scholarships
            </Link>
          </nav>

          <header className="flex flex-col gap-4 border-b pb-6">
            <div className="flex items-start gap-3">
              <ProviderAvatar name={provider_name} logoUrl={provider_logo_url} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {provider_name}
                </p>
                <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                  {title}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {fully_funded ? (
                <Badge variant="success">
                  <Award className="size-3.5" aria-hidden />
                  Fully funded
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Award className="size-3.5" aria-hidden />
                  Partial funding
                </Badge>
              )}
              <Badge variant="secondary" className="max-w-full">
                <Award className="size-3.5" aria-hidden />
                <span className="min-w-0 truncate">{award_value}</span>
              </Badge>
              {min_cgpa !== null ? (
                <Badge variant="outline">
                  <TrendingUp className="size-3.5" aria-hidden />
                  CGPA {min_cgpa.toFixed(2)}+
                </Badge>
              ) : (
                <Badge variant="outline">
                  <TrendingUp className="size-3.5" aria-hidden />
                  No CGPA minimum
                </Badge>
              )}
              <Badge variant="secondary">
                <GraduationCap className="size-3.5" aria-hidden />
                {levelText}
              </Badge>
              <Badge variant="outline" className="max-w-full">
                <BookOpen className="size-3.5" aria-hidden />
                <span className="min-w-0 truncate">{disciplineText}</span>
              </Badge>
              {target_countries.map((country) => (
                <Badge key={country} variant="outline">
                  <MapPin className="size-3.5" aria-hidden />
                  {country}
                </Badge>
              ))}
              <DeadlineBadge deadline={deadline} />
            </div>
          </header>

          <div className="mt-6">
            <ShareButtons title={title} url={pageUrl} />
          </div>

          <Markdown
            content={content_markdown}
            className="mt-6 text-[0.95rem]"
          />
        </article>

        <aside className="flex flex-col gap-4 lg:col-span-1">
          <ActionBar
            id={scholarship.id}
            title={title}
            applyUrl={official_apply_url}
          />
          <NewsletterCapture
            title="Get similar alerts"
            description="Track scholarships matching this field."
            targetDisciplines={scholarship.target_disciplines}
          />
        </aside>
      </div>
    </div>
  );
}
