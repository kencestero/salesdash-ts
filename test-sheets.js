require('dotenv').config();
const { google } = require('googleapis');

async function testSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '1LDdEt-0OvJaIdZCoo1r1bF24yVwBP14fO9bPGfO_5jA',
    range: 'Form Responses 1!A1:T3',
  });

  console.log('Headers:', response.data.values[0]);
  console.log('\nFirst lead:', response.data.values[1]);
  console.log('\nPhone (col F):', response.data.values[1][5]);
}

testSheet().catch(err => console.error('ERROR:', err.message));
