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
 {id:"overview",label:"Vue d’ensemble",collapsible:false,items:[{id:"overview.home",label:"Vue d’ensemble",icon:LayoutDashboard,route:"/overview",permission:"overview.view",roles:everyone}]},
 {id:"academic-management",label:"Gestion académique",items:[
  {id:"academic.years",label:"Années scolaires",icon:CalendarRange,route:"/academic-years",permission:"academic.structure.view",roles:academic},
  {id:"academic.programs",label:"Filières et programmes",icon:Library,route:"/sectors-programs",permission:"academic.structure.view",roles:academic},
  {id:"academic.levels",label:"Niveaux",icon:Tags,route:"/levels",permission:"academic.structure.view",roles:academic},
  {id:"academic.classes",label:"Classes et groupes",icon:School,route:"/classes-groups",permission:"academic.structure.view",roles:academic},
  {id:"academic.subjects",label:"Matières",icon:BookOpen,route:"/subjects",permission:"academic.structure.view",roles:academic},
  {id:"academic.departments",label:"Départements",icon:Building2,route:"/departments",permission:"academic.structure.view",roles:academic}]},
 {id:"people",label:"Personnel et élèves",items:[
  {id:"people.students",label:"Élèves",icon:GraduationCap,route:"/students",permission:"people.students.view",roles:academic},
  {id:"people.parents",label:"Parents",icon:Users,route:"/parents",permission:"people.parents.view",roles:leadership},
  {id:"people.teachers",label:"Enseignants",icon:ContactRound,route:"/teachers",permission:"people.teachers.view",roles:academic},
  {id:"people.employees",label:"Employés",icon:BriefcaseBusiness,route:"/employees",permission:"people.employees.view",roles:leadership},
  {id:"people.roles",label:"Rôles et autorisations",icon:ShieldCheck,route:"/roles-permissions",permission:"people.roles.manage",roles:leadership}]},
 {id:"academic-operations",label:"Activités pédagogiques",items:[
  {id:"operations.grades",label:"Notes et validation",icon:ClipboardCheck,route:"/grades-validation",permission:"pedagogy.grades.view",roles:pedagogy},
  {id:"operations.exams",label:"Examens",icon:NotebookTabs,route:"/examinations",permission:"pedagogy.exams.view",roles:pedagogy},
  {id:"operations.courses",label:"Cours et exercices",icon:BookOpen,route:"/courses-exercises",permission:"pedagogy.content.view",roles:pedagogy},
  {id:"operations.timetable",label:"Emplois du temps",icon:CalendarDays,route:"/timetables",permission:"pedagogy.schedule.view",roles:academic},
  {id:"operations.reports",label:"Rapports pédagogiques",icon:ChartNoAxesCombined,route:"/pedagogical-reports",permission:"pedagogy.reports.view",roles:pedagogy},
  {id:"operations.badges",label:"Distinctions et récompenses",icon:Award,route:"/badges-recognition",permission:"pedagogy.recognition.manage",roles:pedagogy}]},
 {id:"student-affairs",label:"Vie scolaire",items:[
  {id:"affairs.student-attendance",label:"Présence des élèves",icon:UserRoundCheck,route:"/student-attendance",permission:"student.attendance.view",roles:academic},
  {id:"affairs.staff-attendance",label:"Présence du personnel",icon:Clock3,route:"/staff-attendance",permission:"staff.attendance.view",roles:leadership},
  {id:"affairs.documents",label:"Documents",icon:FileText,route:"/documents",permission:"documents.view",roles:leadership},
  {id:"affairs.rankings",label:"Classements des classes",icon:ChartColumn,route:"/class-rankings",permission:"student.analytics.view",roles:pedagogy},
  {id:"affairs.risk",label:"Suivi des élèves à risque",icon:Stethoscope,route:"/student-risk",permission:"student.analytics.view",roles:pedagogy},
  {id:"affairs.activities",label:"Activités des élèves",icon:CalendarCheck,route:"/student-activities",permission:"student.activities.view",roles:academic}]},
 {id:"finance",label:"Finances",items:[
  {id:"finance.reports",label:"Rapports financiers",icon:ChartNoAxesCombined,route:"/financial-reports",permission:"finance.reports.view",roles:finance},
  {id:"finance.registers",label:"Registres de paiement",icon:Receipt,route:"/cash-registers",permission:"finance.registers.view",roles:finance},
  {id:"finance.tariffs",label:"Tarification et frais",icon:Tags,route:"/payment-registers",permission:"finance.registers.view",roles:finance},
  {id:"finance.payments",label:"Paiements",icon:Banknote,route:"/payments",permission:"finance.payments.manage",roles:finance},
  {id:"finance.balances",label:"Soldes et services des élèves",icon:Wallet,route:"/student-balances",permission:"finance.balances.view",roles:finance},
  {id:"finance.expenses",label:"Dépenses",icon:HandCoins,route:"/expenses",permission:"finance.expenses.manage",roles:finance}]},
 {id:"logistics",label:"Logistique",items:[
  {id:"logistics.transport",label:"Transport",icon:Bus,route:"/transport",permission:"logistics.transport.manage",roles:finance},
  {id:"logistics.trips",label:"Sorties et excursions",icon:Truck,route:"/trips-outings",permission:"logistics.trips.manage",roles:operations},
  {id:"logistics.incidents",label:"Accidents et incidents",icon:ClipboardPenLine,route:"/accidents-incidents",permission:"logistics.incidents.manage",roles:operations},
  {id:"logistics.inventory",label:"Inventaire",icon:Warehouse,route:"/inventory",permission:"logistics.inventory.manage",roles:finance}]},
 {id:"communication",label:"Communication",items:[
  {id:"communication.announcements",label:"Annonces",icon:Megaphone,route:"/announcements",permission:"communication.view",roles:everyone},
  {id:"communication.notifications",label:"Notifications",icon:Bell,route:"/notifications",permission:"communication.view",roles:everyone},
  {id:"communication.events",label:"Événements",icon:CalendarDays,route:"/events",permission:"communication.view",roles:everyone},
  {id:"communication.meetings",label:"Réunions",icon:MessageSquare,route:"/meetings",permission:"communication.meetings.manage",roles:leadership},
  {id:"communication.history",label:"Historique des activités",icon:FileClock,route:"/activity-history",permission:"activity.history.view",roles:leadership}]},
 {id:"reports",label:"Rapports et analyses",items:[{id:"reports.analytics",label:"Rapports et analyses",icon:ChartNoAxesCombined,route:"/reports-analytics",permission:"reports.view",roles:everyone}]},
 {id:"administration",label:"Administration",items:[
  {id:"administration.employees",label:"Gestion des employés",icon:UserCog,route:"/employee-management",permission:"employees.manage",roles:leadership},
  {id:"administration.access",label:"Contrôle des accès",icon:ShieldCheck,route:"/access-control",permission:"access.manage",roles:["director"]},
  {id:"administration.audit",label:"Audit et activités",icon:FileClock,route:"/audit-activity",permission:"audit.view",roles:["director"]},
  {id:"administration.school",label:"Profil de l’établissement",icon:Building2,route:"/school-profile",permission:"school.profile.manage",roles:["director"]}]},
 {id:"archive",label:"Archives",items:[{id:"archive.home",label:"Archives",icon:Archive,route:"/archive",permission:"archive.view",roles:["director"]}]},
 {id:"settings",label:"Paramètres",items:[
  {id:"settings.school",label:"Paramètres de l’établissement",icon:Settings,route:"/settings/school",permission:"settings.school.manage",roles:["director"]},
  {id:"settings.academic",label:"Paramètres pédagogiques",icon:GraduationCap,route:"/settings/academic",permission:"settings.academic.manage",roles:academic},
  {id:"settings.system",label:"Paramètres système",icon:ShieldCheck,route:"/settings/system",permission:"settings.system.manage",roles:["director"]},
  {id:"settings.user",label:"Paramètres utilisateur",icon:UserCog,route:"/settings/user",permission:"settings.user.manage",roles:everyone}]}
];