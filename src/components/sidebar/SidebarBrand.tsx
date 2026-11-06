import { School } from "lucide-react";
import type { SchoolBranding } from "../../types/navigation";
interface Props { school: SchoolBranding; collapsed: boolean }
export function SidebarBrand({school,collapsed}:Props) {
 return <div className="sidebar-brand">
  <div className="brand-mark" aria-hidden="true">{school.logoUrl ? <img src={school.logoUrl} alt="" /> : <School size={20} strokeWidth={2} />}</div>
  {!collapsed && <div className="brand-copy"><span className="brand-name">{school.name}</span>{school.location && <span className="brand-caption">{school.location}</span>}</div>}
 </div>;
}