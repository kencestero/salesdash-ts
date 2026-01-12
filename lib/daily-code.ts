import crypto from "crypto";

// Secret key for HMAC - should be in env vars
const DAILY_CODE_SECRET = process.env.DAILY_CODE_SECRET || "remotive-daily-code-secret-2026";

// Timezone for date calculation
const TIMEZONE = "America/New_York";

/**
 * Get today's date key in America/New_York timezone
 * Format: "2026-01-12"
 */
export function getTodayDateKey(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // Returns "YYYY-MM-DD"
}

/**
 * Get yesterday's date key for grace period
 */
export function getYesterdayDateKey(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

/**
 * Generate a deterministic daily code using HMAC
 * Code format: 10 uppercase alphanumeric characters
 */
export function generateDailyCode(dateKey: string): string {
  const hmac = crypto.createHmac("sha256", DAILY_CODE_SECRET);
  hmac.update(dateKey);
  const hash = hmac.digest("hex");

  // Convert to base32-like alphanumeric (A-Z, 2-7 for unambiguous chars)
  // We'll use a custom alphabet avoiding confusing chars (0/O, 1/I/L)
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 10; i++) {
    const hexPair = hash.substring(i * 2, i * 2 + 2);
    const num = parseInt(hexPair, 16);
    code += alphabet[num % alphabet.length];
  }

  return code;
}

/**
 * Get today's daily code
 */
export function getTodayCode(): string {
  return generateDailyCode(getTodayDateKey());
}

/**
 * Validate a code against today's and optionally yesterday's code
 * @param code - The code to validate
 * @param allowGracePeriod - If true, also accepts yesterday's code (for 2-6 hour grace)
 * @returns boolean indicating if the code is valid
 */
export function validateDailyCode(code: string, allowGracePeriod: boolean = true): boolean {
  const normalizedCode = code.toUpperCase().trim();

  // Check today's code
  const todayCode = generateDailyCode(getTodayDateKey());
  if (normalizedCode === todayCode) {
    return true;
  }

  // Check yesterday's code if grace period allowed
  if (allowGracePeriod) {
    const yesterdayCode = generateDailyCode(getYesterdayDateKey());
    if (normalizedCode === yesterdayCode) {
      return true;
    }
  }

  return false;
}

/**
 * Get the next reset time (midnight ET)
 */
export function getNextResetTime(): Date {
  const now = new Date();

  // Get current time in ET
  const etFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Parse current ET time
  const parts = etFormatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === "year")?.value || "2026");
  const month = parseInt(parts.find(p => p.type === "month")?.value || "1") - 1;
  const day = parseInt(parts.find(p => p.type === "day")?.value || "1");

  // Create midnight tomorrow in ET (approximation - returns UTC equivalent)
  const tomorrowMidnightET = new Date(Date.UTC(year, month, day + 1, 5, 0, 0)); // 5 AM UTC = midnight ET

  return tomorrowMidnightET;
}

/**
 * Format time until reset as human-readable string
 */
export function getTimeUntilReset(): string {
  const now = new Date();
  const resetTime = getNextResetTime();
  const diffMs = resetTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Code has reset";
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
