import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUp, CheckCircle2, ChevronDown,
  Clock3, Database, ExternalLink, FileText, Filter, Gauge,
  HeartPulse, Info, Layers3, RefreshCw, Search, Server,
  SlidersHorizontal, X, XCircle, Zap
} from "lucide-react";
import "./system-health.css";

type ServiceStatus = "Operational" | "Degraded" | "Down" | "Unknown";
type ComponentType = "API" | "Worker" | "Database" | "Internal Service";
type Service = {
  id: string; name: string; type: ComponentType; status: ServiceStatus;
  response: number | null; availability: number | null; checked: string;
  endpoint: string; owner: string; version: string; region: string;
  description: string;
};
type Incident = {
  id: string; title: string; service: string; severity: "Critical" | "Warning" | "Info";
  state: "Active" | "Resolved"; started: string; duration: string; summary: string;
};

const initialServices: Service[] = [
  { id:"api", name:"Central API", type:"API", status:"Operational", response:84, availability:99.98, checked:"30 sec ago", endpoint:"/api/v1/health", owner:"Platform Engineering", version:"v2.8.1", region:"eu-west-1", description:"Public control-plane API used by central administration clients." },
  { id:"auth", name:"Authentication Service", type:"Internal Service", status:"Operational", response:42, availability:99.99, checked:"30 sec ago", endpoint:"auth.internal/health", owner:"Identity Team", version:"v1.14.0", region:"eu-west-1", description:"Authentication, session validation and identity token issuance." },
  { id:"discovery", name:"School Discovery API", type:"API", status:"Operational", response:116, availability:99.95, checked:"31 sec ago", endpoint:"/api/v1/discovery/health", owner:"Platform Engineering", version:"v1.6.2", region:"eu-west-1", description:"Resolves registered school installations and their control-plane metadata." },
  { id:"monitoring", name:"Monitoring Service", type:"Internal Service", status:"Operational", response:132, availability:99.92, checked:"32 sec ago", endpoint:"monitoring.internal/health", owner:"SRE", version:"v1.9.3", region:"eu-west-1", description:"Collects and evaluates central-platform telemetry." },
  { id:"heartbeat", name:"Heartbeat Processor", type:"Worker", status:"Operational", response: null, availability:99.90, checked:"32 sec ago", endpoint:"queue:central-heartbeats", owner:"Platform Engineering", version:"v1.3.1", region:"eu-west-1", description:"Processes heartbeat events received from registered installations." },
  { id:"subscription", name:"Subscription Service", type:"Internal Service", status:"Operational", response:91, availability:99.97, checked:"33 sec ago", endpoint:"subscriptions.internal/health", owner:"Billing Team", version:"v1.5.0", region:"eu-west-1", description:"Manages subscription records and billing lifecycle events." },
  { id:"license", name:"License Validation Service", type:"Internal Service", status:"Operational", response:67, availability:99.99, checked:"34 sec ago", endpoint:"licenses.internal/health", owner:"Billing Team", version:"v1.8.4", region:"eu-west-1", description:"Validates central license entitlements and signed license claims." },
  { id:"notification", name:"Notification Service", type:"Worker", status:"Degraded", response:248, availability:99.70, checked:"36 sec ago", endpoint:"queue:central-notifications", owner:"Messaging Team", version:"v1.2.7", region:"eu-west-1", description:"Dispatches central platform email and in-app notifications." },
  { id:"database", name:"Central Database", type:"Database", status:"Operational", response:12, availability:99.99, checked:"30 sec ago", endpoint:"postgres://central-primary (redacted)", owner:"Data Platform", version:"PostgreSQL 16", region:"eu-west-1", description:"Primary relational datastore for central control-plane records." }
];

const initialIncidents: Incident[] = [
  { id:"INC-2048", title:"Notification queue processing is delayed", service:"Notification Service", severity:"Warning", state:"Active", started:"09:18 UTC", duration:"12 min", summary:"Queue age is above the configured warning threshold. Delivery continues, but notifications may arrive late." },
  { id:"INC-2046", title:"Elevated API latency in EU region", service:"Central API", severity:"Warning", state:"Resolved", started:"08:42 UTC", duration:"6 min", summary:"A short-lived latency increase returned to baseline after the affected worker pool recovered." },
  { id:"INC-2041", title:"Monitoring ingestion backlog", service:"Monitoring Service", severity:"Info", state:"Resolved", started:"Yesterday, 16:10", duration:"4 min", summary:"Telemetry ingestion recovered and delayed samples were processed." }
];

const statusClass = (status: ServiceStatus) => status.toLowerCase();
const chartSeries = {
  "Last Hour": { labels:["-60m","-50m","-40m","-30m","-20m","-10m","Now"], latency:[78,82,76,91,88,84,84], requests:[410,430,405,452,468,441,460], errors:[0.2,0.3,0.2,0.5,0.4,0.3,0.3] },
  "24 Hours": { labels:["00:00","04:00","08:00","12:00","16:00","20:00","Now"], latency:[92,86,105,98,89,94,84], requests:[320,280,410,455,470,390,460], errors:[0.4,0.2,0.6,0.5,0.3,0.4,0.3] },
  "7 Days": { labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], latency:[95,88,91,102,86,90,84], requests:[350,370,390,410,440,420,460], errors:[0.4,0.3,0.35,0.5,0.25,0.3,0.3] }
};

function StatusPill({ status }: { status: ServiceStatus }) {
  const Icon = status === "Operational" ? CheckCircle2 : status === "Degraded" ? AlertTriangle : status === "Down" ? XCircle : Info;
  return <span className={`sh-status sh-status--${statusClass(status)}`}><Icon size={13}/>{status}</span>;
}

function MiniChart({ title, unit, values, labels, color, suffix = "" }: {
  title:string; unit:string; values:number[]; labels:string[]; color:string; suffix?:string;
}) {
  const max = Math.max(...values) * 1.18 || 1;
  const points = values.map((value,index) => `${(index/(values.length-1))*100},${88-(value/max)*72}`).join(" ");
  return <section className="sh-card sh-chart-card">
    <div className="sh-card-head"><div><h3>{title}</h3><p>{unit} · DEMO DATA</p></div><span className="sh-chart-current">{values[values.length-1]}{suffix}</span></div>
    <div className="sh-chart">
      <div className="sh-chart-grid"><i/><i/><i/><i/></div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${title} demonstration trend`}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
        {values.map((v,i)=><circle key={i} cx={(i/(values.length-1))*100} cy={88-(v/max)*72} r="1.7" fill={color}/>)}
      </svg>
      <div className="sh-chart-labels">{labels.map(label=><span key={label}>{label}</span>)}</div>
    </div>
  </section>;
}

export function SystemHealthPage() {
  const [services] = useState(initialServices);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [sort, setSort] = useState("name");
  const [range, setRange] = useState<keyof typeof chartSeries>("24 Hours");
  const [pageIndex, setPageIndex] = useState(0);
  const [panel, setPanel] = useState<{kind:"service"|"metrics"|"logs"|"incidents"|"incident"; id?:string}|null>(null);
  const [incidentFilter, setIncidentFilter] = useState("All");
  const [logSearch, setLogSearch] = useState("");
  const [severity, setSeverity] = useState("All levels");
  const [logTime, setLogTime] = useState("Last hour");
  const [lastCheck, setLastCheck] = useState(new Date(Date.now()-30000));
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => {
    const result = services.filter(s =>
      (statusFilter === "All statuses" || s.status === statusFilter) &&
      (typeFilter === "All types" || s.type === typeFilter) &&
      `${s.name} ${s.type} ${s.endpoint}`.toLowerCase().includes(search.toLowerCase())
    );
    return result.sort((a,b) => {
      if(sort==="response") return (a.response ?? 99999)-(b.response ?? 99999);
      if(sort==="availability") return (b.availability ?? -1)-(a.availability ?? -1);
      if(sort==="checked") return a.checked.localeCompare(b.checked);
      return a.name.localeCompare(b.name);
    });
  },[services,statusFilter,typeFilter,search,sort]);
  const pageSize = 6;
  const pageCount = Math.max(1,Math.ceil(filtered.length/pageSize));
  const visible = filtered.slice(pageIndex*pageSize,(pageIndex+1)*pageSize);
  const selectedService = services.find(s=>s.id===panel?.id);
  const selectedIncident = incidents.find(i=>i.id===panel?.id);
  const activeIncidents = incidents.filter(i=>i.state==="Active").length;
  const operational = services.filter(s=>s.status==="Operational").length;
  const chart = chartSeries[range];

  const refresh = () => {
    setNotice("Live refresh unavailable · no monitoring backend is connected. The demo snapshot and last-check time are unchanged.");
  };
  const closePanel = () => setPanel(null);
  const showPanel = (kind:"service"|"metrics"|"logs"|"incidents"|"incident",id?:string) => setPanel({kind,id});
  const resolveIncident = (id:string) => {
    setIncidents(current=>current.map(i=>i.id===id?{...i,state:"Resolved"}:i));
    setNotice(`${id} marked resolved in this demo`);
  };
  const logs = [
    {time:"09:30:12.481",ageMinutes:0,level:"WARN",service:"notification-worker",message:"Queue age 184s exceeds warning threshold (120s)"},
    {time:"09:30:10.205",ageMinutes:2,level:"INFO",service:"central-api",message:"Health probe completed in 84ms"},
    {time:"09:30:08.912",ageMinutes:5,level:"INFO",service:"heartbeat-processor",message:"Batch processed · 42 events"},
    {time:"09:29:58.112",ageMinutes:12,level:"WARN",service:"notification-worker",message:"Retry scheduled for delivery batch #DEMO-883"},
    {time:"09:29:51.044",ageMinutes:40,level:"INFO",service:"central-database",message:"Connection pool within configured limits"}
  ].filter(l=>(severity==="All levels"||l.level===severity)&&l.ageMinutes<=(logTime==="Last hour"?60:logTime==="24 hours"?1440:10080)&&( `${l.service} ${l.message}`.toLowerCase().includes(logSearch.toLowerCase())));
  const lastCheckedLabel = lastCheck.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});

  return <div className="system-health-page">
    <div className="sh-page-header">
      <div><div className="sh-eyebrow">INFRASTRUCTURE / CENTRAL PLATFORM</div><h1>System Health</h1><p>Monitor the health and performance of central control-plane services.</p></div>
      <div className="sh-header-actions"><div className="sh-freshness"><span className="sh-live-dot"/>Demo snapshot · checked {lastCheckedLabel}</div><button className="sh-button sh-button-primary" onClick={refresh}><RefreshCw size={15}/>Refresh checks</button></div>
    </div>
    <div className="sh-demo-note"><Info size={15}/><span><b>DEMO DATA</b> — All service metrics, incidents, charts and logs on this page are fictional examples. No production telemetry or health-check endpoint is connected.</span></div>

    <section className="sh-overview">
      <div className="sh-overview-main"><div className="sh-overview-icon"><HeartPulse size={21}/></div><div><span className="sh-overline">OVERALL PLATFORM STATUS</span><h2>Operational <span className="sh-overview-sub">· {operational} of {services.length} services healthy</span></h2><p>One service is degraded. Review the active incident below.</p></div></div>
      <div className="sh-overview-stats"><div><strong>{services.length}</strong><span>Total services</span></div><div><strong>{operational}</strong><span>Operational</span></div><div><strong>{activeIncidents}</strong><span>Active incidents</span></div></div>
    </section>

    <div className="sh-section-heading"><div><h2>Service inventory</h2><p>Central platform components only · {services.length} monitored services</p></div><span className="sh-section-tag"><Activity size={13}/> DEMO SNAPSHOT</span></div>
    <section className="sh-card sh-inventory">
      <div className="sh-toolbar">
        <label className="sh-search"><Search size={15}/><input value={search} onChange={e=>{setSearch(e.target.value);setPageIndex(0);}} placeholder="Search services…"/></label>
        <label className="sh-select-wrap"><Filter size={14}/><select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPageIndex(0);}}><option>All statuses</option><option>Operational</option><option>Degraded</option><option>Down</option><option>Unknown</option></select><ChevronDown size={13}/></label>
        <label className="sh-select-wrap"><Layers3 size={14}/><select value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPageIndex(0);}}><option>All types</option><option>API</option><option>Worker</option><option>Database</option><option>Internal Service</option></select><ChevronDown size={13}/></label>
        <label className="sh-select-wrap sh-sort"><SlidersHorizontal size={14}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Sort: Name</option><option value="response">Sort: Response</option><option value="availability">Sort: Availability</option><option value="checked">Sort: Last check</option></select><ChevronDown size={13}/></label>
        {(search||statusFilter!=="All statuses"||typeFilter!=="All types")&&<button className="sh-clear" onClick={()=>{setSearch("");setStatusFilter("All statuses");setTypeFilter("All types");setPageIndex(0);}}>Clear</button>}
      </div>
      <div className="sh-table-wrap"><table className="sh-table"><thead><tr><th>Service</th><th>Component type</th><th>Status</th><th>Response time</th><th>Availability</th><th>Last health check</th><th>Actions</th></tr></thead><tbody>
        {visible.map(service=><tr key={service.id}>
          <td><button className="sh-service-name" onClick={()=>showPanel("service",service.id)}><span className="sh-service-icon">{service.type==="Database"?<Database size={16}/>:service.type==="Worker"?<Zap size={16}/>:service.type==="API"?<Gauge size={16}/>:<Server size={16}/>}</span><span><b>{service.name}</b><small>{service.endpoint}</small></span></button></td>
          <td><span className="sh-type">{service.type}</span></td><td><StatusPill status={service.status}/></td>
          <td>{service.response===null?<span className="sh-muted">—</span>:<b className="sh-number">{service.response} ms</b>}</td>
          <td>{service.availability===null?<span className="sh-muted">—</span>:<b className="sh-number">{service.availability.toFixed(2)}%</b>}</td>
          <td><span className="sh-checked"><Clock3 size={12}/>{service.checked}</span></td>
          <td><div className="sh-row-actions"><button onClick={()=>showPanel("service",service.id)} title="Service details">Details</button><button onClick={()=>showPanel("metrics",service.id)} title="Metrics">Metrics</button><button onClick={()=>showPanel("logs",service.id)} title="Logs">Logs</button><button onClick={()=>showPanel("incidents",service.id)} title="Related incidents">Incidents</button></div></td>
        </tr>)}
        {visible.length===0&&<tr><td colSpan={7}><div className="sh-empty"><Search size={20}/><b>No services match these filters</b><span>Try another search or clear the selected filters.</span><button onClick={()=>{setSearch("");setStatusFilter("All statuses");setTypeFilter("All types");}}>Clear filters</button></div></td></tr>}
      </tbody></table></div>
      <div className="sh-table-footer"><span>Showing {filtered.length===0?0:pageIndex*pageSize+1}–{Math.min((pageIndex+1)*pageSize,filtered.length)} of {filtered.length} services</span><div><button disabled={pageIndex===0} onClick={()=>setPageIndex(p=>p-1)}>Previous</button><span>Page {pageIndex+1} of {pageCount}</span><button disabled={pageIndex>=pageCount-1} onClick={()=>setPageIndex(p=>p+1)}>Next</button></div></div>
    </section>

    <div className="sh-section-heading sh-performance-heading"><div><h2>Platform performance</h2><p>Illustrative central-platform telemetry across the selected period.</p></div><div className="sh-range-switch">{(Object.keys(chartSeries) as Array<keyof typeof chartSeries>).map(r=><button key={r} className={range===r?"active":""} onClick={()=>setRange(r)}>{r}</button>)}</div></div>
    <div className="sh-chart-grid">{<MiniChart title="Central API response time" unit="Milliseconds (ms)" values={chart.latency} labels={chart.labels} color="#818cf8" suffix=" ms"/>}<MiniChart title="Request volume" unit="Requests per interval" values={chart.requests} labels={chart.labels} color="#38bdf8"/><MiniChart title="Error rate" unit="Percentage (%)" values={chart.errors} labels={chart.labels} color="#f59e0b" suffix="%"/></div>

    <div className="sh-section-heading sh-incident-heading"><div><h2>Incidents</h2><p>Service-level events affecting the central platform.</p></div><button className="sh-text-button" onClick={()=>showPanel("incidents")}>View incident history <ExternalLink size={13}/></button></div>
    <section className="sh-card sh-incidents">
      {incidents.filter(i=>i.state==="Active").map(i=><div className="sh-incident-row" key={i.id}><span className="sh-incident-symbol"><AlertTriangle size={17}/></span><div className="sh-incident-copy"><div><b>{i.title}</b><span className={`sh-severity sh-severity--${i.severity.toLowerCase()}`}>{i.severity}</span></div><p>{i.service} · {i.id} · Started {i.started} · {i.duration}</p><small>{i.summary}</small></div><button className="sh-button sh-button-secondary" onClick={()=>showPanel("incident",i.id)}>View incident</button></div>)}
      {incidents.every(i=>i.state!=="Active")&&<div className="sh-all-clear"><CheckCircle2 size={18}/>No active incidents. All reported incidents are resolved.</div>}
      <div className="sh-resolved-line"><CheckCircle2 size={14}/>{incidents.filter(i=>i.state==="Resolved").length} resolved incidents <button onClick={()=>showPanel("incidents")}>View history</button></div>
    </section>

    {notice&&<div className="sh-toast" role="status">{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss notification"><X size={14}/></button></div>}

    {panel&&<div className="sh-drawer-backdrop" onMouseDown={closePanel}><aside className="sh-drawer" role="dialog" aria-modal="true" aria-label="System health details" onMouseDown={e=>e.stopPropagation()}>
      <div className="sh-drawer-head"><div><span className="sh-overline">CENTRAL PLATFORM / DEMO</span><h2>{panel.kind==="service"?selectedService?.name:panel.kind==="incident"?selectedIncident?.title:panel.kind==="metrics"?"Service metrics":panel.kind==="logs"?"Service logs":panel.kind==="incidents"?"Related incidents":"Service details"}</h2><p>Illustrative data · not connected to production services</p></div><button className="sh-icon-button" onClick={closePanel} aria-label="Close panel"><X size={18}/></button></div>
      <div className="sh-drawer-body">
        {panel.kind==="service"&&selectedService&&<><div className="sh-detail-status"><StatusPill status={selectedService.status}/><span>Last check: {selectedService.checked}</span></div><p className="sh-detail-description">{selectedService.description}</p><div className="sh-detail-grid"><div><small>Component type</small><b>{selectedService.type}</b></div><div><small>Version</small><b>{selectedService.version}</b></div><div><small>Region</small><b>{selectedService.region}</b></div><div><small>Owner</small><b>{selectedService.owner}</b></div><div><small>Response time</small><b>{selectedService.response===null?"Not reported":`${selectedService.response} ms`}</b></div><div><small>Availability</small><b>{selectedService.availability===null?"Not reported":`${selectedService.availability}%`}</b></div></div><div className="sh-drawer-section"><h3>Service actions</h3><button onClick={()=>showPanel("metrics",selectedService.id)}>Open metrics <ArrowUp size={14}/></button><button onClick={()=>showPanel("logs",selectedService.id)}>View logs <FileText size={14}/></button><button onClick={()=>showPanel("incidents",selectedService.id)}>Related incidents <ExternalLink size={14}/></button></div></>}
        {panel.kind==="metrics"&&<><div className="sh-drawer-toolbar"><span>Time range</span><select value={range} onChange={e=>setRange(e.target.value as keyof typeof chartSeries)}><option>Last Hour</option><option>24 Hours</option><option>7 Days</option></select></div><div className="sh-metric-value"><small>Average response time</small><strong>{selectedService?.response===null||!selectedService? "—":`${selectedService.response} ms`}</strong><span>DEMO DATA · selected service snapshot</span></div><MiniChart title="Response time trend" unit="Milliseconds (ms)" values={chart.latency} labels={chart.labels} color="#818cf8" suffix=" ms"/><div className="sh-detail-grid"><div><small>Availability</small><b>{selectedService?.availability===null||!selectedService?"—":`${selectedService.availability}%`}</b></div><div><small>Sample window</small><b>{range}</b></div></div></>}
        {panel.kind==="logs"&&<><div className="sh-log-filters"><label><Search size={14}/><input value={logSearch} onChange={e=>setLogSearch(e.target.value)} placeholder="Search log messages"/></label><select value={severity} onChange={e=>setSeverity(e.target.value)}><option>All levels</option><option>INFO</option><option>WARN</option><option>ERROR</option></select><select value={logTime} onChange={e=>setLogTime(e.target.value)}><option>Last hour</option><option>24 hours</option><option>7 days</option></select></div><div className="sh-log-list">{logs.map((l,i)=><div className="sh-log-entry" key={i}><span>{l.time}</span><b className={`sh-log-${l.level.toLowerCase()}`}>{l.level}</b><code>{l.service}</code><p>{l.message}</p></div>)}{logs.length===0&&<p className="sh-muted">No log entries match the selected filters.</p>}</div><p className="sh-log-disclaimer">DEMO LOGS · sensitive values are not included.</p></>}
        {(panel.kind==="incidents"||panel.kind==="incident")&&<><div className="sh-drawer-toolbar"><span>Incident status</span><select value={incidentFilter} onChange={e=>setIncidentFilter(e.target.value)}><option>All</option><option>Active</option><option>Resolved</option></select></div><div className="sh-incident-list">{incidents.filter(i=>(incidentFilter==="All"||i.state===incidentFilter)&&(panel.kind!=="incident"||i.id===panel.id)&&(!selectedService||panel.kind!=="incidents"||i.service===selectedService.name)).map(i=><article key={i.id}><div><b>{i.title}</b><span className={`sh-severity sh-severity--${i.severity.toLowerCase()}`}>{i.severity}</span></div><small>{i.id} · {i.service} · {i.started}</small><p>{i.summary}</p><div className="sh-incident-actions"><span className={`sh-state sh-state--${i.state.toLowerCase()}`}>{i.state}</span>{i.state==="Active"&&<button onClick={()=>resolveIncident(i.id)}>Mark resolved</button>}</div></article>)}{incidents.filter(i=>(incidentFilter==="All"||i.state===incidentFilter)&&(panel.kind!=="incident"||i.id===panel.id)).length===0&&<p className="sh-muted">No incidents found.</p>}</div></>}
      </div>
      <div className="sh-drawer-footer"><span>DEMO DATA · changes are local to this page</span><button className="sh-button sh-button-secondary" onClick={closePanel}>Close</button></div>
    </aside></div>}
  </div>;
}
