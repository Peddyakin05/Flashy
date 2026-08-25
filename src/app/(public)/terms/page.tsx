import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms covering Flashy scholarship listings, external application links, and data accuracy disclaimers.",
};

const updatedAt = "August 25, 2026";

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase text-primary">
          Terms of Service
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">Last updated: {updatedAt}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Use of Flashy
        </h2>
        <p className="leading-7 text-muted-foreground">
          Flashy provides scholarship discovery, filtering, and alert tools for
          informational purposes. By using the platform, you agree to use it
          lawfully and to verify opportunity requirements before submitting any
          application.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Aggregated opportunity information
        </h2>
        <p className="leading-7 text-muted-foreground">
          Scholarship details may be summarized from public sources and official
          provider pages. We aim to keep listings accurate, but deadlines,
          funding values, eligibility rules, portals, and provider requirements
          can change without notice. The official provider page is the final
          authority for any application.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          No guarantee of awards
        </h2>
        <p className="leading-7 text-muted-foreground">
          Flashy does not guarantee scholarship availability, eligibility,
          selection, admission, visa approval, funding disbursement, or any
          academic outcome. Application decisions are made by the relevant
          providers or institutions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          External links
        </h2>
        <p className="leading-7 text-muted-foreground">
          Listings may link to third-party websites. We are not responsible for
          third-party content, security practices, application forms, fees, or
          privacy practices. Review external sites carefully before submitting
          personal information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          User submissions
        </h2>
        <p className="leading-7 text-muted-foreground">
          If you submit a scholarship tip, correction, or inquiry, you are
          responsible for ensuring the information is lawful, accurate, and not
          misleading. We may review, edit, decline, or remove submitted content.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Changes to these terms
        </h2>
        <p className="leading-7 text-muted-foreground">
          We may update these terms as the product evolves. Continued use of
          Flashy after changes means you accept the updated terms.
        </p>
      </section>
    </article>
  );
}
