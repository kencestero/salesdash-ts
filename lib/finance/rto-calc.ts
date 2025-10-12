// Rent-To-Own (RTO) calculation utilities
// Updated with Matt's official RTO formula (2.32 finance factor)

export type RTOInput = {
  price: number;
  down: number;
  taxPct: number;
  termMonths: number;
  countyTaxPct?: number;        // Default: 1.5
  filingFee?: number;           // Default: 170
  nonRefundableFee?: number;    // Default: 300
  financeFactor?: number;       // Default: 2.32 (Matt's formula)
  downPaymentFactor?: number;   // Default: 0.1035 (10.35% of price)

  // Legacy params (for backwards compatibility)
  baseMarkupUsd?: number;
  monthlyFactor?: number;
  minDownUsd?: number;
  docFeeUsd?: number;
  buyoutFeeUsd?: number;
};

export type RTOOutput = {
  rtoPrice: number;             // Base price × finance factor (2.32)
  down: number;                 // Actual down payment used
  monthlyRent: number;          // Monthly base payment before tax
  monthlyTax: number;           // Tax on monthly payment
  monthlyTotal: number;         // Total monthly payment (rent + tax)
  dueAtSigning: number;         // Down + filing fee + non-refundable fee
  buyoutFee: number;            // Fee to buyout early
  totalPaid: number;            // Total if all payments made
  docFee: number;               // Documentation fee (now includes filing + non-refundable)
  financedCost: number;         // Total financed cost (price × 2.32)
};

/**
 * Calculate Rent-To-Own pricing using Matt's official formula
 *
 * MATT'S RTO FORMULA:
 * - Finance Factor: 2.32 (price × 2.32 = total financed cost)
 * - Down Payment: 10.35% of original price
 * - Monthly Payment: financedCost / term + tax
 * - Tax: calculated on monthly base payment
 * - Initial Due: down payment + $300 non-refundable + $170 filing fee
 */
export function calculateRTO(input: RTOInput): RTOOutput {
  const {
    price,
    down: downInput,
    taxPct,
    termMonths,
    countyTaxPct = 1.5,
    filingFee = 170,
    nonRefundableFee = 300,
    financeFactor = 2.32,
    downPaymentFactor = 0.1035,
    // Legacy compatibility
    baseMarkupUsd,
    monthlyFactor,
    minDownUsd = 200,
    docFeeUsd,
    buyoutFeeUsd = 250,
  } = input;

  // Use Matt's formula (NEW METHOD) if legacy params not provided
  const useNewFormula = !monthlyFactor && !baseMarkupUsd;

  if (useNewFormula) {
    // MATT'S OFFICIAL RTO FORMULA
    const totalTaxRate = (taxPct + countyTaxPct) / 100;
    const financedCost = price * financeFactor;
    const baseMonthly = financedCost / termMonths;
    const taxPerMonth = baseMonthly * totalTaxRate;
    const totalMonthly = baseMonthly + taxPerMonth;

    // Calculate down payment (10.35% of price or user input, whichever is higher)
    const calculatedDown = price * downPaymentFactor;
    const down = Math.max(downInput, calculatedDown, minDownUsd);

    // Initial due at signing
    const initialDue = down + nonRefundableFee + filingFee;

    // Total paid over life of RTO
    const totalPaid = totalMonthly * termMonths + down + filingFee + nonRefundableFee;

    return {
      rtoPrice: financedCost,
      down,
      monthlyRent: baseMonthly,
      monthlyTax: taxPerMonth,
      monthlyTotal: totalMonthly,
      dueAtSigning: initialDue,
      buyoutFee: buyoutFeeUsd,
      totalPaid,
      docFee: filingFee + nonRefundableFee,
      financedCost,
    };
  } else {
    // LEGACY FORMULA (for backwards compatibility)
    const rtoPrice = price + (baseMarkupUsd || 1400);
    const down = Math.max(downInput, minDownUsd);
    const monthlyRent = rtoPrice * (monthlyFactor || 0.035);
    const taxRate = taxPct / 100;
    const monthlyTax = monthlyRent * taxRate;
    const monthlyTotal = monthlyRent + monthlyTax;
    const dueAtSigning = down + (docFeeUsd || 99) + monthlyTotal;
    const totalPaid = monthlyTotal * termMonths + down + (docFeeUsd || 99);

    return {
      rtoPrice,
      down,
      monthlyRent,
      monthlyTax,
      monthlyTotal,
      dueAtSigning,
      buyoutFee: buyoutFeeUsd,
      totalPaid,
      docFee: docFeeUsd || 99,
      financedCost: rtoPrice,
    };
  }
}

/**
 * Calculate RTO monthly payment for matrix display
 * Simplified version that only returns the monthly total
 * Uses Matt's formula by default (finance factor 2.32)
 */
export function calculateRTOMonthly(
  price: number,
  termMonths: number,
  taxPct: number,
  countyTaxPct: number = 1.5,
  financeFactor: number = 2.32,
): number {
  const totalTaxRate = (taxPct + countyTaxPct) / 100;
  const financedCost = price * financeFactor;
  const baseMonthly = financedCost / termMonths;
  const taxPerMonth = baseMonthly * totalTaxRate;
  return baseMonthly + taxPerMonth;
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
