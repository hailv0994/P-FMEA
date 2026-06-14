import type { PfmeaRow } from "../types";

const HEADERS = [
  "Process Step",
  "Function",
  "Failure Mode",
  "Effect",
  "Cause",
  "Current Control",
  "Severity",
  "Occurrence",
  "Detection",
  "RPN",
  "Recommended Action",
  "Responsible",
  "Status",
];

function escape(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function rowsToCsv(rows: PfmeaRow[]): string {
  const lines = [HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.processStep,
        r.function,
        r.failureMode,
        r.effect,
        r.cause,
        r.currentControl,
        r.severity,
        r.occurrence,
        r.detection,
        r.rpn,
        r.recommendedAction,
        r.responsible,
        r.status,
      ]
        .map(escape)
        .join(","),
    );
  }
  return lines.join("\n");
}

export function downloadCsv(rows: PfmeaRow[], filename = "pfmea.csv"): void {
  const blob = new Blob([rowsToCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
