"use client";

import { useState } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { kirimLaporan } from "@/lib/praktikum";

/**
 * Laporan is submitted as a Google Drive link, not a file upload.
 *
 * Client-side validation mirrors the server; it does not replace it. The RPC
 * re-checks the URL and the deadline — hiding a button is not enforcement.
 */
export default function FormLaporan({
  modulId,
  tautanAwal,
  lewatDeadline,
}: {
  modulId: string;
  tautanAwal: string | null;
  lewatDeadline: boolean;
}) {
  const [tautan, setTautan] = useState(tautanAwal ?? "");
  const [error, setError] = useState<string>();
  const [mengirim, setMengirim] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);

  if (lewatDeadline && !tautanAwal) {
    return (
      <p className="text-sm text-danger">
        Deadline laporan sudah lewat. Hubungi asisten jika ada kendala.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMengirim(true);
    setError(undefined);
    const hasil = await kirimLaporan(modulId, tautan.trim());
    setMengirim(false);
    if (hasil.ok) setTersimpan(true);
    else setError(hasil.pesan);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Input
        id="tautan-laporan"
        label="Tautan Google Drive"
        type="url"
        inputMode="url"
        placeholder="https://drive.google.com/..."
        value={tautan}
        error={error}
        hint={
          tautanAwal
            ? "Sudah terkumpul. Mengirim ulang akan mengganti tautan sebelumnya."
            : "Pastikan aksesnya terbuka untuk asisten sebelum mengirim."
        }
        onChange={(e) => {
          setTautan(e.target.value);
          setTersimpan(false);
        }}
      />
      <div className="flex items-center gap-5">
        <Button type="submit" loading={mengirim} disabled={!tautan.trim()}>
          {tautanAwal ? "Perbarui tautan" : "Kumpulkan laporan"}
        </Button>
        <p aria-live="polite" className="text-meta text-success">
          {tersimpan ? "Tautan tersimpan." : ""}
        </p>
      </div>
    </form>
  );
}
