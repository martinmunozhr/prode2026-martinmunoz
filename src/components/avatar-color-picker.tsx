import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const AVATAR_COLORS = [
  { id: "violet", className: "bg-violet-500", label: "Violeta" },
  { id: "emerald", className: "bg-emerald-500", label: "Verde" },
  { id: "rose", className: "bg-rose-500", label: "Rosa" },
  { id: "amber", className: "bg-amber-500", label: "Ámbar" },
  { id: "sky", className: "bg-sky-500", label: "Cielo" },
  { id: "fuchsia", className: "bg-fuchsia-500", label: "Fucsia" },
  { id: "lime", className: "bg-lime-500", label: "Lima" },
  { id: "orange", className: "bg-orange-500", label: "Naranja" },
] as const;

export function AvatarColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = AVATAR_COLORS.find((c) => c.id === value);
  return (
    <div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {AVATAR_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center transition-all border-2",
              c.className,
              value === c.id
                ? "border-foreground scale-110 shadow-glow-pitch"
                : "border-transparent hover:scale-105 opacity-80 hover:opacity-100",
            )}
            aria-label={c.label}
            title={c.label}
          >
            {value === c.id && <Check className="h-5 w-5 text-white drop-shadow" />}
          </button>
        ))}
      </div>
      {selected && (
        <p className="mt-3 text-sm text-muted-foreground">
          Color elegido: <span className="font-bold text-foreground">{selected.label}</span>
        </p>
      )}
    </div>
  );
}
