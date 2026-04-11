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

  // Overdue = any open task with DueDate before today
  const overdue = tasks.filter(t => {
    if (t.Status === 'Completed' || t.Status === 'Cancelled') return false;
    if (!t.DueDate) return false;
    return new Date(t.DueDate) < now;
  }).length;

  const estTotalHours    = tasks.reduce((acc, t) => acc + (parseFloat(t.EstHours) || 0), 0);
  const actualTotalHours = tasks.reduce((acc, t) => acc + (parseFloat(t.ActualHours) || 0), 0);
  const hoursVariance    = estTotalHours - actualTotalHours;
  const completionRate   = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total, completed, inProgress, blocked,
    onHold, review, cancelled, overdue,
    estTotalHours:    Math.round(estTotalHours * 10) / 10,
    actualTotalHours: Math.round(actualTotalHours * 10) / 10,
    hoursVariance:    Math.round(hoursVariance * 10) / 10,
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

  let totalDue = 0, completed = 0, carryForward = 0, actualHrs = 0;

  tasks.forEach(t => {
    if (!t.DueDate) return;
    const dueDate = new Date(t.DueDate);
    const isSameMonth = dueDate.getMonth() === month && dueDate.getFullYear() === year;
    const isOngoing   = t.Status !== 'Completed' && t.Status !== 'Cancelled';

    if (isSameMonth) {
      totalDue++;
      if (t.Status === 'Completed') completed++;
      actualHrs += parseFloat(t.ActualHours) || 0;
    } else if (dueDate < currentMonthStart && isOngoing) {
      carryForward++;
    }
  });

  return {
    totalDue, completed, carryForward,
    actualHrs: Math.round(actualHrs * 10) / 10
  };
}

/**
 * Fetches manager report — drills down by each manager's team.
 */
function getDetailedManagerReport() {
  const tasks     = getRecords(DB_CONFIG.tasks);
  const employees = getRecords(DB_CONFIG.employees);
  const managers  = [...new Set(employees.map(e => e.Manager).filter(Boolean))];

  return managers.map(mgr => {
    const team     = employees.filter(e => e.Manager === mgr).map(e => e.Name);
    const mgrTasks = tasks.filter(t => team.includes(t.AssignedTo) || t.Manager === mgr);

    const totalTasks  = mgrTasks.length;
    const openTasks   = mgrTasks.filter(t => t.Status !== 'Completed').length;
    const overdue     = mgrTasks.filter(t => {
      if (t.Status === 'Completed') return false;
      if (!t.DueDate) return false;
      return new Date(t.DueDate) < new Date();
    }).length;
    const taskHrs       = mgrTasks.reduce((acc, t) => acc + (parseFloat(t.ActualHours) || 0), 0);
    const uniqueSources = new Set(mgrTasks.map(t => t.Source).filter(Boolean)).size;
    const carryForward  = mgrTasks.filter(t => t.OverdueFlag === 'Yes').length;

    return {
      manager: mgr,
      teamSize: team.length,
      totalTasks, openTasks, overdue,
      taskHrs: Math.round(taskHrs * 10) / 10,
      uniqueSources, carryForward
    };
  });
}

/**
 * Generates complete chart data for frontend Chart.js rendering.
 * Includes status, category, priority, and employee utilization.
 */
function getChartData() {
  const tasks     = getRecords(DB_CONFIG.tasks);
  const employees = getRecords(DB_CONFIG.employees);

  // Status breakdown
  const statusCounts = {};
  // Priority breakdown
  const priorityCounts = {};
  // Category breakdown
  const categoryCounts = {};

  tasks.forEach(t => {
    statusCounts[t.Status]     = (statusCounts[t.Status] || 0) + 1;
    if (t.Priority) priorityCounts[t.Priority] = (priorityCounts[t.Priority] || 0) + 1;
    if (t.Category) categoryCounts[t.Category] = (categoryCounts[t.Category] || 0) + 1;
  });

  // Employee utilization: Est vs Actual hours
  const empUtil = employees.map(emp => {
    const empTasks = tasks.filter(t => t.AssignedTo === emp.Name);
    const estH     = empTasks.reduce((s, t) => s + (parseFloat(t.EstHours) || 0), 0);
    const actH     = empTasks.reduce((s, t) => s + (parseFloat(t.ActualHours) || 0), 0);
    return {
      name:     emp.Name,
      estHours: Math.round(estH * 10) / 10,
      actHours: Math.round(actH * 10) / 10,
      capacity: parseFloat(emp.WeeklyCapacity) || 40
    };
  });

  return {
    statusData:   { labels: Object.keys(statusCounts),   data: Object.values(statusCounts) },
    priorityData: { labels: Object.keys(priorityCounts), data: Object.values(priorityCounts) },
    categoryData: { labels: Object.keys(categoryCounts), data: Object.values(categoryCounts) },
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
    const empTasks    = tasks.filter(t => t.AssignedTo === emp.Name && t.Status !== 'Completed');
    const openLoad    = empTasks.reduce((acc, t) => acc + (parseFloat(t.EstHours) || 0), 0);
    const totalActual = tasks.filter(t => t.AssignedTo === emp.Name).reduce((acc, t) => acc + (parseFloat(t.ActualHours) || 0), 0);
    const capacity    = parseFloat(emp.WeeklyCapacity) || 40;
    const utilization = capacity > 0 ? Math.round((openLoad / capacity) * 100) : 0;
    const completedCount = tasks.filter(t => t.AssignedTo === emp.Name && t.Status === 'Completed').length;
    const overdueCount   = tasks.filter(t => {
      if (t.AssignedTo !== emp.Name || t.Status === 'Completed') return false;
      return t.DueDate && new Date(t.DueDate) < new Date();
    }).length;

    return {
      name:           emp.Name,
      department:     emp.Department,
      role:           emp.Role,
      manager:        emp.Manager,
      capacity,
      openLoad:       Math.round(openLoad * 10) / 10,
      totalActual:    Math.round(totalActual * 10) / 10,
      utilization,
      completedCount, overdueCount
    };
  });
}

/**
 * Updates a task status — also syncs ActionType, ProgressPercent, CompletedDate.
 */
function updateTaskStatus(taskId, newStatus) {
  const record = {
    TaskID:     taskId,
    Status:     newStatus,
    ActionType: ACTION_STATUS[newStatus] || ''
  };
  if (newStatus === 'Completed') {
    record.CompletedDate    = new Date();
    record.ProgressPercent  = 100;
    record.OverdueFlag      = 'No';
  }
  return updateRecord(DB_CONFIG.tasks, 'TaskID', record);
}

/**
 * Updates full task details from modal — handles all 24 columns.
 */
function updateTaskDetails(taskData) {
  // Derive computed fields
  const estH = parseFloat(taskData.EstHours) || 0;
  const actH = parseFloat(taskData.ActualHours) || 0;
  taskData.HoursVariance = Math.round((estH - actH) * 10) / 10;
  taskData.ActionType    = ACTION_STATUS[taskData.Status] || taskData.ActionType || '';

  if (taskData.Status === 'Completed' && !taskData.CompletedDate) {
    taskData.CompletedDate = new Date();
  }

  // Recalculate OverdueFlag
  if (taskData.DueDate) {
    const due = new Date(taskData.DueDate);
    taskData.OverdueFlag = (taskData.Status !== 'Completed' && taskData.Status !== 'Cancelled' && due < new Date()) ? 'Yes' : 'No';
  }

  return updateRecord(DB_CONFIG.tasks, 'TaskID', taskData);
}

/**
 * Adds a new task — auto-generates ID and derives computed fields.
 */
function addNewTask(taskData) {
  const tasks = getRecords(DB_CONFIG.tasks);
  const ids   = tasks.map(t => parseInt((t.TaskID || '').replace('TSK-', ''))).filter(n => !isNaN(n));
  const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  const newId   = `TSK-${String(nextNum).padStart(3, '0')}`;

  const estH = parseFloat(taskData.EstHours) || 0;
  const actH = parseFloat(taskData.ActualHours) || 0;
  const now  = new Date();

  // Find employee info if assigned
  const assignedToName = taskData.AssignedTo || 'Unassigned';
  const emp = getRecords(DB_CONFIG.employees).find(e => e.Name === assignedToName) || {};

  // Build record with required and optional fields
  const record = {
    TaskID:          newId,
    Title:           taskData.Title || 'Untitled',
    Description:     taskData.Description || '',
    Project:         taskData.Project || 'Uncategorized',
    Category:        taskData.Category || 'Implementation',
    AssignedTo:      assignedToName,
    Department:      emp.Department || '',
    Priority:        taskData.Priority || 'Medium',
    Status:          taskData.Status || 'Not Started',
    ActionType:      ACTION_STATUS[taskData.Status] || 'Plan',
    Manager:         taskData.Manager || emp.Manager || '',
    PlannedStart:    now,
    DueDate:         taskData.DueDate || '',
    CompletedDate:   taskData.Status === 'Completed' ? now : '',
    EstHours:        estH,
    ActualHours:     actH,
    HoursVariance:   Math.round((estH - actH) * 10) / 10,
    DaysOpen:        0,
    OverdueFlag:     'No',
    MonthBucket:     taskData.DueDate ? (() => { 
      const d = new Date(taskData.DueDate); 
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; 
    })() : '',
    ProgressPercent: taskData.ProgressPercent || 0,
    NextStep:        taskData.NextStep || '',
    Source:          taskData.Source || 'Kanban Board',
    CreatedAt:       now
  };

  addRecord(DB_CONFIG.tasks, record);
  return newId;
}
