import React, { useState, useEffect, useMemo } from 'react';
import {
  ProjectState, ModelSpec, EconParams, ArchFactors, ExperimentConfig,
  GoldenCase, EvalRunHistoryItem, DecisionLogEntry, UserRole, ApiSecretItem,
  AuditLogEntry, DlpRule, ArchPattern
} from './types';
import { INITIAL_MODELS } from './data/models';
import { INITIAL_GOLDEN_CASES } from './data/goldenCases';
import { INITIAL_API_SECRETS, INITIAL_AUDIT_LOGS, INITIAL_DLP_RULES } from './data/securityData';
import { EconEngine } from './utils/econEngine';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CommandPalette } from './components/CommandPalette';
import { DataVisualizationSection } from './components/DataVisualizationSection';
import { UnitEconomicsTab } from './components/UnitEconomicsTab';
import { ModelMatrixTab } from './components/ModelMatrixTab';
import { EvalsTab } from './components/EvalsTab';
import { AgenticTab } from './components/AgenticTab';
import { ArchitectureTab } from './components/ArchitectureTab';
import { ExperimentLabTab } from './components/ExperimentLabTab';
import { CopilotTab } from './components/CopilotTab';
import { EnterpriseSecurityTab } from './components/EnterpriseSecurityTab';
import { PortfolioTab } from './components/PortfolioTab';
import { SelfTestsTab } from './components/SelfTestsTab';
import { LandingOverview } from './components/LandingOverview';
import { ProductTour, TOUR_STEPS } from './components/ProductTour';
import { DocumentationTab } from './components/DocumentationTab';
import { Sparkles, Shield, Check, X } from 'lucide-react';

const STORAGE_KEY = 'prism_ai_pm_studio_v4_state';

function createDefaultProject(id: string, name: string): ProjectState {
  return {
    id,
    name,
    isDemo: true,
    updatedAt: new Date().toISOString(),
    problem: 'Tier-1 e-commerce order dispute tickets cost $3.50 per human touch and suffer a 14-hour response SLA. Naive LLM bots hallucinate unauthorized refunds, while rigid decision trees reject valid courier-delay claims.',
    assumptions: '1. Carrier webhook delivery timestamps may lag by up to 4 hours. 2. Need legal sign-off on automated dispute rejection phrasing.',
    latencySlaMs: 2200,
    budgetCapMonthly: 5000,
    econ: {
      modelId: 'gpt-4o-mini',
      dailyQueries: 50000,
      inputTokens: 1200,
      ragChunks: 4,
      outputTokens: 350,
      cacheEligiblePct: 70,
      cacheHitPct: 50,
      verifiedSuccessPct: 68,
      humanEscalationPct: 22,
      humanCost: 3.5,
      retryRatePct: 8,
      toolCallsPerReq: 1.5,
      retrievalCostPer1k: 0.18,
      toolApiCostPer1k: 0.12,
      fixedInfraMonthly: 450,
      trainingAmortMonthly: 200,
      monthlyActiveUsers: 25000,
      gpuUtilizationPct: 45,
      selfHostMlops: 1500
    },
    arch: {
      featureName: 'Autonomous Order Dispute & Policy Copilot',
      q1: 'dynamic',
      q2: 'strict',
      q3: 'tools',
      q4: 'standard',
      q5: 'fixed_steps',
      q6: 'irreversible',
      q7: 'low',
      q8: 'bimodal',
      q9: 'cloud_api',
      q10: 'lean'
    },
    agent: {
      minConf: 85,
      maxCap: 75,
      maxRetries: 2,
      rbacMode: 'strict'
    },
    experiment: {
      templateKey: 'support_agent',
      name: 'EXP-204: Hybrid RAG + Tool Dispute Agent',
      owner: 'Checkout & Support Ops • AI PM',
      objective: 'Increase verified first-contact dispute resolution without increasing unauthorized refund leakage or latency.',
      hypothesis: 'If we replace the legacy keyword bot (Control) with a Hybrid RAG + Tool-Calling Dispute Agent (Treatment) for tier-1 order disputes, then Verified Task Resolution Rate will increase by at least +3.0 percentage points (from 62.0% to >=65.0%) while keeping p95 latency <=2,200ms and policy violation rate <=0.5%.',
      controlDesc: 'Legacy Decision-Tree + Keyword Bot',
      treatmentDesc: 'GPT-4o-mini + Hybrid RAG + Policy Tool Gate',
      eligibility: 'Logged-in users opening an order dispute <= $75',
      exposure: 'User sends 1st dispute message & routing service responds',
      primaryMetric: 'Verified Resolution Rate (No re-open in 7d)',
      guardrails: 'p95 Latency <=2.2s, Policy Leakage <=0.5%, Cost/Task <=$0.008',
      randUnit: 'user',
      metricType: 'binary',
      treatmentSplit: 50,
      dailyEligible: 4000,
      baselineVal: 62.0,
      mdeVal: 3.0,
      alpha: 0.05,
      power: 0.80,
      stdDev: 15.0,
      practicalThreshold: 2.0,
      dataSourceMode: 'sim_winner',
      obsControlN: 4520,
      obsControlSucc: 2802,
      obsTreatN: 4495,
      obsTreatSucc: 2971,
      obsControlSd: 14.8,
      obsTreatSd: 15.2,
      obsGuardrailStatus: 'pass'
    },
    goldenCases: JSON.parse(JSON.stringify(INITIAL_GOLDEN_CASES)),
    evalRunHistory: [
      {
        runId: 'RUN-001',
        ts: '2026-10-10 08:30',
        mode: 'Simulated Baseline',
        modelId: 'gpt-4o-mini',
        promptVer: 'prompt-v1.0-raw',
        datasetVer: 'v1.0-golden',
        recall: 0.68,
        groundedness: 0.72,
        relevance: 0.68,
        passRate: 65.0,
        diffPp: 0.0
      },
      {
        runId: 'RUN-002',
        ts: '2026-10-11 10:15',
        mode: 'Chunk Tuning',
        modelId: 'gpt-4o-mini',
        promptVer: 'prompt-v1.1-chunk512',
        datasetVer: 'v1.0-golden',
        recall: 0.72,
        groundedness: 0.75,
        relevance: 0.72,
        passRate: 69.5,
        diffPp: 4.5
      },
      {
        runId: 'RUN-003',
        ts: '2026-10-12 14:00',
        mode: 'Sparse Tuning',
        modelId: 'gpt-4o-mini',
        promptVer: 'prompt-v1.2-bm25',
        datasetVer: 'v1.1-golden',
        recall: 0.76,
        groundedness: 0.78,
        relevance: 0.76,
        passRate: 74.0,
        diffPp: 4.5
      },
      {
        runId: 'RUN-004',
        ts: '2026-10-13 09:45',
        mode: 'Hybrid Fusion',
        modelId: 'gpt-4o-mini',
        promptVer: 'prompt-v1.5-hybrid',
        datasetVer: 'v1.1-golden',
        recall: 0.81,
        groundedness: 0.82,
        relevance: 0.81,
        passRate: 78.5,
        diffPp: 4.5
      },
      {
        runId: 'RUN-005',
        ts: '2026-10-14 11:30',
        mode: 'Reranker Tuning',
        modelId: 'gpt-4o-mini',
        promptVer: 'prompt-v2.0-rerank',
        datasetVer: 'v2.0-golden',
        recall: 0.84,
        groundedness: 0.85,
        relevance: 0.84,
        passRate: 83.0,
        diffPp: 4.5
      },
      {
        runId: 'RUN-006',
        ts: '2026-10-15 16:20',
        mode: 'Parent Context',
        modelId: 'gpt-4o-mini',
        promptVer: 'prompt-v2.1-parent',
        datasetVer: 'v2.0-golden',
        recall: 0.87,
        groundedness: 0.89,
        relevance: 0.87,
        passRate: 87.5,
        diffPp: 4.5
      },
      {
        runId: 'RUN-007',
        ts: '2026-10-16 09:10',
        mode: 'Guardrail Integration',
        modelId: 'gpt-4o-mini',
        promptVer: 'prompt-v2.5-guarded',
        datasetVer: 'v2.0-golden',
        recall: 0.89,
        groundedness: 0.91,
        relevance: 0.89,
        passRate: 90.0,
        diffPp: 2.5
      },
      {
        runId: 'RUN-008',
        ts: '2026-10-17 11:00',
        mode: 'Prefix Cache Active',
        modelId: 'gpt-4o-mini',
        promptVer: 'prompt-v2.8-cached',
        datasetVer: 'v2.1-golden',
        recall: 0.91,
        groundedness: 0.93,
        relevance: 0.91,
        passRate: 92.0,
        diffPp: 2.0
      },
      {
        runId: 'RUN-009',
        ts: '2026-10-17 18:40',
        mode: 'Release Candidate',
        modelId: 'gpt-4o-mini',
        promptVer: 'prompt-v3.0-rc1',
        datasetVer: 'v2.1-golden',
        recall: 0.92,
        groundedness: 0.95,
        relevance: 0.92,
        passRate: 93.8,
        diffPp: 1.8
      },
      {
        runId: 'RUN-010',
        ts: '2026-10-18 08:00',
        mode: 'Production Release',
        modelId: 'gpt-4o-mini',
        promptVer: 'prompt-v3.0-enterprise',
        datasetVer: 'v2.1-golden',
        recall: 0.93,
        groundedness: 0.96,
        relevance: 0.93,
        passRate: 94.2,
        diffPp: 0.4
      }
    ],
    decisionLog: [
      { ts: '2026-10-17 10:15', text: 'Selected Deterministic State-Machine + Tool Calling over unconstrained ReAct loop to cap retry latency.' },
      { ts: '2026-10-17 11:30', text: 'Enforced $75 hard RBAC policy cap alongside 85% confidence gate for autonomous refunds.' },
      { ts: '2026-10-17 14:00', text: 'Chose GPT-4o-mini with 50% prefix cache hit rate ($0.0049/successful task) over premature GPU self-hosting.' }
    ]
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [projects, setProjects] = useState<ProjectState[]>([
    createDefaultProject('proj_default', '[DEMO] Order Dispute AI Copilot')
  ]);
  const [activeProjectId, setActiveProjectId] = useState<string>('proj_default');
  const [models, setModels] = useState<ModelSpec[]>(INITIAL_MODELS);
  const [currentRole, setCurrentRole] = useState<UserRole>('Lead AI PM');
  const [apiSecrets, setApiSecrets] = useState<ApiSecretItem[]>(INITIAL_API_SECRETS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [dlpRules, setDlpRules] = useState<DlpRule[]>(INITIAL_DLP_RULES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [customApiKeyInput, setCustomApiKeyInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleNextTourStep = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      const next = tourStep + 1;
      setTourStep(next);
      setActiveTab(TOUR_STEPS[next].tabId);
    } else {
      handleCompleteTour();
    }
  };

  const handlePrevTourStep = () => {
    if (tourStep > 0) {
      const prev = tourStep - 1;
      setTourStep(prev);
      setActiveTab(TOUR_STEPS[prev].tabId);
    }
  };

  const handleStartTour = () => {
    setTourStep(0);
    setActiveTab(TOUR_STEPS[0].tabId);
    setIsTourOpen(true);
  };

  const handleCompleteTour = () => {
    setIsTourOpen(false);
    setActiveTab('visualization');
    showToast('Tour completed! Explore the Decision Studio');
  };

  // Active project access
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
          setProjects(parsed.projects);
          setActiveProjectId(parsed.activeProjectId || parsed.projects[0].id);
        }
      }
    } catch (e) {
      // Storage error ignored
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const saveWorkspace = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        activeProjectId,
        projects
      }));
      showToast('Project workspace saved');
    } catch (e) {
      showToast('Saved to session state');
    }
  };

  const updateActiveProject = (mutator: (p: ProjectState) => ProjectState) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return mutator({ ...p, updatedAt: new Date().toISOString() });
      }
      return p;
    }));
  };

  // Unit Economics calculation
  const activeModel = useMemo(() => {
    return models.find(m => m.id === activeProject.econ.modelId) || models[0];
  }, [models, activeProject.econ.modelId]);

  const econResults = useMemo(() => {
    return EconEngine.compute(activeProject.econ, activeModel);
  }, [activeProject.econ, activeModel]);

  // Architecture patterns calculation
  const evaluatedPatterns: ArchPattern[] = useMemo(() => {
    const f = activeProject.arch;
    const patterns = [
      {
        id: 'det_workflow_rag',
        name: 'Deterministic State Workflow + Hybrid RAG + Validated Tools',
        score: 75 + (f.q5 === 'fixed_steps' ? 15 : -5) + (f.q6 === 'irreversible' ? 10 : 0) + (f.q3 === 'tools' ? 8 : 0) + (f.q1 === 'dynamic' ? 8 : 0),
        why: 'Best when multi-step tool actions follow known business rules and consequential actions require hard RBAC gates rather than open-ended agent loops.',
        failureMode: 'Rigid transitions if user intent spans unmodeled multi-hop branches.'
      },
      {
        id: 'model_routing_rag',
        name: 'Intent Router Cascade (Fast Model + Frontier Escalation) + RAG',
        score: 72 + (f.q8 === 'bimodal' ? 18 : 0) + (f.q1 === 'dynamic' ? 8 : 0) + (f.q2 === 'strict' ? 6 : 0),
        why: 'Ideal when 70%+ of traffic is routine and can be served by a $0.10–$0.15/1M model while routing complex edge cases to a Frontier model.',
        failureMode: 'Router misclassifications sending subtle edge cases to the lightweight tier.'
      },
      {
        id: 'hybrid_rag_only',
        name: 'Hybrid RAG (Dense + BM25 + Cross-Encoder Reranker)',
        score: 70 + (f.q3 === 'readonly' ? 18 : -8) + (f.q1 === 'dynamic' ? 12 : 0) + (f.q2 === 'strict' ? 10 : 0),
        why: 'Gold standard for read-only compliance, policy, and documentation Q&A where knowledge changes frequently and citations are mandatory.',
        failureMode: 'Chunk boundary fragmentation or stale index sync.'
      },
      {
        id: 'structured_outputs',
        name: 'Prompting + Strict JSON Schema / Grammar-Constrained Outputs',
        score: 68 + (f.q1 === 'static' ? 12 : -5) + (f.q3 === 'readonly' ? 8 : 0) + (f.q7 === 'low' ? 10 : 0),
        why: 'Lowest engineering maintenance burden for extraction, classification, and routing when domain knowledge fits in a cached system prompt.',
        failureMode: 'Context bloat and prompt drift if dynamic knowledge is stuffed into prompt.'
      },
      {
        id: 'tool_agent',
        name: 'Autonomous Multi-Turn Tool-Using Agent (ReAct / Plan-and-Execute)',
        score: 60 + (f.q5 === 'open_ended' ? 25 : -15) + (f.q3 === 'tools' ? 12 : -10) + (f.q6 === 'reversible' ? 8 : -10),
        why: 'Justified ONLY when task topology is genuinely unpredictable at design time. Do not use if a deterministic workflow suffices.',
        failureMode: 'Unbounded retry loops, compounding latency, and unpredictable tool side effects.'
      }
    ];
    return patterns.sort((a, b) => b.score - a.score);
  }, [activeProject.arch]);

  // Golden Pass Rate
  const goldenPassRate = useMemo(() => {
    const cases = activeProject.goldenCases;
    if (!cases || cases.length === 0) return 94.2;
    const passed = cases.filter(c => c.status === 'PASS').length;
    return (passed / cases.length) * 100;
  }, [activeProject.goldenCases]);

  // Live Auto-Generated PRD Markdown
  const prdMarkdown = useMemo(() => {
    const f = activeProject.arch;
    const best = evaluatedPatterns[0];
    return `# AI Product Requirements Document (PRD): ${f.featureName}

## 1. Problem Framing & Business Objective
- **Problem Statement**: ${activeProject.problem}
- **Target Scale**: ${activeProject.econ.dailyQueries.toLocaleString()} requests/day (${activeProject.econ.monthlyActiveUsers.toLocaleString()} MAU)
- **Primary Success Metric**: ${activeProject.experiment.primaryMetric}

## 2. Architecture Decision & Alternatives Considered
- **Selected Pattern**: ${best.name} (Fit Score: ${best.score}/100)
- **Why It Fits**: ${best.why}
- **Primary Failure Mode to Mitigate**: ${best.failureMode}

## 3. Model Selection & Provenance
- **Selected Model**: ${activeModel.name} (\`${activeModel.exactId}\`, ${activeModel.provider})
- **Pricing**: $${activeModel.inputPrice.toFixed(2)}/1M in, $${activeModel.outputPrice.toFixed(2)}/1M out, $${activeModel.cacheReadPrice.toFixed(3)}/1M cached
- **TTFT Latency**: ${activeModel.ttftMs}ms (${activeModel.latencyProvenance})

## 4. 8-Bucket Unit Economics & ROI Summary
- **Total Monthly AI OpEx**: $${econResults.totalMonthlyAiOpEx.toFixed(2)}/mo
- **Cost per Successful Task (${activeProject.econ.verifiedSuccessPct}% rate)**: $${econResults.costPerSuccessfulTask.toFixed(4)}
- **Human Escalations (${activeProject.econ.humanEscalationPct}% rate)**: $${Math.round(econResults.monthlyHumanEscalationCost).toLocaleString()}/mo
- **Net Monthly Business ROI**: $${Math.round(econResults.netMonthlySavings).toLocaleString()}/mo

## 5. Deterministic Safety, Permissions & HITL Protocol
- **Authorization Gate**: Enforces a deterministic RBAC policy cap of $${activeProject.agent.maxCap}.00 USD and ${activeProject.agent.minConf}% confidence before invoking write tools.

## 6. Offline Evaluation & Online A/B Release Gate
- **Golden Pass Rate**: ${goldenPassRate.toFixed(1)}% across ${activeProject.goldenCases.length} cases.
- **Online Experiment Status**: Current recommendation = **${activeProject.experiment.obsGuardrailStatus === 'pass' ? 'SHIP' : 'ITERATE'}**.

## 7. Assumptions & Open Risks
${activeProject.assumptions}`;
  }, [activeProject, activeModel, econResults, evaluatedPatterns, goldenPassRate]);

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copied to clipboard!`);
    }).catch(() => {
      showToast(`${label} ready to copy`);
    });
  };

  // Batch Suite Runner
  const handleRunBatchSuite = (retrieval: string, guard: string, mode: string) => {
    setIsEvaluating(true);
    setTimeout(() => {
      updateActiveProject(p => {
        const updatedCases = p.goldenCases.map(tc => {
          if (guard === 'raw' && tc.category === 'Adversarial') {
            return { ...tc, status: 'FAIL' as const, faithfulness: 0.42 };
          }
          if (retrieval === 'naive' && tc.category === 'Policy Edge') {
            return { ...tc, status: 'FAIL' as const, faithfulness: 0.72 };
          }
          return { ...tc, status: 'PASS' as const, faithfulness: retrieval === 'parent' ? 0.98 : 0.96 };
        });

        const newPassRate = (updatedCases.filter(c => c.status === 'PASS').length / updatedCases.length) * 100;
        const newRunId = `RUN-${String(p.evalRunHistory.length + 1).padStart(3, '0')}`;
        const newHistory = [
          ...p.evalRunHistory,
          {
            runId: newRunId,
            ts: new Date().toISOString().slice(0, 16).replace('T', ' '),
            mode: mode.replace('_', ' ').toUpperCase(),
            modelId: p.econ.modelId,
            promptVer: 'prompt-v3.0-guarded',
            datasetVer: 'v2.1-golden',
            recall: retrieval === 'naive' ? 0.74 : 0.92,
            groundedness: 0.96,
            relevance: retrieval === 'naive' ? 0.74 : 0.92,
            passRate: newPassRate,
            diffPp: newPassRate - 71.0
          }
        ];

        return {
          ...p,
          goldenCases: updatedCases,
          evalRunHistory: newHistory
        };
      });

      setIsEvaluating(false);
      showToast('Batch evaluation completed');
    }, 400);
  };

  // Add audit log helper
  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'hash'>) => {
    const id = `AUD-${Math.floor(100 + Math.random() * 900)}`;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const hash = `sha256:${Math.random().toString(16).substring(2, 10)}...`;
    setAuditLogs(prev => [{ id, timestamp, hash, ...entry }, ...prev]);
  };

  const getTabTitle = (tabId: string) => {
    switch (tabId) {
      case 'overview': return 'Studio Overview & Guide';
      case 'docs': return 'PM Playbooks & System Documentation';
      case 'visualization': return 'Evaluation Metrics & Performance Trends';
      case 'economics': return 'Unit Economics & ROI Simulator';
      case 'models': return 'Model Benchmark Matrix & Scorer';
      case 'evals': return 'Golden Dataset & Regression Studio';
      case 'agentic': return 'Agentic Workflow & Deterministic HITL';
      case 'architect': return 'Architecture & PRD Builder';
      case 'experiments': return 'A/B Experiment Lab';
      case 'copilot': return 'AI PM Copilot';
      case 'security': return 'Enterprise Security & RBAC';
      case 'portfolio': return 'Portfolio Case Study';
      case 'tests': return 'Verification Math Tests';
      default: return 'Overview';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0c0e] text-[#e2e4e9]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#1a1d23] text-white shadow-xl border border-[#2e3440] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        onTriggerAction={(action) => {
          if (action === 'start_tour' || action === 'action:start_tour') handleStartTour();
          if (action === 'run_evals' || action === 'action:run_evals') handleRunBatchSuite('hybrid', 'guarded', 'deterministic');
          if (action === 'export_prd' || action === 'action:export_prd') copyToClipboard(prdMarkdown, 'PRD Markdown');
        }}
      />

      {/* Gemini API Key Modal */}
      {isGeminiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-card rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242830] pb-2.5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Configure Gemini API Key / Env</span>
              </h3>
              <button onClick={() => setIsGeminiModalOpen(false)} className="text-[#7d8590] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#8c949f] leading-relaxed">
              In Google AI Studio, Prism automatically accesses the runtime environment key. You can also paste a session key (stored in volatile JavaScript memory only, never written to disk or localStorage):
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={customApiKeyInput}
              onChange={(e) => setCustomApiKeyInput(e.target.value)}
              className="w-full bg-[#0b0c0e] border border-[#242830] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#484f58]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsGeminiModalOpen(false)}
                className="px-3 py-1.5 rounded-md bg-[#16181d] hover:bg-[#1f2328] text-xs text-[#8c949f]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customApiKeyInput.trim()) {
                    (window as unknown as { __PRISM_SESSION_GEMINI_KEY__?: string }).__PRISM_SESSION_GEMINI_KEY__ = customApiKeyInput.trim();
                    showToast('Gemini session key set');
                  }
                  setIsGeminiModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-md bg-white hover:bg-[#f0f3f6] text-xs font-semibold text-[#0b0c0e]"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Switcher Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-card rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242830] pb-2.5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#8c949f]" />
                <span>Switch Enterprise Identity Role</span>
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-[#7d8590] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {(['Chief AI Officer', 'Lead AI PM', 'ML / Prompt Engineer', 'Security & Compliance Auditor', 'Viewer'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setCurrentRole(r);
                    addAuditLog({
                      actor: 'user.switch',
                      role: r,
                      action: 'ROLE_SWITCHED',
                      category: 'AUTH',
                      severity: 'INFO',
                      details: `Identity switched to ${r}.`
                    });
                    setIsRoleModalOpen(false);
                    showToast(`Role: ${r}`);
                  }}
                  className={`w-full p-2.5 rounded-lg text-left text-xs transition flex items-center justify-between border ${
                    currentRole === r
                      ? 'bg-[#1e2229] border-[#363c48] text-white font-medium'
                      : 'bg-[#14161b] border-[#1f2328] text-[#8c949f] hover:bg-[#1a1d23]'
                  }`}
                >
                  <span>{r}</span>
                  {currentRole === r && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => {
          setActiveProjectId(id);
          showToast('Loaded project');
        }}
        onNewProject={() => {
          const newId = `proj_${Date.now()}`;
          const newProj = createDefaultProject(newId, 'New AI Initiative');
          setProjects([...projects, newProj]);
          setActiveProjectId(newId);
          showToast('Created new project');
        }}
        onDuplicateProject={() => {
          const dupId = `proj_${Date.now()}`;
          const copy = { ...activeProject, id: dupId, name: `${activeProject.name} (Copy)` };
          setProjects([...projects, copy]);
          setActiveProjectId(dupId);
          showToast('Duplicated project');
        }}
        onRenameProject={() => {
          const newName = prompt('Enter new project title:', activeProject.name);
          if (newName && newName.trim()) {
            updateActiveProject(p => ({ ...p, name: newName.trim() }));
            showToast('Renamed project');
          }
        }}
        onDeleteProject={() => {
          if (projects.length <= 1) {
            showToast('Cannot delete the only project');
            return;
          }
          setProjects(projects.filter(p => p.id !== activeProjectId));
          setActiveProjectId(projects[0].id);
          showToast('Deleted project');
        }}
        currentRole={currentRole}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        geminiConnected={Boolean((window as unknown as { __PRISM_SESSION_GEMINI_KEY__?: string }).__PRISM_SESSION_GEMINI_KEY__)}
        onOpenGeminiConfig={() => setIsGeminiModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onStartTour={handleStartTour}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar with clean Breadcrumb and primary actions */}
        <TopBar
          activeTabTitle={getTabTitle(activeTab)}
          projectName={activeProject.name}
          onSaveProject={saveWorkspace}
          onExportSpec={() => copyToClipboard(prdMarkdown, 'Full AI PM Specification')}
          onLoadPreset={(presetKey) => {
            if (presetKey === 'support') {
              updateActiveProject(p => ({
                ...p,
                econ: { ...p.econ, modelId: 'gpt-4o-mini', dailyQueries: 50000, inputTokens: 1200, ragChunks: 4, outputTokens: 350 },
                arch: { ...p.arch, featureName: 'Autonomous Order Dispute & Policy Copilot' }
              }));
            } else if (presetKey === 'rag') {
              updateActiveProject(p => ({
                ...p,
                econ: { ...p.econ, modelId: 'claude-sonnet-5-5', dailyQueries: 15000, inputTokens: 1800, ragChunks: 8, outputTokens: 650 },
                arch: { ...p.arch, featureName: 'Enterprise GST & Regulatory Compliance Copilot' }
              }));
            } else if (presetKey === 'scale') {
              updateActiveProject(p => ({
                ...p,
                econ: { ...p.econ, modelId: 'gemini-3-5-flash-lite', dailyQueries: 450000, inputTokens: 900, ragChunks: 3, outputTokens: 250 },
                arch: { ...p.arch, featureName: 'High-Scale Consumer Conversational Search' }
              }));
            }
            showToast('Loaded preset scenario');
          }}
          globalActiveModel={activeModel.name}
          globalCostPerSuccess={econResults.costPerSuccessfulTask}
          onStartTour={handleStartTour}
        />

        {/* Scrollable View Area with Generous Padding */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && (
            <LandingOverview
              onEnterStudio={() => setActiveTab('visualization')}
              onStartTour={handleStartTour}
              onNavigateToTab={(tabId) => setActiveTab(tabId)}
              onOpenDocs={() => setActiveTab('docs')}
            />
          )}

          {activeTab === 'docs' && <DocumentationTab />}

          {activeTab === 'visualization' && (
            <DataVisualizationSection
              models={models}
              activeModelId={activeModel.id}
              onSelectModel={(id) => {
                updateActiveProject(p => ({ ...p, econ: { ...p.econ, modelId: id } }));
                showToast(`Synced model to ${id}`);
              }}
              runHistory={activeProject.evalRunHistory}
              goldenPassRate={goldenPassRate}
              costPerTask={econResults.costPerSuccessfulTask}
            />
          )}

          {activeTab === 'economics' && (
            <UnitEconomicsTab
              params={activeProject.econ}
              onChangeParams={(newParams) => updateActiveProject(p => ({ ...p, econ: newParams }))}
              models={models}
              results={econResults}
              activeModel={activeModel}
              onCopyMemo={(txt) => copyToClipboard(txt, 'CFO Memo')}
              onResetToPreset={() => showToast('Economics reset')}
            />
          )}

          {activeTab === 'models' && (
            <ModelMatrixTab
              models={models}
              activeModelId={activeModel.id}
              onSelectModel={(id) => {
                updateActiveProject(p => ({ ...p, econ: { ...p.econ, modelId: id } }));
                showToast(`Selected model ${id}`);
              }}
              onAddCustomModel={(newModel) => {
                setModels([...models, newModel]);
                showToast(`Added custom model ${newModel.name}`);
              }}
            />
          )}

          {activeTab === 'evals' && (
            <EvalsTab
              goldenCases={activeProject.goldenCases}
              onToggleCaseGrade={(id) => {
                updateActiveProject(p => ({
                  ...p,
                  goldenCases: p.goldenCases.map(c => {
                    if (c.id === id) {
                      const nextStatus = c.status === 'PASS' ? 'FAIL' : (c.status === 'FAIL' ? 'REVIEW' : 'PASS');
                      return { ...c, status: nextStatus, grader: 'Human Graded' };
                    }
                    return c;
                  })
                }));
              }}
              onAddCase={(newCase) => {
                updateActiveProject(p => ({ ...p, goldenCases: [newCase, ...p.goldenCases] }));
                showToast('Added test case');
              }}
              onRunBatchSuite={handleRunBatchSuite}
              runHistory={activeProject.evalRunHistory}
              datasetVersion="v2.1-golden"
              promptVersion="prompt-v3.0-guarded"
              onDatasetVersionChange={() => {}}
              onPromptVersionChange={() => {}}
              isEvaluating={isEvaluating}
            />
          )}

          {activeTab === 'agentic' && (
            <AgenticTab
              minConfidence={activeProject.agent.minConf}
              onConfidenceChange={(val) => updateActiveProject(p => ({ ...p, agent: { ...p.agent, minConf: val } }))}
              maxCapUsd={activeProject.agent.maxCap}
              onCapChange={(val) => updateActiveProject(p => ({ ...p, agent: { ...p.agent, maxCap: val } }))}
              maxRetries={activeProject.agent.maxRetries}
              onRetriesChange={(val) => updateActiveProject(p => ({ ...p, agent: { ...p.agent, maxRetries: val } }))}
              rbacMode={activeProject.agent.rbacMode}
              onRbacModeChange={(mode) => updateActiveProject(p => ({ ...p, agent: { ...p.agent, rbacMode: mode } }))}
              costPerTask={econResults.costPerSuccessfulTask}
              onCopyPayload={(json) => copyToClipboard(json, 'Tool Payload')}
            />
          )}

          {activeTab === 'architect' && (
            <ArchitectureTab
              factors={activeProject.arch}
              onChangeFactors={(newFactors) => updateActiveProject(p => ({ ...p, arch: newFactors }))}
              patterns={evaluatedPatterns}
              activeModel={activeModel}
              econResults={econResults}
              goldenPassRate={goldenPassRate}
              expVerdict={activeProject.experiment.obsGuardrailStatus === 'pass' ? 'SHIP' : 'ITERATE'}
              onCopyPrd={(txt) => copyToClipboard(txt, 'PRD Markdown')}
              prdMarkdown={prdMarkdown}
            />
          )}

          {activeTab === 'experiments' && (
            <ExperimentLabTab
              config={activeProject.experiment}
              onChangeConfig={(newCfg) => updateActiveProject(p => ({ ...p, experiment: newCfg }))}
              costPerTask={econResults.costPerSuccessfulTask}
              onCopyReport={(txt) => copyToClipboard(txt, 'Experiment Report')}
              onCopySchema={(txt) => copyToClipboard(txt, 'Event Schema')}
            />
          )}

          {activeTab === 'copilot' && (
            <CopilotTab
              problemStatement={activeProject.problem}
              onProblemChange={(val) => updateActiveProject(p => ({ ...p, problem: val }))}
              assumptions={activeProject.assumptions}
              onAssumptionsChange={(val) => updateActiveProject(p => ({ ...p, assumptions: val }))}
              latencySlaMs={activeProject.latencySlaMs}
              onLatencySlaChange={(val) => updateActiveProject(p => ({ ...p, latencySlaMs: val }))}
              budgetCapMonthly={activeProject.budgetCapMonthly}
              onBudgetCapChange={(val) => updateActiveProject(p => ({ ...p, budgetCapMonthly: val }))}
              activeModel={activeModel}
              econResults={econResults}
              goldenPassRate={goldenPassRate}
              expVerdict={activeProject.experiment.obsGuardrailStatus === 'pass' ? 'SHIP' : 'ITERATE'}
              onCopyOutput={(txt) => copyToClipboard(txt, 'Copilot Deliverable')}
              geminiConnected={Boolean((window as unknown as { __PRISM_SESSION_GEMINI_KEY__?: string }).__PRISM_SESSION_GEMINI_KEY__)}
              onOpenGeminiConfig={() => setIsGeminiModalOpen(true)}
            />
          )}

          {activeTab === 'security' && (
            <EnterpriseSecurityTab
              currentRole={currentRole}
              onRoleChange={(r) => {
                setCurrentRole(r);
                showToast(`Switched active role to ${r}`);
              }}
              apiSecrets={apiSecrets}
              auditLogs={auditLogs}
              dlpRules={dlpRules}
              onToggleDlpRule={(id) => {
                setDlpRules(prev => prev.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
              }}
              onAddAuditLog={addAuditLog}
              autonomousCapUsd={activeProject.agent.maxCap}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioTab
              caseStudyMarkdown={`# AI PM Portfolio Case Study: ${activeProject.arch.featureName}
## Problem Statement
${activeProject.problem}

## Architecture Decision
${evaluatedPatterns[0]?.name}: ${evaluatedPatterns[0]?.why}

## Unit Economics & ROI
- Cost per Successful Task: $${econResults.costPerSuccessfulTask.toFixed(4)}
- Net Monthly Savings: $${Math.round(econResults.netMonthlySavings).toLocaleString()}/mo

## Evals & Golden Pass Rate
- Golden Pass Rate: ${goldenPassRate.toFixed(1)}% across ${activeProject.goldenCases.length} assertions.

## A/B Experiment Recommendation
- Final Decision: **${activeProject.experiment.obsGuardrailStatus === 'pass' ? 'SHIP' : 'ITERATE'}**`}
              onCopyCaseStudy={(txt) => copyToClipboard(txt, 'Case Study')}
              decisionLog={activeProject.decisionLog}
              onAddDecisionLog={(entryText) => {
                const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
                updateActiveProject(p => ({
                  ...p,
                  decisionLog: [{ ts: now, text: entryText }, ...p.decisionLog]
                }));
                showToast('Added decision log entry');
              }}
              onExportProjectJson={() => copyToClipboard(JSON.stringify(activeProject, null, 2), 'Project JSON')}
              onResetDemo={() => {
                setProjects([createDefaultProject('proj_default', '[DEMO] Order Dispute AI Copilot')]);
                setActiveProjectId('proj_default');
                showToast('Reset workspace');
              }}
            />
          )}

          {activeTab === 'tests' && <SelfTestsTab />}
        </main>
      </div>

      {/* Interactive Guided Product Tour */}
      <ProductTour
        isOpen={isTourOpen}
        currentStep={tourStep}
        totalSteps={TOUR_STEPS.length}
        onNext={handleNextTourStep}
        onPrev={handlePrevTourStep}
        onClose={() => setIsTourOpen(false)}
        onComplete={handleCompleteTour}
      />
    </div>
  );
}
