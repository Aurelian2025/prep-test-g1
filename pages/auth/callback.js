// pages/auth/callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function AuthCallback() {
  const router = useRouter();
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    // If the session is already in context, go to /app
    if (session) {
      router.replace('/app');
      return;
    }

    // Otherwise, ask Supabase directly once
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/app');
      }
    };

    checkSession();
  }, [session, supabase, router]);

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Signing you in…</h1>
      <p>You can close this tab if nothing happens in a few seconds.</p>
    </main>
  );
}
