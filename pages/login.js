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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'signup') {
        // Create Supabase auth user (no profile yet)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        console.log('signUp result', { data, error });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage('Sign up successful. You can now sign in with this email.');
          setMode('signin');
        }

        setLoading(false);
        return;
      }

      // SIGN IN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('signIn result', { data, error });

      if (error) {
        setMessage(error.message || 'Invalid login credentials');
        setLoading(false);
        return;
      }

      // At this point Supabase session should exist on the client.
      // Now check subscription and decide where to send the user.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile after login:', profileError);
      }

      if (profile && profile.subscription_status === 'active') {
        // Paid → go straight into the app
        await router.push('/app');
      } else {
        // No active sub yet → show paywall
        await router.push('/subscribe');
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
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
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1>{mode === 'signin' ? 'Sign in' : 'Sign up'}</h1>
      <p>Use the same email you used when paying via Stripe.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 6,
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            marginTop: 4,
          }}
        >
          {loading
            ? mode === 'signin'
              ? 'Signing in…'
              : 'Signing up…'
            : mode === 'signin'
            ? 'Sign in'
            : 'Sign up'}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
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
                background: 'none',
                padding: 0,
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
                background: 'none',
                padding: 0,
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
        <p style={{ marginTop: 8, color: '#dc2626' }}>
          {message}
        </p>
      )}
    </main>
  );
}
