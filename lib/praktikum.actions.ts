"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { KolomNilai } from "@/lib/praktikum";

const KOLOM_SQL: Record<KolomNilai, string> = {
  nilaiPretest: "nilai_pretest",
  nilaiQna: "nilai_qna",
  nilaiLaprak: "nilai_laprak",
};

export async function tandaiPretest(modulId: string, selesai: boolean) {
  const sb = await createClient();
  const { error } = await sb.rpc("tandai_pretest", {
    p_modul_id: modulId,
    p_selesai: selesai,
  });
  if (error) return { ok: false as const, pesan: error.message };
  revalidatePath("/praktikum", "layout");
  return { ok: true as const };
}

export async function kirimLaporan(modulId: string, tautan: string) {
  const sb = await createClient();
  const { error } = await sb.rpc("submit_laporan", {
    p_modul_id: modulId,
    p_tautan: tautan,
  });
  if (error) return { ok: false as const, pesan: error.message };
  revalidatePath("/praktikum", "layout");
  return { ok: true as const };
}

export async function simpanNilai(
  modulId: string,
  praktikanId: string,
  kolom: KolomNilai,
  nilai: number | null,
) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { ok: false as const, pesan: "Sesi habis. Masuk lagi." };

  const { error } = await sb.from("penilaian").upsert(
    {
      modul_id: modulId,
      praktikan_id: praktikanId,
      [KOLOM_SQL[kolom]]: nilai,
      dinilai_oleh: user.id,
      dinilai_at: new Date().toISOString(),
    },
    { onConflict: "modul_id,praktikan_id" },
  );

  if (error) return { ok: false as const, pesan: error.message };
  return { ok: true as const };
}
