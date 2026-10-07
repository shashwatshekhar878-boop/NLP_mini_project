import json
import re
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


# -------------------------
# Load data
# -------------------------

dataset = pd.read_csv(DATA_DIR / "dataset.csv")

with open(DATA_DIR / "senses.json", encoding="utf-8") as f:
    SENSES = json.load(f)

with open(DATA_DIR / "stopwords.txt", encoding="utf-8") as f:
    STOPWORDS = {
        line.strip()
        for line in f
        if line.strip()
    }


# -------------------------
# Preprocessing
# -------------------------

def preprocess(sentence):
    sentence = re.sub(
        r"[।,!?;:\"'()\[\]{}]",
        " ",
        sentence
    )

    tokens = sentence.split()

    return [
        token
        for token in tokens
        if token not in STOPWORDS
    ]


# -------------------------
# Context window
# -------------------------

def context_window(sentence, target, k=4):
    tokens = preprocess(sentence)

    if target not in tokens:
        return " ".join(tokens)

    index = tokens.index(target)

    context = (
        tokens[max(0, index - k):index]
        + tokens[index + 1:index + 1 + k]
    )

    return " ".join(context)


# -------------------------
# Simplified Lesk
# -------------------------

def lesk(target_word, sentence):

    context = set(preprocess(sentence))
    context.discard(target_word)

    best_sense = None
    best_overlap = -1

    for sense in SENSES[target_word].values():

        signature_text = (
            sense["gloss_hi"]
            + " "
            + " ".join(sense["examples"])
        )

        signature = set(
            preprocess(signature_text)
        )

        overlap = len(context & signature)

        if overlap > best_overlap:
            best_sense = sense["label"]
            best_overlap = overlap

    return best_sense, best_overlap


# -------------------------
# Train Naive Bayes
# -------------------------

models = {}

for word in dataset["target_word"].unique():

    word_data = dataset[
        dataset["target_word"] == word
    ]

    X = [
        context_window(sentence, word)
        for sentence in word_data["sentence"]
    ]

    y = word_data["sense"]

    vectorizer = CountVectorizer(
        tokenizer=str.split,
        token_pattern=None
    )

    X_vectorized = vectorizer.fit_transform(X)

    model = MultinomialNB()
    model.fit(X_vectorized, y)

    models[word] = {
        "vectorizer": vectorizer,
        "model": model
    }


# -------------------------
# Naive Bayes prediction
# -------------------------

def naive_bayes(target_word, sentence):

    if target_word not in models:
        raise ValueError(
            f"Unsupported target word: {target_word}"
        )

    context = context_window(
        sentence,
        target_word
    )

    vectorizer = models[target_word]["vectorizer"]
    model = models[target_word]["model"]

    X = vectorizer.transform([context])

    prediction = model.predict(X)[0]

    probabilities = model.predict_proba(X)[0]

    confidence = max(probabilities)

    return prediction, float(confidence)


# -------------------------
# Combined prediction
# -------------------------

def predict(sentence, target_word):

    if target_word not in SENSES:
        raise ValueError(
            f"Unsupported target word: {target_word}"
        )

    lesk_sense, overlap = lesk(
        target_word,
        sentence
    )

    nb_sense, probability = naive_bayes(
        target_word,
        sentence
    )

    return {
        "target_word": target_word,
        "sentence": sentence,

        "lesk": {
            "sense": lesk_sense,
            "overlap": overlap
        },

        "naive_bayes": {
            "sense": nb_sense,
            "probability": round(
                probability,
                4
            )
        }
    }
