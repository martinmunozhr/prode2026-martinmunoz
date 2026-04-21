import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Ingresar — Prode Mundial 2026" },
      { name: "description", content: "Ingresá a tu cuenta del prode del Mundial 2026." },
      { property: "og:title", content: "Ingresar — Prode 2026" },
      { property: "og:description", content: "Ingresá a tu prode del Mundial." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-md mx-auto bg-gradient-card border border-border/50 rounded-3xl p-8 shadow-elevated">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-pitch flex items-center justify-center shadow-glow-pitch">
            <Trophy className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="font-display text-4xl text-center tracking-tight">Ingresar</h1>
        <p className="text-center text-muted-foreground mt-2 text-sm">Bienvenido devuelta. Volvé a tu prode.</p>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Field label="Email" type="email" placeholder="vos@email.com" />
          <Field label="Contraseña" type="password" placeholder="••••••••" />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-[1.02] transition-transform"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Todavía no tenés cuenta?{" "}
          <Link to="/registro" className="text-primary font-semibold hover:underline">Sumate</Link>
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
