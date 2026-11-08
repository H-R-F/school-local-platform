# UI Repair Blockers

## Active blockers for shared-shell verification

### B-001 — No local build or browser execution in this editing environment
- **Severity:** Major (verification blocker)
- **Area:** Shared shell
- **Evidence:** The available repository connection can read and commit source files, but does not provide a checked-out working tree, npm runtime, browser, screenshot capture, or accessibility runner.
- **Impact:** Cannot honestly claim TypeScript/build success, rendered light/dark correctness, responsive behavior, WCAG contrast compliance, keyboard end-to-end success, or 44px rendered target compliance.
- **Required resolution:** Run `npm ci` and `npm run build` in a local/CI checkout, then test the shared shell in browser at desktop, tablet and mobile sizes in light, dark and system themes. Run keyboard-only and axe/WCAG checks.
- **Status:** OPEN.

### B-002 — School brand foreground contrast is configurable
- **Severity:** Major (theme/accessibility verification)
- **Area:** Sidebar logo/avatar/active indicator
- **Evidence:** `App.tsx` passes school profile primary and secondary colors to CSS custom properties. The color can vary per school.
- **Impact:** A fixed foreground cannot be proven WCAG AA against every arbitrary school primary color.
- **Required resolution:** Validate allowed school-brand colors and choose a contrast-safe foreground at the branding boundary, or constrain primary color selection to accessible combinations. This may require product/business-rule clarification; do not change branding validation during this visual-only repair.
- **Status:** OPEN; no validation logic changed.

## Known product/backend boundaries (not introduced by this repair)

### B-003 — Infrastructure indicators are partly demonstration data
- **Severity:** Major
- **Area:** Status bar
- **Evidence:** `src/config/system-status.ts` explicitly defines server, backup, licence, queued notification and version values as demo values. Only the Internet indicator reads browser state.
- **Impact:** Real server health, backup state, licence lease and sync queue cannot be verified or styled as real operational states yet.
- **Required resolution:** Connect these indicators to their existing/approved backend contracts when that work is in scope. This repair changed only explanatory copy and styling.
- **Status:** OPEN.

### B-004 — External role portals are absent from the current frontend route model
- **Severity:** Scope/product gap
- **Area:** Parent, student, teacher and IT support
- **Evidence:** Current `StaffRole` and route inventory include director, administrative, pedagogical and finance staff roles only.
- **Impact:** There are no parent/student/teacher/IT-support screens to audit or style.
- **Required resolution:** Treat these as separate product implementation scope; do not create them during the current styling-only pass.
- **Status:** OUT OF SCOPE for this repair.

### B-005 — MFA, password reset and dedicated 404 routes were not found
- **Severity:** Scope/product gap
- **Area:** Authentication and error handling
- **Evidence:** The inspected route dispatch exposes a staff sign-in screen and generic unmatched-route fallback only.
- **Impact:** These screens cannot be audited or styled because they are not implemented as routes.
- **Required resolution:** Keep as product scope. Do not invent authentication or routing behavior during the visual repair.
- **Status:** OUT OF SCOPE for this repair.

## Business-logic changes made

None. No API calls, authentication logic, permission checks, database schemas, or business rules were modified.
