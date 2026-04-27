import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shield, Calendar, Users, Activity, BarChart3, Trophy } from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin · Prode 2026" }, { name: "robots", content: "noindex" }] }),
});

const tabs = [
  { to: "/admin" as const, label: "Resumen", icon: Shield, exact: true },
  { to: "/admin/partidos" as const, label: "Partidos", icon: Calendar, exact: false },
  { to: "/admin/jugadores" as const, label: "Jugadores", icon: Users, exact: false },
  { to: "/admin/awards" as const, label: "Premios", icon: Trophy, exact: false },
  { to: "/admin/sync" as const, label: "Sync API", icon: Activity, exact: false },
  { to: "/admin/predictor" as const, label: "Predictor", icon: BarChart3, exact: false },
];

function AdminLayout() {
  const { isAdmin, loading } = useIsAdmin();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-40 rounded bg-muted/40 animate-pulse" />
        <div className="mt-6 h-64 rounded-xl bg-muted/30 animate-pulse" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl tracking-wider">Acceso restringido</h1>
        <p className="mt-2 text-muted-foreground">Esta sección es exclusiva para administradores.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-pitch shadow-glow-pitch">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl tracking-wider">Panel admin</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Solo visible para vos</p>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-border/50 pb-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: t.exact }}
            activeProps={{ className: "bg-primary/10 text-primary border-primary/40" }}
            inactiveProps={{ className: "border-transparent text-muted-foreground hover:text-foreground" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors"
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
