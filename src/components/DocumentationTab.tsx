import React, { useState } from 'react';
import {
  BookOpen, Search, Copy, Check, ChevronRight, FileText,
  Calculator, ShieldAlert, Cpu, GitBranch, Layers, Sparkles,
  ArrowRight, ShieldCheck, AlertCircle, HelpCircle
} from 'lucide-react';

export const DocumentationTab: React.FC = () => {
  const [activePlaybook, setActivePlaybook] = useState<'p1' | 'p2' | 'p3' | 'p4' | 'glossary'>('p1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const playbooks = [
    {
      id: 'p1',
      number: '01',
      title: '0-to-1 PRD & Architecture Selection',
      tag: 'Ideation & Scoping',
      description: 'How to diagnose system requirements and select the simplest viable pattern before writing complex code.'
    },
    {
      id: 'p2',
      number: '02',
      title: 'Unit Economics & CFO Business Case',
      tag: 'Finance & ROI',
      description: 'Modeling token volume, prompt caching discounts, human escalation costs, and calculating net ROI.'
    },
    {
      id: 'p3',
      number: '03',
      title: 'Offline Evals & Continuous RAG Health',
      tag: 'Evaluations & Quality',
      description: 'Measuring Faithfulness vs. Relevance over time, writing deterministic assertions, and preventing silent drift.'
    },
    {
      id: 'p4',
      number: '04',
      title: 'Production Release Gates & Guardrails',
      tag: 'Safety & Governance',
      description: 'Configuring deterministic financial authorization caps, confidence scoring, and cryptographic audit trails.'
    },
    {
      id: 'glossary',
      number: '05',
      title: 'AI Product Management Glossary',
      tag: 'Reference & Definitions',
      description: 'Key formulas, statistical abbreviations, and evaluation metrics explained for product managers.'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f2328]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#34d399]" />
              <span>AI PM Playbooks &amp; System Documentation</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e2229] text-[#7ee787] border border-[#2d3139]">
              Enterprise Playbooks
            </span>
          </div>
          <p className="text-xs text-[#8c949f] mt-1">
            End-to-end guidance from PRD architecture diagnosis to unit economics, golden evals, and production release gating.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#656d76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search playbooks & terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14161b] border border-[#242830] text-xs text-white rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#38bdf8] transition placeholder:text-[#656d76]"
          />
        </div>
      </div>

      {/* Main Grid: Left Playbook Selector, Right Content Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 surface-card rounded-xl p-3 space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-[#656d76] px-3 py-1">
            Playbook Tracks
          </div>
          {playbooks.map((p) => {
            const isActive = activePlaybook === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePlaybook(p.id as any)}
                className={`w-full text-left p-3 rounded-lg transition flex items-start justify-between gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#1e2229] text-white shadow-sm border border-[#2d3139]'
                    : 'text-[#8c949f] hover:text-white hover:bg-[#16181d]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#34d399] font-bold">{p.number}</span>
                    <span className="text-xs font-semibold text-white">{p.title}</span>
                  </div>
                  <div className="text-[11px] text-[#7d8590] line-clamp-2">
                    {p.description}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-[#34d399] translate-x-0.5' : 'text-[#484f58]'}`} />
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-8 surface-card rounded-xl p-6 sm:p-8 space-y-6">
          {/* PLAYBOOK 1: PRD & Architecture Selection */}
          {activePlaybook === 'p1' && (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-[#1f2328] pb-4">
                <div className="text-xs font-mono text-[#34d399] uppercase">Playbook 01 · Scoping &amp; System Design</div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  0-to-1 PRD &amp; Architecture Selection Framework
                </h3>
                <p className="text-xs text-[#8c949f] leading-relaxed">
                  The most common failure in AI products is over-engineering: choosing multi-agent frameworks when a cached prompt or simple hybrid RAG pipeline would be faster, cheaper, and more reliable.
                </p>
              </div>

              {/* 13-Factor Diagnostics Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">The 13-Factor Diagnostic Heuristic</h4>
                <div className="space-y-2 text-xs">
                  <div className="surface-sub rounded-lg p-3.5 border border-[#242830] space-y-1.5">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>1. Information Freshness (Dynamic vs. Static Context)</span>
                      <span className="text-[10px] font-mono text-[#38bdf8]">RAG Trigger</span>
                    </div>
                    <p className="text-[#8c949f]">
                      If user answers depend on live order statuses, inventory, or internal SOPs updated daily, naive model fine-tuning will fail. Use Hybrid RAG (Vector + BM25 keyword reranking) to inject verified facts into the prompt.
                    </p>
                  </div>

                  <div className="surface-sub rounded-lg p-3.5 border border-[#242830] space-y-1.5">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>2. Action Irreversibility &amp; Blast Radius</span>
                      <span className="text-[10px] font-mono text-[#f87171]">Gate Trigger</span>
                    </div>
                    <p className="text-[#8c949f]">
                      Actions that issue money, alter database records, or email external clients must <strong>never</strong> execute purely on model output without deterministic validation (signed policy token, financial cap, or human sign-off).
                    </p>
                  </div>

                  <div className="surface-sub rounded-lg p-3.5 border border-[#242830] space-y-1.5">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>3. Latency SLA Budget</span>
                      <span className="text-[10px] font-mono text-[#fbbf24]">Model Selection</span>
                    </div>
                    <p className="text-[#8c949f]">
                      Consumer autocomplete requires TTFT &lt; 400ms (fast models: Gemini 2.5 Flash, Claude 3.5 Haiku). Deep reasoning or medical triage can afford 2,500ms+ (frontier models: GPT-4o, Claude Sonnet).
                    </p>
                  </div>
                </div>
              </div>

              {/* Copyable PRD Template */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Production PRD Template (Copyable)</h4>
                  <button
                    onClick={() => handleCopy(`# [Feature Name] AI PRD
## 1. Problem Statement & Baseline SLA
- User Problem:
- Current Human Touch Cost ($):
- Response Time SLA:

## 2. Quantitative Targets & Guardrails
- Target Verified Pass Rate: >= 90.0%
- Target p95 Latency SLA: <= 2,200ms
- Max Allowable Financial Leakage: <= 0.2%

## 3. Architecture Pattern
- Selected Pattern: Hybrid RAG + Deterministic Tool Gate
- Reasoning Model: Fast Tier (triage) -> Frontier (escalation)
- Fallback Strategy: Escalate to human support queue on confidence < 85%`, 'prd_copy')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#16181d] hover:bg-[#1f2328] text-white text-xs border border-[#2d3139] transition cursor-pointer"
                  >
                    {copiedId === 'prd_copy' ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5 text-[#8c949f]" />}
                    <span>{copiedId === 'prd_copy' ? 'Copied' : 'Copy Template'}</span>
                  </button>
                </div>
                <div className="bg-[#0b0c0e] rounded-lg p-4 font-mono text-[11px] text-[#7ee787] border border-[#1f2328] overflow-x-auto">
                  <pre>{`# [Feature Name] AI PRD
## 1. Problem Statement & Baseline SLA
- Target Verified Pass Rate: >= 90.0%
- Target p95 Latency SLA: <= 2,200ms
- Max Allowable Financial Leakage: <= 0.2%

## 2. Architecture Pattern: Hybrid RAG + Deterministic Tool Gate
- Fast Model (TTFT < 400ms) for classification & chunk triage
- Frontier Model for policy reasoning
- Signed Policy Token required for any refund execution`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* PLAYBOOK 2: Unit Economics & CFO Business Case */}
          {activePlaybook === 'p2' && (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-[#1f2328] pb-4">
                <div className="text-xs font-mono text-[#34d399] uppercase">Playbook 02 · Unit Economics &amp; Finance</div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Unit Economics &amp; CFO Justification Playbook
                </h3>
                <p className="text-xs text-[#8c949f] leading-relaxed">
                  How to accurately calculate the Total Cost of Ownership (TCO) for AI features and prove verifiable ROI before scaling query volume.
                </p>
              </div>

              {/* Economic Equations */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">The 5 Core AI Cost Equations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="surface-sub rounded-lg p-3.5 border border-[#242830] space-y-1">
                    <div className="font-mono text-[#34d399] font-semibold">1. Base Monthly Inference</div>
                    <div className="text-[11px] text-[#8c949f]">
                      Queries &times; (Input Tokens &times; Input Price + Output Tokens &times; Output Price)
                    </div>
                  </div>

                  <div className="surface-sub rounded-lg p-3.5 border border-[#242830] space-y-1">
                    <div className="font-mono text-[#38bdf8] font-semibold">2. Prompt Cache Discount</div>
                    <div className="text-[11px] text-[#8c949f]">
                      Cached Input Tokens get an 75% to 80% pricing discount. Structuring fixed system prompts upfront saves thousands per month.
                    </div>
                  </div>

                  <div className="surface-sub rounded-lg p-3.5 border border-[#242830] space-y-1">
                    <div className="font-mono text-[#f87171] font-semibold">3. Human Escalation Cost</div>
                    <div className="text-[11px] text-[#8c949f]">
                      Monthly Queries &times; Escalation % &times; Cost per Human Touch ($3.50+). This often exceeds raw LLM token spend.
                    </div>
                  </div>

                  <div className="surface-sub rounded-lg p-3.5 border border-[#242830] space-y-1">
                    <div className="font-mono text-[#fbbf24] font-semibold">4. Net Monthly ROI %</div>
                    <div className="text-[11px] text-[#8c949f]">
                      (Gross Avoided Human Cost - Total AI OpEx) / Total AI OpEx &times; 100%. Healthy enterprise features target &gt; 200% ROI.
                    </div>
                  </div>
                </div>
              </div>

              {/* Practical AI PM Advice */}
              <div className="surface-sub rounded-lg p-4 border border-[#242830] space-y-2 text-xs">
                <div className="text-white font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#fbbf24]" />
                  <span>The Prompt Caching Rule for Production Systems</span>
                </div>
                <p className="text-[#8c949f] leading-relaxed">
                  Always place static system instructions, formatting guidelines, and golden context chunks at the top of your prompt prefix. Modern LLM providers (Anthropic, OpenAI, Google) cache tokens with a shared prefix. Shuffling instructions per request ruins cache locality and increases bills by 400%.
                </p>
              </div>
            </div>
          )}

          {/* PLAYBOOK 3: Offline Evals & RAG Health */}
          {activePlaybook === 'p3' && (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-[#1f2328] pb-4">
                <div className="text-xs font-mono text-[#34d399] uppercase">Playbook 03 · Evaluations &amp; Quality</div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Continuous RAG Health &amp; Golden Dataset Evals
                </h3>
                <p className="text-xs text-[#8c949f] leading-relaxed">
                  Why single "vibe checks" fail, how to construct a 50+ case golden dataset, and how to read the Faithfulness vs. Relevance line chart.
                </p>
              </div>

              {/* RAG Health Explained */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">RAG Health: Faithfulness vs. Relevance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="surface-sub rounded-lg p-4 border border-[#242830] space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
                      <span className="w-2 h-2 rounded-full bg-[#34d399]" />
                      <span>Faithfulness (Groundedness)</span>
                    </div>
                    <p className="text-[#8c949f]">
                      Measures whether every claim made in the generated answer is directly substantiated by the retrieved context. Low faithfulness means the model is hallucinating prior training knowledge.
                    </p>
                    <div className="text-[11px] text-[#7d8590] pt-1 border-t border-[#1f2328]">
                      Target Gate: <strong>&gt;= 0.90 (90%)</strong>
                    </div>
                  </div>

                  <div className="surface-sub rounded-lg p-4 border border-[#242830] space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono">
                      <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                      <span>Context Relevance</span>
                    </div>
                    <p className="text-[#8c949f]">
                      Measures whether the retrieved document chunks actually contain the specific facts needed to satisfy the user prompt. Low relevance means your embedding model or top-k retrieval is missing key clauses.
                    </p>
                    <div className="text-[11px] text-[#7d8590] pt-1 border-t border-[#1f2328]">
                      Target Gate: <strong>&gt;= 0.90 (90%)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnostic Decision Matrix */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Interactive Diagnostic Matrix</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#1f2328]">
                    <thead className="bg-[#14161b] text-[#7d8590] font-mono text-[11px]">
                      <tr>
                        <th className="p-2.5">Faithfulness</th>
                        <th className="p-2.5">Relevance</th>
                        <th className="p-2.5">Root Cause Diagnosis</th>
                        <th className="p-2.5">Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f2328] text-[#8c949f]">
                      <tr>
                        <td className="p-2.5 font-mono text-emerald-400">&gt;= 0.90</td>
                        <td className="p-2.5 font-mono text-cyan-400">&gt;= 0.90</td>
                        <td className="p-2.5 text-white">Optimal Alignment</td>
                        <td className="p-2.5">Ready for production candidate release.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-amber-400">&lt; 0.90</td>
                        <td className="p-2.5 font-mono text-cyan-400">&gt;= 0.90</td>
                        <td className="p-2.5 text-amber-300">Hallucination Drift</td>
                        <td className="p-2.5">Tighten prompt instructions; penalize ungrounded assumptions.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-emerald-400">&gt;= 0.90</td>
                        <td className="p-2.5 font-mono text-cyan-400">&lt; 0.90</td>
                        <td className="p-2.5 text-cyan-300">Retrieval Deficit</td>
                        <td className="p-2.5">Increase top-k, add BM25 sparse search or re-ranker.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">&lt; 0.90</td>
                        <td className="p-2.5 font-mono text-rose-400">&lt; 0.90</td>
                        <td className="p-2.5 text-rose-300">Dual Degradation</td>
                        <td className="p-2.5">Audit chunk segmentation and system prompt foundation.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PLAYBOOK 4: Production Release Gates */}
          {activePlaybook === 'p4' && (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-[#1f2328] pb-4">
                <div className="text-xs font-mono text-[#34d399] uppercase">Playbook 04 · Governance &amp; Security</div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Production Release Gates &amp; Deterministic Safety
                </h3>
                <p className="text-xs text-[#8c949f] leading-relaxed">
                  How enterprise AI PMs establish irreversible launch criteria, enforce cryptographic policy signing, and guarantee zero PII leakage.
                </p>
              </div>

              {/* 3 Pillars of AI Governance */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">The Three Golden Release Gates</h4>
                <div className="space-y-2 text-xs">
                  <div className="surface-sub rounded-lg p-3.5 border border-[#242830] space-y-1">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Gate 1: Minimum Golden Pass Rate (&gt;= 90.0%)</span>
                      <span className="text-[10px] font-mono text-[#34d399]">Enforced</span>
                    </div>
                    <p className="text-[#8c949f]">
                      Before scaling traffic to more than 5% of users, the model must pass at least 90% of all golden test cases, with 100% pass on prompt injection immunity.
                    </p>
                  </div>

                  <div className="surface-sub rounded-lg p-3.5 border border-[#242830] space-y-1">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Gate 2: Signed Financial Policy Caps</span>
                      <span className="text-[10px] font-mono text-[#38bdf8]">Enforced</span>
                    </div>
                    <p className="text-[#8c949f]">
                      Any autonomous tool call (e.g. refund, credit, return) requires an explicit signed policy token verified against current business thresholds ($75 maximum). Any transaction above $75 must automatically pause for a human reviewer.
                    </p>
                  </div>

                  <div className="surface-sub rounded-lg p-3.5 border border-[#242830] space-y-1">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Gate 3: Real-Time DLP PII Redaction</span>
                      <span className="text-[10px] font-mono text-[#a78bfa]">Enforced</span>
                    </div>
                    <p className="text-[#8c949f]">
                      Credit cards, SSNs, personal emails, and phone numbers must be redacted prior to prompt serialization. Verify this in the Enterprise Security tab before connecting production secrets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GLOSSARY */}
          {activePlaybook === 'glossary' && (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-[#1f2328] pb-4">
                <div className="text-xs font-mono text-[#34d399] uppercase">Playbook 05 · Glossary &amp; Reference</div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  AI Product Manager Terminology &amp; Formulas
                </h3>
                <p className="text-xs text-[#8c949f] leading-relaxed">
                  Quick definitions of statistical and architectural concepts used throughout the Prism Decision Studio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="surface-sub rounded-lg p-3 border border-[#242830] space-y-1">
                  <div className="font-mono text-white font-semibold">TTFT (Time To First Token)</div>
                  <div className="text-[11px] text-[#8c949f]">
                    Latency between user request dispatch and receiving the first streaming token. Crucial for chat UI responsiveness.
                  </div>
                </div>

                <div className="surface-sub rounded-lg p-3 border border-[#242830] space-y-1">
                  <div className="font-mono text-white font-semibold">Pareto Frontier</div>
                  <div className="text-[11px] text-[#8c949f]">
                    The set of non-dominated models where you cannot improve one metric (e.g. quality) without degrading another (e.g. cost or latency).
                  </div>
                </div>

                <div className="surface-sub rounded-lg p-3 border border-[#242830] space-y-1">
                  <div className="font-mono text-white font-semibold">MDE (Minimum Detectable Effect)</div>
                  <div className="text-[11px] text-[#8c949f]">
                    The smallest conversion lift or metric difference your A/B test is powered to detect with statistical significance.
                  </div>
                </div>

                <div className="surface-sub rounded-lg p-3 border border-[#242830] space-y-1">
                  <div className="font-mono text-white font-semibold">HITL (Human-in-the-Loop)</div>
                  <div className="text-[11px] text-[#8c949f]">
                    A governance architecture where high-risk or low-confidence model actions are routed to a human operator for sign-off.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
