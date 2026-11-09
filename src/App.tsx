import { useMemo, useState } from "react";
import { CloudflareTunnelsPage } from "./components/CloudflareTunnelsPage";
import { ConnectivityPage } from "./components/ConnectivityPage";
import "./components/connectivity-page.css";
import "./components/cloudflare-tunnels.css";
import {
  Activity, AlertCircle, Bell, Building2, Check, ChevronDown, ChevronRight,
  Cloud, Command, CreditCard, Database, ExternalLink, FileClock, Gauge, KeyRound,
  LayoutDashboard, LifeBuoy, LogOut, Moon, MoreHorizontal, Package, PanelLeft,
  Plus, RefreshCw, Search, Settings, ShieldCheck, Sun, X,
} from "lucide-react";

type PageKey = "Dashboard" | "Schools" | "Installations" | "Endpoints" | "Subscriptions" | "Licenses" | "Monitoring" | "Connectivity" | "Releases" | "Notifications" | "Support Access" | "Audit Logs" | "Settings";
type School = { code: string; name: string; city: string; status: string; plan: string; health: string; license: string; version: string; heartbeat: string; endpoint: string };

const schools: School[] = [
  { code: "SCH001", name: "École Horizon", city: "Casablanca, MA", status: "Active", plan: "Premium", health: "Healthy", license: "Active", version: "v2.8.1", heartbeat: "2 min ago", endpoint: "horizon.school.local" },
  { code: "SCH002", name: "Lycée Atlas", city: "Rabat, MA", status: "Active", plan: "Standard", health: "Healthy", license: "Active", version: "v2.8.1", heartbeat: "8 min ago", endpoint: "atlas.school.local" },
  { code: "SCH003", name: "Groupe Scolaire Al Amal", city: "Fès, MA", status: "Active", plan: "Premium", health: "Degraded", license: "In grace", version: "v2.7.4", heartbeat: "11 hours ago", endpoint: "alamal.school.local" },
  { code: "SCH004", name: "École Les Oliviers", city: "Marrakech, MA", status: "Onboarding", plan: "Starter", health: "Healthy", license: "Active", version: "v2.8.1", heartbeat: "18 min ago", endpoint: "oliviers.school.local" },
  { code: "SCH005", name: "Collège Ibn Sina", city: "Tangier, MA", status: "Active", plan: "Standard", health: "Offline", license: "Active", version: "v2.6.9", heartbeat: "36 hours ago", endpoint: "ibnsina.school.local" },
  { code: "SCH006", name: "Académie La Plume", city: "Agadir, MA", status: "Active", plan: "Premium", health: "Healthy", license: "Active", version: "v2.8.1", heartbeat: "4 min ago", endpoint: "laplume.school.local" },
  { code: "SCH007", name: "École Al Qalam", city: "Meknès, MA", status: "Suspended", plan: "Standard", health: "Offline", license: "Revoked", version: "v2.5.2", heartbeat: "12 days ago", endpoint: "alqalam.school.local" },
  { code: "SCH008", name: "Lycée Riad", city: "Oujda, MA", status: "Active", plan: "Standard", health: "Healthy", license: "Active", version: "v2.8.0", heartbeat: "42 min ago", endpoint: "riad.school.local" },
];

const nav: { label: PageKey; icon: typeof LayoutDashboard; section: string; count?: number }[] = [
  { label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { label: "Schools", icon: Building2, section: "Fleet" }, { label: "Installations", icon: Database, section: "Fleet" }, { label: "Endpoints", icon: Cloud, section: "Fleet" },
  { label: "Subscriptions", icon: CreditCard, section: "Commercial" }, { label: "Licenses", icon: KeyRound, section: "Commercial" },
  { label: "Monitoring", icon: Activity, section: "Operations", count: 3 }, { label: "Connectivity", icon: Activity, section: "Operations" }, { label: "Releases", icon: Package, section: "Operations" }, { label: "Notifications", icon: Bell, section: "Operations" },
  { label: "Support Access", icon: LifeBuoy, section: "Governance", count: 2 }, { label: "Audit Logs", icon: FileClock, section: "Governance" }, { label: "Settings", icon: Settings, section: "System" },
];

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) { return <span className={`badge badge-${tone}`}><span className="badge-dot" />{children}</span>; }
function tone(value: string) { const v = value.toLowerCase(); if (v.includes("healthy") || v.includes("active") || v.includes("delivered") || v.includes("approved")) return "success"; if (v.includes("degraded") || v.includes("grace") || v.includes("pending") || v.includes("onboarding")) return "warning"; if (v.includes("offline") || v.includes("revoked") || v.includes("failed") || v.includes("suspended")) return "danger"; if (v.includes("connected")) return "info"; return "neutral"; }
function Stat({ label, value, helper, icon: Icon, accent = "indigo", onClick }: { label: string; value: string; helper: string; icon: typeof Activity; accent?: string; onClick?: () => void }) { return <button className="stat-card" onClick={onClick}><div className={`stat-icon ${accent}`}><Icon size={17} /></div><div className="stat-label">{label}</div><strong>{value}</strong><small>{helper}</small></button>; }
function Sparkline() { return <div className="chart"><div className="chart-grid" /><svg viewBox="0 0 700 190" preserveAspectRatio="none"><path d="M0 150 C35 120 48 142 78 110 S124 132 154 88 S203 126 236 82 S278 118 310 60 S355 105 392 77 S440 98 468 48 S520 83 555 42 S606 74 640 28 S675 49 700 18 L700 190 L0 190Z" fill="url(#fill)"/><path d="M0 150 C35 120 48 142 78 110 S124 132 154 88 S203 126 236 82 S278 118 310 60 S355 105 392 77 S440 98 468 48 S520 83 555 42 S606 74 640 28 S675 49 700 18" fill="none" stroke="#6366f1" strokeWidth="3"/><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6366f1" stopOpacity=".2"/><stop offset="1" stopColor="#6366f1" stopOpacity="0"/></linearGradient></defs></svg><div className="chart-axis"><span>7 days ago</span><span>Today</span></div></div> }
function Donut() { return <div className="donut-wrap"><div className="donut"><div><strong>8</strong><span>schools</span></div></div><div className="legend"><span><i className="dot green" />Healthy <b>5</b></span><span><i className="dot amber" />Degraded <b>1</b></span><span><i className="dot red" />Offline <b>2</b></span></div></div> }

export default function App() {
  const [page, setPage] = useState<PageKey>("Dashboard"); const [dark, setDark] = useState(true); const [search, setSearch] = useState(""); const [banner, setBanner] = useState(true); const [toast, setToast] = useState(""); const [sidebar, setSidebar] = useState(true); const [filter, setFilter] = useState("All"); const [modal, setModal] = useState<PageKey | null>(null);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };
  const filtered = useMemo(() => schools.filter(s => (filter === "All" || s.health === filter) && `${s.name} ${s.code} ${s.city}`.toLowerCase().includes(search.toLowerCase())), [filter, search]);
  const sections = [...new Set(nav.map(n => n.section))];
  return <div className={dark ? "app dark" : "app"}>
    <aside className={`sidebar ${sidebar ? "" : "collapsed"}`}><div className="brand"><div className="brand-mark">CF</div>{sidebar && <div><strong>control<span>plane</span></strong><small>LOCAL-FIRST CLOUD</small></div>}<button className="icon-btn sidebar-toggle" onClick={() => setSidebar(!sidebar)} aria-label="Toggle sidebar"><PanelLeft size={17} /></button></div>
      <div className="workspace"><div className="workspace-avatar">HR</div>{sidebar && <div><b>H-R-F Education</b><small>Demo workspace</small></div>}<ChevronDown size={14} /></div>
      <nav>{sections.map(section => <div className="nav-section" key={section}>{sidebar && <span className="nav-heading">{section}</span>}{nav.filter(n => n.section === section).map(item => { const Icon = item.icon; return <button key={item.label} className={`nav-item ${page === item.label ? "active" : ""}`} onClick={() => setPage(item.label)} title={item.label}><Icon size={17} />{sidebar && <span>{item.label}</span>}{sidebar && item.count && <em>{item.count}</em>}</button> })}</div>)}</nav>
      {sidebar && <div className="sidebar-footer"><div className="user-avatar">AO</div><div><b>Amina Ops</b><small>Platform Admin</small></div><button className="icon-btn" onClick={() => notify("Signed out of demo mode") }><LogOut size={15}/></button></div>}
    </aside>
    <main className="main"><header className="topbar"><div className="breadcrumbs"><span>Control Plane</span><ChevronRight size={14}/><b>{page}</b></div><div className="command-search" onClick={() => notify("Command search is ready") }><Search size={15}/><span>Search schools, pages...</span><kbd><Command size={11}/>K</kbd></div><div className="top-actions"><span className="demo-pill"><span />DEMO MODE</span><button className="icon-btn" onClick={() => notify("No new notifications")} aria-label="Notifications"><Bell size={18}/><i className="notification-dot" /></button><button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><div className="top-avatar">AO</div></div></header>
      <div className="content">{banner && <div className="demo-banner"><div><ShieldCheck size={17}/><span><b>You are viewing a demo with mocked data.</b> No backend is connected. Actions are simulated.</span></div><button className="icon-btn" onClick={() => setBanner(false)} aria-label="Dismiss banner"><X size={16}/></button></div>}
        {page === "Dashboard" ? <Dashboard setPage={setPage} notify={notify}/> : page === "Endpoints" ? <CloudflareTunnelsPage notify={notify}/> : page === "Connectivity" ? <ConnectivityPage notify={notify}/> : <DataPage page={page} schools={filtered} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} notify={notify} onCreate={() => setModal(page)}/>}</div>
    </main>{modal && <CreateModal page={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); notify(`${modal} created in demo mode`) }} />}{toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}
