import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

const examples = [
  {
    sentence: "मैंने बाजार से आम खरीदे।",
    word: "आम"
  },
  {
    sentence: "यह आम आदमी की समस्या है।",
    word: "आम"
  },
  {
    sentence: "मुझे आज जल्दी सोना है।",
    word: "सोना"
  },
  {
    sentence: "सोना बहुत महंगा हो गया है।",
    word: "सोना"
  },
  {
    sentence: "भारत को मैच में हार मिली।",
    word: "हार"
  },
  {
    sentence: "दुल्हन ने सोने का हार पहना।",
    word: "हार"
  }
];

function App() {
  const [sentence, setSentence] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!sentence.trim() || !target.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sentence,
            target_word: target
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Prediction failed"
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
        "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function useExample(example) {
    setSentence(example.sentence);
    setTarget(example.word);
    setResult(null);
    setError("");
  }

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-mark">
            हि
          </div>
          <div>
            <div className="brand-name">
              Hindi WSD
            </div>
            <div className="brand-subtitle">
              Context-Aware Sense Detection
            </div>
          </div>
        </div>

        <div className="method-pill">
          <span></span>
          Lesk + Naive Bayes
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="eyebrow">
            NLP MINI PROJECT · WORD SENSE DISAMBIGUATION
          </div>

          <h1>
            One word.
            <br />
            <span>
              Multiple meanings.
            </span>
          </h1>

          <p>
            Give the system a Hindi sentence and see
            how context determines the intended meaning
            of an ambiguous word.
          </p>
        </section>

        {/* WORKSPACE */}
        <section className="workspace">
          {/* INPUT */}
          <div className="input-card">
            <div className="card-header">
              <div>
                <div className="card-kicker">
                  INPUT SENTENCE
                </div>
                <h2>
                  Analyze Hindi context
                </h2>
              </div>

              <div className="language-badge">
                हिन्दी
              </div>
            </div>

            <textarea
              value={sentence}
              onChange={(e) =>
                setSentence(e.target.value)
              }
              placeholder="उदाहरण: मैंने बाजार से आम खरीदे।"
              rows={5}
            />

            <div className="input-footer">
              <div className="target-input">
                <label>
                  Ambiguous word
                </label>
                <input
                  value={target}
                  onChange={(e) =>
                    setTarget(e.target.value)
                  }
                  placeholder="आम"
                />
              </div>

              <button
                className="analyze-button"
                onClick={analyze}
                disabled={
                  loading ||
                  !sentence.trim() ||
                  !target.trim()
                }
              >
                {loading
                  ? "Analyzing..."
                  : "Analyze context →"}
              </button>
            </div>

            {error && (
              <div className="error">
                {error}
              </div>
            )}
          </div>

          {/* EXAMPLES */}
          <div className="examples-section">
            <div className="section-label">
              TRY AN EXAMPLE
            </div>

            <div className="examples">
              {examples.map(
                (example, index) => (
                  <button
                    className="example-chip"
                    key={index}
                    onClick={() =>
                      useExample(example)
                    }
                  >
                    <span>
                      {example.word}
                    </span>
                    {example.sentence}
                  </button>
                )
              )}
            </div>
          </div>

          {/* RESULTS */}
          {result && (
            <section className="results">
              <div className="results-heading">
                <div>
                  <div className="card-kicker">
                    ANALYSIS RESULT
                  </div>
                  <h2>
                    Sense detected for{" "}
                    <span className="highlight">
                      {result.target_word}
                    </span>
                  </h2>
                </div>

                <div className="sentence-preview">
                  {result.sentence}
                </div>
              </div>

              <div className="method-grid">
                <MethodCard
                  title="Simplified Lesk"
                  subtitle="Knowledge-based"
                  sense={result.lesk.sense}
                  detail={
                    `${result.lesk.overlap} overlapping word` +
                    (result.lesk.overlap === 1
                      ? ""
                      : "s")
                  }
                  description={
                    "Chooses the sense whose " +
                    "dictionary gloss and examples " +
                    "share the most words with the sentence."
                  }
                />

                <MethodCard
                  title="Naive Bayes"
                  subtitle="Supervised"
                  sense={
                    result.naive_bayes.sense
                  }
                  detail={
                    `${(
                      result.naive_bayes.probability * 100
                    ).toFixed(1)}% confidence`
                  }
                  description={
                    "Learns which context words are " +
                    "associated with each sense from " +
                    "the labelled training dataset."
                  }
                  winner
                />
              </div>

              <div className="comparison">
                <div className="comparison-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Both methods analyzed the same context
                  </strong>
                  <p>
                    The result compares a knowledge-based
                    method with a supervised model.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* EMPTY STATE */}
          {!result && !loading && (
            <section className="empty-state">
              <div className="empty-icon">
                W
              </div>
              <h3>
                Ready to disambiguate
              </h3>
              <p>
                Enter a Hindi sentence above and choose
                the ambiguous word you want to analyze.
              </p>
            </section>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div>
          <strong>
            Hindi WSD
          </strong>
          <span> · </span>
          Lesk + Naive Bayes
        </div>

        <div>
          NLP Mini Project · 2026
        </div>
      </footer>
    </div>
  );
}

function MethodCard({
  title,
  subtitle,
  sense,
  detail,
  description,
  winner
}) {
  return (
    <div
      className={
        `method-card ${winner ? "winner" : ""}`
      }
    >
      <div className="method-top">
        <div>
          <div className="method-title">
            {title}
          </div>
          <div className="method-subtitle">
            {subtitle}
          </div>
        </div>

        {winner && (
          <div className="winner-badge">
            MODEL
          </div>
        )}
      </div>

      <div className="prediction">
        <div className="prediction-label">
          PREDICTED SENSE
        </div>

        <div className="sense">
          {sense}
        </div>

        <div className="confidence">
          {detail}
        </div>
      </div>

      <p className="method-description">
        {description}
      </p>
    </div>
  );
}

export default App;
