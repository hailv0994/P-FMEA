import { useMemo } from "react";
import type { PfmeaRow } from "../types";

interface ReqEntry {
  fmId: string;
  rowIds: string[]; // mọi dòng nguyên nhân của cùng dạng hỏng hóc
  requirement: string;
}

interface StepGroup {
  key: string;
  processStep: string;
  fn: string;
  allRowIds: string[];
  reqs: ReqEntry[];
}

interface Props {
  rows: PfmeaRow[];
  onUpdateRow: (id: string, patch: Partial<PfmeaRow>) => void;
  onDeleteRow: (id: string) => void;
  onAddRequirementRow: (afterId: string, processStep: string, fn: string, req: string) => void;
}

export function StepStructureEditor({ rows, onUpdateRow, onDeleteRow, onAddRequirementRow }: Props) {
  const groups = useMemo<StepGroup[]>(() => {
    const map = new Map<string, StepGroup>();
    const order: string[] = [];

    rows.forEach((r) => {
      const key = r.processStep.trim().toLowerCase() || `__${r.id}`;
      if (!map.has(key)) {
        map.set(key, { key, processStep: r.processStep, fn: r.function, allRowIds: [], reqs: [] });
        order.push(key);
      }
      const g = map.get(key)!;
      g.allRowIds.push(r.id);
      // Gom theo dạng hỏng hóc (fmId): mỗi yêu cầu chỉ hiện 1 lần dù có nhiều nguyên nhân.
      const fm = r.fmId || r.id;
      const existing = g.reqs.find((e) => e.fmId === fm);
      if (existing) existing.rowIds.push(r.id);
      else g.reqs.push({ fmId: fm, rowIds: [r.id], requirement: r.requirement });
    });

    return order.map((k) => map.get(k)!);
  }, [rows]);

  const updateProcessStep = (g: StepGroup, val: string) =>
    g.allRowIds.forEach((id) => onUpdateRow(id, { processStep: val }));

  const updateFn = (g: StepGroup, val: string) =>
    g.allRowIds.forEach((id) => onUpdateRow(id, { function: val }));

  const updateReq = (entry: ReqEntry, val: string) =>
    entry.rowIds.forEach((id) => onUpdateRow(id, { requirement: val }));

  const deleteReq = (entry: ReqEntry) =>
    entry.rowIds.forEach((id) => onDeleteRow(id));

  return (
    <div className="sse-list">
      {groups.map((g, gi) => (
        <div className="sse-group" key={g.key}>
          <div className="sse-header">
            <span className="sse-no">{gi + 1}</span>
            <input
              className="sse-step-input"
              value={g.processStep}
              placeholder="Tên công đoạn"
              onChange={(e) => updateProcessStep(g, e.target.value)}
            />
          </div>

          <div className="sse-body">
            <div className="sse-fn-row">
              <label className="sse-label">Chức năng</label>
              <input
                className="sse-input"
                value={g.fn}
                placeholder="Mô tả chức năng của công đoạn"
                onChange={(e) => updateFn(g, e.target.value)}
              />
            </div>

            <div className="sse-req-section">
              <label className="sse-label">
                Yêu cầu
                <span className="sse-req-count">{g.reqs.length}</span>
              </label>
              <div className="sse-req-list">
                {g.reqs.map((entry, ri) => (
                  <div className="sse-req-row" key={entry.fmId}>
                    <span className="sse-req-bullet">{ri + 1}</span>
                    <input
                      className="sse-input"
                      value={entry.requirement}
                      placeholder="Hạng mục yêu cầu (→ 1 dạng hỏng hóc)"
                      onChange={(e) => updateReq(entry, e.target.value)}
                    />
                    <button
                      className="icon-btn danger"
                      type="button"
                      title="Xóa yêu cầu này"
                      onClick={() => deleteReq(entry)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {g.reqs.length === 0 && (
                  <p className="muted" style={{ margin: "4px 0", fontSize: "13px" }}>
                    Chưa có yêu cầu nào.
                  </p>
                )}
                <button
                  className="btn-secondary sse-add-req"
                  type="button"
                  onClick={() =>
                    onAddRequirementRow(
                      g.allRowIds[g.allRowIds.length - 1] ?? "",
                      g.processStep,
                      g.fn,
                      "",
                    )
                  }
                >
                  + Thêm yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {groups.length === 0 && <p className="muted">Chưa có công đoạn nào.</p>}
    </div>
  );
}
