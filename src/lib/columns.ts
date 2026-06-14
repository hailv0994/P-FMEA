import type { PfmeaRow } from "../types";

export type ColumnKey =
  | "processStep"
  | "function"
  | "requirement"
  | "failureMode"
  | "effect"
  | "cause"
  | "severity"
  | "classification"
  | "occurrence"
  | "controlPrevention"
  | "controlDetection"
  | "detection"
  | "rpn"
  | "recommendedAction"
  | "responsible"
  | "targetDate"
  | "actionTaken"
  | "sevAfter"
  | "occAfter"
  | "detAfter"
  | "rpnAfter"
  | "status";

export type ColumnKind = "text" | "num" | "rpn" | "rpnAfter" | "status" | "date" | "class";

export interface ColumnDef {
  key: ColumnKey;
  label: string;
  kind: ColumnKind;
  /** which wizard step this column belongs to (for header colour band) */
  group: 1 | 2 | 3 | 4;
  title?: string;
}

export const COLUMNS: Record<ColumnKey, ColumnDef> = {
  processStep: { key: "processStep", label: "Process Step", kind: "text", group: 1 },
  function: { key: "function", label: "Function", kind: "text", group: 1 },
  requirement: { key: "requirement", label: "Requirement", kind: "text", group: 1 },
  failureMode: { key: "failureMode", label: "Failure Mode", kind: "text", group: 2 },
  effect: { key: "effect", label: "Effect", kind: "text", group: 2 },
  cause: { key: "cause", label: "Cause", kind: "text", group: 2 },
  severity: { key: "severity", label: "S", kind: "num", group: 3, title: "Severity" },
  classification: { key: "classification", label: "Class", kind: "class", group: 3, title: "Classification (special characteristic)" },
  occurrence: { key: "occurrence", label: "O", kind: "num", group: 3, title: "Occurrence" },
  controlPrevention: { key: "controlPrevention", label: "Control · Prevention", kind: "text", group: 3 },
  controlDetection: { key: "controlDetection", label: "Control · Detection", kind: "text", group: 3 },
  detection: { key: "detection", label: "D", kind: "num", group: 3, title: "Detection" },
  rpn: { key: "rpn", label: "RPN", kind: "rpn", group: 3 },
  recommendedAction: { key: "recommendedAction", label: "Recommended Action", kind: "text", group: 4 },
  responsible: { key: "responsible", label: "Responsible", kind: "text", group: 4 },
  targetDate: { key: "targetDate", label: "Target Date", kind: "date", group: 4 },
  actionTaken: { key: "actionTaken", label: "Action Taken", kind: "text", group: 4 },
  sevAfter: { key: "sevAfter", label: "S'", kind: "num", group: 4, title: "Severity after action" },
  occAfter: { key: "occAfter", label: "O'", kind: "num", group: 4, title: "Occurrence after action" },
  detAfter: { key: "detAfter", label: "D'", kind: "num", group: 4, title: "Detection after action" },
  rpnAfter: { key: "rpnAfter", label: "RPN'", kind: "rpnAfter", group: 4, title: "RPN after action" },
  status: { key: "status", label: "Status", kind: "status", group: 4 },
};

export const ALL_COLUMNS: ColumnKey[] = Object.keys(COLUMNS) as ColumnKey[];

/** Columns shown for each wizard step's focused editor (table-based steps). */
export const STEP_COLUMNS: Record<1 | 3 | 4, ColumnKey[]> = {
  1: ["processStep", "function", "requirement"],
  3: [
    "processStep",
    "failureMode",
    "severity",
    "classification",
    "occurrence",
    "controlPrevention",
    "controlDetection",
    "detection",
    "rpn",
  ],
  4: [
    "processStep",
    "failureMode",
    "rpn",
    "recommendedAction",
    "responsible",
    "targetDate",
    "actionTaken",
    "sevAfter",
    "occAfter",
    "detAfter",
    "rpnAfter",
    "status",
  ],
};

export function isNumericValue(row: PfmeaRow, key: ColumnKey): boolean {
  return typeof row[key] === "number";
}
