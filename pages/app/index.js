// pages/app/index.js
import Link from 'next/link';
import { useSession } from '@supabase/auth-helpers-react';
import { withSubscriptionGuard } from '../../lib/withSubscriptionGuard';

// Protect this page: only logged-in users with subscription_status === 'active'
export const getServerSideProps = withSubscriptionGuard();

export default function AppHome({ profile }) {
  const session = useSession();
  const email = session?.user?.email || profile?.email || '';

  return (
    <main
      style={{
        maxWidth: 640,
        margin: '40px auto',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1>Welcome to the app 🎉</h1>

      <section style={{ marginTop: 16 }}>
        <p>
          Logged in as: <strong>{email}</strong>
        </p>
        <p>
          Subscription status:{' '}
          <strong>{profile?.subscription_status || 'unknown'}</strong>
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Your protected content</h2>
        <p style={{ marginBottom: 16 }}>
          Only users with an <code>active</code> Stripe subscription can see
          this page. If the subscription is cancelled or payment fails, this
          page will start redirecting to <code>/subscribe</code>.
        </p>

        {/* 👉 Link to your existing quiz page (root / ) */}
        <Link href="/" legacyBehavior>
          <a
            style={{
              display: 'inline-block',
              padding: '10px 18px',
              background: '#635bff',
              color: '#fff',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Start the Ontario G1 Practice Test →
          </a>
        </Link>
      </section>
    </main>
  );
}
