export default function Credits() {
  return (
    <section id="credits" className="relative overflow-hidden bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div className="reveal relative mx-auto grid aspect-square w-full max-w-[15rem] place-items-center sm:max-w-sm rounded-full bg-ink text-paper shadow-[0_40px_80px_-30px_rgba(11,36,71,.7)]">
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-gold/40" />
          <div className="text-center">
            <p className="font-display text-[5.5rem] leading-none text-gold sm:text-[9rem]">50</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.3em] text-paper/80">AI Credits</p>
          </div>
        </div>

        <div>
          <p className="reveal text-sm font-semibold uppercase tracking-[0.25em] text-brand">Credits</p>
          <h2 className="reveal mt-3 font-display text-5xl uppercase leading-[0.95] sm:text-6xl">
            How many questions <span className="text-brand">do I get?</span>
          </h2>
          <p className="reveal mt-6 max-w-xl text-xl leading-relaxed text-ink/85">
            With the purchase of our Question Bank, you get credits to generate up to <strong className="font-semibold text-ink">50 questions</strong>.
          </p>
          <p className="reveal mt-4 max-w-xl text-lg leading-relaxed text-mute">
            You can come back to this website and purchase additional credits as and when needed.
          </p>
        </div>
      </div>
    </section>
  );
}
