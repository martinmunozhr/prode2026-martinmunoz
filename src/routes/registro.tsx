import { createFileRoute, Link } from "@tanstack/react-router";
import { teams } from "@/lib/mock-data";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Registrate — Prode Mundial 2026" },
      { name: "description", content: "Creá tu cuenta gratis y empezá a pronosticar el Mundial 2026." },
      { property: "og:title", content: "Sumate al Prode 2026" },
      { property: "og:description", content: "Creá tu cuenta gratis y jugá el prode del Mundial." },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-md mx-auto bg-gradient-card border border-border/50 rounded-3xl p-8 shadow-elevated">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-pitch flex items-center justify-center shadow-glow-pitch">
            <Trophy className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="font-display text-4xl text-center tracking-tight">Sumate al prode</h1>
        <p className="text-center text-muted-foreground mt-2 text-sm">Gratis. 30 segundos. Sin tarjeta.</p>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Field label="Usuario" type="text" placeholder="elprofeta" />
          <Field label="Email" type="email" placeholder="vos@email.com" />
          <Field label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" />
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">Equipo del corazón</label>
            <select className="w-full px-4 py-3 rounded-xl bg-input border border-border/50 text-foreground focus:outline-none focus:border-primary transition-all">
              <option value="">Elegí un equipo...</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-[1.02] transition-transform"
          >
            Crear cuenta
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Ingresá</Link>
        </p>

        <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground mt-6 px-3 py-2 rounded-md bg-muted/40 border border-border/30">
          Demo · Auth real próximamente
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-input border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-glow-pitch transition-all"
      />
    </div>
  );
}
