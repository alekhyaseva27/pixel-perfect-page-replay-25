import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildDemoData, LOCATIONS, type Alert, type Reading } from "./demo-data";
import { assessRisk, type ReadingInput } from "./risk";

const KEY = "ag-data-v1";

interface Store {
  readings: Reading[];
  alerts: Alert[];
  addReading: (locationId: string, input: ReadingInput, source: Reading["source"]) => Reading;
  acknowledge: (alertId: string) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const demo = useMemo(buildDemoData, []);
  const [readings, setReadings] = useState<Reading[]>(demo.readings);
  const [alerts, setAlerts] = useState<Alert[]>(demo.alerts);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.readings) && Array.isArray(d.alerts)) {
          setReadings(d.readings);
          setAlerts(d.alerts);
        }
      }
    } catch {
      /* corrupted storage: fall back to demo data */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ readings, alerts }));
  }, [readings, alerts, loaded]);

  const value: Store = {
    readings,
    alerts,
    addReading(locationId, input, source) {
      const a = assessRisk(input);
      const reading: Reading = {
        id: `R-${Date.now()}`,
        locationId,
        timestamp: new Date().toISOString(),
        ph: input.ph,
        turbidity: input.turbidity,
        temperature: input.temperature,
        tds: input.tds ?? null,
        risk: a.level,
        source,
      };
      setReadings((r) => [...r, reading]);
      if (a.level !== "low") {
        setAlerts((al) => [
          { id: `A-${reading.id}`, readingId: reading.id, locationId, timestamp: reading.timestamp, level: a.level, acknowledged: false, source },
          ...al,
        ]);
      }
      return reading;
    },
    acknowledge(id) {
      setAlerts((al) => al.map((x) => (x.id === id ? { ...x, acknowledged: true } : x)));
    },
    reset() {
      setReadings(demo.readings);
      setAlerts(demo.alerts);
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useData outside DataProvider");
  return c;
}

export function latestByLocation(readings: Reading[]) {
  const m = new Map<string, Reading>();
  for (const r of readings) {
    const cur = m.get(r.locationId);
    if (!cur || r.timestamp > cur.timestamp) m.set(r.locationId, r);
  }
  return m;
}

export { LOCATIONS };
