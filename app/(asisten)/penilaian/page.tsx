import Link from "next/link";

import { ambilSemuaModul, formatTanggal } from "@/lib/praktikum";

export const metadata = { title: "Penilaian — Controllab" };

/** The asisten's only destination: pick a modul, then grade its sheet. */
export default async function PenilaianPage() {
  const modul = await ambilSemuaModul();

  return (
    <div className="mx-auto max-w-content px-5 py-12 tablet:px-8">
      <h1 className="font-display text-xl font-medium text-text">Penilaian</h1>
      <p className="mt-2 font-mono text-meta uppercase tracking-wide text-text-muted">
        Pilih modul untuk menilai
      </p>

      <ul className="mt-12 overflow-hidden rounded-card border border-border bg-surface">
        {modul.map((m) => (
          <li key={m.id} className="border-b border-border last:border-b-0">
            <Link
              href={`/penilaian/${m.slug}`}
              className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-3 transition-colors duration-120 ease-signal hover:bg-surface-raised"
            >
              <span className="text-sm text-text">
                <span className="font-mono text-text-muted" data-numeric>
                  {String(m.urutan).padStart(2, "0")}
                </span>{" "}
                {m.judul}
              </span>
              {m.laporanDeadline && (
                <span className="text-meta text-text-muted">
                  Deadline {formatTanggal(m.laporanDeadline)}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
