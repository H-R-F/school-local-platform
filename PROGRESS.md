# UI Repair Progress Tracker

**Audit ref:** `backup-before-removing-commits`  
**Audit commit:** `32c6f4a88e05c0d37961c75f382415427426946f`  
**Phase:** 1 complete — awaiting user review/approval  
**Rule:** No application UI code has been changed as part of Phase 1. Every implementation item starts as `NOT STARTED`.

## Status definitions

- `NOT STARTED` — not yet examined in the page-by-page surgery protocol.
- `IN PROGRESS` — current patient; no other page may begin until it is fully verified.
- `FIXED` — source changes made and source-level checklist re-read; runtime verification still pending.
- `VERIFIED` — source review and required runtime/accessibility checks completed and recorded. A source-only review is not sufficient for this status.

## Coverage summary

| Inventory | Count | Current status |
|---|---:|---|
| Shared shell components | 6 | NOT STARTED |
| Staff authentication screens | 1 | NOT STARTED |
| Routed navigation entries | 49 | NOT STARTED |
| Role-specific overview variants | 4 (within `/overview`) | NOT STARTED |
| External parent/student/teacher portals | 0 found | Out of current implementation scope |
| IT-support portal/screens | 0 found | Out of current implementation scope |
| MFA / password reset routes | 0 found | Not implemented in inspected route dispatch |
| Dedicated 404 route | 0 found | Not implemented; generic fallback exists |
| **Implemented route/view patients** | **50** (49 routes + sign-in; dashboard variants separately noted) | **0 VERIFIED** |

The 49 route entries are from `src/data/navigation.ts`. Page components are selected in `src/App.tsx`. The route list does not imply that every route is visible to every role; the existing role and permission filters remain authoritative.

## Phase 2 execution tracker

### 1. Shared shell — first patient

| Patient | Source | Status | Verification note |
|---|---|---|---|
| Application shell/layout wrapper | `src/App.tsx`, `src/index.css` | NOT STARTED | Composition, content offsets, fixed bars, scroll and responsive behavior require review. |
| Sidebar and navigation | `src/components/AppSidebar.tsx`, `src/components/sidebar/*` | NOT STARTED | Includes expanded/collapsed states, groups, active route, search and permission-filtered items. |
| Top bar | `src/components/shell/TopBar.tsx` | NOT STARTED | Search trigger, notification entry, account menu and keyboard behavior. |
| Status bar | `src/components/shell/StatusBar.tsx` | NOT STARTED | Connectivity/system indicators and popovers; demo values must remain clearly demo. |
| Command palette | `src/components/shell/CommandPalette.tsx` | NOT STARTED | Dialog semantics, focus management, keyboard selection and empty results. |
| Shared shell styles | `src/components/shell/shell.css`, `src/design-system.css` | NOT STARTED | Resolve duplicate ownership and theme behavior without changing shell logic. |

### 2. Authentication

| Patient | Source | Status | Verification note |
|---|---|---|---|
| Staff sign-in | `src/components/auth/StaffSignIn.tsx` | NOT STARTED | Demo authentication presentation only; do not alter auth logic. |

### 3. Parent and student pages

No dedicated external parent/student portal routes or role types were found. The following are staff-facing records/operations, not external portals.

| Patient | Route | Source | Current role scope | Status |
|---|---|---|---|---|
| Students directory | `/students` | `src/components/students/StudentsPage.tsx` | academic | NOT STARTED |
| Parents directory | `/parents` | `src/components/parents/ParentsPage.tsx` | leadership | NOT STARTED |
| Student attendance | `/student-attendance` | `src/components/student-attendance/StudentAttendancePage.tsx` | academic | NOT STARTED |
| Student class rankings | `/class-rankings` | `src/components/class-rankings/ClassRankingsPage.tsx` | pedagogy | NOT STARTED |
| Student risk monitoring | `/student-risk` | `src/components/student-risk/StudentRiskPage.tsx` | pedagogy | NOT STARTED |
| Student activities | `/student-activities` | `src/components/student-activities/StudentActivitiesPage.tsx` | academic | NOT STARTED |
| Student balances and services | `/student-balances` | `src/components/student-balances/StudentBalancesPage.tsx` | finance | NOT STARTED |

### 4. Teacher pages

No external teacher portal route or `teacher` role exists in the current `StaffRole` type. The teacher directory and pedagogical tools are staff-facing.

| Patient | Route | Source | Current role scope | Status |
|---|---|---|---|---|
| Teachers directory | `/teachers` | `src/components/teachers/TeachersPage.tsx` | academic | NOT STARTED |
| Grades and validation | `/grades-validation` | `src/components/grades-validation/GradesValidationPage.tsx` | pedagogy | NOT STARTED |
| Examinations | `/examinations` | `src/components/examinations/ExaminationsPage.tsx` | pedagogy | NOT STARTED |
| Courses and exercises | `/courses-exercises` | `src/components/courses-exercises/CoursesExercisesPage.tsx` | pedagogy | NOT STARTED |
| Timetables | `/timetables` | `src/components/timetables/TimetablesPage.tsx` | academic | NOT STARTED |
| Pedagogical reports | `/pedagogical-reports` | `src/components/pedagogical-reports/PedagogicalReportsPage.tsx` | pedagogy | NOT STARTED |
| Badges and recognition | `/badges-recognition` | `src/components/badges-recognition/BadgesRecognitionPage.tsx` | pedagogy | NOT STARTED |
| Subjects | `/subjects` | `src/components/subjects/SubjectsPage.tsx` | academic | NOT STARTED |
| Departments | `/departments` | `src/components/departments/DepartmentsPage.tsx` | academic | NOT STARTED |
| Academic years | `/academic-years` | `src/components/academic-years/AcademicYearsPage.tsx` | academic | NOT STARTED |
| Sectors and programs | `/sectors-programs` | `src/components/sectors-programs/SectorsProgramsPage.tsx` | academic | NOT STARTED |
| Levels | `/levels` | `src/components/levels/LevelsPage.tsx` | academic | NOT STARTED |
| Classes and groups | `/classes-groups` | `src/components/classes-groups/ClassesGroupsPage.tsx` | academic | NOT STARTED |

### 5. Director and administrative pages

Role scope abbreviations: director; administrative; pedagogical; finance. The route's effective access remains determined by the existing permission set and navigation declarations.

| Patient | Route | Source | Current role scope | Status |
|---|---|---|---|---|
| Director overview | `/overview` | `src/components/dashboard/DirectorOverviewPage.tsx` | director | NOT STARTED |
| Administrative overview | `/overview` | `src/components/dashboard/AdministrativeOverviewPage.tsx` | administrative | NOT STARTED |
| Pedagogical overview | `/overview` | `src/components/dashboard/PedagogicalOverviewPage.tsx` | pedagogical | NOT STARTED |
| Finance/logistics overview | `/overview` | `src/components/dashboard/FinanceLogisticsOverviewPage.tsx` | finance | NOT STARTED |
| Director task center | embedded in overview | `src/components/dashboard/DirectorTaskCenter.tsx` | director dashboard | NOT STARTED |
| Employees directory | `/employees` | `src/components/employees/EmployeesPage.tsx` | leadership | NOT STARTED |
| Employee management | `/employee-management` | `src/components/employee-management/EmployeeManagementPage.tsx` | leadership | NOT STARTED |
| Roles and permissions | `/roles-permissions` | `src/components/roles-permissions/RolesPermissionsPage.tsx` | leadership | NOT STARTED |
| Access control | `/access-control` | `src/components/access-control/AccessControlPage.tsx` | director | NOT STARTED |
| Audit activity | `/audit-activity` | `src/components/audit-activity/AuditActivityPage.tsx` | director | NOT STARTED |
| School profile | `/school-profile` | `src/components/school-profile/SchoolProfilePage.tsx` | director | NOT STARTED |
| Archive | `/archive` | `src/components/archive/ArchivePage.tsx` | director | NOT STARTED |
| Staff attendance | `/staff-attendance` | `src/components/staff-attendance/StaffAttendancePage.tsx` | leadership | NOT STARTED |
| Documents | `/documents` | `src/components/documents/DocumentsPage.tsx` | leadership | NOT STARTED |
| Activity history | `/activity-history` | `src/components/activity-history/ActivityHistoryPage.tsx` | leadership | NOT STARTED |
| Academic settings | `/settings/academic` | `src/components/academic-settings/AcademicSettingsPage.tsx` | academic | NOT STARTED |
| School settings | `/settings/school` | `src/components/school-settings/SchoolSettingsPage.tsx` | director | NOT STARTED |
| System settings | `/settings/system` | `src/components/system-settings/SystemSettingsPage.tsx` | director | NOT STARTED |

### 6. Finance pages

| Patient | Route | Source | Current role scope | Status |
|---|---|---|---|---|
| Financial reports | `/financial-reports` | `src/components/financial-reports/FinancialReportsPage.tsx` | finance | NOT STARTED |
| Cash registers | `/cash-registers` | `src/components/cash-registers/CashRegistersPage.tsx` | finance | NOT STARTED |
| Payment registers and tariffs | `/payment-registers` | `src/components/payment-registers/PaymentRegistersPage.tsx` | finance | NOT STARTED |
| Payments | `/payments` | `src/components/payments/PaymentsPage.tsx` | finance | NOT STARTED |
| Expenses | `/expenses` | `src/components/expenses/ExpensesPage.tsx` | finance | NOT STARTED |
| Transport | `/transport` | `src/components/transport/TransportPage.tsx` | finance | NOT STARTED |
| Inventory | `/inventory` | `src/components/inventory/InventoryPage.tsx` | finance | NOT STARTED |

### 7. IT support pages

No IT-support role, route, or dedicated IT support screen was found. This is an implementation-scope gap, not permission to add one during this visual repair.

### 8. Shared communication, operations, reporting and settings

| Patient | Route | Source | Current role scope | Status |
|---|---|---|---|---|
| Overview route dispatcher | `/overview` | `src/App.tsx` | all four staff roles | NOT STARTED |
| Trips and outings | `/trips-outings` | `src/components/trips-outings/TripsOutingsPage.tsx` | operations | NOT STARTED |
| Accidents and incidents | `/accidents-incidents` | `src/components/accidents-incidents/AccidentsIncidentsPage.tsx` | operations | NOT STARTED |
| Announcements | `/announcements` | `src/components/announcements/AnnouncementsPage.tsx` | all four staff roles | NOT STARTED |
| Notifications | `/notifications` | `src/components/notifications/NotificationsPage.tsx` | all four staff roles | NOT STARTED |
| Events | `/events` | `src/components/events/EventsPage.tsx` | all four staff roles | NOT STARTED |
| Meetings | `/meetings` | `src/components/meetings/MeetingsPage.tsx` | leadership | NOT STARTED |
| Reports and analytics | `/reports-analytics` | `src/components/reports-analytics/ReportsAnalyticsPage.tsx` | all four staff roles | NOT STARTED |
| User settings | `/settings/user` | `src/components/user-settings/UserSettingsPage.tsx` | all four staff roles | NOT STARTED |

### 9. Embedded overlays, drawers, dialogs and states

| Patient group | Source scope | Status | Verification note |
|---|---|---|---|
| Page drawers, detail panels, tabs, forms and confirmations | Embedded in page TSX files listed above | NOT STARTED | Inventory each actual overlay during its owning page's Step A. Do not mark this aggregate complete until every owning page is checked. |
| Top bar account menu | `TopBar.tsx` | NOT STARTED | Escape, outside-click, focus entry/return and menu keyboard behavior. |
| Status popovers | `StatusBar.tsx` | NOT STARTED | Keyboard dismissal, semantics, placement and theme. |
| Command palette dialog | `CommandPalette.tsx` | NOT STARTED | Focus trap/return, keyboard operation and empty results. |
| Generic unmatched-route fallback | `App.tsx` | NOT STARTED | Currently “Module en préparation”; verify visual treatment and decide 404 handling without adding a route. |
| Empty/loading/error/offline states | Each data page | NOT STARTED | Record only states supported by current data/services; any missing sync/backend capability is a blocker, not a styling feature to invent. |

## Required page-level lock checklist

Every patient must complete this checklist before status can advance from `IN PROGRESS` to `FIXED`:

- [ ] Colors use semantic color tokens; any new token is documented first.
- [ ] Spacing uses the approved 4px scale or documented semantic exceptions.
- [ ] Typography uses the canonical family, size, weight and line-height tokens.
- [ ] Radius and elevation use semantic tokens.
- [ ] Buttons use the agreed variants, with at most one primary action per view.
- [ ] Inputs have visible labels, help/error text and consistent focus treatment.
- [ ] Tables follow shared row/header/hover/empty/loading rules.
- [ ] Cards follow shared surface, border, radius and elevation rules.
- [ ] Icons use the existing Lucide stroke set with consistent sizing.
- [ ] Hover, focus-visible, active, disabled and loading states are covered where applicable.
- [ ] Empty and error states are covered where applicable.
- [ ] Offline/queued states reflect only existing local-first behavior.
- [ ] Light and dark themes are checked in rendered UI.
- [ ] WCAG 2.1 AA contrast is measured for the rendered states.
- [ ] Keyboard navigation is tested end-to-end.
- [ ] Mobile controls meet 44×44px minimum target size where the mobile layout exposes them.
- [ ] No unapproved literal visual values remain in the patient stylesheet/markup.
- [ ] No dead CSS is introduced; removals are recorded in `MIGRATION.md`.
- [ ] No API, auth, permissions, database, or business logic changed.
- [ ] Build and relevant tests pass.
- [ ] Written verification evidence is recorded below.

## Page verification log

No patient has entered surgery. No runtime or accessibility verification has been performed.

| Date | Patient | Status change | Evidence |
|---|---|---|---|
| 2026-11-08 | Phase 1 inventory | COMPLETE — awaiting review | Source files and route catalogue reviewed; no application code modified. |

## Approval gate

**Phase 2 is paused.** The first patient after approval is the shared shell. Do not start page fixes until the user has reviewed `AUDIT.md` and this tracker and explicitly approved Phase 2.
