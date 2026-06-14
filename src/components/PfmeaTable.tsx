import type { PfmeaRow, PfmeaStatus } from "../types";
import { rpnBand } from "../lib/rpn";

interface PfmeaTableProps {
  rows: PfmeaRow[];
  onUpdateRow: (id: string, patch: Partial<PfmeaRow>) => void;
  onDeleteRow: (id: string) => void;
  onAddFailureMode: (afterId: string) => void;
  onAddRow: () => void;
  onExport: () => void;
}

const STATUS_OPTIONS: PfmeaStatus[] = ["Open", "In Progress", "Completed"];

const TEXT_FIELDS: {
  key: keyof PfmeaRow;
  className?: string;
}[] = [
  { key: "processStep", className: "col-step" },
  { key: "function" },
  { key: "failureMode" },
  { key: "effect" },
  { key: "cause" },
  { key: "currentControl" },
];

export function PfmeaTable({
  rows,
  onUpdateRow,
  onDeleteRow,
  onAddFailureMode,
  onAddRow,
  onExport,
}: PfmeaTableProps) {
  const highCount = rows.filter((r) => rpnBand(r.rpn) === "high").length;

  return (
    <section className="panel table-panel">
      <div className="table-toolbar">
        <div className="table-summary">
          <h2 className="panel-title">PFMEA Table</h2>
          <span className="row-count">{rows.length} rows</span>
          {highCount > 0 && (
            <span className="risk-chip high">{highCount} high risk</span>
          )}
        </div>
        <div className="table-toolbar-actions">
          <button className="btn-secondary" type="button" onClick={onAddRow}>
            + Add row
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={onExport}
            disabled={rows.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          <p>No PFMEA yet.</p>
          <p className="muted">
            Describe your production line on the left and hit{" "}
            <strong>Generate PFMEA</strong>.
          </p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="pfmea-table">
            <thead>
              <tr>
                <th className="col-step">Process Step</th>
                <th>Function</th>
                <th>Failure Mode</th>
                <th>Effect</th>
                <th>Cause</th>
                <th>Current Control</th>
                <th className="col-num" title="Severity">
                  S
                </th>
                <th className="col-num" title="Occurrence">
                  O
                </th>
                <th className="col-num" title="Detection">
                  D
                </th>
                <th className="col-num">RPN</th>
                <th>Recommended Action</th>
                <th>Responsible</th>
                <th>Status</th>
                <th className="col-actions" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {TEXT_FIELDS.map(({ key, className }) => (
                    <td key={key} className={className}>
                      <CellTextarea
                        value={row[key] as string}
                        onChange={(v) => onUpdateRow(row.id, { [key]: v })}
                      />
                    </td>
                  ))}

                  <NumberCell
                    value={row.severity}
                    onChange={(v) => onUpdateRow(row.id, { severity: v })}
                  />
                  <NumberCell
                    value={row.occurrence}
                    onChange={(v) => onUpdateRow(row.id, { occurrence: v })}
                  />
                  <NumberCell
                    value={row.detection}
                    onChange={(v) => onUpdateRow(row.id, { detection: v })}
                  />

                  <td className={`col-num rpn-cell ${rpnBand(row.rpn)}`}>
                    {row.rpn}
                  </td>

                  <td>
                    <CellTextarea
                      value={row.recommendedAction}
                      onChange={(v) =>
                        onUpdateRow(row.id, { recommendedAction: v })
                      }
                    />
                  </td>

                  <td>
                    <input
                      className="cell-input"
                      value={row.responsible}
                      placeholder="Assign…"
                      onChange={(e) =>
                        onUpdateRow(row.id, { responsible: e.target.value })
                      }
                    />
                  </td>

                  <td>
                    <select
                      className={`status-select status-${row.status
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`}
                      value={row.status}
                      onChange={(e) =>
                        onUpdateRow(row.id, {
                          status: e.target.value as PfmeaStatus,
                        })
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="col-actions">
                    <button
                      className="icon-btn"
                      type="button"
                      title="Add failure mode for this step"
                      onClick={() => onAddFailureMode(row.id)}
                    >
                      +
                    </button>
                    <button
                      className="icon-btn danger"
                      type="button"
                      title="Delete row"
                      onClick={() => onDeleteRow(row.id)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

interface CellTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

function CellTextarea({ value, onChange }: CellTextareaProps) {
  return (
    <textarea
      className="cell-textarea"
      value={value}
      rows={1}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

interface NumberCellProps {
  value: number;
  onChange: (value: number) => void;
}

function NumberCell({ value, onChange }: NumberCellProps) {
  return (
    <td className="col-num">
      <input
        className="cell-num"
        type="number"
        min={1}
        max={10}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          const clamped = Math.min(10, Math.max(1, Math.round(n || 1)));
          onChange(clamped);
        }}
      />
    </td>
  );
}
