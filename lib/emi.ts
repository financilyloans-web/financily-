export interface EmiSchedulePoint {
  month: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  principal: number;
  annualRate: number;
  months: number;
  schedule: EmiSchedulePoint[];
}

/**
 * Compute EMI, totals and a monthly amortization schedule.
 * Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 */
export function computeEmi(
  principal: number,
  annualRate: number,
  months: number,
): EmiResult {
  const r = (annualRate / 100) / 12;
  const n = Math.max(1, Math.floor(months));

  let emi = 0;
  if (r === 0) {
    emi = principal / n;
  } else {
    const factor = Math.pow(1 + r, n);
    emi = (principal * r * factor) / (factor - 1);
  }

  let balance = principal;
  let totalInterest = 0;
  const schedule: EmiSchedulePoint[] = [];

  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const principalPart = emi - interest;
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;
    schedule.push({
      month: i,
      principalPaid: principalPart,
      interestPaid: interest,
      balance,
    });
  }

  const totalPayment = principal + totalInterest;

  return {
    emi,
    totalInterest,
    totalPayment,
    principal,
    annualRate,
    months: n,
    schedule,
  };
}
