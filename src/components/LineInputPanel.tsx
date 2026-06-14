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
}

const SAMPLE = `1. Load part
2. Install component
3. Tighten screw
4. Inspect`;

export function LineInputPanel({
  meta,
  onMetaChange,
  lineText,
  onLineTextChange,
  onGenerate,
  onImportFile,
  loading,
}: LineInputPanelProps) {
  const update = (key: keyof ProjectMeta) => (e: ChangeEvent<HTMLInputElement>) =>
    onMetaChange({ ...meta, [key]: e.target.value });

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportFile(file);
    e.target.value = "";
  };

  return (
    <section className="panel input-panel">
      <h2 className="panel-title">Production Line</h2>
      <p className="panel-hint">
        Describe or paste your line / time study. The AI converts each step into
        a structured PFMEA draft.
      </p>

      <div className="field-grid">
        <label className="field">
          <span>Project name</span>
          <input
            value={meta.projectName}
            onChange={update("projectName")}
            placeholder="e.g. UFB Glovebox Assembly"
          />
        </label>
        <label className="field">
          <span>FMEA lead</span>
          <input
            value={meta.fmeaLead}
            onChange={update("fmeaLead")}
            placeholder="e.g. Tim"
          />
        </label>
        <label className="field field-wide">
          <span>Scope</span>
          <input
            value={meta.scope}
            onChange={update("scope")}
            placeholder="Define scope (optional)"
          />
        </label>
        <label className="field field-wide">
          <span>Team members</span>
          <input
            value={meta.teamMembers}
            onChange={update("teamMembers")}
            placeholder="James, Jake, Joy, Mike"
          />
        </label>
      </div>

      <label className="field">
        <span>Process steps</span>
        <textarea
          className="line-textarea"
          value={lineText}
          onChange={(e) => onLineTextChange(e.target.value)}
          placeholder={SAMPLE}
          rows={8}
        />
      </label>

      <div className="input-actions">
        <button
          className="btn-secondary"
          type="button"
          onClick={() => onLineTextChange(SAMPLE)}
          disabled={loading}
        >
          Load sample
        </button>

        <label className="btn-secondary file-btn">
          Import file
          <input
            type="file"
            accept=".txt,.csv,.md"
            onChange={handleFile}
            hidden
          />
        </label>

        <button
          className="btn-primary generate-btn"
          type="button"
          onClick={onGenerate}
          disabled={loading || !lineText.trim()}
        >
          {loading ? "Generating…" : "⚡ Generate PFMEA"}
        </button>
      </div>
    </section>
  );
}
