import { useEffect } from 'react';

const pageStyle = {
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  background: '#f4f4ff',
  minHeight: '100vh',
  margin: 0,
  padding: 0
};

const containerStyle = {
  maxWidth: 700,
  margin: '0 auto',
  padding: '24px 16px 40px'
};

const cardStyle = {
  marginTop: 16,
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
};

const btnStyle = {
  marginTop: 12,
  borderRadius: 999,
  border: 'none',
  padding: '8px 16px',
  fontSize: 14,
  cursor: 'pointer',
  background: '#4c6fff',
  color: '#fff'
};

export default function CheckoutSuccess() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // mark access as unlocked for this browser
      window.localStorage.setItem('g1_access_ok', 'yes');
    }
  }, []);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: '#0353a4' }}>
          Ontario G1 Practice Test
        </h1>
        <p style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
          Subscription active · Access unlocked on this device
        </p>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: 20 }}>Thank you for subscribing!</h2>
          <p style={{ fontSize: 14, lineHeight: 1.5 }}>
            Your payment was successful and this browser is now unlocked for full access
            to all G1 practice questions.
          </p>
          <button
            style={btnStyle}
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Go to practice questions
          </button>
        </div>
      </div>
    </div>
  );
}
