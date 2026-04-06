// pages/index.js
import { useEffect, useState } from "react";
import { useSupabase } from "../lib/SupabaseContext";

/* =========================
   STYLES
========================= */
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
    textAlign: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: 900,
    margin: 0,
    color: "#0353a4",
    whiteSpace: "nowrap",
  },

  // Collapsible controls block (the 7 buttons + language/login)
  headerControlsWrap: (hidden) => ({
  transform: hidden ? "translateY(-12px)" : "translateY(0)",
  opacity: hidden ? 0 : 1,
  pointerEvents: hidden ? "none" : "auto",
  maxHeight: hidden ? 0 : 260, // keep to actually collapse space
  overflow: "hidden",
  transition: "max-height 180ms ease, opacity 140ms ease, transform 180ms ease",
  willChange: "max-height, transform, opacity",
}),

  scrollRow: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    padding: "6px 0",
    marginTop: 8,
  },
  centerRow: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 0",
    marginTop: 6,
    flexWrap: "wrap",
  },
  btn: {
    border: "none",
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
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
  img: { maxWidth: 200, maxHeight: 160 },

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

/* =========================
   CONSTANTS
========================= */
const LANGUAGE_STORAGE_KEY = "g1_lang";
const PREVIEW_COUNT = 20;

/* =========================
   LANGUAGE CONFIG
========================= */
const LANGUAGES = [
  { code: "", label: "Choose Language", file: "/questions.json" }, // placeholder
  { code: "en", label: "English", file: "/questions.json" },
  { code: "fr", label: "French", file: "/questions_fr.json" },
  { code: "zh", label: "Chinese", file: "/questions_zh.json" },
  { code: "pa", label: "Punjabi", file: "/questions_pa.json" },
  { code: "es", label: "Spanish", file: "/questions_es.json" },
  { code: "ru", label: "Russian", file: "/questions_ru.json" },
  { code: "hi", label: "Hindi", file: "/questions_hi.json" },
  { code: "ar", label: "Arabic", file: "/questions_ar.json" },
  { code: "ur", label: "Urdu", file: "/questions_ur.json" },
  { code: "fa", label: "Persian (Farsi)", file: "/questions_fa.json" },
];

function getLangConfig(code) {
  const effective = code || "en";
  return LANGUAGES.find((l) => l.code === effective) || LANGUAGES[1];
}

/* =========================
   HELPERS
========================= */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeQuestion(raw) {
  const question =
    raw?.question ?? raw?.q ?? raw?.prompt ?? raw?.text ?? raw?.Question;

  const choices =
    raw?.choices ??
    raw?.options ??
    raw?.answers ??
    raw?.Choices ??
    raw?.Options ??
    raw?.Answers;

  let correctIndex =
    raw?.correctIndex ??
    raw?.correct_index ??
    raw?.answerIndex ??
    raw?.answer_index ??
    raw?.correctAnswerIndex ??
    raw?.correct_answer_index ??
    raw?.CorrectIndex ??
    raw?.AnswerIndex;

  const correctLetter =
    raw?.correct ?? raw?.Correct ?? raw?.answer ?? raw?.Answer;
  if (
    (correctIndex === undefined || correctIndex === null) &&
    typeof correctLetter === "string"
  ) {
    const up = correctLetter.trim().toUpperCase();
    if (up.length === 1) {
      const idx = "ABCD".indexOf(up);
      if (idx >= 0) correctIndex = idx;
    }
  }

  if (
    (correctIndex === undefined || correctIndex === null) &&
    typeof correctLetter === "number"
  ) {
    if (correctLetter >= 1 && correctLetter <= 4) correctIndex = correctLetter - 1;
    if (correctLetter >= 0 && correctLetter <= 3) correctIndex = correctLetter;
  }

  const explanation =
    raw?.explanation ??
    raw?.rationale ??
    raw?.why ??
    raw?.Explanation ??
    raw?.Rationale ??
    raw?.Why ??
    "";

  const image = raw?.image ?? raw?.img ?? raw?.Image ?? raw?.Img ?? null;

  if (!question || !Array.isArray(choices) || choices.length < 2) return null;
  if (
    typeof correctIndex !== "number" ||
    correctIndex < 0 ||
    correctIndex >= choices.length
  )
    return null;

  return { question, choices, correctIndex, explanation, image };
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

/* =========================
   CHECKPOINT OVERLAY
========================= */
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

/* =========================
   MAIN COMPONENT
========================= */
export default function PrepTestG1() {
  const supabase = useSupabase();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const [lang, setLang] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  // hide/show the header controls based on scroll direction
  const [hideHeaderControls, setHideHeaderControls] = useState(false);

  // quiz
  const [allQuestions, setAllQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const [blockAnswered, setBlockAnswered] = useState(0);
  const [blockCorrect, setBlockCorrect] = useState(0);

  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [checkpointScore, setCheckpointScore] = useState({
    correct: 0,
    answered: 0,
    passed: false,
  });

  const [globalBase, setGlobalBase] = useState(0);
  const [globalTotal, setGlobalTotal] = useState(0);

  const isPreview = !hasAccess;
  const isFull = hasAccess;

  const effectiveLang = lang || "en";

  /* =========================
     INIT LANGUAGE
  ========================= */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved) setLang(saved);
    } catch (_) {}
  }, []);

  /* =========================
     HIDE/SHOW HEADER CONTROLS ON SCROLL
  ========================= */
  useEffect(() => {
  let lastY = window.scrollY || 0;
  let ticking = false;

  const update = () => {
    const y = window.scrollY || 0;
    const delta = y - lastY;

    // Don't hide when near the very top (prevents flicker/bounce issues)
    if (y < 30) {
      if (hideHeaderControls) setHideHeaderControls(false);
      lastY = y;
      ticking = false;
      return;
    }

    // Larger thresholds = less flicker
    if (delta > 20) {
      // scrolling down
      if (!hideHeaderControls) setHideHeaderControls(true);
    } else if (delta < -20) {
      // scrolling up
      if (hideHeaderControls) setHideHeaderControls(false);
    }

    lastY = y;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, [hideHeaderControls]);

  const handleLangChange = (e) => {
    const code = e.target.value;

    setLang(code);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch (_) {}

    setAllQuestions(null);
    setQuestions([]);
    setCurrent(0);
    setPicked(null);
    setDone(false);
    setCorrectCount(0);
    setBlockAnswered(0);
    setBlockCorrect(0);
    setCheckpointOpen(false);
    setCheckpointScore({ correct: 0, answered: 0, passed: false });
    setGlobalBase(0);
  };

  /* =========================
     LOAD QUESTIONS
  ========================= */
  useEffect(() => {
    let cancelled = false;
    const cfg = getLangConfig(effectiveLang);

    (async () => {
      try {
        const url = `${cfg.file}?v=${Date.now()}`;
        const r = await fetch(url, { cache: "no-store" });
        const data = await r.json();

        if (cancelled) return;

        if (!Array.isArray(data)) {
          setAllQuestions([]);
          setQuestions([]);
          setGlobalTotal(0);
          return;
        }

        const normalized = data.map(normalizeQuestion).filter(Boolean);
        const ordered = normalized.map(shuffleQuestionChoices);

        setAllQuestions(ordered);
        setQuestions(ordered.slice(0, 40));
        setGlobalTotal(ordered.length);
        setGlobalBase(0);
      } catch (_) {
        if (cancelled) return;
        setAllQuestions([]);
        setQuestions([]);
        setGlobalTotal(0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [effectiveLang]);

  const hasQuestionsFlag = questions.length > 0;

  /* =========================
     ACCESS: check Supabase profile subscription
  ========================= */
  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        if (!user?.id) {
          if (!cancelled) setHasAccess(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_subscribed,subscription_status")
          .eq("id", user.id)
          .maybeSingle();

        if (error || !profile) {
          if (!cancelled) setHasAccess(false);
          return;
        }

        const active =
          !!profile.is_subscribed ||
          profile.subscription_status === "ACTIVE" ||
          profile.subscription_status === "active";

        if (!cancelled) setHasAccess(active);
      } catch (_) {
        if (!cancelled) setHasAccess(false);
      }
    }

    checkAccess();
    return () => {
      cancelled = true;
    };
  }, [user?.id, supabase]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    setHasAccess(false);
  }

  /* =========================
     QUIZ LOGIC
  ========================= */
  let safeIndex = current;
  if (hasQuestionsFlag) {
    if (safeIndex < 0) safeIndex = 0;
    if (safeIndex >= questions.length) safeIndex = questions.length - 1;
  } else {
    safeIndex = 0;
  }

  const q = hasQuestionsFlag ? questions[safeIndex] : null;
  const isLast = hasQuestionsFlag && safeIndex === questions.length - 1;

  const inSet = hasQuestionsFlag ? safeIndex + 1 : 0;
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

    // If still in preview, starting any set beyond free flow sends to subscribe
    if (isPreview) {
      window.location.href = "/subscribe";
      return;
    }

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
    setCheckpointScore({ correct: 0, answered: 0, passed: false });
  };

  const start1 = () => startByIndex(0, 39, 0);
  const start41 = () => startByIndex(40, 79, 40);
  const start81 = () => startByIndex(80, 119, 80);
  const start121 = () => startByIndex(120, 159, 120);
  const start161 = () => startByIndex(160, 199, 160);
  const start201 = () => startByIndex(200, 239, 200);
  const start241 = () => startByIndex(240, 279, 240);

  const renderButtons = () => (
    <>
      {/* ROW 1 */}
      <div style={styles.scrollRow}>
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
      </div>

      {/* ROW 2 */}
      <div style={styles.scrollRow}>
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

      {/* ROW 3 */}
      <div style={styles.centerRow}>
        <select value={lang} onChange={handleLangChange}>
          <option value="" disabled>
            Choose Language
          </option>
          {LANGUAGES.filter((l) => l.code !== "").map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        {isFull ? (
          <button onClick={handleLogout}>Sign out</button>
        ) : (
          <button
            onClick={() => (window.location.href = "/login?next=/subscribe")}
          >
            Login
          </button>
        )}
      </div>
    </>
  );

  /* =========================
     CHECKPOINTS
  ========================= */
  useEffect(() => {
    if (!isPreview) return;
    if (checkpointOpen) return;
    if (!done) return;

    const isPreviewEnd = inSet === PREVIEW_COUNT;
    if (!isPreviewEnd) return;
    if (blockAnswered < PREVIEW_COUNT) return;

    // Immediate redirect to subscribe (no password gate)
    window.location.href = "/subscribe";
  }, [isPreview, checkpointOpen, done, inSet, blockAnswered]);

  useEffect(() => {
    if (isPreview) return;
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
  }, [isPreview, inSet, done, blockAnswered, blockCorrect, checkpointOpen]);

  /* =========================
     RENDERS
  ========================= */
  if (!allQuestions) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Ontario G1 Practice Test</h1>

            <div style={styles.headerControlsWrap(hideHeaderControls)}>
              {renderButtons()}
            </div>
          </div>

          <div style={styles.card}>
            <p>Loading questions…</p>
          </div>
        </div>
      </div>
    );
  }

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
            if (!isLast) {
              setCurrent((p) => (p >= questions.length - 1 ? p : p + 1));
              setPicked(null);
              setDone(false);
            }
          }}
        />
      )}

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Ontario G1 Practice Test</h1>

          <div style={styles.headerControlsWrap(hideHeaderControls)}>
            {renderButtons()}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${pct}%` }} />
          </div>

          <div style={styles.metaRow}>
            <span>
              Question {globalNumber} of {totalGlobal} · Set {inSet}/{inSetTotal}
            </span>
            <span>Correct: {correctCount}</span>
          </div>

          <div key={globalNumber}>
            <div style={styles.promptArea}>
              {q?.image && (
                <div style={styles.imgWrap}>
                  <img src={q.image} style={styles.img} alt="img" />
                </div>
              )}
              <div style={styles.questionText}>{q?.question}</div>
            </div>

            <ul style={styles.choices}>
              {q?.choices?.map((c, idx) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
