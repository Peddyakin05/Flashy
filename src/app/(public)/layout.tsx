import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { NewsletterCapture } from "@/components/common/NewsletterCapture";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" aria-hidden />
            </span>
            <span className="text-lg font-bold tracking-tight">Flashy</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Scholarships
            </Link>
            <Link
              href="/about"
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              About
            </Link>
          </nav>
        </div>
      </header>

      <main className="container flex-1 py-8 pb-28 lg:pb-8">{children}</main>

      <footer className="border-t">
        <div className="container grid gap-6 py-6 md:grid-cols-[minmax(0,1fr)_360px] md:items-start">
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p>&copy; {"2026"} Flashy. Opportunities for every ambition.</p>
              <p className="text-xs">
                Always verify details on the official provider page.
              </p>
            </div>
            <nav
              aria-label="Footer"
              className="flex flex-wrap gap-x-4 gap-y-2 text-sm"
            >
              <Link className="hover:text-foreground" href="/about">
                About
              </Link>
              <Link className="hover:text-foreground" href="/privacy-policy">
                Privacy Policy
              </Link>
              <Link className="hover:text-foreground" href="/terms">
                Terms
              </Link>
              <Link className="hover:text-foreground" href="/contact">
                Contact
              </Link>
            </nav>
          </div>
          <NewsletterCapture
            title="Never miss a deadline"
            description="Get scholarship alerts as new opportunities go live."
            className="w-full"
          />
        </div>
      </footer>
    </div>
  );
}
