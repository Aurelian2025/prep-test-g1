// pages/auth/callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '../../lib/SupabaseContext';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = useSupabase();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/app');
      }
    };

    checkSession();
  }, [supabase, router]);

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Signing you in…</h1>
      <p>You can close this tab if nothing happens in a few seconds.</p>
    </main>
  );
}
