import { useEffect, useState } from 'react';

// ---------- shuffle helpers (outside component) ----------
function shuffleIndices(n) {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function shuffleQuestion(q) {
  const baseChoices = q._baseChoices || q.choices;
  const baseCorrect = q._baseCorrectIndex ?? q.correctIndex;
  const order = shuffleIndices(baseChoices.length);
  return {
    ...q,
    _baseChoices: baseChoices,
    _baseCorrectIndex: baseCorrect,
    choicesShuffled: order.map(i => baseChoices[i]),
    correctIndexShuffled: order.indexOf(baseCorrect)
  };
}

function shuffleAll(arr) {
  return Array.isArray(arr) ? arr.map(shuffleQuestion) : arr;
}
// ---------------------------------------------------------

export default function Home() {
  const [questions, setQuestions] = useState(null);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
const isLastQuestion =
  questions && questions.length > 0 && current === questions.length - 1;

  // Load questions and shuffle once on mount
  useEffect(() => {
    fetch('/questions.json')
      .then(r => r.json())
      .then(data => setQuestions(shuffleAll(data)))
      .catch(() => setQuestions([]));
  }, []);

  // Reset picked/done when moving between questions
  useEffect(() => {
    setPicked(null);
    setDone(false);
  }, [current]);


// Practice questions 1–40
const startFirst40 = () => {
  setQuestions(prev => shuffleAll(prev));
  setCurrent(0);   // index 0 = question 1
  setPicked(null);
  setDone(false);
  setCorrectCount(0);
};

// Practice questions 41–80
const startLast40 = () => {
  setQuestions(prev => shuffleAll(prev));
  setCurrent(40);  // index 40 = question 41
  setPicked(null);
  setDone(false);
  setCorrectCount(0);
};

// Practice questions 81–120 (will work once we add them)
const start81to120 = () => {
  setQuestions(prev => shuffleAll(prev));
  if (questions && questions.length >= 81) {
    // index 80 = question 81
    setCurrent(80);
  } else {
    // fallback for now (until we add more questions)
    setCurrent(0);
  }
  setPicked(null);
  setDone(false);
  setCorrectCount(0);
};
// Practice questions 121–160 (future demerit points set)
const start121to160 = () => {
  setQuestions(prev => shuffleAll(prev));
  if (questions && questions.length >= 121) {
    // index 120 = question 121
    setCurrent(120);
  } else {
    // For now, until we add 121–160, just start at the beginning
    setCurrent(0);
  }
  setPicked(null);
  setDone(false);
  setCorrectCount(0);
};
  // Practice questions 161–200 (future set)
const start161to200 = () => {
  setQuestions(prev => shuffleAll(prev));
  if (questions && questions.length >= 161) {
    // index 160 = question 161
    setCurrent(160);
  } else {
    // fallback for now until we add 161–200
    setCurrent(0);
  }
  setPicked(null);
  setDone(false);
  setCorrectCount(0);
};
  const select = (idx) => {
    if (!done) setPicked(idx);
  };

  const submit = () => {
    if (picked === null || !questions) return;
    setDone(true);
    const q = questions[current];
    const correctIndex = q.correctIndexShuffled ?? q.correctIndex;
    if (picked === correctIndex) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const next = () => {
    if (questions && current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  // ---------- loading state ----------
  if (!questions) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.h1}>Prep Test G1</div>
          <p style={styles.tag}>Ontario G1 • Multiple choice • Playful</p>
          
       <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8, flexWrap: 'wrap' }}>
  <button onClick={startFirst40} style={{ ...styles.btn, background: '#ffe6a7' }}>
    Start 1–40
  </button>
  <button onClick={startLast40} style={{ ...styles.btn, background: '#ffd5f2' }}>
    Start 41–80
  </button>
  <button onClick={start81to120} style={{ ...styles.btn, background: '#e0c3ff' }}>
    Start 81–120
  </button>
  <button onClick={start121to160} style={{ ...styles.btn, background: '#c1ffd7' }}>
    Start 121–160
  </button>
  <button onClick={start161to200} style={{ ...styles.btn, background: '#b3e6ff' }}>
    Start 161–200
  </button>
</div>


          <p style={styles.p}>Loading question…</p>
        </div>
      </main>
    );
  }

  // ---------- empty state ----------
  if (questions.length === 0) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.h1}>Prep Test G1</div>
          <p style={styles.tag}>Ontario G1 • Multiple choice • Playful</p>
      
       <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8, flexWrap: 'wrap' }}>
  <button onClick={startFirst40} style={{ ...styles.btn, background: '#ffe6a7' }}>
    Start 1–40
  </button>
  <button onClick={startLast40} style={{ ...styles.btn, background: '#ffd5f2' }}>
    Start 41–80
  </button>
  <button onClick={start81to120} style={{ ...styles.btn, background: '#e0c3ff' }}>
    Start 81–120
  </button>
  <button onClick={start121to160} style={{ ...styles.btn, background: '#c1ffd7' }}>
    Start 121–160
  </button>
  <button onClick={start161to200} style={{ ...styles.btn, background: '#b3e6ff' }}>
    Start 161–200
  </button>
</div>

          <p style={styles.p}>No questions available.</p>
        </div>
      </main>
    );
  }

  // ---------- main quiz view ----------
 let safeIndex = current;

// Clamp index so it never goes out of range
if (questions && questions.length > 0) {
  if (safeIndex < 0) safeIndex = 0;
  if (safeIndex > questions.length - 1) safeIndex = questions.length - 1;
}

const q =
  questions && questions.length > 0 ? questions[safeIndex] : null;

  const choices = q.choicesShuffled ?? q.choices;
  const correctIndex = q.correctIndexShuffled ?? q.correctIndex;
  const isCorrect = done && picked === correctIndex;
  const onLast = current === questions.length - 1;

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.h1}>Prep Test G1</div>
        <p style={styles.tag}>Ontario G1 • Multiple choice • Playful</p>
    
     <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8, flexWrap: 'wrap' }}>
  <button onClick={startFirst40} style={{ ...styles.btn, background: '#ffe6a7' }}>
    Start 1–40
  </button>
  <button onClick={startLast40} style={{ ...styles.btn, background: '#ffd5f2' }}>
    Start 41–80
  </button>
  <button onClick={start81to120} style={{ ...styles.btn, background: '#e0c3ff' }}>
    Start 81–120
  </button>
  <button onClick={start121to160} style={{ ...styles.btn, background: '#c1ffd7' }}>
    Start 121–160
  </button>
  <button onClick={start161to200} style={{ ...styles.btn, background: '#b3e6ff' }}>
    Start 161–200
  </button>
</div>

        <div style={{ marginTop: 16 }}>
          <div style={styles.qmeta}>
            <span style={{ opacity: 0.8, fontSize: 12 }}>
              Question {current + 1} of {questions.length} | Correct: {correctCount}
            </span>
          </div>

          {q.image && (
            <div style={{ display: 'grid', placeItems: 'center', marginBottom: 10 }}>
              <img
                src={q.image}
                alt="Road sign"
                style={{ width: 180, height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}

          <div style={styles.qtext}>{q.question}</div>

          <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
            {choices.map((choice, idx) => {
              const pickedThis = picked === idx;
              const showResult = done && pickedThis;
              const correct = done && idx === correctIndex;

              let bg = '#111727';
              if (pickedThis && !done) bg = '#25324a';
              if (showResult && correct) bg = '#144d2a';
              if (showResult && !correct) bg = '#5a1a1a';
              if (done && correct && !pickedThis) bg = '#1d3b28';

              return (
                <li
                  key={idx}
                  onClick={() => select(idx)}
                  style={{
                    ...styles.choice,
                    background: bg,
                    cursor: done ? 'default' : 'pointer',
                    border: pickedThis ? '2px solid #8ab4ff' : '2px solid transparent'
                  }}
                >
                  <span style={styles.choiceLabel}>{String.fromCharCode(65 + idx)}.</span>
                  <span>{choice}</span>
                </li>
              );
            })}
          </ul>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
            <button onClick={submit} disabled={picked === null || done} style={styles.btn}>
              {done ? 'Answered' : 'Submit'}
            </button>

            {done && (
              <span style={{ fontWeight: 600, color: isCorrect ? '#5ff59b' : '#ff9aa2' }}>
                {isCorrect ? 'Correct 🎉' : 'Not quite — see why below'}
              </span>
            )}

            {done && !onLast && (
              <button onClick={next} style={{ ...styles.btn, background: '#c1d7ff' }}>
                Next →
              </button>
            )}
            {done && onLast && (
              <button onClick={startOver} style={{ ...styles.btn, background: '#c1ffd7' }}>
                Restart (1–40)
              </button>
            )}
          </div>

          {done && (
            <div style={styles.explainer}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Why?</div>
              <p style={{ margin: 0 }}>{q.explanation}</p>
              {q.sources?.[0] && (
                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
                  Source:{' '}
                  <a href={q.sources[0].url} target="_blank" rel="noreferrer">
                    {q.sources[0].title}
                  </a>
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
                Original questions aligned to the Official MTO Driver’s Handbook (Ontario). We do not copy third-party practice tests.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: '#0b132b',
    color: 'white',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: 760,
    background: '#0f172a',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
  },
  h1: { margin: 0, fontSize: '2rem', fontWeight: 800 },
  tag: { marginTop: 6, opacity: 0.8, fontSize: 14 },
  p: { marginTop: 10, opacity: 0.85 },
  qmeta: { marginTop: 4, marginBottom: 8 },
  qtext: { fontSize: 18, fontWeight: 600, lineHeight: 1.35 },
  choice: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 12,
    marginTop: 8
  },
  choiceLabel: {
    width: 22,
    display: 'inline-block',
    opacity: 0.85,
    fontWeight: 700
  },
  btn: {
    background: 'white',
    color: '#0b132b',
    border: 'none',
    borderRadius: 12,
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  explainer: {
    marginTop: 16,
    padding: 12,
    background: '#0b132b',
    borderRadius: 12
  }
};
