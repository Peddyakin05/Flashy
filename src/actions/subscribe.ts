"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { subscriberInsertSchema, type SubscriberInsert } from "@/types";

export type SubscribeState = {
  status: "idle" | "success" | "error";
  message: string;
};

type SubscriberRow = SubscriberInsert & {
  id: string;
  is_active: boolean;
  created_at: string;
};

type Database = {
  public: {
    Tables: {
      subscribers: {
        Row: SubscriberRow;
        Insert: SubscriberInsert;
        Update: Partial<SubscriberInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const subscribeFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  target_disciplines: z.array(z.string()).default([]),
});

function normalizeDisciplines(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || value.trim() === "") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function subscribeToAlerts(
  _previousState: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const parsed = subscribeFormSchema.safeParse({
    email: formData.get("email"),
    target_disciplines: normalizeDisciplines(formData.get("target_disciplines")),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.flatten().fieldErrors.email?.[0] ?? "Check the subscription form.",
    };
  }

  const row = subscriberInsertSchema.parse({
    ...parsed.data,
    channel: "email",
  });

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      status: "error",
      message: "Alerts are not available until Supabase is configured.",
    };
  }

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("subscribers").insert(row);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "success",
        message: "You are already on the alert list.",
      };
    }

    return {
      status: "error",
      message: "Could not save your alert preference. Try again shortly.",
    };
  }

  return {
    status: "success",
    message: "Alert preference saved.",
  };
}
