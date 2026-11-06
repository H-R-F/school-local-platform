import {
  Archive, Award, Banknote, Bell, BookOpen, BriefcaseBusiness, Bus, Building2,
  CalendarCheck, CalendarDays, CalendarRange, ChartColumn, ChartNoAxesCombined,
  ClipboardCheck, ClipboardPenLine, Clock3, ContactRound, FileClock, FileText,
  GraduationCap, HandCoins, LayoutDashboard, Library, Megaphone, MessageSquare,
  NotebookTabs, Receipt, School, Settings, ShieldCheck, Stethoscope, Tags, Truck,
  UserCog, UserRoundCheck, Users, Wallet, Warehouse,
} from "lucide-react";
import type { NavigationGroup, StaffRole } from "../types/navigation";
const everyone: readonly StaffRole[] = ["director","administrative","pedagogical","finance"];
const academic: readonly StaffRole[] = ["director","administrative","pedagogical"];
const leadership: readonly StaffRole[] = ["director","administrative"];
const pedagogy: readonly StaffRole[] = ["director","pedagogical"];
const finance: readonly StaffRole[] = ["director","finance"];
const operations: readonly StaffRole[] = ["director","administrative","finance"];
export const navigation: readonly NavigationGroup[] = [
 {id:"overview",label:"Overview",collapsible:false,items:[{id:"overview.home",label:"Overview",icon:LayoutDashboard,route:"/overview",permission:"overview.view",roles:everyone}]},
 {id:"academic-management",label:"Academic Management",items:[
  {id:"academic.years",label:"Academic Years",icon:CalendarRange,route:"/academic-years",permission:"academic.structure.view",roles:academic},
  {id:"academic.programs",label:"Sectors & Programs",icon:Library,route:"/sectors-programs",permission:"academic.structure.view",roles:academic},
  {id:"academic.levels",label:"Levels",icon:Tags,route:"/levels",permission:"academic.structure.view",roles:academic},
  {id:"academic.classes",label:"Classes & Groups",icon:School,route:"/classes-groups",permission:"academic.structure.view",roles:academic},
  {id:"academic.subjects",label:"Subjects",icon:BookOpen,route:"/subjects",permission:"academic.structure.view",roles:academic},
  {id:"academic.departments",label:"Departments",icon:Building2,route:"/departments",permission:"academic.structure.view",roles:academic}]},
 {id:"people",label:"People",items:[
  {id:"people.students",label:"Students",icon:GraduationCap,route:"/students",permission:"people.students.view",roles:academic},
  {id:"people.parents",label:"Parents",icon:Users,route:"/parents",permission:"people.parents.view",roles:leadership},
  {id:"people.teachers",label:"Teachers",icon:ContactRound,route:"/teachers",permission:"people.teachers.view",roles:academic},
  {id:"people.employees",label:"Employees",icon:BriefcaseBusiness,route:"/employees",permission:"people.employees.view",roles:leadership},
  {id:"people.roles",label:"Roles & Permissions",icon:ShieldCheck,route:"/roles-permissions",permission:"people.roles.manage",roles:leadership}]},
 {id:"academic-operations",label:"Academic Operations",items:[
  {id:"operations.grades",label:"Grades & Validation",icon:ClipboardCheck,route:"/grades-validation",permission:"pedagogy.grades.view",roles:pedagogy},
  {id:"operations.exams",label:"Examinations",icon:NotebookTabs,route:"/examinations",permission:"pedagogy.exams.view",roles:pedagogy},
  {id:"operations.courses",label:"Courses & Exercises",icon:BookOpen,route:"/courses-exercises",permission:"pedagogy.content.view",roles:pedagogy},
  {id:"operations.timetable",label:"Timetables & Schedules",icon:CalendarDays,route:"/timetables",permission:"pedagogy.schedule.view",roles:academic},
  {id:"operations.reports",label:"Pedagogical Reports",icon:ChartNoAxesCombined,route:"/pedagogical-reports",permission:"pedagogy.reports.view",roles:pedagogy},
  {id:"operations.badges",label:"Badges & Recognition",icon:Award,route:"/badges-recognition",permission:"pedagogy.recognition.manage",roles:pedagogy}]},
 {id:"student-affairs",label:"Student Affairs",items:[
  {id:"affairs.student-attendance",label:"Student Attendance",icon:UserRoundCheck,route:"/student-attendance",permission:"student.attendance.view",roles:academic},
  {id:"affairs.staff-attendance",label:"Staff Attendance",icon:Clock3,route:"/staff-attendance",permission:"staff.attendance.view",roles:leadership},
  {id:"affairs.documents",label:"Documents",icon:FileText,route:"/documents",permission:"documents.view",roles:leadership},
  {id:"affairs.rankings",label:"Class Rankings",icon:ChartColumn,route:"/class-rankings",permission:"student.analytics.view",roles:pedagogy},
  {id:"affairs.risk",label:"Student Risk",icon:Stethoscope,route:"/student-risk",permission:"student.analytics.view",roles:pedagogy},
  {id:"affairs.activities",label:"Student Activities",icon:CalendarCheck,route:"/student-activities",permission:"student.activities.view",roles:academic}]},
 {id:"finance",label:"Finance",items:[
  {id:"finance.registers",label:"Payment Registers",icon:Receipt,route:"/payment-registers",permission:"finance.registers.view",roles:finance},
  {id:"finance.payments",label:"Payments",icon:Banknote,route:"/payments",permission:"finance.payments.manage",roles:finance},
  {id:"finance.balances",label:"Student Balances & Services",icon:Wallet,route:"/student-balances",permission:"finance.balances.view",roles:finance},
  {id:"finance.expenses",label:"Expenses",icon:HandCoins,route:"/expenses",permission:"finance.expenses.manage",roles:finance},
  {id:"finance.reports",label:"Financial Reports",icon:ChartNoAxesCombined,route:"/financial-reports",permission:"finance.reports.view",roles:finance}]},
 {id:"logistics",label:"Logistics",items:[
  {id:"logistics.transport",label:"Transport",icon:Bus,route:"/transport",permission:"logistics.transport.manage",roles:finance},
  {id:"logistics.trips",label:"Trips & Outings",icon:Truck,route:"/trips-outings",permission:"logistics.trips.manage",roles:operations},
  {id:"logistics.incidents",label:"Accidents & Incidents",icon:ClipboardPenLine,route:"/accidents-incidents",permission:"logistics.incidents.manage",roles:operations},
  {id:"logistics.inventory",label:"Inventory",icon:Warehouse,route:"/inventory",permission:"logistics.inventory.manage",roles:finance}]},
 {id:"communication",label:"Communication",items:[
  {id:"communication.announcements",label:"Announcements",icon:Megaphone,route:"/announcements",permission:"communication.view",roles:everyone},
  {id:"communication.notifications",label:"Notifications",icon:Bell,route:"/notifications",permission:"communication.view",roles:everyone},
  {id:"communication.events",label:"Events",icon:CalendarDays,route:"/events",permission:"communication.view",roles:everyone},
  {id:"communication.meetings",label:"Meetings",icon:MessageSquare,route:"/meetings",permission:"communication.meetings.manage",roles:leadership},
  {id:"communication.history",label:"Activity History",icon:FileClock,route:"/activity-history",permission:"activity.history.view",roles:leadership}]},
 {id:"reports",label:"Reports & Analytics",items:[{id:"reports.analytics",label:"Reports & Analytics",icon:ChartNoAxesCombined,route:"/reports-analytics",permission:"reports.view",roles:everyone}]},
 {id:"administration",label:"Administration",items:[
  {id:"administration.employees",label:"Employee Management",icon:UserCog,route:"/employee-management",permission:"employees.manage",roles:leadership},
  {id:"administration.access",label:"Access Control",icon:ShieldCheck,route:"/access-control",permission:"access.manage",roles:["director"]},
  {id:"administration.audit",label:"Audit & Activity",icon:FileClock,route:"/audit-activity",permission:"audit.view",roles:["director"]},
  {id:"administration.school",label:"School Profile",icon:Building2,route:"/school-profile",permission:"school.profile.manage",roles:["director"]}]},
 {id:"archive",label:"Archive",items:[{id:"archive.home",label:"Archive",icon:Archive,route:"/archive",permission:"archive.view",roles:["director"]}]},
 {id:"settings",label:"Settings",items:[
  {id:"settings.school",label:"School Settings",icon:Settings,route:"/settings/school",permission:"settings.school.manage",roles:["director"]},
  {id:"settings.academic",label:"Academic Settings",icon:GraduationCap,route:"/settings/academic",permission:"settings.academic.manage",roles:academic},
  {id:"settings.system",label:"System Settings",icon:ShieldCheck,route:"/settings/system",permission:"settings.system.manage",roles:["director"]},
  {id:"settings.user",label:"User Settings",icon:UserCog,route:"/settings/user",permission:"settings.user.manage",roles:everyone}]}
];