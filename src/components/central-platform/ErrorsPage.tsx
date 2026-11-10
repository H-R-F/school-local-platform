import { useMemo, useState } from "react";
import {
  AlertCircle, AlertTriangle, ArrowDown, ArrowUp, Check, CheckCircle2,
  ChevronLeft, ChevronRight, Clock3, Copy, ExternalLink, Filter, MoreHorizontal,
  RefreshCw, Search, ShieldAlert, UserRound, X, FileText, MessageSquare,
  RotateCcw, Ban, CircleDot, Database, Code2
} from "lucide-react";
import "./errors-page.css";

type Severity = "Critical" | "High" | "Medium" | "Low";
type ErrorStatus = "Open" | "Investigating" | "Resolved" | "Ignored";
type ErrorRecord = {
  id:string; title:string; severity:Severity; category:string; source:string;
  origin:"Central Platform"|"School Local Application"|"Infrastructure Component";
  school:string; server:string; occurrences:number; first:number; last:number;
  status:ErrorStatus; environment:string; trace:string; request:string;
  method:string; endpoint:string; version:string; message:string; stack:string;
  timeline:number[]; related:string[]; assignee:string; notes:{id:string;text:string;actor:string;at:number;kind:string}[];
  resolution:string; created:number; updated:number; lastActor:string;
};
const now = Date.now();
const hour = 3600000;
const day = 86400000;
const seed = [
 {title:"Database connection timeout",severity:"Critical" as Severity,category:"Database",source:"Central Database Service",school:"Atlas International School",server:"SRV-ATS-001",occurrences:18,status:"Investigating" as ErrorStatus,age:2,origin:"Central Platform" as const},
 {title:"Failed license validation request",severity:"High" as Severity,category:"Authorization",source:"License Validation Service",school:"Future Academy",server:"SRV-FAC-003",occurrences:7,status:"Open" as ErrorStatus,age:8,origin:"Central Platform" as const},
 {title:"API request processing exception",severity:"High" as Severity,category:"Application",source:"Central API",school:"Not applicable",server:"Not applicable",occurrences:24,status:"Open" as ErrorStatus,age:12,origin:"Central Platform" as const},
 {title:"Cloudflare Tunnel reporting error",severity:"Medium" as Severity,category:"Infrastructure",source:"Monitoring Service",school:"Al Amal School",server:"SRV-AAS-002",occurrences:5,status:"Investigating" as ErrorStatus,age:17,origin:"Infrastructure Component" as const},
 {title:"Background job execution failure",severity:"High" as Severity,category:"Background Job",source:"Notification Worker",school:"Not applicable",server:"Not applicable",occurrences:12,status:"Open" as ErrorStatus,age:22,origin:"Central Platform" as const},
 {title:"Invalid configuration detected",severity:"Low" as Severity,category:"Configuration",source:"Configuration Service",school:"Green Valley School",server:"SRV-GVS-006",occurrences:3,status:"Resolved" as ErrorStatus,age:40,origin:"School Local Application" as const},
 {title:"Authentication token refresh rejected",severity:"Medium" as Severity,category:"Authorization",source:"Authentication Service",school:"Not applicable",server:"Not applicable",occurrences:9,status:"Resolved" as ErrorStatus,age:75,origin:"Central Platform" as const},
 {title:"Database query exceeded execution limit",severity:"High" as Severity,category:"Database",source:"Central Database Service",school:"Ibn Sina School",server:"SRV-ISS-004",occurrences:11,status:"Open" as ErrorStatus,age:95,origin:"School Local Application" as const},
 {title:"Outbound email provider returned 503",severity:"Medium" as Severity,category:"Network",source:"Notification Worker",school:"Not applicable",server:"Not applicable",occurrences:6,status:"Ignored" as ErrorStatus,age:160,origin:"Central Platform" as const},
 {title:"API schema validation failed",severity:"Low" as Severity,category:"Application",source:"Central API",school:"Horizon School",server:"SRV-HZS-005",occurrences:4,status:"Resolved" as ErrorStatus,age:220,origin:"School Local Application" as const}
];
const extraTitles = [
 ["Unhandled request exception","Application","Central API"],
 ["Connection pool acquisition failed","Database","Central Database Service"],
 ["Permission scope mismatch","Authorization","Authentication Service"],
 ["Worker task exceeded retry limit","Background Job","Notification Worker"],
 ["Telemetry payload rejected","Infrastructure","Monitoring Service"],
 ["Missing environment configuration","Configuration","Configuration Service"],
 ["Upstream request timed out","Network","Central API"],
 ["Unexpected null response","Application","School Local API"]
];
const schools = ["Atlas International School","Future Academy","Al Amal School","Green Valley School","Ibn Sina School","Horizon School","Not applicable"];
const sources = ["Central API","Central Database Service","Authentication Service","License Validation Service","Monitoring Service","Notification Worker","Configuration Service","School Local API"];
const records:ErrorRecord[] = [];
for(let i=0;i<248;i++){
 const base=seed[i] || null;
 const extra=extraTitles[(i-seed.length+extraTitles.length)%extraTitles.length];
 const status:ErrorStatus = i<32 ? "Open" : i<56 ? "Investigating" : i<206 ? "Resolved" : "Ignored";
 const severity:Severity = i<5 ? "Critical" : base?.severity || (i%4===0?"High":i%4===1?"Medium":i%4===2?"Low":"High");
 const ageMinutes = i<seed.length ? base!.age : (i%46===0 ? 20+(i%12)*30 : 30+(i*37)%42000);
 const last = now-ageMinutes*60000;
 const first = last-(Math.max(0,(base?.occurrences||2)-1)*hour);
 const title=base?.title || extra[0];
 const category=base?.category || extra[1];
 const source=base?.source || extra[2];
 const school=base?.school || schools[i%schools.length];
 const id="ERR-2026-"+String(248-i).padStart(4,"0");
 const trace="trc_"+(0x8af120+i*173).toString(16).padStart(8,"0");
 const stack = "Database connection failed while acquiring a connection from the pool.\n  at ConnectionPool.acquire (db/pool.ts:184:17)\n  at Repository.execute (data/repository.ts:92:11)\n  at RequestHandler.handle (api/handler.ts:48:9)\n\nConnection host [REDACTED] · credential [REDACTED]";
 records.push({
  id,title,severity,category,source,origin:base?.origin || (school==="Not applicable"?"Central Platform":"School Local Application"),
  school,server:base?.server || (school==="Not applicable"?"Not applicable":"SRV-"+school.split(" ")[0].slice(0,3).toUpperCase()+"-00"+(i%8+1)),
  occurrences:base?.occurrences || 1+(i*7)%19,first,last,status,
  environment:i%9===0?"Staging":"Production",trace,request:"req_"+(0x5b2100+i*91).toString(16),
  method:i%3===0?"POST":i%3===1?"GET":"PATCH",endpoint:i%3===0?"/api/v1/schools/sync":i%3===1?"/api/v1/licenses/validate":"/api/v1/jobs/dispatch",
  version:i%2===0?"v2.8.1":"v2.8.0",message:"Database connection failed for host [REDACTED] using credential [REDACTED].",
  stack,timeline:[last-((base?.occurrences||2)-1)*hour,last-30*60000,last],
  related:[],assignee:"Unassigned",notes:[],resolution:status==="Resolved"?"Connection pool limit adjusted in the demonstration record.":"",
  created:first,updated:last,lastActor:"System (demo)"
 });
}
const fmt=(ts:number)=>new Date(ts).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false})+" UTC";
const ago=(ts:number)=>{const m=Math.max(0,Math.floor((now-ts)/60000));return m<60?m+" min ago":m<1440?Math.floor(m/60)+" hr ago":Math.floor(m/1440)+" days ago";};
const severityRank=(s:Severity)=>({Critical:4,High:3,Medium:2,Low:1}[s]);
const severityTone=(s:Severity)=>s.toLowerCase();
const statusTone=(s:ErrorStatus)=>s.toLowerCase();
const categories=["Application","Database","Infrastructure","Authorization","Background Job","Configuration","Network","Unknown"];
const components=["Central API","Central Database Service","Authentication Service","License Validation Service","Monitoring Service","Notification Worker","Configuration Service","School Local API"];
const admins=["Amina Ops (demo session)","Unassigned"];
type ConfirmAction={kind:"resolve"|"ignore"|"reopen";id:string};
export function ErrorsPage(){
 const [rows,setRows]=useState(records);
 const [query,setQuery]=useState(""),[severity,setSeverity]=useState("All"),[status,setStatus]=useState("All"),[category,setCategory]=useState("All"),[source,setSource]=useState("All");
 const [range,setRange]=useState("Last 24 Hours"),[from,setFrom]=useState(""),[to,setTo]=useState("");
 const [sort,setSort]=useState<{key:string;dir:"asc"|"desc"}>({key:"last",dir:"desc"});
 const [page,setPage]=useState(0),[selectedId,setSelectedId]=useState<string|null>(null),[menu,setMenu]=useState<string|null>(null);
 const [refreshing,setRefreshing]=useState(false),[notice,setNotice]=useState(""),[confirm,setConfirm]=useState<ConfirmAction|null>(null);
 const [note,setNote]=useState(""),[resolution,setResolution]=useState(""),[ignoreReason,setIgnoreReason]=useState(""),[assignee,setAssignee]=useState(admins[0]);
 const [stackExpanded,setStackExpanded]=useState(false),[historyExpanded,setHistoryExpanded]=useState(false);
 const selected=rows.find(r=>r.id===selectedId)||null;
 const cutoff=range==="Last Hour"?now-hour:range==="Last 24 Hours"?now-day:range==="Last 7 Days"?now-7*day:range==="Last 30 Days"?now-30*day:from?new Date(from+"T00:00:00").getTime():0;
 const end=range==="Custom Range"&&to?new Date(to+"T23:59:59").getTime():Infinity;
 const filtered=useMemo(()=>rows.filter(r=>r.last>=cutoff&&r.last<=end&&(severity==="All"||r.severity===severity)&&(status==="All"||r.status===status)&&(category==="All"||r.category===category)&&(source==="All"||r.source===source)&&(!query||[r.title,r.id,r.trace,r.school].join(" ").toLowerCase().includes(query.toLowerCase().trim()))),[rows,cutoff,end,severity,status,category,source,query]);
 const sorted=useMemo(()=>[...filtered].sort((a,b)=>{let n=0;switch(sort.key){case"severity":n=severityRank(a.severity)-severityRank(b.severity);break;case"occurrences":n=a.occurrences-b.occurrences;break;case"first":n=a.first-b.first;break;case"last":n=a.last-b.last;break;case"status":n=a.status.localeCompare(b.status);break;}return sort.dir==="asc"?n:-n;}),[filtered,sort]);
 const pageSize=10,pageCount=Math.max(1,Math.ceil(sorted.length/pageSize)),visible=sorted.slice(page*pageSize,(page+1)*pageSize);
 const openCount=filtered.filter(r=>r.status==="Open").length,criticalCount=filtered.filter(r=>r.severity==="Critical").length;
 const resolved24=rows.filter(r=>r.status==="Resolved"&&r.updated>=now-day).length;
 const priorities=rows.filter(r=>r.status==="Open"||r.status==="Investigating").filter(r=>r.severity==="Critical"||r.severity==="High").sort((a,b)=>severityRank(b.severity)-severityRank(a.severity)||b.last-a.last).slice(0,3);
 const clear=()=>{setQuery("");setSeverity("All");setStatus("All");setCategory("All");setSource("All");setRange("Last 24 Hours");setFrom("");setTo("");setPage(0);};
 const setFilter=(key:string,value:string)=>{if(key==="severity")setSeverity(value);if(key==="status")setStatus(value);setPage(0);};
 const sortBy=(key:string)=>{setSort(s=>({key,dir:s.key===key?(s.dir==="asc"?"desc":"asc"):"desc"}));setPage(0);};
 const update=(id:string,patch:Partial<ErrorRecord>,event:string)=>{setRows(old=>old.map(r=>r.id===id?{...r,...patch,updated:now,lastActor:"Amina Ops (demo session)",notes:event? [...r.notes,{id:"NOTE-"+Date.now(),text:event,actor:"Amina Ops (demo session)",at:now,kind:"Activity"}]:r.notes}:r));setNotice(event);};
 const refresh=()=>{setRefreshing(true);window.setTimeout(()=>{setRefreshing(false);setNotice("Local demonstration records refreshed. No monitoring service was contacted.");},450);};
 const addNote=()=>{if(!selected||!note.trim())return;const entry={id:"NOTE-"+Date.now(),text:note.trim(),actor:"Amina Ops (demo session)",at:now,kind:"Investigation note"};setRows(old=>old.map(r=>r.id===selected.id?{...r,notes:[...r.notes,entry],updated:now,lastActor:entry.actor}:r));setNote("");setNotice("Investigation note added to this local demo record.");};
 const assign=()=>{if(!selected)return;update(selected.id,{assignee},"Assigned to "+assignee+".");};
 const confirmAction=()=>{if(!confirm)return;const r=rows.find(x=>x.id===confirm.id);if(!r)return;
  if(confirm.kind==="resolve"){if(!resolution.trim())return;update(r.id,{status:"Resolved",resolution:resolution.trim()},"Resolved: "+resolution.trim());setResolution("");}
  if(confirm.kind==="ignore"){update(r.id,{status:"Ignored"},"Ignored"+(ignoreReason.trim()?": "+ignoreReason.trim():"."));setIgnoreReason("");}
  if(confirm.kind==="reopen"){update(r.id,{status:"Open",resolution:""},"Reopened for further investigation.");}
  setConfirm(null);
 };
 const copy=(value:string)=>{if(navigator.clipboard?.writeText){navigator.clipboard.writeText(value).then(()=>setNotice("Copied safe identifier to clipboard.")).catch(()=>setNotice("Clipboard access is unavailable in this browser."));}else setNotice("Clipboard access is unavailable in this browser.");};
 const metricFilter=(kind:string)=>{setPage(0);if(kind==="all"){setSeverity("All");setStatus("All");}if(kind==="open")setStatus("Open");if(kind==="critical")setSeverity("Critical");if(kind==="resolved")setStatus("Resolved");};
 const rowAction=(id:string,action:"investigate"|"resolve"|"ignore"|"reopen")=>{setSelectedId(id);setMenu(null);if(action==="investigate")update(id,{status:"Investigating"},"Marked as investigating.");else setConfirm({id,kind:action});};
 return <div className="errors-page">
  <header className="er-header"><div><span className="er-eyebrow">MONITORING / INVESTIGATION</span><h1>Errors</h1><p>Investigate application errors and track their resolution across the platform.</p></div><div className="er-head-actions"><label className="er-range"><Clock3 size={14}/><select value={range} onChange={e=>{setRange(e.target.value);setPage(0);}}><option>Last Hour</option><option>Last 24 Hours</option><option>Last 7 Days</option><option>Last 30 Days</option><option>Custom Range</option></select></label><button className="er-btn" onClick={refresh} disabled={refreshing}><RefreshCw size={14} className={refreshing?"er-spin":""}/>{refreshing?"Refreshing…":"Refresh"}</button></div></header>
  <div className="er-demo"><ShieldAlert size={15}/><span><b>DEMO DATA</b> All 248 error groups, timestamps, schools, identifiers and diagnostics are fictional. Changes stay in this page session; no live error ingestion or production incident actions are connected.</span></div>
  {notice&&<div className="er-notice" role="status">{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss message"><X size={14}/></button></div>}
  <section className="er-metrics" aria-label="Error summary">
   <button onClick={()=>metricFilter("all")}><small>Total Errors</small><strong>{filtered.length}</strong><span>Matching error groups</span></button>
   <button onClick={()=>metricFilter("open")}><small>Open</small><strong>{openCount}</strong><span>Awaiting investigation</span></button>
   <button onClick={()=>metricFilter("critical")}><small>Critical</small><strong>{criticalCount}</strong><span>All investigation states</span></button>
   <button onClick={()=>metricFilter("resolved")}><small>Resolved (Last 24 Hours)</small><strong>{resolved24}</strong><span>Updated in the last 24 hours</span></button>
  </section>
  <section className="er-priority"><div className="er-section-head"><div><h2>High Priority Errors</h2><p>Unresolved critical and high severity groups · DEMO DATA</p></div><button className="er-link" onClick={clear}>View all errors <ExternalLink size={13}/></button></div><div className="er-priority-list">{priorities.map(r=><button className="er-priority-item" key={r.id} onClick={()=>setSelectedId(r.id)}><span className={"er-severity "+severityTone(r.severity)}>{r.severity}</span><span className="er-priority-main"><b>{r.title}</b><small>{r.source} · {r.school}</small></span><span className="er-priority-meta"><b>{r.occurrences} occurrences</b><small>{ago(r.last)}</small></span><span className={"er-status "+statusTone(r.status)}>{r.status}</span><ChevronRight size={15}/></button>)}</div></section>
  <section className="er-table-card"><div className="er-section-head er-table-heading"><div><h2>All Errors</h2><p>Grouped technical errors · severity and investigation status are independent</p></div><span className="er-data-count">{filtered.length} MATCHING GROUPS</span></div>
   <div className="er-toolbar"><label className="er-search"><Search size={15}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}} placeholder="Search error title, ID, trace ID, or school…"/></label>
    <select aria-label="Filter severity" value={severity} onChange={e=>{setSeverity(e.target.value);setPage(0);}}><option>All</option>{["Critical","High","Medium","Low"].map(x=><option key={x}>{x}</option>)}</select>
    <select aria-label="Filter investigation status" value={status} onChange={e=>{setStatus(e.target.value);setPage(0);}}><option>All</option>{["Open","Investigating","Resolved","Ignored"].map(x=><option key={x}>{x}</option>)}</select>
    <select aria-label="Filter category" value={category} onChange={e=>{setCategory(e.target.value);setPage(0);}}><option>All</option>{categories.map(x=><option key={x}>{x}</option>)}</select>
    <select aria-label="Filter source component" value={source} onChange={e=>{setSource(e.target.value);setPage(0);}}><option>All</option>{components.map(x=><option key={x}>{x}</option>)}</select>
    <button className="er-clear" onClick={clear}><Filter size={13}/>Clear filters</button>
   </div>
   {range==="Custom Range"&&<div className="er-custom-range"><label>From <input type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(0);}}/></label><label>To <input type="date" value={to} onChange={e=>{setTo(e.target.value);setPage(0);}}/></label></div>}
   <div className="er-table-wrap"><table className="er-table"><thead><tr><th>Error</th><th><button onClick={()=>sortBy("severity")}>Severity <ArrowDown size={12}/></button></th><th>Category</th><th>Source</th><th>Affected School</th><th><button onClick={()=>sortBy("occurrences")}>Occurrences <ArrowDown size={12}/></button></th><th><button onClick={()=>sortBy("first")}>First Seen <ArrowDown size={12}/></button></th><th><button onClick={()=>sortBy("last")}>Last Seen <ArrowDown size={12}/></button></th><th><button onClick={()=>sortBy("status")}>Status <ArrowDown size={12}/></button></th><th>Actions</th></tr></thead><tbody>{visible.map(r=><tr key={r.id} onClick={()=>{setSelectedId(r.id);setStackExpanded(false);setHistoryExpanded(false);}}><td><b>{r.title}</b><small className="er-mono">{r.id}</small></td><td><span className={"er-severity "+severityTone(r.severity)}>{r.severity}</span></td><td>{r.category}</td><td>{r.source}</td><td>{r.school}</td><td className="er-mono">{r.occurrences}</td><td className="er-date">{fmt(r.first)}</td><td className="er-date">{ago(r.last)}</td><td><span className={"er-status "+statusTone(r.status)}>{r.status}</span></td><td><div className="er-row-menu"><button onClick={e=>{e.stopPropagation();setMenu(menu===r.id?null:r.id);}} aria-label={"Actions for "+r.id}><MoreHorizontal size={17}/></button>{menu===r.id&&<div className="er-menu" onClick={e=>e.stopPropagation()}><button onClick={()=>{setSelectedId(r.id);setMenu(null);}}>View details</button>{r.status==="Open"&&<button onClick={()=>rowAction(r.id,"investigate")}>Mark investigating</button>}{r.status!=="Resolved"&&r.status!=="Ignored"&&<button onClick={()=>rowAction(r.id,"resolve")}>Resolve</button>}{r.status!=="Ignored"&&<button onClick={()=>rowAction(r.id,"ignore")}>Ignore</button>}{r.status==="Resolved"&&<button onClick={()=>rowAction(r.id,"reopen")}>Reopen</button>}</div>}</div></td></tr>)}</tbody></table>
    {visible.length===0&&<div className="er-empty"><Search size={22}/><b>No errors found</b><span>There are no matching error records for the selected time range and filters.</span><button onClick={clear}>Clear filters</button></div>}
   </div>
   <footer className="er-pagination"><span>Showing {sorted.length?page*pageSize+1:0}–{Math.min((page+1)*pageSize,sorted.length)} of {sorted.length} errors · DEMO DATA</span><div><button disabled={page===0} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={14}/>Previous</button><span>Page {page+1} of {pageCount}</span><button disabled={page>=pageCount-1} onClick={()=>setPage(p=>p+1)}>Next<ChevronRight size={14}/></button></div></footer>
  </section>
  <div className="er-scope-note"><AlertTriangle size={15}/><span>An error does not establish that its server is offline or unhealthy. Connectivity, heartbeat reporting, server health, tunnel state and license status remain independent operational domains.</span></div>
  {selected&&<div className="er-backdrop" onMouseDown={()=>setSelectedId(null)}><aside className="er-drawer" role="dialog" aria-modal="true" aria-label={"Error details "+selected.id} onMouseDown={e=>e.stopPropagation()}>
   <header className="er-drawer-head"><div><span className="er-eyebrow">ERROR INVESTIGATION · DEMO DATA</span><h2>{selected.title}</h2><p className="er-mono">{selected.id} · {selected.source}</p></div><button className="er-icon-btn" onClick={()=>setSelectedId(null)} aria-label="Close details"><X size={18}/></button></header>
   <div className="er-drawer-body">
    <section className="er-detail-section"><div className="er-detail-top"><h3>Overview</h3><div><span className={"er-severity "+severityTone(selected.severity)}>{selected.severity}</span><span className={"er-status "+statusTone(selected.status)}>{selected.status}</span></div></div><div className="er-detail-grid">{[["Error ID",selected.id],["Category",selected.category],["Source",selected.source],["Origin",selected.origin],["Environment",selected.environment],["Affected School",selected.school],["Affected Server",selected.server],["First Seen",fmt(selected.first)],["Last Seen",fmt(selected.last)],["Total Occurrences",String(selected.occurrences)],["Created",fmt(selected.created)],["Updated",fmt(selected.updated)]].map(([label,value])=><div key={label}><small>{label}</small><b>{value}</b>{label==="Error ID"&&<button onClick={()=>copy(value)} aria-label="Copy error ID"><Copy size={12}/></button>}</div>)}</div></section>
    <section className="er-detail-section"><h3>Technical Context <small>REDACTED DEMO DIAGNOSTICS</small></h3><div className="er-diagnostic"><p>{selected.message}</p><div className="er-safe-line"><span>Trace ID</span><code>{selected.trace}</code><button onClick={()=>copy(selected.trace)} aria-label="Copy trace ID"><Copy size={12}/></button></div><div className="er-safe-line"><span>Request ID</span><code>{selected.request}</code><button onClick={()=>copy(selected.request)} aria-label="Copy request ID"><Copy size={12}/></button></div><div className="er-detail-grid compact">{[["HTTP Method",selected.method],["Endpoint",selected.endpoint],["Application Version",selected.version],["Environment",selected.environment],["Error Timestamp",fmt(selected.last)]] .map(([a,b])=><div key={a}><small>{a}</small><b>{b}</b></div>)}</div></div><div className="er-stack-head"><b>Redacted stack trace</b><button onClick={()=>setStackExpanded(v=>!v)}>{stackExpanded?"Collapse":"Expand"}</button><button onClick={()=>copy(selected.stack)}><Copy size={12}/>Copy safe trace</button></div><pre className={stackExpanded?"expanded":""}>{selected.stack}</pre><p className="er-redaction-note">Sensitive hosts, credentials, tokens, headers and personal data are represented as [REDACTED]. No raw request payloads are shown.</p></section>
    <section className="er-detail-section"><h3>Occurrence Timeline <small>{selected.occurrences} OCCURRENCES</small></h3><div className="er-timeline">{(historyExpanded?selected.timeline:[selected.timeline[0],selected.timeline[selected.timeline.length-1]]).map((ts,i)=><div key={ts}><i className={i===0?"first":i===(historyExpanded?selected.timeline.length-1:1)?"latest":""}/><span><b>{i===0?"First occurrence":ts===selected.last?"Latest occurrence":"Repeated occurrence"}</b><small>{fmt(ts)} · {selected.source}</small></span><em>{selected.severity}</em></div>)}</div>{selected.occurrences>2&&<button className="er-link" onClick={()=>setHistoryExpanded(v=>!v)}>{historyExpanded?"Show key occurrences":"Inspect occurrence history"}</button>}</section>
    <section className="er-detail-section"><h3>Related Events</h3><div className="er-no-related">No related events identified. No verified correlation identifier is available in this demonstration record.</div></section>
    <section className="er-detail-section"><h3>Investigation</h3><div className="er-detail-grid"><div><small>Assigned Administrator</small><b>{selected.assignee}</b></div><div><small>Last Updated By</small><b>{selected.lastActor}</b></div><div><small>Created</small><b>{fmt(selected.created)}</b></div><div><small>Updated</small><b>{fmt(selected.updated)}</b></div><div className="er-assignment"><small>Assign to administrator</small><select value={selected.assignee} onChange={e=>{setAssignee(e.target.value);update(selected.id,{assignee:e.target.value},"Assigned to "+e.target.value+".");}}>{admins.map(a=><option key={a}>{a}</option>)}</select></div></div>
     <div className="er-note-form"><label htmlFor="er-note">Add internal investigation note</label><textarea id="er-note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Record investigation findings for authorized administrators…"/><button className="er-btn primary" disabled={!note.trim()} onClick={addNote}><MessageSquare size={14}/>Add note</button></div>
     <div className="er-activity"><h4>Investigation activity</h4>{selected.notes.length===0?<p>No administrative activity recorded yet.</p>: [...selected.notes].reverse().map(n=><article key={n.id}><i/><div><b>{n.kind}</b><p>{n.text}</p><small>{n.actor} · {fmt(n.at)}</small></div></article>)}{selected.resolution&&<article><i className="resolved"/><div><b>Previous resolution</b><p>{selected.resolution}</p><small>Preserved resolution summary</small></div></article>}</div>
    </section>
   </div>
   <footer className="er-drawer-footer"><span>Local demo actions only · No infrastructure state changed</span><div>{selected.status==="Open"&&<button className="er-btn" onClick={()=>update(selected.id,{status:"Investigating"},"Marked as investigating.")}>Mark investigating</button>}{selected.status==="Resolved"?<button className="er-btn primary" onClick={()=>setConfirm({kind:"reopen",id:selected.id})}><RotateCcw size={13}/>Reopen</button>:selected.status!=="Ignored"&&<><button className="er-btn" onClick={()=>setConfirm({kind:"ignore",id:selected.id})}><Ban size={13}/>Ignore</button><button className="er-btn primary" onClick={()=>setConfirm({kind:"resolve",id:selected.id})}><Check size={13}/>Resolve</button></>}</div></footer>
  </aside></div>}
  {confirm&&<div className="er-confirm-back"><section role="dialog" aria-modal="true" aria-labelledby="er-confirm-title"><h2 id="er-confirm-title">{confirm.kind==="resolve"?"Resolve error group?":confirm.kind==="ignore"?"Ignore this error group?":"Reopen resolved error?"}</h2><p>{confirm.kind==="resolve"?"Record a resolution summary. The original occurrence history and severity will be preserved.":confirm.kind==="ignore"?"This hides the group from active investigation workflows but preserves its diagnostics and audit history.":"The group returns to Open. Its previous resolution record remains in the investigation history."}</p>{confirm.kind==="resolve"&&<label>Resolution summary *<textarea value={resolution} onChange={e=>setResolution(e.target.value)} placeholder="Describe the resolution and verification performed…"/></label>}{confirm.kind==="ignore"&&<label>Reason (optional)<textarea value={ignoreReason} onChange={e=>setIgnoreReason(e.target.value)} placeholder="Why is this error being ignored?"/></label>}<div><button className="er-btn" onClick={()=>setConfirm(null)}>Cancel</button><button className="er-btn primary" disabled={confirm.kind==="resolve"&&!resolution.trim()} onClick={confirmAction}>Confirm {confirm.kind}</button></div></section></div>}
 </div>;
}
