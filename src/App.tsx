import { useCallback, useEffect, useState } from "react";
import { AppSidebar } from "./components/AppSidebar";
import { CommandPalette } from "./components/shell/CommandPalette";
import { StatusBar } from "./components/shell/StatusBar";
import { TopBar } from "./components/shell/TopBar";
import "./components/shell/shell.css";
import { navigation } from "./data/navigation";
import { systemStatus } from "./config/system-status";
import { StaffSignIn } from "./components/auth/StaffSignIn";
import { DirectorOverviewPage } from "./components/dashboard/DirectorOverviewPage";
import { AdministrativeOverviewPage } from "./components/dashboard/AdministrativeOverviewPage";
import { PedagogicalOverviewPage } from "./components/dashboard/PedagogicalOverviewPage";
import { FinanceLogisticsOverviewPage } from "./components/dashboard/FinanceLogisticsOverviewPage";
import { AcademicYearsPage } from "./components/academic-years/AcademicYearsPage";
import { SectorsProgramsPage } from "./components/sectors-programs/SectorsProgramsPage";
import { LevelsPage } from "./components/levels/LevelsPage";
import { ClassesGroupsPage } from "./components/classes-groups/ClassesGroupsPage";
import { SubjectsPage } from "./components/subjects/SubjectsPage";
import { DepartmentsPage } from "./components/departments/DepartmentsPage";
import { StudentsPage } from "./components/students/StudentsPage";
import { ParentsPage } from "./components/parents/ParentsPage";
import { TeachersPage } from "./components/teachers/TeachersPage";
import { EmployeesPage } from "./components/employees/EmployeesPage";
import { RolesPermissionsPage } from "./components/roles-permissions/RolesPermissionsPage";
import { GradesValidationPage } from "./components/grades-validation/GradesValidationPage";
import { ExaminationsPage } from "./components/examinations/ExaminationsPage";
import { CoursesExercisesPage } from "./components/courses-exercises/CoursesExercisesPage";
import { PedagogicalReportsPage } from "./components/pedagogical-reports/PedagogicalReportsPage";
import { BadgesRecognitionPage } from "./components/badges-recognition/BadgesRecognitionPage";
import { TimetablesPage } from "./components/timetables/TimetablesPage";
import { StudentAttendancePage } from "./components/student-attendance/StudentAttendancePage";
import { StaffAttendancePage } from "./components/staff-attendance/StaffAttendancePage";
import { DocumentsPage } from "./components/documents/DocumentsPage";
import { ClassRankingsPage } from "./components/class-rankings/ClassRankingsPage";
import { StudentRiskPage } from "./components/student-risk/StudentRiskPage";
import { StudentActivitiesPage } from "./components/student-activities/StudentActivitiesPage";
import { PaymentRegistersPage } from "./components/payment-registers/PaymentRegistersPage";
import { CashRegistersPage } from "./components/cash-registers/CashRegistersPage";
import { PaymentsPage } from "./components/payments/PaymentsPage";
import { StudentBalancesPage } from "./components/student-balances/StudentBalancesPage";
import { ExpensesPage } from "./components/expenses/ExpensesPage";
import { FinancialReportsPage } from "./components/financial-reports/FinancialReportsPage";
import { TransportPage } from "./components/transport/TransportPage";
import { TripsOutingsPage } from "./components/trips-outings/TripsOutingsPage";
import { AccidentsIncidentsPage } from "./components/accidents-incidents/AccidentsIncidentsPage";
import { InventoryPage } from "./components/inventory/InventoryPage";
import { AnnouncementsPage } from "./components/announcements/AnnouncementsPage";
import { NotificationsPage } from "./components/notifications/NotificationsPage";
import { schoolBranding } from "./config/school";
import { getDemoStaffById } from "./data/demo-accounts";
import type { AuthenticatedSidebarUser } from "./types/navigation";

function readSavedUser(): AuthenticatedSidebarUser | null {
  try {
    const id = window.localStorage.getItem("school-demo-user");
    return id ? getDemoStaffById(id) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState<AuthenticatedSidebarUser | null>(readSavedUser);
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || "/overview");
  const [collapsed, setCollapsed] = useState(() => {
    try { return window.localStorage.getItem("school-sidebar-collapsed") === "1"; } catch { return false; }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 1100px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1100px)");
    const onChange = (event: MediaQueryListEvent) => setNarrow(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  const sidebarCollapsed = collapsed || narrow;

  const updateCollapsed = useCallback((next: boolean) => {
    setCollapsed(next);
    try { window.localStorage.setItem("school-sidebar-collapsed", next ? "1" : "0"); } catch { /* storage may be unavailable */ }
  }, []);

  // Global shortcuts: Ctrl/Cmd+K opens search, Ctrl/Cmd+B toggles the sidebar.
  useEffect(() => {
    if (!user) return;
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "k") { event.preventDefault(); setSearchOpen((open) => !open); }
      else if (key === "b") { event.preventDefault(); updateCollapsed(!sidebarCollapsed); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [user, sidebarCollapsed, updateCollapsed]);

  // Per-page document title, skip-link target and scroll reset on navigation.
  useEffect(() => {
    if (!user) { document.title = `Connexion · ${schoolBranding.name}`; return; }
    const item = navigation.flatMap((group) => group.items).find((entry) => entry.route === currentPath);
    document.title = `${item?.label ?? "Espace du personnel"} · ${schoolBranding.name}`;
    window.scrollTo(0, 0);
    document.querySelector(".sidebar-demo > main")?.setAttribute("id", "main-content");
  }, [user, currentPath]);

  useEffect(() => {
    const syncPath = () => setCurrentPath(window.location.pathname || "/overview");
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  function navigate(route: string) {
    if (window.location.pathname !== route) window.history.pushState({}, "", route);
    setCurrentPath(window.location.pathname || "/overview");
  }

  function handleSignIn(nextUser: AuthenticatedSidebarUser) {
    setUser(nextUser);
    try { window.localStorage.setItem("school-demo-user", nextUser.id); } catch { /* storage may be unavailable */ }
    window.history.replaceState({}, "", "/overview");
    setCurrentPath("/overview");
  }

  function handleSignOut() {
    setUser(null);
    try { window.localStorage.removeItem("school-demo-user"); } catch { /* storage may be unavailable */ }
    window.history.replaceState({}, "", "/");
    setCurrentPath("/");
  }

  if (!user) return <StaffSignIn onSignIn={handleSignIn} />;

  const isDirectorOverview = user.role === "director" && currentPath === "/overview";
  const isAdministrativeOverview = user.role === "administrative" && currentPath === "/overview";
  const isPedagogicalOverview = user.role === "pedagogical" && currentPath === "/overview";
  const isFinanceOverview = user.role === "finance" && currentPath === "/overview";
  const isAcademicYearsPage = currentPath === "/academic-years";
  const isSectorsProgramsPage = currentPath === "/sectors-programs";
  const isLevelsPage = currentPath === "/levels";
  const isClassesGroupsPage = currentPath === "/classes-groups";
  const isSubjectsPage = currentPath === "/subjects";
  const isDepartmentsPage = currentPath === "/departments";
  const isStudentsPage = currentPath === "/students";
  const isParentsPage = currentPath === "/parents";
  const isTeachersPage = currentPath === "/teachers";
  const isEmployeesPage = currentPath === "/employees";
  const isRolesPermissionsPage = currentPath === "/roles-permissions";
  const isGradesValidationPage = currentPath === "/grades-validation";
  const isExaminationsPage = currentPath === "/examinations";
  const isCoursesExercisesPage = currentPath === "/courses-exercises";
  const isPedagogicalReportsPage = currentPath === "/pedagogical-reports";
  const isBadgesRecognitionPage = currentPath === "/badges-recognition";
  const isTimetablesPage = currentPath === "/timetables";
  const isStudentAttendancePage = currentPath === "/student-attendance";
  const isStaffAttendancePage = currentPath === "/staff-attendance";
  const isDocumentsPage = currentPath === "/documents";
  const isClassRankingsPage = currentPath === "/class-rankings";
  const isStudentRiskPage = currentPath === "/student-risk";
  const isStudentActivitiesPage = currentPath === "/student-activities";
  const isPaymentRegistersPage = currentPath === "/payment-registers";
  const isCashRegistersPage = currentPath === "/cash-registers";
  const isPaymentsPage = currentPath === "/payments";
  const isStudentBalancesPage = currentPath === "/student-balances";
  const isExpensesPage = currentPath === "/expenses";
  const isFinancialReportsPage = currentPath === "/financial-reports";
  const isTransportPage = currentPath === "/transport";
  const isTripsOutingsPage = currentPath === "/trips-outings";
  const isAccidentsIncidentsPage = currentPath === "/accidents-incidents";
  const isInventoryPage = currentPath === "/inventory";
  const isAnnouncementsPage = currentPath === "/announcements";
  const isNotificationsPage = currentPath === "/notifications";

  return (
    <div className={`sidebar-demo${sidebarCollapsed ? " is-collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">Aller au contenu principal</a>
      <AppSidebar user={user} school={schoolBranding} currentPath={currentPath} onNavigate={navigate} onExit={handleSignOut} collapsed={sidebarCollapsed} onCollapsedChange={updateCollapsed} />
      <TopBar user={user} school={schoolBranding} onOpenSearch={() => setSearchOpen(true)} onNavigate={navigate} onSignOut={handleSignOut} />
      {systemStatus.license.mode === "restricted" && (
        <div className="license-banner" role="alert">
          <strong>Mode restreint :</strong> la création et la modification sont désactivées. Les données existantes restent disponibles. Renouvelez la licence pour rétablir l’accès complet.
        </div>
      )}
      {isDirectorOverview ? (
        <DirectorOverviewPage user={user} onNavigate={navigate} />
      ) : isAdministrativeOverview ? (
        <AdministrativeOverviewPage user={user} onNavigate={navigate} />
      ) : isPedagogicalOverview ? (
        <PedagogicalOverviewPage user={user} onNavigate={navigate} />
      ) : isFinanceOverview ? (
        <FinanceLogisticsOverviewPage user={user} onNavigate={navigate} />
      ) : isAcademicYearsPage ? (
        <AcademicYearsPage user={user} onNavigate={navigate} />
      ) : isSectorsProgramsPage ? (
        <SectorsProgramsPage user={user} onNavigate={navigate} />
      ) : isLevelsPage ? (
        <LevelsPage user={user} onNavigate={navigate} />
      ) : isClassesGroupsPage ? (
        <ClassesGroupsPage user={user} onNavigate={navigate} />
      ) : isSubjectsPage ? (
        <SubjectsPage user={user} onNavigate={navigate} />
      ) : isDepartmentsPage ? (
        <DepartmentsPage user={user} onNavigate={navigate} />
      ) : isStudentsPage ? (
        <StudentsPage user={user} onNavigate={navigate} />
      ) : isParentsPage ? (
        <ParentsPage user={user} onNavigate={navigate} />
      ) : isTeachersPage ? (
        <TeachersPage user={user} onNavigate={navigate} />
      ) : isEmployeesPage ? (
        <EmployeesPage user={user} onNavigate={navigate} />
      ) : isRolesPermissionsPage ? (
        <RolesPermissionsPage user={user} onNavigate={navigate} />
      ) : isGradesValidationPage ? (
        <GradesValidationPage user={user} onNavigate={navigate} />
      ) : isExaminationsPage ? (
        <ExaminationsPage user={user} onNavigate={navigate} />
      ) : isCoursesExercisesPage ? (
        <CoursesExercisesPage user={user} onNavigate={navigate} />
      ) : isPedagogicalReportsPage ? (
        <PedagogicalReportsPage user={user} onNavigate={navigate} />
      ) : isBadgesRecognitionPage ? (
        <BadgesRecognitionPage user={user} onNavigate={navigate} />
      ) : isTimetablesPage ? (
        <TimetablesPage user={user} onNavigate={navigate} />
      ) : isStudentAttendancePage ? (
        <StudentAttendancePage user={user} onNavigate={navigate} />
      ) : isStaffAttendancePage ? (
        <StaffAttendancePage user={user} onNavigate={navigate} />
      ) : isDocumentsPage ? (
        <DocumentsPage user={user} onNavigate={navigate} />
      ) : isClassRankingsPage ? (
        <ClassRankingsPage user={user} onNavigate={navigate} />
      ) : isStudentRiskPage ? (
        <StudentRiskPage user={user} onNavigate={navigate} />
      ) : isStudentActivitiesPage ? (
        <StudentActivitiesPage user={user} />
      ) : isPaymentRegistersPage ? (
        <PaymentRegistersPage user={user} />
      ) : isCashRegistersPage ? (
        <CashRegistersPage user={user} />
      ) : isPaymentsPage ? (
        <PaymentsPage user={user} />
      ) : isStudentBalancesPage ? (
        <StudentBalancesPage user={user} />
      ) : isExpensesPage ? (
        <ExpensesPage user={user} />
      ) : isFinancialReportsPage ? (
        <FinancialReportsPage user={user} />
      ) : isTransportPage ? (
        <TransportPage user={user} onNavigate={navigate} />
      ) : isTripsOutingsPage ? (
        <TripsOutingsPage user={user} />
      ) : isAccidentsIncidentsPage ? (
        <AccidentsIncidentsPage user={user} />
      ) : isInventoryPage ? (
        <InventoryPage user={user} />
      ) : isAnnouncementsPage ? (
        <AnnouncementsPage user={user} />
      ) : isNotificationsPage ? (
        <NotificationsPage user={user} />
      ) : (
        <main className="workspace-placeholder">
          <span className="workspace-eyebrow">ESPACE DU PERSONNEL</span>
          <h1>{currentPath === "/overview" ? `Bienvenue, ${user.displayName.split(" ")[0]}` : "Module en préparation"}</h1>
          <p>{currentPath === "/overview" ? `Votre espace de travail est prêt. Fonction : ${user.role === "finance" ? "Responsable financier et logistique" : user.role === "administrative" ? "Responsable administratif" : user.role === "pedagogical" ? "Responsable pédagogique" : "Directeur"}.` : "Cette page sera développée dans une prochaine étape."}</p>
          <span className="workspace-note">Les modules sont construits progressivement, sans modifier les espaces déjà en place.</span>
        </main>
      )}
      <StatusBar />
      <CommandPalette open={searchOpen} user={user} onClose={() => setSearchOpen(false)} onNavigate={navigate} />
    </div>
  );
}
