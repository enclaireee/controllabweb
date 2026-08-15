"use client";

import { useState } from "react";

import ScoreInput from "@/components/ScoreInput";
import {
  rataRata,
  type BarisRoster,
  type KolomNilai,
  type Penilaian,
} from "@/lib/praktikum";

const KOLOM: { kunci: KolomNilai; label: string }[] = [
  { kunci: "nilaiPretest", label: "Pretest" },
  { kunci: "nilaiQna", label: "Tanya Jawab" },
  { kunci: "nilaiLaprak", label: "Laporan" },
];

const TH =
  "px-5 pb-3 pt-5 text-left font-mono text-meta font-normal uppercase tracking-wide text-text-muted";

export default function RosterTable({
  modulId,
  roster,
}: {
  modulId: string;
  roster: BarisRoster[];
}) {

  const [nilai, setNilai] = useState<Record<string, Penilaian>>(() =>
    Object.fromEntries(roster.map((b) => [b.praktikanId, b.penilaian])),
  );

  const perbarui = (id: string, kolom: KolomNilai, v: number | null) =>
    setNilai((n) => ({ ...n, [id]: { ...n[id], [kolom]: v } }));

  return (
    <>
      <p className="mb-5 rounded-card border border-border bg-surface p-3 text-meta text-text-muted tablet:hidden">
        Penilaian butuh layar minimal 768px. Di layar ini nilai hanya bisa
        dilihat.
      </p>

      <div className="overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Nilai setiap praktikan untuk modul ini.
          </caption>
          <thead>
            <tr>
              <th scope="col" className={TH}>
                Praktikan
              </th>
              {KOLOM.map((k) => (
                <th key={k.kunci} scope="col" className={`${TH} w-32`}>
                  {k.label}
                </th>
              ))}
              <th scope="col" className={`${TH} w-28`}>
                Rata-rata
              </th>
              <th scope="col" className={`${TH} w-56`}>
                Laporan
              </th>
            </tr>
          </thead>
          <tbody>
            {roster.map((b) => {
              const p = nilai[b.praktikanId];
              const rata = rataRata(p);
              return (
                <tr key={b.praktikanId} className="border-t border-border">
                  <th
                    scope="row"
                    className="px-5 py-3 text-left align-top font-normal"
                  >
                    <span className="text-sm text-text">{b.nama}</span>
                    <p
                      className="mt-1 font-mono text-meta text-text-muted"
                      data-numeric
                    >
                      {b.npm}
                      {!p.pretestSelesai && (
                        <span className="text-warning"> · pretest belum ditandai</span>
                      )}
                    </p>
                  </th>

                  {KOLOM.map((k) => (
                    <td key={k.kunci} className="px-5 py-3 align-top">
                      <div className="hidden tablet:block">
                        <ScoreInput
                          modulId={modulId}
                          praktikanId={b.praktikanId}
                          kolom={k.kunci}
                          awal={p[k.kunci]}
                          label={`${k.label} — ${b.nama}`}
                          onTersimpan={(v) => perbarui(b.praktikanId, k.kunci, v)}
                        />
                      </div>
                      <p
                        className="font-mono text-sm text-text tabular-nums tablet:hidden"
                        data-numeric
                      >
                        {p[k.kunci] ?? "—"}
                      </p>
                    </td>
                  ))}

                  <td className="px-5 py-3 align-top">
                    <span
                      className={`font-mono text-sm tabular-nums ${rata === null ? "text-text-muted" : "text-success"}`}
                      data-numeric
                      aria-live="polite"
                    >
                      {rata ?? "—"}
                    </span>
                  </td>

                  <td className="px-5 py-3 align-top">
                    {p.laporanTautan ? (
                      <>
                        <a
                          href={p.laporanTautan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-meta text-accent-text underline decoration-1 underline-offset-2 transition-colors duration-120 ease-signal hover:text-text"
                        >
                          Buka
                        </a>
                        <p
                          className="mt-1 max-w-52 truncate font-mono text-meta text-text-muted"
                          title={p.laporanTautan}
                        >
                          {p.laporanTautan}
                        </p>
                      </>
                    ) : (
                      <span className="text-meta text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
