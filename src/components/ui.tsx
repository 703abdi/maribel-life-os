import Link from "next/link";
import type { ReactNode } from "react";

export const input =
  "mt-1 w-full rounded-xl border border-[var(--border)] bg-[#0d1017] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400";
export const select = input;
export const label =
  "text-xs font-semibold uppercase tracking-wide text-[var(--muted)]";
export const btn = {
  primary:
    "rounded-xl bg-violet-500 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-400",
  secondary:
    "rounded-xl border border-[var(--border)] bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10",
  danger:
    "rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-400",
};

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1480px] p-4 pb-24 sm:p-6 lg:p-8">
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-violet-300">
          Maribel OS
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {sub && <p className="mt-1 text-sm text-[var(--muted)]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_32px_rgba(0,0,0,.16)] " +
        className
      }
    >
      {title && (
        <h2 className="border-b border-[var(--border)] px-4 py-3 text-sm font-semibold text-slate-100">
          {title}
        </h2>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[var(--border)] bg-black/10 p-4 text-sm text-[var(--muted)]">
      {children}
    </p>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "red" | "green" | "violet" | "indigo" | "teal" | "amber";
}) {
  const colors = {
    slate: "bg-slate-800 text-slate-300",
    red: "bg-rose-500/15 text-rose-300",
    green: "bg-emerald-500/15 text-emerald-300",
    violet: "bg-violet-500/15 text-violet-200",
    indigo: "bg-violet-500/15 text-violet-200",
    teal: "bg-emerald-500/15 text-emerald-300",
    amber: "bg-amber-500/15 text-amber-200",
  };
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-[11px] font-semibold " + colors[tone]
      }
    >
      {children}
    </span>
  );
}

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      className="text-sm font-medium text-violet-300 hover:text-violet-200 hover:underline"
      href={href}
    >
      {children}
    </Link>
  );
}
