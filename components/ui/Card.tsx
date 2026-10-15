import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-white p-3 shadow-sm sm:p-4 ${className}`}>
      {children}
    </div>
  );
}
