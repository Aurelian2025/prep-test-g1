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
    padding: "10px 0 6px",
    marginBottom: 10,
    borderBottom: "1px solid #dde0ff",
  },

  title: {
    fontSize: 32,
    fontWeight: 900,
    margin: 0,
    color: "#0353a4",
    textAlign: "center",
    width: "100%",
    whiteSpace: "nowrap",
  },

  modulesContainer: {
    maxHeight: 120,
    overflowY: "auto",
    marginTop: 8,
  },

  modulesRow: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    marginBottom: 6,
  },

  modulesRowBottom: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    flexWrap: "wrap",
    alignItems: "center",
  },

  smallBtn: {
    border: "none",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    whiteSpace: "nowrap",
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
   MAIN COMPONENT
========================= */
export default function PrepTestG1() {
  const supabase = useSupabaseClient();

  const [lang, setLang] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [ownerOverride, setOwnerOverride] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [authGateOpen, setAuthGateOpen] = useState(false);

  const [allQuestions, setAllQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const isFull = hasAccess || ownerOverride;

  const startByIndex = () => {}; // untouched in your original

  const start1 = () => startByIndex(0, 39, 0);
  const start41 = () => startByIndex(40, 79, 40);
  const start81 = () => startByIndex(80, 119, 80);
  const start121 = () => startByIndex(120, 159, 120);
  const start161 = () => startByIndex(160, 199, 160);
  const start201 = () => startByIndex(200, 239, 200);
  const start241 = () => startByIndex(240, 279, 240);

  const renderButtons = () => (
    <div style={styles.modulesContainer}>
      <div style={styles.modulesRow}>
        <button onClick={start1} style={{ ...styles.smallBtn, background: "#ffe6a7" }}>1–40</button>
        <button onClick={start41} style={{ ...styles.smallBtn, background: "#ffd5f2" }}>41–80</button>
        <button onClick={start81} style={{ ...styles.smallBtn, background: "#e0c3ff" }}>81–120</button>
        <button onClick={start121} style={{ ...styles.smallBtn, background: "#c1ffd7" }}>121–160</button>
      </div>

      <div style={styles.modulesRowBottom}>
        <button onClick={start161} style={{ ...styles.smallBtn, background: "#b3e6ff" }}>161–200</button>
        <button onClick={start201} style={{ ...styles.smallBtn, background: "#d4c4ff" }}>201–240</button>
        <button onClick={start241} style={{ ...styles.smallBtn, background: "#baf2ff" }}>241–280</button>

        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="" disabled>Language</option>
          {LANGUAGES.filter((l) => l.code !== "").map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>

        {isFull ? (
          <button onClick={() => {}}>Sign out</button>
        ) : (
          <button onClick={() => {}}>Login</button>
        )}
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
          <div style={styles.metaRow}>
            <span>Question</span>
            <span>Correct: {correctCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
