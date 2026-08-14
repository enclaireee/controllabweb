"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";

import { createClient } from "@/lib/supabase/client";

export default function Section1({ next = "/praktikum" }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();

  const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(
        error.message === "Invalid login credentials"
          ? "Email atau kata sandi salah."
          : error.message,
      );
      setLoading(false);
    } else {
      router.push(next);
      // Re-runs the Server Components with the new session cookie; without it
      // they render with the old, empty one.
      router.refresh();
    }
  };

  const field =
    "h-10 w-full rounded-button border border-border-strong bg-surface px-3 text-sm text-text " +
    "transition-colors duration-120 ease-signal placeholder:text-text-muted " +
    "hover:border-text-muted focus:border-accent";

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-20">
      <div className="w-full max-w-prose rounded-card border border-border bg-surface p-8">
        <h1 className="font-display text-xl font-medium text-text">
          Masuk ke Akun
        </h1>

        {errorMsg && (
          <p
            role="alert"
            className="mt-5 rounded-button border border-danger px-3 py-2 text-meta text-danger"
          >
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-meta font-medium text-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
              placeholder="nama@email.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-meta font-medium text-text">
              Kata sandi
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading || undefined}
            className="inline-flex h-10 items-center justify-center rounded-button bg-accent px-5 text-sm font-medium text-on-accent transition-colors duration-120 ease-signal hover:bg-accent-hover active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-meta">
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
      </div>
    </div>
  );
}
