/**
 * Web App Entry Point — Workflow Pro v4.0
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Workflow Pro | Task Management')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Unified API gateway for all client-side calls.
 * Method routing via explicit switch to ensure V8 runtime compatibility.
 */
function api(method, p1, p2) {
  try {
    let result;
    switch (method) {
      // ── Core Data Reads ──
      case 'getRecords':
        result = getRecords(p1);
        break;

      // ── Dashboard ──
      case 'getDashboardStats':
        result = getDashboardStats();
        break;
      case 'getChartData':
        result = getChartData();
        break;
      case 'getEmployeeLoad':
        result = getEmployeeLoad();
        break;

      // ── Monthly Reports ──
      case 'getMonthlySummary':
        result = getMonthlySummary(p1.year, p1.month);
        break;

      // ── Manager Reports ──
      case 'getManagerReport':
        result = getDetailedManagerReport();
        break;

      // ── Task Mutations ──
      case 'addTask':
        result = addNewTask(p1);
        break;
      case 'deleteTask':
        result = deleteTask(p1);
        break;
      case 'updateTaskStatus':
        result = updateTaskStatus(p1, p2);
        break;
      case 'updateTaskDetails':
        result = updateTaskDetails(p1);
        break;
      case 'addEmployee':
        result = addNewEmployee(p1);
        break;
      case 'deleteMember':
        result = deleteMember(p1);
        break;
      
      // ── Auth ──
      case 'login':
        result = loginUser(p1, p2);
        break;
      case 'signup':
        result = signupUser(p1);
        break;

      // ── Catch-all ──
      default:
        throw new Error(`API method "${method}" is not registered.`);
    }
    return { success: true, data: result };

  } catch (err) {
    Logger.log(`API Error [${method}]: ${err.message}`);
    return { success: false, error: err.message };
  }
}
