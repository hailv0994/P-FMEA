import { useMemo } from "react";
import type { PfmeaRow } from "../types";
import { STATUS_LABELS } from "../types";
import { actionPriority, rpnBand } from "../lib/rpn";

interface ResultsViewProps {
  rows: PfmeaRow[];
  onExportExcel: () => void;
  onExportCsv: () => void;
  onBack: () => void;
}

export function ResultsView({ rows, onExportExcel, onExportCsv, onBack }: ResultsViewProps) {
  const stats = useMemo(() => {
    const steps = new Set(rows.map((r) => r.processStep.trim().toLowerCase()));
    const high = rows.filter((r) => rpnBand(r.rpn) === "high").length;
    const medium = rows.filter((r) => rpnBand(r.rpn) === "medium").length;
    const low = rows.length - high - medium;
    const open = rows.filter((r) => r.status !== "Completed").length;
    const apHigh = rows.filter(
      (r) => actionPriority(r.severity, r.occurrence, r.detection) === "H",
    ).length;
    const rpnBefore = rows.reduce((s, r) => s + r.rpn, 0);
    const rpnAfter = rows.reduce((s, r) => s + r.rpnAfter, 0);
    const reduction = rpnBefore ? Math.round((1 - rpnAfter / rpnBefore) * 100) : 0;
    return { steps: steps.size, high, medium, low, open, apHigh, reduction };
  }, [rows]);

  const ranked = useMemo(
    () =>
      [...rows]
        .map((r) => ({ row: r, ap: actionPriority(r.severity, r.occurrence, r.detection) }))
        .sort((a, b) => b.row.rpn - a.row.rpn),
    [rows],
  );

  return (
    <div className="results">
      <div className="results-head">
        <button className="btn-secondary" type="button" onClick={onBack}>
          ← Quay lại chỉnh sửa
        </button>
        <h2 className="panel-title">Kết quả PFMEA</h2>
        <div className="results-export">
          <button
            className="btn-secondary"
            type="button"
            onClick={onExportCsv}
            disabled={rows.length === 0}
          >
            Xuất CSV
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={onExportExcel}
            disabled={rows.length === 0}
          >
            ⬇ Xuất Excel (theo khuôn)
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <Stat label="Dạng hỏng hóc" value={rows.length} />
        <Stat label="Công đoạn" value={stats.steps} />
        <Stat label="Rủi ro cao (RPN ≥ 200)" value={stats.high} tone="high" />
        <Stat label="Rủi ro trung bình" value={stats.medium} tone="medium" />
        <Stat label="Ưu tiên xử lý cao" value={stats.apHigh} tone="high" />
        <Stat label="Hành động chưa xong" value={stats.open} />
        <Stat label="Mức giảm RPN" value={`${stats.reduction}%`} tone="good" />
      </div>

      <h3 className="results-sub">Ưu tiên hành động (RPN cao nhất trước)</h3>
      {rows.length === 0 ? (
        <p className="muted">Chưa có dữ liệu — hãy tạo PFMEA trước.</p>
      ) : (
        <div className="table-scroll">
          <table className="pfmea-table results-table">
            <thead>
              <tr>
                <th>Công đoạn</th>
                <th>Dạng hỏng hóc</th>
                <th className="col-num">S</th>
                <th className="col-num">O</th>
                <th className="col-num">D</th>
                <th className="col-num">RPN</th>
                <th className="col-num" title="Ưu tiên hành động">UT</th>
                <th>Biện pháp đề xuất</th>
                <th>Người phụ trách</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(({ row, ap }) => (
                <tr key={row.id}>
                  <td className="ro">{row.processStep}</td>
                  <td className="ro">{row.failureMode}</td>
                  <td className="col-num ro">{row.severity}</td>
                  <td className="col-num ro">{row.occurrence}</td>
                  <td className="col-num ro">{row.detection}</td>
                  <td className={`col-num rpn-cell ${rpnBand(row.rpn)}`}>{row.rpn}</td>
                  <td className={`col-num ap ap-${ap.toLowerCase()}`}>{ap}</td>
                  <td className="ro">{row.recommendedAction}</td>
                  <td className="ro">{row.responsible || "—"}</td>
                  <td className="ro">
                    <span
                      className={`status-pill status-${row.status
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`}
                    >
                      {STATUS_LABELS[row.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "high" | "medium" | "good";
}) {
  return (
    <div className={`stat ${tone ? `stat-${tone}` : ""}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
