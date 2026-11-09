import { useMemo, useRef, useState } from "react";
import {
  AlertCircle, ArrowDownToLine, CalendarDays, Check, Clock3, Download, Eye, FileText,
  Filter, Info, MoreHorizontal, Plus, RefreshCw, Search, ShieldCheck,
  Upload, Wallet, X
} from "lucide-react";
import "./payments-page.css";

type PaymentStatus = "Successful" | "Pending" | "Failed" | "Refunded";
type PaymentMethod = "Bank Transfer" | "Card" | "Cash" | "Other";
type PaymentEvent = { id: string; title: string; at: string; description: string; tone: "success" | "warning" | "danger" | "neutral" };
type Payment = {
  id: string; school: string; code: string; subscription: string; plan: string; cycle: string;
  amount: number; currency: string; method: PaymentMethod; status: PaymentStatus;
  date: string; reference: string; providerReference: string; recordedBy: string;
  notes: string[]; events: PaymentEvent[]; refunded: number; receiptAvailable: boolean;
};
type Panel = { mode: "details"; id: string } | { mode: "record" } | { mode: "verify"; id: string } | { mode: "refund"; id: string } | { mode: "note"; id: string } | { mode: "failed"; id: string } | null;
type Draft = { schoolCode: string; subscription: string; amount: string; currency: string; method: PaymentMethod; date: string; reference: string; notes: string; file: File | null };

const event = (id: string, title: string, at: string, description: string, tone: PaymentEvent["tone"] = "neutral"): PaymentEvent => ({ id, title, at, description, tone });
const seed: Payment[] = [
  { id: "PAY-2026-001", school: "Atlas International School", code: "ATS-001", subscription: "SUB-2026-001", plan: "Professional", cycle: "Annual", amount: 12000, currency: "MAD", method: "Bank Transfer", status: "Successful", date: "2026-11-06T10:42", reference: "TRF-AT-1106-01", providerReference: "BANK••••4821", recordedBy: "System import", notes: [], refunded: 0, receiptAvailable: true, events: [event("p1","Payment initiated","2026-11-06 10:31","Bank transfer record received."),event("p2","Payment confirmed","2026-11-06 10:42","Transfer confirmation recorded against the transaction.","success")] },
  { id: "PAY-2026-002", school: "Al Amal School", code: "AAS-002", subscription: "SUB-2026-002", plan: "Basic", cycle: "Monthly", amount: 800, currency: "MAD", method: "Card", status: "Successful", date: "2026-11-05T14:18", reference: "CARD-AAM-0502", providerReference: "•••• •••• •••• 2048", recordedBy: "Payment gateway", notes: [], refunded: 0, receiptAvailable: true, events: [event("p3","Payment initiated","2026-11-05 14:17","Card authorization requested."),event("p4","Payment confirmed","2026-11-05 14:18","Provider confirmation received.","success")] },
  { id: "PAY-2026-003", school: "Future Academy", code: "FAC-003", subscription: "SUB-2026-003", plan: "Enterprise", cycle: "Annual", amount: 18000, currency: "MAD", method: "Bank Transfer", status: "Pending", date: "2026-11-04T09:12", reference: "TRF-FUT-0411", providerReference: "—", recordedBy: "Finance admin", notes: [], refunded: 0, receiptAvailable: false, events: [event("p5","Payment initiated","2026-11-04 09:12","Transfer reported; confirmation has not been received.","warning")] },
  { id: "PAY-2026-004", school: "Ibn Sina School", code: "ISS-004", subscription: "SUB-2026-004", plan: "Professional", cycle: "Monthly", amount: 1500, currency: "MAD", method: "Card", status: "Failed", date: "2026-11-03T16:05", reference: "CARD-IBS-0304", providerReference: "•••• •••• •••• 9912", recordedBy: "Payment gateway", notes: [], refunded: 0, receiptAvailable: false, events: [event("p6","Payment initiated","2026-11-03 16:04","Card authorization requested."),event("p7","Payment failed","2026-11-03 16:05","Issuer declined the authorization.","danger")] },
  { id: "PAY-2026-005", school: "Horizon School", code: "HZS-005", subscription: "SUB-2026-005", plan: "Basic", cycle: "Annual", amount: 4800, currency: "MAD", method: "Bank Transfer", status: "Refunded", date: "2026-10-29T11:26", reference: "TRF-HOR-2910", providerReference: "BANK••••7305", recordedBy: "Finance admin", notes: [], refunded: 4800, receiptAvailable: true, events: [event("p8","Payment initiated","2026-10-29 10:58","Bank transfer reported."),event("p9","Payment confirmed","2026-10-29 11:26","Transfer confirmation recorded.","success"),event("p10","Refund issued","2026-11-02 15:40","Full refund confirmed; original transaction retained.","warning")] }
];
const schools = [
  { name: "Atlas International School", code: "ATS-001", subscription: "SUB-2026-001", plan: "Professional", cycle: "Annual", status: "Active" },
  { name: "Al Amal School", code: "AAS-002", subscription: "SUB-2026-002", plan: "Basic", cycle: "Monthly", status: "Active" },
  { name: "Future Academy", code: "FAC-003", subscription: "SUB-2026-003", plan: "Enterprise", cycle: "Annual", status: "Past Due" },
  { name: "Ibn Sina School", code: "ISS-004", subscription: "SUB-2026-004", plan: "Professional", cycle: "Monthly", status: "Trial" },
  { name: "Horizon School", code: "HZS-005", subscription: "SUB-2026-005", plan: "Basic", cycle: "Annual", status: "Cancelled" }
];
const money = (amount: number, currency = "MAD") => new Intl.NumberFormat("fr-MA", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
const stamp = (value: string) => new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const csvCell = (value: string | number) => '"' + String(value).replace(/"/g, '""') + '"';

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [method, setMethod] = useState("All");
  const [currency, setCurrency] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [range, setRange] = useState("30d");
  const [panel, setPanel] = useState<Panel>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [draft, setDraft] = useState<Draft>({ schoolCode: "", subscription: "", amount: "", currency: "MAD", method: "Bank Transfer", date: "2026-11-09T12:00", reference: "", notes: "", file: null });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [noteText, setNoteText] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); };
  const activePayment = panel && "id" in panel ? payments.find(p => p.id === panel.id) : undefined;
  const visible = useMemo(() => payments.filter(p => {
    const q = query.trim().toLowerCase();
    return (!q || [p.id,p.school,p.subscription,p.reference].some(v=>v.toLowerCase().includes(q)))
      && (status === "All" || p.status === status)
      && (method === "All" || p.method === method)
      && (currency === "All" || p.currency === currency)
      && (!from || p.date.slice(0,10) >= from) && (!to || p.date.slice(0,10) <= to);
  }), [payments,query,status,method,currency,from,to]);
  const activeFilters = !!(query || status !== "All" || method !== "All" || currency !== "All" || from || to);
  const selectedSchool = schools.find(s => s.code === draft.schoolCode);
  const selectedSubscription = selectedSchool && selectedSchool.subscription === draft.subscription ? selectedSchool : undefined;
  const periods = range === "7d"
    ? [{label:"03 Nov",amount:0,count:0},{label:"04 Nov",amount:0,count:0},{label:"05 Nov",amount:800,count:1},{label:"06 Nov",amount:12000,count:1},{label:"07 Nov",amount:0,count:0},{label:"08 Nov",amount:0,count:0},{label:"09 Nov",amount:0,count:0}]
    : range === "90d"
      ? [{label:"Wk 1",amount:18000,count:2},{label:"Wk 2",amount:9200,count:1},{label:"Wk 3",amount:24600,count:3},{label:"Wk 4",amount:12000,count:1},{label:"Wk 5",amount:31800,count:4},{label:"Wk 6",amount:16800,count:2},{label:"Wk 7",amount:14200,count:2},{label:"Wk 8",amount:21800,count:3},{label:"Wk 9",amount:17600,count:2},{label:"Wk 10",amount:26400,count:3},{label:"Wk 11",amount:15200,count:2},{label:"Wk 12",amount:20800,count:3},{label:"Wk 13",amount:12800,count:2}]
      : range === "year"
        ? [{label:"Jan",amount:16400,count:3},{label:"Feb",amount:18200,count:4},{label:"Mar",amount:20100,count:5},{label:"Apr",amount:16800,count:3},{label:"May",amount:22600,count:5},{label:"Jun",amount:19400,count:4},{label:"Jul",amount:17200,count:3},{label:"Aug",amount:24100,count:5},{label:"Sep",amount:21300,count:4},{label:"Oct",amount:25800,count:5},{label:"Nov",amount:12000,count:2},{label:"Dec",amount:0,count:0}]
        : [{label:"12 Oct",amount:12000,count:1},{label:"15 Oct",amount:4800,count:1},{label:"18 Oct",amount:0,count:0},{label:"21 Oct",amount:24600,count:2},{label:"24 Oct",amount:9200,count:1},{label:"27 Oct",amount:0,count:0},{label:"30 Oct",amount:16800,count:2},{label:"02 Nov",amount:0,count:0},{label:"05 Nov",amount:800,count:1},{label:"06 Nov",amount:12000,count:1}];
  const chartMax = Math.max(10000,Math.ceil(Math.max(...periods.map(p=>p.amount),1)/10000)*10000);\n  const chartTicks = [chartMax,Math.round(chartMax*2/3),Math.round(chartMax/3),0];
  const selectedRevenue = periods.reduce((sum,p)=>sum+p.amount,0);
  const selectedCount = periods.reduce((sum,p)=>sum+p.count,0);
  const pendingAmount = payments.filter(p=>p.status==="Pending").reduce((sum,p)=>sum+p.amount,0);
  const refundedAmount = payments.reduce((sum,p)=>sum+p.refunded,0);
  const resetFilters = () => { setQuery("");setStatus("All");setMethod("All");setCurrency("All");setFrom("");setTo(""); };
  const closePanel = () => { if (dirty && panel?.mode === "record") setDiscard(true); else { setPanel(null);setErrors({});setAttachmentError(""); } };
  const openRecord = () => { if(fileRef.current)fileRef.current.value="";setDraft({schoolCode:"",subscription:"",amount:"",currency:"MAD",method:"Bank Transfer",date:"2026-11-09T12:00",reference:"",notes:"",file:null});setErrors({});setDirty(false);setSchoolSearch("");setPanel({mode:"record"}); };
  const savePending = () => {
    const next: Record<string,string> = {};
    if (!draft.schoolCode) next.schoolCode = "Select a registered school.";
    if (!draft.subscription || !selectedSubscription) next.subscription = "Select a subscription belonging to this school.";
    if (!draft.amount || !Number.isFinite(Number(draft.amount)) || Number(draft.amount) <= 0) next.amount = "Enter an amount greater than zero.";
    if (!draft.currency) next.currency = "Select a supported currency.";
    if (!draft.date || Number.isNaN(new Date(draft.date).getTime())) next.date = "Enter a valid transaction date.";
    if (draft.reference.trim().length > 80) next.reference = "Reference must be 80 characters or fewer.";
    if (draft.file && draft.file.size > 5 * 1024 * 1024) next.file = "Evidence must be 5 MB or smaller.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const id = "PAY-DEMO-" + String(payments.length + 1).padStart(3,"0");
    const created: Payment = { id, school:selectedSchool!.name, code:selectedSchool!.code, subscription:selectedSchool!.subscription, plan:selectedSchool!.plan, cycle:selectedSchool!.cycle, amount:Number(draft.amount), currency:draft.currency, method:draft.method, status:"Pending", date:draft.date, reference:draft.reference.trim()||"—", providerReference:"—", recordedBy:"Current administrator (demo)", notes:draft.notes.trim()?[draft.notes.trim()]:[], refunded:0, receiptAvailable:false, events:[event(id+"-1","Payment recorded",stamp(draft.date),"Manually recorded and saved as pending verification.","warning")] };
    setPayments(prev=>[created,...prev]);setPanel(null);setDirty(false);setDraft({...draft, file:null});setErrors({});
    notify("Saved as Pending in this local demo. No payment was verified or collected.");
  };
  const exportCsv = () => {
    const header = ["Payment ID","School Name","School Code","Subscription ID","Amount","Currency","Payment Method","Payment Status","Transaction Date","Transaction Reference","Refunded Amount"];
    const rows = visible.map(p=>[p.id,p.school,p.code,p.subscription,p.amount,p.currency,p.method,p.status,p.date,p.reference,p.refunded].map(csvCell).join(","));
    const blob = new Blob(["\uFEFF"+[header.map(csvCell).join(","),...rows].join("\r\n")],{type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="payments-filtered-demo.csv";a.click();URL.revokeObjectURL(url);
    notify("Filtered transaction CSV exported.");
  };
  const downloadReceipt = (p: Payment) => {
    if (!p.receiptAvailable || !["Successful","Refunded"].includes(p.status)) { notify("No verified receipt is available for this transaction.");return; }
    const receiptText = ["CENTRAL SCHOOL — PAYMENT RECEIPT","DEMONSTRATION DOCUMENT","",p.id,p.school,p.subscription,money(p.amount,p.currency),p.status,p.date,p.reference,"This receipt is generated from fictional local demo data."].join("\n");
    const blob = new Blob([receiptText],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=p.id+"-receipt.txt";a.click();URL.revokeObjectURL(url);notify("Demo receipt generated from verified demo transaction data.");
  };
  const updatePayment = (id: string, updater: (p:Payment)=>Payment) => setPayments(prev=>prev.map(p=>p.id===id?updater(p):p));
  const verify = (p: Payment) => { notify("Verification is not connected. This payment remains Pending; no provider confirmation was fabricated.");setPanel(null); };
  const markFailed = (p: Payment) => {
    if (!failureReason.trim()) return;
    updatePayment(p.id,current=>({...current,status:"Failed",events:[...current.events,event(p.id+"-fail-"+Date.now(),"Payment marked failed",new Date().toLocaleString(),failureReason.trim(),"danger")]}));
    setPanel(null);setFailureReason("");notify("Marked Failed in local demo history. No subscription or license status was changed.");
  };
  const issueRefund = (p: Payment) => {
    const amount=Number(refundAmount);const remaining=p.amount-p.refunded;
    if (!Number.isFinite(amount)||amount<=0||amount>remaining||!refundReason.trim()) return;
    updatePayment(p.id,current=>{const refunded=current.refunded+amount;const fully=refunded>=current.amount;return {...current,refunded,status:fully?"Refunded":"Successful",events:[...current.events,event(p.id+"-refund-"+Date.now(),fully?"Refund issued":"Partial refund recorded",new Date().toLocaleString(),refundReason.trim()+" · "+money(amount,current.currency),"warning")]};});
    setPanel(null);setRefundAmount("");setRefundReason("");notify("Refund event recorded in local demo only. No money was transferred.");
  };
  const addNote = (p: Payment) => { if (!noteText.trim()) return;updatePayment(p.id,current=>({...current,notes:[...current.notes,noteText.trim()+" — Current administrator (demo), "+new Date().toLocaleString()]}));setNoteText("");setPanel(null);notify("Internal note added to local demo record."); };
  const statusTone = (s: PaymentStatus) => s==="Successful"?"success":s==="Pending"?"warning":s==="Failed"?"danger":"neutral";
  const openDetails = (id:string) => {setMenu(null);setPanel({mode:"details",id});};
  return <div className="payments-page">
    <header className="payments-header"><div><span className="payments-eyebrow">CENTRAL PLATFORM <i>/</i> SUBSCRIPTIONS &amp; BILLING</span><h1>Payments</h1><p>Track school subscription payments, transaction outcomes, refunds, and payment history.</p></div><div className="payments-header-actions"><button className="pay-btn pay-btn-secondary" onClick={exportCsv}><Download size={15}/>Export</button><button className="pay-btn pay-btn-primary" onClick={openRecord}><Plus size={16}/>Record Payment</button></div></header>
    <div className="payments-demo-banner"><span><i/>DEMO DATA</span><p>Fictional transactions and illustrative financial summaries. No live payment provider or financial ledger is connected.</p></div>
    <section className="payments-metrics" aria-label="Illustrative payment metrics">
      {[{label:"Total Collected",value:"248,500 MAD",helper:"Gross successful captures · illustrative",icon:Wallet},{label:"Successful Payments",value:"96",helper:"Confirmed transaction count · illustrative",icon:Check},{label:"Pending Payments",value:"8",helper:"Awaiting confirmation · illustrative",icon:Clock3},{label:"Failed Payments",value:"5",helper:"Confirmed unsuccessful · illustrative",icon:AlertCircle},{label:"Refunds",value:"2",helper:"Refunded transactions · illustrative",icon:RefreshCw}].map((m,i)=><article className="payments-metric" key={m.label}><div className="payments-metric-icon"><m.icon size={16}/></div><div><span>{m.label}</span><strong className="pay-mono">{m.value}</strong><small>{m.helper}</small></div></article>)}
    </section>
    <section className="payments-revenue">
      <div className="payments-section-head"><div><h2>Revenue Overview</h2><p>Track collected subscription payments and transaction outcomes over time.</p></div><span className="payments-demo-chip">DEMO DATA</span></div>
      <div className="payments-revenue-toolbar"><span className="pay-muted">Collected activity <b>·</b> MAD</span><select aria-label="Revenue time range" value={range} onChange={e=>setRange(e.target.value)}><option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option><option value="90d">Last 90 Days</option><option value="year">This Year</option></select></div>
      <div className="payments-revenue-stats"><div><span>Total collected <Info size={12} title="Net of refunds; pending and failed excluded."/></span><strong className="pay-mono">{money(Math.max(0,selectedRevenue-(range==="7d"?0:4800)))}</strong><small>Successful captures less refunds</small></div><div><span>Successful transactions</span><strong className="pay-mono">{selectedCount}</strong><small>In selected illustrative period</small></div><div><span>Pending amount</span><strong className="pay-mono">{money(pendingAmount)}</strong><small>Excluded from collections</small></div><div><span>Refunded amount</span><strong className="pay-mono">{money(refundedAmount)}</strong><small>Shown separately</small></div></div>
      <div className="payments-chart-wrap"><div className="payments-chart-title"><b>Successful captures (gross)</b><span>Amounts by {range==="7d"?"day":range==="90d"?"week":range==="year"?"month":"date"} · MAD</span></div><div className="payments-chart">
        <div className="payments-chart-y">{chartTicks.map((tick,i)=><span key={i}>{tick===0?"0":(tick/1000)+"k"}</span>)}</div><div className="payments-chart-plot"><div className="payments-chart-grid"><i/><i/><i/><i/></div><div className="payments-bars">{periods.map((p,i)=><div className="payments-bar-col" key={p.label} title={p.label+": "+money(p.amount)+" · "+p.count+" transactions"}><div className="payments-bar-space"><div className="payments-bar" style={{height:(p.amount/chartMax*100)+"%"}}/><span className="payments-bar-tooltip">{p.label}<b>{money(p.amount)}</b>{p.count} transactions</span></div><small>{p.label}</small></div>)}</div></div></div>
      </div>
      <p className="payments-chart-foot">Illustrative series, not reconciled to the five visible sample rows. Total collected is net of refunds; pending and failed transactions are excluded.</p>
    </section>
    <section className="payments-table-section">
      <div className="payments-section-head"><div><h2>All Payments</h2><p>View and manage school subscription transactions and payment outcomes.</p></div><span className="payments-count">{visible.length} of {payments.length} transactions</span></div>
      <div className="payments-toolbar">
        <label className="payments-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by payment ID, school, subscription, or transaction reference..." aria-label="Search payments"/></label>
        <label className="payments-filter"><span>Status</span><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Successful</option><option>Pending</option><option>Failed</option><option>Refunded</option></select></label>
        <label className="payments-filter"><span>Method</span><select value={method} onChange={e=>setMethod(e.target.value)}><option>All</option><option>Bank Transfer</option><option>Card</option><option>Cash</option><option>Other</option></select></label>
        <label className="payments-filter"><span>Currency</span><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>All</option><option>MAD</option><option>EUR</option><option>USD</option></select></label>
        <label className="payments-date-filter"><CalendarDays size={14}/><input aria-label="From date" type="date" value={from} onChange={e=>setFrom(e.target.value)}/><span>to</span><input aria-label="To date" type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
        <button className="payments-clear" disabled={!activeFilters} onClick={resetFilters}>Clear filters</button>
      </div>
      <div className="payments-table-scroll"><table className="payments-table"><thead><tr><th>Payment ID</th><th>School</th><th>Subscription ID</th><th className="pay-align-right">Amount</th><th>Currency</th><th>Payment Method</th><th>Payment Status</th><th>Transaction Date</th><th>Reference</th><th aria-label="Actions"/></tr></thead><tbody>
        {visible.map(p=><tr key={p.id}><td><button className="pay-id-link pay-mono" onClick={()=>openDetails(p.id)}>{p.id}</button><small className="pay-row-sub">Transaction</small></td><td><b className="pay-school-name">{p.school}</b><small className="pay-row-sub">{p.code}</small></td><td><span className="pay-mono pay-sub-id">{p.subscription}</span></td><td className="pay-align-right pay-amount pay-mono">{money(p.amount,p.currency)}</td><td>{p.currency}</td><td>{p.method}</td><td><span className={"pay-status pay-status--"+statusTone(p.status)}><i/>{p.status}{p.refunded>0&&p.refunded<p.amount?" · Partial":""}</span></td><td><span className="pay-date">{stamp(p.date)}</span></td><td className="pay-mono pay-reference">{p.reference||"—"}</td><td><div className="pay-menu-wrap"><button className="pay-icon-button" aria-label={"Actions for "+p.id} aria-expanded={menu===p.id} onClick={()=>setMenu(menu===p.id?null:p.id)}><MoreHorizontal size={17}/></button>{menu===p.id&&<div className="pay-menu"><button onClick={()=>openDetails(p.id)}><Eye size={14}/>View details</button>{p.receiptAvailable&&<button onClick={()=>{setMenu(null);downloadReceipt(p);}}><Download size={14}/>Download receipt</button>}{p.status==="Pending"&&<button onClick={()=>{setMenu(null);setPanel({mode:"verify",id:p.id});}}><ShieldCheck size={14}/>Verify payment</button>}{p.status==="Pending"&&<button onClick={()=>{setMenu(null);setPanel({mode:"failed",id:p.id});}}><AlertCircle size={14}/>Mark as failed</button>}{p.status==="Successful"&&<button onClick={()=>{setMenu(null);setRefundAmount(String(p.amount-p.refunded));setPanel({mode:"refund",id:p.id});}}><RefreshCw size={14}/>Issue refund</button>}<button onClick={()=>{setMenu(null);setPanel({mode:"note",id:p.id});}}><FileText size={14}/>Add internal note</button></div>}</div></td></tr>)}
        {visible.length===0&&<tr><td colSpan={10}><div className="payments-empty"><Filter size={20}/><b>No transactions match your filters</b><span>Adjust the search or clear the active filters to see more records.</span><button onClick={resetFilters}>Clear filters</button></div></td></tr>}
      </tbody></table></div>
      <div className="payments-table-footer"><span>Showing {visible.length} transaction{visible.length===1?"":"s"} · Local demonstration records</span><button onClick={exportCsv}><ArrowDownToLine size={14}/>Export filtered CSV</button></div>
    </section>

    {panel&&<div className="payments-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)closePanel();}}>
      <aside className="payments-drawer" role="dialog" aria-modal="true" aria-label={panel.mode==="details"?"Payment details":panel.mode==="record"?"Record payment":panel.mode==="refund"?"Issue refund":panel.mode==="verify"?"Verify payment":panel.mode==="failed"?"Mark payment failed":"Add internal note"}>
        <div className="payments-drawer-head"><div><span className="payments-eyebrow">{panel.mode==="record"?"NEW TRANSACTION":panel.mode==="details"?"TRANSACTION RECORD":"PAYMENT ACTION"}</span><h2>{panel.mode==="record"?"Record Payment":panel.mode==="details"?activePayment?.id:panel.mode==="refund"?"Issue refund":panel.mode==="verify"?"Verify payment":panel.mode==="failed"?"Mark as failed":"Add internal note"}</h2><p>{panel.mode==="record"?"Record a transaction for a registered school's subscription.":panel.mode==="details"?"Transaction identity, financial context and recorded events.":"This workflow updates only the local demonstration record."}</p></div><button className="pay-icon-button" onClick={closePanel} aria-label="Close drawer"><X size={18}/></button></div>
        {panel.mode==="details"&&activePayment&&<div className="payments-drawer-body">
          <div className="pay-detail-status"><span className={"pay-status pay-status--"+statusTone(activePayment.status)}><i/>{activePayment.status}</span><strong className="pay-mono">{money(activePayment.amount,activePayment.currency)}</strong>{activePayment.refunded>0&&<small>{money(activePayment.refunded)} refunded · {money(activePayment.amount-activePayment.refunded)} remaining</small>}</div>
          <section className="pay-detail-section"><h3>Transaction information</h3><div className="pay-detail-grid"><div><small>Payment ID</small><b className="pay-mono">{activePayment.id}</b></div><div><small>Transaction reference</small><b className="pay-mono">{activePayment.reference}</b></div><div><small>Transaction date</small><b>{stamp(activePayment.date)}</b></div><div><small>Currency</small><b>{activePayment.currency}</b></div></div></section>
          <section className="pay-detail-section"><h3>School &amp; subscription</h3><div className="pay-detail-grid"><div><small>School name</small><b>{activePayment.school}</b></div><div><small>School code</small><b className="pay-mono">{activePayment.code}</b></div><div><small>Subscription ID</small><b className="pay-mono">{activePayment.subscription}</b></div><div><small>Plan / billing</small><b>{activePayment.plan} · {activePayment.cycle}</b></div></div><p className="pay-domain-note">Subscription and license status are separate records and are not changed by payment actions.</p></section>
          <section className="pay-detail-section"><h3>Payment method</h3><div className="pay-detail-grid"><div><small>Method</small><b>{activePayment.method}</b></div><div><small>Provider reference</small><b className="pay-mono">{activePayment.providerReference||"—"}</b></div><div><small>Recorded by</small><b>{activePayment.recordedBy||"—"}</b></div></div><p className="pay-domain-note">Only masked provider metadata is displayed. No card credentials or bank access details are stored here.</p></section>
          {activePayment.notes.length>0&&<section className="pay-detail-section"><h3>Internal notes</h3>{activePayment.notes.map((n,i)=><p className="pay-note-entry" key={i}>{n}</p>)}</section>}
          <section className="pay-detail-section"><h3>Payment timeline</h3><div className="pay-timeline">{activePayment.events.map(ev=><div className={"pay-timeline-event pay-timeline--"+ev.tone} key={ev.id}><i/><div><b>{ev.title}</b><time>{ev.at}</time><p>{ev.description}</p></div></div>)}</div></section>
        </div>}
        {panel.mode==="record"&&<form className="payments-drawer-body pay-form" onSubmit={e=>{e.preventDefault();savePending();}}>
          <div className="pay-demo-note"><Info size={15}/><span><b>LOCAL DEMONSTRATION</b> — saved records exist only in this browser session. Provider verification and secure evidence storage are not connected.</span></div>
          <section className="pay-form-section"><h3>01 / School &amp; subscription</h3>
            <label>Registered school <input value={schoolSearch} onChange={e=>{setSchoolSearch(e.target.value);setDirty(true);}} placeholder="Search school name or code..." aria-label="Search registered schools"/></label>
            <div className="pay-school-options">{schools.filter(s=>(s.name+" "+s.code).toLowerCase().includes(schoolSearch.toLowerCase())).map(s=><button type="button" className={draft.schoolCode===s.code?"selected":""} key={s.code} onClick={()=>{setDraft(d=>({...d,schoolCode:s.code,subscription:s.subscription}));setDirty(true);setErrors(v=>({...v,schoolCode:"",subscription:""}));}}><span><b>{s.name}</b><small>{s.code} · {s.status} subscription</small></span>{draft.schoolCode===s.code&&<Check size={15}/>}</button>)}</div>
            {errors.schoolCode&&<small className="pay-error">{errors.schoolCode}</small>}
            <label>Subscription <select value={draft.subscription} onChange={e=>{setDraft(d=>({...d,subscription:e.target.value}));setDirty(true);}} disabled={!selectedSchool}><option value="">Select subscription</option>{selectedSchool&&<option value={selectedSchool.subscription}>{selectedSchool.subscription} · {selectedSchool.plan} · {selectedSchool.cycle} · {selectedSchool.status}</option>}</select>{errors.subscription&&<small className="pay-error">{errors.subscription}</small>}</label>
            <p className="pay-form-help">Only the subscription associated with the selected school is selectable. Payment recording does not change its lifecycle or license authorization.</p>
          </section>
          <section className="pay-form-section"><h3>02 / Transaction information</h3>
            <div className="pay-form-grid"><label>Amount <input type="number" min="0.01" step="0.01" value={draft.amount} onChange={e=>{setDraft(d=>({...d,amount:e.target.value}));setDirty(true);}} placeholder="0.00"/>{errors.amount&&<small className="pay-error">{errors.amount}</small>}</label><label>Currency <select value={draft.currency} onChange={e=>{setDraft(d=>({...d,currency:e.target.value}));setDirty(true);}}><option>MAD</option><option>EUR</option><option>USD</option></select></label></div>
            <label>Payment method <select value={draft.method} onChange={e=>{setDraft(d=>({...d,method:e.target.value as PaymentMethod}));setDirty(true);}}><option>Bank Transfer</option><option>Card</option><option>Cash</option><option>Other</option></select></label>
            <label>Transaction date &amp; time <input type="datetime-local" value={draft.date} onChange={e=>{setDraft(d=>({...d,date:e.target.value}));setDirty(true);}}/>{errors.date&&<small className="pay-error">{errors.date}</small>}</label>
            <label>Transaction reference <input value={draft.reference} onChange={e=>{setDraft(d=>({...d,reference:e.target.value}));setDirty(true);}} placeholder="External or internal reference (optional)"/>{errors.reference&&<small className="pay-error">{errors.reference}</small>}</label>
            <label>Internal notes <textarea rows={3} value={draft.notes} onChange={e=>{setDraft(d=>({...d,notes:e.target.value}));setDirty(true);}} placeholder="Visible to authorized platform administrators only"/></label>
          </section>
          <section className="pay-form-section"><h3>03 / Payment evidence</h3><div className="pay-upload" onClick={()=>fileRef.current?.click()}><Upload size={18}/><b>{draft.file?draft.file.name:"Attach supporting evidence"}</b><span>PDF, JPG or PNG · max 5 MB · private demo interaction only</span><input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>{const file=e.target.files?.[0]||null;if(file&&!["application/pdf","image/jpeg","image/png"].includes(file.type)){setAttachmentError("Use a PDF, JPG or PNG file.");return;}if(file&&file.size>5*1024*1024){setAttachmentError("File exceeds the 5 MB demo limit.");return;}setAttachmentError("");setDraft(d=>({...d,file}));setDirty(true);}} hidden/></div>{draft.file&&<button type="button" className="pay-remove-file" onClick={()=>{setDraft(d=>({...d,file:null}));if(fileRef.current)fileRef.current.value="";setDirty(true);}}>Remove attachment</button>}{(attachmentError||errors.file)&&<small className="pay-error">{attachmentError||errors.file}</small>}<p className="pay-form-help">Evidence is not uploaded or retained by a server in this demo and never counts as automatic verification.</p></section>
          <div className="pay-verification-warning"><ShieldCheck size={16}/><span><b>Verification unavailable</b> — no payment provider or evidence-review service is connected. This form can save a Pending record only.</span></div>
        </form>}
        {panel.mode==="verify"&&activePayment&&<div className="payments-drawer-body pay-action-body"><div className="pay-action-callout warning"><Clock3 size={20}/><div><b>{activePayment.id} remains Pending</b><p>There is no connected provider confirmation or authorized evidence-review workflow. A manual click cannot establish successful payment.</p></div></div><p className="pay-form-help">The transaction, subscription and license records remain unchanged. Connect a verified provider or controlled evidence-review process before enabling confirmation.</p></div>}
        {panel.mode==="failed"&&activePayment&&<div className="payments-drawer-body pay-action-body"><p>Record a failure reason for <b className="pay-mono">{activePayment.id}</b>. This preserves the original transaction and appends an audit event.</p><label>Failure reason <textarea rows={4} value={failureReason} onChange={e=>setFailureReason(e.target.value)} placeholder="Describe the confirmed failure reason..."/></label><small className="pay-form-help">Use only when the unsuccessful outcome has been confirmed outside this demo.</small></div>}
        {panel.mode==="refund"&&activePayment&&<div className="payments-drawer-body pay-action-body"><div className="pay-refund-summary"><span>Original payment</span><b className="pay-mono">{money(activePayment.amount,activePayment.currency)}</b><span>Previously refunded</span><b className="pay-mono">{money(activePayment.refunded,activePayment.currency)}</b><span>Remaining refundable</span><b className="pay-mono">{money(activePayment.amount-activePayment.refunded,activePayment.currency)}</b></div><label>Refund amount <input type="number" min="0.01" max={activePayment.amount-activePayment.refunded} step="0.01" value={refundAmount} onChange={e=>setRefundAmount(e.target.value)}/></label><label>Refund reason <textarea rows={3} value={refundReason} onChange={e=>setRefundReason(e.target.value)} placeholder="Required reason for the refund"/></label><div className="pay-action-callout warning"><AlertCircle size={18}/><span>Refund actions in this local demo create an auditable illustrative event only. No payment rail is connected and no money will move.</span></div></div>}
        {panel.mode==="note"&&activePayment&&<div className="payments-drawer-body pay-action-body"><label>Internal note <textarea rows={5} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Add an internal administrative note..."/></label><p className="pay-form-help">The note is visible only in this local demo payment record. Author and timestamp are appended automatically.</p></div>}
        {panel.mode==="details"&&activePayment&&<div className="payments-drawer-footer"><button className="pay-btn pay-btn-secondary" onClick={()=>setPanel(null)}>Close</button><div>{activePayment.status==="Pending"&&<button className="pay-btn pay-btn-primary" onClick={()=>setPanel({mode:"verify",id:activePayment.id})}>Verify payment</button>}{activePayment.status==="Successful"&&<button className="pay-btn pay-btn-primary" onClick={()=>{setRefundAmount(String(activePayment.amount-activePayment.refunded));setPanel({mode:"refund",id:activePayment.id});}}>Issue refund</button>}</div></div>}
        {panel.mode==="record"&&<div className="payments-drawer-footer"><button className="pay-btn pay-btn-secondary" onClick={closePanel}>Cancel</button><div><button className="pay-btn pay-btn-primary" type="button" disabled title="Payment verification is not connected; successful recording is unavailable.">Record Successful Payment</button><button className="pay-btn pay-btn-primary" onClick={savePending}><Plus size={14}/>Save as Pending</button></div></div>}
        {panel.mode==="verify"&&<div className="payments-drawer-footer"><button className="pay-btn pay-btn-secondary" onClick={()=>setPanel(null)}>Close</button><button className="pay-btn pay-btn-primary" onClick={()=>activePayment&&verify(activePayment)}>Keep Pending</button></div>}
        {panel.mode==="failed"&&<div className="payments-drawer-footer"><button className="pay-btn pay-btn-secondary" onClick={()=>setPanel(null)}>Cancel</button><button className="pay-btn pay-btn-danger" disabled={!failureReason.trim()} onClick={()=>activePayment&&markFailed(activePayment)}>Confirm failure</button></div>}
        {panel.mode==="refund"&&<div className="payments-drawer-footer"><button className="pay-btn pay-btn-secondary" onClick={()=>setPanel(null)}>Cancel</button><button className="pay-btn pay-btn-danger" disabled={!refundReason.trim()||Number(refundAmount)<=0||Number(refundAmount)>((activePayment?.amount||0)-(activePayment?.refunded||0))} onClick={()=>activePayment&&issueRefund(activePayment)}>Confirm demo refund</button></div>}
        {panel.mode==="note"&&<div className="payments-drawer-footer"><button className="pay-btn pay-btn-secondary" onClick={()=>setPanel(null)}>Cancel</button><button className="pay-btn pay-btn-primary" disabled={!noteText.trim()} onClick={()=>activePayment&&addNote(activePayment)}>Save note</button></div>}
      </aside>
    </div>}
    {discard&&<div className="pay-confirm-backdrop"><div className="pay-confirm" role="dialog" aria-modal="true"><h2>Discard unsaved payment?</h2><p>Your transaction details have not been saved. Close this form and discard them?</p><div><button className="pay-btn pay-btn-secondary" onClick={()=>setDiscard(false)}>Keep editing</button><button className="pay-btn pay-btn-danger" onClick={()=>{setDiscard(false);setPanel(null);setDirty(false);setErrors({});}}>Discard changes</button></div></div></div>}
    {toast&&<div className="payments-toast" role="status"><Check size={15}/>{toast}</div>}
  </div>;
}
