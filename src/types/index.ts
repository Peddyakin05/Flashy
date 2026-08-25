import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Enums                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Education levels an opportunity can target. Stored in the DB as a `text[]`
 * so a single scholarship can accept multiple levels (e.g. Masters + PhD).
 */
export const EDUCATION_LEVELS = [
  "undergraduate",
  "masters",
  "phd",
  "postdoc",
] as const;

export const educationLevelSchema = z.enum(EDUCATION_LEVELS);
export type EducationLevel = z.infer<typeof educationLevelSchema>;

/** Publication lifecycle for a record. Mirrors the Postgres enum. */
export const SCHOLARSHIP_STATUSES = ["draft", "published", "expired"] as const;
export const scholarshipStatusSchema = z.enum(SCHOLARSHIP_STATUSES);
export type ScholarshipStatus = z.infer<typeof scholarshipStatusSchema>;

/** Delivery channel a subscriber wants alerts on. */
export const SUBSCRIBER_CHANNELS = ["email", "whatsapp", "telegram"] as const;
export const subscriberChannelSchema = z.enum(SUBSCRIBER_CHANNELS);
export type SubscriberChannel = z.infer<typeof subscriberChannelSchema>;

/* -------------------------------------------------------------------------- */
/*  Scholarship                                                               */
/* -------------------------------------------------------------------------- */

/**
 * A published scholarship as read by the public site. This is the canonical
 * shape the UI renders. CGPA uses the common Nigerian 5.0 scale by convention
 * (documented in the UI), but any 0–5 value validates.
 */
export const scholarshipSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug"),

  provider_name: z.string().min(1),
  provider_logo_url: z.string().url().nullable(),

  min_cgpa: z.number().min(0).max(5).nullable(),
  education_levels: z.array(educationLevelSchema).default([]),
  target_disciplines: z.array(z.string()).default([]),
  target_countries: z.array(z.string()).default([]),

  fully_funded: z.boolean(),
  award_value: z.string().min(1),

  deadline: z.string().datetime({ offset: true }).nullable(),
  official_apply_url: z.string().url(),
  content_markdown: z.string(),

  status: scholarshipStatusSchema,
  views_count: z.number().int().nonnegative().default(0),

  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type Scholarship = z.infer<typeof scholarshipSchema>;

/**
 * Shape used when *inserting* a scholarship (seed script / admin tooling).
 * The database fills id, views_count, and timestamps, so they are omitted.
 */
export const scholarshipInsertSchema = scholarshipSchema
  .omit({
    id: true,
    views_count: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    // Empty arrays are meaningful ("open to all"), so keep the defaults.
    education_levels: z.array(educationLevelSchema),
    target_disciplines: z.array(z.string()),
    target_countries: z.array(z.string()),
  });

export type ScholarshipInsert = z.infer<typeof scholarshipInsertSchema>;

/* -------------------------------------------------------------------------- */
/*  Subscriber                                                                */
/* -------------------------------------------------------------------------- */

export const subscriberSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  target_disciplines: z.array(z.string()).default([]),
  channel: subscriberChannelSchema.default("email"),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime({ offset: true }),
});

export type Subscriber = z.infer<typeof subscriberSchema>;

/** Public subscribe form payload. */
export const subscriberInsertSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  target_disciplines: z.array(z.string()).default([]),
  channel: subscriberChannelSchema.default("email"),
});

export type SubscriberInsert = z.infer<typeof subscriberInsertSchema>;

/* -------------------------------------------------------------------------- */
/*  Eligibility check (deterministic, client-side)                            */
/* -------------------------------------------------------------------------- */

/**
 * Inputs a visitor provides to the deterministic eligibility checker.
 * `cgpa` is optional so the checker can still evaluate level/discipline for
 * users who don't want to disclose a grade.
 */
export const eligibilityInputSchema = z.object({
  cgpa: z
    .number({ invalid_type_error: "Enter your CGPA as a number" })
    .min(0)
    .max(5)
    .optional(),
  level: educationLevelSchema.optional(),
  discipline: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

export type EligibilityInput = z.infer<typeof eligibilityInputSchema>;

/* -------------------------------------------------------------------------- */
/*  Filter params (URL-synced)                                                */
/* -------------------------------------------------------------------------- */

/**
 * Multi-select filter state. Persisted to the URL as comma-separated values so
 * results are shareable and survive refreshes. `funding` is a tri-state.
 */
export const filterParamsSchema = z.object({
  disciplines: z.array(z.string()).default([]),
  levels: z.array(educationLevelSchema).default([]),
  countries: z.array(z.string()).default([]),
  funding: z.enum(["all", "fully_funded", "partial"]).default("all"),
  q: z.string().default(""),
});

export type FilterParams = z.infer<typeof filterParamsSchema>;
