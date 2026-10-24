import { AlertOctagon, AlertTriangle } from "lucide-react";
import type { Assessment, RiskLevel } from "@/lib/risk";
import { useI18n } from "@/lib/i18n";
import { RiskBadge } from "./ui";

export const STEPS: Record<RiskLevel, string[]> = {
  low: ["step.low.1", "step.low.2", "step.low.3"],
  moderate: ["step.moderate.1", "step.moderate.2", "step.moderate.3"],
  high: ["step.high.1", "step.high.2", "step.high.3", "step.high.4"],
};

export function WarningBanner({ level }: { level: RiskLevel }) {
  const { t } = useI18n();
  if (level === "low") return null;
  const high = level === "high";
  const Icon = high ? AlertOctagon : AlertTriangle;
  return (
    <div
      role="alert"
      className={
        high
          ? "flex items-start gap-3 rounded-lg border-2 border-risk-high bg-risk-high-soft p-4 text-risk-high"
          : "flex items-start gap-3 rounded-lg border-2 border-risk-moderate bg-risk-moderate-soft p-4 text-risk-moderate-ink"
      }
    >
      <Icon className="mt-0.5 h-6 w-6 shrink-0" aria-hidden />
      <div>
        <p className="font-bold">{t(high ? "warn.high" : "warn.moderate")}</p>
        <p className="text-sm">{t(STEPS[level][0])}</p>
      </div>
    </div>
  );
}

const unitKey: Record<string, string | null> = { ph: null, turbidity: "unit.turbidity", temperature: "unit.temperature", tds: "unit.tds" };

export function AssessmentView({ a }: { a: Assessment }) {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <RiskBadge level={a.level} className="px-4 py-1.5 text-base" />
      </div>
      <WarningBanner level={a.level} />
      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("result.factors")}</h3>
        <ul className="divide-y rounded-lg border">
          {a.factors.map((f) => (
            <li key={f.param} className="flex flex-wrap items-start justify-between gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {t(`param.${f.param}`)}: <span className="font-mono">{f.value}</span>{" "}
                  {unitKey[f.param] && <span className="text-muted-foreground">{t(unitKey[f.param]!)}</span>}
                </p>
                <p className="text-sm text-muted-foreground">{t(f.reasonKey)}</p>
              </div>
              <RiskBadge level={f.level} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("result.steps")}</h3>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm">
          {STEPS[a.level].map((s) => (
            <li key={s}>{t(s)}</li>
          ))}
        </ol>
      </section>
      <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">{t("result.method")}</p>
    </div>
  );
}
