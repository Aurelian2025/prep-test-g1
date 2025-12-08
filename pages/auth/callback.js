// pages/auth/callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '@supabase/auth-helpers-react';

export default function AuthCallback() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    // When the magic-link login succeeds, Supabase creates a session.
    // As soon as we see it, send the user into the app.
    if (session) {
      router.replace('/app'); // change '/app' if your protected page is different
    }
  }, [session, router]);

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Signing you in…</h1>
      <p>You can close this tab if nothing happens in a few seconds.</p>
    </main>
  );
}
