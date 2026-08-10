"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import TombolKeluar from "@/components/TombolKeluar";

export type NavItem = { href: string; label: string };

const PUBLIC_NAV: NavItem[] = [
  { href: "/materi", label: "Materi" },
  { href: "/simulator", label: "Simulator" },
  { href: "/about", label: "About" },
];

/** Praktikan destinations. `/nilai` was cut — the list page carries the scores. */
export const NAV_PRAKTIKAN: NavItem[] = [
  { href: "/praktikum", label: "Praktikum" },
];

/** `/dashboard` was cut — /penilaian already lists every modul with its
    outstanding count, which is the whole job a dashboard would have done. */
export const NAV_ASISTEN: NavItem[] = [
  { href: "/penilaian", label: "Penilaian" },
];

/**
 * Global site header. design.md §5, §6, §7.
 *
 * variant="marketing" — 72px, transparent, collapses to 56px + surface + hairline
 *                       once the page has scrolled past 24px (§6 signature moment).
 * variant="app"       — 56px, always filled. Authenticated screens: the nav is a
 *                       tool, so it holds still. Collapsing it would be an
 *                       anti-feature on a long grading roster.
 */
export default function SiteHeader({
  variant = "marketing",
  nav: navProp,
}: {
  variant?: "marketing" | "app";
  /** App destinations differ by role, and the header cannot know the role —
      each route group's layout passes its own. */
  nav?: NavItem[];
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isApp = variant === "app";
  const nav = navProp ?? (isApp ? NAV_PRAKTIKAN : PUBLIC_NAV);

  /* §6 — collapse threshold is 24px. Observing a 24px sentinel gives us the
     threshold AND its hysteresis for free: the observer fires only when the
     boundary is crossed, so there is no jitter and no per-frame scroll math. */
  useEffect(() => {
    if (isApp) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setScrolled(!entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isApp]);

  /* Native <dialog> gives focus trap, Esc-to-close, focus restore to the trigger,
     and background inerting from the platform (design.md §9). The one thing it
     does not do is lock body scroll, so we do that here — and always restore it. */
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (menuOpen && !d.open) {
      d.showModal();
      document.body.style.overflow = "hidden";
    } else if (!menuOpen && d.open) {
      d.close();
    }
  }, [menuOpen]);

  // Restore scroll if the header unmounts while the menu is open.
  useEffect(() => () => void (document.body.style.overflow = ""), []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* §6 scroll sentinel. Not rendered in app variant — nothing observes it. */}
      {!isApp && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-6"
        />
      )}

      <header
        className={[
          "sticky top-0 z-[var(--z-header)] w-full border-b",
          // §5 — 180ms, --ease-signal. Under prefers-reduced-motion the global
          // block in globals.css cuts this to 0.01ms: the state still changes,
          // it simply has no tween (§9).
          "transition-[height,background-color,border-color] duration-180 ease-signal",
          isApp || scrolled
            ? "h-14 border-border bg-surface"
            : "h-18 border-transparent bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-5 tablet:px-8">
          <Link
            // In the app the wordmark goes home, and "home" depends on role —
            // an asisten has no business on /praktikum. First nav item wins.
            href={isApp ? (nav[0]?.href ?? "/") : "/"}
            className="flex items-center gap-2 font-display text-base font-medium text-text"
          >
            {/* Decorative, aria-hidden: 3.69 on navy clears the 3:1 non-text
                floor. It is not text, so §2's body-size accent rule does not
                apply. */}
            <span aria-hidden="true" className="text-accent">
              ◈
            </span>
            Controllab
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-8 tablet:flex"
          >
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative py-2 text-sm transition-colors duration-120 ease-signal",
                    active ? "text-text" : "text-text-muted hover:text-text",
                  ].join(" ")}
                >
                  {item.label}
                  {/* §7 — 2px accent underline, scales from centre over 180ms. */}
                  <span
                    aria-hidden="true"
                    className={[
                      "absolute inset-x-0 bottom-0 h-0.5 origin-center bg-accent",
                      "transition-transform duration-180 ease-signal",
                      active ? "scale-x-100" : "scale-x-0",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {/* Identity slot. The signed-in name lands here with backend.md
                Part 6; until then only the action that always applies. */}
            {isApp && (
              <span className="hidden tablet:inline">
                <TombolKeluar />
              </span>
            )}
            {!isApp && (
              /* §7 secondary button */
              <Link
                href="/login"
                className="hidden h-10 items-center rounded-button border border-border-strong px-5 text-sm font-medium text-text transition-colors duration-120 ease-signal hover:bg-surface-raised tablet:inline-flex"
              >
                Masuk
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              className="flex h-10 w-10 items-center justify-center rounded-button text-text transition-colors duration-120 ease-signal hover:bg-surface-raised tablet:hidden"
            >
              <span className="sr-only">Buka menu</span>
              <svg
                width="18"
                height="12"
                viewBox="0 0 18 12"
                aria-hidden="true"
                fill="none"
              >
                <path d="M0 1h18M0 11h18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        id="menu-mobile"
        onClose={closeMenu}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-text backdrop:bg-bg/80"
      >
        <div className="flex h-full flex-col px-5 pb-8 pt-5">
          {/* No wordmark here — the menu opens from a header already showing it. */}
          <div className="flex h-8 items-center justify-end">
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-button transition-colors duration-120 ease-signal hover:bg-surface-raised"
            >
              <span className="sr-only">Tutup menu</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                aria-hidden="true"
                fill="none"
              >
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>

          <nav aria-label="Navigasi utama" className="mt-12 flex flex-col gap-5">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "font-display text-lg transition-colors duration-120 ease-signal",
                    active ? "text-text" : "text-text-muted",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {isApp ? (
            <div className="mt-auto">
              <TombolKeluar />
            </div>
          ) : (
            <Link
              href="/login"
              onClick={closeMenu}
              className="mt-auto flex h-10 items-center justify-center rounded-button bg-accent px-5 text-sm font-medium text-[var(--color-panel-white)] transition-colors duration-120 ease-signal"
            >
              Masuk
            </Link>
          )}
        </div>
      </dialog>
    </>
  );
}
