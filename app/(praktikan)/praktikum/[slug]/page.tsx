import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonClass } from "@/components/Button";
import CekPretest from "@/components/CekPretest";
import FormLaporan from "@/components/FormLaporan";
import PdfPane from "@/components/PdfPane";
import { formatTanggal, rataRata, sisaHari } from "@/lib/praktikum";
import { ambilModul } from "@/lib/praktikum.queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const m = await ambilModul(slug);
  return { title: m ? `${m.judul} — Controllab` : "Modul tidak ditemukan" };
}

export default async function ModulPage({ params }: Props) {
  const { slug } = await params;
  const modul = await ambilModul(slug);
  if (!modul) notFound();

  const p = modul.penilaian;
  const rata = rataRata(p);
  const lewatDeadline =
    !!modul.laporanDeadline && sisaHari(modul.laporanDeadline) < 0;

  const nilaiCell = (label: string, n: number | null) => (
    <div key={label}>
      <dt className="font-mono text-meta uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm" data-numeric>
        {n === null ? (
          <span className="text-text-muted">—</span>
        ) : (
          <span className="text-text">{n}</span>
        )}
      </dd>
    </div>
  );

  return (
    <div className="mx-auto max-w-content px-5 py-12 tablet:px-8">
      <Link
        href="/praktikum"
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

      <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5 border-y border-border py-5">
        {nilaiCell("Pretest", p.nilaiPretest)}
        {nilaiCell("Tanya Jawab", p.nilaiQna)}
        {nilaiCell("Laporan", p.nilaiLaprak)}
        <div>
          <dt className="font-mono text-meta uppercase tracking-wide text-text-muted">
            Rata-rata
          </dt>
          <dd className="mt-1 font-mono text-sm" data-numeric>
            {rata === null ? (
              <span className="text-text-muted">Belum lengkap</span>
            ) : (
              <span className="text-success">{rata}</span>
            )}
          </dd>
        </div>
      </dl>

      <section className="mt-20">
        <h2 className="font-display text-lg font-medium text-text">Materi</h2>
        <div className="mt-5">
          <PdfPane url={modul.pdfUrl} judul={modul.judul} />
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-lg font-medium text-text">Pretest</h2>
        <div className="mt-5 max-w-prose rounded-card border border-border bg-surface p-8">
          {modul.pretestUrl ? (
            <>
              <p className="text-sm text-text-body">
                Pretest dikerjakan lewat Google Form. Kerjakan sebelum praktikum
                dimulai.
              </p>
              <a
                href={modul.pretestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("primary", "mt-5")}
              >
                Buka form pretest
              </a>
              <CekPretest modulId={modul.id} awal={p.pretestSelesai} />
            </>
          ) : (
            <p className="text-sm text-text-muted">
              Link pretest belum dipasang asisten.
            </p>
          )}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-lg font-medium text-text">
          Laporan praktikum
        </h2>
        {modul.laporanDeadline && (
          <p className="mt-2 text-meta text-text-muted">
            Deadline {formatTanggal(modul.laporanDeadline)}
            {lewatDeadline && <span className="text-danger"> · terlewat</span>}
          </p>
        )}
        <div className="mt-5 max-w-prose">
          <FormLaporan
            modulId={modul.id}
            tautanAwal={p.laporanTautan}
            lewatDeadline={lewatDeadline}
          />
        </div>
      </section>
    </div>
  );
}
