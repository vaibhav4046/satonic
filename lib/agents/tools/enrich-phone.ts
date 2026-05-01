import "server-only";
import { tool } from "ai";
import { EnrichPhoneInput, EnrichPhoneOutput } from "@/lib/agents/schemas";
import { normalizePhone } from "@/lib/utils/phone";
import type { CountryCode } from "libphonenumber-js";

export const enrichPhoneTool = tool({
  description: "Normalize a raw phone string to E.164. Returns null if invalid.",
  parameters: EnrichPhoneInput,
  execute: async ({ raw, country }) => {
    const e164 = normalizePhone(raw, country as CountryCode);
    return EnrichPhoneOutput.parse({ e164, valid: e164 !== null });
  },
});
