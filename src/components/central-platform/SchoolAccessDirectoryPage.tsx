import { useMemo, useState } from "react";
import {
  Activity, ArrowUpRight, BarChart3, Clock3, Download,
  Globe2, Monitor, RefreshCw, Search, Smartphone, Users, X
} from "lucide-react";
import "./school-access-directory.css";

type SchoolTraffic = {
  id: string; school: string; code: string; city: string; requests: number;
  users: number; bandwidth: number; latency: number; errors: number;
  mobile: number; web: number; status: "Healthy" | "Degraded" | "Offline";
  hourly: number[]; endpoints: { path: string; method: string; requests: number; latency: number; errors: number }[];
};

const seed: SchoolTraffic[] = [
  {id:"TR-001",school:"Atlas International School",code:"ATS-001",city:"Rabat",requests:82450,users:1248,bandwidth:18.4,latency:142,errors:0.8,mobile:54800,web:27650,status:"Healthy",hourly:[18,22,30,42,56,62,72,86,92,78,68,75,88,94,82,76,69,58,44,36,28,22,16,12],endpoints:[{path:"/api/v1/attendance",method:"GET",requests:18320,latency:96,errors:0.3},{path:"/api/v1/grades",method:"GET",requests:14750,latency:128,errors:0.5},{path:"/api/v1/timetable",method:"GET",requests:12600,latency:84,errors:0.2},{path:"/api/v1/auth/login",method:"POST",requests:8420,latency:184,errors:1.2},{path:"/api/v1/announcements",method:"GET",requests:7100,latency:112,errors:0.4}]},
  {id:"TR-002",school:"Groupe Scolaire Al Amal",code:"AMAL-002",city:"Fès",requests:61280,users:986,bandwidth:13.2,latency:684,errors:4.8,mobile:38200,web:23080,status:"Degraded",hourly:[10,14,18,26,38,48,60,74,80,72,66,72,78,86,82,72,62,54,42,32,24,18,12,8],endpoints:[{path:"/api/v1/grades",method:"GET",requests:15200,latency:740,errors:6.2},{path:"/api/v1/attendance",method:"GET",requests:12100,latency:620,errors:4.1},{path:"/api/v1/timetable",method:"GET",requests:9800,latency:580,errors:3.4},{path:"/api/v1/auth/login",method:"POST",requests:6200,latency:810,errors:5.8}]},
  {id:"TR-003",school:"École Horizon",code:"HZN-003",city:"Casablanca",requests:48320,users:754,bandwidth:10.8,latency:118,errors:0.5,mobile:31200,web:17120,status:"Healthy",hourly:[8,10,14,20,32,42,58,72,80,76,70,74,82,90,84,78,66,52,40,30,22,16,12,8],endpoints:[{path:"/api/v1/attendance",method:"GET",requests:11200,latency:82,errors:0.2},{path:"/api/v1/timetable",method:"GET",requests:9200,latency:96,errors:0.3},{path:"/api/v1/grades",method:"GET",requests:8400,latency:132,errors:0.6},{path:"/api/v1/announcements",method:"GET",requests:6100,latency:104,errors:0.4}]},
  {id:"TR-004",school:"Collège Ibn Sina",code:"IBS-004",city:"Tanger",requests:0,users:0,bandwidth:0,latency:0,errors:0,mobile:0,web:0,status:"Offline",hourly:Array(24).fill(0),endpoints:[]},
  {id:"TR-005",school:"École Les Oliviers",code:"OLV-005",city:"Marrakech",requests:32140,users:492,bandwidth:7.6,latency:206,errors:1.4,mobile:19800,web:12340,status:"Healthy",hourly:[5,8,12,18,26,38,48,58,64,60,56,62,70,76,72,64,54,44,34,26,18,12,8,5],endpoints:[{path:"/api/v1/attendance",method:"GET",requests:7800,latency:142,errors:0.8},{path:"/api/v1/grades",method:"GET",requests:6200,latency:188,errors:1.2},{path:"/api/v1/auth/login",method:"POST",requests:4100,latency:220,errors:1.8}]},
  {id:"TR-006",school:"Académie La Plume",code:"PLM-006",city:"Agadir",requests:27860,users:418,bandwidth:6.1,latency:164,errors:0.9,mobile:16400,web:11460,status:"Healthy",hourly:[4,7,10,14,20,30,42,52,60,56,52,58,66,72,68,60,50,40,30,22,16,10,7,4],endpoints:[{path:"/api/v1/timetable",method:"GET",requests:6800,latency:104,errors:0.4},{path:"/api/v1/attendance",method:"GET",requests:6100,latency:128,errors:0.6},{path:"/api/v1/grades",method:"GET",requests:4800,latency:196,errors:1.1}]}
];

const fmt = (n:number) => new Intl.NumberFormat("en-US").format(n);
const rangeFactor = (range:string) => range==="24h"?1:range==="7d"?6.4:range==="30d"?25.8:77;
function Metric({label,value,detail,icon:Icon,trend,tone=""}:{label:string;value:string;detail:string;icon:typeof Activity;trend?:string;tone?:string}) {
  return <article className="sta-metric"><span className={"sta-metric-icon "+tone}><Icon size={18}/></span><div className="sta-metric-copy"><small>{label}</small><strong>{value}</strong><span>{trend&&<em><ArrowUpRight size={12}/>{trend}</em>}{detail}</span></div></article>;
}
function Status({value}:{value:SchoolTraffic["status"]}) {
  return <span className={"sta-status "+value.toLowerCase()}><i/>{value}</span>;
}
function TrafficChart({rows,range}:{rows:SchoolTraffic[];range:string}) {
  const points = useMemo(()=>{
    const totals=Array.from({length:24},(_,i)=>rows.reduce((sum,r)=>sum+(r.hourly[i]||0),0));
    const max=Math.max(1,...totals);
    return totals.map((v,i)=>({x:20+i*34,y:116-(v/max)*92,value:v}));
  },[rows]);
  const path=points.map((p,i)=>(i===0?"M":"L")+p.x+" "+p.y).join(" ");
  const area=path+" L 802 120 L 20 120 Z";
  return <div className="sta-chart-wrap"><svg className="sta-chart" viewBox="0 0 822 150" role="img" aria-label="Illustrative hourly request volume chart"><defs><linearGradient id="traffic-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#5571d8" stopOpacity=".22"/><stop offset="100%" stopColor="#5571d8" stopOpacity="0"/></linearGradient></defs>{[24,54,84,114].map(y=><line key={y} x1="20" x2="802" y1={y} y2={y} className="sta-gridline"/>)}<path d={area} fill="url(#traffic-fill)"/><path d={path} className="sta-line"/>{points.filter((_,i)=>i%3===0).map(p=><circle key={p.x} cx={p.x} cy={p.y} r="2.8" className="sta-point"/> )}</svg><div className="sta-chart-labels"><span>12 AM</span><span>3 AM</span><span>6 AM</span><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span><span>9 PM</span><span>Now</span></div><p className="sta-chart-caption">Aggregated request volume · {range==="24h"?"last 24 hours":range==="7d"?"last 7 days":range==="30d"?"last 30 days":"last 90 days"} · demo sample</p></div>;
}

export function SchoolAccessDirectoryPage({notify}:{notify:(message:string)=>void}) {
  const [rows]=useState<SchoolTraffic[]>(seed);
  const [query,setQuery]=useState("");
  const [range,setRange]=useState("24h");
  const [sort,setSort]=useState("requests");
  const [selected,setSelected]=useState<SchoolTraffic|null>(null);
  const [refreshing,setRefreshing]=useState(false);
  const factor=rangeFactor(range);
  const visible=useMemo(()=>rows.filter(r=>(r.school+" "+r.code+" "+r.city).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="latency"?b.latency-a.latency:sort==="errors"?b.errors-a.errors:sort==="users"?b.users-a.users:b.requests-a.requests),[rows,query,sort]);
  const totals=useMemo(()=>rows.reduce((a,r)=>({requests:a.requests+r.requests,users:a.users+r.users,bandwidth:a.bandwidth+r.bandwidth,errors:a.errors+r.errors,latency:a.latency+(r.requests?r.latency:0),active:a.active+(r.requests?1:0)}),{requests:0,users:0,bandwidth:0,errors:0,latency:0,active:0}),[rows]);
  const requests=Math.round(totals.requests*factor);
  const bandwidth=totals.bandwidth*factor;
  const averageLatency=totals.active?Math.round(totals.latency/totals.active):0;
  const successful=Math.max(0,100-totals.errors/rows.length);
  const refresh=()=>{setRefreshing(true);window.setTimeout(()=>{setRefreshing(false);notify("Demo analytics refreshed locally. No live traffic source is connected.");},450);};
  const exportCsv=()=>{
    const header="School,School Code,Requests,Unique Users,Bandwidth GB,Average Latency ms,Error Rate,Status";
    const body=visible.map(r=>[r.school,r.code,Math.round(r.requests*factor),r.users,r.bandwidth*factor,r.latency,r.errors,r.status].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");
    const blob=new Blob([header+"\n"+body],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="school-traffic-demo.csv";link.click();URL.revokeObjectURL(url);
    notify("Demo traffic CSV exported.");
  };
  return <div className="sta-page">
    <header className="sta-header"><div><span className="sta-eyebrow">ANALYTICS / SCHOOL TRAFFIC</span><h1>School Traffic & Analytics</h1><p>Understand request volume, bandwidth, active users and API performance across every school.</p></div><div className="sta-actions"><button className="sta-btn secondary" onClick={refresh} disabled={refreshing}><RefreshCw size={14}/>{refreshing?"Refreshing…":"Refresh"}</button><button className="sta-btn primary" onClick={exportCsv}><Download size={14}/>Export CSV</button></div></header>
    <div className="sta-demo"><Activity size={16}/><span><b>DEMO ANALYTICS</b> — All traffic figures are fictional sample data. No school API, Cloudflare Analytics or production metrics pipeline is connected.</span></div>
    <div className="sta-toolbar"><div className="sta-range-label">REPORTING PERIOD</div><div className="sta-range">{[{v:"24h",l:"24 hours"},{v:"7d",l:"7 days"},{v:"30d",l:"30 days"},{v:"90d",l:"90 days"}].map(o=><button key={o.v} className={range===o.v?"active":""} onClick={()=>setRange(o.v)}>{o.l}</button>)}</div><span className="sta-updated">Sample period · {range==="24h"?"Hourly":range==="7d"?"Daily":range==="30d"?"Daily":"Weekly"} aggregation</span></div>
    <section className="sta-metrics">
      <Metric label="Total API requests" value={fmt(requests)} detail="Across all registered schools" trend="+8.4%" icon={Activity}/>
      <Metric label="Unique active users" value={fmt(totals.users)} detail="Authenticated users · sample" trend="+5.2%" icon={Users} tone="violet"/>
      <Metric label="Data transferred" value={bandwidth.toFixed(1)+" GB"} detail="Combined inbound + outbound" trend="+3.1%" icon={Globe2} tone="cyan"/>
      <Metric label="Average API latency" value={averageLatency+" ms"} detail="Mean across reporting schools" icon={Clock3} tone="amber"/>
    </section>
    <div className="sta-main-grid">
      <section className="sta-panel sta-chart-panel"><div className="sta-panel-head"><div><h2>Traffic over time</h2><p>Requests received across the school fleet</p></div><span className="sta-live-label"><i/>Sample trend</span></div><TrafficChart rows={rows} range={range}/></section>
      <section className="sta-panel sta-breakdown"><div className="sta-panel-head"><div><h2>Application sources</h2><p>Request split by client type</p></div></div><div className="sta-donut-wrap"><div className="sta-donut"><div><strong>{fmt(requests)}</strong><small>requests</small></div></div><div className="sta-legend"><span><i className="mobile"/>Mobile app <b>{Math.round(rows.reduce((n,r)=>n+r.mobile,0)/totals.requests*100)}%</b></span><span><i className="web"/>Web portal <b>{Math.round(rows.reduce((n,r)=>n+r.web,0)/totals.requests*100)}%</b></span></div></div><div className="sta-success"><div><span>Successful request estimate</span><b>{successful.toFixed(1)}%</b></div><div className="sta-progress"><i style={{width:successful+"%"}}/></div><small>Derived from illustrative aggregate error rates, not actual HTTP responses.</small></div></section>
    </div>
    <section className="sta-panel sta-schools"><div className="sta-panel-head"><div><h2>Traffic by school</h2><p>Compare usage and service performance. Select a school for its traffic breakdown.</p></div><span className="sta-count">{visible.length} SCHOOLS</span></div><div className="sta-table-tools"><label><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search school or code…"/></label><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort schools"><option value="requests">Most requests</option><option value="users">Most active users</option><option value="latency">Highest latency</option><option value="errors">Highest error rate</option></select></div><div className="sta-table-wrap"><table className="sta-table"><thead><tr><th>SCHOOL</th><th>REQUESTS</th><th>ACTIVE USERS</th><th>BANDWIDTH</th><th>AVG. LATENCY</th><th>ERROR RATE</th><th>STATUS</th><th/></tr></thead><tbody>{visible.map(r=><tr key={r.id} onClick={()=>setSelected(r)}><td><div className="sta-school"><span>{r.code.slice(-2)}</span><div><b>{r.school}</b><small>{r.code} · {r.city}</small></div></div></td><td className="sta-number">{fmt(Math.round(r.requests*factor))}</td><td>{fmt(r.users)}</td><td>{(r.bandwidth*factor).toFixed(1)} GB</td><td>{r.requests?r.latency+" ms":"—"}</td><td><span className={r.errors>3?"sta-error-high":""}>{r.requests?r.errors.toFixed(1)+"%":"—"}</span></td><td><Status value={r.status}/></td><td><button className="sta-open" aria-label={"View "+r.school}><BarChart3 size={15}/></button></td></tr>)}</tbody></table>{visible.length===0&&<div className="sta-empty">No schools match this search.</div>}</div><footer className="sta-table-foot"><span>Showing {visible.length} of {rows.length} demo schools</span><span>Unique users are deduplicated identities, not request counts.</span></footer></section>
    <section className="sta-bottom-grid"><article className="sta-panel"><div className="sta-panel-head"><div><h2>HTTP response health</h2><p>Illustrative request outcome distribution</p></div></div><div className="sta-http"><div><span className="ok"/>2xx Successful <b>96.8%</b></div><div><span className="redirect"/>3xx Redirects <b>1.4%</b></div><div><span className="client"/>4xx Client errors <b>1.1%</b></div><div><span className="server"/>5xx Server errors <b>0.7%</b></div></div></article><article className="sta-panel"><div className="sta-panel-head"><div><h2>Traffic collection</h2><p>How production analytics should work</p></div></div><ol className="sta-collection"><li>School API or reverse proxy records request metadata.</li><li>Metrics are aggregated by school, route, status and time window.</li><li>Only approved operational aggregates are sent to the central metrics API.</li><li>Central Platform stores and visualizes fleet-wide traffic without collecting request bodies.</li></ol></article></section>
    {selected&&<div className="sta-overlay" onMouseDown={()=>setSelected(null)}><aside className="sta-drawer" role="dialog" aria-modal="true" aria-label="School traffic details" onMouseDown={e=>e.stopPropagation()}><header><div><small>SCHOOL TRAFFIC DETAILS</small><h2>{selected.school}</h2><p>{selected.code} · {selected.city} · {range} reporting period</p></div><button className="sta-close" onClick={()=>setSelected(null)} aria-label="Close"><X size={18}/></button></header><div className="sta-drawer-body"><div className="sta-drawer-metrics"><div><small>Requests</small><b>{fmt(Math.round(selected.requests*factor))}</b></div><div><small>Unique users</small><b>{fmt(selected.users)}</b></div><div><small>Bandwidth</small><b>{(selected.bandwidth*factor).toFixed(1)} GB</b></div><div><small>Average latency</small><b>{selected.requests?selected.latency+" ms":"—"}</b></div></div><div className="sta-detail-status"><span>School API traffic status</span><Status value={selected.status}/></div><h3>Client source split</h3><div className="sta-source-bars"><div><span><Smartphone size={14}/>Mobile app</span><b>{selected.requests?Math.round(selected.mobile/selected.requests*100):0}%</b><i><em style={{width:(selected.requests?selected.mobile/selected.requests*100:0)+"%"}}/></i></div><div><span><Monitor size={14}/>Web portal</span><b>{selected.requests?Math.round(selected.web/selected.requests*100):0}%</b><i><em style={{width:(selected.requests?selected.web/selected.requests*100:0)+"%"}}/></i></div></div><h3>Most requested API endpoints</h3>{selected.endpoints.length?<div className="sta-endpoints"><div className="sta-endpoint-head"><span>METHOD / ROUTE</span><span>REQUESTS</span><span>LATENCY</span><span>ERRORS</span></div>{selected.endpoints.map(e=><div className="sta-endpoint-row" key={e.path}><span><i>{e.method}</i><code>{e.path}</code></span><b>{fmt(Math.round(e.requests*factor))}</b><span>{e.latency} ms</span><span>{e.errors.toFixed(1)}%</span></div>)}</div>:<p className="sta-no-data">No traffic reported in this sample period.</p>}<div className="sta-privacy-note">Traffic analytics should store route templates and aggregate counts only. Do not collect passwords, request bodies, student names or sensitive query parameters.</div></div><footer><button className="sta-btn secondary" onClick={()=>setSelected(null)}>Close details</button></footer></aside></div>}
  </div>;
}
