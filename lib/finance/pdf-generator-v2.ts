/**
 * MJ Cargo Quote PDF/Image Generator V2
 * Matches Ken's exact design from the HTML template
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

export type QuoteData = {
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

  // Selected payment options
  selectedOptions: SelectedPaymentOption[];

  // Timestamp
  quoteDate: string;
};

export type ExportFormat = 'pdf' | 'jpeg' | 'png';

/**
 * Generate HTML template for the quote
 */
function generateQuoteHTML(data: QuoteData): string {
  const quoteNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

  // Determine brand based on unit description
  const isDiamond = data.unitDescription?.toLowerCase().includes('diamond') ?? true;
  const brand = isDiamond ? 'Diamond Cargo' : 'Quality Cargo LLC';
  const warranty = isDiamond ? '5 Year Limited Warranty' : '3 Year Limited Warranty';

  // Calculate totals for cash option
  const salesTax = data.unitPrice * (data.taxPercent / 100);
  const totalCash = data.unitPrice + salesTax + data.fees;

  // Find each option type
  const financeOption = data.selectedOptions.find(o => o.mode === 'FINANCE');
  const rtoOption = data.selectedOptions.find(o => o.mode === 'RTO');
  const cashOption = data.selectedOptions.find(o => o.mode === 'CASH');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MJ Cargo Quote - Luxury</title>
  <style>
    /* Official MJ Cargo Color Palette */
    :root {
      --mj-orange-gold: #E6840D;
      --mj-deep-navy: #203F55;
      --mj-charcoal-brown: #33251B;
      --mj-steel-gray: #5C524A;
      --mj-burnt-orange: #A84E03;
      --mj-midnight-blue: #0B151E;
      --mj-light-gray: #F5F5F5;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

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
      padding: 0;
      background: white;
      position: relative;
      background-image:
        repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(92,82,74,0.02) 35px, rgba(92,82,74,0.02) 70px),
        repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(92,82,74,0.02) 35px, rgba(92,82,74,0.02) 70px);
    }

    .premium-badge {
      position: absolute;
      top: 15px;
      right: 20px;
      background: linear-gradient(135deg, gold, #FFD700);
      color: var(--mj-deep-navy);
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(255,215,0,0.4);
      z-index: 10;
    }

    .luxury-header {
      background: linear-gradient(135deg, var(--mj-orange-gold), var(--mj-burnt-orange));
      padding: 25px 20px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }

    .logo-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .logo {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, var(--mj-deep-navy), var(--mj-midnight-blue));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 20px;
      color: var(--mj-orange-gold);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid white;
    }

    .luxury-header h1 {
      font-size: 32px;
      margin-bottom: 6px;
      text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
      letter-spacing: 2px;
      font-weight: 800;
    }

    .luxury-header h2 {
      font-size: 16px;
      font-weight: 300;
      letter-spacing: 3px;
      text-transform: uppercase;
      opacity: 0.95;
    }

    .header-divider {
      width: 250px;
      height: 2px;
      background: white;
      margin: 12px auto;
      position: relative;
    }

    .tagline {
      font-style: italic;
      font-size: 13px;
      margin-top: 8px;
      opacity: 0.9;
    }

    .quote-info {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      padding: 20px;
    }

    .quote-info-item {
      background: linear-gradient(135deg, var(--mj-light-gray), white);
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .quote-info-item .label {
      font-size: 10px;
      color: var(--mj-steel-gray);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .quote-info-item .value {
      font-size: 11px;
      color: var(--mj-deep-navy);
      font-weight: 600;
    }

    .content {
      padding: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    .info-section {
      border: 2px solid var(--mj-deep-navy);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .info-header {
      background: var(--mj-deep-navy);
      color: white;
      padding: 10px 15px;
      font-weight: bold;
      font-size: 12px;
      letter-spacing: 1px;
    }

    .info-content {
      padding: 12px 15px;
      font-size: 11px;
      background: white;
    }

    .info-content p {
      margin: 6px 0;
      color: var(--mj-charcoal-brown);
    }

    .info-content strong {
      color: var(--mj-deep-navy);
    }

    .payment-header {
      background: linear-gradient(135deg, var(--mj-orange-gold), var(--mj-burnt-orange));
      color: white;
      text-align: center;
      padding: 12px;
      margin: 20px 0 15px;
      font-weight: bold;
      font-size: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(230,132,13,0.3);
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .payment-cards {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 20px;
    }

    .payment-card {
      flex: 1;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 24px rgba(0,0,0,0.15);
      border: 3px solid;
    }

    .finance-card {
      border-color: #5C524A;
    }

    .rto-card {
      border-color: #0B151E;
    }

    .cash-card {
      border-color: #A84E03;
    }

    .card-header {
      padding: 12px;
      color: white;
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 1px;
      text-align: center;
    }

    .finance-card .card-header {
      background: linear-gradient(135deg, var(--mj-steel-gray), #4A423C);
    }

    .rto-card .card-header {
      background: linear-gradient(135deg, var(--mj-midnight-blue), #1A2633);
    }

    .cash-card .card-header {
      background: linear-gradient(135deg, var(--mj-burnt-orange), #D16203);
    }

    .card-body {
      padding: 20px 15px;
      background: linear-gradient(135deg, white, var(--mj-light-gray));
      text-align: center;
    }

    .payment-amount {
      font-size: 24px;
      font-weight: bold;
      color: var(--mj-deep-navy);
      margin: 8px 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .payment-details {
      font-size: 10px;
      color: #666;
      line-height: 1.6;
    }

    .signature-section {
      margin-top: 25px;
      padding: 20px;
      background: linear-gradient(135deg, var(--mj-light-gray), white);
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .signature-header {
      background: var(--mj-charcoal-brown);
      color: white;
      padding: 8px;
      margin: -20px -20px 15px;
      text-align: center;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .signature-fields {
      display: flex;
      justify-content: space-between;
      gap: 30px;
    }

    .signature-field {
      flex: 1;
    }

    .signature-line {
      border-bottom: 2px solid var(--mj-deep-navy);
      display: block;
      margin-top: 25px;
    }

    .footer {
      text-align: center;
      padding: 18px 20px;
      background: linear-gradient(135deg, #fafafa, white);
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      position: absolute;
      bottom: 15px;
      left: 20px;
      right: 20px;
    }

    .footer-logo {
      font-size: 16px;
      font-weight: bold;
      color: var(--mj-deep-navy);
      margin-bottom: 6px;
    }

    .footer-tagline {
      color: var(--mj-steel-gray);
      font-size: 10px;
      margin-bottom: 8px;
    }

    .footer-info {
      font-size: 9px;
      color: #999;
      margin-top: 8px;
    }

    .tax-disclaimer {
      font-size: 9px;
      font-style: italic;
      color: #666;
      margin-top: 8px;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="page" id="quote-page">
    <div class="premium-badge">PREMIUM</div>

    <!-- Luxury Header -->
    <div class="luxury-header">
      <div class="logo-container">
        <div class="logo">MJ</div>
        <div style="flex: 1;">
          <h1>MJ CARGO TRAILERS</h1>
          <h2>Finance Calculator</h2>
        </div>
        <div class="logo">MJ</div>
      </div>
      <div class="header-divider"></div>
      <div class="tagline">Rugged Quality, Smooth Financing</div>
    </div>

    <!-- Quote Info -->
    <div class="quote-info">
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

    <!-- Content -->
    <div class="content">
      <!-- Customer & Unit Info -->
      <div class="info-grid">
        <div class="info-section">
          <div class="info-header">CUSTOMER INFORMATION</div>
          <div class="info-content">
            <p><strong>Name:</strong> ${data.customerName}</p>
            ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
            ${data.customerEmail ? `<p><strong>Email:</strong> ${data.customerEmail}</p>` : ''}
          </div>
        </div>
        <div class="info-section">
          <div class="info-header">UNIT DETAILS</div>
          <div class="info-content">
            <p><strong>${brand} Unit</strong> (Brand New)</p>
            <p>${warranty}</p>
            ${data.unitDescription ? `<p><strong>Size:</strong> ${data.unitDescription}</p>` : ''}
            <p><strong>Base:</strong> $${data.unitPrice.toLocaleString()}</p>
            <p><strong>Tax:</strong> ${data.taxPercent.toFixed(2)}% | <strong>Fees:</strong> $${data.fees}</p>
          </div>
        </div>
      </div>

      <!-- Tax Disclaimer -->
      <div class="tax-disclaimer">
        * Prices may vary depending on State and County.
        If Cash deal, customer will be responsible to pay taxes and registration at The Department of Motor Vehicles.
        For more information on local registration fees visit: https://www.fhwa.dot.gov/ohim/hwytaxes/2001/pt11b.htm
      </div>

      <!-- Payment Options Header -->
      <div class="payment-header">Your Premium Payment Options</div>

      <!-- Payment Cards -->
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
          <div class="card-header">CASH PURCHASE OPTION</div>
          <div class="card-body">
            <div class="payment-amount">$${totalCash.toFixed(2)}</div>
            <div class="payment-details">
              Pay in full - No monthly payments
            </div>
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Signature Section -->
      <div class="signature-section">
        <div class="signature-header">AUTHORIZATION & AGREEMENT</div>
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
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-logo">MJ CARGO TRAILERS</div>
      <div class="footer-tagline">Premium Enclosed Cargo & Equipment Trailers</div>
      <div class="footer-info">
        Free Delivery Available | Flexible Financing | Contact Your Representative<br>
        www.mjcargotrailers.com | Prices subject to change | Rep: ${data.repName} | ${data.repEmail}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate quote in specified format (PDF, JPEG, or PNG)
 */
export async function generateQuote(data: QuoteData, format: ExportFormat = 'pdf'): Promise<void> {
  // Safety check: only run in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('generateQuote can only be called in a browser environment');
  }

  const html = generateQuoteHTML(data);
  const fileName = `MJ_Quote_${data.customerName.replace(/\s+/g, '_')}_${Date.now()}`;

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

/**
 * Backward compatible function (generates PDF only)
 */
export function generateQuotePDF(data: QuoteData): void {
  generateQuote(data, 'pdf').catch(console.error);
}
