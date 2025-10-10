// Rent-To-Own (RTO) calculation utilities

export type RTOInput = {
  price: number;
  down: number;
  taxPct: number;
  termMonths: number;
  baseMarkupUsd?: number;      // Default: 1400
  monthlyFactor?: number;       // Default: 0.035 (3.5%)
  minDownUsd?: number;          // Default: 200
  docFeeUsd?: number;           // Default: 99
  buyoutFeeUsd?: number;        // Default: 250
};

export type RTOOutput = {
  rtoPrice: number;             // Base price + markup
  down: number;                 // Actual down payment (max of input or minimum)
  monthlyRent: number;          // Monthly rent before tax
  monthlyTax: number;           // Tax on monthly rent
  monthlyTotal: number;         // Total monthly payment (rent + tax)
  dueAtSigning: number;         // Down + doc fee + first month
  buyoutFee: number;            // Fee to buyout early
  totalPaid: number;            // Total if all payments made
  docFee: number;               // Documentation fee
};

/**
 * Calculate Rent-To-Own pricing
 * RTO structure: Higher monthly payments, lower down payment, option to buy out
 */
export function calculateRTO(input: RTOInput): RTOOutput {
  const {
    price,
    down: downInput,
    taxPct,
    termMonths,
    baseMarkupUsd = 1400,
    monthlyFactor = 0.035,
    minDownUsd = 200,
    docFeeUsd = 99,
    buyoutFeeUsd = 250,
  } = input;

  // Calculate RTO price (base price + markup)
  const rtoPrice = price + baseMarkupUsd;

  // Ensure down payment meets minimum
  const down = Math.max(downInput, minDownUsd);

  // Calculate monthly rent (percentage of RTO price)
  const monthlyRent = rtoPrice * monthlyFactor;

  // Calculate monthly tax (tax on the rent payment)
  const taxRate = taxPct / 100;
  const monthlyTax = monthlyRent * taxRate;

  // Total monthly payment
  const monthlyTotal = monthlyRent + monthlyTax;

  // Due at signing (down + doc fee + first month)
  const dueAtSigning = down + docFeeUsd + monthlyTotal;

  // Total paid over life of RTO (all monthly payments + down + doc fee)
  const totalPaid = monthlyTotal * termMonths + down + docFeeUsd;

  return {
    rtoPrice,
    down,
    monthlyRent,
    monthlyTax,
    monthlyTotal,
    dueAtSigning,
    buyoutFee: buyoutFeeUsd,
    totalPaid,
    docFee: docFeeUsd,
  };
}

/**
 * Calculate RTO monthly payment for matrix display
 * Simplified version that only returns the monthly total
 */
export function calculateRTOMonthly(
  price: number,
  down: number,
  taxPct: number,
  baseMarkupUsd: number = 1400,
  monthlyFactor: number = 0.035
): number {
  const rtoPrice = price + baseMarkupUsd;
  const monthlyRent = rtoPrice * monthlyFactor;
  const monthlyTax = monthlyRent * (taxPct / 100);
  return monthlyRent + monthlyTax;
}

/**
 * Calculate total cost of RTO vs Finance comparison
 */
export function compareRTOvsFinance(
  rtoOutput: RTOOutput,
  financeMonthly: number,
  financeTerm: number,
  financeDown: number
): {
  rtoTotalCost: number;
  financeTotalCost: number;
  difference: number;
  rtoIsMoreExpensive: boolean;
} {
  const rtoTotalCost = rtoOutput.totalPaid;
  const financeTotalCost = financeMonthly * financeTerm + financeDown;
  const difference = Math.abs(rtoTotalCost - financeTotalCost);
  const rtoIsMoreExpensive = rtoTotalCost > financeTotalCost;

  return {
    rtoTotalCost,
    financeTotalCost,
    difference,
    rtoIsMoreExpensive,
  };
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
