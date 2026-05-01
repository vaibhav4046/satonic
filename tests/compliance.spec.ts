import { describe, it, expect } from "vitest";
import { isBlockedSource } from "@/lib/compliance/robots";

describe("blocked sources", () => {
  it("blocks linkedin", () => {
    expect(isBlockedSource("https://linkedin.com/in/jane")).toBe(true);
    expect(isBlockedSource("https://www.linkedin.com/company/acme")).toBe(true);
  });
  it("blocks facebook", () => {
    expect(isBlockedSource("https://facebook.com/acme")).toBe(true);
  });
  it("blocks tiktok profiles + insta posts", () => {
    expect(isBlockedSource("https://tiktok.com/@user")).toBe(true);
    expect(isBlockedSource("https://instagram.com/p/abc")).toBe(true);
  });
  it("does NOT block public web", () => {
    expect(isBlockedSource("https://acme.com")).toBe(false);
    expect(isBlockedSource("https://example.org/about")).toBe(false);
  });
});
