# UI audit — School Local Platform

**Scope:** current repository UI at the start of the design-system migration. This is a source-level audit, not a claim of completed browser/accessibility testing.

## Existing implementation

- Frontend: React 19 + TypeScript + Vite; styling is plain CSS with Tailwind v4 available. No component library or Storybook is configured in `package.json`.
- Shared entry points: `src/index.css`, `src/design-system.css`, and `src/styles/theme.css`. The design-system stylesheet imports the theme file; `main.tsx` imports the global CSS.
- Shell: `AppSidebar`, `TopBar`, `StatusBar` and command palette. Sidebar has expanded/collapsed states; top bar is fixed; status bar is fixed.
- Typography assets are bundled locally (Inter Variable, IBM Plex Sans Arabic and JetBrains Mono), which supports offline rendering.
- Existing permission-aware navigation is implemented from the current role and permission data. This refactor must not change it.

## Main inconsistencies and risks

1. **Competing token layers.** Both `theme.css` and `design-system.css` declare overlapping `--app-*`, color, radius, shadow and typography values. Later declarations override earlier ones, so the effective token source is not obvious.
2. **Token drift.** The theme declares a 4px spacing scale, then redeclares the same `--space-1` through `--space-8` names as 1px through 8px compatibility values. Radius aliases also mix compact per-pixel values with semantic names.
3. **Large legacy palette.** `theme.css` contains a generated compatibility palette with many individual hex aliases. This reduces literal duplication but does not establish a small semantic palette.
4. **Page-level hardcoding.** Page and shell styles still contain literal hex colors, pixel spacing, font sizes, radii and shadows. The recent Meetings stylesheet is a clear example: it defines its own control, surface, typography, border, status and overlay values.
5. **Shell layout differs from target spec.** The current desktop shell has a fixed sidebar and a 60px top bar. Sidebar width is currently controlled around 248px/72px rather than the target 240–260px/64px. The school identity appears in the sidebar; the top bar displays academic-year context, but a distinct term context is not evident in the inspected component.
6. **Mobile navigation is incomplete against the brief.** Current shell styles collapse/hide some top-bar content at narrow widths; a dedicated 4–5 item bottom tab bar and touch-first mobile shell were not found in the inspected shell files.
7. **Offline feedback is partial.** The status bar reads browser online/offline state and explains that local work continues. A consistent amber offline banner, queued-operation component, sync-progress UI and conflict-review surface are not established by the inspected shell.
8. **Dark mode is not complete.** Existing global styles set light color-scheme and contain many light-only page surfaces. A dark token set and component-level dark states are needed.
9. **Accessibility is uneven.** Global focus-visible styling and reduced-motion handling exist, and several controls have labels/ARIA. They need a systematic keyboard, contrast, zoom, form-error and touch-target review. No accessibility report or visual regression test setup was found in the inspected package scripts.
10. **No visual test/story tooling is configured.** The available scripts are development, TypeScript/Vite build and preview; no test or screenshot-regression script is present.

## Migration approach

- Establish `src/styles/tokens.css` and `design-tokens.json` as the canonical token definitions.
- Keep `theme.css` and existing `--app-*` names temporarily as compatibility shims. Do not mass-replace legacy styles in this first step.
- Migrate one vertical slice at a time, beginning with the shared shell and core controls. Preserve all behavior and permissions.
- Treat offline indicators as visual representations of existing state only; do not invent sync behavior.
- Add explicit browser tests and contrast checks before declaring WCAG 2.1 AA compliance.

## Current phase boundary

This commit establishes the canonical tokens and documents the audit. It does **not** claim that all legacy hard-coded values have already been removed, that dark mode is complete across all components, or that WCAG conformance has been verified.
