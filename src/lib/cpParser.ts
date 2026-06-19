/**
 * Parser cho file Control Plan (CP) / Inspection Standard (IS) định dạng xlsx.
 * Dùng fflate (đã có sẵn trong dự án) để unzip, sau đó parse XML thủ công.
 *
 * Cấu trúc CP Astemo (G823):
 *   - Mỗi sheet = 1 công đoạn
 *   - Header tại row 24-25 (0-based), dữ liệu bắt đầu từ row 26
 *   - Phần "Quản lý đặc tính chất lượng" (Quality characteristics):
 *       col 1  = №
 *       col 6  = Hạng mục quản lý (Control Item) → thành Yêu cầu trong PFMEA
 *       col 14 = Giá trị tiêu chuẩn (Spec value)  → thành nội dung Yêu cầu
 *       col 21 = Phương pháp xác nhận (Check Method) → câu phát hiện FM
 *       col 27 = Tần suất xác nhận (Check Frequency)  → câu phát hiện FM
 */

import { unzipSync, strFromU8 } from "fflate";

export interface CpItem {
  /** Hạng mục quản lý — tiếng Việt only */
  controlItem: string;
  /** Giá trị tiêu chuẩn — tiếng Việt only */
  specValue: string;
  /** Phương pháp xác nhận */
  checkMethod: string;
  /** Tần suất xác nhận */
  checkFrequency: string;
  /**
   * Câu tự sinh điền vào "Phát hiện dạng hỏng hóc":
   * "Kiểm tra [item] bằng [method] với tần suất [frequency]"
   */
  detectionSentence: string;
  /** Yêu cầu dùng trong PFMEA = specValue nếu có, không thì controlItem */
  requirement: string;
}

export interface CpSheet {
  sheetName: string;
  items: CpItem[];
}

export interface CpData {
  sheets: CpSheet[];
}

// 0-based column indices (Quality characteristics section)
const C_NUM = 1;
const C_ITEM = 6;
const C_SPEC = 14;
const C_METHOD = 21;
const C_FREQ = 27;
const DATA_ROW_START = 26; // Excel row 27

/** Lấy dòng tiếng Việt đầu tiên từ chuỗi song ngữ (Việt / English) */
function viOnly(s: string): string {
  if (!s) return "";
  // Bilingual text dùng "\n" ngăn cách hai ngôn ngữ
  return s.split("\n")[0].trim();
}

function colLettersToIndex(letters: string): number {
  let n = 0;
  for (const c of letters.toUpperCase()) n = n * 26 + (c.charCodeAt(0) - 64);
  return n - 1; // 0-based
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#10;/g, "\n")
    .replace(/&#13;/g, "");
}

function parseSharedStrings(bytes?: Uint8Array): string[] {
  if (!bytes) return [];
  const xml = strFromU8(bytes);
  const strings: string[] = [];
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = siRe.exec(xml)) !== null) {
    const si = m[1];
    const parts: string[] = [];
    const tRe = /<t(?:\s[^>]*)?>([^<]*)<\/t>/g;
    let tm;
    while ((tm = tRe.exec(si)) !== null) {
      parts.push(decodeXmlEntities(tm[1]));
    }
    strings.push(parts.join(""));
  }
  return strings;
}

interface SheetInfo {
  name: string;
  file: string;
}

function parseWorkbookSheets(wbBytes?: Uint8Array, relsBytes?: Uint8Array): SheetInfo[] {
  if (!wbBytes || !relsBytes) return [];
  const wbXml = strFromU8(wbBytes);
  const relsXml = strFromU8(relsBytes);

  const relsMap = new Map<string, string>();
  const relRe = /<Relationship[^>]*\bId="([^"]+)"[^>]*\bTarget="([^"]+)"/g;
  let m;
  while ((m = relRe.exec(relsXml)) !== null) {
    const file = m[2].replace(/^.*worksheets\//, "");
    relsMap.set(m[1], file);
  }

  const sheets: SheetInfo[] = [];
  const shRe = /<sheet\s[^>]*\bname="([^"]+)"[^>]*\br:id="([^"]+)"/g;
  while ((m = shRe.exec(wbXml)) !== null) {
    const file = relsMap.get(m[2]);
    if (file) sheets.push({ name: decodeXmlEntities(m[1]), file });
  }
  return sheets;
}

function parseWorksheetCells(bytes: Uint8Array, shared: string[]): Map<number, Map<number, string>> {
  const xml = strFromU8(bytes);
  const result = new Map<number, Map<number, string>>();

  const rowRe = /<row\b[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let rm;
  while ((rm = rowRe.exec(xml)) !== null) {
    const rowIdx = parseInt(rm[1]) - 1;
    const rowXml = rm[2];
    const colMap = new Map<number, string>();

    const cellRe = /<c\b[^>]*\br="([A-Z]+)\d+"(?:[^>]*\bt="([^"]*)")?[^>]*>([\s\S]*?)<\/c>/g;
    let cm;
    while ((cm = cellRe.exec(rowXml)) !== null) {
      const colIdx = colLettersToIndex(cm[1]);
      const cellType = cm[2] || "n";
      const cellXml = cm[3];
      let value = "";

      if (cellType === "s") {
        const vMatch = /<v>(\d+)<\/v>/.exec(cellXml);
        if (vMatch) value = shared[parseInt(vMatch[1])] ?? "";
      } else if (cellType === "inlineStr") {
        const tMatch = /<t[^>]*>([^<]*)<\/t>/.exec(cellXml);
        if (tMatch) value = decodeXmlEntities(tMatch[1]);
      } else {
        const vMatch = /<v>([^<]+)<\/v>/.exec(cellXml);
        if (vMatch) value = vMatch[1];
      }

      if (value !== "") colMap.set(colIdx, value);
    }
    if (colMap.size > 0) result.set(rowIdx, colMap);
  }
  return result;
}

function extractCpItems(data: Map<number, Map<number, string>>): CpItem[] {
  const items: CpItem[] = [];
  for (const [rowIdx, row] of data.entries()) {
    if (rowIdx < DATA_ROW_START) continue;
    // Dòng dữ liệu hợp lệ phải có cả № và Hạng mục quản lý
    const numVal = row.get(C_NUM);
    const rawItem = row.get(C_ITEM);
    if (!numVal || !rawItem) continue;

    const controlItem = viOnly(rawItem);
    if (!controlItem) continue;

    const specValue = viOnly(row.get(C_SPEC) ?? "");
    const checkMethod = viOnly(row.get(C_METHOD) ?? "");
    const checkFreq = viOnly(row.get(C_FREQ) ?? "");

    // Câu phát hiện FM
    let detectionSentence = "";
    if (checkMethod) {
      const itemLc = controlItem.charAt(0).toLowerCase() + controlItem.slice(1);
      detectionSentence = `Kiểm tra ${itemLc} bằng ${checkMethod}`;
      if (checkFreq) detectionSentence += ` với tần suất ${checkFreq}`;
    }

    // Yêu cầu PFMEA = specValue nếu có, không thì controlItem
    const requirement = specValue || controlItem;

    items.push({ controlItem, specValue, checkMethod, checkFrequency: checkFreq, detectionSentence, requirement });
  }
  return items;
}

/** Parse file xlsx CP/IS → CpData */
export async function parseCpXlsx(buffer: ArrayBuffer): Promise<CpData> {
  const bytes = new Uint8Array(buffer);
  const files = unzipSync(bytes);

  const shared = parseSharedStrings(files["xl/sharedStrings.xml"]);
  const sheetInfos = parseWorkbookSheets(
    files["xl/workbook.xml"],
    files["xl/_rels/workbook.xml.rels"],
  );

  const sheets: CpSheet[] = [];
  for (const info of sheetInfos) {
    const wsBytes = files[`xl/worksheets/${info.file}`];
    if (!wsBytes) continue;
    const data = parseWorksheetCells(wsBytes, shared);
    const items = extractCpItems(data);
    if (items.length > 0) sheets.push({ sheetName: info.name, items });
  }

  return { sheets };
}

/** Chuẩn hóa tên công đoạn để so sánh mờ:
 *  bỏ số thứ tự, lowercase, bỏ dấu tiếng Việt, bỏ phần sau dấu +. */
export function normalizeStepName(s: string): string {
  return s
    .toLowerCase()
    .replace(/^\d+[\.\s]+/, "")
    .replace(/\+.*$/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tự động khớp 1 tên sheet CP với danh sách tên công đoạn PFMEA.
 *  Trả về mảng tên khớp (thường là 1, trừ sheet gộp). */
export function autoMatchStep(sheetName: string, pfmeaStepNames: string[]): string[] {
  const norm = normalizeStepName(sheetName);
  // 1. Khớp chính xác (sau chuẩn hóa)
  const exact = pfmeaStepNames.filter((s) => normalizeStepName(s) === norm);
  if (exact.length > 0) return exact;
  // 2. Khớp chứa (norm ⊇ step hoặc step ⊇ norm)
  const partial = pfmeaStepNames.filter((s) => {
    const sn = normalizeStepName(s);
    return norm.includes(sn) || sn.includes(norm);
  });
  return partial;
}
