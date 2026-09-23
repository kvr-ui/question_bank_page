import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

const LMS_ADMIN_URL = import.meta.env.VITE_LMS_ADMIN_URL || '';
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
                  {/* Dispatch moved to the FOCAS LMS — it creates the Delhivery
                      shipment and holds the AWB. Recording it here too would
                      leave two half-true records of the same parcel. */}
                  <div>
                    <p className="text-xs uppercase text-slate-500">Shipping</p>
                    <p className="text-sm text-slate-600">
                      Dispatched from the FOCAS LMS
                      {LMS_ADMIN_URL
                        ? <> — <a href={`${LMS_ADMIN_URL}/orders`} target="_blank" rel="noreferrer" className="text-brand hover:underline">open All Orders →</a></>
                        : ' (All Orders → Delivery)'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {o.lmsSync?.status === 'synced'
                        ? 'Synced to the LMS.'
                        : o.lmsSync?.status === 'failed'
                          ? `Not synced yet — ${o.lmsSync.error || 'see the server log'}`
                          : 'Waiting to sync to the LMS.'}
                    </p>
                  </div>
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
