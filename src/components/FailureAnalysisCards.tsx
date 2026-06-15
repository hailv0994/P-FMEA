import type { PfmeaRow } from "../types";
import { SEVERITY_RULES } from "../lib/severityRules";

export interface StepGroup {
  key: string;
  processStep: string;
  function: string;
  requirement: string;
  rows: PfmeaRow[];
}

interface FailureAnalysisCardsProps {
  groups: StepGroup[];
  onUpdateRow: (id: string, patch: Partial<PfmeaRow>) => void;
  onUpdateFmGroup: (fmId: string, patch: Partial<PfmeaRow>) => void;
  onAddCause: (fmId: string) => void;
  onDeleteCause: (id: string) => void;
  onAiSuggestRow: (row: PfmeaRow, group: StepGroup) => void;
  onAiSuggestGroup: (group: StepGroup) => void;
  busy: Set<string>;
  negate: (req: string) => string;
}

/** Gom các dòng theo dạng hỏng hóc (fmId), giữ nguyên thứ tự xuất hiện. */
function subGroupByFm(rows: PfmeaRow[]): PfmeaRow[][] {
  const map = new Map<string, PfmeaRow[]>();
  const order: string[] = [];
  rows.forEach((r) => {
    const key = r.fmId || r.id;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(r);
  });
  return order.map((k) => map.get(k)!);
}

export function FailureAnalysisCards({
  groups,
  onUpdateRow,
  onUpdateFmGroup,
  onAddCause,
  onDeleteCause,
  onAiSuggestRow,
  onAiSuggestGroup,
  busy,
  negate,
}: FailureAnalysisCardsProps) {
  if (groups.length === 0) {
    return (
      <div className="empty-state">
        <p>Chưa có công đoạn nào.</p>
        <p className="muted">Hãy tạo PFMEA trước, hoặc thêm công đoạn ở bước 1.</p>
      </div>
    );
  }

  /** Ghép câu tiêu chuẩn nghiêm trọng vào ô Ảnh hưởng + chấm điểm Mức NT theo rank. */
  const applySeverityRule = (fmId: string, current: string, rank: number) => {
    const rule = SEVERITY_RULES.find((r) => r.rank === rank);
    if (!rule) return;
    const base = current.trim();
    const already = base.includes(rule.text);
    const effect = already ? base : base ? `${base}\n→ ${rule.text}` : rule.text;
    onUpdateFmGroup(fmId, { effect, severity: rank });
  };

  return (
    <div className="fa-wrap">
      <p className="panel-hint">
        Mỗi <strong>hạng mục yêu cầu</strong> (đặt ở bước 1) ứng với một{" "}
        <strong>dạng hỏng hóc</strong> — là phủ định của yêu cầu. Sau khi mô tả{" "}
        <strong>Ảnh hưởng</strong>, ghép thêm một câu tiêu chuẩn để chấm{" "}
        <strong>Điểm (S)</strong> (severity) theo bảng AIAG-VDA. Một ảnh hưởng có thể có
        nhiều <strong>nguyên nhân</strong> — bấm <strong>+ Thêm nguyên nhân</strong>.
        Bấm <strong>✨ AI</strong> để gợi ý nội dung.
      </p>

      {groups.map((group) => {
        const groupBusy = busy.has(group.key);
        const fmSubGroups = subGroupByFm(group.rows);
        return (
          <section className="fa-group" key={group.key}>
            <div className="fa-group-head">
              <div className="fa-step-title">
                <span className="fa-step-name">{group.processStep}</span>
                {group.function && <span className="fa-step-fn">{group.function}</span>}
              </div>
              <button
                className="btn-ai"
                type="button"
                onClick={() => onAiSuggestGroup(group)}
                disabled={groupBusy}
                title="Dùng AI gợi ý nội dung cho tất cả dạng hỏng hóc của công đoạn này"
              >
                {groupBusy ? "Đang gợi ý…" : "✨ AI gợi ý cả công đoạn"}
              </button>
            </div>

            <div className="fa-table-wrap">
              <table className="fa-table">
                <thead>
                  <tr>
                    <th className="fa-col-req">Yêu cầu</th>
                    <th className="fa-col-fm">Dạng hỏng hóc (phủ định yêu cầu)</th>
                    <th className="fa-col-cl">Phân loại</th>
                    <th className="fa-col-ef">Ảnh hưởng</th>
                    <th className="fa-col-sev">Điểm (S)</th>
                    <th className="fa-col-ca">Nguyên nhân</th>
                    <th className="fa-col-ai"></th>
                  </tr>
                </thead>
                <tbody>
                  {fmSubGroups.map((causes) => {
                    const head = causes[0];
                    const span = causes.length;
                    const headBusy = busy.has(head.id);
                    return causes.map((row, ci) => {
                      const isHead = ci === 0;
                      const isLast = ci === span - 1;
                      return (
                        <tr
                          key={row.id}
                          className={busy.has(row.id) ? "fa-row-busy" : ""}
                        >
                          {isHead && (
                            <>
                              <td className="fa-col-req" rowSpan={span}>
                                <textarea
                                  rows={2}
                                  value={head.requirement}
                                  placeholder="Hạng mục yêu cầu"
                                  onChange={(e) =>
                                    onUpdateFmGroup(head.fmId, {
                                      requirement: e.target.value,
                                    })
                                  }
                                />
                              </td>
                              <td className="fa-col-fm" rowSpan={span}>
                                <textarea
                                  rows={2}
                                  value={head.failureMode}
                                  placeholder={
                                    head.requirement
                                      ? negate(head.requirement)
                                      : "VD: Mối hàn không đạt độ bền"
                                  }
                                  onChange={(e) =>
                                    onUpdateFmGroup(head.fmId, {
                                      failureMode: e.target.value,
                                    })
                                  }
                                />
                              </td>
                              <td className="fa-col-cl" rowSpan={span}>
                                <input
                                  value={head.classification}
                                  placeholder="–"
                                  maxLength={4}
                                  onChange={(e) =>
                                    onUpdateFmGroup(head.fmId, {
                                      classification: e.target.value,
                                    })
                                  }
                                />
                              </td>
                              <td className="fa-col-ef" rowSpan={span}>
                                <textarea
                                  rows={2}
                                  value={head.effect}
                                  placeholder="Ảnh hưởng tới khách hàng / quá trình"
                                  onChange={(e) =>
                                    onUpdateFmGroup(head.fmId, { effect: e.target.value })
                                  }
                                />
                                <select
                                  className="fa-sev-rule"
                                  value=""
                                  title="Ghép câu tiêu chuẩn mức độ nghiêm trọng (chấm điểm theo rank)"
                                  onChange={(e) => {
                                    const rank = Number(e.target.value);
                                    if (rank) applySeverityRule(head.fmId, head.effect, rank);
                                    e.target.value = "";
                                  }}
                                >
                                  <option value="">+ Ghép tiêu chí nghiêm trọng…</option>
                                  {SEVERITY_RULES.map((rule) => (
                                    <option key={rule.rank} value={rule.rank}>
                                      [{rule.rank}] {rule.category} — {rule.text}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="fa-col-sev" rowSpan={span}>
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={head.severity}
                                  onChange={(e) => {
                                    const n = Math.min(
                                      10,
                                      Math.max(1, Math.round(Number(e.target.value) || 1)),
                                    );
                                    onUpdateFmGroup(head.fmId, { severity: n });
                                  }}
                                />
                              </td>
                            </>
                          )}

                          <td className="fa-col-ca">
                            <div className="fa-cause-cell">
                              <textarea
                                rows={2}
                                value={row.cause}
                                placeholder="Nguyên nhân gốc tại hiện trường"
                                onChange={(e) =>
                                  onUpdateRow(row.id, { cause: e.target.value })
                                }
                              />
                              {span > 1 && (
                                <button
                                  className="icon-btn danger fa-cause-del"
                                  type="button"
                                  title="Xóa nguyên nhân này"
                                  onClick={() => onDeleteCause(row.id)}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            {isLast && (
                              <button
                                className="btn-secondary fa-add-cause"
                                type="button"
                                onClick={() => onAddCause(head.fmId)}
                              >
                                + Thêm nguyên nhân
                              </button>
                            )}
                          </td>

                          {isHead && (
                            <td className="fa-col-ai" rowSpan={span}>
                              <button
                                className="btn-ai-mini"
                                type="button"
                                onClick={() => onAiSuggestRow(head, group)}
                                disabled={headBusy}
                                title="Dùng AI gợi ý nội dung cho dạng hỏng hóc này từ yêu cầu"
                              >
                                {headBusy ? "…" : "✨ AI"}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    });
                  })}
                  {group.rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="muted" style={{ padding: "10px" }}>
                        Công đoạn này chưa có yêu cầu nào — thêm yêu cầu ở bước 1.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
