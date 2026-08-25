import type { Metadata } from "next";
import { Mail, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SUPPORT_EMAIL = "support@flashy.scholar";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Flashy for scholarship listing corrections, partnership inquiries, and support.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase text-primary">Contact</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Send a scholarship tip, correction, or support request.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Use the form for listing corrections, provider updates, partnership
          inquiries, or product feedback. Include the official opportunity link
          when reporting a scholarship.
        </p>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg">Inquiry form</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={`mailto:${SUPPORT_EMAIL}`}
              method="post"
              encType="text/plain"
              className="grid gap-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" autoComplete="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={7}
                  className="min-h-40 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <Button type="submit" className="h-11 w-full sm:w-fit">
                <Send className="size-4" aria-hidden />
                Send inquiry
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="size-5 text-primary" aria-hidden />
              Direct support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              For urgent corrections or provider requests, email us directly.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
