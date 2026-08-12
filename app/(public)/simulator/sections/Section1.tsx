import Link from "next/link";

/**
 * Index of the simulators. This page was a placeholder, which is why
 * /simulator/pole-zero was unreachable by clicking — nothing linked to it.
 *
 * `siap: false` entries are routes that exist but still render a placeholder.
 * They are listed and visibly marked rather than hidden, so nobody has to grep
 * the filesystem to find out what exists.
 */
const SIMULATOR = [
  {
    slug: "pole-zero",
    judul: "Pole-Zero",
    ringkas:
      "Geser pole dan zero di bidang-s, lihat step response, impulse, Bode, dan permukaan |H(s)|.",
    siap: true,
  },
  { slug: "step-response", judul: "Step Response", ringkas: "Respons sistem terhadap masukan step.", siap: false },
  { slug: "bode-plot", judul: "Bode Plot", ringkas: "Magnitude dan fasa terhadap frekuensi.", siap: false },
  { slug: "root-locus", judul: "Root Locus", ringkas: "Lintasan akar terhadap perubahan gain.", siap: false },
  { slug: "pid-tuning", judul: "PID Tuning", ringkas: "Pengaruh Kp, Ki, dan Kd terhadap respons.", siap: false },
];

export default function Section1() {
  return (
    <div className="mx-auto max-w-content px-5 py-20 tablet:px-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-text">
        Simulator
      </h1>
      <p className="mt-3 max-w-prose text-base text-text-muted">
        Alat interaktif untuk melihat perilaku sistem kendali secara langsung.
      </p>

      <ul className="mt-12 grid grid-cols-1 gap-5 tablet:grid-cols-2">
        {SIMULATOR.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/simulator/${s.slug}`}
              className="block h-full rounded-card border border-border bg-surface p-8 transition-colors duration-120 ease-signal hover:bg-surface-raised"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-display text-lg font-medium text-text">
                  {s.judul}
                </span>
                {!s.siap && (
                  <span className="rounded-tag border border-border px-2 py-1 font-mono text-meta text-text-muted">
                    Segera
                  </span>
                )}
              </span>
              <span className="mt-3 block text-sm text-text-muted">
                {s.ringkas}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
