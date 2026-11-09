import { useMemo, useState } from "react";
import {
  AlertCircle, ArrowDownToLine, CalendarDays, Check, CreditCard, Eye,
  MoreHorizontal, Pencil, Plus, RefreshCw, Search, X, ArrowLeftRight,
  Ban, Building2, Receipt, Info
} from "lucide-react";
import "./subscriptions-page.css";

type Status = "Draft" | "Active" | "Trial" | "Past Due" | "Cancelled" | "Expired";
type Cycle = "Monthly" | "Annual";
type Plan = { id: string; name: string; description: string; status: "Active" | "Archived"; billing: Cycle[]; };
type Event = { id: string; title: string; at: string; description: string; reference?: string };
type Subscription = {
  id: string; school: string; code: string; planId: string; cycle: Cycle; status: Status;
  start: string; renewal: string; amount: number | null; currency: string; billingContact: string;
  created: string; trialEnd?: string; cancelledAt?: string; history: Event[];
};
type Panel =
  | { mode: "details" | "payments"; id: string }
  | { mode: "create" | "edit"; id?: string }
  | { mode: "change" | "renew"; id: string }
  | null;
type FormState = {
  schoolCode: string; planId: string; cycle: Cycle; amount: string; currency: string;
  start: string; renewal: string; trial: boolean; trialEnd: string; status: "Draft" | "Trial" | "Active";
};
const plans: Plan[] = [
  { id: "basic", name: "Basic", description: "Core school management package.", status: "Active", billing: ["Monthly", "Annual"] },
  { id: "professional", name: "Professional", description: "Expanded capabilities for growing schools.", status: "Active", billing: ["Monthly", "Annual"] },
  { id: "enterprise", name: "Enterprise", description: "Advanced configurable package.", status: "Active", billing: ["Monthly", "Annual"] },
];
const schools = [
  { name: "Atlas International School", code: "ATS-001" },
  { name: "Al Amal School", code: "AAS-002" },
  { name: "Future Academy", code: "FAC-003" },
  { name: "Ibn Sina School", code: "ISS-004" },
  { name: "Horizon School", code: "HZS-005" },
  ...Array.from({ length: 107 }, (_, i) => ({ name: "Demo School " + String(i + 6).padStart(3, "0"), code: "DMS-" + String(i + 6).padStart(3, "0") })),
];
const today = "2026-11-09";
const event = (id: string, title: string, at: string, description: string, reference?: string): Event => ({ id, title, at, description, reference });
const seed: Subscription[] = [
  { id: "SUB-2026-001", school: "Atlas International School", code: "ATS-001", planId: "professional", cycle: "Annual", status: "Active", start: "2026-01-15", renewal: "2027-01-15", amount: 9900, currency: "MAD", billingContact: "billing@atlas.example", created: "2026-01-10", history: [event("e1","Subscription created","2026-01-10 09:20","Annual Professional subscription created.","REF-SUB-001"),event("e2","Subscription activated","2026-01-15 10:00","Subscription entered the active lifecycle.","REF-ACT-001")] },
  { id: "SUB-2026-002", school: "Al Amal School", code: "AAS-002", planId: "basic", cycle: "Monthly", status: "Active", start: "2026-10-01", renewal: "2026-12-01", amount: 490, currency: "MAD", billingContact: "accounts@alamal.example", created: "2026-09-28", history: [event("e3","Subscription created","2026-09-28 14:15","Monthly Basic subscription created.","REF-SUB-002")] },
  { id: "SUB-2026-003", school: "Future Academy", code: "FAC-003", planId: "enterprise", cycle: "Annual", status: "Past Due", start: "2025-11-01", renewal: "2026-11-01", amount: 24900, currency: "MAD", billingContact: "finance@future.example", created: "2025-10-25", history: [event("e4","Subscription created","2025-10-25 11:00","Annual Enterprise subscription created.","REF-SUB-003"),event("e5","Payment failed","2026-11-02 08:45","A billing obligation is marked overdue in this demo record.","REF-INV-003")] },
  { id: "SUB-2026-004", school: "Ibn Sina School", code: "ISS-004", planId: "professional", cycle: "Monthly", status: "Trial", start: "2026-11-01", renewal: "2026-12-01", amount: 990, currency: "MAD", billingContact: "contact@ibnsina.example", created: "2026-10-29", trialEnd: "2026-11-15", history: [event("e6","Trial started","2026-11-01 09:00","Professional trial period started.","REF-TRIAL-004")] },
  { id: "SUB-2026-005", school: "Horizon School", code: "HZS-005", planId: "basic", cycle: "Annual", status: "Cancelled", start: "2025-06-01", renewal: "2026-06-01", amount: 4900, currency: "MAD", billingContact: "office@horizon.example", created: "2025-05-24", cancelledAt: "2026-04-20", history: [event("e7","Subscription created","2025-05-24 12:00","Annual Basic subscription created.","REF-SUB-005"),event("e8","Subscription cancelled","2026-04-20 16:30","Cancellation recorded; school data and license state are managed separately.","REF-CANCEL-005")] },
];
const makeGenerated = (): Subscription[] => {
  const statusSequence: Status[] = [
    ...Array.from({length:94},()=> "Active" as Status),
    ...Array.from({length:4},()=> "Trial" as Status),
    ...Array.from({length:6},()=> "Past Due" as Status),
    ...Array.from({length:3},()=> "Cancelled" as Status),
  ];
  return statusSequence.map((status,i) => {
    const n=i+6, code="DMS-"+String(n).padStart(3,"0"), id="SUB-2026-"+String(n).padStart(3,"0");
    const cycle: Cycle = n%3===0 ? "Monthly" : "Annual";
    const startYear = status==="Cancelled" ? 2025 : 2026;
    const start = startYear+"-"+String((n%12)+1).padStart(2,"0")+"-01";
    const renewal = status==="Cancelled" ? "2026-06-01" : status==="Past Due" ? "2026-11-01" : "2026-12-"+String((n%20)+1).padStart(2,"0");
    return {
      id, school:"Demo School "+String(n).padStart(3,"0"), code, planId:["basic","professional","enterprise"][n%3],
      cycle, status, start, renewal, amount:cycle==="Monthly" ? [490,990,2490][n%3] : [4900,9900,24900][n%3],
      currency:"MAD", billingContact:"—", created:start, trialEnd:status==="Trial"?"2026-11-20":undefined,
      cancelledAt:status==="Cancelled"?"2026-05-12":undefined,
      history:[event("g"+n,status==="Trial"?"Trial started":"Subscription created",start+" 09:00","Demonstration subscription record generated for the overview dataset.",id)]
    };
  });
};
const initialRecords = [...seed, ...makeGenerated()];
const initialForm: FormState = { schoolCode:"", planId:"", cycle:"Annual", amount:"", currency:"MAD", start:today, renewal:"", trial:false, trialEnd:"", status:"Draft" };
const money = (amount: number | null, currency: string) => amount === null ? "—" : amount.toLocaleString("en-US")+" "+currency;
const dateLabel = (value?: string) => value ? new Date(value+"T12:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const slugPlan = (id: string) => plans.find(p=>p.id===id)?.name ?? "Unknown plan";
const csvCell = (value: string | number | null) => '"'+String(value ?? "").replace(/"/g,'""')+'"';

export function SubscriptionsPage() {
  const [records,setRecords] = useState<Subscription[]>(initialRecords);
  const [query,setQuery] = useState("");
  const [statusFilter,setStatusFilter] = useState("All");
  const [planFilter,setPlanFilter] = useState("All");
  const [cycleFilter,setCycleFilter] = useState("All");
  const [renewalFrom,setRenewalFrom] = useState("");
  const [renewalTo,setRenewalTo] = useState("");
  const [panel,setPanel] = useState<Panel>(null);
  const [form,setForm] = useState<FormState>(initialForm);
  const [formErrors,setFormErrors] = useState<Record<string,string>>({});
  const [menuId,setMenuId] = useState<string|null>(null);
  const [cancelTarget,setCancelTarget] = useState<Subscription|null>(null);
  const [changePlan,setChangePlan] = useState("");
  const [changeEffectiveDate,setChangeEffectiveDate] = useState(today);
  const [renewDate,setRenewDate] = useState("");
  const [toast,setToast] = useState("");
  const [page,setPage] = useState(1);
  const [busy,setBusy] = useState(false);
  const [formDirty,setFormDirty] = useState(false);
  const [discardConfirm,setDiscardConfirm] = useState(false);
  const pageSize=10;

  const visible=useMemo(()=>records.filter(r=>
    (r.school.toLowerCase().includes(query.toLowerCase()) || r.code.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase())) &&
    (statusFilter==="All" || r.status===statusFilter) &&
    (planFilter==="All" || r.planId===planFilter) &&
    (cycleFilter==="All" || r.cycle===cycleFilter) &&
    (!renewalFrom || (!!r.renewal && r.renewal>=renewalFrom)) &&
    (!renewalTo || (!!r.renewal && r.renewal<=renewalTo))
  ),[records,query,statusFilter,planFilter,cycleFilter,renewalFrom,renewalTo]);
  const pages=Math.max(1,Math.ceil(visible.length/pageSize));
  const rows=visible.slice((page-1)*pageSize,page*pageSize);
  const counts=useMemo(()=>records.reduce((a,r)=>({...a,total:a.total+1,[r.status]:a[r.status]+1}),{total:0,Draft:0,Active:0,Trial:0,"Past Due":0,Cancelled:0,Expired:0} as Record<string,number>),[records]);
  const monthly=records.filter(r=>r.cycle==="Monthly").length;
  const annual=records.filter(r=>r.cycle==="Annual").length;
  const upcoming=records.filter(r=>r.status!=="Cancelled"&&r.status!=="Expired"&&r.renewal>=today&&r.renewal<="2026-12-09").length;
  const attention=records.filter(r=>r.status==="Past Due").length;
  const selected=panel && "id" in panel ? records.find(r=>r.id===panel.id) : undefined;
  const filtered=!!(query||statusFilter!=="All"||planFilter!=="All"||cycleFilter!=="All"||renewalFrom||renewalTo);
  const notify=(message:string)=>{setToast(message);window.setTimeout(()=>setToast(""),3500);};
  const resetFilters=()=>{setQuery("");setStatusFilter("All");setPlanFilter("All");setCycleFilter("All");setRenewalFrom("");setRenewalTo("");setPage(1);};
  const openCreate=()=>{setForm({...initialForm});setFormErrors({});setFormDirty(false);setPanel({mode:"create"});};
  const openEdit=(r:Subscription)=>{setForm({schoolCode:r.code,planId:r.planId,cycle:r.cycle,amount:r.amount===null?"":String(r.amount),currency:r.currency,start:r.start,renewal:r.renewal,trial:r.status==="Trial",trialEnd:r.trialEnd||"",status:r.status==="Draft"?"Draft":r.status==="Trial"?"Trial":"Active"});setFormErrors({});setFormDirty(false);setPanel({mode:"edit",id:r.id});};
  const closePanel=()=>{if((panel?.mode==="create"||panel?.mode==="edit")&&formDirty){setDiscardConfirm(true);return;}setPanel(null);};
  const setField=<K extends keyof FormState,>(key:K,value:FormState[K])=>{setForm(current=>({...current,[key]:value}));setFormDirty(true);};
  const validate=(draftOnly:boolean)=>{
    const errors:Record<string,string>={};
    if(!form.schoolCode)errors.schoolCode="Select a registered school.";
    if(!form.planId)errors.planId="Select a plan.";
    if(!form.start)errors.start="Start date is required.";
    if(!draftOnly){
      const plan=plans.find(p=>p.id===form.planId);
      if(!plan?.billing.includes(form.cycle))errors.cycle="This plan does not support the selected billing cycle.";
      if(form.amount===""||!Number.isFinite(Number(form.amount))||Number(form.amount)<0)errors.amount="Enter a valid non-negative amount.";
      if(!form.renewal)errors.renewal="Next renewal date is required.";
      else if(form.renewal<=form.start)errors.renewal="Renewal date must be after the start date.";
      if(form.trial&&!form.trialEnd)errors.trialEnd="Trial end date is required.";
      else if(form.trial&&form.trialEnd<=form.start)errors.trialEnd="Trial end date must be after the start date.";
    }
    setFormErrors(errors);return Object.keys(errors).length===0;
  };
  const saveForm=(draftOnly:boolean)=>{
    if(busy||!validate(draftOnly))return;
    setBusy(true);
    const status:Status=current?current.status:draftOnly?"Draft":form.trial?"Trial":form.status;
    const school=schools.find(s=>s.code===form.schoolCode)!;
    const id=panel?.mode==="edit"&&"id" in panel?panel.id:"SUB-DEMO-"+String(Date.now()).slice(-6);
    const current=records.find(r=>r.id===id);
    const next:Subscription={
      id,school:school.name,code:school.code,planId:form.planId,cycle:form.cycle,status,
      start:form.start,renewal:form.renewal,amount:form.amount===""?null:Number(form.amount),currency:form.currency,
      billingContact:current?.billingContact||"—",created:current?.created||today,
      trialEnd:form.trial?form.trialEnd:undefined,cancelledAt:current?.cancelledAt,
      history:[...(current?.history||[]),event("local-"+Date.now(),current?"Subscription configuration updated":"Subscription created",today+" 12:00",current?"Plan: "+slugPlan(current.planId)+" → "+slugPlan(form.planId)+"; billing cycle: "+current.cycle+" → "+form.cycle+"; amount: "+money(current.amount,current.currency)+" → "+money(form.amount===""?null:Number(form.amount),form.currency)+". Updated in local demo state; previous payment records are unchanged.":"Subscription created in local demo state.",id)]
    };
    setRecords(current?records.map(r=>r.id===id?next:r):[next,...records]);
    setBusy(false);setFormDirty(false);setPanel(null);notify(current?"Demo subscription changes saved locally.":"Demo subscription created locally.");
  };
  const exportRows=()=>{
    const header=["School Name","School Code","Subscription ID","Plan","Billing Cycle","Status","Start Date","Renewal Date","Amount","Currency"];
    const csv=[header,...visible.map(r=>[r.school,r.code,r.id,slugPlan(r.planId),r.cycle,r.status,r.start,r.status==="Cancelled"||r.status==="Expired"?"":r.renewal,r.amount,r.currency])].map(row=>row.map(csvCell).join(",")).join("\r\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);
    const link=document.createElement("a");link.href=url;link.download="subscriptions-demo-export.csv";document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
    notify("CSV export generated for "+visible.length+" filtered records.");
  };
  const updateRecord=(id:string,patch:Partial<Subscription>,historyEvent:Event)=>{
    setRecords(current=>current.map(r=>r.id===id?{...r,...patch,history:[...r.history,historyEvent]}:r));
  };
  const confirmCancel=()=>{
    if(!cancelTarget)return;
    updateRecord(cancelTarget.id,{status:"Cancelled",cancelledAt:today},event("cancel-"+Date.now(),"Subscription cancelled",today+" 12:00","Cancellation recorded in local demo state. License authorization and school data were not changed.",cancelTarget.id));
    setCancelTarget(null);setPanel(null);notify("Subscription marked Cancelled in local demo state. No license action was performed.");
  };
  const doChangePlan=()=>{
    if(!selected||!changePlan||changePlan===selected.planId)return;
    const old=slugPlan(selected.planId),next=slugPlan(changePlan);
    updateRecord(selected.id,{planId:changePlan},event("plan-"+Date.now(),"Plan changed",today+" 12:00","Plan changed from "+old+" to "+next+" effective "+changeEffectiveDate+" in local demo state. Prior history and payments remain unchanged.",selected.id));
    setPanel(null);notify("Plan change recorded locally; no payment or license state was changed.");
  };
  const doRenew=()=>{
    if(!selected||!renewDate||renewDate<=selected.renewal)return;
    updateRecord(selected.id,{renewal:renewDate},event("renew-"+Date.now(),"Renewal period updated (demo)",today+" 12:00","Proposed renewal date updated in local demo state only. No renewal processing, payment confirmation, or license action occurred.",selected.id));
    setPanel(null);notify("Renewal date updated in local demo state only; payment and status were not changed.");
  };
  const openMenuAction=(action:string,r:Subscription)=>{
    setMenuId(null);
    if(action==="View Details")setPanel({mode:"details",id:r.id});
    if(action==="Edit Subscription")openEdit(r);
    if(action==="Change Plan"){setChangePlan(r.planId);setChangeEffectiveDate(today);setPanel({mode:"change",id:r.id});}
    if(action==="View Payment History")setPanel({mode:"payments",id:r.id});
    if(action==="Renew Subscription"){setRenewDate(r.renewal);setPanel({mode:"renew",id:r.id});}
    if(action==="Cancel Subscription")setCancelTarget(r);
  };
  const planFor=(id:string)=>plans.find(p=>p.id===id);
  const activePlans=plans.filter(p=>p.status==="Active");
  const subscriptionTotal=records.length;

  return <div className="subs-page">
    <header className="subs-header">
      <div><div className="subs-eyebrow">CENTRAL PLATFORM <span>/</span> SUBSCRIPTIONS & BILLING</div><h1>Subscriptions</h1><p>Manage school subscriptions, billing periods, renewals, and subscription status.</p></div>
      <div className="subs-header-actions"><button className="subs-button secondary" onClick={exportRows}><ArrowDownToLine size={15}/>Export</button><button className="subs-button primary" onClick={openCreate}><Plus size={16}/>Create Subscription</button></div>
    </header>
    <div className="subs-demo"><span className="subs-demo-dot"/><b>DEMO DATA</b><span>112 fictional subscription records · amounts and billing contacts are illustrative · changes remain in this browser session only</span></div>

    <section className="subs-metrics" aria-label="Subscription lifecycle summary">
      {[
        ["Total Subscriptions",counts.total,"All lifecycle states","neutral"],
        ["Active",counts.Active,"Commercially active","success"],
        ["Trial",counts.Trial,"Within a trial period","info"],
        ["Past Due",counts["Past Due"],"Billing attention required","warning"],
        ["Cancelled",counts.Cancelled,"Historical agreements","muted"],
      ].map(([label,value,hint,tone])=><div className="subs-metric" key={String(label)}><span>{label}</span><strong>{Number(value).toLocaleString("en-US")}</strong><small><i className={"subs-metric-dot "+tone}/>{hint}</small></div>)}
    </section>
    <div className="subs-metric-extra"><span>Other lifecycle states</span><b>Draft <strong>{counts.Draft}</strong></b><b>Expired <strong>{counts.Expired}</strong></b><small>Included in Total Subscriptions</small></div>

    <section className="subs-overview">
      <div className="subs-overview-head"><h2>Subscription Overview</h2><span>DEMO DATA · DERIVED FROM RECORDS</span></div>
      <div className="subs-overview-grid">
        <div><span>Monthly Subscriptions</span><strong>{monthly}</strong><small>Monthly billing cycle</small></div>
        <div><span>Annual Subscriptions</span><strong>{annual}</strong><small>Annual billing cycle</small></div>
        <div><span>Upcoming Renewals</span><strong>{upcoming}</strong><small>Next 30 days · configured demo window</small></div>
        <div><span>Requiring Attention</span><strong className="attention">{attention}</strong><small>Past Due lifecycle status</small></div>
      </div>
    </section>

    <section className="subs-table-section">
      <div className="subs-section-heading"><div><h2>All Subscriptions</h2><p>View and manage commercial subscriptions assigned to registered schools.</p></div><span className="subs-record-count">{visible.length} of {subscriptionTotal} records</span></div>
      <div className="subs-toolbar">
        <label className="subs-search"><Search size={15}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Search by school name, school code, or subscription ID..." aria-label="Search subscriptions"/></label>
        <label className="subs-filter"><span>Status</span><select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}><option>All</option>{["Draft","Active","Trial","Past Due","Cancelled","Expired"].map(s=><option key={s}>{s}</option>)}</select></label>
        <label className="subs-filter"><span>Plan</span><select value={planFilter} onChange={e=>{setPlanFilter(e.target.value);setPage(1);}}><option value="All">All plans</option>{plans.map(p=><option key={p.id} value={p.id}>{p.name}{p.status==="Archived"?" · Archived":""}</option>)}</select></label>
        <label className="subs-filter"><span>Cycle</span><select value={cycleFilter} onChange={e=>{setCycleFilter(e.target.value);setPage(1);}}><option>All</option><option>Monthly</option><option>Annual</option></select></label>
        <div className="subs-date-filter"><CalendarDays size={14}/><input aria-label="Renewal from date" type="date" value={renewalFrom} onChange={e=>{setRenewalFrom(e.target.value);setPage(1);}}/><span>to</span><input aria-label="Renewal to date" type="date" value={renewalTo} min={renewalFrom||undefined} onChange={e=>{setRenewalTo(e.target.value);setPage(1);}}/></div>
        <button className="subs-clear" disabled={!filtered} onClick={resetFilters}>Clear filters</button>
      </div>
      {filtered&&<div className="subs-active-filters"><span>Active filters</span>{query&&<button onClick={()=>setQuery("")}>Search: {query}<X size={12}/></button>}{statusFilter!=="All"&&<button onClick={()=>setStatusFilter("All")}>Status: {statusFilter}<X size={12}/></button>}{planFilter!=="All"&&<button onClick={()=>setPlanFilter("All")}>Plan: {slugPlan(planFilter)}<X size={12}/></button>}{cycleFilter!=="All"&&<button onClick={()=>setCycleFilter("All")}>Cycle: {cycleFilter}<X size={12}/></button>}{(renewalFrom||renewalTo)&&<button onClick={()=>{setRenewalFrom("");setRenewalTo("");}}>Renewal range<X size={12}/></button>}</div>}
      <div className="subs-table-wrap"><table className="subs-table">
        <thead><tr><th>School Name</th><th>School Code</th><th>Subscription ID</th><th>Plan</th><th>Billing Cycle</th><th>Subscription Status</th><th>Start Date</th><th>Renewal Date</th><th className="amount-col">Amount <small>DEMO</small></th><th className="actions-col">Actions</th></tr></thead>
        <tbody>{rows.map(r=><tr key={r.id}>
          <td><div className="subs-school-cell"><span className="subs-school-icon"><Building2 size={15}/></span><span>{r.school}</span></div></td>
          <td className="subs-mono">{r.code}</td><td className="subs-mono subs-id">{r.id}</td><td><span className="subs-plan-name">{slugPlan(r.planId)}</span>{planFor(r.planId)?.status==="Archived"&&<small className="subs-archived-note">Archived plan</small>}</td>
          <td><span className="subs-cycle">{r.cycle}</span></td><td><span className={"subs-status "+r.status.toLowerCase().replace(" ","-")}>{r.status}</span></td>
          <td className="subs-date">{dateLabel(r.start)}</td><td className="subs-date">{r.status==="Cancelled"||r.status==="Expired"?<span className="subs-no-renewal">No upcoming renewal</span>:dateLabel(r.renewal)}</td>
          <td className="subs-amount">{money(r.amount,r.currency)}</td>
          <td className="subs-row-actions"><button aria-label={"Actions for "+r.id} className="subs-icon-button" onClick={()=>setMenuId(menuId===r.id?null:r.id)}><MoreHorizontal size={17}/></button>{menuId===r.id&&<div className="subs-action-menu" role="menu">{["View Details","Edit Subscription","Change Plan","View Payment History",...(r.status==="Cancelled"||r.status==="Expired"?[]:["Renew Subscription","Cancel Subscription"])].map((action,i)=><button key={action} role="menuitem" onClick={()=>openMenuAction(action,r)} className={i===5?"danger":""}>{[<Eye/>,<Pencil/>,<ArrowLeftRight/>,<CreditCard/>,<RefreshCw/>,<Ban/>][i]}{action}</button>)}</div>}</td>
        </tr>)}</tbody>
      </table>
      {!rows.length&&<div className="subs-empty"><Search size={22}/><b>No subscriptions found</b><span>Try adjusting the search terms or clearing one or more filters.</span><button onClick={resetFilters}>Clear all filters</button></div>}
      </div>
      <div className="subs-pagination"><span>Showing {visible.length?((page-1)*pageSize+1):0}–{Math.min(page*pageSize,visible.length)} of {visible.length} subscriptions</span><div><button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Previous</button><span>Page {page} of {pages}</span><button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>Next</button></div></div>
    </section>

    <div className="subs-domain-note"><Info size={15}/><span><b>Domain boundaries:</b> Subscription status describes the commercial agreement only. Payment transactions, license authorization, and school connectivity are separate records and workflows.</span></div>

    {panel&&<div className={"subs-overlay "+(panel.mode==="details"||panel.mode==="payments"?"read-only":"")} onMouseDown={e=>{if(e.target===e.currentTarget)closePanel();}}>
      {panel.mode==="create"||panel.mode==="edit"?<form className="subs-drawer" onSubmit={e=>{e.preventDefault();saveForm(false);}}>
        <div className="subs-drawer-head"><div><span>SUBSCRIPTION MANAGEMENT</span><h2>{panel.mode==="create"?"Create Subscription":"Edit Subscription"}</h2><p>{panel.mode==="create"?"Assign a commercial plan to a registered school.":"Update the selected commercial agreement."}</p></div><button type="button" className="subs-icon-button" aria-label="Close form" onClick={closePanel}><X/></button></div>
        <div className="subs-local-alert"><Info size={15}/>Local demonstration workflow. No payment is charged and no license is activated.</div>
        <div className="subs-drawer-body">
          <section className="subs-form-section"><div className="subs-form-title"><b>01</b><div><h3>School</h3><p>Select an existing registered school.</p></div></div>
            <label className="subs-field">Registered school <em>*</em><select value={form.schoolCode} onChange={e=>setField("schoolCode",e.target.value)}><option value="">Select school</option>{schools.map(s=><option key={s.code} value={s.code}>{s.name} · {s.code}</option>)}</select>{formErrors.schoolCode&&<small>{formErrors.schoolCode}</small>}</label>
          </section>
          <section className="subs-form-section"><div className="subs-form-title"><b>02</b><div><h3>Plan</h3><p>New subscriptions can use Active plans only.</p></div></div>
            <label className="subs-field">Subscription plan <em>*</em><select value={form.planId} onChange={e=>{setField("planId",e.target.value);const p=plans.find(x=>x.id===e.target.value);if(p&&!p.billing.includes(form.cycle))setField("cycle",p.billing[0]);}}><option value="">Select active plan</option>{activePlans.map(p=><option key={p.id} value={p.id}>{p.name} — {p.description}</option>)}{panel.mode==="edit"&&form.planId&&!activePlans.some(p=>p.id===form.planId)&&<option value={form.planId}>{slugPlan(form.planId)} · archived (existing assignment)</option>}</select>{formErrors.planId&&<small>{formErrors.planId}</small>}{form.planId&&<span className="subs-field-hint">{planFor(form.planId)?.billing.join(" / ")} billing available · plan features and limits are defined separately.</span>}</label>
          </section>
          <section className="subs-form-section"><div className="subs-form-title"><b>03</b><div><h3>Billing configuration</h3><p>Commercial values captured on this subscription.</p></div></div>
            <div className="subs-form-grid"><label className="subs-field">Billing cycle <em>*</em><select value={form.cycle} onChange={e=>setField("cycle",e.target.value as Cycle)}><option>Monthly</option><option>Annual</option></select>{formErrors.cycle&&<small>{formErrors.cycle}</small>}</label>
              <label className="subs-field">Currency<select value={form.currency} onChange={e=>setField("currency",e.target.value)}><option>MAD</option><option>EUR</option><option>USD</option><option>GBP</option></select></label>
              <label className="subs-field">Subscription amount <em>*</em><input type="number" min="0" step="0.01" value={form.amount} onChange={e=>setField("amount",e.target.value)} placeholder="0.00"/>{formErrors.amount&&<small>{formErrors.amount}</small>}<span className="subs-field-hint">DEMO CONFIGURATION · Does not create a payment.</span></label>
              <label className="subs-field">Start date <em>*</em><input type="date" value={form.start} onChange={e=>setField("start",e.target.value)}/>{formErrors.start&&<small>{formErrors.start}</small>}</label>
              <label className="subs-field">Next renewal date <em>*</em><input type="date" min={form.start||undefined} value={form.renewal} onChange={e=>setField("renewal",e.target.value)}/>{formErrors.renewal&&<small>{formErrors.renewal}</small>}</label>
            </div>
          </section>
          <section className="subs-form-section"><div className="subs-form-title"><b>04</b><div><h3>Trial configuration</h3><p>Trial status is a subscription lifecycle state.</p></div></div>
            <label className="subs-toggle"><input type="checkbox" disabled={panel.mode==="edit"} checked={form.trial} onChange={e=>{setField("trial",e.target.checked);if(e.target.checked)setField("status","Trial");else if(form.status==="Trial")setField("status","Draft");}}/><span><b>Enable trial period</b><small>Mark this subscription as Trial when saved.</small></span></label>
            {form.trial&&<label className="subs-field">Trial end date <em>*</em><input type="date" min={form.start||undefined} value={form.trialEnd} onChange={e=>setField("trialEnd",e.target.value)}/>{formErrors.trialEnd&&<small>{formErrors.trialEnd}</small>}</label>}
          </section>
          <section className="subs-form-section"><div className="subs-form-title"><b>05</b><div><h3>Subscription status</h3><p>Status transitions are kept separate from payment and license workflows.</p></div></div>
            <label className="subs-field">Creation status<select value={form.trial?"Trial":form.status} disabled={form.trial||panel.mode==="edit"} onChange={e=>setField("status",e.target.value as FormState["status"])}><option>Draft</option><option>Active</option><option>Trial</option></select><span className="subs-field-hint">Active is a demo lifecycle selection only; it does not verify payment or activate a license.</span></label>
          </section>
        </div>
        <div className="subs-drawer-footer"><button type="button" className="subs-button secondary" onClick={closePanel}>Cancel</button>{panel.mode==="create"&&<button type="button" className="subs-button secondary" disabled={busy} onClick={()=>saveForm(true)}>Save as Draft</button>}<button type="submit" className="subs-button primary" disabled={busy}>{busy?"Saving…":panel.mode==="create"?"Create Subscription":"Save Changes"}</button></div>
      </form>:<aside className="subs-side-panel">
        <div className="subs-drawer-head"><div><span>SUBSCRIPTION RECORD</span><h2>{panel.mode==="details"?"Subscription Details":panel.mode==="payments"?"Payment History":panel.mode==="change"?"Change Plan":"Renew Subscription"}</h2><p>{selected?.school||"Selected subscription"} · {selected?.id}</p></div><button className="subs-icon-button" aria-label="Close panel" onClick={closePanel}><X/></button></div>
        {selected&&panel.mode==="details"&&<div className="subs-drawer-body">
          <div className="subs-detail-identity"><div className="subs-school-icon large"><Building2/></div><div><h3>{selected.school}</h3><span>{selected.code} · {selected.id}</span></div><span className={"subs-status "+selected.status.toLowerCase().replace(" ","-")}>{selected.status}</span></div>
          <section className="subs-detail-section"><h3>School & subscription identity</h3><dl><div><dt>School name</dt><dd>{selected.school}</dd></div><div><dt>School code</dt><dd className="subs-mono">{selected.code}</dd></div><div><dt>Subscription ID</dt><dd className="subs-mono">{selected.id}</dd></div><div><dt>Assigned plan</dt><dd>{slugPlan(selected.planId)}</dd></div><div><dt>Subscription status</dt><dd><span className={"subs-status "+selected.status.toLowerCase().replace(" ","-")}>{selected.status}</span></dd></div></dl></section>
          <section className="subs-detail-section"><h3>Billing configuration</h3><dl><div><dt>Billing cycle</dt><dd>{selected.cycle}</dd></div><div><dt>Subscription amount</dt><dd className="subs-mono">{money(selected.amount,selected.currency)}</dd></div><div><dt>Billing contact</dt><dd>{selected.billingContact||"Not available"}</dd></div><div><dt>Next billing date</dt><dd>{selected.status==="Cancelled"||selected.status==="Expired"?"—":dateLabel(selected.renewal)}</dd></div></dl></section>
          <section className="subs-detail-section"><h3>Subscription timeline</h3><dl><div><dt>Created at</dt><dd>{dateLabel(selected.created)}</dd></div><div><dt>Started at</dt><dd>{dateLabel(selected.start)}</dd></div>{selected.trialEnd&&<div><dt>Trial end date</dt><dd>{dateLabel(selected.trialEnd)}</dd></div>}<div><dt>Next renewal</dt><dd>{selected.status==="Cancelled"||selected.status==="Expired"?"No upcoming renewal":dateLabel(selected.renewal)}</dd></div>{selected.cancelledAt&&<div><dt>Cancellation date</dt><dd>{dateLabel(selected.cancelledAt)}</dd></div>}</dl></section>
          <section className="subs-detail-section"><h3>Subscription history</h3><div className="subs-timeline">{[...selected.history].reverse().map(item=><div className="subs-timeline-item" key={item.id}><i/><div><b>{item.title}</b><time>{item.at}</time><p>{item.description}</p>{item.reference&&<small>Reference: <code>{item.reference}</code></small>}</div></div>)}</div></section>
          <div className="subs-domain-note in-drawer"><Info size={14}/><span>License authorization and school connectivity are not represented by this subscription status.</span></div>
        </div>}
        {selected&&panel.mode==="payments"&&<div className="subs-drawer-body"><div className="subs-payment-context"><Receipt/><div><b>{selected.school}</b><span>{selected.id} · {slugPlan(selected.planId)}</span></div></div><div className="subs-empty payment-empty"><CreditCard size={24}/><b>No payment transactions connected</b><span>This demonstration workspace has no payment gateway or transaction records. Subscription amounts are not payment receipts.</span></div></div>}
        {selected&&panel.mode==="change"&&<div className="subs-drawer-body"><div className="subs-local-alert"><Info size={15}/>Local demo only. No proration, invoice, payment, or license action is performed.</div><section className="subs-detail-section"><h3>Current subscription</h3><dl><div><dt>Current plan</dt><dd>{slugPlan(selected.planId)}</dd></div><div><dt>Billing cycle</dt><dd>{selected.cycle}</dd></div><div><dt>Current amount</dt><dd>{money(selected.amount,selected.currency)}</dd></div><div><dt>Status</dt><dd><span className={"subs-status "+selected.status.toLowerCase().replace(" ","-")}>{selected.status}</span></dd></div></dl></section><label className="subs-field">Proposed plan<select value={changePlan} onChange={e=>setChangePlan(e.target.value)}>{plans.map(p=><option key={p.id} value={p.id} disabled={p.status!=="Active"&&p.id!==selected.planId}>{p.name}{p.status==="Archived"?" · Archived":""}</option>)}</select></label><label className="subs-field">Effective date<input type="date" value={changeEffectiveDate} onChange={e=>setChangeEffectiveDate(e.target.value)}/></label><div className="subs-change-warning"><b>Effective-date and billing review required</b><p>This demo records the plan assignment and history only. Confirm the effective date, price, and any billing adjustments through the real subscription workflow before production use. Historical payment records remain unchanged.</p></div><button className="subs-button primary full" disabled={!changePlan||changePlan===selected.planId} onClick={doChangePlan}>Record plan change</button></div>}
        {selected&&panel.mode==="renew"&&<div className="subs-drawer-body"><div className="subs-local-alert"><Info size={15}/>Demo renewal record only. No payment is collected or transaction fabricated.</div><section className="subs-detail-section"><h3>Current period</h3><dl><div><dt>Plan</dt><dd>{slugPlan(selected.planId)}</dd></div><div><dt>Billing cycle</dt><dd>{selected.cycle}</dd></div><div><dt>Current renewal date</dt><dd>{dateLabel(selected.renewal)}</dd></div><div><dt>Amount</dt><dd>{money(selected.amount,selected.currency)}</dd></div></dl></section><label className="subs-field">Proposed next renewal date<input type="date" min={selected.renewal} value={renewDate} onChange={e=>setRenewDate(e.target.value)}/></label><div className="subs-change-warning"><b>Renewal confirmation</b><p>Recording this action updates the subscription period in local demo state. It does not create a payment transaction or activate a license.</p></div><button className="subs-button primary full" disabled={!renewDate||renewDate<=selected.renewal} onClick={doRenew}>Confirm demo renewal</button></div>}
        <div className="subs-drawer-footer"><button className="subs-button secondary" onClick={closePanel}>Close</button></div>
      </aside>}
    </div>}
    {cancelTarget&&<div className="subs-confirm-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setCancelTarget(null);}}><section className="subs-confirm" role="dialog" aria-modal="true" aria-labelledby="subs-cancel-title"><div className="subs-confirm-icon"><AlertCircle/></div><h2 id="subs-cancel-title">Cancel subscription?</h2><p>You are about to cancel the commercial subscription for <b>{cancelTarget.school}</b>.</p><dl><div><dt>Subscription ID</dt><dd>{cancelTarget.id}</dd></div><div><dt>Current plan</dt><dd>{slugPlan(cancelTarget.planId)}</dd></div><div><dt>Current status</dt><dd>{cancelTarget.status}</dd></div><div><dt>Effective date</dt><dd>{dateLabel(today)}</dd></div></dl><div className="subs-confirm-note">This preserves the subscription record and its history. School data is not deleted, and no license deactivation is performed.</div><div className="subs-confirm-actions"><button className="subs-button secondary" onClick={()=>setCancelTarget(null)}>Keep subscription</button><button className="subs-button danger" onClick={confirmCancel}>Confirm cancellation</button></div></section></div>}
    {discardConfirm&&<div className="subs-confirm-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setDiscardConfirm(false);}}><section className="subs-confirm" role="dialog" aria-modal="true" aria-labelledby="subs-discard-title"><div className="subs-confirm-icon"><AlertCircle/></div><h2 id="subs-discard-title">Discard unsaved changes?</h2><p>Your subscription form contains changes that have not been saved.</p><div className="subs-confirm-actions"><button className="subs-button secondary" onClick={()=>setDiscardConfirm(false)}>Continue editing</button><button className="subs-button danger" onClick={()=>{setDiscardConfirm(false);setFormDirty(false);setPanel(null);}}>Discard changes</button></div></section></div>}
    {toast&&<div className="subs-toast" role="status"><Check size={15}/>{toast}</div>}
  </div>;
}
