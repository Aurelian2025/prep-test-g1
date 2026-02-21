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
    fontSize: "clamp(20px, 5vw, 30px)",
    fontWeight: 900,
    margin: "0 0 6px 0",
    color: "#0353a4",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  moduleWrapper: {
    overflowX: "auto",
  },

  moduleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(90px, 1fr))",
    gap: 6,
    minWidth: 520,
    alignItems: "center",
  },

  moduleGridRow2: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(90px, 1fr))",
    gap: 6,
    marginTop: 6,
    minWidth: 520,
    alignItems: "center",
  },

  btn: {
    border: "none",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    height: 28,
    whiteSpace: "nowrap",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  select: {
    height: 28,
    borderRadius: 999,
    border: "1px solid #ccc",
    padding: "0 8px",
    fontSize: 12,
  },

  smallBtn: {
    height: 28,
    borderRadius: 999,
    border: "none",
    padding: "0 10px",
    fontSize: 12,
    cursor: "pointer",
    background: "#4c6fff",
    color: "#fff",
  },

  card: {
    marginTop: 16,
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
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

    if (!done && picked === idx) {
      border = "#4c6fff";
      background = "#e4e7ff";
    }

    if (done) {
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
};

/* =========================
   CONSTANTS
========================= */
const LANGUAGE_STORAGE_KEY = "g1_lang";

/* =========================
   LANGUAGES
========================= */
const LANGUAGES = [
  { code: "", label: "Choose Language", file: "/questions.json" },
  { code: "en", label: "English", file: "/questions.json" },
  { code: "fr", label: "French", file: "/questions_fr.json" },
];

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
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved) setLang(saved);
  }, []);

  useEffect(() => {
    fetch("/questions.json")
      .then((r) => r.json())
      .then((data) => {
        setAllQuestions(data);
        setQuestions(data.slice(0, 40));
      });
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

  const start = (s, e) => {
    const subset = allQuestions.slice(s, e);
    setQuestions(subset);
    setCurrent(0);
    setPicked(null);
    setDone(false);
    setCorrectCount(0);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Ontario G1 Practice Test</h1>

          <div style={styles.moduleWrapper}>
            {/* ROW 1 */}
            <div style={styles.moduleGrid}>
              <button style={{ ...styles.btn, background: "#ffe6a7" }} onClick={() => start(0, 40)}>1–40</button>
              <button style={{ ...styles.btn, background: "#ffd5f2" }} onClick={() => start(40, 80)}>41–80</button>
              <button style={{ ...styles.btn, background: "#e0c3ff" }} onClick={() => start(80, 120)}>81–120</button>
              <button style={{ ...styles.btn, background: "#c1ffd7" }} onClick={() => start(120, 160)}>121–160</button>
            </div>

            {/* ROW 2 */}
            <div style={styles.moduleGridRow2}>
              <button style={{ ...styles.btn, background: "#b3e6ff" }} onClick={() => start(160, 200)}>161–200</button>
              <button style={{ ...styles.btn, background: "#d4c4ff" }} onClick={() => start(200, 240)}>201–240</button>
              <button style={{ ...styles.btn, background: "#baf2ff" }} onClick={() => start(240, 280)}>241–280</button>

              <select style={styles.select} value={lang} onChange={(e)=>setLang(e.target.value)}>
                {LANGUAGES.map(l=>(
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>

              <button style={styles.smallBtn}>Login</button>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${pct}%` }} />
          </div>

          <div style={styles.metaRow}>
            <span>Question {current + 1} / {questions.length}</span>
            <span>Correct: {correctCount}</span>
          </div>

          <div style={styles.questionText}>{q?.question}</div>

          <ul style={styles.choices}>
            {q?.choices?.map((c, idx) => (
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
        </div>
      </div>
    </div>
  );
}
