import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

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
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error === "Invalid login credentials" ? "Email o contraseña incorrectos" : error);
      return;
    }
    toast.success("¡Bienvenido de vuelta!");
    navigate({ to: "/mis-pronosticos" });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-md mx-auto bg-gradient-card border border-border/50 rounded-3xl p-8 shadow-elevated">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-pitch flex items-center justify-center shadow-glow-pitch">
            <Trophy className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="font-display text-4xl text-center tracking-tight">Ingresar</h1>
        <p className="text-center text-muted-foreground mt-2 text-sm">Bienvenido de vuelta. Volvé a tu prode.</p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <Field label="Email" type="email" placeholder="vos@email.com" value={email} onChange={setEmail} required />
          <Field label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={setPassword} required />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Entrando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">o</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        <button
          type="button"
          onClick={async () => {
            const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/mis-pronosticos" });
            if (r.error) toast.error("No se pudo iniciar sesión con Google");
          }}
          className="mt-4 w-full py-3 rounded-xl border border-border/60 bg-card/50 hover:bg-card/80 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continuar con Google
        </button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Todavía no tenés cuenta?{" "}
          <Link to="/registro" className="text-primary font-semibold hover:underline">Sumate</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange, required }: {
  label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 rounded-xl bg-input border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-glow-pitch transition-all"
      />
    </div>
  );
}
