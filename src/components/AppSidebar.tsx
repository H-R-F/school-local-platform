import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { LogOut, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
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
export function AppSidebar({user,school,currentPath,onNavigate,onExit,collapsed:collapsedProp,onCollapsedChange}:AppSidebarProps) {
  const [internalCollapsed,setInternalCollapsed]=useState(false);
  const collapsed=collapsedProp??internalCollapsed;
  const setCollapsed=(update:(value:boolean)=>boolean)=>{const next=update(collapsed);setInternalCollapsed(next);onCollapsedChange?.(next);};
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
  },[activeGroupId,path]);
  const toggleGroup=(id:string)=>setExpandedGroups(current=>({...current,[id]:!(current[id]??id===activeGroupId)}));
  const cssVariables={
    "--school-primary":school.primaryColor,
    "--school-secondary":school.secondaryColor??"var(--ds-color-action-subtle)"
  } as CSSProperties;
  return <aside className={`sidebar ${collapsed?"sidebar--collapsed":""}`} style={cssVariables}>
    <div className="sidebar-top">
      <SidebarBrand school={school} collapsed={collapsed}/>
      <button type="button" className="sidebar-collapse-button" aria-controls="school-primary-navigation" aria-keyshortcuts="Control+B Meta+B" onClick={()=>setCollapsed(value=>!value)}
        aria-label={collapsed?"Développer le menu":"Réduire le menu"} aria-expanded={!collapsed} title={(collapsed?"Développer le menu":"Réduire le menu")+" (Ctrl+B)"}>
        {collapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}
      </button>
    </div>
    {!collapsed&&<div className="sidebar-search">
      <Search size={15} aria-hidden="true"/>
      <input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Rechercher dans le menu" aria-label="Rechercher dans le menu"/>
      {search&&<button type="button" onClick={()=>setSearch("")} aria-label="Effacer la recherche">×</button>}
    </div>}
    <nav id="school-primary-navigation" className="nav-scroll" aria-label="Navigation de l’établissement" tabIndex={-1}>
      {visibleGroups.map(group=><SidebarGroup key={group.id} group={group} activePath={path} collapsed={collapsed}
        expanded={search.trim().length>0 || (expandedGroups[group.id]??group.id===activeGroupId)} onToggle={()=>toggleGroup(group.id)} onNavigate={onNavigate}/>)}
      {visibleGroups.length===0&&!collapsed&&<p className="nav-empty">Aucune page ne correspond à votre recherche.</p>}
    </nav>
    <div className="sidebar-footer">
      <div className="sidebar-user-avatar" title={user.displayName} aria-label={`Session active : ${user.displayName}`} role="img">{user.initials}</div>
      {!collapsed&&<div className="sidebar-user-copy"><span className="sidebar-user-kicker">SESSION ACTIVE</span><strong>{user.displayName}</strong><span>{user.role==="finance"?"Responsable financier et logistique":user.role==="administrative"?"Responsable administratif":user.role==="pedagogical"?"Responsable pédagogique":"Directeur"}</span></div>}
      {onExit && <button type="button" className="sidebar-exit" onClick={onExit} aria-label="Se déconnecter" title="Se déconnecter"><LogOut size={16} aria-hidden="true"/></button>}
    </div>
  </aside>;
}