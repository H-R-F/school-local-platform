import { useState } from "react";
import { AppSidebar } from "./components/AppSidebar";
import { StaffSignIn } from "./components/auth/StaffSignIn";
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

  function handleSignIn(nextUser: AuthenticatedSidebarUser) {
    setUser(nextUser);
    try { window.localStorage.setItem("school-demo-user", nextUser.id); } catch { /* storage may be unavailable */ }
    window.history.replaceState({}, "", "/overview");
  }

  function handleSignOut() {
    setUser(null);
    try { window.localStorage.removeItem("school-demo-user"); } catch { /* storage may be unavailable */ }
    window.history.replaceState({}, "", "/");
  }

  if (!user) return <StaffSignIn onSignIn={handleSignIn} />;

  return (
    <div className="sidebar-demo">
      <AppSidebar user={user} school={schoolBranding} onExit={handleSignOut} />
      <main className="workspace-placeholder">
        <span className="workspace-eyebrow">ESPACE DU PERSONNEL</span>
        <h1>Bienvenue, {user.displayName.split(" ")[0]}</h1>
        <p>Votre espace de travail est prêt. Fonction : {user.role === "finance" ? "Responsable financier et logistique" : user.role === "administrative" ? "Responsable administratif" : user.role === "pedagogical" ? "Responsable pédagogique" : "Directeur"}.</p>
        <span className="workspace-note">Ceci est un aperçu de l’application. Nous allons construire les pages de chaque espace progressivement.</span>
        <button type="button" className="workspace-signout" onClick={handleSignOut}>Se déconnecter</button>
      </main>
    </div>
  );
}
