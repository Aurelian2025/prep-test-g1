import { useEffect, useState } from 'react';

const styles = {
  page: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
    marginBottom: 16
  },
  title: {
  fontSize: 32,
  fontWeight: 900,
  margin: 0,
  color: '#0353a4' // marine blue
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
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  },
  metaRow: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 16,
  fontWeight: 600,
  color: '#4c6fff', // same as Submit / Next button
  marginBottom: 12
   
},

  questionText: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10
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
    minHeight: 220, // you can tweak this number later
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: 8
   },
  
    choiceBtn: (idx, picked, correctIndex, done) => {
    let border = '#d0d0ff';
    let background = '#f8f8ff';

    if (!done) {
      // Before submitting: just highlight the selected option
      if (picked === idx) {
        border = '#4c6fff';
        background = '#e4e7ff';
      }
    } else {
      // After submitting: show green for correct, red for wrong pick
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

// Fisher–Yates shuffle
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// shuffle choices while keeping correctIndex valid
function shuffleQuestionChoices(q) {
  const indices = q.choices.map((_, i) => i);
  const shuffledIdx = shuffleArray(indices);
  const newChoices = shuffledIdx.map(i => q.choices[i]);
  const newCorrectIndex = shuffledIdx.indexOf(q.correctIndex);
  return { ...q, choices: newChoices, correctIndex: newCorrectIndex };
}

function shuffleAllQuestions(list) {
  // shuffle list order, and choices for each question
  const withShuffledChoices = list.map(shuffleQuestionChoices);
  return shuffleArray(withShuffledChoices);
}

function getNumericId(q) {
  if (!q || !q.id) return 0;
  // Some IDs contain more than one number (e.g. "20over-121")
  // We always want the LAST number = the question number.
  const matches = q.id.match(/\d+/g);
  if (!matches || matches.length === 0) return 0;
  return parseInt(matches[matches.length - 1], 10);
}

export default function PrepTestG1() {
  const [allQuestions, setAllQuestions] = useState(null);   // raw 1–200
  const [questions, setQuestions] = useState([]);           // current set (shuffled)
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // load questions.json from /public
  useEffect(() => {
    fetch('/questions.json')
      .then(res => res.json())
      .then(data => {
        setAllQuestions(data);
        // default: full pool shuffled
        setQuestions(shuffleAllQuestions(data));
      })
      .catch(err => {
        console.error('Failed to load questions.json', err);
        setAllQuestions([]);
        setQuestions([]);
      });
  }, []);

  const hasQuestions = questions && questions.length > 0;

  // clamp current index so it NEVER goes outside range
  let safeIndex = current;
  if (hasQuestions) {
    if (safeIndex < 0) safeIndex = 0;
    if (safeIndex > questions.length - 1) safeIndex = questions.length - 1;
  } else {
    safeIndex = 0;
  }

  const q = hasQuestions ? questions[safeIndex] : null;
  const isLastQuestion = hasQuestions && safeIndex === questions.length - 1;
  const globalNumber = q ? getNumericId(q) : 0;
  const totalGlobal = allQuestions ? allQuestions.length : 0;

  const submit = () => {
    if (!q || picked === null || done) return;
    const isCorrect = picked === q.correctIndex;
    if (isCorrect) {
      setCorrectCount(c => c + 1);
    }
    setDone(true);
  };

  const nextQuestion = () => {
    if (!hasQuestions) return;
    // do NOT go past last question
    setCurrent(prev => {
      if (prev >= questions.length - 1) return prev;
      return prev + 1;
    });
    setPicked(null);
    setDone(false);
  };

  // generic range starter
  const startRange = (min, max) => {
  if (!allQuestions || allQuestions.length === 0) return;

  // 1) take only questions in the numeric range
  // 2) sort them by their numeric id so they are in order (1,2,3…)
  // 3) shuffle ONLY the choices inside each question
  const orderedWithShuffledChoices = allQuestions
    .filter(one => {
      const n = getNumericId(one);
      return n >= min && n <= max;
    })
    .sort((a, b) => getNumericId(a) - getNumericId(b))
    .map(shuffleQuestionChoices);

  setQuestions(orderedWithShuffledChoices);
  setCurrent(0);
  setPicked(null);
  setDone(false);
  setCorrectCount(0);
};


  const start1to40 = () => startRange(1, 40);
  const start41to80 = () => startRange(41, 80);
  const start81to120 = () => startRange(81, 120);
  const start121to160 = () => startRange(121, 160);
  const start161to200 = () => startRange(161, 200);

  const renderButtonsRow = () => (
    <div style={styles.buttonsRow}>
      <button
        onClick={start1to40}
        style={{ ...styles.btn, background: '#ffe6a7' }}
      >
        Start 1–40
      </button>
      <button
        onClick={start41to80}
        style={{ ...styles.btn, background: '#ffd5f2' }}
      >
        Start 41–80
      </button>
      <button
        onClick={start81to120}
        style={{ ...styles.btn, background: '#e0c3ff' }}
      >
        Start 81–120
      </button>
      <button
        onClick={start121to160}
        style={{ ...styles.btn, background: '#c1ffd7' }}
      >
        Start 121–160
      </button>
      <button
        onClick={start161to200}
        style={{ ...styles.btn, background: '#b3e6ff' }}
      >
        Start 161–200
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
           
            {renderButtonsRow()}
          </div>
          <div style={styles.card}>
            <p>Loading questions…</p>
          </div>
        </div>
      </div>
    );
  }

  // no questions at all
  if (!hasQuestions) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
           <h1 style={styles.title}>Ontario G1 Practice Test</h1>
    
         {renderButtonsRow()}
          </div>
          <div style={styles.card}>
            <p>No questions available. Try starting a set above.</p>
          </div>
        </div>
      </div>
    );
  }

  // main quiz view
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
         <h1 style={styles.title}>Ontario G1 Practice Test</h1>
          
          {renderButtonsRow()}
        </div>

        <div style={styles.card}>
          <div style={styles.metaRow}>
            <span>
              Question {globalNumber} of {totalGlobal}
            </span>
            <span>Correct: {correctCount}</span>
          </div>

    <div style={styles.promptArea}>
  {q.image && (
    <div style={styles.imgWrap}>
      <img src={q.image} alt="Road sign" style={styles.img} />
    </div>
  )}

  <div style={styles.questionText}>{q.question}</div>
</div>

          <ul style={styles.choices}>
            {q.choices.map((choice, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  style={styles.choiceBtn(idx, picked, q.correctIndex, done)}
                  onClick={() => !done && setPicked(idx)}
                >
                  <strong>{String.fromCharCode(65 + idx)}.</strong>{' '}
                  {choice}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={done ? nextQuestion : submit}
            disabled={picked === null || (done && isLastQuestion)}
            style={styles.submitBtn(
              picked === null || (done && isLastQuestion)
            )}
          >
            {done
              ? isLastQuestion
                ? 'End of set'
                : 'Next question'
              : 'Submit'}
          </button>

          {done && (
            <div style={styles.explanation}>
              <strong>
                {picked === q.correctIndex ? 'Correct!' : 'Not quite.'}
              </strong>{' '}
              {q.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
