import { useMemo, useState } from "react";
import {
  Activity, AlertCircle, AlertTriangle, ArrowUpDown, Bell, Building2, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, FileText, Mail, Phone, UserRound, Server, Network, HeartPulse, Layers, Receipt, Users, Shield, GitBranch,
  Cloud, Command, CreditCard, Database, ExternalLink, FileClock, Gauge, KeyRound, MapPin,
  LayoutDashboard, LifeBuoy, LogOut, MoreHorizontal, Package, PanelLeft,
  Plus, RefreshCw, Search, Settings, ShieldCheck, X,
} from "lucide-react";

type PageKey = "Overview" | "Schools" | "All Schools" | "Register School" | "Installations" | "Endpoints" | "Servers" | "Cloudflare Tunnels" | "Connectivity" | "System Health" | "Plans" | "Subscriptions" | "Payments" | "Licenses" | "Heartbeats" | "Errors" | "Monitoring" | "Releases" | "Versions" | "Update Status" | "Notifications" | "Administrators" | "Permissions" | "Support Access" | "Audit Logs" | "Settings";
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
  { label: "Overview", icon: LayoutDashboard, section: "Overview" },
  { label: "All Schools", icon: Building2, section: "Schools" },
  { label: "Register School", icon: Plus, section: "Schools" },
  { label: "Installations", icon: Database, section: "Schools" },
  { label: "Servers", icon: Server, section: "Infrastructure" },
  { label: "Cloudflare Tunnels", icon: Network, section: "Infrastructure" },
  { label: "Connectivity", icon: Gauge, section: "Infrastructure" },
  { label: "System Health", icon: HeartPulse, section: "Infrastructure" },
  { label: "Plans", icon: Layers, section: "Subscriptions & Billing" },
  { label: "Subscriptions", icon: Receipt, section: "Subscriptions & Billing" },
  { label: "Payments", icon: CreditCard, section: "Subscriptions & Billing" },
  { label: "Licenses", icon: KeyRound, section: "Subscriptions & Billing" },
  { label: "Heartbeats", icon: Activity, section: "Monitoring" },
  { label: "Errors", icon: AlertTriangle, section: "Monitoring" },
  { label: "Audit Logs", icon: FileClock, section: "Monitoring" },
  { label: "Releases", icon: ShieldCheck, section: "Software" },
  { label: "Versions", icon: GitBranch, section: "Software" },
  { label: "Update Status", icon: RefreshCw, section: "Software" },
  { label: "Notifications", icon: Bell, section: "System" },
  { label: "Administrators", icon: Users, section: "System" },
  { label: "Permissions", icon: Shield, section: "System" },
  { label: "Settings", icon: Settings, section: "System" },
];

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) { return <span className={`badge badge-${tone}`}><span className="badge-dot" />{children}</span>; }
function tone(value: string) { const v = value.toLowerCase(); if (v.includes("healthy") || v.includes("active") || v.includes("delivered") || v.includes("approved")) return "success"; if (v.includes("degraded") || v.includes("grace") || v.includes("pending") || v.includes("onboarding")) return "warning"; if (v.includes("offline") || v.includes("revoked") || v.includes("failed") || v.includes("suspended")) return "danger"; if (v.includes("connected")) return "info"; return "neutral"; }
function Stat({ label, value, helper, icon: Icon, accent = "indigo", onClick }: { label: string; value: string; helper: string; icon: typeof Activity; accent?: string; onClick?: () => void }) { return <button className="stat-card" onClick={onClick}><div className={`stat-icon ${accent}`}><Icon size={17} /></div><div className="stat-label">{label}</div><strong>{value}</strong><small>{helper}</small></button>; }
function Sparkline() { return <div className="connectivity-summary"><div className="connectivity-summary-head"><span>Reported installation state</span><span>Schools</span></div><div className="connectivity-row"><span><i className="dot green"/>Online</span><div className="connectivity-track"><i className="online" style={{width:"62.5%"}}/></div><b>5</b></div><div className="connectivity-row"><span><i className="dot amber"/>Degraded</span><div className="connectivity-track"><i className="degraded" style={{width:"12.5%"}}/></div><b>1</b></div><div className="connectivity-row"><span><i className="dot red"/>Offline</span><div className="connectivity-track"><i className="offline" style={{width:"25%"}}/></div><b>2</b></div><p className="connectivity-footnote">Illustrative states only. No live heartbeat service is connected.</p></div> }
function Donut() { return <div className="donut-wrap"><div className="donut"><div><strong>8</strong><span>schools</span></div></div><div className="legend"><span><i className="dot green" />Healthy <b>5</b></span><span><i className="dot amber" />Degraded <b>1</b></span><span><i className="dot red" />Offline <b>2</b></span></div></div> }

export default function CentralPlatformApp() {
  const [page, setPage] = useState<PageKey>("Overview"); const [search, setSearch] = useState(""); const [banner, setBanner] = useState(true); const [toast, setToast] = useState(""); const [sidebar, setSidebar] = useState(true); const [filter, setFilter] = useState("All"); const [modal, setModal] = useState<PageKey | null>(null);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };
  const filtered = useMemo(() => schools.filter(s => (filter === "All" || s.health === filter) && `${s.name} ${s.code} ${s.city}`.toLowerCase().includes(search.toLowerCase())), [filter, search]);
  const sections = [...new Set(nav.map(n => n.section))];
  return <div className="central-platform-root"><div className="app">
    <aside className={`sidebar ${sidebar ? "" : "collapsed"}`}><div className="brand"><div className="brand-mark">CF</div>{sidebar && <div><strong>Central School SaaS</strong><small>OPERATIONS CONTROL PLANE</small></div>}<button className="icon-btn sidebar-toggle" onClick={() => setSidebar(!sidebar)} aria-label="Toggle sidebar"><PanelLeft size={17} /></button></div>
      <div className="workspace"><div className="workspace-avatar">HR</div>{sidebar && <div><b>H-R-F Education</b><small>Demo workspace</small></div>}<ChevronDown size={14} /></div>
      <a className="workspace-switch-link" href="/overview" title="Open Local School App"><Building2 size={15}/>{sidebar && <span>Open School App</span>}</a>
      <nav>{sections.map(section => <div className="nav-section" key={section}>{sidebar && <span className="nav-heading">{section}</span>}{nav.filter(n => n.section === section).map(item => { const Icon = item.icon; return <button key={item.label} className={`nav-item ${page === item.label ? "active" : ""}`} onClick={() => setPage(item.label)} title={item.label}><Icon size={17} />{sidebar && <span>{item.label}</span>}{sidebar && item.count && <em>{item.count}</em>}</button> })}</div>)}</nav>
      {sidebar && <div className="sidebar-footer"><div className="user-avatar">AO</div><div><b>Amina Ops</b><small>Platform Admin</small></div><button className="icon-btn" onClick={() => notify("Signed out of demo mode") }><LogOut size={15}/></button></div>}
    </aside>
    <main className="main"><header className="topbar"><div className="breadcrumbs"><span>Control Plane</span><ChevronRight size={14}/><b>{page}</b></div><div className="command-search" onClick={() => notify("Command search is ready") }><Search size={15}/><span>Search schools, pages...</span><kbd><Command size={11}/>K</kbd></div><div className="top-actions"><span className="demo-pill"><span />DEMO MODE</span><button className="icon-btn" onClick={() => notify("No new notifications")} aria-label="Notifications"><Bell size={18}/><i className="notification-dot" /></button><div className="top-avatar">AO</div></div></header>
      <div className="content">{banner && <div className="demo-banner"><div><ShieldCheck size={17}/><span><b>You are viewing a demo with mocked data.</b> No backend is connected. Actions are simulated.</span></div><button className="icon-btn" onClick={() => setBanner(false)} aria-label="Dismiss banner"><X size={16}/></button></div>}
        {page === "Overview" ? <Dashboard setPage={setPage} notify={notify} setSearch={setSearch}/> : (page === "Schools" || page === "All Schools") ? <AllSchoolsPage setPage={setPage} setSearch={setSearch} notify={notify}/> : page === "Register School" ? <RegisterSchoolPage setPage={setPage} notify={notify}/> : <DataPage page={page} schools={filtered} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} notify={notify} onCreate={() => setModal(page)}/>}</div>
    </main>{modal && <CreateModal page={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); notify(`${modal} created in demo mode`) }} />}{toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div></div>;
}

function CreateModal({ page, onClose, onSave }: { page: PageKey; onClose: () => void; onSave: () => void }) { const [name, setName] = useState(""); const singular = page === "Schools" ? "school" : page === "Releases" ? "release" : page.slice(0, -1).toLowerCase(); return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">DEMO WORKSPACE</span><h2 id="create-title">Create {singular}</h2><p>This form updates the interface for the current session.</p></div><button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={18}/></button></div><label>Name<input autoFocus value={name} onChange={event => setName(event.target.value)} placeholder={`Enter ${singular} name`} /></label><label>Status<select defaultValue="Active"><option>Active</option><option>Pending</option><option>Draft</option></select></label><div className="modal-actions"><button className="btn secondary" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!name.trim()} onClick={onSave}><Check size={15}/>Create {singular}</button></div></section></div> }

type OverviewSchool = {
  code: string; name: string; plan: string; license: "Active" | "Suspended" | "Expired";
  connectivity: "Online" | "Offline"; heartbeat: string; heartbeatSort: number;
};
type OverviewAlert = {
  id: string; school: string; code: string; title: string; severity: "Critical" | "Warning";
  timestamp: string; sort: number; destination: PageKey;
};
type OverviewActivity = {
  id: string; event: string; school: string; timestamp: string; sort: number;
  category: "Registration" | "License" | "Connectivity" | "Subscription" | "Software";
};
const overviewSchools: OverviewSchool[] = [
  {code:"SCH-001",name:"École Atlas",plan:"Professional",license:"Active",connectivity:"Online",heartbeat:"09 Nov 2026, 14:20 UTC · demo",heartbeatSort:Date.UTC(2026,10,9,14,20)},
  {code:"SCH-002",name:"Groupe Scolaire Al Amal",plan:"Enterprise",license:"Active",connectivity:"Offline",heartbeat:"09 Nov 2026, 12:05 UTC · demo",heartbeatSort:Date.UTC(2026,10,9,12,5)},
  {code:"SCH-003",name:"Institution Al Manar",plan:"Starter",license:"Suspended",connectivity:"Online",heartbeat:"09 Nov 2026, 14:12 UTC · demo",heartbeatSort:Date.UTC(2026,10,9,14,12)},
  {code:"SCH-004",name:"École Les Orangers",plan:"Professional",license:"Active",connectivity:"Online",heartbeat:"09 Nov 2026, 14:17 UTC · demo",heartbeatSort:Date.UTC(2026,10,9,14,17)},
  {code:"SCH-005",name:"Groupe Scolaire Al Waha",plan:"Enterprise",license:"Expired",connectivity:"Offline",heartbeat:"08 Nov 2026, 21:40 UTC · demo",heartbeatSort:Date.UTC(2026,10,8,21,40)},
  {code:"SCH-006",name:"Institution Al Fajr",plan:"Professional",license:"Active",connectivity:"Online",heartbeat:"09 Nov 2026, 14:24 UTC · demo",heartbeatSort:Date.UTC(2026,10,9,14,24)}
];
const overviewAlerts: OverviewAlert[] = [
  {id:"ALT-2401",school:"Groupe Scolaire Al Amal",code:"SCH-002",title:"School server unreachable",severity:"Critical",timestamp:"09 Nov 2026, 14:05 UTC · demo",sort:Date.UTC(2026,10,9,14,5),destination:"Monitoring"},
  {id:"ALT-2398",school:"Groupe Scolaire Al Waha",code:"SCH-005",title:"Cloudflare Tunnel disconnected",severity:"Critical",timestamp:"09 Nov 2026, 13:42 UTC · demo",sort:Date.UTC(2026,10,9,13,42),destination:"Installations"},
  {id:"ALT-2392",school:"École Atlas",code:"SCH-001",title:"License approaching expiration",severity:"Warning",timestamp:"09 Nov 2026, 11:30 UTC · demo",sort:Date.UTC(2026,10,9,11,30),destination:"Licenses"},
  {id:"ALT-2387",school:"Groupe Scolaire Al Waha",code:"SCH-005",title:"Backup operation failed",severity:"Critical",timestamp:"08 Nov 2026, 21:45 UTC · demo",sort:Date.UTC(2026,10,8,21,45),destination:"Monitoring"}
];
const overviewActivities: OverviewActivity[] = [
  {id:"ACT-501",event:"New school registered",school:"Institution Al Fajr",timestamp:"09 Nov 2026, 14:10 UTC · demo",sort:Date.UTC(2026,10,9,14,10),category:"Registration"},
  {id:"ACT-498",event:"License activated",school:"École Atlas",timestamp:"09 Nov 2026, 12:55 UTC · demo",sort:Date.UTC(2026,10,9,12,55),category:"License"},
  {id:"ACT-494",event:"Server reconnected",school:"Groupe Scolaire Al Amal",timestamp:"09 Nov 2026, 11:40 UTC · demo",sort:Date.UTC(2026,10,9,11,40),category:"Connectivity"},
  {id:"ACT-489",event:"Subscription renewed",school:"Groupe Scolaire Al Waha",timestamp:"08 Nov 2026, 16:25 UTC · demo",sort:Date.UTC(2026,10,8,16,25),category:"Subscription"},
  {id:"ACT-482",event:"Software update reported complete",school:"Institution Al Manar",timestamp:"08 Nov 2026, 10:15 UTC · demo",sort:Date.UTC(2026,10,8,10,15),category:"Software"}
];
function dateCutoff(range: string) {
  if (range === "24h") return Date.UTC(2026,10,8,14,30);
  if (range === "7d") return Date.UTC(2026,10,2,14,30);
  return Date.UTC(2026,9,10,14,30);
}
function Dashboard({ setPage, notify, setSearch }: { setPage: (page: PageKey) => void; notify: (s: string) => void; setSearch: (s: string) => void }) {
  const [dateRange,setDateRange] = useState("7d");
  const [refreshing,setRefreshing] = useState(false);
  const [refreshNote,setRefreshNote] = useState("");
  const [schoolSearch,setSchoolSearch] = useState("");
  const [licenseFilter,setLicenseFilter] = useState("All");
  const [connectivityFilter,setConnectivityFilter] = useState("All");
  const [sortKey,setSortKey] = useState<"name"|"code"|"plan"|"license"|"connectivity"|"heartbeat">("name");
  const [sortDirection,setSortDirection] = useState<"asc"|"desc">("asc");
  const [openMenu,setOpenMenu] = useState<string|null>(null);
  const [snapshot,setSnapshot] = useState(0);
  const cutoff = dateCutoff(dateRange);
  const visibleAlerts = overviewAlerts.filter(a=>a.sort>=cutoff).sort((a,b)=>b.sort-a.sort);
  const visibleActivity = overviewActivities.filter(a=>a.sort>=cutoff).sort((a,b)=>b.sort-a.sort);
  const filteredSchools = overviewSchools.filter(s=>
    (licenseFilter==="All"||s.license===licenseFilter) &&
    (connectivityFilter==="All"||s.connectivity===connectivityFilter) &&
    (s.name+" "+s.code).toLowerCase().includes(schoolSearch.trim().toLowerCase())
  ).sort((a,b)=>{
    const left=sortKey==="heartbeat"?a.heartbeatSort:String(a[sortKey]).toLowerCase();
    const right=sortKey==="heartbeat"?b.heartbeatSort:String(b[sortKey]).toLowerCase();
    const result=left<right?-1:left>right?1:0;
    return sortDirection==="asc"?result:-result;
  });
  const resetFilters=()=>{setSchoolSearch("");setLicenseFilter("All");setConnectivityFilter("All");};
  const sortBy=(key:typeof sortKey)=>{
    if(sortKey===key)setSortDirection(d=>d==="asc"?"desc":"asc");
    else{setSortKey(key);setSortDirection("asc");}
  };
  const goToSchoolContext=(page:PageKey,code:string)=>{
    setSearch(code);
    setPage(page);
    setOpenMenu(null);
  };
  const refresh=()=>{
    if(refreshing)return;
    setRefreshing(true);
    setRefreshNote("Reloading the local demonstration snapshot…");
    window.setTimeout(()=>{
      setSnapshot(v=>v+1);
      setRefreshing(false);
      setRefreshNote("No live data source is connected. The demonstration snapshot is unchanged.");
    },350);
  };
  const iconFor=(category:OverviewActivity["category"])=>{
    if(category==="Registration")return <Building2 size={15}/>;
    if(category==="License")return <KeyRound size={15}/>;
    if(category==="Connectivity")return <Cloud size={15}/>;
    if(category==="Subscription")return <CreditCard size={15}/>;
    return <Package size={15}/>;
  };
  const SortButton=({label,k}:{label:string;k:typeof sortKey})=><button className="ov-sort" onClick={()=>sortBy(k)} aria-label={"Sort by "+label}>{label}<span>{sortKey===k?(sortDirection==="asc"?"↑":"↓"):"↕"}</span></button>;
  return <div className="overview-page" data-snapshot={snapshot}>
    <div className="ov-page-head">
      <div><span className="eyebrow">OPERATIONS</span><h1>Overview</h1><p>Monitor your school network, infrastructure, and platform operations.</p></div>
      <div className="ov-head-controls">
        <label className="ov-range"><span>Date range</span><select value={dateRange} onChange={e=>setDateRange(e.target.value)} aria-label="Date range"><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></label>
        <button className="btn secondary ov-refresh" onClick={refresh} disabled={refreshing}><RefreshCw size={14} className={refreshing?"ov-spin":""}/>{refreshing?"Refreshing…":"Refresh"}</button>
      </div>
    </div>
    {refreshNote&&<div className="ov-refresh-note" role="status">{refreshNote}</div>}
    <div className="ov-metrics" aria-label="Key school network metrics">
      <div className="ov-primary-metric"><span>Total Schools</span><strong>128</strong><small>Registered school installations</small></div>
      <div className="ov-primary-metric"><span>Active Subscriptions</span><strong>112</strong><small>Schools with active subscriptions</small></div>
      <div className="ov-connectivity-metrics">
        <div><span><i className="ov-dot online"/>Schools Online</span><strong>103</strong><small>Currently reporting online</small></div>
        <div><span><i className="ov-dot offline"/>Schools Offline</span><strong>25</strong><small>Not reporting online</small></div>
      </div>
      <div className="ov-compact-metrics">
        <div><span>Suspended Licenses</span><strong>6</strong><small>Licenses currently suspended</small></div>
        <div><span>Infrastructure Alerts</span><strong>4</strong><small>Requiring operational attention</small></div>
      </div>
    </div>
    <div className="ov-top-grid">
      <section className="ov-panel ov-connectivity-panel" aria-labelledby="ov-connectivity-title">
        <div className="ov-section-head"><div><h2 id="ov-connectivity-title">School Connectivity</h2><p>Network reachability across 128 registered schools <span className="ov-demo-tag">DEMO DATA</span></p></div><button className="ov-text-action" onClick={()=>setPage("Monitoring")}>Open monitoring <ChevronRight size={14}/></button></div>
        <div className="ov-connectivity-total"><strong>128</strong><span>Total schools</span><small>103 online · 25 offline</small></div>
        <div className="ov-distribution" role="img" aria-label="School connectivity distribution: 103 online schools, 25 offline schools, out of 128 total.">
          <span className="ov-distribution-online" style={{width:"80.46875%"}}/><span className="ov-distribution-offline" style={{width:"19.53125%"}}/>
        </div>
        <div className="ov-connectivity-legend">
          <div><span><i className="ov-dot online"/>Online</span><strong>103 <small>80.47%</small></strong></div>
          <div><span><i className="ov-dot offline"/>Offline</span><strong>25 <small>19.53%</small></strong></div>
        </div>
        <div className="ov-monitoring-meta"><span>Last monitoring update</span><strong>Unavailable</strong><small>No live monitoring service is connected in this demo.</small></div>
      </section>
      <section className="ov-panel ov-alerts-panel" aria-labelledby="ov-alerts-title">
        <div className="ov-section-head"><div><h2 id="ov-alerts-title">Recent Alerts</h2><p>Operational issues requiring attention <span className="ov-demo-tag">DEMO DATA</span></p></div><span className="ov-alert-count">4</span></div>
        <div className="ov-alert-list">
          {visibleAlerts.map(alert=><article className="ov-alert" key={alert.id}>
            <div className={"ov-alert-mark "+(alert.severity==="Critical"?"critical":"warning")}>{alert.severity==="Critical"?<AlertCircle size={15}/>:<AlertTriangle size={15}/>}</div>
            <div className="ov-alert-body"><div className="ov-alert-title">{alert.title}</div><div className="ov-alert-school">{alert.school} <code>{alert.code}</code></div><div className="ov-alert-meta"><span className={"ov-severity "+(alert.severity==="Critical"?"critical":"warning")}>{alert.severity}</span><time>{alert.timestamp}</time></div></div>
            <button className="ov-view-action" onClick={()=>goToSchoolContext(alert.destination,alert.code)}>View Details</button>
          </article>)}
          {visibleAlerts.length===0&&<div className="ov-empty-inline">No demonstration alerts in this date range.</div>}
        </div>
      </section>
    </div>
    <section className="ov-panel ov-schools-panel" aria-labelledby="ov-schools-title">
      <div className="ov-section-head ov-schools-heading"><div><h2 id="ov-schools-title">Schools Overview</h2><p>School registry snapshot · fictional sample records <span className="ov-demo-tag">DEMO DATA</span></p></div><button className="ov-text-action" onClick={()=>{resetFilters();setPage("Schools");}}>View All Schools <ChevronRight size={14}/></button></div>
      <div className="ov-table-toolbar">
        <label className="ov-search"><Search size={15}/><input value={schoolSearch} onChange={e=>setSchoolSearch(e.target.value)} placeholder="Search school name or code" aria-label="Search school name or code"/></label>
        <label className="ov-filter"><span>License</span><select value={licenseFilter} onChange={e=>setLicenseFilter(e.target.value)}><option>All</option><option>Active</option><option>Suspended</option><option>Expired</option></select></label>
        <label className="ov-filter"><span>Connectivity</span><select value={connectivityFilter} onChange={e=>setConnectivityFilter(e.target.value)}><option>All</option><option>Online</option><option>Offline</option></select></label>
        <button className="ov-reset" onClick={resetFilters} disabled={!schoolSearch&&!((licenseFilter!=="All")||(connectivityFilter!=="All"))}>Clear filters</button>
      </div>
      <div className="ov-table-wrap">
        <table className="ov-school-table">
          <thead><tr><th><SortButton label="School Name" k="name"/></th><th><SortButton label="School Code" k="code"/></th><th><SortButton label="Subscription" k="plan"/></th><th><SortButton label="License Status" k="license"/></th><th><SortButton label="Connectivity" k="connectivity"/></th><th><SortButton label="Last Heartbeat" k="heartbeat"/></th><th><span className="ov-actions-label">Actions</span></th></tr></thead>
          <tbody>
            {filteredSchools.map(school=><tr key={school.code}>
              <td><button className="ov-school-name" onClick={()=>notify("School Details is not available in this demo workspace yet.")}>{school.name}</button></td>
              <td><code>{school.code}</code></td>
              <td>{school.plan}</td>
              <td><span className={"ov-status "+(school.license==="Active"?"success":school.license==="Suspended"?"warning":"danger")}>{school.license}</span></td>
              <td><span className={"ov-status "+(school.connectivity==="Online"?"success":"danger")}>{school.connectivity}</span></td>
              <td><time className="ov-heartbeat">{school.heartbeat}</time></td>
              <td><div className="ov-row-menu"><button className="ov-menu-trigger" aria-label={"Actions for "+school.name} aria-expanded={openMenu===school.code} onClick={()=>setOpenMenu(openMenu===school.code?null:school.code)}><MoreHorizontal size={17}/></button>
                {openMenu===school.code&&<div className="ov-menu" role="menu">
                  <button role="menuitem" onClick={()=>{setOpenMenu(null);notify("School Details is not available in this demo workspace yet.");}}>View Details <span>Unavailable</span></button>
                  <button role="menuitem" onClick={()=>goToSchoolContext("Installations",school.code)}>View Infrastructure</button>
                  <button role="menuitem" onClick={()=>goToSchoolContext("Audit Logs",school.code)}>View Activity</button>
                </div>}
              </div></td>
            </tr>)}
            {filteredSchools.length===0&&<tr><td colSpan={7}><div className="ov-empty-table"><Search size={18}/><strong>No schools match these filters</strong><span>Try another search or clear the selected filters.</span><button onClick={resetFilters}>Clear filters</button></div></td></tr>}
          </tbody>
        </table>
      </div>
      <div className="ov-table-footer"><span>Showing {filteredSchools.length} of 6 demonstration school records</span><span>License and connectivity are independent states.</span></div>
    </section>
    <section className="ov-panel ov-activity-panel" aria-labelledby="ov-activity-title">
      <div className="ov-section-head"><div><h2 id="ov-activity-title">Recent Activity</h2><p>Chronological operational events <span className="ov-demo-tag">DEMO DATA</span></p></div><button className="ov-text-action" onClick={()=>setPage("Audit Logs")}>Open audit logs <ChevronRight size={14}/></button></div>
      <div className="ov-activity-list">
        {visibleActivity.map(activity=><div className="ov-activity" key={activity.id}><div className={"ov-activity-icon "+activity.category.toLowerCase()}>{iconFor(activity.category)}</div><div className="ov-activity-copy"><strong>{activity.event}</strong><span>{activity.school}</span></div><time>{activity.timestamp}</time></div>)}
        {visibleActivity.length===0&&<div className="ov-empty-inline">No demonstration activity in this date range.</div>}
      </div>
    </section>
  </div>;
}


type RegistryLicense = "Active" | "Pending" | "Suspended" | "Expired" | "Deactivated";
type RegistryConnectivity = "Online" | "Offline" | "Unknown";
type RegistrySchool = { name:string; code:string; city:string; plan:"Basic"|"Professional"|"Enterprise"; license:RegistryLicense; connectivity:RegistryConnectivity; heartbeat:string; heartbeatRank:number };
const registrySeeds:RegistrySchool[] = [
{name:"Atlas International School",code:"ATS-001",city:"Casablanca",plan:"Professional",license:"Active",connectivity:"Online",heartbeat:"2 min ago",heartbeatRank:2},
{name:"Al Amal School",code:"AAS-002",city:"Rabat",plan:"Basic",license:"Active",connectivity:"Offline",heartbeat:"3 days ago",heartbeatRank:4320},
{name:"Future Academy",code:"FAC-003",city:"Marrakech",plan:"Enterprise",license:"Suspended",connectivity:"Online",heartbeat:"1 min ago",heartbeatRank:1},
{name:"Ibn Sina School",code:"ISS-004",city:"Fes",plan:"Professional",license:"Pending",connectivity:"Unknown",heartbeat:"Never",heartbeatRank:999999},
{name:"Horizon School",code:"HZS-005",city:"Tangier",plan:"Basic",license:"Expired",connectivity:"Offline",heartbeat:"12 days ago",heartbeatRank:17280},
{name:"Green Valley School",code:"GVS-006",city:"Agadir",plan:"Professional",license:"Active",connectivity:"Online",heartbeat:"5 min ago",heartbeatRank:5},
{name:"Al Waha Institution",code:"AWI-007",city:"Meknes",plan:"Enterprise",license:"Active",connectivity:"Online",heartbeat:"8 min ago",heartbeatRank:8},
{name:"Les Palmiers School",code:"LPS-008",city:"Kenitra",plan:"Basic",license:"Deactivated",connectivity:"Unknown",heartbeat:"Never",heartbeatRank:999999},
{name:"Al Fajr Academy",code:"AFA-009",city:"Oujda",plan:"Professional",license:"Pending",connectivity:"Offline",heartbeat:"1 day ago",heartbeatRank:1440},
{name:"Al Andalous School",code:"ADS-010",city:"El Jadida",plan:"Enterprise",license:"Active",connectivity:"Online",heartbeat:"3 min ago",heartbeatRank:3}
];
const registryCities=["Casablanca","Rabat","Marrakech","Fes","Tangier","Agadir","Meknes","Kenitra","Oujda","El Jadida"];
const registryPlans:RegistrySchool["plan"][]=["Basic","Professional","Enterprise"];
const registryLicenses:RegistryLicense[]=["Active","Active","Active","Pending","Suspended","Expired"];
const registryConnectivity:RegistryConnectivity[]=["Online","Online","Offline","Unknown"];
const registrySchools:RegistrySchool[]=[...registrySeeds,...Array.from({length:118},(_,index)=>{
 const n=index+11,license=registryLicenses[(n*7)%registryLicenses.length],connectivity=registryConnectivity[(n*5)%registryConnectivity.length],minutes=(n*13)%180;
 return {name:"Demo School "+String(n).padStart(3,"0"),code:"DMS-"+String(n).padStart(3,"0"),city:registryCities[n%10],plan:registryPlans[n%3],license,connectivity,heartbeat:connectivity==="Unknown"?"Never":connectivity==="Offline"?(n%2?"2 days ago":"6 hours ago"):(minutes||1)+" min ago",heartbeatRank:connectivity==="Unknown"?999999:connectivity==="Offline"?(n%2?2880:360):(minutes||1)};
})];
function registryTone(status:string){if(status==="Active"||status==="Online")return "success";if(status==="Pending")return "info";if(status==="Suspended")return "warning";if(status==="Expired"||status==="Offline")return "danger";return "neutral";}
function AllSchoolsPage({setPage,setSearch,notify}:{setPage:(page:PageKey)=>void;setSearch:(value:string)=>void;notify:(message:string)=>void}){
 const [query,setQuery]=useState(""),[license,setLicense]=useState("All"),[connectivity,setConnectivity]=useState("All"),[plan,setPlan]=useState("All"),[city,setCity]=useState("All");
 const allSchools=useMemo(()=>[...registrySchools,...readLocalRegistrations()],[]);
 const localCount=allSchools.length-registrySchools.length;
 const [page,setCurrentPage]=useState(1),[pageSize,setPageSize]=useState(10),[sortKey,setSortKey]=useState<keyof RegistrySchool>("name"),[sortDirection,setSortDirection]=useState<"asc"|"desc">("asc"),[openMenu,setOpenMenu]=useState<string|null>(null);
 const hasFilters=Boolean(query||license!=="All"||connectivity!=="All"||plan!=="All"||city!=="All");
 const filtered=useMemo(()=>allSchools.filter(s=>(license==="All"||s.license===license)&&(connectivity==="All"||s.connectivity===connectivity)&&(plan==="All"||s.plan===plan)&&(city==="All"||s.city===city)&&(s.name+" "+s.code).toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>{
  const left=sortKey==="heartbeat"?a.heartbeatRank:String(a[sortKey]).toLowerCase(),right=sortKey==="heartbeat"?b.heartbeatRank:String(b[sortKey]).toLowerCase(),result=left<right?-1:left>right?1:0;
  return sortDirection==="asc"?result:-result;
 }),[allSchools,query,license,connectivity,plan,city,sortKey,sortDirection]);
 const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize)),currentPage=Math.min(page,pageCount),rows=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
 const reset=()=>{setQuery("");setLicense("All");setConnectivity("All");setPlan("All");setCity("All");setCurrentPage(1);};
 const sort=(key:keyof RegistrySchool)=>{if(sortKey===key)setSortDirection(v=>v==="asc"?"desc":"asc");else{setSortKey(key);setSortDirection("asc");}setCurrentPage(1);};
 const context=(destination:PageKey,code:string)=>{setSearch(code);setPage(destination);setOpenMenu(null);};
 const action=(label:string,school:RegistrySchool)=>{setOpenMenu(null);if(label==="View Infrastructure"){context("Installations",school.code);return;}if(label==="Manage Subscription"){context("Subscriptions",school.code);return;}if(label==="Manage License"){context("Licenses",school.code);return;}notify(label+" is not available in this demonstration workspace.");};
 const SortHeading=({label,k}:{label:string;k:keyof RegistrySchool})=><button className="as-sort" onClick={()=>sort(k)}>{label}<ArrowUpDown size={12} className={sortKey===k?"is-active":""}/></button>;
 return <div className="all-schools-page">
  <div className="as-page-head"><div><span className="eyebrow">SCHOOLS / REGISTRY</span><h1>All Schools</h1><p>Manage registered schools, their subscriptions, licenses, and server connectivity.</p></div><button className="btn primary as-register" onClick={()=>setPage("Register School")}><Plus size={15}/>Register School</button></div>
  <div className="as-demo-note"><span className="as-demo-dot"/>DEMONSTRATION REGISTRY <span>Fictional records · no live school or heartbeat service is connected</span></div>
  <section className="as-summary" aria-label="License summary"><div className="as-summary-total"><span>Total Schools</span><strong>{128+localCount}</strong></div><div><span>Active</span><strong>112</strong></div><div><span>Pending</span><strong>{4+localCount}</strong></div><div><span>Suspended</span><strong>6</strong></div><div><span>Expired</span><strong>6</strong></div><small>License lifecycle totals</small></section>
  <section className="as-registry card" aria-labelledby="as-registry-title">
   <div className="as-registry-head"><div><h2 id="as-registry-title">Schools</h2><p>Central registry · operational and commercial metadata only</p></div><span className="as-record-count">{filtered.length.toLocaleString()} records</span></div>
   <div className="as-toolbar">
    <label className="as-search"><Search size={15}/><input value={query} onChange={e=>{setQuery(e.target.value);setCurrentPage(1);}} placeholder="Search by school name or code..." aria-label="Search by school name or code"/></label>
    <label className="as-filter"><span>License status</span><select value={license} onChange={e=>{setLicense(e.target.value);setCurrentPage(1);}}><option>All</option>{["Active","Pending","Suspended","Expired","Deactivated"].map(v=><option key={v}>{v}</option>)}</select></label>
    <label className="as-filter"><span>Connectivity</span><select value={connectivity} onChange={e=>{setConnectivity(e.target.value);setCurrentPage(1);}}><option>All</option>{["Online","Offline","Unknown"].map(v=><option key={v}>{v}</option>)}</select></label>
    <label className="as-filter"><span>Plan</span><select value={plan} onChange={e=>{setPlan(e.target.value);setCurrentPage(1);}}><option>All</option>{registryPlans.map(v=><option key={v}>{v}</option>)}</select></label>
    <label className="as-filter as-city-filter"><span>City</span><select value={city} onChange={e=>{setCity(e.target.value);setCurrentPage(1);}}><option value="All">All cities</option>{registryCities.map(v=><option key={v}>{v}</option>)}</select></label>
    <button className="as-clear" onClick={reset} disabled={!hasFilters}><X size={13}/>Clear filters</button>
   </div>
   <div className="as-table-scroll"><table className="as-table">
    <thead><tr><th><SortHeading label="School Name" k="name"/></th><th><SortHeading label="School Code" k="code"/></th><th><SortHeading label="City" k="city"/></th><th><SortHeading label="Subscription Plan" k="plan"/></th><th><SortHeading label="License Status" k="license"/></th><th><SortHeading label="Connectivity" k="connectivity"/></th><th><SortHeading label="Last Heartbeat" k="heartbeat"/></th><th>Actions</th></tr></thead>
    <tbody>{rows.map(school=><tr key={school.code}>
     <td><div className="as-school-cell"><span className="as-school-mark">{school.name.split(" ").slice(0,2).map(w=>w[0]).join("").replace(/[ÉÈ]/g,"E")}</span><strong>{school.name}</strong></div></td>
     <td><code className="as-code">{school.code}</code></td><td><span className="as-city"><MapPin size={12}/>{school.city}</span></td><td><span className="as-plan">{school.plan}</span></td>
     <td><span className={"as-status "+registryTone(school.license)}><i/>{school.license}</span></td><td><span className={"as-status "+registryTone(school.connectivity)}><i/>{school.connectivity}</span></td>
     <td><time className="as-heartbeat">{school.heartbeat}</time></td><td><div className="as-actions"><button className="as-menu-trigger" aria-label={"Actions for "+school.name} aria-expanded={openMenu===school.code} onClick={()=>setOpenMenu(openMenu===school.code?null:school.code)}><MoreHorizontal size={17}/></button>
      {openMenu===school.code&&<div className="as-menu" role="menu">{["View Details","Edit School","View Infrastructure","Manage Subscription","Manage License"].map(label=><button key={label} role="menuitem" onClick={()=>action(label,school)}>{label}{(label==="View Details"||label==="Edit School")&&<span>Unavailable</span>}</button>)}</div>}
     </div></td></tr>)}
     {rows.length===0&&<tr><td colSpan={8}><div className="as-empty"><Search size={19}/><strong>No schools match these filters</strong><span>Try a different search or clear the selected filters.</span><button onClick={reset}>Clear filters</button></div></td></tr>}
    </tbody>
   </table></div>
   <footer className="as-footer"><span>Showing <b>{filtered.length===0?0:(currentPage-1)*pageSize+1}–{Math.min(currentPage*pageSize,filtered.length)}</b> of <b>{filtered.length}</b> schools</span><div className="as-pagination">
    <label>Rows per page<select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setCurrentPage(1);}}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label>
    <button aria-label="Previous page" disabled={currentPage<=1} onClick={()=>setCurrentPage(v=>Math.max(1,v-1))}><ChevronLeft size={15}/></button><span>Page <b>{currentPage}</b> of <b>{pageCount}</b></span><button aria-label="Next page" disabled={currentPage>=pageCount} onClick={()=>setCurrentPage(v=>Math.min(pageCount,v+1))}><ChevronRight size={15}/></button>
   </div></footer>
  </section>
  <p className="as-integrity-note">License status and connectivity are independent. Heartbeat values are fictional demonstration data, not verified monitoring events.</p>
 </div>;
}

function Attention({ icon: Icon, title, sub, tone: t, action, onClick }: { icon: typeof AlertCircle; title: string; sub: string; tone: string; action: string; onClick: () => void }) { return <div className="attention"><div className={`attention-icon ${t}`}><Icon size={16}/></div><div><b>{title}</b><small>{sub}</small></div><button className="link-btn" onClick={onClick}>{action}</button></div> }

type RegistrationForm = {
 schoolName:string; schoolCode:string; schoolType:string; city:string; address:string;
 schoolEmail:string; schoolPhone:string; contactName:string; contactRole:string;
 contactEmail:string; contactPhone:string; plan:string; billingCycle:string;
 startDate:string; endDate:string; notes:string;
};
const emptyRegistration:RegistrationForm={schoolName:"",schoolCode:"",schoolType:"",city:"",address:"",schoolEmail:"",schoolPhone:"",contactName:"",contactRole:"",contactEmail:"",contactPhone:"",plan:"",billingCycle:"",startDate:"",endDate:"",notes:""};
const REGISTRY_STORAGE_KEY="central-platform-demo-registered-schools";
const DRAFT_STORAGE_KEY="central-platform-demo-school-draft";
function readLocalRegistrations():RegistrySchool[]{
 try{const value=JSON.parse(window.localStorage.getItem(REGISTRY_STORAGE_KEY)||"[]");return Array.isArray(value)?value:[];}catch{return [];}
}
function RegistrationField({label,required,helper,error,children}:{label:string;required?:boolean;helper?:string;error?:string;children:React.ReactNode}){
 return <label className="rs-field"><span className="rs-label">{label}{required&&<i aria-hidden="true">*</i>}</span>{children}{helper&&<small className="rs-helper">{helper}</small>}{error&&<small className="rs-error" role="alert">{error}</small>}</label>;
}
function RegisterSchoolPage({setPage,notify}:{setPage:(page:PageKey)=>void;notify:(message:string)=>void}){
 const [form,setForm]=useState<RegistrationForm>(()=>{try{return {...emptyRegistration,...JSON.parse(window.localStorage.getItem(DRAFT_STORAGE_KEY)||"{}")};}catch{return emptyRegistration;}});
 const [touched,setTouched]=useState<Record<string,boolean>>({});
 const [attempted,setAttempted]=useState(false);
 const [success,setSuccess]=useState(false);
 const [savedCode,setSavedCode]=useState("");
 const [saving,setSaving]=useState(false);
 const [draftSaved,setDraftSaved]=useState(false);
 const update=(key:keyof RegistrationForm,value:string)=>{setForm(prev=>({...prev,[key]:key==="schoolCode"?value.toUpperCase().replace(/\s/g,""):value}));setDraftSaved(false);};
 const duplicateCode=()=>{const code=form.schoolCode.trim().toUpperCase();return registrySchools.some(s=>s.code.toUpperCase()===code)||readLocalRegistrations().some(s=>s.code.toUpperCase()===code);};
 const errors:Record<string,string>={};
 if(!form.schoolName.trim())errors.schoolName="School name is required.";
 if(!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(form.schoolCode))errors.schoolCode="Use uppercase letters or numbers separated by hyphens (e.g. ATS-001).";
 else if(duplicateCode())errors.schoolCode="This school code is already registered.";
 if(!form.schoolType)errors.schoolType="Select a school type.";
 if(!form.city.trim())errors.city="City is required.";
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.schoolEmail.trim()))errors.schoolEmail="Enter a valid school contact email.";
 if(!form.contactName.trim())errors.contactName="Contact name is required.";
 if(!form.contactRole)errors.contactRole="Select a contact role.";
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim()))errors.contactEmail="Enter a valid primary contact email.";
 if(!form.plan)errors.plan="Select a subscription plan.";
 if(!form.billingCycle)errors.billingCycle="Select a billing cycle.";
 if(!form.startDate)errors.startDate="Subscription start date is required.";
 if(!form.endDate)errors.endDate="Subscription end date is required.";
 if(form.startDate&&form.endDate&&form.endDate<=form.startDate)errors.endDate="End date must be later than the start date.";
 const valid=Object.keys(errors).length===0;
 const errorFor=(key:keyof RegistrationForm)=>((attempted||touched[key])?errors[key]:undefined);
 const mark=(key:keyof RegistrationForm)=>setTouched(v=>({...v,[key]:true}));
 const changed=JSON.stringify(form)!==JSON.stringify(emptyRegistration);
 const cancel=()=>{if(changed&&!window.confirm("Discard the information entered on this page?"))return;setPage("Schools");};
 const saveDraft=()=>{try{window.localStorage.setItem(DRAFT_STORAGE_KEY,JSON.stringify(form));setDraftSaved(true);notify("Draft saved in this browser only.");}catch{notify("Unable to save the draft in this browser.");}};
 const register=(event:React.FormEvent)=>{event.preventDefault();setAttempted(true);if(!valid)return;if(saving)return;setSaving(true);try{
  const entry:RegistrySchool={name:form.schoolName.trim(),code:form.schoolCode.trim().toUpperCase(),city:form.city.trim(),plan:form.plan as RegistrySchool["plan"],license:"Pending",connectivity:"Unknown",heartbeat:"Never",heartbeatRank:999999};
  const existing=readLocalRegistrations();window.localStorage.setItem(REGISTRY_STORAGE_KEY,JSON.stringify([...existing,entry]));window.localStorage.removeItem(DRAFT_STORAGE_KEY);setSavedCode(entry.code);setSuccess(true);
 }catch{notify("Registration could not be saved in this browser. Please try again.");}finally{setSaving(false);}};
 if(success)return <div className="rs-page"><div className="rs-success"><div className="rs-success-icon"><Check size={22}/></div><span className="rs-overline">DEMO REGISTRATION COMPLETE</span><h1>School record created</h1><p><strong>{form.schoolName}</strong> has been added to this browser's local demonstration registry.</p><div className="rs-success-record"><span>School code</span><code>{savedCode}</code><span>Initial license status</span><Badge tone="neutral">Pending</Badge><span>Infrastructure status</span><Badge tone="neutral">Not configured</Badge></div><p className="rs-success-note">This creates a central platform record only. No server was installed, configured, or connected. The record is stored locally in this browser, not in a central backend.</p><div className="rs-success-actions"><button className="btn secondary" onClick={()=>setPage("Schools")}>Back to All Schools</button><button className="btn primary" onClick={()=>{setForm(emptyRegistration);setTouched({});setAttempted(false);setSuccess(false);}}>Register another school</button></div></div></div>;
 return <div className="rs-page">
  <div className="rs-heading"><div><span className="rs-breadcrumb">Schools <ChevronRight size={12}/> Register School</span><h1>Register School</h1><p>Add a new school to your platform and prepare it for infrastructure setup.</p></div></div>
  <div className="rs-demo-disclosure"><span/><div><strong>Central record only</strong><small>Registration does not install, configure, or connect local school infrastructure.</small></div></div>
  <form className="rs-layout" onSubmit={register} noValidate>
   <div className="rs-form-panel">
    <section className="rs-section"><div className="rs-section-heading"><span className="rs-section-index">01</span><div><h2>School Information</h2><p>Enter the school's official identity and general contact details.</p></div></div>
     <div className="rs-fields">
      <RegistrationField label="School Name" required error={errorFor("schoolName")}><input value={form.schoolName} onChange={e=>update("schoolName",e.target.value)} onBlur={()=>mark("schoolName")} placeholder="e.g. Atlas International School"/></RegistrationField>
      <RegistrationField label="School Code" required helper="A unique identifier used to identify this school across the platform." error={errorFor("schoolCode")}><input className="rs-code-input" value={form.schoolCode} onChange={e=>update("schoolCode",e.target.value)} onBlur={()=>mark("schoolCode")} placeholder="e.g. ATS-001" autoCapitalize="characters"/></RegistrationField>
      <RegistrationField label="School Type" required error={errorFor("schoolType")}><select value={form.schoolType} onChange={e=>update("schoolType",e.target.value)} onBlur={()=>mark("schoolType")}><option value="">Select school type</option>{["Private School","Public School","International School","Other"].map(x=><option key={x}>{x}</option>)}</select></RegistrationField>
      <RegistrationField label="City" required error={errorFor("city")}><input value={form.city} onChange={e=>update("city",e.target.value)} onBlur={()=>mark("city")} placeholder="e.g. Casablanca"/></RegistrationField>
      <RegistrationField label="Address"><input value={form.address} onChange={e=>update("address",e.target.value)} placeholder="Street address (optional)"/></RegistrationField>
      <RegistrationField label="Contact Email" required error={errorFor("schoolEmail")}><div className="rs-input-icon"><Mail size={14}/><input type="email" value={form.schoolEmail} onChange={e=>update("schoolEmail",e.target.value)} onBlur={()=>mark("schoolEmail")} placeholder="office@school.ma"/></div></RegistrationField>
      <RegistrationField label="Contact Phone"><div className="rs-input-icon"><Phone size={14}/><input type="tel" value={form.schoolPhone} onChange={e=>update("schoolPhone",e.target.value)} placeholder="+212 5 22 00 00 00"/></div></RegistrationField>
     </div>
    </section>
    <section className="rs-section"><div className="rs-section-heading"><span className="rs-section-index">02</span><div><h2>Primary Contact</h2><p>Designate the main administrative contact for this school.</p></div></div>
     <div className="rs-contact-note"><UserRound size={14}/>This person is the school's administrative representative, not a school application user account.</div>
     <div className="rs-fields">
      <RegistrationField label="Contact Full Name" required error={errorFor("contactName")}><input value={form.contactName} onChange={e=>update("contactName",e.target.value)} onBlur={()=>mark("contactName")} placeholder="Full name"/></RegistrationField>
      <RegistrationField label="Contact Role" required error={errorFor("contactRole")}><select value={form.contactRole} onChange={e=>update("contactRole",e.target.value)} onBlur={()=>mark("contactRole")}><option value="">Select role</option>{["Director","Administrator","IT Manager","Other"].map(x=><option key={x}>{x}</option>)}</select></RegistrationField>
      <RegistrationField label="Contact Email" required error={errorFor("contactEmail")}><div className="rs-input-icon"><Mail size={14}/><input type="email" value={form.contactEmail} onChange={e=>update("contactEmail",e.target.value)} onBlur={()=>mark("contactEmail")} placeholder="name@school.ma"/></div></RegistrationField>
      <RegistrationField label="Contact Phone"><div className="rs-input-icon"><Phone size={14}/><input type="tel" value={form.contactPhone} onChange={e=>update("contactPhone",e.target.value)} placeholder="+212 6 00 00 00 00"/></div></RegistrationField>
     </div>
    </section>
    <section className="rs-section"><div className="rs-section-heading"><span className="rs-section-index">03</span><div><h2>Subscription Setup</h2><p>Configure the initial commercial subscription details.</p></div></div>
     <div className="rs-fields">
      <RegistrationField label="Subscription Plan" required error={errorFor("plan")}><select value={form.plan} onChange={e=>update("plan",e.target.value)} onBlur={()=>mark("plan")}><option value="">Select plan</option>{["Basic","Professional","Enterprise"].map(x=><option key={x}>{x}</option>)}</select></RegistrationField>
      <RegistrationField label="Billing Cycle" required error={errorFor("billingCycle")}><select value={form.billingCycle} onChange={e=>update("billingCycle",e.target.value)} onBlur={()=>mark("billingCycle")}><option value="">Select billing cycle</option><option>Monthly</option><option>Annually</option></select></RegistrationField>
      <RegistrationField label="Subscription Start Date" required error={errorFor("startDate")}><div className="rs-input-icon"><CalendarDays size={14}/><input type="date" value={form.startDate} onChange={e=>update("startDate",e.target.value)} onBlur={()=>mark("startDate")}/></div></RegistrationField>
      <RegistrationField label="Subscription End Date" required error={errorFor("endDate")}><div className="rs-input-icon"><CalendarDays size={14}/><input type="date" min={form.startDate||undefined} value={form.endDate} onChange={e=>update("endDate",e.target.value)} onBlur={()=>mark("endDate")}/></div></RegistrationField>
      <div className="rs-license-field"><span>Initial License Status <i>*</i></span><div><Badge tone="neutral">Pending</Badge><small>The school will remain pending until its subscription and license activation process is completed.</small></div></div>
     </div>
    </section>
    <section className="rs-section rs-section-last"><div className="rs-section-heading"><span className="rs-section-index">04</span><div><h2>Internal Notes</h2><p>Optional context for your platform operations team.</p></div></div>
     <RegistrationField label="Internal Notes" helper="Visible only to authorized platform administrators."><textarea rows={4} value={form.notes} onChange={e=>update("notes",e.target.value)} placeholder="Add any relevant administrative context..."/></RegistrationField>
    </section>
    <div className="rs-form-footer"><div className="rs-footer-actions"><button type="button" className="btn secondary" onClick={cancel}>Cancel</button><div><button type="button" className="btn secondary" onClick={saveDraft}><FileText size={14}/>Save as Draft</button><button type="submit" className="btn primary" disabled={!valid||saving}><Plus size={14}/>{saving?"Registering…":"Register School"}</button></div></div><p>Registering a school creates its central platform record. Server installation and connectivity setup are separate steps.</p>{draftSaved&&<small className="rs-draft-feedback" role="status">Draft saved locally in this browser.</small>}</div>
   </div>
   <aside className="rs-summary"><div className="rs-summary-head"><div className="rs-summary-icon"><FileText size={16}/></div><div><h2>Registration Summary</h2><p>Review the school details before registration.</p></div></div>
    <div className="rs-summary-group"><span>School Details</span><div><small>School Name</small><strong>{form.schoolName.trim()||"Not provided"}</strong></div><div><small>School Code</small><strong className="rs-summary-code">{form.schoolCode.trim()||"Not provided"}</strong></div><div><small>City</small><strong>{form.city.trim()||"Not provided"}</strong></div></div>
    <div className="rs-summary-group"><span>Subscription</span><div><small>Selected Plan</small><strong>{form.plan||"Not selected"}</strong></div><div><small>Billing Cycle</small><strong>{form.billingCycle||"Not selected"}</strong></div></div>
    <div className="rs-summary-status"><div><small>Initial License Status</small><Badge tone="neutral">Pending</Badge></div><p>Activation is completed separately after registration.</p></div>
    <div className="rs-summary-foot"><ShieldCheck size={15}/><span>Infrastructure provisioning is a separate operational step.</span></div>
   </aside>
  </form>
 </div>;
}

function Bar({ label, value, width, tone: t }: { label: string; value: string; width: string; tone: string }) { return <div className="bar-row"><span>{label}</span><div><i className={t} style={{ width }}/></div><b>{value}</b></div> }
function Audit({ time, actor, action, resource, outcome }: { time: string; actor: string; action: string; resource: string; outcome: string }) { return <div className="table-row"><span className="muted">{time}</span><span>{actor}</span><span>{action}</span><span className="mono">{resource}</span><span><Badge tone={tone(outcome)}>{outcome}</Badge></span></div> }

function DataPage({ page, schools, search, setSearch, filter, setFilter, notify, onCreate }: { page: PageKey; schools: School[]; search: string; setSearch: (s: string) => void; filter: string; setFilter: (s: string) => void; notify: (s: string) => void; onCreate: () => void }) { const isSchools = page === "Schools"; const isInstall = page === "Installations"; const isEndpoint = page === "Endpoints"; const rows = isEndpoint ? schools : schools; return <><div className="page-head"><div><span className="eyebrow">{page === "Support Access" ? "GOVERNANCE" : page === "Settings" ? "SYSTEM" : "FLEET OPERATIONS"}</span><h1>{page}</h1><p>{page === "Schools" ? "Manage school registrations and operational health." : page === "Installations" ? "Every on-premise installation connected to the fleet." : page === "Endpoints" ? "Approved hostnames and tunnel references." : page === "Monitoring" ? "Live operational signals from your school fleet." : `Review and manage ${page.toLowerCase()} across the control plane.`}</p></div><div className="head-actions"><button className="btn secondary" onClick={() => notify("Data refreshed") }><RefreshCw size={15}/>Refresh</button><button className="btn primary" onClick={onCreate}><Plus size={15}/> {isSchools ? "Add school" : page === "Releases" ? "Publish release" : `Create ${page.slice(0, -1)}`}</button></div></div>
  <div className="stat-grid mini"><Stat label={isInstall ? "Total" : "Active"} value="8" helper="Across the fleet" icon={isInstall ? Database : Activity}/><Stat label="Healthy" value="5" helper="62.5% of total" icon={Check} accent="green"/><Stat label="Needs attention" value="3" helper="Review required" icon={AlertCircle} accent="amber"/><Stat label="Offline" value="2" helper="Over 30 hours" icon={Cloud} accent="red"/></div>
  <section className="card table-card"><div className="table-toolbar"><div className="search-input"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${page.toLowerCase()}...`} /></div><div className="filter-tabs">{["All", "Healthy", "Degraded", "Offline"].map(f => <button className={filter === f ? "selected" : ""} onClick={() => setFilter(f)} key={f}>{f}</button>)}</div><button className="icon-btn"><MoreHorizontal size={18}/></button></div>{page === "Support Access" ? <SupportRows notify={notify}/> : page === "Licenses" ? <LicenseRows notify={notify}/> : <div className="data-table"><div className="table-row table-header">{(isSchools ? ["SCHOOL", "STATUS", "PLAN", "HEALTH", "LICENSE", "LAST HEARTBEAT", ""] : isEndpoint ? ["SCHOOL", "PUBLIC HOSTNAME", "TUNNEL", "STATUS", "LAST VERIFIED", ""] : ["SCHOOL", "INSTALLATION ID", "VERSION", "HEALTH", "TUNNEL", "LAST HEARTBEAT", ""]).map((h, i) => <span key={i}>{h}</span>)}</div>{rows.map(s => <div className="table-row clickable" key={s.code} onClick={() => notify(`${s.name} opened (demo)`)}><span><div className="school-cell"><div className="school-avatar">{s.code.slice(-2)}</div><div><b>{s.name}</b><small>{s.code} · {s.city}</small></div></div></span>{isSchools ? <><span><Badge tone={tone(s.status)}>{s.status}</Badge></span><span><b>{s.plan}</b></span><span><Badge tone={tone(s.health)}>{s.health}</Badge></span><span><Badge tone={tone(s.license)}>{s.license}</Badge></span><span className="muted">{s.heartbeat}</span></> : isEndpoint ? <><span className="mono">{s.endpoint}</span><span className="mono">tun_{s.code.toLowerCase()}_a1</span><span><Badge tone={s.health === "Offline" ? "danger" : "success"}>{s.health === "Offline" ? "Disconnected" : "Connected"}</Badge></span><span className="muted">{s.heartbeat}</span></> : <><span className="mono">inst_{s.code.toLowerCase()}_8f2a</span><span className="mono">{s.version}</span><span><Badge tone={tone(s.health)}>{s.health}</Badge></span><span><Badge tone={s.health === "Offline" ? "danger" : "success"}>{s.health === "Offline" ? "Disconnected" : "Connected"}</Badge></span><span className="muted">{s.heartbeat}</span></>}<span><button className="icon-btn"><MoreHorizontal size={16}/></button></span></div>)}</div>}<div className="table-footer"><span>Showing {rows.length} of {schools.length} schools</span><div><button className="pagination-btn">Previous</button><button className="pagination-btn active">1</button><button className="pagination-btn">Next</button></div></div></section></> }
function SupportRows({ notify }: { notify: (s: string) => void }) { return <div className="support-list"><div className="support-row"><div className="school-avatar">EO</div><div><b>École Les Oliviers</b><small>Requested by Karim Benali · 14 min ago</small></div><Badge tone="warning">Pending</Badge><button className="btn primary small" onClick={() => notify("Support access approved (demo)")}>Review request</button></div><div className="support-row"><div className="school-avatar">LA</div><div><b>Lycée Atlas</b><small>Requested by Sarah El Idrissi · 2 hours ago</small></div><Badge tone="warning">Pending</Badge><button className="btn secondary small" onClick={() => notify("Support access request opened")}>Review request</button></div></div> }
function LicenseRows({ notify }: { notify: (s: string) => void }) { return <div className="license-list">{schools.map(s => <div className="license-row" key={s.code}><div className="school-cell"><div className="school-avatar">{s.code.slice(-2)}</div><div><b>{s.name}</b><small>{s.code} · License lease</small></div></div><span className="mono">lic_{s.code.toLowerCase()}_2025</span><span><Badge tone={tone(s.license)}>{s.license}</Badge></span><span className="muted">{s.license === "In grace" ? "Expires in 12 days" : "Valid until Dec 31, 2025"}</span><button className="btn secondary small" onClick={() => notify("Lease JSON opened (demo)")}>View lease <ExternalLink size={13}/></button></div>)}</div> }
