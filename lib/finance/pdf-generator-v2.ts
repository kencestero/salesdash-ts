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
  <title>MJ Cargo Quote</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
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
    }

    .header {
      background: linear-gradient(135deg, #E6840D 0%, #A84E03 100%);
      padding: 20px;
      text-align: center;
      color: white;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .header h2 {
      font-size: 16px;
      font-weight: 400;
      letter-spacing: 2px;
    }

    .quote-info {
      background: #F5F5F5;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: #203F55;
    }

    .content {
      padding: 20px;
    }

    .section-header {
      background: #203F55;
      color: white;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .section-content {
      background: white;
      padding: 12px;
      margin-bottom: 15px;
      border: 1px solid #ddd;
      font-size: 11px;
      line-height: 1.6;
    }

    .section-content p {
      margin: 4px 0;
    }

    .section-content strong {
      color: #203F55;
    }

    .payment-options-header {
      background: linear-gradient(135deg, #E6840D 0%, #A84E03 100%);
      color: white;
      text-align: center;
      padding: 10px;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 20px 0 15px;
      border-radius: 4px;
    }

    .payment-cards {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 20px;
    }

    .payment-card {
      flex: 1;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #ddd;
      text-align: center;
    }

    .card-header {
      padding: 10px;
      color: white;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .finance-card .card-header {
      background: #3B82F6;
    }

    .rto-card .card-header {
      background: #A855F7;
    }

    .cash-card .card-header {
      background: #22C55E;
    }

    .card-body {
      padding: 20px;
      background: #FAFAFA;
    }

    .payment-amount {
      font-size: 24px;
      font-weight: bold;
      color: #203F55;
      margin: 10px 0;
    }

    .payment-details {
      font-size: 10px;
      color: #666;
      line-height: 1.6;
    }

    .signature-section {
      margin-top: 30px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .signature-fields {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }

    .signature-field {
      flex: 1;
    }

    .signature-line {
      border-bottom: 2px solid #203F55;
      margin-top: 25px;
      margin-right: 20px;
    }

    .footer {
      background: #203F55;
      color: white;
      padding: 15px;
      text-align: center;
      font-size: 9px;
      line-height: 1.6;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .footer-title {
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 4px;
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
    <!-- Header -->
    <div class="header">
      <h1>MJ CARGO TRAILERS</h1>
      <h2>FINANCE CALCULATOR - Payment Quote</h2>
    </div>

    <!-- Quote Info Bar -->
    <div class="quote-info">
      <div>Quote Date: ${data.quoteDate}</div>
      <div>Generated by: ${data.repName}</div>
      <div>Quote #${quoteNumber}</div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Customer Information -->
      <div class="section-header">CUSTOMER INFORMATION</div>
      <div class="section-content">
        <p><strong>Name:</strong> ${data.customerName}</p>
        ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
        ${data.customerEmail ? `<p><strong>Email:</strong> ${data.customerEmail}</p>` : ''}
      </div>

      <!-- Unit Details -->
      <div class="section-header">UNIT DETAILS</div>
      <div class="section-content">
        <p><strong>${brand} Unit (Brand New)</strong></p>
        <p>with a ${warranty} at no extra cost</p>
        ${data.unitDescription ? `<p><strong>Unit Size:</strong> ${data.unitDescription}</p>` : ''}
        <p><strong>Base Price:</strong> $${data.unitPrice.toLocaleString()}</p>
        <p><strong>Tax:</strong> ${data.taxPercent.toFixed(2)}%&nbsp;&nbsp;&nbsp;&nbsp;<strong>Fees:</strong> $${data.fees}</p>
        <div class="tax-disclaimer">
          * Prices may vary depending on State and County.<br>
          If Cash deal, customer will be responsible to pay taxes and registration at The Department of Motor Vehicles.<br>
          For more information on local registration fees visit: https://www.fhwa.dot.gov/ohim/hwytaxes/2001/pt11b.htm
        </div>
      </div>

      <!-- Payment Options Header -->
      <div class="payment-options-header">YOUR PAYMENT OPTIONS</div>

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
          <div class="card-header">RTO</div>
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
          <div class="card-header">CASH</div>
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
        <div class="signature-fields">
          <div class="signature-field">
            Customer Signature:
            <div class="signature-line"></div>
          </div>
          <div class="signature-field">
            Date:
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-title">MJ Cargo Trailers - Premium Enclosed Cargo Trailers & Equipment Trailers</div>
      <div>We offer delivery service, and deliver for free subject to distance from our location.</div>
      <div>This quote and prices subject to change without notice.</div>
      <div style="margin-top: 6px;">Rep: ${data.repName} | ${data.repEmail}</div>
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
