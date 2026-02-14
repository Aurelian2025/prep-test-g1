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
    correctIndex: sh.indexOf(q.correctIndex),
  };
}

const ACCESS_STORAGE_KEY = "g1_access_key";
const TRIAL_KEY = "g1_first20_done";

export default function PrepTestG1() {
  const supabase = useSupabaseClient();

  const OWNER_PASSWORD = "Lucas1";

  const [hasAccess, setHasAccess] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [allQuestions, setAllQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    fetch("/questions.json")
      .then((r) => r.json())
      .then((data) => {
        const ordered = data.map(shuffleQuestionChoices);
        setAllQuestions(ordered);
        setQuestions(ordered.slice(0, 40));
      });

    const key = localStorage.getItem(ACCESS_STORAGE_KEY);
    if (key) setHasAccess(true);
  }, []);

  async function handleLogout() {
    localStorage.removeItem(ACCESS_STORAGE_KEY);
    localStorage.removeItem(TRIAL_KEY);
    setHasAccess(false);
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    const entered = passwordInput.trim();

    if (!entered) return;

    localStorage.setItem(ACCESS_STORAGE_KEY, entered);
    setHasAccess(true);
  };

  const q = questions[current];
  const inSet = current + 1;

  const submit = () => {
    if (picked === null || done) return;
    if (picked === q.correctIndex) setCorrectCount((c) => c + 1);
    setDone(true);
  };

  const next = () => {
    if (!done) return;

    // LOCK AFTER FIRST 20 QUESTIONS
    if (!hasAccess && inSet === 20) {
      localStorage.setItem(TRIAL_KEY, "1");
      return;
    }

    setCurrent((p) => p + 1);
    setPicked(null);
    setDone(false);
  };

  // LOCK SCREEN
  if (!hasAccess && localStorage.getItem(TRIAL_KEY) === "1") {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
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
          <button
            onClick={handleLogout}
            style={{
              border: "none",
              padding: "6px 12px",
              borderRadius: 999,
              background: "#e0e2ff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Sign out
          </button>
        </div>

        <div style={styles.card}>
          {q.image && (
            <div style={styles.imgWrap}>
              <img src={q.image} style={styles.img} />
            </div>
          )}

          <div style={styles.questionText}>{q.question}</div>

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
            style={styles.submitBtn(picked === null && !done)}
            disabled={picked === null && !done}
            onClick={done ? next : submit}
          >
            {done ? "Next question" : "Submit"}
          </button>

          {done && (
            <div style={styles.explanation}>
              <strong>
                {picked === q.correctIndex ? "Correct!" : "Not quite."}
              </strong>{" "}
              {q.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
