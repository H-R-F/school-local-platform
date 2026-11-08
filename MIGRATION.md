# UI Migration Log

## 2026-11-08 — Shared shell consolidation

### Removed or replaced

1. **Removed the duplicate sidebar component block from `src/design-system.css`.**
   - Removed the legacy "Application navigation" rule block that forced a dark sidebar and contained `!important` declarations.
   - Removed the appended sidebar refresh/light-dark override block, including duplicated light and dark palette rules.
   - Reason: shell styles had multiple competing owners, making theme behavior dependent on specificity and import order.

2. **Replaced `src/components/shell/shell.css` with the canonical shell stylesheet.**
   - Replaced duplicated topbar/statusbar/command-palette blocks with one token-driven rule set.
   - Consolidated expanded/collapsed sidebar, content offsets, responsive layout, focus states, reduced motion and print behavior.
   - Reason: the prior file repeated the same component blocks with differing hard-coded dimensions, colors and aliases.

3. **Moved the shell stylesheet import from `src/App.tsx` to `src/main.tsx`.**
   - Shell CSS now loads after theme, baseline and design-system CSS.
   - Removed duplicate nested imports of `theme.css` and `tokens.css` from `design-system.css`; the entry point now imports each global layer explicitly.
   - Reason: predictable cascade ownership. No page rendering or route dispatch logic was changed.

### Components retained

No application component, route, permission, API call, authentication flow or database contract was deleted or replaced.

### Component behavior/accessibility refinements

- Sidebar branding mark now has an accessible graphic role and name.
- Collapsed sidebar links now retain accessible names.
- Sidebar collapse button references its controlled navigation region.
- Account menu supports keyboard navigation and Escape.
- Command palette manages focus entry, containment and return.
- Status disclosures expose expanded/controlled-region semantics and return focus on Escape.
- Status popover copy now identifies simulated infrastructure values accurately.

### Token additions

- Added semantic dark-mode action/status palette and on-action foreground.
- Added shell layout tokens for sidebar width, collapsed width, header height, statusbar height, brand/footer heights and control radius.
- Raised the shell control target height to 44px.
- Updated `design-tokens.json` to match the CSS token reference.

### Verification boundary

Source was re-read after changes and checked for duplicate shell stylesheet imports, stale dark-sidebar gradient declarations, literal hex values in the canonical shell stylesheet, conflict markers and shell focus/disabled rules.

No browser rendering, build, TypeScript compilation, screen-reader test, keyboard end-to-end test or rendered contrast audit was possible in this editing session. Therefore the shared shell is marked `FIXED`, not `VERIFIED`. No next page has been started.


## 2026-11-08 — Filières et programmes content simplification

- Removed the three summary KPI cards from this page; they repeated counts already visible in the sector list and program list.
- Removed long sector descriptions and cycle badges from each compact list row; the selected sector keeps its name, code, status and program count.
- Simplified program table columns from seven to five. Program code now appears under the program name; the redundant description and separate code columns were removed from the table.
- Shortened page helper copy, headings, search placeholder, and action labels.
- Removed the now-unused `CyclePill` helper and `cycleShort` formatter after removing the redundant cycle badge from the sector list.
- Business data, local repository operations, validation, permissions, CRUD actions and status rules were not changed.

- Removed unused page CSS for the deleted summary cards, cycle pills, sector-list descriptions/footer, and redundant program-description column; removed their stale mobile rules as well.
- Kept the cycle and status filters, local data source, forms, detail views, confirmation flows, and permission checks intact.


## 2026-11-08 — Filières et programmes visual redesign

- Replaced the previous page-specific stylesheet with a new token-driven visual system: clearer academic header, split filière/programme workspace, quieter filters, selectable sector rows, simplified programme table, refined menus, form dialogs, confirmation dialogs, and empty/loading/error states.
- Added a dedicated `sp-page--redesign` scope so the new page styling is isolated from other modules.
- Removed the page's dependency on the school-branding inline color style; action colors now follow the canonical action tokens and remain consistent in light and dark themes.
- Removed this page from the shared generic page normalization selectors so the redesigned typography, spacing, and background are not overridden by broad `!important` rules.
- Kept the application shell responsible for sidebar offset and page padding.
- No repository calls, permission checks, data structures, validation rules, or CRUD/status workflows were changed.


## 2026-11-08 — Sector/programme forms moved to a right-side drawer

- Create and edit flows for both filières and programmes now open in the same right-side drawer pattern instead of a centered modal.
- The drawer has a sticky heading/close control and sticky bottom action row; content scrolls inside the drawer.
- At narrow mobile widths, the drawer becomes a full-width sheet.
- Read-only detail views and status confirmation prompts remain centered dialogs because they are not data-entry forms.
- Form submit handlers, validation, permissions, and repository calls remain unchanged.
\n\n## 2026-11-08 — Project-wide form drawer convention\n\n### Replaced presentation\n\n- Added `src/styles/form-drawers.css` as the single global presentation layer for existing create/edit forms.\n- Any existing modal/overlay containing a form now opens as a right-side drawer, including forms nested in dialog sections and forms used as the dialog itself.\n- Drawer width, backdrop, border, surface, focus treatment, control height, animation and mobile full-width behavior consume design tokens.\n- Read-only detail dialogs and confirmation prompts without forms intentionally remain centered; this is a form presentation rule, not a rule that every dialog must slide in.\n\n### Preserved\n\n- No page components, event handlers, form validation, API/repository calls, permissions, routes or data contracts were changed.\n- The global selector is based on the presence of a form within the existing overlay structure; no new form or workflow was added.\n\n### Verification boundary\n\n- Import order and selector coverage were reviewed from source. Browser rendering, responsive checks, build and keyboard testing are pending because this session has no local runtime/browser. Do not mark the route inventory VERIFIED until those checks are run.\n