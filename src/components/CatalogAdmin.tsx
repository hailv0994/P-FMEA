import { useState, type ChangeEvent } from "react";
import {
  type Catalog,
  DEFAULT_CATALOG,
  clone,
  exportCatalog,
  parseCatalog,
  uid,
} from "../lib/catalog";

interface CatalogAdminProps {
  catalog: Catalog;
  onSave: (c: Catalog) => void;
  onClose: () => void;
}

export function CatalogAdmin({ catalog, onSave, onClose }: CatalogAdminProps) {
  const [draft, setDraft] = useState<Catalog>(() => clone(catalog));
  const [note, setNote] = useState<string | null>(null);

  const update = (fn: (d: Catalog) => void) =>
    setDraft((prev) => {
      const d = clone(prev);
      fn(d);
      return d;
    });

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setDraft(parseCatalog(String(reader.result ?? "")));
        setNote("Đã nhập danh mục từ tệp JSON.");
      } catch (err) {
        setNote(`Nhập thất bại: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="admin">
      <div className="admin-toolbar">
        <h2 className="panel-title">Quản trị danh mục</h2>
        <div className="admin-actions">
          <label className="btn-secondary file-btn">
            Nhập JSON
            <input type="file" accept=".json" hidden onChange={handleImport} />
          </label>
          <button className="btn-secondary" type="button" onClick={() => exportCatalog(draft)}>
            Xuất JSON
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              if (confirm("Khôi phục danh mục mặc định? Mọi chỉnh sửa chưa lưu sẽ mất.")) {
                setDraft(clone(DEFAULT_CATALOG));
              }
            }}
          >
            Khôi phục mặc định
          </button>
          <button className="btn-secondary" type="button" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              onSave(draft);
              setNote("Đã lưu danh mục vào hệ thống (localStorage).");
            }}
          >
            Lưu
          </button>
        </div>
      </div>

      <p className="panel-hint">
        Nhập Nhóm → Sản phẩm → Model base → công đoạn. Bấm <strong>Lưu</strong> để
        lưu vào máy này. Để chia sẻ cho cả nhóm: bấm <strong>Xuất JSON</strong> rồi
        gửi tệp cho người quản trị app commit làm danh mục mặc định.
      </p>
      {note && <div className="notice">{note}</div>}

      <div className="admin-tree">
        {draft.groups.map((g) => (
          <div className="adm-group" key={g.id}>
            <div className="adm-row">
              <span className="adm-tag">Nhóm</span>
              <input
                className="adm-input"
                value={g.name}
                onChange={(e) => update((d) => {
                  const gg = d.groups.find((x) => x.id === g.id);
                  if (gg) gg.name = e.target.value;
                })}
              />
              <button className="adm-btn" type="button" onClick={() => update((d) => {
                const gg = d.groups.find((x) => x.id === g.id);
                if (gg) gg.products.push({ id: uid("pr"), name: "Sản phẩm mới", modelBases: [] });
              })}>+ Sản phẩm</button>
              <button className="adm-btn danger" type="button" onClick={() => update((d) => {
                d.groups = d.groups.filter((x) => x.id !== g.id);
              })}>Xóa nhóm</button>
            </div>

            {g.products.map((p) => (
              <div className="adm-product" key={p.id}>
                <div className="adm-row">
                  <span className="adm-tag tag-p">Sản phẩm</span>
                  <input
                    className="adm-input"
                    value={p.name}
                    onChange={(e) => update((d) => {
                      const pp = d.groups.find((x) => x.id === g.id)?.products.find((x) => x.id === p.id);
                      if (pp) pp.name = e.target.value;
                    })}
                  />
                  <button className="adm-btn" type="button" onClick={() => update((d) => {
                    const pp = d.groups.find((x) => x.id === g.id)?.products.find((x) => x.id === p.id);
                    if (pp) pp.modelBases.push({ id: uid("mb"), name: "Base", steps: [] });
                  })}>+ Model base</button>
                  <button className="adm-btn danger" type="button" onClick={() => update((d) => {
                    const gg = d.groups.find((x) => x.id === g.id);
                    if (gg) gg.products = gg.products.filter((x) => x.id !== p.id);
                  })}>Xóa</button>
                </div>

                {p.modelBases.map((m) => (
                  <div className="adm-mb" key={m.id}>
                    <div className="adm-row">
                      <span className="adm-tag tag-m">Model base</span>
                      <input
                        className="adm-input"
                        value={m.name}
                        onChange={(e) => update((d) => {
                          const mm = d.groups.find((x) => x.id === g.id)?.products.find((x) => x.id === p.id)?.modelBases.find((x) => x.id === m.id);
                          if (mm) mm.name = e.target.value;
                        })}
                      />
                      <button className="adm-btn" type="button" onClick={() => update((d) => {
                        const mm = d.groups.find((x) => x.id === g.id)?.products.find((x) => x.id === p.id)?.modelBases.find((x) => x.id === m.id);
                        if (mm) mm.steps.push({ id: uid("st"), name: "" });
                      })}>+ Công đoạn</button>
                      <button className="adm-btn danger" type="button" onClick={() => update((d) => {
                        const pp = d.groups.find((x) => x.id === g.id)?.products.find((x) => x.id === p.id);
                        if (pp) pp.modelBases = pp.modelBases.filter((x) => x.id !== m.id);
                      })}>Xóa</button>
                    </div>

                    <ol className="adm-steps">
                      {m.steps.map((s) => (
                        <li key={s.id}>
                          <input
                            className="adm-input"
                            value={s.name}
                            placeholder="Tên công đoạn"
                            onChange={(e) => update((d) => {
                              const ss = d.groups.find((x) => x.id === g.id)?.products.find((x) => x.id === p.id)?.modelBases.find((x) => x.id === m.id)?.steps.find((x) => x.id === s.id);
                              if (ss) ss.name = e.target.value;
                            })}
                          />
                          <button className="adm-btn danger" type="button" onClick={() => update((d) => {
                            const mm = d.groups.find((x) => x.id === g.id)?.products.find((x) => x.id === p.id)?.modelBases.find((x) => x.id === m.id);
                            if (mm) mm.steps = mm.steps.filter((x) => x.id !== s.id);
                          })}>×</button>
                        </li>
                      ))}
                      {m.steps.length === 0 && <li className="muted">Chưa có công đoạn — bấm “+ Công đoạn”.</li>}
                    </ol>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}

        <button className="btn-secondary" type="button" onClick={() => update((d) => {
          d.groups.push({ id: uid("gr"), name: "Nhóm mới", products: [] });
        })}>+ Thêm nhóm</button>
      </div>
    </div>
  );
}
