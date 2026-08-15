import SiteHeader from "@/components/SiteHeader";

export default function PraktikanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader variant="app" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
