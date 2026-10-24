import { createFileRoute } from "@tanstack/react-router";
import { Building2, Cpu, FlaskConical, Flame, Info } from "lucide-react";
import { PageHeader } from "@/components/ag/ui";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/guidance")({
  head: () => ({
    meta: [
      { title: "Water safety guide — AquaGuardians" },
      { name: "description", content: "What water-quality readings can and cannot tell you, when to get lab tests, and how to make water safer." },
      { property: "og:title", content: "Water safety guide — AquaGuardians" },
      { property: "og:description", content: "Plain-language water safety guidance for households and health workers." },
    ],
  }),
  component: Guidance,
});

const SECTIONS = [
  { k: "limits", icon: Info },
  { k: "test", icon: FlaskConical },
  { k: "treat", icon: Flame },
  { k: "auth", icon: Building2 },
  { k: "iot", icon: Cpu },
] as const;

function Guidance() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t("guide.title")} />
      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map(({ k, icon: Icon }) => (
          <section key={k} className="rounded-xl border bg-card p-6 shadow-card">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon className="h-5 w-5" aria-hidden /></span>
              <h2 className="font-display text-lg font-bold">{t(`guide.${k}Title`)}</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{t(`guide.${k}`)}</p>
          </section>
        ))}
      </div>
    </>
  );
}
