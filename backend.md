# backend.md

Setup guide for the Controllab praktikum system. **Follow the steps in order.**
Every grey block is copy-paste — nothing has to be edited except where a step says
"replace this".

Where you work:

| Steps | Where |
|---|---|
| 0 | Supabase → SQL Editor (wipes everything) |
| 1–9 | Supabase → SQL Editor |
| 10–12 | Supabase → dashboard, clicking |
| 13 | Your editor |
| 14 | Browser |

Open `Supabase → SQL Editor → New query`, paste one block, press **Run**, wait for
`Success`, then move to the next. Every block is safe to run twice.

---

## What we are building

Three tables.

```
profil      one row per account       nama, npm, role
modul       8 rows, seeded by you     judul, pdf link, pretest Form link, deadline
penilaian   one row per praktikan × modul
            pretest_selesai   praktikan ticks it after doing the Form
            laporan_tautan    the Drive link they submit
            nilai_pretest     asisten types it
            nilai_qna         asisten types it
            nilai_laprak      asisten types it
```

The average is `(pretest + qna + laprak) / 3`, computed by the app, shown to the
praktikan once all three exist.

---

# Step 0 — Purge

**Deletes every table, function and policy from previous attempts.** Run this first even
on a fresh project — it is harmless when there is nothing to drop.

> This does **not** delete user accounts. Those live in `auth.users`, which we never
> touch. To wipe accounts too, use `Authentication → Users` and delete them by hand.

```sql
-- Triggers and functions
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.buat_profil_baru()          cascade;
drop function if exists public.role_saya()                 cascade;
drop function if exists public.tandai_pretest(uuid,boolean) cascade;
drop function if exists public.submit_laporan(uuid,text)   cascade;
-- from older drafts of this file
drop function if exists public.submit_pretest(uuid,jsonb)  cascade;
drop function if exists public.soal_pretest(uuid)          cascade;

-- Tables, children first
drop table if exists public.penilaian cascade;
drop table if exists public.soal      cascade;
drop table if exists public.modul     cascade;
drop table if exists public.profil    cascade;
```

Expect `Success. No rows returned`.

> If you ever made a `modul` storage bucket in an older attempt, delete it under
> `Storage → modul → Delete bucket`. Supabase blocks `delete from storage.buckets` in
> SQL on purpose, so it cannot be scripted here. We do not use a bucket any more —
> `modul.pdf_url` is just a link.

---

# Step 1 — Table: `profil`

One row per account. `role` decides which half of the site you see.

```sql
create table public.profil (
  id        uuid primary key references auth.users on delete cascade,
  nama      text not null,
  npm       text,
  role      text not null default 'praktikan'
            check (role in ('praktikan', 'asisten')),
  dibuat_at timestamptz not null default now()
);
```

---

# Step 2 — Auto-create `profil` on signup

The register page sends `nama` and `npm`; this copies them across. Role is **always**
`praktikan` — never taken from the form, or anyone could sign up as an asisten and grade
themselves.

```sql
create or replace function public.buat_profil_baru()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profil (id, nama, npm)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'npm'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.buat_profil_baru();
```

---

# Step 3 — Table: `modul`

```sql
create table public.modul (
  id               uuid primary key default gen_random_uuid(),
  urutan           int  not null unique,
  slug             text not null unique,
  judul            text not null,
  deskripsi        text,
  pdf_url          text,   -- link to the modul PDF
  pretest_url      text,   -- Google Form
  laporan_deadline timestamptz
);
```

---

# Step 4 — Table: `penilaian`

One row per praktikan per modul. Everything about that pairing lives here.

```sql
create table public.penilaian (
  id              uuid primary key default gen_random_uuid(),
  modul_id        uuid not null references public.modul  on delete cascade,
  praktikan_id    uuid not null references public.profil on delete cascade,

  pretest_selesai boolean not null default false,
  laporan_tautan  text,
  laporan_at      timestamptz,

  nilai_pretest   numeric check (nilai_pretest between 0 and 100),
  nilai_qna       numeric check (nilai_qna     between 0 and 100),
  nilai_laprak    numeric check (nilai_laprak  between 0 and 100),

  dinilai_oleh    uuid references public.profil,
  dinilai_at      timestamptz,

  unique (modul_id, praktikan_id)
);

create index penilaian_praktikan_idx on public.penilaian (praktikan_id);
create index penilaian_modul_idx     on public.penilaian (modul_id);
```

---

# Step 5 — Role helper

A policy on `profil` that reads `profil` loops forever. `security definer` skips RLS
inside the function and breaks the loop. This is required, not optional.

```sql
create or replace function public.role_saya()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profil where id = auth.uid();
$$;

revoke all on function public.role_saya() from public;
grant execute on function public.role_saya() to authenticated;
```

---

# Step 6 — Turn on Row Level Security

Without this, anyone with your public API key reads the whole database.

```sql
alter table public.profil    enable row level security;
alter table public.modul     enable row level security;
alter table public.penilaian enable row level security;
```

---

# Step 7 — Policies

```sql
-- profil: see yourself; asisten see everyone
create policy profil_baca on public.profil
  for select to authenticated
  using (id = auth.uid() or public.role_saya() = 'asisten');

create policy profil_ubah_sendiri on public.profil
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- modul: anyone signed in can read
create policy modul_baca on public.modul
  for select to authenticated using (true);

-- penilaian: see your own; asisten see all
create policy penilaian_baca on public.penilaian
  for select to authenticated
  using (praktikan_id = auth.uid() or public.role_saya() = 'asisten');

-- Only asisten write directly. Praktikan get NO insert/update policy:
-- RLS is row-level, not column-level, so a praktikan allowed to touch their
-- own row could set their own nilai. Their two writes go through Step 8.
create policy penilaian_tulis_asisten on public.penilaian
  for insert to authenticated
  with check (public.role_saya() = 'asisten');

create policy penilaian_ubah_asisten on public.penilaian
  for update to authenticated
  using (public.role_saya() = 'asisten')
  with check (public.role_saya() = 'asisten');
```

---

# Step 8 — The two praktikan actions

The only two ways a praktikan can write anything. Neither can touch a nilai column.

```sql
-- Tick / untick "sudah mengerjakan pretest"
create or replace function public.tandai_pretest(
  p_modul_id uuid,
  p_selesai  boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Belum login'; end if;

  insert into public.penilaian (modul_id, praktikan_id, pretest_selesai)
  values (p_modul_id, v_uid, p_selesai)
  on conflict (modul_id, praktikan_id)
    do update set pretest_selesai = excluded.pretest_selesai;
end;
$$;

revoke all on function public.tandai_pretest(uuid, boolean) from public;
grant execute on function public.tandai_pretest(uuid, boolean) to authenticated;


-- Submit or replace the laporan link. Deadline enforced HERE, because
-- hiding a button in the UI is not enforcement.
create or replace function public.submit_laporan(
  p_modul_id uuid,
  p_tautan   text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_deadline timestamptz;
begin
  if v_uid is null then raise exception 'Belum login'; end if;
  if p_tautan !~* '^https?://' then
    raise exception 'Tautan harus diawali http:// atau https://';
  end if;

  select laporan_deadline into v_deadline
    from public.modul where id = p_modul_id;
  if not found then raise exception 'Modul tidak ditemukan'; end if;
  if v_deadline is not null and now() > v_deadline then
    raise exception 'Deadline laporan sudah lewat';
  end if;

  insert into public.penilaian (modul_id, praktikan_id, laporan_tautan, laporan_at)
  values (p_modul_id, v_uid, p_tautan, now())
  on conflict (modul_id, praktikan_id)
    do update set laporan_tautan = excluded.laporan_tautan,
                  laporan_at     = now();
end;
$$;

revoke all on function public.submit_laporan(uuid, text) from public;
grant execute on function public.submit_laporan(uuid, text) to authenticated;
```

---

# Step 9 — Seed the 8 modules

Rename them later with a simple `update`. Deadlines are one week apart starting a week
from today.

```sql
insert into public.modul (urutan, slug, judul, laporan_deadline) values
  (1, 'root-locus',    'Root Locus',            now() + interval '1 week'),
  (2, 'bode-plot',     'Bode Plot',             now() + interval '2 weeks'),
  (3, 'step-response', 'Step Response',         now() + interval '3 weeks'),
  (4, 'pid-tuning',    'PID Tuning',            now() + interval '4 weeks'),
  (5, 'state-space',   'State Space',           now() + interval '5 weeks'),
  (6, 'nyquist',       'Nyquist Criterion',     now() + interval '6 weeks'),
  (7, 'lead-lag',      'Lead-Lag Compensator',  now() + interval '7 weeks'),
  (8, 'observer',      'State Observer',        now() + interval '8 weeks')
on conflict (slug) do nothing;
```

## Adding the PDF and Form links

One `update` per modul. Replace the URLs:

```sql
update public.modul set
  pdf_url     = 'https://drive.google.com/file/d/GANTI_ID_PDF/view',
  pretest_url = 'https://forms.gle/GANTI_ID_FORM'
where slug = 'root-locus';
```

> **Google Drive links work.** Paste the normal `/view` link — the app rewrites it to
> `/preview` so it embeds. Set the file's sharing to **Anyone with the link**, or the
> preview shows a login wall.

---

# Step 10 — Auth settings

> Steps 11 and 12 create accounts directly in SQL with the email already confirmed, so
> nothing here blocks you from logging in. It still matters for anyone who signs up
> through `/register`, and the Redirect URL is required for forgot-password.


`Authentication → Sign In / Providers → Email`

- **Enable Email provider** — on
- **Confirm email** — on

`Authentication → URL Configuration`

- **Site URL**: `http://localhost:3000` for now
- **Redirect URLs**: add `http://localhost:3000/reset-sandi`

Without that second one, the forgot-password link goes nowhere.

> Supabase's built-in mailer is rate-limited to a few messages an hour. Fine for testing;
> add your own SMTP under `Project Settings → Auth` before real praktikan use it.

---

# Step 11 — Create the asisten account (hardcoded)

Makes the account, confirms the email, and sets the role to `asisten` in one go — no
signup form, no confirmation email. Change the first four values if you want different
ones; everything else is machinery.

```
Email     fatih@controllab.test
Password  praktikum2026
```

```sql
create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_email text := 'fatih@controllab.test';
  v_sandi text := 'praktikum2026';
  v_nama  text := 'Fatih';
  v_npm   text := '2106700001';
  v_id    uuid;
begin
  select id into v_id from auth.users where email = v_email;

  if v_id is null then
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_id, 'authenticated', 'authenticated', v_email,
      extensions.crypt(v_sandi, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nama', v_nama, 'npm', v_npm),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_id,
      jsonb_build_object('sub', v_id::text, 'email', v_email),
      'email', v_id::text, now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password = extensions.crypt(v_sandi, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now())
     where id = v_id;
  end if;

  insert into public.profil (id, nama, npm, role)
  values (v_id, v_nama, v_npm, 'asisten')
  on conflict (id) do update
    set nama = excluded.nama, npm = excluded.npm, role = 'asisten';
end $$;
```

Check it:

```sql
select p.nama, p.npm, p.role, u.email, u.email_confirmed_at is not null as terkonfirmasi
  from public.profil p join auth.users u on u.id = p.id;
```

Expect one row: `Fatih / 2106700001 / asisten / fatih@controllab.test / true`.

> Re-running this block resets the password to whatever `v_sandi` says. That is how you
> recover a forgotten asisten password without email.

---

# Step 12 — Create a praktikan account to test against

You need one of each. Two ways:

**A — through the app** (also tests that the signup form works):
`npm run dev` → `http://localhost:3000/register` → fill it in → confirm via email.

**B — hardcoded**, same as Step 11 but ending as a praktikan. Paste this if email
delivery is being awkward:

```sql
do $$
declare
  v_email text := 'praktikan@controllab.test';
  v_sandi text := 'praktikum2026';
  v_nama  text := 'Praktikan Uji';
  v_npm   text := '2106700002';
  v_id    uuid;
begin
  select id into v_id from auth.users where email = v_email;

  if v_id is null then
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_id, 'authenticated', 'authenticated', v_email,
      extensions.crypt(v_sandi, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nama', v_nama, 'npm', v_npm),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_id,
      jsonb_build_object('sub', v_id::text, 'email', v_email),
      'email', v_id::text, now(), now(), now()
    );
  end if;

  insert into public.profil (id, nama, npm, role)
  values (v_id, v_nama, v_npm, 'praktikan')
  on conflict (id) do update
    set nama = excluded.nama, npm = excluded.npm;
end $$;
```

Both accounts, side by side:

```sql
select p.nama, p.npm, p.role, u.email from public.profil p
  join auth.users u on u.id = p.id order by p.role;
```

> These are test credentials in a file that is committed to git. Before this is used by
> real praktikan, change both passwords and delete the two `@controllab.test` accounts
> under `Authentication → Users`.

---

# Step 12b — 10 dummy praktikan (optional)

Fills the asisten grading sheet with a realistic number of rows. All ten share the
password `praktikum2026` and use `praktikan01@controllab.test` … `praktikan10@`.

```sql
create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_nama text[] := array[
    'Adinda Rahmawati', 'Bagas Prakoso',   'Citra Maharani',
    'Dimas Anggara',    'Elang Wicaksono', 'Fira Anindita',
    'Gilang Ramadhan',  'Hana Puspita',    'Irfan Maulana',
    'Kirana Dewi'
  ];
  v_sandi text := 'praktikum2026';
  v_email text;
  v_npm   text;
  v_id    uuid;
  i       int;
begin
  for i in 1 .. array_length(v_nama, 1) loop
    v_email := format('praktikan%s@controllab.test', lpad(i::text, 2, '0'));
    v_npm   := (2106700010 + i)::text;

    select id into v_id from auth.users where email = v_email;

    if v_id is null then
      v_id := gen_random_uuid();

      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000',
        v_id, 'authenticated', 'authenticated', v_email,
        extensions.crypt(v_sandi, extensions.gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('nama', v_nama[i], 'npm', v_npm),
        '', '', '', ''
      );

      insert into auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), v_id,
        jsonb_build_object('sub', v_id::text, 'email', v_email),
        'email', v_id::text, now(), now(), now()
      );
    end if;

    insert into public.profil (id, nama, npm, role)
    values (v_id, v_nama[i], v_npm, 'praktikan')
    on conflict (id) do update
      set nama = excluded.nama, npm = excluded.npm;
  end loop;
end $$;
```

Check:

```sql
select nama, npm, role from public.profil order by role, nama;
```

Expect 12 rows — 1 asisten, 11 praktikan.

## Give some of them scores and submissions

Optional, but it makes the praktikan dashboard and the average column show something
other than empty. Fills modules 1–2 for the first five people.

```sql
insert into public.penilaian
  (modul_id, praktikan_id, pretest_selesai, laporan_tautan, laporan_at,
   nilai_pretest, nilai_qna, nilai_laprak)
select
  m.id,
  p.id,
  true,
  'https://drive.google.com/file/d/contoh/view',
  now(),
  70 + (row_number() over (order by p.nama)) * 2,
  75 + (row_number() over (order by p.nama)),
  case when m.urutan = 1 then 80 + (row_number() over (order by p.nama)) else null end
from public.modul m
cross join (
  select id, nama from public.profil
   where role = 'praktikan' order by nama limit 5
) p
where m.urutan in (1, 2)
on conflict (modul_id, praktikan_id) do nothing;
```

Module 1 ends up fully graded, so the average shows. Module 2 has `nilai_laprak` left
null on purpose, so you can see the "not yet complete" state too.

## Removing them later

```sql
delete from auth.users where email like 'praktikan%@controllab.test';
```

`profil` and `penilaian` rows cascade away with the account.

---

# Step 13 — Connect the app to the database

Everything above the line in `lib/praktikum.ts` is real. Everything below the
`PLACEHOLDER` banner returns fake data. Replace those function bodies — the types and
every component stay exactly as they are.

Confirm `.env.local` has both values from `Project Settings → API`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 13a — Reads

```ts
import { createClient } from "@/lib/supabase/server";

const bersih = (row: {
  pretest_selesai?: boolean | null;
  laporan_tautan?: string | null;
  nilai_pretest?: number | null;
  nilai_qna?: number | null;
  nilai_laprak?: number | null;
} | null | undefined): Penilaian => ({
  pretestSelesai: row?.pretest_selesai ?? false,
  laporanTautan: row?.laporan_tautan ?? null,
  nilaiPretest: row?.nilai_pretest ?? null,
  nilaiQna: row?.nilai_qna ?? null,
  nilaiLaprak: row?.nilai_laprak ?? null,
});

const keModul = (m: Record<string, never> | any): Modul => ({
  id: m.id,
  urutan: m.urutan,
  slug: m.slug,
  judul: m.judul,
  deskripsi: m.deskripsi,
  pdfUrl: m.pdf_url,
  pretestUrl: m.pretest_url,
  laporanDeadline: m.laporan_deadline,
});

export async function ambilProfilRingkas() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data } = await sb
    .from("profil").select("nama, npm, role").eq("id", user!.id).single();
  return {
    nama: data?.nama ?? "",
    npm: data?.npm ?? "",
    role: (data?.role ?? "praktikan") as "praktikan" | "asisten",
  };
}

export async function ambilSemuaModul(): Promise<Modul[]> {
  const sb = await createClient();
  const { data } = await sb.from("modul").select("*").order("urutan");
  return (data ?? []).map(keModul);
}

export async function ambilModulPraktikan(): Promise<ModulPraktikan[]> {
  const sb = await createClient();
  // RLS already limits penilaian to this user, so no extra filter is needed.
  const { data } = await sb
    .from("modul").select("*, penilaian(*)").order("urutan");
  return (data ?? []).map((m) => ({
    ...keModul(m),
    penilaian: bersih(m.penilaian?.[0]),
  }));
}

export async function ambilModul(slug: string): Promise<ModulPraktikan | null> {
  const sb = await createClient();
  const { data: m } = await sb
    .from("modul").select("*, penilaian(*)").eq("slug", slug).single();
  if (!m) return null;
  return { ...keModul(m), penilaian: bersih(m.penilaian?.[0]) };
}

export async function ambilRoster(slug: string): Promise<BarisRoster[]> {
  const sb = await createClient();
  const { data: m } = await sb.from("modul").select("id").eq("slug", slug).single();
  if (!m) return [];

  const { data: orang } = await sb
    .from("profil").select("id, nama, npm").eq("role", "praktikan").order("nama");
  const { data: nilai } = await sb
    .from("penilaian").select("*").eq("modul_id", m.id);

  return (orang ?? []).map((p) => ({
    praktikanId: p.id,
    nama: p.nama,
    npm: p.npm ?? "",
    penilaian: bersih((nilai ?? []).find((n) => n.praktikan_id === p.id)),
  }));
}
```

## 13b — Writes

These are called from Client Components, so they must be **Server Actions**. Create
`lib/praktikum.actions.ts` with `"use server"` on line 1, put these three there, and
change the imports in `CekPretest.tsx`, `FormLaporan.tsx` and `ScoreInput.tsx` from
`@/lib/praktikum` to `@/lib/praktikum.actions`. The signatures do not change.

```ts
"use server";

import { createClient } from "@/lib/supabase/server";
import type { KolomNilai } from "@/lib/praktikum";

export async function tandaiPretest(modulId: string, selesai: boolean) {
  const sb = await createClient();
  const { error } = await sb.rpc("tandai_pretest", {
    p_modul_id: modulId, p_selesai: selesai,
  });
  return error ? { ok: false as const, pesan: error.message } : { ok: true as const };
}

export async function kirimLaporan(modulId: string, tautan: string) {
  const sb = await createClient();
  const { error } = await sb.rpc("submit_laporan", {
    p_modul_id: modulId, p_tautan: tautan,
  });
  return error ? { ok: false as const, pesan: error.message } : { ok: true as const };
}

const KOLOM_SQL: Record<KolomNilai, string> = {
  nilaiPretest: "nilai_pretest",
  nilaiQna: "nilai_qna",
  nilaiLaprak: "nilai_laprak",
};

export async function simpanNilai(
  modulId: string, praktikanId: string, kolom: KolomNilai, nilai: number | null,
) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from("penilaian").upsert(
    {
      modul_id: modulId,
      praktikan_id: praktikanId,
      [KOLOM_SQL[kolom]]: nilai,
      dinilai_oleh: user!.id,
      dinilai_at: new Date().toISOString(),
    },
    { onConflict: "modul_id,praktikan_id" },
  );
  return error ? { ok: false as const, pesan: error.message } : { ok: true as const };
}
```

## 13c — Delete the fake data

Once the pages show real rows, delete from `lib/praktikum.ts`: `JUDUL`, `SLUG`, `MODUL`,
`PENILAIAN_CONTOH`, `NAMA`. Nothing else references them.

---

# Step 14 — Check it works

Signed in as your **praktikan** account:

| Do this | Expect |
|---|---|
| `/praktikum` | 8 modules |
| Open a modul | PDF preview, pretest button, laporan form |
| Tick "sudah mengerjakan pretest", reload | still ticked |
| Submit a Drive link, reload | still there |
| Go to `/penilaian` | bounced to `/praktikum` |

Signed in as your **asisten** account:

| Do this | Expect |
|---|---|
| `/penilaian` | 8 modules |
| Open one | every praktikan listed |
| Type a score, press Tab | flashes green; reload keeps it |
| Fill all three for one person | average appears on the right |
| Type `101` | rejected before it reaches the database |
| Go to `/praktikum` | works — asisten can see it too |

Then sign back in as the praktikan and open that modul: the average the asisten entered
should be on their dashboard.

---

# Appendix — simulator backend

Only for `/simulator/pole-zero`, unrelated to everything above.

```bash
pip install fastapi uvicorn numpy scipy
uvicorn backend.main:app --reload --port 8000
```

Two known issues, owned by whoever wrote that page:

- `fetch("http://localhost:8000/api/analyze")` is hardcoded and needs an env var before
  deploying.
- `backend/__pycache__/` is committed to git. Fix:
  `git rm -r --cached backend/__pycache__` and add `__pycache__/` to `.gitignore`.
