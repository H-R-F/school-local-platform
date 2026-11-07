import { useState } from "react";
import { GraduationCap } from "lucide-react";
import type { SchoolBranding } from "../../types/navigation";

interface Props {
  school: SchoolBranding;
  collapsed: boolean;
}

export function SidebarBrand({ school, collapsed }: Props) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="sidebar-brand">
      <div className="brand-mark" aria-label={school.name} title={collapsed ? school.name : undefined}>
        {school.logoUrl && !logoFailed ? (
          <img src={school.logoUrl} alt="" onError={() => setLogoFailed(true)} />
        ) : (
          <GraduationCap size={22} strokeWidth={2.2} />
        )}
      </div>
      {!collapsed && (
        <div className="brand-copy">
          <span className="brand-name">{school.name}</span>
          <span className="brand-caption">{school.location || "Plateforme de gestion"}</span>
        </div>
      )}
    </div>
  );
}