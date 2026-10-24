import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, BellRing, MapPin, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { DemoTag, fmtTime, RiskBadge, useLocName } from "@/components/ag/ui";
import { useI18n } from "@/lib/i18n";
import { latestByLocation, LOCATIONS, useData } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AquaGuardians — Water Safety Dashboard" },
      { name: "description", content: "Community water-quality dashboard with clear risk levels, alerts and multilingual safety guidance." },
      { property: "og:title", content: "AquaGuardians — Water Safety Dashboard" },
      { property: "og:description", content: "Understand water-quality risks early, in English and Telugu." },
    ],
  }),
  component: Home,
});

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={`h-4 w-4 ${tone ?? "text-teal"}`} aria-hidden />
        {label}
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

function Home() {
  const { t, lang } = useI18n();
  const locName = useLocName();
  const { readings, alerts } = useData();
  const latest = latestByLocation(readings);
  const attention = [...latest.values()].filter((r) => r.risk !== "low").length;
  const openAlerts = alerts.filter((a) => !a.acknowledged).length;
  const recent = [...readings].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6);
  const chart = LOCATIONS.map((l) => ({
    name: locName(l.id).split(" – ")[0],
    moderate: alerts.filter((a) => a.locationId === l.id && a.level === "moderate").length,
    high: alerts.filter((a) => a.locationId === l.id && a.level === "high").length,
  }));

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-brand p-8 text-primary-foreground sm:p-10">
        <h1 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("home.title")}</h1>
        <p className="mt-3 max-w-2xl opacity-90">{t("home.subtitle")}</p>
        <div className="mt-6 flex max-w-2xl items-start gap-3 rounded-lg bg-primary-foreground/10 p-4 text-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p>{t("home.safety")}</p>
        </div>
        <Button asChild variant="secondary" size="lg" className="mt-6">
          <Link to="/analyze">{t("home.cta")}</Link>
        </Button>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Summary">
        <Stat icon={MapPin} label={t("stat.locations")} value={LOCATIONS.length} />
        <Stat icon={AlertTriangle} label={t("stat.attention")} value={attention} tone="text-risk-moderate-ink" />
        <Stat icon={Activity} label={t("stat.readings")} value={readings.length} />
        <Stat icon={BellRing} label={t("stat.openAlerts")} value={openAlerts} tone="text-risk-high" />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-xl border bg-card p-5 shadow-card lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">{t("home.recentReadings")}</h2>
            <DemoTag />
          </div>
          <ul className="divide-y">
            {recent.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <div>
                  <p className="font-medium">{locName(r.locationId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtTime(r.timestamp, lang)} · pH {r.ph} · {r.turbidity} NTU · {r.temperature}°C
                  </p>
                </div>
                <RiskBadge level={r.risk} />
              </li>
            ))}
          </ul>
          <Link to="/monitoring" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">{t("home.viewAll")} →</Link>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-bold">{t("home.recentAlerts")}</h2>
          <ul className="space-y-2">
            {alerts.slice(0, 5).map((a) => (
              <li key={a.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <RiskBadge level={a.level} />
                  <span className="text-xs text-muted-foreground">{fmtTime(a.timestamp, lang)}</span>
                </div>
                <p className="mt-1 font-medium">{locName(a.locationId)}</p>
              </li>
            ))}
          </ul>
          <Link to="/alerts" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">{t("home.viewAll")} →</Link>
        </section>
      </div>

      <section className="rounded-xl border bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{t("home.alertsByLocation")}</h2>
          <DemoTag />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="moderate" name={t("risk.moderate")} stackId="a" fill="var(--risk-moderate)" />
              <Bar dataKey="high" name={t("risk.high")} stackId="a" fill="var(--risk-high)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
