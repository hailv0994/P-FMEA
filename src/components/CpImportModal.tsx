import { useState } from "react";
import type { CpData, CpItem } from "../lib/cpParser";
import { autoMatchStep } from "../lib/cpParser";

export interface StepMapping {
  sheetName: string;
  items: CpItem[];
  /** Tên các công đoạn PFMEA sẽ nhận dữ liệu từ sheet này */
  targetSteps: string[];
}

interface Props {
  cpData: CpData;
  /** Tên công đoạn hiện có trong PFMEA (lấy từ rows) */
  pfmeaStepNames: string[];
  onConfirm: (mappings: StepMapping[]) => void;
  onClose: () => void;
}

export function CpImportModal({ cpData, pfmeaStepNames, onConfirm, onClose }: Props) {
  const [mappings, setMappings] = useState<StepMapping[]>(() =>
    cpData.sheets.map((sheet) => ({
      sheetName: sheet.sheetName,
      items: sheet.items,
      targetSteps: autoMatchStep(sheet.sheetName, pfmeaStepNames),
    })),
  );

  const toggleStep = (sheetIdx: number, stepName: string) => {
    setMappings((prev) =>
      prev.map((m, i) => {
        if (i !== sheetIdx) return m;
        const has = m.targetSteps.includes(stepName);
        return {
          ...m,
          targetSteps: has
            ? m.targetSteps.filter((s) => s !== stepName)
            : [...m.targetSteps, stepName],
        };
      }),
    );
  };

  const activeMappings = mappings.filter((m) => m.targetSteps.length > 0);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box cp-modal">
        <div className="modal-header">
          <h3>Ánh xạ CP → Công đoạn PFMEA</h3>
          <button className="icon-btn" type="button" onClick={onClose}>×</button>
        </div>

        <p className="muted cp-modal-hint">
          Tick vào công đoạn PFMEA tương ứng với mỗi sheet CP.
          Sau khi xác nhận, <strong>yêu cầu</strong> của công đoạn được thay thế toàn bộ và
          câu <strong>Phát hiện FM</strong> được tự động điền.
        </p>

        <div className="cp-map-list">
          {mappings.map((m, i) => (
            <div key={m.sheetName} className="cp-map-row">
              <div className="cp-sheet-info">
                <span className="cp-sheet-name">{m.sheetName}</span>
                <span className="cp-sheet-count">{m.items.length} hạng mục</span>
                {m.items.slice(0, 2).map((item, idx) => (
                  <span key={idx} className="cp-sheet-preview">{item.controlItem}</span>
                ))}
                {m.items.length > 2 && (
                  <span className="cp-sheet-preview muted">+{m.items.length - 2} hạng mục khác…</span>
                )}
              </div>
              <div className="cp-step-checks">
                <span className="cp-arrow">→</span>
                {pfmeaStepNames.map((step) => (
                  <label key={step} className="cp-step-check">
                    <input
                      type="checkbox"
                      checked={m.targetSteps.includes(step)}
                      onChange={() => toggleStep(i, step)}
                    />
                    <span>{step}</span>
                  </label>
                ))}
                {m.targetSteps.length === 0 && (
                  <span className="cp-no-match muted">— chưa chọn (bỏ qua)</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {activeMappings.length > 0 && (
          <div className="cp-summary">
            Sẽ cập nhật <strong>{activeMappings.reduce((n, m) => n + m.targetSteps.length, 0)}</strong> công đoạn
            với tổng <strong>{activeMappings.reduce((n, m) => n + m.items.length * m.targetSteps.length, 0)}</strong> hạng mục.
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" type="button" onClick={onClose}>Hủy</button>
          <button
            className="btn-primary"
            type="button"
            onClick={() => onConfirm(activeMappings)}
            disabled={activeMappings.length === 0}
          >
            Xác nhận import ({activeMappings.length} sheet)
          </button>
        </div>
      </div>
    </div>
  );
}
