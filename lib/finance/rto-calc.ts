// Rent-To-Own (RTO) calculation utilities
// Updated with C3 Leasing rules - Up-Front Charges SEPARATE from monthly payment

import { calculateUpFrontCharges, getRTOFeesByZIP } from '@/config/rto-fee-map';

export type RTOInput = {
  price: number;
  down: number;                 // Down payment entered by user (can be $0)
  taxPct: number;
  termMonths: number;
  zipCode?: string;             // Customer ZIP code (for state fee lookup) - defaults to "default"
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

  // C3 LEASING UP-FRONT CHARGES (SEPARATE FROM MONTHLY)
  upFrontCharges: {
    firstMonthRent: number;     // First month's rent
    securityDeposit: number;    // Security deposit (varies by state)
    stateFee: number;           // State filing fee
    countyFee: number;          // County fee (if applicable)
    totalUF: number;            // Total Up-Front Charges
  };

  dueAtSigning: number;         // Down + UF charges
  buyoutFee: number;            // Fee to buyout early
  totalPaid: number;            // Total if all payments made
  docFee: number;               // Documentation fee (now includes filing + non-refundable)
  financedCost: number;         // Total financed cost (price × 2.32)

  // State info
  stateCode: string;            // State abbreviation (e.g., "GA", "FL")
  rtoAllowed: boolean;          // Whether RTO is legal in this state
};

/**
 * Calculate Rent-To-Own pricing using C3 LEASING compliant formula
 *
 * C3 LEASING REQUIREMENTS (Phase 1):
 * - Up-Front Charges (UF) are SEPARATE from monthly payment
 * - UF = First Month Rent + Security Deposit + State/County Fees
 * - $0 down ≠ $0 due at delivery (UF always applies)
 * - State restrictions: NJ prohibits RTO entirely
 *
 * RTO FORMULA:
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
 * UP-FRONT CHARGES (State-based, see config/rto-fee-map.ts):
 * - First Month Rent = baseMonthly
 * - Security Deposit = baseMonthly × depositRate (varies by state)
 * - State Fee = fixed per state (e.g., GA: $25, FL: $45)
 * - County Fee = optional county-specific fee
 *
 * Matt's Fees: Title/Tag ($200), Registration ($75), GPS ($350), Doc ($195)
 *
 * @param input - RTO input parameters including zipCode for state lookup
 * @returns RTOOutput with separated upFrontCharges and monthly payment
 */
export function calculateRTO(input: RTOInput): RTOOutput {
  const {
    price,
    down: downInput,
    taxPct,
    termMonths,
    zipCode = "",  // Default to empty string (uses default config)
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

  // Get state configuration from ZIP code (or default if not provided)
  const stateConfig = getRTOFeesByZIP(zipCode || "");

  // Check if RTO is allowed in this state (e.g., NJ disallows RTO)
  if (!stateConfig.rtoAllowed) {
    // Return disabled state
    return {
      rtoPrice: 0,
      down: 0,
      monthlyRent: 0,
      monthlyTax: 0,
      monthlyTotal: 0,
      upFrontCharges: {
        firstMonthRent: 0,
        securityDeposit: 0,
        stateFee: 0,
        countyFee: 0,
        totalUF: 0,
      },
      dueAtSigning: 0,
      buyoutFee: 0,
      totalPaid: 0,
      docFee: 0,
      financedCost: 0,
      stateCode: stateConfig.stateName,
      rtoAllowed: false,
    };
  }

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

    // C3 LEASING: Calculate Up-Front Charges using state-based fees
    const ufCharges = calculateUpFrontCharges(baseMonthly, zipCode);

    // Total up front = Down payment + UF charges (SEPARATE from monthly)
    const totalUpFront = downInput + ufCharges.totalUF;

    // Total paid over life (includes down, UF, and all monthly payments)
    const totalPaid = downInput + ufCharges.totalUF + (totalMonthly * termMonths);

    return {
      rtoPrice: totalRTOPrice, // Total RTO price (amount financed × factor)
      down: downInput,
      monthlyRent: baseMonthly,
      monthlyTax: monthlyTax,
      monthlyTotal: totalMonthly,

      // C3 LEASING: Up-Front Charges (SEPARATE from monthly payment)
      upFrontCharges: {
        firstMonthRent: ufCharges.firstMonthRent,
        securityDeposit: ufCharges.securityDeposit,
        stateFee: ufCharges.stateFee,
        countyFee: ufCharges.countyFee,
        totalUF: ufCharges.totalUF,
      },

      dueAtSigning: totalUpFront,
      buyoutFee: buyoutFeeUsd,
      totalPaid: totalPaid,
      docFee: titleTag + registration + gpsFee + docFee,
      financedCost: totalRTOPrice,

      // State info
      stateCode: ufCharges.stateConfig.stateName,
      rtoAllowed: true,
    };
  } else {
    // LEGACY FORMULA (for backwards compatibility)
    const rtoPrice = price + (baseMarkupUsd || 1400);
    const down = Math.max(downInput, minDownUsd);
    const monthlyRent = rtoPrice * (monthlyFactor || 0.035);
    const taxRate = taxPct / 100;
    const monthlyTax = monthlyRent * taxRate;
    const monthlyTotal = monthlyRent + monthlyTax;

    // C3 LEASING: Calculate Up-Front Charges (even for legacy formula)
    const ufCharges = calculateUpFrontCharges(monthlyRent, zipCode);
    const dueAtSigning = down + ufCharges.totalUF;
    const totalPaid = down + ufCharges.totalUF + (monthlyTotal * termMonths);

    return {
      rtoPrice,
      down,
      monthlyRent,
      monthlyTax,
      monthlyTotal,

      // C3 LEASING: Up-Front Charges (SEPARATE from monthly payment)
      upFrontCharges: {
        firstMonthRent: ufCharges.firstMonthRent,
        securityDeposit: ufCharges.securityDeposit,
        stateFee: ufCharges.stateFee,
        countyFee: ufCharges.countyFee,
        totalUF: ufCharges.totalUF,
      },

      dueAtSigning,
      buyoutFee: buyoutFeeUsd,
      totalPaid,
      docFee: docFeeUsd || 99,
      financedCost: rtoPrice,

      // State info
      stateCode: ufCharges.stateConfig.stateName,
      rtoAllowed: true,
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
