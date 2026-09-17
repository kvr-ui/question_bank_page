const BLOCKS = [
  {
    title: 'Questions from the last 10 years’ RTPs, MTPs and PYQs',
    body: 'Every question that matters from a decade of ICAI papers, in one place.',
    icon: (
      <path d="M4 5h11a3 3 0 013 3v11H7a3 3 0 01-3-3V5zm0 0v11m14-8h2v13H8" />
    ),
  },
  {
    title: 'Arranged in order of increasing difficulty',
    body: 'Build confidence with easier questions first, then push yourself on the hard ones.',
    icon: <path d="M4 20h4v-5H4v5zm6 0h4V10h-4v10zm6 0h4V4h-4v16z" />,
  },
  {
    title: 'One Master Question for every chapter',
    body: 'A single, comprehensive question per chapter for quick, complete revision.',
    icon: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z" />,
  },
  {
    title: 'AI Generation',
    body: 'A similar question for every question in our question bank. Same concept, new figures.',
    icon: <path d="M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8l2 2M6 18l2-2m8-8l2-2M9 12a3 3 0 106 0 3 3 0 00-6 0z" />,
    highlight: true,
  },
];

export default function FourBlocks() {
  return (
    <section id="inside" className="relative overflow-hidden bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">Presenting</p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-[0.95] text-ink sm:text-7xl">
              The Infinite
              <br />
              <span className="text-brand">Question Bank</span>
            </h2>
          </div>
          <p className="max-w-lg text-lg text-mute lg:justify-self-end">
            What it contains: four building blocks designed to take you from your first attempt at a question to exam-ready confidence.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BLOCKS.map((b, i) => (
            <article key={b.title} className="reveal group relative pt-7" style={{ transitionDelay: `${i * 90}ms` }}>
              {/* folder tab, echoing the brochure design */}
              <div className={`absolute left-0 top-0 h-8 w-28 rounded-t-2xl ${b.highlight ? 'bg-ink' : 'bg-gold'}`} />
              <span className={`absolute left-4 top-[-18px] z-10 font-display text-6xl ${b.highlight ? 'text-gold' : 'text-ink'} [-webkit-text-stroke:2px_var(--color-paper)]`}>
                0{i + 1}
              </span>
              <div
                className={`relative flex h-full flex-col rounded-2xl rounded-tl-none p-6 pt-10 transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl ${
                  b.highlight ? 'bg-ink text-paper shadow-xl' : 'bg-gold text-ink shadow-[0_12px_30px_-12px_rgba(224,168,74,.8)]'
                }`}
              >
                <svg viewBox="0 0 24 24" className={`mb-5 h-9 w-9 ${b.highlight ? 'text-gold' : 'text-ink'}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {b.icon}
                </svg>
                <h3 className="text-lg font-semibold leading-snug">{b.title}</h3>
                <p className={`mt-3 text-sm leading-relaxed ${b.highlight ? 'text-paper/75' : 'text-ink/75'}`}>{b.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
