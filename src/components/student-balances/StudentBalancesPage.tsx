import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowDownLeft, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, CreditCard, FilterX, Info, Search, ShieldAlert, UserRound, Wallet, X } from "lucide-react";
import { studentsRepository, type StudentRecord } from "../../services/students";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./StudentBalancesPage.css";

interface Props { user: AuthenticatedSidebarUser }
type Situation = "À jour" | "Paiement partiel" | "En retard" | "Solde impayé";
type Fee = { id:string; name:string; description:string; billed:number; paid:number; dueDate:string };
type Payment = { id:string; receipt:string|null; studentId:string; date:string; amount:number; method:string; fee:string; status:"Confirmé"|"En attente"|"Annulé"|"Remboursé" };
type Service = { id:string; name:string; assignedAt:string; period:string; status:"Actif"|"Suspendu"|"Terminé"; fee:number };
type Account = { student:StudentRecord; fees:Fee[]; payments:Payment[]; services:Service[]; billed:number; paid:number; outstanding:number; activeServices:number; situation:Situation };
type Tab = "overview"|"fees"|"payments"|"services";

const money=(v:number)=>new Intl.NumberFormat("fr-MA",{style:"currency",currency:"MAD",minimumFractionDigits:2,maximumFractionDigits:2}).format(v).replace("MAD","DH");
const dateLabel=(v:string)=>v?new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(v+"T12:00:00")):"—";
const feeNames=["Frais de scolarité","Transport scolaire","Restauration scolaire","Frais d'inscription"];
const dates=["2026-11-06","2026-11-06","2026-11-05","2026-11-04","2026-11-03","2026-11-02","2026-10-30","2026-10-28","2026-10-25","2026-10-21","2026-10-17","2026-10-12"];
const amounts=[1800,2200,1500,900,2500,1200,1750,800,3100,1450,950,2000];
const statuses:Payment["status"][]=["Confirmé","Confirmé","En attente","Confirmé","Confirmé","Confirmé","Confirmé","Annulé","Confirmé","Remboursé","Confirmé","Confirmé"];
const methods=["Espèces","Virement bancaire","Carte bancaire","Espèces","Chèque","Virement bancaire","Espèces","Espèces","Paiement électronique","Virement bancaire","Chèque","Espèces"];
const services:Service[][]=[
 [{id:"SRV-01",name:"Transport scolaire",assignedAt:"2026-09-01",period:"Année 2026–2027",status:"Actif",fee:3600},{id:"SRV-02",name:"Restauration scolaire",assignedAt:"2026-09-03",period:"Année 2026–2027",status:"Actif",fee:2400}],
 [{id:"SRV-03",name:"Transport scolaire",assignedAt:"2026-09-01",period:"Année 2026–2027",status:"Actif",fee:3600}],
 [{id:"SRV-04",name:"Club de programmation",assignedAt:"2026-10-02",period:"1er trimestre",status:"Actif",fee:0}],
 [{id:"SRV-05",name:"Restauration scolaire",assignedAt:"2026-09-03",period:"Année 2026–2027",status:"Suspendu",fee:2400}],
 [{id:"SRV-06",name:"Transport scolaire",assignedAt:"2026-09-01",period:"Année 2026–2027",status:"Actif",fee:3600},{id:"SRV-07",name:"Restauration scolaire",assignedAt:"2026-09-03",period:"Année 2026–2027",status:"Actif",fee:2400}],
 [{id:"SRV-08",name:"Club de programmation",assignedAt:"2026-10-02",period:"1er trimestre",status:"Actif",fee:0}]
];
function makeAccount(student:StudentRecord,index:number):Account {
 const payment:Payment={id:"PAY-26"+String(1090-index).padStart(3,"0"),receipt:index===7||index===9?null:"REC-26"+String(4010-index),studentId:student.id,date:dates[index%dates.length],amount:amounts[index%amounts.length],method:methods[index%methods.length],fee:feeNames[index%feeNames.length],status:statuses[index%statuses.length]};
 const base:Fee[]=[
  {id:"FEE-"+index+"-01",name:feeNames[0],description:"Scolarité annuelle",billed:12000+(index%4)*1500,paid:3000+(index%4)*1000,dueDate:"2026-10-31"},
  {id:"FEE-"+index+"-02",name:feeNames[1],description:"Transport scolaire – année",billed:3600,paid:index%3===0?1200:0,dueDate:"2026-10-31"},
  {id:"FEE-"+index+"-03",name:feeNames[2],description:"Restauration scolaire",billed:2400,paid:index%2===0?600:0,dueDate:"2026-10-31"},
  {id:"FEE-"+index+"-04",name:feeNames[3],description:"Dossier d'inscription",billed:1500,paid:1500,dueDate:"2026-09-15"}
 ];
 const confirmed=payment.status==="Confirmé"?payment.amount:0;
 const fees=base.map((f,i)=>({...f,paid:f.paid+(i===index%feeNames.length?confirmed:0)}));
 const billed=fees.reduce((n,f)=>n+f.billed,0),paid=fees.reduce((n,f)=>n+f.paid,0),outstanding=billed-paid;
 const situation:Situation=outstanding===0?"À jour":paid===0?"Solde impayé":"2026-10-31"<"2026-11-07"?"En retard":"Paiement partiel";
 const studentServices=services[index%services.length];
 return {student,fees,payments:[payment],services:studentServices,billed,paid,outstanding,activeServices:studentServices.filter(s=>s.status==="Actif").length,situation};
}
function statusClass(s:Situation){return s==="À jour"?"good":s==="Paiement partiel"?"partial":"late";}
function initials(s:StudentRecord){return (s.firstName.slice(0,1)+s.lastName.slice(0,1)).toLocaleUpperCase("fr-FR");}

export function StudentBalancesPage({user}:Props){
 const canView=user.permissions.includes("finance.balances.view"),canSeeParents=user.permissions.includes("people.parents.view");
 const [students,setStudents]=useState<StudentRecord[]>([]),[years,setYears]=useState<{id:string;name:string}[]>([]);
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 const [year,setYear]=useState(""),[program,setProgram]=useState("all"),[level,setLevel]=useState("all"),[classId,setClassId]=useState("all"),[fee,setFee]=useState("all"),[service,setService]=useState("all"),[situation,setSituation]=useState("all"),[query,setQuery]=useState("");
 const [page,setPage]=useState(1),[sort,setSort]=useState<"name"|"outstanding"|"billed">("outstanding"),[selectedId,setSelectedId]=useState<string|null>(null),[tab,setTab]=useState<Tab>("overview");
 useEffect(()=>{if(!canView){setLoading(false);return;}let active=true;studentsRepository.list().then(data=>{if(!active)return;setStudents(data.students);setYears(data.academicYears.map(y=>({id:y.id,name:y.name})));setYear(data.academicYears.find(y=>y.status==="Active")?.id??data.academicYears[0]?.id??"");}).catch(e=>{if(active)setError(e instanceof Error?e.message:"Impossible de charger les dossiers élèves.");}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[canView]);
 const accounts=useMemo(()=>students.map((s,i)=>makeAccount(s,i)),[students]);
 const yearAccounts=accounts.filter(a=>!year||a.student.enrollment?.academicYearId===year);
 const programs=Array.from(new Map(yearAccounts.map(a=>[a.student.enrollment?.programId,a.student.programName])).entries()).filter(x=>x[0]);
 const levels=Array.from(new Map(yearAccounts.filter(a=>program==="all"||a.student.enrollment?.programId===program).map(a=>[a.student.enrollment?.levelId,a.student.levelName])).entries()).filter(x=>x[0]);
 const classes=Array.from(new Map(yearAccounts.filter(a=>(program==="all"||a.student.enrollment?.programId===program)&&(level==="all"||a.student.enrollment?.levelId===level)).map(a=>[a.student.enrollment?.classId,a.student.className])).entries()).filter(x=>x[0]);
 const filtered=useMemo(()=>yearAccounts.filter(a=>{const s=a.student,t=(s.firstName+" "+s.lastName+" "+s.code).toLocaleLowerCase("fr-FR");return (!query||t.includes(query.toLocaleLowerCase("fr-FR")))&&(program==="all"||s.enrollment?.programId===program)&&(level==="all"||s.enrollment?.levelId===level)&&(classId==="all"||s.enrollment?.classId===classId)&&(fee==="all"||a.fees.some(f=>f.name===fee))&&(service==="all"||a.services.some(x=>x.name===service&&x.status==="Actif"))&&(situation==="all"||a.situation===situation);}).sort((a,b)=>sort==="name"?(a.student.lastName+" "+a.student.firstName).localeCompare(b.student.lastName+" "+b.student.firstName,"fr"):sort==="billed"?b.billed-a.billed:b.outstanding-a.outstanding),[yearAccounts,query,program,level,classId,fee,service,situation,sort]);
 const pageSize=8,pageCount=Math.max(1,Math.ceil(filtered.length/pageSize)),visible=filtered.slice((page-1)*pageSize,page*pageSize);
 const totals=yearAccounts.reduce((v,a)=>({billed:v.billed+a.billed,paid:v.paid+a.paid,unpaid:v.unpaid+(a.outstanding>0?1:0)}),{billed:0,paid:0,unpaid:0});
 const selected=accounts.find(a=>a.student.id===selectedId)??null;
 const clear=()=>{setProgram("all");setLevel("all");setClassId("all");setFee("all");setService("all");setSituation("all");setQuery("");setPage(1);};
 const open=(id:string)=>{setSelectedId(id);setTab("overview");};
 if(!canView)return <main className="sb-page"><div className="sb-denied"><ShieldAlert size={28}/><h1>Accès non autorisé</h1><p>Votre profil ne dispose pas de l'autorisation nécessaire pour consulter les situations financières des élèves.</p></div></main>;
 return <main className="sb-page">
  <div className="sb-breadcrumb">Gestion financière <span>/</span> <strong>Soldes et services des élèves</strong></div>
  <header className="sb-heading"><div><span className="sb-eyebrow">ESPACE FINANCIER</span><h1>Soldes et services des élèves</h1><p>Consultez les situations financières, les frais et les services associés aux élèves.</p></div><div className="sb-year-control"><CalendarDays size={15}/><label htmlFor="sb-year">Année scolaire</label><select id="sb-year" value={year} onChange={e=>{setYear(e.target.value);setPage(1);setProgram("all");setLevel("all");setClassId("all");}}>{years.map(y=><option key={y.id} value={y.id}>{y.name}</option>)}</select></div></header>
  <section className="sb-demo"><Info size={16}/><div><strong>Mode démonstration · Données financières fictives</strong><span>Les élèves et leurs affectations proviennent des données de démonstration de l'établissement. Les frais, règlements et services ci-dessous sont des exemples visuels. Aucune opération financière n'est enregistrée.</span></div><b>APERÇU</b></section>
  {error&&<div className="sb-error"><AlertCircle size={15}/>{error}</div>}
  <section className="sb-kpis">
   <article><span className="sb-kpi-icon blue"><CircleDollarSign size={17}/></span><div><small>Total des frais facturés</small><strong>{loading?"—":money(totals.billed)}</strong><em>Année sélectionnée</em></div></article>
   <article><span className="sb-kpi-icon teal"><ArrowDownLeft size={17}/></span><div><small>Total encaissé</small><strong>{loading?"—":money(totals.paid)}</strong><em>Règlements confirmés fictifs inclus</em></div></article>
   <article><span className="sb-kpi-icon amber"><Wallet size={17}/></span><div><small>Total restant à payer</small><strong>{loading?"—":money(Math.max(0,totals.billed-totals.paid))}</strong><em>Solde agrégé de démonstration</em></div></article>
   <article><span className="sb-kpi-icon slate"><UserRound size={17}/></span><div><small>Élèves avec solde impayé</small><strong>{loading?"—":totals.unpaid}</strong><em>Comptes présentant un reste dû</em></div></article>
  </section>
  <section className="sb-list">
   <div className="sb-list-head"><div><span className="sb-eyebrow">COMPTES ÉLÈVES</span><h2>Situation financière par élève</h2><p>Les montants sont fictifs et présentés à titre de démonstration.</p></div><span className="sb-count">{filtered.length} élève{filtered.length>1?"s":""}</span></div>
   <div className="sb-filters">
    <label className="sb-search"><Search size={15}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Rechercher un élève ou une référence..."/></label>
    <select value={program} onChange={e=>{setProgram(e.target.value);setLevel("all");setClassId("all");setPage(1);}}><option value="all">Toutes les filières</option>{programs.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>
    <select value={level} onChange={e=>{setLevel(e.target.value);setClassId("all");setPage(1);}}><option value="all">Tous les niveaux</option>{levels.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>
    <select value={classId} onChange={e=>{setClassId(e.target.value);setPage(1);}}><option value="all">Toutes les classes</option>{classes.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>
    <select value={fee} onChange={e=>{setFee(e.target.value);setPage(1);}}><option value="all">Tous les frais</option>{feeNames.map(x=><option key={x}>{x}</option>)}</select>
    <select value={service} onChange={e=>{setService(e.target.value);setPage(1);}}><option value="all">Tous les services</option>{["Transport scolaire","Restauration scolaire","Club de programmation"].map(x=><option key={x}>{x}</option>)}</select>
    <select value={situation} onChange={e=>{setSituation(e.target.value);setPage(1);}}><option value="all">Toutes les situations</option>{(["À jour","Paiement partiel","En retard","Solde impayé"] as Situation[]).map(x=><option key={x}>{x}</option>)}</select>
    <button className="sb-clear" onClick={clear}><FilterX size={13}/> Réinitialiser</button>
   </div>
   <div className="sb-table-wrap">{loading?<div className="sb-loading"><span/><span/><span/><span/></div>:error?<div className="sb-empty"><AlertCircle size={22}/><strong>Chargement impossible</strong><p>{error}</p></div>:visible.length===0?<div className="sb-empty"><Search size={22}/><strong>Aucun élève trouvé</strong><p>Aucun compte ne correspond aux filtres sélectionnés.</p><button onClick={clear}>Effacer les filtres</button></div>:<table className="sb-table"><thead><tr><th>Élève</th><th>Référence</th><th>Classe / Groupe</th><th><button onClick={()=>setSort("billed")}>Total facturé (DH)</button></th><th><button onClick={()=>setSort("outstanding")}>Total payé (DH) / Reste dû</button></th><th>Services actifs</th><th>Situation</th><th>Action</th></tr></thead><tbody>{visible.map(a=><tr key={a.student.id} onClick={()=>open(a.student.id)}><td><div className="sb-student"><span>{initials(a.student)}</span><strong>{a.student.firstName} {a.student.lastName}</strong></div></td><td className="sb-ref">{a.student.code}</td><td>{a.student.className}<small>{a.student.groupName!=="—"?a.student.groupName:"Sans groupe"}</small></td><td className="sb-money">{money(a.billed)}</td><td><strong className="sb-money">{money(a.paid)}</strong><small className="sb-outstanding">{money(Math.max(0,a.outstanding))} restant</small></td><td><span className="sb-service-count">{a.activeServices} service{a.activeServices>1?"s":""}</span></td><td><span className={"sb-status "+statusClass(a.situation)}>{a.situation}</span></td><td><button className="sb-view" onClick={e=>{e.stopPropagation();open(a.student.id);}}>Consulter <ChevronRight size={13}/></button></td></tr>)}</tbody></table>}</div>
   <footer className="sb-pagination"><span>Affichage de {filtered.length?(page-1)*pageSize+1:0} à {Math.min(page*pageSize,filtered.length)} sur {filtered.length} élèves</span><div><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={14}/></button><b>{page} / {pageCount}</b><button disabled={page>=pageCount} onClick={()=>setPage(p=>p+1)}><ChevronRight size={14}/></button></div></footer>
  </section>
  {selected&&<div className="sb-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedId(null);}}><aside className="sb-drawer">
   <header className="sb-drawer-head"><div><span className="sb-eyebrow">COMPTE FINANCIER · DÉMO</span><h2>{selected.student.firstName} {selected.student.lastName}</h2><p>{selected.student.code} · {selected.student.className}{selected.student.groupName!=="—"?" · "+selected.student.groupName:""}</p></div><button onClick={()=>setSelectedId(null)} aria-label="Fermer"><X size={18}/></button></header>
   <div className="sb-drawer-summary"><div><small>Total facturé</small><strong>{money(selected.billed)}</strong></div><div><small>Total payé</small><strong>{money(selected.paid)}</strong></div><div><small>Reste à payer</small><strong className="sb-drawer-due">{money(Math.max(0,selected.outstanding))}</strong></div></div>
   <nav className="sb-tabs"><button className={tab==="overview"?"active":""} onClick={()=>setTab("overview")}>Aperçu</button><button className={tab==="fees"?"active":""} onClick={()=>setTab("fees")}>Frais ({selected.fees.length})</button><button className={tab==="payments"?"active":""} onClick={()=>setTab("payments")}>Paiements ({selected.payments.length})</button><button className={tab==="services"?"active":""} onClick={()=>setTab("services")}>Services ({selected.services.length})</button></nav>
   <div className="sb-drawer-content">
    {tab==="overview"&&<><section className="sb-detail-section"><h3>Informations scolaires</h3><div className="sb-detail-grid"><div><small>Élève</small><strong>{selected.student.firstName} {selected.student.lastName}</strong></div><div><small>Référence</small><strong>{selected.student.code}</strong></div><div><small>Année scolaire</small><strong>{selected.student.academicYearName}</strong></div><div><small>Programme</small><strong>{selected.student.programName}</strong></div><div><small>Niveau</small><strong>{selected.student.levelName}</strong></div><div><small>Classe / Groupe</small><strong>{selected.student.className} · {selected.student.groupName}</strong></div></div></section><section className="sb-detail-section"><h3>Situation financière</h3><div className="sb-situation-card"><span className={"sb-status "+statusClass(selected.situation)}>{selected.situation}</span><p>Le solde présenté est calculé à partir des frais et paiements fictifs chargés pour cette démonstration.</p><div><span>Reste à payer</span><strong>{money(Math.max(0,selected.outstanding))}</strong></div></div></section><section className="sb-detail-section"><h3>Parent / tuteur</h3>{canSeeParents&&selected.student.guardiansResolved.length?selected.student.guardiansResolved.map(g=><div className="sb-guardian" key={g.id}><UserRound size={15}/><div><strong>{g.name}</strong><small>{g.relationship} · {g.phone||"Coordonnées non renseignées"}</small></div></div>):<p className="sb-muted">{canSeeParents?"Aucun parent associé à ce dossier.":"Les informations du parent ne sont pas accessibles avec votre profil."}</p>}</section></>}
    {tab==="fees"&&<section className="sb-detail-section"><h3>Détail des frais</h3><p className="sb-muted">Échéances et montants fictifs, à remplacer par les obligations financières configurées.</p><div className="sb-detail-table-wrap"><table className="sb-detail-table"><thead><tr><th>Frais</th><th>Facturé</th><th>Payé</th><th>Reste</th><th>Échéance</th></tr></thead><tbody>{selected.fees.map(f=><tr key={f.id}><td><strong>{f.name}</strong><small>{f.description}</small></td><td>{money(f.billed)}</td><td>{money(f.paid)}</td><td className="sb-outstanding">{money(Math.max(0,f.billed-f.paid))}</td><td>{dateLabel(f.dueDate)}</td></tr>)}</tbody></table></div></section>}
    {tab==="payments"&&<section className="sb-detail-section"><h3>Historique des paiements</h3><p className="sb-muted">Les transactions sont des exemples de démonstration. Consultez la page Paiements pour le parcours de saisie.</p>{selected.payments.map(p=><div className="sb-payment-row" key={p.id}><span className="sb-payment-icon"><CreditCard size={15}/></span><div><strong>{p.id}</strong><small>{dateLabel(p.date)} · {p.fee} · {p.method}</small></div><b>{money(p.amount)}</b><span className={"sb-status "+(p.status==="Confirmé"?"good":p.status==="En attente"?"partial":"late")}>{p.status}</span></div>)}{user.permissions.includes("finance.payments.manage")&&<button className="sb-secondary" onClick={()=>{window.history.pushState({},"","/payments");window.dispatchEvent(new PopStateEvent("popstate"));}}>Ouvrir les paiements <ChevronRight size={13}/></button>}</section>}
    {tab==="services"&&<section className="sb-detail-section"><h3>Services associés</h3><p className="sb-muted">Affectations fictives en lecture seule. La gestion des services n'est pas connectée.</p>{selected.services.map(s=><div className="sb-service-row" key={s.id}><div><strong>{s.name}</strong><small>Affecté le {dateLabel(s.assignedAt)} · {s.period}</small></div><div><b>{s.fee?money(s.fee):"Sans frais"}</b><span className={"sb-status "+(s.status==="Actif"?"good":"partial")}>{s.status}</span></div></div>)}</section>}
   </div>
   <footer className="sb-drawer-foot"><span>DONNÉES FICTIVES · CONSULTATION UNIQUEMENT</span><button onClick={()=>setSelectedId(null)}>Fermer</button></footer>
  </aside></div>}
 </main>;
}
