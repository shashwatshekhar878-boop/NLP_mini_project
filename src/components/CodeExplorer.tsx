import React, { useState } from "react";
import { CODE_FILES, CodeFile } from "../data/codeFiles";
import { Copy, Check, Download, FileCode, FolderTree } from "lucide-react";

export const CodeExplorer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const allFiles: CodeFile[] = CODE_FILES;

  const currentFile = allFiles[selectedFileIndex] || allFiles[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = currentFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] font-bold tracking-[0.14em] text-[#9b7950] uppercase">
          CODEBASE & REPRODUCIBILITY ASSETS
        </div>
        <h2 className="text-3xl font-serif text-[#171717] mt-1">
          Source Files & Project Structure
        </h2>
        <p className="text-sm text-[#716d66] max-w-2xl mt-2 leading-relaxed">
          Inspect and download the exact finalized code files: FastAPI backend,
          NLP Word Sense Disambiguation engine, datasets, and benchmark evaluation outputs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Navigator Sidebar */}
        <div className="bg-white border border-[#e1dcd3] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#eee8dc] text-xs font-bold text-[#8a857c] uppercase tracking-wider">
            <FolderTree className="w-4 h-4 text-[#9b7950]" />
            <span>Project Files</span>
          </div>

          <div className="space-y-1">
            {allFiles.map((file, idx) => {
              const isSelected = idx === selectedFileIndex;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-[#171717] text-white font-medium shadow-sm"
                      : "text-[#555] hover:bg-[#faf7f0] hover:text-[#171717]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#cbb391]" : "text-[#8a857c]"}`} />
                    <span className="truncate font-mono">{file.name}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-mono ${isSelected ? "text-[#bbb]" : "text-[#999]"}`}>
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#eee8dc] text-[11px] text-[#8a857c] leading-relaxed">
            Deliberately minimal: 2 backend Python files, 3 data files, and standardized schema.
          </div>
        </div>

        {/* Code Viewer Panel */}
        <div className="lg:col-span-3 bg-white border border-[#e1dcd3] rounded-2xl overflow-hidden shadow-sm flex flex-col">
          {/* Header Bar */}
          <div className="p-4 bg-[#faf8f5] border-b border-[#e8e4dc] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#171717]">
                  {currentFile.path}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#f0ece3] text-[#777] rounded">
                  {currentFile.language}
                </span>
              </div>
              <p className="text-xs text-[#8a857c] mt-0.5">
                {currentFile.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white border border-[#ddd8ce] hover:border-[#bba077] rounded-lg text-xs font-medium text-[#444] flex items-center gap-1.5 transition-colors"
                title="Copy contents"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#6b8f71]" />
                    <span className="text-[#6b8f71]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 bg-[#171717] hover:bg-[#333] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* File Body Content */}
          <div className="p-4 sm:p-5 bg-[#1e1e1e] text-[#f8f8f2] font-mono text-xs overflow-x-auto max-h-[580px] leading-relaxed">
            <pre className="selection:bg-[#9b7950]/40">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
