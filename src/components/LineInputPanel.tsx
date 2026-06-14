import type { ChangeEvent } from "react";
import type { ProjectMeta } from "../types";

interface LineInputPanelProps {
  meta: ProjectMeta;
  onMetaChange: (meta: ProjectMeta) => void;
  lineText: string;
  onLineTextChange: (text: string) => void;
  onGenerate: () => void;
  onImportFile: (file: File) => void;
  loading: boolean;
  collapsible?: boolean;
  onCollapse?: () => void;
}

const SAMPLE = `1. Đưa chi tiết vào đồ gá
2. Lắp linh kiện
3. Siết vít
4. Kiểm tra`;

export function LineInputPanel({
  meta,
  onMetaChange,
  lineText,
  onLineTextChange,
  onGenerate,
  onImportFile,
  loading,
  collapsible,
  onCollapse,
}: LineInputPanelProps) {
  const update = (key: keyof ProjectMeta) => (e: ChangeEvent<HTMLInputElement>) =>
    onMetaChange({ ...meta, [key]: e.target.value });

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportFile(file);
    e.target.value = "";
  };

  return (
    <section className="panel input-panel-top">
      <div className="input-panel-head">
        <div>
          <h2 className="panel-title">Dây chuyền sản xuất</h2>
          <p className="panel-hint">
            Mô tả hoặc dán dây chuyền / bảng phân tích thời gian. AI sẽ chuyển mỗi
            bước thành một bản nháp PFMEA có cấu trúc.
          </p>
        </div>
        {collapsible && onCollapse && (
          <button className="btn-secondary" type="button" onClick={onCollapse}>
            Thu gọn ▴
          </button>
        )}
      </div>

      <div className="input-cols">
        <div className="field-grid">
          <label className="field">
            <span>Tên dự án</span>
            <input
              value={meta.projectName}
              onChange={update("projectName")}
              placeholder="VD: Lắp ráp hộp đựng găng UFB"
            />
          </label>
          <label className="field">
            <span>Trưởng nhóm FMEA</span>
            <input value={meta.fmeaLead} onChange={update("fmeaLead")} placeholder="VD: Tâm" />
          </label>
          <label className="field field-wide">
            <span>Phạm vi</span>
            <input
              value={meta.scope}
              onChange={update("scope")}
              placeholder="Xác định phạm vi (tùy chọn)"
            />
          </label>
          <label className="field field-wide">
            <span>Thành viên nhóm</span>
            <input
              value={meta.teamMembers}
              onChange={update("teamMembers")}
              placeholder="An, Bình, Chi, Dũng"
            />
          </label>
        </div>

        <label className="field field-steps">
          <span>Các bước công đoạn</span>
          <textarea
            className="line-textarea"
            value={lineText}
            onChange={(e) => onLineTextChange(e.target.value)}
            placeholder={SAMPLE}
            rows={8}
          />
        </label>
      </div>

      <div className="input-actions">
        <button
          className="btn-secondary"
          type="button"
          onClick={() => onLineTextChange(SAMPLE)}
          disabled={loading}
        >
          Tải mẫu
        </button>

        <label className="btn-secondary file-btn">
          Nhập tệp
          <input type="file" accept=".txt,.csv,.md" onChange={handleFile} hidden />
        </label>

        <button
          className="btn-primary generate-btn"
          type="button"
          onClick={onGenerate}
          disabled={loading || !lineText.trim()}
        >
          {loading ? "Đang tạo…" : "⚡ Tạo PFMEA"}
        </button>
      </div>
    </section>
  );
}
