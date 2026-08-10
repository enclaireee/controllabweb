import SiteHeader from "@/components/SiteHeader";

// App screens get the static header and no footer (design.md §4 app shell frame):
// authenticated chrome is a tool, and a footer on a grading screen is noise.
export default function PraktikanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader variant="app" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
