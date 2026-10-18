import React, { useEffect } from 'react';
import {
  X, ArrowRight, ArrowLeft, CheckCircle2, Sparkles,
  BarChart2, Calculator, ShieldCheck, BookOpen, Layers
} from 'lucide-react';

export interface TourStep {
  title: string;
  tabId: string;
  tag: string;
  description: string;
  keyHighlight: string;
  tip: string;
}

interface ProductTourProps {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onComplete: () => void;
}

export const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Prism AI PM Studio',
    tabId: 'overview',
    tag: 'Step 1 of 6 · Getting Started',
    description: 'Prism is built to help AI Product Managers solve the hard questions: Which model delivers the best quality for our budget? How healthy is our RAG pipeline? What happens when our agent makes an unauthorized refund?',
    keyHighlight: 'Everything here is interconnected: your model choice feeds the economic simulator, eval scores update release gates, and decisions flow directly into your auto-generated PRD.',
    tip: 'Tip: Use the preset dropdown in the top bar to switch between Support Ops, Legal RAG, and Scale Search scenarios anytime.'
  },
  {
    title: 'Model Evaluation Metrics & RAG Health',
    tabId: 'visualization',
    tag: 'Step 2 of 6 · Evaluations',
    description: 'Compare frontier and fast models across multi-dimensional quality scores. Below the radar comparison sits the RAG Retrieval Health line chart plotting Faithfulness vs. Relevance over your last 10 evaluation runs.',
    keyHighlight: 'Faithfulness verifies your LLM isn’t hallucinating outside retrieved documents, while Relevance measures whether retrieved chunks provided sufficient context.',
    tip: 'Tip: Hover over any run in the line chart to see instant diagnostic guidance (e.g. Hallucination Risk vs. Retrieval Deficit).'
  },
  {
    title: 'Unit Economics & ROI Simulator',
    tabId: 'economics',
    tag: 'Step 3 of 6 · Economics',
    description: 'Inference bills scale exponentially. This simulator models token volumes, prompt cache discounts (up to 80%), retry costs, and human escalation overhead ($/touch).',
    keyHighlight: 'AI PMs use this to calculate Net Monthly Savings, cost per active user, and break-even daily volume for executive approval memos.',
    tip: 'Tip: Toggle prompt caching on/off to immediately see the cost per 1,000 queries drop.'
  },
  {
    title: 'Model Benchmark & Pareto Frontier',
    tabId: 'models',
    tag: 'Step 4 of 6 · Model Selection',
    description: 'Stop guessing between models. The Pareto Frontier highlights non-dominated models where you cannot improve quality without paying more or sacrificing speed.',
    keyHighlight: 'Filter by hard enterprise constraints (e.g., TTFT < 400ms, strict JSON mode, tool calling support) and customize preference weights.',
    tip: 'Tip: Green-highlighted models represent Pareto-optimal choices for your active criteria.'
  },
  {
    title: 'Agentic Workflow & Deterministic HITL',
    tabId: 'agentic',
    tag: 'Step 5 of 6 · Governance',
    description: 'When autonomous agents execute real customer actions (such as refunds or courier claims), deterministic safety policies prevent costly mistakes.',
    keyHighlight: 'Set hard financial caps (e.g. max $75) and confidence thresholds. If confidence drops below 85% or an injection attack is detected, the agent safely escalates to a human.',
    tip: 'Tip: Test the interactive dry-run scenarios to see signed policy tokens block fraudulent claims in real time.'
  },
  {
    title: 'PM Playbooks & Documentation',
    tabId: 'docs',
    tag: 'Step 6 of 6 · Playbooks',
    description: 'Comprehensive, step-by-step guidance for every phase of AI product development, from writing your initial 13-Factor PRD to statistical sample sizing in the experiment lab.',
    keyHighlight: 'Use the copyable prompt templates, CFO justification formulas, and golden dataset checklists to guide your day-to-day team decisions.',
    tip: 'Tip: You can re-open this tour at any time by clicking "Tour" in the top bar or sidebar.'
  }
];

export const ProductTour: React.FC<ProductTourProps> = ({
  isOpen,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  onComplete
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        if (currentStep < totalSteps - 1) onNext();
        else onComplete();
      }
      if (e.key === 'ArrowLeft' && currentStep > 0) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, totalSteps, onNext, onPrev, onClose, onComplete]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep] || TOUR_STEPS[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Tour Card */}
      <div className="w-full max-w-xl surface-card rounded-2xl p-6 sm:p-7 shadow-2xl border border-[#2d3139] space-y-5 relative">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34d399]" />
            <span className="text-xs font-mono text-[#8c949f] tracking-wide uppercase">
              {step.tag}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#656d76] hover:text-white p-1 rounded-md transition cursor-pointer"
            title="Close Tour (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {step.title}
          </h3>

          <p className="text-sm text-[#8c949f] leading-relaxed">
            {step.description}
          </p>

          <div className="surface-sub rounded-xl p-3.5 border border-[#242830] space-y-1">
            <div className="text-[11px] font-mono text-[#38bdf8] font-medium flex items-center gap-1.5">
              <span>Why this matters for AI PMs:</span>
            </div>
            <div className="text-xs text-[#e2e4e9]">
              {step.keyHighlight}
            </div>
          </div>

          <div className="text-xs text-[#7d8590] italic font-mono pt-1">
            {step.tip}
          </div>
        </div>

        {/* Progress Bar & Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1f2328]">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-[#34d399]'
                    : idx < currentStep
                    ? 'w-2 bg-[#38bdf8]'
                    : 'w-2 bg-[#242830]'
                }`}
              />
            ))}
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[#7d8590] hover:text-white transition cursor-pointer"
            >
              Skip
            </button>

            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#16181d] hover:bg-[#1f2328] text-white border border-[#2d3139] transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            <button
              onClick={isLast ? onComplete : onNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-[#0b0c0e] font-semibold hover:bg-[#f1f2f4] transition shadow-sm cursor-pointer"
            >
              <span>{isLast ? 'Finish Tour' : 'Next Step'}</span>
              {isLast ? <CheckCircle2 className="w-3.5 h-3.5 text-[#0b0c0e]" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
