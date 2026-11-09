import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ChevronRight, Clock3, Filter, History, MoreHorizontal,
  Network, RefreshCw, Search, Server, ShieldCheck, X,
} from "lucide-react";

type State = "Online" | "Offline" | "Degraded" | "Unknown";
type Tunnel = "Connected" | "Disconnected" | "Degraded" | "Unknown";
type Api = "Healthy" | "Slow" | "Unavailable" | "Unknown";
type RecordItem = {
  code: string; school: string; hostname: string; tunnel: Tunnel; api: Api;
  heartbeat: string; latency: number | null; state: State; freshness: "Fresh" | "Stale" | "Unknown";
  lastSuccess: string; age: string; central: string; cloudflare: string; connector: string; localApi: string;
};
const initialRecords: RecordItem[] = [
  { code:"ATS-001", school:"Atlas International School", hostname:"api.atlas-school.ma", tunnel:"Connected", api:"Healthy", heartbeat:"30 sec ago", latency:42, state:"Online", freshness:"Fresh", lastSuccess:"09 Nov 2026, 18:41 UTC", age:"30 seconds", central:"Healthy", cloudflare:"Healthy", connector:"Healthy", localApi:"Healthy" },
  { code:"AAS-002", school:"Al Amal School", hostname:"api.alamal-school.ma", tunnel:"Disconnected", api:"Unknown", heartbeat:"3 hours ago", latency:null, state:"Offline", freshness:"Stale", lastSuccess:"09 Nov 2026, 15:39 UTC", age:"3 hours", central:"Healthy", cloudflare:"Unknown", connector:"Unknown", localApi:"Unknown" },
  { code:"FAC-003", school:"Future Academy", hostname:"api.future-academy.ma", tunnel:"Degraded", api:"Slow", heartbeat:"2 min ago", latency:840, state:"Degraded", freshness:"Fresh", lastSuccess:"09 Nov 2026, 18:39 UTC", age:"2 minutes", central:"Healthy", cloudflare:"Warning", connector:"Warning", localApi:"Warning" },
  { code:"ISS-004", school:"Ibn Sina School", hostname:"api.ibnsina-school.ma", tunnel:"Unknown", api:"Unknown", heartbeat:"Never", latency:null, state:"Unknown", freshness:"Unknown", lastSuccess:"Not reported", age:"Unknown", central:"Healthy", cloudflare:"Unknown", connector:"Unknown", localApi:"Unknown" },
  { code:"HZS-005", school:"Horizon School", hostname:"api.horizon-school.ma", tunnel:"Connected", api:"Healthy", heartbeat:"1 min ago", latency:58, state:"Online", freshness:"Fresh", lastSuccess:"09 Nov 2026, 18:40 UTC", age:"1 minute", central:"Healthy", cloudflare:"Healthy", connector:"Healthy", localApi:"Healthy" },
];
const eventSamples = [
  { title:"Heartbeat received", time:"09 Nov 2026 · 18:41:02 UTC", level:"success", detail:"A new monitoring heartbeat was received from the school connector." },
  { title:"Tunnel disconnected", time:"09 Nov 2026 · 18:20:14 UTC", level:"danger", detail:"The tunnel connection was interrupted." },
  { title:"API response delayed", time:"09 Nov 2026 · 17:58:31 UTC", level:"warning", detail:"The reported API response time exceeded the normal range." },
  { title:"Connection restored", time:"09 Nov 2026 · 17:42:08 UTC", level:"success", detail:"Successful communication was reported again." },
  { title:"Monitoring timeout", time:"09 Nov 2026 · 16:55:43 UTC", level:"warning", detail:"A monitoring response was not received within the expected interval." },
];
function Pill({ value }: { value: string }) {
  const v=value.toLowerCase();
  const cls=["online","healthy","connected","fresh"].includes(v)?"success":["degraded","slow","warning","stale"].includes(v)?"warning":["offline","disconnected","unavailable","critical"].includes(v)?"danger":"neutral";
  return <span className={`con-pill ${cls}`}><i />{value}</span>;
}
function Metric({ label, value, tone }: { label:string; value:string; tone?:string }) {
  return <div className="con-metric"><span>{label}</span><strong className={tone||""}>{value}</strong></div>;
}
export function ConnectivityPage({ notify }: { notify:(message:string)=>void }) {
  const [records]=useState(initialRecords);
  const [search,setSearch]=useState("");
  const [stateFilter,setStateFilter]=useState("All");
  const [tunnelFilter,setTunnelFilter]=useState("All");
  const [apiFilter,setApiFilter]=useState("All");
  const [selected,setSelected]=useState<RecordItem|null>(null);
  const [menu,setMenu]=useState<string|null>(null);
  const [eventsFor,setEventsFor]=useState<RecordItem|null>(null);
  const [refreshing,setRefreshing]=useState(false);
  const filtered=useMemo(()=>records.filter(r=>
    (stateFilter==="All"||r.state===stateFilter) &&
    (tunnelFilter==="All"||r.tunnel===tunnelFilter) &&
    (apiFilter==="All"||r.api===apiFilter) &&
    `${r.school} ${r.code} ${r.hostname}`.toLowerCase().includes(search.toLowerCase())
  ),[records,stateFilter,tunnelFilter,apiFilter,search]);
  const refresh=()=>{setRefreshing(true);window.setTimeout(()=>{setRefreshing(false);notify("Demo connectivity records refreshed. No live telemetry was requested.");},650);};
  const clear=()=>{setSearch("");setStateFilter("All");setTunnelFilter("All");setApiFilter("All");};
  return <div className="con-page">
    <div className="con-demo"><span className="con-demo-dot"/>DEMO DATA <span>Fictional monitoring records · no live network checks are running</span></div>
    <div className="con-header"><div><div className="con-eyebrow">NETWORK OPERATIONS</div><h1>Connectivity</h1><p>Monitor communication paths between the central platform and school infrastructure.</p></div><button className="con-btn" onClick={refresh} disabled={refreshing}><RefreshCw size={14} className={refreshing?"con-spin":""}/>{refreshing?"Refreshing":"Refresh"}</button></div>
    <div className="con-freshness"><span><Clock3 size={13}/> Last monitoring update: <b>09 Nov 2026, 18:42 UTC</b></span><Pill value="Fresh"/></div>
    <div className="con-metrics">
      <Metric label="Total Schools" value="128"/><Metric label="Online" value="103" tone="success"/><Metric label="Offline" value="19" tone="danger"/><Metric label="Degraded" value="4" tone="warning"/><Metric label="Unknown" value="2"/>
    </div>
    <section className="con-panel con-architecture">
      <div className="con-section-head"><div><h2>Communication Architecture</h2><p>Three monitored layers · outbound tunnel initiated by each school server</p></div><span className="con-mini-label">REFERENCE FLOW</span></div>
      <div className="con-flow">
        <div className="con-layer"><span className="con-layer-kicker">LAYER 01 · CENTRAL PLATFORM</span><div className="con-node"><ShieldCheck size={15}/><span><b>Central Monitoring Service</b><small>Receives heartbeats & telemetry</small></span><Pill value="Healthy"/></div><div className="con-node"><Activity size={15}/><span><b>Central API</b><small>Central platform endpoint</small></span><Pill value="Healthy"/></div></div>
        <div className="con-arrow"><ChevronRight/><small>HTTPS</small></div>
        <div className="con-layer"><span className="con-layer-kicker">LAYER 02 · CLOUDFLARE NETWORK</span><div className="con-node"><Network size={15}/><span><b>Cloudflare Edge</b><small>Secure network edge</small></span><Pill value="Unknown"/></div><div className="con-node"><Activity size={15}/><span><b>Tunnel Connectivity</b><small>Outbound secure tunnel</small></span><Pill value="Unknown"/></div></div>
        <div className="con-arrow"><ChevronRight/><small>Tunnel</small></div>
        <div className="con-layer"><span className="con-layer-kicker">LAYER 03 · SCHOOL INFRASTRUCTURE</span><div className="con-node"><Network size={15}/><span><b>School Tunnel Connector</b><small>Outbound connector agent</small></span><Pill value="Unknown"/></div><div className="con-node"><Server size={15}/><span><b>Local API</b><small>School backend service</small></span><Pill value="Unknown"/></div><div className="con-node con-node-sub"><Activity size={14}/><span><b>Local Server</b><small>Isolated school environment</small></span></div><div className="con-node con-node-sub"><DatabaseIcon/><span><b>PostgreSQL</b><small>School-isolated database</small></span></div></div>
      </div>
      <div className="con-architecture-note"><ShieldCheck size={14}/>School servers establish outbound secure tunnel connections. Monitoring status is based on reported heartbeats and telemetry. The central platform does not directly access school private LANs or databases.</div>
    </section>
    <section className="con-panel con-table-panel">
      <div className="con-section-head con-table-title"><div><h2>School Connectivity</h2><p>Communication status by registered school</p></div><span className="con-count">5 demonstration records</span></div>
      <div className="con-toolbar">
        <label className="con-search"><Search size={14}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by school name, code, or API hostname..."/></label>
        <select value={stateFilter} onChange={e=>setStateFilter(e.target.value)}><option>All</option>{["Online","Offline","Degraded","Unknown"].map(x=><option key={x}>{x}</option>)}</select>
        <select value={tunnelFilter} onChange={e=>setTunnelFilter(e.target.value)}><option>All</option>{["Connected","Disconnected","Degraded","Unknown"].map(x=><option key={x}>{x}</option>)}</select>
        <select value={apiFilter} onChange={e=>setApiFilter(e.target.value)}><option>All</option>{["Healthy","Slow","Unavailable","Unknown"].map(x=><option key={x}>{x}</option>)}</select>
        <button className="con-clear" onClick={clear}><Filter size={13}/>Clear filters</button>
      </div>
      <div className="con-table-wrap"><table className="con-table"><thead><tr><th>School</th><th>API Hostname</th><th>Tunnel Status</th><th>API Status</th><th>Last Heartbeat</th><th>Latency</th><th>Connectivity State</th><th/></tr></thead><tbody>
        {filtered.map(r=><tr key={r.code}><td><b>{r.school}</b><small>{r.code}</small></td><td><code title={r.hostname}>{r.hostname}</code></td><td><Pill value={r.tunnel}/></td><td><Pill value={r.api}/></td><td><span className="con-mono">{r.heartbeat}</span>{r.freshness==="Stale"&&<small className="con-stale">Stale</small>}</td><td><span className={r.latency!==null&&r.latency>500?"con-latency-high":"con-mono"}>{r.latency===null?"—":`${r.latency} ms`}</span></td><td><Pill value={r.state}/></td><td className="con-actions"><button className="con-icon-btn" aria-label={`Actions for ${r.school}`} onClick={()=>setMenu(menu===r.code?null:r.code)}><MoreHorizontal size={17}/></button>{menu===r.code&&<div className="con-menu"><button onClick={()=>{setSelected(r);setMenu(null)}}>View Connectivity Details</button><button onClick={()=>{setEventsFor(r);setMenu(null)}}>View Heartbeat History</button><button onClick={()=>{setEventsFor(r);setMenu(null)}}>View Recent Events</button><button onClick={()=>{notify("Tunnel details are available in Cloudflare Tunnels.");setMenu(null)}}>View Tunnel Details</button><button onClick={()=>{notify("Server details are available in Servers.");setMenu(null)}}>View Server Details</button></div>}</td></tr>)}
        {filtered.length===0&&<tr><td colSpan={8} className="con-empty"><Search size={18}/><b>No connectivity records found</b><span>Try changing your search or clearing the filters.</span><button onClick={clear}>Clear filters</button></td></tr>}
      </tbody></table></div>
      <div className="con-table-foot"><span>Showing {filtered.length?1:0}–{filtered.length} of {filtered.length} matching records</span><span>Demo dataset · 5 records</span></div>
    </section>
    {selected&&<div className="con-drawer-backdrop" onMouseDown={()=>setSelected(null)}><aside className="con-drawer" onMouseDown={e=>e.stopPropagation()}><div className="con-drawer-head"><div><span className="con-eyebrow">CONNECTIVITY DETAILS</span><h2>{selected.school}</h2><p>{selected.code} · <code>{selected.hostname}</code></p></div><button className="con-icon-btn" onClick={()=>setSelected(null)} aria-label="Close details"><X size={18}/></button></div>
      <div className="con-drawer-body"><section className="con-detail-section"><h3>School Identity</h3><div className="con-detail-row"><span>School</span><b>{selected.school}</b></div><div className="con-detail-row"><span>School Code</span><b className="con-mono">{selected.code}</b></div><div className="con-detail-row"><span>API Hostname</span><b className="con-mono">{selected.hostname}</b></div><div className="con-detail-row"><span>Connectivity</span><Pill value={selected.state}/></div></section>
      <section className="con-detail-section"><h3>Communication Path</h3><div className="con-path">{[["Central Monitoring Service",selected.central],["Central API",selected.central],["Cloudflare Network",selected.cloudflare],["School Tunnel Connector",selected.connector],["School Local API",selected.localApi]].map(([name,status],i)=><div className="con-path-step" key={name}><span className="con-path-index">{i+1}</span><b>{name}</b><Pill value={status}/></div>)}</div><p className="con-help">Local Server and PostgreSQL remain inside the school's isolated infrastructure boundary. No direct central-to-LAN or database connection is represented.</p></section>
      <section className="con-detail-section"><h3>Connection Metrics</h3><div className="con-detail-row"><span>Last Heartbeat</span><b>{selected.heartbeat}</b></div><div className="con-detail-row"><span>Heartbeat Age</span><b>{selected.age}</b></div><div className="con-detail-row"><span>Measured Latency</span><b>{selected.latency===null?"Not measured":`${selected.latency} ms`}</b></div><div className="con-detail-row"><span>Request Failure Rate</span><b>Not measured</b></div><div className="con-detail-row"><span>Last Successful Communication</span><b>{selected.lastSuccess}</b></div><div className="con-detail-row"><span>Monitoring Freshness</span><Pill value={selected.freshness}/></div></section>
      <section className="con-detail-section"><h3>Recent Connectivity Events <span className="con-mini-label">DEMO DATA</span></h3><div className="con-events">{eventSamples.map((ev)=><div className="con-event" key={ev.title}><i className={ev.level}/><div><b>{ev.title}</b><small>{ev.time}</small><p>{ev.detail}</p></div></div>)}</div></section></div><div className="con-drawer-foot"><button className="con-btn" onClick={()=>{setEventsFor(selected);setSelected(null)}}><History size={14}/>View Recent Events</button><button className="con-btn con-primary" onClick={()=>setSelected(null)}>Done</button></div></aside></div>}
    {eventsFor&&<div className="con-drawer-backdrop" onMouseDown={()=>setEventsFor(null)}><aside className="con-drawer con-events-drawer" onMouseDown={e=>e.stopPropagation()}><div className="con-drawer-head"><div><span className="con-eyebrow">HEARTBEAT & EVENT HISTORY</span><h2>{eventsFor.school}</h2><p>{eventsFor.code} · Demonstration events</p></div><button className="con-icon-btn" onClick={()=>setEventsFor(null)} aria-label="Close history"><X size={18}/></button></div><div className="con-drawer-body"><div className="con-history-note"><AlertTriangle size={15}/>Fictional sample events only. Actual heartbeat history requires a connected monitoring backend.</div><div className="con-events">{eventSamples.map(ev=><div className="con-event" key={ev.title}><i className={ev.level}/><div><b>{ev.title}</b><small>{ev.time}</small><p>{ev.detail}</p></div></div>)}</div></div></aside></div>}
  </div>;
}
function DatabaseIcon(){return <Server size={14}/>;}
