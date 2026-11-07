import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, ChevronDown, LogOut, Search, Settings } from "lucide-react";
import { getRoleLabel } from "../../data/demo-accounts";
import type { AuthenticatedSidebarUser, SchoolBranding } from "../../types/navigation";

interface Props {
  user: AuthenticatedSidebarUser;
  school: SchoolBranding;
  onOpenSearch: () => void;
  onNavigate: (route: string) => void;
  onSignOut: () => void;
}

export function TopBar({ user, school, onOpenSearch, onNavigate, onSignOut }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const canOpenUserSettings = user.permissions.includes("settings.user.manage");
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="topbar" role="banner">
      <div className="topbar-context">
        <span className="topbar-chip">
          <CalendarDays size={15} aria-hidden="true" />
          Année scolaire {school.academicYear}
        </span>
      </div>

      <button type="button" className="topbar-search" onClick={onOpenSearch} aria-label="Ouvrir la recherche globale">
        <Search size={16} aria-hidden="true" />
        <span>Rechercher une page ou une action…</span>
        <kbd>{isMac ? "⌘" : "Ctrl"} K</kbd>
      </button>

      <div className="topbar-actions">
        <button type="button" className="topbar-icon" onClick={() => onNavigate("/notifications")} aria-label="Notifications" title="Notifications">
          <Bell size={18} aria-hidden="true" />
        </button>

        <div className="topbar-user" ref={menuRef}>
          <button
            type="button"
            className="topbar-user-trigger"
            onClick={() => setMenuOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="topbar-avatar" aria-hidden="true">{user.initials}</span>
            <span className="topbar-user-copy">
              <strong>{user.displayName}</strong>
              <small>{getRoleLabel(user.role)}</small>
            </span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="topbar-menu" role="menu">
              <div className="topbar-menu-head">
                <strong>{user.displayName}</strong>
                <small>{getRoleLabel(user.role)}</small>
              </div>
              {canOpenUserSettings && (
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onNavigate("/settings/user"); }}>
                  <Settings size={15} aria-hidden="true" /> Paramètres utilisateur
                </button>
              )}
              <button type="button" role="menuitem" className="is-danger" onClick={() => { setMenuOpen(false); onSignOut(); }}>
                <LogOut size={15} aria-hidden="true" /> Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
