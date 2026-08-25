import Link from "next/link";
import { Award, GraduationCap, MapPin, TrendingUp } from "lucide-react";

import { BookmarkButton } from "@/components/cards/BookmarkButton";
import { DeadlineBadge } from "@/components/scholarship/DeadlineBadge";
import { ProviderAvatar } from "@/components/scholarship/ProviderAvatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EDUCATION_LEVEL_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Scholarship } from "@/types";

/**
 * Modern, card-based summary of one opportunity.
 *
 * Layout notes for Core Web Vitals:
 * - The whole card is clickable via a single "stretched" anchor (accessible:
 *   one link per card), while the bookmark button sits above it (z-10) with
 *   its own action.
 * - Fixed avatar size + line-clamped text = no layout shift as content varies.
 * - No client JS except the small bookmark island.
 */
export function ScholarshipCard({
  scholarship,
  className,
}: {
  scholarship: Scholarship;
  className?: string;
}) {
  const {
    id,
    slug,
    title,
    provider_name,
    provider_logo_url,
    education_levels,
    min_cgpa,
    fully_funded,
    target_countries,
    deadline,
    award_value,
  } = scholarship;

  const levelText =
    education_levels.length > 0
      ? education_levels.map((l) => EDUCATION_LEVEL_LABELS[l] ?? l).join(" · ")
      : "All levels";
  const primaryCountry = target_countries[0];

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      {/* Provider + title + bookmark */}
      <div className="flex items-start gap-3">
        <ProviderAvatar name={provider_name} logoUrl={provider_logo_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {provider_name}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-[0.95rem] font-semibold leading-snug text-foreground">
            <Link
              href={`/scholarships/${slug}`}
              className="rounded outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
            >
              {title}
            </Link>
          </h3>
        </div>
        <BookmarkButton id={id} title={title} className="-mr-1 -mt-1" />
      </div>

      {/* Quick eligibility banner — distinct, scannable tags */}
      <div className="flex flex-wrap gap-1.5">
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

        <Badge variant="secondary">
          <GraduationCap className="size-3.5" aria-hidden />
          {levelText}
        </Badge>

        {min_cgpa !== null && (
          <Badge variant="outline">
            <TrendingUp className="size-3.5" aria-hidden />
            CGPA {min_cgpa.toFixed(2)}+
          </Badge>
        )}

        {primaryCountry && (
          <Badge variant="outline">
            <MapPin className="size-3.5" aria-hidden />
            {primaryCountry}
          </Badge>
        )}
      </div>

      {/* Footer: award value + deadline countdown */}
      <div className="mt-auto flex items-end justify-between gap-3 pt-1">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {award_value}
        </p>
        <DeadlineBadge deadline={deadline} className="shrink-0" />
      </div>
    </Card>
  );
}
