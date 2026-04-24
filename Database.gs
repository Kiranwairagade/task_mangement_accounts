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
  
  const rawHeaders = data[0].map(h => h ? String(h).trim() : '');
  const firstCol = rawHeaders.findIndex(h => h !== '');
  if (firstCol === -1) return [];

  const headers = rawHeaders.slice(firstCol);
  const cleanRows = data.slice(1).map(r => r.slice(firstCol));
  
  return cleanRows
    .filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined))
    .map(row => {
      const record = {};
      headers.forEach((header, i) => {
        if (header) {
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
 * @param {string} sheetName
 * @param {Object} record
 * @param {string} [userEmail]
 */
function addRecord(sheetName, record, userEmail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
  
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const firstCol = headerRow.findIndex(h => h ? String(h).trim() !== '' : false);
  if (firstCol === -1) throw new Error(`No headers found in ${sheetName}`);

  const headers = headerRow.slice(firstCol).map(h => h ? String(h).trim() : '');
  
  const rowValues = headers.map(header => {
    if (!header) return ''; 
    const val = record[header];
    return val !== undefined && val !== null ? val : '';
  });
  
  sheet.getRange(sheet.getLastRow() + 1, firstCol + 1, 1, rowValues.length).setValues([rowValues]);
  logActivity('Create', sheetName, `Added record: ${JSON.stringify(record)}`, userEmail);
}

/**
 * Updates a record in a sheet based on ID, preserving existing values.
 * @param {string} sheetName
 * @param {string} idKey The header key for ID (e.g., 'TaskID')
 * @param {Object} record Updated record data
 * @param {string} [userEmail]
 */
function updateRecord(sheetName, idKey, record, userEmail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const rawHeaders = data[0].map(h => h ? String(h).trim() : '');
  const firstCol = rawHeaders.findIndex(h => h !== '');
  if (firstCol === -1) throw new Error(`No headers found in ${sheetName}`);

  const headers = rawHeaders.slice(firstCol);
  const idIndex = headers.indexOf(idKey);
  
  if (idIndex === -1) throw new Error(`ID key ${idKey} not found.`);
  
  for (let i = 1; i < data.length; i++) {
    // Use full row index to check ID
    if (data[i][firstCol + idIndex] === record[idKey]) {
      const rowNum = i + 1;
      const rowValues = headers.map((header, colIndex) => {
        if (!header) return '';
        return (record.hasOwnProperty(header)) ? record[header] : data[i][firstCol + colIndex];
      });
      sheet.getRange(rowNum, firstCol + 1, 1, headers.length).setValues([rowValues]);
      logActivity('Update', sheetName, `Updated ID: ${record[idKey]}`, userEmail);
      return true;
    }
  }
  return false;
}

/**
 * Deletes a record from a sheet based on ID.
 * @param {string} sheetName
 * @param {string} idKey
 * @param {string} idValue
 * @param {string} [userEmail]
 */
function deleteRecord(sheetName, idKey, idValue, userEmail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h ? String(h).trim() : '');
  const idIndex = headers.indexOf(idKey);
  
  if (idIndex === -1) return false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === idValue) {
      sheet.deleteRow(i + 1);
      logActivity('Delete', sheetName, `Deleted ID: ${idValue}`, userEmail);
      return true;
    }
  }
  return false;
}

/**
 * Returns the current headers (schema) for a sheet.
 * @param {string} sheetName
 */
function getSchema(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

/**
 * Logs activity to the audit sheet.
 * @param {string} action  - e.g. 'Login', 'Create', 'Update', 'Delete'
 * @param {string} target  - Sheet name or resource
 * @param {string} details - Human-readable description
 * @param {string} [userEmail] - Optional: the email of the web-app logged-in user
 */
function logActivity(action, target, details, userEmail) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(DB_CONFIG.audit);
    if (!sheet) return; // Graceful no-op if audit sheet missing

    // Prefer the passed-in web-app user email; fall back to the script runner's email
    let email = userEmail || '';
    if (!email) {
      try { email = Session.getActiveUser().getEmail(); } catch (e) { email = 'unknown'; }
    }

    sheet.appendRow([new Date(), email, action, target, details]);
  } catch (e) {
    Logger.log('logActivity error: ' + e.message);
  }
}
