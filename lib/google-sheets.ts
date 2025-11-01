/**
 * Google Sheets API Client for SalesDash
 *
 * Connects to Google Sheets to sync CRM leads automatically
 * Sheet: https://docs.google.com/spreadsheets/d/1LDdEt-0OvJaIdZCoo1r1bF24yVwBP14fO9bPGfO_5jA/
 */

import { google } from 'googleapis';

// Google Sheets configuration (from environment variables)
const SHEET_ID = process.env.GOOGLE_SHEETS_ID || '1T9PRlXBS1LBlB5VL9nwn_m3AIcT6KIjqg5lk3Xy1le8';
const SHEET_NAME = process.env.GOOGLE_SHEETS_TAB || 'Leads';
const RANGE = `${SHEET_NAME}!A:T`; // Columns A through T (20 columns)

/**
 * Interface for a lead row from Google Sheets
 *
 * ACTUAL COLUMN STRUCTURE (verified from live sheet):
 * A - Timestamp
 * B - Rep Full Name
 * C - Customer Names (backup)
 * D - Customer First Name
 * E - Customer Last Name
 * F - Customer Phone Number
 * G - Trailer Size
 * H - Assigned Manager
 * I - Stock Number
 * J - Applied
 * K - Date of Submission
 * L - Cash/Finance/Rent to Own
 * M - Customer First Name (duplicate - ignore)
 * N - Customer Last Name (duplicate - ignore)
 * O - Manager Notes
 * P - Rep Notes
 * Q - Email
 * R - Address
 * S - Zip Code
 * T - State
 */
export interface GoogleSheetLead {
  timestamp: string;           // Column A
  salesRep: string;            // Column B
  customerNameBackup: string;  // Column C (backup, not used)
  firstName: string;           // Column D ✅
  lastName: string;            // Column E ✅
  phone: string;               // Column F
  trailerSize: string;         // Column G
  assignedManager: string;     // Column H
  stockNumber: string;         // Column I
  applied: string;             // Column J
  dateApplied: string;         // Column K
  financingType: string;       // Column L
  // Columns M & N are duplicates - skip
  managerNotes: string;        // Column O (not M!)
  repNotes: string;            // Column P (not N!)
  email: string;               // Column Q
  address: string;             // Column R (not O!)
  zipCode: string;             // Column S (not P!)
  state: string;               // Column T (not Q!)
}

/**
 * Initialize Google Sheets API client
 */
function getGoogleSheetsClient() {
  // Check for required environment variables
  if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
    throw new Error('Missing Google Sheets credentials. Please set GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Fetch all leads from Google Sheets
 */
export async function fetchLeadsFromSheet(): Promise<GoogleSheetLead[]> {
  try {
    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('No data found in Google Sheet');
      return [];
    }

    // Skip header row (row 0)
    const dataRows = rows.slice(1);

    // Map rows to lead objects
    const leads: GoogleSheetLead[] = dataRows.map((row) => ({
      timestamp: row[0] || '',           // Column A
      salesRep: row[1] || '',            // Column B - Rep Full Name
      customerNameBackup: row[2] || '',  // Column C - Customer Names (backup)
      firstName: row[3] || '',           // Column D - Customer First Name ✅
      lastName: row[4] || '',            // Column E - Customer Last Name ✅
      phone: row[5] || '',               // Column F - Customer Phone Number
      trailerSize: row[6] || '',         // Column G - Trailer Size
      assignedManager: row[7] || '',     // Column H - Assigned Manager
      stockNumber: row[8] || '',         // Column I - Stock Number
      applied: row[9] || '',             // Column J - Applied
      dateApplied: row[10] || '',        // Column K - Date of Submission
      financingType: row[11] || '',      // Column L - Cash/Finance/RTO
      // Columns M (12) and N (13) are duplicates - SKIP THEM
      managerNotes: row[14] || '',       // Column O - Manager Notes (index 14!)
      repNotes: row[15] || '',           // Column P - Rep Notes (index 15!)
      email: row[16] || '',              // Column Q - Email (index 16!)
      address: row[17] || '',            // Column R - Address (index 17!)
      zipCode: row[18] || '',            // Column S - Zip Code (index 18!)
      state: row[19] || '',              // Column T - State (index 19!)
    }));

    return leads;
  } catch (error) {
    console.error('Error fetching leads from Google Sheets:', error);
    throw error;
  }
}

/**
 * Parse a lead from Google Sheets into database-ready format
 * Defensive: handles missing/empty data gracefully
 */
export function parseLeadForDatabase(lead: GoogleSheetLead) {
  // Defensive checks for required fields
  if (!lead || typeof lead !== 'object') {
    throw new Error('Invalid lead data: not an object');
  }

  // Parse timestamp
  let createdAt = new Date();
  if (lead.timestamp) {
    const parsed = new Date(lead.timestamp);
    if (!isNaN(parsed.getTime())) {
      createdAt = parsed;
    }
  }

  // Parse date applied
  let dateApplied: Date | null = null;
  if (lead.dateApplied) {
    const parsed = new Date(lead.dateApplied);
    if (!isNaN(parsed.getTime())) {
      dateApplied = parsed;
    }
  }

  // Clean phone number - REQUIRED
  const phoneRaw = lead.phone?.toString().trim() || '';
  const phone = phoneRaw.replace(/[^\d+]/g, '') || 'Unknown';

  // Use actual email from column Q, or generate from phone
  const emailRaw = lead.email?.toString().trim() || '';
  const email = emailRaw && emailRaw.includes('@') ? emailRaw : `${phone}@placeholder.com`;

  // Validate we have at least phone OR valid email
  if (phone === 'Unknown' && !emailRaw.includes('@')) {
    throw new Error('Lead must have phone number or valid email');
  }

  // Parse financing type
  let financingType: string | null = null;
  const financing = (lead.financingType || '').toLowerCase();
  if (financing.includes('cash')) financingType = 'cash';
  else if (financing.includes('finance')) financingType = 'finance';
  else if (financing.includes('rent') || financing.includes('rto')) financingType = 'rto';

  // Determine if factory order
  const stockNum = (lead.stockNumber || '').toLowerCase();
  const isFactoryOrder = stockNum.includes('factory') || stockNum.includes('order');

  // Determine status from notes and applied field
  let status = 'new';
  const allNotes = `${lead.managerNotes || ''} ${lead.repNotes || ''}`.toLowerCase();

  if (allNotes.includes('approved')) status = 'approved';
  else if (allNotes.includes('dead') || allNotes.includes('declined')) status = 'dead';
  else if (lead.applied || allNotes.includes('applied')) status = 'applied';
  else if (allNotes.includes('contacted')) status = 'contacted';
  else if (allNotes.includes('qualified')) status = 'qualified';

  return {
    // Names from separate columns (D and E)
    firstName: lead.firstName?.trim() || 'Unknown',
    lastName: lead.lastName?.trim() || '',
    email,
    phone,

    // Address fields
    street: lead.address?.trim() || null,
    state: lead.state?.trim() || null,
    zipcode: lead.zipCode?.trim() || null,

    // Lead management
    salesRepName: lead.salesRep?.trim() || null,
    assignedToName: lead.assignedManager?.trim() || null,
    trailerSize: lead.trailerSize?.trim() || null,
    stockNumber: lead.stockNumber?.trim() || null,
    financingType,
    isFactoryOrder,

    // Status and tracking
    status,
    applied: lead.applied === 'Yes' || lead.applied === 'true' || lead.applied === true,
    dateApplied,
    hasAppliedCredit: lead.applied === 'Yes' || lead.applied === 'true' || lead.applied === true,

    // Notes (separate fields)
    managerNotes: lead.managerNotes?.trim() || null,
    repNotes: lead.repNotes?.trim() || null,
    notes: null, // Keep general notes empty

    // Metadata
    source: 'google_sheets',
    tags: ['google_sheets', lead.assignedManager?.trim()].filter(Boolean),
    createdAt,
  };
}
