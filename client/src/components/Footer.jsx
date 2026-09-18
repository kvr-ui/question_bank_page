import Logo from './Logo.jsx';
import InfinityMark from './InfinityMark.jsx';
import { CONTACT } from '../lib/format.js';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <InfinityMark className="pointer-events-none absolute -right-24 -top-10 w-[520px] text-paper/[0.04]" strokeWidth={30} />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm font-display text-3xl uppercase leading-tight">
              Let’s make it your <span className="text-gold">last attempt</span>
            </p>
            <p className="mt-5 flex items-center gap-3 text-sm text-paper/60">
              Powered by
              <span className="inline-flex rounded-xl bg-white px-2 py-1 shadow-sm">
                <img src="/logo/caguru.png" alt="CA Guru.ai" width="417" height="240" loading="lazy" className="h-10 w-auto" />
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-paper/50">Contact</p>
            <ul className="mt-4 space-y-3 text-paper/85">
              <li><a className="hover:text-gold" href={CONTACT.website} target="_blank" rel="noreferrer">focasedu.com</a></li>
              <li><a className="hover:text-gold" href={CONTACT.instagram} target="_blank" rel="noreferrer">@focasedu on Instagram</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-paper/50">Explore</p>
            <ul className="mt-4 space-y-3 text-paper/85">
              <li><a className="hover:text-gold" href="#inside">What’s inside</a></li>
              <li><a className="hover:text-gold" href="#ai">AI Generation</a></li>
              <li><a className="hover:text-gold" href="#books">Books</a></li>
              <li><a className="hover:text-gold" href="#credits">Credits</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-paper/10 pt-6 text-xs text-paper/50 sm:flex-row">
          <p>© {new Date().getFullYear()} FOCAS. All rights reserved.</p>
          <p>Infinite Question Bank · Powered by CA Guru.ai</p>
        </div>
      </div>
    </footer>
  );
}
