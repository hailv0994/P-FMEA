import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { LineInputPanel } from "./components/LineInputPanel";
import { PfmeaTable } from "./components/PfmeaTable";
import { Stepper } from "./components/Stepper";
import { FailureAnalysisCards, type StepGroup } from "./components/FailureAnalysisCards";
import { ResultsView } from "./components/ResultsView";
import type { PfmeaRow, ProjectMeta, WizardStep } from "./types";
import { STEP_LABELS } from "./types";
import { generatePfmea, suggestForStep } from "./lib/generate";
import { hasGeminiKey } from "./lib/gemini";
import { makeId } from "./lib/rpn";
import { downloadCsv } from "./lib/csv";
import { exportToTemplate } from "./lib/excelExport";
import { ALL_COLUMNS, STEP_COLUMNS } from "./lib/columns";

const EMPTY_META: ProjectMeta = {
  projectName: "",
  scope: "",
  fmeaLead: "",
  teamMembers: "",
};

function blankRow(processStep = "", fn = "", requirement = ""): PfmeaRow {
  return {
    id: makeId(),
    processStep,
    function: fn,
    requirement,
    failureMode: "",
    effect: "",
    cause: "",
    severity: 1,
    classification: "",
    occurrence: 1,
    controlPrevention: "",
    controlDetection: "",
    detection: 1,
    rpn: 1,
    recommendedAction: "",
    responsible: "",
    targetDate: "",
    actionTaken: "",
    sevAfter: 1,
    occAfter: 1,
    detAfter: 1,
    rpnAfter: 1,
    status: "Open",
  };
}

export default function App() {
  const [meta, setMeta] = useState<ProjectMeta>(EMPTY_META);
  const [lineText, setLineText] = useState("");
  const [rows, setRows] = useState<PfmeaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const [activeStep, setActiveStep] = useState<WizardStep>(1);
  const [completed, setCompleted] = useState<Set<WizardStep>>(new Set());
  const [view, setView] = useState<"editor" | "results">("editor");
  const [suggestingKey, setSuggestingKey] = useState<string | null>(null);
  const [inputOpen, setInputOpen] = useState(true);
  const [showFullTable, setShowFullTable] = useState(false);

  const usingGemini = useMemo(() => hasGeminiKey(), []);

  const handleGenerate = async () => {
    setLoading(true);
    setNote(null);
    try {
      const result = await generatePfmea(lineText, meta);
      setRows(result.rows);
      setNote(result.note ?? null);
      if (result.rows.length > 0) {
        setInputOpen(false);
        setActiveStep(1);
      }
    } catch (err) {
      setNote(`Generation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPreset = (preset: { projectName: string; steps: string }) => {
    setLineText(preset.steps);
    setMeta((m) => ({ ...m, projectName: m.projectName || preset.projectName }));
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
        next.rpnAfter = next.sevAfter * next.occAfter * next.detAfter;
        return next;
      }),
    );
  };

  const deleteRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const insertAfter = (afterId: string, newRow: PfmeaRow) =>
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === afterId);
      if (idx === -1) return [...prev, newRow];
      return [...prev.slice(0, idx + 1), newRow, ...prev.slice(idx + 1)];
    });

  const addFailureModeAfter = (afterId: string) => {
    const source = rows.find((r) => r.id === afterId);
    if (!source) return;
    insertAfter(afterId, blankRow(source.processStep, source.function, source.requirement));
  };

  const addStep = () => setRows((prev) => [...prev, blankRow()]);

  // ----- Step 2 grouping + AI Suggest -----
  const groups: StepGroup[] = useMemo(() => {
    const map = new Map<string, StepGroup>();
    const order: string[] = [];
    rows.forEach((r) => {
      const key = r.processStep.trim().toLowerCase() || `__${r.id}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          processStep: r.processStep,
          function: r.function,
          requirement: r.requirement,
          rows: [],
        });
        order.push(key);
      }
      map.get(key)!.rows.push(r);
    });
    return order.map((k) => map.get(k)!);
  }, [rows]);

  const addFailureModeToGroup = (group: StepGroup) => {
    const last = group.rows[group.rows.length - 1];
    const blank = blankRow(group.processStep, group.function, group.requirement);
    if (last) insertAfter(last.id, blank);
    else setRows((prev) => [...prev, blank]);
  };

  const aiSuggest = async (group: StepGroup) => {
    setSuggestingKey(group.key);
    setNote(null);
    try {
      const existing = group.rows.map((r) => r.failureMode).filter(Boolean);
      const result = await suggestForStep({
        processStep: group.processStep,
        fn: group.function,
        requirement: group.requirement,
        existing,
        meta,
      });
      const last = group.rows[group.rows.length - 1];
      if (last) {
        setRows((prev) => {
          const idx = prev.findIndex((r) => r.id === last.id);
          if (idx === -1) return [...prev, ...result.rows];
          return [...prev.slice(0, idx + 1), ...result.rows, ...prev.slice(idx + 1)];
        });
      } else {
        setRows((prev) => [...prev, ...result.rows]);
      }
      if (result.note) setNote(result.note);
    } catch (err) {
      setNote(`AI Suggest failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSuggestingKey(null);
    }
  };

  const goToStep = (step: WizardStep) => {
    setView("editor");
    setActiveStep(step);
  };

  const next = () => {
    setCompleted((prev) => new Set(prev).add(activeStep));
    if (activeStep < 4) setActiveStep((s) => (s + 1) as WizardStep);
    else setView("results");
  };
  const prev = () => {
    if (activeStep > 1) setActiveStep((s) => (s - 1) as WizardStep);
  };

  const baseName = (meta.projectName || "pfmea").replace(/\s+/g, "_");
  const handleExportCsv = () => downloadCsv(rows, `${baseName}.csv`);
  const handleExportExcel = () => exportToTemplate(rows, `${baseName}.xlsx`);

  const hasRows = rows.length > 0;

  return (
    <div className="app">
      <Header
        usingGemini={usingGemini}
        projectName={meta.projectName}
        onResults={hasRows ? () => setView("results") : undefined}
        showingResults={view === "results"}
      />

      <main className="app-body-full">
        {/* Input section (collapsible once a PFMEA exists) */}
        {inputOpen ? (
          <LineInputPanel
            meta={meta}
            onMetaChange={setMeta}
            lineText={lineText}
            onLineTextChange={setLineText}
            onGenerate={handleGenerate}
            onImportFile={handleImportFile}
            onLoadPreset={handleLoadPreset}
            loading={loading}
            collapsible={hasRows}
            onCollapse={() => setInputOpen(false)}
          />
        ) : (
          <div className="input-collapsed">
            <span>
              <strong>{meta.projectName || "PFMEA chưa đặt tên"}</strong> · {rows.length}{" "}
              dạng hỏng hóc · {groups.length} công đoạn
            </span>
            <button className="btn-secondary" type="button" onClick={() => setInputOpen(true)}>
              Sửa đầu vào / Tạo lại
            </button>
          </div>
        )}

        {note && <div className="notice">{note}</div>}
        {loading && (
          <div className="notice loading">
            Đang tạo bản nháp PFMEA từ các bước công đoạn của bạn…
          </div>
        )}

        {view === "results" ? (
          <ResultsView
            rows={rows}
            onExportExcel={handleExportExcel}
            onExportCsv={handleExportCsv}
            onBack={() => setView("editor")}
          />
        ) : (
          hasRows && (
            <div className="wizard">
              <Stepper active={activeStep} completed={completed} onSelect={goToStep} />

              <div className="wizard-body">
                <div className="wizard-head">
                  <h2 className="panel-title">
                    {activeStep}. {STEP_LABELS[activeStep]}
                  </h2>
                  <div className="wizard-actions">
                    {activeStep === 1 && (
                      <button className="btn-secondary" type="button" onClick={addStep}>
                        + Thêm công đoạn
                      </button>
                    )}
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={prev}
                      disabled={activeStep === 1}
                    >
                      Quay lại
                    </button>
                    <button className="btn-primary" type="button" onClick={next}>
                      {activeStep === 4 ? "Xem kết quả" : "Tiếp theo"}
                    </button>
                  </div>
                </div>

                {activeStep === 2 ? (
                  <FailureAnalysisCards
                    groups={groups}
                    onUpdateRow={updateRow}
                    onDeleteRow={deleteRow}
                    onAddFailureMode={addFailureModeToGroup}
                    onAiSuggest={aiSuggest}
                    suggestingKey={suggestingKey}
                  />
                ) : (
                  <PfmeaTable
                    rows={rows}
                    columns={STEP_COLUMNS[activeStep as 1 | 3 | 4]}
                    onUpdateRow={updateRow}
                    onDeleteRow={deleteRow}
                    onAddFailureMode={addFailureModeAfter}
                  />
                )}
              </div>

              {/* Full editable sheet (like the bottom table in the demo) */}
              <div className="full-table">
                <button
                  className="full-table-toggle"
                  type="button"
                  onClick={() => setShowFullTable((v) => !v)}
                >
                  {showFullTable ? "▾" : "▸"} Bảng PFMEA đầy đủ ({ALL_COLUMNS.length} cột)
                </button>
                {showFullTable && (
                  <PfmeaTable
                    rows={rows}
                    columns={ALL_COLUMNS}
                    onUpdateRow={updateRow}
                    onDeleteRow={deleteRow}
                    onAddFailureMode={addFailureModeAfter}
                    compact
                  />
                )}
              </div>
            </div>
          )
        )}

        {!hasRows && !loading && inputOpen && (
          <div className="empty-state hint-card">
            <p className="muted">
              Mô tả dây chuyền sản xuất ở trên và bấm <strong>Tạo PFMEA</strong>{" "}
              để bắt đầu quy trình phân tích 4 bước.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
