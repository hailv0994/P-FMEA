interface HeaderProps {
  usingGemini: boolean;
  projectName?: string;
  onResults?: () => void;
  showingResults?: boolean;
}

export function Header({ usingGemini, projectName, onResults, showingResults }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden>
          ▤
        </span>
        <span className="brand-name">P-FMEA</span>
        <span className="brand-sub">Lập kế hoạch chất lượng bằng AI</span>
        {projectName && <span className="brand-project">/ {projectName}</span>}
      </div>
      <div className="header-right">
        <span className={`engine-pill ${usingGemini ? "on" : "off"}`}>
          {usingGemini ? "Đã kết nối Gemini AI" : "Chế độ ngoại tuyến"}
        </span>
        {onResults && (
          <button
            className={`btn-primary results-btn ${showingResults ? "active" : ""}`}
            type="button"
            onClick={onResults}
          >
            Kết quả
          </button>
        )}
      </div>
    </header>
  );
}
