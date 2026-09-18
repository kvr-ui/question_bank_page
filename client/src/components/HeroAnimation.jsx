import bookImg from '../assets/book-3d.webp';
import InfinityMark from './InfinityMark.jsx';

/**
 * PLACEHOLDER for the header animation (spec to be provided).
 * Swap the contents of this component for the final animation (Lottie / video / CSS) —
 * nothing else on the page depends on its internals.
 */
export default function HeroAnimation() {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[560px] items-center justify-center">
      <InfinityMark animated className="absolute inset-0 m-auto w-[115%] -translate-x-[6%] text-gold/35" strokeWidth={10} />
      <div className="absolute inset-[12%] rounded-full bg-brand-2/30 blur-3xl" />
      <img
        src={bookImg}
        alt="Infinite Question Bank — Advanced Accounting, Module 01"
        className="animate-float relative z-10 w-[92%] drop-shadow-[0_40px_60px_rgba(0,0,0,.45)]"
        fetchPriority="high"
      />
      <div className="absolute bottom-[10%] left-0 z-20 rounded-2xl bg-paper px-4 py-3 text-ink shadow-xl sm:left-[-4%]">
        <p className="font-display text-2xl leading-none">10 YEARS</p>
        <p className="text-xs text-mute">RTPs · MTPs · PYQs</p>
      </div>
      <div className="absolute right-0 top-[14%] z-20 flex items-center gap-2 rounded-2xl bg-gold px-4 py-3 text-ink shadow-xl sm:right-[-2%]">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-gold">AI</span>
        <p className="text-xs font-semibold leading-tight">
          Similar question
          <br />
          for every question
        </p>
      </div>
    </div>
  );
}
