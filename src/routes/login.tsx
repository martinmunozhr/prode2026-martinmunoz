import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
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
        <p className="text-center text-muted-foreground mt-2 text-sm">
          Bienvenido de vuelta. Volvé a tu prode.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <Field
            label="Email"
            type="email"
            placeholder="vos@email.com"
            value={email}
            onChange={setEmail}
            required
          />
          <Field
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Entrando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Todavía no tenés cuenta?{" "}
          <Link to="/registro" className="text-primary font-semibold hover:underline">
            Sumate
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">
        {label}
      </label>
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
