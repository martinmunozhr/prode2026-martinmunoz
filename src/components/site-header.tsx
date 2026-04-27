import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogOut, User as UserIcon, Shield, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useCoins } from "@/hooks/use-coins";
import { ThemeToggle } from "@/components/theme-toggle";
import logoMundial from "@/assets/logo-mundial-2026.webp";

const links = [
  { to: "/" as const, label: "Inicio", exact: true },
  { to: "/fixture" as const, label: "Fixture", exact: false },
  { to: "/mis-pronosticos" as const, label: "Pronósticos", exact: false },
  { to: "/desafios" as const, label: "Desafíos", exact: false },
  { to: "/bola-de-cristal" as const, label: "Bola", exact: false },
  { to: "/ranking" as const, label: "Ranking", exact: false },
  { to: "/figuritas" as const, label: "Figuritas", exact: false },
  { to: "/equipos" as const, label: "Equipos", exact: false },
  { to: "/reglas" as const, label: "Reglas", exact: false },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { balance } = useCoins();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="font-display text-xl sm:text-2xl tracking-wide leading-none flex items-baseline gap-1">
            <span className="text-foreground">PRODE</span>
            <span className="text-gradient-pitch">MUNDIAL 2026</span>
          </div>
          <img src={logoMundial} alt="Mundial 2026" className="h-14 w-14 sm:h-16 sm:w-16 object-contain drop-shadow-lg" />
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
          {loading ? (
            <div className="h-9 w-24 rounded-md bg-muted/40 animate-pulse" />
          ) : user ? (
            <>
              <Link
                to="/figuritas"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-gradient-trophy text-trophy-foreground font-bold shadow-glow-trophy hover:scale-105 transition-transform"
                title="Tus monedas"
              >
                <Coins className="h-4 w-4" />
                <span className="text-sm tabular-nums">{balance ?? "—"}</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 transition-colors"
                  title="Panel admin"
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
                </Link>
              )}
              <Link
                to="/perfil"
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/40 border border-border/30 hover:border-primary/40 transition-colors"
              >
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{profile?.username ?? "..."}</span>
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
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-1">
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
                  <button onClick={handleSignOut} className="px-4 py-2 rounded-md border border-border text-sm font-semibold uppercase">
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 rounded-md border border-border text-sm font-semibold uppercase">
                    Ingresar
                  </Link>
                  <Link to="/registro" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 rounded-md bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase">
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
