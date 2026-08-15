import SiteHeader from "@/components/SiteHeader";
import { ambilProfilRingkas } from "@/lib/praktikum.queries";

export default async function PraktikanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profil = await ambilProfilRingkas();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        variant="app"
        identitas={{ nama: profil.nama, npm: profil.npm }}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
