export type PfmeaStatus = "Open" | "In Progress" | "Completed";

/** AIAG-VDA style 4-step workflow (matches the Kaizen Copilot wizard). */
export type WizardStep = 1 | 2 | 3 | 4;

export const STEP_LABELS: Record<WizardStep, string> = {
  1: "Structural & Functional Analysis",
  2: "Failure Analysis",
  3: "Risk Analysis",
  4: "Risk Management & Communication",
};

export interface PfmeaRow {
  id: string;

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
