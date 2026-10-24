import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssessmentView } from "@/components/ag/AssessmentView";
import { PageHeader, useLocName } from "@/components/ag/ui";
import { useI18n } from "@/lib/i18n";
import { assessRisk, validateReading, type Assessment, type FieldErrors } from "@/lib/risk";
import { LOCATIONS, useData } from "@/lib/store";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Check water readings — AquaGuardians" },
      { name: "description", content: "Enter pH, turbidity, temperature and TDS to get a clear water risk assessment with next steps." },
      { property: "og:title", content: "Check water readings — AquaGuardians" },
      { property: "og:description", content: "Get a Low, Moderate or High water-risk assessment with practical guidance." },
    ],
  }),
  component: Analyze,
});

const FIELDS = [
  { k: "ph", unit: null, step: "0.1", ph: "7.0" },
  { k: "turbidity", unit: "unit.turbidity", step: "0.1", ph: "0.8" },
  { k: "temperature", unit: "unit.temperature", step: "0.1", ph: "25" },
  { k: "tds", unit: "unit.tds", step: "1", ph: "300" },
] as const;

function Analyze() {
  const { t } = useI18n();
  const locName = useLocName();
  const { addReading } = useData();
  const [loc, setLoc] = useState(LOCATIONS[0]!.id);
  const [vals, setVals] = useState<Record<string, string>>({ ph: "", turbidity: "", temperature: "", tds: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<Assessment | null>(null);
  const [simulated, setSimulated] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateReading(vals);
    setErrors(v.errors);
    if (!v.ok || !v.value) {
      setResult(null);
      return;
    }
    setResult(assessRisk(v.value));
    addReading(loc, v.value, simulated ? "simulated" : "manual");
    toast.success(t("form.saved"));
  };

  const simulate = () => {
    const r = (a: number, b: number, d = 1) => (a + Math.random() * (b - a)).toFixed(d);
    setVals({ ph: r(6, 9), turbidity: r(0.2, 7), temperature: r(20, 34), tds: r(150, 900, 0) });
    setErrors({});
    setSimulated(true);
  };

  return (
    <>
      <PageHeader title={t("form.title")} sub={t("form.subtitle")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border bg-card p-6 shadow-card">
          <div className="space-y-1.5">
            <Label htmlFor="loc">{t("form.location")}</Label>
            <select id="loc" value={loc} onChange={(e) => setLoc(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>{locName(l.id)}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => {
              const err = errors[f.k];
              return (
                <div key={f.k} className="space-y-1.5">
                  <Label htmlFor={f.k}>
                    {t(`param.${f.k}`)} {f.unit && <span className="text-muted-foreground">({t(f.unit)})</span>}
                  </Label>
                  <Input
                    id={f.k}
                    inputMode="decimal"
                    step={f.step}
                    placeholder={f.ph}
                    value={vals[f.k]}
                    aria-invalid={!!err}
                    aria-describedby={err ? `${f.k}-err` : undefined}
                    onChange={(e) => {
                      setVals({ ...vals, [f.k]: e.target.value });
                      setSimulated(false);
                    }}
                    className={err ? "border-destructive" : ""}
                  />
                  {err && <p id={`${f.k}-err`} className="text-xs font-medium text-destructive">{t(`err.${err}`)}</p>}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit">{t("form.submit")}</Button>
            <Button type="button" variant="outline" onClick={simulate}>{t("form.simulate")}</Button>
          </div>
        </form>
        <section aria-live="polite" className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg font-bold">{t("result.title")}</h2>
          {result ? <AssessmentView a={result} /> : <p className="text-sm text-muted-foreground">{t("result.empty")}</p>}
        </section>
      </div>
    </>
  );
}
