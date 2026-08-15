export type Modul = {
  id: string;
  urutan: number;
  slug: string;
  judul: string;
  deskripsi: string | null;
  pdfUrl: string | null;
  pretestUrl: string | null;
  laporanDeadline: string | null;
};

export type Penilaian = {
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

export type KolomNilai = "nilaiPretest" | "nilaiQna" | "nilaiLaprak";

export const PENILAIAN_KOSONG: Penilaian = {
  pretestSelesai: false,
  laporanTautan: null,
  nilaiPretest: null,
  nilaiQna: null,
  nilaiLaprak: null,
};

export function rataRata(p: Penilaian): number | null {
  const n = [p.nilaiPretest, p.nilaiQna, p.nilaiLaprak];
  if (n.some((x) => x === null)) return null;
  return Math.round(((n[0]! + n[1]! + n[2]!) / 3) * 100) / 100;
}

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

const TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export const formatTanggal = (iso: string) => TANGGAL.format(new Date(iso));

export function sisaHari(iso: string, sekarang = new Date()) {
  return Math.ceil((new Date(iso).getTime() - sekarang.getTime()) / 86_400_000);
}
