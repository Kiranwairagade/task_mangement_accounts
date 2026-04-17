/**
 * Business Logic — Workflow Pro v4.0
 * Supports all 24 Task columns, 11 Employee columns, Action-Status mapping
 */

// Action-Status mapping (mirrors Excel Action_Status_Map sheet)
const ACTION_STATUS = {
  'Not Started':  'Plan',
  'In Progress':  'Execute',
  'Review':       'Review',
  'On Hold':      'Wait',
  'Blocked':      'Escalate',
  'Completed':    'Close',
  'Cancelled':    'Cancel'
};

/**
 * Gets aggregated dashboard statistics — 8 KPIs for the Command Center.
 * Uses full 24 task column schema.
 */
function getDashboardStats() {
  const tasks = getRecords(DB_CONFIG.tasks);
  const now   = new Date();

  const total     = tasks.length;
  const completed = tasks.filter(t => t.Status === 'Completed').length;
  const inProgress= tasks.filter(t => t.Status === 'In Progress').length;
  const blocked   = tasks.filter(t => t.Status === 'Blocked').length;
  const onHold    = tasks.filter(t => t.Status === 'On Hold').length;
  const review    = tasks.filter(t => t.Status === 'Review').length;
  const cancelled = tasks.filter(t => t.Status === 'Cancelled').length;

  const overdue = tasks.filter(t => {
    if (t.Status === 'Completed' || t.Status === 'Cancelled') return false;
    if (!t.DueDate) return false;
    return new Date(t.DueDate) < now;
  }).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total, completed, inProgress, blocked,
    onHold, review, cancelled, overdue,
    completionRate
  };
}

/**
 * Gets monthly bucket summary for the selected year/month.
 * Implements carry-forward logic: open tasks with DueDate before this month.
 */
function getMonthlySummary(year, month) {
  const tasks = getRecords(DB_CONFIG.tasks);
  const currentMonthStart = new Date(year, month, 1);

  let totalDue = 0, completed = 0, carryForward = 0;

  tasks.forEach(t => {
    if (!t.DueDate) return;
    const dueDate = new Date(t.DueDate);
    const isSameMonth = dueDate.getMonth() === month && dueDate.getFullYear() === year;
    const isOngoing   = t.Status !== 'Completed' && t.Status !== 'Cancelled';

    if (isSameMonth) {
      totalDue++;
      if (t.Status === 'Completed') completed++;
    } else if (dueDate < currentMonthStart && isOngoing) {
      carryForward++;
    }
  });

  return { totalDue, completed, carryForward };
}

/**
 * Fetches manager report — drills down by each manager's team.
 */
function getDetailedManagerReport() {
  return []; // Simplified: Detailed manager reporting removed in accounts version
}

/**
 * Generates complete chart data for frontend Chart.js rendering.
 * Includes status, category, priority, and employee utilization.
 */
function getChartData() {
  const tasks     = getRecords(DB_CONFIG.tasks);
  const employees = getRecords(DB_CONFIG.employees);

  const statusCounts = {};
  const priorityCounts = {};

  tasks.forEach(t => {
    statusCounts[t.Status] = (statusCounts[t.Status] || 0) + 1;
    if (t.Priority) priorityCounts[t.Priority] = (priorityCounts[t.Priority] || 0) + 1;
  });

  const empUtil = employees.map(emp => {
    const empTasks = tasks.filter(t => t.AssignedTo === emp.Name);
    return {
      name:     emp.Name,
      totalTasks: empTasks.length,
      completed:  empTasks.filter(t => t.Status === 'Completed').length
    };
  });

  return {
    statusData:   { labels: Object.keys(statusCounts),   data: Object.values(statusCounts) },
    priorityData: { labels: Object.keys(priorityCounts), data: Object.values(priorityCounts) },
    employeeUtil: empUtil
  };
}

/**
 * Employee capacity vs utilization view.
 */
function getEmployeeLoad() {
  const employees = getRecords(DB_CONFIG.employees);
  const tasks     = getRecords(DB_CONFIG.tasks);

  return employees.map(emp => {
    const empTasks       = tasks.filter(t => t.AssignedTo === emp.Name);
    const openCount      = empTasks.filter(t => t.Status !== 'Completed' && t.Status !== 'Cancelled').length;
    const completedCount = empTasks.filter(t => t.Status === 'Completed').length;
    const overdueCount   = empTasks.filter(t => {
      if (t.Status === 'Completed' || t.Status === 'Cancelled') return false;
      return t.DueDate && new Date(t.DueDate) < new Date();
    }).length;

    return {
      name: emp.Name,
      role: emp.Role,
      openCount,
      completedCount, 
      overdueCount
    };
  });
}

/**
 * Updates a task status — stamps InProgressDate or CompletedDate automatically.
 */
function updateTaskStatus(taskId, newStatus, userEmail) {
  const record = {
    TaskID: taskId,
    Status: newStatus
  };
  const now = new Date();
  if (newStatus === 'In Progress') {
    record.InProgressDate = now;  // Start Date/Time stamp
  }
  if (newStatus === 'Completed') {
    record.CompletedDate   = now; // End Date/Time stamp
    record.ProgressPercent = 100;
    record.OverdueFlag     = 'No';
  }
  return updateRecord(DB_CONFIG.tasks, 'TaskID', record, userEmail);
}

/**
 * Updates full task details from modal — stamps InProgressDate / CompletedDate.
 */
function updateTaskDetails(taskData, userEmail) {
  const now = new Date();
  if (taskData.Status === 'In Progress' && !taskData.InProgressDate) {
    taskData.InProgressDate = now;  // Start Date/Time stamp
  }
  if (taskData.Status === 'Completed' && !taskData.CompletedDate) {
    taskData.CompletedDate = now;   // End Date/Time stamp
  }
  return updateRecord(DB_CONFIG.tasks, 'TaskID', taskData, userEmail);
}

/**
 * Adds a new task — auto-generates ID and derives computed fields.
 */
function addNewTask(taskData, userEmail) {
  const tasks = getRecords(DB_CONFIG.tasks);
  const ids   = tasks.map(t => parseInt((t.TaskID || '').replace('TSK-', ''))).filter(n => !isNaN(n));
  const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  const newId   = `TSK-${String(nextNum).padStart(3, '0')}`;

  const now  = new Date();

  const record = {
    TaskID:          newId,
    Title:           taskData.Title || 'Untitled',
    Description:     taskData.Description || '',
    AssignedTo:      taskData.AssignedTo || 'Unassigned',
    Priority:        taskData.Priority || 'Medium',
    Status:          taskData.Status || 'Not Started',
    DueDate:         taskData.DueDate || '',
    CreatedAt:       now,
    CompletedDate:   taskData.Status === 'Completed' ? now : ''
  };

  addRecord(DB_CONFIG.tasks, record, userEmail);
  return newId;
}

/**
 * Adds a new employee — auto-generates ID (EMP-001 format).
 */
function addNewEmployee(empData, userEmail) {
  const employees = getRecords(DB_CONFIG.employees);
  const ids = employees.map(e => parseInt((e.EmpID || '').replace('EMP', '').replace('-', ''))).filter(n => !isNaN(n));
  const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  const newId = `EMP-${String(nextNum).padStart(3, '0')}`;

  const now = new Date();
  
  const record = {
    EmpID:          newId,
    Name:           empData.Name || 'Unnamed',
    Role:           empData.Role || '',
    Email:          empData.Email || '',
    JoinDate:       empData.JoinDate || now,
    Status:         empData.Status || 'Active'
  };

  addRecord(DB_CONFIG.employees, record, userEmail);
  return newId;
}

/**
 * Task Deletion
 */
function deleteTask(taskId, userEmail) {
  return deleteRecord(DB_CONFIG.tasks, 'TaskID', taskId, userEmail);
}

/**
 * Employee Removal
 */
function deleteMember(empId, userEmail) {
  return deleteRecord(DB_CONFIG.employees, 'EmpID', empId, userEmail);
}
