/**
 * WebAuthn Relying Party (RP) Helper
 *
 * Provides sanitized RP ID and origin for WebAuthn operations.
 * Ensures RP ID never has trailing spaces or www prefix.
 */

export interface RpConfig {
  id: string;      // e.g., "mjsalesdash.com"
  name: string;    // Display name
  origin: string;  // e.g., "https://mjsalesdash.com"
}

/**
 * Extract and sanitize RP ID from host header
 * Removes www prefix and trims whitespace
 */
export function getRpIDFromHost(h: string | null): string {
  return (h || "").trim().toLowerCase().replace(/^www\./, "");
}

/**
 * Get complete RP configuration for WebAuthn
 * Use this in all passkey API routes to ensure consistency
 */
export function getRp(hostHeader: string | null): RpConfig {
  const rpID = getRpIDFromHost(hostHeader);
  return {
    id: rpID || "mjsalesdash.com",
    name: "Remotive SalesHub",
    origin: `https://${rpID || "mjsalesdash.com"}`,
  };
}
