import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoTag, fmtTime, PageHeader, RiskBadge, useLocName } from "@/components/ag/ui";
import { useI18n } from "@/lib/i18n";
import { latestByLocation, LOCATIONS, useData } from "@/lib/store";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Community locations — AquaGuardians" },
      { name: "description", content: "Status of each sample water location with its latest reading and risk level." },
      { property: "og:title", content: "Community locations — AquaGuardians" },
      { property: "og:description", content: "See which sample water points need attention." },
    ],
  }),
  component: Locations,
});

const fill = { low: "var(--risk-low)", moderate: "var(--risk-moderate)", high: "var(--risk-high)" };
const shape = { low: "●", moderate: "▲", high: "■" };

function Locations() {
  const { t, lang } = useI18n();
  const locName = useLocName();
  const { readings } = useData();
  const latest = latestByLocation(readings);

  return (
    <>
      <PageHeader title={t("map.title")} sub={t("map.note")}>
        <DemoTag />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-xl border bg-card p-4 shadow-card lg:col-span-3" aria-label={t("map.note")}>
          <svg viewBox="0 0 100 90" className="h-auto w-full rounded-lg bg-accent/40" role="img" aria-label={t("map.note")}>
            <path d="M0 78 C 20 70, 30 82, 50 74 S 80 68, 100 76 L100 90 L0 90Z" fill="var(--chart-2)" opacity="0.25" />
            <path d="M5 45 H95 M50 5 V85" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="2 1.5" />
            {LOCATIONS.map((l) => {
              const r = latest.get(l.id);
              const level = r?.risk ?? "low";
              return (
                <g key={l.id}>
                  {level === "high" && <circle cx={l.x} cy={l.y} r="5" fill={fill[level]} opacity="0.2" />}
                  {level === "moderate" ? (
                    <polygon points={`${l.x},${l.y - 3} ${l.x - 3},${l.y + 2.2} ${l.x + 3},${l.y + 2.2}`} fill={fill[level]} stroke="var(--card)" strokeWidth="0.6" />
                  ) : level === "high" ? (
                    <rect x={l.x - 2.4} y={l.y - 2.4} width="4.8" height="4.8" fill={fill[level]} stroke="var(--card)" strokeWidth="0.6" />
                  ) : (
                    <circle cx={l.x} cy={l.y} r="2.6" fill={fill[level]} stroke="var(--card)" strokeWidth="0.6" />
                  )}
                  <text x={l.x} y={l.y + 6.5} textAnchor="middle" fontSize="2.8" fill="var(--foreground)" fontWeight="600">
                    {locName(l.id).split(" – ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {(["low", "moderate", "high"] as const).map((k) => (
              <span key={k}>{shape[k]} {t(`risk.${k}`)}</span>
            ))}
          </p>
        </section>
        <section className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-bold">{t("map.list")}</h2>
          <ul className="divide-y">
            {LOCATIONS.map((l) => {
              const r = latest.get(l.id);
              return (
                <li key={l.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{locName(l.id)}</p>
                    {r && <RiskBadge level={r.risk} />}
                  </div>
                  {r && (
                    <p className="text-xs text-muted-foreground">
                      {t("map.lastUpdated")}: {fmtTime(r.timestamp, lang)} · pH {r.ph} · {r.turbidity} NTU
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          <Link to="/monitoring" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">{t("nav.monitoring")} →</Link>
        </section>
      </div>
    </>
  );
}
