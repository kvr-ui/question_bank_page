import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { rupees } from '../../lib/format.js';
import { Card, ErrorText, PageTitle, btnCls, btnLightCls, inputCls } from './ui.jsx';

const blank = { slug: '', title: '', type: 'single', group: '', module: '01', subjects: '', price: '', mrp: '', image: '', accent: '#1f5fae', sortOrder: 0, active: true };

const toForm = (p) => ({ ...p, group: p.group ?? '', subjects: (p.subjects || []).join(', '), price: p.price / 100, mrp: p.mrp ? p.mrp / 100 : '' });
const toBody = (f) => ({
  slug: f.slug,
  title: f.title,
  type: f.type,
  group: f.group === '' ? null : Number(f.group),
  module: f.module,
  subjects: f.subjects.split(',').map((s) => s.trim()).filter(Boolean),
  price: Math.round(Number(f.price) * 100),
  mrp: f.mrp ? Math.round(Number(f.mrp) * 100) : 0,
  image: f.image,
  accent: f.accent,
  sortOrder: Number(f.sortOrder) || 0,
  active: f.active,
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  const load = () => api('/admin/products').then(setProducts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing === 'new') await api('/admin/products', { method: 'POST', body: toBody(form) });
      else await api(`/admin/products/${editing}`, { method: 'PATCH', body: toBody(form) });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.title}"? Consider marking it inactive instead.`)) return;
    await api(`/admin/products/${p._id}`, { method: 'DELETE' }).catch((e) => setError(e.message));
    load();
  };

  const field = (key, label, props = {}) => (
    <label className="text-sm">
      {label}
      <input className={`${inputCls} mt-1`} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...props} />
    </label>
  );

  return (
    <>
      <PageTitle title="Products & prices">
        <button className={btnCls} onClick={() => { setForm(blank); setEditing('new'); }}>Add product</button>
      </PageTitle>
      <p className="-mt-4 mb-6 text-sm text-slate-500">Prices set here are shown on the landing page, in the cart and at checkout.</p>
      <ErrorText>{error}</ErrorText>

      {editing && (
        <Card className="mb-6">
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {field('title', 'Title', { required: true, className: `${inputCls} mt-1` })}
            {field('slug', 'Slug (URL)', { required: true, disabled: editing !== 'new', pattern: '[a-z0-9-]+' })}
            <label className="text-sm">Type
              <select className={`${inputCls} mt-1`} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="single">Single book</option><option value="bundle">Bundle / set</option>
              </select>
            </label>
            <label className="text-sm">Group
              <select className={`${inputCls} mt-1`} value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                <option value="">Both / none</option><option value="1">Group 1</option><option value="2">Group 2</option>
              </select>
            </label>
            {field('price', 'Price (₹)', { type: 'number', min: 1, step: '1', required: true })}
            {field('mrp', 'MRP (₹, optional — shows strike-through)', { type: 'number', min: 0, step: '1' })}
            {field('module', 'Module')}
            {field('sortOrder', 'Sort order', { type: 'number' })}
            <div className="sm:col-span-2">{field('subjects', 'Subjects (comma separated)')}</div>
            {field('image', 'Image path (e.g. /products/direct-tax.webp)')}
            <label className="text-sm">Accent colour
              <input type="color" className="mt-1 block h-10 w-full rounded-lg border border-slate-300" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active (visible)
            </label>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
              <button className={btnCls}>Save</button>
              <button type="button" className={btnLightCls} onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="p-3" /><th className="p-3">Product</th><th className="p-3">Type</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p._id}>
                <td className="p-3"><img src={p.image} alt="" className="h-12 w-9 rounded object-cover" /></td>
                <td className="p-3 font-medium">{p.title}<div className="text-xs font-normal text-slate-500">/checkout/{p.slug}</div></td>
                <td className="p-3 text-xs">{p.type}{p.group ? ` · G${p.group}` : ''}</td>
                <td className="p-3">{rupees(p.price)}{p.mrp > 0 && <div className="text-xs text-slate-400 line-through">{rupees(p.mrp)}</div>}</td>
                <td className="p-3 text-xs">{p.active ? 'Active' : 'Hidden'}</td>
                <td className="space-x-3 whitespace-nowrap p-3 text-right text-xs">
                  <button className="text-brand hover:underline" onClick={() => { setForm(toForm(p)); setEditing(p._id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
            {!products.length && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No products. Run <code>npm run seed</code> to add the 8 subjects and sets.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
