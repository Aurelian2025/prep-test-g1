// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabaseClient(); // ✅ use the same client as _app.js
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let error;

      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        error = signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        error = signInError;
      }

      if (error) {
        console.error('Auth error:', error);
        setMessage(error.message || 'Unknown auth error');
      } else {
        setMessage('');
        // ✅ on success, auth-helpers will now know about this session
        router.push('/app');
      }
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err);
      setMessage('Unexpected error. Check console logs.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 400,
        margin: '80px auto',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1>{mode === 'signup' ? 'Sign up' : 'Sign in'}</h1>
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

        <button type="submit" disabled={loading} style={{ padding: 8 }}>
          {loading
            ? mode === 'signup'
              ? 'Creating account…'
              : 'Signing in…'
            : mode === 'signup'
            ? 'Sign up'
            : 'Sign in'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'signup' ? 'login' : 'signup');
          setMessage('');
        }}
        style={{ marginTop: 12, padding: 4 }}
      >
        {mode === 'signup'
          ? 'Already have an account? Sign in'
          : "Don't have an account? Sign up"}
      </button>

      {message && (
        <p style={{ marginTop: 12, color: 'red', whiteSpace: 'pre-line' }}>
          {message}
        </p>
      )}
    </main>
  );
}
