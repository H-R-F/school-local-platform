import { useMemo, useState } from "react";
import {
  Activity, AlertCircle, AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2,
  ChevronDown, ChevronRight, Clock3, Download, ExternalLink, Filter, Globe2,
  History, Info, MoreHorizontal, Network, RefreshCw, Search, Server, ShieldCheck,
  Signal, Timer, Wifi, X, Zap,
} from "lucide-react";

type ConnectivityState = "Online" | "Degraded" | "Offline" | "Unknown";
type SignalState = "Healthy" | "Warning" | "Failed" | "Unknown";
type SchoolRecord = {
  code: string; school: string; city: string; hostname: string; tunnel: SignalState;
  internet: SignalState; dns: SignalState; api: SignalState; state: ConnectivityState;
  latency: number | null; packetLoss: number | null; uptime: number | null;
  heartbeatAt: string; heartbeatAge: string; freshness: "Fresh" | "Stale" | "Never";
  lastSuccess: string; lastIncident: string; connector: string; provider: string;
  checks: { label: string; state: SignalState; detail: string }[];
};
type EventItem = { id: string; schoolCode: string; title: string; time: string; severity: "Info" | "Warning" | "Critical"; detail: string; acknowledged: boolean };

const seedRecords: SchoolRecord[] = [
  { code:"ATS-001", school:"Atlas International School", city:"Casablanca", hostname:"api.atlas-school.ma", tunnel:"Healthy", internet:"Healthy", dns:"Healthy", api:"Healthy", state:"Online", latency:42, packetLoss:0, uptime:99.98, heartbeatAt:"10 Nov 2026 · 18:41:30 UTC", heartbeatAge:"30 sec ago", freshness:"Fresh", lastSuccess:"10 Nov 2026 · 18:41:30 UTC", lastIncident:"No active incident", connector:"cloudflared 2026.10.2", provider:"Maroc Telecom", checks:[{label:"Internet reachability",state:"Healthy",detail:"Public HTTPS probe succeeded"},{label:"DNS resolution",state:"Healthy",detail:"Hostname resolved successfully"},{label:"Cloudflare Tunnel",state:"Healthy",detail:"Connector reports an active connection"},{label:"School API",state:"Healthy",detail:"Health endpoint returned HTTP 200"}] },
  { code:"AAS-002", school:"Al Amal School", city:"Fès", hostname:"api.alamal-school.ma", tunnel:"Failed", internet:"Failed", dns:"Unknown", api:"Unknown", state:"Offline", latency:null, packetLoss:null, uptime:96.2, heartbeatAt:"10 Nov 2026 · 15:39:00 UTC", heartbeatAge:"3 hours ago", freshness:"Stale", lastSuccess:"10 Nov 2026 · 15:39:00 UTC", lastIncident:"Internet connectivity lost", connector:"cloudflared 2026.9.4", provider:"Orange Maroc", checks:[{label:"Internet reachability",state:"Failed",detail:"No response from external probe"},{label:"DNS resolution",state:"Unknown",detail:"Could not run DNS check while offline"},{label:"Cloudflare Tunnel",state:"Unknown",detail:"No recent connector telemetry"},{label:"School API",state:"Unknown",detail:"API status cannot be verified"}] },
  { code:"FAC-003", school:"Future Academy", city:"Rabat", hostname:"api.future-academy.ma", tunnel:"Warning", internet:"Healthy", dns:"Healthy", api:"Warning", state:"Degraded", latency:840, packetLoss:3.4, uptime:99.1, heartbeatAt:"10 Nov 2026 · 18:40:00 UTC", heartbeatAge:"2 min ago", freshness:"Fresh", lastSuccess:"10 Nov 2026 · 18:40:00 UTC", lastIncident:"High API response time", connector:"cloudflared 2026.10.2", provider:"Inwi", checks:[{label:"Internet reachability",state:"Healthy",detail:"External probe succeeded"},{label:"DNS resolution",state:"Healthy",detail:"Hostname resolved successfully"},{label:"Cloudflare Tunnel",state:"Warning",detail:"Intermittent reconnects detected"},{label:"School API",state:"Warning",detail:"Health endpoint responded slowly"}] },
  { code:"ISS-004", school:"Ibn Sina School", city:"Meknès", hostname:"api.ibnsina-school.ma", tunnel:"Unknown", internet:"Unknown", dns:"Unknown", api:"Unknown", state:"Unknown", latency:null, packetLoss:null, uptime:null, heartbeatAt:"Never received", heartbeatAge:"Never", freshness:"Never", lastSuccess:"Not reported", lastIncident:"No telemetry received yet", connector:"Not registered", provider:"Not configured", checks:[{label:"Internet reachability",state:"Unknown",detail:"No monitoring data available"},{label:"DNS resolution",state:"Unknown",detail:"No monitoring data available"},{label:"Cloudflare Tunnel",state:"Unknown",detail:"Tunnel not yet verified"},{label:"School API",state:"Unknown",detail:"API endpoint not yet verified"}] },
  { code:"HZS-005", school:"Horizon School", city:"Marrakech", hostname:"api.horizon-school.ma", tunnel:"Healthy", internet:"Healthy", dns:"Healthy", api:"Healthy", state:"Online", latency:58, packetLoss:0.1, uptime:99.95, heartbeatAt:"10 Nov 2026 · 18:40:45 UTC", heartbeatAge:"1 min ago", freshness:"Fresh", lastSuccess:"10 Nov 2026 · 18:40:45 UTC", lastIncident:"No active incident", connector:"cloudflared 2026.10.2", provider:"Maroc Telecom", checks:[{label:"Internet reachability",state:"Healthy",detail:"Public HTTPS probe succeeded"},{label:"DNS resolution",state:"Healthy",detail:"Hostname resolved successfully"},{label:"Cloudflare Tunnel",state:"Healthy",detail:"Connector reports an active connection"},{label:"School API",state:"Healthy",detail:"Health endpoint returned HTTP 200"}] },
  { code:"OLV-006", school:"Les Oliviers", city:"Agadir", hostname:"api.oliviers-school.ma", tunnel:"Healthy", internet:"Healthy", dns:"Healthy", api:"Healthy", state:"Online", latency:67, packetLoss:0, uptime:99.87, heartbeatAt:"10 Nov 2026 · 18:40:12 UTC", heartbeatAge:"1 min ago", freshness:"Fresh", lastSuccess:"10 Nov 2026 · 18:40:12 UTC", lastIncident:"No active incident", connector:"cloudflared 2026.10.2", provider:"Inwi", checks:[{label:"Internet reachability",state:"Healthy",detail:"External probe succeeded"},{label:"DNS resolution",state:"Healthy",detail:"Hostname resolved successfully"},{label:"Cloudflare Tunnel",state:"Healthy",detail:"Connector reports an active connection"},{label:"School API",state:"Healthy",detail:"Health endpoint returned HTTP 200"}] },
  { code:"WAH-007", school:"Al Waha School", city:"Tanger", hostname:"api.alwaha-school.ma", tunnel:"Warning", internet:"Healthy", dns:"Healthy", api:"Healthy", state:"Degraded", latency:310, packetLoss:1.8, uptime:98.7, heartbeatAt:"10 Nov 2026 · 18:39:20 UTC", heartbeatAge:"2 min ago", freshness:"Fresh", lastSuccess:"10 Nov 2026 · 18:39:20 UTC", lastIncident:"Packet loss above threshold", connector:"cloudflared 2026.9.4", provider:"Orange Maroc", checks:[{label:"Internet reachability",state:"Healthy",detail:"External probe succeeded"},{label:"DNS resolution",state:"Healthy",detail:"Hostname resolved successfully"},{label:"Cloudflare Tunnel",state:"Warning",detail:"Connection quality is unstable"},{label:"School API",state:"Healthy",detail:"Health endpoint returned HTTP 200"}] },
  { code:"MAN-008", school:"Institution Al Manar", city:"Oujda", hostname:"api.almanar-school.ma", tunnel:"Healthy", internet:"Healthy", dns:"Healthy", api:"Healthy", state:"Online", latency:51, packetLoss:0, uptime:99.99, heartbeatAt:"10 Nov 2026 · 18:41:02 UTC", heartbeatAge:"45 sec ago", freshness:"Fresh", lastSuccess:"10 Nov 2026 · 18:41:02 UTC", lastIncident:"No active incident", connector:"cloudflared 2026.10.2", provider:"Maroc Telecom", checks:[{label:"Internet reachability",state:"Healthy",detail:"External probe succeeded"},{label:"DNS resolution",state:"Healthy",detail:"Hostname resolved successfully"},{label:"Cloudflare Tunnel",state:"Healthy",detail:"Connector reports an active connection"},{label:"School API",state:"Healthy",detail:"Health endpoint returned HTTP 200"}] },
];

const seedEvents: EventItem[] = [
  {id:"NET-2408",schoolCode:"AAS-002",title:"Internet connectivity lost",time:"10 Nov 2026 · 15:39:00 UTC",severity:"Critical",detail:"The school connector stopped reporting and the external reachability probe failed.",acknowledged:false},
  {id:"NET-2407",schoolCode:"FAC-003",title:"High API response time",time:"10 Nov 2026 · 17:58:31 UTC",severity:"Warning",detail:"The school API health endpoint exceeded the configured response-time threshold.",acknowledged:false},
  {id:"NET-2406",schoolCode:"WAH-007",title:"Packet loss threshold exceeded",time:"10 Nov 2026 · 17:42:08 UTC",severity:"Warning",detail:"Measured packet loss is above the configured warning threshold.",acknowledged:true},
  {id:"NET-2405",schoolCode:"ATS-001",title:"Connectivity check passed",time:"10 Nov 2026 · 18:41:30 UTC",severity:"Info",detail:"All configured connectivity checks completed successfully.",acknowledged:true},
];

function StatePill({value}:{value:string}) {
  const key=value.toLowerCase();
  const cls=["online","healthy","fresh","info"].includes(key)?"good":["degraded","warning","stale","slow"].includes(key)?"warn":["offline","failed","critical","unavailable"].includes(key)?"bad":"muted";
  return <span className={`cx-pill ${cls}`}><i/>{value}</span>;
}
function StatCard({label,value,helper,icon:Icon,tone="neutral"}:{label:string;value:string;helper:string;icon:typeof Activity;tone?:string}) {
  return <div className="cx-stat"><span className={`cx-stat-icon ${tone}`}><Icon size={16}/></span><div><small>{label}</small><strong>{value}</strong><em>{helper}</em></div></div>;
}
function formatMs(value:number|null){return value===null?"—":`${value} ms`;}

export function ConnectivityPage({notify}:{notify:(message:string)=>void}) {
  const [records,setRecords]=useState(seedRecords);
  const [events,setEvents]=useState(seedEvents);
  const [query,setQuery]=useState("");
  const [stateFilter,setStateFilter]=useState("All");
  const [signalFilter,setSignalFilter]=useState("All");
  const [sort,setSort]=useState("attention");
  const [selected,setSelected]=useState<SchoolRecord|null>(null);
  const [activeTab,setActiveTab]=useState<"overview"|"diagnostics"|"events">("overview");
  const [refreshing,setRefreshing]=useState(false);
  const [runningCheck,setRunningCheck]=useState(false);
  const [showFilters,setShowFilters]=useState(false);
  const [showAllEvents,setShowAllEvents]=useState(false);

  const counts=useMemo(()=>({total:records.length,online:records.filter(r=>r.state==="Online").length,degraded:records.filter(r=>r.state==="Degraded").length,offline:records.filter(r=>r.state==="Offline").length,unknown:records.filter(r=>r.state==="Unknown").length}),[records]);
  const filtered=useMemo(()=>{
    const rows=records.filter(r=>(stateFilter==="All"||r.state===stateFilter)&&(signalFilter==="All"||[r.internet,r.dns,r.tunnel,r.api].includes(signalFilter as SignalState))&&`${r.school} ${r.code} ${r.city} ${r.hostname}`.toLowerCase().includes(query.toLowerCase()));
    return rows.sort((a,b)=>sort==="name"?a.school.localeCompare(b.school):sort==="latency"?(b.latency??-1)-(a.latency??-1):({Offline:0,Degraded:1,Unknown:2,Online:3}[a.state]-({Offline:0,Degraded:1,Unknown:2,Online:3}[b.state])));
  },[records,stateFilter,signalFilter,query,sort]);
  const clearFilters=()=>{setQuery("");setStateFilter("All");setSignalFilter("All");setSort("attention");};
  const refresh=()=>{setRefreshing(true);window.setTimeout(()=>{setRefreshing(false);notify("Demo connectivity data refreshed. No live network checks were performed.");},700);};
  const openRecord=(record:SchoolRecord,tab:"overview"|"diagnostics"|"events"="overview")=>{setSelected(record);setActiveTab(tab);};
  const runDiagnostics=()=>{
    if(!selected)return;
    setRunningCheck(true);
    window.setTimeout(()=>{
      const updated={...selected,latency:selected.state==="Offline"?null:Math.max(28,Math.min(950,(selected.latency??70)+Math.round((Math.random()-.5)*24))),lastSuccess:selected.state==="Offline"?selected.lastSuccess:"10 Nov 2026 · just now",heartbeatAge:selected.state==="Offline"?"3 hours ago":"Just now"};
      setRecords(rows=>rows.map(r=>r.code===selected.code?updated:r));
      setSelected(updated);setRunningCheck(false);
      setEvents(rows=>[{id:`NET-${Date.now()}`,schoolCode:selected.code,title:"Manual diagnostics completed",time:"10 Nov 2026 · just now",severity:updated.state==="Offline"?"Critical":"Info",detail:updated.state==="Offline"?"The school remains unreachable in this simulated check.":"The simulated diagnostic completed. Values are demonstration data."},...rows]);
      notify("Diagnostic simulation completed. No real network request was sent.");
    },850);
  };
  const acknowledge=(id:string)=>{setEvents(rows=>rows.map(e=>e.id===id?{...e,acknowledged:true}:e));notify("Event acknowledged in demo mode.");};
  const schoolName=(code:string)=>records.find(r=>r.code===code)?.school??code;

  return <div className="cx-page">
    <div className="cx-demo"><span/>DEMO ENVIRONMENT <b>Sample telemetry only</b><span className="cx-demo-copy">No live network probes or school connections are active.</span></div>
    <header className="cx-header"><div><div className="cx-eyebrow">INFRASTRUCTURE / NETWORK OPERATIONS</div><h1>Connectivity</h1><p>Understand whether each school can reach the services it depends on, and identify where communication is failing.</p></div><div className="cx-header-actions"><span className="cx-updated"><Clock3 size={13}/> Sample snapshot · 10 Nov 2026, 18:42 UTC</span><button className="cx-btn" onClick={refresh} disabled={refreshing}><RefreshCw size={14} className={refreshing?"cx-spin":""}/>{refreshing?"Refreshing…":"Refresh data"}</button></div></header>
    <div className="cx-summary">
      <StatCard label="Registered schools" value={String(counts.total)} helper="In this demo dataset" icon={Server}/>
      <StatCard label="Online" value={String(counts.online)} helper="All key checks healthy" icon={CheckCircle2} tone="good"/>
      <StatCard label="Degraded" value={String(counts.degraded)} helper="Connection quality reduced" icon={Signal} tone="warn"/>
      <StatCard label="Offline" value={String(counts.offline)} helper="No current communication" icon={AlertCircle} tone="bad"/>
      <StatCard label="Unknown" value={String(counts.unknown)} helper="No verified telemetry yet" icon={Info}/>
    </div>

    <section className="cx-health-panel">
      <div className="cx-panel-heading"><div><h2>Fleet connectivity health</h2><p>Distribution based on the latest reported checks, not server power state.</p></div><span className="cx-label">DEMO SNAPSHOT</span></div>
      <div className="cx-health-layout"><div className="cx-health-bar" aria-label="Connectivity health distribution">{counts.online>0&&<i className="good" style={{width:`${counts.online/counts.total*100}%`}}/>}{counts.degraded>0&&<i className="warn" style={{width:`${counts.degraded/counts.total*100}%`}}/>}{counts.offline>0&&<i className="bad" style={{width:`${counts.offline/counts.total*100}%`}}/>}{counts.unknown>0&&<i className="unknown" style={{width:`${counts.unknown/counts.total*100}%`}}/>}</div><div className="cx-legend"><span><i className="good"/>Online <b>{counts.online}</b></span><span><i className="warn"/>Degraded <b>{counts.degraded}</b></span><span><i className="bad"/>Offline <b>{counts.offline}</b></span><span><i className="unknown"/>Unknown <b>{counts.unknown}</b></span></div></div>
      <div className="cx-architecture"><div className="cx-architecture-step"><span className="cx-step-icon"><Globe2 size={16}/></span><div><b>Internet & DNS</b><small>Can the school resolve and reach public services?</small></div><StatePill value="School-side checks"/></div><ChevronRight size={16}/><div className="cx-architecture-step"><span className="cx-step-icon"><Network size={16}/></span><div><b>Cloudflare Tunnel</b><small>Is the secure connector reachable?</small></div><StatePill value="Tunnel checks"/></div><ChevronRight size={16}/><div className="cx-architecture-step"><span className="cx-step-icon"><Server size={16}/></span><div><b>School API</b><small>Does the application endpoint respond?</small></div><StatePill value="Application checks"/></div></div>
      <div className="cx-note"><ShieldCheck size={14}/> Connectivity is separate from server health. A server may be running while its internet connection, tunnel, DNS, or API is unavailable.</div>
    </section>

    <section className="cx-table-panel">
      <div className="cx-panel-heading"><div><h2>School connection inventory</h2><p>Search, filter and inspect the communication path for each school.</p></div><span className="cx-record-count">{filtered.length} of {records.length} schools</span></div>
      <div className="cx-toolbar"><label className="cx-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search school, code, city, or hostname…"/>{query&&<button onClick={()=>setQuery("")} aria-label="Clear search"><X size={13}/></button>}</label><button className={showFilters?"cx-btn cx-btn-active":"cx-btn"} onClick={()=>setShowFilters(v=>!v)}><Filter size={14}/>Filters<ChevronDown size={12}/></button><label className="cx-sort">Sort by<select value={sort} onChange={e=>setSort(e.target.value)}><option value="attention">Needs attention</option><option value="name">School name</option><option value="latency">Highest latency</option></select></label><button className="cx-text-btn" onClick={clearFilters}>Clear all</button></div>
      {showFilters&&<div className="cx-filter-row"><label>Connectivity state<select value={stateFilter} onChange={e=>setStateFilter(e.target.value)}>{["All","Online","Degraded","Offline","Unknown"].map(v=><option key={v}>{v}</option>)}</select></label><label>Any signal status<select value={signalFilter} onChange={e=>setSignalFilter(e.target.value)}>{["All","Healthy","Warning","Failed","Unknown"].map(v=><option key={v}>{v}</option>)}</select></label></div>}
      <div className="cx-table-wrap"><table className="cx-table"><thead><tr><th>School</th><th>Internet / DNS</th><th>Tunnel</th><th>School API</th><th>Latency</th><th>Last heartbeat</th><th>Overall state</th><th/></tr></thead><tbody>
        {filtered.map(r=><tr key={r.code} onClick={()=>openRecord(r)}><td><div className="cx-school"><span>{r.code.slice(0,2)}</span><div><b>{r.school}</b><small>{r.code} · {r.city}</small></div></div></td><td><div className="cx-signal-pair"><StatePill value={r.internet}/><StatePill value={r.dns}/></div></td><td><StatePill value={r.tunnel}/></td><td><StatePill value={r.api}/></td><td><b className={r.latency!==null&&r.latency>500?"cx-latency-warn":""}>{formatMs(r.latency)}</b>{r.packetLoss!==null&&<small className="cx-sub-value">{r.packetLoss}% loss</small>}</td><td><span className="cx-heartbeat"><i className={r.freshness.toLowerCase()}/>{r.heartbeatAge}</span></td><td><StatePill value={r.state}/></td><td><button className="cx-row-action" onClick={e=>{e.stopPropagation();openRecord(r)}} aria-label={`View ${r.school} details`}><MoreHorizontal size={17}/></button></td></tr>)}
        {filtered.length===0&&<tr><td colSpan={8}><div className="cx-empty"><Search size={20}/><b>No matching schools</b><span>Try changing your search or filters.</span><button onClick={clearFilters}>Clear filters</button></div></td></tr>}
      </tbody></table></div>
      <footer className="cx-table-footer"><span>Showing {filtered.length} demonstration records</span><span>Connectivity state is calculated from independent signal checks</span></footer>
    </section>

    <div className="cx-bottom-grid"><section className="cx-events-panel"><div className="cx-panel-heading"><div><h2>Recent connectivity events</h2><p>Incidents and noteworthy changes across the fleet.</p></div><button className="cx-text-btn" onClick={()=>setShowAllEvents(value=>!value)}>{showAllEvents?"Show recent":"View all events"} <ChevronRight size={13}/></button></div><div className="cx-event-list">{events.slice(0,showAllEvents?events.length:4).map(ev=><div className="cx-event-row" key={ev.id}><span className={`cx-event-icon ${ev.severity.toLowerCase()}`}>{ev.severity==="Critical"?<AlertCircle size={15}/>:ev.severity==="Warning"?<AlertTriangle size={15}/>:<CheckCircle2 size={15}/>}</span><div><b>{ev.title}</b><small>{schoolName(ev.schoolCode)} · {ev.time}</small></div><StatePill value={ev.acknowledged?"Acknowledged":ev.severity}/>{!ev.acknowledged&&<button className="cx-ack-btn" onClick={()=>acknowledge(ev.id)}>Acknowledge</button>}</div>)}</div></section>
      <section className="cx-ops-panel"><div className="cx-panel-heading"><div><h2>How to read this page</h2><p>Keep the operational signals separate.</p></div><Info size={16}/></div><div className="cx-ops-item"><Wifi size={15}/><div><b>Internet</b><small>External reachability from the school environment.</small></div></div><div className="cx-ops-item"><Network size={15}/><div><b>Tunnel</b><small>Cloudflare connector status; see Tunnels for connector details.</small></div></div><div className="cx-ops-item"><Activity size={15}/><div><b>API</b><small>Application health check; a healthy tunnel does not guarantee a healthy API.</small></div></div><div className="cx-ops-item"><Clock3 size={15}/><div><b>Heartbeat</b><small>Last report received. Old data is marked stale, not treated as live.</small></div></div></section></div>

    {selected&&<div className="cx-overlay" onMouseDown={()=>setSelected(null)}><aside className="cx-drawer" role="dialog" aria-modal="true" aria-label="School connectivity details" onMouseDown={e=>e.stopPropagation()}>
      <header className="cx-drawer-head"><div><span className="cx-eyebrow">SCHOOL CONNECTIVITY</span><h2>{selected.school}</h2><p>{selected.code} · {selected.city} · <code>{selected.hostname}</code></p></div><button className="cx-close" onClick={()=>setSelected(null)} aria-label="Close"><X size={17}/></button></header>
      <div className="cx-drawer-summary"><StatePill value={selected.state}/><span><Clock3 size={12}/> Last heartbeat: {selected.heartbeatAge}</span><span>Latency: {formatMs(selected.latency)}</span></div>
      <nav className="cx-tabs"><button className={activeTab==="overview"?"active":""} onClick={()=>setActiveTab("overview")}>Overview</button><button className={activeTab==="diagnostics"?"active":""} onClick={()=>setActiveTab("diagnostics")}>Diagnostics</button><button className={activeTab==="events"?"active":""} onClick={()=>setActiveTab("events")}>Event history</button></nav>
      <div className="cx-drawer-body">
        {activeTab==="overview"&&<><section className="cx-detail-section"><h3>Connection path</h3>{selected.checks.map((check,i)=><div className="cx-check-row" key={check.label}><span className="cx-check-number">{i+1}</span><div><b>{check.label}</b><small>{check.detail}</small></div><StatePill value={check.state}/></div>)}</section><section className="cx-detail-section"><h3>Connection measurements</h3><div className="cx-detail-grid"><div><small>Latency</small><b>{formatMs(selected.latency)}</b></div><div><small>Packet loss</small><b>{selected.packetLoss===null?"Not measured":`${selected.packetLoss}%`}</b></div><div><small>Reported uptime</small><b>{selected.uptime===null?"Not available":`${selected.uptime}%`}</b></div><div><small>Monitoring freshness</small><b>{selected.freshness}</b></div><div><small>Last successful check</small><b>{selected.lastSuccess}</b></div><div><small>Last incident</small><b>{selected.lastIncident}</b></div></div></section><section className="cx-detail-section"><h3>School network metadata</h3><div className="cx-detail-grid"><div><small>Internet provider</small><b>{selected.provider}</b></div><div><small>Tunnel connector</small><b>{selected.connector}</b></div><div><small>API hostname</small><b>{selected.hostname}</b></div><div><small>Last heartbeat</small><b>{selected.heartbeatAt}</b></div></div></section></>}
        {activeTab==="diagnostics"&&<><div className="cx-info-callout"><ShieldCheck size={15}/>Diagnostics are simulated locally in this demo. In production, checks would run from approved monitoring probes and the school connector.</div><section className="cx-detail-section"><h3>Diagnostic checks</h3>{selected.checks.map(check=><div className="cx-check-row" key={check.label}><span className="cx-check-number"><Activity size={13}/></span><div><b>{check.label}</b><small>{check.detail}</small></div><StatePill value={check.state}/></div>)}</section><section className="cx-detail-section"><h3>Suggested investigation</h3><p className="cx-guidance">{selected.state==="Offline"?"Start by checking the school's internet router and ISP connection. If internet is restored, verify the cloudflared service and then the School API.":selected.state==="Degraded"?"Check packet loss and latency at the school router, inspect cloudflared reconnect events, then review API response times.":selected.state==="Unknown"?"Confirm that the school has completed installation, the monitoring connector is registered, and its first heartbeat has been received.":"No connectivity issue is currently indicated by this sample record. Continue monitoring heartbeat freshness and API response time."}</p></section></>}
        {activeTab==="events"&&<section className="cx-detail-section"><h3>Events for this school</h3>{events.filter(e=>e.schoolCode===selected.code).map(ev=><div className="cx-history-item" key={ev.id}><StatePill value={ev.severity}/><div><b>{ev.title}</b><small>{ev.time}</small><p>{ev.detail}</p>{!ev.acknowledged&&<button onClick={()=>acknowledge(ev.id)}>Acknowledge event</button>}</div></div>)}{events.every(e=>e.schoolCode!==selected.code)&&<div className="cx-empty"><History size={18}/><b>No events recorded</b><span>No sample events exist for this school.</span></div>}</section>}
      </div>
      <footer className="cx-drawer-footer"><button className="cx-btn" onClick={()=>{setSelected(null);notify("Server inventory is available in the Servers page.")}}><Server size={14}/>Server details</button><button className="cx-btn cx-primary" onClick={runDiagnostics} disabled={runningCheck}><Activity size={14}/>{runningCheck?"Running check…":"Run diagnostics"}</button></footer>
    </aside></div>}
  </div>;
}
