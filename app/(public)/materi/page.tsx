import React from 'react';

export default function AboutPage() {
  return (
    <section className="bg-bg text-text-body min-h-screen p-6 md:p-12">
      <div className="max-w-(--container-content) mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="border-b border-border pb-6">
          <span className="text-meta text-highlight font-mono tracking-wider uppercase">
            Laboratorium Teknik Kendali
          </span>
          <h1 className="text-xl md:text-2xl font-display font-bold text-text mt-1">
            Modul Praktikum Berlangsung
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Pilih modul di bawah untuk mengunduh petunjuk praktikum atau mengumpulkan laporan.
          </p>
        </div>

        {/* Grid Card Praktikum */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
          
          {/* Card Modul 1 */}
          <div className="bg-surface border border-border rounded-card p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-accent transition-colors">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-meta bg-accent/10 text-accent px-2.5 py-1 rounded-button font-medium">
                  MODUL 01
                </span>
                <span className="text-meta text-highlight font-semibold">
                  ● AKTIF
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-text">
                Control System Introduction
              </h3>
              <p className="text-sm text-text-muted mt-2 line-clamp-2">
                Dasar-dasar Teknik Kendali
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-meta text-text-muted">Batas waktu: 23:59 WIB</span>
              {/* Link Google Drive Modul 01 */}
              <a 
                href="https://drive.google.com/file/d/1xt5958AvBdf2yglVpip06DKRWb4SflQz/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent hover:bg-accent-deep text-white text-sm font-medium px-4 py-2 rounded-button transition-colors cursor-pointer inline-block"
              >
                Buka Modul
              </a>
            </div>
          </div>

          {/* Card Modul 2 */}
          <div className="bg-surface border border-border rounded-card p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-accent transition-colors">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-meta bg-border text-text-muted px-2.5 py-1 rounded-button font-medium">
                  MODUL 02
                </span>
                <span className="text-meta text-text-muted">
                  Mendatang
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-text">
                Root Locus & Frequency Response
              </h3>
              <p className="text-sm text-text-muted mt-2 line-clamp-2">
                Metode Tempat Kedudukan Dua Akar
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-meta text-text-muted">Tersedia 12 April</span>
              <button disabled className="bg-border text-text-muted text-sm font-medium px-4 py-2 rounded-button cursor-not-allowed">
                Terkunci
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}