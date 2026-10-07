import React, { useState, useEffect } from "react";
import { Check, RefreshCw } from "lucide-react";

interface ExampleItem {
  sentence: string;
  word: string;
  senseLabel: string;
}

const CURATED_EXAMPLES: ExampleItem[] = [
  { sentence: "मैंने बाजार से ताजे पके आम खरीदे।", word: "आम", senseLabel: "mango (फल)" },
  { sentence: "यह एक आम आदमी की सबसे बड़ी समस्या है।", word: "आम", senseLabel: "common (साधारण)" },
  { sentence: "अंतरराष्ट्रीय बाजार में सोना बहुत महंगा हो गया है।", word: "सोना", senseLabel: "gold (धातु)" },
  { sentence: "दिनभर की थकान के बाद मुझे आज जल्दी सोना है।", word: "सोना", senseLabel: "sleep (नींद)" },
  { sentence: "क्रिकेट विश्वकप के फाइनल में टीम को करारी हार मिली।", word: "हार", senseLabel: "defeat (पराजय)" },
  { sentence: "दुल्हन ने गले में मोतियों और सोने का सुंदर हार पहना।", word: "हार", senseLabel: "necklace (आभूषण)" },
  { sentence: "कल शहर में मूसलाधार बारिश हुई थी और पानी भर गया था।", word: "कल", senseLabel: "yesterday (बीता हुआ दिन)" },
  { sentence: "कल हम सब सुबह की पहली ट्रेन से दिल्ली जाएंगे।", word: "कल", senseLabel: "tomorrow (आने वाला दिन)" },
  { sentence: "छात्र ने शिक्षक के पूछे गए कठिन प्रश्न का सही उत्तर दिया।", word: "उत्तर", senseLabel: "answer (जवाब)" },
  { sentence: "देश की राजधानी दिल्ली भारत के उत्तर में स्थित है।", word: "उत्तर", senseLabel: "north (दिशा)" },
  { sentence: "डॉक्टर ने कमजोरी दूर करने के लिए रोज मौसमी फल खाने को कहा।", word: "फल", senseLabel: "fruit (खाने योग्य फल)" },
  { sentence: "कड़ी मेहनत और निरंतर प्रयास का फल हमेशा मीठा होता है।", word: "फल", senseLabel: "result (परिणाम)" },
  { sentence: "उसने अपने दूर रहने वाले वृद्ध पिता को एक भावुक पत्र लिखा।", word: "पत्र", senseLabel: "letter (संदेश)" },
  { sentence: "हवा चलने पर पेड़ से एक सूखा पीला पत्र जमीन पर गिर पड़ा।", word: "पत्र", senseLabel: "leaf (पत्ता)" },
  { sentence: "नाई ने सैलून में कैंची से उसके स्टाइलिश बाल काटे।", word: "बाल", senseLabel: "hair (केश)" },
  { sentence: "आंगन में खेलते हुए नन्हे बाल की किलकारी से घर गूंज उठा।", word: "बाल", senseLabel: "child (बच्चा)" },
  { sentence: "कुशल धनुर्धर अर्जुन ने लक्ष्य साधकर अचूक तीर छोड़ा।", word: "तीर", senseLabel: "arrow (बाण)" },
  { sentence: "शाम के समय हम सब गंगा नदी के शांत तीर पर बैठे थे।", word: "तीर", senseLabel: "river_bank (किनारा)" },
];

const TARGET_WORDS = ["आम", "सोना", "हार", "कल", "उत्तर", "फल", "पत्र", "बाल", "तीर"];

interface PredictResponse {
  target_word: string;
  sentence: string;
  lesk: {
    sense: string;
    overlap: number;
  };
  naive_bayes: {
    sense: string;
    probability: number;
  };
}

interface DisambiguationLabProps {
  initialWord?: string;
  initialSentence?: string;
}

export const DisambiguationLab: React.FC<DisambiguationLabProps> = ({
  initialWord = "आम",
  initialSentence = "मैंने बाजार से आम खरीदे।",
}) => {
  const [sentence, setSentence] = useState<string>(initialSentence);
  const [target, setTarget] = useState<string>(initialWord);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const analyze = async (sentToAnalyze: string, targetToAnalyze: string) => {
    const trimmedSent = sentToAnalyze.trim();
    const trimmedTarget = targetToAnalyze.trim();

    if (!trimmedSent || !trimmedTarget) {
      setError("Please enter a sentence and specify an ambiguous word.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Backend handles ALL execution via POST /predict
      const response = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sentence: trimmedSent,
          target_word: trimmedTarget,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed on backend");
      }

      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Backend inference failed";
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Run initial prediction on backend
  useEffect(() => {
    analyze(initialSentence, initialWord);
  }, []);

  const handleSelectExample = (ex: ExampleItem) => {
    setSentence(ex.sentence);
    setTarget(ex.word);
    analyze(ex.sentence, ex.word);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="pt-8 pb-4">
        <div className="text-[11px] font-bold tracking-[0.14em] text-[#9b7950] uppercase">
          NLP MINI PROJECT · WORD SENSE DISAMBIGUATION
        </div>

        <h1 className="mt-3 text-4xl sm:text-6xl font-serif text-[#171717] tracking-tight leading-[1.05]">
          One word. <br />
          <span className="text-[#9b7950]">Multiple meanings.</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-[#716d66] max-w-2xl leading-relaxed">
          Give the system a Hindi sentence and see how context determines the intended meaning
          of an ambiguous word. Evaluated in the backend using Simplified Lesk and Naive Bayes.
        </p>
      </section>

      {/* Curated Examples (placed above Input Sentence) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold tracking-[0.14em] text-[#9b7950] uppercase">
            TRY AN EXAMPLE
          </div>
          <div className="text-xs text-[#8a857c]">
            Click to send to backend for evaluation
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {CURATED_EXAMPLES.map((ex, idx) => {
            const isSelected = sentence === ex.sentence && target === ex.word;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectExample(ex)}
                className={`text-left p-3 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? "bg-[#f5efe4] border-[#cbb391] text-[#171717] shadow-sm"
                    : "bg-white/60 hover:bg-white border-[#e1dcd2] text-[#555] hover:border-[#b8a17d]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#9b7950] text-sm">
                    {ex.word}
                  </span>
                  <span className="text-[10px] text-[#8a857c]">
                    {ex.senseLabel}
                  </span>
                </div>
                <div className="line-clamp-2 text-[#333] leading-relaxed">
                  {ex.sentence}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Workspace Input Card */}
      <div className="bg-white/85 border border-[#e3ded4] rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(50,43,31,0.06)] backdrop-blur-sm">
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-[#9b7950] uppercase">
              INPUT SENTENCE
            </div>
            <h2 className="text-xl font-semibold text-[#171717] mt-1">
              Analyze Hindi context
            </h2>
          </div>
          <span className="px-3 py-1 bg-[#f1eee7] text-[#6f695e] text-xs font-medium rounded-md">
            हिन्दी
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="उदाहरण: मैंने बाजार से आम खरीदे।"
              rows={4}
              className="w-full p-4 text-lg bg-[#fbfaf8] border border-[#ddd8ce] rounded-xl outline-none focus:border-[#b29367] focus:ring-2 focus:ring-[#b29367]/20 transition-all text-[#202020] leading-relaxed resize-y"
            />
          </div>

          {/* Target Word Quick Selector and Controls */}
          <div className="pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#777168] uppercase tracking-wider">
                Ambiguous Word (लक्षित शब्द)
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {TARGET_WORDS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setTarget(w);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      target === w
                        ? "bg-[#171717] text-white border-[#171717] shadow-sm"
                        : "bg-white text-[#555] border-[#ddd8ce] hover:border-[#b29367]"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="w-28">
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="आम"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-[#ddd8ce] rounded-lg outline-none focus:border-[#b29367] text-center font-medium"
                />
              </div>

              <button
                type="button"
                onClick={() => analyze(sentence, target)}
                disabled={loading || !sentence.trim() || !target.trim()}
                className="px-6 py-2.5 bg-[#171717] hover:bg-[#2b2b2b] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze context</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3.5 bg-[#fff0ed] border border-[#f5c6cb] text-[#a14f43] rounded-lg text-xs leading-relaxed">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Disambiguation Results */}
      {result && (
        <section className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e5dfd3]">
            <div>
              <div className="text-[11px] font-bold tracking-[0.14em] text-[#9b7950] uppercase">
                ANALYSIS RESULT
              </div>
              <h2 className="text-2xl font-serif text-[#171717] mt-1">
                Sense detected for <span className="text-[#9b7950] font-bold">"{result.target_word}"</span>
              </h2>
            </div>
            <div className="max-w-md p-3 bg-white/70 border-l-2 border-[#c5aa7d] rounded-r-lg text-xs text-[#6e685f] leading-relaxed">
              <span className="font-semibold text-[#171717]">Evaluated Context:</span> {result.sentence}
            </div>
          </div>

          {/* Side by side method cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simplified Lesk Card */}
            <div className="bg-white border border-[#e1dcd3] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-[#171717]">Simplified Lesk</h3>
                    <p className="text-xs text-[#969087] mt-0.5">Knowledge-based</p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="text-[9px] font-bold tracking-[0.13em] text-[#9b958b] uppercase">
                    PREDICTED SENSE
                  </div>
                  <div className="mt-2 text-3xl sm:text-4xl font-serif font-semibold text-[#171717] capitalize">
                    {result.lesk.sense}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#9b7950]">
                    {result.lesk.overlap} overlapping {result.lesk.overlap === 1 ? "word" : "words"}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f0ece3] text-xs text-[#777168] leading-relaxed">
                Chooses the sense whose dictionary gloss and examples share the most words with the sentence.
              </div>
            </div>

            {/* Naive Bayes Card */}
            <div className="bg-white border-2 border-[#bba077] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_12px_36px_rgba(120,89,47,0.08)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#9b7950]/10 to-transparent rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-[#171717]">Naive Bayes</h3>
                    <p className="text-xs text-[#969087] mt-0.5">Supervised</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#eee5d5] text-[#8c6a3f] rounded">
                    MODEL
                  </span>
                </div>

                <div className="mt-8">
                  <div className="text-[9px] font-bold tracking-[0.13em] text-[#9b958b] uppercase">
                    PREDICTED SENSE
                  </div>
                  <div className="mt-2 text-3xl sm:text-4xl font-serif font-semibold text-[#171717] capitalize">
                    {result.naive_bayes.sense}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#9b7950]">
                    {(result.naive_bayes.probability * 100).toFixed(1)}% confidence
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f0ece3] text-xs text-[#777168] leading-relaxed">
                Learns which context words are associated with each sense from the labelled training dataset.
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="flex items-start gap-3 p-4 bg-[#eeeee9] rounded-xl text-xs text-[#555]">
            <div className="w-5 h-5 rounded-full bg-[#6b8f71] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-[#171717] font-semibold">
                Both methods analyzed the same context
              </strong>
              <p className="mt-0.5 text-[#6f6a61]">
                The result compares a knowledge-based method with a supervised model directly computed by the backend engine.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
