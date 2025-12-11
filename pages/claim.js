// pages/claim.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ClaimAccountPage() {
  const router = useRouter();
  const { token } = router.query;

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    const checkToken = async () => {
      setLoading(true);
      setMessage('');
      try {
        const res = await fetch(`/api/check-signup-token?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setValid(false);
          setMessage(data.error || 'This link is invalid or has expired.');
        } else {
          setValid(true);
          setEmail(data.email);
        }
      } catch (err) {
        console.error(err);
        setValid(false);
        setMessage('Could not validate link. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== password2) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/claim-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Could not complete signup.');
        return;
      }

      router.replace('/login');
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <main
      style={{
        maxWidth: 420,
        margin: '60px auto',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {loading ? (
        <p>Checking your link…</p>
      ) : !valid ? (
        <>
          <h1>Link invalid</h1>
          <p>{message || 'This signup link is invalid or has expired.'}</p>
        </>
      ) : (
        <>
          <h1>Create your account</h1>
          <p>
            Email: <strong>{email}</strong>
          </p>
          <p>Choose a password to finish setting up your account.</p>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'grid', gap: 12, marginTop: 16 }}
          >
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <input
              type="password"
              required
              placeholder="Confirm password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <button
              type="submit"
              style={{
                padding: 10,
                borderRadius: 6,
                border: 'none',
                background: '#4f46e5',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Create account
            </button>
          </form>

          {message && (
            <p style={{ marginTop: 12, color: '#b91c1c' }}>{message}</p>
          )}
        </>
      )}
    </main>
  );
}
