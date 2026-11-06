import { useEffect, useState } from "react";
import { AppSidebar } from "./components/AppSidebar";
import { StaffSignIn } from "./components/auth/StaffSignIn";
import { DirectorOverviewPage } from "./components/dashboard/DirectorOverviewPage";
import { AdministrativeOverviewPage } from "./components/dashboard/AdministrativeOverviewPage";
import { PedagogicalOverviewPage } from "./components/dashboard/PedagogicalOverviewPage";
import { FinanceLogisticsOverviewPage } from "./components/dashboard/FinanceLogisticsOverviewPage";
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
    setCurrentPath(route);
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
