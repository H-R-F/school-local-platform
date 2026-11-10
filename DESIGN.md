# School Management Application — Design Foundation

**Product:** School Local App  
**Applies to:** the school-management workspace served at `http://localhost:5173`  
**Primary routes:** `/login`, `/overview`, and the school-management routes rendered by `SchoolApp`  
**Canonical implementation references:** `design-system.md`, `design-tokens.json`, `src/styles/tokens.css`, `src/components/shell/shell.css`

> This document is exclusively for the School Management Application. It does not define or redesign the Central Platform workspace at `/platform`. The two workspaces may share the React repository, but they are distinct products with separate purposes, navigation, shells, and visual responsibilities.

This is the product-level design contract for all future School App page design and implementation. Read it together with `design-system.md`; when a page-specific prompt conflicts with this foundation, preserve the existing application shell and follow this foundation unless the user explicitly requests a product-wide change.

---

## 1. Product purpose and design principles

The School Management Application is a desktop-first, local-first system used by school directors, administrative staff, pedagogical teams, finance staff, teachers, and other authorized personnel to run the daily operations of an individual school.

The interface must help staff complete real work quickly and confidently: managing students and families, academic structures, teaching activities, attendance, finance, documents, communication, reports, and school settings.

Design for these principles:

1. **Operational clarity:** users should immediately understand where they are, what the current data means, and what action is available.
2. **Efficiency over decoration:** prioritize scanning, direct manipulation, clear defaults, and short task flows.
3. **Trust and accuracy:** present records, amounts, dates, permissions, and statuses consistently. Never imply that a demo value is live or persisted.
4. **Familiarity:** reuse the established shell, component patterns, tokens, and interaction conventions.
5. **Accessibility:** readable contrast, keyboard access, visible focus, meaningful labels, and predictable behavior.
6. **School identity:** each installation represents its own school through configurable branding, without introducing SaaS-provider branding.
7. **Resilient local operation:** normal school workflows must not depend on an internet connection.

Avoid generic SaaS dashboard styling, marketing-page patterns, decorative analytics, excessive cards, gratuitous gradients, and visual novelty that makes routine work harder.

## 2. Product boundary — mandatory

The School App and Central Platform are not interchangeable.

- The School App owns school operations and school-level records.
- The Central Platform owns platform-level administration and oversight.
- School App pages must not use Central Platform navigation, labels, admin concepts, or monitoring layouts.
- Do not redesign, restyle, or alter the Central Platform when working on a School App page.
- Do not add Central Platform navigation items to the School App's school-operation navigation.
- Preserve the existing workspace boundary and route behavior. The `/platform` route is outside this document's scope.

When implementing a School App page, inspect its existing route, page component, shared shell, tokens, and neighboring pages first. Reuse established patterns instead of creating a parallel design system.

## 3. White-label school identity

The interface is configured for an individual school. Its identity must be driven by the existing school profile and branding configuration.

Configurable identity includes:

- School logo.
- School name and optional location or subtitle.
- Primary brand color.
- Secondary brand color.
- Accent color where supported by the existing branding model.

Rules:

- Consume the existing dynamic school-brand variables, including `--school-primary`; never hardcode a particular school's brand color into shared components.
- Keep the application chrome neutral so different school palettes remain legible.
- Use the school primary color for focused brand moments and primary actions, not as a background for every panel or section.
- Semantic success, warning, error, and information colors must retain their meaning and must not be replaced by school branding.
- Validate contrast for configured brand colors against text and control surfaces.
- Do not add the Central Platform or SaaS provider logo, name, or marketing identity to the School App.

## 4. Visual language

### Overall character

Professional, calm, practical, and approachable. The product should feel like dependable school operations software, not a consumer social app or an enterprise infrastructure control plane.

### Surfaces and color

Use the existing semantic tokens from `src/styles/tokens.css`:

- Default page canvas: `--ds-color-surface-default`.
- Raised surfaces: `--ds-color-surface-raised`.
- Sunken or subdued surfaces: `--ds-color-surface-sunken`.
- Primary and secondary text: `--ds-color-text-primary`, `--ds-color-text-secondary`.
- Borders: `--ds-color-border-default`, `--ds-color-border-strong`.
- Actions: `--ds-color-action-primary` and its hover/pressed variants.
- Semantic states: success, warning, error, and info tokens and their subtle backgrounds.

Prefer neutral page backgrounds, white or raised working surfaces, restrained borders, and subtle elevation. Use color to communicate hierarchy, interaction, and status—not as decoration.

### Typography

Use the locally bundled Inter variable font for Latin text and IBM Plex Sans Arabic for Arabic-script content. Use JetBrains Mono only for technical identifiers or tabular values that benefit from fixed-width alignment.

Respect the established typography tokens and hierarchy. Keep tables and dense operational content comfortably readable. Avoid tiny metadata, excessive font-weight variation, all-caps labels used everywhere, and oversized dashboard metrics.

### Spacing, shape, and elevation

Use the established 4px-based spacing scale, radius tokens, and shadow tokens. Keep alignment and spacing consistent across page headers, toolbars, forms, tables, drawers, and empty states.

Use restrained corner radii and shadows. Do not introduce a new radius or elevation language for an individual page.

## 5. Application shell and navigation

The School App's existing shell is the visual and behavioral frame for all school routes.

Preserve:

- Existing sidebar, top bar, and status bar.
- Existing school identity area and dynamic branding.
- Existing role- and permission-filtered navigation.
- Existing active-route, expanded-group, collapsed-sidebar, and navigation-search behavior.
- Existing account/session controls, command palette, and notification entry points.
- Existing page content offset and responsive shell behavior.

Do not redraw the shell as part of an individual page task. Shell-wide changes require an explicit request.

Navigation should remain task-oriented and understandable to staff with different levels of technical experience. Keep the current French labels and information architecture unless the user explicitly requests a language or navigation change. Navigation visibility must continue to follow the existing role and permission model; hiding a menu item is not a substitute for authorization in the underlying application.

## 6. Page composition

Use a consistent page structure:

1. Breadcrumb or contextual location when useful.
2. Clear page title.
3. One concise sentence explaining the page's purpose when needed.
4. A primary action that is easy to identify.
5. Secondary actions grouped without competing with the primary action.
6. Search, filters, and view controls close to the data they affect.
7. Main working area: usually a readable table, structured list, focused form, or task-specific workspace.
8. Supporting summary, guidance, or status only when it helps the current task.

Use the available width efficiently at desktop sizes around 1440px. Do not force every page into a dashboard layout. Use KPI summaries only when they answer an operational question. Avoid redundant cards around information that is already clear in a table or list.

Responsive behavior must preserve task completion. At narrower widths, stack controls deliberately, allow tables to scroll when necessary, and keep primary actions reachable. Do not simply shrink desktop layouts until labels and data become unreadable.

## 7. Reusable component conventions

Prefer existing shared components and established page patterns.

### Tables and data lists

- Use clear column labels and consistent alignment.
- Align dates, amounts, counts, and other numeric values predictably.
- Keep row actions discoverable without overcrowding every row.
- Provide meaningful loading, empty, error, and filtered-no-results states.
- Keep search and filters connected to the displayed result set.
- Support horizontal overflow on narrow screens without clipping essential actions.
- Do not hide important data solely to make a screenshot look cleaner.

### Forms

- Use the shared form system and validation conventions.
- Group fields by meaning and keep labels persistent.
- Provide concise helper text for fields that need explanation.
- Show validation close to the affected field and preserve entered values after correctable errors.
- Distinguish required and optional fields.
- Use the established right-side drawer for multi-field create/edit forms on desktop.
- Keep drawer header and action footer visible while form content scrolls.
- Use full-screen drawers on small screens.
- Keep read-only detail views and confirmation prompts as centered dialogs when that is the existing pattern; do not turn every dialog into a drawer.

### Buttons and actions

- Use clear verb-led labels that describe the result.
- One visually primary action per local action group.
- Use secondary and destructive treatments consistently.
- Disable unavailable actions with an understandable reason where possible.
- Destructive actions require a confirmation step and clear consequences.
- Never render controls that look interactive but do nothing.

### Status indicators

- Use semantic status tokens and concise labels.
- Do not communicate status by color alone; pair color with text or a recognizable icon.
- Keep the same status meaning and treatment consistent across modules.
- Distinguish a real system state from illustrative/demo data.

### Feedback and overlays

- Use inline feedback for field-level issues and non-blocking confirmations for routine success.
- Use dialogs only when a decision or confirmation is required.
- Keep overlays focused, keyboard accessible, and easy to dismiss when safe.
- Restore focus to the invoking control after closing a dialog or drawer.

## 8. Interaction and behavior

A page is not complete because it looks finished. Every visible control must have a clear, implemented behavior appropriate to the current application capabilities.

- Search must filter the relevant records.
- Filters, sorting, pagination, tabs, and view toggles must update the displayed content.
- Create and edit actions must validate input and produce a visible result.
- Row actions must act on the selected record.
- Reset and clear controls must restore the expected default state.
- Loading, success, error, empty, and disabled states must be represented.
- Keyboard users must be able to reach and operate every interactive control.
- Avoid unnecessary multi-step flows, modal stacking, and confirmation prompts for harmless actions.

If a backend capability is not connected, implement a clearly labelled functional local/demo behavior only when appropriate. Do not claim that demo changes are persisted, synchronized, backed up, or sent to a central service when they are not.

## 9. Local-first and connectivity model

The School App must remain useful on the school's local network without internet access. Internet connectivity is not a prerequisite for normal school operations.

Keep these concepts distinct in the UI:

1. **Application availability:** whether the local School App is reachable and usable.
2. **Local server/database status:** whether the school's local application services and data store are available.
3. **Internet connectivity:** whether this installation can reach the public internet.
4. **Central service connectivity:** whether an optional central service can currently be reached, when such a service is configured.

Do not collapse these into one vague “online/offline” status.

Rules:

- Loss of internet must not be presented as loss of local application availability.
- Explain which capability is affected when a connection is unavailable.
- Do not block ordinary local work solely because an external service is unreachable.
- Distinguish local saving from synchronization or remote backup.
- Show the last successful synchronization or backup time only when the application has reliable data for it.
- If status values are demonstrations, label them as such.

## 10. Roles, privacy, and sensitive school data

The interface serves multiple staff roles, each with different responsibilities and permissions. Preserve the existing role model and permission checks.

- Show users only the actions and data their role is authorized to access.
- Avoid exposing sensitive student, parent, staff, financial, or health-related information in unnecessary summaries or notifications.
- Use confirmation and clear context for bulk changes, exports, deletion, and other high-impact operations.
- Make the selected school year, class, student, or record context clear when it affects an action.
- Avoid ambiguous destructive actions and irreversible workflows without explicit confirmation.

Visual hiding is not security. Authorization must remain enforced by the application's actual permission and data-access layers.

## 11. Accessibility and localization

- Use semantic headings, landmarks, buttons, labels, tables, and dialog semantics.
- Give icon-only buttons accessible names.
- Maintain visible `:focus-visible` states.
- Do not rely on hover alone.
- Ensure text and controls meet WCAG AA contrast expectations in the rendered theme and school-brand combinations.
- Keep interactive targets comfortably usable; follow the established 44px shell-control target.
- Respect reduced-motion preferences.
- Support keyboard navigation and logical focus order.
- Preserve French as the current default UI language.
- Support Arabic and right-to-left layout where the existing application supports it; use logical CSS properties and avoid breaking mixed-direction identifiers, dates, and numbers.
- Keep date, number, currency, and academic-year formats consistent with the active locale and school configuration.

## 12. Motion

Motion is functional feedback, not decoration.

Use short, restrained transitions for navigation, hover/focus, drawers, and dialogs. Respect `prefers-reduced-motion`. Avoid parallax, looping decorative animation, large page transitions, and motion that delays routine tasks.

## 13. Design anti-patterns

Do not introduce:

- A new sidebar, header, or status bar for a single page.
- Central Platform navigation or platform-operator concepts in the School App.
- SaaS-provider branding in the school workspace.
- Hardcoded school brand colors.
- Semantic status colors that change meaning between pages.
- A card for every field, table, or small data group.
- Decorative charts with no operational purpose.
- Large gradients, excessive shadows, glassmorphism, or ornamental backgrounds.
- Tiny typography, low-contrast metadata, or dense unstructured forms.
- Unnecessary tabs, nested navigation, modal stacking, or multi-step workflows.
- Fake live metrics, fake connection indicators, or misleading persistence claims.
- Inert buttons, nonfunctional filters, or placeholder actions presented as complete features.

## 14. Implementation checklist

Before finishing any School App design or page implementation, verify:

- [ ] The work is on a School App route and does not change the `/platform` workspace.
- [ ] The existing shell and navigation are preserved.
- [ ] Existing semantic tokens and school-brand variables are used.
- [ ] The page follows the current French UI and localization conventions.
- [ ] The main task and primary action are immediately clear.
- [ ] Tables, forms, filters, and actions follow shared component conventions.
- [ ] All visible controls have real behavior or are clearly marked unavailable/demo.
- [ ] Loading, empty, error, success, and destructive states are considered.
- [ ] Role and permission behavior is preserved.
- [ ] Local operation is not confused with internet or central-service connectivity.
- [ ] Keyboard access, focus, contrast, and reduced motion are respected.
- [ ] Responsive layouts remain usable and preserve important information.
- [ ] No project-wide migration or compliance claim is made without verifying it.

## 15. Source-of-truth hierarchy

When deciding how to implement a design:

1. This `DESIGN.md` defines the School App product-level design foundation and boundaries.
2. `design-system.md` defines the detailed visual tokens, shell contract, and shared component styling conventions.
3. `src/styles/tokens.css` is the canonical CSS token source.
4. `design-tokens.json` is the machine-readable token reference.
5. Existing shared components and neighboring School App pages define established implementation patterns.

If these sources disagree, do not silently invent a new system. Identify the conflict and make the smallest coherent correction, keeping the School App and Central Platform separate.
