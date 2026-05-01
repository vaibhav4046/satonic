export type EmailGuess = { email: string; pattern: string; confidence: number };

const PATTERNS: Array<{ name: string; build: (f: string, l: string) => string; weight: number }> = [
  { name: "first.last", build: (f, l) => `${f}.${l}`, weight: 30 },
  { name: "first", build: (f) => `${f}`, weight: 25 },
  { name: "flast", build: (f, l) => `${f[0] ?? ""}${l}`, weight: 20 },
  { name: "first_last", build: (f, l) => `${f}_${l}`, weight: 12 },
  { name: "firstl", build: (f, l) => `${f}${l[0] ?? ""}`, weight: 8 },
  { name: "last.first", build: (f, l) => `${l}.${f}`, weight: 5 },
];

const ROLE_PREFIXES = ["info", "contact", "hello", "team", "support", "sales"];

export function generateEmailPatterns(
  fullName: string,
  domain: string
): EmailGuess[] {
  const cleaned = fullName.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]! : "";
  const out: EmailGuess[] = [];
  if (first && last) {
    for (const p of PATTERNS) {
      const local = p.build(first, last).replace(/[^a-z0-9._-]/g, "");
      if (local.length === 0 || local.length > 64) continue;
      out.push({ email: `${local}@${domain}`, pattern: p.name, confidence: p.weight });
    }
  } else if (first) {
    out.push({ email: `${first}@${domain}`, pattern: "first", confidence: 25 });
  }
  return out;
}

export function generateRoleEmails(domain: string): EmailGuess[] {
  return ROLE_PREFIXES.map((p) => ({ email: `${p}@${domain}`, pattern: `role:${p}`, confidence: 15 }));
}

export function pickBestEmail(
  guesses: EmailGuess[],
  mxValid: (email: string) => boolean
): EmailGuess | null {
  const valid = guesses.filter((g) => mxValid(g.email));
  if (valid.length === 0) return null;
  return valid.sort((a, b) => b.confidence - a.confidence)[0] ?? null;
}
