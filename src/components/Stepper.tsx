import { STEP_LABELS, type WizardStep } from "../types";

interface StepperProps {
  active: WizardStep;
  completed: Set<WizardStep>;
  onSelect: (step: WizardStep) => void;
}

const STEPS: WizardStep[] = [1, 2, 3, 4];

export function Stepper({ active, completed, onSelect }: StepperProps) {
  return (
    <nav className="stepper" aria-label="PFMEA workflow">
      {STEPS.map((step, i) => {
        const isActive = step === active;
        const isDone = completed.has(step) && !isActive;
        return (
          <button
            key={step}
            type="button"
            className={`step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            onClick={() => onSelect(step)}
          >
            <span className="step-badge">{isDone ? "✓" : step}</span>
            <span className="step-label">{STEP_LABELS[step]}</span>
            {i < STEPS.length - 1 && <span className="step-line" aria-hidden />}
          </button>
        );
      })}
    </nav>
  );
}
