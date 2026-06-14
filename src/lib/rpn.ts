import type { GeneratedRow, PfmeaRow } from "../types";

const clamp = (n: number): number => {
  const v = Math.round(Number.isFinite(n) ? n : 1);
  return Math.min(10, Math.max(1, v));
};

export function computeRpn(s: number, o: number, d: number): number {
  return clamp(s) * clamp(o) * clamp(d);
}

let counter = 0;
export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  counter += 1;
  return `row-${Date.now()}-${counter}`;
}

/** Turn a raw generated row into a full table row with id + rpn. */
export function toPfmeaRow(g: GeneratedRow): PfmeaRow {
  const severity = clamp(g.severity);
  const occurrence = clamp(g.occurrence);
  const detection = clamp(g.detection);
  return {
    id: makeId(),
    processStep: g.processStep?.trim() || "Untitled step",
    function: g.function?.trim() || "",
    requirement: g.requirement?.trim() || "",
    failureMode: g.failureMode?.trim() || "",
    effect: g.effect?.trim() || "",
    cause: g.cause?.trim() || "",
    severity,
    classification: g.classification?.trim() || "",
    occurrence,
    controlPrevention: g.controlPrevention?.trim() || "",
    controlDetection: g.controlDetection?.trim() || "",
    detection,
    rpn: severity * occurrence * detection,
    recommendedAction: g.recommendedAction?.trim() || "",
    responsible: "",
    targetDate: "",
    actionTaken: "",
    sevAfter: severity,
    occAfter: occurrence,
    detAfter: detection,
    rpnAfter: severity * occurrence * detection,
    status: "Open",
  };
}

/** Color band for an RPN value (low / medium / high risk). */
export function rpnBand(rpn: number): "low" | "medium" | "high" {
  if (rpn >= 200) return "high";
  if (rpn >= 80) return "medium";
  return "low";
}

/**
 * AIAG-VDA Action Priority (AP): High / Medium / Low.
 * Simplified from the official S×O×D lookup — emphasises severity first.
 */
export function actionPriority(s: number, o: number, d: number): "H" | "M" | "L" {
  if (s >= 9 && o >= 2) return "H";
  if (s >= 7 && o >= 4) return "H";
  if (s >= 9) return "M";
  if (o >= 6 || (o >= 4 && d >= 5)) return "M";
  if (s >= 5 && o >= 5) return "M";
  return "L";
}
