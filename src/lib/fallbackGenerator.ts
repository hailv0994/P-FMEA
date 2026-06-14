import type { GeneratedRow } from "../types";

/**
 * Offline, rule-based PFMEA generator (AIAG-VDA shaped).
 *
 * Each manufacturing archetype is keyed on common shop-floor verbs and produces
 * realistic failure modes with split prevention/detection controls, special
 * characteristic classification and reasonable S/O/D ratings. This keeps the app
 * fully usable when no Gemini API key is configured.
 */

type Mode = Omit<GeneratedRow, "processStep" | "function" | "requirement">;

interface Archetype {
  keywords: RegExp;
  fn: string;
  requirement: string;
  modes: Mode[];
}

const A: Archetype[] = [
  {
    keywords: /\b(load|place|position|locate|pick|feed)\b/i,
    fn: "Load / position the part into the fixture for the next operation",
    requirement: "Part fully seated in correct orientation per work instruction",
    modes: [
      {
        failureMode: "Part loaded in wrong orientation",
        effect: "Downstream operation on wrong feature; rework or scrap",
        cause: "Symmetrical part, no poka-yoke on fixture",
        classification: "",
        controlPrevention: "Asymmetric locating feature on fixture",
        controlDetection: "Operator visual check vs. work instruction",
        severity: 6,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Add orientation poka-yoke / asymmetric locating pin",
      },
      {
        failureMode: "Part not fully seated in fixture",
        effect: "Misalignment in subsequent assembly; dimensional defect",
        cause: "Chips/debris on locating surface; worn datum",
        classification: "",
        controlPrevention: "Scheduled fixture cleaning & datum inspection",
        controlDetection: "Seating sensor on fixture (if equipped)",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Install seating-confirmation sensor with interlock",
      },
    ],
  },
  {
    keywords: /\b(install|assemble|insert|mount|fit|attach|join|mate)\b/i,
    fn: "Install / assemble the component onto the base part",
    requirement: "Correct component present, fully seated, undamaged",
    modes: [
      {
        failureMode: "Missing component",
        effect: "Non-functional product reaches customer; field failure",
        cause: "Operator skips step; empty bin not detected",
        classification: "S",
        controlPrevention: "Pick-to-light guided assembly sequence",
        controlDetection: "End-of-line functional check",
        severity: 8,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Add part-presence vision check with line stop",
      },
      {
        failureMode: "Incorrect component variant installed",
        effect: "Wrong configuration shipped; warranty return",
        cause: "Similar variants stored adjacently; no scan verification",
        classification: "",
        controlPrevention: "Segregated, labelled variant bins",
        controlDetection: "Operator reads part number on label",
        severity: 7,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Barcode-scan component and verify vs. build order",
      },
      {
        failureMode: "Component damaged during insertion",
        effect: "Latent defect; premature failure in service",
        cause: "Excessive insertion force; misaligned mating features",
        classification: "",
        controlPrevention: "Guided insertion tooling; trained operators",
        controlDetection: "Force-monitored press signature (if equipped)",
        severity: 6,
        occurrence: 4,
        detection: 6,
        recommendedAction: "Add force-monitored / guided insertion tooling",
      },
    ],
  },
  {
    keywords: /\b(tighten|screw|fasten|torque|bolt|nut|rivet|clamp)\b/i,
    fn: "Fasten / tighten the joint to the specified torque",
    requirement: "All fasteners present and torqued to spec (Nm)",
    modes: [
      {
        failureMode: "Insufficient / over torque",
        effect: "Joint loosens in service or thread strips; safety risk",
        cause: "Manual tool without torque control; operator fatigue",
        classification: "S",
        controlPrevention: "DC torque tool set to spec program",
        controlDetection: "Periodic torque audit with torque wrench",
        severity: 8,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Use DC tool with torque/angle monitoring & error-proofing",
      },
      {
        failureMode: "Cross-threaded fastener",
        effect: "Weak joint, leak path, rework to retap",
        cause: "Fastener started at an angle; no thread-start guide",
        classification: "",
        controlPrevention: "Thread-start guide / chamfered lead-in",
        controlDetection: "Run-down angle window on tool controller",
        severity: 6,
        occurrence: 3,
        detection: 6,
        recommendedAction: "Add thread-start (run-down angle) detection on the tool",
      },
      {
        failureMode: "Missing fastener",
        effect: "Loose assembly; potential separation in field",
        cause: "Operator misses a position in a multi-bolt pattern",
        classification: "S",
        controlPrevention: "Fixed tightening sequence with visual guide",
        controlDetection: "Tool controller fastening-cycle count",
        severity: 8,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Error-proof fastener count via tool controller",
      },
    ],
  },
  {
    keywords: /\b(inspect|check|verify|measure|gauge|test|audit|qc|quality)\b/i,
    fn: "Inspect / verify the part meets specification",
    requirement: "100% of characteristics within drawing tolerance",
    modes: [
      {
        failureMode: "Defect not detected (escape)",
        effect: "Defective unit shipped to customer; complaint/recall",
        cause: "Inspection criteria unclear; manual visual fatigue",
        classification: "S",
        controlPrevention: "Boundary samples & inspector training",
        controlDetection: "Operator visual inspection",
        severity: 8,
        occurrence: 4,
        detection: 6,
        recommendedAction: "Deploy automated vision / gauging with pass-fail logging",
      },
      {
        failureMode: "False reject (good part scrapped)",
        effect: "Yield loss, increased cost",
        cause: "Gauge R&R too high; spec tighter than process",
        classification: "",
        controlPrevention: "Calibrated gauges; tuned acceptance limits",
        controlDetection: "Re-check by team leader",
        severity: 3,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Run Gauge R&R study; recalibrate acceptance limits",
      },
    ],
  },
  {
    keywords: /\b(weld|braze|spot.?weld|hàn)\b/i,
    fn: "Weld the joint per weld schedule",
    requirement: "Weld strength & penetration meet spec; no defects",
    modes: [
      {
        failureMode: "Insufficient weld strength / penetration",
        effect: "Joint fails under load; structural / safety failure",
        cause: "Low current; contaminated surface; electrode wear",
        classification: "S",
        controlPrevention: "Validated weld schedule; electrode-dress schedule",
        controlDetection: "Periodic destructive weld test; weld monitor",
        severity: 9,
        occurrence: 2,
        detection: 5,
        recommendedAction: "Add weld monitor (current/energy) with auto reject",
      },
      {
        failureMode: "Weld spatter / burn-through",
        effect: "Cosmetic reject; possible adjacent damage",
        cause: "Excess current; poor fit-up gap",
        classification: "",
        controlPrevention: "Optimised schedule; fixture controls fit-up gap",
        controlDetection: "Visual inspection per frequency",
        severity: 5,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Optimise weld schedule; control fit-up gap with fixture",
      },
    ],
  },
  {
    keywords: /\b(press|press.?fit|stake|crimp|swage)\b/i,
    fn: "Press-fit the component to the required depth/force",
    requirement: "Press force & final depth within signature window",
    modes: [
      {
        failureMode: "Out-of-spec press force / depth",
        effect: "Loose or damaged fit; reliability failure",
        cause: "Worn tooling; part dimensional variation",
        classification: "",
        controlPrevention: "Tool maintenance; incoming part SPC",
        controlDetection: "Press force/distance signature monitoring",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Enforce force-vs-distance window with auto reject",
      },
    ],
  },
  {
    keywords: /\b(solder|reflow|wave.?solder)\b/i,
    fn: "Solder the electrical connection",
    requirement: "Solder joints meet IPC class; no opens/shorts",
    modes: [
      {
        failureMode: "Cold joint / insufficient solder",
        effect: "Intermittent electrical failure in field",
        cause: "Low temperature profile; oxidation; poor flux",
        classification: "",
        controlPrevention: "Validated reflow profile; flux control",
        controlDetection: "AOI / visual inspection",
        severity: 8,
        occurrence: 3,
        detection: 5,
        recommendedAction: "Validate reflow profile; add AOI joint classification",
      },
      {
        failureMode: "Solder bridge / short",
        effect: "Short circuit; product non-functional",
        cause: "Excess paste; stencil misregistration",
        classification: "",
        controlPrevention: "Optimised stencil aperture & paste volume",
        controlDetection: "SPI before reflow; AOI after",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Tune stencil aperture; add SPI before reflow",
      },
    ],
  },
  {
    keywords: /\b(apply|dispense|glue|adhesive|seal|grease|lubricate|paint|coat|spray)\b/i,
    fn: "Apply material (adhesive / sealant / coating) to the part",
    requirement: "Continuous bead of correct volume in correct location",
    modes: [
      {
        failureMode: "Insufficient / missing material",
        effect: "Leak, bond failure, or corrosion in service",
        cause: "Clogged nozzle; incorrect dispense volume",
        classification: "",
        controlPrevention: "Closed-loop dispense volume control; nozzle maint.",
        controlDetection: "Operator visual check of bead",
        severity: 7,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Add vision bead inspection + volume verification",
      },
    ],
  },
  {
    keywords: /\b(machine|drill|mill|turn|cut|grind|deburr|tap|taro|khoan)\b/i,
    fn: "Machine the feature to drawing dimensions",
    requirement: "Dimensions within tolerance; no burrs",
    modes: [
      {
        failureMode: "Dimension out of tolerance",
        effect: "Part will not assemble / fit; scrap or rework",
        cause: "Tool wear; thermal drift; incorrect offset",
        classification: "",
        controlPrevention: "Tool-life management; offset compensation",
        controlDetection: "First-article + periodic SPC checks",
        severity: 6,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Add in-process gauging with auto tool-offset",
      },
      {
        failureMode: "Burrs / surface defects",
        effect: "Assembly interference; injury risk; sealing issues",
        cause: "Dull tooling; missing deburr step",
        classification: "",
        controlPrevention: "Tool-life monitoring; defined deburr step",
        controlDetection: "Visual / tactile check",
        severity: 4,
        occurrence: 5,
        detection: 4,
        recommendedAction: "Add automated deburr and tool-life monitoring",
      },
    ],
  },
  {
    keywords: /\b(pack|package|label|box|palletize|ship)\b/i,
    fn: "Package / label the finished product for shipment",
    requirement: "Correct label & protective packaging per SKU spec",
    modes: [
      {
        failureMode: "Wrong / missing label",
        effect: "Mis-shipment; traceability loss; customer reject",
        cause: "Manual label selection; no scan verification",
        classification: "",
        controlPrevention: "Print-and-apply tied to order",
        controlDetection: "Scan-verify label vs. order",
        severity: 6,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Scan-verify label with vision OCR check",
      },
      {
        failureMode: "Inadequate protective packaging",
        effect: "Transit damage; customer return",
        cause: "Wrong packaging spec; rushed packing",
        classification: "",
        controlPrevention: "Standardised packaging kit per SKU",
        controlDetection: "Packed-weight check",
        severity: 5,
        occurrence: 3,
        detection: 5,
        recommendedAction: "Standardise packaging kit; add packed-weight check",
      },
    ],
  },
];

const GENERIC_FN = (step: string) =>
  `Perform "${step.replace(/[.;]+$/, "")}" to specification`;

const GENERIC_MODES: Mode[] = [
  {
    failureMode: "Operation performed incorrectly",
    effect: "Defect passed downstream; rework or customer complaint",
    cause: "Process not error-proofed; reliance on operator skill",
    classification: "",
    controlPrevention: "Work instruction + operator training",
    controlDetection: "In-station verification check",
    severity: 6,
    occurrence: 4,
    detection: 5,
    recommendedAction: "Add error-proofing (poka-yoke) + in-station verification",
  },
  {
    failureMode: "Operation skipped / out of sequence",
    effect: "Incomplete product; functional failure",
    cause: "No sequence interlock between stations",
    classification: "",
    controlPrevention: "Station sequence interlock",
    controlDetection: "End-of-line check",
    severity: 7,
    occurrence: 3,
    detection: 4,
    recommendedAction: "Implement station sequence interlock / process gate",
  },
];

function matchArchetype(step: string): Archetype | undefined {
  return A.find((a) => a.keywords.test(step));
}

function modeToRow(step: string, fn: string, requirement: string, m: Mode): GeneratedRow {
  return { processStep: step, function: fn, requirement, ...m };
}

/** Generate PFMEA rows for one step. */
function generateForStep(step: string): GeneratedRow[] {
  const a = matchArchetype(step);
  const fn = a ? a.fn : GENERIC_FN(step);
  const requirement = a ? a.requirement : "Meets drawing / spec requirement";
  const modes = a ? a.modes : GENERIC_MODES;
  return modes.map((m) => modeToRow(step, fn, requirement, m));
}

/** Generate a full PFMEA draft for an ordered list of process steps. */
export function generateFallback(steps: string[]): GeneratedRow[] {
  return steps.flatMap(generateForStep);
}

/**
 * Offline equivalent of the "AI Suggest" button: propose additional failure
 * modes for a single step that are not already listed.
 */
export function suggestFailureModesFallback(args: {
  processStep: string;
  fn: string;
  requirement: string;
  existing: string[];
}): GeneratedRow[] {
  const a = matchArchetype(args.processStep);
  const fn = args.fn || (a ? a.fn : GENERIC_FN(args.processStep));
  const requirement = args.requirement || (a ? a.requirement : "Meets spec requirement");
  const pool = a ? a.modes : GENERIC_MODES;

  const existing = new Set(args.existing.map((e) => e.trim().toLowerCase()));
  const fresh = pool.filter((m) => !existing.has(m.failureMode.trim().toLowerCase()));
  const chosen = fresh.length ? fresh : GENERIC_MODES;
  return chosen.map((m) => modeToRow(args.processStep, fn, requirement, m));
}
