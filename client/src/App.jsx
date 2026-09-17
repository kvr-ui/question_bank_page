import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import NotFound from './pages/NotFound.jsx';

const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/checkout/cart" element={<Checkout cart />} />
      <Route path="/checkout/:slug" element={<Checkout />} />
      <Route path="/pay/:token" element={<Checkout />} />
      <Route path="/order/success/:id" element={<OrderSuccess />} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="grid min-h-screen place-items-center text-mute">Loading…</div>}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
