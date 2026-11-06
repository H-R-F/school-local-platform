import type { LucideIcon } from "lucide-react";
export type StaffRole = "director" | "administrative" | "pedagogical" | "finance";
export type Permission =
  | "overview.view" | "academic.structure.view" | "academic.structure.manage"
  | "people.students.view" | "people.parents.view" | "people.teachers.view" | "people.employees.view" | "people.roles.manage"
  | "pedagogy.grades.view" | "pedagogy.exams.view" | "pedagogy.content.view" | "pedagogy.schedule.view" | "pedagogy.reports.view" | "pedagogy.recognition.manage"
  | "student.attendance.view" | "staff.attendance.view" | "documents.view" | "student.analytics.view" | "student.activities.view"
  | "finance.registers.view" | "finance.payments.manage" | "finance.balances.view" | "finance.expenses.manage" | "finance.reports.view"
  | "logistics.transport.manage" | "logistics.trips.manage" | "logistics.incidents.manage" | "logistics.inventory.manage"
  | "communication.view" | "communication.meetings.manage" | "activity.history.view" | "reports.view"
  | "employees.manage" | "access.manage" | "audit.view" | "school.profile.manage" | "archive.view"
  | "settings.school.manage" | "settings.academic.manage" | "settings.system.manage" | "settings.user.manage";
export interface AuthenticatedSidebarUser {
  id: string; displayName: string; initials: string; role: StaffRole;
  /** Complete effective permission set; [] means no navigation access. */
  permissions: readonly Permission[];
}
export interface SchoolBranding {
  name: string; location?: string; logoUrl?: string; primaryColor: string; secondaryColor?: string;
  currency?: string; academicYear?: string; academicYearStart?: string;
}
export interface NavigationItem {
  id: string; label: string; icon: LucideIcon; route: string; permission: Permission; roles: readonly StaffRole[];
}
export interface NavigationGroup {
  id: string; label: string; items: readonly NavigationItem[]; collapsible?: boolean;
}