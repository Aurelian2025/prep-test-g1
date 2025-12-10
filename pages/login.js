// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  // 'signin' | 'signup'
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isSignin = mode === 'signin';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!email || !password) {
        setMessage('Please enter both email and password.');
        return;
      }

      if (isSignin) {
        // -------- SIGN IN --------
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('signInWithPassword result:', { data, error });

        if (error) {
          // common errors: invalid login credentials, email not confirmed, etc.
          setMessage(error.message || 'Sign in failed.');
          return;
        }

        if (!data.session) {
          // This would be unusual for signInWithPassword, but handle just in case
          setMessage(
            'Could not create a session. Please try again, or reset your password.'
          );
          return;
        }

        // Signed in successfully -> go to protected app
        await router.replace('/app');
      } else {
        // -------- SIGN UP --------
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        console.log('signUp result:', { data, error });

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

        // If email confirmation is ON, no session yet
        if (!data.session) {
          setMessage(
            'Sign up successful. Please check your email and click the confirmation link, then come back here to sign in.'
          );
          return;
        }

        // If confirmation is OFF, we already have a session
        await router.replace('/app');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
