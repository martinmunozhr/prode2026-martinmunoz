import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, LogOut, User as UserIcon, Shield, Coins, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useCoins } from "@/hooks/use-coins";
import { ThemeToggle } from "@/components/theme-toggle";
import logoMundial from "@/assets/logo-mundial-2026.webp";

// Links principales (siempre visibles en desktop)
const primaryLinks = [
  { to: "/" as const, label: "Inicio", exact: true },
  { to: "/fixture" as const, label: "Fixture", exact: false },
  { to: "/mis-pronosticos" as const, label: "Pronósticos", exact: false },
  { to: "/ranking" as const, label: "Ranking", exact: false },
  { to: "/figuritas" as const, label: "Figuritas", exact: false },
];

// Links secundarios (dentro del dropdown "Más")
const moreLinks = [
  { to: "/desafios" as const, label: "Desafíos" },
  { to: "/bola-de-cristal" as const, label: "Bola de cristal" },
  { to: "/intercambios" as const, label: "Intercambios" },
  { to: "/equipos" as const, label: "Equipos" },
  { to: "/insights" as const, label: "Insights" },
  { to: "/reglas" as const, label: "Reglas" },
];

// Todos para mobile
const allLinks = [...primaryLinks, ...moreLinks.map((l) => ({ ...l, exact: false }))];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut, loading } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { balance } = useCoins();
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            src={logoMundial}
            alt="Mundial 2026"
            className="h-12 w-12 lg:h-14 lg:w-14 object-contain drop-shadow-lg"
          />
          <div className="font-display text-lg lg:text-xl tracking-wide leading-none flex items-baseline gap-1">
            <span className="text-foreground">PRODE</span>
            <span className="text-gradient-pitch hidden sm:inline">2026</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {primaryLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              activeProps={{ className: "text-primary bg-primary/10" }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground hover:bg-muted",
              }}
              className="px-2.5 py-2 rounded-md text-xs xl:text-sm font-bold uppercase tracking-wider transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                "px-2.5 py-2 rounded-md text-xs xl:text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1",
                moreOpen
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              Más{" "}
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", moreOpen && "rotate-180")}
              />
            </button>
            {moreOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-elevated p-1 z-50">
                {moreLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMoreOpen(false)}
                    activeProps={{ className: "text-primary bg-primary/10" }}
                    inactiveProps={{ className: "text-popover-foreground hover:bg-muted/60" }}
                    className="block px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-1.5">
          {loading ? (
            <div className="h-9 w-24 rounded-md bg-muted/40 animate-pulse" />
          ) : user ? (
            <>
              <Link
                to="/figuritas"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-md bg-gradient-trophy text-trophy-foreground font-bold shadow-glow-trophy hover:scale-105 transition-transform"
                title="Tus monedas"
              >
                <Coins className="h-4 w-4" />
                <span className="text-sm tabular-nums">{balance ?? "—"}</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 px-2 py-2 rounded-md bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 transition-colors"
                  title="Panel admin"
                >
                  <Shield className="h-4 w-4" />
                </Link>
              )}
              <Link
                to="/perfil"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-md bg-muted/40 border border-border/30 hover:border-primary/40 transition-colors max-w-[140px]"
              >
                <UserIcon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-semibold truncate">{profile?.username ?? "..."}</span>
              </Link>
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
              >
                Ingresar
              </Link>
              <Link
                to="/registro"
                className="px-3 py-2 rounded-md bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform"
              >
                Sumate
              </Link>
            </>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-1">
          {user && (
            <Link
              to="/figuritas"
              className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-gradient-trophy text-trophy-foreground font-bold shadow-glow-trophy text-xs"
            >
              <Coins className="h-3.5 w-3.5" />
              <span className="tabular-nums">{balance ?? "—"}</span>
            </Link>
          )}
          <ThemeToggle />
          <button
            className="p-2 text-foreground"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {allLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.exact }}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-primary bg-primary/10" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className={cn(
                  "px-3 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border/50 mt-2 pt-2 flex gap-2 flex-wrap">
              {user ? (
                <>
                  <Link
                    to="/perfil"
                    onClick={() => setOpen(false)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-muted/40 border border-border/30 text-sm font-semibold"
                  >
                    <UserIcon className="h-4 w-4 text-primary" />
                    {profile?.username ?? "Mi perfil"}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-accent/15 border border-accent/40 text-accent text-sm font-bold"
                    >
                      <Shield className="h-4 w-4" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-md border border-border text-sm font-semibold uppercase"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2 rounded-md border border-border text-sm font-semibold uppercase"
                  >
                    Ingresar
                  </Link>
                  <Link
                    to="/registro"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2 rounded-md bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase"
                  >
                    Sumate
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
