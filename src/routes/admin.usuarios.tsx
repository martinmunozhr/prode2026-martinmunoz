import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { updateUsername } from "@/lib/admin.functions";
import { authHeaders } from "@/lib/auth-headers";
import { UserCog, Save, Loader2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsuarios,
});

type Profile = {
  id: string;
  username: string;
  avatar_color: string;
  favorite_team_id: string | null;
  created_at: string;
};

// Heurística simple para avisar qué nombres parecen un email.
const looksLikeEmail = (s: string) => /@/.test(s);

function AdminUsuarios() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const updateFn = useServerFn(updateUsername);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_color, favorite_team_id, created_at")
      .order("created_at", { ascending: true });
    setUsers((data as Profile[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (u: Profile) => {
    const next = (edits[u.id] ?? u.username).trim();
    if (next === u.username) return;
    setSavingId(u.id);
    try {
      const r = await updateFn({ data: { userId: u.id, username: next }, headers: await authHeaders() });
      if (r.ok) {
        toast.success(`Nombre actualizado a "${next}"`);
        setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, username: next } : x)));
        setEdits((e) => {
          const { [u.id]: _, ...rest } = e;
          return rest;
        });
      } else {
        toast.error(r.error ?? "No se pudo actualizar");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <div className="flex items-center gap-2 mb-1">
          <UserCog className="h-5 w-5 text-accent" />
          <h2 className="font-display text-2xl tracking-wider">Usuarios registrados</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Editá el nombre visible de cada jugador. Útil cuando alguien se registró con su email
          como nombre. El cambio se ve en el ranking y en toda la app.
        </p>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Todavía no hay usuarios registrados.
          </div>
        ) : (
          <div className="divide-y divide-border/40 rounded-lg border border-border/40">
            {users.map((u) => {
              const value = edits[u.id] ?? u.username;
              const changed = value.trim() !== u.username;
              const tooShort = value.trim().length < 3;
              const isSaving = savingId === u.id;
              return (
                <div key={u.id} className="flex items-center gap-3 p-3">
                  <span
                    className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: u.avatar_color }}
                    aria-hidden
                  >
                    {u.username.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setEdits((s) => ({ ...s, [u.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && changed && !tooShort) save(u);
                      }}
                      className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                    {looksLikeEmail(value) && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-400">
                        <AlertTriangle className="h-3 w-3" /> parece un email
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => save(u)}
                    disabled={!changed || tooShort || isSaving}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-pitch text-primary-foreground text-xs font-bold uppercase tracking-wider disabled:opacity-40 shrink-0"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Guardar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
