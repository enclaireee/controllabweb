import FormLupaSandi from "@/components/FormLupaSandi";

export const metadata = { title: "Lupa kata sandi — Controllab" };

export default function Page() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-20">
      <FormLupaSandi />
    </div>
  );
}
