import { useState } from 'react';

// Drop the real logo at client/public/logo/focas.png (transparent, light version for dark backgrounds).
// Until then a text wordmark is shown.
export default function Logo({ className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return <img src="/logo/focas.png" alt="FOCAS — Your Last Attempt" className={`h-10 w-auto ${className}`} onError={() => setFailed(true)} />;
  }
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="font-display text-3xl tracking-[0.08em]">FOCAS</span>
      <span className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-gold">Your last attempt</span>
    </span>
  );
}
