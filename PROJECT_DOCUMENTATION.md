# Workflow Pro Documentation

## 1. Introduction

### Overview
Workflow Pro is a Google Apps Script web application for managing tasks, tracking employee workloads, reviewing progress on a Kanban board, and generating reports from data stored in Google Sheets.

### Project Details
- Project Name: Workflow Pro
- Tech Stack: Google Apps Script, HTML, CSS, JavaScript, Google Sheets, Chart.js, html2pdf.js
- Purpose: Centralize task tracking, employee management, analytics, and reporting for an accounts or operations team
- Target Users: Admins, managers, and internal end users

### Key Features
- Secure login using email and SHA-256 password hashes
- Dashboard with KPI cards and charts
- Kanban board for task tracking
- Reports view with employee, monthly, manager, and visual analytics tabs
- Team master module for employee management
- Audit logging for create, update, delete, and login actions
- PDF-friendly monthly report export
- Mobile-friendly responsive layout

### System Purpose
The system is designed to replace ad hoc spreadsheet tracking with a structured internal task management portal while still using Google Sheets as the underlying datastore.

## 2. System Requirements

### Hardware Requirements
- Standard laptop or desktop capable of running a modern browser
- Stable internet connection

### Software Requirements
- Google account with access to Google Sheets and Google Apps Script
- Modern browser such as Google Chrome, Microsoft Edge, or Firefox

### Supported OS
- Windows 10 or later
- macOS
- Linux

### Dependencies
- Google Apps Script built-in services:
  - `HtmlService`
  - `SpreadsheetApp`
  - `Utilities`
  - `Session`
- Frontend CDN libraries:
  - `Chart.js@4.4.0`
  - `html2pdf.js@0.10.1`
- Google Fonts:
  - `Inter`
  - `DM Sans`

## 3. Installation Guide

### Prerequisites Setup
1. Create or choose a Google Spreadsheet to act as the application database.
2. Open the spreadsheet and go to `Extensions > Apps Script`.
3. Create an Apps Script project bound to that spreadsheet.
4. Copy the repository files into the Apps Script project:
   - `.gs` files as server-side script files
   - `index.html`, `style.html`, and `scripts.html` as HTML files

### Clone or Download Project
```powershell
git clone <your-repository-url>
cd task_mangement_accounts
```

If you are not using Git, download the project and manually copy the files into the Apps Script editor.

### Environment Configuration
This project does not currently use `.env` or `appsettings.json`.

Configuration is handled through:
- Sheet names in `Database.gs`
- Seed/setup functions in `Setup.gs`
- Data migration logic in `DataMigration.gs`
- Default admin account created by `initializeDatabase()`

### Database Setup and Migrations
Run these functions from the Apps Script editor:

1. `initializeDatabase()`
   - Creates the required sheets:
     - `DB_Tasks`
     - `DB_TaskSteps`
     - `DB_Employees`
     - `DB_AuditLog`
     - `DB_Config`
     - `DB_Users`
   - Seeds config values
   - Creates the default admin user:
```text
Email: admin@company.com
Password: Admin@123
```

2. Optional: `seedTestData()`
   - Adds a few starter employees and tasks

3. Optional: `executeDataMigration()`
   - Rebuilds `DB_Tasks` and `DB_Employees` with richer sample data
   - Useful for demos and analytics testing

### Build and Run Instructions
There is no local Node or .NET build step. The application runs as an Apps Script web app.

To run:
1. Open the Apps Script project.
2. Save all files.
3. Run `initializeDatabase()` once.
4. Deploy the project:
   - `Deploy > New deployment`
   - Select `Web app`
   - Set access as needed for your organization
5. Open the generated deployment URL.
6. Log in using the seeded admin account.

### Common Installation Issues and Fixes
- Issue: `Sheet DB_Tasks not found`
  - Fix: Run `initializeDatabase()` before opening the app.
- Issue: Login fails for seeded users
  - Fix: Make sure the user exists in `DB_Users`, not only in `DB_Employees`.
- Issue: Rich reports look empty after migration
  - Fix: Confirm `executeDataMigration()` finished successfully and repopulated the sheets.
- Issue: Pop-up blocked during PDF export
  - Fix: Allow pop-ups for the web app domain.

## 4. Project Structure

### Folder and File Structure
```text
task_mangement_accounts/
|-- Auth.gs
|-- Database.gs
|-- DataMigration.gs
|-- index.html
|-- PROJECT_DOCUMENTATION.md
|-- scripts.html
|-- Services.gs
|-- Setup.gs
|-- style.html
`-- WebApp.gs
```

### Key Files and Their Roles
- `WebApp.gs`
  - Web entry point
  - Includes HTML partials
  - Exposes unified `api()` gateway for client calls
- `Database.gs`
  - Generic CRUD helpers for Google Sheets
  - Schema reads and audit logging
- `Auth.gs`
  - Login flow and password hashing
- `Services.gs`
  - Business logic for dashboard, tasks, reports, and employees
- `Setup.gs`
  - First-time database initialization and seed data
- `DataMigration.gs`
  - Optional demo data migration with expanded sample dataset
- `index.html`
  - Base HTML layout and app containers
- `style.html`
  - UI styling
- `scripts.html`
  - Frontend application logic, rendering, state management, and Apps Script calls

## 5. Architecture Overview

### High-Level Architecture
- Frontend:
  - HTML templates rendered with Apps Script `HtmlService`
  - Client-side JavaScript in `scripts.html`
  - Charts rendered using Chart.js
- Backend:
  - Apps Script `.gs` files
  - Single API gateway in `WebApp.gs`
  - Business services in `Services.gs`
- Database:
  - Google Sheets used as the system of record

### Data Flow Explanation
1. User opens the web app URL.
2. `doGet()` serves `index.html` and includes `style.html` and `scripts.html`.
3. Frontend calls `google.script.run.api(...)`.
4. `api()` routes the request to the correct backend function.
5. Service or database functions read/write records in Google Sheets.
6. Response is returned to the frontend and the UI updates.

## 6. Configuration Details

### Environment Variables
No environment variables are currently required.

### Application Configuration
- Database sheet mapping is stored in `DB_CONFIG` inside `Database.gs`
- Default UI theme is stored in browser `localStorage`
- Session is stored in browser `localStorage` under `wf-session`

### API Endpoints
This application does not expose REST endpoints in the traditional sense. It uses Apps Script RPC calls through the `api(method, p1, p2, userEmail)` function.

Supported methods include:
- `getRecords`
- `getDashboardStats`
- `getChartData`
- `getEmployeeLoad`
- `getMonthlySummary`
- `getManagerReport`
- `addTask`
- `deleteTask`
- `updateTaskStatus`
- `updateTaskDetails`
- `addEmployee`
- `deleteMember`
- `updateEmployee`
- `checkRole`
- `login`
- `signup` (currently disabled)

### Third-Party Integrations
- Google Sheets for persistence
- Chart.js for charts
- html2pdf.js and browser print flow for PDF-friendly report export

## 7. Usage Guide

### How to Run the Project
1. Open the deployed web app URL.
2. Sign in with a valid user from `DB_Users`.
3. The app loads the dashboard by default.

### Key Workflows

#### Login
1. Enter company email and password.
2. Frontend calls `login`.
3. Backend validates the user in `DB_Users`.
4. Session info is saved in `localStorage`.

#### Create a Task
1. Click `+ Task`.
2. Fill in title, description, assignee, due date, priority, and status.
3. Save the task.
4. The task is written into `DB_Tasks`.

#### Update a Task
1. Open an existing task from the board or report.
2. Change fields and save.
3. If status changes to `In Progress` or `Completed`, timestamp fields may be stamped automatically.

#### Manage Employees
1. Open `Team Master`.
2. Add or edit a member.
3. Saving a new member can also create a linked login in `DB_Users`.

#### Generate Reports
1. Open `Reports`.
2. Switch between Employee, Monthly, Manager, and Visual tabs.
3. Use `Print / Save PDF` from the monthly report tab.

## 8. API Documentation

### Important Methods

#### `login(email, password)`
Validates credentials from `DB_Users`.

Example request:
```javascript
callServer('login', 'admin@company.com', 'Admin@123');
```

Example response:
```json
{
  "username": "admin@company.com",
  "role": "Admin",
  "email": "admin@company.com",
  "displayName": "admin"
}
```

#### `addTask(taskData, userEmail)`
Creates a new task and generates a `TSK-###` ID.

Example request:
```javascript
callServer('addTask', {
  Title: 'Prepare GST filing',
  Description: 'Compile and validate filing data',
  AssignedTo: 'Neha Joshi',
  Priority: 'High',
  Status: 'Not Started',
  DueDate: '2026-05-01'
});
```

Example response:
```json
"TSK-046"
```

#### `updateEmployee(empData, userEmail)`
Updates employee details and optionally password or role in `DB_Users`.

#### `getDashboardStats()`
Returns KPI values used on the dashboard.

Example response:
```json
{
  "total": 10,
  "completed": 3,
  "inProgress": 2,
  "blocked": 1,
  "onHold": 1,
  "review": 1,
  "cancelled": 0,
  "overdue": 2,
  "completionRate": 30
}
```

## 9. Deployment Guide

### Deploying as a Google Apps Script Web App
1. Open the Apps Script editor.
2. Click `Deploy > New deployment`.
3. Choose `Web app`.
4. Set:
   - Execute as: your account
   - Who has access: based on business needs
5. Deploy and authorize access.
6. Share the generated URL with users.

### Build and Publish Process
- Save the latest code in Apps Script
- Re-run setup or migration functions only if schema/data needs updating
- Create a new deployment version when releasing changes

### Alternative Deployment Notes
- IIS and Docker are not applicable to the current implementation
- If future migration to Node/.NET is planned, deployment strategy will need to change completely

## 10. Troubleshooting

### Common Errors and Solutions
- `No account found for this email`
  - The user exists in `DB_Employees` but not in `DB_Users`
- `Invalid password`
  - Password hash does not match the stored value in `DB_Users`
- Empty dashboard or reports
  - The required sheets are missing or contain no data
- Charts not rendering
  - Check browser console and confirm Chart.js loaded successfully
- PDF report does not open
  - Browser pop-up blocker is preventing the print window

### Important Schema Note
There is a schema mismatch to be aware of:
- `Setup.gs` initializes a leaner `DB_Tasks` and `DB_Employees` structure used by the core CRUD logic
- `DataMigration.gs` can rebuild those sheets with a richer analytics-friendly structure

If the app behaves unexpectedly after switching between setup modes, re-check the headers in:
- `DB_Tasks`
- `DB_Employees`

## 11. Best Practices

### Security Tips
- Change the default admin password after first deployment
- Restrict web app access to trusted users
- Avoid storing plain text passwords anywhere outside the creation flow
- Review audit logs regularly in `DB_AuditLog`

### Performance Considerations
- Keep sheet sizes manageable
- Avoid unnecessary full-sheet scans as data grows
- Prefer summary views for large datasets
- Review heavy chart/report functions if the record count increases significantly

### Maintenance Recommendations
- Keep sheet headers consistent with the code
- Test setup and migration flows in a copy of the spreadsheet before production use
- Version deployments clearly when releasing updates

## 12. Conclusion

Workflow Pro provides a lightweight internal task management platform built on Google Apps Script and Google Sheets. It is well suited for small to mid-sized teams that want structured tracking, role-based access, reporting, and minimal infrastructure overhead.

### Future Improvements
- Add stronger session handling beyond browser local storage
- Introduce role-based UI restrictions for admin-only actions
- Standardize the schema between setup and migration scripts
- Add export APIs and better audit filtering
- Add automated validation and test coverage for setup and migration flows
