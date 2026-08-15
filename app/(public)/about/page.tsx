"use client";

import Image from "next/image";
import Link from "next/link";

const assistants = [
  {
    name: "Ignatius Cahyo",
    role: "Lab Coordinator",
    image: "/images/aslab2.jpg",
  },
  {
    name: "Kevin Imanuel",
    role: "Reg Course Coor",
    image: "/images/aslab2.jpg",
  },
  {
    name: "Rafsya Ghaizan",
    role: "KKI Course Coor",
    image: "/images/aslab2.jpg",
  },
  {
    name: "Haidar Al Ghifari",
    role: "Software Dev",
    image: "/images/aslab2.jpg",
  },
  {
    name: "Alif Iqbal",
    role: "Hardware Dev",
    image: "/images/aslab2.jpg",
  },
  {
    name: "Keiko Aurelia",
    role: "Creative Media",
    image: "/images/aslab2.jpg",
  },
  {
    name: "Rafi Naryama",
    role: "Secretary and Inventory",
    image: "/images/aslab2.jpg",
  },
  {
    name: "Muhammad Rais",
    role: "Training and Development",
    image: "/images/aslab2.jpg",
  },
];

const alumniCompanies = [
  { name: "Pertamina", logo: "/companies/pertamina.svg" },
  { name: "PLN", logo: "/companies/pln.svg" },
  { name: "Schneider Electric", logo: "/companies/schneider.svg" },
  { name: "Siemens", logo: "/companies/siemens.svg" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300">
      <section className="container mx-auto px-6 py-16 tablet:py-24">
        <div className="grid grid-cols-1 items-center gap-12 desktop:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold tracking-tight tablet:text-3xl">
              Powering <span className="text-accent-text">Knowledge</span>
            </h1>
            <p className="text-lg leading-relaxed text-text-muted">
              <strong className="text-text">
                Laboratorium Teknik Kendali Universitas Indonesia (Control Lab UI)
              </strong>{" "}
              adalah salah satu laboratorium peminatan di Departemen Teknik
              Elektro FTUI. Memfasilitasi praktikum dan penelitian di bidang{" "}
              <strong className="text-text">
                Sistem Kendali, Otomasi Industri, dan Robotika
              </strong>.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/praktikum"
                className="inline-flex items-center justify-center rounded-button bg-accent px-6 py-3 text-sm font-semibold text-on-accent shadow transition-all hover:opacity-90"
              >
                Mulai Praktikum &rarr;
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-button border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition-all hover:bg-accent"
              >
                Masuk Akun &rarr;
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md desktop:max-w-none">
            <div className="relative aspect-video overflow-hidden rounded-card border border-border bg-surface shadow-2xl tablet:aspect-square">
              <Image
                src="/images/assistants-photo.jpeg"
                alt="Tim Laboratorium Kendali UI"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs font-semibold tracking-wider text-text-muted uppercase">
                Laboratorium Teknik Kendali UI
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/50 py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight tablet:text-3xl">
              Meet Our <span className="text-accent-text">Assistants</span>
            </h2>
            <p className="mt-2 text-text-muted">
              Tim asisten laboratorium yang siap membimbing praktikum dan riset.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2 desktop:grid-cols-3">
            {assistants.map((assistant, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-card border border-border bg-surface shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-80 w-full overflow-hidden bg-surface-raised">
                  <Image
                    src={assistant.image}
                    alt={assistant.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-90" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-text backdrop-blur-md border border-accent/30 mb-2">
                    {assistant.role}
                  </span>
                  <h3 className="text-xl font-bold text-text">
                    {assistant.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight tablet:text-3xl">
            Where Our <span className="text-red-500">Alumni</span> Landed...
          </h2>
          <p className="mt-2 text-text-muted">
            Alumni dan mantan asisten Laboratorium Kendali kini berkarya di berbagai perusahaan terkemuka.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 tablet:gap-16 opacity-80 grayscale transition-all hover:grayscale-0">
            {alumniCompanies.map((company, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-4 rounded-button bg-surface/40 border border-border/50 min-w-[140px]"
              >
                <span className="text-lg font-bold tracking-wider text-text-muted hover:text-text transition-colors">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}