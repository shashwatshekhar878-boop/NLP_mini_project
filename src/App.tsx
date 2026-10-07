import React, { useState } from "react";
import { DisambiguationLab } from "./components/DisambiguationLab";
import { LexiconView } from "./components/LexiconView";
import { DatasetExplorer } from "./components/DatasetExplorer";
import { EvaluationView } from "./components/EvaluationView";
import { CodeExplorer } from "./components/CodeExplorer";

type NavTab = "lab" | "lexicon" | "dataset" | "evaluation" | "code";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("lab");

  // State transfer when clicking examples in Lexicon or Dataset Explorer
  const [labWord, setLabWord] = useState<string>("आम");
  const [labSentence, setLabSentence] = useState<string>("मैंने बाजार से आम खरीदे।");

  const handleTestInLab = (word: string, sentence: string) => {
    setLabWord(word);
    setLabSentence(sentence);
    setActiveTab("lab");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f4ef] text-[#171717] selection:bg-[#9b7950]/20 selection:text-[#171717]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-[74px] px-4 sm:px-8 border-b border-[#e7e2d8] bg-[#f6f4ef]/90 backdrop-blur-md flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActiveTab("lab")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-lg font-serif shadow-sm transition-transform group-hover:scale-105">
            हि
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-[#171717] leading-none">
              Hindi WSD
            </div>
            <div className="text-[11px] text-[#8a857c] mt-1">
              Context-Aware Sense Detection
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#ede8df]/70 p-1 rounded-xl border border-[#ded8cb]">
          <button
            type="button"
            onClick={() => setActiveTab("lab")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === "lab"
                ? "bg-white text-[#171717] shadow-sm font-semibold"
                : "text-[#666] hover:text-[#171717]"
            }`}
          >
            Disambiguation Lab
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lexicon")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === "lexicon"
                ? "bg-white text-[#171717] shadow-sm font-semibold"
                : "text-[#666] hover:text-[#171717]"
            }`}
          >
            Word Lexicon
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dataset")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === "dataset"
                ? "bg-white text-[#171717] shadow-sm font-semibold"
                : "text-[#666] hover:text-[#171717]"
            }`}
          >
            Dataset (900)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evaluation")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === "evaluation"
                ? "bg-white text-[#171717] shadow-sm font-semibold"
                : "text-[#666] hover:text-[#171717]"
            }`}
          >
            Evaluation Benchmark
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === "code"
                ? "bg-white text-[#171717] shadow-sm font-semibold"
                : "text-[#666] hover:text-[#171717]"
            }`}
          >
            Code & Files
          </button>
        </nav>

        {/* Backend Status indicator */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-[#e8f2ea] text-[#2b753c] text-xs font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
            <span>Backend Active</span>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex overflow-x-auto gap-1 p-2 bg-[#ece7dd] border-b border-[#ded8cb]">
        <button
          type="button"
          onClick={() => setActiveTab("lab")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === "lab" ? "bg-white text-[#171717] font-semibold" : "text-[#666]"
          }`}
        >
          Disambiguation Lab
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("lexicon")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === "lexicon" ? "bg-white text-[#171717] font-semibold" : "text-[#666]"
          }`}
        >
          Lexicon
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("dataset")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === "dataset" ? "bg-white text-[#171717] font-semibold" : "text-[#666]"
          }`}
        >
          Dataset
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("evaluation")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === "evaluation" ? "bg-white text-[#171717] font-semibold" : "text-[#666]"
          }`}
        >
          Evaluation
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("code")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === "code" ? "bg-white text-[#171717] font-semibold" : "text-[#666]"
          }`}
        >
          Code
        </button>
      </div>

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "lab" && (
          <DisambiguationLab
            initialWord={labWord}
            initialSentence={labSentence}
          />
        )}

        {activeTab === "lexicon" && (
          <LexiconView onSelectWordSentence={handleTestInLab} />
        )}

        {activeTab === "dataset" && (
          <DatasetExplorer onTestSentence={handleTestInLab} />
        )}

        {activeTab === "evaluation" && <EvaluationView />}

        {activeTab === "code" && <CodeExplorer />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#e3ded5] py-6 px-4 sm:px-8 bg-white/40">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8a857c]">
          <div className="flex items-center gap-2">
            <strong className="text-[#5e5951]">Hindi WSD</strong>
            <span>·</span>
            <span>Simplified Lesk + Multinomial Naive Bayes</span>
            <span>·</span>
            <span>All Computation Executed on Backend</span>
          </div>
          <div>
            Natural Language Processing · Word Sense Disambiguation
          </div>
        </div>
      </footer>
    </div>
  );
}
