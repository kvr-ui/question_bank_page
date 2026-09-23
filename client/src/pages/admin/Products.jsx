import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { rupees } from '../../lib/format.js';
import { Card, ErrorText, PageTitle } from './ui.jsx';

// Read-only on purpose. The catalogue — titles, prices, stock — lives in the
// FOCAS LMS now, so there is one place to change a price instead of two that
// have to be kept in step by hand. This page mirrors what the LMS serves.
const LMS_ADMIN_URL = import.meta.env.VITE_LMS_ADMIN_URL || '';

const LOW_STOCK = 10;
const StockCell = ({ stock }) => {
  if (stock == null) return <span className="text-xs text-slate-400">Not tracked</span>;
  if (stock <= 0) return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Out of stock</span>;
  if (stock <= LOW_STOCK) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{stock} · Low</span>;
  return <span className="tabular-nums">{stock}</span>;
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/admin/products')
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageTitle title="Products & prices" />
      <p className="-mt-4 mb-6 text-sm text-slate-500">
        Managed in the FOCAS LMS admin, under each product&apos;s <span className="font-medium">Storefront</span> panel —
        that is where titles, prices and stock are set.
        {LMS_ADMIN_URL && (
          <> <a href={`${LMS_ADMIN_URL}/admin/products`} target="_blank" rel="noreferrer" className="text-brand hover:underline">Open it →</a></>
        )}
      </p>
      <ErrorText>{error}</ErrorText>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3" /><th className="p-3">Product</th><th className="p-3">Type</th>
              <th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.productId || p.slug}>
                <td className="p-3">{p.image ? <img src={p.image} alt="" className="h-12 w-9 rounded object-cover" /> : null}</td>
                <td className="p-3 font-medium">{p.title}<div className="text-xs font-normal text-slate-500">/checkout/{p.slug}</div></td>
                <td className="p-3 text-xs">{p.type}{p.group ? ` · G${p.group}` : ''}</td>
                <td className="p-3">{rupees(p.price)}{p.mrp > 0 && <div className="text-xs text-slate-400 line-through">{rupees(p.mrp)}</div>}</td>
                <td className="p-3"><StockCell stock={p.stock} /></td>
                <td className="p-3 text-xs">{p.active === false ? 'Hidden' : 'Active'}</td>
              </tr>
            ))}
            {!loading && !products.length && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">
                No products are flagged for this storefront. In the LMS admin, open a product and turn on its <span className="font-medium">Storefront</span> panel.
              </td></tr>
            )}
            {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading…</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
