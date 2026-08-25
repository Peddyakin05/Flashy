import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Flashy privacy policy covering cookies, analytics, Google advertising, and third-party partners.",
};

const updatedAt = "August 25, 2026";

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase text-primary">
          Privacy Policy
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">Last updated: {updatedAt}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Information we collect
        </h2>
        <p className="leading-7 text-muted-foreground">
          Flashy may collect information you submit directly, including your
          email address, preferred alert channel, and selected academic
          interests. We may also collect limited technical information such as
          browser type, referring pages, device information, pages visited, and
          approximate usage activity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Cookies and similar technologies
        </h2>
        <p className="leading-7 text-muted-foreground">
          We may use cookies, local storage, and similar technologies to
          remember preferences, measure site performance, improve scholarship
          discovery, and support advertising. You can disable cookies through
          your browser settings, but some features may not work as expected.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Google advertising and DART cookies
        </h2>
        <p className="leading-7 text-muted-foreground">
          Third-party vendors, including Google, may use cookies to serve ads
          based on your prior visits to this website or other websites. Google
          may use advertising cookies, including the DoubleClick DART cookie, to
          show relevant ads. You can opt out of personalized advertising through
          Google Ads Settings or review broader choices through industry opt-out
          tools where available.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Analytics and third-party partners
        </h2>
        <p className="leading-7 text-muted-foreground">
          We may use analytics and advertising partners to understand aggregate
          traffic patterns, diagnose technical issues, measure campaign
          performance, and display ads. These partners may process identifiers,
          cookies, IP-derived location, device data, and usage events under
          their own privacy policies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          GDPR and your choices
        </h2>
        <p className="leading-7 text-muted-foreground">
          Where applicable, you may request access, correction, deletion, or
          restriction of your personal data. You may also object to certain
          processing or withdraw consent for optional communications. To make a
          request, contact us at support@flashy.scholar.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Data retention and security
        </h2>
        <p className="leading-7 text-muted-foreground">
          We retain subscriber information for as long as needed to provide
          alerts or comply with legal obligations. We use reasonable technical
          and organizational safeguards, but no internet service can guarantee
          absolute security.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
        <p className="leading-7 text-muted-foreground">
          Questions about this policy can be sent to support@flashy.scholar.
        </p>
      </section>
    </article>
  );
}
