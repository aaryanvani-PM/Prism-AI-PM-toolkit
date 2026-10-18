export type ModelTier = 'fast' | 'frontier';

export type PricingProvenance = 
  | 'Verified Pricing'
  | 'Provider Spec'
  | 'Independent Benchmark'
  | 'User Eval'
  | 'Illustrative Estimate'
  | 'Unverified';

export interface ModelSpec {
  id: string;
  exactId: string;
  name: string;
  provider: string;
  tier: ModelTier;
  inputPrice: number;       // $ / 1M tokens
  outputPrice: number;      // $ / 1M tokens
  cacheReadPrice: number;   // $ / 1M tokens
  pricingDate: string;
  pricingSource: string;
  pricingProvenance: PricingProvenance;
  contextK: number;
  modalities: string;
  supportsTools: boolean;
  supportsJson: boolean;
  ttftMs: number;
  latencyProvenance: PricingProvenance;
  reasoningScore: number;   // 0-100
  qualityProvenance: PricingProvenance;
  speedScore: number;
  costScore: number;
  contextScore: number;
  isPareto?: boolean;
  passesHardConstraints?: boolean;
  fitScore?: number;
}

export interface EconParams {
  modelId: string;
  dailyQueries: number;
  inputTokens: number;
  ragChunks: number;
  outputTokens: number;
  cacheEligiblePct: number;
  cacheHitPct: number;
  verifiedSuccessPct: number;
  humanEscalationPct: number;
  humanCost: number;
  retryRatePct: number;
  toolCallsPerReq: number;
  retrievalCostPer1k: number;
  toolApiCostPer1k: number;
  fixedInfraMonthly: number;
  trainingAmortMonthly: number;
  monthlyActiveUsers: number;
  gpuUtilizationPct: number;
  selfHostMlops: number;
}

export interface EconResults {
  dailyQueries: number;
  monthlyQueries: number;
  totalInputTokens: number;
  outputTokens: number;
  effectiveCacheFraction: number;
  effectiveSuccessPct: number;
  effectiveEscalationPct: number;
  abandonmentPct: number;
  wasClamped: boolean;
  monthlyUncachedInputCost: number;
  monthlyCachedInputCost: number;
  monthlyOutputTokenCost: number;
  monthlyBaseInference: number;
  monthlyRetrievalCost: number;
  monthlyAgentToolCost: number;
  monthlyRetryCost: number;
  fixedInfraMonthly: number;
  trainingAmortMonthly: number;
  totalMonthlyAiOpEx: number;
  monthlyHumanEscalationCost: number;
  totalPostAiMonthlyOpEx: number;
  monthlyCacheSavings: number;
  costPerRequest: number;
  costPer1kRequests: number;
  costPerSuccessfulTask: number;
  costPerActiveUser: number;
  grossAvoidedHumanCost: number;
  netMonthlySavings: number;
  netRoiPct: number;
  netMarginPct: number;
  gpuNodesNeeded: number;
  monthlySelfHostTotal: number;
  breakEvenDaily: number;
}

export type EvalGradeStatus = 'PASS' | 'FAIL' | 'REVIEW';

export interface GoldenCase {
  id: string;
  category: string;
  prompt: string;
  expected: string;
  assertion: string;
  faithfulness: number;
  status: EvalGradeStatus;
  grader: string;
}

export interface EvalRunHistoryItem {
  runId: string;
  ts: string;
  mode: string;
  modelId: string;
  promptVer: string;
  datasetVer: string;
  recall: number;
  groundedness: number;
  faithfulness?: number;
  relevance?: number;
  passRate: number;
  diffPp: number;
}

export interface AgentScenario {
  title: string;
  claimAmount: number;
  confidence: number;
  daysSinceDelivery: number;
  category: string;
  incident: string;
  orderId: string;
  isInjection: boolean;
  isRetryRecovery: boolean;
}

export interface ArchFactors {
  featureName: string;
  q1: 'dynamic' | 'static';
  q2: 'strict' | 'creative';
  q3: 'tools' | 'readonly';
  q4: 'standard' | 'niche';
  q5: 'fixed_steps' | 'open_ended';
  q6: 'irreversible' | 'reversible';
  q7: 'low' | 'high';
  q8: 'bimodal' | 'uniform';
  q9: 'cloud_api' | 'airgapped';
  q10: 'lean' | 'dedicated';
}

export interface ArchPattern {
  id: string;
  name: string;
  score: number;
  why: string;
  failureMode: string;
}

export interface ExperimentConfig {
  templateKey: string;
  name: string;
  owner: string;
  objective: string;
  hypothesis: string;
  controlDesc: string;
  treatmentDesc: string;
  eligibility: string;
  exposure: string;
  primaryMetric: string;
  guardrails: string;
  randUnit: 'user' | 'account' | 'session' | 'event';
  metricType: 'binary' | 'continuous';
  treatmentSplit: number;
  dailyEligible: number;
  baselineVal: number;
  mdeVal: number;
  alpha: number;
  power: number;
  stdDev: number;
  practicalThreshold: number;
  dataSourceMode: string;
  obsControlN: number;
  obsControlSucc: number;
  obsTreatN: number;
  obsTreatSucc: number;
  obsControlSd: number;
  obsTreatSd: number;
  obsGuardrailStatus: 'pass' | 'warn' | 'fail';
}

export interface DecisionLogEntry {
  ts: string;
  text: string;
  author?: string;
}

export interface ProjectState {
  id: string;
  name: string;
  isDemo?: boolean;
  updatedAt: string;
  problem: string;
  assumptions: string;
  latencySlaMs: number;
  budgetCapMonthly: number;
  econ: EconParams;
  arch: ArchFactors;
  agent: {
    minConf: number;
    maxCap: number;
    maxRetries: number;
    rbacMode: 'strict' | 'confidence_only';
  };
  experiment: ExperimentConfig;
  goldenCases: GoldenCase[];
  evalRunHistory: EvalRunHistoryItem[];
  decisionLog: DecisionLogEntry[];
}

// Enterprise Security Types
export type UserRole = 'Chief AI Officer' | 'Lead AI PM' | 'ML / Prompt Engineer' | 'Security & Compliance Auditor' | 'Viewer';

export interface RolePermissions {
  canApproveFinancialCap: boolean;
  canViewUnredactedPii: boolean;
  canModifyGuardrails: boolean;
  canRotateApiKeys: boolean;
  canTriggerCanary: boolean;
  canExportData: boolean;
}

export interface ApiSecretItem {
  id: string;
  name: string;
  provider: string;
  maskedKey: string;
  envVar: string;
  status: 'active' | 'expiring' | 'rotated';
  lastRotated: string;
  fingerprint: string;
  scope: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  category: 'AUTH' | 'GUARDRAIL' | 'FINANCIAL' | 'EVAL' | 'EXPERIMENT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  hash: string;
  details: string;
}

export interface DlpRule {
  id: string;
  name: string;
  patternName: string;
  enabled: boolean;
  action: 'MASK' | 'BLOCK' | 'TOKENIZE';
}
