import { useMemo, useState } from "react";
import {
  Activity, AlertCircle, AlertTriangle, ArrowDownUp, Check, CheckCircle2, ChevronRight,
  Clock3, Cloud, Copy, ExternalLink, Globe2, Info, KeyRound, Laptop, Lock, MoreHorizontal,
  Network, Plus, RefreshCw, Search, Server, Shield, ShieldCheck, Smartphone, ToggleLeft,
  ToggleRight, X, Zap
} from "lucide-react";
import "./school-access-directory.css";

type EndpointState = "Online" | "Degraded" | "Offline" | "Disabled" | "Not verified";
type Environment = "Production" | "Staging";
type AccessTab = "Overview" | "Routing" | "Access policy" | "Activity";
type EndpointRecord = {
  id: string; school: string; code: string; city: string; hostname: string; environment: Environment;
  state: EndpointState; tunnelId: string; tunnelName: string; origin: string; lastCheck: string;
  latency: number | null; mobile: boolean; web: boolean; external: boolean; rateLimit: number;
  clients: string[]; tls: string; created: string; updated: string; notes: string;
};
type EndpointForm = {
  school: string; code: string; city: string; hostname: string; environment: Environment;
  tunnelId: string; tunnelName: string; origin: string; mobile: boolean; web: boolean;
  external: boolean; rateLimit: string; notes: string;
};

const seed: EndpointRecord[] = [
  {id:"EP-ATS-001",school:"Atlas International School",code:"ATS-001",city:"Rabat",hostname:"atlas-api.schools.example.com",environment:"Production",state:"Online",tunnelId:"cf-tun-a81f2",tunnelName:"atlas-prod-tunnel",origin:"http://127.0.0.1:8080",lastCheck:"1 min ago",latency:84,mobile:true,web:true,external:true,rateLimit:120,clients:["Parent & Student App","Teacher App","Director Portal"],tls:"Valid · managed edge certificate",created:"14 Sep 2026",updated:"09 Nov 2026 · 14:20 UTC",notes:"Primary production endpoint"},
  {id:"EP-AMAL-002",school:"Groupe Scolaire Al Amal",code:"AMAL-002",city:"Fès",hostname:"amal-api.schools.example.com",environment:"Production",state:"Degraded",tunnelId:"cf-tun-b42c9",tunnelName:"amal-prod-tunnel",origin:"http://127.0.0.1:8080",lastCheck:"3 min ago",latency:684,mobile:true,web:true,external:true,rateLimit:100,clients:["Parent & Student App","Teacher App","Director Portal"],tls:"Valid · managed edge certificate",created:"02 Oct 2026",updated:"09 Nov 2026 · 14:18 UTC",notes:"Origin API responding slowly"},
  {id:"EP-HZN-003",school:"École Horizon",code:"HZN-003",city:"Casablanca",hostname:"horizon-api.schools.example.com",environment:"Production",state:"Online",tunnelId:"cf-tun-c11d0",tunnelName:"horizon-prod-tunnel",origin:"http://127.0.0.1:8080",lastCheck:"2 min ago",latency:112,mobile:true,web:true,external:true,rateLimit:150,clients:["Parent & Student App","Teacher App","Director Portal"],tls:"Valid · managed edge certificate",created:"03 Aug 2026",updated:"09 Nov 2026 · 14:19 UTC",notes:"Primary production endpoint"},
  {id:"EP-IBS-004",school:"Collège Ibn Sina",code:"IBS-004",city:"Tanger",hostname:"ibnsina-api.schools.example.com",environment:"Production",state:"Offline",tunnelId:"cf-tun-d08e4",tunnelName:"ibnsina-prod-tunnel",origin:"http://127.0.0.1:8080",lastCheck:"36 hours ago",latency:null,mobile:true,web:true,external:true,rateLimit:100,clients:["Parent & Student App","Teacher App","Director Portal"],tls:"Valid · managed edge certificate",created:"18 Aug 2026",updated:"08 Nov 2026 · 02:10 UTC",notes:"No recent successful endpoint check"},
  {id:"EP-OLV-005",school:"École Les Oliviers",code:"OLV-005",city:"Marrakech",hostname:"oliviers-api.schools.example.com",environment:"Production",state:"Not verified",tunnelId:"cf-tun-e91a7",tunnelName:"oliviers-prod-tunnel",origin:"http://127.0.0.1:8080",lastCheck:"Never",latency:null,mobile:false,web:true,external:false,rateLimit:60,clients:["Director Portal"],tls:"Pending first verification",created:"09 Nov 2026",updated:"09 Nov 2026 · 09:30 UTC",notes:"Onboarding endpoint; external access held until verification"},
  {id:"EP-PLM-006",school:"Académie La Plume",code:"PLM-006",city:"Agadir",hostname:"staging-laplume-api.schools.example.com",environment:"Staging",state:"Online",tunnelId:"cf-tun-f26b1",tunnelName:"laplume-staging-tunnel",origin:"http://127.0.0.1:8081",lastCheck:"5 min ago",latency:96,mobile:false,web:true,external:true,rateLimit:40,clients:["Internal QA Web"],tls:"Valid · managed edge certificate",created:"28 Oct 2026",updated:"09 Nov 2026 · 14:15 UTC",notes:"Pre-release validation only"},
  {id:"EP-QAL-007",school:"École Al Qalam",code:"QAL-007",city:"Meknès",hostname:"alqalam-api.schools.example.com",environment:"Production",state:"Disabled",tunnelId:"cf-tun-g71d3",tunnelName:"alqalam-prod-tunnel",origin:"http://127.0.0.1:8080",lastCheck:"12 days ago",latency:null,mobile:false,web:false,external:false,rateLimit:60,clients:[],tls:"Not evaluated while disabled",created:"11 Jul 2026",updated:"28 Oct 2026 · 11:05 UTC",notes:"School access suspended by platform operator"}
];

const blankForm: EndpointForm = {school:"",code:"",city:"",hostname:"",environment:"Production",tunnelId:"",tunnelName:"",origin:"http://127.0.0.1:8080",mobile:true,web:true,external:false,rateLimit:"100",notes:""};

function stateTone(state: EndpointState) {
  if (state === "Online") return "good";
  if (state === "Degraded" || state === "Not verified") return "warn";
  if (state === "Offline" || state === "Disabled") return "bad";
  return "neutral";
}
function StateBadge({state}:{state:EndpointState}) {
  return <span className={`sad-state ${stateTone(state)}`}><i/>{state}</span>;
}
function Metric({label,value,detail,icon:Icon,tone="blue"}:{label:string;value:string;detail:string;icon:typeof Globe2;tone?:string}) {
  return <div className="sad-metric"><span className={`sad-metric-icon ${tone}`}><Icon size={17}/></span><div><small>{label}</small><strong>{value}</strong><em>{detail}</em></div></div>;
}

export function SchoolAccessDirectoryPage({notify}:{notify:(message:string)=>void}) {
  const [rows,setRows] = useState<EndpointRecord[]>(seed);
  const [query,setQuery] = useState("");
  const [filter,setFilter] = useState<"All"|EndpointState>("All");
  const [environment,setEnvironment] = useState<"All"|Environment>("All");
  const [sort,setSort] = useState("attention");
  const [selected,setSelected] = useState<EndpointRecord|null>(null);
  const [tab,setTab] = useState<AccessTab>("Overview");
  const [formOpen,setFormOpen] = useState(false);
  const [editing,setEditing] = useState(false);
  const [form,setForm] = useState<EndpointForm>(blankForm);
  const [checking,setChecking] = useState<string|null>(null);
  const [events,setEvents] = useState<{id:string;school:string;action:string;detail:string;time:string;level:string}[]>([
    {id:"EV-901",school:"Atlas International School",action:"Endpoint health check passed",detail:"HTTP readiness probe returned 200 · 84 ms",time:"09 Nov 2026 · 14:20 UTC",level:"success"},
    {id:"EV-900",school:"Groupe Scolaire Al Amal",action:"Endpoint latency elevated",detail:"Origin API responded in 684 ms",time:"09 Nov 2026 · 14:18 UTC",level:"warning"},
    {id:"EV-899",school:"École Les Oliviers",action:"Endpoint registered",detail:"External access remains disabled pending verification",time:"09 Nov 2026 · 09:30 UTC",level:"info"},
    {id:"EV-898",school:"École Al Qalam",action:"External access disabled",detail:"Access suspended by platform operator",time:"28 Oct 2026 · 11:05 UTC",level:"warning"}
  ]);

  const counts = useMemo(()=>({
    total:rows.length,online:rows.filter(r=>r.state==="Online").length,
    attention:rows.filter(r=>r.state==="Degraded"||r.state==="Offline"||r.state==="Not verified").length,
    disabled:rows.filter(r=>r.state==="Disabled"||!r.external).length,
    public:rows.filter(r=>r.external&&r.state!=="Disabled").length
  }),[rows]);
  const filtered = useMemo(()=>rows.filter(r=>(filter==="All"||r.state===filter)&&(environment==="All"||r.environment===environment)&&`${r.school} ${r.code} ${r.hostname} ${r.tunnelName}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>{
    if(sort==="school")return a.school.localeCompare(b.school);
    if(sort==="latency")return (b.latency??-1)-(a.latency??-1);
    const rank=(s:EndpointState)=>s==="Offline"?0:s==="Degraded"?1:s==="Not verified"?2:s==="Disabled"?3:s==="Online"?4:5;
    return rank(a.state)-rank(b.state);
  }),[rows,filter,environment,query,sort]);

  const logEvent=(school:string,action:string,detail:string,level="info")=>{
    const now=new Date().toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"});
    setEvents(old=>[{id:`EV-${Date.now()}`,school,action,detail,time:now+" · local demo",level},...old]);
  };
  const openCreate=()=>{setForm(blankForm);setEditing(false);setFormOpen(true);};
  const openEdit=(r:EndpointRecord)=>{
    setForm({school:r.school,code:r.code,city:r.city,hostname:r.hostname,environment:r.environment,tunnelId:r.tunnelId,tunnelName:r.tunnelName,origin:r.origin,mobile:r.mobile,web:r.web,external:r.external,rateLimit:String(r.rateLimit),notes:r.notes});
    setEditing(true);setFormOpen(true);
  };
  const saveEndpoint=()=>{
    if(!form.school.trim()||!form.code.trim()||!form.hostname.trim()||!form.tunnelId.trim())return;
    const existing=rows.find(r=>r.code.toLowerCase()===form.code.trim().toLowerCase()&&r.environment===form.environment&&(!editing||r.id!==selected?.id));
    if(existing){notify("That school already has an endpoint for this environment.");return;}
    if(form.external&&(!editing||selected?.state!=="Online")){notify("External access can only be enabled after a successful endpoint health check.");return;}
    if(editing&&selected){
      const updated={...selected,...form,clients:[...(form.mobile?["Parent & Student App"]:[]),...(form.web?["Teacher & Director Web"]:[])],rateLimit:Math.max(1,Number(form.rateLimit)||100),updated:"Just now · local demo"};
      setRows(old=>old.map(r=>r.id===selected.id?updated:r));setSelected(updated);
      logEvent(updated.school,"Endpoint configuration updated","Hostname, routing or access policy changed in local demo");
      notify("Endpoint configuration updated in this demo.");
    }else{
      const created:EndpointRecord={...form,id:`EP-DEMO-${String(rows.length+1).padStart(3,"0")}`,rateLimit:Math.max(1,Number(form.rateLimit)||100),state:"Not verified",lastCheck:"Never",latency:null,tls:"Pending first verification",clients:[...(form.mobile?["Parent & Student App"]:[]),...(form.web?["Teacher & Director Web"]:[])],created:"Just now",updated:"Just now · local demo"};
      setRows(old=>[created,...old]);setSelected(created);setTab("Overview");
      logEvent(created.school,"Endpoint registered","New endpoint created; health verification is still required");
      notify("Endpoint registered locally. Run a health check before enabling external access.");
    }
    setFormOpen(false);
  };
  const toggleExternal=(r:EndpointRecord)=>{
    const next=!r.external;
    if(next&&r.state!=="Online"){notify("External access can only be enabled after a successful endpoint health check.");return;}
    const updated={...r,external:next,updated:"Just now · local demo"};
    setRows(old=>old.map(x=>x.id===r.id?updated:x));setSelected(updated);
    logEvent(r.school,next?"External access enabled":"External access disabled",next?"Endpoint is eligible for directory resolution in this demo":"Directory resolution is blocked in this demo",next?"success":"warning");
    notify(next?"External access enabled in demo mode.":"External access disabled in demo mode.");
  };
  const runCheck=(r:EndpointRecord)=>{
    setChecking(r.id);
    window.setTimeout(()=>{
      const nextState:EndpointState=r.state==="Disabled"?"Disabled":r.id==="EP-AMAL-002"?"Degraded":r.id==="EP-IBS-004"?"Offline":"Online";
      const nextLatency=nextState==="Online"?Math.round(70+Math.random()*90):nextState==="Degraded"?684:null;
      const updated={...r,state:nextState,lastCheck:"Just now · simulated",latency:nextLatency,tls:nextState==="Online"?"Valid · managed edge certificate":r.tls,updated:"Just now · local demo"};
      setRows(old=>old.map(x=>x.id===r.id?updated:x));setSelected(old=>old?.id===r.id?updated:old);
      logEvent(r.school,"Endpoint health check completed",nextState==="Online"?`Readiness check passed · ${nextLatency} ms`:nextState==="Degraded"?"Origin responded above latency threshold":"No successful response received",nextState==="Online"?"success":"warning");
      setChecking(null);notify(`Simulated endpoint check: ${nextState}.`);
    },650);
  };
  const refresh=()=>{notify("Directory snapshot refreshed locally. No live endpoints were contacted.");};
  const copyValue=(value:string)=>{if(navigator.clipboard?.writeText)navigator.clipboard.writeText(value).then(()=>notify("Copied to clipboard.")).catch(()=>notify(value));else notify(value);};

  return <div className="sad-page">
    <header className="sad-header"><div><span className="sad-eyebrow">ACCESS & ROUTING / TENANT DISCOVERY</span><h1>School Access & Directory</h1><p>Manage how mobile and web applications discover and reach each school's private API endpoint.</p></div><div className="sad-header-actions"><button className="sad-btn secondary" onClick={refresh}><RefreshCw size={15}/>Refresh snapshot</button><button className="sad-btn primary" onClick={openCreate}><Plus size={15}/>Register endpoint</button></div></header>
    <div className="sad-demo"><ShieldCheck size={16}/><span><b>DEMONSTRATION DATA</b> — Fictional school endpoints and access policies. Health checks, configuration changes and audit events are local simulations; no Cloudflare API or school server is contacted.</span></div>
    <section className="sad-metrics">
      <Metric label="Registered endpoints" value={String(counts.total)} detail="Across all environments" icon={Globe2}/>
      <Metric label="Online" value={String(counts.online)} detail="Last simulated check passed" icon={CheckCircle2} tone="green"/>
      <Metric label="Needs attention" value={String(counts.attention)} detail="Degraded, offline or unverified" icon={AlertTriangle} tone="amber"/>
      <Metric label="External access enabled" value={String(counts.public)} detail="Eligible for school discovery" icon={Shield} tone="violet"/>
    </section>
    <section className="sad-flow-panel"><div className="sad-flow-heading"><div><span className="sad-eyebrow">REQUEST LIFECYCLE</span><h2>How an application reaches a school</h2></div><span className="sad-flow-label"><Lock size={13}/>No direct database exposure</span></div><div className="sad-flow">
      <div><span className="sad-flow-icon"><Smartphone size={18}/></span><b>Mobile / Web App</b><small>School code + sign-in</small></div><i/><div><span className="sad-flow-icon"><Globe2 size={18}/></span><b>Central Directory</b><small>Resolve enabled hostname</small></div><i/><div><span className="sad-flow-icon"><Cloud size={18}/></span><b>Cloudflare Edge</b><small>HTTPS + tunnel routing</small></div><i/><div><span className="sad-flow-icon"><Server size={18}/></span><b>School API</b><small>Authenticate + authorize</small></div>
    </div><p className="sad-flow-note"><Info size={14}/>The directory returns only the public API hostname and school identity. User credentials are sent directly to the School API; Cloudflare transports traffic but does not decide school-data permissions.</p></section>
    <section className="sad-registry">
      <div className="sad-registry-head"><div><h2>School endpoint registry</h2><p>One active endpoint configuration per school environment. Select a row to inspect routing and access controls.</p></div><span>{filtered.length} OF {rows.length} ENDPOINTS</span></div>
      <div className="sad-toolbar"><label className="sad-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search school, code, hostname or tunnel…"/></label><select value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} aria-label="Filter endpoint status"><option>All</option><option>Online</option><option>Degraded</option><option>Offline</option><option>Disabled</option><option>Not verified</option></select><select value={environment} onChange={e=>setEnvironment(e.target.value as typeof environment)} aria-label="Filter environment"><option>All</option><option>Production</option><option>Staging</option></select><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort endpoints"><option value="attention">Attention first</option><option value="school">School name</option><option value="latency">Highest latency</option></select><button className="sad-reset" onClick={()=>{setQuery("");setFilter("All");setEnvironment("All");setSort("attention");}}>Reset</button></div>
      <div className="sad-table-wrap"><table className="sad-table"><thead><tr><th>SCHOOL</th><th>API HOSTNAME</th><th>ENVIRONMENT</th><th>ENDPOINT</th><th>TUNNEL</th><th>LATENCY</th><th>LAST CHECK</th><th/></tr></thead><tbody>{filtered.map(r=><tr key={r.id} onClick={()=>{setSelected(r);setTab("Overview");}}><td><div className="sad-school"><span>{r.code.slice(-2)}</span><div><b>{r.school}</b><small>{r.code} · {r.city}</small></div></div></td><td><code>{r.hostname}</code></td><td><span className="sad-env">{r.environment}</span></td><td><StateBadge state={r.state}/></td><td><span className="sad-tunnel"><i className={r.state==="Online"||r.state==="Degraded"?"connected":""}/>{r.tunnelName}</span></td><td>{r.latency===null?"—":`${r.latency} ms`}</td><td className="sad-muted">{r.lastCheck}</td><td><button className="sad-open" aria-label={`Open ${r.school}`}><ChevronRight size={17}/></button></td></tr>)}</tbody></table>{filtered.length===0&&<div className="sad-empty"><Search size={22}/><b>No endpoints match</b><span>Change the search or filters.</span><button onClick={()=>{setQuery("");setFilter("All");setEnvironment("All");}}>Clear filters</button></div>}</div>
      <footer className="sad-table-footer"><span>Showing {filtered.length} of {rows.length} endpoint records</span><span>Health state is based on the last accepted check, not a live guarantee.</span></footer>
    </section>
    <section className="sad-bottom-grid"><div className="sad-info-card"><div><Network size={17}/><h3>Routing boundaries</h3></div><ul><li>School code resolves to an enabled school record.</li><li>Only the public HTTPS hostname is returned to client apps.</li><li>Cloudflare Tunnel maps the hostname to a private local origin.</li><li>PostgreSQL and internal service ports are never published.</li></ul></div><div className="sad-info-card"><div><ShieldCheck size={17}/><h3>Security responsibilities</h3></div><ul><li>Directory checks school and external-access eligibility.</li><li>School API validates credentials and issues short-lived sessions.</li><li>School API enforces role, relationship and resource-level permissions.</li><li>Administrative changes and discovery outcomes are audited.</li></ul></div></section>

    {selected&&<div className="sad-overlay" onMouseDown={()=>setSelected(null)}><aside className="sad-drawer" role="dialog" aria-modal="true" aria-label={`${selected.school} endpoint details`} onMouseDown={e=>e.stopPropagation()}>
      <header><div><span className="sad-eyebrow">SCHOOL ACCESS RECORD · {selected.id}</span><h2>{selected.school}</h2><p>{selected.code} · {selected.city} · {selected.environment}</p></div><button className="sad-close" onClick={()=>setSelected(null)} aria-label="Close details"><X size={19}/></button></header>
      <div className="sad-drawer-summary"><div><small>Endpoint state</small><StateBadge state={selected.state}/></div><div><small>API latency</small><strong>{selected.latency===null?"—":`${selected.latency} ms`}</strong></div><div><small>External access</small><strong className={selected.external?"sad-enabled":"sad-disabled"}>{selected.external?"Enabled":"Disabled"}</strong></div></div>
      <nav>{(["Overview","Routing","Access policy","Activity"] as AccessTab[]).map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</nav>
      {tab==="Overview"&&<div className="sad-drawer-body"><section><h3>Public endpoint</h3><div className="sad-copy-row"><code>https://{selected.hostname}</code><button onClick={()=>copyValue(`https://${selected.hostname}`)}><Copy size={14}/>Copy</button></div><dl><div><dt>School code</dt><dd>{selected.code}</dd></div><div><dt>Endpoint ID</dt><dd>{selected.id}</dd></div><div><dt>Environment</dt><dd>{selected.environment}</dd></div><div><dt>Last health check</dt><dd>{selected.lastCheck}</dd></div><div><dt>TLS certificate</dt><dd>{selected.tls}</dd></div><div><dt>Last configuration update</dt><dd>{selected.updated}</dd></div></dl></section><section><h3>Connected application clients</h3><div className="sad-client-list">{selected.clients.length?selected.clients.map(c=><span key={c}><Laptop size={14}/>{c}</span>):<small>No application clients enabled</small>}</div></section><section className="sad-note"><Info size={15}/><p>{selected.notes}. The API hostname is a routing address, not a user credential or a permission grant.</p></section></div>}
      {tab==="Routing"&&<div className="sad-drawer-body"><section><h3>Cloudflare Tunnel route</h3><dl><div><dt>Tunnel name</dt><dd>{selected.tunnelName}</dd></div><div><dt>Tunnel reference</dt><dd>{selected.tunnelId}</dd></div><div><dt>Public hostname</dt><dd>{selected.hostname}</dd></div><div><dt>Private origin service</dt><dd>{selected.origin}</dd></div><div><dt>Transport</dt><dd>HTTPS edge → encrypted tunnel → HTTP localhost origin</dd></div><div><dt>Environment</dt><dd>{selected.environment}</dd></div></dl></section><section className="sad-note"><Lock size={15}/><p>The origin address is internal configuration. It must never be exposed in the public School Directory response. Never route database ports through this endpoint.</p></section><button className="sad-btn secondary" onClick={()=>runCheck(selected)} disabled={checking===selected.id}><Activity size={14}/>{checking===selected.id?"Checking…":"Run endpoint health check"}</button></div>}
      {tab==="Access policy"&&<div className="sad-drawer-body"><section><h3>External access policy</h3><div className="sad-policy-row"><div><b>External directory resolution</b><small>Allow apps to resolve this school code to its hostname</small></div><button className={selected.external?"sad-switch on":"sad-switch"} onClick={()=>toggleExternal(selected)} aria-pressed={selected.external}>{selected.external?<ToggleRight size={23}/>:<ToggleLeft size={23}/>}<span>{selected.external?"Enabled":"Disabled"}</span></button></div><div className="sad-policy-row"><div><b>Mobile applications</b><small>Parent, student and teacher mobile clients</small></div><span className={selected.mobile?"sad-policy-on":"sad-policy-off"}>{selected.mobile?"Allowed":"Blocked"}</span></div><div className="sad-policy-row"><div><b>Web applications</b><small>Teacher and director browser clients</small></div><span className={selected.web?"sad-policy-on":"sad-policy-off"}>{selected.web?"Allowed":"Blocked"}</span></div><div className="sad-policy-row"><div><b>Rate limit</b><small>Per school API key / client policy · illustrative value</small></div><strong>{selected.rateLimit} requests / min</strong></div></section><section className="sad-note"><Shield size={15}/><p>These are application-level connection policies. Student, parent, teacher and director data permissions must still be checked by the School API on every request. Emergency director access is not a bypass of school authorization.</p></section><button className="sad-btn secondary" onClick={()=>openEdit(selected)}><KeyRound size={14}/>Edit access configuration</button></div>}
      {tab==="Activity"&&<div className="sad-drawer-body"><div className="sad-event-list">{events.filter(e=>e.school===selected.school).map(e=><div key={e.id}><i className={e.level}/><section><b>{e.action}</b><p>{e.detail}</p><small>{e.time}</small></section></div>)}{events.filter(e=>e.school===selected.school).length===0&&<div className="sad-empty small">No activity recorded for this school yet.</div>}</div><p className="sad-muted">Demo activity is held in local component state. Production audit events must be immutable and server-generated.</p></div>}
      <footer><button className="sad-btn secondary" onClick={()=>runCheck(selected)} disabled={checking===selected.id}><RefreshCw size={14}/>{checking===selected.id?"Checking…":"Test endpoint"}</button><button className="sad-btn secondary" onClick={()=>openEdit(selected)}>Edit configuration</button><button className="sad-btn primary" onClick={()=>toggleExternal(selected)}>{selected.external?"Disable external access":"Enable external access"}</button></footer>
    </aside></div>}

    {formOpen&&<div className="sad-overlay modal" onMouseDown={()=>setFormOpen(false)}><section className="sad-modal" role="dialog" aria-modal="true" aria-labelledby="sad-form-title" onMouseDown={e=>e.stopPropagation()}><header><div><span className="sad-eyebrow">ENDPOINT REGISTRY</span><h2 id="sad-form-title">{editing?"Edit endpoint configuration":"Register school endpoint"}</h2><p>{editing?"Update routing and external access settings.":"Create a directory record for an existing school API."}</p></div><button className="sad-close" onClick={()=>setFormOpen(false)} aria-label="Close"><X size={19}/></button></header><div className="sad-form-note"><Info size={15}/>Registration does not create a Cloudflare Tunnel, deploy an API or verify that the origin is reachable. Those steps must be completed separately.</div><div className="sad-form-grid"><label>School name *<input value={form.school} onChange={e=>setForm({...form,school:e.target.value})} placeholder="Registered school name"/></label><label>School code *<input value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} placeholder="e.g. ATS-009" disabled={editing}/></label><label>City<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="City"/></label><label>Environment<select value={form.environment} onChange={e=>setForm({...form,environment:e.target.value as Environment})}><option>Production</option><option>Staging</option></select></label><label className="wide">Public API hostname *<input value={form.hostname} onChange={e=>setForm({...form,hostname:e.target.value.toLowerCase()})} placeholder="school-api.schools.example.com"/></label><label>Cloudflare Tunnel ID/reference *<input value={form.tunnelId} onChange={e=>setForm({...form,tunnelId:e.target.value})} placeholder="cf-tun-..."/></label><label>Tunnel name<input value={form.tunnelName} onChange={e=>setForm({...form,tunnelName:e.target.value})} placeholder="school-prod-tunnel"/></label><label className="wide">Private origin service<input value={form.origin} onChange={e=>setForm({...form,origin:e.target.value})} placeholder="http://127.0.0.1:8080"/></label><label>Rate limit (requests/min)<input type="number" min="1" max="5000" value={form.rateLimit} onChange={e=>setForm({...form,rateLimit:e.target.value})}/></label><label>Notes<input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Operational notes"/></label></div><div className="sad-form-toggles"><label><input type="checkbox" checked={form.mobile} onChange={e=>setForm({...form,mobile:e.target.checked})}/>Mobile app clients</label><label><input type="checkbox" checked={form.web} onChange={e=>setForm({...form,web:e.target.checked})}/>Web app clients</label><label><input type="checkbox" checked={form.external} onChange={e=>setForm({...form,external:e.target.checked})}/>External directory access</label></div><footer><button className="sad-btn secondary" onClick={()=>setFormOpen(false)}>Cancel</button><button className="sad-btn primary" disabled={!form.school.trim()||!form.code.trim()||!form.hostname.trim()||!form.tunnelId.trim()} onClick={saveEndpoint}><Check size={14}/>{editing?"Save configuration":"Register endpoint"}</button></footer></section></div>}
  </div>;
}
