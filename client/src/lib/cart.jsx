import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Cart holds product snapshots for display only; the server re-prices every slug at checkout.
const KEY = 'focas-cart';
const CartContext = createContext(null);

function readStored() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(items) ? items.filter((i) => i && typeof i.slug === 'string') : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStored);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: cart lives for this visit only */
    }
  }, [items]);

  const add = useCallback((p) => {
    setItems((cur) => (cur.some((i) => i.slug === p.slug) ? cur : [...cur, { slug: p.slug, title: p.title, image: p.image, price: p.price, subjects: p.subjects, group: p.group }]));
    setOpen(true);
  }, []);
  const remove = useCallback((slug) => setItems((cur) => cur.filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, add, remove, clear, open, setOpen, total: items.reduce((s, i) => s + (i.price || 0), 0), has: (slug) => items.some((i) => i.slug === slug) }),
    [items, add, remove, clear, open]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
