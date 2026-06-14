import type { GeneratedRow, ProjectMeta } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL =
  (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.0-flash";

export function hasGeminiKey(): boolean {
  return Boolean(API_KEY && API_KEY.trim());
}

const SYSTEM_PROMPT = `You are a senior manufacturing quality engineer creating a Process FMEA (PFMEA).
You convert production-line process steps into a realistic, shop-floor-relevant PFMEA.

Rules:
- For EACH process step, identify its function and generate 1-3 realistic failure modes.
- Failure modes must be concrete factory scenarios (e.g. "Insufficient torque", "Missing component",
  "Part loaded in wrong orientation"), NOT vague textbook phrases.
- For each failure mode provide: effect on customer/process, a realistic root cause, a plausible
  current control, and a practical recommended action that an engineer could assign and execute.
- Rate Severity (S), Occurrence (O), Detection (D) each on a 1-10 automotive AIAG/VDA scale
  (10 = worst: most severe / most frequent / hardest to detect).
- Be specific to the described line; avoid generic answers. Preserve the given step order.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    rows: {
      type: "array",
      items: {
        type: "object",
        properties: {
          processStep: { type: "string" },
          function: { type: "string" },
          failureMode: { type: "string" },
          effect: { type: "string" },
          cause: { type: "string" },
          currentControl: { type: "string" },
          severity: { type: "integer" },
          occurrence: { type: "integer" },
          detection: { type: "integer" },
          recommendedAction: { type: "string" },
        },
        required: [
          "processStep",
          "function",
          "failureMode",
          "effect",
          "cause",
          "currentControl",
          "severity",
          "occurrence",
          "detection",
          "recommendedAction",
        ],
      },
    },
  },
  required: ["rows"],
};

interface GenerateArgs {
  steps: string[];
  meta: ProjectMeta;
}

export async function generateWithGemini({
  steps,
  meta,
}: GenerateArgs): Promise<GeneratedRow[]> {
  if (!hasGeminiKey()) {
    throw new Error("No Gemini API key configured");
  }

  const userPrompt = [
    meta.projectName ? `Project: ${meta.projectName}` : "",
    meta.scope ? `Scope: ${meta.scope}` : "",
    "",
    "Production line process steps (in order):",
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Produce the PFMEA rows for these steps.",
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Gemini API error ${res.status}: ${text.slice(0, 300) || res.statusText}`,
    );
  }

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!part) {
    throw new Error("Gemini returned an empty response");
  }

  let parsed: { rows?: GeneratedRow[] };
  try {
    parsed = JSON.parse(part);
  } catch {
    throw new Error("Failed to parse Gemini JSON response");
  }

  if (!parsed.rows || !Array.isArray(parsed.rows) || parsed.rows.length === 0) {
    throw new Error("Gemini returned no PFMEA rows");
  }

  return parsed.rows;
}
