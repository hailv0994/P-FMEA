import type { PfmeaRow } from "../types";

const HEADERS = [
  "Công đoạn",
  "Chức năng",
  "Yêu cầu",
  "Dạng hỏng hóc",
  "Ảnh hưởng",
  "Nguyên nhân",
  "Mức nghiêm trọng (S)",
  "Phân loại",
  "Tần suất (O)",
  "Kiểm soát - Dự phòng",
  "Kiểm soát - Phát hiện",
  "Phát hiện (D)",
  "RPN",
  "Biện pháp đề xuất",
  "Người phụ trách",
  "Thời hạn",
  "Biện pháp đã thực hiện",
  "S (sau)",
  "O (sau)",
  "D (sau)",
  "RPN (sau)",
  "Trạng thái",
];

function escape(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToCsv(rows: PfmeaRow[]): string {
  const lines = [HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.processStep,
        r.function,
        r.requirement,
        r.failureMode,
        r.effect,
        r.cause,
        r.severity,
        r.classification,
        r.occurrence,
        r.controlPrevention,
        r.controlDetection,
        r.detection,
        r.rpn,
        r.recommendedAction,
        r.responsible,
        r.targetDate,
        r.actionTaken,
        r.sevAfter,
        r.occAfter,
        r.detAfter,
        r.rpnAfter,
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
