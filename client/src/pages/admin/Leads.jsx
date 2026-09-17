import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { dateTime } from '../../lib/format.js';
import { Badge, Card, ErrorText, PageTitle, btnLightCls, inputCls } from './ui.jsx';

const STATUSES = ['new', 'contacted', 'converted', 'not-interested'];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const qs = new URLSearchParams({ ...(status && { status }), ...(search && { search }) }).toString();

  const load = useCallback(() => {
    api(`/admin/leads?${qs}`).then(setLeads).catch((e) => setError(e.message));
  }, [qs]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const update = async (id, body) => {
    try {
      const updated = await api(`/admin/leads/${id}`, { method: 'PATCH', body });
      setLeads((ls) => ls.map((l) => (l._id === id ? updated : l)));
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this lead?')) return;
    await api(`/admin/leads/${id}`, { method: 'DELETE' }).catch((e) => setError(e.message));
    setLeads((ls) => ls.filter((l) => l._id !== id));
  };

  return (
    <>
      <PageTitle title={`Leads (${leads.length})`}>
        <a href={`/api/admin/leads/export.csv?${qs}`} className={btnLightCls}>Export CSV</a>
      </PageTitle>
      <div className="mb-4 flex flex-wrap gap-3">
        <input className={`${inputCls} max-w-xs`} placeholder="Search name, phone, email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${inputCls} max-w-[180px]`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <ErrorText>{error}</ErrorText>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Received</th><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Subjects</th><th className="p-3">Status</th><th className="p-3">Notes</th><th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l) => (
              <tr key={l._id} className="align-top">
                <td className="whitespace-nowrap p-3 text-slate-500">{dateTime(l.createdAt)}</td>
                <td className="p-3 font-medium">{l.name}<div className="text-xs font-normal text-slate-500">{l.email}</div></td>
                <td className="whitespace-nowrap p-3">
                  <a className="text-brand hover:underline" href={`https://wa.me/91${l.phone}`} target="_blank" rel="noreferrer">{l.phone}</a>
                </td>
                <td className="max-w-[220px] p-3 text-xs text-slate-600">{l.subjects?.join(', ') || '—'}</td>
                <td className="p-3">
                  <Badge value={l.status} />
                  <select className="mt-1 block rounded border border-slate-200 text-xs" value={l.status} onChange={(e) => update(l._id, { status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <textarea
                    defaultValue={l.notes}
                    rows={2}
                    className="w-48 rounded border border-slate-200 p-1 text-xs"
                    onBlur={(e) => e.target.value !== l.notes && update(l._id, { notes: e.target.value })}
                  />
                </td>
                <td className="space-y-1 whitespace-nowrap p-3 text-right text-xs">
                  <Link className="block text-brand hover:underline" to={`/admin/payment-links?lead=${l._id}`}>Payment link</Link>
                  <button className="text-red-600 hover:underline" onClick={() => remove(l._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!leads.length && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No leads yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
