import type { PfmeaRow } from "../types";

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
  onAiSuggestRow: (row: PfmeaRow, group: StepGroup) => void;
  onAiSuggestGroup: (group: StepGroup) => void;
  busy: Set<string>;
  negate: (req: string) => string;
}

export function FailureAnalysisCards({
  groups,
  onUpdateRow,
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

  return (
    <div className="fa-wrap">
      <p className="panel-hint">
        Mỗi <strong>hạng mục yêu cầu</strong> (đặt ở bước 1) ứng với đúng một{" "}
        <strong>dạng hỏng hóc</strong> — là phủ định của yêu cầu. Thêm/bớt dạng hỏng
        hóc bằng cách thêm/bớt yêu cầu ở bước 1. Bấm <strong>✨ AI</strong> để gợi ý
        nội dung cho từng dòng hoặc cả công đoạn.
      </p>

      {groups.map((group) => {
        const groupBusy = busy.has(group.key);
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
                    <th className="fa-col-ca">Nguyên nhân</th>
                    <th className="fa-col-sev">Mức NT</th>
                    <th className="fa-col-ai"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row) => {
                    const rowBusy = busy.has(row.id);
                    return (
                      <tr key={row.id} className={rowBusy ? "fa-row-busy" : ""}>
                        <td className="fa-col-req">
                          <textarea
                            rows={2}
                            value={row.requirement}
                            placeholder="Hạng mục yêu cầu"
                            onChange={(e) =>
                              onUpdateRow(row.id, { requirement: e.target.value })
                            }
                          />
                        </td>
                        <td className="fa-col-fm">
                          <textarea
                            rows={2}
                            value={row.failureMode}
                            placeholder={
                              row.requirement
                                ? negate(row.requirement)
                                : "VD: Mối hàn không đạt độ bền"
                            }
                            onChange={(e) =>
                              onUpdateRow(row.id, { failureMode: e.target.value })
                            }
                          />
                        </td>
                        <td className="fa-col-cl">
                          <input
                            value={row.classification}
                            placeholder="–"
                            maxLength={4}
                            onChange={(e) =>
                              onUpdateRow(row.id, { classification: e.target.value })
                            }
                          />
                        </td>
                        <td className="fa-col-ef">
                          <textarea
                            rows={2}
                            value={row.effect}
                            placeholder="Ảnh hưởng tới khách hàng / quá trình"
                            onChange={(e) =>
                              onUpdateRow(row.id, { effect: e.target.value })
                            }
                          />
                        </td>
                        <td className="fa-col-ca">
                          <textarea
                            rows={2}
                            value={row.cause}
                            placeholder="Nguyên nhân gốc tại hiện trường"
                            onChange={(e) =>
                              onUpdateRow(row.id, { cause: e.target.value })
                            }
                          />
                        </td>
                        <td className="fa-col-sev">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={row.severity}
                            onChange={(e) => {
                              const n = Math.min(
                                10,
                                Math.max(1, Math.round(Number(e.target.value) || 1)),
                              );
                              onUpdateRow(row.id, { severity: n });
                            }}
                          />
                        </td>
                        <td className="fa-col-ai">
                          <button
                            className="btn-ai-mini"
                            type="button"
                            onClick={() => onAiSuggestRow(row, group)}
                            disabled={rowBusy}
                            title="Dùng AI gợi ý nội dung cho dòng này từ yêu cầu"
                          >
                            {rowBusy ? "…" : "✨ AI"}
                          </button>
                        </td>
                      </tr>
                    );
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
