import { getDevelopmentPermissions } from "./role-permissions";
import type { AuthenticatedSidebarUser, StaffRole } from "../types/navigation";

export const demoPassword = "demo1234";

export const demoAccounts: readonly { email: string; user: AuthenticatedSidebarUser }[] = [
  { email: "director@northstar.edu", user: { id: "demo-director", displayName: "Amine Benali", initials: "AB", role: "director", permissions: getDevelopmentPermissions("director") } },
  { email: "admin@northstar.edu", user: { id: "demo-admin", displayName: "Salma Idrissi", initials: "SI", role: "administrative", permissions: getDevelopmentPermissions("administrative") } },
  { email: "pedagogy@northstar.edu", user: { id: "demo-pedagogy", displayName: "Youssef Amrani", initials: "YA", role: "pedagogical", permissions: getDevelopmentPermissions("pedagogical") } },
  { email: "finance@northstar.edu", user: { id: "demo-finance", displayName: "Meryem Alaoui", initials: "MA", role: "finance", permissions: getDevelopmentPermissions("finance") } }
];

export function authenticateDemoStaff(email: string, password: string): AuthenticatedSidebarUser | null {
  const account = demoAccounts.find(item => item.email === email.trim().toLowerCase());
  return account && password === demoPassword ? account.user : null;
}

export function getRoleLabel(role: StaffRole): string {
  const labels: Record<StaffRole, string> = {
    director: "Director",
    administrative: "Administrative Manager",
    pedagogical: "Pedagogical Manager",
    finance: "Finance & Logistics Manager"
  };
  return labels[role];
}