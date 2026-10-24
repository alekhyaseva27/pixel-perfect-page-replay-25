// Rule-based risk prototype (NOT a trained ML model).
// Thresholds follow commonly cited drinking-water guidance (WHO / BIS IS 10500).
// These indicators cannot detect pathogens or diagnose disease.

export type RiskLevel = "low" | "moderate" | "high";

export interface ReadingInput {
  ph: number;
  turbidity: number; // NTU
  temperature: number; // °C
  tds?: number | null; // mg/L, optional
}

export interface Factor {
  param: "ph" | "turbidity" | "temperature" | "tds";
  value: number;
  level: RiskLevel;
  reasonKey: string;
}

export interface Assessment {
  level: RiskLevel;
  factors: Factor[];
}

export const LIMITS = {
  ph: { min: 0, max: 14 },
  turbidity: { min: 0, max: 1000 },
  temperature: { min: -5, max: 60 },
  tds: { min: 0, max: 10000 },
} as const;

export type FieldErrors = Partial<Record<keyof ReadingInput | "location", string>>;

export function validateReading(raw: Record<string, string>): {
  ok: boolean;
  errors: FieldErrors;
  value?: ReadingInput;
} {
  const errors: FieldErrors = {};
  const num = (k: keyof typeof LIMITS, required: boolean): number | null => {
    const s = (raw[k] ?? "").trim();
    if (s === "") {
      if (required) errors[k] = "required";
      return null;
    }
    const n = Number(s);
    if (!Number.isFinite(n)) {
      errors[k] = "notNumber";
      return null;
    }
    if (n < LIMITS[k].min || n > LIMITS[k].max) {
      errors[k] = "outOfRange";
      return null;
    }
    return n;
  };
  const ph = num("ph", true);
  const turbidity = num("turbidity", true);
  const temperature = num("temperature", true);
  const tds = num("tds", false);
  const ok = Object.keys(errors).length === 0;
  return ok
    ? { ok, errors, value: { ph: ph!, turbidity: turbidity!, temperature: temperature!, tds } }
    : { ok, errors };
}

const rank: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2 };

export function assessRisk(r: ReadingInput): Assessment {
  const f: Factor[] = [];
  // pH: acceptable 6.5–8.5
  if (r.ph < 6 || r.ph > 9) f.push({ param: "ph", value: r.ph, level: "high", reasonKey: "r.phHigh" });
  else if (r.ph < 6.5 || r.ph > 8.5) f.push({ param: "ph", value: r.ph, level: "moderate", reasonKey: "r.phMod" });
  else f.push({ param: "ph", value: r.ph, level: "low", reasonKey: "r.phOk" });
  // Turbidity: acceptable ≤1, permissible ≤5 NTU
  if (r.turbidity > 5) f.push({ param: "turbidity", value: r.turbidity, level: "high", reasonKey: "r.turbHigh" });
  else if (r.turbidity > 1) f.push({ param: "turbidity", value: r.turbidity, level: "moderate", reasonKey: "r.turbMod" });
  else f.push({ param: "turbidity", value: r.turbidity, level: "low", reasonKey: "r.turbOk" });
  // Temperature: warm water can favour microbial growth (contributing factor only, max moderate)
  if (r.temperature > 30) f.push({ param: "temperature", value: r.temperature, level: "moderate", reasonKey: "r.tempMod" });
  else f.push({ param: "temperature", value: r.temperature, level: "low", reasonKey: "r.tempOk" });
  // TDS: acceptable ≤500, permissible ≤2000 mg/L
  if (r.tds != null) {
    if (r.tds > 2000) f.push({ param: "tds", value: r.tds, level: "high", reasonKey: "r.tdsHigh" });
    else if (r.tds > 500) f.push({ param: "tds", value: r.tds, level: "moderate", reasonKey: "r.tdsMod" });
    else f.push({ param: "tds", value: r.tds, level: "low", reasonKey: "r.tdsOk" });
  }
  let level: RiskLevel = f.reduce<RiskLevel>((m, x) => (rank[x.level] > rank[m] ? x.level : m), "low");
  // Two or more moderate factors escalate to high
  if (level === "moderate" && f.filter((x) => x.level === "moderate").length >= 2) level = "high";
  return { level, factors: f };
}
