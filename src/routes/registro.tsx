import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { teams } from "@/lib/mock-data";
import { Trophy } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

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
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [favTeam, setFavTeam] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (username.length < 3) {
      toast.error("Elegí un usuario de al menos 3 caracteres");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, username.trim(), favTeam || undefined);
    setLoading(false);
    if (error) {
      toast.error(error.includes("already registered") ? "Ese email ya está registrado" : error);
      return;
    }
    toast.success("¡Bienvenido al prode!");
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
        <h1 className="font-display text-4xl text-center tracking-tight">Sumate al prode</h1>
        <p className="text-center text-muted-foreground mt-2 text-sm">Gratis. 30 segundos. Sin tarjeta.</p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <Field label="Usuario" type="text" placeholder="elprofeta" value={username} onChange={setUsername} required />
          <Field label="Email" type="email" placeholder="vos@email.com" value={email} onChange={setEmail} required />
          <Field label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={setPassword} required />
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">Equipo del corazón</label>
            <select
              value={favTeam}
              onChange={(e) => setFavTeam(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-input border border-border/50 text-foreground focus:outline-none focus:border-primary transition-all"
            >
              <option value="">Elegí un equipo...</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.code} — {t.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Ingresá</Link>
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
