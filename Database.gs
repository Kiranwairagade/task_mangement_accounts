/**
 * Database Layer for Task Management System
 */

const DB_CONFIG = {
  tasks: 'DB_Tasks',
  steps: 'DB_TaskSteps',
  employees: 'DB_Employees',
  audit: 'DB_AuditLog',
  config: 'DB_Config'
};

/**
 * Fetches all records from a specified sheet as objects.
 * Maps row data to headers, ensuring proper column alignment.
 * @param {string} sheetName Name of the sheet.
 * @return {Array<Object>} List of records.
 */
function getRecords(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Empty sheet or just headers
  
  const headers = data[0].map(h => h ? String(h).trim() : '');
  
  // Filter out rows that are completely empty
  return data.slice(1)
    .filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined))
    .map(row => {
      const record = {};
      headers.forEach((header, i) => {
        if (header) { // Only map non-empty headers
          let val = row[i];
          if (val instanceof Date) val = val.toISOString();
          record[header] = val !== undefined ? val : '';
        }
      });
      return record;
    });
}

/**
 * Appends a record to a sheet with proper column alignment.
 * Handles missing/optional fields gracefully.
 * @param {string} sheetName
 * @param {Object} record
 */
function addRecord(sheetName, record) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
  
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headers = headerRow.map(h => h ? String(h).trim() : '');
  
  // Build row with values aligned to headers
  const row = headers.map(header => {
    if (!header) return ''; // Skip empty headers
    const val = record[header];
    return val !== undefined && val !== null ? val : '';
  });
  
  // Only keep columns while we have headers
  const validRow = row.slice(0, headers.filter(h => h).length);
  sheet.appendRow(validRow);
  
  logActivity('Create', sheetName, `Added record: ${JSON.stringify(record)}`);
}

/**
 * Updates a record in a sheet based on ID, preserving existing values.
 * @param {string} sheetName
 * @param {string} idKey The header key for ID (e.g., 'TaskID')
 * @param {Object} record Updated record data
 */
function updateRecord(sheetName, idKey, record) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h ? String(h).trim() : '');
  const idIndex = headers.indexOf(idKey);
  
  if (idIndex === -1) throw new Error(`ID key ${idKey} not found.`);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === record[idKey]) {
      const rowNum = i + 1;
      const rowValues = headers.map((header, colIndex) => {
        if (!header) return ''; // Skip empty headers
        // Use new value if provided, otherwise keep existing value
        return record[header] !== undefined && record[header] !== null ? record[header] : data[i][colIndex];
      });
      sheet.getRange(rowNum, 1, 1, headers.length).setValues([rowValues]);
      logActivity('Update', sheetName, `Updated ID: ${record[idKey]}`);
      return true;
    }
  }
  return false;
}

/**
 * Logs activity to the audit sheet.
 */
function logActivity(action, target, details) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DB_CONFIG.audit);
  const user = Session.getActiveUser().getEmail();
  sheet.appendRow([new Date(), user, action, target, details]);
}
