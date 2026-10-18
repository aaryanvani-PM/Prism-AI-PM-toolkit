import React, { useState, useMemo } from 'react';
import { ModelSpec } from '../types';
import { isParetoOptimal } from '../utils/econEngine';
import { Plus } from 'lucide-react';

interface ModelMatrixTabProps {
  models: ModelSpec[];
  activeModelId: string;
  onSelectModel: (modelId: string) => void;
  onAddCustomModel: (model: ModelSpec) => void;
}

export const ModelMatrixTab: React.FC<ModelMatrixTabProps> = ({
  models,
  activeModelId,
  onSelectModel,
  onAddCustomModel
}) => {
  // Hard Constraints
  const [maxInputPrice, setMaxInputPrice] = useState<number>(10);
  const [maxTtft, setMaxTtft] = useState<number>(1500);
  const [minContext, setMinContext] = useState<number>(128);
  const [requireTools, setRequireTools] = useState<boolean>(true);
  const [requireJson, setRequireJson] = useState<boolean>(true);

  // Preference Weights
  const [wCost, setWCost] = useState<number>(8);
  const [wReason, setWReason] = useState<number>(7);
  const [wSpeed, setWSpeed] = useState<number>(9);
  const [wContext, setWContext] = useState<number>(5);

  const [tierFilter, setTierFilter] = useState<'all' | 'fast' | 'frontier'>('all');

  // Custom Model form
  const [customName, setCustomName] = useState('');
  const [customProvider, setCustomProvider] = useState('');
  const [customInPrice, setCustomInPrice] = useState('');
  const [customOutPrice, setCustomOutPrice] = useState('');

  const evaluatedModels = useMemo(() => {
    const totalWeight = Math.max(1, wCost + wReason + wSpeed + wContext);
    const filtered = models.filter(m => tierFilter === 'all' ? true : m.tier === tierFilter);

    const scored = filtered.map(m => {
      const passesHardConstraints =
        m.inputPrice <= maxInputPrice &&
        m.ttftMs <= maxTtft &&
        m.contextK >= minContext &&
        (!requireTools || m.supportsTools) &&
        (!requireJson || m.supportsJson);

      const fitScore = Math.round(
        (m.costScore * wCost + m.reasoningScore * wReason + m.speedScore * wSpeed + m.contextScore * wContext) / totalWeight
      );

      return {
        ...m,
        passesHardConstraints,
        fitScore
      };
    });

    const eligiblePool = scored.filter(m => m.passesHardConstraints);
    scored.forEach(m => {
      m.isPareto = m.passesHardConstraints && isParetoOptimal(m, eligiblePool);
    });

    scored.sort((a, b) => {
      if (a.passesHardConstraints !== b.passesHardConstraints) return a.passesHardConstraints ? -1 : 1;
      return (b.fitScore || 0) - (a.fitScore || 0);
    });

    return scored;
  }, [models, tierFilter, maxInputPrice, maxTtft, minContext, requireTools, requireJson, wCost, wReason, wSpeed, wContext]);

  const topEligible = evaluatedModels.find(m => m.passesHardConstraints);

  const handleAddCustom = () => {
    const inP = parseFloat(customInPrice);
    const outP = parseFloat(customOutPrice);
    if (!customName.trim() || isNaN(inP) || isNaN(outP) || inP < 0 || outP < 0) return;

    const id = `custom-${Date.now()}`;
    const newModel: ModelSpec = {
      id,
      exactId: customName.toLowerCase().replace(/\s+/g, '-'),
      name: customName.trim(),
      provider: customProvider.trim() || 'Custom Provider',
      tier: inP <= 0.6 ? 'fast' : 'frontier',
      inputPrice: inP,
      outputPrice: outP,
      cacheReadPrice: Number((inP * 0.25).toFixed(3)),
      pricingDate: new Date().toISOString().slice(0, 10),
      pricingSource: 'User Manual Entry',
      pricingProvenance: 'Unverified',
      contextK: 128,
      modalities: 'Text',
      supportsTools: true,
      supportsJson: true,
      ttftMs: 450,
      latencyProvenance: 'Unverified',
      reasoningScore: 85,
      qualityProvenance: 'Unverified',
      speedScore: 85,
      costScore: Math.min(99, Math.max(20, Math.round(100 - inP * 8))),
      contextScore: 75
    };

    onAddCustomModel(newModel);
    setCustomName('');
    setCustomProvider('');
    setCustomInPrice('');
    setCustomOutPrice('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f2328]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Model Benchmark Matrix &amp; Weighted Scorer</h2>
          <p className="text-xs text-[#8c949f] mt-1">
            Filter models through non-negotiable pass/fail constraints, apply preference weights, and identify Pareto frontier choices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as 'all' | 'fast' | 'frontier')}
            className="bg-[#14161b] border border-[#242830] text-[#8c949f] hover:text-white rounded-md px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="fast">High-Efficiency Fast</option>
            <option value="frontier">Frontier Reasoning</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Constraints & Preference Weights */}
        <div className="lg:col-span-4 surface-card rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white">1. Hard Constraints (Pass/Fail)</h3>
            <p className="text-xs text-[#7d8590]">Non-negotiable product thresholds</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#7d8590] mb-1">Max Input $/1M</label>
              <input
                type="number"
                step="0.5"
                value={maxInputPrice}
                onChange={(e) => setMaxInputPrice(Number(e.target.value))}
                className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 font-mono text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[#7d8590] mb-1">Max TTFT (ms)</label>
              <input
                type="number"
                step="50"
                value={maxTtft}
                onChange={(e) => setMaxTtft(Number(e.target.value))}
                className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 font-mono text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[#7d8590] mb-1">Min Context (K)</label>
              <input
                type="number"
                step="32"
                value={minContext}
                onChange={(e) => setMinContext(Number(e.target.value))}
                className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 font-mono text-white text-xs"
              />
            </div>
            <div className="flex flex-col justify-end space-y-1 text-xs">
              <label className="inline-flex items-center gap-1.5 text-[#8c949f] cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireTools}
                  onChange={(e) => setRequireTools(e.target.checked)}
                  className="rounded bg-[#14161b] border-[#242830]"
                />
                <span>Tool Calling</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-[#8c949f] cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireJson}
                  onChange={(e) => setRequireJson(e.target.checked)}
                  className="rounded bg-[#14161b] border-[#242830]"
                />
                <span>Strict JSON</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1f2328] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">2. Preference Weights</h3>
              <p className="text-xs text-[#7d8590]">Trade-offs across compliant models</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8c949f]">Cost Weight</span>
                  <span className="text-white font-mono tabular-nums">{wCost} / 10</span>
                </div>
                <input type="range" min="1" max="10" value={wCost} onChange={(e) => setWCost(Number(e.target.value))} className="w-full cursor-pointer" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8c949f]">Reasoning &amp; Accuracy</span>
                  <span className="text-white font-mono tabular-nums">{wReason} / 10</span>
                </div>
                <input type="range" min="1" max="10" value={wReason} onChange={(e) => setWReason(Number(e.target.value))} className="w-full cursor-pointer" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8c949f]">Speed &amp; Latency</span>
                  <span className="text-white font-mono tabular-nums">{wSpeed} / 10</span>
                </div>
                <input type="range" min="1" max="10" value={wSpeed} onChange={(e) => setWSpeed(Number(e.target.value))} className="w-full cursor-pointer" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8c949f]">Context Window</span>
                  <span className="text-white font-mono tabular-nums">{wContext} / 10</span>
                </div>
                <input type="range" min="1" max="10" value={wContext} onChange={(e) => setWContext(Number(e.target.value))} className="w-full cursor-pointer" />
              </div>
            </div>
          </div>

          {topEligible && (
            <div className="surface-sub rounded-lg p-3.5 space-y-1">
              <div className="text-[11px] text-[#7d8590] uppercase font-mono">Top Recommendation</div>
              <div className="text-sm font-semibold text-white">
                {topEligible.name} ({topEligible.fitScore}/100)
              </div>
              <p className="text-xs text-[#8c949f]">
                {topEligible.isPareto ? 'On the 3D Pareto frontier (cost, quality, latency).' : 'Meets all hard constraints.'}
              </p>
            </div>
          )}
        </div>

        {/* Right: Model Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Add Model Form */}
          <div className="surface-card rounded-xl p-5 space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Add Custom Endpoint / Fine-Tuned Model
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              <input
                type="text"
                placeholder="Model ID (e.g. Llama-3.3-70B)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="sm:col-span-2 bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
              />
              <input
                type="text"
                placeholder="Provider"
                value={customProvider}
                onChange={(e) => setCustomProvider(e.target.value)}
                className="bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
              />
              <input
                type="number"
                step="0.05"
                placeholder="In $/1M"
                value={customInPrice}
                onChange={(e) => setCustomInPrice(e.target.value)}
                className="bg-[#14161b] border border-[#242830] rounded-md px-2 py-1.5 font-mono text-white"
              />
              <input
                type="number"
                step="0.05"
                placeholder="Out $/1M"
                value={customOutPrice}
                onChange={(e) => setCustomOutPrice(e.target.value)}
                className="bg-[#14161b] border border-[#242830] rounded-md px-2 py-1.5 font-mono text-white"
              />
              <button
                onClick={handleAddCustom}
                className="bg-[#f0f3f6] hover:bg-white text-[#0b0c0e] font-semibold rounded-md py-1.5 transition flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Model Specification Table */}
          <div className="surface-card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-[#1f2328] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Production Model Specification &amp; Pareto Matrix</h3>
                <p className="text-xs text-[#7d8590]">Provider-documented pricing &amp; illustrative performance benchmarks</p>
              </div>
              <div className="text-xs text-[#7d8590] font-mono">
                {evaluatedModels.filter(m => m.passesHardConstraints).length} of {models.length} Eligible
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1f2328] text-[#7d8590] uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-4">Model</th>
                    <th className="py-2.5 px-3">Price In/Out</th>
                    <th className="py-2.5 px-3">Context</th>
                    <th className="py-2.5 px-3">TTFT</th>
                    <th className="py-2.5 px-3">Quality</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2328] text-[#c9d1d9]">
                  {evaluatedModels.map(m => {
                    const isActive = m.id === activeModelId;
                    return (
                      <tr key={m.id} className={m.passesHardConstraints ? 'hover:bg-[#16181d] transition' : 'opacity-35'}>
                        <td className="py-3 px-4 font-medium text-white">
                          <div className="flex items-center gap-2">
                            <span>{m.name}</span>
                            {m.isPareto && <span className="text-[10px] text-emerald-400 font-mono">★ Pareto</span>}
                          </div>
                          <div className="text-[11px] text-[#7d8590] font-normal">{m.provider} · {m.pricingDate}</div>
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums">
                          ${m.inputPrice.toFixed(2)} / ${m.outputPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums">{m.contextK}K</td>
                        <td className="py-3 px-3 font-mono tabular-nums">{m.ttftMs} ms</td>
                        <td className="py-3 px-3 font-mono tabular-nums">{m.reasoningScore}/100</td>
                        <td className="py-3 px-3 font-mono">
                          {m.passesHardConstraints ? (
                            <span className="text-white font-medium">{m.fitScore}/100</span>
                          ) : (
                            <span className="text-[#656d76]">Filtered</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onSelectModel(m.id)}
                            className={`px-2.5 py-1 rounded text-xs transition ${
                              isActive
                                ? 'bg-white text-[#0b0c0e] font-semibold'
                                : 'bg-[#14161b] hover:bg-[#1f2328] text-[#8c949f] hover:text-white border border-[#242830]'
                            }`}
                          >
                            {isActive ? 'Active' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
