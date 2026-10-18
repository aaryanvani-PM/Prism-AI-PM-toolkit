export interface ExperimentTemplate {
  title: string;
  name: string;
  owner: string;
  objective: string;
  hypothesis: string;
  control: string;
  treatment: string;
  eligibility: string;
  exposure: string;
  primaryMetric: string;
  guardrails: string;
  guidance: string;
  baseline: number;
  mde: number;
}

export const EXPERIMENT_TEMPLATES: Record<string, ExperimentTemplate> = {
  llm_compare: {
    title: 'Template 1: Comparing Two LLMs (GPT-4o-mini vs. Claude Haiku 5.5)',
    name: 'EXP-101: GPT-4o-mini vs Claude Haiku 5.5 Inference Swap',
    owner: 'Core AI Platform • AI PM',
    objective: 'Reduce token cost per successful task by 20% while maintaining parity on verified task resolution and tool-call schema validity.',
    hypothesis: 'If we route tier-1 dispute resolution from GPT-4o-mini (Control) to Claude Haiku 5.5 (Treatment), then Cost per Successful Task will drop by >=18% while Verified Resolution Rate remains within a non-inferiority margin of -1.0 percentage points (baseline 68.0%).',
    control: 'OpenAI GPT-4o-mini ($0.15/$0.60 per 1M)',
    treatment: 'Anthropic Claude Haiku 5.5 ($0.10/$0.50 per 1M)',
    eligibility: 'All English tier-1 dispute sessions with order value <= $75',
    exposure: 'First LLM inference call invoked by dispute orchestrator',
    primaryMetric: 'Verified Task Success Rate & Cost per Successful Task',
    guardrails: 'Tool JSON Schema Validity >=99.0%, p95 Latency <=1,800ms, Safety Refusal False-Positive <=1.0%',
    guidance: 'Offline Screening: Run both models on the 150-case Golden Eval Set first to verify JSON schema adherence and Ragas Faithfulness. Online A/B Required: Only run an online test to measure multi-turn user abandonment and real-world tail latency.',
    baseline: 68.0,
    mde: 2.0
  },
  prompt_opt: {
    title: 'Template 2: Prompt Optimization (System Prompt v2 vs. Structured CoT v3)',
    name: 'EXP-102: Few-Shot Policy Rubric Prompt v3',
    owner: 'Support Copilot Team • AI PM',
    objective: 'Decrease false-positive human escalations caused by ambiguous policy interpretation.',
    hypothesis: 'If we add a structured 3-step policy verification rubric and explicit edge-case examples to the system prompt (Treatment), then False-Positive Human Escalation Rate will decrease by at least 3.5 percentage points (from 24.0% to <=20.5%) without increasing policy leakage.',
    control: 'Zero-shot System Prompt v2.0 (850 tokens)',
    treatment: 'Few-Shot Rubric + Prefix-Cached System Prompt v3.0 (1,450 tokens)',
    eligibility: 'Dispute sessions requiring policy lookup tool',
    exposure: 'Prompt builder assigns session to prompt version v2 or v3',
    primaryMetric: 'Verified Autonomous Resolution Rate (without human escalation)',
    guardrails: 'Policy Violation Payout Rate <=0.3%, Prompt Cache Hit Rate >=60%',
    guidance: 'Offline Screening: 80% of prompt iteration should be completed offline against golden regression sets. Online A/B Required: Validate that longer system prompts do not degrade TTFT or alter user follow-up behavior.',
    baseline: 64.0,
    mde: 3.5
  },
  rag_opt: {
    title: 'Template 3: RAG Retrieval Optimization (Dense Vector vs. Hybrid BM25 + Cross-Encoder)',
    name: 'EXP-103: Hybrid BM25 + Cross-Encoder Reranking',
    owner: 'Knowledge Platform • AI PM',
    objective: 'Eliminate retrieval misses on exact SKU codes, GST section numbers, and policy clauses.',
    hypothesis: 'If we replace pure dense vector search (Control) with Hybrid Dense + BM25 + Cross-Encoder Top-5 Reranking (Treatment), then Citation-Grounded Answer Resolution will increase by +4.0 percentage points (from 58.0% to 62.0%) with <150ms added p95 latency.',
    control: 'Dense Vector Search Only (Top-8 chunks, 512 tokens)',
    treatment: 'Hybrid Dense + Sparse BM25 (Top-25) -> Cross-Encoder Reranker (Top-5)',
    eligibility: 'Queries containing policy clauses, regulatory codes, or SKU identifiers',
    exposure: 'Retrieval service executes search query for user prompt',
    primaryMetric: 'Grounded Resolution Rate (Verified helpful + zero thumbs-down)',
    guardrails: 'Reranker p95 Latency <=180ms, Hallucination Rate <=1.5%',
    guidance: 'Offline Screening: Measure Context Recall@5 and MRR offline first; do not run an online A/B test unless offline Recall@5 improves by >=5%. Online A/B Required: Measure whether better chunks translate to higher user task completion.',
    baseline: 58.0,
    mde: 4.0
  },
  ft_vs_base: {
    title: 'Template 4: Base Frontier Model + RAG vs. LoRA Fine-Tuned 8B Model',
    name: 'EXP-104: Fine-Tuned Llama-3 8B Classifier vs Prompted Frontier API',
    owner: 'ML Systems & Product • AI PM',
    objective: 'Cut inference latency and per-request cost on high-volume structured triage while preserving accuracy.',
    hypothesis: 'If we replace prompted Frontier API calls (Control) with a LoRA fine-tuned 8B model trained on 12,000 golden triage traces (Treatment), then p95 latency will drop by 45% and inference cost by 60% while maintaining task accuracy within 1.5 percentage points of Control (76.0%).',
    control: 'Prompted Frontier API with 5-shot examples',
    treatment: 'LoRA Fine-Tuned 8B Model with Outlines JSON Grammar Constraint',
    eligibility: 'High-volume tier-1 intent & policy classification requests',
    exposure: 'Triage router invokes model endpoint',
    primaryMetric: 'Downstream Task Resolution Rate & Cost per 1,000 Triage Decisions',
    guardrails: 'Out-of-distribution (OOD) Drift Rate <=2.0%, GPU Endpoint Availability >=99.95%',
    guidance: 'Offline Screening: Fine-tuning requires strict held-out test set evaluation and OOD drift checks before online exposure. Online A/B Required: Test resilience to live distribution shift.',
    baseline: 76.0,
    mde: 2.0
  },
  agent_vs_workflow: {
    title: 'Template 5: Autonomous ReAct Agent vs. Deterministic State-Machine Workflow',
    name: 'EXP-105: Open-Ended Agent vs Deterministic Directed Graph',
    owner: 'Agentic Core • AI PM',
    objective: 'Determine whether autonomous multi-hop planning outperforms a deterministic 4-step workflow on complex disputes.',
    hypothesis: 'If we use a constrained Deterministic State-Machine Workflow (Treatment) instead of an open-ended ReAct Agent loop (Control), then Task Completion Rate will improve by +5.0 percentage points (from 65.0% to 70.0%) while cutting unnecessary tool retries by 70%.',
    control: 'Open-ended ReAct Agent Loop (up to 8 autonomous tool iterations)',
    treatment: 'Deterministic 4-Node State Machine (Guard -> Fetch Order -> Verify Policy -> Gate)',
    eligibility: 'Multi-step order & billing dispute flows',
    exposure: 'Orchestrator initializes session state machine',
    primaryMetric: 'End-to-End Task Completion without Timeout or Loop Abort',
    guardrails: 'Unnecessary Tool Calls/Session <=1.6, Unauthorized Action Attempts = 0, p95 Latency <=2.5s',
    guidance: 'Offline Screening: Replay 100 recorded failure traces to count loop cycles and invalid tool arguments. Online A/B Required: Measure real user drop-off during multi-step tool execution.',
    baseline: 65.0,
    mde: 5.0
  },
  model_routing: {
    title: 'Template 6: Single Frontier Model vs. Intent-Based Model Cascade/Routing',
    name: 'EXP-106: Semantic Router Cascade (Haiku 5.5 -> Sonnet 5.5)',
    owner: 'AI Efficiency Team • AI PM',
    objective: 'Optimize blended unit economics by routing simple queries to a fast model and complex reasoning to a frontier model.',
    hypothesis: 'If we introduce a lightweight complexity router sending 75% of routine queries to Claude Haiku 5.5 and 25% of complex disputes to Claude Sonnet 5.5 (Treatment) vs sending 100% to Sonnet 5.5 (Control), blended inference cost will drop by 62% while overall Task Resolution stays within 1.0 pp of Control (74.0%).',
    control: '100% traffic routed to Frontier Model (Claude Sonnet 5.5)',
    treatment: 'Semantic Complexity Router (75% Fast Tier / 25% Frontier Tier)',
    eligibility: 'All incoming support & policy assistant requests',
    exposure: 'Router classifier assigns tier and invokes target model',
    primaryMetric: 'Blended Cost per Successful Task & Overall Resolution Rate',
    guardrails: 'Router Misclassification Escalation Rate <=4.0%, Router Overhead <=35ms',
    guidance: 'Offline Screening: Calibrate router threshold on labeled simple vs hard queries offline. Online A/B Required: Verify users do not experience jarring quality drops on borderline queries.',
    baseline: 74.0,
    mde: 2.0
  },
  ai_recs: {
    title: 'Template 7: Generative AI Contextual Recommendations vs. Collaborative Filtering',
    name: 'EXP-107: LLM Reasoned Bundle Recommendations',
    owner: 'Growth & Merchandising • AI PM',
    objective: 'Increase attach conversion rate on complex accessory bundles where cold-start collaborative filtering fails.',
    hypothesis: 'If we serve LLM-curated compatibility recommendations with grounded 1-line explanations (Treatment) vs standard matrix factorization (Control), Cart Attach Conversion Rate will increase by +1.5 percentage points (from 8.5% to 10.0%).',
    control: 'Standard Collaborative Filtering Carousel',
    treatment: 'Pre-computed + Cached LLM Compatibility Recommendations',
    eligibility: 'Product detail views on electronics & home appliances',
    exposure: 'Recommendation widget scrolled into viewport (>=50% visible)',
    primaryMetric: '7-Day Net Attach Purchase Conversion (net of returns)',
    guardrails: 'Incompatible Item Return Rate <=1.2%, Page Load Impact <=50ms',
    guidance: 'Offline Screening: Audit catalog compatibility accuracy offline. Online A/B Required: Recommendations must always be validated online for novelty decay and actual purchase lift.',
    baseline: 8.5,
    mde: 1.5
  },
  ai_search: {
    title: 'Template 8: Conversational Semantic AI Search vs. Keyword BM25 Search',
    name: 'EXP-108: Hybrid Semantic + Intent Query Rewriting Search',
    owner: 'Search & Discovery • AI PM',
    objective: 'Reduce zero-result searches and improve search-to-checkout conversion on natural-language queries.',
    hypothesis: 'If we enable LLM query decomposition + hybrid vector search on queries >=4 words (Treatment) vs lexical BM25 search (Control), Search Success Rate (click/purchase within session) will increase by +3.0 percentage points (from 44.0% to 47.0%).',
    control: 'Lexical BM25 Search Engine',
    treatment: 'LLM Query Rewrite + Hybrid Vector/Keyword Search',
    eligibility: 'User search queries with >= 4 tokens or natural-language filters',
    exposure: 'Search results page rendered for eligible long-tail query',
    primaryMetric: 'Search-to-Action Conversion Rate within 30m Session',
    guardrails: 'Zero-Result Rate <=2.0%, Search p95 Latency <=450ms, Irrelevant Attribute Hallucination <=1.0%',
    guidance: 'Offline Screening: Evaluate NDCG@10 on historical long-tail query logs first. Online A/B Required: Measure real conversion and latency sensitivity.',
    baseline: 44.0,
    mde: 3.0
  },
  support_agent: {
    title: 'Template 9: AI Support Dispute Agent vs. Legacy Decision-Tree Bot',
    name: 'EXP-204: Hybrid RAG + Tool Dispute Agent',
    owner: 'Checkout & Support Ops • AI PM',
    objective: 'Increase verified first-contact dispute resolution without increasing unauthorized refund leakage or latency.',
    hypothesis: 'If we replace the legacy keyword bot (Control) with a Hybrid RAG + Tool-Calling Dispute Agent (Treatment) for tier-1 order disputes, then Verified Task Resolution Rate will increase by at least +3.0 percentage points (from 62.0% to >=65.0%) while keeping p95 latency <=2,200ms and policy violation rate <=0.5%.',
    control: 'Legacy Decision-Tree + Keyword Bot',
    treatment: 'GPT-4o-mini + Hybrid RAG + Policy Tool Gate',
    eligibility: 'Logged-in users opening an order dispute <= $75',
    exposure: 'User sends 1st dispute message & routing service responds',
    primaryMetric: 'Verified Resolution Rate (No re-open in 7d)',
    guardrails: 'p95 Latency <=2.2s, Policy Leakage <=0.5%, Cost/Task <=$0.008',
    guidance: 'Offline Screening: Pass 95%+ of Golden Dataset & 100% of Red-Team Prompt Injection tests offline before exposing 1% canary traffic. Online A/B Required: Measure true 7-day ticket re-open rate and CSAT.',
    baseline: 62.0,
    mde: 3.0
  },
  ai_onboarding: {
    title: 'Template 10: Interactive AI Setup Copilot vs. Static Step-by-Step Onboarding',
    name: 'EXP-110: AI Workspace Configuration Copilot',
    owner: 'Activation & Onboarding • AI PM',
    objective: 'Increase Day-7 activation rate for new B2B workspaces by automating initial schema and workflow setup.',
    hypothesis: 'If new accounts receive an interactive AI Setup Copilot that generates their initial workflow from a natural-language description (Treatment) vs static wizard forms (Control), Day-7 Workspace Activation Rate will rise by +4.5 percentage points (from 31.0% to 35.5%).',
    control: 'Static 6-Step Form Onboarding Wizard',
    treatment: 'Natural-Language AI Setup Copilot + Editable Preview',
    eligibility: 'New B2B accounts created during experiment window (Account-level randomization)',
    exposure: 'Account admin reaches onboarding step 1',
    primaryMetric: 'Day-7 Account Activation (Published >=1 live workflow)',
    guardrails: 'Setup Abandonment Rate <=25%, Invalid Config Error Rate <=2.0%',
    guidance: 'Offline Screening: Test schema generation validity across 50 industry prompts. Online A/B Required: Randomize at the Account ID level to prevent cross-user contamination within the same organization.',
    baseline: 31.0,
    mde: 4.5
  }
};

export const EXP_CHECKLIST_ITEMS = [
  { id: 'chk_assign', label: '1. Deterministic hashing on Randomization Unit (murmurhash3(user_id + salt))', checked: true },
  { id: 'chk_exposure', label: '2. Log exposure ONLY when variant treatment is actually triggered (no diluted intent-to-treat)', checked: true },
  { id: 'chk_elig', label: '3. Pre-assignment eligibility filter logged prior to variant branch', checked: true },
  { id: 'chk_metric', label: '4. Primary metric denominator locked to exposed eligible units', checked: true },
  { id: 'chk_dedup', label: '5. Idempotency & event deduplication key (session_id + turn_id)', checked: true },
  { id: 'chk_missing', label: '6. Dead-letter queue & null/timeout imputation rules defined', checked: true },
  { id: 'chk_contam', label: '7. Cross-session / account-level spillover & cache isolation verified', checked: true },
  { id: 'chk_overlap', label: '8. Mutual exclusion layer configured against orthogonal prompt experiments', checked: true },
  { id: 'chk_window', label: '9. 7-day maturation window enforced to capture ticket re-opens', checked: true },
  { id: 'chk_version', label: '10. Exact model snapshot ID, temperature, and prompt SHA-256 logged per event', checked: true },
  { id: 'chk_error', label: '11. HTTP 429/503 retries, schema parse failures, and guardrail blocks logged', checked: true },
  { id: 'chk_cost', label: '12. Prompt/completion/cached token counts & TTFT/total latency ms recorded', checked: true },
  { id: 'chk_privacy', label: '13. PII redaction filter applied before writing prompt traces to analytics warehouse', checked: true },
  { id: 'chk_rollback', label: '14. Automated kill-switch trigger if policy leakage >0.5% or SRM p <0.001', checked: true }
];
