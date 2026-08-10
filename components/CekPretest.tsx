"use client";

import { useState } from "react";

import { tandaiPretest } from "@/lib/praktikum";

/**
 * "Sudah mengerjakan pretest" — the praktikan ticks this themselves after
 * submitting the Google Form.
 *
 * Honour system by design: the authoritative record is the Form's own
 * responses, and the asisten enters the score from there. This checkbox exists
 * so a praktikan can see their own progress, not to prove anything.
 */
export default function CekPretest({
  modulId,
  awal,
}: {
  modulId: string;
  awal: boolean;
}) {
  const [selesai, setSelesai] = useState(awal);
  const [pesan, setPesan] = useState("");

  async function ubah(nilai: boolean) {
    setSelesai(nilai); // optimistic — a checkbox that lags feels broken
    const hasil = await tandaiPretest(modulId, nilai);
    if (!hasil.ok) {
      setSelesai(!nilai);
      setPesan("Gagal menyimpan. Coba lagi.");
      return;
    }
    setPesan(nilai ? "Ditandai sudah dikerjakan." : "Tanda dihapus.");
  }

  return (
    <div className="mt-5">
      <label className="flex cursor-pointer items-center gap-3 text-sm text-text">
        <input
          type="checkbox"
          checked={selesai}
          onChange={(e) => ubah(e.target.checked)}
          className="size-4 accent-accent"
        />
        Saya sudah mengerjakan pretest
      </label>
      <p aria-live="polite" className="mt-2 text-meta text-text-muted">
        {pesan}
      </p>
    </div>
  );
}
