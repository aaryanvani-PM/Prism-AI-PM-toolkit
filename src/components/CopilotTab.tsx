import React, { useState } from 'react';
import { ModelSpec, EconResults } from '../types';
import { Copy, Sparkles } from 'lucide-react';

interface CopilotTabProps {
  problemStatement: string;
  onProblemChange: (val: string) => void;
  assumptions: string;
  onAssumptionsChange: (val: string) => void;
  latencySlaMs: number;
  onLatencySlaChange: (val: number) => void;
  budgetCapMonthly: number;
  onBudgetCapChange: (val: number) => void;
  activeModel: ModelSpec;
  econResults: EconResults;
  goldenPassRate: number;
  expVerdict: string;
  onCopyOutput: (text: string) => void;
  geminiConnected: boolean;
  onOpenGeminiConfig: () => void;
}

export const CopilotTab: React.FC<CopilotTabProps> = ({
  problemStatement,
  onProblemChange,
  assumptions,
  onAssumptionsChange,
  latencySlaMs,
  onLatencySlaChange,
  budgetCapMonthly,
  onBudgetCapChange,
  activeModel,
  econResults,
  goldenPassRate,
  expVerdict,
  onCopyOutput,
  geminiConnected,
  onOpenGeminiConfig
}) => {
  const [selectedArtifact, setSelectedArtifact] = useState<string>('problem_framing');
  const [clarificationInput, setClarificationInput] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [copilotOutput, setCopilotOutput] = useState<string>('');

  const contradictions: string[] = [];
  const estLatencyMs = activeModel.ttftMs + 400;

  if (estLatencyMs > latencySlaMs) {
    contradictions.push(`Estimated latency (${estLatencyMs}ms) exceeds SLA (${latencySlaMs}ms). Consider fast-tier model or caching.`);
  }

  if (econResults.totalMonthlyAiOpEx > budgetCapMonthly) {
    contradictions.push(`Monthly OpEx ($${Math.round(econResults.totalMonthlyAiOpEx).toLocaleString()}) exceeds budget ($${budgetCapMonthly.toLocaleString()}).`);
  }

  if (goldenPassRate < 90 && expVerdict === 'SHIP') {
    contradictions.push(`Pass rate is ${goldenPassRate.toFixed(1)}% (<90%), conflicting with online A/B SHIP recommendation.`);
  }

  const handleApplyClarification = () => {
    if (!clarificationInput.trim()) return;
    onProblemChange(`${problemStatement} [Clarified: ${clarificationInput.trim()}]`);
    onAssumptionsChange(`${assumptions} | Clarified: ${clarificationInput.trim()}`);
    setClarificationInput('');
  };

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      let doc = '';
      if (selectedArtifact === 'problem_framing') {
        doc = `# Problem Framing & Solution Strategy
## Core Problem Statement
${problemStatement}

## Why Traditional Rules Fail
- Rigid decision trees cannot resolve unstructured carrier delay logs or edge-case damage disputes.

## Recommended Connected Architecture
- Deploy **${activeModel.name}** within a deterministic directed workflow with hybrid RAG and a strict $75 financial cap.
- Unit Cost: **$${econResults.costPerSuccessfulTask.toFixed(4)} per verified task**; Gross avoided human cost = $${Math.round(econResults.grossAvoidedHumanCost).toLocaleString()}/mo.

## Assumptions
${assumptions}`;
      } else if (selectedArtifact === 'feasibility') {
        doc = `# Technical & Economic Feasibility Assessment
- Inference Latency: ${estLatencyMs}ms est vs ${latencySlaMs}ms SLA.
- Budget: $${Math.round(econResults.totalMonthlyAiOpEx).toLocaleString()}/mo vs $${budgetCapMonthly.toLocaleString()}/mo cap.
- Net Monthly ROI: $${Math.round(econResults.netMonthlySavings).toLocaleString()}/mo net savings after deducting human reviews.`;
      } else {
        doc = `# Deliverable: ${selectedArtifact.toUpperCase()}
Generated from synchronized workspace state:
- Model: ${activeModel.name} (${activeModel.exactId})
- Unit Cost: $${econResults.costPerSuccessfulTask.toFixed(4)}/successful task
- Golden Pass Rate: ${goldenPassRate.toFixed(1)}%
- Online A/B Recommendation: ${expVerdict}

## Assumptions
${assumptions}`;
      }

      setCopilotOutput(doc);
      setIsSynthesizing(false);
    }, 350);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f2328]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">AI PM Copilot &amp; Contradiction Auditor</h2>
          <p className="text-xs text-[#8c949f] mt-1">
            Synthesize product deliverables and detect conflicting SLA, budget, or evaluation assumptions.
          </p>
        </div>

        <button
          onClick={onOpenGeminiConfig}
          className="text-xs text-[#8c949f] hover:text-white transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{geminiConnected ? 'Gemini 2.5 Active' : 'Configure Gemini API'}</span>
        </button>
      </div>

      {/* Contradiction & Context Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contradictions */}
        <div className="surface-card rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Cross-Module Contradiction Check</span>
            <span className="font-mono text-[#7d8590]">{contradictions.length} Conflict(s)</span>
          </div>

          {contradictions.length === 0 ? (
            <div className="text-xs text-[#34d399] py-1">
              ✓ All modules (Economics, Model SLA, Evals, and Experiment Lab) are consistent.
            </div>
          ) : (
            <div className="space-y-1 text-xs text-[#f87171]">
              {contradictions.map((c, i) => (
                <div key={i}>• {c}</div>
              ))}
            </div>
          )}
        </div>

        {/* Clarifying Context */}
        <div className="surface-card rounded-xl p-4 space-y-2">
          <div className="text-xs font-semibold text-white">Context Clarification</div>
          <div className="flex gap-2 text-xs">
            <input
              type="text"
              placeholder="Add constraint (e.g. carrier lag 4h)..."
              value={clarificationInput}
              onChange={(e) => setClarificationInput(e.target.value)}
              className="flex-1 bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1 text-white text-xs"
            />
            <button
              onClick={handleApplyClarification}
              className="px-3 py-1 rounded-md bg-[#242830] hover:bg-[#363c48] text-white text-xs font-medium transition"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Copilot Generation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Inputs */}
        <div className="lg:col-span-5 surface-card rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">1. Problem &amp; Scope Constraints</h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="block text-[#8c949f]">Problem Statement</label>
              <textarea
                rows={3}
                value={problemStatement}
                onChange={(e) => onProblemChange(e.target.value)}
                className="w-full bg-[#14161b] border border-[#242830] rounded-md p-2.5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[#7d8590]">Target SLA (ms)</label>
                <input
                  type="number"
                  value={latencySlaMs}
                  onChange={(e) => onLatencySlaChange(Number(e.target.value))}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 font-mono text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[#7d8590]">Monthly Budget ($)</label>
                <input
                  type="number"
                  value={budgetCapMonthly}
                  onChange={(e) => onBudgetCapChange(Number(e.target.value))}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 font-mono text-white text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[#8c949f]">Deliverable Type</label>
              <select
                value={selectedArtifact}
                onChange={(e) => setSelectedArtifact(e.target.value)}
                className="w-full bg-[#14161b] border border-[#242830] rounded-md px-3 py-2 text-white font-medium"
              >
                <option value="problem_framing">1. Problem Framing &amp; Strategy</option>
                <option value="feasibility">2. Technical &amp; Economic Feasibility</option>
                <option value="risk_register">3. Non-Deterministic AI Risk Register</option>
              </select>
            </div>

            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="w-full py-2 rounded-md bg-[#f0f3f6] hover:bg-white text-[#0b0c0e] text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize Artifact'}</span>
            </button>
          </div>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-7 surface-card rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f2328]">
            <h3 className="text-sm font-semibold text-white">Synthesized Deliverable</h3>
            <button
              onClick={() => onCopyOutput(copilotOutput || 'Please synthesize an artifact first.')}
              className="flex items-center gap-1.5 text-xs text-[#8c949f] hover:text-white transition"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>

          <textarea
            readOnly
            value={copilotOutput || 'Click "Synthesize Artifact" to generate a calibrated document pulling live metrics from Economics, Evals, and Experiment Lab.'}
            className="w-full h-80 bg-[#0b0c0e] border border-[#242830] rounded-lg p-3.5 text-xs font-mono text-[#c9d1d9] leading-relaxed focus:outline-none resize-none"
          />

          <div className="text-xs text-[#7d8590] pt-2 border-t border-[#1f2328]">
            Synchronized with live workspace parameters.
          </div>
        </div>
      </div>
    </div>
  );
};
