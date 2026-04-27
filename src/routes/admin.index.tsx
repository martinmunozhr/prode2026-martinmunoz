import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Users, Trophy, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Stats = { teams: number; matches: number; players: number; users: number; finished: number };

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [teams, matches, players, users, finished] = await Promise.all([
        supabase.from("teams").select("*", { count: "exact", head: true }),
        supabase.from("matches").select("*", { count: "exact", head: true }),
        supabase.from("players").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "finished"),
      ]);
      setStats({
        teams: teams.count ?? 0,
        matches: matches.count ?? 0,
        players: players.count ?? 0,
        users: users.count ?? 0,
        finished: finished.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Selecciones", value: stats?.teams ?? "-", icon: Trophy },
    { label: "Partidos", value: stats?.matches ?? "-", icon: Calendar },
    { label: "Jugadores", value: stats?.players ?? "-", icon: Users },
    { label: "Usuarios", value: stats?.users ?? "-", icon: Activity },
    { label: "Finalizados", value: stats?.finished ?? "-", icon: Trophy },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border/50 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
            <c.icon className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 font-display text-4xl tracking-wider">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
