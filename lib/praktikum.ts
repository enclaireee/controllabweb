/**
 * Praktikum data layer.
 *
 * PLACEHOLDER — returns fixed data so the UI works before Supabase is set up.
 * Types mirror `backend.md` exactly; swapping to real queries means rewriting
 * the function bodies below and nothing else.
 *
 * Shape, deliberately flat: ONE row per (modul, praktikan), carrying three
 * numbers. There is no komponen enum and no per-component row — the pretest is
 * a Google Form, so there is nothing to model beyond "did they do it".
 */

export type Modul = {
  id: string;
  urutan: number;
  slug: string;
  judul: string;
  deskripsi: string | null;
  /** Direct link to the modul PDF. Previewed in an iframe. */
  pdfUrl: string | null;
  /** Google Form for the pretest. */
  pretestUrl: string | null;
  laporanDeadline: string | null;
};

export type Penilaian = {
  /** Praktikan ticks this themselves after submitting the Form. */
  pretestSelesai: boolean;
  laporanTautan: string | null;
  nilaiPretest: number | null;
  nilaiQna: number | null;
  nilaiLaprak: number | null;
};

export type ModulPraktikan = Modul & { penilaian: Penilaian };

export type BarisRoster = {
  praktikanId: string;
  nama: string;
  npm: string;
  penilaian: Penilaian;
};

export const PENILAIAN_KOSONG: Penilaian = {
  pretestSelesai: false,
  laporanTautan: null,
  nilaiPretest: null,
  nilaiQna: null,
  nilaiLaprak: null,
};

/**
 * Plain mean of the three scores, or null until all three exist.
 *
 * Deliberately null on a partial set: an "85" derived from one entered score
 * reads as a final grade and is the kind of number that ends up in a complaint.
 */
export function rataRata(p: Penilaian): number | null {
  const n = [p.nilaiPretest, p.nilaiQna, p.nilaiLaprak];
  if (n.some((x) => x === null)) return null;
  return Math.round(((n[0]! + n[1]! + n[2]!) / 3) * 100) / 100;
}

/** 0–100 inclusive, or empty to clear. Mirrors the CHECK in backend.md. */
export function validasiNilai(
  mentah: string,
): { nilai: number | null } | { pesan: string } {
  const t = mentah.trim();
  if (t === "") return { nilai: null };
  if (!/^\d{1,3}$/.test(t)) return { pesan: "Angka bulat 0–100" };
  const n = Number(t);
  if (n > 100) return { pesan: "Maksimal 100" };
  return { nilai: n };
}

// ---------------------------------------------------------------------------
// Placeholder data. Delete this block once backend.md has been run.
// ---------------------------------------------------------------------------

const JUDUL = [
  "Root Locus",
  "Bode Plot",
  "Step Response",
  "PID Tuning",
  "State Space",
  "Nyquist Criterion",
  "Lead-Lag Compensator",
  "State Observer",
];

const SLUG = [
  "root-locus",
  "bode-plot",
  "step-response",
  "pid-tuning",
  "state-space",
  "nyquist",
  "lead-lag",
  "observer",
];

const MODUL: Modul[] = JUDUL.map((judul, i) => ({
  id: `m${i + 1}`,
  urutan: i + 1,
  slug: SLUG[i],
  judul,
  deskripsi: null,
  pdfUrl: null,
  pretestUrl: "https://forms.gle/contoh-placeholder",
  laporanDeadline: new Date(Date.UTC(2026, 7, 7 + i * 7, 16, 59)).toISOString(),
}));

// Spread across states so every branch is visible while reviewing.
const PENILAIAN_CONTOH: Record<string, Penilaian> = {
  m1: {
    pretestSelesai: true,
    laporanTautan: "https://drive.google.com/file/d/contoh-1/view",
    nilaiPretest: 88,
    nilaiQna: 85,
    nilaiLaprak: 90,
  },
  m2: {
    pretestSelesai: true,
    laporanTautan: "https://drive.google.com/file/d/contoh-2/view",
    nilaiPretest: 76,
    nilaiQna: null,
    nilaiLaprak: null,
  },
  m3: {
    pretestSelesai: true,
    laporanTautan: null,
    nilaiPretest: null,
    nilaiQna: null,
    nilaiLaprak: null,
  },
};

export async function ambilModulPraktikan(): Promise<ModulPraktikan[]> {
  return MODUL.map((m) => ({
    ...m,
    penilaian: PENILAIAN_CONTOH[m.id] ?? PENILAIAN_KOSONG,
  }));
}

export async function ambilModul(slug: string): Promise<ModulPraktikan | null> {
  const m = MODUL.find((x) => x.slug === slug);
  if (!m) return null;
  return { ...m, penilaian: PENILAIAN_CONTOH[m.id] ?? PENILAIAN_KOSONG };
}

export async function ambilSemuaModul(): Promise<Modul[]> {
  return MODUL;
}

export async function ambilProfilRingkas() {
  return { nama: "Placeholder", npm: "2106701234", role: "praktikan" as const };
}

const NAMA = [
  "Adinda Rahmawati",
  "Bagas Prakoso",
  "Citra Maharani",
  "Dimas Anggara",
  "Elang Wicaksono",
];

export async function ambilRoster(slug: string): Promise<BarisRoster[]> {
  if (!MODUL.some((m) => m.slug === slug)) return [];
  return NAMA.map((nama, i) => ({
    praktikanId: `p${i + 1}`,
    nama,
    npm: `21067012${34 + i}`,
    penilaian:
      i === 0
        ? { pretestSelesai: true, laporanTautan: "https://drive.google.com/file/d/a/view", nilaiPretest: 88, nilaiQna: 85, nilaiLaprak: 90 }
        : i === 1
          ? { pretestSelesai: true, laporanTautan: "https://drive.google.com/file/d/b/view", nilaiPretest: 76, nilaiQna: null, nilaiLaprak: null }
          : PENILAIAN_KOSONG,
  }));
}

// ---------------------------------------------------------------------------
// Writes — all PLACEHOLDER. See backend.md Part 6.
// ---------------------------------------------------------------------------

export async function tandaiPretest(_modulId: string, _selesai: boolean) {
  return { ok: true as const };
}

export async function kirimLaporan(_modulId: string, tautan: string) {
  if (!/^https?:\/\//i.test(tautan)) {
    return { ok: false as const, pesan: "Tautan harus diawali http:// atau https://" };
  }
  return { ok: true as const };
}

export type KolomNilai = "nilaiPretest" | "nilaiQna" | "nilaiLaprak";

export async function simpanNilai(
  _modulId: string,
  _praktikanId: string,
  _kolom: KolomNilai,
  _nilai: number | null,
) {
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Formatting — design.md §8: "12 Agustus 2026", never "12/08/26".
// ---------------------------------------------------------------------------

const TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export const formatTanggal = (iso: string) => TANGGAL.format(new Date(iso));

/** Whole days until `iso`. Negative once passed. */
export function sisaHari(iso: string, sekarang = new Date()) {
  return Math.ceil((new Date(iso).getTime() - sekarang.getTime()) / 86_400_000);
}
