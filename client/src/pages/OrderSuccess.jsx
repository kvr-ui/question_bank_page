import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SimpleHeader from '../components/SimpleHeader.jsx';
import { api } from '../lib/api.js';
import { rupees, CONTACT } from '../lib/format.js';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/orders/${id}/summary`).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader />
      <main className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
        {error ? (
          <p className="text-mute">{error}</p>
        ) : !order ? (
          <div className="mx-auto h-64 animate-pulse rounded-3xl bg-paper-2" />
        ) : (
          <div className="rounded-3xl bg-white p-8 shadow-xl sm:p-12">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold text-4xl text-ink">✓</div>
            <h1 className="mt-6 font-display text-4xl uppercase sm:text-5xl">
              {order.status === 'paid' ? `Thank you, ${order.firstName}!` : 'Payment processing'}
            </h1>
            <p className="mt-4 text-mute">
              {order.status === 'paid'
                ? 'Your payment was successful. Our team will dispatch your books and share your CA Guru.ai access details on your phone and email.'
                : 'We are confirming your payment. This page will show the final status shortly — please refresh in a minute.'}
            </p>
            <div className="mt-8 rounded-2xl bg-paper p-5 text-left text-sm">
              <p className="text-xs uppercase tracking-wider text-mute">Order ID</p>
              <p className="font-mono text-ink">{order.id}</p>
              <ul className="mt-4 space-y-1">
                {order.items.map((i) => <li key={i.title}>• {i.title}</li>)}
              </ul>
              <p className="mt-4 font-semibold">Amount: {rupees(order.amount)}</p>
            </div>
            <p className="mt-6 text-sm text-mute">
              Questions? Call or WhatsApp us on <a className="font-semibold text-brand" href={`https://wa.me/${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a>
            </p>
            <Link to="/" className="btn-ink mt-8">Back to home</Link>
          </div>
        )}
      </main>
    </div>
  );
}
