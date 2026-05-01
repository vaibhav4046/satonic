import "server-only";
import { tool } from "ai";
import { EnrichEmailInput, EnrichEmailOutput } from "@/lib/agents/schemas";
import { generateEmailPatterns, generateRoleEmails } from "@/lib/utils/email-patterns";
import { verifyMxRaw } from "./verify-mx";
import { validate as validateEmailSyntax } from "email-validator";

export const enrichEmailTool = tool({
  description:
    "Guess a person's work email from their full name + company domain. Generates common patterns, MX-verifies the domain, returns highest-confidence match.",
  parameters: EnrichEmailInput,
  execute: async ({ full_name, domain }) => {
    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]!;
    const mx = await verifyMxRaw(cleanDomain);
    if (!mx.valid) {
      return EnrichEmailOutput.parse({
        email: null,
        pattern: null,
        confidence: 0,
        candidates_tried: 0,
      });
    }
    const patternGuesses = generateEmailPatterns(full_name, cleanDomain);
    const roleGuesses = generateRoleEmails(cleanDomain);
    const all = [...patternGuesses, ...roleGuesses].filter((g) => validateEmailSyntax(g.email));
    const top = all.sort((a, b) => b.confidence - a.confidence)[0];
    if (!top) {
      return EnrichEmailOutput.parse({
        email: null,
        pattern: null,
        confidence: 0,
        candidates_tried: all.length,
      });
    }
    return EnrichEmailOutput.parse({
      email: top.email,
      pattern: top.pattern,
      confidence: top.confidence,
      candidates_tried: all.length,
    });
  },
});
