// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Plain Supabase client using your public env vars
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

  // Just to sanity-check we’re pointing at the right Supabase project
  useEffect(() => {
    console.log('Supabase URL in login page:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  }, []);

  async function handleSignIn(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('signIn result', { data, error });

    setLoading(false);

    if (error) {
      // This message is what you see under the form
      setMessage(error.message || 'Login failed.');
      return;
    }

    // Success → send them to the app home
    router.push('/app');
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

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

    // We disabled email confirmation, so they can just sign in now
    setMode('signin');
    setMessage('Sign up successful. You can now sign in with this email.');
  }

  // Which handler to use based on the current mode
  const handleSubmit = mode === 'signin' ? handleSignIn : handleSignUp;

  return (
    <main
      style={{
        maxWidth: 420,
        margin: '80px auto',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>
        {mode === 'signin' ? 'Sign in' : 'Sign up'}
      </h1>

      <p style={{ marginBottom: 20 }}>
        Use the same email you used when paying via Stripe.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #d1d5db',
            fontSize: 14,
          }}
        />

        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #d1d5db',
            fontSize: 14,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 8,
            padding: '10px 16px',
            borderRadius: 999,
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? (mode === 'signin' ? 'Signing in…' : 'Signing up…') : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      {/* Toggle between modes */}
      <p style={{ marginTop: 16, fontSize: 14 }}>
        {mode === 'signin' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setMessage('');
              }}
              style={{
                border: 'none',
                padding: 0,
                background: 'none',
                color: '#4f46e5',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setMessage('');
              }}
              style={{
                border: 'none',
                padding: 0,
                background: 'none',
                color: '#4f46e5',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign in
            </button>
          </>
        )}
      </p>

      {message && (
        <p style={{ marginTop: 12, color: '#b91c1c', fontSize: 14 }}>{message}</p>
      )}
    </main>
  );
}
