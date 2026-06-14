/**
 * Parse free-form production-line text into discrete process steps.
 * Handles numbered lists ("1. Load part"), bulleted lists, arrow flows
 * ("Load -> Install -> Tighten"), and plain newline-separated lines.
 */
export function parseSteps(raw: string): string[] {
  const text = (raw || "").trim();
  if (!text) return [];

  // Arrow-style single-line flow: "Load part -> Install -> Tighten"
  if (!text.includes("\n") && /(->|→|=>)/.test(text)) {
    return splitClean(text.split(/->|→|=>/));
  }

  // Otherwise split by lines, then strip list markers.
  const lines = text.split(/\r?\n/);
  const steps = lines
    .map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s*/, "").trim())
    .filter(Boolean);

  return steps;
}

function splitClean(parts: string[]): string[] {
  return parts.map((p) => p.trim()).filter(Boolean);
}
