"use client";

import * as React from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ShareButtons({
  title,
  url,
  className,
  sticky = false,
}: {
  title: string;
  url: string;
  className?: string;
  sticky?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const shareText = `${title} - ${url}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const copyLink = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [url]);

  return (
    <div
      className={cn(
        "flex min-h-11 w-full items-center gap-2",
        sticky && "lg:sticky lg:top-24",
        className,
      )}
    >
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-11 min-w-0 flex-1 px-3",
        )}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="size-4" aria-hidden />
        <span className="truncate">WhatsApp</span>
      </a>
      <Button
        type="button"
        variant="outline"
        className="h-11 min-w-28 shrink-0 px-3"
        onClick={copyLink}
        aria-live="polite"
      >
        {copied ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Copy className="size-4" aria-hidden />
        )}
        <span className="w-12 text-left">{copied ? "Copied" : "Copy"}</span>
      </Button>
    </div>
  );
}
