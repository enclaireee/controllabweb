import Link from "next/link";

import {
  formatTanggal,
  rataRata,
  sisaHari,
  type ModulPraktikan,
} from "@/lib/praktikum";

/**
 * design.md §6 — the signature element, simplified.
 *
 * One modul per row: pretest done or not, laporan submitted or not, and the
 * average once all three scores exist. Renders a <tr>; the parent supplies the
 * table. A real table is what keeps eight rows aligned down a column.
 *
 * "Exactly one accent mark on whatever needs attention" — the left rule.
 */

function Tanda({ ada, label }: { ada: boolean; label: string }) {
  return (
    <span className={ada ? "text-meta text-success" : "text-meta text-text-muted"}>
      {ada ? "✓ " : "— "}
      {label}
    </span>
  );
}

export default function StatusRow({ modul }: { modul: ModulPraktikan }) {
  const p = modul.penilaian;
  const rata = rataRata(p);
  const sisa = modul.laporanDeadline ? sisaHari(modul.laporanDeadline) : null;

  const terlambat = !p.laporanTautan && sisa !== null && sisa < 0;
  const segera = !p.laporanTautan && sisa !== null && sisa >= 0 && sisa <= 3;

  return (
    <tr className="border-t border-border">
      <th
        scope="row"
        className={
          "relative py-3 pl-5 pr-5 text-left align-top font-normal " +
          "before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 " +
          (terlambat
            ? "before:bg-accent"
            : segera
              ? "before:bg-warning"
              : "before:bg-transparent")
        }
      >
        <Link
          href={`/praktikum/${modul.slug}`}
          className="text-sm text-text transition-colors duration-120 ease-signal hover:text-accent-text"
        >
          <span className="font-mono text-text-muted" data-numeric>
            {String(modul.urutan).padStart(2, "0")}
          </span>{" "}
          {modul.judul}
        </Link>
        {modul.laporanDeadline && (
          <p className="mt-1 text-meta text-text-muted">
            Deadline {formatTanggal(modul.laporanDeadline)}
            {terlambat && <span className="text-danger"> · terlewat</span>}
            {segera && (
              <span className="text-warning">
                {" "}
                · {sisa === 0 ? "hari ini" : `${sisa} hari lagi`}
              </span>
            )}
          </p>
        )}
      </th>

      <td className="px-5 py-3 align-top">
        <Tanda ada={p.pretestSelesai} label="Pretest" />
      </td>

      <td className="px-5 py-3 align-top">
        <Tanda ada={!!p.laporanTautan} label="Laporan" />
      </td>

      <td className="px-5 py-3 align-top">
        {rata === null ? (
          <span className="text-meta text-text-muted">Belum dinilai</span>
        ) : (
          <span className="font-mono text-sm text-success" data-numeric>
            {rata}
            <span className="sr-only"> rata-rata</span>
          </span>
        )}
      </td>
    </tr>
  );
}
