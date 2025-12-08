// pages/subscribe.js
import Link from 'next/link';

export default function SubscribePage() {
  // Replace this with your real Stripe Payment Link URL (from Stripe Dashboard)
  const paymentLinkUrl = 'https://buy.stripe.com/test_7sYcN60l62vt9dz3sk1gs02';

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Upgrade to get access</h1>

      <p style={{ marginTop: 16 }}>
        Your account is currently <strong>not active</strong>. To access the app,
        you need an active subscription.
      </p>

      <ol style={{ marginTop: 16 }}>
        <li>Click the button below to complete payment via Stripe Checkout.</li>
        <li>Come back and sign in with the <strong>same email</strong>.</li>
        <li>
          Our Stripe webhook will mark your profile as{' '}
          <code>subscription_status = 'active'</code>, and you’ll be able to
          access the app.
        </li>
      </ol>

      <div style={{ marginTop: 24 }}>
        <a
          href={paymentLinkUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            background: '#635bff',
            color: 'white',
            borderRadius: 6,
            textDecoration: 'none',
          }}
        >
          Go to Stripe Checkout
        </a>
      </div>

      <p style={{ marginTop: 24 }}>
        Already paid?{' '}
        <Link href="/login">
          <span style={{ color: '#635bff', cursor: 'pointer' }}>Sign in again</span>
        </Link>{' '}
        with the same email you used at checkout.
      </p>
    </main>
  );
}
