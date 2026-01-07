import { Resend } from "resend";

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
  lastAttempt: number;
}

// In-memory store for rate limiting
// Note: This will reset on server restart, but that's acceptable for this use case
const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 7;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const WINDOW_DURATION = 15 * 60 * 1000; // 15 minute window

/**
 * Check if an IP is rate limited
 * @param ip - IP address to check
 * @returns { allowed: boolean, remaining: number, blockedUntil?: Date }
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  blockedUntil?: Date;
  message?: string;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // No previous attempts
  if (!entry) {
    rateLimitStore.set(ip, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
    };
  }

  // Check if currently blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      blockedUntil: new Date(entry.blockedUntil),
      message: `Too many failed attempts. Please try again in ${Math.ceil((entry.blockedUntil - now) / 60000)} minutes.`,
    };
  }

  // Check if window has expired (reset counter)
  if (now - entry.firstAttempt > WINDOW_DURATION) {
    rateLimitStore.set(ip, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
    };
  }

  // Increment attempts
  entry.attempts += 1;
  entry.lastAttempt = now;

  // Check if limit exceeded
  if (entry.attempts > MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION;
    rateLimitStore.set(ip, entry);
    return {
      allowed: false,
      remaining: 0,
      blockedUntil: new Date(entry.blockedUntil),
      message: `Too many failed attempts. You have been temporarily blocked for 15 minutes.`,
    };
  }

  rateLimitStore.set(ip, entry);
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.attempts,
  };
}

/**
 * Record a successful validation (resets counter)
 */
export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

/**
 * Send security alert email when rate limit is triggered
 */
export async function sendRateLimitAlert(ip: string, attempts: number): Promise<void> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    });

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL?.replace(/^["']|["']$/g, "") || "Remotive Logistics Sales <noreply@mjsalesdash.com>",
      to: ["kenneth@mjsalesdash.com", "matt@mjsalesdash.com"], // Kenneth and Matt
      subject: "🚨 Security Alert: Multiple Failed Login Code Attempts",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding: 40px 0;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e6ebf1; border-radius: 8px;">
                  <tr><td style="background-color: #dc2626; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🚨 SECURITY ALERT</h1>
                  </td></tr>

                  <tr><td style="padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0;">Multiple Failed Secret Code Attempts</h2>

                    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #991b1b; font-weight: bold;">⚠️ Potential Brute Force Attack Detected</p>
                    </div>

                    <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                      Someone has attempted to validate a secret code <strong>${attempts} times</strong> from the same IP address and has been temporarily blocked.
                    </p>

                    <table width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                      <tr><td>
                        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;"><strong>IP Address:</strong></p>
                        <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; font-family: monospace;">${ip}</p>

                        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;"><strong>Failed Attempts:</strong></p>
                        <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px;">${attempts} attempts</p>

                        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;"><strong>Time:</strong></p>
                        <p style="margin: 0; color: #1f2937; font-size: 16px;">${timestamp}</p>
                      </td></tr>
                    </table>

                    <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
                      <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold;">🔒 Automatic Protection Active</p>
                      <p style="margin: 0; color: #3730a3; font-size: 14px; line-height: 1.5;">
                        The IP has been automatically blocked for <strong>15 minutes</strong>. No further action is required unless this pattern continues.
                      </p>
                    </div>

                    <h3 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px;">Recommended Actions:</h3>
                    <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Monitor for repeated attempts from this IP</li>
                      <li>Check if this IP belongs to a legitimate user</li>
                      <li>Consider rotating secret codes if attacks persist</li>
                      <li>Review access logs for suspicious patterns</li>
                    </ul>

                    <table width="100%" style="margin-top: 30px;">
                      <tr><td align="center">
                        <a href="${process.env.NEXTAUTH_URL}/en/dashboard" style="display: inline-block; background-color: #E96114; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Go to Dashboard
                        </a>
                      </td></tr>
                    </table>
                  </td></tr>

                  <tr><td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                      This is an automated security alert from Remotive SalesHub<br/>
                      If you have questions, contact your system administrator
                    </p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log(`✅ Security alert email sent to Kenneth & Matt for IP: ${ip}`);
  } catch (error) {
    console.error("❌ Failed to send rate limit alert email:", error);
    // Don't throw - we don't want email failures to break the rate limiting
  }
}

/**
 * Clean up old entries (call periodically to prevent memory leak)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const expiredTime = now - WINDOW_DURATION;

  for (const [ip, entry] of rateLimitStore.entries()) {
    // Remove entries that are expired and not blocked
    if (entry.lastAttempt < expiredTime && (!entry.blockedUntil || entry.blockedUntil < now)) {
      rateLimitStore.delete(ip);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
