import type { GeneratedRow, PfmeaRow, ProjectMeta } from "../types";
import { parseSteps } from "./parseSteps";
import {
  analyzeRequirement,
  generateWithGemini,
  hasGeminiKey,
} from "./gemini";
import { analyzeRequirementFallback, generateFallback } from "./fallbackGenerator";
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

/** Chỉ lấy các trường phân tích hỏng hóc để vá vào một dòng có sẵn. */
function rowToPatch(g: GeneratedRow): Partial<PfmeaRow> {
  return {
    failureMode: g.failureMode,
    effect: g.effect,
    cause: g.cause,
    classification: g.classification,
    severity: g.severity,
    occurrence: g.occurrence,
    detection: g.detection,
    controlPrevention: g.controlPrevention,
    controlDetection: g.controlDetection,
    recommendedAction: g.recommendedAction,
  };
}

/**
 * "AI gợi ý" cho MỘT hạng mục yêu cầu (một dòng) — trả về phần vá phân tích
 * (dạng hỏng hóc = phủ định của yêu cầu, ảnh hưởng, nguyên nhân, S/O/D...).
 */
export async function suggestRow(args: {
  processStep: string;
  fn: string;
  requirement: string;
  meta: ProjectMeta;
}): Promise<{ patch: Partial<PfmeaRow>; source: "gemini" | "offline"; note?: string }> {
  if (hasGeminiKey()) {
    try {
      const g = await analyzeRequirement(args);
      return { patch: rowToPatch(g), source: "gemini" };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        patch: rowToPatch(analyzeRequirementFallback(args)),
        source: "offline",
        note: `Gemini gợi ý thất bại (${message}); đã dùng gợi ý ngoại tuyến.`,
      };
    }
  }
  return { patch: rowToPatch(analyzeRequirementFallback(args)), source: "offline" };
}
