"use client";

import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[var(--container-content)]">
      <nav className="bg-surface/90 backdrop-blur-md border border-border rounded-card px-6 py-3 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-text text-lg">
          <span className="bg-accent text-white px-2 py-0.5 rounded-button text-sm font-mono">
            LAB
          </span>
          <span>CONTROLLAB</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-semibold text-text">
          <Link href="/about" className="hover:text-accent transition-colors">
            About
          </Link>
          <Link href="/materi" className="hover:text-accent transition-colors">
            Practicum
          </Link>
          <Link href="/simulator" className="hover:text-accent transition-colors">
            Simulator
          </Link>
          <Link href="/about#assistants" className="hover:text-accent transition-colors">
            Assistants
          </Link>
          <Link href="/about#contacts" className="hover:text-accent transition-colors">
            Contacts
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="bg-accent hover:bg-accent-deep text-white text-sm font-medium px-4 py-2 rounded-button transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}