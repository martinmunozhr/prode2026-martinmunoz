import { cn } from "@/lib/utils";
import { AVATAR_COLORS } from "@/components/avatar-color-picker";

const SIZE_CLASSES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-3xl",
} as const;

export type UserAvatarSize = keyof typeof SIZE_CLASSES;

type Props = {
  name?: string | null;
  email?: string | null;
  color?: string | null;
  size?: UserAvatarSize;
  className?: string;
};

export function UserAvatar({ name, email, color, size = "md", className }: Props) {
  const colorClass = AVATAR_COLORS.find((c) => c.id === color)?.className ?? "bg-violet-500";
  const initial = (name ?? email ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-full text-white font-display tracking-wider shrink-0 select-none",
        SIZE_CLASSES[size],
        colorClass,
        className,
      )}
    >
      {initial}
    </span>
  );
}
