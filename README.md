# School Local Platform

Frontend-only desktop interface for school staff, maintained separately from the Laravel demo/reference repository.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Lucide React

## Run locally

```bash
npm install
npm run dev
```

## Sidebar

- One shared sidebar for Director, Administrative Manager, Pedagogical Manager, and Finance & Logistics Manager.
- Navigation definitions, role defaults, school branding, development session, and UI components are separated.
- Navigation visibility requires both an allowed role and the matching effective permission.
- Empty permission lists show no navigation items; Archive requires the Director role and `archive.view`.
- School name, optional logo, location, and primary/secondary colors are configurable.
- Active navigation follows the current URL path. Links use the planned route paths for the modules.
- Groups expand independently, and the group containing the active route opens automatically.
- Sidebar scrolls independently and supports expanded and icon-only modes with native tooltips.
- The development-only mock identity is isolated in `src/dev/mock-session.ts`.

## Important

This repository currently has no router, application pages, authentication, backend, or database. Sidebar anchors use the planned route paths and will resolve when those pages and routing are implemented. Replace the mock user with the authenticated session and its resolved permission set when available. Frontend visibility is not authorization: every protected route and operation must be enforced by the backend.

## Build

```bash
npm run build
```
