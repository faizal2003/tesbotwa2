// Prerequisites:
// 1. Create a Google Cloud project
// 2. Enable the Google Sheets API
// 3. Create OAuth credentials or Service Account
// 4. Install required packages: npm install googleapis

const { google } = require('googleapis');
const sheets = google.sheets('v4');

// If using a service account (recommended for backend applications)
const CREDENTIALS = require('./path-to-your-credentials.json');
const SPREADSHEET_ID = 'your-spreadsheet-id'; // Get from the URL of your spreadsheet

// Function to authorize with Google using service account
async function authorize() {
  const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  
  await auth.authorize();
  return auth;
}

// Add data to Nurita's table
async function addJobForNurita(jobData) {
  try {
    const auth = await authorize();
    
    // Find the next empty row
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:D', // Adjust based on your sheet name
    });
    
    const values = response.data.values;
    let nextRow = 2; // Start looking from row 2
    
    if (values && values.length > 1) {
      // Find the first empty row
      for (let i = 1; i < values.length; i++) {
        if (!values[i] || !values[i][2]) { // If Job Taken column is empty
          nextRow = i + 1;
          break;
        }
        nextRow = values.length + 1;
      }
    }
    
    // Add the new data
    await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${nextRow}:D${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          nextRow - 1, // No
          jobData.codeJob,
          jobData.jobTaken,
          jobData.date,
          jobData.fee
        ]]
      }
    });
    
    console.log(`Added job for Nurita at row ${nextRow}`);
    return nextRow;
  } catch (error) {
    console.error('Error adding job:', error);
    throw error;
  }
}

// Add data to Ridwan's table
async function addJobForRidwan(jobData) {
  try {
    const auth = await authorize();
    
    // Find the next empty row
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!G:J', // Adjust based on your sheet name
    });
    
    const values = response.data.values;
    let nextRow = 2; // Start looking from row 2
    
    if (values && values.length > 1) {
      // Find the first empty row
      for (let i = 1; i < values.length; i++) {
        if (!values[i] || !values[i][2]) { // If Job Taken column is empty
          nextRow = i + 1;
          break;
        }
        nextRow = values.length + 1;
      }
    }
    
    // Add the new data
    await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!G${nextRow}:J${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          nextRow - 1, // No
          jobData.codeJob,
          jobData.jobTaken,
          jobData.date,
          jobData.fee
        ]]
      }
    });
    
    console.log(`Added job for Ridwan at row ${nextRow}`);
    return nextRow;
  } catch (error) {
    console.error('Error adding job:', error);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Example job data for Nurita
    const nuritaJob = {
      codeJob: 'A-1 2789',
      jobTaken: 'Data entry',
      date: '6 Maret 2025',
      fee: 'Rp60.000'
    };
    
    // Example job data for Ridwan
    const ridwanJob = {
      codeJob: 'B-2 1001',
      jobTaken: 'Desain logo',
      date: '6 Maret 2025',
      fee: 'Rp150.000'
    };
    
    await addJobForNurita(nuritaJob);
    await addJobForRidwan(ridwanJob);
    
    console.log('All jobs added successfully!');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();