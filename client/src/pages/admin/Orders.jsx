import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { dateTime, rupees } from '../../lib/format.js';
import { Badge, Card, ErrorText, PageTitle, inputCls } from './ui.jsx';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('paid');
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/admin/orders${status ? `?status=${status}` : ''}`).then(setOrders).catch((e) => setError(e.message));
  }, [status]);

  const update = async (id, body) => {
    try {
      const o = await api(`/admin/orders/${id}`, { method: 'PATCH', body });
      setOrders((os) => os.map((x) => (x._id === id ? o : x)));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageTitle title={`Orders (${orders.length})`}>
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="paid">Paid</option>
          <option value="created">Started (unpaid)</option>
          <option value="failed">Failed</option>
          <option value="">All</option>
        </select>
      </PageTitle>
      <ErrorText>{error}</ErrorText>
      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o._id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{o.customer.name} <Badge value={o.status} />{o.customer.caLevel && <span className="ml-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">CA {o.customer.caLevel}</span>}</p>
                <p className="text-sm text-slate-600">
                  <a className="text-brand hover:underline" href={`https://wa.me/91${o.customer.phone}`} target="_blank" rel="noreferrer">{o.customer.phone}</a> · {o.customer.email}
                </p>
                <p className="mt-1 text-xs text-slate-500">{dateTime(o.createdAt)} · #{o._id} {o.razorpayPaymentId && `· ${o.razorpayPaymentId}`}</p>
              </div>
              <p className="text-xl font-semibold">{rupees(o.amount)}</p>
            </div>
            <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-slate-500">Items</p>
                <ul>{o.items.map((i) => <li key={i.slug}>• {i.title}</li>)}</ul>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Ship to</p>
                <p className="whitespace-pre-line">{o.shipping.address}</p>
                <p>{o.shipping.city}, {o.shipping.state} – {o.shipping.pincode}</p>
              </div>
              {o.status === 'paid' && (
                <div className="space-y-2">
                  <label className="block text-xs uppercase text-slate-500">Shipping
                    <select className={`${inputCls} mt-1`} value={o.shipStatus} onChange={(e) => update(o._id, { shipStatus: e.target.value })}>
                      <option>pending</option><option>dispatched</option><option>delivered</option>
                    </select>
                  </label>
                  <input className={inputCls} placeholder="Courier / tracking no." defaultValue={o.trackingInfo} onBlur={(e) => e.target.value !== o.trackingInfo && update(o._id, { trackingInfo: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={o.appAccess === 'activated'} onChange={(e) => update(o._id, { appAccess: e.target.checked ? 'activated' : 'pending' })} />
                    CA Guru.ai access activated
                  </label>
                </div>
              )}
            </div>
          </Card>
        ))}
        {!orders.length && <Card className="text-center text-slate-500">No orders.</Card>}
      </div>
    </>
  );
}
