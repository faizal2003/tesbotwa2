function addJobEntry(name, codeJob, jobTaken, date, fee) {
  // Get the active spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  
  // Determine which table to update based on name
  let startRow, startCol;
  
  if (name.toLowerCase() === "nurita") {
    startRow = 2; // Start from the first data row
    startCol = 1; // Start from column A
  } else if (name.toLowerCase() === "ridwan") {
    startRow = 2; // Start from the first data row
    startCol = 8; // Start from column H
  } else {
    throw new Error("Name must be either 'Nurita' or 'Ridwan'");
  }
  
  // Find the first empty row in the table
  let emptyRow = -1;
  for (let row = startRow; row <= 31; row++) { // Assuming table ends at row 31
    if (!sheet.getRange(row, startCol + 2).getValue()) { // Check Job Taken column
      emptyRow = row;
      break;
    }
  }
  
  if (emptyRow === -1) {
    throw new Error("No empty rows available in the table");
  }
  
  // Add the data to the found empty row
  sheet.getRange(emptyRow, startCol + 1).setValue(codeJob); // Code Job column
  sheet.getRange(emptyRow, startCol + 2).setValue(jobTaken); // Job Taken column
  sheet.getRange(emptyRow, startCol + 3).setValue(date);     // Date column
  sheet.getRange(emptyRow, startCol + 4).setValue(fee);      // Fee column
}

// Example usage
function addSampleData() {
  // Add job for Nurita
  addJobEntry("Nurita", "A-1789", "Data entry", "10 Maret 2025", "Rp60.000");
  
  // Add job for Ridwan
  addJobEntry("Ridwan", "B-4567", "Website design", "12 Maret 2025", "Rp150.000");
}