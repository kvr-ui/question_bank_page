export const PageTitle = ({ title, children }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <h1 className="text-2xl font-semibold">{title}</h1>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

export const Card = ({ className = '', children }) => <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 ${className}`}>{children}</div>;

export const ErrorText = ({ children }) => (children ? <p className="my-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p> : null);

const BADGE = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-amber-100 text-amber-800',
  converted: 'bg-green-100 text-green-800',
  'not-interested': 'bg-slate-200 text-slate-700',
  created: 'bg-slate-200 text-slate-700',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',
  dispatched: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  activated: 'bg-green-100 text-green-800',
};
export const Badge = ({ value }) => <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[value] || 'bg-slate-100'}`}>{value}</span>;

export const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';
export const btnCls = 'rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-2 disabled:opacity-50';
export const btnLightCls = 'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50';
