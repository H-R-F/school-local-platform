import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const canOpenUserSettings = user.permissions.includes("settings.user.manage");
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === "ArrowDown") next = (current + 1) % items.length;
    else if (event.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else if (event.key === "Tab") { setMenuOpen(false); return; }
    else return;
    event.preventDefault();
    items[next]?.focus();
  };

  return (
    <header className="topbar">
      <div className="topbar-context">
        <span className="topbar-chip">
          <CalendarDays size={16} aria-hidden="true" />
          Année scolaire {school.academicYear}
        </span>
      </div>

      <button type="button" className="topbar-search" onClick={onOpenSearch} aria-label="Ouvrir la recherche globale" title="Rechercher (Ctrl ou Cmd + K)">
        <Search size={16} aria-hidden="true" />
        <span>Rechercher une page ou une action…</span>
        <kbd aria-hidden="true">{isMac ? "⌘" : "Ctrl"} K</kbd>
      </button>

      <div className="topbar-actions">
        <button type="button" className="topbar-icon" onClick={() => onNavigate("/notifications")} aria-label="Notifications" title="Notifications">
          <Bell size={18} aria-hidden="true" />
        </button>

        <div className="topbar-user" ref={menuRef}>
          <button
            ref={triggerRef}
            type="button"
            className="topbar-user-trigger"
            onClick={() => setMenuOpen((value) => !value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && !menuOpen) {
                event.preventDefault();
                setMenuOpen(true);
              }
            }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="topbar-user-menu"
            aria-label={`Menu du compte : ${user.displayName}`}
          >
            <span className="topbar-avatar" aria-hidden="true">{user.initials}</span>
            <span className="topbar-user-copy">
              <strong>{user.displayName}</strong>
              <small>{getRoleLabel(user.role)}</small>
            </span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div id="topbar-user-menu" className="topbar-menu" role="menu" aria-label="Menu du compte" onKeyDown={handleMenuKeyDown}>
              <div className="topbar-menu-head">
                <strong>{user.displayName}</strong>
                <small>{getRoleLabel(user.role)}</small>
              </div>
              {canOpenUserSettings && (
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onNavigate("/settings/user"); }}>
                  <Settings size={16} aria-hidden="true" /> Paramètres utilisateur
                </button>
              )}
              <button type="button" role="menuitem" className="is-danger" onClick={() => { setMenuOpen(false); onSignOut(); }}>
                <LogOut size={16} aria-hidden="true" /> Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
