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
