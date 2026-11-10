import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { LogOut, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import { getRoleLabel } from "../data/demo-accounts";
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
  /** Controlled collapsed state (so the page layout can follow the sidebar width). */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").trim();
}

export function AppSidebar({
  user,
  school,
  currentPath,
  onNavigate,
  onExit,
  collapsed: collapsedProp,
  onCollapsedChange,
}: AppSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp ?? internalCollapsed;
  const [search, setSearch] = useState("");
  const [focusSearchAfterExpand, setFocusSearchAfterExpand] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const path = normalizePath(currentPath ?? window.location.pathname);
  const normalizedSearch = normalizeSearch(search);

  const setCollapsed = (next: boolean) => {
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  const visibleGroups = useMemo<NavigationGroup[]>(() => navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const permitted = item.roles.includes(user.role) && user.permissions.includes(item.permission);
        if (!permitted) return false;
        if (!normalizedSearch) return true;
        return normalizeSearch(item.label).includes(normalizedSearch)
          || normalizeSearch(group.label).includes(normalizedSearch);
      }),
    }))
    .filter((group) => group.items.length > 0),
  [user.role, user.permissions, normalizedSearch]);

  const visibleItemCount = visibleGroups.reduce((total, group) => total + group.items.length, 0);
  const activeGroupId = visibleGroups.find((group) =>
    group.items.some((item) => normalizePath(item.route) === path),
  )?.id;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeGroupId) return;
    setExpandedGroups((current) => ({ ...current, [activeGroupId]: true }));
  }, [activeGroupId, path]);

  useEffect(() => {
    if (!collapsed && focusSearchAfterExpand) {
      searchInputRef.current?.focus();
      setFocusSearchAfterExpand(false);
    }
  }, [collapsed, focusSearchAfterExpand]);

  useEffect(() => {
    if (!search) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearch("");
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [search]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((current) => ({
      ...current,
      [id]: !(current[id] ?? id === activeGroupId),
    }));
  };

  const schoolStyle = {
    "--school-primary": school.primaryColor,
    "--school-secondary": school.secondaryColor ?? "var(--ds-color-action-subtle)",
  } as CSSProperties;

  const expandAndFocusSearch = () => {
    setFocusSearchAfterExpand(true);
    setCollapsed(false);
  };

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`} style={schoolStyle}>
      <div className="sidebar-top">
        <SidebarBrand school={school} collapsed={collapsed} />
        <button
          type="button"
          className="sidebar-collapse-button"
          aria-controls="school-primary-navigation"
          aria-keyshortcuts="Control+B Meta+B"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
          title={`${collapsed ? "Développer le menu" : "Réduire le menu"} · Ctrl+B`}
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      {collapsed ? (
        <div className="sidebar-search-collapsed">
          <button
            type="button"
            onClick={expandAndFocusSearch}
            aria-label="Développer le menu et rechercher une page"
            title="Rechercher dans le menu"
          >
            <Search size={17} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="sidebar-search">
          <Search size={16} aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une page…"
            aria-label="Rechercher dans la navigation"
            aria-controls="school-primary-navigation"
            autoComplete="off"
            spellCheck={false}
          />
          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                searchInputRef.current?.focus();
              }}
              aria-label="Effacer la recherche"
              title="Effacer la recherche"
            >
              <X size={15} aria-hidden="true" />
            </button>
          ) : (
            <kbd className="sidebar-search-shortcut" aria-hidden="true">/</kbd>
          )}
        </div>
      )}

      {!collapsed && (
        <div className="sidebar-nav-meta" aria-live="polite">
          <span>{normalizedSearch ? "RÉSULTATS" : "ESPACE DE TRAVAIL"}</span>
          <span className="sidebar-nav-count">{visibleItemCount}</span>
        </div>
      )}

      <nav
        id="school-primary-navigation"
        className="nav-scroll"
        aria-label="Navigation principale de l’établissement"
        tabIndex={-1}
      >
        {visibleGroups.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            activePath={path}
            collapsed={collapsed}
            expanded={normalizedSearch.length > 0 || (expandedGroups[group.id] ?? group.id === activeGroupId)}
            onToggle={() => toggleGroup(group.id)}
            onNavigate={onNavigate}
          />
        ))}
        {visibleGroups.length === 0 && !collapsed && (
          <div className="nav-empty" role="status">
            <span className="nav-empty-icon"><Search size={18} aria-hidden="true" /></span>
            <strong>Aucun résultat</strong>
            <span>Essayez un autre terme ou vérifiez l’orthographe.</span>
            <button type="button" onClick={() => setSearch("")}>Effacer la recherche</button>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-avatar" title={user.displayName} aria-label={`Session active : ${user.displayName}`} role="img">
          {user.initials}
        </div>
        {!collapsed && (
          <div className="sidebar-user-copy">
            <span className="sidebar-user-kicker">CONNECTÉ EN TANT QUE</span>
            <strong title={user.displayName}>{user.displayName}</strong>
            <span>{getRoleLabel(user.role)}</span>
          </div>
        )}
        {onExit && (
          <button
            type="button"
            className="sidebar-exit"
            onClick={onExit}
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut size={16} aria-hidden="true" />
            {!collapsed && <span>Quitter</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
