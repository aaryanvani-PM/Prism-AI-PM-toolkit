import { EconParams, EconResults, ModelSpec } from '../types';
import { clampNum } from './statsEngine';

export const EconEngine = {
  compute(params: EconParams, model: ModelSpec): EconResults {
    const dailyQueries = Math.max(0, Number(params.dailyQueries) || 0);
    const monthlyQueries = dailyQueries * 30;
    const inputTokens = Math.max(1, Number(params.inputTokens) || 0);
    const ragChunks = Math.max(0, Number(params.ragChunks) || 0);
    const ragTokens = ragChunks * 400;
    const totalInputTokens = inputTokens + ragTokens;
    const outputTokens = Math.max(1, Number(params.outputTokens) || 0);

    const cacheEligibleShare = clampNum((Number(params.cacheEligiblePct) || 0) / 100, 0, 1, 0.7);
    const cacheHitRate = clampNum((Number(params.cacheHitPct) || 0) / 100, 0, 1, 0.5);
    const effectiveCacheFraction = cacheEligibleShare * cacheHitRate;

    const retryRate = clampNum((Number(params.retryRatePct) || 0) / 100, 0, 1, 0.08);
    const toolCallsPerReq = Math.max(0, Number(params.toolCallsPerReq) || 0);
    const retrievalCostPer1k = Math.max(0, Number(params.retrievalCostPer1k) || 0);
    const toolApiCostPer1k = Math.max(0, Number(params.toolApiCostPer1k) || 0);
    const fixedInfraMonthly = Math.max(0, Number(params.fixedInfraMonthly) || 0);
    const trainingAmortMonthly = Math.max(0, Number(params.trainingAmortMonthly) || 0);

    // Mutually exclusive outcome accounting: Success% + Escalation% + Abandonment% = 100%
    const rawSuccessPct = clampNum(Number(params.verifiedSuccessPct) ?? 68, 0, 100, 68);
    const rawEscalationPct = clampNum(Number(params.humanEscalationPct) ?? 22, 0, 100, 22);
    const effectiveSuccessPct = rawSuccessPct;
    const effectiveEscalationPct = Math.min(rawEscalationPct, Math.max(0, 100 - effectiveSuccessPct));
    const abandonmentPct = Math.max(0, 100 - effectiveSuccessPct - effectiveEscalationPct);
    const wasClamped = rawEscalationPct > effectiveEscalationPct;

    const verifiedSuccessRate = effectiveSuccessPct / 100;
    const humanEscalationRate = effectiveEscalationPct / 100;
    const humanCostPerTicket = Math.max(0, Number(params.humanCost) || 3.5);
    const mau = Math.max(1, Number(params.monthlyActiveUsers) || 25000);
    const gpuUtil = clampNum((Number(params.gpuUtilizationPct) || 45) / 100, 0.1, 0.95, 0.45);
    const selfHostMlops = Math.max(0, Number(params.selfHostMlops) || 1500);

    // 1. Separate Uncached Input, Cached Input, and Output Token Costs
    const uncachedRate = model.inputPrice;
    const cachedRate = model.cacheReadPrice;
    const uncachedTokensPerReq = totalInputTokens * (1 - effectiveCacheFraction);
    const cachedTokensPerReq = totalInputTokens * effectiveCacheFraction;

    const uncachedInputCostPerReq = (uncachedTokensPerReq / 1e6) * uncachedRate;
    const cachedInputCostPerReq = (cachedTokensPerReq / 1e6) * cachedRate;
    const baseInputCostPerReq = uncachedInputCostPerReq + cachedInputCostPerReq;
    const fullUncachedInputCostPerReq = (totalInputTokens / 1e6) * uncachedRate;
    const baseOutputCostPerReq = (outputTokens / 1e6) * model.outputPrice;
    const baseInferencePerReq = baseInputCostPerReq + baseOutputCostPerReq;

    const monthlyUncachedInputCost = uncachedInputCostPerReq * monthlyQueries;
    const monthlyCachedInputCost = cachedInputCostPerReq * monthlyQueries;
    const monthlyOutputTokenCost = baseOutputCostPerReq * monthlyQueries;
    const monthlyBaseInference = baseInferencePerReq * monthlyQueries;
    const monthlyCacheSavings = (fullUncachedInputCostPerReq - baseInputCostPerReq) * monthlyQueries;

    // 2. Retrieval & Cross-Encoder Reranking Cost
    const retrievalPerReq = ragChunks > 0 ? (retrievalCostPer1k / 1000) : 0;
    const monthlyRetrievalCost = retrievalPerReq * monthlyQueries;

    // 3. Agent Tool Call Token Overhead & External Tool API Fees
    const blendedInputRatePerM = uncachedRate * (1 - effectiveCacheFraction) + cachedRate * effectiveCacheFraction;
    const toolTokenOverheadPerReq = toolCallsPerReq * ((220 / 1e6) * blendedInputRatePerM + (90 / 1e6) * model.outputPrice);
    const toolFeePerReq = toolCallsPerReq * (toolApiCostPer1k / 1000);
    const monthlyAgentToolCost = (toolTokenOverheadPerReq + toolFeePerReq) * monthlyQueries;

    // 4. Retries & Failed Attempts Overhead
    const retryCostPerReq = (baseInferencePerReq + toolTokenOverheadPerReq) * retryRate;
    const monthlyRetryCost = retryCostPerReq * monthlyQueries;

    // 5. Fixed Infra & Observability + 6. Training/Eval Amortization
    const totalMonthlyAiOpEx = monthlyBaseInference + monthlyRetrievalCost + monthlyAgentToolCost + monthlyRetryCost + fixedInfraMonthly + trainingAmortMonthly;

    // 7. Human Review & Escalation Cost
    const monthlyEscalatedTasks = monthlyQueries * humanEscalationRate;
    const monthlyHumanEscalationCost = monthlyEscalatedTasks * humanCostPerTicket;
    const totalPostAiMonthlyOpEx = totalMonthlyAiOpEx + monthlyHumanEscalationCost;

    // Metrics per request, per successful task, per active user
    const costPerRequest = monthlyQueries > 0 ? totalMonthlyAiOpEx / monthlyQueries : 0;
    const costPer1kRequests = costPerRequest * 1000;
    const monthlySuccessfulTasks = monthlyQueries * verifiedSuccessRate;
    const costPerSuccessfulTask = monthlySuccessfulTasks > 0 ? totalMonthlyAiOpEx / monthlySuccessfulTasks : 0;
    const costPerActiveUser = totalMonthlyAiOpEx / mau;

    // Gross vs Net Savings & Net ROI
    const grossAvoidedHumanCost = monthlySuccessfulTasks * humanCostPerTicket;
    const netMonthlySavings = grossAvoidedHumanCost - totalMonthlyAiOpEx - monthlyHumanEscalationCost;
    const netRoiPct = totalMonthlyAiOpEx > 0 ? (netMonthlySavings / totalMonthlyAiOpEx) * 100 : 0;
    const netMarginPct = grossAvoidedHumanCost > 0 ? (netMonthlySavings / grossAvoidedHumanCost) * 100 : 0;

    // Realistic Self-Hosted GPU + MLOps Capacity Calculation
    const totalTokensPerReq = (totalInputTokens + outputTokens) * (1 + retryRate);
    const peakTokensPerSecNeeded = (dailyQueries * totalTokensPerReq) / (86400 * gpuUtil);
    const gpuNodesNeeded = Math.max(1, Math.ceil(peakTokensPerSecNeeded / 1800));
    const monthlySelfHostHardware = gpuNodesNeeded * 2640;
    const monthlySelfHostTotal = monthlySelfHostHardware + selfHostMlops + fixedInfraMonthly + monthlyRetrievalCost;

    const variableApiCostPerQuery = Math.max(1e-7, (monthlyBaseInference + monthlyAgentToolCost + monthlyRetryCost) / Math.max(1, monthlyQueries));
    const breakEvenDaily = Math.round(((2640 + selfHostMlops) / 30) / variableApiCostPerQuery);

    return {
      dailyQueries,
      monthlyQueries,
      totalInputTokens,
      outputTokens,
      effectiveCacheFraction,
      effectiveSuccessPct,
      effectiveEscalationPct,
      abandonmentPct,
      wasClamped,
      monthlyUncachedInputCost,
      monthlyCachedInputCost,
      monthlyOutputTokenCost,
      monthlyBaseInference,
      monthlyRetrievalCost,
      monthlyAgentToolCost,
      monthlyRetryCost,
      fixedInfraMonthly,
      trainingAmortMonthly,
      totalMonthlyAiOpEx,
      monthlyHumanEscalationCost,
      totalPostAiMonthlyOpEx,
      monthlyCacheSavings,
      costPerRequest,
      costPer1kRequests,
      costPerSuccessfulTask,
      costPerActiveUser,
      grossAvoidedHumanCost,
      netMonthlySavings,
      netRoiPct,
      netMarginPct,
      gpuNodesNeeded,
      monthlySelfHostTotal,
      breakEvenDaily
    };
  }
};

export function isParetoOptimal(candidate: ModelSpec, pool: ModelSpec[]): boolean {
  return !pool.some(other => {
    if (other.id === candidate.id) return false;
    const noWorse = other.inputPrice <= candidate.inputPrice &&
                    other.reasoningScore >= candidate.reasoningScore &&
                    other.ttftMs <= candidate.ttftMs;
    const strictlyBetter = other.inputPrice < candidate.inputPrice ||
                           other.reasoningScore > candidate.reasoningScore ||
                           other.ttftMs < candidate.ttftMs;
    return noWorse && strictlyBetter;
  });
}
