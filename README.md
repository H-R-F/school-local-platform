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

## Staff sign-in preview

The root route shows the staff sign-in screen. This is simulated frontend authentication only.

All demo accounts use password `demo1234`:

| Role | Email |
|---|---|
| Director | `director@northstar.edu` |
| Administrative Manager | `admin@northstar.edu` |
| Pedagogical Manager | `pedagogy@northstar.edu` |
| Finance & Logistics Manager | `finance@northstar.edu` |

Choose a demo account on the sign-in page to fill the email and password. The selected account determines the staff identity, role, and permission-filtered sidebar. The demo session is remembered in local storage and can be cleared with Sign out.

## Important

This repository has no backend, database, or real authentication yet. Demo credentials are public and must never be used as real security. The role and permissions are resolved from local demo data only. When a backend is added, replace this demo flow with server-side credential verification and a secure session. Frontend visibility is not authorization: every protected route and operation must be enforced by the backend.

## Build

```bash
npm run build
```
