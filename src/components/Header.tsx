interface HeaderProps {
  usingGemini: boolean;
}

export function Header({ usingGemini }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden>
          ▤
        </span>
        <span className="brand-name">P-FMEA</span>
        <span className="brand-sub">AI Quality Planning</span>
      </div>
      <div className="header-right">
        <span className={`engine-pill ${usingGemini ? "on" : "off"}`}>
          {usingGemini ? "Gemini AI connected" : "Offline engine"}
        </span>
      </div>
    </header>
  );
}
