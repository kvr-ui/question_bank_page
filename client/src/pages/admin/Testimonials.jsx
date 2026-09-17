import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Card, ErrorText, PageTitle, btnCls, btnLightCls, inputCls } from './ui.jsx';

const blank = { studentName: '', caption: '', bunnyEmbedUrl: '', orientation: 'vertical', order: 0, active: true };

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/admin/testimonials').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form, order: Number(form.order) || 0 };
      if (editing) await api(`/admin/testimonials/${editing}`, { method: 'PATCH', body });
      else await api('/admin/testimonials', { method: 'POST', body });
      setForm(blank);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const patch = async (id, body) => {
    await api(`/admin/testimonials/${id}`, { method: 'PATCH', body }).catch((e) => setError(e.message));
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    await api(`/admin/testimonials/${id}`, { method: 'DELETE' }).catch((e) => setError(e.message));
    load();
  };

  return (
    <>
      <PageTitle title="Testimonials" />
      <ErrorText>{error}</ErrorText>
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card>
          <form onSubmit={save} className="space-y-3">
            <h2 className="font-semibold">{editing ? 'Edit testimonial' : 'Add testimonial'}</h2>
            <label className="block text-sm">Student name
              <input className={`${inputCls} mt-1`} required value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
            </label>
            <label className="block text-sm">Caption (e.g. “Cleared CA Inter, May 2026”)
              <input className={`${inputCls} mt-1`} maxLength={200} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
            </label>
            <label className="block text-sm">Bunny Stream link
              <textarea rows={3} className={`${inputCls} mt-1`} required placeholder="https://iframe.mediadelivery.net/embed/123456/abcd-…  (play link or full <iframe> embed code also works)" value={form.bunnyEmbedUrl} onChange={(e) => setForm({ ...form, bunnyEmbedUrl: e.target.value })} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Video shape
                <select className={`${inputCls} mt-1`} value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value })}>
                  <option value="vertical">Vertical (reel)</option><option value="landscape">Landscape</option>
                </select>
              </label>
              <label className="text-sm">Order
                <input type="number" className={`${inputCls} mt-1`} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
              </label>
            </div>
            <div className="flex gap-2">
              <button className={btnCls}>{editing ? 'Save' : 'Add'}</button>
              {editing && <button type="button" className={btnLightCls} onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
            </div>
          </form>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {items.map((t) => (
            <Card key={t._id} className={t.active ? '' : 'opacity-60'}>
              <div className={`overflow-hidden rounded-xl bg-slate-900 ${t.orientation === 'vertical' ? 'mx-auto aspect-[9/16] max-w-[200px]' : 'aspect-video'}`}>
                <iframe src={`${t.bunnyEmbedUrl}?autoplay=false&preload=false`} title={t.studentName} loading="lazy" className="h-full w-full border-0" allowFullScreen />
              </div>
              <p className="mt-3 font-medium">{t.studentName} <span className="text-xs text-slate-400">#{t.order}</span></p>
              <p className="text-xs text-slate-500">{t.caption}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <button className="text-brand hover:underline" onClick={() => { setEditing(t._id); setForm({ ...blank, ...t }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                <button className="hover:underline" onClick={() => patch(t._id, { active: !t.active })}>{t.active ? 'Hide' : 'Show'}</button>
                <button className="text-red-600 hover:underline" onClick={() => remove(t._id)}>Delete</button>
              </div>
            </Card>
          ))}
          {!items.length && <Card className="text-center text-sm text-slate-500">No testimonials yet. Upload the video to Bunny Stream, then paste its link here.</Card>}
        </div>
      </div>
    </>
  );
}
