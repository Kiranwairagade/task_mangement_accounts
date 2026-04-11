/**
 * Initializes the Task Management Database structure.
 * Run this function once from the script editor.
 */
function initializeDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheets = [
    { name: 'DB_Tasks', headers: ['TaskID', 'Project', 'Category', 'Title', 'Description', 'AssignedTo', 'Department', 'Priority', 'Status', 'ActionType', 'PlannedStart', 'DueDate', 'CompletedDate', 'EstHours', 'ActualHours', 'HoursVariance', 'DaysOpen', 'OverdueFlag', 'MonthBucket', 'ProgressPercent', 'NextStep', 'CreatedAt', 'Source', 'Manager'] },
    { name: 'DB_TaskSteps', headers: ['StepID', 'ParentTaskID', 'StepName', 'StepDescription', 'StepOwner', 'StepStatus', 'ActionType', 'PlannedDate', 'DueDate', 'CompletedDate', 'EstHours', 'ActualHours', 'HoursVariance', 'DaysOpen', 'Overdue', 'Notes'] },
    { name: 'DB_Employees', headers: ['EmpID', 'Name', 'Department', 'Role', 'Manager', 'Email', 'JoinDate', 'WeeklyCapacity', 'Status', 'Location', 'Notes'] },
    { name: 'DB_AuditLog', headers: ['Timestamp', 'User', 'Action', 'TargetID', 'Details'] },
    { name: 'DB_Config', headers: ['Category', 'Value', 'Label', 'Color'] }
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

  SpreadsheetApp.getUi().alert('✅ Database Initialized', 'All DB sheets and initial configurations have been set up.', SpreadsheetApp.getUi().ButtonSet.OK);
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
      ['EMP01', 'Pammi Gaur', 'Operations', 'Project Coordinator', 'Sara Khan', 'pammi@company.com', '2025-07-15', 40, 'Active', 'Remote', ''],
      ['EMP02', 'Pankaj Vairagade', 'Analytics', 'Data Analyst', 'Sara Khan', 'pankaj@company.com', '2025-08-01', 40, 'Active', 'On-Site', ''],
      ['EMP03', 'Sara Khan', 'Management', 'Manager', 'Director', 'sara@company.com', '2024-01-10', 40, 'Active', 'On-Site', '']
    ];
    empSheet.getRange(2, 1, employees.length, 11).setValues(employees);
  }

  // 2. Seed Tasks
  const tasksSheet = ss.getSheetByName('DB_Tasks');
  if (tasksSheet.getLastRow() === 1) {
    const now = new Date();
    const pastDate = new Date(now); pastDate.setDate(pastDate.getDate() - 5);
    const futureDate = new Date(now); futureDate.setDate(futureDate.getDate() + 5);
    const oldDate = new Date(now); oldDate.setDate(oldDate.getDate() - 40); // For carry-forward

    const tasks = [
      // headers: ['TaskID', 'Project', 'Category', 'Title', 'Description', 'AssignedTo', 'Department', 'Priority', 'Status', 'ActionType', 'PlannedStart', 'DueDate', 'CompletedDate', 'EstHours', 'ActualHours', 'HoursVariance', 'DaysOpen', 'OverdueFlag', 'MonthBucket', 'ProgressPercent', 'NextStep', 'CreatedAt', 'Source', 'Manager']
      ['TSK-001', 'Onboarding Revamp', 'Implementation', 'Collect requirements', 'Gather client specs', 'Pammi Gaur', 'Operations', 'High', 'Completed', 'Close', pastDate, now, now, 12, 11, -1, 5, 'No', 'Apr', 100, 'Done', pastDate, 'Client', 'Sara Khan'],
      ['TSK-002', 'Onboarding Revamp', 'Implementation', 'Build checklist', 'Create master list', 'Pammi Gaur', 'Operations', 'Medium', 'In Progress', 'Execute', now, futureDate, '', 10, 6, '', 5, 'No', 'Apr', 60, 'Review', oldDate, 'Operations', 'Sara Khan'], // Simulating an old carry-forward task
      ['TSK-003', 'Onboarding Revamp', 'Training', 'Schedule sessions', 'Coordinate slots', 'Pammi Gaur', 'Operations', 'Low', 'Not Started', 'Plan', futureDate, futureDate, '', 8, 0, '', 0, 'No', 'Apr', 0, 'Wait', now, 'Leadership', 'Sara Khan'],
      ['TSK-004', 'Website Migration', 'Operations', 'Vendor coordination', 'Lock content set', 'Pankaj Vairagade', 'Analytics', 'Critical', 'Blocked', 'Escalate', pastDate, pastDate, '', 6, 3, '', 10, 'Yes', 'Mar', 30, 'Approval', pastDate, 'Vendor', 'Sara Khan'],
      ['TSK-005', 'Website Migration', 'Reporting', 'Progress dashboard', 'Build weekly view', 'Pankaj Vairagade', 'Analytics', 'High', 'In Progress', 'Execute', pastDate, futureDate, '', 14, 9, '', 5, 'No', 'Apr', 50, 'Metrics', pastDate, 'Internal', 'Sara Khan']
    ];
    tasksSheet.getRange(2, 1, tasks.length, 24).setValues(tasks);
  }

  SpreadsheetApp.getUi().alert('✅ Test Data Seeded', 'Employees and Tasks have been populated for testing.', SpreadsheetApp.getUi().ButtonSet.OK);
}
