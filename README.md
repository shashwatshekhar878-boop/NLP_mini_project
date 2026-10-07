# Hindi Word Sense Disambiguation

A Hindi Word Sense Disambiguation system comparing:

- Simplified Lesk
- Multinomial Naive Bayes

## Architecture

```text
React / Vite Web UI
       ↓
  FastAPI / WSD Engine
       ↓
  Shared Preprocessing
       ↓
  ┌───────────┴───────────┐
  ↓                       ↓
Simplified Lesk       Naive Bayes (k=4)
  ↓                       ↓
  └───────────┬───────────┘
              ↓
  Side-by-Side Comparison
```

## Dataset

- **9 ambiguous Hindi words** (आम, सोना, हार, कल, उत्तर, फल, पत्र, बाल, तीर)
- **2 senses per word**
- **540 labelled sentences** (60 sentences per word, 30 per sense)

CSV schema:

```text
sentence,target_word,sense
```

## Backend (FastAPI)

Install dependencies:

```bash
pip install -r requirements.txt
```

Run:

```bash
cd backend
uvicorn main:app --reload
```

API:

```text
POST /predict
```

Example request body:

```json
{
  "sentence": "मैंने बाजार से आम खरीदे।",
  "target_word": "आम"
}
```

Response format:

```json
{
  "target_word": "आम",
  "sentence": "मैंने बाजार से आम खरीदे।",
  "lesk": {
    "sense": "mango",
    "overlap": 2
  },
  "naive_bayes": {
    "sense": "mango",
    "probability": 0.9824
  }
}
```

## Frontend

```bash
npm install
npm run dev
```

For custom backend deployments, set:

```text
VITE_API_URL=http://localhost:8000
```

## Methods

### Simplified Lesk
Uses word overlap between sentence context and sense signature (gloss + example sentences from `senses.json`). The sense with the highest overlap count is chosen.

### Naive Bayes
Uses a bag-of-words representation of a context window ($k = 4$ words on each side of the target word) trained on labelled instances with Laplace additive smoothing.

## Evaluation

The project evaluates both methods on a stratified 80/20 train/test split (48 training instances, 12 held-out test instances per word) for a total of 108 test evaluations.
