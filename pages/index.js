import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
const ACCESS_CODE = 'Lucas';

const styles = {
  page: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: '#f4f4ff',
    minHeight: '100vh',
    margin: 0,
    padding: 0
  },
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '16px 16px 40px'
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    background: '#f4f4ff',
    padding: '8px 0 10px',
    marginBottom: 12,
    borderBottom: '1px solid #dde0ff'
  },
  title: {
    fontSize: 32,
    fontWeight: 900,
    margin: 0,
    color: '#0353a4'
  },
  buttonsRow: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 8,
    flexWrap: 'wrap'
  },
  btn: {
    border: 'none',
    borderRadius: 999,
    padding: '6px 12px',
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  card: {
    marginTop: 16,
    background: '#fff',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease'
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: '#4c6fff',
    marginBottom: 12
  },
  progressOuter: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    background: '#e0e2ff',
    overflow: 'hidden',
    marginBottom: 10
  },
  progressInner: {
    height: '100%',
    borderRadius: 999,
    background: '#4c6fff',
    transition: 'width 0.25s ease'
  },
  imgWrap: {
    textAlign: 'center',
    marginBottom: 12
  },
  img: {
    maxWidth: 200,
    maxHeight: 160,
    width: 'auto',
    height: 'auto'
  },
  promptArea: {
    minHeight: 220,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: 8
  },
  questionText: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10
  },
  choices: {
    listStyle: 'none',
    padding: 0,
    margin: '8px 0'
  },
  choiceBtn: (idx, picked, correctIndex, done) => {
    let border = '#d0d0ff';
    let background = '#f8f8ff';

    if (!done) {
      if (picked === idx) {
        border = '#4c6fff';
        background = '#e4e7ff';
      }
    } else {
      if (idx === correctIndex) {
        border = '#1b8a3a';
        background = '#e3f7e8';
      } else if (idx === picked && picked !== correctIndex) {
        border = '#c62828';
        background = '#fde5e5';
      }
    }

    return {
      width: '100%',
      textAlign: 'left',
      borderRadius: 12,
      border: '1px solid ' + border,
      background,
      padding: '8px 10px',
      marginBottom: 6,
      cursor: 'pointer',
      fontSize: 14
    };
  },
  submitBtn: (disabled) => ({
    border: 'none',
    borderRadius: 999,
    padding: '8px 16px',
    fontSize: 14,
    cursor: disabled ? 'default' : 'pointer',
    background: disabled ? '#d3d3e6' : '#4c6fff',
    color: '#fff',
    marginTop: 4
  }),
  explanation: {
    marginTop: 10,
    padding: '8px 10px',
    borderRadius: 10,
    background: '#f1fff1',
    fontSize: 13
  }
};

// shuffle helper
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuestionChoices(q) {
  const idx = q.choices.map((_, i) => i);
  const sh = shuffleArray(idx);
  return {
    ...q,
    choices: sh.map((i) => q.choices[i]),
    correctIndex: sh.indexOf(q.correctIndex)
  };
}

export default function PrepTestG1() {
    const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
  async function checkAccess() {
    // 1) Old behavior: check localStorage flag (for now we keep as backup)
    let localHasAccess = false;
    if (typeof window !== 'undefined') {
      localHasAccess = window.localStorage.getItem('g1_access_v2') === 'yes';
    }

    // 2) New behavior: check Supabase user + subscription_status
    let subscriptionActive = false;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error getting Supabase user:', userError);
      }

      if (user) {
        // Look up this user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error loading profile:', profileError);
        } else if (profile && profile.subscription_status === 'active') {
          subscriptionActive = true;
        }
      }
    } catch (err) {
      console.error('Error checking Supabase user/profile:', err);
    }

    // 👉 strict Option A: only active subscriptions (plus old localStorage for now)
    setHasAccess(localHasAccess || subscriptionActive);
    setAccessChecked(true);
  }

  checkAccess();
}, []);

  const [allQuestions, setAllQuestions] = useState(null); // full bank
  const [questions, setQuestions] = useState([]); // active set
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [cardRaised, setCardRaised] = useState(false);
  
  const [codeInput, setCodeInput] = useState('');

  // for the global "Question X of 280" display
  const [globalBase, setGlobalBase] = useState(0); // 0 for 1–40, 40 for 41–80, ...
  const [globalTotal, setGlobalTotal] = useState(0); // should be 280

  // load questions
  useEffect(() => {
    fetch('/questions.json')
      .then((r) => r.json())
      .then((data) => {
        const ordered = data.map(shuffleQuestionChoices);
        setAllQuestions(ordered);
        // show only the first 40 questions by default (Set 1–40)
      setQuestions(ordered.slice(0, 40));
      setGlobalTotal(ordered.length); // still 280 total globally
      setGlobalBase(0); // Question 1 of 280
      })
      .catch(() => {
        setAllQuestions([]);
        setQuestions([]);
        setGlobalTotal(0);
      });
  }, []);

  // access from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('g1_access_v2');
      if (stored === 'yes') setHasAccess(true);
    }
  }, []);

  const hasQuestionsFlag = questions.length > 0;

  let safeIndex = current;
  if (hasQuestionsFlag) {
    if (safeIndex < 0) safeIndex = 0;
    if (safeIndex >= questions.length) safeIndex = questions.length - 1;
  } else {
    safeIndex = 0;
  }

  const q = hasQuestionsFlag ? questions[safeIndex] : null;
  const isLast = hasQuestionsFlag && safeIndex === questions.length - 1;

  const inSet = hasQuestionsFlag ? safeIndex + 1 : 0; // position inside current set
  const inSetTotal = hasQuestionsFlag ? questions.length : 0;

  const totalGlobal = globalTotal || (allQuestions ? allQuestions.length : 0);
  const globalNumber = inSetTotal ? globalBase + inSet : 0; // 1, 41, 81,...

  const pct = inSetTotal ? (inSet / inSetTotal) * 100 : 0;

  const submit = () => {
    if (!q || picked === null || done) return;
    if (picked === q.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
    setDone(true);
  };

  const next = () => {
    if (!hasQuestionsFlag) return;
    setCurrent((p) => (p >= questions.length - 1 ? p : p + 1));
    setPicked(null);
    setDone(false);
  };

  // start a set by index range, and remember its base number
  const startByIndex = (startIdx, endIdx, baseNumber) => {
    if (!allQuestions) return;
    const subset = allQuestions.slice(startIdx, endIdx + 1); // inclusive
    setQuestions(subset);
    setCurrent(0);
    setPicked(null);
    setDone(false);
    setCorrectCount(0);
    setGlobalBase(baseNumber); // 0 → Question 1, 40 → Question 41, etc.
  };

  // 7 sets of 40 questions each (0-based indices)
  const start1 = () => startByIndex(0, 39, 1 - 1); // Questions 1–40
  const start41 = () => startByIndex(40, 79, 41 - 1); // 41–80
  const start81 = () => startByIndex(80, 119, 81 - 1); // 81–120
  const start121 = () => startByIndex(120, 159, 121 - 1); // 121–160
  const start161 = () => startByIndex(160, 199, 161 - 1); // 161–200
  const start201 = () => startByIndex(200, 239, 201 - 1); // 201–240
  const start241 = () => startByIndex(240, 279, 241 - 1); // 241–280

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (codeInput.trim() === ACCESS_CODE) {
      setHasAccess(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('g1_access_v2', 'yes');
      }
    } else {
      alert('Incorrect access code');
    }
  };

  const handleSubscribe = async () => {
    const res = await fetch('/api/create-checkout-session', { method: 'POST' });
    if (!res.ok) {
      alert('Checkout error');
      return;
    }
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleLogout = () => {
    setHasAccess(false);
    setCodeInput('');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('g1_access_v2');
    }
  };

  const renderButtons = () => (
    <div style={styles.buttonsRow}>
      <button
        onClick={start1}
        style={{ ...styles.btn, background: '#ffe6a7' }}
      >
        Start 1–40
      </button>
      <button
        onClick={start41}
        style={{ ...styles.btn, background: '#ffd5f2' }}
      >
        Start 41–80
      </button>
      <button
        onClick={start81}
        style={{ ...styles.btn, background: '#e0c3ff' }}
      >
        Start 81–120
      </button>
      <button
        onClick={start121}
        style={{ ...styles.btn, background: '#c1ffd7' }}
      >
        Start 121–160
      </button>
      <button
        onClick={start161}
        style={{ ...styles.btn, background: '#b3e6ff' }}
      >
        Start 161–200
      </button>
      <button
        onClick={start201}
        style={{ ...styles.btn, background: '#d4c4ff' }}
      >
        Start 201–240
      </button>
      <button
        onClick={start241}
        style={{ ...styles.btn, background: '#baf2ff' }}
      >
        Start 241–280
      </button>
    </div>
  );

  // loading state
  if (!allQuestions) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Ontario G1 Practice Test</h1>
            {renderButtons()}
          </div>
          <div style={styles.card}>
            <p>Loading questions…</p>
          </div>
        </div>
      </div>
    );
  }
  if (!accessChecked) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <p>Checking access…</p>
          </div>
        </div>
      </div>
    );
  }

  // access gate
if (!hasAccess) {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Ontario G1 Practice Test</h1>
          {renderButtons()}
        </div>
        <div style={styles.card}>
          <h2>Access required</h2>
          <form onSubmit={handleCodeSubmit}>
            <input
              type="password"
              placeholder="Access code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginBottom: 8
              }}
            />
            <button style={styles.submitBtn(false)}>Unlock</button>
          </form>
          <hr />
          <button style={styles.submitBtn(false)} onClick={handleSubscribe}>
            Subscribe · $15/month
          </button>

          {/* NEW: login link */}
          <p style={{ marginTop: 12, fontSize: 13, color: '#4b5563' }}>
            Already subscribed?{' '}
            <a
              href="/login"
              style={{ color: '#2563eb', textDecoration: 'underline' }}
            >
              Log in to your account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


  // no active questions (should not normally happen)
  if (!hasQuestionsFlag) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Ontario G1 Practice Test</h1>
            {renderButtons()}
          </div>
          <div style={styles.card}>No questions available.</div>
        </div>
      </div>
    );
  }

  // MAIN QUIZ VIEW
  return (
    <div style={styles.page}>
      <style jsx global>{`
        .question-anim {
          animation: fadeSlide 0.25s ease-out;
        }
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h1 style={styles.title}>Ontario G1 Practice Test</h1>
            <button
              onClick={handleLogout}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: 999,
                background: '#e0e2ff',
                cursor: 'pointer'
              }}
            >
              Log out
            </button>
          </div>
          {renderButtons()}
        </div>

        <div
          style={{
            ...styles.card,
            ...(cardRaised
              ? {
                  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.16)',
                  transform: 'translateY(-2px)'
                }
              : {})
          }}
          onMouseEnter={() => setCardRaised(true)}
          onMouseLeave={() => setCardRaised(false)}
        >
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${pct}%` }} />
          </div>

          <div style={styles.metaRow}>
            <span>
              Question {globalNumber} of {totalGlobal} · Set {inSet}/
              {inSetTotal}
            </span>
            <span>Correct: {correctCount}</span>
          </div>

          <div key={globalNumber} className="question-anim">
            <div style={styles.promptArea}>
              {q.image && (
                <div style={styles.imgWrap}>
                  <img src={q.image} style={styles.img} alt="img" />
                </div>
              )}
              <div style={styles.questionText}>{q.question}</div>
            </div>

            <ul style={styles.choices}>
              {q.choices.map((c, idx) => (
                <li key={idx}>
                  <button
                    style={styles.choiceBtn(idx, picked, q.correctIndex, done)}
                    onClick={() => !done && setPicked(idx)}
                  >
                    <strong>{String.fromCharCode(65 + idx)}.</strong> {c}
                  </button>
                </li>
              ))}
            </ul>

            <button
              style={styles.submitBtn(picked === null || (done && isLast))}
              disabled={picked === null || (done && isLast)}
              onClick={done ? next : submit}
            >
              {done ? (isLast ? 'End of set' : 'Next question') : 'Submit'}
            </button>

            {done && (
              <div style={styles.explanation}>
                <strong>
                  {picked === q.correctIndex ? 'Correct!' : 'Not quite.'}
                </strong>{' '}
                {q.explanation}
              </div>
            )}
{/* Footer */}
      <div
        style={{
          marginTop: "3rem",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#666",
          letterSpacing: "0.5px"
        }}
      >
        Ontario G1 Practice Test © 2025. ALL RIGHTS RESERVED.
      </div>
</div>
        </div>
      </div>
    </div>
  );
}
