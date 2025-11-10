import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

export async function fetchTreasurySheetData() {
  const spreadsheetId = process.env.TREASURY_SPREADSHEET_ID;
  
  if (!spreadsheetId) {
    throw new Error('TREASURY_SPREADSHEET_ID not configured');
  }

  try {
    const sheets = await getUncachableGoogleSheetClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Treasury!A:E',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const [headers, ...dataRows] = rows;
    
    return dataRows.map((row) => ({
      date: row[0] || '',
      description: row[1] || '',
      category: row[2] || '',
      amountUsd: parseFloat(row[3]) || 0,
      source: row[4] || '',
    }));
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}
