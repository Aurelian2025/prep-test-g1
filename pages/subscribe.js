// pages/subscribe.js
import Link from 'next/link';

export default function SubscribePage() {
  return (
    <main style={{ maxWidth: 500, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Subscribe to access the app</h1>
      <p>Your account doesn’t have an active subscription yet.</p>

      {/* Replace this with your real Stripe Payment Link or Checkout URL */}
      <a
        href="https://buy.stripe.com/test_your_payment_link_here"
        style={{
          display: 'inline-block',
          marginTop: 16,
          padding: '10px 16px',
          borderRadius: 4,
          border: 'none',
          background: '#635bff',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        Go to checkout
      </a>

      <p style={{ marginTop: 16 }}>
        Already subscribed? <Link href="/login">Sign in</Link>
      </p>
    </main>
  );
}
