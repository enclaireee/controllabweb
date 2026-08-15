import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  BarisRoster,
  Modul,
  ModulPraktikan,
  Penilaian,
} from "@/lib/praktikum";

type RowModul = {
  id: string;
  urutan: number;
  slug: string;
  judul: string;
  deskripsi: string | null;
  pdf_url: string | null;
  pretest_url: string | null;
  laporan_deadline: string | null;
};

type RowPenilaian = {
  praktikan_id: string;
  pretest_selesai: boolean | null;
  laporan_tautan: string | null;
  nilai_pretest: number | null;
  nilai_qna: number | null;
  nilai_laprak: number | null;
};

const keModul = (m: RowModul): Modul => ({
  id: m.id,
  urutan: m.urutan,
  slug: m.slug,
  judul: m.judul,
  deskripsi: m.deskripsi,
  pdfUrl: m.pdf_url,
  pretestUrl: m.pretest_url,
  laporanDeadline: m.laporan_deadline,
});

const kePenilaian = (r: Partial<RowPenilaian> | undefined | null): Penilaian => ({
  pretestSelesai: r?.pretest_selesai ?? false,
  laporanTautan: r?.laporan_tautan ?? null,
  nilaiPretest: r?.nilai_pretest ?? null,
  nilaiQna: r?.nilai_qna ?? null,
  nilaiLaprak: r?.nilai_laprak ?? null,
});

export async function ambilProfilRingkas() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { nama: "", npm: "", role: "praktikan" as const };

  const { data } = await sb
    .from("profil")
    .select("nama, npm, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    nama: data?.nama ?? "",
    npm: data?.npm ?? "",
    role: (data?.role ?? "praktikan") as "praktikan" | "asisten",
  };
}

export async function ambilSemuaModul(): Promise<Modul[]> {
  const sb = await createClient();
  const { data } = await sb.from("modul").select("*").order("urutan");
  return ((data ?? []) as RowModul[]).map(keModul);
}

export async function ambilModulPraktikan(): Promise<ModulPraktikan[]> {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const { data } = await sb
    .from("modul")
    .select("*, penilaian(*)")
    .eq("penilaian.praktikan_id", user.id)
    .order("urutan");

  return ((data ?? []) as (RowModul & { penilaian: RowPenilaian[] })[]).map(
    (m) => ({ ...keModul(m), penilaian: kePenilaian(m.penilaian?.[0]) }),
  );
}

export async function ambilModul(slug: string): Promise<ModulPraktikan | null> {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const { data } = await sb
    .from("modul")
    .select("*, penilaian(*)")
    .eq("slug", slug)
    .eq("penilaian.praktikan_id", user?.id ?? "")
    .maybeSingle();

  if (!data) return null;
  const m = data as RowModul & { penilaian: RowPenilaian[] };
  return { ...keModul(m), penilaian: kePenilaian(m.penilaian?.[0]) };
}

export async function ambilRoster(slug: string): Promise<BarisRoster[]> {
  const sb = await createClient();

  const { data: modul } = await sb
    .from("modul")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!modul) return [];

  const [{ data: orang }, { data: nilai }] = await Promise.all([
    sb.from("profil").select("id, nama, npm").eq("role", "praktikan").order("nama"),
    sb.from("penilaian").select("*").eq("modul_id", (modul as { id: string }).id),
  ]);

  const baris = (nilai ?? []) as RowPenilaian[];

  return ((orang ?? []) as { id: string; nama: string; npm: string | null }[]).map(
    (p) => ({
      praktikanId: p.id,
      nama: p.nama,
      npm: p.npm ?? "",
      penilaian: kePenilaian(baris.find((n) => n.praktikan_id === p.id)),
    }),
  );
}
