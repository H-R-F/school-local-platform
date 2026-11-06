import {
  Activity, Archive, Award, Banknote, Bell, BookOpen, BriefcaseBusiness,
  CalendarDays, ChartNoAxesCombined, ClipboardCheck, ClipboardList, Clock3,
  FileClock, FileText, GraduationCap, HandCoins, LayoutDashboard, Library,
  Megaphone, MessageSquare, Package, Receipt, Settings, ShieldCheck, Stethoscope,
  Truck, Users, Wallet, Warehouse, UserCog, CalendarCheck, Bus, School,
  BookMarked, ClipboardPenLine, Tags, UserRoundCheck, Building2, ContactRound,
  ChartColumn, CalendarRange, BadgeCheck, NotebookTabs, FolderKanban, ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { NavigationGroup, StaffRole } from "../types/navigation";

const all: StaffRole[] = ["director", "administrative", "pedagogical", "finance"];
const leadership: StaffRole[] = ["director", "administrative"];
const academic: StaffRole[] = ["director", "administrative", "pedagogical"];
const pedagogy: StaffRole[] = ["director", "pedagogical"];
const finance: StaffRole[] = ["director", "finance"];
const operations: StaffRole[] = ["director", "administrative", "finance"];

export const roleLabels: Record<StaffRole, string> = {
  director: "Director",
  administrative: "Administrative Manager",
  pedagogical: "Pedagogical Manager",
  finance: "Finance & Logistics Manager",
};

export const navigation: NavigationGroup[] = [
  { label: "Overview", items: [{ label: "Overview", icon: LayoutDashboard, roles: all }] },
  {
    label: "Academic Management",
    items: [
      { label: "Academic Years", icon: CalendarRange, roles: academic },
      { label: "Sectors & Programs", icon: Library, roles: academic },
      { label: "Levels", icon: Tags, roles: academic },
      { label: "Classes & Groups", icon: School, roles: academic },
      { label: "Subjects", icon: BookOpen, roles: academic },
      { label: "Departments", icon: Building2, roles: academic },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Students", icon: GraduationCap, roles: academic },
      { label: "Parents", icon: Users, roles: leadership },
      { label: "Teachers", icon: ContactRound, roles: academic },
      { label: "Employees", icon: BriefcaseBusiness, roles: leadership },
      { label: "Roles & Permissions", icon: ShieldCheck, roles: ["director", "administrative"] },
    ],
  },
  {
    label: "Academic Operations",
    items: [
      { label: "Grades & Validation", icon: ClipboardCheck, roles: pedagogy },
      { label: "Examinations", icon: NotebookTabs, roles: pedagogy },
      { label: "Courses & Exercises", icon: BookMarked, roles: pedagogy },
      { label: "Timetables & Schedules", icon: CalendarDays, roles: academic },
      { label: "Pedagogical Reports", icon: ChartNoAxesCombined, roles: pedagogy },
      { label: "Badges & Recognition", icon: Award, roles: pedagogy },
    ],
  },
  {
    label: "Student Affairs",
    items: [
      { label: "Student Attendance", icon: UserRoundCheck, roles: academic },
      { label: "Staff Attendance", icon: Clock3, roles: leadership },
      { label: "Documents", icon: FileText, roles: leadership },
      { label: "Class Rankings", icon: ChartColumn, roles: pedagogy },
      { label: "Student Risk", icon: Stethoscope, roles: pedagogy },
      { label: "Student Activities", icon: CalendarCheck, roles: academic },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Payment Registers", icon: Receipt, roles: finance },
      { label: "Payments", icon: Banknote, roles: finance },
      { label: "Student Balances & Services", icon: Wallet, roles: finance },
      { label: "Expenses", icon: HandCoins, roles: finance },
      { label: "Financial Reports", icon: ChartNoAxesCombined, roles: finance },
    ],
  },
  {
    label: "Logistics",
    items: [
      { label: "Transport", icon: Bus, roles: finance },
      { label: "Trips & Outings", icon: Truck, roles: operations },
      { label: "Accidents & Incidents", icon: ClipboardPenLine, roles: operations },
      { label: "Inventory", icon: Warehouse, roles: finance },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Announcements", icon: Megaphone, roles: all },
      { label: "Notifications", icon: Bell, roles: all },
      { label: "Events", icon: CalendarDays, roles: all },
      { label: "Meetings", icon: MessageSquare, roles: leadership },
      { label: "Activity History", icon: FileClock, roles: ["director", "administrative"] },
    ],
  },
  {
    label: "Reports & Analytics",
    items: [{ label: "Reports & Analytics", icon: ChartNoAxesCombined, roles: all }],
  },
  {
    label: "Administration",
    items: [
      { label: "Employee Management", icon: UserCog, roles: leadership },
      { label: "Access Control", icon: ShieldCheck, roles: ["director"] },
      { label: "Audit & Activity", icon: Activity, roles: ["director"] },
      { label: "School Profile", icon: Building2, roles: ["director"] },
    ],
  },
  {
    label: "Archive",
    roles: ["director"],
    items: [{ label: "Archive", icon: Archive, roles: ["director"] }],
  },
  {
    label: "Settings",
    items: [
      { label: "School Settings", icon: Settings, roles: ["director"] },
      { label: "Academic Settings", icon: GraduationCap, roles: academic },
      { label: "System Settings", icon: ShieldCheck, roles: ["director"] },
      { label: "User Settings", icon: UserCog, roles: all },
    ],
  },
];