// pages/reset-password.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

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

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSaving(false);

    if (error) {
      console.error(error);
      setMessage(error.message);
    } else {
      // password updated, user is logged in – send them into the app
      router.replace('/app');
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Choose a new password</h1>
      <p>Enter your new password below.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <input
          type="password"
          required
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          required
          placeholder="Confirm new password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: 10,
            borderRadius: 6,
            border: 'none',
            background: '#4f46e5',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          {saving ? 'Saving…' : 'Update password'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 12, color: '#b91c1c' }}>{message}</p>
      )}
    </main>
  );
}
