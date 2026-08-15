# Controllab

Website Laboratorium Teknik Kendali, Departemen Teknik Elektro FTUI.

Satu aplikasi dengan tiga fungsi: halaman publik lab, simulator sistem kendali yang
bisa dipakai siapa saja, dan sistem praktikum tempat praktikan mengumpulkan laporan
dan asisten memberi nilai.

## Halaman Publik

Bisa dibuka tanpa akun.

Landing page berisi profil singkat lab. Halaman about memuat penjelasan lab, daftar
asisten beserta jabatannya, dan perusahaan tempat alumni bekerja.

## Simulator

Alat interaktif untuk melihat perilaku sistem kendali secara langsung. Grafik digambar
dengan Plotly dan transfer function ditulis dengan KaTeX.

**Pole-Zero** sudah jalan. Pengguna menggeser posisi pole dan zero di bidang-s lewat
slider, lalu halaman menampilkan transfer function-nya beserta step response, impulse
response, Bode magnitude, dan permukaan 3D magnitude `|H(s)|` di bidang-s dengan
posisi zero ditandai di atasnya. Perhitungannya dikerjakan backend Python, bukan di
browser.

**PID Tuning** juga sudah jalan. Simulasi berjalan terus menerus terhadap plant orde
satu dengan dead time, jadi pengaruh perubahan Kp, Ki, dan Kd langsung terlihat saat
slider digeser. Semua perhitungan dikerjakan di browser, tanpa backend.

**Step Response**, **Bode Plot**, dan **Root Locus** belum dibuat. Ketiganya sudah
punya kartu di daftar simulator dengan label "Segera", tapi halamannya masih
menampilkan daftar simulator lagi.

## Praktikum

Halaman untuk praktikan yang sudah masuk.

Halaman utama berupa tabel semua modul praktikum. Tiap baris menunjukkan apakah
pretest sudah ditandai selesai, apakah laporan sudah dikumpulkan, dan berapa rata-rata
nilai sementara. Baris juga menandai modul yang mendekati atau melewati deadline.

Tiap modul punya halamannya sendiri yang berisi materi PDF, checkbox untuk menandai
pretest selesai, dan form pengumpulan laporan berupa tautan Google Drive. Mengirim
ulang akan mengganti tautan sebelumnya. Kalau deadline modul sudah lewat dan laporan
belum masuk, formnya tertutup.

## Penilaian

Halaman untuk asisten.

Daftar modul yang sama, tapi membukanya menampilkan seluruh roster praktikan. Tiap
praktikan punya tiga kolom nilai: pretest, tanya jawab, dan laporan. Nilai tersimpan
otomatis begitu diisi dan rata-ratanya langsung ikut berubah. Tiap baris juga memuat
tautan laporan praktikan tersebut supaya bisa dibuka sambil menilai.

## Akun dan Akses

Register meminta nama dan NPM. Semua akun baru otomatis menjadi praktikan. Role
asisten hanya bisa diberikan langsung lewat database, tidak pernah dibaca dari form
register, supaya tidak ada yang bisa mendaftar sebagai asisten lalu menilai dirinya
sendiri. Ada juga alur lupa dan reset kata sandi lewat email.

Pengunjung yang belum masuk lalu membuka halaman praktikum atau penilaian akan
dialihkan ke halaman login, dan setelah masuk dikembalikan ke halaman yang tadi
dituju. Asisten yang membuka halaman praktikan dipindahkan ke halaman penilaian, dan
sebaliknya.

Pengalihan ini sifatnya kenyamanan, bukan pengaman. Yang benar-benar menjaga data
adalah row-level security di database, jadi praktikan yang melewati pengalihan tetap
tidak mendapat baris apa pun.

## Teknologi

Next.js 16 dengan App Router dan React 19, Tailwind CSS v4, serta Supabase untuk
autentikasi dan basis data. Plotly dan KaTeX untuk keluaran simulator. Analisis
pole-zero ditangani service terpisah dengan FastAPI dan SciPy.

## Menjalankan Secara Lokal

```bash
git clone https://github.com/enclaireee/controllabweb.git
cd controllabweb
npm install
npm run dev
```

Buat `.env.local` berisi URL dan anon key dari Supabase project, di Settings bagian
API:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Tanpa keduanya, halaman publik dan simulator tetap jalan, tapi praktikum dan penilaian
akan balik ke halaman login.

Simulator pole-zero butuh backend Python yang jalan terpisah:

```bash
python3 -m venv backend/venv
backend/venv/bin/pip install fastapi uvicorn numpy scipy pydantic
backend/venv/bin/uvicorn backend.main:app --reload --port 8000
```

Alamatnya masih hardcoded ke `localhost:8000`, jadi simulator ini belum jalan di versi
deploy sampai backend-nya dihosting.

## Kontribusi Tim

**Altaf Farzana**

Mengerjakan branding dan sistem autentikasi, termasuk:

- Landing page beserta hero section dan halaman publik lainnya
- Halaman about: profil lab, daftar asisten beserta jabatan, dan perusahaan alumni
- Navbar dan aset gambar untuk halaman publik
- Halaman login dan register yang terhubung ke Supabase

**Farid Akbar**

Mengerjakan simulator, termasuk:

- Simulator pole-zero, termasuk visualisasi 3D magnitude transfer function di bidang s
- Simulator PID tuning dengan simulasi live terhadap plant orde satu
- Backend FastAPI dan SciPy untuk perhitungan analisis pole-zero
- Shared library simulator agar tema plot dan komponen UI-nya seragam

**Muhammad Fatih Zamzami**

Mengerjakan sistem praktikum, termasuk:

- Halaman praktikan: tabel status modul, materi PDF, penanda pretest, dan form
  pengumpulan laporan
- Halaman asisten: roster praktikan dengan input nilai yang tersimpan otomatis
- Skema database, row-level security, dan RPC di Supabase
- Proteksi route dan pembagian akses praktikan dan asisten lewat `proxy.ts`
- Komponen UI bersama seperti SiteHeader, form, dan tombol
