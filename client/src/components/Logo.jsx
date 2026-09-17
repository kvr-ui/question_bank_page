import { useState } from 'react';

// Full-colour FOCAS logo (client/public/logo/focas.png) on a white badge so it reads on dark backgrounds.
export default function Logo({ className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      <span className={`inline-flex items-center rounded-xl bg-white px-2.5 py-1 shadow-sm ${className}`}>
        <img src="/logo/focas.png" alt="FOCAS — Your Last Attempt" width="500" height="133" className="h-9 w-auto sm:h-10" onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="font-display text-3xl tracking-[0.08em]">FOCAS</span>
      <span className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-gold">Your last attempt</span>
    </span>
  );
}
