import Link from "next/link";
import { Compass } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="container flex min-h-dvh flex-col items-center justify-center gap-5 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Compass className="size-7" aria-hidden />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">
          This opportunity isn&rsquo;t here
        </h1>
        <p className="max-w-md text-muted-foreground">
          The scholarship you&rsquo;re looking for may have expired or moved.
          Browse the latest verified opportunities instead.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
        Browse scholarships
      </Link>
    </div>
  );
}
