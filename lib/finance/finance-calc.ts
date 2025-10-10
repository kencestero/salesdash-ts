// Finance calculation utilities for traditional loans

export type FinanceInput = {
  price: number;
  down: number;
  taxPct: number;
  fees: number;
  aprPercent: number;
  termMonths: number;
};

export type FinanceOutput = {
  principal: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  taxes: number;
};

/**
 * Calculate monthly payment for a traditional finance loan
 * Uses standard amortization formula: P * r * (1+r)^n / ((1+r)^n - 1)
 */
export function calculateFinance(input: FinanceInput): FinanceOutput {
  const { price, down, taxPct, fees, aprPercent, termMonths } = input;

  // Calculate taxes
  const taxes = price * (taxPct / 100);

  // Calculate principal (amount to finance)
  const principal = Math.max(0, price - down + taxes + fees);

  // If no principal (fully paid), return zeros
  if (principal === 0 || termMonths === 0) {
    return {
      principal: 0,
      monthlyPayment: 0,
      totalPaid: down + fees,
      totalInterest: 0,
      taxes,
    };
  }

  // Calculate monthly interest rate
  const monthlyRate = aprPercent / 100 / 12;

  // Calculate monthly payment using amortization formula
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    // No interest case
    monthlyPayment = principal / termMonths;
  } else {
    const pow = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = (principal * monthlyRate * pow) / (pow - 1);
  }

  // Calculate totals
  const totalPaid = monthlyPayment * termMonths + down;
  const totalInterest = Math.max(0, totalPaid - down - price - fees);

  return {
    principal,
    monthlyPayment,
    totalPaid,
    totalInterest,
    taxes,
  };
}

/**
 * Calculate monthly payment for a specific principal, APR, and term
 * Simplified version for matrix calculations
 */
export function calculateMonthlyPayment(
  principal: number,
  aprPercent: number,
  termMonths: number
): number {
  if (principal === 0 || termMonths === 0) return 0;

  const monthlyRate = aprPercent / 100 / 12;

  if (monthlyRate === 0) {
    return principal / termMonths;
  }

  const pow = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * pow) / (pow - 1);
}

/**
 * Solve for APR given a target monthly payment
 * Uses Newton-Raphson method for numerical approximation
 */
export function solveAPR(
  principal: number,
  payment: number,
  termMonths: number,
  guessAPR: number = 8.0
): number {
  if (principal === 0 || termMonths === 0 || payment === 0) return 0;

  let apr = Math.max(0.0001, guessAPR);

  // Newton-Raphson iteration
  for (let i = 0; i < 30; i++) {
    const r = apr / 100 / 12; // Monthly rate
    const pow = Math.pow(1 + r, termMonths);

    // f(r) = payment - (principal * r * (1+r)^n / ((1+r)^n - 1))
    const f = payment - (principal * r * pow) / (pow - 1);

    // Derivative calculation
    const numerator = principal * pow * (pow - 1 - r * termMonths * Math.pow(1 + r, termMonths - 1));
    const denominator = Math.pow(pow - 1, 2);
    const df = -numerator / denominator;

    if (!isFinite(f) || !isFinite(df) || Math.abs(df) < 1e-12) break;

    const nextAPR = apr - (f / df) * 12 * 100;

    if (Math.abs(nextAPR - apr) < 1e-6) {
      apr = nextAPR;
      break;
    }

    apr = Math.max(0, nextAPR);
  }

  return apr;
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
