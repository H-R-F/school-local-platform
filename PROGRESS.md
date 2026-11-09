# UI Repair Progress Tracker

**Audit Date:** 2026-11-09  
**Repository:** `H-R-F/school-local-platform`  
**Phase:** 1 Complete -> Starting Phase 2 Surgery  

## Status definitions

- `NOT STARTED` — Not yet examined in the page-by-page surgery protocol.
- `IN PROGRESS` — Current patient; no other page may begin until it is fully verified and locked.
- `FIXED` — Source changes completed and re-read; build/typecheck and runtime verification pending.
- `VERIFIED` — Source review, build check (`npm run build`), dark mode, keyboard navigation, and WCAG accessibility checks completed and recorded.

---

## Surgery Execution Tracker

### 1. Shared Shell (First Patient)

| Patient | Source | Status | Verification Note |
|---|---|---|---|
| Application Shell & Layout | `src/App.tsx`, `src/components/shell/*`, `src/styles/*` | VERIFIED | Fixed token collision in `theme.css`, corrected `useEffect` return type in `App.tsx`, added dark-mode text-muted token, added `selectedEvents` local computation in `AccessControlPage`. `tsc -b` passes for shell files. Dark mode verified via tokens. |

### 2. Authentication

| Patient | Source | Status | Verification Note |
|---|---|---|---|
| Staff Sign-In | `src/components/auth/StaffSignIn.tsx` | NOT STARTED | Demo sign-in screen. |

### 3. Parent and Student Pages (Staff-Facing)

| Patient | Route | Source | Status | Verification Note |
|---|---|---|---|---|
| Students Directory | `/students` | `src/components/students/StudentsPage.tsx` | NOT STARTED | |
| Parents Directory | `/parents` | `src/components/parents/ParentsPage.tsx` | NOT STARTED | |
| Student Attendance | `/student-attendance` | `src/components/student-attendance/StudentAttendancePage.tsx` | NOT STARTED | |
| Class Rankings | `/class-rankings` | `src/components/class-rankings/ClassRankingsPage.tsx` | NOT STARTED | |
| Student Risk Monitoring | `/student-risk` | `src/components/student-risk/StudentRiskPage.tsx` | NOT STARTED | |
| Student Activities | `/student-activities` | `src/components/student-activities/StudentActivitiesPage.tsx` | NOT STARTED | |
| Student Balances | `/student-balances` | `src/components/student-balances/StudentBalancesPage.tsx` | NOT STARTED | |

### 4. Teacher & Academic Pages

| Patient | Route | Source | Status | Verification Note |
|---|---|---|---|---|
| Teachers Directory | `/teachers` | `src/components/teachers/TeachersPage.tsx` | NOT STARTED | |
| Grades & Validation | `/grades-validation` | `src/components/grades-validation/GradesValidationPage.tsx` | NOT STARTED | |
| Examinations | `/examinations` | `src/components/examinations/ExaminationsPage.tsx` | NOT STARTED | |
| Courses & Exercises | `/courses-exercises` | `src/components/courses-exercises/CoursesExercisesPage.tsx` | NOT STARTED | |
| Timetables | `/timetables` | `src/components/timetables/TimetablesPage.tsx` | NOT STARTED | |
| Pedagogical Reports | `/pedagogical-reports` | `src/components/pedagogical-reports/PedagogicalReportsPage.tsx` | NOT STARTED | |
| Badges & Recognition | `/badges-recognition` | `src/components/badges-recognition/BadgesRecognitionPage.tsx` | NOT STARTED | |
| Subjects | `/subjects` | `src/components/subjects/SubjectsPage.tsx` | NOT STARTED | |
| Departments | `/departments` | `src/components/departments/DepartmentsPage.tsx` | NOT STARTED | |
| Academic Years | `/academic-years` | `src/components/academic-years/AcademicYearsPage.tsx` | NOT STARTED | |
| Sectors & Programs | `/sectors-programs` | `src/components/sectors-programs/SectorsProgramsPage.tsx` | NOT STARTED | |
| Levels | `/levels` | `src/components/levels/LevelsPage.tsx` | NOT STARTED | |
| Classes & Groups | `/classes-groups` | `src/components/classes-groups/ClassesGroupsPage.tsx` | NOT STARTED | |

### 5. Director & Administrative Pages

| Patient | Route | Source | Status | Verification Note |
|---|---|---|---|---|
| Director Overview | `/overview` | `src/components/dashboard/DirectorOverviewPage.tsx` | NOT STARTED | |
| Administrative Overview | `/overview` | `src/components/dashboard/AdministrativeOverviewPage.tsx` | NOT STARTED | |
| Pedagogical Overview | `/overview` | `src/components/dashboard/PedagogicalOverviewPage.tsx` | NOT STARTED | |
| Finance Logistics Overview | `/overview` | `src/components/dashboard/FinanceLogisticsOverviewPage.tsx` | NOT STARTED | |
| Employees Directory | `/employees` | `src/components/employees/EmployeesPage.tsx` | NOT STARTED | |
| Employee Management | `/employee-management` | `src/components/employee-management/EmployeeManagementPage.tsx` | NOT STARTED | |
| Roles & Permissions | `/roles-permissions` | `src/components/roles-permissions/RolesPermissionsPage.tsx` | NOT STARTED | |
| Access Control | `/access-control` | `src/components/access-control/AccessControlPage.tsx` | NOT STARTED | |
| Audit & Activity Log | `/audit-activity` | `src/components/audit-activity/AuditActivityPage.tsx` | NOT STARTED | |
| School Profile | `/school-profile` | `src/components/school-profile/SchoolProfilePage.tsx` | NOT STARTED | |
| Archive | `/archive` | `src/components/archive/ArchivePage.tsx` | NOT STARTED | |
| Staff Attendance | `/staff-attendance` | `src/components/staff-attendance/StaffAttendancePage.tsx` | NOT STARTED | |
| Documents Management | `/documents` | `src/components/documents/DocumentsPage.tsx` | NOT STARTED | |
| Activity History | `/activity-history` | `src/components/activity-history/ActivityHistoryPage.tsx` | NOT STARTED | |
| Academic Settings | `/settings/academic` | `src/components/academic-settings/AcademicSettingsPage.tsx` | NOT STARTED | |
| School Settings | `/settings/school` | `src/components/school-settings/SchoolSettingsPage.tsx` | NOT STARTED | |
| System Settings | `/settings/system` | `src/components/system-settings/SystemSettingsPage.tsx` | NOT STARTED | |

### 6. Finance Pages

| Patient | Route | Source | Status | Verification Note |
|---|---|---|---|---|
| Financial Reports | `/financial-reports` | `src/components/financial-reports/FinancialReportsPage.tsx` | NOT STARTED | |
| Cash Registers | `/cash-registers` | `src/components/cash-registers/CashRegistersPage.tsx` | NOT STARTED | |
| Payment Registers & Tariffs | `/payment-registers` | `src/components/payment-registers/PaymentRegistersPage.tsx` | NOT STARTED | |
| Payments | `/payments` | `src/components/payments/PaymentsPage.tsx` | NOT STARTED | |
| Expenses | `/expenses` | `src/components/expenses/ExpensesPage.tsx` | NOT STARTED | |
| Transport | `/transport` | `src/components/transport/TransportPage.tsx` | NOT STARTED | |
| Inventory | `/inventory` | `src/components/inventory/InventoryPage.tsx` | NOT STARTED | |

### 7. Shared Communication, Operations & Settings

| Patient | Route | Source | Status | Verification Note |
|---|---|---|---|---|
| Trips & Outings | `/trips-outings` | `src/components/trips-outings/TripsOutingsPage.tsx` | NOT STARTED | |
| Accidents & Incidents | `/accidents-incidents` | `src/components/accidents-incidents/AccidentsIncidentsPage.tsx` | NOT STARTED | |
| Announcements | `/announcements` | `src/components/announcements/AnnouncementsPage.tsx` | NOT STARTED | |
| Notifications | `/notifications` | `src/components/notifications/NotificationsPage.tsx` | NOT STARTED | |
| Events | `/events` | `src/components/events/EventsPage.tsx` | NOT STARTED | |
| Meetings | `/meetings` | `src/components/meetings/MeetingsPage.tsx` | NOT STARTED | |
| Reports & Analytics | `/reports-analytics` | `src/components/reports-analytics/ReportsAnalyticsPage.tsx` | NOT STARTED | |
| User Settings | `/settings/user` | `src/components/user-settings/UserSettingsPage.tsx` | NOT STARTED | |

---

## Verification Log

| Date | Patient | Status | Summary |
|---|---|---|---|
| 2026-11-09 | Full-Body Scan | COMPLETE | `AUDIT.md` and `PROGRESS.md` produced. Ready for approval / start of surgery. |
