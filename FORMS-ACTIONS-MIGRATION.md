# Forms & Actions Migration Checklist

Shared foundation is available in `src/components/ui` and globally styled through `src/styles/form-system.css` and `src/styles/action-system.css`.

## Shared primitives

- [x] `FormDrawer` — portal-based right drawer, responsive, focus handling, Escape/backdrop close, body scroll lock.
- [x] `ConfirmDialog` — separate confirmation surface with destructive variant and loading state.
- [x] `FormSection` — shared section structure.
- [x] `FormField` — shared label/help/error structure.
- [x] `ActionMenu` — shared row action menu.
- [ ] Shared reusable DetailsPanel / DetailsDialog.
- [ ] Shared form input wrappers for project-wide controlled field conventions.
- [ ] Automated tests for shared primitives.

## Module migration

The shared components are infrastructure only. A module is complete only after all relevant create/edit workflows, destructive actions, permissions, validation, loading/error feedback, and data refresh behavior are migrated and tested.

| Module | Form migration | Action migration | Verification |
|---|---|---|---|
| Academic years | [ ] | [ ] | [ ] |
| Sectors & programmes | [ ] | [ ] | [ ] |
| Levels | [ ] | [ ] | [ ] |
| Classes & groups | [ ] | [ ] | [ ] |
| Subjects | [ ] | [ ] | [ ] |
| Departments | [ ] | [ ] | [ ] |
| Students | [ ] | [ ] | [ ] |
| Parents | [ ] | [ ] | [ ] |
| Teachers | [ ] | [ ] | [ ] |
| Employees | [ ] | [ ] | [ ] |
| Employee management | [ ] | [ ] | [ ] |
| Access control | [ ] | [ ] | [ ] |
| Roles & permissions | [ ] | [ ] | [ ] |
| School profile | [ ] | [ ] | [ ] |
| School settings | [ ] | [ ] | [ ] |
| Academic settings | [ ] | [ ] | [ ] |
| System settings | [ ] | [ ] | [ ] |
| User settings | [ ] | [ ] | [ ] |
| Grades validation | [ ] | [ ] | [ ] |
| Examinations | [ ] | [ ] | [ ] |
| Courses & exercises | [ ] | [ ] | [ ] |
| Timetables | [ ] | [ ] | [ ] |
| Student attendance | [ ] | [ ] | [ ] |
| Staff attendance | [ ] | [ ] | [ ] |
| Documents | [ ] | [ ] | [ ] |
| Student activities | [ ] | [ ] | [ ] |
| Student risk | [ ] | [ ] | [ ] |
| Class rankings | [ ] | [ ] | [ ] |
| Payment registers | [ ] | [ ] | [ ] |
| Cash registers | [ ] | [ ] | [ ] |
| Payments | [ ] | [ ] | [ ] |
| Student balances | [ ] | [ ] | [ ] |
| Expenses | [ ] | [ ] | [ ] |
| Financial reports | [ ] | [ ] | [ ] |
| Inventory | [ ] | [ ] | [ ] |
| Transport | [ ] | [ ] | [ ] |
| Trips & outings | [ ] | [ ] | [ ] |
| Accidents & incidents | [ ] | [ ] | [ ] |
| Announcements | [ ] | [ ] | [ ] |
| Notifications | [ ] | [ ] | [ ] |
| Events | [ ] | [ ] | [ ] |
| Meetings | [ ] | [ ] | [ ] |
| Archive | [ ] | [ ] | [ ] |
| Dashboards & task center | [ ] | [ ] | [ ] |
| Activity history / audit | [ ] | [ ] | [ ] |
| Reports & analytics | [ ] | [ ] | [ ] |

## Rules

- Do not mark a module complete after a CSS-only change.
- Keep existing service/repository calls, API contracts, role checks, validation and business rules.
- Use `FormDrawer` for create/edit workflows; keep simple confirmations in `ConfirmDialog`.
- Keep read-only details separate from edit mode.
- Search, filters, inline quick edits and sign-in flows remain in their appropriate interaction pattern.
- Run typecheck/build and test representative create/edit/delete workflows before marking a module verified.
- Work only on `backup-before-removing-commits`; do not modify `main`.
