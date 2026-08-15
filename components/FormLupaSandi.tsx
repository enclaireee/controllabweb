"use client";

import Link from "next/link";
import { useState, type SubmitEvent } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { createClient } from "@/lib/supabase/client";

export default function FormLupaSandi() {
  const [email, setEmail] = useState("");
  const [kirim, setKirim] = useState(false);
  const [selesai, setSelesai] = useState(false);

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setKirim(true);
    const sb = createClient();
    await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-sandi`,
    });
    setKirim(false);
    setSelesai(true);
  }

  if (selesai) {
    return (
      <div className="w-full max-w-prose">
        <h1 className="font-display text-xl font-medium text-text">
          Cek email kamu
        </h1>
        <p className="mt-3 text-sm text-text-body">
          Kalau <span className="font-mono text-text">{email}</span> terdaftar,
          tautan untuk mengganti kata sandi sudah dikirim ke sana.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block text-sm text-accent-text underline decoration-1 underline-offset-2 hover:text-text"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-prose space-y-5">
      <div>
        <h1 className="font-display text-xl font-medium text-text">
          Lupa kata sandi
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Masukkan email akunmu. Kami kirim tautan untuk menggantinya.
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

      <Button type="submit" loading={kirim} disabled={!email.trim()}>
        Kirim tautan
      </Button>

      <p className="text-meta text-text-muted">
        <Link
          href="/login"
          className="text-accent-text underline decoration-1 underline-offset-2 hover:text-text"
        >
          Kembali ke masuk
        </Link>
      </p>
    </form>
  );
}
