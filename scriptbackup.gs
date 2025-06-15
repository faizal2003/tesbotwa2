function addJobEntry(name, codeJob, jobTaken, date, fee) {
  // Get the active spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  
  // Find the column for the given name
  const headerRow = 1;
  const lastColumn = sheet.getLastColumn();
  let nameColumn = -1;
  
  for (let col = 1; col <= lastColumn; col++) {
    const headerValue = sheet.getRange(headerRow, col).getValue();
    if (headerValue.toString().toLowerCase() === name.toLowerCase()) {
      nameColumn = col;
      break;
    }
  }
  
  // If name not found, throw an error
  if (nameColumn === -1) {
    throw new Error("Name '" + name + "' not found in the spreadsheet");
  }
  
  // Find the start of the table for this name
  // Assuming each table has 5 columns: No, Code Job, Job Taken, tgl, Fee
  const tableStartCol = nameColumn - 4; // One column to the left of name (should be the "No" column)
  
  // Find the first empty row in the table
  const startRow = 4; // Start from the first data row
  let emptyRow = -1;
  
  // Get the last row of the table (maximum 100 rows for safety)
  const maxRows = 100;
  
  for (let row = startRow; row <= startRow + maxRows; row++) {
    if (!sheet.getRange(row, tableStartCol + 2).getValue()) { // Check Job Taken column
      emptyRow = row;
      break;
    }
  }
  
  if (emptyRow === -1) {
    throw new Error("No empty rows available in the table for " + name);
  }
  
  // Add the data to the found empty row
  sheet.getRange(emptyRow, tableStartCol + 1).setValue(codeJob); // Code Job column
  sheet.getRange(emptyRow, tableStartCol + 2).setValue(jobTaken); // Job Taken column
  sheet.getRange(emptyRow, tableStartCol + 3).setValue(date);     // Date column
  sheet.getRange(emptyRow, tableStartCol + 4).setValue(fee);      // Fee column
}

// Function to get all available names from the spreadsheet
function getAvailableNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const headerRow = 1;
  const lastColumn = sheet.getLastColumn();
  const names = [];
  
  for (let col = 1; col <= lastColumn; col++) {
    const headerValue = sheet.getRange(headerRow, col).getValue().toString().trim();
    // Skip empty cells and cells that contain headers like "No", "Code Job", etc.
    const skipHeaders = ["no", "code job", "job taken", "tgl", "fee", ""];
    if (!skipHeaders.includes(headerValue.toLowerCase()) && headerValue) {
      names.push(headerValue);
    }
  }
  
  return names;
}

// Function to add a new person column to the spreadsheet
function addNewPerson(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const lastColumn = sheet.getLastColumn();
  
  // Check if name already exists
  if (getAvailableNames().map(n => n.toLowerCase()).includes(name.toLowerCase())) {
    throw new Error("Name '" + name + "' already exists");
  }
  
  // Add new table header (5 columns: No, Code Job, Job Taken, tgl, Fee)
  sheet.getRange(1, lastColumn + 1).setValue("No");
  sheet.getRange(1, lastColumn + 2).setValue("Code Job");
  sheet.getRange(1, lastColumn + 3).setValue("Job Taken");
  sheet.getRange(1, lastColumn + 4).setValue("tgl");
  sheet.getRange(1, lastColumn + 5).setValue("Fee");
  
  // Add the name header
  sheet.getRange(1, lastColumn + 1, 1, 5).merge();
  sheet.getRange(1, lastColumn + 1).setValue(name);
  
  // Format the header
  sheet.getRange(1, lastColumn + 1, 1, 5).setBackground("#FFD966"); // Yellow background
  sheet.getRange(1, lastColumn + 1).setHorizontalAlignment("center");
  
  // Add numbers in the "No" column (1-30)
  for (let i = 1; i <= 30; i++) {
    sheet.getRange(i + 1, lastColumn + 1).setValue(i);
  }
  
  // Format the table
  sheet.getRange(2, lastColumn + 1, 30, 5).setBorder(true, true, true, true, true, true);
  sheet.getRange(2, lastColumn + 1, 30, 5).setBackground("#DDEBF7"); // Light blue background
}

// Updated form to show dynamic names and allow adding new people


function addJobFromForm(formData) {
  addJobEntry(formData.name, formData.codeJob, formData.jobTaken, formData.date, formData.fee);
  return true;
}



// Function to handle GET requests with URL parameters
function doGet(e) {
  // Check if parameters are provided for direct data entry
  if (e.parameter.action === 'addJob' && 
      e.parameter.name && 
      e.parameter.codeJob && 
      e.parameter.jobTaken && 
      e.parameter.date && 
      e.parameter.fee) {
    
    try {
      // Add job from URL parameters
      addJobEntry(
        e.parameter.name,
        e.parameter.codeJob,
        e.parameter.jobTaken,
        e.parameter.date,
        e.parameter.fee
      );
      
      // Return success message
      return HtmlService.createHtmlOutput(
        '<html><body>' +
        '<h2 style="color:green">Job added successfully!</h2>' +
        '<p>Details:</p>' +
        '<ul>' +
        '<li>Name: ' + e.parameter.name + '</li>' +
        '<li>Code Job: ' + e.parameter.codeJob + '</li>' +
        '<li>Job Taken: ' + e.parameter.jobTaken + '</li>' +
        '<li>Date: ' + e.parameter.date + '</li>' +
        '<li>Fee: ' + e.parameter.fee + '</li>' +
        '</ul>' +
        '<p><a href="' + ScriptApp.getService().getUrl() + '">Return to form</a></p>' +
        '</body></html>'
      );
    } catch (error) {
      // Return error message
      return HtmlService.createHtmlOutput(
        '<html><body>' +
        '<h2 style="color:red">Error adding job</h2>' +
        '<p>' + error.message + '</p>' +
        '<p><a href="' + ScriptApp.getService().getUrl() + '">Return to form</a></p>' +
        '</body></html>'
      );
    }
  } else if (e.parameter.action === 'addPerson' && e.parameter.name) {
    // Add new person from URL
    try {
      addNewPerson(e.parameter.name);
      return HtmlService.createHtmlOutput(
        '<html><body>' +
        '<h2 style="color:green">New person added: ' + e.parameter.name + '</h2>' +
        '<p><a href="' + ScriptApp.getService().getUrl() + '">Return to form</a></p>' +
        '</body></html>'
      );
    } catch (error) {
      return HtmlService.createHtmlOutput(
        '<html><body>' +
        '<h2 style="color:red">Error adding person</h2>' +
        '<p>' + error.message + '</p>' +
        '<p><a href="' + ScriptApp.getService().getUrl() + '">Return to form</a></p>' +
        '</body></html>'
      );
    }
  }
  
  // If no parameters or incomplete parameters, show the regular form
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Job Management System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Rest of the code remains the same...


