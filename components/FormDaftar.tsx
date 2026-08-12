"use client";

import Link from "next/link";
import { useState } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { createClient } from "@/lib/supabase/client";

/**
 * Create an account: nama, NPM, email, password.
 *
 * `role` is NOT a field here and must never become one — the database defaults
 * every new profil to 'praktikan' and only an existing asisten can promote
 * someone (backend.md). A self-selected role means grading yourself.
 *
 * nama and npm ride along in user_metadata; the signup trigger copies them
 * into `profil`.
 */
export default function FormDaftar() {
  const [nama, setNama] = useState("");
  const [npm, setNpm] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [error, setError] = useState<string>();
  const [errorNpm, setErrorNpm] = useState<string>();
  const [kirim, setKirim] = useState(false);
  const [selesai, setSelesai] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!/^\d{8,12}$/.test(npm.trim())) {
      setErrorNpm("NPM harus 8–12 digit angka.");
      return;
    }
    setErrorNpm(undefined);
    setKirim(true);
    setError(undefined);

    const sb = createClient();
    const { error: gagal } = await sb.auth.signUp({
      email: email.trim(),
      password: sandi,
      options: { data: { nama: nama.trim(), npm: npm.trim() } },
    });

    setKirim(false);
    if (gagal) {
      setError(
        gagal.message.includes("already registered")
          ? "Email ini sudah terdaftar."
          : gagal.message,
      );
      return;
    }
    setSelesai(true);
  }

  if (selesai) {
    return (
      <div className="w-full max-w-prose">
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
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-prose space-y-5">
      <div>
        <h1 className="font-display text-xl font-medium text-text">Buat akun</h1>
        <p className="mt-2 text-sm text-text-muted">
          Untuk praktikan Laboratorium Sistem Kendali.
        </p>
      </div>

      <Input
        id="nama"
        label="Nama lengkap"
        autoComplete="name"
        required
        value={nama}
        onChange={(e) => setNama(e.target.value)}
      />
      <Input
        id="npm"
        label="NPM"
        inputMode="numeric"
        required
        value={npm}
        error={errorNpm}
        hint="Nomor Pokok Mahasiswa, angka saja"
        onChange={(e) => setNpm(e.target.value)}
      />
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
        autoComplete="new-password"
        required
        minLength={8}
        value={sandi}
        error={error}
        hint="Minimal 8 karakter"
        onChange={(e) => setSandi(e.target.value)}
      />

      <Button
        type="submit"
        loading={kirim}
        disabled={!nama.trim() || !npm.trim() || !email.trim() || sandi.length < 8}
      >
        Buat akun
      </Button>

      <p className="text-meta text-text-muted">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-accent-text underline decoration-1 underline-offset-2 hover:text-text"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}
