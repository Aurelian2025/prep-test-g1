// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  // "mode" determines whether we are signing in or signing up
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Optional: when we land on /login, clear any existing session
  useEffect(() => {
    supabase.auth.signOut().catch((err) => {
      console.warn('Error signing out on /login load', err);
    });
  }, []);

  const isSignin = mode === 'signin';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignin) {
        // SIGN IN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          // go to protected area
          router.push('/app');
        }
      } else {
        // SIGN UP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          // If email confirmation is OFF, they can sign in immediately.
          // If it's ON, they need to click the link they receive.
          setMessage(
            'Sign up successful. You can now sign in with your email and password.'
          );
          setMode('signin');
        }
      }
    } catch (err) {
      console.error(err);
      setMessage('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(isSignin ? 'signup' : 'signin');
    setMessage('');
  }

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

      <form
        onSubmit={handleSubmit}
        style={{ display: 'grid', gap: 12, marginBottom: 16 }}
      >
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
            marginTop: 4,
            padding: '10px 16px',
            borderRadius: 999,
            border: 'none',
            background: '#4f46e5',
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

      <button
        type="button"
        onClick={toggleMode}
        style={{
          border: 'none',
          background: 'transparent',
          padding: 0,
          marginTop: 4,
          color: '#2563eb',
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        {isSignin
          ? "Don't have an account? Sign up"
          : 'Already have an account? Sign in'}
      </button>

      {message && (
        <p style={{ marginTop: 16, color: '#b91c1c', fontSize: 14 }}>{message}</p>
      )}
    </main>
  );
}
