import type { ReactNode } from "react";

/* ── Stat Card ──────────────────────────────────────────────── */

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
          {trend && (
            <p
              className={`mt-1 text-xs font-medium ${trend.positive ? "text-success" : "text-danger"}`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg text-muted">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Badge ──────────────────────────────────────────────────── */

const badgeColors: Record<string, string> = {
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning:
    "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger:
    "bg-red-50 text-red-700 ring-red-600/20",
  info:
    "bg-blue-50 text-blue-700 ring-blue-600/20",
  neutral:
    "bg-gray-50 text-gray-700 ring-gray-600/20",
};

export function Badge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: keyof typeof badgeColors;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeColors[variant]}`}
    >
      {children}
    </span>
  );
}

/* ── Page Shell ─────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

/* ── Table ──────────────────────────────────────────────────── */

export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-card-border bg-card-bg shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-card-border bg-muted-bg/50">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">{children}</tbody>
      </table>
    </div>
  );
}

/* ── Empty State ────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-card-border bg-card-bg py-16">
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-muted">{description}</p>
      )}
    </div>
  );
}

/* ── Button ─────────────────────────────────────────────────── */

export function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  onClick,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover",
    secondary:
      "border border-card-border bg-card-bg text-foreground hover:bg-muted-bg",
    danger: "bg-danger text-white hover:bg-red-600",
    ghost: "text-muted hover:bg-muted-bg hover:text-foreground",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
