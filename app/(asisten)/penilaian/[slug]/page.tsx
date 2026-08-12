import Link from "next/link";
import { notFound } from "next/navigation";

import RosterTable from "@/components/RosterTable";
import { ambilModul, ambilRoster, formatTanggal } from "@/lib/praktikum";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const m = await ambilModul(slug);
  return { title: m ? `Penilaian ${m.judul} — Controllab` : "Penilaian" };
}

export default async function PenilaianModulPage({ params }: Props) {
  const { slug } = await params;
  const [modul, roster] = await Promise.all([ambilModul(slug), ambilRoster(slug)]);
  if (!modul) notFound();

  return (
    <div className="mx-auto max-w-content px-5 py-12 tablet:px-8">
      <header className="mb-12">
        <Link
          href="/penilaian"
          className="text-meta text-text-muted transition-colors duration-120 ease-signal hover:text-text"
        >
          ← Semua modul
        </Link>
        <h1 className="mt-3 font-display text-xl font-medium text-text">
          <span className="font-mono text-text-muted" data-numeric>
            {String(modul.urutan).padStart(2, "0")}
          </span>{" "}
          {modul.judul}
        </h1>
        <p className="mt-2 font-mono text-meta uppercase tracking-wide text-text-muted">
          {roster.length} praktikan
          {modul.laporanDeadline && (
            <>
              <span aria-hidden="true" className="px-3 text-border-strong">
                /
              </span>
              Deadline {formatTanggal(modul.laporanDeadline)}
            </>
          )}
        </p>
      </header>

      {roster.length === 0 ? (
        <p className="rounded-card border border-border bg-surface p-8 text-sm text-text-muted">
          Belum ada praktikan terdaftar.
        </p>
      ) : (
        <RosterTable modulId={modul.id} roster={roster} />
      )}
    </div>
  );
}
