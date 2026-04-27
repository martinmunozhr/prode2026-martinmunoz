import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, X } from "lucide-react";

type PlayerLite = {
  id: string;
  name: string;
  team_id: string;
  team_name?: string;
  team_flag?: string;
  position: string;
};

type Props = {
  value: string | null;
  onChange: (name: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Si se setea, filtra solo jugadores de esa posición ("Goalkeeper" para arquero) */
  positionFilter?: "Goalkeeper" | "Forward" | "Midfielder" | "Defender";
};

/**
 * Autocomplete sobre la tabla players. Si todavía no se cargaron planteles,
 * permite escritura libre (texto plano) para que el usuario igual pueda jugar.
 */
export function PlayerAutocomplete({
  value,
  onChange,
  placeholder,
  disabled,
  positionFilter,
}: Props) {
  const [query, setQuery] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [players, setPlayers] = useState<PlayerLite[]>([]);
  const [loadedAll, setLoadedAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  useEffect(() => {
    let active = true;
    (async () => {
      let q = supabase
        .from("players")
        .select("id,name,position,team_id, teams:team_id (name, flag)")
        .order("name")
        .limit(2000);
      if (positionFilter) q = q.eq("position", positionFilter);
      const { data } = await q;
      if (!active) return;
      const rows: PlayerLite[] = (data ?? []).map((p) => {
        const t = (p as unknown as { teams?: { name?: string; flag?: string } }).teams;
        return {
          id: p.id as string,
          name: p.name as string,
          team_id: p.team_id as string,
          position: p.position as string,
          team_name: t?.name ?? "",
          team_flag: t?.flag ?? "",
        };
      });
      setPlayers(rows);
      setLoadedAll(true);
    })();
    return () => {
      active = false;
    };
  }, [positionFilter]);

  // Click outside
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players.slice(0, 20);
    return players
      .filter(
        (p) => p.name.toLowerCase().includes(q) || (p.team_name ?? "").toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [query, players]);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            // Permitir texto libre como fallback
            onChange(e.target.value || null);
          }}
          className="w-full bg-background/60 border border-border rounded-xl pl-9 pr-9 py-3 text-foreground focus:outline-none focus:border-primary disabled:opacity-60"
        />
        {query && !disabled && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpiar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-border bg-popover shadow-elevated">
          {!loadedAll && (
            <div className="px-3 py-2 text-xs text-muted-foreground">Cargando jugadores...</div>
          )}
          {loadedAll && players.length === 0 && (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              Aún no hay planteles cargados. Escribí el nombre libremente.
            </div>
          )}
          {matches.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setQuery(p.name);
                onChange(p.name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center gap-2 text-sm"
            >
              <span className="text-lg">{p.team_flag}</span>
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {p.team_name}
              </span>
            </button>
          ))}
          {loadedAll && matches.length === 0 && query && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No coincide con ningún jugador. Se guardará tal cual escribiste.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
