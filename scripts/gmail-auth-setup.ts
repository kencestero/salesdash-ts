/**
 * Gmail OAuth Setup Script
 *
 * Run this ONCE to get your refresh token
 *
 * Usage:
 * 1. Add GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET to .env.local
 * 2. Run: npx tsx scripts/gmail-auth-setup.ts
 * 3. Follow the URL to authorize
 * 4. Copy the refresh token to .env.local
 */

import { google } from 'googleapis';
import * as readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function getRefreshToken() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET in .env.local');
    console.log('\n📝 Add these to .env.local:');
    console.log('GMAIL_CLIENT_ID=your-client-id');
    console.log('GMAIL_CLIENT_SECRET=your-client-secret');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3000/api/auth/gmail/callback'
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔐 Gmail OAuth Authorization\n');
  console.log('1️⃣ Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n2️⃣ Authorize the app');
  console.log('3️⃣ Copy the code from the URL (after ?code=)\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Paste the authorization code here: ', async (code) => {
    rl.close();

    try {
      const { tokens } = await oauth2Client.getToken(code);

      if (tokens.refresh_token) {
        console.log('\n✅ Success! Add this to .env.local:\n');
        console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\n🎉 Setup complete! You can now import from Gmail.');
      } else {
        console.log('⚠️ No refresh token received. Try revoking access and running again:');
        console.log('https://myaccount.google.com/permissions');
      }
    } catch (error: any) {
      console.error('❌ Error getting token:', error.message);
    }
  });
}

getRefreshToken();
