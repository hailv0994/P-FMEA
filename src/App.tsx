import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { SetupPanel, type Selection } from "./components/SetupPanel";
import { CatalogAdmin } from "./components/CatalogAdmin";
import { PfmeaTable } from "./components/PfmeaTable";
import { Stepper } from "./components/Stepper";
import { FailureAnalysisCards, type StepGroup } from "./components/FailureAnalysisCards";
import { ResultsView } from "./components/ResultsView";
import { StepStructureEditor } from "./components/StepStructureEditor";
import type { PfmeaRow, ProjectMeta, WizardStep } from "./types";
import { STEP_LABELS } from "./types";
import { generatePfmea, suggestRow } from "./lib/generate";
import {
  negateRequirement,
  analyzeRequirementFallback,
  generateFallback,
} from "./lib/fallbackGenerator";
import { hasGeminiKey } from "./lib/gemini";
import { makeId, toPfmeaRow } from "./lib/rpn";
import { downloadCsv } from "./lib/csv";
import { exportToTemplate } from "./lib/excelExport";
import { ALL_COLUMNS, STEP_COLUMNS } from "./lib/columns";
import {
  type Catalog,
  type CatStep,
  loadCatalog,
  saveCatalog,
  clone,
  uid,
} from "./lib/catalog";

const EMPTY_META: ProjectMeta = { projectName: "", scope: "", fmeaLead: "", teamMembers: "" };
const EMPTY_SEL: Selection = { groupId: "", productId: "", lineId: "", modelBaseId: "" };

function blankRow(processStep = "", fn = "", requirement = ""): PfmeaRow {
  return {
    id: makeId(),
    processStep, function: fn, requirement,
    failureMode: "", effect: "", cause: "",
    severity: 1, classification: "", occurrence: 1,
    controlPrevention: "", controlDetection: "", detection: 1, rpn: 1,
    recommendedAction: "", responsible: "", targetDate: "", actionTaken: "",
    sevAfter: 1, occAfter: 1, detAfter: 1, rpnAfter: 1, status: "Open",
  };
}

export default function App() {
  const [catalog, setCatalog] = useState<Catalog>(() => loadCatalog());
  const [sel, setSel] = useState<Selection>(EMPTY_SEL);
  const [workSteps, setWorkSteps] = useState<CatStep[]>([]);

  const [meta, setMeta] = useState<ProjectMeta>(EMPTY_META);
  const [rows, setRows] = useState<PfmeaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const [activeStep, setActiveStep] = useState<WizardStep>(1);
  const [completed, setCompleted] = useState<Set<WizardStep>>(new Set());
  const [view, setView] = useState<"editor" | "results" | "admin">("editor");
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [inputOpen, setInputOpen] = useState(true);
  const [showFullTable, setShowFullTable] = useState(false);

  const usingGemini = useMemo(() => hasGeminiKey(), []);

  // ----- catalog selection (cascading) -----
  const findGroup = (id: string) => catalog.groups.find((g) => g.id === id);
  const findProduct = (gid: string, pid: string) =>
    findGroup(gid)?.products.find((p) => p.id === pid);
  const findLine = (gid: string, pid: string, lid: string) =>
    findProduct(gid, pid)?.lines.find((l) => l.id === lid);
  const findModelBase = (gid: string, pid: string, lid: string, mid: string) =>
    findLine(gid, pid, lid)?.modelBases.find((m) => m.id === mid);

  const selectGroup = (id: string) => {
    setSel({ groupId: id, productId: "", lineId: "", modelBaseId: "" });
    setWorkSteps([]);
  };
  const selectProduct = (id: string) => {
    setSel((s) => ({ ...s, productId: id, lineId: "", modelBaseId: "" }));
    setWorkSteps([]);
  };
  const selectLine = (id: string) => {
    setSel((s) => ({ ...s, lineId: id, modelBaseId: "" }));
    setWorkSteps([]);
  };
  const selectModelBase = (id: string) => {
    setSel((s) => ({ ...s, modelBaseId: id }));
    const mb = findModelBase(sel.groupId, sel.productId, sel.lineId, id);
    setWorkSteps(mb ? clone(mb.steps) : []);
    const product = findProduct(sel.groupId, sel.productId);
    if (mb && product) {
      setMeta((m) => ({
        ...m,
        projectName: m.projectName || `${product.name} / ${mb.name}`,
      }));
    }
  };

  const selectionSummary = () => {
    const g = findGroup(sel.groupId);
    const p = findProduct(sel.groupId, sel.productId);
    const l = findLine(sel.groupId, sel.productId, sel.lineId);
    const m = findModelBase(sel.groupId, sel.productId, sel.lineId, sel.modelBaseId);
    return [g?.name, p?.name, l?.name, m?.name].filter(Boolean).join(" · ");
  };

  // ----- generation -----
  const stepsHaveSavedReqs = (steps: CatStep[]) =>
    steps.some((s) => (s.requirements ?? []).some((r) => r.trim() !== ""));

  /** Dựng PFMEA trực tiếp từ cấu trúc đã lưu (chức năng + yêu cầu) trong danh mục. */
  const buildRowsFromCatalogSteps = (steps: CatStep[]): PfmeaRow[] => {
    const out: PfmeaRow[] = [];
    for (const st of steps) {
      const name = st.name.trim();
      if (!name) continue;
      const reqs = (st.requirements ?? []).filter((r) => r.trim() !== "");
      if (reqs.length) {
        const fn = st.fn ?? "";
        for (const req of reqs) {
          out.push(toPfmeaRow(analyzeRequirementFallback({ processStep: name, fn, requirement: req })));
        }
      } else {
        // Công đoạn chưa lưu yêu cầu → dùng bộ máy ngoại tuyến gợi ý cho riêng nó.
        generateFallback([name]).forEach((g) => out.push(toPfmeaRow(g)));
      }
    }
    return out;
  };

  const handleGenerate = async () => {
    // Nếu danh mục đã lưu sẵn chức năng + yêu cầu → dựng thẳng từ đó (không sinh lại).
    if (stepsHaveSavedReqs(workSteps)) {
      const built = buildRowsFromCatalogSteps(workSteps);
      setRows(built);
      if (built.length > 0) {
        setNote(
          "Đã dựng PFMEA từ cấu trúc đã lưu trong danh mục. Dùng ✨ AI ở bước 2 để hoàn thiện phân tích.",
        );
        setInputOpen(false);
        setActiveStep(1);
        setView("editor");
      } else {
        setNote("Không có công đoạn nào để dựng.");
      }
      return;
    }

    const lineText = workSteps.map((s) => s.name).filter(Boolean).join("\n");
    setLoading(true);
    setNote(null);
    try {
      const result = await generatePfmea(lineText, meta);
      setRows(result.rows);
      setNote(result.note ?? null);
      if (result.rows.length > 0) {
        setInputOpen(false);
        setActiveStep(1);
        setView("editor");
      }
    } catch (err) {
      setNote(`Tạo thất bại: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  /** Lưu chức năng + yêu cầu hiện tại (bước 1) vào danh mục để dùng lại lâu dài. */
  const saveStructureToCatalog = () => {
    if (!sel.modelBaseId) {
      setNote("Chưa chọn Model base nên không thể lưu cấu trúc vào danh mục.");
      return;
    }
    const next = clone(catalog);
    const mb = next.groups
      .find((g) => g.id === sel.groupId)
      ?.products.find((p) => p.id === sel.productId)
      ?.lines.find((l) => l.id === sel.lineId)
      ?.modelBases.find((m) => m.id === sel.modelBaseId);
    if (!mb) {
      setNote("Không tìm thấy Model base trong danh mục.");
      return;
    }

    // Gom các dòng theo công đoạn (giữ thứ tự) để ghi lại chức năng + yêu cầu.
    const map = new Map<string, { name: string; fn: string; reqs: string[] }>();
    const order: string[] = [];
    rows.forEach((r) => {
      const key = r.processStep.trim().toLowerCase() || `__${r.id}`;
      if (!map.has(key)) {
        map.set(key, { name: r.processStep, fn: r.function, reqs: [] });
        order.push(key);
      }
      map.get(key)!.reqs.push(r.requirement);
    });

    mb.steps = order.map((k) => {
      const g = map.get(k)!;
      return { id: uid("st"), name: g.name, fn: g.fn, requirements: g.reqs };
    });

    setCatalog(next);
    saveCatalog(next);
    setWorkSteps(clone(mb.steps));
    setNote(
      "✅ Đã lưu cấu trúc (chức năng + yêu cầu) vào danh mục — dữ liệu sẽ còn khi tải lại trang. Nên vào Quản trị danh mục → Xuất JSON để sao lưu/chia sẻ.",
    );
  };

  // ----- row editing -----
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
  const deleteRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));
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

  // ----- step-2 grouping + AI suggest -----
  const groups: StepGroup[] = useMemo(() => {
    const map = new Map<string, StepGroup>();
    const order: string[] = [];
    rows.forEach((r) => {
      const key = r.processStep.trim().toLowerCase() || `__${r.id}`;
      if (!map.has(key)) {
        map.set(key, { key, processStep: r.processStep, function: r.function, requirement: r.requirement, rows: [] });
        order.push(key);
      }
      map.get(key)!.rows.push(r);
    });
    return order.map((k) => map.get(k)!);
  }, [rows]);

  const addBusy = (k: string) => setBusy((prev) => new Set(prev).add(k));
  const removeBusy = (k: string) =>
    setBusy((prev) => {
      const n = new Set(prev);
      n.delete(k);
      return n;
    });

  // AI gợi ý cho MỘT dòng (một hạng mục yêu cầu).
  const aiSuggestRow = async (row: PfmeaRow, group: StepGroup) => {
    if (!row.requirement.trim()) {
      setNote("Hãy nhập hạng mục yêu cầu cho dòng này trước khi gợi ý.");
      return;
    }
    addBusy(row.id);
    setNote(null);
    try {
      const result = await suggestRow({
        processStep: group.processStep,
        fn: group.function,
        requirement: row.requirement,
        meta,
      });
      updateRow(row.id, result.patch);
      if (result.note) setNote(result.note);
    } catch (err) {
      setNote(`AI gợi ý thất bại: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      removeBusy(row.id);
    }
  };

  // AI gợi ý cho cả công đoạn (chạy lần lượt từng dòng có yêu cầu).
  const aiSuggestGroup = async (group: StepGroup) => {
    const targets = group.rows.filter((r) => r.requirement.trim());
    if (targets.length === 0) {
      setNote("Công đoạn này chưa có hạng mục yêu cầu nào để gợi ý.");
      return;
    }
    addBusy(group.key);
    setNote(null);
    try {
      const results = await Promise.all(
        targets.map((r) =>
          suggestRow({
            processStep: group.processStep,
            fn: group.function,
            requirement: r.requirement,
            meta,
          }),
        ),
      );
      results.forEach((res, i) => updateRow(targets[i].id, res.patch));
      const noted = results.find((r) => r.note);
      if (noted?.note) setNote(noted.note);
    } catch (err) {
      setNote(`AI gợi ý thất bại: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      removeBusy(group.key);
    }
  };

  // ----- wizard nav -----
  const goToStep = (step: WizardStep) => { setView("editor"); setActiveStep(step); };
  const next = () => {
    setCompleted((prev) => new Set(prev).add(activeStep));
    if (activeStep < 4) setActiveStep((s) => (s + 1) as WizardStep);
    else setView("results");
  };
  const prev = () => { if (activeStep > 1) setActiveStep((s) => (s - 1) as WizardStep); };

  // ----- export -----
  const baseName = (meta.projectName || "pfmea").replace(/\s+/g, "_");
  const handleExportCsv = () => downloadCsv(rows, `${baseName}.csv`);
  const handleExportExcel = () => exportToTemplate(rows, `${baseName}.xlsx`);

  // ----- catalog admin -----
  const handleSaveCatalog = (next: Catalog) => {
    setCatalog(next);
    saveCatalog(next);
  };

  const hasRows = rows.length > 0;

  if (view === "admin") {
    return (
      <div className="app">
        <Header usingGemini={usingGemini} projectName={meta.projectName} />
        <main className="app-body-full">
          <CatalogAdmin
            catalog={catalog}
            onSave={handleSaveCatalog}
            onClose={() => setView("editor")}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        usingGemini={usingGemini}
        projectName={meta.projectName}
        onResults={hasRows ? () => setView("results") : undefined}
        showingResults={view === "results"}
      />

      <main className="app-body-full">
        {inputOpen ? (
          <SetupPanel
            catalog={catalog}
            sel={sel}
            onSelectGroup={selectGroup}
            onSelectProduct={selectProduct}
            onSelectLine={selectLine}
            onSelectModelBase={selectModelBase}
            steps={workSteps}
            onStepsChange={setWorkSteps}
            meta={meta}
            onMetaChange={setMeta}
            onGenerate={handleGenerate}
            onOpenAdmin={() => setView("admin")}
            loading={loading}
            collapsible={hasRows}
            onCollapse={() => setInputOpen(false)}
          />
        ) : (
          <div className="input-collapsed">
            <span>
              <strong>{meta.projectName || "PFMEA chưa đặt tên"}</strong>
              {selectionSummary() && <> · {selectionSummary()}</>} · {rows.length} dạng hỏng hóc
            </span>
            <button className="btn-secondary" type="button" onClick={() => setInputOpen(true)}>
              Đổi sản phẩm / công đoạn
            </button>
          </div>
        )}

        {note && <div className="notice">{note}</div>}
        {loading && <div className="notice loading">Đang tạo bản nháp PFMEA từ các công đoạn…</div>}

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
                  <h2 className="panel-title">{activeStep}. {STEP_LABELS[activeStep]}</h2>
                  <div className="wizard-actions">
                    {activeStep === 1 && (
                      <>
                        <button className="btn-secondary" type="button" onClick={addStep}>+ Thêm công đoạn</button>
                        <button className="btn-secondary" type="button" onClick={saveStructureToCatalog} title="Lưu chức năng + yêu cầu vào danh mục để dùng lại lâu dài">💾 Lưu vào danh mục</button>
                      </>
                    )}
                    <button className="btn-secondary" type="button" onClick={prev} disabled={activeStep === 1}>Quay lại</button>
                    <button className="btn-primary" type="button" onClick={next}>
                      {activeStep === 4 ? "Xem kết quả" : "Tiếp theo"}
                    </button>
                  </div>
                </div>

                {activeStep === 1 ? (
                  <StepStructureEditor
                    rows={rows}
                    onUpdateRow={updateRow}
                    onDeleteRow={deleteRow}
                    onAddRequirementRow={(afterId, ps, fn, req) =>
                      insertAfter(afterId, blankRow(ps, fn, req))
                    }
                  />
                ) : activeStep === 2 ? (
                  <FailureAnalysisCards
                    groups={groups}
                    onUpdateRow={updateRow}
                    onAiSuggestRow={aiSuggestRow}
                    onAiSuggestGroup={aiSuggestGroup}
                    busy={busy}
                    negate={negateRequirement}
                  />
                ) : (
                  <PfmeaTable
                    rows={rows}
                    columns={STEP_COLUMNS[activeStep as 3 | 4]}
                    onUpdateRow={updateRow}
                    onDeleteRow={deleteRow}
                    onAddFailureMode={addFailureModeAfter}
                  />
                )}
              </div>

              <div className="full-table">
                <button className="full-table-toggle" type="button" onClick={() => setShowFullTable((v) => !v)}>
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
              Chọn <strong>Nhóm · Sản phẩm · Model base</strong> ở trên để hiện
              khung công đoạn, rồi bấm <strong>Tạo PFMEA</strong>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
