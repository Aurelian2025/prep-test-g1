// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// One standalone Supabase client just for this page
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('signIn result', { data, error });

        if (error) {
          // show the *real* error so we know what Supabase is complaining about
          setMessage(error.message || 'Invalid login credentials');
          return;
        }

        // success → go to the protected app page
        router.push('/app');
      } else {
        // SIGN-UP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        console.log('signUp result', { data, error });

        if (error) {
          setMessage(error.message || 'Sign up failed');
          return;
        }

        // If you have “Confirm email” disabled in Supabase,
        // the user can sign in immediately. Otherwise they
        // must click the email confirmation link first.
        setMessage(
          'Sign up successful. You can now sign in with your email and password.'
        );
        setMode('signin');
      }
    } catch (err) {
      console.error('Unexpected auth error', err);
      setMessage('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const isSignin = mode === 'signin';

  return (
    <main
      style={{
        maxWidth: 420,
        margin: '80px auto',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>
        {isSignin ? 'Sign in' : 'Sign up'}
      </h1>
      <p style={{ marginBottom: 24 }}>
        Use the same email you used when paying via Stripe.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 8,
            padding: '10px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#4f46e5',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? (isSignin ? 'Signing in…' : 'Signing up…') : isSignin ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(isSignin ? 'signup' : 'signin');
          setMessage('');
        }}
        style={{
          marginTop: 12,
          padding: '6px 0',
          border: 'none',
          background: 'transparent',
          color: '#4f46e5',
          cursor: 'pointer',
        }}
      >
        {isSignin
          ? "Don't have an account? Sign up"
          : 'Already have an account? Sign in'}
      </button>

      {message && (
        <p style={{ marginTop: 12, color: 'crimson', fontSize: 14 }}>{message}</p>
      )}
    </main>
  );
}
