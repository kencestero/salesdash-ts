/**
 * Bidirectional Google Sheets Sync
 *
 * Syncs CRM changes back to Google Sheets in real-time
 * CRM is the source of truth - changes flow: CRM → Google Sheets
 */

import { google } from 'googleapis';
import type { Customer } from '@prisma/client';
import { fetchRawRowsFromSheet } from './google-sheets';

// Google Sheets configuration
const SHEET_ID = '1T9PRlXBS1LBlB5VL9nwn_m3AIcT6KIjqg5lk3Xy1le8';
const SHEET_NAME = 'Leads';

/**
 * Initialize Google Sheets API client with WRITE access
 */
function getGoogleSheetsWriteClient() {
  if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
    throw new Error('Missing Google Sheets credentials');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'], // FULL READ/WRITE
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Find the row number for a customer in Google Sheets by phone number
 * Returns 1-based row index (row 1 = headers, data starts at row 2)
 */
export async function findCustomerRowInSheet(phone: string): Promise<number | null> {
  try {
    const rows = await fetchRawRowsFromSheet();

    if (rows.length === 0) return null;

    const headers = rows[0];
    const phoneIndex = headers.findIndex(h =>
      h?.toString().toLowerCase().trim().includes('phone')
    );

    if (phoneIndex === -1) {
      console.error('❌ Could not find phone column in Google Sheets');
      return null;
    }

    // Search for matching phone number (starting from row 2, since row 1 is headers)
    for (let i = 1; i < rows.length; i++) {
      const rowPhone = rows[i][phoneIndex]?.toString().trim();
      if (rowPhone === phone) {
        return i + 1; // Return 1-based row number for Sheets API
      }
    }

    return null; // Customer not found in sheet
  } catch (error) {
    console.error('❌ Error finding customer row in sheet:', error);
    return null;
  }
}

/**
 * Sync a single customer from CRM back to Google Sheets
 * Updates the existing row if found, or appends a new row if not
 */
export async function syncCustomerToSheet(customer: Partial<Customer>): Promise<boolean> {
  try {
    if (!customer.phone) {
      console.log('⚠️  Cannot sync customer without phone number');
      return false;
    }

    const sheets = getGoogleSheetsWriteClient();

    // First, fetch headers to know column positions
    const rows = await fetchRawRowsFromSheet();
    if (rows.length === 0) {
      console.error('❌ No data in Google Sheets');
      return false;
    }

    const headers = rows[0];

    // Build the row data array matching header order
    const rowData: string[] = headers.map((header) => {
      const h = header?.toString().toLowerCase().trim();

      // Map Customer fields to Google Sheets columns
      if (h.includes('timestamp')) return new Date().toISOString();
      if (h.includes('rep full name') || h === 'rep') return customer.salesRepName || '';
      if (h.includes('customer names')) return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
      if (h.includes('customer first name') || h === 'first name') return customer.firstName || '';
      if (h.includes('customer last name') || h === 'last name') return customer.lastName || '';
      if (h.includes('phone')) return customer.phone || '';
      if (h === 'email') return customer.email || '';
      if (h.includes('trailer size')) return customer.trailerSize || '';
      if (h.includes('assigned manager') || h === 'manager') return customer.assignedToName || '';
      if (h.includes('stock number')) return customer.stockNumber || '';
      if (h.includes('applied')) return customer.applied ? 'Yes' : 'No';
      if (h.includes('date of submission') || h.includes('date applied')) {
        return customer.dateApplied ? new Date(customer.dateApplied).toLocaleDateString() : '';
      }
      if (h.includes('cash/finance/rent')) return customer.financingType || '';
      if (h.includes('manager notes')) return customer.managerNotes || '';
      if (h.includes('rep notes')) return customer.repNotes || '';
      if (h === 'address') return customer.street || '';
      if (h.includes('zip code') || h === 'zip') return customer.zipcode || '';
      if (h === 'state') return customer.state || '';
      if (h === 'status') return customer.status || '';

      return ''; // Empty for unmapped columns
    });

    // Find existing row for this customer
    const existingRow = await findCustomerRowInSheet(customer.phone);

    if (existingRow) {
      // Update existing row
      const range = `${SHEET_NAME}!A${existingRow}`;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData],
        },
      });

      console.log(`✅ Updated row ${existingRow} in Google Sheets for ${customer.firstName} ${customer.lastName}`);
      return true;
    } else {
      // Append new row
      const range = `${SHEET_NAME}!A:Z`;

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData],
        },
      });

      console.log(`✅ Appended new row to Google Sheets for ${customer.firstName} ${customer.lastName}`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error syncing customer to Google Sheets:', error);
    return false;
  }
}

/**
 * Batch sync multiple customers to Google Sheets
 * More efficient than individual syncs
 */
export async function batchSyncCustomersToSheet(customers: Partial<Customer>[]): Promise<{
  succeeded: number;
  failed: number;
}> {
  let succeeded = 0;
  let failed = 0;

  for (const customer of customers) {
    const result = await syncCustomerToSheet(customer);
    if (result) {
      succeeded++;
    } else {
      failed++;
    }
  }

  console.log(`📊 Batch sync complete: ${succeeded} succeeded, ${failed} failed`);

  return { succeeded, failed };
}

/**
 * Sync only specific fields that changed (more efficient)
 */
export async function syncCustomerFieldsToSheet(
  phone: string,
  fields: Partial<Customer>
): Promise<boolean> {
  try {
    const existingRow = await findCustomerRowInSheet(phone);

    if (!existingRow) {
      console.log('⚠️  Customer not found in Google Sheets, cannot update specific fields');
      return false;
    }

    const sheets = getGoogleSheetsWriteClient();
    const rows = await fetchRawRowsFromSheet();
    const headers = rows[0];

    // Build update array for only the changed fields
    const updates: Array<{ range: string; values: string[][] }> = [];

    Object.entries(fields).forEach(([fieldName, value]) => {
      let columnName = '';

      // Map field names to column headers
      switch (fieldName) {
        case 'status':
          columnName = 'Status';
          break;
        case 'managerNotes':
          columnName = 'Manager Notes';
          break;
        case 'repNotes':
          columnName = 'Rep Notes';
          break;
        case 'applied':
          columnName = 'Applied';
          value = value ? 'Yes' : 'No';
          break;
        case 'assignedToName':
          columnName = 'Assigned Manager';
          break;
        case 'salesRepName':
          columnName = 'Rep Full Name';
          break;
        default:
          return; // Skip unmapped fields
      }

      // Find column index
      const colIndex = headers.findIndex(h =>
        h?.toString().toLowerCase().trim() === columnName.toLowerCase()
      );

      if (colIndex >= 0) {
        const colLetter = String.fromCharCode(65 + colIndex); // A=0, B=1, etc.
        const range = `${SHEET_NAME}!${colLetter}${existingRow}`;

        updates.push({
          range,
          values: [[String(value || '')]],
        });
      }
    });

    // Batch update all changed fields
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          data: updates,
          valueInputOption: 'RAW',
        },
      });

      console.log(`✅ Updated ${updates.length} fields for customer in Google Sheets`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error syncing specific fields to Google Sheets:', error);
    return false;
  }
}
