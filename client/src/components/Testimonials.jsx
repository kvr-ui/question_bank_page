import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { useReveal } from '../lib/useReveal.js';

function withParams(url) {
  const u = new URL(url);
  u.searchParams.set('autoplay', 'false');
  u.searchParams.set('preload', 'false');
  u.searchParams.set('responsive', 'true');
  return u.toString();
}

export default function Testimonials() {
  const [items, setItems] = useState(null);
  const track = useRef(null);

  useEffect(() => {
    api('/testimonials').then(setItems).catch(() => setItems([]));
  }, []);
  useReveal([items]);

  const scroll = (dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: 'smooth' });
  };

  return (
    <section id="testimonials" className="overflow-hidden bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">Student stories</p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-[0.95] sm:text-6xl">
              Hear it from <span className="text-brand">them</span>
            </h2>
          </div>
          {items?.length > 1 && (
            <div className="hidden gap-2 sm:flex">
              {[-1, 1].map((d) => (
                <button key={d} onClick={() => scroll(d)} aria-label={d < 0 ? 'Previous' : 'Next'} className="grid h-12 w-12 place-items-center rounded-full border border-ink/20 transition hover:bg-ink hover:text-paper">
                  {d < 0 ? '←' : '→'}
                </button>
              ))}
            </div>
          )}
        </div>

        {items === null ? (
          <div className="mt-12 flex gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] w-64 shrink-0 animate-pulse rounded-3xl bg-paper-2" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="reveal mt-12 rounded-3xl border border-dashed border-ink/20 p-10 text-center text-mute">Student video testimonials are coming soon.</p>
        ) : (
          <div ref={track} className="-mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6">
            {items.map((t, i) => (
              <figure
                key={t._id}
                className={`rise shrink-0 snap-start ${t.orientation === 'vertical' ? 'w-[72vw] max-w-[300px]' : 'w-[88vw] max-w-[560px]'}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`relative overflow-hidden rounded-3xl bg-ink shadow-xl ${t.orientation === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'}`}>
                  <iframe
                    src={withParams(t.bunnyEmbedUrl)}
                    title={`Testimonial from ${t.studentName}`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <figcaption className="mt-3 px-1">
                  <p className="font-semibold">{t.studentName}</p>
                  {t.caption && <p className="text-sm text-mute">{t.caption}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
