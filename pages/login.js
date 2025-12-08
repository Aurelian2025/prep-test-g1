// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client using your public anon keys
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

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
