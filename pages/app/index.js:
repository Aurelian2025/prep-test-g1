// pages/app/index.js
import { useSession } from '@supabase/auth-helpers-react';
import { withSubscriptionGuard } from '../../lib/withSubscriptionGuard';

export const getServerSideProps = withSubscriptionGuard();

export default function AppHome({ profile }) {
  const session = useSession();

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Welcome to the app 🎉</h1>
      <p>You are logged in as: <strong>{session?.user?.email}</strong></p>
      <p>Subscription status: <strong>{profile?.subscription_status}</strong></p>

      <section style={{ marginTop: 24 }}>
        <h2>Your protected content</h2>
        <p>Only users with an active Stripe subscription can see this.</p>
      </section>
    </main>
  );
}
