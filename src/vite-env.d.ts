import { FormEvent, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import App from './App';
import { supabase, supabaseConfigured } from './supabase';

export default function AppAccess() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabaseConfigured && supabase));

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured || !supabase) {
    return (
      <>
        <div className="demo-ribbon">MODE DEMO · Backend belum dikonfigurasi · Data hanya tersimpan di browser ini</div>
        <App />
      </>
    );
  }

  if (loading) {
    return <div className="auth-screen"><div className="auth-card">Memeriksa sesi akun…</div></div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <>
      <div className="account-ribbon">
        <span>Masuk sebagai <b>{session.user.email}</b> · Demo data masih lokal, belum tersinkron ke database.</span>
        <button
          type="button"
          onClick={async () => {
            if (!supabase) return;
            await supabase.auth.signOut();
          }}
        >
          Keluar
        </button>
      </div>
      <App />
    </>
  );
}

function Login() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setBusy(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')).trim(),
      password: String(form.get('password'))
    });

    if (authError) {
      setError('Login gagal. Periksa email dan kata sandi, atau hubungi administrator.');
    }

    setBusy(false);
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand-mark auth-mark">C</div>
        <p className="eyebrow">CSSD CARE</p>
        <h1>Selamat datang</h1>
        <p className="auth-copy">Masuk untuk melanjutkan ke panel operasi CSSD.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? 'Memproses…' : 'Masuk'}</button>
        </form>
      </section>
    </main>
  );
}
