// The "∞" loop from the Infinite Question Bank cover, drawn as a single stroke.
export default function InfinityMark({ className = '', animated = false, strokeWidth = 18 }) {
  return (
    <svg viewBox="0 0 400 200" className={className} fill="none" aria-hidden="true">
      <path
        className={animated ? 'infinity-path' : ''}
        d="M200 100 C 160 30, 60 20, 45 100 C 30 180, 160 170, 200 100 C 240 30, 370 20, 355 100 C 340 180, 240 170, 200 100 Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
