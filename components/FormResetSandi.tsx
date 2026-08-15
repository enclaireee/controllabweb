"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { createClient } from "@/lib/supabase/client";

export default function FormResetSandi() {
  const router = useRouter();
  const [sandi, setSandi] = useState("");
  const [ulang, setUlang] = useState("");
  const [error, setError] = useState<string>();
  const [kirim, setKirim] = useState(false);

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sandi !== ulang) {
      setError("Kedua kata sandi tidak sama.");
      return;
    }
    setKirim(true);
    setError(undefined);

    const { error: gagal } = await createClient().auth.updateUser({
      password: sandi,
    });
    setKirim(false);

    if (gagal) {
      setError(
        gagal.message.includes("session")
          ? "Tautan sudah kedaluwarsa. Minta tautan baru."
          : gagal.message,
      );
      return;
    }
    router.push("/praktikum");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="w-full max-w-prose space-y-5">
      <div>
        <h1 className="font-display text-xl font-medium text-text">
          Kata sandi baru
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Minimal 8 karakter.
        </p>
      </div>

      <Input
        id="sandi"
        label="Kata sandi baru"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={sandi}
        onChange={(e) => setSandi(e.target.value)}
      />
      <Input
        id="ulang"
        label="Ulangi kata sandi"
        type="password"
        autoComplete="new-password"
        required
        value={ulang}
        error={error}
        onChange={(e) => setUlang(e.target.value)}
      />

      <Button type="submit" loading={kirim} disabled={sandi.length < 8 || !ulang}>
        Simpan kata sandi
      </Button>
    </form>
  );
}
