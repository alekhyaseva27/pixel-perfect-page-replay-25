import { Link } from "@tanstack/react-router";
import { Droplets, Info, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import { useData } from "@/lib/store";

const NAV = [
  { to: "/", key: "nav.dashboard" },
  { to: "/analyze", key: "nav.analyze" },
  { to: "/monitoring", key: "nav.monitoring" },
  { to: "/locations", key: "nav.map" },
  { to: "/alerts", key: "nav.alerts" },
  { to: "/guidance", key: "nav.guidance" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { alerts } = useData();
  const open = alerts.filter((a) => !a.acknowledged).length;
  const [menu, setMenu] = useState(false);

  const links = (
    <>
      {NAV.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          onClick={() => setMenu(false)}
          activeOptions={{ exact: n.to === "/" }}
          className="nav-link"
          activeProps={{ "aria-current": "page", className: "nav-link-active" }}
        >
          {t(n.key)}
          {n.to === "/alerts" && open > 0 && (
            <span className="ml-1.5 rounded-full bg-risk-high px-1.5 text-[11px] font-bold text-primary-foreground" aria-label={`${open} ${t("stat.openAlerts")}`}>
              {open}
            </span>
          )}
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
              <Droplets className="h-5 w-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-bold text-foreground">AquaGuardians</span>
              <span className="hidden text-[11px] text-muted-foreground sm:block">{t("app.tagline")}</span>
            </span>
          </Link>
          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">{links}</nav>
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground lg:ml-2">
            <span className="sr-only sm:not-sr-only">{t("lang.label")}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="rounded-md border bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
          <button className="rounded-md p-2 lg:hidden" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menu && <nav aria-label="Main mobile" className="flex flex-col gap-1 border-t px-4 py-3 lg:hidden">{links}</nav>}
        <div className="border-t bg-primary/5">
          <p className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-1.5 text-xs text-primary">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t("demo.banner")}
          </p>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">{t("footer")}</footer>
    </div>
  );
}
