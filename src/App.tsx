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
      <AppSidebar user={user} school={schoolBranding} onSignOut={handleSignOut} />
      <main className="workspace-placeholder">
        <span className="workspace-eyebrow">STAFF WORKSPACE</span>
        <h1>Welcome, {user.displayName.split(" ")[0]}</h1>
        <p>Your {user.role === "finance" ? "Finance & Logistics Manager" : user.role === "administrative" ? "Administrative Manager" : user.role === "pedagogical" ? "Pedagogical Manager" : "Director"} workspace is ready.</p>
        <span className="workspace-note">This is a frontend preview. We'll build each workspace page next.</span>
      </main>
    </div>
  );
}
