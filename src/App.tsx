import { useEffect, useState } from "react";
import { AppSidebar } from "./components/AppSidebar";
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
import { PaymentsPage } from "./components/payments/PaymentsPage";
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
  const isPaymentsPage = currentPath === "/payments";

  return (
    <div className="sidebar-demo">
      <AppSidebar user={user} school={schoolBranding} currentPath={currentPath} onNavigate={navigate} onExit={handleSignOut} />
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
      ) : isPaymentsPage ? (
        <PaymentsPage user={user} />
      ) : (
        <main className="workspace-placeholder">
          <span className="workspace-eyebrow">ESPACE DU PERSONNEL</span>
          <h1>{currentPath === "/overview" ? `Bienvenue, ${user.displayName.split(" ")[0]}` : "Module en préparation"}</h1>
          <p>{currentPath === "/overview" ? `Votre espace de travail est prêt. Fonction : ${user.role === "finance" ? "Responsable financier et logistique" : user.role === "administrative" ? "Responsable administratif" : user.role === "pedagogical" ? "Responsable pédagogique" : "Directeur"}.` : "Cette page sera développée dans une prochaine étape."}</p>
          <span className="workspace-note">Les modules sont construits progressivement, sans modifier les espaces déjà en place.</span>
        </main>
      )}
    </div>
  );
}
