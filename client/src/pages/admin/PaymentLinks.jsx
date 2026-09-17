import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { dateTime, rupees } from '../../lib/format.js';
import { Card, ErrorText, PageTitle, btnCls, inputCls } from './ui.jsx';

const absolute = (url) => (url.startsWith('/') ? `${window.location.origin}${url}` : url);

export default function PaymentLinks() {
  const [params] = useSearchParams();
  const leadId = params.get('lead');
  const [products, setProducts] = useState([]);
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState({ productSlugs: [], customPrice: '', note: '', expiresInDays: 7 });
  const [created, setCreated] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    api('/admin/products').then(setProducts).catch((e) => setError(e.message));
    api('/admin/payment-links').then(setLinks).catch((e) => setError(e.message));
  }, []);

  const toggle = (slug) =>
    setForm((f) => ({ ...f, productSlugs: f.productSlugs.includes(slug) ? f.productSlugs.filter((s) => s !== slug) : [...f.productSlugs, slug] }));

  const listTotal = products.filter((p) => form.productSlugs.includes(p.slug)).reduce((s, p) => s + p.price, 0);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const link = await api('/admin/payment-links', {
        method: 'POST',
        body: {
          productSlugs: form.productSlugs,
          customPrice: form.customPrice ? Math.round(Number(form.customPrice) * 100) : null,
          note: form.note,
          expiresInDays: form.expiresInDays,
          leadId,
        },
      });
      setCreated(link);
      setLinks((ls) => [link, ...ls]);
      setForm({ productSlugs: [], customPrice: '', note: '', expiresInDays: 7 });
    } catch (err) {
      setError(err.message);
    }
  };

  const copy = async (url) => {
    await navigator.clipboard.writeText(absolute(url));
    setCopied(url);
    setTimeout(() => setCopied(''), 1500);
  };

  const remove = async (id) => {
    if (!confirm('Delete this payment link? It will stop working.')) return;
    await api(`/admin/payment-links/${id}`, { method: 'DELETE' }).catch((e) => setError(e.message));
    setLinks((ls) => ls.filter((l) => l._id !== id));
  };

  return (
    <>
      <PageTitle title="Payment links" />
      <p className="-mt-4 mb-6 text-sm text-slate-500">Create a checkout link after the call and send it to the student on WhatsApp. Prices are only shown on this link.</p>
      <ErrorText>{error}</ErrorText>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <form onSubmit={create} className="space-y-4">
            {leadId && <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">This link will be attached to the selected lead.</p>}
            <div>
              <p className="mb-2 text-sm font-medium">Products</p>
              <div className="grid max-h-72 gap-1 overflow-auto sm:grid-cols-2">
                {products.map((p) => (
                  <label key={p.slug} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                    <input type="checkbox" checked={form.productSlugs.includes(p.slug)} onChange={() => toggle(p.slug)} />
                    <span className="flex-1">{p.title}</span>
                    <span className="text-xs text-slate-500">{rupees(p.price)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Custom price (₹, optional)
                <input className={`${inputCls} mt-1`} type="number" min="1" step="1" placeholder={listTotal ? String(listTotal / 100) : ''} value={form.customPrice} onChange={(e) => setForm({ ...form, customPrice: e.target.value })} />
              </label>
              <label className="text-sm">Expires in (days)
                <input className={`${inputCls} mt-1`} type="number" min="1" max="60" value={form.expiresInDays} onChange={(e) => setForm({ ...form, expiresInDays: e.target.value })} />
              </label>
            </div>
            <label className="block text-sm">Note shown on checkout (optional)
              <input className={`${inputCls} mt-1`} maxLength={200} placeholder="e.g. Special price as discussed on call" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </label>
            <p className="text-sm text-slate-600">
              Student pays: <strong>{rupees(form.customPrice ? Number(form.customPrice) * 100 : listTotal)}</strong>
            </p>
            <button className={btnCls} disabled={!form.productSlugs.length}>Create link</button>
          </form>
          {created && (
            <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm">
              <p className="font-medium text-green-800">Link created</p>
              <div className="mt-2 flex gap-2">
                <input readOnly className={inputCls} value={absolute(created.url)} onFocus={(e) => e.target.select()} />
                <button type="button" className={btnCls} onClick={() => copy(created.url)}>{copied === created.url ? 'Copied' : 'Copy'}</button>
              </div>
            </div>
          )}
        </Card>

        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="p-3">Created</th><th className="p-3">Products</th><th className="p-3">Price</th><th className="p-3">State</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {links.map((l) => {
                const expired = new Date(l.expiresAt) < new Date();
                return (
                  <tr key={l._id}>
                    <td className="whitespace-nowrap p-3 text-slate-500">{dateTime(l.createdAt)}{l.lead && <div className="text-xs">{l.lead.name}</div>}</td>
                    <td className="p-3 text-xs">{l.productSlugs.join(', ')}</td>
                    <td className="p-3">{l.customPrice ? rupees(l.customPrice) : 'List price'}</td>
                    <td className="p-3 text-xs">{l.used ? '✅ Paid' : expired ? '⌛ Expired' : 'Active'}</td>
                    <td className="space-x-2 whitespace-nowrap p-3 text-right text-xs">
                      {!l.used && !expired && <button className="text-brand hover:underline" onClick={() => copy(l.url)}>{copied === l.url ? 'Copied' : 'Copy'}</button>}
                      <button className="text-red-600 hover:underline" onClick={() => remove(l._id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {!links.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No payment links yet.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
