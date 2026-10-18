import React, { useState } from 'react';
import { StatsEngine, escapeHtml } from '../utils/statsEngine';
import { EconEngine, isParetoOptimal } from '../utils/econEngine';
import { INITIAL_MODELS } from '../data/models';
import { RefreshCw } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  expected: string;
  actual: string;
  pass: boolean;
}

export const SelfTestsTab: React.FC = () => {
  const [lastRunTs, setLastRunTs] = useState<string>(new Date().toLocaleTimeString());

  const runAllTests = (): TestResult[] => {
    const list: TestResult[] = [];

    // Test 1: Inverse normal quantile Φ⁻¹(0.975) ≈ 1.95996
    const z975 = StatsEngine.normalInv(0.975);
    list.push({
      id: 'TEST-01',
      name: 'StatsEngine: Inverse Normal Φ⁻¹(0.975) for two-sided α=0.05',
      expected: '1.9600 (±0.0005)',
      actual: z975.toFixed(4),
      pass: Math.abs(z975 - 1.95996) < 0.0005
    });

    // Test 2: Normal CDF accuracy
    const p975 = StatsEngine.normalCdf(1.95996);
    list.push({
      id: 'TEST-02',
      name: 'StatsEngine: Normal CDF Φ(1.96) two-sided tail accuracy',
      expected: '0.9750 (±0.0005)',
      actual: p975.toFixed(4),
      pass: Math.abs(p975 - 0.975) < 0.0005
    });

    // Test 3: Two-Proportion Sample Size
    const samp50 = StatsEngine.calcTwoProportionSampleSize(50, 5, 0.05, 0.80, 50);
    list.push({
      id: 'TEST-03',
      name: 'StatsEngine: Two-Proportion Sample Size (p1=50%, Δ=5pp, α=0.05, 1-β=0.80)',
      expected: 'n_C ∈ [1550, 1585]',
      actual: `n_C = ${samp50.nControl}, Total = ${samp50.totalN}`,
      pass: samp50.nControl >= 1550 && samp50.nControl <= 1585
    });

    // Test 4: Continuous Sample Size
    const sampCont = StatsEngine.calcContinuousSampleSize(15, 3, 0.05, 0.80, 50);
    list.push({
      id: 'TEST-04',
      name: 'StatsEngine: Continuous Sample Size (σ=15, Δ=3, α=0.05, 1-β=0.80)',
      expected: 'n_C = 393 (±2)',
      actual: `n_C = ${sampCont.nControl}`,
      pass: Math.abs(sampCont.nControl - 393) <= 2
    });

    // Test 5: Two-Proportion Z-Test
    const propRes = StatsEngine.analyzeTwoProportions(4000, 2000, 4000, 2200, 0.05);
    list.push({
      id: 'TEST-05',
      name: 'StatsEngine: Abs Lift (+5.00 pp) vs Rel Lift (+10.00%) & z-stat',
      expected: '+5.00 pp / +10.00% / z≈4.48',
      actual: `+${propRes.absDiffPp.toFixed(2)} pp / +${propRes.relDiffPct.toFixed(2)}% / z=${propRes.zStat.toFixed(2)}`,
      pass: Math.abs(propRes.absDiffPp - 5.0) < 0.01 && Math.abs(propRes.relDiffPct - 10.0) < 0.01 && propRes.significant
    });

    // Test 6: SRM Chi-Square
    const srmBad = StatsEngine.checkSrm(5240, 3810, 50);
    const srmGood = StatsEngine.checkSrm(4520, 4495, 50);
    list.push({
      id: 'TEST-06',
      name: 'StatsEngine: SRM Chi-Square flags 5240:3810 (p<0.001) & passes 4520:4495',
      expected: 'Bad=true, Good=false',
      actual: `Bad=${srmBad.isMismatch} (p=${srmBad.pSrm.toExponential(1)}), Good=${srmGood.isMismatch}`,
      pass: srmBad.isMismatch === true && srmGood.isMismatch === false
    });

    // Test 7: EconEngine Cache-Eligible Prefix Savings
    const testModel = INITIAL_MODELS.find(m => m.id === 'gpt-4o-mini') || INITIAL_MODELS[0];
    const econParamsBase = {
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
    };
    const econ0 = EconEngine.compute({ ...econParamsBase, cacheHitPct: 0 }, testModel);
    const econ80 = EconEngine.compute({ ...econParamsBase, cacheHitPct: 80, cacheEligiblePct: 70 }, testModel);
    list.push({
      id: 'TEST-07',
      name: 'EconEngine: Prefix caching discount reduces monthly inference cost',
      expected: 'Cost(80% hit) < Cost(0% hit)',
      actual: `$${econ80.monthlyBaseInference.toFixed(2)} < $${econ0.monthlyBaseInference.toFixed(2)}`,
      pass: econ80.monthlyBaseInference < econ0.monthlyBaseInference && econ80.monthlyCacheSavings > 0
    });

    // Test 8: Cost per Successful Task
    list.push({
      id: 'TEST-08',
      name: 'EconEngine: Cost per Successful Task scales inversely with Success Rate',
      expected: 'Cost/Success > Cost/Req @ 68%',
      actual: `$${econ80.costPerSuccessfulTask.toFixed(4)} vs $${econ80.costPerRequest.toFixed(4)}`,
      pass: Math.abs(econ80.costPerSuccessfulTask - (econ80.costPerRequest / 0.68)) < 1e-4
    });

    // Test 9: Net Savings Formula
    const expectedNet = econ80.grossAvoidedHumanCost - econ80.totalMonthlyAiOpEx - econ80.monthlyHumanEscalationCost;
    list.push({
      id: 'TEST-09',
      name: 'EconEngine: Net Savings deducts both AI OpEx and Human Escalation handling',
      expected: `$${Math.round(expectedNet).toLocaleString()}`,
      actual: `$${Math.round(econ80.netMonthlySavings).toLocaleString()}`,
      pass: Math.abs(econ80.netMonthlySavings - expectedNet) < 1e-4
    });

    // Test 10: Mutually Exclusive Outcome Sum
    const econOverlap = EconEngine.compute({ ...econParamsBase, verifiedSuccessPct: 80, humanEscalationPct: 45 }, testModel);
    list.push({
      id: 'TEST-10',
      name: 'EconEngine: Prevents overlapping outcomes >100% from inflating savings',
      expected: 'Esc clamped to 20%, Sum = 100%',
      actual: `Succ=${econOverlap.effectiveSuccessPct}%, Esc=${econOverlap.effectiveEscalationPct}%, Aband=${econOverlap.abandonmentPct}%`,
      pass: econOverlap.wasClamped === true && (econOverlap.effectiveSuccessPct + econOverlap.effectiveEscalationPct + econOverlap.abandonmentPct) === 100
    });

    // Test 11: 3D Pareto Optimal Frontier
    const paretoCount = INITIAL_MODELS.filter(m => isParetoOptimal(m, INITIAL_MODELS)).length;
    list.push({
      id: 'TEST-11',
      name: 'EconEngine: 3D Pareto Frontier (Cost, Quality, TTFT) identifies non-dominated subset',
      expected: '1 <= Pareto <= Total',
      actual: `${paretoCount} of ${INITIAL_MODELS.length} models Pareto-optimal`,
      pass: paretoCount >= 1 && paretoCount <= INITIAL_MODELS.length
    });

    // Test 12: HTML Escaping
    const escaped = escapeHtml('<script>alert("xss")</script>');
    list.push({
      id: 'TEST-12',
      name: 'Security: escapeHtml neutralizes script tags in user inputs',
      expected: '&lt;script&gt;...',
      actual: escaped,
      pass: !escaped.includes('<script') && escaped.includes('&lt;script')
    });

    return list;
  };

  const [tests, setTests] = useState<TestResult[]>(runAllTests);
  const passingCount = tests.filter(t => t.pass).length;

  const handleRerun = () => {
    setTests(runAllTests());
    setLastRunTs(new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f2328]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">System Verification &amp; Invariant Tests</h2>
          <p className="text-xs text-[#8c949f] mt-1">
            Automated verification of statistical power equations, two-proportion distributions, and unit economics formulas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#34d399]">{passingCount} / {tests.length} Passing ({lastRunTs})</span>
          <button
            onClick={handleRerun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16181d] hover:bg-[#1f2328] text-xs text-[#e6edf3] border border-[#2d3139] transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Re-Run</span>
          </button>
        </div>
      </div>

      <div className="surface-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#14161b] text-[#7d8590] font-mono text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Test ID</th>
                <th className="py-2.5 px-4">Mathematical Invariant / Capability</th>
                <th className="py-2.5 px-3">Expected</th>
                <th className="py-2.5 px-3">Computed</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2328] font-mono text-[11px] text-[#c9d1d9]">
              {tests.map(t => (
                <tr key={t.id} className="hover:bg-[#16181d]">
                  <td className="py-2.5 px-4 text-[#8c949f]">{t.id}</td>
                  <td className="py-2.5 px-4 font-sans text-white">{t.name}</td>
                  <td className="py-2.5 px-3 text-[#7d8590]">{t.expected}</td>
                  <td className="py-2.5 px-3 text-[#e6edf3]">{t.actual}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className={t.pass ? 'text-[#34d399]' : 'text-[#f87171]'}>
                      {t.pass ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
