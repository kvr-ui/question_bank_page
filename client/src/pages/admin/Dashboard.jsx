import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { rupees } from '../../lib/format.js';
import { Card, PageTitle } from './ui.jsx';

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => {
    api('/admin/stats').then(setS).catch(() => setS({}));
  }, []);

  const tiles = [
    ['New leads', s?.newLeads, '/admin/leads'],
    ['Total leads', s?.totalLeads, '/admin/leads'],
    ['Paid orders', s?.paidOrders, '/admin/orders'],
    ['Awaiting dispatch', s?.pendingShip, '/admin/orders'],
    ['Revenue', s ? rupees(s.revenue) : undefined, '/admin/orders'],
  ];

  return (
    <>
      <PageTitle title="Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {tiles.map(([label, value, to]) => (
          <Link key={label} to={to}>
            <Card className="transition hover:ring-brand/40">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{value ?? '—'}</p>
            </Card>
          </Link>
        ))}
      </div>
      {s?.lowStock?.length > 0 && (
        <Card className="mt-6 ring-amber-300">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Stock alerts</h2>
            <Link to="/admin/products" className="text-sm text-brand hover:underline">Update stock →</Link>
          </div>
          <p className="mt-1 text-sm text-slate-500">Products at or below {s.lowStockThreshold} copies.</p>
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {s.lowStock.map((p) => (
              <li key={p._id} className="flex items-center justify-between gap-3 py-2">
                <span>{p.title}{!p.active && <span className="ml-2 text-xs text-slate-400">(hidden)</span>}</span>
                {p.stock <= 0
                  ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Out of stock</span>
                  : <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{p.stock} left</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
