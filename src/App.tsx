import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { LineInputPanel } from "./components/LineInputPanel";
import { PfmeaTable } from "./components/PfmeaTable";
import type { PfmeaRow, ProjectMeta } from "./types";
import { generatePfmea } from "./lib/generate";
import { hasGeminiKey } from "./lib/gemini";
import { makeId } from "./lib/rpn";
import { downloadCsv } from "./lib/csv";

const EMPTY_META: ProjectMeta = {
  projectName: "",
  scope: "",
  fmeaLead: "",
  teamMembers: "",
};

function blankRow(processStep = "", fn = ""): PfmeaRow {
  return {
    id: makeId(),
    processStep,
    function: fn,
    failureMode: "",
    effect: "",
    cause: "",
    currentControl: "",
    severity: 1,
    occurrence: 1,
    detection: 1,
    rpn: 1,
    recommendedAction: "",
    responsible: "",
    status: "Open",
  };
}

export default function App() {
  const [meta, setMeta] = useState<ProjectMeta>(EMPTY_META);
  const [lineText, setLineText] = useState("");
  const [rows, setRows] = useState<PfmeaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const usingGemini = useMemo(() => hasGeminiKey(), []);

  const handleGenerate = async () => {
    setLoading(true);
    setNote(null);
    try {
      const result = await generatePfmea(lineText, meta);
      setRows(result.rows);
      setNote(result.note ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setNote(`Generation failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setLineText(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  const updateRow = (id: string, patch: Partial<PfmeaRow>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...patch };
        next.rpn = next.severity * next.occurrence * next.detection;
        return next;
      }),
    );
  };

  const deleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Insert a blank failure-mode row right after the given row, inheriting its
  // process step + function (matches "add new failure mode manually").
  const addFailureMode = (afterId: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === afterId);
      if (idx === -1) return prev;
      const source = prev[idx];
      const inserted = blankRow(source.processStep, source.function);
      return [...prev.slice(0, idx + 1), inserted, ...prev.slice(idx + 1)];
    });
  };

  const addRow = () => setRows((prev) => [...prev, blankRow()]);

  const handleExport = () =>
    downloadCsv(rows, `${meta.projectName || "pfmea"}.csv`.replace(/\s+/g, "_"));

  return (
    <div className="app">
      <Header usingGemini={usingGemini} />

      <main className="app-body">
        <LineInputPanel
          meta={meta}
          onMetaChange={setMeta}
          lineText={lineText}
          onLineTextChange={setLineText}
          onGenerate={handleGenerate}
          onImportFile={handleImportFile}
          loading={loading}
        />

        <div className="table-area">
          {note && <div className="notice">{note}</div>}
          {loading && (
            <div className="notice loading">
              Generating PFMEA draft from your process steps…
            </div>
          )}
          <PfmeaTable
            rows={rows}
            onUpdateRow={updateRow}
            onDeleteRow={deleteRow}
            onAddFailureMode={addFailureMode}
            onAddRow={addRow}
            onExport={handleExport}
          />
        </div>
      </main>
    </div>
  );
}
