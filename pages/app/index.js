// pages/app/index.js
import { useSession } from '@supabase/auth-helpers-react';
import { withSubscriptionGuard } from '../../lib/withSubscriptionGuard';

// Protect this page: only logged-in users with subscription_status === 'active'
export const getServerSideProps = withSubscriptionGuard();

export default function AppHome({ profile }) {
  const session = useSession();

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Welcome to the app 🎉</h1>

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
          Only users with an <code>active</code> Stripe subscription can see this
          page. If the subscription is cancelled or payment fails, this page will
          start redirecting to <code>/subscribe</code>.
        </p>
      </section>
    </main>
  );
}
