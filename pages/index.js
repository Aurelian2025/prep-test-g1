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
  imgWrap: { textAlign: "center", marginBottom: 12 },
  img: { maxWidth: 200, maxHeight: 160, width: "auto", height: "auto" },
  promptArea: {
    minHeight: 220,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  questionText: { fontSize: 16, fontWeight: 600, marginBottom: 10 },
  choices: { listStyle: "none", padding: 0, margin: "8px 0" },
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
          padding: 20px;
        }
        .card {
          width: 100%;
          max-width: 520px;
          background: #ffffff;
          border-radius: 18px;
          padding: 28px 20px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
          text-align: center;
        }
      `}</style>
    </div>
  );
}

const ACCESS_STORAGE_KEY = "g1_access_key";
const FREE_PROGRESS_KEY = "g1_free_progress";
const FREE_LIMIT = 20;

export default function PrepTestG1() {
  const supabase = useSupabaseClient();
  const OWNER_PASSWORD = "Lucas1";

  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [ownerOverride, setOwnerOverride] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [freeMode, setFreeMode] = useState(true);

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
  }, []);

  useEffect(() => {
    const used = localStorage.getItem(FREE_PROGRESS_KEY);
    if (used === "locked") setFreeMode(false);
    setAccessChecked(true);
  }, []);

  async function validateKeyAgainstSupabase(accessKey) {
    const { data } = await supabase
      .from("access_keys")
      .select("key, expires_at, disabled")
      .eq("key", accessKey)
      .maybeSingle();

    if (!data) return { ok: false };
    if (data.disabled) return { ok: false };
    if (!data.expires_at) return { ok: false };
    if (new Date(data.expires_at).getTime() <= Date.now()) return { ok: false };
    return { ok: true };
  }

  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    const entered = passwordInput.trim();

    if (entered === OWNER_PASSWORD) {
      setOwnerOverride(true);
      setHasAccess(true);
      setFreeMode(false);
      localStorage.setItem(FREE_PROGRESS_KEY, "locked");
      return;
    }

    const result = await validateKeyAgainstSupabase(entered);
    if (!result.ok) {
      setAccessError("Incorrect password.");
      return;
    }

    localStorage.setItem(ACCESS_STORAGE_KEY, entered);
    localStorage.setItem(FREE_PROGRESS_KEY, "locked");

    setHasAccess(true);
    setFreeMode(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_STORAGE_KEY);
    setHasAccess(false);
    setOwnerOverride(false);
  };

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const submit = () => {
    if (picked === null || done) return;
    if (picked === q.correctIndex) setCorrectCount((c) => c + 1);
    setDone(true);

    if (freeMode && current + 1 >= FREE_LIMIT) {
      localStorage.setItem(FREE_PROGRESS_KEY, "locked");
      setFreeMode(false);
    }
  };

  const next = () => {
    if (isLast) return;
    if (freeMode && current + 1 >= FREE_LIMIT) return;
    setCurrent((c) => c + 1);
    setPicked(null);
    setDone(false);
  };

  if (!accessChecked) return null;

  if (!hasAccess && !freeMode) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <form onSubmit={handleAccessSubmit}>
              <input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
              <button style={styles.submitBtn(false)}>Use special Pass</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Ontario G1 Practice Test</h1>
          {!freeMode && (
            <button onClick={handleLogout} style={styles.btn}>
              Sign out
            </button>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.questionText}>{q?.question}</div>

          <ul style={styles.choices}>
            {q?.choices.map((c, idx) => (
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
            {done ? "Next question" : "Submit"}
          </button>

          {done && (
            <div style={styles.explanation}>
              {picked === q.correctIndex ? "Correct!" : "Not quite."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
