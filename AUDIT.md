# UI/UX Full-Body Audit — School Local Platform

**Audit date:** 2026-11-09  
**Repository:** `H-R-F/school-local-platform`  
**Phase:** 1 — Full-Body Scan  

## 1. Executive Diagnosis

The project is a hybrid local-first school management SaaS built with React 19, TypeScript, Vite, and plain CSS (with Tailwind CSS v4 configured). While functional, the codebase suffers from severe UI/UX design debt:
- **Style Layer Fragmentation:** Overlapping and conflicting style sources (`src/styles/tokens.css`, `src/styles/theme.css`, `src/design-system.css`, `src/index.css`, `src/styles/form-system.css`, `src/styles/action-system.css`, `src/styles/form-drawers.css`, and 30+ page-specific CSS files).
- **Token Collisions:** `theme.css` redeclares `--space-1` through `--space-8` as 1px-8px compatibility aliases, colliding with the 4px semantic scale in `tokens.css`.
- **Hard-coded Values:** Over 2,500 hard-coded hex colors, 2,000+ arbitrary pixel spacing values, hard-coded font sizes, and inline `style={{ ... }}` attributes scattered across TSX files.
- **Overuse of `!important`:** Over 600 `!important` overrides across `design-system.css` and page stylesheets.
- **Inconsistent Interactive & Feedback States:** Missing hover, focus-visible, active, disabled, loading, empty, error, and offline states on many pages.
- **Incomplete Dark Mode:** Dark mode works on the shared shell but breaks on individual page components due to hard-coded background and text colors.
- **Accessibility & Contrast:** Lack of systematic focus indicators, improper ARIA roles on dialogs/menus, contrast failures in muted text, and controls under 44x44px target sizes.
- **Build & Type Debt:** `npm run build` (`tsc -b`) currently fails due to unused variables, type mismatches, and missing properties in page components (`App.tsx`, `ArchivePage.tsx`, `MeetingsPage.tsx`, `SystemSettingsPage.tsx`, etc.).

---

## 2. Project Inventory

### 2.1 Shared Shell & Core Infrastructure
- **App Shell Wrapper:** `src/App.tsx` (Route dispatch, role state, theme switcher, layout container)
- **App Navigation Sidebar:** `src/components/AppSidebar.tsx` + `src/components/sidebar/*` (SidebarBrand, SidebarGroup, SidebarItem)
- **Top Header Bar:** `src/components/shell/TopBar.tsx` (Search trigger, notifications menu, user profile dropdown)
- **Bottom Status Bar:** `src/components/shell/StatusBar.tsx` (Server, internet, backup, licence indicators)
- **Global Command Palette:** `src/components/shell/CommandPalette.tsx` (Route search dialog)
- **Staff Sign-in Screen:** `src/components/auth/StaffSignIn.tsx`

### 2.2 Route & Page Inventory (49 Routes + Sign-In + Overview Dashboards)
Grouped by role and functional domain:

#### Shared Shell & Authentication
1. `StaffSignIn` — Staff Sign-In (`src/components/auth/StaffSignIn.tsx`)
2. `AppShell` — Shell Layout Wrapper (`src/App.tsx`, `AppSidebar.tsx`, `TopBar.tsx`, `StatusBar.tsx`, `CommandPalette.tsx`)

#### Parent & Student Pages (Staff-Facing Directories & Tracking)
3. `/students` — Students Directory (`StudentsPage.tsx`)
4. `/parents` — Parents Directory (`ParentsPage.tsx`)
5. `/student-attendance` — Student Attendance (`StudentAttendancePage.tsx`)
6. `/class-rankings` — Class Rankings (`ClassRankingsPage.tsx`)
7. `/student-risk` — Student Risk Monitoring (`StudentRiskPage.tsx`)
8. `/student-activities` — Student Activities (`StudentActivitiesPage.tsx`)
9. `/student-balances` — Student Balances (`StudentBalancesPage.tsx`)

#### Teacher & Academic Pages
10. `/teachers` — Teachers Directory (`TeachersPage.tsx`)
11. `/grades-validation` — Grades & Validation (`GradesValidationPage.tsx`)
12. `/examinations` — Examinations (`ExaminationsPage.tsx`)
13. `/courses-exercises` — Courses & Exercises (`CoursesExercisesPage.tsx`)
14. `/timetables` — Timetables (`TimetablesPage.tsx`)
15. `/pedagogical-reports` — Pedagogical Reports (`PedagogicalReportsPage.tsx`)
16. `/badges-recognition` — Badges & Recognition (`BadgesRecognitionPage.tsx`)
17. `/subjects` — Subjects (`SubjectsPage.tsx`)
18. `/departments` — Departments (`DepartmentsPage.tsx`)
19. `/academic-years` — Academic Years (`AcademicYearsPage.tsx`)
20. `/sectors-programs` — Sectors & Programs (`SectorsProgramsPage.tsx`)
21. `/levels` — Levels (`LevelsPage.tsx`)
22. `/classes-groups` — Classes & Groups (`ClassesGroupsPage.tsx`)

#### Director & Administrative Pages
23. `/overview` (Director) — Director Dashboard (`DirectorOverviewPage.tsx` + `DirectorTaskCenter.tsx`)
24. `/overview` (Administrative) — Administrative Dashboard (`AdministrativeOverviewPage.tsx`)
25. `/overview` (Pedagogical) — Pedagogical Dashboard (`PedagogicalOverviewPage.tsx`)
26. `/overview` (Finance) — Finance Dashboard (`FinanceLogisticsOverviewPage.tsx`)
27. `/employees` — Employees Directory (`EmployeesPage.tsx`)
28. `/employee-management` — Employee Management (`EmployeeManagementPage.tsx`)
29. `/roles-permissions` — Roles & Permissions (`RolesPermissionsPage.tsx`)
30. `/access-control` — Access Control (`AccessControlPage.tsx`)
31. `/audit-activity` — Audit & Activity Log (`AuditActivityPage.tsx`)
32. `/school-profile` — School Profile (`SchoolProfilePage.tsx`)
33. `/archive` — Archive (`ArchivePage.tsx`)
34. `/staff-attendance` — Staff Attendance (`StaffAttendancePage.tsx`)
35. `/documents` — Documents Management (`DocumentsPage.tsx`)
36. `/activity-history` — Activity History (`ActivityHistoryPage.tsx`)
37. `/settings/academic` — Academic Settings (`AcademicSettingsPage.tsx`)
38. `/settings/school` — School Settings (`SchoolSettingsPage.tsx`)
39. `/settings/system` — System Settings (`SystemSettingsPage.tsx`)

#### Finance & Operations Pages
40. `/financial-reports` — Financial Reports (`FinancialReportsPage.tsx`)
41. `/cash-registers` — Cash Registers (`CashRegistersPage.tsx`)
42. `/payment-registers` — Payment Registers & Tariffs (`PaymentRegistersPage.tsx`)
43. `/payments` — Payments (`PaymentsPage.tsx`)
44. `/expenses` — Expenses (`ExpensesPage.tsx`)
45. `/transport` — Transport (`TransportPage.tsx`)
46. `/inventory` — Inventory (`InventoryPage.tsx`)

#### Shared Communication, Operations & Settings
47. `/trips-outings` — Trips & Outings (`TripsOutingsPage.tsx`)
48. `/accidents-incidents` — Accidents & Incidents (`AccidentsIncidentsPage.tsx`)
49. `/announcements` — Announcements (`AnnouncementsPage.tsx`)
50. `/notifications` — Notifications (`NotificationsPage.tsx`)
51. `/events` — Events (`EventsPage.tsx`)
52. `/meetings` — Meetings (`MeetingsPage.tsx`)
53. `/reports-analytics` — Reports & Analytics (`ReportsAnalyticsPage.tsx`)
54. `/settings/user` — User Settings (`UserSettingsPage.tsx`)

---

## 3. Reusable Component Inventory

- `FormDrawer` (`src/components/common/FormDrawer.tsx`) — Right-side modal drawer portal for forms
- `ConfirmDialog` (`src/components/common/ConfirmDialog.tsx`) — Modal dialog for destruction confirmation
- `FormField` / `FormSection` (`src/components/common/FormField.tsx`) — Standard form inputs, labels, errors
- `ActionMenu` (`src/components/common/ActionMenu.tsx`) — Dropdown actions menu for table/card rows
- `AppSidebar` / `SidebarBrand` / `SidebarGroup` / `SidebarItem` — Navigation sidebar primitives
- `TopBar` / `StatusBar` / `CommandPalette` — Header, status, and palette dialog primitives

---

## 4. Style Debt & Severity Classification

### 🔴 Critical Issues (Breaks system, layout, dark mode, build, or accessibility)
- **Token collision:** `theme.css` overrides 4px `--space-*` tokens with 1px compatibility aliases.
- **Build failures:** `tsc -b` fails on 15+ type errors across pages (`App.tsx`, `ArchivePage.tsx`, `MeetingsPage.tsx`, `SystemSettingsPage.tsx`, `AccessControlPage.tsx`).
- **Cascade overrides:** 600+ `!important` overrides in `design-system.css` and `AcademicYearsPage.css`.
- **Missing interactive states:** Buttons and row controls lack `:focus-visible`, disabled styles, or loading spinners.
- **Broken dark mode on pages:** Page backgrounds, text, and card surfaces use hard-coded `#ffffff`, `#111827`, `#f3f4f6`, breaking dark mode.

### 🟠 Major Issues (Visibly off-system or inconsistent)
- **Hard-coded hex colors in CSS:** 2,500+ hex codes in page CSS files (`MeetingsPage.css`, `AcademicYearsPage.css`, `ExpensesPage.css`, `parents.css`, `teachers.css`, `students.css`).
- **Inline style attributes:** 36 `style={{...}}` blocks in TSX files for widths, heights, colors, and gradients.
- **Typography inconsistencies:** Font sizes, line heights, and weights vary arbitrarily between 11px and 28px without token usage.
- **Missing empty/error/loading states:** Tables and cards render blank whitespace instead of standard skeletons or empty illustrations.

### 🟡 Minor Issues (Polish & cleanup)
- **Unused CSS selectors:** Legacy unused CSS classes in `index.css` and `design-system.css`.
- **Icon stroke inconsistencies:** Lucide icons missing standardized `size={16}` or `strokeWidth={2}` props.
- **Sub-optimal touch targets:** Action buttons smaller than 44x44px on mobile viewports.

---

## 5. Phase 2 Surgery Rules & Audit Approval

Surgery must proceed strictly page by page following the 5-step protocol (Examine -> Diagnose -> Operate -> Verify -> Lock). No page will be left half-done. `npm run build` must pass cleanly for every page marked FIXED/VERIFIED.
