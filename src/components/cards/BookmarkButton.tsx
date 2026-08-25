"use client";

import * as React from "react";
import { Bookmark } from "lucide-react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "flashy:bookmarks";

function readBookmarks(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/**
 * Bookmark toggle — a small client island so the surrounding card stays a
 * server component. Persists to localStorage (per-device, no account needed
 * for Phase 1). Renders "unsaved" on first paint to match SSR, then reconciles
 * after mount, so there's never a hydration mismatch.
 */
export function BookmarkButton({
  id,
  title,
  className,
}: {
  id: string;
  title: string;
  className?: string;
}) {
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setSaved(readBookmarks().has(id));
  }, [id]);

  function toggle(event: React.MouseEvent) {
    // Sit above the card's stretched link and keep the click local.
    event.preventDefault();
    event.stopPropagation();

    const next = readBookmarks();
    if (next.has(id)) next.delete(id);
    else next.add(id);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      /* storage unavailable (private mode) — ignore */
    }
    setSaved(next.has(id));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      className={cn(
        "relative z-10 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Bookmark
        className={cn(
          "size-[18px] transition-all",
          saved && "fill-primary text-primary",
        )}
        aria-hidden
      />
    </button>
  );
}
