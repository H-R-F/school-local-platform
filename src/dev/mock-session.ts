import { getDevelopmentPermissions } from "../data/role-permissions";
import type { AuthenticatedSidebarUser, StaffRole } from "../types/navigation";
/** Development-only identity. Replace with the real authenticated session when available. */
const developmentRole: StaffRole = "director";
export const mockSidebarUser: AuthenticatedSidebarUser = {
 id: "demo-user", displayName: "Admin Benali", initials: "AB",
 role: developmentRole, permissions: getDevelopmentPermissions(developmentRole)
};