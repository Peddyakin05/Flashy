import { Sparkles } from "lucide-react";

import { ScholarshipExplorer } from "@/components/filters/ScholarshipExplorer";
import { parseFilterParams } from "@/lib/filtering";
import { getPublishedScholarships } from "@/lib/scholarships";

// Filters live in the URL and content changes as scholarships are published,
// so render on demand rather than statically.
export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initialFilters = parseFilterParams(sp);
  const scholarships = await getPublishedScholarships();

  const fundedCount = scholarships.filter((s) => s.fully_funded).length;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          <Sparkles className="size-3.5" aria-hidden />
          {fundedCount} fully-funded opportunities live
        </span>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
          Find the scholarship that fits{" "}
          <span className="text-primary">your</span> ambition.
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Verified academic opportunities for Nigerian and international
          students — with a direct apply link, a clear deadline countdown, and
          an instant, private eligibility check on every listing.
        </p>
      </section>

      <ScholarshipExplorer
        scholarships={scholarships}
        initialFilters={initialFilters}
      />
    </div>
  );
}
