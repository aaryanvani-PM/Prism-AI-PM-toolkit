import React, { useState } from 'react';
import { AGENT_SCENARIOS } from '../data/goldenCases';
import { AgentScenario } from '../types';
import { Copy } from 'lucide-react';

interface AgenticTabProps {
  minConfidence: number;
  onConfidenceChange: (val: number) => void;
  maxCapUsd: number;
  onCapChange: (val: number) => void;
  maxRetries: number;
  onRetriesChange: (val: number) => void;
  rbacMode: 'strict' | 'confidence_only';
  onRbacModeChange: (mode: 'strict' | 'confidence_only') => void;
  costPerTask: number;
  onCopyPayload: (jsonText: string) => void;
}

export const AgenticTab: React.FC<AgenticTabProps> = ({
  minConfidence,
  onConfidenceChange,
  maxCapUsd,
  onCapChange,
  maxRetries,
  onRetriesChange,
  rbacMode,
  onRbacModeChange,
  costPerTask,
  onCopyPayload
}) => {
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>('valid');
  const sc: AgentScenario = AGENT_SCENARIOS[activeScenarioKey] || AGENT_SCENARIOS.valid;

  let steps: Array<{ step: string; status: string; detail: string; border: string }> = [];
  let payload: Record<string, unknown> = {};
  let finalDecision = '';
  let auditText = '';
  let totalLatency = 1130;

  if (sc.isInjection) {
    totalLatency = 145;
    steps = [
      { step: '1. Injection Shield', status: 'BLOCKED', detail: 'Detected prompt injection & system override attempt (120ms)', border: 'border-rose-500/40 text-rose-300' },
      { step: '2. Database Query', status: 'SKIPPED', detail: 'Execution stopped before database or tool call', border: 'border-[#242830] text-[#656d76]' },
      { step: '3. Policy Verification', status: 'SKIPPED', detail: 'Zero downstream tokens spent on reasoning', border: 'border-[#242830] text-[#656d76]' },
      { step: '4. RBAC Gate', status: 'SAFE REFUSAL', detail: 'Unauthorized payout blocked by deterministic token', border: 'border-rose-500/40 text-rose-300' }
    ];
    finalDecision = 'GUARDRAIL_INTERCEPTED';
    auditText = 'Adversarial instruction override intercepted before invoking tools. Even if the LLM hallucinated 99% self-reported confidence, the deterministic RBAC token gate blocks unverified payouts.';
    payload = {
      simulation_notice: "DRY_RUN_ONLY_NO_LIVE_EXECUTION",
      guardrail_triggered: "PROMPT_INJECTION_SHIELD",
      order_id: sc.orderId,
      action_taken: "SAFE_REFUSAL",
      payout_authorized_usd: 0.00,
      rbac_policy_token_valid: false
    };
  } else if (sc.isRetryRecovery) {
    const recovered = maxRetries >= 1;
    totalLatency = recovered ? 1350 : 420;
    steps = [
      { step: '1. Order Lookup (Attempt 1)', status: 'HTTP 503 ERROR', detail: 'API timeout & malformed date string on attempt 1 (420ms)', border: 'border-amber-500/40 text-amber-300' },
      { step: '2. Retry Controller (Attempt 2)', status: recovered ? 'RECOVERED (200 OK)' : 'ABORTED', detail: recovered ? 'Exponential backoff + schema repair succeeded (310ms)' : 'Max retries exceeded', border: recovered ? 'border-emerald-500/40 text-emerald-300' : 'border-rose-500/40 text-rose-300' },
      { step: '3. Verify Policy', status: recovered ? 'ELIGIBLE' : 'SKIPPED', detail: recovered ? `4 days post-delivery <= 30d window (280ms)` : 'Skipped due to upstream error', border: recovered ? 'border-[#363c48] text-white' : 'border-[#242830] text-[#656d76]' },
      { step: '4. Resolution Gate', status: recovered ? 'APPROVED' : 'ESCALATED', detail: recovered ? `Signed RBAC token + $${sc.claimAmount} <= $${maxCapUsd} cap (340ms)` : 'Routed to human agent', border: recovered ? 'border-emerald-500/40 text-emerald-300' : 'border-amber-500/40 text-amber-300' }
    ];
    finalDecision = recovered ? 'RECOVERED_AND_RESOLVED' : 'ESCALATE_ON_TOOL_ERROR';
    auditText = recovered
      ? `Demonstrates bounded retry recovery (maxRetries=${maxRetries}). Attempt 1 failed schema validation; orchestrator corrected parameters with structured feedback.`
      : `With Max Retries = 0, transient API errors immediately escalate to humans, increasing handling cost.`;
    payload = {
      simulation_notice: "DRY_RUN_ONLY_NO_LIVE_EXECUTION",
      tool_invoked: recovered ? "execute_dispute_resolution" : "escalate_to_human_agent",
      retry_count: recovered ? 1 : 0,
      arguments: {
        order_id: sc.orderId,
        resolution_type: recovered ? "FULL_REFUND" : "TOOL_TIMEOUT_ESCALATION",
        amount_usd: recovered ? sc.claimAmount : 0,
        rbac_policy_check: "PASSED"
      }
    };
  } else {
    const exceedsCap = sc.claimAmount > maxCapUsd;
    const lowConf = sc.confidence < minConfidence;
    const needsHitl = (rbacMode === 'strict' && exceedsCap) || lowConf;
    const isPolicyExpired = sc.daysSinceDelivery > 30;

    steps = [
      { step: '1. Intent Classification', status: 'PASSED (99%)', detail: 'Legitimate customer dispute intent (110ms)', border: 'border-[#363c48] text-white' },
      { step: '2. Order Details', status: '200 OK', detail: `Order ${sc.orderId}: $${sc.claimAmount}, ${sc.daysSinceDelivery}d since delivery (290ms)`, border: 'border-[#363c48] text-white' },
      { step: '3. Verify Return Policy', status: isPolicyExpired ? 'EXPIRED' : 'ELIGIBLE', detail: `Category: ${sc.category} · 30d window (340ms)`, border: isPolicyExpired ? 'border-rose-500/40 text-rose-300' : 'border-[#363c48] text-white' }
    ];

    if (isPolicyExpired) {
      steps.push({
        step: '4. Policy Gate',
        status: 'REJECTED',
        detail: `Delivered ${sc.daysSinceDelivery}d ago (>30d). Courteous refusal generated (380ms)`,
        border: 'border-rose-500/40 text-rose-300'
      });
      finalDecision = 'REJECT_WITH_POLICY';
      auditText = 'Deterministic rule check (`days_since_delivery > 30`) overrides model tendency to appease.';
      payload = {
        simulation_notice: "DRY_RUN_ONLY_NO_LIVE_EXECUTION",
        tool_invoked: "execute_dispute_resolution",
        arguments: {
          order_id: sc.orderId,
          resolution_type: "REJECT_WITH_POLICY",
          amount_usd: 0.00,
          deterministic_rule: "DAYS_SINCE_DELIVERY_EXCEEDS_30"
        }
      };
    } else if (needsHitl) {
      const reason = exceedsCap
        ? `Claim ($${sc.claimAmount}) exceeds deterministic financial cap ($${maxCapUsd})`
        : `Calibrated confidence (${sc.confidence}%) below threshold (${minConfidence}%)`;
      steps.push({
        step: '4. HITL Review Gate',
        status: 'ESCALATED',
        detail: `${reason} (410ms)`,
        border: 'border-amber-500/40 text-amber-300'
      });
      finalDecision = 'ESCALATE_TO_HUMAN_AGENT';
      auditText = `Action blocked from auto-execution because ${reason}. Summary pre-populated for human reviewer.`;
      payload = {
        simulation_notice: "DRY_RUN_ONLY_NO_LIVE_EXECUTION",
        tool_invoked: "escalate_to_human_agent",
        arguments: {
          order_id: sc.orderId,
          risk_level: "HIGH",
          claim_amount_usd: sc.claimAmount,
          autonomous_cap_usd: maxCapUsd,
          calibrated_confidence: sc.confidence / 100
        }
      };
    } else {
      steps.push({
        step: '4. Authorization Gate',
        status: 'AUTO-APPROVED',
        detail: `Signed policy token + $${sc.claimAmount} <= $${maxCapUsd} cap & Conf ${sc.confidence}% >= ${minConfidence}% (390ms)`,
        border: 'border-emerald-500/40 text-emerald-300'
      });
      finalDecision = 'EXECUTE_DISPUTE_RESOLUTION';
      auditText = `Authorized safely: both deterministic policy check ($${sc.claimAmount} <= $${maxCapUsd}) and calibrated confidence (${sc.confidence}% >= ${minConfidence}%) passed.`;
      payload = {
        simulation_notice: "DRY_RUN_ONLY_NO_LIVE_EXECUTION",
        tool_invoked: "execute_dispute_resolution",
        arguments: {
          order_id: sc.orderId,
          resolution_type: "FULL_REFUND",
          amount_usd: sc.claimAmount,
          rbac_policy_enforced: rbacMode === 'strict',
          calibrated_confidence: sc.confidence / 100
        }
      };
    }
  }

  const payloadString = JSON.stringify(payload, null, 2);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-[#1f2328]">
        <h2 className="text-xl font-bold tracking-tight text-white">Agentic Workflow &amp; Deterministic HITL Simulator</h2>
        <p className="text-xs text-[#8c949f] mt-1">
          Combine hard financial RBAC policies with calibrated confidence thresholds to prevent unauthorized autonomous spending.
        </p>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Completion Rate</div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">92.5%</div>
          <div className="text-xs text-[#8c949f]">Valid non-adversarial tasks</div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Schema Argument Validity</div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">98.4%</div>
          <div className="text-xs text-[#8c949f]">Strict JSON validation</div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Unauthorized Payouts Blocked</div>
          <div className="text-2xl font-semibold text-[#34d399] tracking-tight tabular-nums">100%</div>
          <div className="text-xs text-[#8c949f]">Deterministic RBAC cap enforced</div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Cost / Successful Task</div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">${costPerTask.toFixed(4)}</div>
          <div className="text-xs text-[#8c949f]">Including tool retries</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Policy & Threshold Configurator */}
        <div className="lg:col-span-5 surface-card rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Policy &amp; Confidence Thresholds</h3>
            <p className="text-xs text-[#7d8590]">Deterministic limits governing write operations</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8c949f]">Min Calibrated Confidence</span>
                <span className="text-white font-mono tabular-nums">{minConfidence}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="98"
                value={minConfidence}
                onChange={(e) => onConfidenceChange(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8c949f]">Autonomous Authorization Cap</span>
                <span className="text-white font-mono tabular-nums">${maxCapUsd.toFixed(2)} USD</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={maxCapUsd}
                onChange={(e) => onCapChange(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1f2328] text-xs">
              <div>
                <label className="block text-[#7d8590] mb-1">Max Retries</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={maxRetries}
                  onChange={(e) => onRetriesChange(Number(e.target.value))}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 font-mono text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[#7d8590] mb-1">Policy Token</label>
                <select
                  value={rbacMode}
                  onChange={(e) => onRbacModeChange(e.target.value as 'strict' | 'confidence_only')}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2 py-1.5 text-white text-xs"
                >
                  <option value="strict">Enforce Token</option>
                  <option value="confidence_only">Confidence Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scenario Selection */}
          <div className="pt-4 border-t border-[#1f2328] space-y-2">
            <div className="text-xs text-[#7d8590]">Simulated Trace Scenarios:</div>
            <div className="space-y-1.5">
              {Object.entries(AGENT_SCENARIOS).map(([key, item]) => {
                const isSelected = activeScenarioKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveScenarioKey(key)}
                    className={`w-full text-left p-3 rounded-lg transition border text-xs ${
                      isSelected
                        ? 'bg-[#1a1d23] border-[#363c48] text-white'
                        : 'bg-[#14161b] border-[#1f2328] text-[#8c949f] hover:bg-[#16181d]'
                    }`}
                  >
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="text-[11px] text-[#7d8590] mt-0.5">Order {item.orderId} · Claim: ${item.claimAmount}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Multi-Step Execution Trace */}
        <div className="lg:col-span-7 surface-card rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2328]">
              <div>
                <h3 className="text-sm font-semibold text-white">Execution Trace &amp; Authorization Audit</h3>
                <p className="text-xs text-[#7d8590]">{sc.title}</p>
              </div>
              <div className="text-xs font-mono text-[#8c949f]">
                {totalLatency} ms
              </div>
            </div>

            {/* Visual Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {steps.map((st, i) => (
                <div key={i} className={`p-3.5 rounded-lg border bg-[#14161b] ${st.border}`}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span>{st.step}</span>
                    <span className="font-mono text-[10px]">{st.status}</span>
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed">{st.detail}</p>
                </div>
              ))}
            </div>

            {/* Audit Diagnostic */}
            <div className="surface-sub rounded-lg p-3.5 text-xs space-y-1">
              <div className="font-semibold text-white">Audit Diagnostic:</div>
              <p className="text-[#8c949f] leading-relaxed">{auditText}</p>
            </div>
          </div>

          {/* Dry-Run Tool Payload */}
          <div className="space-y-2 pt-2 border-t border-[#1f2328]">
            <div className="flex items-center justify-between text-xs text-[#7d8590]">
              <span className="font-mono uppercase text-[10px]">Dry-Run Tool Payload</span>
              <button
                onClick={() => onCopyPayload(payloadString)}
                className="flex items-center gap-1 text-xs text-[#8c949f] hover:text-white transition"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="bg-[#0b0c0e] border border-[#242830] rounded-lg p-3 text-xs font-mono text-[#7ee787] overflow-x-auto max-h-44">
              {payloadString}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
