import bookImg from '../assets/book-3d.webp';
import InfinityMark from './InfinityMark.jsx';

/**
 * PLACEHOLDER for the header animation (spec to be provided).
 * Swap the contents of this component for the final animation (Lottie / video / CSS) —
 * nothing else on the page depends on its internals.
 */
export default function HeroAnimation() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="relative flex aspect-[4/3] w-full items-center justify-center sm:aspect-square">
        <InfinityMark animated className="absolute inset-0 m-auto w-full text-gold/35 sm:w-[115%] sm:-translate-x-[10%]" strokeWidth={10} />
        <div className="absolute inset-[12%] rounded-full bg-brand-2/30 blur-3xl" />
        <img
          src={bookImg}
          alt="Infinite Question Bank — Advanced Accounting, Module 01"
          className="animate-float relative z-10 max-h-full w-[92%] object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,.45)]"
          fetchPriority="high"
        />
      </div>
      {/* Mobile: badges sit in a row under the book. sm+: they float over it. */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-0 sm:block">
        <div className="h-full rounded-2xl bg-paper px-4 py-3 text-ink shadow-xl sm:absolute sm:bottom-[10%] sm:left-[-4%] sm:z-20 sm:h-auto">
          <p className="font-display text-2xl leading-none">10 YEARS</p>
          <p className="text-xs text-mute">RTPs · MTPs · PYQs</p>
        </div>
        <div className="flex h-full items-center gap-2 rounded-2xl bg-gold px-4 py-3 text-ink shadow-xl sm:absolute sm:right-[-2%] sm:top-[14%] sm:z-20 sm:h-auto">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm text-gold">AI</span>
          <p className="text-xs font-semibold leading-tight">
            Similar question
            <br className="hidden sm:block" /> for every question
          </p>
        </div>
      </div>
    </div>
  );
}
