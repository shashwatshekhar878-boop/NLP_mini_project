import React, { useState, useEffect, useMemo } from "react";
import { Search, Play, ChevronLeft, ChevronRight } from "lucide-react";

interface DatasetItem {
  sentence: string;
  target_word: string;
  sense: string;
}

interface DatasetExplorerProps {
  onTestSentence: (word: string, sentence: string) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({ onTestSentence }) => {
  const [dataset, setDataset] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWord, setSelectedWord] = useState<string>("all");
  const [selectedSense, setSelectedSense] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  useEffect(() => {
    fetch("/api/dataset")
      .then((res) => res.json())
      .then((data) => {
        setDataset(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dataset from backend:", err);
        setLoading(false);
      });
  }, []);

  const words = useMemo(() => {
    const set = new Set<string>();
    dataset.forEach((d) => set.add(d.target_word));
    return Array.from(set);
  }, [dataset]);

  const availableSenses = useMemo(() => {
    const sSet = new Set<string>();
    dataset.forEach((d) => {
      if (selectedWord === "all" || d.target_word === selectedWord) {
        sSet.add(d.sense);
      }
    });
    return Array.from(sSet);
  }, [dataset, selectedWord]);

  const filteredData = useMemo(() => {
    return dataset.filter((item) => {
      if (selectedWord !== "all" && item.target_word !== selectedWord) {
        return false;
      }
      if (selectedSense !== "all" && item.sense !== selectedSense) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSentence = item.sentence.toLowerCase().includes(q);
        const matchesSense = item.sense.toLowerCase().includes(q);
        const matchesWord = item.target_word.toLowerCase().includes(q);
        if (!matchesSentence && !matchesSense && !matchesWord) {
          return false;
        }
      }
      return true;
    });
  }, [dataset, selectedWord, selectedSense, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const handleWordChange = (w: string) => {
    setSelectedWord(w);
    setSelectedSense("all");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-[#8a857c]">
        Loading dataset from backend...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] font-bold tracking-[0.14em] text-[#9b7950] uppercase">
          ANNOTATED TRAINING & EVALUATION CORPUS
        </div>
        <h2 className="text-3xl font-serif text-[#171717] mt-1">
          Dataset Explorer
        </h2>
        <p className="text-sm text-[#716d66] max-w-2xl mt-2 leading-relaxed">
          Loaded directly from <code>data/dataset.csv</code> via the backend API.
          All 900 labelled Hindi sentences (100 sentences per word, 50 per sense).
        </p>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e1dcd3] p-4 rounded-xl">
          <div className="text-[10px] font-bold text-[#8a857c] uppercase">Total Sentences</div>
          <div className="text-2xl font-serif font-bold text-[#171717] mt-1">
            {dataset.length}
          </div>
          <div className="text-[11px] text-[#8a857c] mt-0.5">900 labelled rows</div>
        </div>
        <div className="bg-white border border-[#e1dcd3] p-4 rounded-xl">
          <div className="text-[10px] font-bold text-[#8a857c] uppercase">Target Words</div>
          <div className="text-2xl font-serif font-bold text-[#9b7950] mt-1">
            {words.length}
          </div>
          <div className="text-[11px] text-[#8a857c] mt-0.5">Polysemous Hindi terms</div>
        </div>
        <div className="bg-white border border-[#e1dcd3] p-4 rounded-xl">
          <div className="text-[10px] font-bold text-[#8a857c] uppercase">Per-Word Distribution</div>
          <div className="text-2xl font-serif font-bold text-[#171717] mt-1">
            100 : 50 / 50
          </div>
          <div className="text-[11px] text-[#8a857c] mt-0.5">Balanced binary senses</div>
        </div>
        <div className="bg-white border border-[#e1dcd3] p-4 rounded-xl">
          <div className="text-[10px] font-bold text-[#8a857c] uppercase">Matching Filter</div>
          <div className="text-2xl font-serif font-bold text-[#6b8f71] mt-1">
            {filteredData.length}
          </div>
          <div className="text-[11px] text-[#8a857c] mt-0.5">Sentences found</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e1dcd3] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8a857c] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search sentences, words, or sense labels..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#faf9f6] border border-[#ddd8ce] rounded-xl outline-none focus:border-[#b29367]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-[#777] font-medium shrink-0">Word:</label>
            <select
              value={selectedWord}
              onChange={(e) => handleWordChange(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-[#ddd8ce] rounded-xl outline-none focus:border-[#b29367]"
            >
              <option value="all">All words ({dataset.length})</option>
              {words.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-[#777] font-medium shrink-0">Sense:</label>
            <select
              value={selectedSense}
              onChange={(e) => {
                setSelectedSense(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-white border border-[#ddd8ce] rounded-xl outline-none focus:border-[#b29367]"
            >
              <option value="all">All senses</option>
              {availableSenses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sentences Table */}
      <div className="bg-white border border-[#e1dcd3] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf8f5] border-b border-[#e8e4dc] text-[11px] font-bold text-[#8a857c] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-28">Target Word</th>
                <th className="py-3 px-4 w-36">Labelled Sense</th>
                <th className="py-3 px-4">Hindi Sentence</th>
                <th className="py-3 px-4 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe9]">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8a857c] text-sm">
                    No matching sentences found for your filter query.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const absoluteIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={absoluteIndex}
                      className="hover:bg-[#faf9f6] transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-[#8a857c]">
                        {absoluteIndex}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-base text-[#171717]">
                        {item.target_word}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md bg-[#f4eee4] text-[#8c6a3f]">
                          {item.sense}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#2b2721] text-sm leading-relaxed">
                        <SentenceWithHighlight
                          sentence={item.sentence}
                          target={item.target_word}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onTestSentence(item.target_word, item.sentence)}
                          className="p-1.5 rounded-lg border border-[#e1dcd3] hover:border-[#bba077] bg-white text-[#777] hover:text-[#9b7950] transition-colors"
                          title="Test in Disambiguation Lab"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > pageSize && (
          <div className="p-4 bg-[#faf8f5] border-t border-[#e8e4dc] flex items-center justify-between text-xs text-[#777]">
            <div>
              Showing {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)}–
              {Math.min(filteredData.length, currentPage * pageSize)} of {filteredData.length} sentences
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-[#ddd8ce] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#faf7f0]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-mono font-medium text-[#171717]">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-[#ddd8ce] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#faf7f0]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SentenceWithHighlight: React.FC<{ sentence: string; target: string }> = ({
  sentence,
  target,
}) => {
  if (!sentence.includes(target)) {
    return <span>{sentence}</span>;
  }

  const parts = sentence.split(target);
  return (
    <span>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark className="bg-[#f2e6cf] text-[#8a5d28] font-bold px-1 rounded">
              {target}
            </mark>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};
