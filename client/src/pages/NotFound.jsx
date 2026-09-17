import { Link } from 'react-router-dom';
import InfinityMark from '../components/InfinityMark.jsx';

export default function NotFound() {
  return (
    <div className="grain relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4 text-center text-paper">
      <div>
        <InfinityMark animated className="mx-auto w-64 text-gold" strokeWidth={14} />
        <h1 className="mt-6 font-display text-6xl uppercase">Page not found</h1>
        <p className="mt-3 text-paper/70">Infinite questions, but not this page.</p>
        <Link to="/" className="btn-gold mt-8">Back to home</Link>
      </div>
    </div>
  );
}
