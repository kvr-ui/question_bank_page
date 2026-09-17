import { PRICING } from '../lib/subjects.js';

const SHIPPING = 'The Physical Question Bank copies get shipped within 3-5 days of your order placement and will reach your doorstep within 10-12 days of shipment.';

const FAQS = [
  {
    q: 'What does the Infinite Question Bank contain?',
    a: 'Questions from the last 10 years’ RTPs, MTPs and PYQs, arranged in order of increasing difficulty, one Master Question for every chapter for comprehensive revision, and AI Generation: a similar question for every question in the bank.',
  },
  {
    q: 'What do I get when I purchase the Infinite Question Bank?',
    a: [
      'Immediately after purchase, you get digital access to the Question Bank, so you can start practicing without having to wait for the Physical Books to arrive.',
      SHIPPING,
    ],
  },
  {
    q: 'When will I receive my Question Bank Copies?',
    a: SHIPPING,
  },
  {
    q: 'How does the AI Generation work?',
    a: 'Scan the QR code inside the book, and start practicing. That’s it. As easy as it sounds.',
  },
  {
    q: 'What is CAGuru.AI?',
    a: [
      'CAGuru.AI is FOCAS Edu’s in-house MCQ Chatbot, which generates MCQs while living in your WhatsApp chats. Just like how it generates MCQs as per ICAI standards, our Question Bank users get to generate descriptive questions.',
      <>
        Just text “MCQ” to{' '}
        <a href="https://wa.me/918946089717?text=MCQ" target="_blank" rel="noreferrer" className="font-semibold text-brand underline">
          +91 89460 89717
        </a>{' '}
        and see the magic unfold.
      </>,
    ],
  },
  {
    q: 'Why is this Infinite Question Bank Necessary?',
    a: 'ICAI has already started using AI in its examinations. Unless you prepare using AI, you will not be ready to face AI generated questions.',
  },
  {
    q: 'Which subjects are available?',
    a: 'All 8 CA Intermediate subjects. Group 1: Paper 01 Advanced Accounting, Paper 02 Corporate & Other Laws, Paper 3A Direct Taxation, Paper 3B Indirect Taxation. Group 2: Paper 04 Cost & Management Accounting, Paper 05 Auditing & Ethics, Paper 6A Financial Management, Paper 6B Strategic Management.',
  },
  {
    q: 'What is the price?',
    a: (
      <ul className="space-y-1">
        {PRICING.map(([label, price]) => (
          <li key={label} className="flex max-w-xs justify-between border-b border-ink/10 py-1.5 last:border-0">
            <span>{label}</span>
            <span className="font-semibold text-ink">{price}</span>
          </li>
        ))}
      </ul>
    ),
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
              <div className="mt-3 space-y-3 leading-relaxed text-mute">
                {Array.isArray(f.a) ? f.a.map((para, i) => <p key={i}>{para}</p>) : typeof f.a === 'string' ? <p>{f.a}</p> : f.a}
              </div>
              {f.cta && (
                <a href="#books" className="btn-gold mt-4 px-5 py-2 text-sm">
                  Shop the books
                </a>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
