import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault(); // IMPORTANT!
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // SUCCESS — redirect user to the app
      router.push('/app');
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMsg('Unexpected error occurred.');
    }

    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Sign in</h1>
      <p>Use the same email you used when paying via Stripe.</p>

      <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading} type="submit">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {errorMsg && (
        <p style={{ color: 'red', marginTop: 12 }}>{errorMsg}</p>
      )}

      <p style={{ marginTop: 16 }}>
        Don't have an account?{' '}
        <a href="/signup">Sign up</a>
      </p>
    </main>
  );
}
