# UI/UX Full-Body Audit — School Local Platform

**Audit date:** 2026-11-08  
**Repository:** `H-R-F/school-local-platform`  
**Audited ref:** `backup-before-removing-commits`  
**Audited commit:** `32c6f4a88e05c0d37961c75f382415427426946f`  
**Phase:** 1 — inventory and diagnosis only  
**Change boundary:** No application page, component, style, route, API, auth, permission, or business-logic code was changed for this audit.

## Executive diagnosis

The repository has a substantial, working staff-facing React application, but it is **not yet governed by one enforceable design system**. The strongest systemic defect is competing style layers: a large legacy global stylesheet, a token/theme stylesheet with compatibility aliases, a separate design-system stylesheet containing many overrides, and page-specific stylesheets with their own visual values.

The current code does not support the brief's claim that all parent, student, teacher, director, admin, finance, and IT-support portals already exist. The routed application currently models four staff roles only: director, administrative, pedagogical, and finance. The login is a staff demo sign-in. There are no separate parent/student/teacher/IT routes in the route table inspected.

This is a **source-level audit**. No browser rendering, automated accessibility scan, keyboard end-to-end test, visual regression, contrast calculation across all states, or production build was run. Findings below distinguish confirmed source facts from items that still require runtime verification.

## 1. Project inventory

### 1.1 Repository structure

The audited branch contains 157 tracked files in total, of which 145 are under `src/`. The frontend is React 19 + TypeScript + Vite, styled primarily with plain CSS; Tailwind v4 is installed. The package scripts expose `dev`, `build`, and `preview`; no test, Storybook, Playwright, Cypress, axe, or screenshot-regression script is configured in `package.json`.

Main application entry points:
- `src/main.tsx` — React mount, local font imports, global stylesheet imports.
- `src/App.tsx` — session/demo-user state, navigation, page dispatch, shell composition, preferences.
- `src/data/navigation.ts` — role/permission-aware navigation catalogue.
- `src/types/navigation.ts` — current staff role and permission types.
- `src/styles/tokens.css`, `src/styles/theme.css`, `src/design-system.css`, `src/index.css` — overlapping token and global style layers.
- `design-tokens.json` — design-token reference document.
- `src/services/` and `src/data/` — application data/service modules; not part of this styling repair unless a visual state cannot be represented without a business-logic change.

### 1.2 Route and page inventory

The route catalogue defines **49 navigation routes**, including `/overview`. The overview route renders four distinct role-specific dashboards, so the current authenticated staff UI contains 52 route/view combinations if those dashboard variants are counted separately (48 non-overview pages + 4 dashboard variants). A staff sign-in screen is shown before authentication.

#### Shared shell and authentication

| Screen | Source | Notes |
|---|---|---|
| Staff sign-in | `src/components/auth/StaffSignIn.tsx` | Demo authentication UI; password-recovery action displays an instruction message, not a reset workflow. |
| Sidebar | `src/components/AppSidebar.tsx` | Permission-filtered navigation, collapsible groups, compact mode. |
| Sidebar brand/group/item | `src/components/sidebar/SidebarBrand.tsx`, `SidebarGroup.tsx`, `SidebarItem.tsx` | Shared navigation subcomponents. |
| Top bar | `src/components/shell/TopBar.tsx` | Search entry, notifications entry, user menu. |
| Status bar | `src/components/shell/StatusBar.tsx` | Server/internet/backup/licence status indicators and popovers; some values explicitly demo. |
| Command palette | `src/components/shell/CommandPalette.tsx` | Global route search dialog. |
| Shell styles | `src/components/shell/shell.css`, `src/index.css`, `src/design-system.css` | Styles overlap across files. |

#### Director

Director has access to the full set of routes allowed by its effective permissions. Its overview variant is `DirectorOverviewPage`. Director-only screens:
- `/access-control` — `AccessControlPage`
- `/audit-activity` — `AuditActivityPage`
- `/school-profile` — `SchoolProfilePage`
- `/archive` — `ArchivePage`
- `/settings/school` — `SchoolSettingsPage`
- `/settings/system` — `SystemSettingsPage`

#### Administrative staff

The role type is `administrative`; its overview is `AdministrativeOverviewPage`. Its route access is controlled by the role arrays and permission catalogue in `src/data/navigation.ts` and the user's effective permissions. It shares academic structure, people, attendance, documents, operations, communication, settings and administration routes according to those declarations. It does **not** have a separate parent-facing or IT-support portal.

#### Pedagogical staff

The role type is `pedagogical`; its overview is `PedagogicalOverviewPage`. Pedagogical/academic screens include:
- `/academic-years` — `AcademicYearsPage`
- `/sectors-programs` — `SectorsProgramsPage`
- `/levels` — `LevelsPage`
- `/classes-groups` — `ClassesGroupsPage`
- `/subjects` — `SubjectsPage`
- `/departments` — `DepartmentsPage`
- `/students` — `StudentsPage`
- `/teachers` — `TeachersPage`
- `/grades-validation` — `GradesValidationPage`
- `/examinations` — `ExaminationsPage`
- `/courses-exercises` — `CoursesExercisesPage`
- `/timetables` — `TimetablesPage`
- `/pedagogical-reports` — `PedagogicalReportsPage`
- `/badges-recognition` — `BadgesRecognitionPage`
- `/student-attendance` — `StudentAttendancePage`
- `/class-rankings` — `ClassRankingsPage`
- `/student-risk` — `StudentRiskPage`
- `/student-activities` — `StudentActivitiesPage`

#### Finance staff

The role type is `finance`; its overview is `FinanceLogisticsOverviewPage`. Finance/logistics screens include:
- `/financial-reports` — `FinancialReportsPage`
- `/cash-registers` — `CashRegistersPage`
- `/payment-registers` — `PaymentRegistersPage`
- `/payments` — `PaymentsPage`
- `/student-balances` — `StudentBalancesPage`
- `/expenses` — `ExpensesPage`
- `/transport` — `TransportPage`
- `/inventory` — `InventoryPage`

#### Shared and cross-functional pages

The following are routed pages with role access controlled by the navigation catalogue:
- `/overview` — one of four role dashboards.
- `/parents` — `ParentsPage`
- `/employees` — `EmployeesPage`
- `/roles-permissions` — `RolesPermissionsPage`
- `/staff-attendance` — `StaffAttendancePage`
- `/documents` — `DocumentsPage`
- `/trips-outings` — `TripsOutingsPage`
- `/accidents-incidents` — `AccidentsIncidentsPage`
- `/announcements` — `AnnouncementsPage`
- `/notifications` — `NotificationsPage`
- `/events` — `EventsPage`
- `/meetings` — `MeetingsPage`
- `/activity-history` — `ActivityHistoryPage`
- `/reports-analytics` — `ReportsAnalyticsPage`
- `/employee-management` — `EmployeeManagementPage`
- `/settings/academic` — `AcademicSettingsPage`
- `/settings/user` — `UserSettingsPage`

#### Parent, student, teacher and IT-support portals — scope gap

The source type `StaffRole` is exactly `director | administrative | pedagogical | finance`. The current sign-in and `App.tsx` route dispatch do not expose distinct parent, student, teacher or IT-support roles/portals. There is a staff-facing teachers directory and student/parent records, but these are not the same as dedicated external portals. These missing product surfaces are **out of scope for this styling-only audit** and must not be silently created during Phase 2.

#### Authentication, error, empty and overlay screens

- One staff sign-in screen is present.
- MFA, password reset, invitation/activation and recovery routes were not found in the current route dispatch.
- An unmatched route falls through to a generic “Module en préparation” workspace placeholder. No dedicated 404/not-found screen was found.
- Route-level modals are not defined as separate routes. Page components may include drawers, dialogs, confirmation overlays, tabs and detail views. A full modal/drawer-by-modal inventory requires reading each page's TSX; this audit records them as embedded subviews to inventory during that page's Step A rather than claiming a complete overlay census now.
- No standalone offline queue, sync-conflict review or sync-progress route was found in the inspected shell structure.

### 1.3 Reusable component inventory

| Area | Reusable components / modules | Usage |
|---|---|---|
| Application shell | `AppSidebar`, `TopBar`, `StatusBar`, `CommandPalette` | Composed in `App.tsx` around authenticated staff routes. |
| Sidebar primitives | `SidebarBrand`, `SidebarGroup`, `SidebarItem` | Used by `AppSidebar`. |
| Dashboard | `DirectorTaskCenter`; role dashboard pages; dashboard data modules | Director task view and four role-specific overview pages. |
| Authentication | `StaffSignIn` | Unauthenticated state. |
| Navigation/data | `navigation`, `role-permissions`, `demo-accounts` | Route labels/icons/roles/permissions and demo staff data. |
| Domain page components | Page components listed in §1.2 | Each route owns its page-specific presentation; several have a paired CSS file while others use shared/global CSS. |
| Styling layers | `tokens.css`, `theme.css`, `index.css`, `design-system.css`, `shell.css`, page CSS files | Current cascade is distributed and partially duplicated. |

The route page components are not yet backed by a single canonical component library. No Storybook or component catalogue was found in package scripts/configuration. The exact use-site map for every low-level inline subcomponent is not available from the route map alone and will be captured as each page is examined.

## 2. Style-debt report

### 2.1 Confirmed global/token architecture defects

1. **Competing token sources — 🔴 Critical.** `src/styles/theme.css`, `src/styles/tokens.css`, `src/design-system.css`, and `src/index.css` overlap. `main.tsx` imports `theme.css`, then `index.css`, then `design-system.css`, making source order a material part of the design. This is not a clean single source of truth.
2. **Spacing token collision — 🔴 Critical.** `theme.css` first declares a 4px-based spacing scale and later redeclares the same `--space-1` through `--space-8` identifiers as 1px through 8px compatibility values. The semantic scale is therefore overwritten in the effective cascade. The file also declares many arbitrary numeric aliases (including 9px–30px and large layout values).
3. **Token palette bloat — 🟠 Major.** `theme.css` contains a large generated compatibility palette with hundreds of palette aliases, while page styles continue to embed literal colors. This hides rather than eliminates visual debt.
4. **Duplicate design rules — 🔴 Critical.** `index.css` contains repeated base/root declarations and repeated shell/auth/global component blocks. `design-system.css` contains extensive final/override sections and many `!important` declarations.
5. **Legacy aliases remain active — 🟠 Major.** The `--app-*`, `--color-*`, `--font-size-*`, `--space-*`, `--radius-*` and palette aliases overlap. It is not clear which namespace is canonical for each component.
6. **School-brand colors are injected at runtime — 🟠 Major.** `App.tsx` writes primary/secondary brand values to root custom properties. This is legitimate branding behavior, but must be preserved and mapped cleanly to semantic tokens during styling work.

### 2.2 Source scan measurements

These counts are exact for the named files and regular expressions below, not repository-wide totals. They are included as reproducible evidence, not as a claim that every source file has been exhaustively linted.

| File | Length | Hex literals | RGB/HSL functions | px/rem declarations | `!important` | Focus selectors | Disabled selectors | Dark selectors |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/design-system.css` | 47,291 chars | 171 | 64 | 148 | 588 | 20 | 7 | 32 |
| `src/index.css` | 206,201 chars | 4 | 0 | 519 | 3 | 19 | 19 | 0 |
| `src/styles/theme.css` | 51,872 chars | 1,513 | 9 | 2 | 4 | 0 | 0 | 2 |
| `src/components/shell/shell.css` | 17,082 chars | 8 | 2 | 128 | 0 | 2 | 0 | 0 |
| `src/components/meetings/MeetingsPage.css` | 6,971 chars | 83 | 0 | 102 | 0 | 0 | 0 | 0 |
| `src/components/academic-years/AcademicYearsPage.css` | 26,602 chars | 192 | 1 | 257 | 31 | 3 | 5 | 0 |
| `src/components/expenses/ExpensesPage.css` | 22,504 chars | 163 | 3 | 221 | 7 | 0 | 1 | 0 |
| `src/components/user-settings/UserSettingsPage.css` | 8,971 chars | 20 | 1 | 139 | 0 | 3 | 1 | 0 |
| `src/components/dashboard/DirectorOverviewPage.css` | 18,087 chars | 33 | 3 | 203 | 0 | 0 | 0 | 0 |
| `src/components/parents/parents.css` | 30,113 chars | 110 | 0 | 190 | 0 | 4 | 4 | 0 |
| `src/components/teachers/teachers.css` | 40,182 chars | 154 | 0 | 248 | 0 | 8 | 4 | 0 |
| `src/components/students/students.css` | 38,147 chars | 153 | 0 | 233 | 2 | 4 | 4 | 0 |

**Measurement interpretation:**
- A literal hex value is not automatically wrong (token definitions, semantic status values and theme palettes require literals); the defect is uncontrolled literals in page/component styles.
- The large `index.css` count reflects legacy global declarations and repeated styles, not a single page.
- Page stylesheets sampled contain many hard-coded colors and dimensions despite also referencing tokens.
- Dark selectors are absent in the sampled page stylesheets. This does not prove every page fails in dark mode, but it proves that dark-mode behavior is not locally explicit and must be checked against the actual cascade.
- Selector counts are not a substitute for interactive-state testing. A page may inherit a state globally, or lack it even if a selector exists elsewhere.

### 2.3 Defects by category and severity

| Severity | Defect | Evidence / impact |
|---|---|---|
| 🔴 Critical | Effective spacing tokens are overwritten by compatibility aliases | 4px scale is not reliable at runtime; layouts can vary unpredictably by source order. |
| 🔴 Critical | Global CSS and design-system CSS duplicate/override each other | High cascade complexity; local fixes can be silently overridden. |
| 🔴 Critical | `!important` is used as a broad styling mechanism | 588 occurrences in `design-system.css` alone; weakens predictable component ownership. |
| 🔴 Critical | No automated build/test/accessibility/visual regression command | Package scripts only expose dev/build/preview; regressions are not automatically caught. |
| 🔴 Critical | Dark mode has no demonstrated route-by-route verification | Root token support exists, but page-specific light literals and shell CSS have no dark selectors in sampled files. |
| 🟠 Major | Page stylesheets embed literal colors, sizes, radii and shadows | Confirmed in Meetings, Academic Years, Expenses, Director Overview, Parents, Teachers, Students and User Settings samples. |
| 🟠 Major | Typography scale is inconsistent | `theme.css` and `design-tokens.json` disagree (e.g. token doc uses 14px body desktop and 12px small; theme uses 14px small and 16px base, with many compatibility font-size aliases). |
| 🟠 Major | Sidebar/header/statusbar dimensions are not consistently tokenized | Global shell CSS contains 258px/248px sidebar assumptions and 60px top bar; design-token reference specifies 240–260px sidebar and 56–64px header, while sidebar overrides elsewhere change dimensions. |
| 🟠 Major | Offline states are partial and not consistently standardized | StatusBar reads browser connectivity and displays status copy; no common queued-operation/sync/conflict UI component is established. Do not invent backend sync behavior. |
| 🟠 Major | Empty/loading/error states vary by page and are not centrally enforced | No shared state-component catalogue or test harness exists. Each page requires examination. |
| 🟠 Major | Canonical buttons, inputs, cards and tables are not established as enforced reusable components | Page styles own their own patterns; no component library or Storybook is configured. |
| 🟠 Major | Mobile shell requirements are not met by evidence found | Existing CSS includes responsive breakpoints, but no dedicated 4–5 item mobile bottom-tab shell was found. |
| 🟠 Major | Role/product scope mismatch | Parent/student/teacher/IT-support portals in the brief are not represented in the current `StaffRole` type or routed app. |
| 🟡 Minor | Icon system is mostly Lucide React but needs consistency checks | `lucide-react` is the declared icon dependency and navigation uses Lucide icons; each page still needs stroke size/weight and decorative semantics checked. |
| 🟡 Minor | Some legacy compatibility aliases may be unused | Cannot safely label individual aliases/classes dead without repository-wide reference analysis. |
| 🟡 Minor | Generic unmatched-route placeholder is not a proper not-found experience | The fallback currently renders “Module en préparation”; no explicit 404 component was found. |

### 2.4 Interaction state and accessibility risks

- **Focus:** Global and local focus styles exist in some places, but coverage is uneven. Several sampled stylesheets have zero focus selectors. Inputs in the shell/auth use `outline: 0` or border-only focus-within behavior; these need component-specific visible focus validation.
- **Hover:** Hover styles are present in many components, but hover-only affordances must be checked for keyboard and touch parity.
- **Active/pressed:** No uniform active/pressed contract was identified across buttons and navigation controls.
- **Disabled:** Some selectors exist, but loading/disabled distinction and disabled contrast need per-control review.
- **Loading:** Sign-in has a submitting state. A consistent loading/skeleton pattern across data views was not found.
- **Empty:** Command palette has an empty result message. Per-page empty states need verification.
- **Error:** Sign-in has an alert. Form validation and data-load errors need per-page review.
- **Offline/queued:** Status bar reflects browser online/offline state, but there is no established shared offline/queued/conflict component.
- **Keyboard:** Command palette handles Escape and arrow keys, but its list items use clickable `li` elements rather than native buttons; focus management and modal focus trapping/return need review. TopBar menus/popovers need full keyboard semantics testing.
- **Contrast:** No repository-wide contrast audit was run. Several global semantic values use muted/tertiary colors; page-specific literal text colors are present. WCAG 2.1 AA cannot be claimed until every foreground/background pair and interactive state is measured.
- **Touch targets:** Shell controls and many page controls have dimensions below 44px in CSS samples (e.g. compact icon controls); mobile target compliance requires per-page measurements.
- **Motion:** A global reduced-motion rule exists, but page-specific transitions/animations need review for override and completeness.
- **Labels/ARIA:** Sign-in inputs have labels; topbar controls have labels; several dialogs have roles. Per-page forms, tables, drawers and icon-only controls still require inspection.

### 2.5 Tables, cards and forms

No enforced shared table/card/form primitive was found in the inspected application structure. Page-specific CSS and markup indicate independently implemented patterns. The audit cannot certify sticky headers, consistent row heights, hover, skeletons, empty states, inline validation, or canonical button variants across the app. These are page-by-page verification items, not assumed capabilities.

### 2.6 Dead CSS and duplicate components

- Confirmed duplicated/overlapping global rule blocks in `src/index.css`, `src/styles/theme.css` and `src/design-system.css`.
- Confirmed repeated sidebar rules and appended light/dark overrides in `design-system.css`.
- No safe dead-class deletion list is produced in Phase 1: proving a selector unused requires cross-referencing every JSX/TSX class and dynamic class construction. No styles are removed during this phase.
- No separate canonical component library is present. Page-level dialogs/drawers may be repeated implementations, but duplicates must be proven by comparing markup/behavior before replacing anything.
- Icons are predominantly Lucide React; no other icon package is declared. Emoji/text icons or inline SVGs still need a page-level audit.

## 3. Design-system contract review

The current `design-tokens.json` is a useful starting reference, but it is not yet the effective single source of truth.

| Concern | Current state | Required Phase 2 direction |
|---|---|---|
| Color | JSON has light and partial dark palettes; CSS has multiple overlapping palettes and aliases | Establish semantic CSS variables for light/dark, map school brand variables into semantic action tokens. |
| Spacing | JSON uses 4px base; CSS aliases override the same names with 1px increments | Restore a collision-free 4px scale and use explicit semantic aliases only when justified. |
| Typography | JSON and CSS scale differ; many arbitrary font-size aliases exist | One type scale, weights, line heights and font families. |
| Radius/shadow | JSON and CSS values differ; legacy aliases remain | One semantic radius and elevation scale. |
| Components | No canonical component package/catalogue | Define and document shared primitives before migrating page-specific patterns. |
| Dark mode | Partial root token support and a small number of dark selectors | Use theme tokens for all surfaces, text, borders, status and interactive states; verify each page. |
| Offline | Browser connectivity and demo status labels exist | Style only existing real states; record missing backend states as blockers rather than inventing them. |

## 4. Phase 2 order and page inventory lock

The sequence is:
1. Shared shell.
2. Authentication pages.
3. Parent/student pages (none currently implemented as external portals; do not create).
4. Teacher pages (no teacher portal; staff directory only).
5. Director/admin pages.
6. Finance pages.
7. IT support pages (none currently implemented).
8. Settings, profile, error and empty states.

The detailed tracker in `PROGRESS.md` is the authoritative page-by-page checklist. All pages begin as `NOT STARTED`. No page is marked fixed or verified based on this source audit.

## 5. Blockers and scope constraints

See `BLOCKERS.md` for items that require product/backend clarification or business-logic changes. The Phase 1 audit does not alter these.

## 6. Verification limitations

The following have **not** been performed:
- `npm run build` / TypeScript check.
- Browser rendering or screenshot capture.
- Responsive viewport testing.
- Dark-mode visual inspection.
- Keyboard-only end-to-end navigation.
- WCAG contrast calculations on rendered states.
- Screen-reader testing.
- Automated accessibility or visual regression tests.
- Full modal/drawer census across every page.

Accordingly, no route is marked `VERIFIED` in `PROGRESS.md`. The next action is user review of this inventory and tracker. Phase 2 does not begin until approval.


---

## Phase 2 addendum — shared shell surgery (2026-11-08)

**Approval:** User approved Phase 2.  
**Patient:** Shared application shell.  
**Source status:** FIXED.  
**Verification status:** NOT VERIFIED — runtime checks blocked (see `BLOCKERS.md`).

### Confirmed repairs

- Replaced the duplicated shell stylesheet with a single token-driven `src/components/shell/shell.css`.
- Moved shell stylesheet loading to the end of the global stylesheet import sequence in `src/main.tsx`.
- Removed the legacy dark sidebar rule block and appended competing sidebar light/dark override block from `src/design-system.css`.
- Added semantic dark-mode tokens and `--ds-color-on-action`; added shell layout and 44px control-target tokens.
- Updated `design-tokens.json` and created `design-system.md` to document the current token contract.
- Improved accessible names for collapsed navigation and the school identity mark.
- Added keyboard navigation and focus handling for the account menu.
- Added focus entry, containment and return behavior for the command palette.
- Added disclosure semantics and Escape focus return for status details.
- Clarified that server, backup and licence values are simulated; the Internet state is browser-reported.
- No route, permission, authentication, API, database or business logic was changed.

### Source-level verification performed

- Re-fetched all modified shell files after commits.
- Confirmed the canonical shell stylesheet is imported once from `src/main.tsx`, after the global styles.
- Confirmed the old hard-coded dark sidebar gradient and prior literal sidebar color fallback are absent from the updated shell files.
- Confirmed the canonical shell stylesheet contains no literal hex colors.
- Confirmed shell CSS includes visible focus, active, disabled, reduced-motion and responsive rules.
- Confirmed the command palette exposes a modal dialog and listbox/combobox semantics.
- Confirmed the status bar identifies demo infrastructure data in its details.

### Verification not performed

No local checkout/runtime was available to execute `npm run build`, TypeScript compilation, browser rendering, responsive viewport checks, keyboard-only end-to-end testing, screen-reader testing, axe, or rendered WCAG contrast measurements. Therefore the shell is **not marked VERIFIED**, and no subsequent patient has been started.
