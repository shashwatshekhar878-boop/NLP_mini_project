import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

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

interface LexiconViewProps {
  onSelectWordSentence: (word: string, sentence: string) => void;
}

export const LexiconView: React.FC<LexiconViewProps> = ({ onSelectWordSentence }) => {
  const [senses, setSenses] = useState<SensesDictionary | null>(null);
  const [selectedWord, setSelectedWord] = useState<string>("आम");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/senses")
      .then((res) => res.json())
      .then((data) => {
        setSenses(data);
        const keys = Object.keys(data);
        if (keys.length > 0 && !keys.includes(selectedWord)) {
          setSelectedWord(keys[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch senses from backend:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !senses) {
    return (
      <div className="py-12 text-center text-xs text-[#8a857c]">
        Loading senses lexicon from backend...
      </div>
    );
  }

  const words = Object.keys(senses);
  const currentEntry = senses[selectedWord];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] font-bold tracking-[0.14em] text-[#9b7950] uppercase">
          DICTIONARY OF POLYSEMOUS WORDS
        </div>
        <h2 className="text-3xl font-serif text-[#171717] mt-1">
          Word Sense Lexicon
        </h2>
        <p className="text-sm text-[#716d66] max-w-2xl mt-2 leading-relaxed">
          The knowledge base contains 9 polysemous Hindi target words with 2 distinct senses each,
          served directly from the backend <code>data/senses.json</code> file.
        </p>
      </div>

      {/* Word Pills Selector */}
      <div className="flex flex-wrap gap-2 border-b border-[#e1dcd3] pb-4">
        {words.map((w) => {
          const isSelected = w === selectedWord;
          const entry = senses[w];
          return (
            <button
              key={w}
              type="button"
              onClick={() => setSelectedWord(w)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${
                isSelected
                  ? "bg-[#171717] text-white border-[#171717] shadow-sm"
                  : "bg-white text-[#444] border-[#e1dcd3] hover:border-[#bba077]"
              }`}
            >
              <span className="font-serif text-base font-bold">{w}</span>
              <span className="text-[11px] opacity-80">
                ({entry.sense_1.label} / {entry.sense_2.label})
              </span>
            </button>
          );
        })}
      </div>

      {/* Senses Display Card */}
      {currentEntry && (
        <div className="space-y-6">
          <div className="flex items-baseline gap-4">
            <h3 className="text-4xl font-serif font-bold text-[#171717]">
              {selectedWord}
            </h3>
            <span className="text-xs text-[#8a857c]">
              2 distinct semantic senses recorded in <code>data/senses.json</code>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SenseCard
              index={1}
              sense={currentEntry.sense_1}
              word={selectedWord}
              onTestExample={onSelectWordSentence}
            />
            <SenseCard
              index={2}
              sense={currentEntry.sense_2}
              word={selectedWord}
              onTestExample={onSelectWordSentence}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface SenseCardProps {
  index: number;
  sense: SenseInfo;
  word: string;
  onTestExample: (word: string, sentence: string) => void;
}

const SenseCard: React.FC<SenseCardProps> = ({ index, sense, word, onTestExample }) => {
  return (
    <div className="bg-white border border-[#e1dcd3] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#9b7950]">
              SENSE {index}
            </span>
            <h4 className="text-2xl font-serif font-semibold text-[#171717] capitalize mt-0.5">
              {sense.label}
            </h4>
          </div>
          <span className="px-2.5 py-1 bg-[#f4eee4] text-[#8c6a3f] text-xs font-semibold rounded-md">
            {sense.meaning_en}
          </span>
        </div>

        {/* Hindi Gloss */}
        <div className="p-3.5 bg-[#faf8f4] border border-[#eee7da] rounded-xl my-4">
          <div className="text-[10px] font-bold text-[#8a857c] uppercase tracking-wider mb-1">
            Hindi Definition (परिभाषा)
          </div>
          <p className="text-sm font-medium text-[#2b2721] leading-relaxed">
            {sense.gloss_hi}
          </p>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-[#8a857c] uppercase tracking-wider">
            Curated Lexicon Examples (उदाहरण)
          </div>
          <div className="space-y-2">
            {sense.examples.map((ex, idx) => (
              <div
                key={idx}
                className="group p-2.5 bg-white hover:bg-[#faf7f1] border border-[#e8e4dc] hover:border-[#c5aa7d] rounded-lg text-xs text-[#333] flex items-center justify-between transition-colors"
              >
                <span className="leading-relaxed">{ex}</span>
                <button
                  type="button"
                  onClick={() => onTestExample(word, ex)}
                  className="ml-2 text-[10px] text-[#9b7950] font-semibold opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 whitespace-nowrap"
                  title="Test in Disambiguation Lab"
                >
                  <span>Test</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#f0ece3] text-[11px] text-[#8a857c]">
        Gloss and examples used as signature vocabulary in Simplified Lesk calculation.
      </div>
    </div>
  );
};
