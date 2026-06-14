# P-FMEA — AI Quality Planning

An AI-assisted **Process FMEA** generator inspired by Kaizen Copilot. Describe a
production line (or paste a time study), and the app turns each process step into
a structured, editable PFMEA draft in seconds — reducing PFMEA creation from
weeks to minutes.

![stack](https://img.shields.io/badge/React-18-61dafb) ![vite](https://img.shields.io/badge/Vite-6-646cff) ![ts](https://img.shields.io/badge/TypeScript-5-3178c6)

## Features

- **Production Line Input panel** — type, paste, or import a `.txt`/`.csv`/`.md`
  flow. Understands numbered lists, bullets, and `A -> B -> C` arrow flows.
- **AI generation** — for each step the engine produces 1–3 realistic failure
  modes with effect, root cause, current control, S/O/D ratings, auto-computed
  **RPN**, and a practical recommended action.
- **Fully editable PFMEA table** — every cell is inline-editable; S/O/D edits
  recompute RPN live, with low/medium/high risk color bands.
- **Iterative workflow** — add a failure mode to any step, add blank rows,
  assign a responsible person, and set status (Open / In Progress / Completed).
- **Export** the finished table to CSV.

## AI engine

The PFMEA generator prefers the **Google Gemini API** and falls back to a
built-in **offline rule-based engine** so the app always produces a usable draft.

- **With a Gemini key:** set `VITE_GEMINI_API_KEY` (see below). The app calls
  Gemini with a structured-output schema to return clean PFMEA rows.
- **Without a key (or on API error):** a manufacturing knowledge base generates
  realistic rows keyed on shop-floor verbs (load, install, tighten, inspect,
  weld, solder, press-fit, machine, package, …).

> ⚠️ This is a pure frontend (Vite) app, so the Gemini key ships in the browser
> bundle. Use a restricted/throttled key for demos. For production, proxy the
> Gemini call through a backend.

## Getting started

```bash
npm install

# (optional) enable real AI generation
cp .env.example .env
# then put your key in .env:  VITE_GEMINI_API_KEY=your_key_here
# get a key at https://aistudio.google.com/apikey

npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```

## How to use

1. (Optional) fill in project name, scope, FMEA lead, and team members.
2. Enter your process steps, e.g.:
   ```
   1. Load part
   2. Install component
   3. Tighten screw
   4. Inspect
   ```
   (or click **Load sample**).
3. Hit **⚡ Generate PFMEA**.
4. Review and refine: edit any cell, tweak S/O/D, add failure modes, assign
   owners, set status, then **Export CSV**.

## Project structure

```
src/
  components/
    Header.tsx          # top bar + engine status pill
    LineInputPanel.tsx  # line description / project metadata input
    PfmeaTable.tsx      # editable PFMEA table
  lib/
    parseSteps.ts       # parse free-form line text into steps
    gemini.ts           # Gemini API call + structured-output schema
    fallbackGenerator.ts# offline manufacturing knowledge base
    generate.ts         # orchestrator (Gemini -> fallback)
    rpn.ts              # RPN math + row helpers
    csv.ts              # CSV export
  types.ts              # shared types
  App.tsx               # state + wiring
```

## PFMEA columns

Process Step · Function · Failure Mode · Effect · Cause · Current Control ·
Severity (S) · Occurrence (O) · Detection (D) · RPN · Recommended Action ·
Responsible · Status
