import FormResetSandi from "@/components/FormResetSandi";

export const metadata = { title: "Kata sandi baru — Controllab" };

export default function Page() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-20">
      <FormResetSandi />
    </div>
  );
}
