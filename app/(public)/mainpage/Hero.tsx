export function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-5 px-8 text-center">
      <h1 className="max-w-content font-display text-hero-sm font-bold tracking-tight md:text-3xl">
        Controllab
      </h1>
      <p className="max-w-md text-lg text-text-muted">
        Interactive control systems, from Bode plots to state space.
      </p>
    </section>
  );
}
