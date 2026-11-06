import type { Permission, StaffRole } from "../types/navigation";
const director: Permission[] = [
"overview.view","academic.structure.view","academic.structure.manage",
"people.students.view","people.parents.view","people.teachers.view","people.employees.view","people.roles.manage",
"pedagogy.grades.view","pedagogy.exams.view","pedagogy.content.view","pedagogy.schedule.view","pedagogy.reports.view","pedagogy.recognition.manage",
"student.attendance.view","staff.attendance.view","documents.view","student.analytics.view","student.activities.view",
"finance.registers.view","finance.payments.manage","finance.balances.view","finance.expenses.manage","finance.reports.view",
"logistics.transport.manage","logistics.trips.manage","logistics.incidents.manage","logistics.inventory.manage",
"communication.view","communication.meetings.manage","activity.history.view","reports.view","employees.manage","access.manage","audit.view","school.profile.manage","archive.view",
"settings.school.manage","settings.academic.manage","settings.system.manage","settings.user.manage"];
export const roleDefaultPermissions: Record<StaffRole, readonly Permission[]> = {
 director,
 administrative:["overview.view","academic.structure.view","academic.structure.manage","people.students.view","people.parents.view","people.teachers.view","people.employees.view","people.roles.manage","student.attendance.view","staff.attendance.view","documents.view","student.activities.view","logistics.trips.manage","logistics.incidents.manage","communication.view","communication.meetings.manage","activity.history.view","reports.view","employees.manage","settings.academic.manage","settings.user.manage"],
 pedagogical:["overview.view","academic.structure.view","people.students.view","people.teachers.view","pedagogy.grades.view","pedagogy.exams.view","pedagogy.content.view","pedagogy.schedule.view","pedagogy.reports.view","pedagogy.recognition.manage","student.attendance.view","student.analytics.view","student.activities.view","communication.view","reports.view","settings.academic.manage","settings.user.manage"],
 finance:["overview.view","finance.registers.view","finance.payments.manage","finance.balances.view","finance.expenses.manage","finance.reports.view","logistics.transport.manage","logistics.trips.manage","logistics.incidents.manage","logistics.inventory.manage","communication.view","reports.view","settings.user.manage"]
};
export function getDevelopmentPermissions(role: StaffRole): readonly Permission[] { return roleDefaultPermissions[role]; }