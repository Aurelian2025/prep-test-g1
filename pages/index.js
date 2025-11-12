export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      background: '#0b132b',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{textAlign: 'center', maxWidth: 680}}>
        <h1 style={{fontSize: '3rem', margin: 0}}>Prep test G1</h1>
        <p style={{opacity: 0.9, marginTop: '0.75rem'}}>
          Playful practice for Ontario’s G1. Multiple-choice, mock exams, and road-signs —
          all original and handbook-aligned.
        </p>
        <div style={{
          display: 'inline-block',
          padding: '0.75rem 1rem',
          borderRadius: 12,
          background: 'white',
          color: '#0b132b',
          fontWeight: 600,
          marginTop: '1.25rem'
        }}>
          App scaffold is running ✅
        </div>
        <p style={{marginTop: '1rem', fontSize: 12, opacity: 0.7}}>
          Step 1/3: Minimal Next.js app (JS). Next we’ll add one real question.
        </p>
      </div>
    </main>
  );
}
