import { describe, it, expect } from "vitest";
import { LeadSchema } from "@/lib/types";

describe("LeadSchema", () => {
  it("accepts a complete lead", () => {
    const r = LeadSchema.safeParse({
      id: "abc",
      name: "Acme",
      type: "business",
      email: "x@acme.com",
      email_confidence: 80,
      phone: "+16175550142",
      website: "https://acme.com",
      social: [],
      location: { city: "Boston", country: "US" },
      category: "saas",
      source: "google_places",
      fetched_at: "2026-05-01T00:00:00Z",
      score: 85,
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid score", () => {
    const r = LeadSchema.safeParse({
      id: "abc",
      name: "Acme",
      type: "business",
      email: null,
      email_confidence: 0,
      phone: null,
      website: null,
      social: [],
      location: null,
      category: null,
      source: "x",
      fetched_at: "2026-05-01T00:00:00Z",
      score: 200,
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown type", () => {
    const r = LeadSchema.safeParse({
      id: "abc",
      name: "x",
      type: "alien",
      email: null,
      email_confidence: 0,
      phone: null,
      website: null,
      social: [],
      location: null,
      category: null,
      source: "x",
      fetched_at: "2026-05-01T00:00:00Z",
      score: 50,
    });
    expect(r.success).toBe(false);
  });
});
