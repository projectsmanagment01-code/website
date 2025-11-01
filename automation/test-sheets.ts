/**
 * Test Google Sheets Connection
 * Run with: npx tsx automation/test-sheets.ts
 */

import { getAutomationSettings } from '../lib/automation-settings';
import { getGoogleAuth } from './services/google/auth';
import { getGoogleSheetId } from './config/env';

async function testSheetsConnection() {
  console.log('🧪 Testing Google Sheets Connection...\n');

  try {
    // 1. Check if settings exist in database
    console.log('1️⃣ Checking automation settings in database...');
    const settings = await getAutomationSettings();
    
    if (!settings) {
      console.error('❌ No automation settings found in database');
      console.log('\n💡 Go to /admin/automation/settings to configure');
      process.exit(1);
    }
    
    console.log('✅ Settings found in database');
    console.log(`   - Google Sheet ID: ${settings.googleSheetId ? '✓ ' + settings.googleSheetId : '✗'}`);
    console.log(`   - Google Credentials: ${settings.googleCredentialsJson ? '✓ (length: ' + settings.googleCredentialsJson.length + ' chars)' : '✗'}`);
    console.log(`   - Gemini API Key: ${settings.geminiApiKey ? '✓' : '✗'}`);
    console.log(`   - Website API Token: ${settings.websiteApiToken ? '✓' : '✗'}`);

    // 2. Check Google Sheet ID
    if (!settings.googleSheetId) {
      console.error('\n❌ Google Sheet ID not configured');
      console.log('💡 Add your Google Sheet ID in /admin/automation/settings');
      process.exit(1);
    }

    // 3. Check Google Credentials
    if (!settings.googleCredentialsJson) {
      console.error('\n❌ Google Service Account credentials not configured');
      console.log('💡 Add your service account JSON in /admin/automation/settings');
      process.exit(1);
    }

    // 4. Validate credentials JSON
    console.log('\n2️⃣ Validating Google credentials...');
    try {
      const creds = JSON.parse(settings.googleCredentialsJson);
      console.log('✅ Credentials JSON is valid');
      console.log(`   - Type: ${creds.type}`);
      console.log(`   - Project ID: ${creds.project_id}`);
      console.log(`   - Client Email: ${creds.client_email}`);
      console.log(`   - Private Key: ${creds.private_key ? '✓ (length: ' + creds.private_key.length + ')' : '✗'}`);
    } catch (error) {
      console.error('❌ Invalid credentials JSON');
      console.error(error);
      process.exit(1);
    }

    // 5. Test authentication
    console.log('\n3️⃣ Testing Google authentication...');
    try {
      const auth = await getGoogleAuth();
      console.log('✅ Google authentication successful');
    } catch (error) {
      console.error('❌ Google authentication failed');
      console.error(error);
      process.exit(1);
    }

    // 6. Get Sheet ID using the same method as automation
    console.log('\n4️⃣ Getting Sheet ID using automation config method...');
    const sheetId = await getGoogleSheetId();
    console.log(`✅ Sheet ID: ${sheetId}`);

    // 7. Test reading from sheet
    console.log('\n5️⃣ Testing sheet read access...');
    try {
      const { google } = await import('googleapis');
      const auth = await getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });

      console.log(`   Reading from sheet: ${sheetId}`);
      console.log(`   Range: Sheet1!A1:AA3 (first 3 rows, all columns)`);
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Sheet1!A1:AA3',
      });

      console.log('✅ Sheet read successful');
      console.log(`   - Found ${response.data.values?.length || 0} rows`);
      
      if (response.data.values && response.data.values.length > 0) {
        console.log('\n   📋 First row (headers):');
        const headers = response.data.values[0];
        console.log(`      Columns A-E: ${headers.slice(0, 5).join(', ')}`);
        console.log(`      Column R (is Published): ${headers[17] || '(empty)'}`);
        console.log(`      Column AA (Skip): ${headers[26] || '(empty)'}`);
        
        if (response.data.values.length > 1) {
          console.log('\n   📋 Second row (data):');
          const row2 = response.data.values[1];
          console.log(`      Column A (SPY Title): ${row2[0] || '(empty)'}`);
          console.log(`      Column R (is Published): ${row2[17] || '(empty)'}`);
          console.log(`      Column AA (Skip): ${row2[26] || '(empty)'}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to read from sheet');
      console.error(`   Error: ${error.message}`);
      console.error(`   Error code: ${error.code || 'N/A'}`);
      
      if (error.response) {
        console.error(`   Response status: ${error.response.status}`);
        console.error(`   Response data:`, error.response.data);
      }
      
      if (error.code === 403) {
        console.log('\n💡 Permission denied. Make sure:');
        console.log('   1. Google Sheets API is enabled in your Google Cloud project');
        console.log('   2. Service account has access to the sheet');
        console.log('   3. Share the sheet with the service account email');
      } else if (error.code === 404) {
        console.log('\n💡 Sheet not found. Check:');
        console.log('   1. Sheet ID is correct');
        console.log('   2. Sheet exists and is not deleted');
      }
      
      process.exit(1);
    }

    console.log('\n✅ All tests passed! Google Sheets connection is working.');
    console.log('\n💡 You can now run automation with: npm run automation:start');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testSheetsConnection();
