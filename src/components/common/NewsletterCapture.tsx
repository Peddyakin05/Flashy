"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Bell, ExternalLink, Mail, MessageCircle, Phone } from "lucide-react";

import {
  subscribeToAlerts,
  type SubscribeState,
} from "@/actions/subscribe";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: SubscribeState = {
  status: "idle",
  message: "",
};

const WHATSAPP_CHANNEL_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL ??
  "https://wa.me/?text=I%20want%20instant%20scholarship%20drops";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="h-11 w-full" disabled={pending}>
      <Bell className="size-4" aria-hidden />
      {pending ? "Saving" : "Get email alerts"}
    </Button>
  );
}

export function NewsletterCapture({
  className,
  title = "Scholarship alerts",
  description = "Get fresh scholarship matches by email or WhatsApp.",
  targetDisciplines = [],
}: {
  className?: string;
  title?: string;
  description?: string;
  targetDisciplines?: string[];
}) {
  const emailId = React.useId();
  const phoneId = React.useId();
  const [channel, setChannel] = React.useState<"email" | "whatsapp">("email");
  const [state, formAction] = React.useActionState(
    subscribeToAlerts,
    initialState,
  );
  const disciplineValue = targetDisciplines.join(",");

  return (
    <Card className={cn("rounded-lg", className)}>
      <CardHeader className="p-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-4 text-primary" aria-hidden />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={channel === "email" ? "default" : "outline"}
            className="h-11"
            onClick={() => setChannel("email")}
            aria-pressed={channel === "email"}
          >
            <Mail className="size-4" aria-hidden />
            Email
          </Button>
          <Button
            type="button"
            variant={channel === "whatsapp" ? "default" : "outline"}
            className="h-11"
            onClick={() => setChannel("whatsapp")}
            aria-pressed={channel === "whatsapp"}
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </Button>
        </div>

        {channel === "email" ? (
          <form action={formAction} className="mt-3 space-y-3">
            <input
              type="hidden"
              name="target_disciplines"
              value={disciplineValue}
            />

            <div className="space-y-1.5">
              <Label htmlFor={emailId}>Email address</Label>
              <Input
                id={emailId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="h-11"
              />
            </div>

            <SubmitButton />

            <p
              className={cn(
                "min-h-5 text-sm",
                state.status === "error"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
              aria-live="polite"
            >
              {state.message}
            </p>
          </form>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={phoneId}>Phone number</Label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id={phoneId}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+234 800 000 0000"
                  className="h-11 pl-9"
                />
              </div>
              <p className="min-h-5 text-xs text-muted-foreground">
                Optional. Join directly for instant scholarship drops.
              </p>
            </div>

            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants(), "h-11 w-full")}
            >
              Join WhatsApp Channel
              <ExternalLink className="size-4" aria-hidden />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
