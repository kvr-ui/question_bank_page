import { EXEC_MESSAGE } from '../lib/format.js';
import { openLeadForm } from '../lib/leadBus.js';

const FAQS = [
  {
    q: 'What does the Infinite Question Bank contain?',
    a: 'Questions from the last 10 years’ RTPs, MTPs and PYQs, arranged in order of increasing difficulty, one Master Question for every chapter for comprehensive revision, and AI Generation: a similar question for every question in the bank.',
  },
  {
    q: 'How does the AI Generation work?',
    a: 'You scan the QR code inside the book, and start practicing. That’s it. As easy as it sounds.',
  },
  {
    q: 'Which subjects are available?',
    a: 'All 8 CA Intermediate subjects. Group 1: Advanced Accounting, Corporate & Other Laws, Direct Taxation, Indirect Taxation. Group 2: Cost & Management Accounting, Auditing & Ethics, Financial Management, Strategic Management.',
  },
  {
    q: 'What is the price?',
    a: EXEC_MESSAGE.slice(0, 2).join(' '),
    cta: true,
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="reveal text-center font-display text-5xl uppercase sm:text-6xl">
          Questions? <span className="text-brand">Answered.</span>
        </h2>
        <div className="mt-12 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="reveal group rounded-2xl bg-white p-5 shadow-sm open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper-2 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-mute">{f.a}</p>
              {f.cta && (
                <button onClick={() => openLeadForm()} className="btn-gold mt-4 px-5 py-2 text-sm">
                  Request a call
                </button>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
