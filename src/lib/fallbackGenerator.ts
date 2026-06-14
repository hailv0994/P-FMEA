import type { GeneratedRow } from "../types";

/**
 * Offline, rule-based PFMEA generator.
 *
 * It is NOT a toy: each manufacturing archetype below is keyed on common
 * shop-floor verbs and produces realistic failure modes, effects, causes,
 * controls, recommended actions and reasonable S/O/D ratings. This keeps the
 * app fully usable (and demoable) when no Gemini API key is configured.
 */

interface Archetype {
  keywords: RegExp;
  fn: (step: string) => string;
  modes: Omit<GeneratedRow, "processStep" | "function">[];
}

const A: Archetype[] = [
  {
    keywords: /\b(load|place|position|locate|pick|feed)\b/i,
    fn: () => "Load / position the part into the fixture for the next operation",
    modes: [
      {
        failureMode: "Part loaded in wrong orientation",
        effect: "Downstream operation performed on wrong feature; rework or scrap",
        cause: "Symmetrical part, no poka-yoke on fixture",
        currentControl: "Operator visual check against work instruction",
        severity: 6,
        occurrence: 4,
        detection: 5,
        recommendedAction:
          "Add an orientation poka-yoke / asymmetric locating pin to the fixture",
      },
      {
        failureMode: "Part not fully seated in fixture",
        effect: "Misalignment in subsequent assembly; dimensional defect",
        cause: "Chips/debris on locating surface; worn datum",
        currentControl: "Presence/seating sensor on fixture (if equipped)",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction:
          "Install seating confirmation sensor with interlock to next step",
      },
    ],
  },
  {
    keywords: /\b(install|assemble|insert|mount|fit|attach|join|mate)\b/i,
    fn: () => "Install / assemble the component onto the base part",
    modes: [
      {
        failureMode: "Missing component",
        effect: "Non-functional product reaches customer; field failure",
        cause: "Operator skips step; empty bin not detected",
        currentControl: "End-of-line functional check",
        severity: 8,
        occurrence: 3,
        detection: 4,
        recommendedAction:
          "Add light-guided assembly (pick-to-light) + part presence vision check",
      },
      {
        failureMode: "Incorrect component variant installed",
        effect: "Wrong configuration shipped; warranty return",
        cause: "Similar-looking variants stored adjacently; no scan verification",
        currentControl: "Operator reads part number on label",
        severity: 7,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Barcode-scan the component and verify against the build order",
      },
      {
        failureMode: "Component damaged during insertion",
        effect: "Latent defect; premature failure in service",
        cause: "Excessive insertion force; misaligned mating features",
        currentControl: "Operator handling per work instruction",
        severity: 6,
        occurrence: 4,
        detection: 6,
        recommendedAction: "Add force-monitored press / guided insertion tooling",
      },
    ],
  },
  {
    keywords: /\b(tighten|screw|fasten|torque|bolt|nut|rivet|clamp)\b/i,
    fn: () => "Fasten / tighten the joint to the specified torque",
    modes: [
      {
        failureMode: "Insufficient / over torque",
        effect: "Joint loosens in service or thread strips; safety risk",
        cause: "Manual tool without torque control; operator fatigue",
        currentControl: "Periodic torque audit with torque wrench",
        severity: 8,
        occurrence: 4,
        detection: 5,
        recommendedAction:
          "Use a DC torque tool with torque/angle monitoring and error-proofing",
      },
      {
        failureMode: "Cross-threaded fastener",
        effect: "Weak joint, leak path, rework to retap",
        cause: "Fastener started at an angle; no thread-start guide",
        currentControl: "Operator feel / visual",
        severity: 6,
        occurrence: 3,
        detection: 6,
        recommendedAction: "Add thread-start detection (run-down angle window) on the tool",
      },
      {
        failureMode: "Missing fastener",
        effect: "Loose assembly; potential separation in field",
        cause: "Operator misses a position; multi-bolt pattern",
        currentControl: "Visual check",
        severity: 8,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Fastener-count error-proofing via tool controller fastening cycle count",
      },
    ],
  },
  {
    keywords: /\b(inspect|check|verify|measure|gauge|test|audit|qc|quality)\b/i,
    fn: () => "Inspect / verify the part meets specification",
    modes: [
      {
        failureMode: "Defect not detected (escape)",
        effect: "Defective unit shipped to customer; complaint/recall",
        cause: "Inspection criteria unclear; manual visual fatigue",
        currentControl: "Operator visual inspection vs. boundary sample",
        severity: 8,
        occurrence: 4,
        detection: 6,
        recommendedAction:
          "Deploy automated vision / gauging with pass-fail logging and traceability",
      },
      {
        failureMode: "False reject (good part scrapped)",
        effect: "Yield loss, increased cost",
        cause: "Gauge R&R too high; spec too tight for process",
        currentControl: "Re-check by team leader",
        severity: 3,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Run Gauge R&R study; recalibrate and tune acceptance limits",
      },
    ],
  },
  {
    keywords: /\b(weld|braze|spot.?weld)\b/i,
    fn: () => "Weld the joint per weld schedule",
    modes: [
      {
        failureMode: "Cold / insufficient weld penetration",
        effect: "Joint fails under load; structural / safety failure",
        cause: "Low current; contaminated surface; electrode wear",
        currentControl: "Periodic destructive weld test",
        severity: 9,
        occurrence: 3,
        detection: 6,
        recommendedAction:
          "Add weld monitor (current/energy) with reject and electrode-tip dressing schedule",
      },
      {
        failureMode: "Weld spatter / burn-through",
        effect: "Cosmetic reject; possible adjacent damage",
        cause: "Excess current; poor fit-up gap",
        currentControl: "Visual inspection",
        severity: 5,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Optimize weld schedule; control fit-up gap with fixture",
      },
    ],
  },
  {
    keywords: /\b(press|press.?fit|stake|crimp|swage)\b/i,
    fn: () => "Press-fit the component to the required depth/force",
    modes: [
      {
        failureMode: "Out-of-spec press force/depth",
        effect: "Loose or damaged fit; reliability failure",
        cause: "Worn tooling; part dimensional variation",
        currentControl: "Press force/distance monitoring (if equipped)",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction:
          "Enforce force-vs-distance signature window with automatic reject",
      },
    ],
  },
  {
    keywords: /\b(solder|reflow|wave.?solder)\b/i,
    fn: () => "Solder the electrical connection",
    modes: [
      {
        failureMode: "Cold joint / insufficient solder",
        effect: "Intermittent electrical failure in field",
        cause: "Low temperature profile; oxidation; poor flux",
        currentControl: "AOI / visual inspection",
        severity: 8,
        occurrence: 3,
        detection: 5,
        recommendedAction: "Validate reflow profile; add AOI with solder-joint classification",
      },
      {
        failureMode: "Solder bridge / short",
        effect: "Short circuit; product non-functional",
        cause: "Excess paste; misregistration of stencil",
        currentControl: "AOI",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Optimize stencil aperture and paste volume; SPI before reflow",
      },
    ],
  },
  {
    keywords: /\b(apply|dispense|glue|adhesive|seal|grease|lubricate|paint|coat|spray)\b/i,
    fn: () => "Apply material (adhesive / sealant / coating) to the part",
    modes: [
      {
        failureMode: "Insufficient / missing material",
        effect: "Leak, bond failure, or corrosion in service",
        cause: "Clogged nozzle; incorrect dispense volume",
        currentControl: "Operator visual check of bead",
        severity: 7,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Add vision bead inspection + closed-loop dispense volume control",
      },
    ],
  },
  {
    keywords: /\b(machine|drill|mill|turn|cut|grind|deburr|tap)\b/i,
    fn: () => "Machine the feature to drawing dimensions",
    modes: [
      {
        failureMode: "Dimension out of tolerance",
        effect: "Part will not assemble / fit; scrap or rework",
        cause: "Tool wear; thermal drift; incorrect offset",
        currentControl: "First-article + periodic SPC checks",
        severity: 6,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Implement in-process gauging with tool-offset auto-compensation",
      },
      {
        failureMode: "Burrs / surface defects",
        effect: "Assembly interference; injury risk; sealing issues",
        cause: "Dull tooling; missing deburr step",
        currentControl: "Visual / tactile check",
        severity: 4,
        occurrence: 5,
        detection: 4,
        recommendedAction: "Add automated deburr and tool-life monitoring",
      },
    ],
  },
  {
    keywords: /\b(pack|package|label|box|palletize|ship)\b/i,
    fn: () => "Package / label the finished product for shipment",
    modes: [
      {
        failureMode: "Wrong / missing label",
        effect: "Mis-shipment; traceability loss; customer reject",
        cause: "Manual label selection; no scan verification",
        currentControl: "Operator visual check",
        severity: 6,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Scan-verify label against order; print-and-apply with vision OCR check",
      },
      {
        failureMode: "Inadequate protective packaging",
        effect: "Transit damage; customer return",
        cause: "Wrong packaging spec; rushed packing",
        currentControl: "Packing instruction sheet",
        severity: 5,
        occurrence: 3,
        detection: 5,
        recommendedAction: "Standardize packaging kit per SKU; add packed-weight check",
      },
    ],
  },
];

// Generic fallback when no archetype matches the step text.
const GENERIC: Omit<GeneratedRow, "processStep" | "function">[] = [
  {
    failureMode: "Operation performed incorrectly",
    effect: "Defect passed downstream; rework or customer complaint",
    cause: "Process not error-proofed; reliance on operator skill",
    currentControl: "Work instruction + operator training",
    severity: 6,
    occurrence: 4,
    detection: 5,
    recommendedAction: "Add error-proofing (poka-yoke) and in-station verification for this step",
  },
  {
    failureMode: "Operation skipped / out of sequence",
    effect: "Incomplete product; functional failure",
    cause: "No sequence interlock between stations",
    currentControl: "End-of-line check",
    severity: 7,
    occurrence: 3,
    detection: 4,
    recommendedAction: "Implement station sequence interlock / process control gate",
  },
];

function deriveFunction(step: string): string {
  const m = A.find((a) => a.keywords.test(step));
  if (m) return m.fn(step);
  return `Perform "${step.replace(/[.;]+$/, "")}" to specification`;
}

/** Generate PFMEA rows for one step. */
function generateForStep(step: string): GeneratedRow[] {
  const fn = deriveFunction(step);
  const match = A.find((a) => a.keywords.test(step));
  const modes = match ? match.modes : GENERIC;
  return modes.map((m) => ({ processStep: step, function: fn, ...m }));
}

/** Generate a full PFMEA draft for an ordered list of process steps. */
export function generateFallback(steps: string[]): GeneratedRow[] {
  return steps.flatMap(generateForStep);
}
