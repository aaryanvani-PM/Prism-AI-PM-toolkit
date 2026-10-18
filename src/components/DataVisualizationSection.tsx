import React, { useState, useMemo } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { ModelSpec, EvalRunHistoryItem } from '../types';
import { RagRetrievalHealthChart } from './RagRetrievalHealthChart';

interface DataVisualizationSectionProps {
  models: ModelSpec[];
  activeModelId: string;
  onSelectModel: (modelId: string) => void;
  runHistory: EvalRunHistoryItem[];
  goldenPassRate: number;
  costPerTask: number;
}

export const DataVisualizationSection: React.FC<DataVisualizationSectionProps> = ({
  models,
  activeModelId,
  onSelectModel,
  runHistory,
  goldenPassRate,
  costPerTask
}) => {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([
    'gpt-4o-mini',
    'claude-haiku-5-5',
    'gemini-3-5-flash-lite',
    'claude-sonnet-5-5'
  ]);

  const [activeTrendMetric, setActiveTrendMetric] = useState<'passRate' | 'groundedness' | 'recall' | 'all'>('all');

  const toggleModelSelection = (id: string) => {
    if (selectedModelIds.includes(id)) {
      if (selectedModelIds.length > 2) {
        setSelectedModelIds(selectedModelIds.filter(m => m !== id));
      }
    } else {
      if (selectedModelIds.length < 5) {
        setSelectedModelIds([...selectedModelIds, id]);
      }
    }
  };

  // 1. Radar chart data
  const radarMetrics = [
    { metric: 'Groundedness', key: 'groundedness' },
    { metric: 'Reasoning', key: 'reasoning' },
    { metric: 'Speed / TTFT', key: 'speed' },
    { metric: 'Cost Efficiency', key: 'cost' },
    { metric: 'Context Size', key: 'context' },
    { metric: 'Tool Reliability', key: 'tools' }
  ];

  const radarData = useMemo(() => {
    return radarMetrics.map(rm => {
      const row: Record<string, string | number> = { metric: rm.metric };
      models.forEach(m => {
        let val = 80;
        if (rm.key === 'groundedness') val = Math.min(100, Math.round(m.reasoningScore * 0.98));
        else if (rm.key === 'reasoning') val = m.reasoningScore;
        else if (rm.key === 'speed') val = m.speedScore;
        else if (rm.key === 'cost') val = m.costScore;
        else if (rm.key === 'context') val = m.contextScore;
        else if (rm.key === 'tools') val = m.supportsTools ? 96 : 40;
        row[m.id] = val;
      });
      return row;
    });
  }, [models]);

  // Restrained, elegant palette for selected models
  const modelPalette: Record<string, { stroke: string; fill: string }> = {
    'claude-haiku-5-5': { stroke: '#94a3b8', fill: 'rgba(148, 163, 184, 0.15)' },
    'gpt-4o-mini': { stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.15)' },
    'gemini-3-5-flash-lite': { stroke: '#34d399', fill: 'rgba(52, 211, 153, 0.15)' },
    'gpt-4-1-mini': { stroke: '#fbbf24', fill: 'rgba(251, 191, 36, 0.15)' },
    'claude-sonnet-5-5': { stroke: '#e2e8f0', fill: 'rgba(226, 232, 240, 0.2)' },
    'gemini-3-1-pro': { stroke: '#f87171', fill: 'rgba(248, 113, 113, 0.15)' },
    'claude-opus-5-5': { stroke: '#c084fc', fill: 'rgba(192, 132, 252, 0.15)' }
  };

  // 2. Cost vs. Latency bar chart data
  const costLatencyData = useMemo(() => {
    return models
      .filter(m => selectedModelIds.includes(m.id))
      .map(m => ({
        name: m.name,
        inputPrice: m.inputPrice,
        outputPrice: m.outputPrice,
        ttftMs: m.ttftMs
      }));
  }, [models, selectedModelIds]);

  // 3. Historical performance progression data
  const trendData = useMemo(() => {
    return [
      { version: 'v1.0 (Raw)', passRate: 71.0, groundedness: 78.0, recall: 73.0 },
      { version: 'v1.5 (CoT)', passRate: 77.5, groundedness: 83.0, recall: 76.0 },
      { version: 'v2.0 (Dense)', passRate: 84.0, groundedness: 89.0, recall: 82.0 },
      { version: 'v2.5 (Hybrid)', passRate: 91.2, groundedness: 94.0, recall: 90.0 },
      { version: 'v3.0 (Guarded)', passRate: Number(goldenPassRate.toFixed(1)), groundedness: 96.0, recall: 92.0 }
    ];
  }, [goldenPassRate]);

  // 4. Scatter Pareto data
  const scatterData = useMemo(() => {
    return models.map(m => ({
      name: m.name,
      cost: m.inputPrice,
      quality: m.reasoningScore,
      contextK: m.contextK,
      ttft: m.ttftMs,
      isPareto: m.isPareto,
      id: m.id
    }));
  }, [models]);

  const bestQuality = useMemo(() => [...models].sort((a, b) => b.reasoningScore - a.reasoningScore)[0], [models]);
  const lowestCost = useMemo(() => [...models].sort((a, b) => a.inputPrice - b.inputPrice)[0], [models]);
  const fastestTtft = useMemo(() => [...models].sort((a, b) => a.ttftMs - b.ttftMs)[0], [models]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* View Header with Generous Spacing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f2328]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Model Evaluation &amp; Performance Trends</h2>
          <p className="text-xs text-[#8c949f] mt-1">
            Side-by-side benchmarking across reasoning depth, token economics, latency profiles, and historical pipeline accuracy.
          </p>
        </div>

        {/* Model Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#14161b] border border-[#242830] rounded-lg text-xs">
          <span className="text-[11px] text-[#7d8590] px-2 font-mono">Compare:</span>
          {models.map(m => {
            const isSelected = selectedModelIds.includes(m.id);
            const color = modelPalette[m.id]?.stroke || '#94a3b8';
            return (
              <button
                key={m.id}
                onClick={() => toggleModelSelection(m.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#1f2328] text-white shadow-sm'
                    : 'text-[#7d8590] hover:text-[#e6edf3]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? color : '#484f58' }} />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Quantitative Summary Metrics (Clean, Zero-Pill Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Top Reasoning Quality</div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">
            {bestQuality?.reasoningScore}<span className="text-xs text-[#7d8590] font-normal"> / 100</span>
          </div>
          <div className="text-xs text-[#8c949f] pt-1">
            {bestQuality?.name} <span aria-hidden="true">·</span> Frontier tier
          </div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Lowest Input Price</div>
          <div className="text-2xl font-semibold text-[#34d399] tracking-tight tabular-nums">
            ${lowestCost?.inputPrice.toFixed(2)}<span className="text-xs text-[#7d8590] font-normal"> / 1M</span>
          </div>
          <div className="text-xs text-[#8c949f] pt-1">
            {lowestCost?.name} <span aria-hidden="true">·</span> Fast triage
          </div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Fastest Response (TTFT)</div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">
            {fastestTtft?.ttftMs}<span className="text-xs text-[#7d8590] font-normal"> ms</span>
          </div>
          <div className="text-xs text-[#8c949f] pt-1">
            {fastestTtft?.name} <span aria-hidden="true">·</span> Real-time streaming
          </div>
        </div>

        <div className="surface-card rounded-xl p-5 space-y-1">
          <div className="text-xs text-[#7d8590]">Current Golden Pass Rate</div>
          <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">
            {goldenPassRate.toFixed(1)}<span className="text-xs text-[#7d8590] font-normal">%</span>
          </div>
          <div className="text-xs text-[#8c949f] pt-1">
            +23.2 pp vs v1.0 baseline <span aria-hidden="true">·</span> Guarded
          </div>
        </div>
      </div>

      {/* Primary Visualizations: Radar & Grouped Cost/Latency Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Comparison */}
        <div className="surface-card rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Multi-Vector Quality Benchmark</h3>
              <p className="text-xs text-[#7d8590]">Normalized 0–100 score across 6 performance dimensions</p>
            </div>
            <div className="text-[11px] text-[#7d8590] font-mono">Radar View</div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#242830" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#8c949f', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2d3139" tick={{ fill: '#656d76', fontSize: 9 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#16181d', borderColor: '#2d3139', borderRadius: '8px', fontSize: '11px', color: '#e6edf3' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                {selectedModelIds.map(id => {
                  const model = models.find(m => m.id === id);
                  if (!model) return null;
                  const c = modelPalette[id] || { stroke: '#94a3b8', fill: 'rgba(148, 163, 184, 0.15)' };
                  return (
                    <Radar
                      key={id}
                      name={model.name}
                      dataKey={id}
                      stroke={c.stroke}
                      fill={c.fill}
                      fillOpacity={0.25}
                      strokeWidth={1.5}
                    />
                  );
                })}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-[#7d8590] flex items-center justify-between pt-2 border-t border-[#1f2328]">
            <span>Active Model: <strong className="text-white font-medium">{models.find(m => m.id === activeModelId)?.name}</strong></span>
            <button
              onClick={() => onSelectModel(selectedModelIds[0] || 'gpt-4o-mini')}
              className="text-xs text-[#e6edf3] hover:underline"
            >
              Set Active
            </button>
          </div>
        </div>

        {/* Cost vs. Latency Bar Chart */}
        <div className="surface-card rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Token Cost vs. TTFT Latency</h3>
              <p className="text-xs text-[#7d8590]">Input price ($/1M) alongside response latency (ms)</p>
            </div>
            <div className="text-[11px] text-[#7d8590] font-mono">Dual-Axis</div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costLatencyData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid stroke="#1f2328" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#8c949f', fontSize: 11 }} angle={-10} textAnchor="end" height={40} />
                <YAxis yAxisId="cost" orientation="left" tick={{ fill: '#8c949f', fontSize: 10 }} unit="$" />
                <YAxis yAxisId="latency" orientation="right" tick={{ fill: '#fbbf24', fontSize: 10 }} unit="ms" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#16181d', borderColor: '#2d3139', borderRadius: '8px', fontSize: '11px', color: '#e6edf3' }}
                  formatter={(val: any, name: any) => {
                    if (name === 'Input ($/1M)' || name === 'Output ($/1M)') return [`$${Number(val || 0).toFixed(2)}`, name];
                    if (name === 'TTFT (ms)') return [`${val} ms`, name];
                    return [val, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar yAxisId="cost" dataKey="inputPrice" name="Input ($/1M)" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="cost" dataKey="outputPrice" name="Output ($/1M)" fill="#475569" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="latency" dataKey="ttftMs" name="TTFT (ms)" fill="#fbbf24" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-[#7d8590] pt-2 border-t border-[#1f2328]">
            Fast models deliver sub-400ms TTFT at &gt;90% lower token cost compared to frontier tiers.
          </div>
        </div>
      </div>

      {/* RAG Retrieval Health Sub-Component (Faithfulness vs. Relevance over last 10 evaluation runs) */}
      <RagRetrievalHealthChart runHistory={runHistory} />

      {/* Historical Trend & Pareto Frontier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Historical Version Progression */}
        <div className="lg:col-span-7 surface-card rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Historical Regression &amp; Pipeline Accuracy Progression</h3>
              <p className="text-xs text-[#7d8590]">Tracking Pass Rate %, Groundedness, and Context Recall across versions</p>
            </div>

            <div className="flex items-center gap-1 bg-[#14161b] p-1 rounded-md text-xs">
              <button
                onClick={() => setActiveTrendMetric('all')}
                className={`px-2 py-0.5 rounded text-[11px] transition ${activeTrendMetric === 'all' ? 'bg-[#242830] text-white font-medium' : 'text-[#7d8590] hover:text-white'}`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setActiveTrendMetric('passRate')}
                className={`px-2 py-0.5 rounded text-[11px] transition ${activeTrendMetric === 'passRate' ? 'bg-[#242830] text-white font-medium' : 'text-[#7d8590] hover:text-white'}`}
              >
                Pass Rate %
              </button>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2328" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="version" tick={{ fill: '#8c949f', fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fill: '#8c949f', fontSize: 10 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#16181d', borderColor: '#2d3139', borderRadius: '8px', fontSize: '11px', color: '#e6edf3' }}
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Area
                  type="monotone"
                  dataKey="passRate"
                  name="Golden Pass Rate (%)"
                  stroke="#34d399"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPass)"
                />
                {activeTrendMetric === 'all' && (
                  <Line
                    type="monotone"
                    dataKey="groundedness"
                    name="Groundedness (%)"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    dot={{ r: 3 }}
                  />
                )}
                {activeTrendMetric === 'all' && (
                  <Line
                    type="monotone"
                    dataKey="recall"
                    name="IR Recall (%)"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#7d8590] pt-2 border-t border-[#1f2328]">
            <span>Baseline v1.0: 71.0%</span>
            <span aria-hidden="true">·</span>
            <span>Current: <strong className="text-white">{goldenPassRate.toFixed(1)}%</strong></span>
            <span aria-hidden="true">·</span>
            <span>Release Gate: &gt;= 90.0%</span>
          </div>
        </div>

        {/* Pareto Frontier Scatter Chart */}
        <div className="lg:col-span-5 surface-card rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Quality vs. Cost Pareto Curve</h3>
              <p className="text-xs text-[#7d8590]">Non-dominated models (cost vs quality)</p>
            </div>
            <div className="text-[11px] text-[#7d8590] font-mono">Pareto Frontier</div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid stroke="#1f2328" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="cost"
                  name="Input Cost"
                  unit="$"
                  domain={[0, 9]}
                  tick={{ fill: '#8c949f', fontSize: 10 }}
                  label={{ value: 'Input Price ($/1M)', position: 'insideBottom', offset: -10, fill: '#656d76', fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="quality"
                  name="Quality"
                  domain={[75, 100]}
                  tick={{ fill: '#8c949f', fontSize: 10 }}
                  label={{ value: 'Reasoning Index', angle: -90, position: 'insideLeft', fill: '#656d76', fontSize: 10 }}
                />
                <ZAxis type="number" dataKey="contextK" range={[60, 200]} name="Context" unit="K" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="surface-elevated rounded-lg p-2.5 shadow-lg text-xs space-y-0.5">
                        <div className="font-semibold text-white flex items-center justify-between gap-2">
                          <span>{d.name}</span>
                          {d.isPareto && <span className="text-[10px] text-emerald-400">★ Pareto</span>}
                        </div>
                        <div className="text-[#8c949f]">${d.cost.toFixed(2)}/1M · Quality: {d.quality}/100</div>
                        <div className="text-[#656d76]">{d.ttft} ms TTFT · {d.contextK}K context</div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={scatterData}
                  fill="#94a3b8"
                  shape={(props: any) => {
                    const { cx = 0, cy = 0, payload } = props;
                    const isPareto = payload?.isPareto;
                    const isActive = payload?.id === activeModelId;
                    return (
                      <g>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isActive ? 7 : (isPareto ? 6 : 4.5)}
                          fill={isPareto ? '#34d399' : '#475569'}
                          stroke={isActive ? '#ffffff' : (isPareto ? '#10b981' : '#334155')}
                          strokeWidth={isActive ? 2 : 1}
                          fillOpacity={0.8}
                        />
                      </g>
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#7d8590] pt-2 border-t border-[#1f2328]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Pareto Optimal</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600" /> Standard</span>
            </div>
            <span>Radius: Context capacity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
