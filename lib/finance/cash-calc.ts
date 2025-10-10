// Cash purchase calculation utilities

export type CashInput = {
  price: number;
  taxPct: number;
  fees: number;
  addedOptions?: number;  // Optional upgrades/additions
};

export type CashOutput = {
  basePrice: number;
  addedOptions: number;
  subtotal: number;
  taxes: number;
  fees: number;
  totalCash: number;
};

/**
 * Calculate total cash purchase price
 * Simple calculation: price + options + taxes + fees
 */
export function calculateCash(input: CashInput): CashOutput {
  const { price, taxPct, fees, addedOptions = 0 } = input;

  const basePrice = price;
  const subtotal = price + addedOptions;
  const taxes = subtotal * (taxPct / 100);
  const totalCash = subtotal + taxes + fees;

  return {
    basePrice,
    addedOptions,
    subtotal,
    taxes,
    fees,
    totalCash,
  };
}

/**
 * Calculate sales tax amount
 */
export function calculateTax(price: number, taxPct: number): number {
  return price * (taxPct / 100);
}

/**
 * Calculate total out-the-door price (simplified)
 */
export function calculateOutTheDoor(
  price: number,
  taxPct: number,
  fees: number
): number {
  const taxes = calculateTax(price, taxPct);
  return price + taxes + fees;
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
 * Calculate cash discount (if paying in full)
 * Some dealers offer a discount for cash purchases
 */
export function calculateCashDiscount(
  price: number,
  discountPercent: number
): {
  originalPrice: number;
  discount: number;
  discountedPrice: number;
} {
  const discount = price * (discountPercent / 100);
  const discountedPrice = price - discount;

  return {
    originalPrice: price,
    discount,
    discountedPrice,
  };
}
