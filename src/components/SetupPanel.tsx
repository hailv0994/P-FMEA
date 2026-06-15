import { useMemo } from "react";
import type { Catalog, CatStep } from "../lib/catalog";
import type { ProjectMeta } from "../types";

export interface Selection {
  groupId: string;
  productId: string;
  modelBaseId: string;
}

interface SetupPanelProps {
  catalog: Catalog;
  sel: Selection;
  onSelectGroup: (id: string) => void;
  onSelectProduct: (id: string) => void;
  onSelectModelBase: (id: string) => void;
  steps: CatStep[];
  onStepsChange: (steps: CatStep[]) => void;
  meta: ProjectMeta;
  onMetaChange: (m: ProjectMeta) => void;
  onGenerate: () => void;
  onOpenAdmin: () => void;
  loading: boolean;
  collapsible?: boolean;
  onCollapse?: () => void;
}

export function SetupPanel({
  catalog,
  sel,
  onSelectGroup,
  onSelectProduct,
  onSelectModelBase,
  steps,
  onStepsChange,
  meta,
  onMetaChange,
  onGenerate,
  onOpenAdmin,
  loading,
  collapsible,
  onCollapse,
}: SetupPanelProps) {
  const group = useMemo(
    () => catalog.groups.find((g) => g.id === sel.groupId),
    [catalog, sel.groupId],
  );
  const product = useMemo(
    () => group?.products.find((p) => p.id === sel.productId),
    [group, sel.productId],
  );
  const modelBase = useMemo(
    () => product?.modelBases.find((m) => m.id === sel.modelBaseId),
    [product, sel.modelBaseId],
  );

  const setStep = (id: string, name: string) =>
    onStepsChange(steps.map((s) => (s.id === id ? { ...s, name } : s)));
  const addStep = () =>
    onStepsChange([...steps, { id: `tmp-${Date.now()}-${Math.random()}`, name: "" }]);
  const delStep = (id: string) => onStepsChange(steps.filter((s) => s.id !== id));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    onStepsChange(next);
  };

  return (
    <section className="panel input-panel-top">
      <div className="input-panel-head">
        <div>
          <h2 className="panel-title">Chọn sản phẩm</h2>
          <p className="panel-hint">
            Chọn Nhóm → Sản phẩm → Model base để hiện khung công đoạn, rồi chỉnh
            sửa nếu cần và tạo PFMEA.
          </p>
        </div>
        <div className="head-actions">
          <button className="btn-secondary" type="button" onClick={onOpenAdmin}>
            ⚙ Quản trị danh mục
          </button>
          {collapsible && onCollapse && (
            <button className="btn-secondary" type="button" onClick={onCollapse}>
              Thu gọn ▴
            </button>
          )}
        </div>
      </div>

      <div className="select-grid">
        <label className="field">
          <span>Nhóm</span>
          <select value={sel.groupId} onChange={(e) => onSelectGroup(e.target.value)}>
            <option value="">— Chọn nhóm —</option>
            {catalog.groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Sản phẩm</span>
          <select
            value={sel.productId}
            onChange={(e) => onSelectProduct(e.target.value)}
            disabled={!group}
          >
            <option value="">{group ? "— Chọn sản phẩm —" : "Chọn nhóm trước"}</option>
            {group?.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Model base</span>
          <select
            value={sel.modelBaseId}
            onChange={(e) => onSelectModelBase(e.target.value)}
            disabled={!product}
          >
            <option value="">{product ? "— Chọn model base —" : "Chọn sản phẩm trước"}</option>
            {product?.modelBases.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Trưởng nhóm FMEA</span>
          <input
            value={meta.fmeaLead}
            onChange={(e) => onMetaChange({ ...meta, fmeaLead: e.target.value })}
            placeholder="VD: Tâm"
          />
        </label>
      </div>

      {modelBase ? (
        <div className="skeleton">
          <div className="skeleton-head">
            <h3>Khung công đoạn — {product?.name} / {modelBase.name}</h3>
            <span className="muted">{steps.length} công đoạn · có thể chỉnh sửa</span>
          </div>

          <ol className="step-list">
            {steps.map((s, i) => (
              <li key={s.id} className="step-item">
                <span className="step-no">{i + 1}</span>
                <input
                  className="step-input"
                  value={s.name}
                  placeholder="Tên công đoạn"
                  onChange={(e) => setStep(s.id, e.target.value)}
                />
                <div className="step-tools">
                  <button className="icon-btn" type="button" title="Lên" onClick={() => move(i, -1)} disabled={i === 0}>
                    ↑
                  </button>
                  <button className="icon-btn" type="button" title="Xuống" onClick={() => move(i, 1)} disabled={i === steps.length - 1}>
                    ↓
                  </button>
                  <button className="icon-btn danger" type="button" title="Xóa" onClick={() => delStep(s.id)}>
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ol>

          <div className="input-actions">
            <button className="btn-secondary" type="button" onClick={addStep} disabled={loading}>
              + Thêm công đoạn
            </button>
            <button
              className="btn-primary generate-btn"
              type="button"
              onClick={onGenerate}
              disabled={loading || steps.filter((s) => s.name.trim()).length === 0}
            >
              {loading ? "Đang tạo…" : "⚡ Tạo PFMEA"}
            </button>
          </div>
        </div>
      ) : (
        <p className="muted skeleton-hint">
          Chọn đủ Nhóm · Sản phẩm · Model base để hiện khung công đoạn. Chưa có
          dữ liệu? Mở <strong>Quản trị danh mục</strong> để nhập.
        </p>
      )}
    </section>
  );
}
