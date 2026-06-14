import type { GeneratedRow, PfmeaRow, ProjectMeta } from "../types";
import { parseSteps } from "./parseSteps";
import { generateWithGemini, hasGeminiKey, suggestFailureModes } from "./gemini";
import { generateFallback, suggestFailureModesFallback } from "./fallbackGenerator";
import { toPfmeaRow } from "./rpn";

export interface GenerateResult {
  rows: PfmeaRow[];
  source: "gemini" | "offline";
  note?: string;
}

/**
 * Orchestrates PFMEA generation: prefers the Gemini API when a key is
 * configured, and gracefully falls back to the offline rule-based generator.
 */
export async function generatePfmea(
  lineText: string,
  meta: ProjectMeta,
): Promise<GenerateResult> {
  const steps = parseSteps(lineText);
  if (steps.length === 0) {
    return { rows: [], source: "offline", note: "Không phát hiện công đoạn nào." };
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
        note: `Gọi Gemini thất bại (${message}). Đã dùng bản nháp ngoại tuyến.`,
      };
    }
  }

  return {
    rows: generateFallback(steps).map(toPfmeaRow),
    source: "offline",
    note: "Chưa cấu hình Gemini API key — đã tạo bằng bộ máy ngoại tuyến.",
  };
}

/** "AI Suggest" for a single step — returns new PFMEA rows to append. */
export async function suggestForStep(args: {
  processStep: string;
  fn: string;
  requirement: string;
  existing: string[];
  meta: ProjectMeta;
}): Promise<{ rows: PfmeaRow[]; source: "gemini" | "offline"; note?: string }> {
  let generated: GeneratedRow[];
  if (hasGeminiKey()) {
    try {
      generated = await suggestFailureModes(args);
      return { rows: generated.map(toPfmeaRow), source: "gemini" };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        rows: suggestFailureModesFallback(args).map(toPfmeaRow),
        source: "offline",
        note: `Gemini gợi ý thất bại (${message}); đã dùng gợi ý ngoại tuyến.`,
      };
    }
  }
  return {
    rows: suggestFailureModesFallback(args).map(toPfmeaRow),
    source: "offline",
  };
}
