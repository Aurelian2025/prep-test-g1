// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('signIn result:', { data, error });

        if (error) {
          // Typical errors: invalid login, email not confirmed, etc.
          setMessage(error.message || 'Unable to sign in.');
        } else {
          // Success → go to the protected /app page
          router.push('/app');
        }
      } else {
        // SIGN UP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        console.log('signUp result:', { data, error });

        if (error) {
          setMessage(error.message || 'Unable to sign up.');
        } else {
          // With email confirmation OFF, user can sign in immediately.
          setMessage(
            'Sign up successful. You can now sign in with this email and password.'
          );
          setMode('signin');
        }
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
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
        padding: '0 16px',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>
        {isSignin ? 'Sign in' : 'Sign up'}
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
            border: '1px solid #ccc',
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
            border: '1px solid #ccc',
            fontSize: 14,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 4,
            padding: '10px 16px',
            borderRadius: 6,
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            background: '#635bff',
            color: 'white',
          }}
        >
          {loading ? (isSignin ? 'Signing in…' : 'Signing up…') : isSignin ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMessage('');
          setMode(isSignin ? 'signup' : 'signin');
        }}
        style={{
          marginTop: 12,
          padding: '8px 0',
          background: 'none',
          border: 'none',
          color: '#2563eb',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontSize: 14,
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
