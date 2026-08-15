import type { ButtonHTMLAttributes } from "react";

export type Variant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex h-10 items-center justify-center gap-2 rounded-button px-5 " +
  "text-sm font-medium transition-colors duration-120 ease-signal " +
  "disabled:cursor-not-allowed";

const VARIANTS: Record<Variant, string> = {

  primary:
    "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active " +
    "disabled:bg-accent/30 disabled:text-text-muted",
  secondary:
    "border border-border-strong text-text hover:bg-surface-raised active:bg-surface " +
    "disabled:border-border disabled:text-text-muted",
  ghost:
    "text-text-muted hover:bg-surface hover:text-text active:bg-surface " +
    "disabled:text-text-muted",
};

export const buttonClass = (variant: Variant = "primary", extra = "") =>
  `${BASE} ${VARIANTS[variant]} ${extra}`.trim();

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;

  loading?: boolean;
};

export default function Button({
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, `${loading ? "opacity-60" : ""} ${className}`)}
    >
      {children}
    </button>
  );
}
