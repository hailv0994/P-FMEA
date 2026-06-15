import type { PfmeaRow } from "../types";
import { makeId } from "./rpn";

/** Cấu trúc seed PFMEA dựng sẵn cho một model base (nhập từ file Excel thực tế). */
export interface SeedFailureMode {
  requirement: string;
  failureMode: string;
  /** Ảnh hưởng — đã ghép sẵn câu tiêu chí nghiêm trọng (=>...). */
  effect: string;
  severity: number; // 1-10, ứng với rank tiêu chí nghiêm trọng
  classification: string; // "" hoặc "S"
  causes: string[]; // mỗi nguyên nhân = 1 dòng
}
export interface SeedStep {
  processStep: string;
  fn: string;
  failureModes: SeedFailureMode[];
}
export interface SeedModel {
  key: string; // khớp tên model base (không phân biệt hoa thường)
  steps: SeedStep[];
}

/** Dựng danh sách PfmeaRow từ seed: mỗi dạng hỏng hóc 1 fmId, mỗi nguyên nhân 1 dòng. */
export function buildRowsFromSeed(seed: SeedModel): PfmeaRow[] {
  const rows: PfmeaRow[] = [];
  for (const st of seed.steps) {
    for (const fm of st.failureModes) {
      const fmId = makeId();
      const causes = fm.causes.length ? fm.causes : [""];
      const sev = Math.min(10, Math.max(1, Math.round(fm.severity) || 1));
      causes.forEach((cause) => {
        rows.push({
          id: makeId(),
          fmId,
          processStep: st.processStep,
          function: st.fn,
          requirement: fm.requirement,
          failureMode: fm.failureMode,
          effect: fm.effect,
          cause,
          severity: sev,
          classification: fm.classification,
          occurrence: 1,
          controlPrevention: "",
          controlDetection: "",
          detection: 1,
          rpn: sev,
          recommendedAction: "",
          responsible: "",
          targetDate: "",
          actionTaken: "",
          sevAfter: sev,
          occAfter: 1,
          detAfter: 1,
          rpnAfter: sev,
          status: "Open",
        });
      });
    }
  }
  return rows;
}
