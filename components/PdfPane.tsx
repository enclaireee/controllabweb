export function urlSematan(url: string): string {
  const drive = url.match(
    /^https:\/\/drive\.google\.com\/file\/d\/([^/]+)/,
  );
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return url;
}

export default function PdfPane({
  url,
  judul,
}: {
  url: string | null;
  judul: string;
}) {
  if (!url) {
    return (
      <div className="rounded-card border border-border bg-surface p-8">
        <p className="text-sm text-text-muted">
          Materi modul ini belum diunggah. PDF akan muncul di sini setelah
          asisten memasang tautannya.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <iframe
        src={urlSematan(url)}
        title={`Materi ${judul}`}
        allow="autoplay"
        className="h-[70vh] w-full rounded-card border border-border bg-surface"
      />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex text-sm text-accent-text underline decoration-1 underline-offset-2 transition-colors duration-120 ease-signal hover:text-text"
      >
        Buka PDF di tab baru
      </a>
    </div>
  );
}
