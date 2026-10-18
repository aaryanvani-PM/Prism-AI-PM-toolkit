export function clampNum(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const StatsEngine = {
  // Abramowitz & Stegun 7.1.26 normal CDF approximation (error < 1.5e-7)
  normalCdf(z: number): number {
    if (!Number.isFinite(z)) return 0.5;
    const sign = z < 0 ? -1 : 1;
    const x = Math.abs(z) / Math.sqrt(2);
    const t = 1 / (1 + 0.3275911 * x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
    const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * erf);
  },

  // Peter Acklam's rational approximation for Inverse Normal CDF Phi^-1(p)
  normalInv(p: number): number {
    const prob = clampNum(p, 1e-9, 1 - 1e-9, 0.975);
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const pLow = 0.02425, pHigh = 1 - pLow;
    let q: number, r: number;
    if (prob < pLow) {
      q = Math.sqrt(-2 * Math.log(prob));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
             ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (prob <= pHigh) {
      q = prob - 0.5;
      r = q * q;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
             (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - prob));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
              ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
  },

  // Two-sided sample size for two independent proportions (Fleiss / Lachin pooled/unpooled)
  calcTwoProportionSampleSize(p1Pct: number, mdeAbsPp: number, alpha: number, power: number, treatSplitPct: number) {
    const p1 = clampNum(p1Pct / 100, 0.0005, 0.999, 0.5);
    const delta = Math.max(0.0005, Math.abs(mdeAbsPp) / 100);
    const p2 = clampNum(p1 + delta, 0.0006, 0.9995, p1 + delta);
    const actualDelta = Math.abs(p2 - p1);
    const wT = clampNum(treatSplitPct / 100, 0.05, 0.95, 0.5);
    const wC = 1 - wT;
    const kappa = wT / wC; // n_T / n_C
    const zAlpha = this.normalInv(1 - alpha / 2);
    const zBeta = this.normalInv(power);
    const pBar = (p1 + kappa * p2) / (1 + kappa);
    const term1 = zAlpha * Math.sqrt(pBar * (1 - pBar) * (1 + 1 / kappa));
    const term2 = zBeta * Math.sqrt(p1 * (1 - p1) + (p2 * (1 - p2)) / kappa);
    const nC = Math.ceil(Math.pow(term1 + term2, 2) / Math.pow(actualDelta, 2));
    const nT = Math.ceil(nC * kappa);
    return { nControl: nC, nTreatment: nT, totalN: nC + nT, p1, p2, kappa, zAlpha, zBeta };
  },

  // Two-sided sample size for continuous outcomes
  calcContinuousSampleSize(stdDev: number, mdeAbs: number, alpha: number, power: number, treatSplitPct: number) {
    const sd = Math.max(0.0001, Number(stdDev) || 1);
    const delta = Math.max(0.0001, Math.abs(Number(mdeAbs) || 1));
    const wT = clampNum(treatSplitPct / 100, 0.05, 0.95, 0.5);
    const wC = 1 - wT;
    const kappa = wT / wC;
    const zAlpha = this.normalInv(1 - alpha / 2);
    const zBeta = this.normalInv(power);
    const nC = Math.ceil(((1 + 1 / kappa) * sd * sd * Math.pow(zAlpha + zBeta, 2)) / (delta * delta));
    const nT = Math.ceil(nC * kappa);
    return { nControl: nC, nTreatment: nT, totalN: nC + nT, kappa, zAlpha, zBeta };
  },

  // Two-proportion hypothesis test & confidence interval
  analyzeTwoProportions(nC: number, xC: number, nT: number, xT: number, alpha: number) {
    const validNC = Math.max(1, Math.round(Number(nC) || 1));
    const validNT = Math.max(1, Math.round(Number(nT) || 1));
    const validXC = clampNum(Math.round(Number(xC) || 0), 0, validNC, 0);
    const validXT = clampNum(Math.round(Number(xT) || 0), 0, validNT, 0);
    const pC = validXC / validNC;
    const pT = validXT / validNT;
    const absDiff = pT - pC;
    const relDiffPct = pC > 0 ? ((pT - pC) / pC) * 100 : (pT > 0 ? 100 : 0);

    const isSmallSample = validNC < 30 || validNT < 30;
    const isBoundaryRate = (validXC === 0 && validXT === 0) || (validXC === validNC && validXT === validNT);

    let zStat = 0;
    let pValue = 1.0;
    if (!isBoundaryRate) {
      const pPool = (validXC + validXT) / (validNC + validNT);
      const sePool = Math.sqrt(Math.max(1e-12, pPool * (1 - pPool) * (1 / validNC + 1 / validNT)));
      zStat = absDiff / sePool;
      pValue = Math.max(0, Math.min(1, 2 * (1 - this.normalCdf(Math.abs(zStat)))));
    }

    const zCrit = this.normalInv(1 - (alpha || 0.05) / 2);
    const nC_ac = validNC + 2, nT_ac = validNT + 2;
    const pC_ac = (validXC + 1) / nC_ac, pT_ac = (validXT + 1) / nT_ac;
    const rawVar = (pC * (1 - pC)) / validNC + (pT * (1 - pT)) / validNT;
    const seUnpooled = rawVar > 1e-10
      ? Math.sqrt(rawVar)
      : Math.sqrt((pC_ac * (1 - pC_ac)) / nC_ac + (pT_ac * (1 - pT_ac)) / nT_ac);

    const ciLowPp = clampNum((absDiff - zCrit * seUnpooled) * 100, -100, 100, 0);
    const ciHighPp = clampNum((absDiff + zCrit * seUnpooled) * 100, -100, 100, 0);

    return {
      mode: 'binary' as const,
      nC: validNC,
      nT: validNT,
      pC,
      pT,
      meanC: pC * 100,
      meanT: pT * 100,
      absDiffPp: absDiff * 100,
      relDiffPct,
      zStat,
      pValue,
      ciLowPp,
      ciHighPp,
      isSmallSample,
      isBoundaryRate,
      significant: pValue < (alpha || 0.05)
    };
  },

  // Welch two-sample t-test & confidence interval for continuous metrics
  analyzeContinuous(nC: number, meanC: number, sdC: number, nT: number, meanT: number, sdT: number, alpha: number) {
    const validNC = Math.max(2, Math.round(Number(nC) || 2));
    const validNT = Math.max(2, Math.round(Number(nT) || 2));
    const mC = Number(meanC) || 0;
    const mT = Number(meanT) || 0;
    const sC = Math.max(1e-6, Number(sdC) || 1);
    const sT = Math.max(1e-6, Number(sdT) || 1);

    const absDiff = mT - mC;
    const relDiffPct = Math.abs(mC) > 1e-9 ? ((mT - mC) / Math.abs(mC)) * 100 : 0;
    const vC = (sC * sC) / validNC;
    const vT = (sT * sT) / validNT;
    const se = Math.sqrt(Math.max(1e-12, vC + vT));
    const tStat = absDiff / se;

    const dfNum = Math.pow(vC + vT, 2);
    const dfDen = (vC * vC) / Math.max(1, validNC - 1) + (vT * vT) / Math.max(1, validNT - 1);
    const df = Math.max(2, dfNum / Math.max(1e-12, dfDen));

    const zEq = Math.abs(tStat) * (1 - 1 / (4 * df));
    const pValue = Math.max(0, Math.min(1, 2 * (1 - this.normalCdf(zEq))));
    const zCrit = this.normalInv(1 - (alpha || 0.05) / 2);
    const tCrit = zCrit * (1 + (1 + zCrit * zCrit) / (4 * df));

    const ciLowPp = absDiff - tCrit * se;
    const ciHighPp = absDiff + tCrit * se;

    return {
      mode: 'continuous' as const,
      nC: validNC,
      nT: validNT,
      pC: mC / 100,
      pT: mT / 100,
      meanC: mC,
      meanT: mT,
      sdC: sC,
      sdT: sT,
      absDiffPp: absDiff,
      relDiffPct,
      zStat: tStat,
      df,
      pValue,
      ciLowPp,
      ciHighPp,
      isSmallSample: validNC < 30 || validNT < 30,
      significant: pValue < (alpha || 0.05)
    };
  },

  // Sample Ratio Mismatch (SRM) Pearson Chi-Square (df = 1)
  checkSrm(nC: number, nT: number, expectedTreatSplitPct: number) {
    const total = Math.max(1, nC + nT);
    const wT = clampNum(expectedTreatSplitPct / 100, 0.01, 0.99, 0.5);
    const wC = 1 - wT;
    const expC = total * wC;
    const expT = total * wT;
    const chiSq = Math.pow(nC - expC, 2) / expC + Math.pow(nT - expT, 2) / expT;
    const zEq = Math.sqrt(Math.max(0, chiSq));
    const pSrm = Math.max(0, Math.min(1, 2 * (1 - this.normalCdf(zEq))));
    return { chiSq, pSrm, isMismatch: pSrm < 0.001 };
  }
};
