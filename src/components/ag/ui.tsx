import { AlertOctagon, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { RiskLevel } from "@/lib/risk";
import { useI18n } from "@/lib/i18n";
import { LOCATIONS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const icons = { low: CheckCircle2, moderate: AlertTriangle, high: AlertOctagon };
const styles: Record<RiskLevel, string> = {
  low: "bg-risk-low-soft text-risk-low border-risk-low/30",
  moderate: "bg-risk-moderate-soft text-risk-moderate-ink border-risk-moderate/40",
  high: "bg-risk-high-soft text-risk-high border-risk-high/30",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const { t } = useI18n();
  const Icon = icons[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", styles[level], className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {t(`risk.${level}`)}
    </span>
  );
}

export function DemoTag() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center rounded border border-dashed border-primary/40 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-primary">
      {t("demo.badge")}
    </span>
  );
}

export function useLocName() {
  const { lang } = useI18n();
  return (id: string) => {
    const l = LOCATIONS.find((x) => x.id === id);
    return l ? (lang === "te" ? l.nameTe : l.name) : id;
  };
}

export function fmtTime(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang === "te" ? "te-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
