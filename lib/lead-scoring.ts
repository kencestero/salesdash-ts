/**
 * Lead Scoring System (VinSolutions-inspired)
 *
 * Automatically scores leads 0-100 based on multiple factors
 * Higher scores = hotter leads that need attention NOW
 */

import type { Customer, Activity } from '@prisma/client';

export interface LeadScoreFactors {
  hasAppliedCredit: number;      // +30
  hasRecentActivity: number;      // +20
  hasSpecificTrailer: number;     // +15
  needsFinancing: number;         // +10
  hasCompleteInfo: number;        // +5
  hasEmail: number;               // +3
  recentlyCreated: number;        // +5
  noRecentActivity: number;       // -10
  staleLead: number;              // -15
  total: number;
}

/**
 * Calculate lead score for a customer
 */
export function calculateLeadScore(
  customer: Partial<Customer>,
  activities?: Activity[]
): { score: number; factors: LeadScoreFactors } {
  let score = 0;
  const factors: LeadScoreFactors = {
    hasAppliedCredit: 0,
    hasRecentActivity: 0,
    hasSpecificTrailer: 0,
    needsFinancing: 0,
    hasCompleteInfo: 0,
    hasEmail: 0,
    recentlyCreated: 0,
    noRecentActivity: 0,
    staleLead: 0,
    total: 0,
  };

  // +30: Has applied for credit (HOT!)
  if (customer.applied || customer.hasAppliedCredit) {
    score += 30;
    factors.hasAppliedCredit = 30;
  }

  // +20: Has recent activity (call, email, meeting in last 7 days)
  if (customer.lastActivityAt) {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(customer.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity <= 7) {
      score += 20;
      factors.hasRecentActivity = 20;
    } else if (daysSinceActivity > 30) {
      // -15: Lead has gone cold (30+ days no activity)
      score -= 15;
      factors.staleLead = -15;
    } else if (daysSinceActivity > 14) {
      // -10: Lead getting cold (14-30 days no activity)
      score -= 10;
      factors.noRecentActivity = -10;
    }
  }

  // +15: Has specific trailer in mind (stock number provided)
  if (customer.stockNumber && customer.stockNumber.length > 0) {
    score += 15;
    factors.hasSpecificTrailer = 15;
  }

  // +10: Needs financing (more engaged than cash buyers)
  if (customer.financingType === 'finance' || customer.financingType === 'rto') {
    score += 10;
    factors.needsFinancing = 10;
  }

  // +5: Has complete contact info (email + phone)
  if (customer.email && customer.phone) {
    score += 5;
    factors.hasCompleteInfo = 5;
  }

  // +3: Has email address
  if (customer.email) {
    score += 3;
    factors.hasEmail = 3;
  }

  // +5: Recently created lead (within 24 hours)
  if (customer.createdAt) {
    const hoursOld = (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld <= 24) {
      score += 5;
      factors.recentlyCreated = 5;
    }
  }

  // Ensure score is within 0-100 range
  score = Math.max(0, Math.min(100, score));
  factors.total = score;

  return { score, factors };
}

/**
 * Determine lead temperature based on score
 */
export function getLeadTemperature(score: number): 'hot' | 'warm' | 'cold' | 'dead' {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  if (score >= 20) return 'cold';
  return 'dead';
}

/**
 * Suggest next action based on lead state
 */
export function suggestNextAction(customer: Partial<Customer>): string {
  // Has applied - follow up ASAP!
  if (customer.applied || customer.hasAppliedCredit) {
    return "🔥 Follow up on credit application immediately!";
  }

  // No recent activity - reach out
  if (customer.lastActivityAt) {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(customer.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity > 7) {
      return "⏰ It's been a while - send a check-in message";
    }
  }

  // Has specific trailer - send details
  if (customer.stockNumber) {
    return "📦 Send trailer details and pricing";
  }

  // No phone/email - get contact info
  if (!customer.email || !customer.phone) {
    return "📞 Get complete contact information";
  }

  // Default
  return "💬 Make initial contact and qualify lead";
}

/**
 * Calculate days in current status
 */
export function calculateDaysInStage(customer: Partial<Customer>): number {
  if (!customer.updatedAt) return 0;

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(customer.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceUpdate;
}

/**
 * Calculate response time (minutes from creation to first activity)
 */
export function calculateResponseTime(
  customerCreatedAt: Date,
  firstActivityAt?: Date
): number | null {
  if (!firstActivityAt) return null;

  const diffMs = new Date(firstActivityAt).getTime() - new Date(customerCreatedAt).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  return diffMinutes;
}

/**
 * Determine priority level based on multiple factors
 */
export function determinePriority(
  customer: Partial<Customer>,
  leadScore: number
): 'urgent' | 'high' | 'medium' | 'low' {
  // Urgent: Applied for credit or score 80+
  if (customer.applied || customer.hasAppliedCredit || leadScore >= 80) {
    return 'urgent';
  }

  // High: Hot lead (score 60-79) or new lead (<24hrs)
  if (leadScore >= 60) {
    return 'high';
  }

  // Check if it's a new lead
  if (customer.createdAt) {
    const hoursOld = (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld <= 24) {
      return 'high';
    }
  }

  // Medium: Warm lead (score 40-59)
  if (leadScore >= 40) {
    return 'medium';
  }

  // Low: Cold or dead leads
  return 'low';
}

/**
 * Bulk recalculate scores for multiple customers
 */
export async function recalculateLeadScores(customers: Partial<Customer>[]): Promise<Array<{
  id: string;
  score: number;
  temperature: string;
  priority: string;
  daysInStage: number;
}>> {
  return customers.map(customer => {
    const { score } = calculateLeadScore(customer);
    const temperature = getLeadTemperature(score);
    const priority = determinePriority(customer, score);
    const daysInStage = calculateDaysInStage(customer);

    return {
      id: customer.id!,
      score,
      temperature,
      priority,
      daysInStage,
    };
  });
}
