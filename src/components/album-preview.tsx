import { Link } from "@tanstack/react-router";
import { teams } from "@/lib/mock-data";
import { ArrowRight, BookOpen } from "lucide-react";

const FEATURED = ["arg", "bra", "fra", "esp", "ing", "por"];

export function AlbumPreview() {
  const featured = FEATURED.map((id) => teams.find((t) => t.id === id)).filter(Boolean) as typeof teams;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-card p-6 md:p-10">
      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-accent font-bold flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Álbum de figuritas
          </div>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight mt-1">
            Tu álbum del Mundial
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            48 selecciones · 26 figuritas cada una. Abrí un sobre y conocé al plantel.
          </p>
        </div>
        <Link
          to="/equipos"
          className="text-sm font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
        >
          Ver álbum completo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-3">
        {featured.map((t) => (
          <Link
            key={t.id}
            to="/equipos/$equipoId"
            params={{ equipoId: t.id }}
            className="group relative bg-background/40 border border-border/50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary/50 hover:shadow-glow-pitch transition-all"
          >
            <div className="text-5xl group-hover:scale-110 transition-transform">{t.flag}</div>
            <div className="text-[11px] font-display tracking-wider uppercase truncate w-full text-center">
              {t.name}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
              Grupo {t.group}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
