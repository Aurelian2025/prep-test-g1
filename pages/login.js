// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    console.log('Supabase URL in login page:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('signIn result', { data, error });

    setLoading(false);

    if (error) {
      // Show the error that Supabase returns (most often: "Invalid login credentials")
      setMessage(error.message || 'Sign in failed.');
      return;
    }

    // If sign-in worked, we should have a session
    if (data?.session) {
      router.push('/app');
    } else {
      setMessage('Signed in, but no active session was returned.');
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Sign in</h1>
      <p>Use the same email you used when paying via Stripe.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ padding: 10, fontWeight: 600 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup">
          <span style={{ color: '#4f46e5', cursor: 'pointer' }}>Sign up</span>
        </Link>
      </p>

      {message && (
        <p style={{ marginTop: 12, color: 'crimson' }}>
          {message}
        </p>
      )}
    </main>
  );
}
