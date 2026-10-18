import React from 'react';
import { EconParams, EconResults, ModelSpec } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Copy, RefreshCw } from 'lucide-react';

interface UnitEconomicsTabProps {
  params: EconParams;
  onChangeParams: (newParams: EconParams) => void;
  models: ModelSpec[];
  results: EconResults;
  activeModel: ModelSpec;
  onCopyMemo: (text: string) => void;
  onResetToPreset: () => void;
}

export const UnitEconomicsTab: React.FC<UnitEconomicsTabProps> = ({
  params,
  onChangeParams,
  models,
  results,
  activeModel,
  onCopyMemo,
  onResetToPreset
}) => {
  const updateField = (field: keyof EconParams, value: number | string) => {
    onChangeParams({
      ...params,
      [field]: value
    });
  };

  const frontierModel = models.find(m => m.id === 'claude-sonnet-5-5') || models[4];
  const frontierInputCost = (results.totalInputTokens / 1e6) * frontierModel.inputPrice * results.monthlyQueries * (1 - results.effectiveCacheFraction);
  const frontierCachedCost = (results.totalInputTokens / 1e6) * frontierModel.cacheReadPrice * results.monthlyQueries * results.effectiveCacheFraction;
  const frontierOutputCost = (results.outputTokens / 1e6) * frontierModel.outputPrice * results.monthlyQueries;
  const frontierMonthlyOpEx = frontierInputCost + frontierCachedCost + frontierOutputCost + results.monthlyRetrievalCost + results.monthlyAgentToolCost + results.fixedInfraMonthly + results.trainingAmortMonthly;

  const chartData = [
    { name: `${activeModel.name}`, cost: Math.round(results.totalMonthlyAiOpEx), fill: '#e2e8f0' },
    { name: 'Claude Sonnet 5.5', cost: Math.round(frontierMonthlyOpEx), fill: '#64748b' },
    { name: 'GPU Cluster + MLOps', cost: Math.round(results.monthlySelfHostTotal), fill: '#334155' }
  ];

  const ledgerItems = [
    { label: 'Uncached Input', val: results.monthlyUncachedInputCost, sub: `${Math.round((1 - results.effectiveCacheFraction) * 100)}% @ $${activeModel.inputPrice}/1M` },
    { label: 'Cached Input', val: results.monthlyCachedInputCost, sub: `${Math.round(results.effectiveCacheFraction * 100)}% @ $${activeModel.cacheReadPrice}/1M` },
    { label: 'Output Tokens', val: results.monthlyOutputTokenCost, sub: `${params.outputTokens} tok @ $${activeModel.outputPrice}/1M` },
    { label: 'Base Inference Total', val: results.monthlyBaseInference, sub: 'Inference subtotal' },
    { label: 'Retrieval & Rerank', val: results.monthlyRetrievalCost, sub: `$${params.retrievalCostPer1k}/1k queries` },
    { label: 'Agent Tool Calls', val: results.monthlyAgentToolCost, sub: `${params.toolCallsPerReq} calls/req` },
    { label: 'Retry Overhead', val: results.monthlyRetryCost, sub: `${params.retryRatePct}% retry failure rate` },
    { label: 'Fixed Infrastructure', val: results.fixedInfraMonthly, sub: 'Vector DB + telemetry' },
    { label: 'Training Amortization', val: results.trainingAmortMonthly, sub: 'Dataset & fine-tuning' },
    { label: 'Human Review Handling', val: results.monthlyHumanEscalationCost, sub: `${results.effectiveEscalationPct}% escalated` },
    { label: 'Gross Avoided Cost', val: results.grossAvoidedHumanCost, sub: `${results.effectiveSuccessPct}% autonomous tasks` },
    { label: 'Net Monthly Savings', val: results.netMonthlySavings, sub: `ROI: ${results.netRoiPct.toFixed(0)}%` }
  ];

  const memoText = `At ${params.dailyQueries.toLocaleString()} requests/day, total monthly AI operating cost is $${results.totalMonthlyAiOpEx.toFixed(0)}/mo ($${results.costPerRequest.toFixed(4)}/request; $${results.costPerSuccessfulTask.toFixed(4)} per verified successful task at ${results.effectiveSuccessPct}% completion). Out of all sessions, ${results.effectiveSuccessPct}% resolve autonomously (gross avoided human cost: $${Math.round(results.grossAvoidedHumanCost).toLocaleString()}/mo), ${results.effectiveEscalationPct}% escalate to humans ($${Math.round(results.monthlyHumanEscalationCost).toLocaleString()}/mo human handling cost), and ${results.abandonmentPct}% abandon without resolution (counted as $0 savings). Realistic self-hosting at ${params.gpuUtilizationPct}% GPU utilization plus $${params.selfHostMlops.toLocaleString()}/mo MLOps costs $${Math.round(results.monthlySelfHostTotal).toLocaleString()}/mo; do not self-host solely on token volume unless data residency or sustained volume (>${results.breakEvenDaily.toLocaleString()}/day) justifies operational overhead.`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f2328]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">8-Component Unit Economics &amp; ROI Simulator</h2>
          <p className="text-xs text-[#8c949f] mt-1">
            Deterministic modeling separating base inference, prefix caching discounts, retrieval, retries, and human review costs.
          </p>
        </div>

        <button
          onClick={onResetToPreset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#14161b] hover:bg-[#1a1d23] text-xs text-[#8c949f] hover:text-white border border-[#242830] transition self-start md:self-auto"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Inputs</span>
        </button>
      </div>

      {/* 6 Top Key Metrics (Clean, Zero-Pill) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Total Monthly AI OpEx</div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">
            ${results.totalMonthlyAiOpEx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#8c949f] pt-1">
            ${results.costPer1kRequests.toFixed(3)} per 1,000 queries <span aria-hidden="true">·</span> {activeModel.name}
          </div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Cost / Successful Task</div>
          <div className="text-2xl font-semibold text-[#34d399] tracking-tight tabular-nums">
            ${results.costPerSuccessfulTask.toFixed(4)}
          </div>
          <div className="text-xs text-[#8c949f] pt-1">
            {results.effectiveSuccessPct}% verified resolution <span aria-hidden="true">·</span> ${results.costPerActiveUser.toFixed(3)}/MAU
          </div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Prompt Caching Savings</div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">
            ${results.monthlyCacheSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#8c949f] pt-1">
            {params.cacheHitPct}% hit rate <span aria-hidden="true">·</span> {params.cacheEligiblePct}% prefix eligible
          </div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Human Review Handling</div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">
            ${Math.round(results.monthlyHumanEscalationCost).toLocaleString()}
          </div>
          <div className="text-xs text-[#8c949f] pt-1">
            {results.effectiveEscalationPct}% escalated <span aria-hidden="true">·</span> ${params.humanCost}/ticket
          </div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Self-Hosted GPU + MLOps</div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">
            ${Math.round(results.monthlySelfHostTotal).toLocaleString()}
          </div>
          <div className="text-xs text-[#8c949f] pt-1">
            Break-even: {results.breakEvenDaily.toLocaleString()} requests/day
          </div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Net Monthly Business ROI</div>
          <div className="text-2xl font-semibold text-[#34d399] tracking-tight tabular-nums">
            ${Math.round(results.netMonthlySavings).toLocaleString()}
          </div>
          <div className="text-xs text-[#8c949f] pt-1">
            Net of AI OpEx and human reviews <span aria-hidden="true">·</span> {results.netRoiPct.toFixed(0)}% ROI
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Controls with Generous Spacing */}
        <div className="lg:col-span-5 surface-card rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">Cost &amp; Traffic Controls</h3>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs text-[#7d8590]">Inference Model</label>
            <select
              value={params.modelId}
              onChange={(e) => updateField('modelId', e.target.value)}
              className="w-full bg-[#14161b] border border-[#242830] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (${m.inputPrice.toFixed(2)} in / ${m.outputPrice.toFixed(2)} out)
                </option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8c949f]">Daily Request Volume</span>
                <span className="text-white font-mono tabular-nums">{params.dailyQueries.toLocaleString()} / day</span>
              </div>
              <input
                type="range"
                min="1000"
                max="500000"
                step="1000"
                value={params.dailyQueries}
                onChange={(e) => updateField('dailyQueries', Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8c949f]">System + Input Tokens</span>
                <span className="text-white font-mono tabular-nums">{params.inputTokens.toLocaleString()} tokens</span>
              </div>
              <input
                type="range"
                min="200"
                max="10000"
                step="100"
                value={params.inputTokens}
                onChange={(e) => updateField('inputTokens', Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8c949f]">RAG Context (400 tok/chunk)</span>
                <span className="text-white font-mono tabular-nums">{params.ragChunks} chunks ({(params.ragChunks * 400).toLocaleString()} tok)</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={params.ragChunks}
                onChange={(e) => updateField('ragChunks', Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8c949f]">Output Tokens</span>
                <span className="text-white font-mono tabular-nums">{params.outputTokens.toLocaleString()} tokens</span>
              </div>
              <input
                type="range"
                min="50"
                max="4000"
                step="50"
                value={params.outputTokens}
                onChange={(e) => updateField('outputTokens', Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8c949f]">Cache-Eligible</span>
                  <span className="text-white font-mono tabular-nums">{params.cacheEligiblePct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={params.cacheEligiblePct}
                  onChange={(e) => updateField('cacheEligiblePct', Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8c949f]">Cache Hit Rate</span>
                  <span className="text-white font-mono tabular-nums">{params.cacheHitPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={params.cacheHitPct}
                  onChange={(e) => updateField('cacheHitPct', Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Granular Numerics */}
          <div className="pt-3 border-t border-[#1f2328] space-y-2.5">
            <div className="text-xs text-[#7d8590]">Outcome Distribution</div>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] text-[#7d8590] mb-1">Success (%)</label>
                <input
                  type="number"
                  value={params.verifiedSuccessPct}
                  onChange={(e) => updateField('verifiedSuccessPct', Number(e.target.value))}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2 py-1 font-mono text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#7d8590] mb-1">Escalation (%)</label>
                <input
                  type="number"
                  value={params.humanEscalationPct}
                  onChange={(e) => updateField('humanEscalationPct', Number(e.target.value))}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2 py-1 font-mono text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#7d8590] mb-1">Human Cost ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={params.humanCost}
                  onChange={(e) => updateField('humanCost', Number(e.target.value))}
                  className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2 py-1 font-mono text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bar Chart + 12-Line Ledger + CFO Memo */}
        <div className="lg:col-span-7 space-y-6">
          {/* Paradigm Bar Chart */}
          <div className="surface-card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Monthly Paradigm Cost Comparison</h3>
                <p className="text-xs text-[#7d8590]">Selected Model vs Frontier API vs Self-Hosted GPU Cluster</p>
              </div>
              <div className="text-xs text-[#7d8590] font-mono">
                {(((results.totalInputTokens + results.outputTokens) * results.monthlyQueries * (1 + params.retryRatePct / 100)) / 1e9).toFixed(2)}B tok/mo
              </div>
            </div>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid stroke="#1f2328" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#8c949f', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8c949f', fontSize: 10 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16181d', borderColor: '#2d3139', borderRadius: '8px', fontSize: '11px', color: '#e6edf3' }}
                    formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Monthly Cost']}
                  />
                  <Bar dataKey="cost" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 12-Line Explicit Ledger */}
          <div className="surface-card rounded-xl p-6 space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Deterministic Cost &amp; Savings Ledger
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {ledgerItems.map((item, idx) => (
                <div key={idx} className="surface-sub rounded-lg p-2.5">
                  <div className="text-[11px] text-[#7d8590]">{item.label}</div>
                  <div className="text-sm font-semibold text-white font-mono mt-0.5 tabular-nums">
                    ${item.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-[#656d76] truncate">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Memo */}
          <div className="surface-card rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Executive Trade-Off Verdict</span>
              <button
                onClick={() => onCopyMemo(memoText)}
                className="flex items-center gap-1.5 text-xs text-[#8c949f] hover:text-white transition"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Memo</span>
              </button>
            </div>

            <p className="text-xs text-[#c9d1d9] leading-relaxed bg-[#14161b] border border-[#242830] rounded-lg p-3.5 font-normal">
              {memoText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
