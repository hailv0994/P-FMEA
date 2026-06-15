import { useMemo } from "react";
import type { PfmeaRow } from "../types";

interface StepGroup {
  key: string;
  processStep: string;
  fn: string;
  allRowIds: string[];
  rows: PfmeaRow[];
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
        map.set(key, { key, processStep: r.processStep, fn: r.function, allRowIds: [], rows: [] });
        order.push(key);
      }
      const g = map.get(key)!;
      g.allRowIds.push(r.id);
      g.rows.push(r);
    });

    return order.map((k) => map.get(k)!);
  }, [rows]);

  const updateProcessStep = (g: StepGroup, val: string) =>
    g.allRowIds.forEach((id) => onUpdateRow(id, { processStep: val }));

  const updateFn = (g: StepGroup, val: string) =>
    g.allRowIds.forEach((id) => onUpdateRow(id, { function: val }));

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
                <span className="sse-req-count">{g.rows.length}</span>
              </label>
              <div className="sse-req-list">
                {g.rows.map((r, ri) => (
                  <div className="sse-req-row" key={r.id}>
                    <span className="sse-req-bullet">{ri + 1}</span>
                    <input
                      className="sse-input"
                      value={r.requirement}
                      placeholder="Hạng mục yêu cầu (→ 1 dạng hỏng hóc)"
                      onChange={(e) => onUpdateRow(r.id, { requirement: e.target.value })}
                    />
                    <button
                      className="icon-btn danger"
                      type="button"
                      title="Xóa yêu cầu này"
                      onClick={() => onDeleteRow(r.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {g.rows.length === 0 && (
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
