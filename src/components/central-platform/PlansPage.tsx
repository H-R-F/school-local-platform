import { useMemo, useState } from "react";
import { Archive, Check, Copy, Edit3, Eye, MoreHorizontal, Plus, Search, X } from "lucide-react";
import "./plans-page.css";

type Status = "Active" | "Draft" | "Archived";
type Billing = "Monthly" | "Annual" | "Both";
type Feature = { id: string; name: string; description: string; enabled: boolean };
type Plan = {
  id: string; name: string; code: string; description: string; status: Status;
  monthly: string; annual: string; currency: string; billing: Billing; subscribers: number;
  features: Feature[]; maxUsers: string; unlimitedUsers: boolean; storage: string;
  storageUnit: string; unlimitedStorage: boolean; modules: string[]; servers: string;
  unlimitedServers: boolean; support: string; priority: string; services: string[];
  created: string; updated: string;
};
type Panel = { mode: "create" | "edit" | "details"; plan: Plan } | null;

const featureSeed: Feature[] = [
  { id: "core", name: "Core School Platform", description: "Essential school administration capabilities.", enabled: true },
  { id: "reporting", name: "Advanced Reporting", description: "Expanded reports and analytical views.", enabled: false },
  { id: "priority-support", name: "Priority Support", description: "Priority support handling.", enabled: false },
  { id: "monitoring", name: "Enhanced Monitoring", description: "Extended operational monitoring features.", enabled: false },
  { id: "dedicated-support", name: "Dedicated Support", description: "A dedicated support channel.", enabled: false },
  { id: "operations", name: "Advanced Operational Capabilities", description: "Additional administration and operational tools.", enabled: false },
  { id: "updates", name: "Priority Update Management", description: "Priority update management options.", enabled: false },
];
const makePlan = (id: string, name: string, code: string, description: string, status: Status, monthly: string, annual: string, billing: Billing, subscribers: number, enabled: string[], support: string): Plan => ({
  id, name, code, description, status, monthly, annual, currency: "MAD", billing, subscribers,
  features: featureSeed.map(f => ({ ...f, enabled: enabled.includes(f.id) })),
  maxUsers: "", unlimitedUsers: true, storage: "", storageUnit: "GB", unlimitedStorage: true,
  modules: ["Academic management", "Vie scolaire", "Finance"], servers: "1", unlimitedServers: false,
  support, priority: support === "Dedicated" ? "Dedicated queue" : support === "Priority" ? "Elevated" : "Standard",
  services: support === "Dedicated" ? ["Named support contact"] : [], created: "09 Nov 2026", updated: "09 Nov 2026",
});
const initialPlans: Plan[] = [
  makePlan("basic", "Basic", "PLAN-BASIC", "Designed for small schools.", "Active", "490", "4900", "Both", 28, ["core"], "Standard"),
  makePlan("professional", "Professional", "PLAN-PRO", "Designed for growing schools.", "Active", "990", "9900", "Both", 64, ["core","reporting","priority-support","monitoring"], "Priority"),
  makePlan("enterprise", "Enterprise", "PLAN-ENT", "Designed for larger institutions.", "Active", "2490", "24900", "Both", 20, ["core","reporting","priority-support","monitoring","dedicated-support","operations","updates"], "Dedicated"),
];
const moduleOptions = ["Academic management", "Vie scolaire", "Finance"];
const money = (value: string, currency: string) => value === "Custom" ? "Custom pricing" : value ? `${Number(value).toLocaleString("en-US")} ${currency}` : "Not configured";
const clone = (plan: Plan): Plan => ({ ...plan, features: plan.features.map(f => ({ ...f })), modules: [...plan.modules], services: [...plan.services] });

export function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [billingFilter, setBillingFilter] = useState("All");
  const [panel, setPanel] = useState<Panel>(null);
  const [draft, setDraft] = useState<Plan | null>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [toast, setToast] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<Plan | null>(null);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);

  const visible = useMemo(() => plans.filter(p =>
    (p.name.toLowerCase().includes(query.toLowerCase()) || p.code.toLowerCase().includes(query.toLowerCase())) &&
    (statusFilter === "All" || p.status === statusFilter) &&
    (billingFilter === "All" || p.billing === billingFilter)
  ), [plans, query, statusFilter, billingFilter]);
  const subscribed = plans.reduce((n,p) => n + p.subscribers, 0);
  const active = plans.filter(p => p.status === "Active").length;
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); };
  const openCreate = () => { const p = makePlan("new-"+Date.now(), "", "", "", "Draft", "", "", "Both", 0, ["core"], "Standard"); setDraft(p); setPanel({mode:"create",plan:p}); setErrors({}); setDirty(false); };
  const openEdit = (p: Plan) => { const copy=clone(p); setDraft(copy); setPanel({mode:"edit",plan:copy}); setErrors({}); setDirty(false); };
  const update = (patch: Partial<Plan>) => { setDraft(current => current ? {...current,...patch} : current); setDirty(true); };
  const closePanel = () => { if (dirty && panel?.mode !== "details") { setDiscardConfirm(true); return; } setPanel(null); setDraft(null); setErrors({}); setDirty(false); };
  const validate = (saveDraft: boolean) => {
    if (!draft) return false;
    const next: Record<string,string> = {};
    if (!draft.name.trim()) next.name = "Plan name is required.";
    if (!draft.code.trim()) next.code = "Internal plan code is required.";
    else if (plans.some(p => p.code.toLowerCase() === draft.code.trim().toLowerCase() && p.id !== draft.id)) next.code = "This plan code is already in use.";
    if (!saveDraft) {
      if (draft.billing === "Monthly" || draft.billing === "Both") if (draft.monthly === "" || (draft.monthly !== "Custom" && (!Number.isFinite(Number(draft.monthly)) || Number(draft.monthly) < 0))) next.monthly = "Enter a valid non-negative monthly price.";
      if (draft.billing === "Annual" || draft.billing === "Both") if (draft.annual === "" || (draft.annual !== "Custom" && (!Number.isFinite(Number(draft.annual)) || Number(draft.annual) < 0))) next.annual = "Enter a valid non-negative annual price.";
    }
    for (const [key,value] of [["maxUsers",draft.maxUsers],["storage",draft.storage],["servers",draft.servers]] as const) if (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) next[key] = "Use a non-negative number or select Unlimited.";
    setErrors(next); return Object.keys(next).length === 0;
  };
  const save = (asDraft: boolean) => {
    if (!draft || !validate(asDraft)) return;
    const saved = {...draft, status: asDraft ? "Draft" as Status : draft.status, code:draft.code.trim().toUpperCase(), name:draft.name.trim(), updated:"09 Nov 2026"};
    setPlans(current => current.some(p=>p.id===saved.id) ? current.map(p=>p.id===saved.id?saved:p) : [...current,saved]);
    setPanel(null); setDraft(null); setDirty(false); setErrors({});
    notify(asDraft ? "Plan saved as draft in this browser session." : "Plan configuration saved in this browser session.");
  };
  const duplicate = (p: Plan) => {
    let suffix=2, code=`${p.code}-COPY`;
    while(plans.some(x=>x.code.toLowerCase()===code.toLowerCase())) code=`${p.code}-COPY-${suffix++}`;
    const copy={...clone(p),id:"copy-"+Date.now(),name:`${p.name} (Copy)`,code,status:"Draft" as Status,subscribers:0,created:"09 Nov 2026",updated:"09 Nov 2026"};
    setDraft(copy); setPanel({mode:"create",plan:copy}); setErrors({}); setDirty(true); setMenuId(null);
  };
  const archive = (p: Plan) => {
    setPlans(current=>current.map(x=>x.id===p.id?{...x,status:"Archived"}:x));
    setConfirmArchive(null); setMenuId(null); notify(`${p.name} archived. Existing subscriptions remain unchanged.`);
  };
  const statusClass = (s: Status) => s.toLowerCase();

  return <div className="plans-page">
    <div className="plans-header">
      <div><div className="plans-eyebrow">SUBSCRIPTIONS &amp; BILLING <span> / </span> CATALOG</div><h1>Plans</h1><p>Configure subscription packages, features, limits, and billing options for schools.</p></div>
      <button className="plans-primary" onClick={openCreate}><Plus size={16}/>Create Plan</button>
    </div>
    <div className="plans-demo-note"><span className="plans-demo-dot"/> DEMO DATA <span>Figures and configuration below are fictional examples. Changes remain in this browser session.</span></div>
    <section className="plans-metrics" aria-label="Plan summary">
      <div><span>Total Plans</span><strong>{plans.length}</strong><small>Including drafts and archived</small></div>
      <div><span>Active Plans</span><strong>{active}</strong><small>Available for new assignments</small></div>
      <div><span>Schools Subscribed</span><strong>{subscribed}</strong><small>Aggregate subscription count</small></div>
      <div><span>Draft Plans</span><strong>{plans.filter(p=>p.status==="Draft").length}</strong><small>Not available for assignment</small></div>
    </section>

    <div className="plans-toolbar">
      <label className="plans-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search plans by name or code..." aria-label="Search plans by name or code"/></label>
      <label className="plans-filter"><span>Status</span><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option><option>Active</option><option>Draft</option><option>Archived</option></select></label>
      <label className="plans-filter"><span>Billing</span><select value={billingFilter} onChange={e=>setBillingFilter(e.target.value)}><option>All</option><option>Monthly</option><option>Annual</option><option>Both</option></select></label>
      <button className="plans-clear" disabled={!query && statusFilter==="All" && billingFilter==="All"} onClick={()=>{setQuery("");setStatusFilter("All");setBillingFilter("All");}}>Clear filters</button>
      <span className="plans-result-count">{visible.length} of {plans.length} plans</span>
    </div>

    <section className="plans-section">
      <div className="plans-section-head"><div><h2>Subscription plans</h2><p>Package definitions available in the central catalog.</p></div><span className="plans-demo-tag">DEMO PRICING</span></div>
      {visible.length===0 ? <div className="plans-empty"><Search size={22}/><b>No plans match these filters</b><span>Try another search or clear the selected filters.</span><button onClick={()=>{setQuery("");setStatusFilter("All");setBillingFilter("All");}}>Clear filters</button></div> :
      <div className="plans-grid">{visible.map(p=><article className={`plan-card plan-card--${p.name.toLowerCase().replace(/[^a-z]+/g,"-")}`} key={p.id}>
        <div className="plan-card-top"><div><span className="plan-code">{p.code}</span><h3>{p.name}</h3><p>{p.description || "No description provided."}</p></div><span className={`plan-status plan-status--${statusClass(p.status)}`}>{p.status}</span></div>
        <div className="plan-price-row"><div><small>Monthly</small><strong>{money(p.monthly,p.currency)}</strong></div><div><small>Annual</small><strong>{money(p.annual,p.currency)}</strong></div></div>
        <div className="plan-billing-line"><span>Billing availability</span><b>{p.billing}</b><span className="plan-subscribers"><b>{p.subscribers}</b> subscribed schools</span></div>
        <div className="plan-feature-preview"><span className="plan-subheading">INCLUDED CAPABILITIES</span>{p.features.filter(f=>f.enabled).slice(0,4).map(f=><div key={f.id}><Check size={14}/>{f.name}</div>)}{p.features.filter(f=>f.enabled).length>4&&<small>+{p.features.filter(f=>f.enabled).length-4} more capabilities</small>}</div>
        <div className="plan-card-actions"><button className="plans-secondary" onClick={()=>setPanel({mode:"details",plan:p})}><Eye size={14}/>View details</button><button className="plans-edit" onClick={()=>openEdit(p)} disabled={p.status==="Archived"}><Edit3 size={14}/>Edit</button>
          <div className="plan-menu-wrap"><button className="plan-menu-trigger" aria-label={`More actions for ${p.name}`} aria-expanded={menuId===p.id} onClick={()=>setMenuId(menuId===p.id?null:p.id)}><MoreHorizontal size={17}/></button>{menuId===p.id&&<div className="plan-menu"><button onClick={()=>{setPanel({mode:"details",plan:p});setMenuId(null);}}><Eye size={14}/>View details</button><button onClick={()=>{openEdit(p);setMenuId(null);}} disabled={p.status==="Archived"}><Edit3 size={14}/>Edit plan</button><button onClick={()=>duplicate(p)}><Copy size={14}/>Duplicate as draft</button>{p.status!=="Archived"&&<button className="plan-menu-danger" onClick={()=>setConfirmArchive(p)}><Archive size={14}/>Archive plan</button>}</div>}</div>
        </div>
      </article>)}</div>}
    </section>

    <section className="plans-section plans-compare-section">
      <div className="plans-section-head"><div><h2>Compare Plans</h2><p>Compare included capabilities across available subscription packages.</p></div><span className="plans-demo-tag">CONFIGURATION-DRIVEN</span></div>
      <div className="plans-table-scroll"><table className="plans-compare"><thead><tr><th>Feature</th>{["Basic","Professional","Enterprise"].map(name=><th key={name}>{name}</th>)}</tr></thead><tbody>
        {featureSeed.map(feature=><tr key={feature.id}><th><b>{feature.name}</b><small>{feature.description}</small></th>{["Basic","Professional","Enterprise"].map(name=>{const plan=plans.find(p=>p.name===name);const enabled=plan?.features.find(f=>f.id===feature.id)?.enabled;return <td key={name}><span className={`compare-value ${enabled?"is-included":"is-excluded"}`}>{enabled?"Included":"Not included"}</span></td>;})}</tr>)}
        <tr><th><b>Custom Limits</b><small>Configure package-specific capacity limits.</small></th>{["Basic","Professional","Enterprise"].map(name=><td key={name}><span className={`compare-value ${name==="Enterprise"?"is-configurable":"is-excluded"}`}>{name==="Enterprise"?"Configurable":"Not included"}</span></td>)}</tr>
      </tbody></table></div>
      <p className="plans-compare-foot">Comparison reflects the feature settings currently saved on each plan. Edits affect this catalog only, not existing subscription agreements.</p>
    </section>

    {panel && <div className="plans-drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closePanel();}}>
      <aside className="plans-drawer" role="dialog" aria-modal="true" aria-label={panel.mode==="details"?"Plan details":panel.mode==="edit"?"Edit plan":"Create plan"}>
        <div className="plans-drawer-head"><div><span className="plans-eyebrow">{panel.mode==="details"?"PLAN RECORD":"PLAN CONFIGURATION"}</span><h2>{panel.mode==="details"?panel.plan.name:panel.mode==="edit"?"Edit Plan":"Create Plan"}</h2><p>{panel.mode==="details"?"Definition, billing configuration and aggregate usage.": "Configure package terms. Changes do not rewrite existing subscriptions."}</p></div><button className="plans-icon-button" onClick={closePanel} aria-label="Close drawer"><X size={18}/></button></div>
        {panel.mode==="details" ? <div className="plans-drawer-body">
          <div className="plans-detail-banner"><span className={`plan-status plan-status--${statusClass(panel.plan.status)}`}>{panel.plan.status}</span><span className="plan-code">{panel.plan.code}</span></div>
          <section className="plans-form-section"><h3>Plan information</h3><p>{panel.plan.description || "No description provided."}</p><div className="plans-detail-grid"><div><small>Created</small><b>{panel.plan.created}</b></div><div><small>Last updated</small><b>{panel.plan.updated}</b></div></div></section>
          <section className="plans-form-section"><h3>Pricing &amp; billing <em>DEMO CONFIGURATION</em></h3><div className="plans-detail-grid"><div><small>Monthly</small><b>{money(panel.plan.monthly,panel.plan.currency)}</b></div><div><small>Annual</small><b>{money(panel.plan.annual,panel.plan.currency)}</b></div><div><small>Currency</small><b>{panel.plan.currency}</b></div><div><small>Billing availability</small><b>{panel.plan.billing}</b></div></div></section>
          <section className="plans-form-section"><h3>Features</h3><div className="plans-detail-list">{panel.plan.features.map(f=><div key={f.id}><span className={f.enabled?"feature-on":"feature-off"}>{f.enabled?"Included":"Not included"}</span><b>{f.name}</b></div>)}</div></section>
          <section className="plans-form-section"><h3>Limits <em>DEMO CONFIGURATION</em></h3><div className="plans-detail-grid"><div><small>Maximum users</small><b>{panel.plan.unlimitedUsers?"Unlimited":panel.plan.maxUsers||"Not specified"}</b></div><div><small>Storage</small><b>{panel.plan.unlimitedStorage?"Unlimited":panel.plan.storage?`${panel.plan.storage} ${panel.plan.storageUnit}`:"Not specified"}</b></div><div><small>Server allowance</small><b>{panel.plan.unlimitedServers?"Unlimited":panel.plan.servers||"Not specified"}</b></div><div><small>Supported modules</small><b>{panel.plan.modules.length?panel.plan.modules.join(", "):"Not specified"}</b></div></div></section>
          <section className="plans-form-section"><h3>Support</h3><div className="plans-detail-grid"><div><small>Support level</small><b>{panel.plan.support}</b></div><div><small>Support priority</small><b>{panel.plan.priority||"Not specified"}</b></div></div>{panel.plan.services.map(s=><p key={s}>{s}</p>)}</section>
          <section className="plans-usage"><span>Subscription usage</span><strong>{panel.plan.subscribers}</strong><small>Schools subscribed to this plan · aggregate demo count</small><p>Plan definition changes do not automatically alter existing subscriptions or license status.</p></section>
        </div> : <form className="plans-drawer-body plans-form" onSubmit={e=>{e.preventDefault();save(false);}}>
          <div className="plans-demo-note compact"><span className="plans-demo-dot"/> DEMO CONFIGURATION <span>Local browser-session data only.</span></div>
          <section className="plans-form-section"><h3>01 / Basic information</h3>
            <label>Plan name <input value={draft?.name||""} onChange={e=>update({name:e.target.value})} placeholder="e.g. Professional" aria-invalid={!!errors.name}/>{errors.name&&<small className="plans-error">{errors.name}</small>}</label>
            <label>Internal plan code <input value={draft?.code||""} onChange={e=>update({code:e.target.value.toUpperCase()})} placeholder="e.g. PLAN-PRO" aria-invalid={!!errors.code}/>{errors.code&&<small className="plans-error">{errors.code}</small>}</label>
            <label>Description <textarea rows={2} value={draft?.description||""} onChange={e=>update({description:e.target.value})} placeholder="Short description of this package"/></label>
            <label>Plan status <select value={draft?.status==="Archived"?"Draft":draft?.status||"Draft"} onChange={e=>update({status:e.target.value as Status})}><option>Draft</option><option>Active</option></select><small className="plans-help">Archived plans are managed through the archive action.</small></label>
          </section>
          <section className="plans-form-section"><h3>02 / Pricing &amp; billing</h3><div className="plans-form-grid">
            <label>Monthly price <div className="plans-input-affix"><input type="number" min="0" step="0.01" value={draft?.monthly==="Custom"?"":draft?.monthly||""} onChange={e=>update({monthly:e.target.value})} placeholder="0.00" disabled={draft?.billing==="Annual"}/><span>{draft?.currency}</span></div>{errors.monthly&&<small className="plans-error">{errors.monthly}</small>}</label>
            <label>Annual price <div className="plans-input-affix"><input type="number" min="0" step="0.01" value={draft?.annual==="Custom"?"":draft?.annual||""} onChange={e=>update({annual:e.target.value})} placeholder="0.00" disabled={draft?.billing==="Monthly"}/><span>{draft?.currency}</span></div>{errors.annual&&<small className="plans-error">{errors.annual}</small>}</label>
          </div>
          <div className="plans-form-grid"><label>Currency <select value={draft?.currency||"MAD"} onChange={e=>update({currency:e.target.value})}>{["MAD","EUR","USD","GBP"].map(c=><option key={c}>{c}</option>)}</select></label><label>Billing availability <select value={draft?.billing||"Both"} onChange={e=>update({billing:e.target.value as Billing})}><option>Both</option><option>Monthly</option><option>Annual</option></select></label></div>
          <small className="plans-help">Prices are fictional demonstration values, not approved commercial rates. Annual prices are never calculated automatically.</small></section>
          <section className="plans-form-section"><h3>03 / Features</h3><p className="plans-help">Toggle the capabilities included in this package. These are illustrative catalog features.</p>{draft?.features.map((f,i)=><label className="plans-feature-toggle" key={f.id}><span><b>{f.name}</b><small>{f.description}</small></span><input type="checkbox" checked={f.enabled} onChange={e=>{const features=(draft?.features ?? []).map((item,index)=>index===i?{...item,enabled:e.target.checked}:item);update({features});}}/></label>)}</section>
          <section className="plans-form-section"><h3>04 / Limits</h3><p className="plans-help">Example limits are editable configuration, not contractual entitlements.</p>
            <div className="plans-limit-row"><label>Maximum users<input type="number" min="0" value={draft?.maxUsers||""} disabled={draft?.unlimitedUsers} onChange={e=>update({maxUsers:e.target.value})} placeholder="Not specified"/></label><label className="plans-check"><input type="checkbox" checked={draft?.unlimitedUsers||false} onChange={e=>update({unlimitedUsers:e.target.checked,maxUsers:e.target.checked?"":draft?.maxUsers||""})}/>Unlimited</label></div>
            <div className="plans-limit-row"><label>Storage allowance<input type="number" min="0" value={draft?.storage||""} disabled={draft?.unlimitedStorage} onChange={e=>update({storage:e.target.value})} placeholder="Not specified"/></label><label>Unit<select value={draft?.storageUnit||"GB"} onChange={e=>update({storageUnit:e.target.value})}><option>GB</option><option>TB</option></select></label><label className="plans-check"><input type="checkbox" checked={draft?.unlimitedStorage||false} onChange={e=>update({unlimitedStorage:e.target.checked,storage:e.target.checked?"":draft?.storage||""})}/>Unlimited</label></div>
            <div className="plans-limit-row"><label>Server allowance<input type="number" min="0" value={draft?.servers||""} disabled={draft?.unlimitedServers} onChange={e=>update({servers:e.target.value})} placeholder="Not specified"/></label><label className="plans-check"><input type="checkbox" checked={draft?.unlimitedServers||false} onChange={e=>update({unlimitedServers:e.target.checked,servers:e.target.checked?"":draft?.servers||""})}/>Unlimited</label></div>
            {errors.maxUsers&&<small className="plans-error">{errors.maxUsers}</small>}{errors.storage&&<small className="plans-error">{errors.storage}</small>}{errors.servers&&<small className="plans-error">{errors.servers}</small>}
            <div className="plans-field-group"><span>Supported modules</span><div className="plans-module-list">{moduleOptions.map(m=><label key={m} className="plans-check"><input type="checkbox" checked={draft?.modules.includes(m)||false} onChange={e=>update({modules:e.target.checked?[...(draft?.modules||[]),m]:(draft?.modules||[]).filter(x=>x!==m)})}/>{m}</label>)}</div></div>
          </section>
          <section className="plans-form-section"><h3>05 / Support</h3><label>Support level <select value={draft?.support||"Standard"} onChange={e=>update({support:e.target.value})}><option>Standard</option><option>Priority</option><option>Dedicated</option></select></label>
            <label>Support priority <select value={draft?.priority||"Standard"} onChange={e=>update({priority:e.target.value})}><option>Standard</option><option>Elevated</option><option>Dedicated queue</option></select></label>
            <div className="plans-module-list">{["Named support contact","Onboarding assistance","Operational review"].map(s=><label key={s} className="plans-check"><input type="checkbox" checked={draft?.services.includes(s)||false} onChange={e=>update({services:e.target.checked?[...(draft?.services||[]),s]:(draft?.services||[]).filter(x=>x!==s)})}/>{s}</label>)}</div>
            <small className="plans-help">No response-time guarantees or contractual SLAs are configured here.</small>
          </section>
        </form>}
        {panel.mode==="details" ? <div className="plans-drawer-footer"><button className="plans-secondary" onClick={()=>setPanel(null)}>Close</button><button className="plans-primary" onClick={()=>openEdit(panel.plan)} disabled={panel.plan.status==="Archived"}><Edit3 size={14}/>Edit Plan</button></div> :
          <div className="plans-drawer-footer"><button className="plans-secondary" type="button" onClick={closePanel}>Cancel</button><div><button className="plans-secondary" type="button" onClick={()=>save(true)}>Save as Draft</button><button className="plans-primary" type="button" onClick={()=>save(false)}>Save Plan</button></div></div>}
      </aside>
    </div>}
    {confirmArchive&&<div className="plans-confirm-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setConfirmArchive(null);}}><div className="plans-confirm" role="dialog" aria-modal="true" aria-labelledby="archive-title"><div className="plans-confirm-icon"><Archive size={19}/></div><h2 id="archive-title">Archive {confirmArchive.name}?</h2><p>This plan has <b>{confirmArchive.subscribers} subscriptions</b> in this demonstration dataset. Archiving prevents new assignments where supported. Existing subscriptions and their terms remain unchanged; no subscriptions or licenses will be cancelled.</p><div><button className="plans-secondary" onClick={()=>setConfirmArchive(null)}>Cancel</button><button className="plans-danger" onClick={()=>archive(confirmArchive)}>Archive plan</button></div></div></div>}
    {discardConfirm&&<div className="plans-confirm-backdrop"><div className="plans-confirm" role="dialog" aria-modal="true"><h2>Discard unsaved changes?</h2><p>Your edits have not been saved. Close this form and discard them?</p><div><button className="plans-secondary" onClick={()=>setDiscardConfirm(false)}>Keep editing</button><button className="plans-danger" onClick={()=>{setDiscardConfirm(false);setPanel(null);setDraft(null);setDirty(false);setErrors({});}}>Discard changes</button></div></div></div>}
    {toast&&<div className="plans-toast" role="status"><Check size={15}/>{toast}</div>}
  </div>;
}
