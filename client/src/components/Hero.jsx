import HeroAnimation from './HeroAnimation.jsx';
import { openLeadForm } from '../lib/leadBus.js';

export default function Hero() {
  return (
    <section id="top" className="grain relative overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-brand/40 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[380px] w-[380px] rounded-full bg-gold/15 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-40">
        <div>
          <p className="reveal mb-6 inline-flex items-center gap-2 rounded-full border border-paper/20 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-paper/80">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
            CA Intermediate · Group 1 &amp; 2
          </p>
          <h1 className="reveal font-display text-[2.6rem] uppercase leading-[1.02] sm:text-6xl lg:text-7xl">
            ICAI has started to use <span className="text-gold">AI</span> in the examinations.
          </h1>
          <p className="reveal mt-6 max-w-xl text-xl font-light leading-snug text-paper/85 sm:text-2xl" style={{ transitionDelay: '120ms' }}>
            When will you begin to use AI in <em className="font-medium not-italic text-gold-2 underline decoration-gold/50 underline-offset-4">your</em> preparation?
          </p>
          <div className="reveal mt-10 flex flex-wrap gap-3" style={{ transitionDelay: '220ms' }}>
            <button onClick={() => openLeadForm()} className="btn-gold text-base">
              Get pricing details
              <span aria-hidden>→</span>
            </button>
            <a href="#inside" className="btn-ghost text-paper">
              See what’s inside
            </a>
          </div>
        </div>
        <div className="reveal" style={{ transitionDelay: '150ms' }}>
          <HeroAnimation />
        </div>
      </div>

      <div className="relative border-y border-paper/10 bg-ink-2/60 py-3">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-lg uppercase tracking-wider text-paper/60">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ['RTPs', 'MTPs', 'PYQs', 'Easy → Hard', 'Master Questions', 'AI Generation', 'Scan · Practice · Repeat', 'Let’s make it your last attempt'].map((t) => (
              <span key={`${k}-${t}`} className="flex items-center gap-10">
                {t} <span className="text-gold">∞</span>
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
