# School Local Platform — Design System

**Version:** 1.1.0  
**Canonical token source:** `src/styles/tokens.css`  
**Machine-readable reference:** `design-tokens.json`  
**Shell stylesheet:** `src/components/shell/shell.css`

This document describes the canonical visual contract. The shared shell now consumes the `--ds-*` token namespace. Page-level migration is not complete; legacy aliases remain in `theme.css` and `design-system.css` until each page is treated in order.

## 1. Token rules

- Use semantic `--ds-color-*` variables for colors.
- Use the `--ds-space-*` 4px scale for spacing.
- Use `--ds-font-*`, `--ds-line-*` and `--ds-weight-*` for typography.
- Use `--ds-radius-*` and `--ds-shadow-*` for shape and elevation.
- Use layout tokens for shell dimensions and minimum control targets.
- Do not add literal color, spacing, typography, radius or shadow values to component/page styles. If a semantic token is missing, add it to `tokens.css` and `design-tokens.json` first.
- School branding remains dynamic through `--school-primary`; it must not be replaced by a hard-coded school color.

## 2. Color tokens

### Light theme

| Token | Value | Usage |
|---|---|---|
| `--ds-color-surface-default` | `#F8FAFC` | Page canvas |
| `--ds-color-surface-raised` | `#FFFFFF` | Sidebar, header, menus, cards |
| `--ds-color-surface-sunken` | `#F1F5F9` | Search fields, muted controls |
| `--ds-color-text-primary` | `#0F172A` | Main text |
| `--ds-color-text-secondary` | `#475569` | Secondary text |
| `--ds-color-text-tertiary` | `#94A3B8` | Disabled/tertiary text |
| `--ds-color-border-default` | `#E2E8F0` | Standard borders |
| `--ds-color-border-strong` | `#CBD5E1` | Emphasized borders |
| `--ds-color-action-primary` | `#4F46E5` | Primary action and focus |
| `--ds-color-action-primary-hover` | `#4338CA` | Primary hover |
| `--ds-color-action-primary-pressed` | `#3730A3` | Primary pressed |
| `--ds-color-action-subtle` | `#E0E7FF` | Selected/active surfaces |
| `--ds-color-on-action` | `#FFFFFF` | Foreground on primary action |
| `--ds-color-success` | `#16A34A` | Success |
| `--ds-color-warning` | `#D97706` | Warning |
| `--ds-color-error` | `#DC2626` | Error |
| `--ds-color-info` | `#2563EB` | Informational state |

Each semantic status has a matching `*-subtle` background token.

### Dark theme

Dark values are declared for explicit `data-user-theme="dark"` and for system theme under `prefers-color-scheme: dark`.

| Token | Value |
|---|---|
| `--ds-color-surface-default` | `#111827` |
| `--ds-color-surface-raised` | `#1B2636` |
| `--ds-color-surface-sunken` | `#243247` |
| `--ds-color-text-primary` | `#E7EDF5` |
| `--ds-color-text-secondary` | `#AAB7C8` |
| `--ds-color-text-tertiary` | `#8492A5` |
| `--ds-color-border-default` | `#354357` |
| `--ds-color-border-strong` | `#526176` |
| `--ds-color-action-primary` | `#A5B4FC` |
| `--ds-color-action-primary-hover` | `#C7D2FE` |
| `--ds-color-action-primary-pressed` | `#818CF8` |
| `--ds-color-action-subtle` | `#293653` |
| `--ds-color-on-action` | `#111827` |
| `--ds-color-success` | `#4ADE80` |
| `--ds-color-warning` | `#FBBF24` |
| `--ds-color-error` | `#F87171` |
| `--ds-color-info` | `#60A5FA` |

Dark status backgrounds are also provided by their `*-subtle` tokens. The shell must not depend on the operating system preference when the user explicitly selected light or dark.

## 3. Spacing, typography and shape

### Spacing scale

| Token | Value |
|---|---:|
| `--ds-space-1` | 4px |
| `--ds-space-2` | 8px |
| `--ds-space-3` | 12px |
| `--ds-space-4` | 16px |
| `--ds-space-5` | 20px |
| `--ds-space-6` | 24px |
| `--ds-space-8` | 32px |
| `--ds-space-10` | 40px |
| `--ds-space-12` | 48px |
| `--ds-space-16` | 64px |

### Typography

| Token | Value |
|---|---|
| `--ds-font-sans` | Inter, Geist, system UI |
| `--ds-font-mono` | JetBrains Mono, Geist Mono |
| `--ds-font-display` | 32px / 40px |
| `--ds-font-h1` | 24px / 32px |
| `--ds-font-h2` | 20px / 28px |
| `--ds-font-body-desktop` | 14px / 21px |
| `--ds-font-body-mobile` | 16px / 24px |
| `--ds-font-small` | 12px / 18px |
| `--ds-weight-regular` | 400 |
| `--ds-weight-medium` | 500 |
| `--ds-weight-semibold` | 600 |

### Radius and elevation

- Radius: `--ds-radius-sm` 4px, `--ds-radius-md` 6px, `--ds-radius-lg` 8px, `--ds-radius-xl` 12px, `--ds-radius-full` 9999px.
- Elevation: `--ds-shadow-sm`, `--ds-shadow-md`, `--ds-shadow-lg`.

## 4. Shell layout tokens

| Token | Value |
|---|---:|
| `--ds-sidebar-width` | 264px |
| `--ds-sidebar-collapsed-width` | 72px |
| `--ds-header-height` | 60px |
| `--ds-statusbar-height` | 44px |
| `--ds-sidebar-brand-height` | 76px |
| `--ds-sidebar-footer-height` | 68px |
| `--ds-control-height` | 44px |
| `--ds-focus-offset` | 2px |
| `--ds-motion-fast` | 150ms ease |

## 5. Shared shell component contract

### Sidebar

- Fixed navigation rail; expanded and collapsed widths derive from layout tokens.
- School logo/name/location are sourced from the school profile.
- Navigation visibility continues to come from the existing role and permission model.
- Active route, hover, keyboard focus, collapsed labels, group expansion, empty search and sign-out states are represented.
- The primary collapse control exposes its controlled navigation region and shortcut.
- The selected route is exposed with `aria-current="page"`.

### Top bar

- Fixed 60px header aligned to the active sidebar width.
- Search trigger, notifications entry and account menu retain existing routes/actions.
- Account menu supports Escape, ArrowUp/ArrowDown, Home and End; focus moves into the menu and returns on Escape.

### Status bar

- Fixed status region aligned to the sidebar width.
- Internet state reads `navigator.onLine`.
- Server, backup, licence and version values remain explicit demonstration data until connected services exist.
- Disclosure buttons expose expanded state and controlled detail regions. Escape closes the detail and restores focus.

### Command palette

- Modal dialog with labelled search combobox and listbox options.
- ArrowUp/ArrowDown and Enter select results; Escape closes.
- Focus enters the search input, remains within the dialog while tabbing, and returns to the invoking element on close.
- Empty search results are announced as a non-option message.

## 6. Accessibility contract

- Use semantic HTML and accessible names for icon-only controls.
- Every keyboard-operable control must show a visible `:focus-visible` ring.
- Hover is supplementary; no function may depend on hover alone.
- Active, disabled and selected states must be distinguishable without color alone.
- Minimum interactive target: 44×44px for shell controls.
- Respect `prefers-reduced-motion` and the user's reduced-motion setting.
- Dialogs must manage focus entry, containment and return.
- Check contrast on actual rendered theme/brand combinations before marking a page `VERIFIED`.

## 7. Stylesheet ownership and import order

`src/main.tsx` imports global styles in this order:

1. `src/styles/theme.css` — existing application compatibility variables and user preference theme values.
2. `src/styles/tokens.css` — canonical semantic design tokens and light/dark values.
3. `src/index.css` — legacy baseline and page styles.
4. `src/design-system.css` — shared page-level design rules and remaining legacy compatibility styles.
5. `src/components/shell/shell.css` — canonical final owner for shared shell selectors.

Do not add new sidebar/header/statusbar/command-palette rules to `index.css` or `design-system.css`. Modify `shell.css` and token files instead.

## 8. Migration status

The shared shell has been migrated to `--ds-*` tokens. The wider application has not. Page-specific CSS still contains hard-coded values and legacy aliases; those are addressed page-by-page under `PROGRESS.md`. Do not claim project-wide token compliance until every page is verified.


## 9. Additional shell sizing and interaction tokens

The canonical shell stylesheet contains no literal hex/RGB/HSL colors and no literal component spacing, font-size, radius or shadow values. Remaining viewport units are used for viewport-aware layout and media-query breakpoints.

Additional semantic sizing tokens in `src/styles/tokens.css` include:

- `--ds-border-width`, `--ds-focus-width`
- `--ds-brand-mark-size`, `--ds-avatar-size`, `--ds-nav-icon-size`
- `--ds-nav-indicator-width`, `--ds-indicator-dot-size`
- `--ds-nav-count-min-width`, `--ds-nav-count-height`
- `--ds-collapsed-nav-item-size`
- `--ds-menu-min-width`, `--ds-topbar-search-max-width`, `--ds-user-label-max-width`
- `--ds-status-label-max-width`, `--ds-status-popover-max-width`
- `--ds-command-dialog-max-width`, `--ds-command-dialog-max-height`, `--ds-command-input-height`, `--ds-command-empty-height`
- `--ds-page-content-max-width`
- `--ds-letter-spacing-label`, `--ds-letter-spacing-overline`, `--ds-letter-spacing-none`, `--ds-line-height-tight`
- `--ds-disabled-opacity`, `--ds-active-filter`
- `--ds-layer-*` stacking tokens (control, banner, topbar, sidebar, menu, popover, dialog, skip link) and `--ds-motion-reduced-duration`

These additions are also represented in `design-tokens.json`. Viewport breakpoints and viewport-relative dimensions remain in media queries because CSS custom properties are not consistently supported as media-query conditions.


### Sector and program page layout tokens

- `--ds-content-reading-width`: maximum line width for short page descriptions.
- `--ds-sector-panel-viewport-offset`: viewport space reserved above/below the sector list panel.

- `--ds-sector-sidebar-min-width` and `--ds-sector-sidebar-max-width`: desktop split-view sidebar bounds.
- `--ds-sector-panel-mobile-max-height` and `--ds-sector-list-mobile-max-height`: compact responsive sector-list bounds.
- `--ds-program-table-min-width`: minimum readable width for the horizontally scrollable program table on narrow screens.
