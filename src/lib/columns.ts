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
  processStep: { key: "processStep", label: "Công đoạn", kind: "text", group: 1 },
  function: { key: "function", label: "Chức năng", kind: "text", group: 1 },
  requirement: { key: "requirement", label: "Yêu cầu", kind: "text", group: 1 },
  failureMode: { key: "failureMode", label: "Dạng hỏng hóc", kind: "text", group: 2 },
  effect: { key: "effect", label: "Ảnh hưởng", kind: "text", group: 2 },
  cause: { key: "cause", label: "Nguyên nhân", kind: "text", group: 2 },
  severity: { key: "severity", label: "S", kind: "num", group: 3, title: "Mức độ nghiêm trọng (S)" },
  classification: { key: "classification", label: "PL", kind: "class", group: 3, title: "Phân loại (đặc tính đặc biệt)" },
  occurrence: { key: "occurrence", label: "O", kind: "num", group: 3, title: "Tần suất phát sinh (O)" },
  controlPrevention: { key: "controlPrevention", label: "Kiểm soát · Dự phòng", kind: "text", group: 3 },
  controlDetection: { key: "controlDetection", label: "Kiểm soát · Phát hiện", kind: "text", group: 3 },
  detection: { key: "detection", label: "D", kind: "num", group: 3, title: "Khả năng phát hiện (D)" },
  rpn: { key: "rpn", label: "RPN", kind: "rpn", group: 3 },
  recommendedAction: { key: "recommendedAction", label: "Biện pháp đề xuất", kind: "text", group: 4 },
  responsible: { key: "responsible", label: "Người phụ trách", kind: "text", group: 4 },
  targetDate: { key: "targetDate", label: "Thời hạn", kind: "date", group: 4 },
  actionTaken: { key: "actionTaken", label: "Biện pháp đã thực hiện", kind: "text", group: 4 },
  sevAfter: { key: "sevAfter", label: "S'", kind: "num", group: 4, title: "Mức nghiêm trọng sau xử lý" },
  occAfter: { key: "occAfter", label: "O'", kind: "num", group: 4, title: "Tần suất sau xử lý" },
  detAfter: { key: "detAfter", label: "D'", kind: "num", group: 4, title: "Phát hiện sau xử lý" },
  rpnAfter: { key: "rpnAfter", label: "RPN'", kind: "rpnAfter", group: 4, title: "RPN sau xử lý" },
  status: { key: "status", label: "Trạng thái", kind: "status", group: 4 },
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
