// pages/app/index.js
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { withSubscriptionGuard } from '../../lib/withSubscriptionGuard';
import Link from 'next/link';

// Protect this page: only logged-in users with subscription_status === 'active'
export const getServerSideProps = withSubscriptionGuard();

export default function AppHome({ profile }) {
  const session = useSession();
  const supabase = useSupabaseClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <main
      style={{
        maxWidth: 640,
        margin: '40px auto',
        fontFamily: 'system-ui',
      }}
    >
      <h1>
        Welcome to the app 🎉
      </h1>

      <section style={{ marginTop: 16 }}>
        <p>
          Logged in as: <strong>{session?.user?.email}</strong>
        </p>
        <p>
          Subscription status:{' '}
          <strong>{profile?.subscription_status || 'unknown'}</strong>
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Your protected content</h2>
        <p>
          Only users with an <code>active</code> Stripe subscription can see
          this page. If the subscription is cancelled or payment fails, this page
          will redirect to <code>/subscribe</code>.
        </p>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link href="/">
          <button
            style={{
              padding: '10px 18px',
              background: '#635bff',
              color: 'white',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Start the Ontario G1 Practice Test →
          </button>
        </Link>
      </div>

      {/* 🔥 SIGN OUT BUTTON */}
      <div style={{ marginTop: 32 }}>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 14px',
            background: '#ddd',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
