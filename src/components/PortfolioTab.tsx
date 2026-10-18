import React, { useState } from 'react';
import { DecisionLogEntry } from '../types';
import { Copy, Plus, Download, RefreshCw } from 'lucide-react';

interface PortfolioTabProps {
  caseStudyMarkdown: string;
  onCopyCaseStudy: (text: string) => void;
  decisionLog: DecisionLogEntry[];
  onAddDecisionLog: (entryText: string) => void;
  onExportProjectJson: () => void;
  onResetDemo: () => void;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({
  caseStudyMarkdown,
  onCopyCaseStudy,
  decisionLog,
  onAddDecisionLog,
  onExportProjectJson,
  onResetDemo
}) => {
  const [newDecision, setNewDecision] = useState('');

  const handleAddLog = () => {
    if (!newDecision.trim()) return;
    onAddDecisionLog(newDecision.trim());
    setNewDecision('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-[#1f2328]">
        <h2 className="text-xl font-bold tracking-tight text-white">Portfolio Case Study &amp; Decision Log</h2>
        <p className="text-xs text-[#8c949f] mt-1">
          Export publication-ready product management case studies and maintain an immutable record of architectural decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Decision Log & Backups */}
        <div className="lg:col-span-5 surface-card rounded-xl p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">Project Decision Log</h3>
            <p className="text-xs text-[#7d8590]">Record context behind key trade-offs</p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Switched to Haiku 5.5 to meet $0.005/task SLA..."
              value={newDecision}
              onChange={(e) => setNewDecision(e.target.value)}
              className="flex-1 bg-[#14161b] border border-[#242830] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <button
              onClick={handleAddLog}
              className="px-3 py-1.5 rounded-md bg-[#242830] hover:bg-[#363c48] text-white text-xs font-medium transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {decisionLog.map((entry, idx) => (
              <div key={idx} className="surface-sub rounded-lg p-3 text-xs space-y-1">
                <div className="text-[10px] font-mono text-[#7d8590]">{entry.ts}</div>
                <div className="text-[#c9d1d9] leading-relaxed">{entry.text}</div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#1f2328] flex items-center justify-between text-xs">
            <button
              onClick={onExportProjectJson}
              className="flex items-center gap-1.5 text-[#8c949f] hover:text-white transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON State</span>
            </button>
            <button
              onClick={onResetDemo}
              className="flex items-center gap-1.5 text-[#f87171] hover:underline transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {/* Right: Case Study Generator */}
        <div className="lg:col-span-7 surface-card rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f2328]">
            <div>
              <h3 className="text-sm font-semibold text-white">Publication-Ready Case Study (Markdown)</h3>
              <p className="text-xs text-[#7d8590]">Explicitly discloses verified vs simulated benchmarks</p>
            </div>

            <button
              onClick={() => onCopyCaseStudy(caseStudyMarkdown)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#16181d] hover:bg-[#1f2328] text-xs text-[#e6edf3] border border-[#2d3139] transition"
            >
              <Copy className="w-3 h-3 text-[#8c949f]" />
              <span>Copy</span>
            </button>
          </div>

          <textarea
            readOnly
            value={caseStudyMarkdown}
            className="w-full h-96 bg-[#0b0c0e] border border-[#242830] rounded-lg p-3.5 text-xs font-mono text-[#c9d1d9] leading-relaxed focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
};
