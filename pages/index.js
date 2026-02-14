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

const ACCESS_STORAGE_KEY = "g1_access_key";

export default function PrepTestG1() {
  const supabase = useSupabaseClient();

  const OWNER_PASSWORD = "Lucas1";

  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [ownerOverride, setOwnerOverride] = useState(false);
  const [accessError, setAccessError] = useState("");

  // PREVIEW MODE
  const PREVIEW_COUNT = 20;
  const [previewDone, setPreviewDone] = useState(false);
  const isPreview = !hasAccess && !ownerOverride && !previewDone;

  const [allQuestions, setAllQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);

  // LOAD QUESTIONS
  useEffect(() => {
    fetch("/questions.json")
      .then((r) => r.json())
      .then((data) => {
        const ordered = data.map(shuffleQuestionChoices);
        setAllQuestions(ordered);
      });
  }, []);

  // PREVIEW SETUP
  useEffect(() => {
    if (!allQuestions) return;

    if (isPreview) {
      const subset = allQuestions.slice(0, PREVIEW_COUNT);
      setQuestions(subset);
    } else {
      const subset = allQuestions.slice(0, 40);
      setQuestions(subset);
    }

    setCurrent(0);
    setPicked(null);
    setDone(false);
  }, [allQuestions, isPreview]);

  async function validateKeyAgainstSupabase(accessKey) {
    const { data } = await supabase
      .from("access_keys")
      .select("*")
      .eq("key", accessKey)
      .maybeSingle();

    if (!data) return { ok: false };

    const expired =
      !data.expires_at || new Date(data.expires_at).getTime() <= Date.now();
    if (expired) return { ok: false };

    return { ok: true };
  }

  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    const entered = passwordInput.trim();

    if (entered === OWNER_PASSWORD) {
      setOwnerOverride(true);
      setHasAccess(true);
      setAccessChecked(true);
      setPreviewDone(true);
      return;
    }

    const result = await validateKeyAgainstSupabase(entered);
    if (!result.ok) {
      setAccessError("Incorrect password.");
      return;
    }

    localStorage.setItem(ACCESS_STORAGE_KEY, entered);
    setHasAccess(true);
    setAccessChecked(true);
    setPreviewDone(true);
  };

  // CHECK ACCESS
  useEffect(() => {
    const saved = localStorage.getItem(ACCESS_STORAGE_KEY);
    if (!saved) {
      setAccessChecked(true);
      return;
    }

    validateKeyAgainstSupabase(saved).then((res) => {
      if (res.ok) {
        setHasAccess(true);
        setPreviewDone(true);
      }
      setAccessChecked(true);
    });
  }, []);

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const submit = () => {
    if (picked === null) return;
    setDone(true);
  };

  const next = () => {
    if (isPreview && isLast) {
      setPreviewDone(true);
      return;
    }

    setCurrent((c) => c + 1);
    setPicked(null);
    setDone(false);
  };

  // SHOW ACCESS SCREEN AFTER PREVIEW
  if (!hasAccess && !ownerOverride && previewDone) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <h2>Special Access</h2>
            <form onSubmit={handleAccessSubmit}>
              <input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: "100%", padding: 10 }}
              />
              <button style={{ marginTop: 10 }}>Use special Pass</button>
            </form>
            {accessError && <p>{accessError}</p>}
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
        </div>

        <div style={styles.card}>
          <div style={styles.progressOuter}>
            <div
              style={{
                ...styles.progressInner,
                width: `${((current + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <h3>{q.question}</h3>

          {q.choices.map((c, idx) => (
            <button
              key={idx}
              onClick={() => !done && setPicked(idx)}
              style={{ display: "block", margin: "6px 0", width: "100%" }}
            >
              {c}
            </button>
          ))}

          <button onClick={done ? next : submit} style={{ marginTop: 10 }}>
            {done ? (isLast ? "Continue" : "Next question") : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
