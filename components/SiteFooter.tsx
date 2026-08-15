import Link from "next/link";

const GROUPS = [
  {
    heading: "Praktikum",
    links: [{ href: "/praktikum", label: "Modul praktikum" }],
  },
  {
    heading: "Belajar",
    links: [{ href: "/simulator", label: "Simulator" }],
  },
  {
    heading: "Lab",
    links: [
      { href: "/about", label: "Tentang" },
      { href: "/login", label: "Masuk" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-content px-5 pb-12 pt-20 tablet:px-8">
        <div className="grid grid-cols-1 gap-12 tablet:grid-cols-3 desktop:grid-cols-4">
          <Link
            href="/"
            className="font-display text-lg font-medium text-text tablet:col-span-3 desktop:col-span-1"
          >
            <span aria-hidden="true" className="text-accent">
              ◈
            </span>{" "}
            Controllab
          </Link>

          {GROUPS.map((group) => (
            <nav key={group.heading} aria-labelledby={`f-${group.heading}`}>
              <h2
                id={`f-${group.heading}`}
                className="text-meta font-medium text-text"
              >
                {group.heading}
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors duration-120 ease-signal hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-20 border-t border-border pt-8 font-mono text-meta uppercase tracking-wide text-text-muted">
          Lab Sistem Kendali
          <span aria-hidden="true" className="px-3 text-border-strong">
            /
          </span>
          Departemen Teknik Elektro
          <span aria-hidden="true" className="px-3 text-border-strong">
            /
          </span>
          Universitas Indonesia
        </p>
      </div>
    </footer>
  );
}
