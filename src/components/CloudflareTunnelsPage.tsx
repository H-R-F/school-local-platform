import { useMemo, useState } from "react";
import {
  AlertTriangle, Check, CircleHelp, Cloud,
  Eye, FileClock, Filter, History, MoreHorizontal, Plus, RefreshCw,
  Search, Server, Shield, X, XCircle, Pencil, Power, Globe2,
  Radio, RotateCw,
} from "lucide-react";

type TunnelState = "Connected" | "Disconnected" | "Degraded" | "Unknown";
type OriginState = "Healthy" | "Unhealthy" | "Unknown";
type Tunnel = {
  id: string;
  name: string;
  school: string;
  code: string;
  hostname: string;
  state: TunnelState;
  origin: OriginState;
  connections: number | null;
  region: string | null;
  lastConnected: string;
  heartbeat: string;
  created: string;
  updated: string;
  server: string;
  protocol: string | null;
  connector: string | null;
  active: boolean;
  description: string;
  requests24h: number | null;
  latencyMs: number | null;
};

const initialTunnels: Tunnel[] = [
  { id:"TNL-ATS-001", name:"Atlas Production", school:"Atlas International School", code:"ATS-001", hostname:"api.atlas-school.ma", state:"Connected", origin:"Healthy", connections:4, region:"Casablanca", lastConnected:"10 Nov 2026, 18:14", heartbeat:"38 sec ago", created:"12 Oct 2026", updated:"10 Nov 2026, 18:14", server:"Atlas Production · SRV-ATS-001", protocol:"QUIC", connector:"2026.10.2", active:true, description:"Primary application ingress for Atlas International School.", requests24h:184230, latencyMs:42 },
  { id:"TNL-AAS-002", name:"Al Amal Production", school:"Al Amal School", code:"AAS-002", hostname:"api.alamal-school.ma", state:"Disconnected", origin:"Unknown", connections:0, region:"Rabat", lastConnected:"08 Nov 2026, 09:14", heartbeat:"2 days ago", created:"18 Oct 2026", updated:"08 Nov 2026, 09:14", server:"Amal Production · SRV-AAS-002", protocol:"QUIC", connector:"2026.9.1", active:true, description:"Primary application ingress. Connector requires investigation.", requests24h:null, latencyMs:null },
  { id:"TNL-FAC-003", name:"Future Academy Production", school:"Future Academy", code:"FAC-003", hostname:"api.future-academy.ma", state:"Degraded", origin:"Unhealthy", connections:1, region:"Marrakech", lastConnected:"10 Nov 2026, 18:12", heartbeat:"1 min ago", created:"21 Oct 2026", updated:"10 Nov 2026, 18:12", server:"Future Production · SRV-FAC-003", protocol:"HTTP/2", connector:"2026.10.2", active:true, description:"Origin service is returning intermittent failures in this sample.", requests24h:62710, latencyMs:890 },
  { id:"TNL-ISS-004", name:"Ibn Sina Production", school:"Ibn Sina School", code:"ISS-004", hostname:"api.ibnsina-school.ma", state:"Unknown", origin:"Unknown", connections:null, region:null, lastConnected:"Never connected", heartbeat:"Not reported", created:"02 Nov 2026", updated:"02 Nov 2026", server:"Ibn Sina Production · SRV-ISS-004", protocol:null, connector:null, active:true, description:"Tunnel record created; connector has not enrolled yet.", requests24h:null, latencyMs:null },
  { id:"TNL-HZS-005", name:"Horizon Production", school:"Horizon School", code:"HZS-005", hostname:"api.horizon-school.ma", state:"Connected", origin:"Healthy", connections:2, region:"Tangier", lastConnected:"10 Nov 2026, 18:10", heartbeat:"3 min ago", created:"25 Oct 2026", updated:"10 Nov 2026, 18:10", server:"Horizon Production · SRV-HZS-005", protocol:"QUIC", connector:"2026.10.1", active:true, description:"Primary application ingress for Horizon School.", requests24h:95620, latencyMs:58 },
  { id:"TNL-LPM-006", name:"La Plume Production", school:"Académie La Plume", code:"LPM-006", hostname:"api.laplume-school.ma", state:"Connected", origin:"Healthy", connections:3, region:"Agadir", lastConnected:"10 Nov 2026, 18:16", heartbeat:"22 sec ago", created:"29 Oct 2026", updated:"10 Nov 2026, 18:16", server:"La Plume Production · SRV-LPM-006", protocol:"QUIC", connector:"2026.10.2", active:true, description:"Primary application ingress for La Plume.", requests24h:121450, latencyMs:36 },
];

const eventSeed = [
  { id:"EVT-1008", tunnelId:"TNL-ATS-001", title:"Connector connection established", time:"10 Nov 2026 · 18:14:12 UTC", kind:"success", detail:"A connector connection was reported for the production tunnel." },
  { id:"EVT-1007", tunnelId:"TNL-ATS-001", title:"Heartbeat received", time:"10 Nov 2026 · 18:13:58 UTC", kind:"info", detail:"The latest monitoring heartbeat was received." },
  { id:"EVT-1006", tunnelId:"TNL-FAC-003", title:"Origin health check failed", time:"10 Nov 2026 · 18:12:04 UTC", kind:"warning", detail:"The tunnel is connected, but the configured origin service is reporting failures." },
  { id:"EVT-1005", tunnelId:"TNL-AAS-002", title:"Connector heartbeat missed", time:"08 Nov 2026 · 09:14:00 UTC", kind:"danger", detail:"No recent connector heartbeat has been received." },
  { id:"EVT-1004", tunnelId:"TNL-HZS-005", title:"Tunnel reconnected", time:"10 Nov 2026 · 18:10:31 UTC", kind:"success", detail:"The connector re-established its connection." },
];

const schools = [
  { name:"Atlas International School", code:"ATS-001", server:"Atlas Production · SRV-ATS-001" },
  { name:"Al Amal School", code:"AAS-002", server:"Amal Production · SRV-AAS-002" },
  { name:"Future Academy", code:"FAC-003", server:"Future Production · SRV-FAC-003" },
  { name:"Ibn Sina School", code:"ISS-004", server:"Ibn Sina Production · SRV-ISS-004" },
  { name:"Horizon School", code:"HZS-005", server:"Horizon Production · SRV-HZS-005" },
  { name:"Académie La Plume", code:"LPM-006", server:"La Plume Production · SRV-LPM-006" },
];

function TunnelBadge({ state }: { state: TunnelState }) {
  const Icon = state === "Connected" ? Check : state === "Disconnected" ? XCircle : state === "Degraded" ? AlertTriangle : CircleHelp;
  return <span className={`cft-badge cft-${state.toLowerCase()}`}><Icon size={12}/>{state}</span>;
}
function OriginBadge({ state }: { state: OriginState }) {
  return <span className={`cft-origin-badge cft-origin-${state.toLowerCase()}`}><i/>{state}</span>;
}
function Metric({ label, value, tone, note }: {label:string;value:string;tone?:string;note:string}) {
  return <div className="cft-metric"><span>{label}</span><strong className={tone ? `cft-metric-${tone}` : ""}>{value}</strong><small>{note}</small></div>;
}
function EventTimeline({ items }: { items: typeof eventSeed }) {
  if (!items.length) return <div className="cft-no-events">No sample events are recorded for this tunnel.</div>;
  return <div className="cft-timeline">{items.map(event=><div className="cft-event" key={event.id}><span className={`cft-event-marker cft-event-${event.kind}`}/><div><strong>{event.title}</strong><small>{event.time}</small><p>{event.detail}</p></div></div>)}</div>;
}

export function CloudflareTunnelsPage({ notify }: { notify: (message: string) => void }) {
  const [tunnels, setTunnels] = useState(initialTunnels);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [school, setSchool] = useState("All");
  const [region, setRegion] = useState("All");
  const [originFilter, setOriginFilter] = useState("All");
  const [selected, setSelected] = useState<Tunnel | null>(null);
  const [drawer, setDrawer] = useState<"details"|"history"|"events"|"register"|"edit"|"server"|null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Tunnel | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({name:"",school:"",server:"",hostname:"",description:""});
  const [formError, setFormError] = useState("");

  const activeTunnels = useMemo(() => tunnels.filter(t => t.active), [tunnels]);
  const stats = useMemo(() => ({
    total: activeTunnels.length,
    connected: activeTunnels.filter(t=>t.state==="Connected").length,
    disconnected: activeTunnels.filter(t=>t.state==="Disconnected").length,
    degraded: activeTunnels.filter(t=>t.state==="Degraded").length,
    unknown: activeTunnels.filter(t=>t.state==="Unknown").length,
    originsUnhealthy: activeTunnels.filter(t=>t.origin==="Unhealthy").length,
    connections: activeTunnels.reduce((sum,t)=>sum+(t.connections ?? 0),0),
  }), [activeTunnels]);
  const filtered = useMemo(() => activeTunnels.filter(t =>
    (status==="All" || t.state===status) &&
    (school==="All" || t.school===school) &&
    (region==="All" || t.region===region) &&
    (originFilter==="All" || t.origin===originFilter) &&
    `${t.name} ${t.school} ${t.id} ${t.hostname} ${t.server}`.toLowerCase().includes(search.toLowerCase())
  ), [activeTunnels,status,school,region,originFilter,search]);
  const regions = [...new Set(activeTunnels.map(t=>t.region).filter((r):r is string=>Boolean(r)))];
  const schoolNames = [...new Set(activeTunnels.map(t=>t.school))];
  const selectedEvents = selected ? eventSeed.filter(e=>e.tunnelId===selected.id) : [];

  const openDrawer = (tunnel: Tunnel, mode: "details"|"history"|"events"|"edit"|"server") => {
    setSelected(tunnel); setDrawer(mode); setMenu(null);
    if (mode==="edit") setForm({name:tunnel.name,school:tunnel.school,server:tunnel.server,hostname:tunnel.hostname,description:tunnel.description});
  };
  const closeDrawer = () => { setDrawer(null); setSelected(null); setFormError(""); };
  const clearFilters = () => { setSearch(""); setStatus("All"); setSchool("All"); setRegion("All"); setOriginFilter("All"); };
  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => { setRefreshing(false); notify("Demo snapshot refreshed. No live Cloudflare API was queried."); }, 650);
  };
  const startRegister = () => {
    setForm({name:"",school:"",server:"",hostname:"",description:""});
    setFormError(""); setDrawer("register"); setSelected(null);
  };
  const saveTunnel = () => {
    const hostname=form.hostname.trim().toLowerCase();
    if (!form.name.trim() || !form.school || !form.server || !hostname) { setFormError("Complete all required fields and select the assigned school server."); return; }
    const schoolRecord=schools.find(s=>s.name===form.school);
    if (!schoolRecord || schoolRecord.server!==form.server) { setFormError("The selected server must belong to the selected school."); return; }
    if (!/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(hostname)) { setFormError("Enter a valid public hostname, for example api.school-domain.ma."); return; }
    if (tunnels.some(t=>t.hostname.toLowerCase()===hostname && t.id!==selected?.id)) { setFormError("This hostname is already assigned to another tunnel."); return; }
    if (drawer==="edit" && selected) {
      const next={...selected,name:form.name.trim(),school:form.school,code:schoolRecord.code,hostname,server:form.server,description:form.description,updated:"Just now"};
      setTunnels(prev=>prev.map(t=>t.id===selected.id?next:t)); setSelected(next);
      notify("Tunnel metadata updated in this demo session.");
    } else {
      const id=`TNL-DEMO-${String(Date.now()).slice(-6)}`;
      const next:Tunnel={id,name:form.name.trim(),school:form.school,code:schoolRecord.code,hostname,state:"Unknown",origin:"Unknown",connections:null,region:null,lastConnected:"Never connected",heartbeat:"Not reported",created:"10 Nov 2026",updated:"10 Nov 2026",server:form.server,protocol:null,connector:null,active:true,description:form.description,requests24h:null,latencyMs:null};
      setTunnels(prev=>[next,...prev]); notify("Tunnel metadata registered. Cloudflare provisioning and connector installation remain separate steps.");
    }
    closeDrawer();
  };
  const deactivate = () => {
    if (!confirm) return;
    setTunnels(prev=>prev.map(t=>t.id===confirm.id?{...t,active:false}:t));
    notify(`${confirm.name} deactivated in this demo inventory. The remote connector was not changed.`);
    setConfirm(null); closeDrawer();
  };
  const simulateCheck = (tunnel:Tunnel) => {
    const next={...tunnel,updated:"Just now",heartbeat:"Just now"};
    setTunnels(prev=>prev.map(t=>t.id===tunnel.id?next:t));
    setSelected(next);
    notify("Demo check recorded locally. No Cloudflare or origin endpoint was contacted.");
  };

  return <div className="cft-page">
    <div className="page-head cft-head">
      <div><span className="eyebrow">INFRASTRUCTURE / CONNECTIVITY</span><h1>Cloudflare Tunnels</h1><p>Monitor secure ingress connections between school servers and the central platform.</p></div>
      <div className="head-actions">
        <button className="btn secondary" onClick={refresh} disabled={refreshing}><RefreshCw size={15} className={refreshing?"cft-spin":""}/>{refreshing?"Refreshing…":"Refresh snapshot"}</button>
        <button className="btn primary" onClick={startRegister}><Plus size={15}/>Register Tunnel</button>
      </div>
    </div>

    <div className="cft-demo-note"><span className="cft-demo-dot"/> DEMO DATA <span>Fictional sample records · No live Cloudflare account or API connected</span></div>

    <section className="cft-metrics" aria-label="Tunnel summary">
      <Metric label="Active tunnel records" value={String(stats.total)} note="Registered in this demo inventory"/>
      <Metric label="Connected" value={String(stats.connected)} tone="success" note={`${stats.total?Math.round(stats.connected/stats.total*100):0}% of active records`}/>
      <Metric label="Disconnected" value={String(stats.disconnected)} tone="danger" note="No active connector connection"/>
      <Metric label="Degraded" value={String(stats.degraded)} tone="warning" note="Connection or service needs review"/>
      <Metric label="Unknown" value={String(stats.unknown)} tone="neutral" note="No trustworthy current state"/>
    </section>

    <section className="card cft-distribution">
      <div className="cft-distribution-head"><div><h2>Connectivity overview</h2><p>Connection state and origin service health are tracked separately</p></div><span className="cft-demo-tag">DEMO</span></div>
      <div className="cft-stacked" role="img" aria-label={`${stats.connected} connected, ${stats.disconnected} disconnected, ${stats.degraded} degraded, ${stats.unknown} unknown`}>
        {stats.total>0 && <><i className="cft-seg-connected" style={{width:`${stats.connected/stats.total*100}%`}}/><i className="cft-seg-disconnected" style={{width:`${stats.disconnected/stats.total*100}%`}}/><i className="cft-seg-degraded" style={{width:`${stats.degraded/stats.total*100}%`}}/><i className="cft-seg-unknown" style={{width:`${stats.unknown/stats.total*100}%`}}/></>}
      </div>
      <div className="cft-legend"><span><i className="cft-key-connected"/>Connected <b>{stats.connected}</b></span><span><i className="cft-key-disconnected"/>Disconnected <b>{stats.disconnected}</b></span><span><i className="cft-key-degraded"/>Degraded <b>{stats.degraded}</b></span><span><i className="cft-key-unknown"/>Unknown <b>{stats.unknown}</b></span><small>Sample snapshot · 10 Nov 2026, 18:16 UTC</small></div>
      <div className="cft-secondary-metrics"><div><span><Radio size={14}/>Active connector connections</span><b>{stats.connections}</b></div><div><span><AlertTriangle size={14}/>Origin services unhealthy</span><b className={stats.originsUnhealthy?"cft-warning-text":""}>{stats.originsUnhealthy}</b></div><div><span><Globe2 size={14}/>Public hostnames</span><b>{activeTunnels.length}</b></div></div>
    </section>

    <section className="card cft-table-card">
      <div className="cft-table-heading"><div><h2>Tunnel inventory</h2><p>One record per school ingress tunnel · select a tunnel to inspect its configuration and events</p></div><span className="cft-sample-count">{filtered.length} of {activeTunnels.length} records</span></div>
      <div className="cft-toolbar">
        <label className="cft-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tunnel, school, ID, hostname or server…"/></label>
        <label className="cft-select"><span>Status</span><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Connected</option><option>Disconnected</option><option>Degraded</option><option>Unknown</option></select></label>
        <label className="cft-select"><span>Origin</span><select value={originFilter} onChange={e=>setOriginFilter(e.target.value)}><option>All</option><option>Healthy</option><option>Unhealthy</option><option>Unknown</option></select></label>
        <label className="cft-select"><span>School</span><select value={school} onChange={e=>setSchool(e.target.value)}><option>All</option>{schoolNames.map(s=><option key={s}>{s}</option>)}</select></label>
        <label className="cft-select"><span>Region</span><select value={region} onChange={e=>setRegion(e.target.value)}><option>All</option>{regions.map(r=><option key={r}>{r}</option>)}</select></label>
        <button className="cft-clear" onClick={clearFilters}><X size={13}/>Clear filters</button>
      </div>
      <div className="cft-table-scroll"><table className="cft-table"><thead><tr><th>Tunnel / School</th><th>Public Hostname</th><th>Tunnel Status</th><th>Origin Health</th><th>Connections</th><th>Region</th><th>Connector</th><th>Last Heartbeat</th><th aria-label="Actions"/></tr></thead>
        <tbody>{filtered.map(t=><tr key={t.id}>
          <td><button className="cft-name-link" onClick={()=>openDrawer(t,"details")}>{t.name}</button><small className="cft-cell-sub">{t.school} · {t.id}</small></td>
          <td><code className="cft-hostname" title={t.hostname}>{t.hostname}</code></td>
          <td><TunnelBadge state={t.state}/></td><td><OriginBadge state={t.origin}/></td>
          <td className="cft-number">{t.connections===null?"—":t.connections}</td><td>{t.region??"—"}</td><td><code>{t.connector??"Not enrolled"}</code></td>
          <td><span className={t.state==="Disconnected"||t.state==="Unknown"?"cft-stale":"cft-time"}>{t.heartbeat}</span></td>
          <td><div className="cft-row-menu"><button className="icon-btn" aria-label={`Actions for ${t.name}`} onClick={()=>setMenu(menu===t.id?null:t.id)}><MoreHorizontal size={17}/></button>{menu===t.id&&<><button className="cft-dismiss" aria-label="Close actions" onClick={()=>setMenu(null)}/><div className="cft-menu"><button onClick={()=>openDrawer(t,"details")}><Eye size={14}/>View details</button><button onClick={()=>openDrawer(t,"history")}><History size={14}/>Connection history</button><button onClick={()=>openDrawer(t,"events")}><FileClock size={14}/>Tunnel events</button><button onClick={()=>openDrawer(t,"edit")}><Pencil size={14}/>Edit metadata</button><button onClick={()=>openDrawer(t,"server")}><Server size={14}/>Assigned server</button><hr/><button className="cft-menu-danger" onClick={()=>{setConfirm(t);setMenu(null)}}><Power size={14}/>Deactivate record</button></div></>}</div></td>
        </tr>)}</tbody></table>
        {filtered.length===0&&<div className="cft-empty"><Filter size={22}/><strong>No tunnels match these filters</strong><span>Try another search or clear the selected filters.</span><button className="btn secondary small" onClick={clearFilters}>Clear filters</button></div>}
      </div>
      <div className="cft-table-footer"><span>Showing {filtered.length} of {activeTunnels.length} active records <em>· demo inventory</em></span><div className="cft-page-indicator">All active records shown</div></div>
    </section>

    <div className="cft-boundary-note"><Shield size={16}/><span><b>Operational boundary:</b> a Connected tunnel does not guarantee that the school application is healthy. Tunnel connection status and origin service health must be checked independently. This page currently displays mock data only.</span></div>

    {drawer&&<div className="cft-drawer-backdrop" onMouseDown={closeDrawer}>
      <aside className="cft-drawer" role="dialog" aria-modal="true" aria-label={drawer==="register"?"Register tunnel":"Tunnel information"} onMouseDown={e=>e.stopPropagation()}>
        <header className="cft-drawer-head"><div><span className="eyebrow">{drawer==="register"?"NEW CONNECTIVITY RECORD":"TUNNEL MANAGEMENT"}</span><h2>{drawer==="register"?"Register Tunnel":drawer==="edit"?"Edit Tunnel Metadata":drawer==="history"?"Connection History":drawer==="events"?"Tunnel Events":drawer==="server"?"Assigned Server":"Tunnel Details"}</h2><p>{selected?`${selected.school} · ${selected.id}`:"Associate a tunnel record with a registered school."}</p></div><button className="icon-btn" onClick={closeDrawer} aria-label="Close panel"><X size={18}/></button></header>
        {drawer==="register"||drawer==="edit"?<div className="cft-drawer-body">
          <div className="cft-form-note"><Shield size={16}/><span>This creates or updates central tunnel metadata only. It does not create a tunnel in Cloudflare, configure DNS, or install cloudflared.</span></div>
          <label className="cft-field">Tunnel Name <b>*</b><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Atlas Production"/></label>
          <label className="cft-field">Assigned School <b>*</b><select value={form.school} onChange={e=>{const s=schools.find(x=>x.name===e.target.value);setForm({...form,school:e.target.value,server:s?.server??""});}}><option value="">Select a registered school</option>{schools.map(s=><option key={s.code}>{s.name}</option>)}</select></label>
          <label className="cft-field">Assigned Server <b>*</b><select value={form.server} onChange={e=>setForm({...form,server:e.target.value})}><option value="">Select the server assigned to this school</option>{schools.filter(s=>s.name===form.school).map(s=><option key={s.code}>{s.server}</option>)}</select></label>
          <label className="cft-field">Public Hostname <b>*</b><input value={form.hostname} onChange={e=>setForm({...form,hostname:e.target.value.toLowerCase()})} placeholder="api.school-domain.ma"/><small>Hostname routed to the school service through this tunnel.</small></label>
          <label className="cft-field">Administrative Description <span>Optional</span><textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Internal context for platform administrators…"/></label>
          {formError&&<p className="cft-form-error" role="alert">{formError}</p>}
        </div>:selected&&<div className="cft-drawer-body">
          <div className="cft-detail-hero"><div className="cft-cloud-icon"><Cloud size={21}/></div><div><strong>{selected.name}</strong><small>{selected.school} · {selected.code}</small></div><TunnelBadge state={selected.state}/></div>
          {drawer==="details"&&<>
            <section className="cft-detail-section"><h3>Connection status</h3><div className="cft-status-line"><TunnelBadge state={selected.state}/><span>{selected.connections===null?"Active connections not reported":`${selected.connections} active connector connections`}</span></div><div className="cft-facts"><div><small>Last heartbeat</small><b>{selected.heartbeat}</b></div><div><small>Last connected</small><b>{selected.lastConnected}</b></div><div><small>Cloudflare region</small><b>{selected.region??"Not reported"}</b></div><div><small>Transport protocol</small><b>{selected.protocol??"Not reported"}</b></div></div><p className="cft-subtle">A stale or missing heartbeat is not proof that the physical school server is powered off.</p></section>
            <section className="cft-detail-section"><h3>Origin service health <OriginBadge state={selected.origin}/></h3><div className="cft-facts"><div><small>Origin health</small><b>{selected.origin}</b></div><div><small>Configured origin</small><b>{selected.server}</b></div><div><small>Latency sample</small><b>{selected.latencyMs===null?"Not reported":`${selected.latencyMs} ms`}</b></div><div><small>Requests · last 24h</small><b>{selected.requests24h===null?"Not reported":selected.requests24h.toLocaleString("en-US")}</b></div></div><p className="cft-inline-warning"><AlertTriangle size={14}/>Tunnel connectivity and origin application health are separate signals. A healthy tunnel can still route to an unhealthy application.</p></section>
            <section className="cft-detail-section"><h3>Tunnel identity</h3><div className="cft-facts"><div><small>Tunnel ID</small><code>{selected.id}</code></div><div><small>Public hostname</small><code>{selected.hostname}</code></div><div><small>Assigned school</small><b>{selected.school}</b></div><div><small>Assigned server</small><b>{selected.server}</b></div><div><small>Connector version</small><b>{selected.connector??"Not enrolled"}</b></div><div><small>Created</small><b>{selected.created}</b></div></div><p className="cft-subtle">{selected.description||"No administrative description."}</p></section>
            <section className="cft-detail-section"><h3>Recent events <span className="cft-demo-tag">DEMO</span></h3><EventTimeline items={selectedEvents.slice(0,3)}/></section>
          </>}
          {drawer==="history"&&<section className="cft-detail-section"><h3>Reported connection history <span className="cft-demo-tag">DEMO</span></h3><p className="cft-subtle">Illustrative event history only. It does not establish current connectivity.</p><EventTimeline items={selectedEvents}/></section>}
          {drawer==="events"&&<section className="cft-detail-section"><h3>Tunnel events <span className="cft-demo-tag">DEMO</span></h3><EventTimeline items={selectedEvents}/></section>}
          {drawer==="server"&&<section className="cft-detail-section"><h3>Server association</h3><div className="cft-server-card"><Server size={19}/><div><strong>{selected.server}</strong><small>Server registry reference · {selected.code}</small></div></div><p className="cft-subtle">This association is metadata only. Server resource health is monitored separately on the Servers page.</p></section>}
        </div>}
        <footer className="cft-drawer-footer">{drawer==="register"||drawer==="edit"?<><button className="btn secondary" onClick={closeDrawer}>Cancel</button><button className="btn primary" onClick={saveTunnel}><Check size={14}/>{drawer==="register"?"Register record":"Save changes"}</button></>:<><button className="btn secondary" onClick={closeDrawer}>Close</button>{selected&&drawer==="details"&&<><button className="btn secondary" onClick={()=>simulateCheck(selected)}><RotateCw size={14}/>Simulate check</button><button className="btn primary" onClick={()=>openDrawer(selected,"edit")}><Pencil size={14}/>Edit metadata</button></>}</>}</footer>
      </aside>
    </div>}
    {confirm&&<div className="cft-confirm-backdrop" onMouseDown={()=>setConfirm(null)}><section className="cft-confirm" role="alertdialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><div className="cft-confirm-icon"><AlertTriangle size={19}/></div><h2>Deactivate tunnel record?</h2><p><strong>{confirm.name}</strong> will be removed from the active demo inventory. This does not delete the Cloudflare Tunnel or stop the remote connector.</p><div><button className="btn secondary" onClick={()=>setConfirm(null)}>Cancel</button><button className="btn primary cft-danger-button" onClick={deactivate}>Deactivate record</button></div></section></div>}
  </div>;
}
