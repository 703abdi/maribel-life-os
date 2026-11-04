"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BRAND } from "@/lib/brand";

const primary = [
  ["/today", "Today"],
  ["/week", "Week"],
  ["/inbox", "Inbox"],
  ["/projects", "Projects"],
  ["/waiting", "Waiting"],
] as const;
const secondary = [
  ["/school", "School"],
  ["/job", "Job"],
  ["/learning", "Learning"],
  ["/goals", "Direction"],
  ["/review", "Review"],
  ["/calendar", "Calendar"],
  ["/people", "People"],
  ["/money", "Money"],
  ["/experiments", "Experiments"],
  ["/settings", "Settings"],
] as const;

function NavLinks({
  links,
  pathname,
  onNavigate,
}: {
  links: readonly (readonly [string, string])[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map(([href, label]) => (
        <Link
          href={href}
          key={href}
          onClick={onNavigate}
          className={
            pathname === href || pathname.startsWith(href + "/")
              ? "rounded-xl bg-violet-500/20 px-3 py-2 text-sm font-semibold text-violet-100"
              : "rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default function NavShell({
  children,
  email,
  sampleData,
}: {
  children: ReactNode;
  email: string;
  sampleData: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function logout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    if (response.ok) {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--canvas)] md:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[var(--border)] bg-[#0d1017] p-3 md:flex">
        <Link href="/today" className="mb-6 flex items-center gap-3 px-2 pt-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500 text-lg font-black text-white">
            M
          </span>
          <span>
            <b className="block text-sm text-white">{BRAND.name}</b>
            <small className="text-xs text-slate-500">Direct your life</small>
          </span>
        </Link>
        <Link
          href="/inbox"
          className="mb-4 rounded-xl bg-violet-500 px-3 py-2 text-center text-sm font-bold text-white hover:bg-violet-400"
        >
          + Quick capture
        </Link>
        <NavLinks
          links={primary}
          pathname={pathname}
          onNavigate={() => setMenuOpen(false)}
        />
        <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-600">
          Life spaces
        </p>
        <div className="mt-2">
          <NavLinks
            links={secondary}
            pathname={pathname}
            onNavigate={() => setMenuOpen(false)}
          />
        </div>
        <button
          onClick={() => setPaletteOpen(true)}
          className="mt-4 rounded-xl border border-[var(--border)] px-3 py-2 text-left text-xs text-slate-400 hover:bg-white/5"
        >
          Search or jump{" "}
          <span className="float-right rounded border border-slate-700 px-1">
            ⌘K
          </span>
        </button>
        <div className="mt-auto border-t border-[var(--border)] px-2 pt-3">
          <p className="truncate text-xs text-slate-500">{email}</p>
          <button
            onClick={logout}
            className="mt-2 text-xs text-slate-300 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[#0d1017]/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/today" className="font-bold text-white">
          {BRAND.name}
        </Link>
        <Link
          href="/inbox"
          className="rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white"
        >
          + Capture
        </Link>
      </header>
      {sampleData && (
        <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-xs text-amber-100">
          Sample records are visible.{" "}
          <Link href="/settings#sample" className="underline">
            Clear them when you are ready.
          </Link>
        </div>
      )}
      <main>{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--border)] bg-[#0d1017] pb-[env(safe-area-inset-bottom)] md:hidden">
        {primary.slice(0, 4).map(([href, label]) => (
          <Link
            href={href}
            key={href}
            className={
              pathname === href
                ? "flex-1 py-3 text-center text-[11px] font-bold text-violet-300"
                : "flex-1 py-3 text-center text-[11px] text-slate-500"
            }
          >
            {label}
          </Link>
        ))}
        <button
          className="flex-1 text-[11px] text-slate-500"
          onClick={() => setMenuOpen(true)}
        >
          More
        </button>
      </nav>
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 md:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-2 rounded-t-3xl border-t border-[var(--border)] bg-[var(--surface)] p-4 pb-8">
            {[...primary.slice(4), ...secondary].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-[var(--border)] p-3 text-center text-xs text-slate-200"
              >
                {label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="col-span-3 rounded-xl border border-[var(--border)] p-2 text-sm text-slate-300"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-start bg-black/70 p-4 pt-[15vh]">
          <button
            aria-label="Close command palette"
            className="absolute inset-0"
            onClick={() => setPaletteOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-3 shadow-2xl">
            <input
              autoFocus
              placeholder="Jump to a space…"
              className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-3 text-sm text-white outline-none"
            />
            <div className="mt-3 grid grid-cols-2 gap-1">
              {[...primary, ...secondary].map(([href, label]) => (
                <Link
                  href={href}
                  key={href}
                  onClick={() => setPaletteOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
