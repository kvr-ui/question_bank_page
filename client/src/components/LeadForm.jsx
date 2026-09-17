import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { EXEC_MESSAGE } from '../lib/format.js';
import { ALL_SUBJECTS, GROUP_1, GROUP_2 } from '../lib/subjects.js';

const empty = { name: '', phone: '', email: '', subjects: [] };

export default function LeadForm() {
  const [form, setForm] = useState(empty);
  const [state, setState] = useState({ status: 'idle', error: '' });

  useEffect(() => {
    const onPrefill = (e) => {
      const subjects = e.detail?.subjects || [];
      if (subjects.length) setForm((f) => ({ ...f, subjects: [...new Set([...f.subjects, ...subjects])] }));
      setState((s) => (s.status === 'done' ? { status: 'idle', error: '' } : s));
    };
    window.addEventListener('focas:lead', onPrefill);
    return () => window.removeEventListener('focas:lead', onPrefill);
  }, []);

  const toggle = (s) => setForm((f) => ({ ...f, subjects: f.subjects.includes(s) ? f.subjects.filter((x) => x !== s) : [...f.subjects, s] }));
  const setGroup = (list) =>
    setForm((f) => {
      const allOn = list.every((s) => f.subjects.includes(s));
      return { ...f, subjects: allOn ? f.subjects.filter((s) => !list.includes(s)) : [...new Set([...f.subjects, ...list])] };
    });

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: 'loading', error: '' });
    try {
      await api('/leads', { method: 'POST', body: form });
      setState({ status: 'done', error: '' });
      setForm(empty);
    } catch (err) {
      setState({ status: 'idle', error: err.message });
    }
  };

  return (
    <section id="get-pricing" className="grain relative scroll-mt-16 overflow-hidden bg-brand py-20 text-paper sm:py-28">
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-ink/50 blur-[100px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="reveal">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-2">Pricing &amp; guidance</p>
          <h2 className="mt-3 font-display text-5xl uppercase leading-[0.95] sm:text-6xl">
            Talk to our team.
            <br />
            <span className="text-gold">Pick what fits you.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg text-paper/80">
            Leave your details and one of our executives will call you with pricing and help you choose the right books for your attempt.
          </p>
        </div>

        <div className="reveal rounded-3xl bg-paper p-6 text-ink shadow-2xl sm:p-8">
          {state.status === 'done' ? (
            <div className="py-6 text-center" role="status">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-3xl">✓</div>
              <h3 className="mt-5 font-display text-3xl uppercase">Thank you!</h3>
              <div className="mx-auto mt-4 max-w-md space-y-2 text-mute">
                {EXEC_MESSAGE.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <button onClick={() => setState({ status: 'idle', error: '' })} className="mt-6 text-sm font-semibold text-brand underline underline-offset-4">
                Submit another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="lead-name">Full name</label>
                  <input id="lead-name" className="field" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </div>
                <div>
                  <label className="label" htmlFor="lead-phone">Mobile (WhatsApp)</label>
                  <div className="flex">
                    <span className="grid place-items-center rounded-l-xl border border-r-0 border-ink/15 bg-paper-2 px-3 text-sm text-mute">+91</span>
                    <input id="lead-phone" className="field rounded-l-none" required inputMode="numeric" autoComplete="tel-national" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} placeholder="10-digit number" />
                  </div>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="lead-email">Email <span className="font-normal text-mute">(optional)</span></label>
                <input id="lead-email" type="email" className="field" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>

              <fieldset>
                <legend className="label">Which subjects are you interested in?</legend>
                <div className="mb-3 flex flex-wrap gap-2">
                  {[['Group 1', GROUP_1], ['Group 2', GROUP_2], ['Both groups', ALL_SUBJECTS]].map(([label, list]) => {
                    const on = list.every((s) => form.subjects.includes(s));
                    return (
                      <button type="button" key={label} onClick={() => setGroup(list)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${on ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink'}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_SUBJECTS.map((s) => {
                    const on = form.subjects.includes(s);
                    return (
                      <button type="button" key={s} aria-pressed={on} onClick={() => toggle(s)} className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? 'border-gold bg-gold text-ink' : 'border-ink/15 bg-white text-ink/80 hover:border-gold'}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p>}

              <button type="submit" disabled={state.status === 'loading'} className="btn-ink w-full py-4 text-base">
                {state.status === 'loading' ? 'Sending…' : 'Request a call back'}
              </button>
              <p className="text-center text-xs text-mute">We’ll only use your number to contact you about the Infinite Question Bank.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
