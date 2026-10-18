import React, { useMemo } from 'react';
import { ExperimentConfig } from '../types';
import { EXPERIMENT_TEMPLATES } from '../data/experimentTemplates';
import { StatsEngine } from '../utils/statsEngine';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Copy } from 'lucide-react';

interface ExperimentLabTabProps {
  config: ExperimentConfig;
  onChangeConfig: (newConfig: ExperimentConfig) => void;
  costPerTask: number;
  onCopyReport: (reportText: string) => void;
  onCopySchema: (schemaText: string) => void;
}

export const ExperimentLabTab: React.FC<ExperimentLabTabProps> = ({
  config,
  onChangeConfig,
  costPerTask,
  onCopyReport
}) => {
  const updateField = (field: keyof ExperimentConfig, val: string | number) => {
    onChangeConfig({
      ...config,
      [field]: val
    });
  };

  const handleSelectTemplate = (key: string) => {
    const tpl = EXPERIMENT_TEMPLATES[key];
    if (!tpl) return;
    onChangeConfig({
      ...config,
      templateKey: key,
      name: tpl.name,
      owner: tpl.owner,
      objective: tpl.objective,
      hypothesis: tpl.hypothesis,
      controlDesc: tpl.control,
      treatmentDesc: tpl.treatment,
      eligibility: tpl.eligibility,
      exposure: tpl.exposure,
      primaryMetric: tpl.primaryMetric,
      guardrails: tpl.guardrails,
      baselineVal: tpl.baseline,
      mdeVal: tpl.mde
    });
  };

  // Statistical calculations
  const sampleCalc = useMemo(() => {
    if (config.metricType === 'binary') {
      return StatsEngine.calcTwoProportionSampleSize(
        config.baselineVal,
        config.mdeVal,
        config.alpha,
        config.power,
        config.treatmentSplit
      );
    } else {
      return StatsEngine.calcContinuousSampleSize(
        config.stdDev,
        config.mdeVal,
        config.alpha,
        config.power,
        config.treatmentSplit
      );
    }
  }, [config.metricType, config.baselineVal, config.mdeVal, config.alpha, config.power, config.treatmentSplit, config.stdDev]);

  const rawDays = sampleCalc.totalN / Math.max(1, config.dailyEligible);
  const recDays = Math.max(7, Math.ceil(rawDays));

  // Results analysis
  const resultsAnalysis = useMemo(() => {
    if (config.metricType === 'continuous') {
      return StatsEngine.analyzeContinuous(
        config.obsControlN,
        config.obsControlSucc,
        config.obsControlSd,
        config.obsTreatN,
        config.obsTreatSucc,
        config.obsTreatSd,
        config.alpha
      );
    } else {
      return StatsEngine.analyzeTwoProportions(
        config.obsControlN,
        config.obsControlSucc,
        config.obsTreatN,
        config.obsTreatSucc,
        config.alpha
      );
    }
  }, [config.metricType, config.obsControlN, config.obsControlSucc, config.obsControlSd, config.obsTreatN, config.obsTreatSucc, config.obsTreatSd, config.alpha]);

  const srm = StatsEngine.checkSrm(config.obsControlN, config.obsTreatN, config.treatmentSplit);
  const isSampleSufficient = (config.obsControlN + config.obsTreatN) >= sampleCalc.totalN * 0.9;
  const isPracticallySig = resultsAnalysis.absDiffPp >= config.practicalThreshold;

  let verdict = 'SHIP';
  let rationale = '';

  if (srm.isMismatch) {
    verdict = 'REJECT (SRM)';
    rationale = `Sample Ratio Mismatch detected (χ² = ${srm.chiSq.toFixed(2)}, p < 0.001). Randomization is invalid.`;
  } else if (config.obsGuardrailStatus === 'fail') {
    verdict = 'ITERATE';
    rationale = `Metric improved by +${resultsAnalysis.absDiffPp.toFixed(2)} pp, but critical guardrail was breached.`;
  } else if (!isSampleSufficient && !resultsAnalysis.significant) {
    verdict = 'CONTINUE TESTING';
    rationale = `Sample size (${(config.obsControlN + config.obsTreatN).toLocaleString()}) is below powered target.`;
  } else if (resultsAnalysis.significant && isPracticallySig && resultsAnalysis.absDiffPp > 0) {
    verdict = 'SHIP';
    rationale = `Statistically significant (+${resultsAnalysis.absDiffPp.toFixed(2)} pp, p < 0.001) and meets practical threshold.`;
  } else {
    verdict = 'ITERATE';
    rationale = `Observed lift (+${resultsAnalysis.absDiffPp.toFixed(2)} pp) is below business threshold (+${config.practicalThreshold} pp).`;
  }

  const ciLow = Number((resultsAnalysis.pC * 100 + resultsAnalysis.ciLowPp).toFixed(2));
  const ciHigh = Number((resultsAnalysis.pC * 100 + resultsAnalysis.ciHighPp).toFixed(2));
  const chartData = [
    { name: 'Control', value: Number((resultsAnalysis.pC * 100).toFixed(2)), fill: '#64748b' },
    { name: 'Treatment', value: Number((resultsAnalysis.pT * 100).toFixed(2)), fill: '#e2e8f0' },
    { name: 'CI Low', value: ciLow, fill: '#334155' },
    { name: 'CI High', value: ciHigh, fill: '#475569' }
  ];

  const currentTemplate = EXPERIMENT_TEMPLATES[config.templateKey] || EXPERIMENT_TEMPLATES.support_agent;

  const decisionReportMd = `# Experiment Decision Report: ${config.name}
Verdict: ${verdict}
- Control (${config.controlDesc}): ${(resultsAnalysis.pC * 100).toFixed(2)}% (N = ${config.obsControlN.toLocaleString()})
- Treatment (${config.treatmentDesc}): ${(resultsAnalysis.pT * 100).toFixed(2)}% (N = ${config.obsTreatN.toLocaleString()})
- Effect: +${resultsAnalysis.absDiffPp.toFixed(2)} pp (95% CI: [${resultsAnalysis.ciLowPp.toFixed(2)}, ${resultsAnalysis.ciHighPp.toFixed(2)}])
- Rationale: ${rationale}`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f2328]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">A/B Experimentation &amp; Statistical Power Lab</h2>
          <p className="text-xs text-[#8c949f] mt-1">
            Calculate rigorous sample sizes (Fleiss/Welch), detect Sample Ratio Mismatch (SRM), and generate launch reports.
          </p>
        </div>

        <select
          value={config.templateKey}
          onChange={(e) => handleSelectTemplate(e.target.value)}
          className="bg-[#14161b] border border-[#242830] text-[#8c949f] hover:text-white rounded-md px-3 py-1.5 text-xs focus:outline-none"
        >
          {Object.entries(EXPERIMENT_TEMPLATES).map(([k, t]) => (
            <option key={k} value={k}>{t.title}</option>
          ))}
        </select>
      </div>

      <div className="surface-sub rounded-lg p-4 text-xs space-y-1">
        <div className="text-white font-medium">{currentTemplate.title}</div>
        <p className="text-[#8c949f] leading-relaxed">{currentTemplate.guidance}</p>
      </div>

      {/* Grid: Design & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Design & Calculator */}
        <div className="surface-card rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">Statistical Power &amp; Sample Sizing</h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#7d8590] mb-1">Randomization</label>
              <select
                value={config.randUnit}
                onChange={(e) => updateField('randUnit', e.target.value as any)}
                className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
              >
                <option value="user">User ID</option>
                <option value="account">Account ID</option>
                <option value="session">Session ID</option>
              </select>
            </div>

            <div>
              <label className="block text-[#7d8590] mb-1">Metric Type</label>
              <select
                value={config.metricType}
                onChange={(e) => updateField('metricType', e.target.value as any)}
                className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 text-white"
              >
                <option value="binary">Binary (0/1)</option>
                <option value="continuous">Continuous</option>
              </select>
            </div>

            <div>
              <label className="block text-[#7d8590] mb-1">Baseline Rate (%)</label>
              <input
                type="number"
                step="0.5"
                value={config.baselineVal}
                onChange={(e) => updateField('baselineVal', Number(e.target.value))}
                className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 font-mono text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[#7d8590] mb-1">MDE (Abs pp)</label>
              <input
                type="number"
                step="0.25"
                value={config.mdeVal}
                onChange={(e) => updateField('mdeVal', Number(e.target.value))}
                className="w-full bg-[#14161b] border border-[#242830] rounded-md px-2.5 py-1.5 font-mono text-white text-xs"
              />
            </div>
          </div>

          {/* Sample Size Outputs */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#1f2328]">
            <div className="surface-sub rounded-lg p-3">
              <div className="text-[11px] text-[#7d8590]">Arm Sample</div>
              <div className="text-base font-semibold text-white font-mono mt-0.5 tabular-nums">
                {sampleCalc.nControl.toLocaleString()}
              </div>
            </div>
            <div className="surface-sub rounded-lg p-3">
              <div className="text-[11px] text-[#7d8590]">Total N</div>
              <div className="text-base font-semibold text-white font-mono mt-0.5 tabular-nums">
                {sampleCalc.totalN.toLocaleString()}
              </div>
            </div>
            <div className="surface-sub rounded-lg p-3">
              <div className="text-[11px] text-[#7d8590]">Duration</div>
              <div className="text-base font-semibold text-white font-mono mt-0.5 tabular-nums">
                {recDays} days
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-[#7d8590]">Hypothesis Statement</label>
            <textarea
              rows={2}
              value={config.hypothesis}
              onChange={(e) => updateField('hypothesis', e.target.value)}
              className="w-full bg-[#14161b] border border-[#242830] rounded-lg p-2.5 text-xs text-white"
            />
          </div>
        </div>

        {/* Right: Observed Outcomes */}
        <div className="surface-card rounded-xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2328]">
              <h3 className="text-sm font-semibold text-white">Observed Data &amp; SRM Gate</h3>
              <span className="font-mono text-xs text-white">{verdict}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-[#7d8590] mb-0.5">Control N</label>
                <input
                  type="number"
                  value={config.obsControlN}
                  onChange={(e) => updateField('obsControlN', Number(e.target.value))}
                  className="w-full bg-[#14161b] border border-[#242830] rounded px-2 py-1 font-mono text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#7d8590] mb-0.5">Control Succ</label>
                <input
                  type="number"
                  value={config.obsControlSucc}
                  onChange={(e) => updateField('obsControlSucc', Number(e.target.value))}
                  className="w-full bg-[#14161b] border border-[#242830] rounded px-2 py-1 font-mono text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#7d8590] mb-0.5">Treat N</label>
                <input
                  type="number"
                  value={config.obsTreatN}
                  onChange={(e) => updateField('obsTreatN', Number(e.target.value))}
                  className="w-full bg-[#14161b] border border-[#242830] rounded px-2 py-1 font-mono text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#7d8590] mb-0.5">Treat Succ</label>
                <input
                  type="number"
                  value={config.obsTreatSucc}
                  onChange={(e) => updateField('obsTreatSucc', Number(e.target.value))}
                  className="w-full bg-[#14161b] border border-[#242830] rounded px-2 py-1 font-mono text-white text-xs"
                />
              </div>
            </div>

            {/* Readout */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="surface-sub rounded-lg p-2.5">
                <div className="text-[10px] text-[#7d8590]">Observed Effect</div>
                <div className="text-sm font-semibold text-[#34d399] font-mono mt-0.5 tabular-nums">
                  +{resultsAnalysis.absDiffPp.toFixed(2)} pp
                </div>
              </div>
              <div className="surface-sub rounded-lg p-2.5">
                <div className="text-[10px] text-[#7d8590]">p-value</div>
                <div className="text-sm font-semibold text-white font-mono mt-0.5 tabular-nums">
                  {resultsAnalysis.pValue < 0.0001 ? '<0.0001' : resultsAnalysis.pValue.toFixed(4)}
                </div>
              </div>
              <div className="surface-sub rounded-lg p-2.5">
                <div className="text-[10px] text-[#7d8590]">SRM Status</div>
                <div className="text-sm font-semibold text-white font-mono mt-0.5">
                  {srm.isMismatch ? 'Mismatch!' : 'Valid (p>0.001)'}
                </div>
              </div>
            </div>

            <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="#1f2328" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#8c949f', fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#8c949f', fontSize: 9 }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16181d', borderColor: '#2d3139', borderRadius: '8px', fontSize: '11px', color: '#e6edf3' }}
                    formatter={(val: any) => [`${val}%`, 'Conversion Rate']}
                  />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#1f2328]">
            <button
              onClick={() => onCopyReport(decisionReportMd)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16181d] hover:bg-[#1f2328] text-xs text-[#e6edf3] border border-[#2d3139] transition"
            >
              <Copy className="w-3 h-3 text-[#8c949f]" />
              <span>Copy Report (MD)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
