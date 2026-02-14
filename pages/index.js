// pages/index.js
import { useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const styles = {
  page: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: "#f4f4ff",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "16px 16px 40px",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "#f4f4ff",
    padding: "8px 0 10px",
    marginBottom: 12,
    borderBottom: "1px solid #dde0ff",
  },
  title: {
    fontSize: 32,
    fontWeight: 900,
    margin: 0,
    color: "#0353a4",
  },
  buttonsRow: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 8,
    flexWrap: "wrap",
  },
  btn: {
    border: "none",
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  card: {
    marginTop: 16,
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 16,
    fontWeight: 600,
    color: "#4c6fff",
    marginBottom: 12,
  },
  progressOuter: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    background: "#e0e2ff",
    overflow: "hidden",
    marginBottom: 10,
  },
  progressInner: {
    height: "100%",
    borderRadius: 999,
    background: "#4c6fff",
    transition: "width 0.25s ease",
  },
  imgWrap: {
    textAlign: "center",
    marginBottom: 12,
  },
  img: {
    maxWidth: 200,
    maxHeight: 160,
    width: "auto",
    height: "auto",
  },
  promptArea: {
    minHeight: 220,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10,
  },
  choices: {
    listStyle: "none",
    padding: 0,
    margin: "8px 0",
  },
  choiceBtn: (idx, picked, correctIndex, done) => {
    let border = "#d0d0ff";
    let background = "#f8f8ff";

    if (!done) {
      if (picked === idx) {
        border = "#4c6fff";
        background = "#e4e7ff";
      }
    } else {
      if (idx === correctIndex) {
        border = "#1b8a3a";
        background = "#e3f7e8";
      } else if (idx === picked && picked !== correctIndex) {
        border = "#c62828";
        background = "#fde5e5";
      }
    }

    return {
      width: "100%",
      textAlign: "left",
      borderRadius: 12,
      border: "1px solid " + border,
      background,
      padding: "8px 10px",
      marginBottom: 6,
      cursor: "pointer",
      fontSize: 14,
    };
  },
  submitBtn: (disabled) => ({
    border: "none",
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: 14,
    cursor: disabled ? "default" : "pointer",
    background: disabled ? "#d3d3e6" : "#4c6fff",
    color: "#fff",
    marginTop: 4,
  }),
  explanation: {
    marginTop: 10,
    padding: "8px 10px",
    borderRadius: 10,
    background: "#f1fff1",
    fontSize: 13,
  },
};

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
    correctIndex: sh.indexOf(q.correctIndex),
  };
}

function CheckpointScreen({ correct, answered, passed, onContinue }) {
  return (
    <div className="checkpoint">
      <div className="card">
        <div className="face">{passed ? "🙂" : "😕"}</div>
        <h2>{passed ? "Congratulations!" : "Not quite enough"}</h2>
        {passed ? (
          <p className="subtitle">You passed!</p>
        ) : (
          <p className="subtitle">
            <strong>{correct}</strong> questions correct out of{" "}
            <strong>{answered}</strong>.
            <br />
            Try again.
          </p>
        )}
        <div className="score">
          Score: <strong>{correct}</strong> / {answered}
        </div>
        <button className="btn" onClick={onContinue}>
          Continue
        </button>
        <div className="hint">
          {passed
            ? "Keep going — you’re doing great."
            : "You’ve got this — keep practicing."}
        </div>
      </div>
      <style jsx>{`
        .checkpoint {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(244, 244, 255, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: max(20px, env(safe-area-inset-top))
            max(16px, env(safe-area-inset-right))
            max(20px, env(safe-area-inset-bottom))
            max(16px, env(safe-area-inset-left));
        }
        .card {
          width: 100%;
          max-width: 520px;
          background: #ffffff;
          border-radius: 18px;
          padding: 28px 20px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
          text-align: center;
          border: 1px solid rgba(76, 111, 255, 0.18);
        }
        .face {
          font-size: 72px;
          margin-bottom: 10px;
          line-height: 1;
        }
        h2 {
          margin: 0 0 6px;
          font-size: 26px;
          color: #0f172a;
        }
        .subtitle {
          margin: 0 0 14px;
          color: #334155;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.35;
        }
        .score {
          margin: 10px auto 18px;
          font-size: 16px;
          color: #0f172a;
          background: rgba(76, 111, 255, 0.08);
          border: 1px solid rgba(76, 111, 255, 0.18);
          border-radius: 14px;
          padding: 10px 12px;
          max-width: 280px;
        }
        .btn {
          width: 100%;
          max-width: 320px;
          border: none;
          border-radius: 999px;
          padding: 12px 16px;
          font-size: 15px;
          cursor: pointer;
          background: #4c6fff;
          color: white;
          font-weight: 800;
          box-shadow: 0 8px 18px rgba(76, 111, 255, 0.25);
        }
        .hint {
          margin-top: 14px;
          font-size: 12px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

const ACCESS_STORAGE_KEY = "g1_access_key";

export default function PrepTestG1() {
  const supabase = useSupabaseClient();

  const OWNER_PASSWORD = "Lucas1";

  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [ownerOverride, setOwnerOverride] = useState(false);
  const [accessError, setAccessError] = useState("");

  const [allQuestions, setAllQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // 🔴 NEW: lock after 20 questions in first module
  const [first20LimitReached, setFirst20LimitReached] = useState(false);

  useEffect(() => {
    fetch("/questions.json")
      .then((r) => r.json())
      .then((data) => {
        const ordered = data.map(shuffleQuestionChoices);
        setAllQuestions(ordered);
        setQuestions(ordered.slice(0, 40));
      });
  }, []);

  function clearAccess() {
    try {
      localStorage.removeItem(ACCESS_STORAGE_KEY);
    } catch (_) {}
    setHasAccess(false);
    setOwnerOverride(false);
  }

  useEffect(() => {
    const savedKey =
      typeof window !== "undefined"
        ? localStorage.getItem(ACCESS_STORAGE_KEY)
        : null;
    if (savedKey) setHasAccess(true);
    setAccessChecked(true);
  }, []);

  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    const entered = passwordInput.trim();

    if (entered === OWNER_PASSWORD) {
      setOwnerOverride(true);
      setHasAccess(true);
      setFirst20LimitReached(false);
      return;
    }

    if (!entered) return;

    try {
      localStorage.setItem(ACCESS_STORAGE_KEY, entered);
    } catch (_) {}

    setHasAccess(true);
    setFirst20LimitReached(false);
  };

  async function handleLogout() {
    clearAccess();
    window.location.href = "/";
  }

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const submit = () => {
    if (!q || picked === null || done) return;

    const isCorrect = picked === q.correctIndex;
    if (isCorrect) setCorrectCount((c) => c + 1);

    setDone(true);
  };

  const next = () => {
    if (!done) return;

    // 🔴 LOCK AFTER 20 QUESTIONS OF FIRST MODULE
    if (current === 19 && !ownerOverride) {
      clearAccess();
      setFirst20LimitReached(true);
      return;
    }

    if (!isLast) {
      setCurrent((p) => p + 1);
      setPicked(null);
      setDone(false);
    }
  };

  if (!accessChecked && !ownerOverride) {
    return <div />;
  }

  // 🔴 LOCK SCREEN AFTER FIRST 20
  if ((!hasAccess || first20LimitReached) && !ownerOverride) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <h2>Enter Password</h2>
            <form onSubmit={handleAccessSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  marginBottom: 8,
                }}
              />
              <button style={styles.submitBtn(false)}>Unlock</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Ontario G1 Practice Test</h1>
          <button onClick={handleLogout}>Sign out</button>
        </div>

        <div style={styles.card}>
          <div style={styles.questionText}>{q.question}</div>

          <ul style={styles.choices}>
            {q.choices.map((c, idx) => (
              <li key={idx}>
                <button
                  style={styles.choiceBtn(idx, picked, q.correctIndex, done)}
                  onClick={() => !done && setPicked(idx)}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>

          <button
            style={styles.submitBtn(picked === null && !done)}
            disabled={picked === null && !done}
            onClick={done ? next : submit}
          >
            {done ? "Next" : "Submit"}
          </button>

          {done && (
            <div style={styles.explanation}>
              {picked === q.correctIndex ? "Correct" : "Wrong"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
