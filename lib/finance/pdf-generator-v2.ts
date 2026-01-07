/**
 * Remotive Logistics Quote PDF/Image Generator V2
 * Full Payment Matrix Tables - Shows ALL checked payment options
 * Supports: PDF, JPEG, PNG export
 *
 * CLIENT-SIDE ONLY: Uses browser APIs (document, canvas)
 */

"use client";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export type SelectedPaymentOption = {
  mode: "CASH" | "FINANCE" | "RTO";
  label: string;
  amount: number; // Monthly payment or total cash
  term?: number; // Months (if applicable)
  down?: number; // Down payment
  details?: string; // Additional info (APR, etc.)
};

export type FinanceMatrixData = {
  terms: number[]; // e.g., [24, 36, 48, 60]
  downPayments: number[]; // e.g., [0, 1000, 2000, 3000]
  payments: Record<number, Record<number, number>>; // payments[term][down] = monthly
  apr: number;
};

export type RTOMatrixData = {
  terms: number[]; // e.g., [24, 36, 48]
  downPayments: number[]; // e.g., [0, 1000, 2000, 3000]
  payments: Record<number, Record<number, number>>; // payments[term][down] = monthly
};

export type CashData = {
  basePrice: number;
  fees: number;
  taxes: number;
  totalCash: number;
};

export type QuoteDataV2 = {
  // Customer Info
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;

  // Rep Info
  repId: string;
  repName: string;
  repEmail: string;

  // Unit Info
  unitDescription?: string;
  unitPrice: number;
  taxPercent: number;
  fees: number;

  // Payment matrix data (full matrices)
  financeMatrix?: FinanceMatrixData;
  rtoMatrix?: RTOMatrixData;
  cashData?: CashData;

  // Display options
  showAPR?: boolean;

  // Timestamp
  quoteDate: string;
};

// Keep old types for backward compatibility
export type QuoteData = {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  repId: string;
  repName: string;
  repEmail: string;
  unitDescription?: string;
  unitPrice: number;
  taxPercent: number;
  fees: number;
  selectedOptions: SelectedPaymentOption[];
  quoteDate: string;
};

export type ExportFormat = 'pdf' | 'jpeg' | 'png';

/**
 * Generate HTML template for the quote with FULL PAYMENT MATRICES
 */
function generateQuoteHTMLV2(data: QuoteDataV2): string {
  const quoteNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

  // Determine brand based on unit description
  const isDiamond = data.unitDescription?.toLowerCase().includes('diamond') ?? true;
  const brand = isDiamond ? 'Diamond Cargo' : 'Quality Cargo LLC';
  const warranty = isDiamond ? '5 Year Limited Warranty' : '3 Year Limited Warranty';

  // Generate Finance Options Table HTML
  const generateFinanceTable = () => {
    if (!data.financeMatrix) return '';
    const { terms, downPayments, payments, apr } = data.financeMatrix;

    return `
      <div class="matrix-section">
        <div class="matrix-header finance-header">
          FINANCE OPTIONS ${data.showAPR ? `<span class="apr-badge">${apr.toFixed(2)}% APR</span>` : ''}
        </div>
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Term</th>
              ${downPayments.map(d => `<th>$${d.toLocaleString()} Down</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${terms.map(term => `
              <tr>
                <td class="term-cell">${term} mo</td>
                ${downPayments.map(down => `
                  <td class="payment-cell">$${payments[term][down].toFixed(2)}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  // Generate RTO Options Table HTML
  const generateRTOTable = () => {
    if (!data.rtoMatrix) return '';
    const { terms, downPayments, payments } = data.rtoMatrix;

    return `
      <div class="matrix-section">
        <div class="matrix-header rto-header">
          LEASE / RENT-TO-OWN <span class="fee-badge">$19.99/mo LDW + Fees</span>
        </div>
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Term</th>
              ${downPayments.map(d => `<th>$${d.toLocaleString()} Down</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${terms.map(term => `
              <tr>
                <td class="term-cell">${term} mo</td>
                ${downPayments.map(down => `
                  <td class="payment-cell">$${payments[term][down].toFixed(2)}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  // Generate Cash Summary HTML
  const generateCashSection = () => {
    if (!data.cashData) return '';
    const { basePrice, fees, taxes, totalCash } = data.cashData;

    return `
      <div class="matrix-section">
        <div class="matrix-header cash-header">CASH PURCHASE OPTION</div>
        <div class="cash-breakdown">
          <div class="cash-row">
            <span>Sale Price:</span>
            <span>$${basePrice.toLocaleString()}</span>
          </div>
          <div class="cash-row">
            <span>Gov / Other Fees:</span>
            <span>$${fees.toLocaleString()}</span>
          </div>
          <div class="cash-row">
            <span>Sales Tax (${data.taxPercent.toFixed(2)}%):</span>
            <span>$${taxes.toFixed(2)}</span>
          </div>
          <div class="cash-row total-row">
            <span>TOTAL CASH DUE:</span>
            <span>$${totalCash.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Remotive Logistics Quote</title>
  <style>
    /* Remotive Logistics Color Palette */
    :root {
      --remotive-orange: #E96114;
      --remotive-navy: #09213C;
      --steel-gray: #5C524A;
      --light-gray: #F5F5F5;
      --success-green: #22C55E;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 0;
      background: white;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      background: white;
      position: relative;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 3px solid var(--remotive-navy);
      margin-bottom: 15px;
    }

    .logo-box {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, var(--remotive-navy), #1a3a5c);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 22px;
      color: var(--remotive-orange);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .header-text {
      flex: 1;
      text-align: center;
    }

    .header-text h1 {
      font-size: 28px;
      color: var(--remotive-navy);
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .header-text h2 {
      font-size: 14px;
      color: var(--remotive-orange);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .header-text .tagline {
      font-size: 11px;
      color: var(--steel-gray);
      font-style: italic;
      margin-top: 4px;
    }

    /* Quote Info Bar */
    .quote-info-bar {
      display: flex;
      justify-content: space-between;
      background: var(--light-gray);
      padding: 10px 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      font-size: 11px;
    }

    .quote-info-item {
      text-align: center;
    }

    .quote-info-item .label {
      color: var(--steel-gray);
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
    }

    .quote-info-item .value {
      color: var(--remotive-navy);
      font-weight: 600;
      margin-top: 2px;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }

    .info-box {
      border: 2px solid var(--remotive-navy);
      border-radius: 8px;
      overflow: hidden;
    }

    .info-box-header {
      background: var(--remotive-navy);
      color: white;
      padding: 8px 12px;
      font-weight: 600;
      font-size: 11px;
      letter-spacing: 0.5px;
    }

    .info-box-content {
      padding: 10px 12px;
      font-size: 11px;
      line-height: 1.6;
    }

    .info-box-content p {
      margin: 4px 0;
      color: #333;
    }

    .info-box-content strong {
      color: var(--remotive-navy);
    }

    /* Payment Options Header */
    .payment-header {
      background: linear-gradient(135deg, var(--remotive-orange), #d55512);
      color: white;
      text-align: center;
      padding: 10px;
      margin: 15px 0;
      font-weight: 700;
      font-size: 14px;
      border-radius: 6px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* Matrix Sections */
    .matrix-section {
      margin-bottom: 15px;
    }

    .matrix-header {
      padding: 8px 12px;
      font-weight: 600;
      font-size: 12px;
      color: white;
      border-radius: 6px 6px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .finance-header {
      background: var(--steel-gray);
    }

    .rto-header {
      background: var(--remotive-navy);
    }

    .cash-header {
      background: var(--remotive-orange);
    }

    .apr-badge, .fee-badge {
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: normal;
    }

    /* Matrix Table */
    .matrix-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #ddd;
      border-top: none;
    }

    .matrix-table th {
      background: var(--light-gray);
      padding: 8px 6px;
      font-size: 10px;
      font-weight: 600;
      color: var(--remotive-navy);
      border: 1px solid #ddd;
      text-align: center;
    }

    .matrix-table td {
      padding: 8px 6px;
      font-size: 11px;
      border: 1px solid #ddd;
      text-align: center;
    }

    .term-cell {
      background: var(--light-gray);
      font-weight: 600;
      color: var(--remotive-navy);
    }

    .payment-cell {
      font-weight: 600;
      color: #333;
    }

    /* Cash Breakdown */
    .cash-breakdown {
      background: white;
      border: 1px solid #ddd;
      border-top: none;
      padding: 12px 15px;
    }

    .cash-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 11px;
      border-bottom: 1px dashed #eee;
    }

    .cash-row:last-child {
      border-bottom: none;
    }

    .total-row {
      font-weight: 700;
      font-size: 13px;
      color: var(--success-green);
      border-top: 2px solid var(--remotive-navy);
      padding-top: 10px;
      margin-top: 6px;
    }

    /* Signature Section */
    .signature-section {
      margin-top: 20px;
      padding: 15px;
      background: var(--light-gray);
      border-radius: 6px;
    }

    .signature-header {
      font-size: 11px;
      font-weight: 600;
      color: var(--remotive-navy);
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .signature-fields {
      display: flex;
      justify-content: space-between;
      gap: 40px;
    }

    .signature-field {
      flex: 1;
      font-size: 10px;
      color: var(--steel-gray);
    }

    .signature-line {
      display: block;
      border-bottom: 2px solid var(--remotive-navy);
      margin-top: 20px;
    }

    /* Footer */
    .footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid var(--remotive-navy);
      text-align: center;
    }

    .footer-brand {
      font-size: 14px;
      font-weight: 700;
      color: var(--remotive-navy);
      margin-bottom: 4px;
    }

    .footer-tagline {
      font-size: 10px;
      color: var(--steel-gray);
      margin-bottom: 8px;
    }

    .footer-contact {
      font-size: 9px;
      color: #888;
      line-height: 1.5;
    }

    /* Disclaimer */
    .disclaimer {
      font-size: 8px;
      color: #999;
      font-style: italic;
      margin-top: 10px;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="page" id="quote-page">
    <!-- Header -->
    <div class="header">
      <div class="logo-box">R</div>
      <div class="header-text">
        <h1>REMOTIVE LOGISTICS</h1>
        <h2>Finance Calculator</h2>
        <div class="tagline">"Premium Cargo & Equipment Trailers"</div>
      </div>
      <div class="logo-box">R</div>
    </div>

    <!-- Quote Info Bar -->
    <div class="quote-info-bar">
      <div class="quote-info-item">
        <div class="label">Quote Date</div>
        <div class="value">${data.quoteDate}</div>
      </div>
      <div class="quote-info-item">
        <div class="label">Representative</div>
        <div class="value">${data.repName}</div>
      </div>
      <div class="quote-info-item">
        <div class="label">Quote Number</div>
        <div class="value">#${quoteNumber}</div>
      </div>
    </div>

    <!-- Customer & Unit Info -->
    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-header">CUSTOMER INFO</div>
        <div class="info-box-content">
          <p><strong>Name:</strong> ${data.customerName}</p>
          ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
          ${data.customerEmail ? `<p><strong>Email:</strong> ${data.customerEmail}</p>` : ''}
        </div>
      </div>
      <div class="info-box">
        <div class="info-box-header">UNIT DETAILS</div>
        <div class="info-box-content">
          <p><strong>${brand} Unit</strong></p>
          ${data.unitDescription ? `<p><strong>Size:</strong> ${data.unitDescription}</p>` : ''}
          <p><strong>Base:</strong> $${data.unitPrice.toLocaleString()}</p>
          <p>${warranty}</p>
        </div>
      </div>
    </div>

    <!-- Payment Options Header -->
    <div class="payment-header">Your Premium Payment Options</div>

    <!-- Finance Matrix -->
    ${generateFinanceTable()}

    <!-- RTO Matrix -->
    ${generateRTOTable()}

    <!-- Cash Section -->
    ${generateCashSection()}

    <!-- Signature Section -->
    <div class="signature-section">
      <div class="signature-header">Authorization & Agreement</div>
      <div class="signature-fields">
        <div class="signature-field">
          Customer Signature:
          <span class="signature-line"></span>
        </div>
        <div class="signature-field">
          Date:
          <span class="signature-line"></span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">REMOTIVE LOGISTICS</div>
      <div class="footer-tagline">www.remotivelogistics.com</div>
      <div class="footer-contact">
        Rep: ${data.repName} | ${data.repEmail}
      </div>
      <div class="disclaimer">
        * All quotes are subject to top tier credit approval. Fees may vary depending on location of residence.
        Prices and availability subject to change without notice.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate quote in specified format (PDF, JPEG, or PNG) - V2 with full matrices
 */
export async function generateQuoteV2(data: QuoteDataV2, format: ExportFormat = 'pdf'): Promise<void> {
  // Safety check: only run in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('generateQuoteV2 can only be called in a browser environment');
  }

  const html = generateQuoteHTMLV2(data);
  const fileName = `Remotive_Quote_${data.customerName.replace(/\s+/g, '_')}_${Date.now()}`;

  // Create temporary container
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  const pageElement = container.querySelector('#quote-page') as HTMLElement;

  try {
    // Generate canvas from HTML
    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI (210mm)
      height: 1123, // A4 height in pixels at 96 DPI (297mm)
    });

    if (format === 'pdf') {
      // Convert canvas to PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = 297; // A4 height in mm

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${fileName}.pdf`);
    } else {
      // Convert canvas to image (JPEG or PNG)
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const extension = format === 'jpeg' ? 'jpg' : 'png';

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fileName}.${extension}`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, mimeType, 1.0);
    }
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

// ============================================================
// BACKWARD COMPATIBILITY - Keep old functions working
// ============================================================

/**
 * Generate HTML template for the quote (OLD - single options)
 */
function generateQuoteHTML(data: QuoteData): string {
  const quoteNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

  const isDiamond = data.unitDescription?.toLowerCase().includes('diamond') ?? true;
  const brand = isDiamond ? 'Diamond Cargo' : 'Quality Cargo LLC';
  const warranty = isDiamond ? '5 Year Limited Warranty' : '3 Year Limited Warranty';

  const salesTax = data.unitPrice * (data.taxPercent / 100);
  const totalCash = data.unitPrice + salesTax + data.fees;

  const financeOption = data.selectedOptions.find(o => o.mode === 'FINANCE');
  const rtoOption = data.selectedOptions.find(o => o.mode === 'RTO');
  const cashOption = data.selectedOptions.find(o => o.mode === 'CASH');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Remotive Logistics Quote</title>
  <style>
    :root {
      --remotive-orange: #E96114;
      --remotive-navy: #09213C;
      --steel-gray: #5C524A;
      --light-gray: #F5F5F5;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      background: white;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 15mm;
      background: white;
      position: relative;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 3px solid var(--remotive-navy);
      margin-bottom: 15px;
    }

    .logo-box {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, var(--remotive-navy), #1a3a5c);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 22px;
      color: var(--remotive-orange);
    }

    .header-text { flex: 1; text-align: center; }
    .header-text h1 { font-size: 28px; color: var(--remotive-navy); font-weight: 800; }
    .header-text h2 { font-size: 14px; color: var(--remotive-orange); text-transform: uppercase; }

    .quote-info-bar {
      display: flex;
      justify-content: space-between;
      background: var(--light-gray);
      padding: 10px 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      font-size: 11px;
    }

    .quote-info-item { text-align: center; }
    .quote-info-item .label { color: var(--steel-gray); font-size: 9px; text-transform: uppercase; }
    .quote-info-item .value { color: var(--remotive-navy); font-weight: 600; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
    .info-box { border: 2px solid var(--remotive-navy); border-radius: 8px; overflow: hidden; }
    .info-box-header { background: var(--remotive-navy); color: white; padding: 8px 12px; font-weight: 600; font-size: 11px; }
    .info-box-content { padding: 10px 12px; font-size: 11px; line-height: 1.6; }

    .payment-header {
      background: linear-gradient(135deg, var(--remotive-orange), #d55512);
      color: white;
      text-align: center;
      padding: 10px;
      margin: 15px 0;
      font-weight: 700;
      font-size: 14px;
      border-radius: 6px;
    }

    .payment-cards { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 20px; }
    .payment-card { flex: 1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); border: 3px solid; }
    .finance-card { border-color: var(--steel-gray); }
    .rto-card { border-color: var(--remotive-navy); }
    .cash-card { border-color: var(--remotive-orange); }

    .card-header { padding: 12px; color: white; font-size: 12px; font-weight: bold; text-align: center; }
    .finance-card .card-header { background: var(--steel-gray); }
    .rto-card .card-header { background: var(--remotive-navy); }
    .cash-card .card-header { background: var(--remotive-orange); }

    .card-body { padding: 20px 15px; background: white; text-align: center; }
    .payment-amount { font-size: 22px; font-weight: bold; color: var(--remotive-navy); margin: 8px 0; }
    .payment-details { font-size: 10px; color: #666; line-height: 1.6; }

    .signature-section { margin-top: 25px; padding: 15px; background: var(--light-gray); border-radius: 6px; }
    .signature-header { font-size: 11px; font-weight: 600; color: var(--remotive-navy); margin-bottom: 15px; text-transform: uppercase; }
    .signature-fields { display: flex; justify-content: space-between; gap: 40px; }
    .signature-field { flex: 1; font-size: 10px; color: var(--steel-gray); }
    .signature-line { display: block; border-bottom: 2px solid var(--remotive-navy); margin-top: 20px; }

    .footer { margin-top: 20px; padding-top: 15px; border-top: 2px solid var(--remotive-navy); text-align: center; }
    .footer-brand { font-size: 14px; font-weight: 700; color: var(--remotive-navy); }
    .footer-tagline { font-size: 10px; color: var(--steel-gray); }
    .footer-contact { font-size: 9px; color: #888; margin-top: 8px; }
    .disclaimer { font-size: 8px; color: #999; font-style: italic; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="page" id="quote-page">
    <div class="header">
      <div class="logo-box">R</div>
      <div class="header-text">
        <h1>REMOTIVE LOGISTICS</h1>
        <h2>Finance Calculator</h2>
      </div>
      <div class="logo-box">R</div>
    </div>

    <div class="quote-info-bar">
      <div class="quote-info-item">
        <div class="label">Quote Date</div>
        <div class="value">${data.quoteDate}</div>
      </div>
      <div class="quote-info-item">
        <div class="label">Representative</div>
        <div class="value">${data.repName}</div>
      </div>
      <div class="quote-info-item">
        <div class="label">Quote Number</div>
        <div class="value">#${quoteNumber}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-header">CUSTOMER INFO</div>
        <div class="info-box-content">
          <p><strong>Name:</strong> ${data.customerName}</p>
          ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
          ${data.customerEmail ? `<p><strong>Email:</strong> ${data.customerEmail}</p>` : ''}
        </div>
      </div>
      <div class="info-box">
        <div class="info-box-header">UNIT DETAILS</div>
        <div class="info-box-content">
          <p><strong>${brand} Unit</strong></p>
          ${data.unitDescription ? `<p><strong>Size:</strong> ${data.unitDescription}</p>` : ''}
          <p><strong>Base:</strong> $${data.unitPrice.toLocaleString()}</p>
          <p>${warranty}</p>
        </div>
      </div>
    </div>

    <div class="payment-header">Your Premium Payment Options</div>

    <div class="payment-cards">
      ${financeOption ? `
      <div class="payment-card finance-card">
        <div class="card-header">FINANCE</div>
        <div class="card-body">
          <div class="payment-amount">$${financeOption.amount.toFixed(2)}/mo</div>
          <div class="payment-details">
            ${financeOption.term ? `${financeOption.term} months<br>` : ''}
            Down: $${financeOption.down?.toLocaleString() || '0'}<br>
            ${financeOption.details || ''}
          </div>
        </div>
      </div>
      ` : ''}

      ${rtoOption ? `
      <div class="payment-card rto-card">
        <div class="card-header">LEASE / RENT-TO-OWN</div>
        <div class="card-body">
          <div class="payment-amount">$${rtoOption.amount.toFixed(2)}/mo</div>
          <div class="payment-details">
            ${rtoOption.term ? `${rtoOption.term} months<br>` : ''}
            Down: $${rtoOption.down?.toLocaleString() || '0'}
          </div>
        </div>
      </div>
      ` : ''}

      ${cashOption ? `
      <div class="payment-card cash-card">
        <div class="card-header">CASH PURCHASE</div>
        <div class="card-body">
          <div class="payment-amount">$${totalCash.toFixed(2)}</div>
          <div class="payment-details">
            Pay in full - No monthly payments
          </div>
        </div>
      </div>
      ` : ''}
    </div>

    <div class="signature-section">
      <div class="signature-header">Authorization & Agreement</div>
      <div class="signature-fields">
        <div class="signature-field">
          Customer Signature:
          <span class="signature-line"></span>
        </div>
        <div class="signature-field">
          Date:
          <span class="signature-line"></span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">REMOTIVE LOGISTICS</div>
      <div class="footer-tagline">www.remotivelogistics.com</div>
      <div class="footer-contact">
        Rep: ${data.repName} | ${data.repEmail}
      </div>
      <div class="disclaimer">
        * All quotes are subject to top tier credit approval. Fees may vary depending on location of residence.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate quote in specified format (PDF, JPEG, or PNG) - OLD compatibility
 */
export async function generateQuote(data: QuoteData, format: ExportFormat = 'pdf'): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('generateQuote can only be called in a browser environment');
  }

  const html = generateQuoteHTML(data);
  const fileName = `Remotive_Quote_${data.customerName.replace(/\s+/g, '_')}_${Date.now()}`;

  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  const pageElement = container.querySelector('#quote-page') as HTMLElement;

  try {
    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
    });

    if (format === 'pdf') {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`${fileName}.pdf`);
    } else {
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const extension = format === 'jpeg' ? 'jpg' : 'png';

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fileName}.${extension}`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, mimeType, 1.0);
    }
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Backward compatible function (generates PDF only)
 */
export function generateQuotePDF(data: QuoteData): void {
  generateQuote(data, 'pdf').catch(console.error);
}
