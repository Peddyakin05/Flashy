"use client";

import { BadgeCheck, ExternalLink } from "lucide-react";

import { BookmarkButton } from "@/components/cards/BookmarkButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActionBar({
  id,
  title,
  applyUrl,
}: {
  id: string;
  title: string;
  applyUrl: string;
}) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card p-4 shadow-sm lg:sticky lg:top-24 lg:block">
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
        >
          Apply now
          <ExternalLink className="size-4" aria-hidden />
        </a>

        <div className="mt-3 flex h-10 items-center justify-center rounded-md border">
          <BookmarkButton id={id} title={title} />
        </div>

        <p className="mt-3 flex min-h-4 items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <BadgeCheck className="size-3.5 text-success" aria-hidden />
          Verified official application link
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg" }), "h-11 flex-1")}
        >
          Apply now
          <ExternalLink className="size-4" aria-hidden />
        </a>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md border">
          <BookmarkButton id={id} title={title} />
        </div>
      </div>
    </>
  );
}
