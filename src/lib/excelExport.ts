import { unzipSync, zipSync, strToU8 } from "fflate";
import { TEMPLATE_XLSX_BASE64 } from "./templateXlsx";
import type { PfmeaRow } from "../types";

/**
 * Exports the PFMEA into the EXACT print template (FORMAT_PFMEA.xlsx):
 * - keeps the template's column widths, fonts, colours, borders and A4
 *   landscape print setup untouched (we reuse each cell's original style id);
 * - one worksheet = one printed A4 page (max 10 data rows = the form capacity,
 *   broken earlier when content is tall);
 * - column A merges across consecutive failure modes of the same process step;
 * - only ROW HEIGHTS are adjusted to fit each row's content.
 */

const COLS = "ABCDEFGHIJKLMNOPQRS".split(""); // A..S (19 columns)
const NUMERIC = new Set(["D", "H", "K", "L", "P", "Q", "R", "S"]);
const MAX_ROWS_PER_PAGE = 10;
const HEIGHT_BUDGET = 1044; // ≈ template's 10 × 104.4pt data area
const DATA_START_ROW = 10;

// approx column widths (chars) for row-height estimation
const COL_WIDTH: Record<string, number> = {
  A: 35, B: 25, C: 32, D: 8, E: 8, F: 24, G: 8, H: 7, I: 34,
  J: 40, K: 7, L: 7, M: 35, N: 14, O: 14, P: 8, Q: 7, R: 7, S: 5,
};

const NS = {
  ws: "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
};

function decodeBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "&#10;");
}

/** Combined column-A text: process step + function + requirement (3 lines). */
function colAText(r: PfmeaRow): string {
  const parts = [r.processStep.trim(), r.function.trim()];
  if (r.requirement.trim()) parts.push(`Yêu cầu: ${r.requirement.trim()}`);
  return parts.filter(Boolean).join("\n");
}

function cellValue(r: PfmeaRow, col: string): string {
  switch (col) {
    case "A": return colAText(r);
    case "B": return r.failureMode;
    case "C": return r.effect;
    case "D": return String(r.severity);
    case "E": return r.classification;
    case "F": return r.cause;
    case "G": return ""; // Phản ánh lỗi quá khứ — not tracked
    case "H": return String(r.occurrence);
    case "I": return r.controlPrevention;
    case "J": return r.controlDetection;
    case "K": return String(r.detection);
    case "L": return String(r.rpn);
    case "M": return r.recommendedAction;
    case "N": return r.targetDate ? `${r.responsible} - ${r.targetDate}` : r.responsible;
    case "O": return r.actionTaken;
    case "P": return String(r.sevAfter);
    case "Q": return String(r.occAfter);
    case "R": return String(r.detAfter);
    case "S": return String(r.rpnAfter);
    default: return "";
  }
}

function estimateHeight(r: PfmeaRow): number {
  let maxLines = 1;
  for (const col of COLS) {
    const text = cellValue(r, col);
    if (!text) continue;
    const per = Math.max(4, COL_WIDTH[col] - 1);
    const lines = text
      .split("\n")
      .reduce((sum, seg) => sum + Math.max(1, Math.ceil(seg.length / per)), 0);
    if (lines > maxLines) maxLines = lines;
  }
  return Math.min(320, Math.max(20, maxLines * 14 + 6));
}

/** Split rows into pages (≤10 rows, broken earlier by height budget). */
function paginate(rows: PfmeaRow[]): { row: PfmeaRow; height: number }[][] {
  const pages: { row: PfmeaRow; height: number }[][] = [];
  let page: { row: PfmeaRow; height: number }[] = [];
  let used = 0;
  for (const row of rows) {
    const height = estimateHeight(row);
    if (page.length >= MAX_ROWS_PER_PAGE || (page.length > 0 && used + height > HEIGHT_BUDGET)) {
      pages.push(page);
      page = [];
      used = 0;
    }
    page.push({ row, height });
    used += height;
  }
  if (page.length) pages.push(page);
  return pages.length ? pages : [[]];
}

interface SheetParts {
  head: string; // up to and including <sheetData>
  headerRows: string; // rows 1..9 verbatim
  dataStyles: Record<string, string>[]; // per template row (10..19): col -> style id
  footerRow: string; // row 20 string (template)
  baseMerges: string; // the original header mergeCell elements (without wrapper)
  tailAfterMerges: string; // phoneticPr ... pageSetup etc (cleaned)
}

function parseTemplate(sheetXml: string): SheetParts {
  const sdStart = sheetXml.indexOf("<sheetData");
  const sdOpenEnd = sheetXml.indexOf(">", sdStart) + 1;
  const sdClose = sheetXml.indexOf("</sheetData>");
  const head = sheetXml.slice(0, sdOpenEnd);
  const rowsXml = sheetXml.slice(sdOpenEnd, sdClose);
  let tail = sheetXml.slice(sdClose + "</sheetData>".length);

  // collect rows
  const rowMatches = [...rowsXml.matchAll(/<row r="(\d+)"[^>]*>.*?<\/row>|<row r="(\d+)"[^>]*\/>/gs)];
  const rowByNum: Record<number, string> = {};
  for (const m of rowMatches) {
    const num = Number(m[1] ?? m[2]);
    rowByNum[num] = m[0];
  }

  let headerRows = "";
  for (let n = 1; n <= 9; n++) if (rowByNum[n]) headerRows += rowByNum[n];

  const dataStyles: Record<string, string>[] = [];
  for (let n = DATA_START_ROW; n < DATA_START_ROW + MAX_ROWS_PER_PAGE; n++) {
    const rowStr = rowByNum[n] || "";
    const map: Record<string, string> = {};
    for (const c of rowStr.matchAll(/<c r="([A-S])\d+"\s+s="(\d+)"/g)) {
      map[c[1]] = c[2];
    }
    dataStyles.push(map);
  }

  const footerRow = rowByNum[20] || "";

  // extract original header merges
  const mergeBlock = tail.match(/<mergeCells count="\d+">(.*?)<\/mergeCells>/s);
  const baseMerges = mergeBlock ? mergeBlock[1] : "";
  // drop the mergeCells block, the drawing ref, and the pageSetup r:id
  tail = tail
    .replace(/<mergeCells count="\d+">.*?<\/mergeCells>/s, "{{MERGES}}")
    .replace(/<drawing[^>]*\/>/g, "")
    .replace(/(<pageSetup[^>]*?)\s+r:id="[^"]*"/g, "$1");

  return { head, headerRows, dataStyles, footerRow, baseMerges, tailAfterMerges: tail };
}

function renderDataRow(
  rowNum: number,
  styleMap: Record<string, string>,
  r: PfmeaRow,
  height: number,
  skipA: boolean,
): string {
  let cells = "";
  for (const col of COLS) {
    const s = styleMap[col];
    const sAttr = s ? ` s="${s}"` : "";
    const ref = `${col}${rowNum}`;
    if (col === "A" && skipA) {
      cells += `<c r="${ref}"${sAttr}/>`; // merged-away cell keeps style, no value
      continue;
    }
    const val = cellValue(r, col);
    if (val === "") {
      cells += `<c r="${ref}"${sAttr}/>`;
    } else if (NUMERIC.has(col)) {
      cells += `<c r="${ref}"${sAttr}><v>${esc(val)}</v></c>`;
    } else {
      cells += `<c r="${ref}"${sAttr} t="inlineStr"><is><t xml:space="preserve">${esc(val)}</t></is></c>`;
    }
  }
  return `<row r="${rowNum}" ht="${height.toFixed(1)}" customHeight="1">${cells}</row>`;
}

function shiftRow(rowStr: string, from: number, to: number): string {
  return rowStr
    .replace(new RegExp(`<row r="${from}"`), `<row r="${to}"`)
    .replace(new RegExp(`(<c r="[A-Z]+)${from}"`, "g"), `$1${to}"`);
}

function buildSheet(
  parts: SheetParts,
  page: { row: PfmeaRow; height: number }[],
  pageNo: number,
  totalPages: number,
): string {
  // header rows, with page number injected into R2
  let headerRows = parts.headerRows.replace(
    /<c r="R2"[^>]*?>.*?<\/c>|<c r="R2"[^>]*?\/>/s,
    `<c r="R2" s="4" t="inlineStr"><is><t xml:space="preserve">Trang ${pageNo}/${totalPages}</t></is></c>`,
  );

  // data rows + column-A merges for same-step runs
  let dataRows = "";
  const aMerges: string[] = [];
  let runStart = 0;
  const keyOf = (r: PfmeaRow) => r.processStep.trim().toLowerCase();

  for (let i = 0; i < page.length; i++) {
    const rowNum = DATA_START_ROW + i;
    const { row, height } = page[i];
    const sameAsPrev =
      i > 0 && keyOf(row) !== "" && keyOf(row) === keyOf(page[i - 1].row);
    const skipA = sameAsPrev;
    dataRows += renderDataRow(rowNum, parts.dataStyles[i] || parts.dataStyles[0], row, height, skipA);

    if (!sameAsPrev) runStart = i;
    const isRunEnd =
      i === page.length - 1 || keyOf(page[i + 1].row) !== keyOf(row) || !keyOf(row);
    if (isRunEnd && i > runStart && keyOf(row)) {
      aMerges.push(`<mergeCell ref="A${DATA_START_ROW + runStart}:A${rowNum}"/>`);
    }
  }

  const footerRowNum = DATA_START_ROW + page.length;
  const footer = parts.footerRow ? shiftRow(parts.footerRow, 20, footerRowNum) : "";

  const allMerges = parts.baseMerges + aMerges.join("");
  const mergeCount = (allMerges.match(/<mergeCell /g) || []).length;
  const mergesXml = mergeCount
    ? `<mergeCells count="${mergeCount}">${allMerges}</mergeCells>`
    : "";

  const head = parts.head.replace(
    /<dimension ref="[^"]*"\/>/,
    `<dimension ref="A1:S${footerRowNum}"/>`,
  );
  const tail = parts.tailAfterMerges.replace("{{MERGES}}", mergesXml);

  return head + headerRows + dataRows + footer + "</sheetData>" + tail;
}

function buildWorkbookXml(n: number, lastRows: number[]): string {
  const sheets = Array.from({ length: n }, (_, i) =>
    `<sheet name="Trang ${i + 1}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
  ).join("");
  const names = Array.from({ length: n }, (_, i) =>
    `<definedName name="_xlnm.Print_Area" localSheetId="${i}">'Trang ${i + 1}'!$A$1:$S$${lastRows[i]}</definedName>`,
  ).join("");
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets>${sheets}</sheets><definedNames>${names}</definedNames></workbook>`
  );
}

function buildWorkbookRels(n: number): string {
  const sheetRels = Array.from({ length: n }, (_, i) =>
    `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
  ).join("");
  const extra =
    `<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `<Relationship Id="rId${n + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>` +
    `<Relationship Id="rId${n + 3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>`;
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRels}${extra}</Relationships>`
  );
}

function buildContentTypes(n: number): string {
  const overrides = Array.from({ length: n }, (_, i) =>
    `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="${NS.ws}"/>`,
  ).join("");
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    overrides +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    `<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>` +
    `<Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>` +
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` +
    `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>` +
    `</Types>`
  );
}

export function exportToTemplate(rows: PfmeaRow[], filename = "PFMEA.xlsx"): void {
  const zipFiles = unzipSync(decodeBase64(TEMPLATE_XLSX_BASE64));
  const dec = new TextDecoder();
  const sheetXml = dec.decode(zipFiles["xl/worksheets/sheet1.xml"]);
  const parts = parseTemplate(sheetXml);

  const pages = paginate(rows);
  const out: Record<string, Uint8Array> = {};

  // keep shared parts verbatim
  for (const keep of [
    "_rels/.rels",
    "docProps/app.xml",
    "docProps/core.xml",
    "xl/styles.xml",
    "xl/sharedStrings.xml",
    "xl/theme/theme1.xml",
  ]) {
    if (zipFiles[keep]) out[keep] = zipFiles[keep];
  }

  const lastRows: number[] = [];
  pages.forEach((page, i) => {
    const xml = buildSheet(parts, page, i + 1, pages.length);
    out[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(xml);
    lastRows.push(DATA_START_ROW + page.length);
  });

  out["xl/workbook.xml"] = strToU8(buildWorkbookXml(pages.length, lastRows));
  out["xl/_rels/workbook.xml.rels"] = strToU8(buildWorkbookRels(pages.length));
  out["[Content_Types].xml"] = strToU8(buildContentTypes(pages.length));

  const zipped = zipSync(out);
  const blob = new Blob([zipped as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
