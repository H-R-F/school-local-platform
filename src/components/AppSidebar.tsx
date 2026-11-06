import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { navigation } from "../data/navigation";
import type { AuthenticatedSidebarUser, NavigationGroup, SchoolBranding } from "../types/navigation";
import { SidebarBrand } from "./sidebar/SidebarBrand";
import { SidebarGroup } from "./sidebar/SidebarGroup";

interface AppSidebarProps {
  user: AuthenticatedSidebarUser;
  school: SchoolBranding;
  currentPath?: string;
  onNavigate?: (route: string) => void;
}
function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}
export function AppSidebar({user,school,currentPath,onNavigate}:AppSidebarProps) {
  const [collapsed,setCollapsed]=useState(false);
  const [search,setSearch]=useState("");
  const path=normalizePath(currentPath ?? window.location.pathname);
  const visibleGroups=useMemo<NavigationGroup[]>(()=>navigation.map(group=>({
    ...group,
    items:group.items.filter(item=>
      item.roles.includes(user.role) &&
      user.permissions.includes(item.permission) &&
      item.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
    )
  })).filter(group=>group.items.length>0),[user.role,user.permissions,search]);
  const activeGroupId=visibleGroups.find(group=>group.items.some(item=>normalizePath(item.route)===path))?.id;
  const [expandedGroups,setExpandedGroups]=useState<Record<string,boolean>>({});
  useEffect(()=>{
    if(!activeGroupId)return;
    setExpandedGroups(current=>({...current,[activeGroupId]:true}));
  },[activeGroupId]);
  const toggleGroup=(id:string)=>setExpandedGroups(current=>({...current,[id]:!(current[id]??id===activeGroupId)}));
  const cssVariables={
    "--school-primary":school.primaryColor,
    "--school-secondary":school.secondaryColor??"#edf3f9"
  } as CSSProperties;
  return <aside className={`sidebar ${collapsed?"sidebar--collapsed":""}`} style={cssVariables}>
    <div className="sidebar-top">
      <SidebarBrand school={school} collapsed={collapsed}/>
      <button type="button" className="sidebar-collapse-button" onClick={()=>setCollapsed(value=>!value)}
        aria-label={collapsed?"Expand sidebar":"Collapse sidebar"} title={collapsed?"Expand sidebar":"Collapse sidebar"}>
        {collapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}
      </button>
    </div>
    {!collapsed&&<div className="sidebar-search">
      <Search size={15} aria-hidden="true"/>
      <input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search navigation" aria-label="Search navigation"/>
      {search&&<button type="button" onClick={()=>setSearch("")} aria-label="Clear search">×</button>}
    </div>}
    <nav className="nav-scroll" aria-label="School navigation">
      {visibleGroups.map(group=><SidebarGroup key={group.id} group={group} activePath={path} collapsed={collapsed}
        expanded={expandedGroups[group.id]??group.id===activeGroupId} onToggle={()=>toggleGroup(group.id)} onNavigate={onNavigate}/>)}
      {visibleGroups.length===0&&!collapsed&&<p className="nav-empty">No matching pages available.</p>}
    </nav>
    <div className="sidebar-footer">
      <div className="sidebar-user-avatar" title={user.displayName}>{user.initials}</div>
      {!collapsed&&<div className="sidebar-user-copy"><strong>{user.displayName}</strong><span>{user.role==="finance"?"Finance & Logistics Manager":user.role==="administrative"?"Administrative Manager":user.role==="pedagogical"?"Pedagogical Manager":"Director"}</span></div>}
    </div>
  </aside>;
}