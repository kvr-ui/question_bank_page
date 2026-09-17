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
    </>
  );
}
