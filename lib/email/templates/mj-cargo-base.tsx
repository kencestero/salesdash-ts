/**
 * Remotive Logistics Base Email Template (React Email)
 *
 * This template uses React Email for maximum compatibility across email clients.
 * To use: npm install @react-email/components
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components';

interface remotiveEmailProps {
  preview?: string;
  heading: string;
  body: React.ReactNode;
  ctaText?: string;
  ctaLink?: string;
  footerText?: string;
}

export default function remotiveEmail({
  preview = "New message from Remotive Logistics Trailers",
  heading,
  body,
  ctaText,
  ctaLink,
  footerText = "This email was sent by Remotive Logistics Sales Dashboard. If you received this email in error, please contact support.",
}: remotiveEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with Remotive Logistics Orange Banner */}
          <Section style={header}>
            <Row>
              <Column>
                <Text style={headerText}>Remotive Logistics TRAILERS</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={headingStyle}>{heading}</Text>
            <div style={bodyStyle}>{body}</div>

            {/* Call to Action Button */}
            {ctaText && ctaLink && (
              <Section style={ctaSection}>
                <Link href={ctaLink} style={button}>
                  {ctaText}
                </Link>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerTextStyle}>
              <strong>Remotive Logistics Trailers</strong>
            </Text>
            <Text style={footerTextStyle}>
              Premium Enclosed Cargo Trailers & Equipment Trailers
            </Text>
            <Text style={footerTextStyle}>
              📍 Location Info • 📞 Phone • 📧 Email
            </Text>
            <Hr style={hr} />
            <Text style={disclaimerText}>{footerText}</Text>
            <Text style={disclaimerText}>
              <Link href="https://salesdash-ts.vercel.app/en/dashboard" style={link}>
                View in Dashboard
              </Link>
              {' • '}
              <Link href="https://salesdash-ts.vercel.app/en/auth/terms" style={link}>
                Terms & Conditions
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  border: '1px solid #e6ebf1',
};

const header = {
  backgroundColor: '#FF6B2C', // Remotive Logistics Orange
  padding: '24px',
  textAlign: 'center' as const,
};

const headerText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '1px',
};

const content = {
  padding: '32px 24px',
};

const headingStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  marginBottom: '16px',
};

const bodyStyle = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525252',
  marginBottom: '24px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#FF6B2C',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  padding: '24px',
  backgroundColor: '#f9fafb',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footerTextStyle = {
  fontSize: '14px',
  color: '#525252',
  lineHeight: '20px',
  margin: '4px 0',
  textAlign: 'center' as const,
};

const disclaimerText = {
  fontSize: '12px',
  color: '#8b8b8b',
  lineHeight: '16px',
  margin: '4px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#FF6B2C',
  textDecoration: 'none',
};
