// pages/login.js
import { useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  // Already logged in? Go to app
  if (session && typeof window !== 'undefined') {
    router.replace('/app');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setSending(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setSending(false);

    if (error) {
      console.error(error);
      setMessage(error.message);
    } else {
      setMessage('Check your email for a login link.');
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Sign in</h1>
      <p>Enter the same email you used to pay via Stripe.</p>

      <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8 }}
        />
        <button type="submit" disabled={sending} style={{ padding: 8 }}>
          {sending ? 'Sending magic link…' : 'Send magic link'}
        </button>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </main>
  );
}
