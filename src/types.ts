export type PfmeaStatus = "Open" | "In Progress" | "Completed";

/** AIAG-VDA style 4-step workflow (matches the Kaizen Copilot wizard). */
export type WizardStep = 1 | 2 | 3 | 4;

export const STEP_LABELS: Record<WizardStep, string> = {
  1: "Phân tích cấu trúc & chức năng",
  2: "Phân tích hỏng hóc",
  3: "Phân tích rủi ro",
  4: "Quản lý rủi ro & truyền đạt",
};

export const STATUS_LABELS: Record<PfmeaStatus, string> = {
  Open: "Mở",
  "In Progress": "Đang xử lý",
  Completed: "Hoàn thành",
};

export interface PfmeaRow {
  id: string;
  /**
   * Mã nhóm dạng hỏng hóc. Các dòng (cause) cùng một dạng hỏng hóc — chia sẻ
   * chung yêu cầu / dạng hỏng hóc / ảnh hưởng / mức nghiêm trọng — có cùng fmId.
   * Mỗi nguyên nhân = 1 dòng PfmeaRow trong cùng nhóm fmId.
   */
  fmId: string;

  // Step 1 — Structural & Functional Analysis
  processStep: string;
  function: string;
  requirement: string;

  // Step 2 — Failure Analysis
  failureMode: string;
  effect: string;
  cause: string;

  // Step 3 — Risk Analysis
  severity: number; // 1-10
  classification: string; // special characteristic, e.g. "", "S", "CC", "SC"
  occurrence: number; // 1-10
  controlPrevention: string; // current process control — prevention
  controlDetection: string; // current process control — detection
  detection: number; // 1-10
  rpn: number; // severity * occurrence * detection

  // Step 4 — Risk Management & Communication
  recommendedAction: string;
  responsible: string;
  targetDate: string;
  actionTaken: string;
  sevAfter: number;
  occAfter: number;
  detAfter: number;
  rpnAfter: number;
  status: PfmeaStatus;
}

/** Shape returned by the AI / fallback generator (no ids / computed fields). */
export interface GeneratedRow {
  processStep: string;
  function: string;
  requirement: string;
  failureMode: string;
  effect: string;
  cause: string;
  severity: number;
  classification: string;
  occurrence: number;
  controlPrevention: string;
  controlDetection: string;
  detection: number;
  recommendedAction: string;
}

export interface ProjectMeta {
  projectName: string;
  scope: string;
  fmeaLead: string;
  teamMembers: string;
}
