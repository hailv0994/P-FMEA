import type { PfmeaRow, PfmeaStatus } from "../types";
import { rpnBand } from "../lib/rpn";
import { COLUMNS, type ColumnKey } from "../lib/columns";

interface PfmeaTableProps {
  rows: PfmeaRow[];
  columns: ColumnKey[];
  onUpdateRow: (id: string, patch: Partial<PfmeaRow>) => void;
  onDeleteRow?: (id: string) => void;
  onAddFailureMode?: (afterId: string) => void;
  compact?: boolean;
}

const STATUS_OPTIONS: PfmeaStatus[] = ["Open", "In Progress", "Completed"];

export function PfmeaTable({
  rows,
  columns,
  onUpdateRow,
  onDeleteRow,
  onAddFailureMode,
  compact,
}: PfmeaTableProps) {
  const showActions = Boolean(onDeleteRow || onAddFailureMode);

  return (
    <div className={`table-scroll ${compact ? "compact" : ""}`}>
      <table className="pfmea-table">
        <thead>
          <tr>
            {columns.map((key) => {
              const col = COLUMNS[key];
              return (
                <th
                  key={key}
                  className={`grp-${col.group} ${
                    col.kind === "num" || col.kind.startsWith("rpn") || col.kind === "class"
                      ? "col-num"
                      : ""
                  }`}
                  title={col.title || col.label}
                >
                  {col.label}
                </th>
              );
            })}
            {showActions && <th className="col-actions" aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((key) => (
                <Cell key={key} row={row} colKey={key} onUpdateRow={onUpdateRow} />
              ))}
              {showActions && (
                <td className="col-actions">
                  {onAddFailureMode && (
                    <button
                      className="icon-btn"
                      type="button"
                      title="Add failure mode for this step"
                      onClick={() => onAddFailureMode(row.id)}
                    >
                      +
                    </button>
                  )}
                  {onDeleteRow && (
                    <button
                      className="icon-btn danger"
                      type="button"
                      title="Delete row"
                      onClick={() => onDeleteRow(row.id)}
                    >
                      ×
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CellProps {
  row: PfmeaRow;
  colKey: ColumnKey;
  onUpdateRow: (id: string, patch: Partial<PfmeaRow>) => void;
}

function Cell({ row, colKey, onUpdateRow }: CellProps) {
  const col = COLUMNS[colKey];
  const update = (patch: Partial<PfmeaRow>) => onUpdateRow(row.id, patch);

  switch (col.kind) {
    case "num": {
      const value = row[colKey] as number;
      return (
        <td className="col-num">
          <input
            className="cell-num"
            type="number"
            min={1}
            max={10}
            value={value}
            onChange={(e) => {
              const n = Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 1)));
              update({ [colKey]: n } as Partial<PfmeaRow>);
            }}
          />
        </td>
      );
    }
    case "rpn": {
      return (
        <td className={`col-num rpn-cell ${rpnBand(row.rpn)}`}>{row.rpn}</td>
      );
    }
    case "rpnAfter": {
      return (
        <td className={`col-num rpn-cell ${rpnBand(row.rpnAfter)}`}>{row.rpnAfter}</td>
      );
    }
    case "class": {
      return (
        <td className="col-num">
          <input
            className="cell-class"
            value={row.classification}
            placeholder="–"
            maxLength={4}
            onChange={(e) => update({ classification: e.target.value })}
          />
        </td>
      );
    }
    case "date": {
      return (
        <td>
          <input
            className="cell-input"
            type="date"
            value={row.targetDate}
            onChange={(e) => update({ targetDate: e.target.value })}
          />
        </td>
      );
    }
    case "status": {
      return (
        <td>
          <select
            className={`status-select status-${row.status
              .replace(/\s+/g, "-")
              .toLowerCase()}`}
            value={row.status}
            onChange={(e) => update({ status: e.target.value as PfmeaStatus })}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </td>
      );
    }
    default: {
      const value = row[colKey] as string;
      return (
        <td>
          <textarea
            className="cell-textarea"
            value={value}
            rows={1}
            onChange={(e) => update({ [colKey]: e.target.value } as Partial<PfmeaRow>)}
          />
        </td>
      );
    }
  }
}
