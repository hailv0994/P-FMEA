/**
 * Danh mục Nhóm → Sản phẩm → Model base → Khung công đoạn.
 * Hải (admin) nhập danh mục, lưu vào localStorage; có thể Xuất/Nhập JSON để chia
 * sẻ cho cả nhóm TECH (xuất JSON rồi commit vào app làm danh mục mặc định).
 * Khung công đoạn gắn ở cấp Model base.
 */

export interface CatStep {
  id: string;
  name: string;
  /** Chức năng của công đoạn (tùy chọn — lưu để dùng lại). */
  fn?: string;
  /** Các hạng mục yêu cầu của công đoạn (mỗi yêu cầu → 1 dạng hỏng hóc). */
  requirements?: string[];
}
export interface ModelBase {
  id: string;
  name: string;
  steps: CatStep[];
}
export interface Line {
  id: string;
  name: string;
  modelBases: ModelBase[];
}
export interface Product {
  id: string;
  name: string;
  lines: Line[];
}
export interface Group {
  id: string;
  name: string;
  products: Product[];
}
export interface Catalog {
  version: number;
  groups: Group[];
}

const STORAGE_KEY = "pfmea-catalog-v2";

let seq = 0;
export function uid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  seq += 1;
  return `${prefix}-${Date.now()}-${seq}`;
}

function step(name: string): CatStep {
  return { id: uid("st"), name };
}
function base(name: string, steps: string[]): ModelBase {
  return { id: uid("mb"), name, steps: steps.map(step) };
}
function line(name: string, modelBases: ModelBase[]): Line {
  return { id: uid("ln"), name, modelBases };
}

/** Danh mục mặc định — seed sẵn nhóm PRO2 (Astemo) theo CLAUDE.md. */
export const DEFAULT_CATALOG: Catalog = {
  version: 2,
  groups: [
    { id: uid("gr"), name: "PRO1", products: [] },
    {
      id: uid("gr"),
      name: "PRO2",
      products: [
        {
          id: uid("pr"),
          name: "Fork Pipe",
          lines: [
            line("Dây chuyền chính", [
              base("Base", [
                "Tiện Fork Pipe",
                "Khoan lỗ thoát dầu",
                "Mài bề mặt trượt",
                "Mạ Ni-Cr cứng",
                "Đánh bóng",
              ]),
            ]),
          ],
        },
        {
          id: uid("pr"),
          name: "Rod",
          lines: [
            line("Dây chuyền chính", [
              base("Base", [
                "Tiện Rod",
                "Cán ren",
                "Mạ Ni-Cr cứng / Cr trang trí",
                "Đánh bóng",
              ]),
            ]),
          ],
        },
        {
          id: uid("pr"),
          name: "Damper Case Comp",
          lines: [
            line("Dây chuyền hàn", [
              base("Base", [
                "Hàn spot Damper Case",
                "Hàn project",
                "Hàn condenser",
                "Hàn seam",
                "Hàn MAG",
                "Kiểm tra độ bền & độ kín mối hàn",
              ]),
            ]),
          ],
        },
      ],
    },
    { id: uid("gr"), name: "PRO3", products: [] },
    { id: uid("gr"), name: "PA", products: [] },
    { id: uid("gr"), name: "ASSY", products: [] },
  ],
};

export function loadCatalog(): Catalog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Catalog;
      if (parsed && Array.isArray(parsed.groups)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return clone(DEFAULT_CATALOG);
}

export function saveCatalog(c: Catalog): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* ignore quota errors */
  }
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function exportCatalog(c: Catalog): void {
  const blob = new Blob([JSON.stringify(c, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pfmea-catalog.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCatalog(text: string): Catalog {
  const parsed = JSON.parse(text) as Catalog;
  if (!parsed || !Array.isArray(parsed.groups)) throw new Error("Tệp danh mục không hợp lệ");
  return parsed;
}
