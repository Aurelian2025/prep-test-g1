import Link from 'next/link';

export default function SubscribePage() {
  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Access restricted</h1>

      <p style={{ marginTop: 16 }}>
        Your account is currently <strong>not active</strong>.
      </p>

      <p style={{ marginTop: 16 }}>
        Please contact the administrator if you believe this is a mistake.
      </p>
    </main>
  );
}
