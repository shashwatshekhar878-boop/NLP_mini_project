import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// Load Real Data from Filesystem (data/ directory)
// -------------------------------------------------------------
const DATA_DIR = path.resolve(process.cwd(), "data");
const RESULTS_DIR = path.resolve(process.cwd(), "results");

interface SenseInfo {
  label: string;
  meaning_en: string;
  gloss_hi: string;
  examples: string[];
}

interface SensesDictionary {
  [word: string]: {
    sense_1: SenseInfo;
    sense_2: SenseInfo;
  };
}

const SENSES: SensesDictionary = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "senses.json"), "utf-8")
);

const STOPWORDS: Set<string> = new Set(
  fs
    .readFileSync(path.join(DATA_DIR, "stopwords.txt"), "utf-8")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
);

interface DatasetRow {
  sentence: string;
  target_word: string;
  sense: string;
}

function loadDataset(): DatasetRow[] {
  const content = fs.readFileSync(path.join(DATA_DIR, "dataset.csv"), "utf-8");
  const lines = content.split("\n").filter(Boolean);
  const rows: DatasetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length >= 3) {
      rows.push({
        sentence: parts[0].trim(),
        target_word: parts[1].trim(),
        sense: parts[2].trim(),
      });
    }
  }
  return rows;
}

const DATASET = loadDataset();

// -------------------------------------------------------------
// Core NLP Preprocessing & Context Window
// -------------------------------------------------------------

function preprocess(sentence: string): string[] {
  const cleaned = sentence.replace(/[।,!?;:"'()\[\]{}]/g, " ");
  const tokens = cleaned.trim().split(/\s+/).filter(Boolean);
  return tokens.filter((token) => !STOPWORDS.has(token));
}

function contextWindow(sentence: string, target: string, k: number = 4): string {
  const tokens = preprocess(sentence);
  const index = tokens.indexOf(target);

  if (index === -1) {
    return tokens.join(" ");
  }

  const left = tokens.slice(Math.max(0, index - k), index);
  const right = tokens.slice(index + 1, index + 1 + k);
  return [...left, ...right].join(" ");
}

// -------------------------------------------------------------
// Simplified Lesk Algorithm (Knowledge-Based)
// -------------------------------------------------------------

function lesk(targetWord: string, sentence: string): { sense: string; overlap: number } {
  const context = new Set(preprocess(sentence));
  context.delete(targetWord);

  const wordEntry = SENSES[targetWord];
  if (!wordEntry) {
    throw new Error(`Unsupported target word: ${targetWord}`);
  }

  let bestSense = "";
  let bestOverlap = -1;

  for (const sense of Object.values(wordEntry)) {
    const signatureText = sense.gloss_hi + " " + sense.examples.join(" ");
    const signature = new Set(preprocess(signatureText));

    let overlap = 0;
    for (const tok of context) {
      if (signature.has(tok)) {
        overlap++;
      }
    }

    if (overlap > bestOverlap) {
      bestSense = sense.label;
      bestOverlap = overlap;
    }
  }

  return {
    sense: bestSense,
    overlap: Math.max(0, bestOverlap),
  };
}

// -------------------------------------------------------------
// Train Multinomial Naive Bayes Models on dataset.csv
// -------------------------------------------------------------

interface WordNBModel {
  classes: string[];
  classDocCounts: Record<string, number>;
  totalDocs: number;
  wordCountsPerClass: Record<string, Record<string, number>>;
  totalWordsPerClass: Record<string, number>;
  vocab: Set<string>;
}

const nbModels: Record<string, WordNBModel> = {};

function trainNBModels(): void {
  // Group dataset rows by target word
  const grouped: Record<string, DatasetRow[]> = {};
  for (const row of DATASET) {
    if (!grouped[row.target_word]) {
      grouped[row.target_word] = [];
    }
    grouped[row.target_word].push(row);
  }

  for (const [word, rows] of Object.entries(grouped)) {
    const classes = Array.from(new Set(rows.map((r) => r.sense))).sort();
    const classDocCounts: Record<string, number> = {};
    const wordCountsPerClass: Record<string, Record<string, number>> = {};
    const totalWordsPerClass: Record<string, number> = {};
    const vocab = new Set<string>();

    for (const c of classes) {
      classDocCounts[c] = 0;
      wordCountsPerClass[c] = {};
      totalWordsPerClass[c] = 0;
    }

    for (const r of rows) {
      classDocCounts[r.sense]++;
      const cWindow = contextWindow(r.sentence, word, 4);
      const tokens = cWindow.split(/\s+/).filter(Boolean);

      for (const tok of tokens) {
        vocab.add(tok);
        wordCountsPerClass[r.sense][tok] = (wordCountsPerClass[r.sense][tok] || 0) + 1;
        totalWordsPerClass[r.sense]++;
      }
    }

    nbModels[word] = {
      classes,
      classDocCounts,
      totalDocs: rows.length,
      wordCountsPerClass,
      totalWordsPerClass,
      vocab,
    };
  }

  console.log(`[Backend WSD] Trained Naive Bayes classifiers for ${Object.keys(nbModels).length} words across ${DATASET.length} sentences.`);
}

trainNBModels();

// -------------------------------------------------------------
// Naive Bayes Prediction (Supervised Inference)
// -------------------------------------------------------------

function naiveBayes(
  targetWord: string,
  sentence: string
): { sense: string; probability: number } {
  const model = nbModels[targetWord];
  if (!model) {
    throw new Error(`Unsupported target word: ${targetWord}`);
  }

  const cWindow = contextWindow(sentence, targetWord, 4);
  const contextTokens = cWindow.split(/\s+/).filter(Boolean);
  const vocabSize = model.vocab.size;

  const logScores: Record<string, number> = {};

  for (const c of model.classes) {
    // Log prior P(c)
    const prior = Math.log(model.classDocCounts[c] / model.totalDocs);
    let logLikelihood = prior;

    const denom = model.totalWordsPerClass[c] + vocabSize;

    // Log likelihood sum with Laplace smoothing (alpha = 1.0)
    for (const tok of contextTokens) {
      const count = model.wordCountsPerClass[c]?.[tok] || 0;
      const prob = (count + 1) / denom;
      logLikelihood += Math.log(prob);
    }

    logScores[c] = logLikelihood;
  }

  // Softmax normalization for numerical stability
  const maxLog = Math.max(...Object.values(logScores));
  let sumExp = 0;
  const expScores: Record<string, number> = {};

  for (const c of model.classes) {
    const expVal = Math.exp(logScores[c] - maxLog);
    expScores[c] = expVal;
    sumExp += expVal;
  }

  let bestSense = model.classes[0];
  let maxProb = -1;

  for (const c of model.classes) {
    const prob = expScores[c] / sumExp;
    if (prob > maxProb) {
      maxProb = prob;
      bestSense = c;
    }
  }

  return {
    sense: bestSense,
    probability: Number(maxProb.toFixed(4)),
  };
}

// -------------------------------------------------------------
// Combined Predict Function
// -------------------------------------------------------------

function predict(sentence: string, targetWord: string) {
  if (!SENSES[targetWord]) {
    throw new Error(`Unsupported target word: ${targetWord}`);
  }

  const leskRes = lesk(targetWord, sentence);
  const nbRes = naiveBayes(targetWord, sentence);

  return {
    target_word: targetWord,
    sentence,
    lesk: {
      sense: leskRes.sense,
      overlap: leskRes.overlap,
    },
    naive_bayes: {
      sense: nbRes.sense,
      probability: nbRes.probability,
    },
  };
}

// -------------------------------------------------------------
// Backend API Endpoints
// -------------------------------------------------------------

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Hindi WSD Backend API is running" });
});

// The core /predict endpoint requested by user specification
app.post("/predict", (req: Request, res: Response) => {
  const { sentence, target_word } = req.body;

  if (!sentence || typeof sentence !== "string" || !sentence.trim()) {
    res.status(400).json({ detail: "Field 'sentence' is required and must be non-empty." });
    return;
  }

  if (!target_word || typeof target_word !== "string" || !target_word.trim()) {
    res.status(400).json({ detail: "Field 'target_word' is required and must be non-empty." });
    return;
  }

  const word = target_word.trim();
  const sent = sentence.trim();

  if (!SENSES[word]) {
    res.status(400).json({
      detail: `Unsupported target word: '${word}'. Supported words: ${Object.keys(SENSES).join(", ")}`,
    });
    return;
  }

  try {
    const result = predict(sent, word);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Inference failure";
    res.status(500).json({ detail: msg });
  }
});

// Expose Senses dictionary from filesystem
app.get("/api/senses", (_req: Request, res: Response) => {
  res.json(SENSES);
});

// Expose full 540 rows dataset from filesystem
app.get("/api/dataset", (_req: Request, res: Response) => {
  res.json(DATASET);
});

// Expose evaluation metrics from filesystem
app.get("/api/evaluation", (_req: Request, res: Response) => {
  const evalPath = path.join(RESULTS_DIR, "evaluation.csv");
  if (fs.existsSync(evalPath)) {
    const content = fs.readFileSync(evalPath, "utf-8");
    const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
    const rows = lines.slice(1).map((l) => {
      const parts = l.split(",").map((p) => p.trim());
      const [word, test_sentences, baseline_accuracy, lesk_accuracy, naive_bayes_accuracy] = parts;
      return {
        word,
        test_sentences: Number(test_sentences),
        baseline_accuracy,
        lesk_accuracy,
        naive_bayes_accuracy,
      };
    });
    res.json(rows);
  } else {
    res.status(404).json({ detail: "evaluation.csv not found" });
  }
});

// -------------------------------------------------------------
// Vite Dev Server / Static File Serving
// -------------------------------------------------------------

async function startServer() {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Hindi WSD] Full-stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
