"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { createClient } from "@/lib/supabase/client";

/**
 * Minimal email + password sign-in.
 *
 * INTERIM. Auth belongs to whoever owns the (auth) group — this exists so the
 * praktikum system has a session to run against, because every query is behind
 * RLS and returns nothing without one. Restyle it, replace it, or delete it
 * once the real page lands; nothing in lib/praktikum.ts depends on this file.
 *
 * Registration is deliberately not here. Accounts are created in the Supabase
 * dashboard (backend.md Step 12) so that role can never be self-selected.
 */
export default function FormLogin({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [error, setError] = useState<string>();
  const [masuk, setMasuk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMasuk(true);
    setError(undefined);

    const sb = createClient();
    const { error: gagal } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password: sandi,
    });

    if (gagal) {
      setMasuk(false);
      // §8 — say what happened. Supabase returns English; this is the common case.
      setError(
        gagal.message === "Invalid login credentials"
          ? "Email atau kata sandi salah."
          : gagal.message,
      );
      return;
    }

    // refresh() re-runs the Server Components with the new session cookie;
    // push() alone would render them with the old, empty one.
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="w-full max-w-prose space-y-5">
      <div>
        <h1 className="font-display text-xl font-medium text-text">Masuk</h1>
        <p className="mt-2 text-sm text-text-muted">
          Gunakan akun yang didaftarkan asisten.
        </p>
      </div>

      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        id="sandi"
        label="Kata sandi"
        type="password"
        autoComplete="current-password"
        required
        value={sandi}
        onChange={(e) => setSandi(e.target.value)}
        error={error}
      />

      <Button type="submit" loading={masuk} disabled={!email.trim() || !sandi}>
        Masuk
      </Button>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-meta text-text-muted">
        <Link
          href="/lupa-sandi"
          className="text-accent-text underline decoration-1 underline-offset-2 hover:text-text"
        >
          Lupa kata sandi
        </Link>
        <Link
          href="/register"
          className="text-accent-text underline decoration-1 underline-offset-2 hover:text-text"
        >
          Buat akun
        </Link>
      </div>
    </form>
  );
}
