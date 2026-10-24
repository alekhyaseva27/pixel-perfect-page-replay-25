import { describe, expect, it } from "vitest";
import { assessRisk, validateReading } from "@/lib/risk";

describe("assessRisk", () => {
  it("normal water is low risk", () => {
    expect(assessRisk({ ph: 7.2, turbidity: 0.5, temperature: 24, tds: 300 }).level).toBe("low");
  });
  it("pH 6.2 alone is moderate", () => {
    expect(assessRisk({ ph: 6.2, turbidity: 0.5, temperature: 24 }).level).toBe("moderate");
  });
  it("pH 9.5 is high", () => {
    expect(assessRisk({ ph: 9.5, turbidity: 0.5, temperature: 24 }).level).toBe("high");
  });
  it("turbidity above 5 NTU is high", () => {
    expect(assessRisk({ ph: 7, turbidity: 6, temperature: 24 }).level).toBe("high");
  });
  it("two moderate factors escalate to high", () => {
    expect(assessRisk({ ph: 7, turbidity: 3, temperature: 32 }).level).toBe("high");
  });
  it("TDS above 2000 mg/L is high", () => {
    expect(assessRisk({ ph: 7, turbidity: 0.5, temperature: 24, tds: 2500 }).level).toBe("high");
  });
});

describe("validateReading", () => {
  it("rejects missing pH", () => {
    const r = validateReading({ ph: "", turbidity: "1", temperature: "20" });
    expect(r.ok).toBe(false);
    expect(r.errors.ph).toBe("required");
  });
  it("rejects pH above 14", () => {
    expect(validateReading({ ph: "15", turbidity: "1", temperature: "20" }).errors.ph).toBe("outOfRange");
  });
  it("rejects non-numeric turbidity", () => {
    expect(validateReading({ ph: "7", turbidity: "abc", temperature: "20" }).errors.turbidity).toBe("notNumber");
  });
  it("accepts valid input with optional TDS empty", () => {
    const r = validateReading({ ph: "7", turbidity: "1", temperature: "20", tds: "" });
    expect(r.ok).toBe(true);
    expect(r.value?.tds).toBeNull();
  });
});
