/**
 * DataMigration.gs — Workflow Pro
 * Seeds DB_Tasks and DB_Employees with rich, complete data.
 * All 24 Task columns, 11 Employee columns fully populated.
 * Date range: January–June 2026 for realistic chart population.
 *
 * Run `executeDataMigration()` from Apps Script Editor to apply.
 */

function executeDataMigration() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  /* ── STEP 1: Clear and re-seed Employees ── */
  let empSheet = ss.getSheetByName('DB_Employees');
  if (!empSheet) {
    empSheet = ss.insertSheet('DB_Employees');
    empSheet.getRange(1, 1, 1, 11).setValues([
      ['EmpID','Name','Department','Role','Manager','Email','JoinDate','WeeklyCapacity','Status','Location','Notes']
    ]);
  }
  if (empSheet.getLastRow() > 1) empSheet.deleteRows(2, empSheet.getLastRow() - 1);

  const employees = [
    ['EMP01','Pammi Gaur',     'Operations',       'Project Coordinator','Sara Khan',  'pammi@company.com',  new Date('2025-07-15'), 40, 'Active', 'Remote',  'Senior coordinator'],
    ['EMP02','Pankaj Vairagade','Business Systems', 'Systems Analyst',   'Sara Khan',  'pankaj@company.com', new Date('2025-08-01'), 40, 'Active', 'On-Site', 'ERP specialist'],
    ['EMP03','Sara Khan',       'Management',       'Operations Manager','Director',   'sara@company.com',   new Date('2024-01-10'), 40, 'Active', 'On-Site', 'Department head'],
    ['EMP04','Ravi Sharma',    'IT',               'Tech Lead',         'Sara Khan',   'ravi@company.com',   new Date('2025-03-20'), 40, 'Active', 'Remote',  'Backend developer'],
    ['EMP05','Neha Joshi',     'Finance',          'Finance Analyst',   'Sara Khan',   'neha@company.com',   new Date('2025-05-12'), 40, 'Active', 'On-Site', 'Budget management']
  ];
  empSheet.getRange(2, 1, employees.length, 11).setValues(employees);

  /* ── STEP 2: Clear and re-seed Tasks ── */
  let taskSheet = ss.getSheetByName('DB_Tasks');
  if (!taskSheet) {
    taskSheet = ss.insertSheet('DB_Tasks');
    taskSheet.getRange(1, 1, 1, 24).setValues([[
      'TaskID','Project','Category','Title','Description','AssignedTo','Department',
      'Priority','Status','ActionType','PlannedStart','DueDate','CompletedDate',
      'EstHours','ActualHours','HoursVariance','DaysOpen','OverdueFlag','MonthBucket',
      'ProgressPercent','NextStep','CreatedAt','Source','Manager'
    ]]);
  }
  if (taskSheet.getLastRow() > 1) taskSheet.deleteRows(2, taskSheet.getLastRow() - 1);

  // Helper to build task rows
  function d(y, m, day) { return new Date(y, m - 1, day); }
  function row(id, proj, cat, title, desc, emp, dept, prio, sts, act, pStart, due, comp, estH, actH, nxt, src, mgr, prog) {
    const hv = actH > 0 || estH > 0 ? Math.round((estH - actH) * 10) / 10 : '';
    const od = (sts !== 'Completed' && sts !== 'Cancelled' && due < new Date()) ? 'Yes' : 'No';
    const mo = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}`;
    const days = Math.round((new Date() - pStart) / 86400000);
    return [
      id, proj, cat, title, desc, emp, dept, prio, sts, act,
      pStart, due, comp || '', estH, actH, hv,
      Math.max(0, days), od, mo, prog, nxt, d(2026,1,1), src, mgr
    ];
  }

  const tasks = [
    // ════════════ ONBOARDING REVAMP PROJECT ════════════
    row('TSK-001','Onboarding Revamp','Implementation','Collect HR requirements','Gather all HR onboarding specifications and checklist','Pammi Gaur','Operations','High','Completed','Close',
        d(2026,1,5), d(2026,1,25), d(2026,1,24), 10, 9.5, 'Done — archived to SharePoint','Client','Sara Khan',100),
    row('TSK-002','Onboarding Revamp','Implementation','Design onboarding workflow','Map out the step-by-step onboarding journey for new hires','Pammi Gaur','Operations','High','Completed','Close',
        d(2026,1,20), d(2026,2,8), d(2026,2,7), 14, 13, 'Approved by Sara Khan','Operations','Sara Khan',100),
    row('TSK-003','Onboarding Revamp','Training','Schedule training sessions','Coordinate training calendar with IT and HR','Pammi Gaur','Operations','Medium','Completed','Close',
        d(2026,2,5), d(2026,2,20), d(2026,2,19), 8, 7, 'All sessions completed','Leadership','Sara Khan',100),
    row('TSK-004','Onboarding Revamp','Review','Management sign-off review','Prepare final review packet for senior management approval','Pammi Gaur','Operations','Critical','Completed','Close',
        d(2026,2,15), d(2026,2,28), d(2026,2,27), 6, 6.5, 'Sign-off received','Internal','Sara Khan',100),
    row('TSK-005','Onboarding Revamp','Implementation','Build onboarding portal','Set up Intranet page with links to all policies and forms','Pammi Gaur','Operations','High','In Progress','Execute',
        d(2026,3,1), d(2026,4,30), null, 20, 12, 'Integrate with HR system','IT','Sara Khan',60),
    row('TSK-006','Onboarding Revamp','Training','Train HR team on new process','Conduct workshops for HR team members on new onboarding SOP','Pammi Gaur','Operations','Medium','Not Started','Plan',
        d(2026,4,15), d(2026,5,20), null, 8, 0, 'Prepare training packs first','Operations','Sara Khan',0),

    // ════════════ WEBSITE MIGRATION PROJECT ════════════
    row('TSK-007','Website Migration','Operations','Vendor coordination','Lock down content migration partner and finalize contract','Pankaj Vairagade','Business Systems','Critical','Completed','Close',
        d(2026,1,8), d(2026,1,31), d(2026,1,30), 6, 7, 'Contract signed','Vendor','Sara Khan',100),
    row('TSK-008','Website Migration','Reporting','Build progress dashboard','Set up a weekly KPI reporting dashboard for the migration project','Pankaj Vairagade','Business Systems','High','Completed','Close',
        d(2026,2,1), d(2026,2,28), d(2026,2,25), 14, 11, 'Dashboard live in Sheets','Internal','Sara Khan',100),
    row('TSK-009','Website Migration','Implementation','Data audit old website','Export all existing pages, assets, and forms for migration planning','Pankaj Vairagade','Business Systems','High','Completed','Close',
        d(2026,2,10), d(2026,3,10), d(2026,3,9), 16, 15, 'Audit report shared','IT','Sara Khan',100),
    row('TSK-010','Website Migration','Implementation','New site architecture plan','Define IA for new website—pages, navigation hierarchy, URLs','Ravi Sharma','IT','High','Completed','Close',
        d(2026,2,20), d(2026,3,20), d(2026,3,18), 20, 18, 'IA approved by management','Internal','Sara Khan',100),
    row('TSK-011','Website Migration','Implementation','Migrate core pages','Move main pages (About, Services, Contact) to new CMS','Ravi Sharma','IT','Critical','In Progress','Execute',
        d(2026,3,15), d(2026,4,30), null, 30, 22, 'Fix broken image links','IT','Sara Khan',73),
    row('TSK-012','Website Migration','Review','QA testing phase 1','Test all migrated pages for links, forms, mobile responsiveness','Pankaj Vairagade','Business Systems','High','In Progress','Execute',
        d(2026,4,1), d(2026,4,25), null, 12, 5, 'Run Lighthouse audit','QA','Sara Khan',42),
    row('TSK-013','Website Migration','Implementation','SEO metadata update','Update all page titles, meta descriptions, and canonical tags','Ravi Sharma','IT','Medium','Not Started','Plan',
        d(2026,4,20), d(2026,5,15), null, 10, 0, 'Get keyword list from marketing','Marketing','Sara Khan',0),
    row('TSK-014','Website Migration','Operations','Go-live checklist','Final pre-launch checklist—DNS, SSL, redirects, CDN setup','Pankaj Vairagade','Business Systems','Critical','Not Started','Plan',
        d(2026,5,1), d(2026,5,30), null, 8, 0, 'Schedule DNS cutover window','IT','Sara Khan',0),

    // ════════════ ERP IMPLEMENTATION PROJECT ════════════
    row('TSK-015','ERP Implementation','Planning','BRD documentation','Document all business requirements for the ERP implementation','Pankaj Vairagade','Business Systems','Critical','Completed','Close',
        d(2026,1,10), d(2026,1,28), d(2026,1,27), 20, 22, 'BRD v3 signed off','Management','Sara Khan',100),
    row('TSK-016','ERP Implementation','Implementation','Module configuration — Finance','Configure chart of accounts, cost centers, and GL mapping','Pankaj Vairagade','Business Systems','High','Completed','Close',
        d(2026,2,5), d(2026,3,5), d(2026,3,4), 25, 24, 'UAT passed by finance team','Vendor','Sara Khan',100),
    row('TSK-017','ERP Implementation','Training','System training — Finance team','Train all finance users on ERP modules and month-end process','Neha Joshi','Finance','High','Completed','Close',
        d(2026,3,1), d(2026,3,25), d(2026,3,22), 16, 14, 'All users certified','HR','Sara Khan',100),
    row('TSK-018','ERP Implementation','Implementation','Module configuration — HR','Set up employee master, payroll rules, leave types in ERP','Ravi Sharma','IT','High','In Progress','Execute',
        d(2026,3,20), d(2026,4,30), null, 24, 18, 'Integrate with biometric system','IT','Sara Khan',75),
    row('TSK-019','ERP Implementation','Review','ERP Parallel Run — Month 1','Run ERP and legacy system simultaneously for April reconciliation','Neha Joshi','Finance','Critical','In Progress','Execute',
        d(2026,4,1), d(2026,4,30), null, 20, 12, 'Reconcile AR discrepancies','Finance','Sara Khan',60),
    row('TSK-020','ERP Implementation','Operations','Data migration — HR','Migrate 5 years historical HR data into new ERP system','Ravi Sharma','IT','Critical','Blocked','Escalate',
        d(2026,3,25), d(2026,4,20), null, 30, 8, 'Need data mapping template from vendor','Vendor','Sara Khan',27),
    row('TSK-021','ERP Implementation','Planning','Cutover planning','Finalize cutover dates, rollback plan, and communication schedule','Pankaj Vairagade','Business Systems','High','Not Started','Plan',
        d(2026,4,25), d(2026,5,20), null, 12, 0, 'Get readiness sign-off from all HODs','Management','Sara Khan',0),

    // ════════════ FINANCE QUARTERLY PROJECT ════════════
    row('TSK-022','Q1 Financial Audit','Reporting','Q1 P&L preparation','Compile and validate Jan-Mar revenue and expense reports','Neha Joshi','Finance','Critical','Completed','Close',
        d(2026,3,28), d(2026,4,7), d(2026,4,6), 16, 15, 'Submitted to auditors','Finance','Sara Khan',100),
    row('TSK-023','Q1 Financial Audit','Reporting','Bank reconciliation — March','Reconcile all bank accounts for March statement closes','Neha Joshi','Finance','High','Completed','Close',
        d(2026,4,1), d(2026,4,10), d(2026,4,9), 8, 8.5, 'Differences resolved','Finance','Sara Khan',100),
    row('TSK-024','Q1 Financial Audit','Review','Internal audit response','Draft responses to internal audit observations for Q1','Neha Joshi','Finance','High','In Progress','Review',
        d(2026,4,5), d(2026,4,20), null, 10, 5, 'Await CFO review comments','Audit','Sara Khan',50),
    row('TSK-025','Q1 Financial Audit','Reporting','Budget vs Actual Q1 report','Prepare detailed budget variance report for all departments','Neha Joshi','Finance','Critical','Not Started','Plan',
        d(2026,4,15), d(2026,4,30), null, 12, 0, 'Collect actuals from all departments','Finance','Sara Khan',0),

    // ════════════ IT INFRASTRUCTURE PROJECT ════════════
    row('TSK-026','IT Infrastructure','Implementation','Server room upgrade','Replace aging rack servers with new hyperconverged infrastructure','Ravi Sharma','IT','Critical','Completed','Close',
        d(2026,1,15), d(2026,2,15), d(2026,2,14), 40, 38, 'New servers commissioned','IT','Sara Khan',100),
    row('TSK-027','IT Infrastructure','Operations','Network segmentation','Implement VLAN segregation for Finance, HR, and Operations','Ravi Sharma','IT','High','Completed','Close',
        d(2026,2,20), d(2026,3,15), d(2026,3,14), 24, 20, 'Network diagram updated','IT','Sara Khan',100),
    row('TSK-028','IT Infrastructure','Implementation','Cloud backup setup','Configure automated daily backups to Azure Blob Storage','Ravi Sharma','IT','High','In Progress','Execute',
        d(2026,3,20), d(2026,4,20), null, 16, 12, 'Test restore procedures','IT','Sara Khan',75),
    row('TSK-029','IT Infrastructure','Review','Security vulnerability scan','Run comprehensive external and internal penetration testing','Ravi Sharma','IT','Critical','Blocked','Escalate',
        d(2026,4,1), d(2026,4,15), null, 20, 4, 'Waiting for third-party vendor NDA','Vendor','Sara Khan',20),
    row('TSK-030','IT Infrastructure','Planning','Disaster recovery plan update','Update BCP/DR document with new infrastructure topology','Ravi Sharma','IT','Medium','Not Started','Plan',
        d(2026,4,20), d(2026,5,30), null, 16, 0, 'Review existing DR runbooks','IT','Sara Khan',0),

    // ════════════ HR PROCESS IMPROVEMENT ════════════
    row('TSK-031','HR Process Improvement','Planning','Leave management SOP','Draft SOP for leave application, approval, and payroll integration','Pammi Gaur','Operations','Medium','Completed','Close',
        d(2026,2,1), d(2026,2,20), d(2026,2,18), 8, 7, 'SOP published on intranet','HR','Sara Khan',100),
    row('TSK-032','HR Process Improvement','Implementation','Performance appraisal setup','Configure annual appraisal forms and review cycle in HRMS','Pammi Gaur','Operations','High','Completed','Close',
        d(2026,2,25), d(2026,3,20), d(2026,3,19), 12, 11, 'Appraisal cycle initiated','HR','Sara Khan',100),
    row('TSK-033','HR Process Improvement','Training','Manager training — appraisals','Train all department managers on conducting fair appraisals','Pammi Gaur','Operations','Medium','In Progress','Execute',
        d(2026,3,25), d(2026,4,25), null, 10, 6, 'Prepare presentation slides','Leadership','Sara Khan',60),
    row('TSK-034','HR Process Improvement','Review','Policy compliance review','Review all HR policies for compliance with latest labor laws','Pammi Gaur','Operations','High','On Hold','Wait',
        d(2026,4,5), d(2026,5,10), null, 14, 2, 'Awaiting legal team input','Legal','Sara Khan',14),

    // ════════════ COMPLIANCE & REPORTING ════════════
    row('TSK-035','Statutory Compliance','Reporting','GST quarterly filing','Prepare and file GST returns for Q4 FY 2025-26','Neha Joshi','Finance','Critical','Completed','Close',
        d(2026,3,20), d(2026,4,20), d(2026,4,18), 16, 15, 'Filed and acknowledgment received','Finance','Sara Khan',100),
    row('TSK-036','Statutory Compliance','Reporting','TDS returns Q4','Compile TDS deductions and file quarterly returns','Neha Joshi','Finance','High','In Progress','Execute',
        d(2026,4,10), d(2026,4,30), null, 10, 6, 'Verify Form 26AS matches','Finance','Sara Khan',60),
    row('TSK-037','Statutory Compliance','Review','Annual audit prep','Prepare supporting schedules and reconciliations for statutory audit','Neha Joshi','Finance','Critical','Not Started','Plan',
        d(2026,4,20), d(2026,6,15), null, 30, 0, 'Create audit folder with trial balance','Finance','Sara Khan',0),

    // ════════════ ADDITIONAL TASKS FOR DATA DENSITY ════════════
    row('TSK-038','ERP Implementation','Training','System training — Warehouse','Train warehouse team on inventory and procurement ERP modules','Ravi Sharma','IT','Medium','Not Started','Plan',
        d(2026,5,1), d(2026,5,25), null, 14, 0, 'Book training room','Operations','Sara Khan',0),
    row('TSK-039','Website Migration','Implementation','Blog migration','Migrate 200+ blog posts with SEO metadata to new CMS','Pankaj Vairagade','Business Systems','Medium','Not Started','Plan',
        d(2026,5,5), d(2026,5,30), null, 20, 0, 'Export XML from old WordPress','IT','Sara Khan',0),
    row('TSK-040','HR Process Improvement','Planning','Recruitment SOP update','Update hiring process to include structured interview scoring','Pammi Gaur','Operations','Low','Not Started','Plan',
        d(2026,5,15), d(2026,6,15), null, 8, 0, 'Collect feedback from hiring managers','HR','Sara Khan',0),
    row('TSK-041','Q1 Financial Audit','Reporting','Fixed assets reconciliation','Reconcile fixed asset register with physical verification counts','Neha Joshi','Finance','High','In Progress','Review',
        d(2026,4,8), d(2026,4,22), null, 10, 7, 'Investigate discrepancies for IT assets','Finance','Sara Khan',70),
    row('TSK-042','IT Infrastructure','Implementation','Email archiving setup','Configure 7-year email retention and retrieval for compliance','Ravi Sharma','IT','Medium','On Hold','Wait',
        d(2026,4,12), d(2026,5,12), null, 12, 3, 'Awaiting storage capacity approval','IT','Sara Khan',25),
    row('TSK-043','Onboarding Revamp','Review','Pilot run — Batch 1','Run new onboarding process with first 3 new hires as pilot','Pammi Gaur','Operations','High','Not Started','Plan',
        d(2026,5,20), d(2026,6,5), null, 10, 0, 'Confirm joining dates with HR','HR','Sara Khan',0),
    row('TSK-044','Website Migration','Review','UAT sign-off meeting','Compile UAT findings and present to management for go/no-go','Pankaj Vairagade','Business Systems','Critical','Not Started','Plan',
        d(2026,5,25), d(2026,6,10), null, 8, 0, 'Prepare UAT summary deck','Management','Sara Khan',0),
    row('TSK-045','ERP Implementation','Implementation','Module configuration — Payroll','Configure payroll components, tax slabs, ESI/PF rules','Ravi Sharma','IT','Critical','Not Started','Plan',
        d(2026,5,1), d(2026,5,31), null, 28, 0, 'Get salary structure from HR','IT','Sara Khan',0)
  ];

  taskSheet.getRange(2, 1, tasks.length, 24).setValues(tasks);

  // Apply formatting
  taskSheet.getRange(1, 1, 1, 24).setFontWeight('bold').setBackground('#0f4c5c').setFontColor('white');
  taskSheet.setFrozenRows(1);
  empSheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('white');
  empSheet.setFrozenRows(1);

  SpreadsheetApp.getUi().alert(
    '✅ Migration Complete',
    `Successfully seeded:\n• ${employees.length} employees with full profiles\n• ${tasks.length} tasks with all 24 columns\n\nDate range: Jan 2026 – Jun 2026\n\nRefresh your Web App to see the data!`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  Logger.log(`Migration complete: ${employees.length} employees, ${tasks.length} tasks`);
}
