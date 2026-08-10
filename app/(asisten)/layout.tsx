import SiteHeader, { NAV_ASISTEN } from "@/components/SiteHeader";

// See (praktikan)/layout.tsx — same reasoning.
export default function AsistenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader variant="app" nav={NAV_ASISTEN} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
