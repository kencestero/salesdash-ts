/**
 * Response Timer Engine
 *
 * Tracks lead response times and provides urgency indicators.
 *
 * Time Thresholds:
 * - 0-5 minutes: Green "Great Timing"
 * - 5:01-10 minutes: Mustard "Decent Timing"
 * - 10:01-30 minutes: Red "Late"
 * - 30+ minutes: Yellow "Never Contacted"
 *
 * The timer starts when a lead is created and stops when first contact is made.
 */

export type ResponseTimerStatus =
  | "great" // 0-5 min
  | "decent" // 5-10 min
  | "late" // 10-30 min
  | "never_contacted" // 30+ min
  | "contacted"; // Already contacted

export interface ResponseTimerResult {
  status: ResponseTimerStatus;
  color: string; // Tailwind color class
  colorHex: string; // Hex color for non-Tailwind contexts
  label: string;
  minutesElapsed: number;
  secondsElapsed: number;
  isUrgent: boolean; // True if 10+ minutes
  isPulsating: boolean; // True if exactly at 10 min threshold
  formattedTime: string; // "5:32" format
  message: string; // User-friendly message
}

// Threshold constants (in minutes)
const GREAT_THRESHOLD = 5;
const DECENT_THRESHOLD = 10;
const LATE_THRESHOLD = 30;

/**
 * Calculate response timer status for a lead
 */
export function calculateResponseTimer(
  createdAt: Date,
  lastContactedAt: Date | null
): ResponseTimerResult {
  // If already contacted, return contacted status
  if (lastContactedAt) {
    const responseTimeMs = lastContactedAt.getTime() - createdAt.getTime();
    const responseMinutes = Math.floor(responseTimeMs / 60000);
    const responseSeconds = Math.floor((responseTimeMs % 60000) / 1000);

    // Determine what the status WAS when they contacted
    let historicalStatus: ResponseTimerStatus = "great";
    if (responseMinutes >= LATE_THRESHOLD) {
      historicalStatus = "never_contacted";
    } else if (responseMinutes >= DECENT_THRESHOLD) {
      historicalStatus = "late";
    } else if (responseMinutes >= GREAT_THRESHOLD) {
      historicalStatus = "decent";
    }

    return {
      status: "contacted",
      color: getColorClass(historicalStatus),
      colorHex: getColorHex(historicalStatus),
      label: `Contacted in ${formatTime(responseMinutes, responseSeconds)}`,
      minutesElapsed: responseMinutes,
      secondsElapsed: responseSeconds,
      isUrgent: false,
      isPulsating: false,
      formattedTime: formatTime(responseMinutes, responseSeconds),
      message: getContactedMessage(responseMinutes),
    };
  }

  // Calculate elapsed time since creation
  const now = new Date();
  const elapsedMs = now.getTime() - createdAt.getTime();
  const minutesElapsed = Math.floor(elapsedMs / 60000);
  const secondsElapsed = Math.floor((elapsedMs % 60000) / 1000);

  // Determine status based on elapsed time
  let status: ResponseTimerStatus;
  let label: string;
  let message: string;
  let isUrgent = false;
  let isPulsating = false;

  if (minutesElapsed < GREAT_THRESHOLD) {
    status = "great";
    label = "Great Timing";
    message = "Lead is fresh - contact now for best results!";
  } else if (minutesElapsed < DECENT_THRESHOLD) {
    status = "decent";
    label = "Decent Timing";
    message = "Lead is still warm - reach out soon!";
  } else if (minutesElapsed < LATE_THRESHOLD) {
    status = "late";
    label = "Late";
    message = "CONTACT LEAD IMMEDIATELY";
    isUrgent = true;
    // Pulsating at exactly 10 minutes (within 30 second window)
    isPulsating = minutesElapsed === 10 && secondsElapsed < 30;
  } else {
    status = "never_contacted";
    label = "Never Contacted";
    message = "Lead has been waiting too long - requires immediate attention";
    isUrgent = true;
  }

  return {
    status,
    color: getColorClass(status),
    colorHex: getColorHex(status),
    label,
    minutesElapsed,
    secondsElapsed,
    isUrgent,
    isPulsating,
    formattedTime: formatTime(minutesElapsed, secondsElapsed),
    message,
  };
}

/**
 * Get Tailwind color class for a status
 */
function getColorClass(status: ResponseTimerStatus): string {
  switch (status) {
    case "great":
    case "contacted":
      return "text-green-500";
    case "decent":
      return "text-yellow-600"; // Mustard
    case "late":
      return "text-red-500";
    case "never_contacted":
      return "text-amber-500"; // Yellow/Orange
    default:
      return "text-gray-500";
  }
}

/**
 * Get hex color for non-Tailwind contexts
 */
function getColorHex(status: ResponseTimerStatus): string {
  switch (status) {
    case "great":
    case "contacted":
      return "#22C55E"; // Green
    case "decent":
      return "#CA8A04"; // Mustard/Yellow-600
    case "late":
      return "#EF4444"; // Red
    case "never_contacted":
      return "#F59E0B"; // Amber/Yellow
    default:
      return "#6B7280"; // Gray
  }
}

/**
 * Get background color class for status badges
 */
export function getBackgroundColorClass(status: ResponseTimerStatus): string {
  switch (status) {
    case "great":
    case "contacted":
      return "bg-green-500/20 text-green-500 border-green-500/30";
    case "decent":
      return "bg-yellow-600/20 text-yellow-600 border-yellow-600/30";
    case "late":
      return "bg-red-500/20 text-red-500 border-red-500/30";
    case "never_contacted":
      return "bg-amber-500/20 text-amber-500 border-amber-500/30";
    default:
      return "bg-gray-500/20 text-gray-500 border-gray-500/30";
  }
}

/**
 * Format time as MM:SS
 */
function formatTime(minutes: number, seconds: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Get message for contacted leads based on response time
 */
function getContactedMessage(minutes: number): string {
  if (minutes < GREAT_THRESHOLD) {
    return "Excellent response time!";
  } else if (minutes < DECENT_THRESHOLD) {
    return "Good response time";
  } else if (minutes < LATE_THRESHOLD) {
    return "Response was delayed";
  } else {
    return "Response was significantly delayed";
  }
}

/**
 * Calculate response time in minutes (for database storage)
 */
export function calculateResponseTimeMinutes(
  createdAt: Date,
  contactedAt: Date
): number {
  const elapsedMs = contactedAt.getTime() - createdAt.getTime();
  return Math.floor(elapsedMs / 60000);
}

/**
 * Check if a lead needs urgent attention
 */
export function needsUrgentAttention(createdAt: Date, lastContactedAt: Date | null): boolean {
  if (lastContactedAt) return false;

  const now = new Date();
  const elapsedMs = now.getTime() - createdAt.getTime();
  const minutesElapsed = Math.floor(elapsedMs / 60000);

  return minutesElapsed >= DECENT_THRESHOLD; // 10+ minutes = urgent
}

/**
 * Get all leads that need urgent attention
 * (For use in dashboard/notifications)
 */
export interface UrgentLeadCriteria {
  minMinutesOld: number;
  maxMinutesOld?: number;
  notContacted: boolean;
}

export const URGENT_LEAD_CRITERIA: UrgentLeadCriteria = {
  minMinutesOld: DECENT_THRESHOLD, // 10 minutes
  notContacted: true,
};

/**
 * Generate activity timeline entry for response time
 */
export function generateResponseTimeActivity(
  createdAt: Date,
  contactedAt: Date
): {
  subject: string;
  description: string;
  colorBadge: string;
} {
  const minutes = calculateResponseTimeMinutes(createdAt, contactedAt);
  const timer = calculateResponseTimer(createdAt, contactedAt);

  let subject: string;
  if (minutes < GREAT_THRESHOLD) {
    subject = "First Contact - Great Timing";
  } else if (minutes < DECENT_THRESHOLD) {
    subject = "First Contact - Decent Timing";
  } else if (minutes < LATE_THRESHOLD) {
    subject = "First Contact - Late Response";
  } else {
    subject = "First Contact - Significantly Delayed";
  }

  return {
    subject,
    description: `Lead was contacted ${timer.formattedTime} after creation. ${timer.message}`,
    colorBadge: timer.colorHex,
  };
}
