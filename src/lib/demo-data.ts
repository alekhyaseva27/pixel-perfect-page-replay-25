import { assessRisk, type RiskLevel } from "./risk";

export interface Location {
  id: string;
  name: string;
  nameTe: string;
  type: "well" | "handpump" | "tank" | "river" | "tap";
  // Illustrative layout position (0–100), NOT GPS
  x: number;
  y: number;
}

export interface Reading {
  id: string;
  locationId: string;
  timestamp: string; // ISO
  ph: number;
  turbidity: number;
  temperature: number;
  tds: number | null;
  risk: RiskLevel;
  source: "demo" | "manual" | "simulated";
}

export interface Alert {
  id: string;
  readingId: string;
  locationId: string;
  timestamp: string;
  level: RiskLevel;
  acknowledged: boolean;
  source: Reading["source"];
}

export const LOCATIONS: Location[] = [
  { id: "L1", name: "Village Well – North Ward", nameTe: "గ్రామ బావి – ఉత్తర వార్డు", type: "well", x: 30, y: 22 },
  { id: "L2", name: "School Hand Pump", nameTe: "పాఠశాల చేతి పంపు", type: "handpump", x: 62, y: 30 },
  { id: "L3", name: "Overhead Tank – Main Road", nameTe: "ఓవర్‌హెడ్ ట్యాంక్ – ప్రధాన రహదారి", type: "tank", x: 48, y: 52 },
  { id: "L4", name: "River Intake Point", nameTe: "నది నీటి సేకరణ స్థలం", type: "river", x: 15, y: 70 },
  { id: "L5", name: "Health Centre Tap", nameTe: "ఆరోగ్య కేంద్రం కుళాయి", type: "tap", x: 75, y: 65 },
  { id: "L6", name: "Market Hand Pump", nameTe: "మార్కెట్ చేతి పంపు", type: "handpump", x: 85, y: 18 },
];

// Deterministic pseudo-random so server and client render identical demo data
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PROFILE: Record<string, { ph: number; turb: number; temp: number; tds: number; drift: number }> = {
  L1: { ph: 7.1, turb: 0.6, temp: 24, tds: 320, drift: 0 },
  L2: { ph: 7.4, turb: 1.4, temp: 26, tds: 480, drift: 0.15 },
  L3: { ph: 7.2, turb: 0.4, temp: 27, tds: 260, drift: 0 },
  L4: { ph: 7.8, turb: 4.2, temp: 29, tds: 610, drift: 0.35 },
  L5: { ph: 7.0, turb: 0.3, temp: 25, tds: 210, drift: 0 },
  L6: { ph: 6.6, turb: 0.9, temp: 26, tds: 540, drift: -0.05 },
};

const BASE = Date.UTC(2026, 9, 24, 6, 0, 0);
const r1 = (n: number) => Math.round(n * 10) / 10;

export function buildDemoData(): { readings: Reading[]; alerts: Alert[] } {
  const rand = mulberry32(42);
  const readings: Reading[] = [];
  const alerts: Alert[] = [];
  for (const loc of LOCATIONS) {
    const p = PROFILE[loc.id];
    for (let d = 13; d >= 0; d--) {
      const trend = (13 - d) * p.drift;
      const ph = r1(p.ph + (rand() - 0.5) * 0.6 - (loc.id === "L6" ? trend : 0));
      const turbidity = r1(Math.max(0.1, p.turb + (rand() - 0.5) * 1.2 + (loc.id !== "L6" ? trend : 0)));
      const temperature = r1(p.temp + (rand() - 0.5) * 3);
      const tds = Math.round(p.tds + (rand() - 0.5) * 120);
      const timestamp = new Date(BASE - d * 86400000 + Math.round(rand() * 4) * 3600000).toISOString();
      const risk = assessRisk({ ph, turbidity, temperature, tds }).level;
      const id = `D-${loc.id}-${d}`;
      readings.push({ id, locationId: loc.id, timestamp, ph, turbidity, temperature, tds, risk, source: "demo" });
      if (risk !== "low") {
        alerts.push({ id: `A-${id}`, readingId: id, locationId: loc.id, timestamp, level: risk, acknowledged: d > 2, source: "demo" });
      }
    }
  }
  readings.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  alerts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return { readings, alerts };
}
