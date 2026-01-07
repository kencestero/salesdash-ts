/**
 * Generate SMS-friendly text snippets for quotes
 * Optimized for mobile phone text windows
 */

export interface QuoteData {
  customerName: string;
  unitDescription: string;
  unitPrice: number;
  taxPercent: number;
  fees: number;
  apr?: number;
}

export interface FinanceData extends QuoteData {
  downPayments: number[];
  terms: number[];
  payments: Record<number, Record<number, number>>; // term -> down -> monthly
}

export interface RTOData extends QuoteData {
  downPayments: number[];
  terms: number[];
  payments: Record<number, Record<number, number>>; // term -> down -> monthly
}

/**
 * Generate Cash payment SMS snippet
 */
export function generateCashSnippet(data: QuoteData): string {
  const totalCash = data.unitPrice + (data.unitPrice * data.taxPercent / 100) + data.fees;

  return `Cash Deal - ${data.unitDescription}

Price:     $${data.unitPrice.toLocaleString()}
Tax:       $${((data.unitPrice * data.taxPercent) / 100).toLocaleString()}
Fees:      $${data.fees.toLocaleString()}
───────────────────
Total:     $${totalCash.toLocaleString()}

Pay in full - Own it today!

Contact Remotive Logistics Trailers for details.

───────────────────
Disclaimer: All quotes are estimates only and subject to verification. Remotive Logistics Trailers reserves the right to correct errors, omissions, or inaccuracies. Final pricing, taxes, fees, and financing terms are confirmed only in a signed purchase agreement.`;
}

/**
 * Generate Finance payment SMS snippet
 */
export function generateFinanceSnippet(data: FinanceData): string {
  const lines: string[] = [];

  lines.push(`Finance Options - ${data.unitDescription}`);
  lines.push(`(Monthly Payments)`);
  lines.push(``);

  // Header row with down payments
  const header = `Down →     ${data.downPayments.map(d => `$${(d / 1000).toFixed(d >= 10000 ? 0 : 1)}k`.padEnd(8)).join(' ')}`;
  lines.push(header);

  // Payment rows for each term
  data.terms.forEach(term => {
    const termLabel = `${term} mo`.padEnd(10);
    const payments = data.downPayments.map(down => {
      const monthly = data.payments[term]?.[down] || 0;
      return `$${monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.padEnd(8);
    }).join(' ');
    lines.push(`${termLabel} ${payments}`);
  });

  lines.push(``);
  lines.push(`APR: ${data.apr?.toFixed(2)}%`);
  lines.push(``);
  lines.push(`Contact Remotive Logistics Trailers for details.`);
  lines.push(``);
  lines.push(`───────────────────`);
  lines.push(`Disclaimer: All quotes are estimates only and subject to verification. Remotive Logistics Trailers reserves the right to correct errors, omissions, or inaccuracies. Final pricing, taxes, fees, and financing terms are confirmed only in a signed purchase agreement.`);

  return lines.join('\n');
}

/**
 * Generate RTO (Rent-To-Own) payment SMS snippet
 */
export function generateRTOSnippet(data: RTOData): string {
  const lines: string[] = [];

  lines.push(`Rent-To-Own Options - ${data.unitDescription}`);
  lines.push(`(Monthly Payments)`);
  lines.push(``);

  // Header row with down payments
  const header = `Down →     ${data.downPayments.map(d => `$${(d / 1000).toFixed(d >= 10000 ? 0 : 1)}k`.padEnd(8)).join(' ')}`;
  lines.push(header);

  // Payment rows for each term
  data.terms.forEach(term => {
    const termLabel = `${term} mo`.padEnd(10);
    const payments = data.downPayments.map(down => {
      const monthly = data.payments[term]?.[down] || 0;
      return `$${monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.padEnd(8);
    }).join(' ');
    lines.push(`${termLabel} ${payments}`);
  });

  lines.push(``);
  lines.push(`No credit check required!`);
  lines.push(`Own it after final payment.`);
  lines.push(``);
  lines.push(`Contact Remotive Logistics Trailers for details.`);
  lines.push(``);
  lines.push(`───────────────────`);
  lines.push(`Disclaimer: All quotes are estimates only and subject to verification. Remotive Logistics Trailers reserves the right to correct errors, omissions, or inaccuracies. Final pricing, taxes, fees, and financing terms are confirmed only in a signed purchase agreement.`);

  return lines.join('\n');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (error) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}
