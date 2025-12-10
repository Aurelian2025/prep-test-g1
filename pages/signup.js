// pages/signup.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function SignupPage() {
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log('signUp result', { data, error });
    setLoading(false);

    if (error) {
      setMessage(error.message || 'Sign up failed.');
      return;
    }

    // If email confirmation is OFF, Supabase creates a session immediately
    if (data.session) {
      router.push('/app');
      return;
    }

    // If confirmation is ON, tell user to check email
    setMessage(
      'Sign up successful. Please check your email for the confirmation link, then return here to sign in.'
    );
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Sign up</h1>
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
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account?{' '}
        <Link href="/login">
          <span style={{ color: '#4f46e5', cursor: 'pointer' }}>Sign in</span>
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
