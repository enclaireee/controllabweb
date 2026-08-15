"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import TombolKeluar from "@/components/TombolKeluar";

export type NavItem = { href: string; label: string };

const PUBLIC_NAV: NavItem[] = [
  { href: "/praktikum", label: "Praktikum" },
  { href: "/simulator", label: "Simulator" },
  { href: "/about", label: "About" },
];

export const NAV_PRAKTIKAN: NavItem[] = [
  { href: "/praktikum", label: "Praktikum" },
];

export const NAV_ASISTEN: NavItem[] = [
  { href: "/asisten", label: "Penilaian" },
];

const RUTE_AUTH = ["/login", "/register", "/lupa-sandi", "/reset-sandi"];

export default function SiteHeader({
  variant = "marketing",
  nav: navProp,
  identitas,
}: {
  variant?: "marketing" | "app";

  nav?: NavItem[];
  identitas?: { nama: string; npm: string };
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isApp = variant === "app";
  const nav = navProp ?? (isApp ? NAV_PRAKTIKAN : PUBLIC_NAV);

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

  useEffect(() => () => void (document.body.style.overflow = ""), []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const diHalamanAuth = RUTE_AUTH.includes(pathname);

  return (
    <>

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

          "transition-[height,background-color,border-color] duration-180 ease-signal",
          isApp || scrolled
            ? "h-14 border-border bg-surface"
            : "h-18 border-transparent bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-5 tablet:px-8">
          <Link

            href="/"
            className="flex items-center gap-2 font-display text-base font-medium text-text"
          >

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

            {isApp && identitas?.nama && (
              <span className="hidden font-mono text-meta text-text-muted tablet:inline">
                {identitas.nama}
                {identitas.npm && (
                  <>
                    <span aria-hidden="true" className="px-2 text-border-strong">
                      /
                    </span>
                    <span data-numeric>{identitas.npm}</span>
                  </>
                )}
              </span>
            )}
            {isApp && (
              <span className="hidden tablet:inline">
                <TombolKeluar />
              </span>
            )}
            {!isApp && !diHalamanAuth && (
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
              {identitas?.nama && (
                <p className="mb-5 font-mono text-meta text-text-muted">
                  {identitas.nama}
                  {identitas.npm && (
                    <>
                      <span aria-hidden="true" className="px-2 text-border-strong">
                        /
                      </span>
                      <span data-numeric>{identitas.npm}</span>
                    </>
                  )}
                </p>
              )}
              <TombolKeluar />
            </div>
          ) : diHalamanAuth ? null : (
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
