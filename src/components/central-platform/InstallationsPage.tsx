import { useMemo, useState } from "react";
import {
  Activity, AlertCircle, ArrowDownUp, ArrowRight, CalendarDays, Check, CheckCircle2,
  ChevronRight, CircleDot, Clock3, Database, Download, ExternalLink, FileText,
  Filter, HardDrive, MoreHorizontal, Network, Plus, RefreshCw, Search, Server,
  ShieldCheck, Terminal, X, XCircle, Zap
} from "lucide-react";
import "./installations-page.css";

type InstallStatus = "Not Started" | "In Progress" | "Completed" | "Failed" | "Cancelled";
type StageStatus = "Pending" | "Running" | "Completed" | "Failed" | "Skipped";
type InstallEvent = { at: string; level: "info" | "success" | "warning" | "error"; message: string };
type InstallRecord = {
  id: string; school: string; code: string; city: string; server: string; environment: string;
  version: string; status: InstallStatus; stage: number; startedAt: string; updatedAt: string;
  completedAt?: string; duration?: string; assignedTo: string; error?: string; events: InstallEvent[];
};

const STAGES = [
  { name: "School registered", description: "Verify school identity and onboarding prerequisites", icon: ShieldCheck },
  { name: "Installation initiated", description: "Create deployment job and prepare the target server", icon: Zap },
  { name: "Server configured", description: "Validate runtime, operating system and network access", icon: Server },
  { name: "Database initialized", description: "Provision database, schema and initial migrations", icon: Database },
  { name: "Tunnel connected", description: "Establish secure connectivity to the control plane", icon: Network },
  { name: "Health check passed", description: "Verify application, database and monitoring services", icon: Activity }
];

const INITIAL_RECORDS: InstallRecord[] = [
  { id:"INS-2026-0148", school:"Atlas International School", code:"ATS-001", city:"Casablanca", server:"atlas-prod-01", environment:"Production", version:"v1.8.2", status:"Completed", stage:5, startedAt:"Nov 10, 2026 · 08:12", updatedAt:"Nov 10, 2026 · 08:49", completedAt:"Nov 10, 2026 · 08:49", duration:"37 min", assignedTo:"Youssef A.", events:[{at:"08:12:04",level:"success",message:"School registration verified."},{at:"08:14:22",level:"success",message:"Deployment job created and server reached."},{at:"08:21:08",level:"success",message:"Runtime and network configuration validated."},{at:"08:31:41",level:"success",message:"Database schema initialized successfully."},{at:"08:40:13",level:"success",message:"Secure tunnel established."},{at:"08:49:02",level:"success",message:"All initial health checks passed."}] },
  { id:"INS-2026-0147", school:"Groupe Scolaire Al Amal", code:"AAS-002", city:"Rabat", server:"amal-prod-01", environment:"Production", version:"v1.8.2", status:"In Progress", stage:4, startedAt:"Nov 10, 2026 · 09:04", updatedAt:"Nov 10, 2026 · 09:42", assignedTo:"Salma R.", events:[{at:"09:04:12",level:"success",message:"School registration verified."},{at:"09:07:30",level:"success",message:"Deployment job created."},{at:"09:19:46",level:"success",message:"Server configuration validated."},{at:"09:33:10",level:"success",message:"Database initialized and migrations applied."},{at:"09:42:02",level:"info",message:"Waiting for secure tunnel verification."}] },
  { id:"INS-2026-0146", school:"Future Academy", code:"FAC-003", city:"Marrakech", server:"future-prod-01", environment:"Production", version:"v1.8.1", status:"Failed", stage:4, startedAt:"Nov 10, 2026 · 07:36", updatedAt:"Nov 10, 2026 · 08:02", assignedTo:"Youssef A.", error:"Tunnel agent did not complete the registration handshake. Check the outbound network policy and tunnel token configuration, then retry this stage.", events:[{at:"07:36:10",level:"success",message:"School registration verified."},{at:"07:40:08",level:"success",message:"Deployment job created."},{at:"07:51:33",level:"success",message:"Server configuration validated."},{at:"07:58:14",level:"success",message:"Database initialized."},{at:"08:02:09",level:"error",message:"Tunnel registration handshake timed out after 4 attempts."}] },
  { id:"INS-2026-0145", school:"École Ibn Sina", code:"ISS-004", city:"Fès", server:"ibnsina-prod-01", environment:"Production", version:"v1.8.2", status:"Not Started", stage:0, startedAt:"—", updatedAt:"Nov 09, 2026 · 16:20", assignedTo:"Unassigned", events:[{at:"16:20:00",level:"info",message:"School is eligible for installation. No deployment job has been created."}] },
  { id:"INS-2026-0144", school:"Horizon School", code:"HZS-005", city:"Tangier", server:"horizon-prod-01", environment:"Production", version:"v1.8.2", status:"In Progress", stage:3, startedAt:"Nov 09, 2026 · 14:18", updatedAt:"Nov 10, 2026 · 09:26", assignedTo:"Amine B.", events:[{at:"14:18:02",level:"success",message:"School registration verified."},{at:"14:22:19",level:"success",message:"Deployment job created."},{at:"14:40:54",level:"success",message:"Server configuration validated."},{at:"09:26:11",level:"info",message:"Database initialization is running."}] },
  { id:"INS-2026-0143", school:"École Les Oliviers", code:"OLV-006", city:"Agadir", server:"oliviers-prod-01", environment:"Production", version:"v1.8.2", status:"Completed", stage:5, startedAt:"Nov 09, 2026 · 10:05", updatedAt:"Nov 09, 2026 · 10:44", completedAt:"Nov 09, 2026 · 10:44", duration:"39 min", assignedTo:"Salma R.", events:[{at:"10:05:11",level:"success",message:"School registration verified."},{at:"10:11:08",level:"success",message:"Deployment job created."},{at:"10:20:46",level:"success",message:"Server configuration validated."},{at:"10:29:19",level:"success",message:"Database initialized."},{at:"10:36:01",level:"success",message:"Tunnel connected."},{at:"10:44:32",level:"success",message:"Initial health checks passed."}] },
  { id:"INS-2026-0142", school:"Al Qalam Institution", code:"QLM-007", city:"Meknès", server:"qalam-prod-01", environment:"Production", version:"v1.8.1", status:"Failed", stage:2, startedAt:"Nov 08, 2026 · 11:22", updatedAt:"Nov 08, 2026 · 11:47", assignedTo:"Amine B.", error:"The target server failed the minimum runtime compatibility check. Required Node.js runtime was not detected.", events:[{at:"11:22:04",level:"success",message:"School registration verified."},{at:"11:25:17",level:"success",message:"Deployment job created."},{at:"11:47:50",level:"error",message:"Runtime compatibility check failed: required runtime not found."}] },
  { id:"INS-2026-0141", school:"Lycée Riad", code:"RYD-008", city:"Oujda", server:"riad-prod-01", environment:"Staging", version:"v1.8.2", status:"Completed", stage:5, startedAt:"Nov 07, 2026 · 13:10", updatedAt:"Nov 07, 2026 · 13:42", completedAt:"Nov 07, 2026 · 13:42", duration:"32 min", assignedTo:"Youssef A.", events:[{at:"13:10:00",level:"success",message:"School registration verified."},{at:"13:16:08",level:"success",message:"Deployment job created."},{at:"13:24:43",level:"success",message:"Server configuration validated."},{at:"13:31:17",level:"success",message:"Database initialized."},{at:"13:37:21",level:"success",message:"Tunnel connected."},{at:"13:42:04",level:"success",message:"Initial health checks passed."}] }
];

const SCHOOLS = [
  {code:"NWR-009",name:"Nouvelle École Al Wouroud",city:"Casablanca",server:"wouroud-prod-01"},
  {code:"MNR-010",name:"Institution Al Manar",city:"Rabat",server:"manar-prod-01"},
  {code:"FJR-011",name:"Groupe Scolaire Al Fajr",city:"Témara",server:"fajr-prod-01"},
  {code:"BAY-012",name:"École Bayt Al Hikma",city:"Kenitra",server:"bayt-prod-01"}
];

function statusTone(status: InstallStatus) {
  if (status === "Completed") return "success";
  if (status === "In Progress") return "info";
  if (status === "Failed") return "danger";
  if (status === "Cancelled") return "neutral";
  return "warning";
}
function stageState(record: InstallRecord, index: number): StageStatus {
  if (record.status === "Cancelled" && index >= record.stage) return "Skipped";
  if (record.status === "Failed" && index === record.stage) return "Failed";
  if (record.status === "Completed" || index < record.stage) return "Completed";
  if (record.status === "In Progress" && index === record.stage) return "Running";
  return "Pending";
}
function formatStatus(status: InstallStatus) { return status; }

export function InstallationsPage() {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [stageFilter, setStageFilter] = useState("All stages");
  const [environmentFilter, setEnvironmentFilter] = useState("All environments");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [showStart, setShowStart] = useState(false);
  const [schoolCode, setSchoolCode] = useState("");
  const [assignee, setAssignee] = useState("Youssef A.");
  const [confirm, setConfirm] = useState<{id:string;action:"restart"|"cancel"} | null>(null);
  const [notice, setNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [logFilter, setLogFilter] = useState("All events");

  const selected = records.find(record => record.id === selectedId) || null;
  const filtered = useMemo(() => records.filter(record => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [record.school, record.code, record.id, record.server].some(value => value.toLowerCase().includes(q));
    const matchesStatus = statusFilter === "All statuses" || record.status === statusFilter;
    const matchesStage = stageFilter === "All stages" || STAGES[record.stage]?.name === stageFilter;
    const matchesEnvironment = environmentFilter === "All environments" || record.environment === environmentFilter;
    const date = record.startedAt === "—" ? "" : record.startedAt.slice(0, 12);
    const from = dateFrom ? new Date(dateFrom + "T00:00:00").getTime() : 0;
    const to = dateTo ? new Date(dateTo + "T23:59:59").getTime() : Number.MAX_SAFE_INTEGER;
    const parsed = record.startedAt === "—" ? 0 : new Date(record.startedAt.replace(" · ", " ")).getTime();
    return matchesSearch && matchesStatus && matchesStage && matchesEnvironment && (!dateFrom && !dateTo || (parsed >= from && parsed <= to));
  }), [records, search, statusFilter, stageFilter, environmentFilter, dateFrom, dateTo]);

  const counts = useMemo(() => ({
    total: records.length,
    completed: records.filter(r => r.status === "Completed").length,
    progress: records.filter(r => r.status === "In Progress").length,
    failed: records.filter(r => r.status === "Failed").length,
    queued: records.filter(r => r.status === "Not Started").length
  }), [records]);

  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3200); };
  const updateRecord = (id: string, patch: Partial<InstallRecord>, event?: InstallEvent) => {
    setRecords(current => current.map(record => record.id === id ? { ...record, ...patch, updatedAt:"Nov 10, 2026 · just now", events:event ? [...record.events, event] : record.events } : record));
  };
  const clearFilters = () => { setSearch(""); setStatusFilter("All statuses"); setStageFilter("All stages"); setEnvironmentFilter("All environments"); setDateFrom(""); setDateTo(""); };
  const startInstallation = () => {
    const school = SCHOOLS.find(item => item.code === schoolCode);
    if (!school) return;
    if (records.some(record => record.code === school.code && (record.status === "In Progress" || record.status === "Not Started"))) {
      notify("An active or queued installation already exists for this school."); return;
    }
    const id = "INS-2026-" + String(149 + records.length).padStart(4, "0");
    const record: InstallRecord = {
      id, school:school.name, code:school.code, city:school.city, server:school.server, environment:"Production",
      version:"v1.8.2", status:"In Progress", stage:1, startedAt:"Nov 10, 2026 · just now", updatedAt:"Nov 10, 2026 · just now",
      assignedTo:assignee, events:[{at:"Now",level:"success",message:"Demo deployment job created. No remote server command was executed."}]
    };
    setRecords(current => [record, ...current]);
    setShowStart(false); setSchoolCode(""); notify("Demo installation job created. No server was contacted.");
    setSelectedId(id);
  };
  const refresh = () => { setRefreshing(true); window.setTimeout(() => { setRefreshing(false); notify("Demo records refreshed. Live deployment telemetry is not connected."); }, 500); };
  const retry = (record: InstallRecord) => {
    updateRecord(record.id, {status:"In Progress", error:undefined}, {at:"Now",level:"warning",message:"Retry requested in demo mode. The failed stage has been queued for a simulated retry."});
    setSelectedId(record.id); setMenuId(null); notify("Retry queued in demo mode.");
  };
  const advance = (record: InstallRecord) => {
    const next = Math.min(record.stage + 1, STAGES.length - 1);
    const done = next === STAGES.length - 1;
    updateRecord(record.id, done
      ? {status:"Completed",stage:5,completedAt:"Nov 10, 2026 · just now",duration:"Demo run"}
      : {stage:next},
      {at:"Now",level:done?"success":"info",message:done?"Simulated initial health check passed.":"Simulated stage advanced to: " + STAGES[next].name + "."});
    notify(done ? "Demo installation marked completed." : "Demo stage advanced.");
  };

  return <div className="instx-page">
    <div className="instx-heading">
      <div><div className="instx-eyebrow">SCHOOL OPERATIONS <ChevronRight size={12}/> DEPLOYMENT</div><h1>Installations</h1><p>Orchestrate and audit the deployment lifecycle for every school environment.</p></div>
      <div className="instx-heading-actions"><button className="instx-btn instx-btn-secondary" onClick={refresh} disabled={refreshing}><RefreshCw size={15} className={refreshing?"instx-spin":""}/>{refreshing?"Refreshing":"Refresh data"}</button><button className="instx-btn instx-btn-primary" onClick={()=>setShowStart(true)}><Plus size={16}/>Start installation</button></div>
    </div>

    <div className="instx-demo"><span><span className="instx-demo-dot"/> DEMONSTRATION ENVIRONMENT</span><p>Fictional deployment records and simulated actions. No school server, database, tunnel or license is changed.</p></div>

    <div className="instx-metrics">
      <article className="instx-metric instx-metric-total"><div><span>Total deployments</span><Database size={17}/></div><strong>{counts.total}</strong><small>Tracked installation jobs</small></article>
      <article className="instx-metric"><div><span>Completed</span><CheckCircle2 size={17}/></div><strong className="is-success">{counts.completed}</strong><small>Initial checks passed</small></article>
      <article className="instx-metric"><div><span>In progress</span><Activity size={17}/></div><strong className="is-info">{counts.progress}</strong><small>Deployment running</small></article>
      <article className="instx-metric"><div><span>Failed</span><AlertCircle size={17}/></div><strong className="is-danger">{counts.failed}</strong><small>Require investigation</small></article>
      <article className="instx-metric"><div><span>Queued</span><Clock3 size={17}/></div><strong>{counts.queued}</strong><small>Awaiting initiation</small></article>
    </div>

    <section className="instx-lifecycle">
      <div className="instx-section-head"><div><h2>Deployment lifecycle</h2><p>Standard sequence applied to each school installation.</p></div><span className="instx-count-label">6 STAGES</span></div>
      <div className="instx-lifecycle-grid">{STAGES.map((stage,index)=>{const Icon=stage.icon;return <div className="instx-lifecycle-step" key={stage.name}><div className="instx-step-top"><span>{String(index+1).padStart(2,"0")}</span><Icon size={16}/></div><strong>{stage.name}</strong><small>{stage.description}</small>{index<STAGES.length-1&&<ChevronRight className="instx-step-arrow" size={15}/>}</div>;})}</div>
      <div className="instx-lifecycle-foot"><ShieldCheck size={14}/> Installation completion is separate from license activation and ongoing server connectivity.</div>
    </section>

    <section className="instx-records">
      <div className="instx-records-head"><div><h2>Deployment jobs</h2><p>Search, filter and investigate installation activity across registered schools.</p></div><span>{filtered.length} of {records.length} records</span></div>
      <div className="instx-filters">
        <label className="instx-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search school, code, job ID or server…"/>{search&&<button onClick={()=>setSearch("")} aria-label="Clear search"><X size={14}/></button>}</label>
        <select aria-label="Filter by status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All statuses</option>{["Not Started","In Progress","Completed","Failed","Cancelled"].map(v=><option key={v}>{v}</option>)}</select>
        <select aria-label="Filter by stage" value={stageFilter} onChange={e=>setStageFilter(e.target.value)}><option>All stages</option>{STAGES.map(v=><option key={v.name}>{v.name}</option>)}</select>
        <select aria-label="Filter by environment" value={environmentFilter} onChange={e=>setEnvironmentFilter(e.target.value)}><option>All environments</option><option>Production</option><option>Staging</option></select>
        <button className="instx-filter-clear" onClick={clearFilters}><Filter size={14}/>Reset</button>
      </div>
      <div className="instx-date-filters"><span><CalendarDays size={14}/> Started date</span><label>From <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/></label><label>To <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}/></label><span className="instx-date-note">Dates use the deployment's local timezone.</span></div>
      <div className="instx-table-wrap"><table className="instx-table"><thead><tr><th>School / environment</th><th>Deployment ID</th><th>Status</th><th>Current stage</th><th>Progress</th><th>Started</th><th>Last activity</th><th><span className="instx-sr-only">Actions</span></th></tr></thead><tbody>
        {filtered.map(record=><tr key={record.id}>
          <td><div className="instx-school-cell"><span className="instx-school-avatar">{record.code.slice(0,2)}</span><span><strong>{record.school}</strong><small>{record.code} · {record.city} · {record.environment}</small></span></div></td>
          <td><code>{record.id}</code><small className="instx-server-name"><Server size={11}/>{record.server}</small></td>
          <td><span className={"instx-status instx-status-"+statusTone(record.status)}><i/>{formatStatus(record.status)}</span></td>
          <td><span className="instx-stage-name">{STAGES[record.stage]?.name || "—"}</span></td>
          <td><div className="instx-progress-cell"><div><i style={{width:(record.status==="Completed"?100:record.status==="Cancelled"?0:Math.round(record.stage/5*100))+"%"}}/></div><small>{record.status==="Completed"?"100%":record.status==="Not Started"?"0%":Math.round(record.stage/5*100)+"%"}</small></div></td>
          <td><span className="instx-date">{record.startedAt}</span></td><td><span className="instx-date">{record.updatedAt}</span></td>
          <td><div className="instx-row-menu"><button className="instx-icon-button" onClick={()=>setSelectedId(record.id)} aria-label={"View "+record.school+" details"}><ExternalLink size={15}/></button><button className="instx-icon-button" onClick={()=>setMenuId(menuId===record.id?null:record.id)} aria-label="More deployment actions"><MoreHorizontal size={17}/></button>{menuId===record.id&&<div className="instx-menu"><button onClick={()=>{setSelectedId(record.id);setMenuId(null);}}>View details</button><button onClick={()=>{setSelectedId(record.id);setLogFilter("All events");setMenuId(null);}}>View event log</button>{record.status==="Failed"&&<button onClick={()=>retry(record)}>Retry failed stage</button>}{record.status==="In Progress"&&<button onClick={()=>{advance(record);setMenuId(null);}}>Advance demo stage</button>}{record.status!=="Completed"&&record.status!=="Cancelled"&&<><button onClick={()=>{setConfirm({id:record.id,action:"restart"});setMenuId(null);}}>Restart deployment</button><button className="is-danger" onClick={()=>{setConfirm({id:record.id,action:"cancel"});setMenuId(null);}}>Cancel deployment</button></>}</div>}</div></td>
        </tr>)}
      </tbody></table>
      {filtered.length===0&&<div className="instx-empty"><Search size={22}/><strong>No deployment jobs found</strong><span>Try a different search or remove some filters.</span><button className="instx-btn instx-btn-secondary" onClick={clearFilters}>Clear filters</button></div>}
      </div>
      <div className="instx-table-foot"><span>Showing {filtered.length} deployment {filtered.length===1?"job":"jobs"}</span><span><ArrowDownUp size={13}/> Sorted by most recently updated</span></div>
    </section>

    <div className="instx-integrity-note"><ShieldCheck size={17}/><span><strong>Operational state separation</strong> Deployment progress, license authorization, server health and tunnel connectivity are independent records. A completed installation does not guarantee that a school is currently online.</span></div>

    {selected&&<div className="instx-overlay" onMouseDown={()=>setSelectedId(null)}><aside className="instx-drawer" role="dialog" aria-modal="true" aria-labelledby="instx-drawer-title" onMouseDown={e=>e.stopPropagation()}>
      <header className="instx-drawer-head"><div><span className="instx-eyebrow">DEPLOYMENT RECORD</span><h2 id="instx-drawer-title">{selected.school}</h2><p><code>{selected.id}</code><span>·</span>{selected.code}</p></div><button className="instx-icon-button" onClick={()=>setSelectedId(null)} aria-label="Close details"><X size={18}/></button></header>
      <div className="instx-drawer-content">
        <section className="instx-drawer-summary"><div><span className={"instx-status instx-status-"+statusTone(selected.status)}><i/>{selected.status}</span><span className="instx-environment">{selected.environment}</span></div><div className="instx-drawer-facts"><div><small>Target server</small><strong>{selected.server}</strong></div><div><small>Application version</small><strong>{selected.version}</strong></div><div><small>Assigned operator</small><strong>{selected.assignedTo}</strong></div><div><small>Started</small><strong>{selected.startedAt}</strong></div><div><small>Last updated</small><strong>{selected.updatedAt}</strong></div><div><small>Duration</small><strong>{selected.duration||"In progress"}</strong></div></div></section>
        <section className="instx-drawer-section"><div className="instx-section-head"><div><h3>Deployment progress</h3><p>Stage-by-stage execution state</p></div><b>{selected.status==="Completed"?"100%":Math.round(selected.stage/5*100)+"%"}</b></div><div className="instx-timeline">{STAGES.map((stage,index)=>{const state=stageState(selected,index);const Icon=stage.icon;return <div className={"instx-timeline-item state-"+state.toLowerCase()} key={stage.name}><div className="instx-timeline-marker">{state==="Completed"?<Check size={13}/>:state==="Failed"?<X size={13}/>:<Icon size={13}/>}</div><div><strong>{stage.name}</strong><small>{state==="Running"?"Currently running":state==="Completed"?"Completed":state==="Failed"?"Failed · action required":state==="Skipped"?"Not executed":"Waiting"}</small></div>{state==="Running"&&<span className="instx-running-pulse"/>}</div>;})}</div></section>
        {selected.error&&<section className="instx-error-panel"><div><AlertCircle size={16}/><strong>Failure details</strong></div><p>{selected.error}</p><small>Review the error and environment prerequisites before retrying.</small><button className="instx-btn instx-btn-secondary" onClick={()=>retry(selected)}><RefreshCw size={14}/>Retry failed stage</button></section>}
        <section className="instx-drawer-section"><div className="instx-section-head"><div><h3>Execution event log</h3><p>Chronological events recorded for this job</p></div><select value={logFilter} onChange={e=>setLogFilter(e.target.value)} aria-label="Filter event log"><option>All events</option><option>Errors only</option><option>Successful only</option></select></div><div className="instx-event-log">{selected.events.filter(event=>logFilter==="All events"||(logFilter==="Errors only"&&event.level==="error")||(logFilter==="Successful only"&&event.level==="success")).map((event,index)=><div className="instx-event" key={index}><span className={"instx-event-icon level-"+event.level}>{event.level==="error"?<XCircle size={14}/>:event.level==="success"?<CheckCircle2 size={14}/>:event.level==="warning"?<AlertCircle size={14}/>:<CircleDot size={14}/>}</span><div><p>{event.message}</p><small>{event.at}</small></div></div>)}{selected.events.filter(event=>logFilter==="All events"||(logFilter==="Errors only"&&event.level==="error")||(logFilter==="Successful only"&&event.level==="success")).length===0&&<p className="instx-no-events">No events match this filter.</p>}</div></section>
        <div className="instx-drawer-disclaimer"><Terminal size={14}/> Demo event log. Production logs must be ingested from the deployment agent and retained server-side.</div>
      </div>
      <footer className="instx-drawer-footer">{selected.status==="Failed"&&<button className="instx-btn instx-btn-primary" onClick={()=>retry(selected)}><RefreshCw size={14}/>Retry failed stage</button>}{selected.status==="In Progress"&&<button className="instx-btn instx-btn-primary" onClick={()=>advance(selected)}><ArrowRight size={14}/>Advance demo stage</button>}<button className="instx-btn instx-btn-secondary" onClick={()=>setSelectedId(null)}>Close</button></footer>
    </aside></div>}

    {showStart&&<div className="instx-overlay" onMouseDown={()=>setShowStart(false)}><section className="instx-modal" role="dialog" aria-modal="true" aria-labelledby="instx-start-title" onMouseDown={e=>e.stopPropagation()}><header><div><span className="instx-eyebrow">NEW DEPLOYMENT</span><h2 id="instx-start-title">Start installation</h2><p>Create a deployment job for a registered school.</p></div><button className="instx-icon-button" onClick={()=>setShowStart(false)} aria-label="Close"><X size={18}/></button></header><div className="instx-modal-body"><div className="instx-modal-callout"><ShieldCheck size={16}/><span>Only registered schools without an active or queued deployment are eligible.</span></div><label>Registered school<select value={schoolCode} onChange={e=>setSchoolCode(e.target.value)}><option value="">Select a school…</option>{SCHOOLS.filter(school=>!records.some(record=>record.code===school.code&&(record.status==="In Progress"||record.status==="Not Started"))).map(school=><option key={school.code} value={school.code}>{school.name} · {school.city}</option>)}</select></label><label>Assigned operator<select value={assignee} onChange={e=>setAssignee(e.target.value)}><option>Youssef A.</option><option>Salma R.</option><option>Amine B.</option><option>Unassigned</option></select></label>{schoolCode&&<div className="instx-selected-school"><small>Deployment target</small><strong>{SCHOOLS.find(s=>s.code===schoolCode)?.server}</strong><span>Production · Application v1.8.2</span></div>}<div className="instx-modal-note">The production workflow should validate subscription eligibility, server readiness, credentials and maintenance windows before dispatching a deployment job. This demo only creates a local record.</div></div><footer><button className="instx-btn instx-btn-secondary" onClick={()=>setShowStart(false)}>Cancel</button><button className="instx-btn instx-btn-primary" disabled={!schoolCode} onClick={startInstallation}><Plus size={15}/>Create deployment job</button></footer></section></div>}

    {confirm&&<div className="instx-confirm-overlay"><section className="instx-confirm" role="alertdialog" aria-modal="true"><div className="instx-confirm-icon">{confirm.action==="cancel"?<AlertCircle size={19}/>:<RefreshCw size={19}/>}</div><h2>{confirm.action==="cancel"?"Cancel this deployment?":"Restart this deployment?"}</h2><p>{confirm.action==="cancel"?"The demo job will be marked as cancelled. No command will be sent to the school server.":"The demo job will return to the first stage. Its previous progress remains visible in the event log."}</p><footer><button className="instx-btn instx-btn-secondary" onClick={()=>setConfirm(null)}>Go back</button><button className="instx-btn instx-btn-danger" onClick={()=>{const record=records.find(r=>r.id===confirm.id);if(record){updateRecord(record.id,confirm.action==="cancel"?{status:"Cancelled"}:{status:"In Progress",stage:0,error:undefined,completedAt:undefined,duration:undefined},{at:"Now",level:"warning",message:confirm.action==="cancel"?"Deployment cancelled by platform operator (demo).":"Deployment restarted from the first stage (demo)."});notify(confirm.action==="cancel"?"Demo deployment cancelled.":"Demo deployment restarted.");}setConfirm(null);}}>{confirm.action==="cancel"?"Confirm cancellation":"Confirm restart"}</button></footer></section></div>}
    {notice&&<div className="instx-toast"><CheckCircle2 size={16}/>{notice}</div>}
  </div>;
}
