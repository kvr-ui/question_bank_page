import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function SimpleHeader() {
  return (
    <header className="bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" aria-label="Back to home"><Logo /></Link>
        <span className="flex items-center gap-2 text-xs text-paper/70">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 118 0v4" /></svg>
          Secure checkout
        </span>
      </div>
    </header>
  );
}
