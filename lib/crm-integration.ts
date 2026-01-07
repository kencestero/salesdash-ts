/**
 * Remotive Logistics CRM - Google Sheets Integration
 * Submits leads to both CRM sheets via Apps Script webhook
 */

// IMPORTANT: Replace with your actual Web App URL after deployment
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.NEXT_PUBLIC_CRM_WEBHOOK_URL || '';

export interface LeadPayload {
  repId?: string;
  repFullName?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  trailerSize?: string;
  financeType?: 'Cash' | 'Finance' | 'Rent to Own' | string;
  assignedManager?: string;
  stockNumber?: string;
  applied?: string;
  dateOfSubmission?: string;
  managerNotes?: string;
  repNotes?: string;
}

export interface SubmitLeadResponse {
  ok: boolean;
  leadId?: string;
  error?: string;
}

/**
 * Submit lead to Google Sheets CRM
 * Automatically appends to BOTH original and duplicate sheets
 */
export async function submitLead(payload: LeadPayload): Promise<SubmitLeadResponse> {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    console.error('CRM Webhook URL not configured');
    return {
      ok: false,
      error: 'CRM webhook URL not configured. Add NEXT_PUBLIC_CRM_WEBHOOK_URL to .env.local'
    };
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to submit lead:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Example usage:
 *
 * const result = await submitLead({
 *   repId: 'REP123456',
 *   repFullName: 'Kenneth Cestero',
 *   customerFirstName: 'John',
 *   customerLastName: 'Doe',
 *   customerPhone: '555-1234',
 *   email: 'john@example.com',
 *   city: 'Miami',
 *   state: 'FL',
 *   zipCode: '33101',
 *   trailerSize: '20x8',
 *   financeType: 'Finance',
 *   assignedManager: 'Manager Name',
 * });
 *
 * if (result.ok) {
 *   console.log('Lead submitted! ID:', result.leadId);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
