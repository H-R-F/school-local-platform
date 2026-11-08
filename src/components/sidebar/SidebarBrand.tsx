import { useEffect, useState } from "react";
import { School } from "lucide-react";
import type { SchoolBranding } from "../../types/navigation";
interface Props { school: SchoolBranding; collapsed: boolean }
export function SidebarBrand({school,collapsed}:Props) {
 const [logoFailed,setLogoFailed]=useState(false);
 useEffect(()=>setLogoFailed(false),[school.logoUrl]);
 return <div className="sidebar-brand">
  <div className="brand-mark" role="img" aria-label={school.name} title={collapsed ? school.name : undefined}>
   {school.logoUrl&&!logoFailed?<img src={school.logoUrl} alt="" onError={()=>setLogoFailed(true)}/>:<School size={21} strokeWidth={1.9}/>}
  </div>
  {!collapsed&&<div className="brand-copy">
   <span className="brand-overline">ESPACE SCOLAIRE</span>
   <span className="brand-name">{school.name}</span>
   {school.location&&<span className="brand-caption">{school.location}</span>}
  </div>}
 </div>;
}