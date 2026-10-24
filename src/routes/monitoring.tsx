import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoTag, fmtTime, PageHeader, RiskBadge, useLocName } from "@/components/ag/ui";
import { useI18n } from "@/lib/i18n";
import { LOCATIONS, useData } from "@/lib/store";

export const Route = createFileRoute("/monitoring")({
  head: () => ({
    meta: [
      { title: "Water-quality readings — AquaGuardians" },
      { name: "description", content: "Latest readings and 14-day trends for pH, turbidity, temperature and TDS at each sample location." },
      { property: "og:title", content: "Water-quality readings — AquaGuardians" },
      { property: "og:description", content: "Browse location readings and historical trends." },
    ],
  }),
  component: Monitoring,
});

function Monitoring() {
  const { t, lang } = useI18n();
  const locName = useLocName();
  const { readings } = useData();
  const [loc, setLoc] = useState(LOCATIONS[0]!.id);
  const rows = readings.filter((r) => r.locationId === loc).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const latest = rows.at(-1);
  const data = rows.slice(-14).map((r) => ({ ...r, label: new Date(r.timestamp).toLocaleDateString(lang === "te" ? "te-IN" : "en-IN", { day: "numeric", month: "short" }) }));

  return (
    <>
      <PageHeader title={t("mon.title")}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t("mon.select")}</span>
          <select value={loc} onChange={(e) => setLoc(e.target.value)} className="h-10 rounded-md border bg-card px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>{locName(l.id)}</option>
            ))}
          </select>
        </label>
      </PageHeader>

      {!latest ? (
        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">{t("mon.noData")}</p>
      ) : (
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">{t("mon.latest")}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {fmtTime(latest.timestamp, lang)} <RiskBadge level={latest.risk} />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {([
                ["ph", latest.ph, ""],
                ["turbidity", latest.turbidity, t("unit.turbidity")],
                ["temperature", latest.temperature, t("unit.temperature")],
                ["tds", latest.tds ?? "—", t("unit.tds")],
              ] as const).map(([k, v, u]) => (
                <div key={k} className="rounded-lg bg-muted p-4">
                  <dt className="text-xs text-muted-foreground">{t(`param.${k}`)}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold">
                    {v} <span className="text-sm font-normal text-muted-foreground">{u}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{t("mon.trend")}</h2>
              <DemoTag />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64">
                <p className="mb-1 text-xs text-muted-foreground">pH (safe band 6.5–8.5 shaded)</p>
                <ResponsiveContainer>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <ReferenceArea y1={6.5} y2={8.5} fill="var(--risk-low)" fillOpacity={0.08} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis domain={[5, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line dataKey="ph" name="pH" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-64">
                <p className="mb-1 text-xs text-muted-foreground">{t("param.turbidity")} (NTU) · {t("param.temperature")} (°C)</p>
                <ResponsiveContainer>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line dataKey="turbidity" name={`${t("param.turbidity")} (NTU)`} stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line dataKey="temperature" name={`${t("param.temperature")} (°C)`} stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="mb-3 font-display text-lg font-bold">{t("mon.history")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-3">{t("mon.time")}</th>
                    <th className="pr-3">pH</th>
                    <th className="pr-3">NTU</th>
                    <th className="pr-3">°C</th>
                    <th className="pr-3">TDS</th>
                    <th className="pr-3">{t("mon.status")}</th>
                    <th>{t("mon.source")}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rows].reverse().map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">{fmtTime(r.timestamp, lang)}</td>
                      <td className="pr-3 font-mono">{r.ph}</td>
                      <td className="pr-3 font-mono">{r.turbidity}</td>
                      <td className="pr-3 font-mono">{r.temperature}</td>
                      <td className="pr-3 font-mono">{r.tds ?? "—"}</td>
                      <td className="pr-3"><RiskBadge level={r.risk} /></td>
                      <td className="text-xs text-muted-foreground">{t(`src.${r.source}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
