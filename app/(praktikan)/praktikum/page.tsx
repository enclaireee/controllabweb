import StatusRow from "@/components/StatusRow";
import { ambilModulPraktikan } from "@/lib/praktikum.queries";

export const metadata = { title: "Praktikum — Controllab" };

const TH =
  "px-5 pb-3 pt-5 text-left font-mono text-meta font-normal uppercase tracking-wide text-text-muted";

export default async function PraktikumPage() {
  const modul = await ambilModulPraktikan();

  return (
    <div className="mx-auto max-w-content px-5 py-12 tablet:px-8">
      <header className="mb-12">
        <h1 className="font-display text-xl font-medium text-text">Praktikum</h1>
      </header>

      <div className="overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Daftar modul praktikum beserta status pretest, laporan, dan nilai
            rata-rata.
          </caption>
          <thead>
            <tr>
              <th scope="col" className={TH}>
                Modul
              </th>
              <th scope="col" className={`${TH} w-36`}>
                Pretest
              </th>
              <th scope="col" className={`${TH} w-36`}>
                Laporan
              </th>
              <th scope="col" className={`${TH} w-32`}>
                Nilai
              </th>
            </tr>
          </thead>
          <tbody>
            {modul.map((m) => (
              <StatusRow key={m.id} modul={m} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-meta text-text-muted">
        Nilai rata-rata muncul setelah asisten mengisi ketiga komponen (pretest,
        tanya jawab, laporan).
      </p>
    </div>
  );
}
