import Section1 from "./sections/Section1";

export const metadata = { title: "Masuk — Controllab" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  const tujuan = next?.startsWith("/") && !next.startsWith("//") ? next : "/praktikum";
  return <Section1 next={tujuan} />;
}
