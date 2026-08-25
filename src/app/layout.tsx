import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Flashy — Scholarships & academic opportunities",
    template: "%s · Flashy",
  },
  description:
    "Discover verified, fully-funded scholarships and academic opportunities for Nigerian and international students. Check your eligibility in seconds.",
  keywords: [
    "scholarships",
    "fully funded",
    "Nigeria scholarships",
    "study abroad",
    "academic opportunities",
    "postgraduate funding",
  ],
  openGraph: {
    type: "website",
    title: "Flashy — Scholarships & academic opportunities",
    description:
      "Verified, fully-funded scholarships with instant eligibility checks.",
    siteName: "Flashy",
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-dvh bg-background font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
