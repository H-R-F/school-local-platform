import { useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowLeft, ChevronRight, Cloud, FileText, Filter, Gauge, HardDrive, HeartPulse, Network, RefreshCw, Search, Server, ShieldCheck, Wrench } from "lucide-react";
import "./school-workspace.css";

type Props = { school: string; serverId: string; notify: (message: string) => void; onBack: () => void };
type Tab = "Overview" | "Installation" | "Servers" | "Cloudflare" | "Connectivity" | "Monitoring" | "Errors" | "Logs";
const tabs: {name:Tab; icon:typeof Activity}[] = [
 {name:"Overview",icon:Activity},{name:"Installation",icon:Wrench},{name:"Servers",icon:Server},{name:"Cloudflare",icon:Cloud},
 {name:"Connectivity",icon:Network},{name:"Monitoring",icon:HeartPulse},{name:"Errors",icon:AlertTriangle},{name:"Logs",icon:FileText}
];
const logs = [
 {time:"18:22:14",level:"INFO",source:"monitor-agent",message:"Heartbeat received from school server"},
 {time:"18:20:03",level:"INFO",source:"cloudflared",message:"Tunnel connection established"},
 {time:"18:18:42",level:"WARN",source:"postgresql",message:"Query latency above normal baseline"},
 {time:"18:14:09",level:"INFO",source:"school-api",message:"Health check passed"}
];
const initialErrors = [
 {id:"INC-2042",title:"Database query latency elevated",severity:"Warning",time:"34 minutes ago",detail:"PostgreSQL response time above baseline",ack:false},
 {id:"INC-2039",title:"Backup job completed",severity:"Info",time:"2 hours ago",detail:"Nightly backup completed successfully",ack:true}
];
function Status({value}:{value:string}) { const tone=value.toLowerCase().includes("healthy")||value.toLowerCase().includes("connected")||value.toLowerCase().includes("completed")||value==="Operational"?"good":value.toLowerCase().includes("warning")||value.toLowerCase().includes("degraded")||value.toLowerCase().includes("progress")?"warn":value.toLowerCase().includes("critical")||value.toLowerCase().includes("failed")?"bad":"neutral"; return <span className={"sw-status "+tone}><i/>{value}</span>; }
function Metric({label,value}:{label:string;value:string}) { return <div className="sw-metric"><span>{label}</span><b>{value}</b></div>; }
export function SchoolWorkspacePage({school,serverId,notify,onBack}:Props) {
 const [tab,setTab]=useState<Tab>("Overview"),[errors,setErrors]=useState(initialErrors),[logQuery,setLogQuery]=useState(""),[logLevel,setLogLevel]=useState("All"),[testing,setTesting]=useState(false),[testAt,setTestAt]=useState("");
 const filteredLogs=useMemo(()=>logs.filter(x=>(logLevel==="All"||x.level===logLevel)&&(x.message+" "+x.source).toLowerCase().includes(logQuery.toLowerCase())),[logLevel,logQuery]);
 const runHeartbeat=()=>{setTesting(true);window.setTimeout(()=>{setTesting(false);setTestAt(new Date().toLocaleTimeString());notify("Demo heartbeat test simulated. No school server was contacted.");},650);};
 const acknowledge=(id:string)=>{setErrors(v=>v.map(e=>e.id===id?{...e,ack:true}:e));notify(id+" acknowledged locally.");};
 return <div className="sw-page">
  <div className="sw-breadcrumb"><button onClick={onBack}><ArrowLeft size={14}/>All servers</button><ChevronRight size={13}/><span>School workspace</span></div>
  <header className="sw-header"><div><span className="sw-eyebrow">SCHOOL INFRASTRUCTURE WORKSPACE</span><h1>{school}</h1><p>{serverId} · Production environment · Demo records</p></div><div className="sw-header-actions"><Status value="Operational"/><button onClick={()=>notify("Workspace demo snapshot refreshed.")}><RefreshCw size={14}/>Refresh</button></div></header>
  <div className="sw-demo"><ShieldCheck size={15}/><span><b>Demonstration workspace</b> — Information and actions are local sample data. No school infrastructure is connected.</span></div>
  <nav className="sw-tabs" aria-label="School workspace sections">{tabs.map(t=>{const Icon=t.icon;return <button key={t.name} className={tab===t.name?"active":""} onClick={()=>setTab(t.name)}><Icon size={15}/>{t.name}</button>;})}</nav>
  {tab==="Overview"&&<>
   <section className="sw-live-summary">
    <div className="sw-live-left"><div className="sw-live-indicator"><i/> MONITORING SNAPSHOT <span>DEMO DATA</span></div><h2>All systems operational <small>with 1 warning</small></h2><p>Last monitoring update 42 seconds ago · Agent check-in interval 60 seconds</p></div>
    <div className="sw-live-actions"><Status value="Online"/><button onClick={()=>notify("Demo snapshot refreshed. No live infrastructure was queried.")}><RefreshCw size={14}/> Refresh checks</button></div>
   </section>
   <div className="sw-alert-strip"><AlertTriangle size={16}/><div><b>Database performance warning</b><span>PostgreSQL query latency is above its normal baseline. No service outage detected.</span></div><button onClick={()=>setTab("Errors")}>Investigate <ChevronRight size={13}/></button></div>
   <div className="sw-kpis sw-monitor-kpis">
    <div><div className="sw-kpi-label"><Activity size={13}/> CPU usage</div><strong>32<span>%</span></strong><div className="sw-progress"><i style={{width:"32%"}}/></div><small>Normal · 8 vCPU</small></div>
    <div><div className="sw-kpi-label"><HeartPulse size={13}/> Memory</div><strong>58<span>%</span></strong><div className="sw-progress"><i style={{width:"58%"}}/></div><small>4.6 GB / 8 GB used</small></div>
    <div><div className="sw-kpi-label"><HardDrive size={13}/> Disk usage</div><strong>64<span>%</span></strong><div className="sw-progress"><i style={{width:"64%"}}/></div><small>128 GB / 200 GB used</small></div>
    <div><div className="sw-kpi-label"><Gauge size={13}/> API latency</div><strong>184<span>ms</span></strong><div className="sw-kpi-trend"><span>+12 ms</span> vs previous hour</div><small>Within operating range</small></div>
   </div>
   <div className="sw-monitor-grid">
    <section className="sw-card sw-resource-card"><div className="sw-card-head"><div><h2>Server resource usage</h2><p>CPU, memory and disk · sample readings over the last 60 minutes</p></div><span className="sw-chart-period">LAST 60 MIN</span></div>
     <div className="sw-chart-legend"><span><i className="cpu"/>CPU</span><span><i className="memory"/>Memory</span><span><i className="disk"/>Disk</span></div>
     <svg className="sw-resource-chart" viewBox="0 0 680 190" role="img" aria-label="Illustrative server resource usage trend chart">
      <g className="sw-chart-grid"><path d="M42 20H665 M42 58H665 M42 96H665 M42 134H665 M42 172H665"/><path d="M42 20V172 M166 20V172 M290 20V172 M414 20V172 M538 20V172 M665 20V172"/></g>
      <g className="sw-chart-labels"><text x="8" y="23">100%</text><text x="15" y="61">75%</text><text x="15" y="99">50%</text><text x="15" y="137">25%</text><text x="28" y="175">0</text><text x="42" y="188">60m ago</text><text x="245" y="188">40m</text><text x="448" y="188">20m</text><text x="640" y="188">Now</text></g>
      <path className="sw-chart-line cpu" d="M42 126 L94 118 L146 123 L198 111 L250 116 L302 102 L354 110 L406 99 L458 106 L510 95 L562 101 L614 94 L665 99"/>
      <path className="sw-chart-line memory" d="M42 92 L94 91 L146 89 L198 88 L250 90 L302 86 L354 85 L406 86 L458 82 L510 84 L562 81 L614 80 L665 82"/>
      <path className="sw-chart-line disk" d="M42 74 L94 74 L146 74 L198 73 L250 73 L302 73 L354 72 L406 72 L458 72 L510 72 L562 71 L614 71 L665 71"/>
     </svg><p className="sw-chart-footnote">Illustrative historical series. Production charts require persisted telemetry from the monitoring agent.</p>
    </section>
    <section className="sw-card sw-health-card"><div className="sw-card-head"><div><h2>Services & processes</h2><p>Critical services running on this server</p></div><button className="sw-link" onClick={()=>setTab("Servers")}>Details <ChevronRight size={13}/></button></div>
     {[{n:"School API",d:"HTTP · Port 8080",s:"Operational",v:"42 ms"},{n:"PostgreSQL",d:"Database · Port 5432",s:"Warning",v:"184 ms"},{n:"Cloudflared",d:"Secure tunnel connector",s:"Connected",v:"2 connections"},{n:"Monitoring Agent",d:"Telemetry collector",s:"Operational",v:"v1.6.0"},{n:"Redis",d:"Cache service · Port 6379",s:"Healthy",v:"3 ms"}].map(x=><div className="sw-service-row" key={x.n}><div className="sw-service-icon"><Server size={14}/></div><div className="sw-service-name"><b>{x.n}</b><small>{x.d}</small></div><span className="sw-service-value">{x.v}</span><Status value={x.s}/></div>)}
    </section>
   </div>
   <div className="sw-monitor-grid sw-lower-grid">
    <section className="sw-card"><div className="sw-card-head"><div><h2>Connectivity & Cloudflare</h2><p>Path from this school to the central platform</p></div><Status value="Connected"/></div>
     <div className="sw-connection-flow"><div><Network size={16}/><b>Internet</b><small>Reachable</small></div><i/><div><Cloud size={16}/><b>Cloudflare</b><small>Tunnel active</small></div><i/><div><Server size={16}/><b>School API</b><small>Responding</small></div></div>
     <div className="sw-connection-stats"><Metric label="DNS resolution" value="Healthy · 21 ms"/><Metric label="Packet loss" value="0.0%"/><Metric label="Tunnel uptime" value="99.98%"/><Metric label="Last heartbeat" value="42 sec ago"/></div>
     <button className="sw-link sw-inline-link" onClick={()=>setTab("Connectivity")}>Open diagnostics <ChevronRight size={13}/></button>
    </section>
    <section className="sw-card"><div className="sw-card-head"><div><h2>Server information</h2><p>System identity and runtime details</p></div><button className="sw-link" onClick={()=>setTab("Servers")}>Full details <ChevronRight size={13}/></button></div>
     <div className="sw-info-list"><div><span>Hostname</span><b>amal-prod-01</b></div><div><span>Operating system</span><b>Ubuntu Server 24.04 LTS</b></div><div><span>Kernel</span><b>6.8.0-48-generic</b></div><div><span>Private IP</span><b>10.20.2.10</b></div><div><span>Uptime</span><b>42 days, 6 hours</b></div><div><span>Last reboot</span><b>29 Sep 2026 · 12:04</b></div></div>
    </section>
   </div>
   <div className="sw-monitor-grid sw-lower-grid">
    <section className="sw-card"><div className="sw-card-head"><div><h2>Active incidents</h2><p>Problems and events requiring attention</p></div><button className="sw-link" onClick={()=>setTab("Errors")}>All incidents <ChevronRight size={13}/></button></div>
     {errors.filter(e=>!e.ack).map(e=><div className="sw-incident-row" key={e.id}><span className="sw-incident-mark"><AlertTriangle size={14}/></span><div><b>{e.title}</b><small>{e.id} · {e.time}</small></div><Status value={e.severity}/></div>)}{errors.every(e=>e.ack)&&<p className="sw-note">No active incidents.</p>}
    </section>
    <section className="sw-card"><div className="sw-card-head"><div><h2>Live event stream</h2><p>Latest agent, service and infrastructure events</p></div><button className="sw-link" onClick={()=>setTab("Logs")}>Open logs <ChevronRight size={13}/></button></div>
     {logs.map(x=><div className="sw-event-row" key={x.time}><code>{x.time}</code><span className={"sw-level "+x.level.toLowerCase()}>{x.level}</span><div><b>{x.source}</b><small>{x.message}</small></div></div>)}
    </section>
   </div>
   <section className="sw-card sw-monitor-footer"><div><div className="sw-card-head"><div><h2>Monitoring agent</h2><p>School-side telemetry collector</p></div><Status value="Connected"/></div><div className="sw-agent-facts"><span>Agent ID <b>agt-alamal-01</b></span><span>Version <b>1.6.0</b></span><span>Heartbeat <b>Every 60 seconds</b></span><span>Last check-in <b>42 seconds ago</b></span></div></div><button className="sw-primary" onClick={runHeartbeat} disabled={testing}><Activity size={14}/>{testing?"Running test…":"Test heartbeat"}</button>{testAt&&<p className="sw-note">Demo test simulated at {testAt}. No real signal was sent to the school server.</p>}</section>
  </>}
  {tab==="Installation"&&<section className="sw-card"><div className="sw-card-head"><div><h2>Installation record</h2><p>Technician assignment, checklist and handover</p></div><Status value="Completed"/></div><div className="sw-detail-grid"><Metric label="Installation ID" value="INS-2026-014"/><Metric label="Assigned technician" value="Youssef Amrani"/><Metric label="Started" value="02 Nov 2026"/><Metric label="Completed" value="04 Nov 2026"/><Metric label="Checklist" value="12 / 12 complete"/><Metric label="Handover" value="Accepted"/></div><p className="sw-note">Installation progress is a work-order record. It does not guarantee current server health or connectivity.</p><button className="sw-primary" onClick={()=>notify("Installation detail editor is a planned workflow in this demo.")}>Manage installation</button></section>}
  {tab==="Servers"&&<section className="sw-card"><div className="sw-card-head"><div><h2>Registered servers</h2><p>Machines assigned to this school</p></div><button onClick={()=>notify("Server registration is available from the global Servers inventory.")}>Register server</button></div><div className="sw-server-card"><Server size={21}/><div><b>{school} — Production</b><small>{serverId} · Ubuntu Server 24.04 LTS · 10.20.2.10</small></div><Status value="Healthy"/></div><div className="sw-detail-grid"><Metric label="CPU" value="32%"/><Metric label="Memory" value="58%"/><Metric label="Disk" value="64%"/><Metric label="Uptime" value="42 days"/></div><button className="sw-primary" onClick={runHeartbeat} disabled={testing}><Activity size={14}/>{testing?"Sending test…":"Send test heartbeat"}</button>{testAt&&<p className="sw-note">Manual demo test simulated at {testAt}; real heartbeat data was not changed.</p>}</section>}
  {tab==="Cloudflare"&&<section className="sw-card"><div className="sw-card-head"><div><h2>Cloudflare Tunnel</h2><p>Secure outbound connection from the school server</p></div><Status value="Connected"/></div><div className="sw-detail-grid"><Metric label="Tunnel name" value="school-al-amal-prod"/><Metric label="Tunnel ID" value="cf-tun-7a21••••"/><Metric label="Connector" value="cloudflared 2026.10"/><Metric label="Published hostname" value="api.alamal-school.example"/><Metric label="Origin service" value="http://localhost:8080"/><Metric label="Last connection" value="1 minute ago"/></div><p className="sw-note">Tunnel credentials are never displayed in this workspace. Configure access policies and application authentication separately.</p></section>}
  {tab==="Connectivity"&&<section className="sw-card"><div className="sw-card-head"><div><h2>Connectivity diagnostics</h2><p>School-side and remote reachability checks</p></div><Status value="Online"/></div>{[{n:"Internet reachability",s:"Healthy",d:"HTTPS probe succeeded"},{n:"DNS resolution",s:"Healthy",d:"School API hostname resolved"},{n:"Cloudflare Tunnel",s:"Connected",d:"Connector reports active connections"},{n:"School API",s:"Healthy",d:"Remote health endpoint responded"}].map(x=><div className="sw-component" key={x.n}><div><b>{x.n}</b><small>{x.d}</small></div><Status value={x.s}/></div>)}<p className="sw-note">Sample diagnostic results only; no network probes are executed.</p></section>}
  {tab==="Monitoring"&&<section className="sw-card"><div className="sw-card-head"><div><h2>Monitoring & heartbeats</h2><p>Resource telemetry and agent check-ins</p></div><Status value="Connected"/></div><div className="sw-detail-grid"><Metric label="Last heartbeat" value="1 min ago"/><Metric label="Expected interval" value="60 seconds"/><Metric label="Agent version" value="1.6.0"/><Metric label="Missed intervals" value="0"/><Metric label="CPU" value="32%"/><Metric label="Memory" value="58%"/></div><button className="sw-primary" onClick={runHeartbeat} disabled={testing}><Activity size={14}/>{testing?"Sending test…":"Send test heartbeat"}</button>{testAt&&<p className="sw-note">Test simulated at {testAt}. No real signal was sent.</p>}</section>}
  {tab==="Errors"&&<section className="sw-card"><div className="sw-card-head"><div><h2>Errors & incidents</h2><p>Issues requiring operator attention</p></div><Status value={errors.filter(e=>!e.ack&&e.severity!=="Info").length+" open"}/></div>{errors.map(e=><div className="sw-error" key={e.id}><div><b>{e.title}</b><small>{e.id} · {e.time} · {e.detail}</small></div><Status value={e.severity}/>{!e.ack&&<button onClick={()=>acknowledge(e.id)}>Acknowledge</button>}{e.ack&&<span className="sw-ack">Acknowledged</span>}</div>)}</section>}
  {tab==="Logs"&&<section className="sw-card"><div className="sw-card-head"><div><h2>Technical logs</h2><p>Recent events from school services and monitoring</p></div><button onClick={()=>notify("Demo log export prepared locally (no file generated).")}>Export logs</button></div><div className="sw-log-tools"><label><Search size={14}/><input value={logQuery} onChange={e=>setLogQuery(e.target.value)} placeholder="Search source or message"/></label><select value={logLevel} onChange={e=>setLogLevel(e.target.value)}><option>All</option><option>INFO</option><option>WARN</option><option>ERROR</option></select><button onClick={()=>{setLogQuery("");setLogLevel("All");}}><Filter size={13}/>Reset</button></div><div className="sw-logs">{filteredLogs.map(x=><div key={x.time}><code>{x.time}</code><span className={"sw-level "+x.level.toLowerCase()}>{x.level}</span><b>{x.source}</b><span>{x.message}</span></div>)}{filteredLogs.length===0&&<p className="sw-note">No log entries match this filter.</p>}</div></section>}
 </div>;
}
