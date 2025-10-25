// ¡HERMANO, AQUÍ ESTÁ EL GENERADOR COMPLETO!
// THIS CREATES ONE BEAUTIFUL HTML WITH ALL YOUR SELECTED PAYMENT OPTIONS
// NO MORE BULLSHIT - THIS IS THE REAL DEAL!

export function generateCompleteFinanceQuoteHTML({
  customerInfo,
  trailerDetails,
  allSelectedPayments,
  quoteInfo
}: {
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  trailerDetails: {
    manufacturer: string;
    model: string;
    year: number;
    stockNumber: string;
    size: string;
    basePrice: number;
    taxRate: number;
    taxAmount: number;
    fees: number;
    titleRegistration: number;
  };
  allSelectedPayments: {
    finance: Array<{
      downPayment: number;
      term: number;
      monthlyPayment: number;
      apr: number;
      totalOfPayments: number;
    }>;
    rto: Array<{
      downPayment: number;
      term: number;
      monthlyPayment: number;
      totalRent: number;
    }>;
    cash: {
      totalPrice: number;
      downPayment: number;
    };
  };
  quoteInfo: {
    quoteNumber: string;
    date: string;
    salesRep: string;
    salesRepEmail: string;
    salesRepPhone: string;
  };
}) {

  // Calculate total price
  const totalPrice = trailerDetails.basePrice + trailerDetails.taxAmount + trailerDetails.fees + trailerDetails.titleRegistration;

  // THE COMPLETE HTML - EXACTLY LIKE YOUR TEMPLATES!
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MJ Cargo Trailers - Complete Finance Quote #${quoteInfo.quoteNumber}</title>
    <style>
        /* MJ Cargo Official Colors */
        :root {
            --mj-orange: #E6840D;
            --mj-navy: #203F55;
            --mj-midnight: #0B151E;
            --mj-burnt: #A84E03;
            --mj-gray: #5C524A;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            border-radius: 12px;
            overflow: hidden;
        }

        /* HEADER SECTION */
        .header {
            background: linear-gradient(135deg, var(--mj-orange), var(--mj-burnt));
            padding: 40px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .header-content {
            position: relative;
            z-index: 2;
        }

        .header h1 {
            font-size: 42px;
            font-weight: 800;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
            margin-bottom: 10px;
            letter-spacing: 1px;
        }

        .header .subtitle {
            font-size: 18px;
            font-weight: 300;
            letter-spacing: 2px;
            text-transform: uppercase;
            opacity: 0.95;
        }

        .quote-info-bar {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 2px solid rgba(255,255,255,0.3);
            font-size: 14px;
        }

        /* CUSTOMER INFORMATION */
        .customer-section {
            padding: 35px 40px;
            background: white;
            border-bottom: 2px solid #f0f0f0;
        }

        .section-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--mj-navy);
            margin-bottom: 25px;
            padding-bottom: 10px;
            border-bottom: 3px solid var(--mj-orange);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 25px;
        }

        .info-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid var(--mj-orange);
        }

        .info-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .info-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--mj-navy);
        }

        /* TRAILER DETAILS */
        .trailer-section {
            padding: 35px 40px;
            background: linear-gradient(to right, #fafbfc, white);
            border-bottom: 2px solid #f0f0f0;
        }

        .trailer-main {
            font-size: 24px;
            font-weight: 700;
            color: var(--mj-navy);
            margin-bottom: 20px;
        }

        .specs-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }

        .spec-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;
        }

        .spec-label {
            color: #666;
            font-weight: 500;
        }

        .spec-value {
            color: var(--mj-navy);
            font-weight: 600;
        }

        .total-row {
            margin-top: 20px;
            padding: 20px;
            background: var(--mj-orange);
            border-radius: 8px;
            color: white;
            display: flex;
            justify-content: space-between;
            font-size: 24px;
            font-weight: 700;
        }

        /* PAYMENT OPTIONS SECTION - THE MAIN SHOW! */
        .payment-section {
            padding: 40px;
            background: linear-gradient(135deg, var(--mj-navy), var(--mj-midnight));
        }

        .payment-title {
            text-align: center;
            font-size: 32px;
            color: var(--mj-orange);
            margin-bottom: 40px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        /* Payment Type Headers */
        .payment-type-section {
            margin-bottom: 40px;
        }

        .payment-type-header {
            background: rgba(255,255,255,0.1);
            padding: 15px 25px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .payment-type-badge {
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 1px;
        }

        .finance-badge {
            background: linear-gradient(135deg, #4A90E2, #357ABD);
            color: white;
        }

        .rto-badge {
            background: linear-gradient(135deg, #9B59B6, #8E44AD);
            color: white;
        }

        .cash-badge {
            background: linear-gradient(135deg, #27AE60, #229A4C);
            color: white;
        }

        /* Payment Cards Grid */
        .payment-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }

        .payment-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            position: relative;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .payment-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }

        .payment-card.finance {
            border-top: 5px solid #4A90E2;
        }

        .payment-card.rto {
            border-top: 5px solid #9B59B6;
        }

        .payment-card.cash {
            border-top: 5px solid #27AE60;
        }

        .payment-amount {
            font-size: 36px;
            font-weight: 800;
            color: var(--mj-navy);
            margin: 20px 0;
        }

        .payment-amount .per-month {
            font-size: 16px;
            font-weight: 400;
            color: #666;
        }

        .payment-terms {
            margin-bottom: 15px;
        }

        .payment-term-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            color: #555;
            border-bottom: 1px solid #f0f0f0;
        }

        .payment-term-label {
            font-weight: 500;
        }

        .payment-term-value {
            font-weight: 600;
            color: var(--mj-navy);
        }

        /* Cash Special Box */
        .cash-special {
            background: linear-gradient(135deg, #27AE60, #229A4C);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-top: 20px;
        }

        .cash-special .amount {
            font-size: 48px;
            font-weight: 800;
            margin: 15px 0;
        }

        .cash-special .label {
            font-size: 18px;
            opacity: 0.95;
        }

        /* Disclaimer Section */
        .disclaimer {
            margin: 40px;
            padding: 25px;
            background: #FFF3CD;
            border: 2px solid #FFC107;
            border-radius: 8px;
        }

        .disclaimer-title {
            color: #856404;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 15px;
        }

        .disclaimer-text {
            color: #856404;
            font-size: 14px;
            line-height: 1.8;
        }

        .disclaimer ul {
            margin: 10px 0 0 20px;
        }

        .disclaimer li {
            margin: 5px 0;
        }

        /* Footer */
        .footer {
            background: var(--mj-navy);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .footer-logo {
            font-size: 28px;
            font-weight: 800;
            color: var(--mj-orange);
            margin-bottom: 20px;
        }

        .footer-text {
            font-size: 14px;
            line-height: 1.8;
            opacity: 0.9;
            margin-bottom: 20px;
        }

        .footer-contact {
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.2);
            margin-top: 20px;
        }

        .footer-contact a {
            color: var(--mj-orange);
            text-decoration: none;
            font-weight: 600;
        }

        /* Print Styles */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                max-width: 100%;
            }
            .payment-card:hover {
                transform: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <div class="header-content">
                <h1>MJ CARGO TRAILERS</h1>
                <div class="subtitle">Your Premium Trailer Finance Quote</div>
                <div class="quote-info-bar">
                    <span>📅 ${quoteInfo.date}</span>
                    <span>📋 Quote #${quoteInfo.quoteNumber}</span>
                    <span>👤 ${quoteInfo.salesRep}</span>
                </div>
            </div>
        </div>

        <!-- CUSTOMER INFORMATION -->
        <div class="customer-section">
            <h2 class="section-title">Customer Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Customer Name</div>
                    <div class="info-value">${customerInfo.name || 'Kenneth Cestero'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Phone Number</div>
                    <div class="info-value">${customerInfo.phone || '888-888-8888'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email Address</div>
                    <div class="info-value">${customerInfo.email || 'customer@mjcargo.com'}</div>
                </div>
            </div>
        </div>

        <!-- TRAILER DETAILS -->
        <div class="trailer-section">
            <h2 class="section-title">Trailer Details</h2>
            <div class="trailer-main">
                ${trailerDetails.year} ${trailerDetails.manufacturer} ${trailerDetails.model}
            </div>
            <div class="specs-grid">
                <div class="spec-row">
                    <span class="spec-label">Trailer Size:</span>
                    <span class="spec-value">${trailerDetails.size}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Stock Number:</span>
                    <span class="spec-value">${trailerDetails.stockNumber}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Base Price:</span>
                    <span class="spec-value">$${trailerDetails.basePrice.toLocaleString()}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Tax (${trailerDetails.taxRate}%):</span>
                    <span class="spec-value">$${trailerDetails.taxAmount.toFixed(2)}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Doc Fees:</span>
                    <span class="spec-value">$${trailerDetails.fees.toFixed(2)}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Title & Registration:</span>
                    <span class="spec-value">$${trailerDetails.titleRegistration.toFixed(2)}</span>
                </div>
            </div>
            <div class="total-row">
                <span>TOTAL PRICE:</span>
                <span>$${totalPrice.toLocaleString()}</span>
            </div>
        </div>

        <!-- PAYMENT OPTIONS - ALL OF THEM! -->
        <div class="payment-section">
            <h2 class="payment-title">Choose Your Payment Option</h2>

            <!-- FINANCE OPTIONS -->
            ${allSelectedPayments.finance && allSelectedPayments.finance.length > 0 ? `
            <div class="payment-type-section">
                <div class="payment-type-header">
                    <span class="payment-type-badge finance-badge">FINANCE OPTIONS</span>
                    <span style="color: white;">Traditional Financing with Competitive Rates</span>
                </div>
                <div class="payment-cards">
                    ${allSelectedPayments.finance.map(option => `
                    <div class="payment-card finance">
                        <div class="payment-amount">
                            $${option.monthlyPayment.toFixed(2)}
                            <span class="per-month">/month</span>
                        </div>
                        <div class="payment-terms">
                            <div class="payment-term-item">
                                <span class="payment-term-label">Term:</span>
                                <span class="payment-term-value">${option.term} months</span>
                            </div>
                            <div class="payment-term-item">
                                <span class="payment-term-label">Down:</span>
                                <span class="payment-term-value">$${option.downPayment.toLocaleString()}</span>
                            </div>
                            <div class="payment-term-item">
                                <span class="payment-term-label">APR:</span>
                                <span class="payment-term-value">${option.apr}%</span>
                            </div>
                            <div class="payment-term-item">
                                <span class="payment-term-label">Total Paid:</span>
                                <span class="payment-term-value">$${option.totalOfPayments.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- RTO OPTIONS -->
            ${allSelectedPayments.rto && allSelectedPayments.rto.length > 0 ? `
            <div class="payment-type-section">
                <div class="payment-type-header">
                    <span class="payment-type-badge rto-badge">RENT TO OWN OPTIONS</span>
                    <span style="color: white;">Flexible Terms with No Credit Check</span>
                </div>
                <div class="payment-cards">
                    ${allSelectedPayments.rto.map(option => `
                    <div class="payment-card rto">
                        <div class="payment-amount">
                            $${option.monthlyPayment.toFixed(2)}
                            <span class="per-month">/month</span>
                        </div>
                        <div class="payment-terms">
                            <div class="payment-term-item">
                                <span class="payment-term-label">Term:</span>
                                <span class="payment-term-value">${option.term} months</span>
                            </div>
                            <div class="payment-term-item">
                                <span class="payment-term-label">Down:</span>
                                <span class="payment-term-value">$${option.downPayment.toLocaleString()}</span>
                            </div>
                            <div class="payment-term-item">
                                <span class="payment-term-label">Total Rent:</span>
                                <span class="payment-term-value">$${option.totalRent.toLocaleString()}</span>
                            </div>
                            <div class="payment-term-item">
                                <span class="payment-term-label">Includes:</span>
                                <span class="payment-term-value">LDW Protection</span>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- CASH OPTION -->
            <div class="cash-special">
                <div class="label">💰 BEST VALUE - PAY IN FULL</div>
                <div class="amount">$${allSelectedPayments.cash.totalPrice.toLocaleString()}</div>
                <div class="label">Cash Purchase - No Monthly Payments</div>
            </div>
        </div>

        <!-- DISCLAIMER -->
        <div class="disclaimer">
            <div class="disclaimer-title">⚠️ Important Information</div>
            <div class="disclaimer-text">
                <strong>Finance & RTO Terms:</strong> All financing and rent-to-own options are subject to credit approval. APR rates may vary based on creditworthiness. Tax rates and registration fees may vary by state and county.
                <br><br>
                <strong>Cash Purchase:</strong> Cash price includes all taxes and fees as shown. Customer is responsible for title and registration at their local DMV. No hidden charges. Price valid for 7 days from quote date.
                <br><br>
                <strong>This quote is valid for 7 days</strong> from the date shown above. Prices and availability subject to change without notice.
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <div class="footer-logo">MJ CARGO TRAILERS</div>
            <div class="footer-text">
                Premium Enclosed Cargo Trailers & Equipment Trailers<br>
                We offer delivery service and deliver for free subject to distance from our location<br>
                Quality products backed by excellent service
            </div>
            <div class="footer-contact">
                <strong>Ready to Get Your Trailer?</strong><br>
                📞 ${quoteInfo.salesRepPhone} |
                ✉️ <a href="mailto:${quoteInfo.salesRepEmail}">${quoteInfo.salesRepEmail}</a><br>
                © 2024 MJ Cargo Trailers. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>`;

  return htmlContent;
}

// DOWNLOAD THE HTML FILE
export function downloadCompleteQuote(htmlContent: string, customerName: string, quoteNumber: string) {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `MJ_Cargo_Quote_${customerName.replace(/\s+/g, '_')}_${quoteNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// EXAMPLE USAGE - ¡ASÍ ES COMO LO USAS HERMANO!
/*
// When user clicks "Generate Quote" after selecting options:
const allPaymentOptions = {
  finance: [
    { downPayment: 0, term: 36, monthlyPayment: 465.22, apr: 8.99, totalOfPayments: 16747.92 },
    { downPayment: 1000, term: 48, monthlyPayment: 354.33, apr: 8.99, totalOfPayments: 18007.84 },
    { downPayment: 2500, term: 60, monthlyPayment: 286.11, apr: 8.99, totalOfPayments: 19666.60 }
  ],
  rto: [
    { downPayment: 0, term: 36, monthlyPayment: 567.00, totalRent: 20412.00 },
    { downPayment: 1000, term: 48, monthlyPayment: 445.50, totalRent: 22384.00 }
  ],
  cash: {
    totalPrice: 13650.00,
    downPayment: 13650.00
  }
};

const htmlContent = generateCompleteFinanceQuoteHTML({
  customerInfo: {
    name: "Kenneth Cestero",
    phone: "888-888-8888",
    email: "kencestero@gmail.com"
  },
  trailerDetails: {
    manufacturer: "Quality Cargo",
    model: "Enclosed V-Nose Tandem Axle",
    year: 2024,
    stockNumber: "MJ2024-DEMO",
    size: "8.5x24",
    basePrice: 12500,
    taxRate: 7,
    taxAmount: 875,
    fees: 125,
    titleRegistration: 150
  },
  allSelectedPayments: allPaymentOptions,
  quoteInfo: {
    quoteNumber: "Q-2024-1025-001",
    date: new Date().toLocaleDateString(),
    salesRep: "Kenneth Cestero",
    salesRepEmail: "kencestero@gmail.com",
    salesRepPhone: "(555) MJ-CARGO"
  }
});

// Download it!
downloadCompleteQuote(htmlContent, "Kenneth_Cestero", "Q-2024-1025-001");
*/

// ¡LISTO PAPI! THIS IS THE REAL DEAL - NO MORE BULLSHIT!
