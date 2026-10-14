import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary/50",
  secondary:
    "bg-white text-asphalt border border-line hover:bg-surface focus-visible:ring-primary/40",
  ghost: "bg-transparent text-asphalt hover:bg-surface focus-visible:ring-primary/40",
  destructive:
    "bg-severity-critical text-white hover:brightness-90 focus-visible:ring-severity-critical/50",
};

export function Button({ variant = "primary", children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
