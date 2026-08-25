import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, GraduationCap, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how Flashy curates verified scholarships and academic opportunities for students.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase text-primary">About Flashy</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Verified scholarship discovery for students with less noise.
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          Flashy helps students find scholarships, grants, fellowships, and
          academic opportunities from official providers. We focus on clear
          eligibility signals, direct application links, deadline visibility,
          and concise guidance so applicants can decide faster.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg">
          <CardHeader>
            <Search className="size-5 text-primary" aria-hidden />
            <CardTitle className="text-base">Curated sources</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm leading-6 text-muted-foreground">
            Opportunities are gathered from official portals, institutional
            pages, foundations, and trusted scholarship announcements.
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CheckCircle2 className="size-5 text-primary" aria-hidden />
            <CardTitle className="text-base">Verification first</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm leading-6 text-muted-foreground">
            Listings are structured around provider names, eligibility,
            funding value, country fit, and official application URLs.
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <GraduationCap className="size-5 text-primary" aria-hidden />
            <CardTitle className="text-base">Student centered</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm leading-6 text-muted-foreground">
            Filters, deadline chips, and alert capture are designed for
            repeated scholarship search workflows.
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3 border-t pt-8">
        <h2 className="text-xl font-semibold tracking-tight">How we work</h2>
        <p className="leading-7 text-muted-foreground">
          Flashy is an aggregator, not a scholarship provider. We summarize
          public opportunity information and point students to the official
          application portal. Applicants should always confirm final deadlines,
          award terms, and eligibility requirements on the provider website
          before applying.
        </p>
        <Link href="/contact" className={cn(buttonVariants(), "mt-2")}>
          Contact support
        </Link>
      </section>
    </div>
  );
}
