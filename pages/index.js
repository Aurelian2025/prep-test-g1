// pages/index.js
import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

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
  },
  title: {
    fontSize: "clamp(20px, 5vw, 32px)",
    fontWeight: 900,
    margin: 0,
    color: "#0353a4",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  moduleScroll: {
    overflowX: "auto",
    paddingBottom: 8,
  },
  moduleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(110px, 1fr))",
    gap: 8,
    minWidth: 480,
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

/* =========================
   CONSTANTS
========================= */
const ACCESS_STORAGE_KEY = "g1_access_key";
const LANGUAGE_STORAGE_KEY = "g1_lang";
const PREVIEW_COUNT = 20;
const OWNER_PASSWORD = "Lucas1";

/* =========================
   LANGUAGE CONFIG
========================= */
const LANGUAGES = [
  { code: "", label: "Choose Language", file: "/questions.json" },
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

  const correctLetter = raw?.correct ?? raw?.Correct ?? raw?.answer ?? raw?.Answer;

  if (
    (correctIndex === undefined || correctIndex === null) &&
    typeof correctLetter === "string"
  ) {
    const up = correctLetter.trim().toUpperCase();
    const idx = "ABCD".indexOf(up);
    if (idx >= 0) correctIndex = idx;
  }

  if (
    (correctIndex === undefined || correctIndex === null) &&
    typeof correctLetter === "number"
  ) {
    if (correctLetter >= 1 && correctLetter <= 4)
      correctIndex = correctLetter - 1;
    if (correctLetter >= 0 && correctLetter <= 3)
      correctIndex = correctLetter;
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
  if (typeof correctIndex !== "number") return null;

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
   MAIN COMPONENT
========================= */
export default function PrepTestG1() {
  const supabase = useSupabaseClient();

  const [lang, setLang] = useState("");
  const [allQuestions, setAllQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const effectiveLang = lang || "en";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved) setLang(saved);
    } catch (_) {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cfg = getLangConfig(effectiveLang);

    (async () => {
      try {
        const r = await fetch(cfg.file);
        const data = await r.json();
        if (cancelled) return;

        const normalized = data.map(normalizeQuestion).filter(Boolean);
        const ordered = normalized.map(shuffleQuestionChoices);

        setAllQuestions(ordered);
        setQuestions(ordered.slice(0, 40));
      } catch (_) {
        setAllQuestions([]);
        setQuestions([]);
      }
    })();

    return () => (cancelled = true);
  }, [effectiveLang]);

  const q = questions[current];
  const pct = questions.length
    ? ((current + 1) / questions.length) * 100
    : 0;

  const submit = () => {
    if (!q || picked === null || done) return;
    if (picked === q.correctIndex) setCorrectCount((c) => c + 1);
    setDone(true);
  };

  const next = () => {
    setCurrent((p) => (p >= questions.length - 1 ? p : p + 1));
    setPicked(null);
    setDone(false);
  };

  const startByIndex = (startIdx, endIdx) => {
    const subset = allQuestions.slice(startIdx, endIdx + 1);
    setQuestions(subset);
    setCurrent(0);
    setPicked(null);
    setDone(false);
    setCorrectCount(0);
  };

  const renderButtons = () => (
    <div style={styles.moduleScroll}>
      <div style={styles.moduleGrid}>
        <button onClick={() => startByIndex(0, 39)} style={{ ...styles.btn, background: "#ffe6a7" }}>
          Start 1–40
        </button>
        <button onClick={() => startByIndex(40, 79)} style={{ ...styles.btn, background: "#ffd5f2" }}>
          Start 41–80
        </button>
        <button onClick={() => startByIndex(80, 119)} style={{ ...styles.btn, background: "#e0c3ff" }}>
          Start 81–120
        </button>
        <button onClick={() => startByIndex(120, 159)} style={{ ...styles.btn, background: "#c1ffd7" }}>
          Start 121–160
        </button>
        <button onClick={() => startByIndex(160, 199)} style={{ ...styles.btn, background: "#b3e6ff" }}>
          Start 161–200
        </button>
        <button onClick={() => startByIndex(200, 239)} style={{ ...styles.btn, background: "#d4c4ff" }}>
          Start 201–240
        </button>
        <button onClick={() => startByIndex(240, 279)} style={{ ...styles.btn, background: "#baf2ff" }}>
          Start 241–280
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Ontario G1 Practice Test</h1>
          {renderButtons()}
        </div>

        <div style={styles.card}>
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${pct}%` }} />
          </div>

          <div style={styles.metaRow}>
            <span>
              Question {current + 1} / {questions.length}
            </span>
            <span>Correct: {correctCount}</span>
          </div>

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
