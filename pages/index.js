import { useEffect, useState } from 'react';

export default function Home() {
  const [questions, setQuestions] = useState(null);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const startOverSet2 = () => {
  setQuestions(prev => shuffleAll(prev)); // reshuffle choices
  setCurrent(20);                          // index 20 => question #21
  setPicked(null);
  setDone(false);
  setCorrectCount(0);                      // reset score for this set
};


  // ---------- shuffle helpers ----------
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
  // -------------------------------------

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

  const startOver = () => {
  setQuestions(prev => shuffleAll(prev));
  setCurrent(0);
  setPicked(null);
  setDone(false);
  setCorrectCount(0); // reset score
};
const startThisSet = () => {
  setQuestions(prev => shuffleAll(prev));         // reshuffle choices
  const startIndex = current >= 20 ? 20 : 0;      // 0 => Q1, 20 => Q21
  setCurrent(startIndex);
  setPicked(null);
  setDone(false);
  setCorrectCount(0);                              // reset score for this set
};

  const select = (idx) => {
    if (!done) setPicked(idx);
  };

 const submit = () => {
  if (picked === null) return;
  setDone(true);
  const correctIndex = questions[current].correctIndexShuffled ?? questions[current].correctIndex;
  if (picked === correctIndex) {
    setCorrectCount(prev => prev + 1);
  }
};



  const next = () => {
    if (questions && current < questions.length - 1) setCurrent(current + 1);
  };

  // ---------- loading / empty states ----------
  if (!questions) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.h1}>Prep Test G1</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={startOver} style={{ ...styles.btn, background: '#c1ffd7' }}>
              Start Over
            </button>
          </div>
{(() => {
  const label = current >= 20 ? 'Start this set (21–40)' : 'Start this set (1–20)';
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
      <button onClick={startThisSet} style={{ ...styles.btn, background: '#ffe6a7' }}>
        {label}
      </button>
    </div>
  );
})()}

                {current >= 20 && (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
    <button onClick={startOverSet2} style={{ ...styles.btn, background: '#ffe6a7' }}>
      Start Over (21–40)
    </button>
  </div>
)}

          <p style={styles.p}>Loading question…</p>
        </div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.h1}>Prep Test G1</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={startOver} style={{ ...styles.btn, background: '#c1ffd7' }}>
              Start Over
            </button>
          </div>
          <p style={styles.p}>No questions available.</p>
        </div>
      </main>
    );
  }
  // --------------------------------------------

  const q = questions[current];
  const choices = q.choicesShuffled ?? q.choices;
  const correctIndex = q.correctIndexShuffled ?? q.correctIndex;
  const isCorrect = done && picked === correctIndex;
  const onLast = current === questions.length - 1;

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.h1}>Prep Test G1</div>
        <p style={styles.tag}>Ontario G1 • Multiple choice • Playful</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={startOver} style={{ ...styles.btn, background: '#c1ffd7' }}>
            Start Over
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

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
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
                Restart
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
                Original questions aligned to the Official MTO Driver’s Handbook (Ontario). We do
                not copy third-party practice tests.
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
