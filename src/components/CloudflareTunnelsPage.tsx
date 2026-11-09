import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, Check, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Clock3, Cloud, Copy, ExternalLink, Eye, FileClock,
  Filter, History, MoreHorizontal, Plus, RefreshCw, Search, Server, Shield,
  Signal, X, XCircle, Zap,
} from "lucide-react";

type TunnelState = "Connected" | "Disconnected" | "Degraded" | "Unknown";
type Tunnel = {
  id: string; name: string; school: string; code: string; hostname: string;
  state: TunnelState; connections: number | null; region: string | null;
  lastConnected: string; heartbeat: string; created: string; updated: string;
  server: string; protocol: string | null; connector: string | null; stale?: boolean;
  description?: string; active: boolean;
};

const initialTunnels: Tunnel[] = [
  { id:"TNL-ATS-001", name:"Atlas API Tunnel", school:"Atlas International School", code:"ATS-001", hostname:"api.atlas-school.ma", state:"Connected", connections:4, region:"Casablanca", lastConnected:"09 Nov 2026, 18:40", heartbeat:"2 min ago", created:"12 Oct 2026", updated:"09 Nov 2026, 18:42", server:"Atlas Production · SRV-ATS-001", protocol:"QUIC", connector:"2026.10.2", active:true },
  { id:"TNL-AAS-002", name:"Amal API Tunnel", school:"Al Amal School", code:"AAS-002", hostname:"api.alamal-school.ma", state:"Disconnected", connections:0, region:"Rabat", lastConnected:"06 Nov 2026, 09:14", heartbeat:"3 days ago", created:"18 Oct 2026", updated:"06 Nov 2026, 09:14", server:"Amal Production · SRV-AAS-002", protocol:"QUIC", connector:"2026.9.1", active:true },
  { id:"TNL-FAC-003", name:"Future API Tunnel", school:"Future Academy", code:"FAC-003", hostname:"api.future-academy.ma", state:"Degraded", connections:1, region:"Marrakech", lastConnected:"09 Nov 2026, 18:39", heartbeat:"1 min ago", created:"21 Oct 2026", updated:"09 Nov 2026, 18:41", server:"Future Production · SRV-FAC-003", protocol:"HTTP/2", connector:"2026.10.2", active:true },
  { id:"TNL-ISS-004", name:"Ibn Sina API Tunnel", school:"Ibn Sina School", code:"ISS-004", hostname:"api.ibnsina-school.ma", state:"Unknown", connections:null, region:null, lastConnected:"Never connected", heartbeat:"Not reported", created:"02 Nov 2026", updated:"02 Nov 2026", server:"Not assigned", protocol:null, connector:null, stale:true, active:true },
  { id:"TNL-HZS-005", name:"Horizon API Tunnel", school:"Horizon School", code:"HZS-005", hostname:"api.horizon-school.ma", state:"Connected", connections:2, region:"Tangier", lastConnected:"09 Nov 2026, 18:35", heartbeat:"7 min ago", created:"25 Oct 2026", updated:"09 Nov 2026, 18:35", server:"Horizon Production · SRV-HZS-005", protocol:"QUIC", connector:"2026.10.1", active:true },
];

const events = [
  { title:"Tunnel connected", time:"09 Nov 2026 · 18:40:12 UTC", kind:"success", detail:"A connector connection was established." },
  { title:"Heartbeat received", time:"09 Nov 2026 · 18:39:58 UTC", kind:"info", detail:"A monitoring heartbeat was received." },
  { title:"Connection interrupted", time:"09 Nov 2026 · 17:52:04 UTC", kind:"warning", detail:"One connector connection was interrupted." },
  { title:"Tunnel reconnected", time:"09 Nov 2026 · 17:48:31 UTC", kind:"success", detail:"The connector re-established its connection." },
  { title:"Configuration updated", time:"08 Nov 2026 · 11:20:00 UTC", kind:"info", detail:"Administrative tunnel metadata was updated." },
];

function stateTone(state: TunnelState) {
  return state === "Connected" ? "success" : state === "Disconnected" ? "danger" : state === "Degraded" ? "warning" : "neutral";
}
function TunnelBadge({ state }: { state: TunnelState }) {
  const Icon = state === "Connected" ? Check : state === "Disconnected" ? XCircle : state === "Degraded" ? AlertTriangle : CircleHelp;
  return <span className={`cft-badge cft-${state.toLowerCase()}`}><Icon size={12}/>{state}</span>;
}
function Metric({ label, value, tone, note }: {label:string;value:string;tone?:string;note:string}) {
  return <div className="cft-metric"><span>{label}</span><strong className={tone ? `cft-metric-${tone}` : ""}>{value}</strong><small>{note}</small></div>;
}

export function CloudflareTunnelsPage({ notify }: { notify: (message: string) => void }) {
  const [tunnels, setTunnels] = useState(initialTunnels);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [school, setSchool] = useState("All");
  const [region, setRegion] = useState("All");
  const [selected, setSelected] = useState<Tunnel | null>(null);
  const [drawer, setDrawer] = useState<"details"|"history"|"events"|"register"|"edit"|"server"|null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Tunnel | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({name:"",school:"",server:"",hostname:"",description:""});
  const [formError, setFormError] = useState("");
  const [pageSize, setPageSize] = useState("10");

  const filtered = useMemo(() => tunnels.filter(t => t.active &&
    (status === "All" || t.state === status) &&
    (school === "All" || t.school === school) &&
    (region === "All" || t.region === region) &&
    `${t.name} ${t.school} ${t.id} ${t.hostname}`.toLowerCase().includes(search.toLowerCase())
  ), [tunnels, status, school, region, search]);

  const openDrawer = (tunnel: Tunnel, mode: "details"|"history"|"events"|"edit"|"server") => {
    setSelected(tunnel); setDrawer(mode); setMenu(null);
    if (mode === "edit") setForm({name:tunnel.name,school:tunnel.school,server:tunnel.server,hostname:tunnel.hostname,description:tunnel.description ?? ""});
  };
  const closeDrawer = () => { setDrawer(null); setSelected(null); setFormError(""); };
  const clearFilters = () => { setSearch(""); setStatus("All"); setSchool("All"); setRegion("All"); };
  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => { setRefreshing(false); notify("Demo records refreshed. No live Cloudflare connection was queried."); }, 650);
  };
  const startRegister = () => {
    setForm({name:"",school:"",server:"",hostname:"",description:""}); setFormError(""); setDrawer("register"); setSelected(null);
  };
  const saveTunnel = () => {
    const hostname = form.hostname.trim().toLowerCase();
    if (!form.name.trim() || !form.school || !hostname) { setFormError("Complete the required fields before saving."); return; }
    if (!/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$/i.test(hostname)) { setFormError("Enter a valid public hostname."); return; }
    if (tunnels.some(t => t.hostname.toLowerCase() === hostname && t.id !== selected?.id)) { setFormError("This public hostname is already registered."); return; }
    if (drawer === "edit" && selected) {
      setTunnels(prev => prev.map(t => t.id === selected.id ? {...t,name:form.name.trim(),hostname,server:form.server || "Not assigned",description:form.description,updated:"Just now"} : t));
      notify("Tunnel metadata updated in this demo session.");
    } else {
      const code = form.school === "Atlas International School" ? "ATS-001" : form.school === "Al Amal School" ? "AAS-002" : form.school === "Future Academy" ? "FAC-003" : form.school === "Ibn Sina School" ? "ISS-004" : "HZS-005";
      const id = `TNL-DEMO-${String(tunnels.length + 1).padStart(3,"0")}`;
      setTunnels(prev => [{id,name:form.name.trim(),school:form.school,code,hostname,state:"Unknown",connections:null,region:null,lastConnected:"Never connected",heartbeat:"Not reported",created:"09 Nov 2026",updated:"09 Nov 2026",server:form.server || "Not assigned",protocol:null,connector:null,description:form.description,stale:true,active:true},...prev]);
      notify("Tunnel metadata registered in this demo session. Provisioning is separate.");
    }
    closeDrawer();
  };
  const deactivate = () => {
    if (!confirm) return;
    setTunnels(prev => prev.map(t => t.id === confirm.id ? {...t,active:false} : t));
    notify(`${confirm.name} deactivated in this demo session.`);
    setConfirm(null); closeDrawer();
  };

  return <div className="cft-page">
    <div className="page-head cft-head">
      <div><span className="eyebrow">INFRASTRUCTURE / CONNECTIVITY</span><h1>Cloudflare Tunnels</h1><p>Monitor secure connections between school servers and the central platform.</p></div>
      <div className="head-actions">
        <button className="btn secondary" onClick={refresh} disabled={refreshing}><RefreshCw size={15} className={refreshing ? "cft-spin" : ""}/>{refreshing ? "Refreshing…" : "Refresh"}</button>
        <button className="btn primary" onClick={startRegister}><Plus size={15}/>Register Tunnel</button>
      </div>
    </div>

    <div className="cft-demo-note"><span className="cft-demo-dot"/> DEMO DATA <span>Illustrative records only · No live Cloudflare integration connected</span></div>

    <section className="cft-metrics" aria-label="Tunnel summary">
      <Metric label="Total Tunnels" value="128" note="Registered tunnel records"/>
      <Metric label="Connected" value="103" tone="success" note="80.5% of total"/>
      <Metric label="Disconnected" value="19" tone="danger" note="14.8% of total"/>
      <Metric label="Degraded" value="4" tone="warning" note="3.1% of total"/>
      <Metric label="Unknown" value="2" tone="neutral" note="1.6% of total"/>
    </section>

    <section className="card cft-distribution">
      <div className="cft-distribution-head"><div><h2>Tunnel connection overview</h2><p>Connection-state distribution across the registered fleet</p></div><span className="cft-demo-tag">DEMO</span></div>
      <div className="cft-stacked" role="img" aria-label="103 connected, 19 disconnected, 4 degraded, 2 unknown"><i className="cft-seg-connected" style={{width:"80.47%"}}/><i className="cft-seg-disconnected" style={{width:"14.84%"}}/><i className="cft-seg-degraded" style={{width:"3.13%"}}/><i className="cft-seg-unknown" style={{width:"1.56%"}}/></div>
      <div className="cft-legend"><span><i className="cft-key-connected"/>Connected <b>103</b></span><span><i className="cft-key-disconnected"/>Disconnected <b>19</b></span><span><i className="cft-key-degraded"/>Degraded <b>4</b></span><span><i className="cft-key-unknown"/>Unknown <b>2</b></span><small>Last monitoring update: 09 Nov 2026, 18:42 UTC · Demo timestamp</small></div>
    </section>

    <section className="card cft-table-card">
      <div className="cft-table-heading"><div><h2>Tunnels</h2><p>Secure connectivity records for registered schools</p></div><span className="cft-sample-count">5 sample records</span></div>
      <div className="cft-toolbar">
        <label className="cft-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by tunnel name, school, tunnel ID, or hostname…"/></label>
        <label className="cft-select"><span>Status</span><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Connected</option><option>Disconnected</option><option>Degraded</option><option>Unknown</option></select></label>
        <label className="cft-select"><span>School</span><select value={school} onChange={e=>setSchool(e.target.value)}><option>All</option>{[...new Set(tunnels.map(t=>t.school))].map(s=><option key={s}>{s}</option>)}</select></label>
        <label className="cft-select"><span>Region</span><select value={region} onChange={e=>setRegion(e.target.value)}><option>All</option>{[...new Set(tunnels.map(t=>t.region).filter(Boolean) as string[])].map(r=><option key={r}>{r}</option>)}</select></label>
        <button className="cft-clear" onClick={clearFilters}><X size={13}/>Clear filters</button>
      </div>
      <div className="cft-table-scroll"><table className="cft-table"><thead><tr><th>Tunnel Name</th><th>School</th><th>Tunnel ID</th><th>Public Hostname</th><th>Connection Status</th><th>Active Connections</th><th>Cloudflare Region</th><th>Last Connected</th><th>Last Heartbeat</th><th aria-label="Actions"/></tr></thead>
        <tbody>{filtered.map(t=><tr key={t.id}>
          <td><button className="cft-name-link" onClick={()=>openDrawer(t,"details")}>{t.name}</button><small className="cft-cell-sub">{t.code}</small></td>
          <td>{t.school}</td><td><code>{t.id}</code></td><td><code className="cft-hostname" title={t.hostname}>{t.hostname}</code></td>
          <td><TunnelBadge state={t.state}/></td><td className="cft-number">{t.connections === null ? "—" : t.connections}</td>
          <td>{t.region ?? "—"}</td><td className="cft-time">{t.lastConnected}</td>
          <td><span className={t.stale || t.heartbeat==="3 days ago" ? "cft-stale" : "cft-time"}>{t.heartbeat}</span>{(t.stale || t.heartbeat==="3 days ago") && <small className="cft-cell-sub">Stale / unavailable</small>}</td>
          <td><div className="cft-row-menu"><button className="icon-btn" aria-label={`Actions for ${t.name}`} onClick={()=>setMenu(menu===t.id?null:t.id)}><MoreHorizontal size={17}/></button>{menu===t.id && <><button className="cft-dismiss" aria-label="Close actions" onClick={()=>setMenu(null)}/><div className="cft-menu"><button onClick={()=>openDrawer(t,"details")}><Eye size={14}/>View Details</button><button onClick={()=>openDrawer(t,"history")}><History size={14}/>View Connection History</button><button onClick={()=>openDrawer(t,"events")}><FileClock size={14}/>View Tunnel Events</button><button onClick={()=>openDrawer(t,"edit")}><Activity size={14}/>Edit Tunnel Metadata</button><button onClick={()=>openDrawer(t,"server")}><Server size={14}/>View Assigned Server</button><hr/><button className="cft-menu-danger" onClick={()=>{setConfirm(t);setMenu(null)}}><XCircle size={14}/>Deactivate Tunnel</button></div></>}</div></td>
        </tr>)}</tbody></table>
        {filtered.length===0 && <div className="cft-empty"><Filter size={22}/><strong>No tunnels match these filters</strong><span>Try another search or clear the selected filters.</span><button className="btn secondary small" onClick={clearFilters}>Clear filters</button></div>}
      </div>
      <div className="cft-table-footer"><span>Showing {filtered.length ? 1 : 0}–{filtered.length} of {filtered.length===tunnels.filter(t=>t.active).length ? "128" : filtered.length} tunnels <em>· 5 demo records shown</em></span><div><label>Rows per page <select value={pageSize} onChange={e=>setPageSize(e.target.value)}><option>10</option><option>25</option><option>50</option></select></label><button className="pagination-btn" disabled><ChevronLeft size={14}/></button><button className="pagination-btn active">1</button><button className="pagination-btn" disabled><ChevronRight size={14}/></button></div></div>
    </section>

    {drawer && <div className="cft-drawer-backdrop" onMouseDown={closeDrawer}>
      <aside className="cft-drawer" role="dialog" aria-modal="true" aria-label={drawer==="register"?"Register tunnel":"Tunnel information"} onMouseDown={e=>e.stopPropagation()}>
        <header className="cft-drawer-head"><div><span className="eyebrow">{drawer==="register"?"NEW CONNECTIVITY RECORD":"TUNNEL MANAGEMENT"}</span><h2>{drawer==="register"?"Register Tunnel":drawer==="edit"?"Edit Tunnel Metadata":drawer==="history"?"Connection History":drawer==="events"?"Tunnel Events":drawer==="server"?"Assigned Server":"Tunnel Details"}</h2><p>{selected ? `${selected.school} · ${selected.id}` : "Associate a tunnel record with a registered school."}</p></div><button className="icon-btn" onClick={closeDrawer} aria-label="Close panel"><X size={18}/></button></header>
        {drawer==="register" || drawer==="edit" ? <div className="cft-drawer-body">
          <div className="cft-form-note"><Shield size={16}/><span>This creates or updates central tunnel metadata only. It does not provision or activate a Cloudflare Tunnel.</span></div>
          <label className="cft-field">Tunnel Name <b>*</b><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Atlas API Tunnel"/></label>
          <label className="cft-field">Assigned School <b>*</b><select value={form.school} onChange={e=>setForm({...form,school:e.target.value})}><option value="">Select a registered school</option>{["Atlas International School","Al Amal School","Future Academy","Ibn Sina School","Horizon School"].map(s=><option key={s}>{s}</option>)}</select></label>
          <label className="cft-field">Assigned Server <span>Optional</span><select value={form.server} onChange={e=>setForm({...form,server:e.target.value})}><option value="">Select a server (if available)</option>{["Atlas Production · SRV-ATS-001","Amal Production · SRV-AAS-002","Future Production · SRV-FAC-003","Ibn Sina Production · SRV-ISS-004","Horizon Production · SRV-HZS-005"].map(s=><option key={s}>{s}</option>)}</select></label>
          <label className="cft-field">Public Hostname <b>*</b><input value={form.hostname} onChange={e=>setForm({...form,hostname:e.target.value.toLowerCase()})} placeholder="api.school-domain.ma"/><small>Enter the public hostname routed through this tunnel.</small></label>
          <label className="cft-field">Administrative Description <span>Optional</span><textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Add internal context for platform administrators…"/></label>
          {formError && <p className="cft-form-error" role="alert">{formError}</p>}
        </div> : selected && <div className="cft-drawer-body">
          <div className="cft-detail-hero"><div className="cft-cloud-icon"><Cloud size={21}/></div><div><strong>{selected.name}</strong><small>{selected.school} · {selected.code}</small></div><TunnelBadge state={selected.state}/></div>
          {drawer==="details" && <>
            <section className="cft-detail-section"><h3>Tunnel Identity</h3><div className="cft-facts"><div><small>Tunnel ID</small><code>{selected.id}</code></div><div><small>Public Hostname</small><code>{selected.hostname}</code></div><div><small>Created At</small><b>{selected.created}</b></div><div><small>Last Updated</small><b>{selected.updated}</b></div></div></section>
            <section className="cft-detail-section"><h3>Connection Status</h3><div className="cft-status-line"><TunnelBadge state={selected.state}/><span>{selected.connections===null ? "Active connections not reported" : `${selected.connections} active connections reported`}</span></div><div className="cft-facts"><div><small>Last Connected</small><b>{selected.lastConnected}</b></div><div><small>Last Heartbeat</small><b>{selected.heartbeat}</b></div><div><small>Monitoring Freshness</small><b className={selected.stale || selected.heartbeat==="3 days ago" ? "cft-warning-text" : ""}>{selected.stale || selected.heartbeat==="3 days ago" ? "Stale / unavailable" : "Recent · demo data"}</b></div></div>{(selected.stale || selected.heartbeat==="3 days ago") && <p className="cft-inline-warning"><AlertTriangle size={14}/>Historical connection details do not confirm the tunnel's current state. Current state must be verified by a fresh heartbeat.</p>}</section>
            <section className="cft-detail-section"><h3>Connection Information</h3><div className="cft-facts"><div><small>Cloudflare Region</small><b>{selected.region ?? "Not reported"}</b></div><div><small>Protocol</small><b>{selected.protocol ?? "Not reported"}</b></div><div><small>Connector Version</small><b>{selected.connector ?? "Not reported"}</b></div><div><small>Assigned Server</small><b>{selected.server}</b></div></div></section>
            <section className="cft-detail-section"><h3>Recent Events <span className="cft-demo-tag">DEMO</span></h3><EventTimeline/></section>
          </>}
          {drawer==="history" && <section className="cft-detail-section"><h3>Reported connection history <span className="cft-demo-tag">DEMO</span></h3><p className="cft-subtle">Illustrative events only. Historical records do not establish current connectivity.</p><EventTimeline history/></section>}
          {drawer==="events" && <section className="cft-detail-section"><h3>Recent tunnel events <span className="cft-demo-tag">DEMO</span></h3><EventTimeline/></section>}
          {drawer==="server" && <section className="cft-detail-section"><h3>Server association</h3><div className="cft-server-card"><Server size={19}/><div><strong>{selected.server}</strong><small>Server metadata reference only</small></div></div><p className="cft-subtle">This panel does not provide remote machine access. Server health and tunnel connectivity are monitored independently.</p></section>}
        </div>}
        <footer className="cft-drawer-footer">{drawer==="register" || drawer==="edit" ? <><button className="btn secondary" onClick={closeDrawer}>Cancel</button><button className="btn primary" onClick={saveTunnel}><Check size={14}/>{drawer==="register"?"Register Tunnel":"Save Changes"}</button></> : <><button className="btn secondary" onClick={closeDrawer}>Close</button>{selected && drawer==="details" && <button className="btn primary" onClick={()=>openDrawer(selected,"edit")}>Edit Metadata</button>}</>}</footer>
      </aside>
    </div>}
    {confirm && <div className="cft-confirm-backdrop" onMouseDown={()=>setConfirm(null)}><section className="cft-confirm" role="alertdialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><div className="cft-confirm-icon"><AlertTriangle size={19}/></div><h2>Deactivate tunnel?</h2><p><strong>{confirm.name}</strong> will be marked inactive in the central platform. This does not delete the local server or school database, and it does not remotely stop the connector.</p><div><button className="btn secondary" onClick={()=>setConfirm(null)}>Cancel</button><button className="btn primary cft-danger-button" onClick={deactivate}>Deactivate Tunnel</button></div></section></div>}
  </div>;
}

function EventTimeline({history=false}:{history?:boolean}) {
  const items = history ? events.slice(0,4) : events.slice(0,5);
  return <div className="cft-timeline">{items.map((event,i)=><div className="cft-event" key={event.title+i}><span className={`cft-event-marker cft-event-${event.kind}`}/><div><strong>{event.title}</strong><small>{event.time}</small><p>{event.detail}</p></div></div>)}</div>;
}
