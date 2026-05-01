import { describe, it, expect } from "vitest";
import { hashString, normalizeDomain, dedupeBy, clampScore } from "@/lib/utils";
import { generateEmailPatterns, generateRoleEmails } from "@/lib/utils/email-patterns";
import { normalizePhone, isValidPhone } from "@/lib/utils/phone";
import { leadsToCsv } from "@/lib/utils/csv";
import type { Lead } from "@/lib/types";

describe("hashString", () => {
  it("is deterministic", () => {
    expect(hashString("hello")).toBe(hashString("hello"));
  });
  it("differs for different inputs", () => {
    expect(hashString("a")).not.toBe(hashString("b"));
  });
});

describe("normalizeDomain", () => {
  it("strips www", () => {
    expect(normalizeDomain("https://www.acme.com/about")).toBe("acme.com");
  });
  it("handles bare host", () => {
    expect(normalizeDomain("acme.com")).toBe("acme.com");
  });
  it("returns null for garbage", () => {
    expect(normalizeDomain("not a url")).toBe(null);
  });
});

describe("dedupeBy", () => {
  it("keeps first occurrence", () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 1 }];
    const out = dedupeBy(items, (x) => String(x.id));
    expect(out).toHaveLength(2);
  });
});

describe("clampScore", () => {
  it("clamps to 0-100", () => {
    expect(clampScore(150)).toBe(100);
    expect(clampScore(-10)).toBe(0);
    expect(clampScore(50.6)).toBe(51);
  });
});

describe("email patterns", () => {
  it("generates standard patterns", () => {
    const guesses = generateEmailPatterns("Jane Doe", "acme.com");
    const emails = guesses.map((g) => g.email);
    expect(emails).toContain("jane.doe@acme.com");
    expect(emails).toContain("jane@acme.com");
    expect(emails).toContain("jdoe@acme.com");
  });
  it("handles single-name", () => {
    const guesses = generateEmailPatterns("Cher", "music.com");
    expect(guesses[0]?.email).toBe("cher@music.com");
  });
  it("role emails", () => {
    const r = generateRoleEmails("acme.com");
    expect(r.map((g) => g.email)).toContain("info@acme.com");
  });
});

describe("phone normalization", () => {
  it("E.164 format", () => {
    expect(normalizePhone("(617) 555-0142", "US")).toBe("+16175550142");
  });
  it("rejects invalid", () => {
    expect(isValidPhone("123")).toBe(false);
  });
});

describe("CSV export", () => {
  it("escapes commas + quotes", () => {
    const leads: Lead[] = [
      {
        id: "1",
        name: 'Acme, Inc "test"',
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
      },
    ];
    const csv = leadsToCsv(leads);
    expect(csv.split("\n")).toHaveLength(2);
    expect(csv).toContain('"Acme, Inc ""test"""');
    expect(csv).toContain("+16175550142");
  });
});
