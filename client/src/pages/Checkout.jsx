import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SimpleHeader from '../components/SimpleHeader.jsx';
import { api } from '../lib/api.js';
import { rupees, CONTACT } from '../lib/format.js';
import { loadRazorpay } from '../lib/razorpay.js';
import { STATES } from '../lib/states.js';
import { paperLabel } from '../lib/subjects.js';
import { useCart } from '../lib/cart.jsx';

const emptyForm = {
  customer: { name: '', phone: '', email: '' },
  shipping: { address: '', city: '', state: '', pincode: '' },
};

export default function Checkout({ cart: fromCart = false }) {
  const { slug, token } = useParams();
  const cart = useCart();
  const cartSlugs = cart.items.map((i) => i.slug).join(',');
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (fromCart && !cartSlugs) {
      setLoadError('Your cart is empty. Add a book to continue.');
      return;
    }
    const path = token ? `/checkout/link/${token}` : fromCart ? `/checkout/cart?slugs=${encodeURIComponent(cartSlugs)}` : `/checkout/product/${slug}`;
    setLoadError('');
    api(path).then(setData).catch((e) => setLoadError(e.message));
    loadRazorpay();
  }, [slug, token, fromCart, cartSlugs]);

  const set = (section, key) => (e) => {
    let v = e.target.value;
    if (key === 'phone' || key === 'pincode') v = v.replace(/\D/g, '');
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: v } }));
  };

  const pay = async (e) => {
    e.preventDefault();
    setError('');
    setPaying(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error('Could not load the payment window. Check your connection and try again.');
      const order = await api('/payments/order', { method: 'POST', body: { ...(token ? { token } : fromCart ? { slugs: data.items.map((i) => i.slug) } : { slug }), ...form } });

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.razorpayOrderId,
        amount: order.amount,
        currency: order.currency,
        name: 'FOCAS',
        description: 'Infinite Question Bank',
        prefill: { name: form.customer.name, email: form.customer.email, contact: `+91${form.customer.phone}` },
        theme: { color: '#1f5fae' },
        handler: async (resp) => {
          try {
            const r = await api('/payments/verify', { method: 'POST', body: resp });
            if (fromCart) cart.clear();
            navigate(`/order/success/${r.orderId}`, { replace: true });
          } catch (err) {
            setError(`${err.message}. If money was deducted, contact us on ${CONTACT.phoneDisplay} with your payment ID: ${resp.razorpay_payment_id}`);
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.on('payment.failed', (resp) => {
        api('/payments/failed', { method: 'POST', body: { razorpay_order_id: order.razorpayOrderId } }).catch(() => {});
        setError(resp.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-paper">
        <SimpleHeader />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-4xl uppercase">{fromCart ? 'Cart unavailable' : 'Link unavailable'}</h1>
          <p className="mt-4 text-mute">{loadError}</p>
          <Link to="/" className="btn-ink mt-8">Back to home</Link>
        </div>
      </div>
    );
  }

  const discount = data && data.mrp > data.amount ? data.mrp - data.amount : 0;

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:py-14">
        <form onSubmit={pay} className="order-2 space-y-8 lg:order-1">
          <div>
            <h1 className="font-display text-4xl uppercase sm:text-5xl">Checkout</h1>
            <p className="mt-2 text-mute">Your books will be shipped to the address below. App access details will be shared on your phone and email.</p>
          </div>

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold">Contact details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="c-name">Full name</label>
                <input id="c-name" className="field" required minLength={2} autoComplete="name" value={form.customer.name} onChange={set('customer', 'name')} />
              </div>
              <div>
                <label className="label" htmlFor="c-phone">Mobile</label>
                <div className="flex">
                  <span className="grid place-items-center rounded-l-xl border border-r-0 border-ink/15 bg-paper-2 px-3 text-sm text-mute">+91</span>
                  <input id="c-phone" className="field rounded-l-none" required inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} autoComplete="tel-national" value={form.customer.phone} onChange={set('customer', 'phone')} title="10-digit mobile number" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="c-email">Email</label>
                <input id="c-email" type="email" className="field" required autoComplete="email" value={form.customer.email} onChange={set('customer', 'email')} />
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold">Shipping address</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="s-address">House / street / area</label>
                <textarea id="s-address" rows={3} className="field resize-none" required minLength={8} autoComplete="street-address" value={form.shipping.address} onChange={set('shipping', 'address')} />
              </div>
              <div>
                <label className="label" htmlFor="s-city">City</label>
                <input id="s-city" className="field" required autoComplete="address-level2" value={form.shipping.city} onChange={set('shipping', 'city')} />
              </div>
              <div>
                <label className="label" htmlFor="s-pin">Pincode</label>
                <input id="s-pin" className="field" required inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} autoComplete="postal-code" value={form.shipping.pincode} onChange={set('shipping', 'pincode')} title="6-digit pincode" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="s-state">State</label>
                <select id="s-state" className="field" required value={form.shipping.state} onChange={set('shipping', 'state')}>
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

          {error && <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">{error}</p>}

          <button type="submit" disabled={!data || paying} className="btn-gold w-full py-4 text-lg">
            {paying ? 'Processing…' : data ? `Pay ${rupees(data.amount)} securely` : 'Loading…'}
          </button>
          <p className="text-center text-xs text-mute">Payments are processed securely by Razorpay. UPI, cards, net banking and wallets accepted.</p>
        </form>

        <aside className="order-1 lg:order-2">
          <div className="sticky top-6 rounded-3xl bg-ink p-6 text-paper shadow-xl sm:p-8">
            <h2 className="font-display text-2xl uppercase tracking-wide">Order summary</h2>
            {!data ? (
              <div className="mt-6 h-40 animate-pulse rounded-2xl bg-paper/10" />
            ) : (
              <>
                <ul className="mt-6 space-y-4">
                  {data.items.map((it) => (
                    <li key={it.slug} className="flex gap-4">
                      <img src={it.image} alt="" className="h-20 w-16 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug">{it.title}</p>
                        <p className="text-xs text-paper/60">
                          {it.group ? `Group ${it.group}` : 'Both groups'} · {paperLabel(it.subjects)}
                        </p>
                        {it.type === 'bundle' && <p className="mt-1 text-xs text-paper/60">{it.subjects.join(', ')}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
                {data.note && <p className="mt-5 rounded-xl bg-paper/10 px-4 py-3 text-sm text-paper/80">{data.note}</p>}
                <dl className="mt-6 space-y-2 border-t border-paper/15 pt-5 text-sm">
                  {discount > 0 && (
                    <>
                      <div className="flex justify-between text-paper/70"><dt>MRP</dt><dd className="line-through">{rupees(data.mrp)}</dd></div>
                      <div className="flex justify-between text-gold-2"><dt>You save</dt><dd>{rupees(discount)}</dd></div>
                    </>
                  )}
                  <div className="flex justify-between text-paper/70"><dt>Shipping</dt><dd>Free</dd></div>
                  <div className="flex items-baseline justify-between pt-2 text-lg font-semibold"><dt>Total</dt><dd className="font-display text-3xl text-gold">{rupees(data.amount)}</dd></div>
                </dl>
                <ul className="mt-6 space-y-2 text-xs text-paper/70">
                  <li>✓ Printed book(s) shipped to your address</li>
                  <li>✓ AI practice access via CA Guru.ai</li>
                </ul>
              </>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
