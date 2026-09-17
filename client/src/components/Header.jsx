import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';
import { openLeadForm } from '../lib/leadBus.js';
import CartDrawer, { CartButton } from './CartDrawer.jsx';

const NAV = [
  ['What’s inside', '#inside'],
  ['AI Generation', '#ai'],
  ['Books', '#books'],
  ['Testimonials', '#testimonials'],
  ['FAQ', '#faq'],
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 text-paper transition-all duration-300 ${scrolled || open ? 'bg-ink/95 shadow-lg backdrop-blur' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#top" aria-label="FOCAS home" className="flex items-center gap-3">
            <Logo />
            <span className="hidden h-8 w-px bg-paper/20 sm:block" />
            <span className="hidden text-xs leading-tight text-paper/70 sm:block">
              Powered by
              <br />
              <span className="font-semibold text-paper">CA Guru.ai</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm lg:flex">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="text-paper/80 transition hover:text-gold">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => openLeadForm()} className="btn-gold hidden px-5 py-2.5 text-sm sm:inline-flex">
              Request a call
            </button>
            <CartButton />
            <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-paper/10 px-4 pb-5 lg:hidden">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-paper/10 py-3 text-paper/90">
                {label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                openLeadForm();
              }}
              className="btn-gold mt-4 w-full"
            >
              Request a call
            </button>
          </nav>
        )}
      </header>
      {/* Outside <header>: its backdrop-blur would trap the fixed drawer inside the bar. */}
      <CartDrawer />
    </>
  );
}
