export type PfmeaStatus = "Open" | "In Progress" | "Completed";

export interface PfmeaRow {
  id: string;
  processStep: string;
  function: string;
  failureMode: string;
  effect: string;
  cause: string;
  currentControl: string;
  severity: number; // 1-10
  occurrence: number; // 1-10
  detection: number; // 1-10
  rpn: number; // severity * occurrence * detection
  recommendedAction: string;
  responsible: string;
  status: PfmeaStatus;
}

/** Shape returned by the AI / fallback generator (without ids / rpn). */
export interface GeneratedRow {
  processStep: string;
  function: string;
  failureMode: string;
  effect: string;
  cause: string;
  currentControl: string;
  severity: number;
  occurrence: number;
  detection: number;
  recommendedAction: string;
}

export interface ProjectMeta {
  projectName: string;
  scope: string;
  fmeaLead: string;
  teamMembers: string;
}
