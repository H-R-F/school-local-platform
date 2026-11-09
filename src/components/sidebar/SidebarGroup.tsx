import { ChevronDown } from "lucide-react";
import type { NavigationGroup } from "../../types/navigation";
import { SidebarItem } from "./SidebarItem";
interface Props { group:NavigationGroup; activePath:string; collapsed:boolean; expanded:boolean; onToggle:()=>void; onNavigate?:(route:string)=>void }
export function SidebarGroup({group,activePath,collapsed,expanded,onToggle,onNavigate}:Props) {
 const containsActive=group.items.some(item=>item.route===activePath);
 return <section className={`nav-group ${containsActive?"nav-group--contains-active":""}`} aria-label={group.label}>
 {!collapsed&&group.collapsible!==false&&<button type="button" className="nav-group-heading" onClick={onToggle} aria-expanded={expanded} aria-controls={`nav-group-${group.id}`}>
  <span className="nav-group-label">{group.label}</span><span className="nav-group-count">{group.items.length}</span>
  <ChevronDown size={13} className={expanded?"group-chevron":"group-chevron group-chevron--closed"} aria-hidden="true" />
 </button>}
 {(collapsed||group.collapsible===false||expanded)&&<div className="nav-items" id={`nav-group-${group.id}`}>{group.items.map(item=><SidebarItem key={item.id} item={item} active={item.route===activePath} collapsed={collapsed} onNavigate={onNavigate}/>)}</div>}
 </section>;
}