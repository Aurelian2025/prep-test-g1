// pages/app/index.js
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { withSubscriptionGuard } from '../../lib/withSubscriptionGuard';
import Link from 'next/link';

export const getServerSideProps = withSubscriptionGuard();

export default function AppHome({ profile }) {
  const session = useSession();
  const supabase = useSupabaseClient();

  // ✅ Logout function — place it right here
  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out', e);
    }
    window.location.href = '/login';
  }

  return (
    <main
      style={{
        maxWidth: 900,
        margin: '40px auto',
        fontFamily: 'system-ui',
        padding: '0 16px'
      }}
    >
      {/* HEADER ROW */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}
      >
        <h1 style={{ margin: 0 }}>
          Welcome to the app 🎉
        </h1>

        {/* 🔥 Logout button on the top-right */}
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 12px',
            background: '#eee',
            borderRadius: 6,
            border: '1px solid #ccc',
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Sign out
        </button>
      </div>

      <p>
        Logged in as: <strong>{session?.user?.email}</strong>
      </p>

      <p>
        Subscription status:{' '}
        <strong>{profile?.subscription_status || 'unknown'}</strong>
      </p>

      <h2>Your protected content</h2>
      <p>
        Only users with an <code>active</code> Stripe subscription can see this
        page. If the subscription is cancelled or payment fails, this page will
        redirect to <code>/subscribe</code>.
      </p>

      <Link href="/">
        <div
          style={{
            marginTop: 20,
            display: 'inline-block',
            padding: '12px 20px',
            background: '#635bff',
            borderRadius: 8,
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Start the Ontario G1 Practice Test →
        </div>
      </Link>
    </main>
  );
}
