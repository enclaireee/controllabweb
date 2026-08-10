import FormLogin from "@/components/FormLogin";

export default function Section1({ next }: { next: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-20">
      <FormLogin next={next} />
    </div>
  );
}
