import { useMemo, useState } from "react";
import {
  ChevronDown, ChevronRight, Command, Search, PanelLeftClose,
  PanelLeftOpen, School, Sparkles,
} from "lucide-react";
import { navigation, roleLabels } from "../data/navigation";
import type { NavigationGroup, StaffRole } from "../types/navigation";

interface AppSidebarProps {
  role: StaffRole;
  activeItem: string;
  onNavigate: (label: string) => void;
}

export function AppSidebar({ role, activeItem, onNavigate }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const visibleGroups = useMemo<NavigationGroup[]>(() => navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)
        && item.label.toLowerCase().includes(search.toLowerCase())),
    }))
    .filter((group) => group.items.length > 0 && (!group.roles || group.roles.includes(role))),
  [role, search]);

  const toggleGroup = (label: string) => setOpenGroups((current) => ({
    ...current,
    [label]: !(current[label] ?? true),
  }));

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-mark"><School size={19} strokeWidth={2.2} /></div>
        {!collapsed && <div className="brand-copy"><span className="brand-name">Northstar</span><span className="brand-caption">SCHOOL WORKSPACE</span></div>}
        <button className="icon-button collapse-button" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      {!collapsed && (
        <div className="school-switcher">
          <div className="school-avatar">N</div>
          <div className="school-details"><strong>Northstar Academy</strong><span>Casablanca · Morocco</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>
      )}

      {!collapsed && <div className="nav-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search navigation..." /><kbd>⌘ K</kbd></div>}

      <nav className="nav-scroll" aria-label="Main navigation">
        {visibleGroups.map((group, index) => {
          const isOpen = openGroups[group.label] ?? true;
          const isOverview = group.label === "Overview";
          return (
            <section className={`nav-group ${isOverview ? "nav-group--overview" : ""}`} key={group.label}>
              {!collapsed && !isOverview && (
                <button className="nav-group-heading" onClick={() => toggleGroup(group.label)} aria-expanded={isOpen}>
                  <span>{group.label}</span><ChevronDown size={13} className={isOpen ? "" : "chevron-closed"} />
                </button>
              )}
              {(isOpen || collapsed || isOverview) && (
                <div className="nav-items">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeItem === item.label;
                    return (
                      <button key={item.label} title={collapsed ? item.label : undefined} className={`nav-item ${active ? "nav-item--active" : ""}`} onClick={() => onNavigate(item.label)}>
                        <Icon size={17} strokeWidth={active ? 2.1 : 1.8} />
                        {!collapsed && <><span>{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}</>}
                      </button>
                    );
                  })}
                </div>
              )}
              {!collapsed && index === 0 && <div className="nav-separator" />}
            </section>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        {!collapsed ? (
          <>
            <div className="help-card"><div className="help-icon"><Sparkles size={15} /></div><div><strong>Need a hand?</strong><span>Visit the help center</span></div><ChevronRight size={14} /></div>
            <div className="profile-row">
              <div className="profile-avatar">AB</div>
              <div className="profile-copy"><strong>Admin Benali</strong><span>{roleLabels[role]}</span></div>
              <button className="icon-button profile-menu" aria-label="Profile options"><Command size={16} /></button>
            </div>
          </>
        ) : (
          <div className="profile-avatar profile-avatar--center" title={roleLabels[role]}>AB</div>
        )}
      </div>
    </aside>
  );
}