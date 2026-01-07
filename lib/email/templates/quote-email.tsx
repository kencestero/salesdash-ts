import remotiveEmail from './mj-cargo-base';

interface QuoteEmailProps {
  customerName: string;
  repName: string;
  unitDescription: string;
  unitPrice: number;
  quoteLink: string;
}

export default function QuoteEmail({
  customerName,
  repName,
  unitDescription,
  unitPrice,
  quoteLink,
}: QuoteEmailProps) {
  return (
    <remotiveEmail
      preview={`Your Remotive Logistics quote for ${unitDescription}`}
      heading={`Hi ${customerName}!`}
      body={
        <>
          <p>Thank you for your interest in Remotive Logistics Trailers!</p>

          <p>{repName} has prepared a custom quote for you:</p>

          <div style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #FF6B2C',
            margin: '24px 0',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '20px',
              color: '#FF6B2C',
              margin: '0 0 12px 0',
              fontWeight: 'bold'
            }}>
              {unitDescription}
            </h2>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              margin: '8px 0'
            }}>
              ${unitPrice.toLocaleString()}
            </p>
          </div>

          <p><strong>What's included in your quote:</strong></p>
          <ul>
            <li>Multiple financing options (Cash, Finance, Rent-to-Own)</li>
            <li>Transparent pricing with no hidden fees</li>
            <li>Warranty information and coverage details</li>
            <li>Delivery options and pricing</li>
          </ul>

          <p>Click below to view your complete quote with all payment options and details:</p>
        </>
      }
      ctaText="View My Quote"
      ctaLink={quoteLink}
      footerText={`This quote was prepared by ${repName} at Remotive Logistics Trailers. Questions? Reply to this email or call us directly.`}
    />
  );
}
