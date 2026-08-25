import Image from "next/image";

import { cn } from "@/lib/utils";

// Light, calm tones. Kept intentionally subtle so the initials read as a brand
// mark rather than a loud sticker, in both light and dark themes.
const AVATAR_TONES = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
];

function initials(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/);
  const value = `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
  return value || "?";
}

/** Deterministic tone so a given provider always gets the same colour. */
function toneFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export function ProviderAvatar({
  name,
  logoUrl,
  size = 44,
  className,
}: {
  name: string;
  logoUrl: string | null;
  size?: number;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className={cn(
          "shrink-0 rounded-lg bg-white object-contain ring-1 ring-border",
          className,
        )}
      />
    );
  }

  return (
    <div
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg text-sm font-bold ring-1 ring-black/5",
        toneFor(name),
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
