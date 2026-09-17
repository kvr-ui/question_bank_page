import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../lib/cart.jsx';
import { rupees } from '../lib/format.js';
import { paperLabel } from '../lib/subjects.js';

export function CartButton({ className = '' }) {
  const { items, setOpen } = useCart();
  return (
    <button onClick={() => setOpen(true)} aria-label={`Open cart, ${items.length} item${items.length === 1 ? '' : 's'}`} className={`relative rounded-lg p-2 transition hover:text-gold ${className}`}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
        <path d="M2.5 3.5h3l2.4 11.2a1.6 1.6 0 001.6 1.3h8.2a1.6 1.6 0 001.6-1.2L21 7H6.3" />
      </svg>
      {items.length > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.7rem] font-bold text-ink">{items.length}</span>
      )}
    </button>
  );
}

export default function CartDrawer() {
  const { items, remove, total, open, setOpen } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 text-ink">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside role="dialog" aria-modal="true" aria-label="Your cart" className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="font-display text-3xl uppercase">Your cart</h2>
          <button onClick={() => setOpen(false)} aria-label="Close cart" className="rounded-lg p-2 hover:bg-ink/5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-mute">
            <p>Your cart is empty.</p>
            <a href="#books" onClick={() => setOpen(false)} className="btn-ink px-5 py-2.5 text-sm">Browse books</a>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((it) => (
                <li key={it.slug} className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm">
                  <img src={it.image} alt="" className="h-20 w-16 shrink-0 rounded-md object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="font-semibold leading-snug">{it.title}</p>
                    <p className="text-xs text-mute">{paperLabel(it.subjects)}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-semibold">{rupees(it.price)}</span>
                      <button onClick={() => remove(it.slug)} className="text-xs text-mute underline hover:text-red-700">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink/10 px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-mute">Total</span>
                <span className="font-display text-3xl">{rupees(total)}</span>
              </div>
              <p className="mt-1 text-xs text-mute">Free shipping. Final amount confirmed at checkout.</p>
              <Link to="/checkout/cart" onClick={() => setOpen(false)} className="btn-gold mt-4 w-full py-3.5">
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
