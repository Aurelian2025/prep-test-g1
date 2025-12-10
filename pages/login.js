// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  // just plain strings, no TypeScript here
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 🔄 Always start this page with a clean auth state
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.auth.signOut();
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!email || !password) {
        setMessage('Please enter both email and password.');
        return;
      }

      if (mode === 'signin') {
        // -------- SIGN IN --------
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (
            error.message &&
            error.message.toLowerCase().includes('email not confirmed')
          ) {
            setMessage(
              'Email not confirmed. Please check your inbox for the confirmation link, then try signing in again.'
            );
          } else {
            setMessage(error.message || 'Sign in failed.');
          }
          return;
        }

        // Signed in successfully -> let /app guard decide where to go
        router.push('/app');
      } else {
        // -------- SIGN UP --------
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          if (error.message === 'User already registered') {
            setMessage(
              'This email is already registered. Try signing in instead.'
            );
          } else {
            setMessage(error.message || 'Sign up failed.');
          }
          return;
        }

        // If email confirmation is ON, Supabase will not create a session yet.
        if (!data.session) {
          setMessage(
            'Sign up successful. Please check your email and click the confirmation link, then come back here to sign in.'
          );
          return;
        }

        // Email confirmation disabled -> user is logged in immediately
        router.push('/app');
      }
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong. Please try again.');
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
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1>{isSignin ? 'Sign in' : 'Sign up'}</h1>
      <p style={{ marginBottom: 24 }}>
        Use the same email you used when paying via Stripe.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        />

        <input
          type="password"
          required
          placeholder="Password"
          autoComplete={isSignin ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#635bff',
            color: 'white',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading
            ? isSignin
              ? 'Signing in…'
              : 'Signing up…'
            : isSignin
            ? 'Sign in'
            : 'Sign up'}
        </button>
      </form>

      {/* Toggle between Sign in / Sign up */}
      <button
        type="button"
        onClick={() => {
          setMode(isSignin ? 'signup' : 'signin');
          setMessage('');
        }}
        style={{
          marginTop: 16,
          border: 'none',
          background: 'transparent',
          padding: 0,
          color: '#2563eb',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        {isSignin
          ? "Don't have an account? Sign up"
          : 'Already have an account? Sign in'}
      </button>

      {message && (
        <p style={{ marginTop: 16, color: '#b91c1c', fontSize: 14 }}>
          {message}
        </p>
      )}
    </main>
  );
}
