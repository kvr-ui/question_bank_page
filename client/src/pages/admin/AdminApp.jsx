import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { api } from '../../lib/api.js';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Leads from './Leads.jsx';
import Orders from './Orders.jsx';
import PaymentLinks from './PaymentLinks.jsx';
import Products from './Products.jsx';
import Testimonials from './Testimonials.jsx';

const NAV = [
  ['', 'Dashboard'],
  ['leads', 'Leads'],
  ['orders', 'Orders'],
  ['payment-links', 'Payment links'],
  ['products', 'Products & prices'],
  ['testimonials', 'Testimonials'],
];

export default function AdminApp() {
  const [authed, setAuthed] = useState(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    api('/admin/me').then(() => setAuthed(true)).catch(() => setAuthed(false));
  }, []);

  if (authed === null) return <div className="grid min-h-screen place-items-center text-mute">Loading…</div>;
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const logout = async () => {
    await api('/admin/logout', { method: 'POST' }).catch(() => {});
    setAuthed(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-ink text-paper lg:min-h-screen">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <p className="font-display text-2xl tracking-wide">FOCAS <span className="text-gold">Admin</span></p>
          <button className="lg:hidden" onClick={() => setMenu((m) => !m)} aria-label="Menu">☰</button>
        </div>
        <nav className={`${menu ? 'block' : 'hidden'} px-3 pb-4 lg:block`}>
          {NAV.map(([to, label]) => (
            <NavLink
              key={to}
              to={`/admin/${to}`}
              end={to === ''}
              onClick={() => setMenu(false)}
              className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-paper/15 text-gold' : 'text-paper/80 hover:bg-paper/10'}`}
            >
              {label}
            </NavLink>
          ))}
          <button onClick={logout} className="mt-4 block w-full rounded-lg px-3 py-2 text-left text-sm text-paper/60 hover:bg-paper/10">
            Log out
          </button>
        </nav>
      </aside>
      <main className="min-w-0 p-4 sm:p-8">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payment-links" element={<PaymentLinks />} />
          <Route path="products" element={<Products />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
