"use client";

import { useRef, useState } from "react";

import { validasiNilai, type KolomNilai } from "@/lib/praktikum";
import { simpanNilai } from "@/lib/praktikum.actions";

export default function ScoreInput({
  modulId,
  praktikanId,
  kolom,
  awal,
  label,
  onTersimpan,
}: {
  modulId: string;
  praktikanId: string;
  kolom: KolomNilai;
  awal: number | null;
  label: string;

  onTersimpan: (nilai: number | null) => void;
}) {
  const [teks, setTeks] = useState(awal === null ? "" : String(awal));
  const [error, setError] = useState<string>();
  const [kilat, setKilat] = useState(false);
  const [pesan, setPesan] = useState("");
  const tersimpan = useRef(awal === null ? "" : String(awal));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function simpan() {
    const mentah = teks.trim();
    if (mentah === tersimpan.current) return;

    const hasil = validasiNilai(mentah);
    if ("pesan" in hasil) {
      setError(hasil.pesan);
      setPesan(`${label}: ${hasil.pesan}`);
      return;
    }

    setError(undefined);
    const tulis = await simpanNilai(modulId, praktikanId, kolom, hasil.nilai);
    if (!tulis.ok) {
      setError("Gagal disimpan");
      setPesan(`${label}: gagal disimpan`);
      return;
    }

    tersimpan.current = mentah;
    onTersimpan(hasil.nilai);
    setPesan(`${label}: tersimpan`);
    setKilat(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setKilat(false), 400);
  }

  return (
    <div className="w-20">
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        aria-invalid={error ? true : undefined}
        value={teks}
        onChange={(e) => {
          setTeks(e.target.value);
          setError(undefined);
        }}
        onBlur={simpan}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void simpan();
          }
        }}
        className={
          "h-10 w-full rounded-button border px-3 text-center font-mono text-sm text-text tabular-nums " +
          "transition-colors duration-180 ease-signal " +
          "hover:border-text-muted focus:border-accent " +
          (error ? "border-danger " : "border-border-strong ") +
          (kilat ? "bg-success/12" : "bg-surface")
        }
      />
      {error && <p className="mt-1 text-meta text-danger">{error}</p>}
      <p aria-live="polite" className="sr-only">
        {pesan}
      </p>
    </div>
  );
}
