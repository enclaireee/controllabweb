"use client";

import Link from "next/link";
import { useState, type SubmitEvent } from "react";

import { createClient } from "@/lib/supabase/client";

export default function Section1() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [npm, setNpm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);

  const handleRegister = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^\d{8,12}$/.test(npm.trim())) {
      setErrorMsg("NPM harus 8–12 digit angka.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { nama: fullName.trim(), npm: npm.trim() },
      },
    });

    setLoading(false);
    if (error) {
      setErrorMsg(
        error.message.includes("already registered")
          ? "Email ini sudah terdaftar."
          : error.message,
      );
      return;
    }
    setDone(true);
  };

  const field =
    "h-10 w-full rounded-button border border-border-strong bg-surface px-3 text-sm text-text " +
    "transition-colors duration-120 ease-signal placeholder:text-text-muted " +
    "hover:border-text-muted focus:border-accent";
  const labelCls = "text-meta font-medium text-text";

  if (done) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5 py-20">
        <div className="w-full max-w-prose rounded-card border border-border bg-surface p-8">
          <h1 className="font-display text-xl font-medium text-text">
            Cek email kamu
          </h1>
          <p className="mt-3 text-sm text-text-body">
            Kami mengirim tautan konfirmasi ke{" "}
            <span className="font-mono text-text">{email}</span>. Buka tautannya,
            lalu masuk.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block text-sm text-accent-text underline decoration-1 underline-offset-2 hover:text-text"
          >
            Ke halaman masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-20">
      <div className="w-full max-w-prose rounded-card border border-border bg-surface p-8">
        <h1 className="font-display text-xl font-medium text-text">Buat Akun</h1>
        <p className="mt-2 text-sm text-text-muted">
          Untuk praktikan Laboratorium Sistem Kendali.
        </p>

        {errorMsg && (
          <p
            role="alert"
            className="mt-5 rounded-button border border-danger px-3 py-2 text-meta text-danger"
          >
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="nama" className={labelCls}>
              Nama lengkap
            </label>
            <input
              id="nama"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={field}
              placeholder="Nama kamu"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="npm" className={labelCls}>
              NPM
            </label>
            <input
              id="npm"
              type="text"
              inputMode="numeric"
              required
              value={npm}
              onChange={(e) => setNpm(e.target.value)}
              className={field}
              placeholder="2106701234"
              aria-describedby="npm-hint"
            />
            <p id="npm-hint" className="text-meta text-text-muted">
              Nomor Pokok Mahasiswa, angka saja
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={labelCls}>
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
            <label htmlFor="password" className={labelCls}>
              Kata sandi
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
              placeholder="Minimal 8 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading || undefined}
            className="inline-flex h-10 items-center justify-center rounded-button bg-accent px-5 text-sm font-medium text-on-accent transition-colors duration-120 ease-signal hover:bg-accent-hover active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Buat akun"}
          </button>
        </form>

        <p className="mt-8 text-meta text-text-muted">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-accent-text underline decoration-1 underline-offset-2 hover:text-text"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
