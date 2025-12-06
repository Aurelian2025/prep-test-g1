import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const pageStyle = {
  minHeight: '100vh',
  background: '#eef2ff',
  margin: 0,
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const containerStyle = {
  maxWidth: 420,
  margin: '0 auto',
  padding: '32px 16px',
};

const cardStyle = {
  marginTop: 16,
  background: '#ffffff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
};

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  marginBottom: 10,
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 14,
};

const btnStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 999,
  border: 'none',
  background: '#4f46e5',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

const switchStyle = {
  marginTop: 10,
  fontSize: 13,
  textAlign: 'center',
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Account created. You can now log in.');
        setMode('login');
      } else {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Get the logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          // Ensure profile row exists / is updated
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(
              {
                id: user.id,
                email: user.email,
                // subscription_status: keep default 'inactive' for now
              },
              { onConflict: 'id' }
            );

          if (profileError) {
            console.error('Error upserting profile:', profileError);
            // not fatal, we still let them in
          }
        }

        // Logged in successfully – go to main app
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            margin: 0,
            color: '#111827',
          }}
        >
          Ontario G1 Practice Test
        </h1>
        <p style={{ fontSize: 14, color: '#4b5563', marginTop: 4 }}>
          {mode === 'signup'
            ? 'Create an account to save your access on any device.'
            : 'Log in to access your G1 practice tests.'}
        </p>

        <div style={cardStyle}>
          <h2
            style={{
              fontSize: 18,
              marginTop: 0,
              marginBottom: 10,
            }}
          >
            {mode === 'signup' ? 'Sign up' : 'Log in'}
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              style={inputStyle}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              style={inputStyle}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <button type="submit" style={btnStyle} disabled={loading}>
              {loading
                ? 'Please wait...'
                : mode === 'signup'
                ? 'Create account'
                : 'Log in'}
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: 10,
                fontSize: 13,
                color: '#b91c1c',
              }}
            >
              {message}
            </p>
          )}

          <div style={switchStyle}>
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setMessage('');
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#4f46e5',
                    cursor: 'pointer',
                  }}
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                New here?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setMessage('');
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#4f46e5',
                    cursor: 'pointer',
                  }}
                >
                  Create an account
                </button>
              </>
            )}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            After we connect your subscription, logging in will unlock the app
            on any device.
          </div>
        </div>
      </div>
    </div>
  );
}
