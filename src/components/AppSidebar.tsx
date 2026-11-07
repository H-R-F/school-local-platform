import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { LogOut, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import { navigation } from "../data/navigation";
import type { AuthenticatedSidebarUser, NavigationGroup, SchoolBranding } from "../types/navigation";
import { SidebarBrand } from "./sidebar/SidebarBrand";
import { SidebarGroup } from "./sidebar/SidebarGroup";

interface AppSidebarProps {
  user: AuthenticatedSidebarUser;
  school: SchoolBranding;
  currentPath?: string;
  onNavigate?: (route: string) => void;
  onExit?: () => void;
}

function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

export function AppSidebar({ user, school, currentPath, onNavigate, onExit }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const path = normalizePath(currentPath ?? window.location.pathname);

  const visibleGroups = useMemo<NavigationGroup[]>(() => navigation.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.roles.includes(user.role) &&
      user.permissions.includes(item.permission) &&
      item.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
    )
  })).filter(group => group.items.length > 0), [user.role, user.permissions, search]);

  const activeGroupId = visibleGroups.find(group => group.items.some(item => normalizePath(item.route) === path))?.id;
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeGroupId) return;
    setExpandedGroups(current => ({ ...current, [activeGroupId]: true }));
  }, [activeGroupId, path]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(current => ({ ...current, [id]: !(current[id] ?? id === activeGroupId) }));
  };

  const cssVariables = {
    "--school-primary": school.primaryColor,
    "--school-secondary": school.secondaryColor ?? "#EAF1FF"
  } as CSSProperties;

  const roleLabel = user.role === "finance"
    ? "Responsable financier"
    : user.role === "administrative"
    ? "Responsable administratif"
    : user.role === "pedagogical"
    ? "Responsable pédagogique"
    : "Directeur d'établissement";

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`} style={cssVariables} aria-label="Navigation principale">
      {/* Brand Header */}
      <div className="sidebar-top">
        <SidebarBrand school={school} collapsed={collapsed} />
        <button
          type="button"
          className="sidebar-collapse-button"
          onClick={() => setCollapsed(value => !value)}
          aria-label={collapsed ? "Développer le menu latéral" : "Réduire le menu latéral"}
          title={collapsed ? "Développer le menu" : "Réduire le menu"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Filter / Search Bar */}
      {!collapsed && (
        <div className="sidebar-search">
          <Search size={14} className="sidebar-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Rechercher un module..."
            aria-label="Rechercher un module dans le menu"
          />
          {search ? (
            <button
              type="button"
              className="sidebar-search-clear"
              onClick={() => setSearch("")}
              aria-label="Effacer la recherche"
            >
              <X size={12} />
            </button>
          ) : (
            <kbd className="sidebar-search-kbd">⌘K</kbd>
          )}
        </div>
      )}

      {/* Navigation Tree */}
      <nav className="nav-scroll" aria-label="Navigation de l'établissement">
        {visibleGroups.map(group => (
          <SidebarGroup
            key={group.id}
            group={group}
            activePath={path}
            collapsed={collapsed}
            expanded={search.trim().length > 0 || (expandedGroups[group.id] ?? group.id === activeGroupId)}
            onToggle={() => toggleGroup(group.id)}
            onNavigate={onNavigate}
          />
        ))}

        {visibleGroups.length === 0 && !collapsed && (
          <div className="nav-empty">
            <span>Aucun module ne correspond à « {search} »</span>
          </div>
        )}
      </nav>

      {/* Executive User Profile Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-anchor">
          <div className="sidebar-user-avatar" title={user.displayName}>
            <span>{user.initials}</span>
            <span className="sidebar-status-online" title="Connecté" />
          </div>

          {!collapsed && (
            <div className="sidebar-user-copy">
              <strong className="sidebar-user-name">{user.displayName}</strong>
              <span className="sidebar-user-role">{roleLabel}</span>
            </div>
          )}
        </div>

        {onExit && !collapsed && (
          <button
            type="button"
            className="sidebar-exit"
            onClick={onExit}
            title="Se déconnecter de la session"
            aria-label="Se déconnecter"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}