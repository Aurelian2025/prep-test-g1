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
        // 🔐 SIGN IN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log('signIn result', { data, error });

        if (error) {
          setMessage(error.message);
          return;
        }

        // After login, check subscription status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('email', email)
          .maybeSingle();

        if (profileError) {
          console.error('Error loading profile after sign-in:', profileError);
        }

        if (!profile || profile.subscription_status !== 'active') {
          await router.push('/subscribe');
        } else {
          await router.push('/app');
        }
      } else {
        // 🆕 SIGN UP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        console.log('signUp result', { data, error });

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage('Sign up successful. You can now sign in with this email.');
        setMode('signin');
      }
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setMessage('');
    if (!email) {
      setMessage(
        'Enter your email above first, then click "Forgot password?".'
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Password reset email sent. Check your inbox.');
      }
    } catch (err) {
      console.error('reset password error', err);
      setMessage('Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 420,
        margin: '60px auto',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1>{mode === 'signin' ? 'Sign in' : 'Sign up'}</h1>
      <p>Use the same email you used when paying via Stripe.</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'grid', gap: 12, marginTop: 16 }}
      >
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
            padding: 10,
            borderRadius: 6,
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
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

        {/* Forgot password */}
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={loading}
          style={{
            marginTop: 4,
            border: 'none',
            background: 'transparent',
            color: '#4f46e5',
            textDecoration: 'underline',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0,
          }}
        >
          Forgot password?
        </button>

        {/* Toggle between sign in / sign up */}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setMessage('');
          }}
          style={{
            marginTop: 8,
            border: 'none',
            background: 'transparent',
            color: '#111827',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0,
          }}
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 16, color: '#b91c1c' }}>{message}</p>
      )}
    </main>
  );
}
