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

/**
 * Full-screen checkpoint overlay (mobile-friendly).
 */
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

  // Owner/master override (for you only)
  const OWNER_PASSWORD = "Lucas";

  // Access/login state
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [ownerOverride, setOwnerOverride] = useState(false);
  const [accessError, setAccessError] = useState("");

  const [blockAnswered, setBlockAnswered] = useState(0);
  const [blockCorrect, setBlockCorrect] = useState(0);

  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [checkpointScore, setCheckpointScore] = useState({
    correct: 0,
    answered: 0,
    passed: false,
  });

  // QUESTION STATE
  const [allQuestions, setAllQuestions] = useState(null); // full bank
  const [questions, setQuestions] = useState([]); // active set
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [cardRaised, setCardRaised] = useState(false);

  const [globalBase, setGlobalBase] = useState(0);
  const [globalTotal, setGlobalTotal] = useState(0);

  // load questions
  useEffect(() => {
    fetch("/questions.json")
      .then((r) => r.json())
      .then((data) => {
        const ordered = data.map(shuffleQuestionChoices);
        setAllQuestions(ordered);

        setQuestions(ordered.slice(0, 40));
        setGlobalTotal(ordered.length);
        setGlobalBase(0);
      })
      .catch(() => {
        setAllQuestions([]);
        setQuestions([]);
        setGlobalTotal(0);
      });
  }, []);

  const hasQuestionsFlag = questions.length > 0;

  // ---------- Access control helpers ----------
  async function validateKeyAgainstSupabase(accessKey) {
    if (!accessKey) return { ok: false, reason: "missing" };

    // IMPORTANT:
    // This table must exist: public.access_keys
    // Columns: key (text PK), expires_at (timestamptz), disabled (bool)
    const { data, error } = await supabase
      .from("access_keys")
      .select("key, expires_at, disabled")
      .eq("key", accessKey)
      .maybeSingle();

    if (error) {
      console.error("Error checking access key:", error);
      return { ok: false, reason: "error" };
    }

    if (!data) return { ok: false, reason: "invalid" };
    if (data.disabled) return { ok: false, reason: "disabled" };

    const expired =
      !data.expires_at || new Date(data.expires_at).getTime() <= Date.now();
    if (expired) return { ok: false, reason: "expired" };

    return { ok: true };
  }

  function clearAccess() {
    try {
      localStorage.removeItem(ACCESS_STORAGE_KEY);
    } catch (_) {}
    setHasAccess(false);
    setOwnerOverride(false);
    setPasswordInput("");
  }

  // Check access on load + repeat (auto-kick)
  useEffect(() => {
    let cancelled = false;
    let intervalId = null;
    let isChecking = false;

    async function checkAccessLoop() {
      if (cancelled) return;
      if (ownerOverride) {
        setHasAccess(true);
        setAccessChecked(true);
        return;
      }

      if (isChecking) return;
      isChecking = true;

      try {
        const savedKey =
          typeof window !== "undefined"
            ? localStorage.getItem(ACCESS_STORAGE_KEY)
            : null;

        if (!savedKey) {
          if (!cancelled) {
            setHasAccess(false);
            setAccessChecked(true);
          }
          return;
        }

        const result = await validateKeyAgainstSupabase(savedKey);

        if (cancelled) return;

        if (!result.ok) {
          clearAccess();
          setAccessError(
            result.reason === "expired"
              ? "Your access has expired."
              : result.reason === "disabled"
              ? "Your access has been disabled."
              : "Access is no longer valid."
          );
          setHasAccess(false);
        } else {
          setAccessError("");
          setHasAccess(true);
        }
      } finally {
        if (!cancelled) setAccessChecked(true);
        isChecking = false;
      }
    }

    // Initial check
    checkAccessLoop();

    // Periodic check (auto logout while tab open)
    intervalId = setInterval(checkAccessLoop, 60 * 1000);

    // Check again when returning to tab
    const onFocus = () => checkAccessLoop();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [supabase, ownerOverride]);

  // Handle password submit
  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    setAccessError("");

    const entered = passwordInput.trim();
    if (!entered) {
      setAccessError("Enter your password.");
      return;
    }

    // Owner override
    if (entered === OWNER_PASSWORD) {
      setOwnerOverride(true);
      setHasAccess(true);
      setAccessChecked(true);
      setPasswordInput("");
      return;
    }

    // Normal user password -> validate against Supabase table
    const result = await validateKeyAgainstSupabase(entered);
    if (!result.ok) {
      setHasAccess(false);
      setAccessChecked(true);
      setAccessError(
        result.reason === "invalid"
          ? "Incorrect password."
          : result.reason === "expired"
          ? "Your access has expired."
          : result.reason === "disabled"
          ? "Your access has been disabled."
          : "Unable to verify access right now."
      );
      return;
    }

    // Save key locally for persistence
    try {
      localStorage.setItem(ACCESS_STORAGE_KEY, entered);
    } catch (_) {}

    setHasAccess(true);
    setAccessChecked(true);
    setPasswordInput("");
  };

  // Sign out (clears local access)
  async function handleLogout() {
    clearAccess();
    window.location.href = "/";
  }

  // ---------- Quiz logic ----------
  let safeIndex = current;
  if (hasQuestionsFlag) {
    if (safeIndex < 0) safeIndex = 0;
    if (safeIndex >= questions.length) safeIndex = questions.length - 1;
  } else {
    safeIndex = 0;
  }

  const q = hasQuestionsFlag ? questions[safeIndex] : null;
  const isLast = hasQuestionsFlag && safeIndex === questions.length - 1;

  const inSet = hasQuestionsFlag ? safeIndex + 1 : 0; // 1..40
  const inSetTotal = hasQuestionsFlag ? questions.length : 0;

  const totalGlobal = globalTotal || (allQuestions ? allQuestions.length : 0);
  const globalNumber = inSetTotal ? globalBase + inSet : 0;

  const pct = inSetTotal ? (inSet / inSetTotal) * 100 : 0;

  const submit = () => {
    if (!q || picked === null || done) return;

    const isCorrect = picked === q.correctIndex;

    setBlockAnswered((n) => n + 1);
    if (isCorrect) setBlockCorrect((n) => n + 1);

    if (isCorrect) setCorrectCount((c) => c + 1);

    setDone(true);
  };

  const next = () => {
    if (!hasQuestionsFlag) return;
    if (checkpointOpen) return;

    setCurrent((p) => (p >= questions.length - 1 ? p : p + 1));
    setPicked(null);
    setDone(false);
  };

  const startByIndex = (startIdx, endIdx, baseNumber) => {
    if (!allQuestions) return;
    const subset = allQuestions.slice(startIdx, endIdx + 1);
    setQuestions(subset);
    setCurrent(0);
    setPicked(null);
    setDone(false);
    setCorrectCount(0);
    setGlobalBase(baseNumber);

    setBlockAnswered(0);
    setBlockCorrect(0);
    setCheckpointOpen(false);
    setCheckpointScore({ correct: 0, answered: 0 });
  };

  const start1 = () => startByIndex(0, 39, 1 - 1);
  const start41 = () => startByIndex(40, 79, 41 - 1);
  const start81 = () => startByIndex(80, 119, 81 - 1);
  const start121 = () => startByIndex(120, 159, 121 - 1);
  const start161 = () => startByIndex(160, 199, 161 - 1);
  const start201 = () => startByIndex(200, 239, 201 - 1);
  const start241 = () => startByIndex(240, 279, 241 - 1);

  const renderButtons = () => (
    <div style={styles.buttonsRow}>
      <button onClick={start1} style={{ ...styles.btn, background: "#ffe6a7" }}>
        Start 1–40
      </button>
      <button
        onClick={start41}
        style={{ ...styles.btn, background: "#ffd5f2" }}
      >
        Start 41–80
      </button>
      <button
        onClick={start81}
        style={{ ...styles.btn, background: "#e0c3ff" }}
      >
        Start 81–120
      </button>
      <button
        onClick={start121}
        style={{ ...styles.btn, background: "#c1ffd7" }}
      >
        Start 121–160
      </button>
      <button
        onClick={start161}
        style={{ ...styles.btn, background: "#b3e6ff" }}
      >
        Start 161–200
      </button>
      <button
        onClick={start201}
        style={{ ...styles.btn, background: "#d4c4ff" }}
      >
        Start 201–240
      </button>
      <button
        onClick={start241}
        style={{ ...styles.btn, background: "#baf2ff" }}
      >
        Start 241–280
      </button>
    </div>
  );

  useEffect(() => {
    if (checkpointOpen) return;
    if (!done) return;

    const isCheckpointQuestion = inSet === 20 || inSet === 40;
    if (!isCheckpointQuestion) return;

    if (blockAnswered < 20) return;

    const passed = blockCorrect >= 18;

    setCheckpointScore({
      correct: blockCorrect,
      answered: blockAnswered,
      passed,
    });
    setCheckpointOpen(true);
  }, [inSet, done, blockAnswered, blockCorrect, checkpointOpen]);

  // Loading questions
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

  // Still checking access
  if (!accessChecked && !ownerOverride) {
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

  // No access => show Special Access screen
  if (!hasAccess && !ownerOverride) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Ontario G1 Practice Test</h1>
          </div>

          <div style={styles.card}>
            <p style={{ fontSize: 14, color: "#4b5563" }}>
              <strong>Special Access</strong>
            </p>

            {accessError ? (
              <p style={{ marginTop: 6, color: "#b91c1c", fontSize: 13 }}>
                {accessError}
              </p>
            ) : null}

            <form onSubmit={handleAccessSubmit}>
              <input
                type="password"
                placeholder="Password"
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
              <button style={styles.submitBtn(false)}>Use special Pass</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // No questions
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
      {checkpointOpen && (
        <CheckpointScreen
          correct={checkpointScore.correct}
          answered={checkpointScore.answered}
          passed={checkpointScore.passed}
          onContinue={() => {
            setCheckpointOpen(false);

            setBlockAnswered(0);
            setBlockCorrect(0);

            if (inSet === 40) {
              setCorrectCount(0);
            }

            if (!isLast) {
              setCurrent((p) => (p >= questions.length - 1 ? p : p + 1));
              setPicked(null);
              setDone(false);
            }
          }}
        />
      )}

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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
          {renderButtons()}
        </div>

        <div
          style={{
            ...styles.card,
            ...(cardRaised
              ? {
                  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.16)",
                  transform: "translateY(-2px)",
                }
              : {}),
          }}
          onMouseEnter={() => setCardRaised(true)}
          onMouseLeave={() => setCardRaised(false)}
        >
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${pct}%` }} />
          </div>

          <div style={styles.metaRow}>
            <span>
              Question {globalNumber} of {totalGlobal} · Set {inSet}/{inSetTotal}
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
              style={styles.submitBtn(picked === null && !done)}
              disabled={picked === null && !done}
              onClick={done ? next : submit}
            >
              {done ? (isLast ? "End of set" : "Next question") : "Submit"}
            </button>

            {done && (
              <div style={styles.explanation}>
                <strong>
                  {picked === q.correctIndex ? "Correct!" : "Not quite."}
                </strong>{" "}
                {q.explanation}
              </div>
            )}

            <div
              style={{
                marginTop: "3rem",
                textAlign: "center",
                fontSize: "0.75rem",
                color: "#666",
                letterSpacing: "0.5px",
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
