import type { PfmeaRow, ProjectMeta } from "../types";
import { parseSteps } from "./parseSteps";
import { generateWithGemini, hasGeminiKey } from "./gemini";
import { generateFallback } from "./fallbackGenerator";
import { toPfmeaRow } from "./rpn";

export interface GenerateResult {
  rows: PfmeaRow[];
  source: "gemini" | "offline";
  note?: string;
}

/**
 * Orchestrates PFMEA generation: prefers the Gemini API when a key is
 * configured, and gracefully falls back to the offline rule-based generator
 * (so the app always produces a usable draft).
 */
export async function generatePfmea(
  lineText: string,
  meta: ProjectMeta,
): Promise<GenerateResult> {
  const steps = parseSteps(lineText);
  if (steps.length === 0) {
    return { rows: [], source: "offline", note: "No process steps detected." };
  }

  if (hasGeminiKey()) {
    try {
      const generated = await generateWithGemini({ steps, meta });
      return { rows: generated.map(toPfmeaRow), source: "gemini" };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        rows: generateFallback(steps).map(toPfmeaRow),
        source: "offline",
        note: `Gemini call failed (${message}). Showing an offline draft instead.`,
      };
    }
  }

  return {
    rows: generateFallback(steps).map(toPfmeaRow),
    source: "offline",
    note: "No Gemini API key set — generated with the built-in offline engine.",
  };
}
