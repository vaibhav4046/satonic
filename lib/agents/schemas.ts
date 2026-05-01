import { z } from "zod";
import { LeadSchema } from "@/lib/types";

export const SearchMapsInput = z.object({
  query: z.string().min(2).describe("e.g. 'dental clinics in Miami'"),
  location: z.string().nullable().describe("city, state — improves accuracy"),
  limit: z.number().int().min(1).max(120).default(50),
});

export const SearchMapsOutput = z.object({
  leads: z.array(LeadSchema),
  source: z.string(),
  warnings: z.array(z.string()).default([]),
});

export const SearchWebInput = z.object({
  query: z.string().min(2),
  limit: z.number().int().min(1).max(50).default(20),
});

export const SearchWebOutput = z.object({
  leads: z.array(LeadSchema),
  source: z.string(),
  warnings: z.array(z.string()).default([]),
});

export const SearchYouTubeInput = z.object({
  query: z.string().min(2),
  min_subs: z.number().int().nonnegative().nullable().default(null),
  max_subs: z.number().int().nonnegative().nullable().default(null),
  limit: z.number().int().min(1).max(50).default(25),
});

export const SearchYouTubeOutput = z.object({
  leads: z.array(LeadSchema),
  source: z.literal("youtube"),
  warnings: z.array(z.string()).default([]),
});

export const SearchInstagramInput = z.object({
  username: z.string().min(1),
});

export const SearchInstagramOutput = z.object({
  leads: z.array(LeadSchema),
  source: z.literal("instagram_public"),
  warnings: z.array(z.string()).default([]),
});

export const EnrichEmailInput = z.object({
  full_name: z.string().min(1),
  domain: z.string().min(3),
});

export const EnrichEmailOutput = z.object({
  email: z.string().email().nullable(),
  pattern: z.string().nullable(),
  confidence: z.number().min(0).max(100),
  candidates_tried: z.number().int().nonnegative(),
});

export const EnrichPhoneInput = z.object({
  raw: z.string().min(1),
  country: z.string().length(2).default("US"),
});

export const EnrichPhoneOutput = z.object({
  e164: z.string().nullable(),
  valid: z.boolean(),
});

export const VerifyMxInput = z.object({
  domain: z.string().min(3),
});

export const VerifyMxOutput = z.object({
  valid: z.boolean(),
  records: z.array(z.string()).default([]),
});
