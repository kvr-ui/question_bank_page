import { useState } from 'react';
import { api } from '../../lib/api.js';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/admin/login', { method: 'POST', body: { password } });
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grain relative grid min-h-screen place-items-center bg-ink px-4">
      <form onSubmit={submit} className="relative w-full max-w-sm rounded-3xl bg-paper p-8 shadow-2xl">
        <h1 className="font-display text-3xl uppercase">FOCAS <span className="text-brand">Admin</span></h1>
        <p className="mt-1 text-sm text-mute">Enter the admin password to continue.</p>
        <label className="label mt-6" htmlFor="pw">Password</label>
        <input id="pw" type="password" className="field" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="btn-ink mt-6 w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
