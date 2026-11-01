import { computeEmi } from "./emi";

export interface EligibilityInput {
  monthlyIncome: number;
  employmentType: "salaried" | "self-employed";
  cibilScore: number;
  existingEmi: number;
  tenureMonths: number;
  applicableRate: number;
}

export interface EligibilityResult {
  eligibleMonthlyEmi: number;
  maxLoanAmount: number;
  maxLoanAmountRounded: number;
  scoreLabel: string;
  band: "excellent" | "good" | "fair" | "risky";
  rateApplicable: number;
}

export function computeEligibility(input: EligibilityInput): EligibilityResult {
  const { monthlyIncome, employmentType, cibilScore, existingEmi, tenureMonths, applicableRate } = input;

  const incomeRatio = 0.5;
  const eligibleMonthlyEmi = Math.max(0, monthlyIncome * incomeRatio - existingEmi);

  let scoreFactor = 1;
  let band: EligibilityResult["band"] = "good";
  if (cibilScore >= 780) {
    scoreFactor = 1.12;
    band = "excellent";
  } else if (cibilScore >= 750) {
    scoreFactor = 1.05;
    band = "excellent";
  } else if (cibilScore >= 700) {
    scoreFactor = 1;
    band = "good";
  } else if (cibilScore >= 650) {
    scoreFactor = 0.9;
    band = "fair";
  } else if (cibilScore >= 600) {
    scoreFactor = 0.78;
    band = "risky";
  } else {
    scoreFactor = 0.6;
    band = "risky";
  }

  const employmentFactor = employmentType === "salaried" ? 1 : 0.92;
  const effectiveEmi = eligibleMonthlyEmi * scoreFactor * employmentFactor;

  // Inverse-EMI: P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
  const r = applicableRate / 100 / 12;
  const factor = Math.pow(1 + r, tenureMonths);
  const maxLoanAmount = r === 0 ? effectiveEmi * tenureMonths : (effectiveEmi * (factor - 1)) / (r * factor);

  const maxLoanAmountRounded = Math.max(0, Math.floor(maxLoanAmount / 10000) * 10000);

  const scoreLabel =
    cibilScore >= 750
      ? `Excellent (${cibilScore})`
      : cibilScore >= 650
        ? `Good (${cibilScore})`
        : cibilScore >= 600
          ? `Fair (${cibilScore})`
          : `Needs improvement (${cibilScore})`;

  return {
    eligibleMonthlyEmi,
    maxLoanAmount,
    maxLoanAmountRounded,
    scoreLabel,
    band,
    rateApplicable: applicableRate,
  };
}
