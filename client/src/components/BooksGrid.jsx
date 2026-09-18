import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useCart } from '../lib/cart.jsx';
import { rupees } from '../lib/format.js';
import { paperLabel } from '../lib/subjects.js';

const LOW_STOCK = 10;

const TABS = [
  ['all', 'All subjects'],
  ['1', 'Group 1'],
  ['2', 'Group 2'],
  ['bundle', 'Sets'],
];

export default function BooksGrid() {
  const [products, setProducts] = useState(null);
  const [tab, setTab] = useState('all');
  const cart = useCart();

  useEffect(() => {
    api('/products').then(setProducts).catch(() => setProducts([]));
  }, []);

  const visible = useMemo(() => {
    if (!products) return [];
    if (tab === 'bundle') return products.filter((p) => p.type === 'bundle');
    const singles = products.filter((p) => p.type === 'single');
    return tab === 'all' ? singles : singles.filter((p) => String(p.group) === tab);
  }, [products, tab]);


  return (
    <section id="books" className="bg-paper-2/60 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">The books</p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-[0.95] sm:text-6xl">
              8 subjects. <span className="text-brand">Infinite practice.</span>
            </h2>
          </div>
          <div role="tablist" className="flex flex-wrap gap-2">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === key ? 'bg-ink text-paper' : 'bg-white text-ink hover:bg-ink/5'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {products === null ? (
          <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4.4] animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="mt-12 rounded-2xl bg-white p-8 text-center text-mute">Books will appear here soon. Request a call and our team will help you choose.</p>
        ) : (
          <div className={`mt-12 grid gap-5 ${tab === 'bundle' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {visible.map((p, i) => {
              const out = p.stock != null && p.stock <= 0;
              const low = !out && p.stock != null && p.stock <= LOW_STOCK;
              return (
              <article
                key={p.slug}
                className="rise group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${(i % 4) * 70}ms`, '--accent': p.accent }}
              >
                <div className="relative overflow-hidden bg-[var(--accent)]/10 p-4 sm:p-6">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-[var(--accent)]" />
                  {out && <span className="absolute left-3 top-4 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">Out of stock</span>}
                  <img
                    src={p.image}
                    alt={`${p.title} — Infinite Question Bank cover`}
                    loading="lazy"
                    className={`mx-auto rounded-md shadow-[0_20px_30px_-12px_rgba(0,0,0,.45)] transition duration-500 group-hover:-rotate-2 group-hover:scale-[1.03] ${p.type === 'bundle' && p.slug === 'all-8-set' ? 'w-full' : 'w-[82%]'} ${out ? 'opacity-50 grayscale' : ''}`}
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-mute">
                    {p.group ? `Group ${p.group}` : 'Both groups'} · {paperLabel(p.subjects)}
                  </p>
                  <h3 className="mt-1 flex-1 text-base font-semibold leading-snug sm:text-lg">{p.title}</h3>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-3xl leading-none">{rupees(p.price)}</span>
                    {p.mrp > p.price && <span className="text-sm text-mute line-through">{rupees(p.mrp)}</span>}
                  </p>
                  {low && <p className="mt-2 text-sm font-semibold text-red-600">Only {p.stock} left — order soon</p>}
                  {out ? (
                    <p className="mt-4 rounded-full bg-ink/5 px-3 py-2.5 text-center text-sm font-semibold text-mute">Out of stock</p>
                  ) : (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button onClick={() => cart.add(p)} className="btn flex-1 border border-ink/15 px-3 py-2.5 text-sm hover:bg-ink hover:text-paper">
                        {cart.has(p.slug) ? 'In cart ✓' : 'Add to cart'}
                      </button>
                      <Link to={`/checkout/${p.slug}`} className="btn flex-1 bg-[var(--accent)] px-3 py-2.5 text-sm text-white hover:brightness-110">
                        Buy Now
                      </Link>
                    </div>
                  )}
                </div>
              </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
