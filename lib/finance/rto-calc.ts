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
 * Calculate Rent-To-Own pricing using the correct RTO formula
 *
 * CORRECT RTO FORMULA:
 * - RTO Factors by term (total cost multiplier):
 *   - 24 months: 1.75
 *   - 36 months: 2.10
 *   - 48 months: 2.45
 * - Amount to Finance = price - downPayment
 * - Total RTO Price = amountToFinance × rtoFactor[term]
 * - Base Monthly = totalRTOPrice / termMonths
 * - Monthly LDW = $19.99
 * - Monthly Tax = baseMonthly × taxRate
 * - Total Monthly = baseMonthly + monthlyLDW + monthlyTax
 *
 * Fees: Title/Tag ($200), Registration ($75), GPS ($350), Doc ($195)
 */
export function calculateRTO(input: RTOInput): RTOOutput {
  const {
    price,
    down: downInput,
    taxPct,
    termMonths,
    countyTaxPct = 0, // Not used in Matt's real calculator
    filingFee = 170,
    nonRefundableFee = 300,
    financeFactor = 2.32,
    downPaymentFactor = 0.1035,
    // Legacy compatibility
    baseMarkupUsd,
    monthlyFactor,
    minDownUsd = 0,
    docFeeUsd,
    buyoutFeeUsd = 250,
  } = input;

  // Use Matt's formula (NEW METHOD) if legacy params not provided
  const useNewFormula = !monthlyFactor && !baseMarkupUsd;

  if (useNewFormula) {
    // CORRECT RTO FORMULA
    // RTO factors by term (total cost multiplier)
    const rtoFactors: Record<number, number> = {
      24: 1.75,
      36: 2.10,
      48: 2.45,
    };

    const rtoFactor = rtoFactors[termMonths] || 2.10; // Default to 36 month factor

    // Amount to finance = price minus down payment
    const amountToFinance = price - downInput;

    // Total RTO price = amount financed × RTO factor
    const totalRTOPrice = amountToFinance * rtoFactor;

    // Base monthly payment (before tax and fees)
    const baseMonthly = totalRTOPrice / termMonths;

    // Monthly LDW (Loss Damage Waiver)
    const monthlyLDW = 19.99;

    // Sales tax on base monthly payment
    const taxRate = taxPct / 100;
    const monthlyTax = baseMonthly * taxRate;

    // Total monthly payment
    const totalMonthly = baseMonthly + monthlyLDW + monthlyTax;

    // Matt's fees structure
    const titleTag = 200;
    const registration = 75;
    const gpsFee = 350;
    const docFee = 195;
    const adminFee = 0;

    // Security deposit (simplified - varies by ZIP in real calc)
    const securityDeposit = baseMonthly * 0.5; // Approximate

    // Total up front
    const totalUpFront = downInput + titleTag + registration + gpsFee + docFee + adminFee + securityDeposit;

    // Total term cost
    const totalTermCost = totalMonthly * termMonths;

    // Total paid over life (includes all fees and payments)
    const totalPaid = totalUpFront + (totalMonthly * termMonths);

    return {
      rtoPrice: totalRTOPrice, // Total RTO price (amount financed × factor)
      down: downInput,
      monthlyRent: baseMonthly,
      monthlyTax: monthlyTax,
      monthlyTotal: totalMonthly,
      dueAtSigning: totalUpFront,
      buyoutFee: buyoutFeeUsd,
      totalPaid: totalPaid,
      docFee: titleTag + registration + gpsFee + docFee,
      financedCost: totalRTOPrice,
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
