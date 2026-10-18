import React from 'react';
import {
  BarChart2, Calculator, Cpu, BookOpen, ShieldAlert, FileText,
  GitBranch, Bot, Shield, CheckCircle, ArrowRight, Play, Sparkles,
  Layers, CheckCircle2, ShieldCheck, HelpCircle
} from 'lucide-react';

interface LandingOverviewProps {
  onEnterStudio: () => void;
  onStartTour: () => void;
  onNavigateToTab: (tabId: string) => void;
  onOpenDocs: () => void;
}

export const LandingOverview: React.FC<LandingOverviewProps> = ({
  onEnterStudio,
  onStartTour,
  onNavigateToTab,
  onOpenDocs
}) => {
  const moduleCards = [
    {
      id: 'visualization',
      title: 'Evaluation Metrics & Performance Trends',
      icon: BarChart2,
      category: 'Evaluations',
      accentColor: '#38bdf8',
      summary: 'Side-by-side benchmarking and historical RAG retrieval health tracking.',
      problemItSolves: 'AI outputs drift silently across prompt or dataset versions, leading to unseen hallucinations in production.',
      howItHelps: [
        'Plots Faithfulness vs. Relevance across the last 10 evaluation runs via Recharts.',
        'Visualizes multi-vector radar comparisons (Reasoning, Speed, Cost, Context, Tools).',
        'Tracks golden pass rate progression against strict release gates (>= 90%).'
      ]
    },
    {
      id: 'models',
      title: 'Model Benchmark & Pareto Frontier',
      icon: Cpu,
      category: 'Evaluations',
      accentColor: '#34d399',
      summary: 'Data-driven model scoring with multi-factor Pareto frontier trade-offs.',
      problemItSolves: 'Choosing between frontier and fast models usually involves guesswork between price, latency, and reasoning depth.',
      howItHelps: [
        'Identifies non-dominated Pareto models where quality cannot be improved without increasing cost.',
        'Applies hard constraints (e.g. TTFT < 400ms, strict JSON, tool calling).',
        'Custom weight sliders allowing custom scoring tailored to your specific product requirements.'
      ]
    },
    {
      id: 'evals',
      title: 'Golden Dataset & Regression Studio',
      icon: BookOpen,
      category: 'Evaluations',
      accentColor: '#fbbf24',
      summary: 'Interactive test suite with human-in-the-loop review and deterministic assertions.',
      problemItSolves: 'Vague prompts break on edge cases (e.g., prompt injection, courier delays, ambiguous policies).',
      howItHelps: [
        'Run deterministic assertions on happy paths, policy disputes, and prompt injections.',
        'Human grading toggle (PASS, FAIL, REVIEW) to calibrate LLM-as-a-judge accuracy.',
        'Instant test runner with live pass-rate recalculation and pass/fail diffs.'
      ]
    },
    {
      id: 'economics',
      title: 'Unit Economics & ROI Simulator',
      icon: Calculator,
      category: 'Economics',
      accentColor: '#34d399',
      summary: 'Comprehensive financial forecasting modeled from query volumes to GPU node self-hosting.',
      problemItSolves: 'Hidden inference costs, context growth, and human escalation overheads can bankrupt AI features at scale.',
      howItHelps: [
        'Simulates prompt caching savings (up to 80% input token discount).',
        'Factors in human agent escalation costs ($/touch) and retry overheads.',
        'Computes net ROI %, monthly OpEx, and break-even daily query volumes for CFO approval memos.'
      ]
    },
    {
      id: 'agentic',
      title: 'Agentic Workflow & Deterministic HITL',
      icon: ShieldAlert,
      category: 'Economics',
      accentColor: '#f87171',
      summary: 'Policy gates, authorization caps, and Human-in-the-Loop decision simulations.',
      problemItSolves: 'Autonomous agents can leak unauthorized refunds or take irreversible destructive actions.',
      howItHelps: [
        'Enforces configurable confidence score thresholds (e.g., escalate if < 85%).',
        'Sets strict financial authorization caps (e.g., max $75 auto-refund) with signed token proofs.',
        'Simulates real incident scenarios (broken items, fraud attempts, courier delays) in real-time.'
      ]
    },
    {
      id: 'architect',
      title: 'Architecture Framework & PRD Builder',
      icon: FileText,
      category: 'Economics',
      accentColor: '#94a3b8',
      summary: '13-Factor diagnostic framework and automated, publication-ready PRD generator.',
      problemItSolves: 'Writing AI PRDs from scratch often overlooks latency SLAs, fallback trees, and compliance bounds.',
      howItHelps: [
        'Diagnoses system constraints (dynamic vs static context, cloud vs airgapped, tool calling).',
        'Ranks 8 architecture patterns (Simple Prompt, Routing, RAG, ReAct Agent, Guarded Hierarchy).',
        'Generates fully populated, copyable Markdown PRDs in real-time.'
      ]
    },
    {
      id: 'experiments',
      title: 'A/B Experiment Lab & Statistical Inference',
      icon: GitBranch,
      category: 'Safety',
      accentColor: '#a78bfa',
      summary: 'Rigorous sample size calculators, Fleiss two-proportion tests, and guardrail tracking.',
      problemItSolves: 'Shipping AI changes without statistically valid sample sizes leads to false wins or regression leakage.',
      howItHelps: [
        'Pre-configured templates for 10 common AI experiments (Prompt Tuning, Hybrid RAG, Tool Gates).',
        'Calculates required sample size based on baseline conversion, MDE %, alpha, and power.',
        'Runs continuous Welch t-tests and two-proportion z-tests on observed trial data.'
      ]
    },
    {
      id: 'security',
      title: 'Enterprise Security, RBAC & Audit Trails',
      icon: Shield,
      category: 'Safety',
      accentColor: '#38bdf8',
      summary: 'Hardware enclave simulation, real-time DLP PII scanner, and cryptographic audit logging.',
      problemItSolves: 'Enterprise buyers require strict SOC2, HIPAA, and role-based access guarantees before deploying LLMs.',
      howItHelps: [
        'Multi-role access switching (Chief AI Officer, Staff AI PM, Risk Engineer, Security Auditor).',
        'Simulates AES-256 encrypted API secret vaults with key rotation tracking.',
        'Real-time PII regex redaction engine for emails, credit cards, SSNs, and phone numbers.'
      ]
    }
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12">
      {/* Hero Banner with Clean Minimalist Posture */}
      <div className="surface-card rounded-2xl p-8 lg:p-10 space-y-6 relative overflow-hidden border border-[#1f2328]">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-[#7d8590]">
            <span className="w-2 h-2 rounded-full bg-[#34d399]" />
            <span>Enterprise Decision Operating System for AI Product Teams</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Prism AI PM Studio
          </h1>

          <p className="text-sm sm:text-base text-[#8c949f] leading-relaxed">
            The all-in-one workbench for AI Product Managers. Seamlessly navigate from raw feature ideation and token unit economics to golden dataset evals, Pareto model selection, deterministic safety gates, and production release criteria.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={onEnterStudio}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#0b0c0e] font-semibold text-sm hover:bg-[#f1f2f4] transition shadow-sm cursor-pointer"
            >
              <span>Enter Decision Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartTour}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#16181d] text-white border border-[#2d3139] hover:bg-[#1f2328] font-medium text-sm transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#34d399]" />
              <span>Start Interactive Tour</span>
            </button>

            <button
              onClick={onOpenDocs}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#16181d] text-[#8c949f] hover:text-white border border-[#2d3139] hover:bg-[#1f2328] font-medium text-sm transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Read PM Playbooks &amp; Docs</span>
            </button>
          </div>
        </div>

        {/* 3 Quick Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#1f2328] text-xs">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-[#16181d] border border-[#242830] flex items-center justify-center text-[#34d399] shrink-0 font-mono">
              01
            </div>
            <div>
              <div className="font-semibold text-white">Eliminate Cost Blindspots</div>
              <div className="text-[#7d8590] mt-0.5">Forecast GPU OpEx, prompt cache savings, and human escalation trade-offs before writing code.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-[#16181d] border border-[#242830] flex items-center justify-center text-[#38bdf8] shrink-0 font-mono">
              02
            </div>
            <div>
              <div className="font-semibold text-white">Continuous RAG Health</div>
              <div className="text-[#7d8590] mt-0.5">Track Faithfulness vs. Relevance over time to catch drift before shipping to customers.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-[#16181d] border border-[#242830] flex items-center justify-center text-[#fbbf24] shrink-0 font-mono">
              03
            </div>
            <div>
              <div className="font-semibold text-white">Deterministic Guardrails</div>
              <div className="text-[#7d8590] mt-0.5">Enforce signed financial authorization caps and automated human escalation workflows.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Guide Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Studio Modules &amp; How They Help You
        </h2>
        <p className="text-xs text-[#8c949f]">
          Each section addresses a specific failure mode in the AI product management lifecycle. Click any module to jump directly to its workspace.
        </p>
      </div>

      {/* 8 Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {moduleCards.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              className="surface-card rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-[#363c48] transition cursor-pointer group"
              onClick={() => onNavigateToTab(mod.id)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${mod.accentColor}15`, color: mod.accentColor }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-[#7d8590] font-mono uppercase tracking-wider">{mod.category}</div>
                      <h3 className="text-base font-semibold text-white group-hover:text-white transition">
                        {mod.title}
                      </h3>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#484f58] group-hover:text-white transition" />
                </div>

                <p className="text-xs text-[#8c949f] leading-relaxed">
                  {mod.summary}
                </p>

                <div className="surface-sub rounded-lg p-3 space-y-1 text-xs">
                  <div className="text-[11px] font-medium text-amber-300/90 font-mono">
                    Problem It Solves:
                  </div>
                  <div className="text-[11px] text-[#7d8590]">
                    {mod.problemItSolves}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-xs text-[#8c949f]">
                  <div className="text-[11px] font-medium text-white font-mono">Key Capabilities:</div>
                  <ul className="space-y-1">
                    {mod.howItHelps.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="text-[#34d399] font-bold">✓</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1f2328] flex items-center justify-between text-xs">
                <span className="text-[#656d76] font-mono">Launch Module</span>
                <span className="text-[#34d399] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  Open Workspace &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Strip */}
      <div className="surface-sub rounded-xl p-6 border border-[#242830] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <h4 className="text-sm font-semibold text-white">Ready to evaluate your AI product?</h4>
          <p className="text-[#7d8590] mt-0.5">Start with evaluation metrics or dive into unit economics to model your monthly OpEx.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onStartTour}
            className="px-4 py-2 rounded-lg bg-[#14161b] hover:bg-[#1a1d23] text-white border border-[#2d3139] font-medium transition cursor-pointer"
          >
            Take 2-Min Tour
          </button>
          <button
            onClick={onEnterStudio}
            className="px-4 py-2 rounded-lg bg-white hover:bg-[#f1f2f4] text-[#0b0c0e] font-semibold transition shadow-sm cursor-pointer"
          >
            Go to Metrics Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
