/**
 * Google Sheets API Client for SalesDash (Header-Mapped Sync)
 *
 * Connects to Google Sheets to sync CRM leads automatically
 * Uses header-based column mapping instead of hardcoded indices
 */

import { google } from 'googleapis';

// Google Sheets configuration (HARD-CODED FOR TODAY - 848 LEAD IMPORT)
const SHEET_ID = '1T9PRlXBS1LBlB5VL9nwn_m3AIcT6KIjqg5lk3Xy1le8';
const SHEET_NAME = 'Leads';
const RANGE = 'Leads!A:Z'; // Columns A through Z (expanded range for safety)

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
 * Fetch raw rows from Google Sheets (header + data)
 * Returns all rows including the header row for header-based parsing
 */
export async function fetchRawRowsFromSheet(): Promise<string[][]> {
  try {
    const sheets = getGoogleSheetsClient();

    // Log the sheet configuration for debugging
    console.log('📋 Attempting to fetch from Google Sheets:', {
      spreadsheetId: SHEET_ID,
      range: RANGE,
      tab: SHEET_NAME
    });

    // First, let's try to get the spreadsheet metadata to verify access and available sheets
    try {
      const metadataResponse = await sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID,
      });

      const availableSheets = metadataResponse.data.sheets?.map(sheet => sheet.properties?.title) || [];
      console.log('📊 Available sheets in spreadsheet:', availableSheets);
      console.log(metadataResponse.data.sheets?.map(s => s.properties?.title));
    } catch (metadataError: any) {
      console.error('⚠️ Could not fetch spreadsheet metadata:', metadataError.message);
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('No data found in Google Sheet');
      return [];
    }

    // Return ALL rows including header - parsing logic will handle header mapping
    return rows as string[][];
  } catch (error: any) {
    // Enhanced error logging for debugging
    console.error('❌ Error fetching leads from Google Sheets:', {
      error: error.message,
      code: error.code,
      spreadsheetId: SHEET_ID,
      requestedTab: SHEET_NAME,
      range: RANGE,
    });

    // If it's a "not found" error, provide more helpful information
    if (error.message?.includes('Requested entity was not found')) {
      const detailedError = new Error(
        `Sheet tab "${SHEET_NAME}" not found in spreadsheet ${SHEET_ID}. ` +
        `Please check that the tab name is correct and the service account has access.`
      );
      (detailedError as any).originalError = error;
      (detailedError as any).debugInfo = {
        spreadsheetId: SHEET_ID,
        requestedTab: SHEET_NAME,
        serviceAccount: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      };
      throw detailedError;
    }

    throw error;
  }
}
