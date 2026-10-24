import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { STEPS } from "@/components/ag/AssessmentView";
import { fmtTime, PageHeader, RiskBadge, useLocName } from "@/components/ag/ui";
import { useI18n } from "@/lib/i18n";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alert history — AquaGuardians" },
      { name: "description", content: "Water-risk alerts with time, location, severity and recommended action." },
      { property: "og:title", content: "Alert history — AquaGuardians" },
      { property: "og:description", content: "Review and acknowledge water-risk alerts." },
    ],
  }),
  component: Alerts,
});

type Filter = "all" | "open" | "ack";

function Alerts() {
  const { t, lang } = useI18n();
  const locName = useLocName();
  const { alerts, acknowledge, reset } = useData();
  const [filter, setFilter] = useState<Filter>("open");
  const list = alerts.filter((a) => (filter === "all" ? true : filter === "open" ? !a.acknowledged : a.acknowledged));

  return (
    <>
      <PageHeader title={t("alerts.title")} sub={t("alerts.note")}>
        <Button variant="ghost" size="sm" onClick={reset}>{t("alerts.reset")}</Button>
      </PageHeader>
      <div role="tablist" className="mb-4 inline-flex rounded-lg border bg-card p-1">
        {(["open", "ack", "all"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            {t(f === "open" ? "alerts.filterOpen" : f === "ack" ? "alerts.filterAck" : "alerts.filterAll")}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">{t("alerts.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a.id} className={`rounded-xl border bg-card p-4 shadow-card ${a.level === "high" && !a.acknowledged ? "border-l-4 border-l-risk-high" : a.level === "moderate" && !a.acknowledged ? "border-l-4 border-l-risk-moderate" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge level={a.level} />
                    <span className="text-xs text-muted-foreground">{fmtTime(a.timestamp, lang)} · {t(`src.${a.source}`)}</span>
                  </div>
                  <p className="font-semibold">{locName(a.locationId)}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t("alerts.action")}:</span> {t(STEPS[a.level][0])} {t(STEPS[a.level][1])}
                  </p>
                </div>
                {a.acknowledged ? (
                  <span className="inline-flex items-center gap-1 text-sm text-risk-low"><Check className="h-4 w-4" aria-hidden />{t("alerts.acked")}</span>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => acknowledge(a.id)}>{t("alerts.ack")}</Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
