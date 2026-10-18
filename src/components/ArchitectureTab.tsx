import React from 'react';
import { ArchFactors, ArchPattern, ModelSpec, EconResults } from '../types';
import { Copy } from 'lucide-react';

interface ArchitectureTabProps {
  factors: ArchFactors;
  onChangeFactors: (newFactors: ArchFactors) => void;
  patterns: ArchPattern[];
  activeModel: ModelSpec;
  econResults: EconResults;
  goldenPassRate: number;
  expVerdict: string;
  onCopyPrd: (prdMd: string) => void;
  prdMarkdown: string;
}

export const ArchitectureTab: React.FC<ArchitectureTabProps> = ({
  factors,
  onChangeFactors,
  patterns,
  activeModel,
  econResults,
  goldenPassRate,
  expVerdict,
  onCopyPrd,
  prdMarkdown
}) => {
  const updateField = (field: keyof ArchFactors, val: string) => {
    onChangeFactors({
      ...factors,
      [field]: val
    });
  };

  const bestPattern = patterns[0] || { name: 'Deterministic Workflow + Hybrid RAG', score: 88, why: 'Matches requirements.' };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-[#1f2328]">
        <h2 className="text-xl font-bold tracking-tight text-white">13-Factor Architecture Framework &amp; PRD Builder</h2>
        <p className="text-xs text-[#8c949f] mt-1">
          Architectural pattern trade-off scorer synchronized with real-time Unit Economics, Model Benchmarks, and Evals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 13-Factor Diagnostic Wizard */}
        <div className="lg:col-span-5 surface-card rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Problem Constraints Wizard</h3>
            <p className="text-xs text-[#7d8590]">Evaluates 8 architectural design patterns</p>
          </div>

          <div className="space-y-3 text-xs max-h-[500px] overflow-y-auto pr-1">
            <div className="space-y-1">
              <label className="block text-[#8c949f]">Feature Title</label>
              <input
                type="text"
                value={factors.featureName}
                onChange={(e) => updateField('featureName', e.target.value)}
                className="w-full bg-[#14161b] border border-[#242830] rounded-md px-3 py-1.5 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-[#7d8590]">Knowledge Freshness</label>
                <select
                  value={factors.q1}
                  onChange={(e) => updateField('q1', e.target.value)}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
                >
                  <option value="dynamic">Dynamic (Daily updates)</option>
                  <option value="static">Static domain facts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[#7d8590]">Citation Need</label>
                <select
                  value={factors.q2}
                  onChange={(e) => updateField('q2', e.target.value)}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
                >
                  <option value="strict">Strict citations</option>
                  <option value="creative">Flexible drafting</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[#7d8590]">External Tool Writes</label>
                <select
                  value={factors.q3}
                  onChange={(e) => updateField('q3', e.target.value)}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
                >
                  <option value="tools">Mutates state / APIs</option>
                  <option value="readonly">Read-only Q&amp;A</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[#7d8590]">Output Syntax</label>
                <select
                  value={factors.q4}
                  onChange={(e) => updateField('q4', e.target.value)}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
                >
                  <option value="standard">Standard JSON / Text</option>
                  <option value="niche">Niche / Custom DSL</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[#7d8590]">Workflow Steps</label>
                <select
                  value={factors.q5}
                  onChange={(e) => updateField('q5', e.target.value)}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
                >
                  <option value="fixed_steps">Fixed known steps</option>
                  <option value="open_ended">Open multi-hop plan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[#7d8590]">Action Reversibility</label>
                <select
                  value={factors.q6}
                  onChange={(e) => updateField('q6', e.target.value)}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
                >
                  <option value="irreversible">High risk / Payouts</option>
                  <option value="reversible">Reversible drafts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[#7d8590]">Labeled Training Pairs</label>
                <select
                  value={factors.q7}
                  onChange={(e) => updateField('q7', e.target.value)}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
                >
                  <option value="low">&lt; 500 labeled pairs</option>
                  <option value="high">10,000+ curated pairs</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[#7d8590]">Query Variance</label>
                <select
                  value={factors.q8}
                  onChange={(e) => updateField('q8', e.target.value)}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
                >
                  <option value="bimodal">70% simple / 30% complex</option>
                  <option value="uniform">Uniformly complex</option>
                </select>
              </div>
            </div>
          </div>

          <div className="surface-sub rounded-lg p-3.5 space-y-1">
            <div className="text-[11px] font-mono text-[#7d8590] uppercase">Selected Recommendation</div>
            <div className="text-sm font-semibold text-white">{bestPattern.name} ({bestPattern.score}/100)</div>
            <p className="text-xs text-[#8c949f]">{bestPattern.why}</p>
          </div>
        </div>

        {/* Right: Pattern Matrix + PRD Output */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pattern Table */}
          <div className="surface-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#1f2328] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Architectural Fit &amp; Trade-Off Matrix</h3>
              <span className="text-xs text-[#7d8590] font-mono">Ranked</span>
            </div>

            <div className="overflow-x-auto max-h-48">
              <table className="w-full text-left border-collapse text-xs">
                <tbody className="divide-y divide-[#1f2328] text-[#c9d1d9]">
                  {patterns.map((p, idx) => (
                    <tr key={p.id} className={idx === 0 ? 'bg-[#16181d]' : ''}>
                      <td className="py-2.5 px-4 font-medium text-white">
                        {idx === 0 ? '★ ' : ''}{p.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#8c949f]">{p.score}/100</td>
                      <td className="py-2.5 px-4 text-[#8c949f]">{p.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Synchronized PRD Markdown */}
          <div className="surface-card rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Synchronized Product Requirements Document (PRD)</h3>
                <p className="text-xs text-[#7d8590]">Unit economics, model benchmarks &amp; release gates included</p>
              </div>

              <button
                onClick={() => onCopyPrd(prdMarkdown)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#16181d] hover:bg-[#1f2328] text-xs text-[#e6edf3] border border-[#2d3139] transition"
              >
                <Copy className="w-3 h-3 text-[#8c949f]" />
                <span>Copy PRD</span>
              </button>
            </div>

            <textarea
              readOnly
              value={prdMarkdown}
              className="w-full h-72 bg-[#0b0c0e] border border-[#242830] rounded-lg p-3.5 text-xs font-mono text-[#c9d1d9] leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
