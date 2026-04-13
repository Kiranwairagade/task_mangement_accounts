/**
 * Initializes the Task Management Database structure.
 * Run this function once from the script editor.
 */
function initializeDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheets = [
    { name: 'DB_Tasks', headers: ['TaskID', 'Title', 'Description', 'AssignedTo', 'Priority', 'Status', 'DueDate', 'CreatedAt', 'CompletedDate'] },
    { name: 'DB_TaskSteps', headers: ['StepID', 'ParentTaskID', 'StepName', 'StepDescription', 'StepOwner', 'StepStatus', 'ActionType', 'PlannedDate', 'DueDate', 'CompletedDate', 'EstHours', 'ActualHours', 'HoursVariance', 'DaysOpen', 'Overdue', 'Notes'] },
    { name: 'DB_Employees', headers: ['EmpID', 'Name', 'Role', 'Email', 'JoinDate', 'Status'] },
    { name: 'DB_AuditLog', headers: ['Timestamp', 'User', 'Action', 'TargetID', 'Details'] },
    { name: 'DB_Config', headers: ['Category', 'Value', 'Label', 'Color'] },
    { name: 'DB_Users', headers: ['Username', 'PasswordHash', 'Email', 'Role', 'CreatedAt'] }
  ];

  sheets.forEach(sheetInfo => {
    let sheet = ss.getSheetByName(sheetInfo.name);
    if (!sheet) {
      sheet = ss.insertSheet(sheetInfo.name);
      sheet.getRange(1, 1, 1, sheetInfo.headers.length).setValues([sheetInfo.headers]);
      sheet.getRange(1, 1, 1, sheetInfo.headers.length).setFontWeight('bold').setBackground('#f3f4f6');
      sheet.setFrozenRows(1);
    }
  });

  // Seed Config Data if empty
  const configSheet = ss.getSheetByName('DB_Config');
  if (configSheet.getLastRow() === 1) {
    const configData = [
      ['Status', 'Not Started', 'Not Started', '#9ca3af'],
      ['Status', 'In Progress', 'In Progress', '#3b82f6'],
      ['Status', 'Review', 'Under Review', '#f59e0b'],
      ['Status', 'Completed', 'Completed', '#10b981'],
      ['Status', 'Blocked', 'Blocked', '#ef4444'],
      ['Priority', 'Low', 'Low', '#10b981'],
      ['Priority', 'Medium', 'Medium', '#f59e0b'],
      ['Priority', 'High', 'High', '#ef4444'],
      ['Priority', 'Critical', 'Critical', '#7f1d1d']
    ];
    configSheet.getRange(2, 1, configData.length, 4).setValues(configData);
  }

  Logger.log('✅ Database Initialized: All DB sheets and initial configurations have been set up.');
}

/**
 * Seeds the database with test data.
 * Run this function once from the script editor after initializing the database.
 */
function seedTestData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Seed Employees
  const empSheet = ss.getSheetByName('DB_Employees');
  if (empSheet.getLastRow() === 1) {
    const employees = [
      ['EMP-001', 'Pammi Gaur', 'Director', 'pammi@company.com', '2025-07-15', 'Active'],
      ['EMP-002', 'Pankaj Vairagade', 'Employee', 'pankaj@company.com', '2025-08-01', 'Active'],
      ['EMP-003', 'Sara Khan', 'Director', 'sara@company.com', '2024-01-10', 'Active']
    ];
    empSheet.getRange(2, 1, employees.length, 6).setValues(employees);
  }

  // 2. Seed Tasks
  const tasksSheet = ss.getSheetByName('DB_Tasks');
  if (tasksSheet.getLastRow() === 1) {
    const now = new Date();
    const pastDate = new Date(now); pastDate.setDate(pastDate.getDate() - 5);
    const futureDate = new Date(now); futureDate.setDate(futureDate.getDate() + 5);

    const tasks = [
      // headers: ['TaskID', 'Title', 'Description', 'AssignedTo', 'Priority', 'Status', 'DueDate', 'CreatedAt', 'CompletedDate']
      ['TSK-001', 'Monthly Audit', 'Review accounts for April', 'Pammi Gaur', 'High', 'Completed', now, pastDate, now],
      ['TSK-002', 'Tax Filing', 'GST submission for Q1', 'Sara Khan', 'Critical', 'In Progress', futureDate, pastDate, ''],
      ['TSK-003', 'Payroll Review', 'Approve salary sheets', 'Pankaj Vairagade', 'Medium', 'Not Started', futureDate, now, '']
    ];
    tasksSheet.getRange(2, 1, tasks.length, 9).setValues(tasks);
  }

  Logger.log('✅ Test Data Seeded: Employees and Tasks have been populated for testing.');
}
