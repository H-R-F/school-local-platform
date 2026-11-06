import type { NavigationItem } from "../../types/navigation";
interface Props { item: NavigationItem; active: boolean; collapsed: boolean; onNavigate?: (route:string)=>void }
export function SidebarItem({item,active,collapsed,onNavigate}:Props) {
 const Icon=item.icon;
 return <a className={`nav-item ${active?"nav-item--active":""}`} href={item.route} aria-current={active?"page":undefined} title={collapsed?item.label:undefined}
 onClick={onNavigate?(event)=>{event.preventDefault();onNavigate(item.route);}:undefined}>
 <Icon size={18} strokeWidth={active?2.2:1.8} aria-hidden="true" />{!collapsed&&<span>{item.label}</span>}
 </a>;
}