import type { NavigationItem } from "../../types/navigation";

interface Props {
  item: NavigationItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: (route: string) => void;
}

export function SidebarItem({ item, active, collapsed, onNavigate }: Props) {
  const Icon = item.icon;
  const badges: Record<string, string> = {
    "/grades-validation": "18",
    "/student-risk": "12",
  };
  const badge = badges[item.route];

  return (
    <a
      className={`nav-item ${active ? "nav-item--active" : ""}`}
      href={item.route}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate ? (event) => {
        event.preventDefault();
        onNavigate(item.route);
      } : undefined}
    >
      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
      {!collapsed && <span className="nav-item-label">{item.label}</span>}
      {!collapsed && badge && (
        <span className={`nav-item-badge ${item.route === "/student-risk" ? "nav-item-badge--amber" : "nav-item-badge--blue"}`}>
          {badge}
        </span>
      )}
    </a>
  );
}