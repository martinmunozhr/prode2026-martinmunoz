import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { AvatarColorPicker } from "@/components/avatar-color-picker";
import { UserAvatar } from "@/components/user-avatar";
import { AchievementsPanel } from "@/components/achievements-panel";
import { toast } from "sonner";
import { LogIn, Save } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Mi Perfil — Prode Mundial 2026" },
      {
        name: "description",
        content: "Personalizá tu perfil del prode: avatar, equipo favorito y datos de cuenta.",
      },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user, profile, loading } = useAuth();
  const [color, setColor] = useState("violet");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setColor(profile.avatar_color || "violet");
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_color: color })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      console.error("perfil save error:", error);
      toast.error("No se pudo guardar el color. Probá de nuevo en un momento.");
    } else toast.success("Perfil actualizado");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <header className="mb-10">
          <div className="h-3 w-24 bg-primary/20 rounded animate-pulse" />
          <div className="h-12 w-56 bg-muted/40 rounded mt-3 animate-pulse" />
        </header>
        <div className="rounded-3xl bg-gradient-card border border-border/50 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted/40 animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-40 bg-muted/40 rounded animate-pulse" />
              <div className="h-4 w-56 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-16 rounded-xl bg-muted/20 animate-pulse" />
          <div className="h-12 rounded-xl bg-muted/20 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center bg-gradient-card border border-border/50 rounded-3xl p-10">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-pitch flex items-center justify-center shadow-glow-pitch mb-5">
            <LogIn className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl tracking-tight">Ingresá para ver tu perfil</h1>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold uppercase tracking-wider"
            >
              Ingresar
            </Link>
            <Link
              to="/registro"
              className="px-5 py-2.5 rounded-xl bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase tracking-wider shadow-glow-pitch"
            >
              Sumate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <header className="mb-10">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">
          Tu cuenta
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Mi Perfil</h1>
      </header>

      <div className="bg-gradient-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-elevated mb-6">
        <div className="flex items-center gap-4 mb-8">
          <UserAvatar
            name={profile?.username}
            email={user.email}
            color={color}
            size="xl"
            className="shadow-elevated"
          />
          <div>
            <div className="font-display text-3xl tracking-wide">{profile?.username ?? "—"}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="font-display text-xl tracking-wider mb-3">Color de avatar</h2>
          <AvatarColorPicker value={color} onChange={setColor} />
        </section>

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform disabled:opacity-60 disabled:hover:scale-100"
        >
          <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <section className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-accent font-bold">
          Tu progreso
        </div>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight mt-1 mb-5">
          Logros y monedas
        </h2>
        <AchievementsPanel userId={user.id} />
      </section>
    </div>
  );
}
