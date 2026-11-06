import { useState } from "react";
import { ChevronDown, Command, LayoutDashboard } from "lucide-react";
import { AppSidebar } from "./components/AppSidebar";
import { roleLabels } from "./data/navigation";
import type { StaffRole } from "./types/navigation";

export default function App() {
  const [role, setRole] = useState<StaffRole>("director");
  const [activeItem, setActiveItem] = useState("Overview");

  return (
    <div className="app-frame">
      <AppSidebar role={role} activeItem={activeItem} onNavigate={setActiveItem} />
      <main className="preview-main">
        <header className="preview-toolbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{activeItem}</strong></div>
          <div className="toolbar-right">
            <span className="preview-label">SIDEBAR PREVIEW</span>
            <label className="role-select-label" htmlFor="role-select">Preview as</label>
            <div className="role-select-wrap">
              <select id="role-select" value={role} onChange={(event) => setRole(event.target.value as StaffRole)}>
                {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>
        <section className="preview-canvas">
          <div className="canvas-inner">
            <div className="canvas-icon"><LayoutDashboard size={22} /></div>
            <span className="eyebrow">NAVIGATION COMPONENT</span>
            <h1>{activeItem}</h1>
            <p>This is a workspace preview. Select an item from the sidebar to test navigation, or switch roles to inspect permission-based visibility.</p>
            <div className="preview-meta"><span className="status-dot" />Viewing as <strong>{roleLabels[role]}</strong></div>
          </div>
          <div className="canvas-footnote"><Command size={13} /> School Local Platform <span>·</span> Frontend demo</div>
        </section>
      </main>
    </div>
  );
}