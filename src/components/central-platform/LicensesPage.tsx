import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowDownToLine, CalendarDays, Check, ChevronDown, Clock3,
  Copy, Edit3, FileClock, Filter, KeyRound, MoreHorizontal, Plus, RefreshCw,
  Search, Server, Shield, ShieldCheck, X
} from "lucide-react";
import "./licenses-page.css";

type LicenseStatus = "Pending" | "Active" | "Suspended" | "Expired" | "Deactivated";
type GraceStatus = "Not Used" | "Not Started" | "Active" | "Expiring Soon" | "Expired" | "Not Applicable";
type License = {
  id: string; school: string; code: string; server: string; status: LicenseStatus;
  type: string; plan: string; issued: string; activated: string; expires: string;
  lastValidation: string; nextValidation: string; grace: GraceStatus; graceDays: number | null;
  features: string[]; version: string; issuedBy: string; updated: string; notes: string;
  history: { title: string; at: string; detail: string; tone: "success" | "warning" | "danger" | "neutral" }[];
};
type Panel =
  | { mode: "details" | "edit" | "renew" | "reassign" | "suspend" | "reactivate" | "deactivate"; id: string }
  | { mode: "issue" | "draft" }
  | null;

const seed: License[] = [
  { id:"LIC-ATS-001",school:"Atlas International School",code:"ATS-001",server:"SRV-ATS-001",status:"Active",type:"Standard",plan:"Professional",issued:"2026-01-12",activated:"2026-01-12",expires:"2027-01-11",lastValidation:"5 min ago",nextValidation:"In approximately 10 hours",grace:"Not Used",graceDays:30,features:["Core Platform","Advanced Reporting"],version:"2.1",issuedBy:"Platform Admin",updated:"2026-11-08 14:20",notes:"Primary production installation.",history:[{title:"License validated successfully",at:"2026-11-09 09:13",detail:"Central validation acknowledged. Safe metadata only.",tone:"success"},{title:"License issued",at:"2026-01-12 10:30",detail:"Issued for the registered Atlas installation.",tone:"neutral"}]},
  { id:"LIC-AAS-002",school:"Al Amal School",code:"AAS-002",server:"SRV-AAS-002",status:"Active",type:"Standard",plan:"Basic",issued:"2025-11-01",activated:"2025-11-01",expires:"2026-11-30",lastValidation:"3 days ago",nextValidation:"Not available",grace:"Active",graceDays:27,features:["Core Platform"],version:"2.1",issuedBy:"Platform Admin",updated:"2026-11-06 08:10",notes:"Temporary connectivity interruption in demo history.",history:[{title:"Offline grace period started",at:"2026-11-06 08:10",detail:"Central Platform temporarily unreachable; local grace countdown shown for demonstration.",tone:"warning"},{title:"License validated successfully",at:"2026-11-03 08:10",detail:"Last successful central validation.",tone:"success"}]},
  { id:"LIC-FAC-003",school:"Future Academy",code:"FAC-003",server:"SRV-FAC-003",status:"Suspended",type:"Standard",plan:"Enterprise",issued:"2026-02-15",activated:"2026-02-15",expires:"2027-02-14",lastValidation:"2 min ago",nextValidation:"In approximately 10 hours",grace:"Not Applicable",graceDays:null,features:["Core Platform","Advanced Reporting","Additional Modules"],version:"2.1",issuedBy:"Platform Admin",updated:"2026-11-08 16:45",notes:"Suspension is an authorization state, not a connectivity signal.",history:[{title:"License suspended",at:"2026-11-08 16:45",detail:"Administrative suspension recorded in local demonstration state.",tone:"danger"},{title:"License validated successfully",at:"2026-11-09 09:16",detail:"Validation metadata does not override suspension status.",tone:"success"}]},
  { id:"LIC-ISS-004",school:"Ibn Sina School",code:"ISS-004",server:"SRV-ISS-004",status:"Pending",type:"Standard",plan:"Professional",issued:"2026-11-01",activated:"—",expires:"2027-10-31",lastValidation:"Never",nextValidation:"Not available",grace:"Not Started",graceDays:null,features:["Core Platform","Advanced Reporting"],version:"2.1",issuedBy:"Platform Admin",updated:"2026-11-01 11:00",notes:"Awaiting a real licensing service before activation.",history:[{title:"License issued — pending activation",at:"2026-11-01 11:00",detail:"Draft metadata only; no signed license was generated.",tone:"warning"}]},
  { id:"LIC-HZS-005",school:"Horizon School",code:"HZS-005",server:"SRV-HZS-005",status:"Expired",type:"Standard",plan:"Basic",issued:"2025-10-01",activated:"2025-10-01",expires:"2026-10-31",lastValidation:"35 days ago",nextValidation:"Not available",grace:"Expired",graceDays:0,features:["Core Platform"],version:"2.1",issuedBy:"Platform Admin",updated:"2026-10-31 00:00",notes:"Historical license record retained.",history:[{title:"License validity expired",at:"2026-10-31 00:00",detail:"Validity end date reached. School data is not deleted.",tone:"danger"},{title:"License validated successfully",at:"2026-10-05 08:00",detail:"Last successful validation in the demo timeline.",tone:"success"}]}
];
const schools = [
  {name:"Atlas International School",code:"ATS-001",server:"SRV-ATS-001"},
  {name:"Al Amal School",code:"AAS-002",server:"SRV-AAS-002"},
  {name:"Future Academy",code:"FAC-003",server:"SRV-FAC-003"},
  {name:"Ibn Sina School",code:"ISS-004",server:"SRV-ISS-004"},
  {name:"Horizon School",code:"HZS-005",server:"SRV-HZS-005"}
];
const moneyDate = (value:string) => value === "—" ? value : new Date(value+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const statusTone = (status:string) => status.toLowerCase().replaceAll(" ","-");
const graceTone = (value:GraceStatus) => value==="Active"||value==="Expiring Soon"?"warning":value==="Expired"?"danger":value==="Not Used"?"success":"neutral";
const csv = (value:unknown) => '"' + String(value ?? "").replaceAll('"','""') + '"';

export function LicensesPage() {
  const [licenses,setLicenses] = useState<License[]>(seed);
  const [query,setQuery] = useState("");
  const [status,setStatus] = useState("All");
  const [expiration,setExpiration] = useState("All");
  const [schoolFilter,setSchoolFilter] = useState("All");
  const [sort,setSort] = useState("issued");
  const [page,setPage] = useState(1);
  const [menu,setMenu] = useState("");
  const [panel,setPanel] = useState<Panel>(null);
  const [toast,setToast] = useState("");
  const [confirm,setConfirm] = useState<{id:string;action:"suspend"|"reactivate"|"deactivate"|"renew"|"reassign"}|null>(null);
  const [reason,setReason] = useState("");
  const [draft,setDraft] = useState({school:"",server:"",type:"Standard",plan:"Professional",issued:"2026-11-09",expires:"2027-11-08",grace:"30",features:["Core Platform"] as string[],notes:""});
  const [searchSchool,setSearchSchool] = useState("");
  const [dirty,setDirty] = useState(false);
  const pageSize = 5;
  const notify = (message:string) => { setToast(message); window.setTimeout(()=>setToast(""),3200); };
  const filtered = useMemo(()=>licenses.filter(l=>{
    const q=query.trim().toLowerCase();
    const matchesSearch=!q||[l.id,l.school,l.code,l.server].some(v=>v.toLowerCase().includes(q));
    const matchesStatus=status==="All"||l.status===status;
    const days=(new Date(l.expires+"T00:00:00").getTime()-new Date("2026-11-09T00:00:00").getTime())/86400000;
    const matchesExpiry=expiration==="All"||(expiration==="Expired"&&l.status==="Expired")||(expiration==="Expiring Soon"&&l.status!=="Expired"&&days>=0&&days<=30);
    return matchesSearch&&matchesStatus&&matchesExpiry&&(schoolFilter==="All"||l.code===schoolFilter);
  }).sort((a,b)=>sort==="issued"?b.issued.localeCompare(a.issued):sort==="expires"?a.expires.localeCompare(b.expires):a.lastValidation.localeCompare(b.lastValidation)),[licenses,query,status,expiration,schoolFilter,sort]);
  const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize));
  const rows=filtered.slice((page-1)*pageSize,page*pageSize);
  const active=licenses.filter(l=>l.status==="Active").length;
  const pending=licenses.filter(l=>l.status==="Pending").length;
  const suspended=licenses.filter(l=>l.status==="Suspended").length;
  const expired=licenses.filter(l=>l.status==="Expired").length;
  const activeLicense=panel&&"id" in panel?licenses.find(l=>l.id===panel.id):undefined;
  const clearFilters=()=>{setQuery("");setStatus("All");setExpiration("All");setSchoolFilter("All");setPage(1);};
  const filterMetric=(value:string)=>{setStatus(value);setExpiration("All");setPage(1);};
  const openIssue=()=>{setDraft({school:"",server:"",type:"Standard",plan:"Professional",issued:"2026-11-09",expires:"2027-11-08",grace:"30",features:["Core Platform"],notes:""});setDirty(false);setSearchSchool("");setPanel({mode:"issue"});};
  const updateLicense=(id:string,patch:Partial<License>,eventTitle:string,detail:string)=>{
    setLicenses(prev=>prev.map(l=>l.id===id?{...l,...patch,updated:"2026-11-09 09:30",history:[{title:eventTitle,at:"2026-11-09 09:30",detail,tone:"warning"},...l.history]}:l));
    setPanel(null);setConfirm(null);setReason("");notify(eventTitle+" · local demo only. No remote license operation was performed.");
  };
  const exportCsv=()=>{
    const header=["License ID","School","School Code","Assigned Server","License Status","Issued Date","Expiration Date","Last Validation","Offline Grace","License Type","Plan"];
    const lines=filtered.map(l=>[l.id,l.school,l.code,l.server,l.status,l.issued,l.expires,l.lastValidation,l.grace,l.type,l.plan].map(csv).join(","));
    const blob=new Blob(["\uFEFF"+[header.map(csv).join(","),...lines].join("\r\n")],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="licenses-demo-export.csv";a.click();URL.revokeObjectURL(url);
    notify("Filtered demo license CSV exported.");
  };
  const saveDraft=()=>{
    if(!draft.school||!draft.server||!draft.issued||!draft.expires||draft.expires<=draft.issued){notify("Complete the required fields and use an expiration date after the issue date.");return;}
    const school=schools.find(s=>s.code===draft.school);if(!school||school.server!==draft.server){notify("Select a registered server belonging to the selected school.");return;}
    if(licenses.some(l=>l.code===school.code&&l.status!=="Deactivated")){notify("This school already has a non-deactivated license in the demo registry.");return;}
    const id="LIC-"+school.code.slice(0,3)+"-"+String(licenses.length+1).padStart(3,"0");
    const item:License={id,school:school.name,code:school.code,server:school.server,status:"Pending",type:draft.type,plan:draft.plan,issued:draft.issued,activated:"—",expires:draft.expires,lastValidation:"Never",nextValidation:"Not available",grace:"Not Started",graceDays:null,features:draft.features,version:"2.1",issuedBy:"Current administrator (demo)",updated:"2026-11-09 09:30",notes:draft.notes,history:[{title:"License saved as draft",at:"2026-11-09 09:30",detail:"Local metadata only. No cryptographic signature or operational license was generated.",tone:"warning"}]};
    setLicenses(prev=>[item,...prev]);setPanel(null);setDirty(false);notify("Draft saved locally. No signed license was generated.");
  };
  const confirmAction=()=>{
    if(!confirm)return;
    const l=licenses.find(x=>x.id===confirm.id);if(!l)return;
    if(confirm.action==="suspend")updateLicense(l.id,{status:"Suspended"},"License suspended",reason||"Administrative suspension in local demo.");
    if(confirm.action==="reactivate")updateLicense(l.id,{status:"Active"},"License reactivated",reason||"Administrative reactivation in local demo.");
    if(confirm.action==="deactivate")updateLicense(l.id,{status:"Deactivated"},"License deactivated",reason||"Administrative deactivation in local demo. Historical record retained.");
    if(confirm.action==="renew"){
      const next=new Date(l.expires+"T00:00:00");next.setFullYear(next.getFullYear()+1);
      updateLicense(l.id,{status:l.status==="Expired"?"Pending":l.status,issued:"2026-11-09",expires:next.toISOString().slice(0,10)},"Renewal requested","Local validity metadata extended for demonstration; no signed license was issued.");
    }
    if(confirm.action==="reassign")notify("Server reassignment requires the connected licensing service. No binding was changed.");
  };
  const detailAction=(action:"suspend"|"reactivate"|"deactivate"|"renew"|"reassign",id:string)=>{setReason("");setConfirm({action,id});setPanel(null);};
  const submitIssue=(e:React.FormEvent)=>{e.preventDefault();saveDraft();};
  const openEdit=(l:License)=>{setDraft({school:l.code,server:l.server,type:l.type,plan:l.plan,issued:l.issued,expires:l.expires,grace:"30",features:l.features,notes:l.notes});setDirty(false);setPanel({mode:"edit",id:l.id});};
  const saveEdit=()=>{if(!activeLicense)return;if(!draft.issued||!draft.expires||draft.expires<=draft.issued){notify("Expiration must be after the issue date.");return;}updateLicense(activeLicense.id,{type:draft.type,plan:draft.plan,issued:draft.issued,expires:draft.expires,features:draft.features,notes:draft.notes},"License metadata updated","Metadata changed locally by the current administrator.");};
  const timeline=activeLicense?.history||[];
  const copyId=async(id:string)=>{try{await navigator.clipboard.writeText(id);notify("License ID copied.");}catch{notify("Clipboard access is unavailable.");}};
  const distribution=[{label:"Issued (pre-activation)",value:4,tone:"issued"},{label:"Pending activation",value:4,tone:"pending"},{label:"Active",value:112,tone:"active"},{label:"Suspended / Expired",value:8,tone:"suspended"},{label:"Deactivated",value:0,tone:"deactivated"}];

  return <div className="licenses-page">
    <header className="licenses-header"><div><span className="licenses-eyebrow">SUBSCRIPTIONS &amp; BILLING / AUTHORIZATION</span><h1>Licenses</h1><p>Manage school software licenses, activation, validation, expiration, and authorization status.</p><span className="licenses-demo-tag"><i/>DEMO DATA · LOCAL SESSION</span></div><div className="licenses-header-actions"><button className="lic-btn lic-secondary" onClick={exportCsv}><ArrowDownToLine size={15}/>Export</button><button className="lic-btn lic-primary" onClick={openIssue}><Plus size={16}/>Issue License</button></div></header>

    <section className="licenses-metrics" aria-label="License summary metrics">
      <button onClick={()=>{clearFilters();}}><small>Total Licenses <em>DEMO</em></small><strong>128</strong><span>Illustrative registry total</span></button>
      <button onClick={()=>filterMetric("Active")}><small>Active</small><strong>112</strong><span>Authorization state</span></button>
      <button onClick={()=>filterMetric("Pending")}><small>Pending</small><strong>4</strong><span>Awaiting activation</span></button>
      <button onClick={()=>filterMetric("Suspended")}><small>Suspended</small><strong>6</strong><span>Authorization restricted</span></button>
      <button onClick={()=>{setStatus("All");setExpiration("Expiring Soon");setPage(1);}}><small>Expiring Soon</small><strong>4</strong><span>Illustrative 30-day window</span></button>
      <button onClick={()=>filterMetric("Expired")}><small>Expired</small><strong>2</strong><span>Validity period ended</span></button>
    </section>

    <section className="licenses-lifecycle"><div className="lic-section-title"><div><h2>License Lifecycle</h2><p>Illustrative distribution across 128 licenses. Issued is a pre-activation stage, not a separate license status.</p></div><span>DEMO DATA</span></div><div className="lic-lifecycle-bar">{distribution.map(d=><i key={d.tone} className={"lic-segment "+d.tone} style={{width:(d.value/128*100)+"%"}} title={d.label+": "+d.value}/>)}</div><div className="lic-lifecycle-legend">{distribution.map(d=><div key={d.tone}><i className={d.tone}/><span>{d.label}</span><b>{d.value}</b><small>{(d.value/128*100).toFixed(1)}%</small></div>)}</div></section>

    <section className="licenses-table-section"><div className="lic-section-title"><div><h2>All Licenses</h2><p>Inspect issued licenses and their registered school installation bindings.</p></div><span>{filtered.length} of {licenses.length} local records</span></div>
      <div className="licenses-toolbar"><label className="lic-search"><Search size={15}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Search license ID, school, code, or server..." aria-label="Search licenses"/></label>
        <label className="lic-filter"><span>Status</span><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option>All</option>{["Pending","Active","Suspended","Expired","Deactivated"].map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="lic-filter"><span>Expiration</span><select value={expiration} onChange={e=>{setExpiration(e.target.value);setPage(1);}}><option>All</option><option>Expiring Soon</option><option>Expired</option></select></label>
        <label className="lic-filter"><span>School</span><select value={schoolFilter} onChange={e=>{setSchoolFilter(e.target.value);setPage(1);}}><option value="All">All schools</option>{schools.map(s=><option key={s.code} value={s.code}>{s.name}</option>)}</select></label>
        <label className="lic-filter"><span>Sort by</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="issued">Issued date</option><option value="expires">Expiration date</option><option value="validation">Last validation</option></select></label>
        <button className="lic-clear" disabled={status==="All"&&expiration==="All"&&schoolFilter==="All"&&!query} onClick={clearFilters}><X size={13}/>Clear filters</button>
      </div>
      <div className="lic-table-wrap"><table className="lic-table"><thead><tr><th>License ID</th><th>School</th><th>School Code</th><th>Assigned Server</th><th>License Status</th><th>Issued Date</th><th>Expiration Date</th><th>Last Validation</th><th>Offline Grace</th><th/></tr></thead><tbody>
        {rows.map(l=><tr key={l.id} onClick={()=>setPanel({mode:"details",id:l.id})} tabIndex={0} onKeyDown={e=>{if(e.key==="Enter")setPanel({mode:"details",id:l.id});}}>
          <td><button className="lic-id" onClick={e=>{e.stopPropagation();setPanel({mode:"details",id:l.id});}}>{l.id}</button></td><td><b>{l.school}</b></td><td className="lic-mono">{l.code}</td><td className="lic-mono">{l.server}</td><td><span className={"lic-status "+statusTone(l.status)}><i/>{l.status}</span></td><td className="lic-mono">{moneyDate(l.issued)}</td><td className="lic-mono">{moneyDate(l.expires)}</td><td>{l.lastValidation}</td><td><span className={"lic-grace "+graceTone(l.grace)}>{l.grace}{l.graceDays!==null&&l.grace==="Active"?" · "+l.graceDays+"d":""}</span></td>
          <td><div className="lic-menu-wrap"><button className="lic-icon-btn" aria-label={"Actions for "+l.id} aria-expanded={menu===l.id} onClick={e=>{e.stopPropagation();setMenu(menu===l.id?"":l.id);}}><MoreHorizontal size={17}/></button>{menu===l.id&&<div className="lic-menu" onClick={e=>e.stopPropagation()}><button onClick={()=>{setMenu("");setPanel({mode:"details",id:l.id});}}>View details</button><button onClick={()=>{setMenu("");openEdit(l);}}>Edit metadata</button>{l.status==="Active"&&<><button onClick={()=>detailAction("renew",l.id)}>Renew license</button><button onClick={()=>detailAction("reassign",l.id)}>Reassign server</button><button onClick={()=>detailAction("suspend",l.id)}>Suspend license</button></>}{(l.status==="Suspended")&&<><button onClick={()=>detailAction("reactivate",l.id)}>Reactivate license</button><button onClick={()=>detailAction("renew",l.id)}>Renew license</button></>}{l.status==="Pending"&&<button onClick={()=>detailAction("deactivate",l.id)}>Deactivate</button>}{l.status==="Expired"&&<button onClick={()=>detailAction("renew",l.id)}>Renew license</button>}{l.status!=="Deactivated"&&l.status!=="Pending"&&<button className="danger" onClick={()=>detailAction("deactivate",l.id)}>Deactivate license</button>}</div>}</div></td>
        </tr>)}
        {!rows.length&&<tr><td colSpan={10}><div className="lic-empty"><Filter size={20}/><b>No licenses match these filters</b><span>Try another search or clear the active filters.</span><button onClick={clearFilters}>Clear filters</button></div></td></tr>}
      </tbody></table></div>
      <footer className="lic-table-footer"><span>Showing {rows.length?((page-1)*pageSize+1):0}–{Math.min(page*pageSize,filtered.length)} of {filtered.length} · Local demonstration records</span><div><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page} of {pageCount}</span><button disabled={page>=pageCount} onClick={()=>setPage(p=>p+1)}>Next</button></div></footer>
    </section>

    {panel&&<div className="lic-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setPanel(null);}}><aside className="lic-drawer" role="dialog" aria-modal="true" aria-label="License panel">
      <div className="lic-drawer-head"><div><span className="licenses-eyebrow">{panel.mode==="details"?"LICENSE RECORD":panel.mode==="issue"?"NEW LICENSE":panel.mode==="edit"?"EDIT METADATA":"LICENSE ACTION"}</span><h2>{panel.mode==="details"?activeLicense?.id:panel.mode==="issue"?"Issue License":panel.mode==="edit"?"Edit License Metadata":panel.mode==="renew"?"Renew License":panel.mode==="reassign"?"Reassign Server":panel.mode==="suspend"?"Suspend License":panel.mode==="reactivate"?"Reactivate License":"Deactivate License"}</h2><p>{panel.mode==="details"?"Identity, validity, grace-period and validation history.":"Changes in this panel are local demonstration metadata only."}</p></div><button className="lic-icon-btn" onClick={()=>setPanel(null)} aria-label="Close panel"><X size={18}/></button></div>
      {panel.mode==="details"&&activeLicense&&<div className="lic-drawer-body">
        <div className="lic-detail-top"><span className={"lic-status "+statusTone(activeLicense.status)}><i/>{activeLicense.status}</span><button onClick={()=>copyId(activeLicense.id)}><Copy size={13}/>Copy ID</button></div>
        <section className="lic-detail-section"><h3>License identity</h3><dl><div><dt>License ID</dt><dd className="lic-mono">{activeLicense.id}</dd></div><div><dt>Assigned school</dt><dd>{activeLicense.school}</dd></div><div><dt>School code</dt><dd className="lic-mono">{activeLicense.code}</dd></div><div><dt>Assigned server</dt><dd className="lic-mono">{activeLicense.server}</dd></div><div><dt>License type</dt><dd>{activeLicense.type}</dd></div><div><dt>Plan / package</dt><dd>{activeLicense.plan}</dd></div></dl></section>
        <section className="lic-detail-section"><h3>License validity</h3><dl><div><dt>Issued date</dt><dd>{moneyDate(activeLicense.issued)}</dd></div><div><dt>Activation date</dt><dd>{activeLicense.activated==="—"?"Not activated":moneyDate(activeLicense.activated)}</dd></div><div><dt>Expiration date</dt><dd>{moneyDate(activeLicense.expires)}</dd></div><div><dt>Last successful validation</dt><dd>{activeLicense.lastValidation==="Never"?"Never validated":activeLicense.lastValidation}</dd></div><div><dt>Next expected validation</dt><dd>{activeLicense.nextValidation}</dd></div></dl></section>
        <section className="lic-detail-section"><h3>Offline grace period <span>30 days</span></h3><div className="lic-grace-summary"><b>{activeLicense.graceDays===null?activeLicense.grace:activeLicense.graceDays+" days remaining"}</b><span>{activeLicense.graceDays===null?"No active countdown":(30-activeLicense.graceDays)+" of 30 days elapsed"}</span>{activeLicense.graceDays!==null&&<div><i style={{width:((30-activeLicense.graceDays)/30*100)+"%"}}/></div>}</div><p className="lic-explainer">When the Central Platform cannot be reached, the local application may continue operating during the configured offline grace period. If the grace period expires without successful validation, the application enters restricted mode. This does not delete school data or independently change license lifecycle status.</p></section>
        <section className="lic-detail-section"><h3>Validation &amp; administrative history</h3>{timeline.length?<div className="lic-timeline">{timeline.map((ev,i)=><div key={i} className={"lic-event "+ev.tone}><i/><div><b>{ev.title}</b><time>{ev.at}</time><p>{ev.detail}</p></div></div>)}</div>:<p className="lic-muted">No validation history is available.</p>}</section>
        <section className="lic-detail-section"><h3>License configuration</h3><dl><div><dt>Licensed features</dt><dd>{activeLicense.features.join(", ")||"—"}</dd></div><div><dt>Server binding</dt><dd className="lic-mono">{activeLicense.server}</dd></div><div><dt>License version</dt><dd>{activeLicense.version}</dd></div><div><dt>Issued by</dt><dd>{activeLicense.issuedBy}</dd></div><div><dt>Last updated</dt><dd className="lic-mono">{activeLicense.updated}</dd></div></dl><p className="lic-explainer">Signing keys, validation secrets and private cryptographic material are never displayed.</p></section>
        <p className="lic-domain-note">Subscription, connectivity and server health are separate state domains. This license view does not infer or change them.</p>
      </div>}
      {(panel.mode==="issue"||panel.mode==="edit")&&<form className="lic-drawer-body lic-form" onSubmit={submitIssue}>
        <div className="lic-demo-notice"><ShieldCheck size={16}/><span><b>LOCAL DEMO ONLY</b> — no real signed license, cryptographic validation, remote binding, or authorization change will occur.</span></div>
        <section><h3>01 / License assignment</h3>{panel.mode==="issue"&&<><label>Search registered school<input value={searchSchool} onChange={e=>setSearchSchool(e.target.value)} placeholder="School name or code"/></label><div className="lic-school-options">{schools.filter(s=>(s.name+" "+s.code).toLowerCase().includes(searchSchool.toLowerCase())).map(s=><button type="button" className={draft.school===s.code?"selected":""} key={s.code} onClick={()=>{setDraft(d=>({...d,school:s.code,server:s.server}));setDirty(true);}}><span><b>{s.name}</b><small>{s.code} · {s.server}</small></span>{draft.school===s.code&&<Check size={14}/>}</button>)}</div></>}
        {panel.mode==="edit"&&<div className="lic-readonly-binding"><span>Assigned school</span><b>{activeLicense?.school}</b><span>Registered server</span><b>{activeLicense?.server}</b></div>}
        <label>Registered server<select value={draft.server} disabled={panel.mode==="edit"} onChange={e=>{setDraft(d=>({...d,server:e.target.value}));setDirty(true);}}><option value="">Select server</option>{schools.filter(s=>s.code===draft.school).map(s=><option value={s.server} key={s.server}>{s.server}</option>)}</select></label>
        <div className="lic-form-grid"><label>License type<select value={draft.type} onChange={e=>{setDraft(d=>({...d,type:e.target.value}));setDirty(true);}}><option>Standard</option><option>Enterprise</option><option>Trial</option></select></label><label>Plan / feature package<select value={draft.plan} onChange={e=>{setDraft(d=>({...d,plan:e.target.value}));setDirty(true);}}><option>Basic</option><option>Professional</option><option>Enterprise</option></select></label></div></section>
        <section><h3>02 / Validity</h3><div className="lic-form-grid"><label>Issue date<input type="date" value={draft.issued} onChange={e=>{setDraft(d=>({...d,issued:e.target.value}));setDirty(true);}}/></label><label>Expiration date<input type="date" value={draft.expires} onChange={e=>{setDraft(d=>({...d,expires:e.target.value}));setDirty(true);}}/></label></div><label>Offline grace period<select value={draft.grace} onChange={e=>{setDraft(d=>({...d,grace:e.target.value}));setDirty(true);}}><option value="30">30 days (default)</option></select></label><p className="lic-form-help">Validity: {draft.issued&&draft.expires&&draft.expires>draft.issued?Math.ceil((new Date(draft.expires).getTime()-new Date(draft.issued).getTime())/86400000)+" days":"Enter a valid date range."}</p></section>
        <section><h3>03 / Licensed features</h3>{["Core Platform","Advanced Reporting","Additional Modules"].map(f=><label className="lic-check" key={f}><input type="checkbox" checked={draft.features.includes(f)} onChange={e=>{setDraft(d=>({...d,features:e.target.checked?[...d.features,f]:d.features.filter(x=>x!==f)}));setDirty(true);}}/><span>{f}</span></label>)}<p className="lic-form-help">Feature entitlements are illustrative and must be enforced by the connected plan and licensing service.</p></section>
        <section><h3>04 / Administrative information</h3><label>Issued by<input value="Current administrator (demo)" disabled/></label><label>Internal notes<textarea rows={3} value={draft.notes} onChange={e=>{setDraft(d=>({...d,notes:e.target.value}));setDirty(true);}} placeholder="Authorized internal note"/></label></section>
      </form>}
      {panel.mode==="renew"&&<div className="lic-drawer-body"><div className="lic-action-callout"><RefreshCw size={18}/><div><b>Renewal is local metadata only</b><p>The demo can illustrate a one-year validity extension. It cannot generate or deliver a newly signed license.</p></div></div></div>}
      {panel.mode==="reassign"&&<div className="lic-drawer-body"><div className="lic-action-callout"><Server size={18}/><div><b>Server reassignment unavailable</b><p>A registered-server binding must be changed by the connected licensing service. No server assignment is changed in this demo.</p></div></div></div>}
      {(panel.mode==="suspend"||panel.mode==="reactivate"||panel.mode==="deactivate")&&<div className="lic-drawer-body"><div className={"lic-action-callout "+(panel.mode==="suspend"||panel.mode==="deactivate"?"danger":"warning")}><AlertTriangle size={18}/><div><b>{panel.mode==="suspend"?"Authorization will be suspended":panel.mode==="reactivate"?"Authorization will be marked active":"License will be deactivated"}</b><p>{panel.mode==="suspend"?"Suspending this license changes the school's authorization state. It does not delete the school's database or application data.":panel.mode==="deactivate"?"The license will remain in the historical record and will not be permanently deleted. School data is not deleted.":"This changes the local demonstration lifecycle state only. No remote authorization update is sent."}</p></div></div><label>Administrative reason<textarea rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason for this administrative action"/></label></div>}
      <div className="lic-drawer-footer">{(panel.mode==="issue"||panel.mode==="edit")?<><button className="lic-btn lic-secondary" type="button" onClick={()=>setPanel(null)}>Cancel</button><button className="lic-btn lic-secondary" type="button" onClick={()=>notify("Draft state is local only; use Save as Draft to add it to this demo list.")}>Save as Draft</button><button className="lic-btn lic-primary" type="button" onClick={panel.mode==="issue"?saveDraft:saveEdit}>{panel.mode==="issue"?"Issue License":"Save metadata"}</button></>:panel.mode==="details"?<button className="lic-btn lic-secondary" onClick={()=>setPanel(null)}>Close</button>:<><button className="lic-btn lic-secondary" onClick={()=>setPanel(null)}>Cancel</button><button className="lic-btn lic-primary" onClick={confirmAction}>{panel.mode==="renew"?"Confirm demo renewal":panel.mode==="reassign"?"Close":panel.mode==="suspend"?"Confirm suspension":panel.mode==="reactivate"?"Confirm reactivation":"Confirm deactivation"}</button></>}</div>
    </aside></div>}

    {confirm&&<div className="lic-confirm-backdrop"><div className="lic-confirm" role="dialog" aria-modal="true"><h2>{confirm.action==="suspend"?"Suspend license?":confirm.action==="reactivate"?"Reactivate license?":confirm.action==="deactivate"?"Deactivate license?":confirm.action==="renew"?"Renew license?":"Reassign server?"}</h2><p>{confirm.action==="suspend"?"Suspension changes authorization but never deletes the school's data.":confirm.action==="deactivate"?"The record and history are retained; this action is not deletion.":confirm.action==="renew"?"A local demo validity date will be extended. No signed license is created.":confirm.action==="reassign"?"The connected licensing service is unavailable; no server binding will be changed.":"This changes only the local demo status, not remote authorization."}</p><label>Reason (optional)<textarea rows={2} value={reason} onChange={e=>setReason(e.target.value)}/></label><div><button className="lic-btn lic-secondary" onClick={()=>setConfirm(null)}>Cancel</button><button className="lic-btn lic-primary" onClick={confirmAction}>Confirm</button></div></div></div>}
    {toast&&<div className="lic-toast" role="status"><Check size={14}/>{toast}</div>}
  </div>;
}
