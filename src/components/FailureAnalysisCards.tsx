import type { PfmeaRow } from "../types";

export interface StepGroup {
  key: string;
  processStep: string;
  function: string;
  requirement: string;
  rows: PfmeaRow[];
}

interface FailureAnalysisCardsProps {
  groups: StepGroup[];
  onUpdateRow: (id: string, patch: Partial<PfmeaRow>) => void;
  onDeleteRow: (id: string) => void;
  onAddFailureMode: (group: StepGroup) => void;
  onAiSuggest: (group: StepGroup) => void;
  suggestingKey: string | null;
}

export function FailureAnalysisCards({
  groups,
  onUpdateRow,
  onDeleteRow,
  onAddFailureMode,
  onAiSuggest,
  suggestingKey,
}: FailureAnalysisCardsProps) {
  if (groups.length === 0) {
    return (
      <div className="empty-state">
        <p>No process steps yet.</p>
        <p className="muted">Generate a PFMEA first, or add steps in step 1.</p>
      </div>
    );
  }

  return (
    <div className="fa-wrap">
      {groups.map((group) => {
        const loading = suggestingKey === group.key;
        return (
          <section className="fa-group" key={group.key}>
            <div className="fa-group-head">
              <div className="fa-step-title">
                <span className="fa-step-name">{group.processStep}</span>
                {group.function && <span className="fa-step-fn">{group.function}</span>}
              </div>
              <button
                className="btn-ai"
                type="button"
                onClick={() => onAiSuggest(group)}
                disabled={loading}
                title="Use AI to suggest more failure modes for this step"
              >
                {loading ? "Suggesting…" : "✨ AI Suggest"}
              </button>
            </div>

            <div className="fa-cards">
              {group.rows.map((row) => (
                <article className="fa-card" key={row.id}>
                  <button
                    className="fa-card-close"
                    type="button"
                    title="Remove failure mode"
                    onClick={() => onDeleteRow(row.id)}
                  >
                    ×
                  </button>

                  <label className="fa-field">
                    <span className="req">Failure Mode</span>
                    <textarea
                      rows={2}
                      value={row.failureMode}
                      placeholder="e.g. Insufficient weld strength"
                      onChange={(e) => onUpdateRow(row.id, { failureMode: e.target.value })}
                    />
                  </label>

                  <label className="fa-field">
                    <span>Classification</span>
                    <input
                      value={row.classification}
                      placeholder="– / S / CC / SC"
                      maxLength={4}
                      onChange={(e) =>
                        onUpdateRow(row.id, { classification: e.target.value })
                      }
                    />
                  </label>

                  <label className="fa-field">
                    <span>Effect</span>
                    <textarea
                      rows={2}
                      value={row.effect}
                      placeholder="Effect on customer / process"
                      onChange={(e) => onUpdateRow(row.id, { effect: e.target.value })}
                    />
                  </label>

                  <label className="fa-field">
                    <span>Cause</span>
                    <textarea
                      rows={2}
                      value={row.cause}
                      placeholder="Root cause on the shop floor"
                      onChange={(e) => onUpdateRow(row.id, { cause: e.target.value })}
                    />
                  </label>

                  <label className="fa-field fa-sev">
                    <span className="req">Severity</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={row.severity}
                      onChange={(e) => {
                        const n = Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 1)));
                        onUpdateRow(row.id, { severity: n });
                      }}
                    />
                  </label>
                </article>
              ))}

              <button
                className="fa-add"
                type="button"
                onClick={() => onAddFailureMode(group)}
                title="Add a failure mode manually"
              >
                <span>＋</span>
                Add failure mode
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
