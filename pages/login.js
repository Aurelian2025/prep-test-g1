// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
          setMessage(error.message || 'Invalid login credentials');
        } else {
          // Logged in → go to protected app page
          router.push('/app');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        console.log('signUp result', { data, error });

        if (error) {
          setMessage(error.message || 'Sign up failed');
        } else {
          setMessage(
            'Sign up successful. You can now sign in with this email.'
          );
          setMode('signin');
        }
      }
    } catch (err) {
      console.error('Auth error', err);
      setMessage('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#f4f4ff',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 16,
          padding: '32px 28px',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
        }}
      >
        <h1
          style={{
            fontSize: 32,
            margin: 0,
            marginBottom: 8,
            fontWeight: 800,
          }}
        >
          {mode === 'signin' ? 'Sign in' : 'Sign up'}
        </h1>
        <p style={{ margin: 0, marginBottom: 24, color: '#4b5563' }}>
          Use the same email you used when paying via Stripe.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #d1d5db',
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #d1d5db',
                fontSize: 14,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 999,
              padding: '10px 16px',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              background: loading ? '#a5b4fc' : '#4f46e5',
              color: '#fff',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)',
            }}
          >
            {mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setMessage('');
          }}
          style={{
            marginTop: 16,
            border: 'none',
            background: 'transparent',
            padding: 0,
            fontSize: 14,
            color: '#4f46e5',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>

        {message && (
          <p style={{ marginTop: 12, color: '#b91c1c', fontSize: 13 }}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
