import { z } from "zod";

export const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
  followers: z.number().int().nonnegative().optional(),
  handle: z.string().optional(),
});

export const LeadLocationSchema = z.object({
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  formatted: z.string().optional(),
});

export const LeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["business", "person", "creator"]),
  email: z.string().email().nullable(),
  email_confidence: z.number().min(0).max(100),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  social: z.array(SocialLinkSchema).default([]),
  location: LeadLocationSchema.nullable(),
  category: z.string().nullable(),
  source: z.string(),
  fetched_at: z.string(),
  score: z.number().min(0).max(100),
  notes: z.string().optional(),
});

export type Lead = z.infer<typeof LeadSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type LeadLocation = z.infer<typeof LeadLocationSchema>;

export const IntentSchema = z.enum(["local_business", "b2b_company", "influencer", "unknown"]);
export type Intent = z.infer<typeof IntentSchema>;

export const QueryPlanSchema = z.object({
  intent: IntentSchema,
  query_understood_as: z.string(),
  search_terms: z.array(z.string()).min(1),
  location: z.string().nullable(),
  limit: z.number().int().min(1).max(500).default(50),
  niche_keywords: z.array(z.string()).default([]),
  min_followers: z.number().int().nonnegative().nullable().default(null),
  max_followers: z.number().int().nonnegative().nullable().default(null),
});
export type QueryPlan = z.infer<typeof QueryPlanSchema>;

export const AgentResultSchema = z.object({
  leads: z.array(LeadSchema),
  query_understood_as: z.string(),
  sources_used: z.array(z.string()),
  partial: z.boolean(),
  warnings: z.array(z.string()),
});
export type AgentResult = z.infer<typeof AgentResultSchema>;
