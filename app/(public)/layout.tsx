import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader variant="marketing" />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
