import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/" as const, label: "Inicio", exact: true },
  { to: "/fixture" as const, label: "Fixture", exact: false },
  { to: "/mis-pronosticos" as const, label: "Mis Pronósticos", exact: false },
  { to: "/ranking" as const, label: "Ranking", exact: false },
  { to: "/equipos" as const, label: "Equipos", exact: false },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-pitch shadow-glow-pitch">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="font-display text-2xl tracking-wide leading-none">
            <span className="text-foreground">PRODE</span>
            <span className="text-gradient-pitch ml-1">2026</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              activeProps={{ className: "text-primary bg-primary/10" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted" }}
              className="px-3 py-2 rounded-md text-sm font-medium uppercase tracking-wider transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
          >
            Ingresar
          </Link>
          <Link
            to="/registro"
            className="px-4 py-2 rounded-md bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform"
          >
            Sumate
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.exact }}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-primary bg-primary/10" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className={cn("px-3 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider")}
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border/50 mt-2 pt-2 flex gap-2">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 rounded-md border border-border text-sm font-semibold uppercase">
                Ingresar
              </Link>
              <Link to="/registro" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 rounded-md bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase">
                Sumate
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
