import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertCircle, ArrowRight, ArrowUpRight, BookOpen, CalendarDays,
  FileCheck2, GraduationCap, RefreshCw, ShieldAlert, Users, Wallet,
  UserRoundCheck, ClipboardList, CalendarCheck, Bus, Package, TrendingUp,
} from "lucide-react";
import { studentsRepository, type StudentsData } from "../../services/students";
import { teachersRepository, type TeachersData } from "../../services/teachers";
import { employeesRepository, type EmployeesData } from "../../services/employees";
import { schoolBranding } from "../../config/school";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./DirectorOverviewPage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type LoadState<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; message: string };
type DemoRow = { id: string; title: string; detail: string; date: string; route: string; tag?: string; tone?: "warning" | "danger" | "success" | "info" };
const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
const dh = (n: number) => `${fmt(n)} DH`;
const dateLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
const timeLabel = (value: string) => new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const DEMO = {
  attendance: { present: 1126, absent: 74, late: 18, expected: 1200, completed: true },
  academic: { average: 13.4, previous: 12.9, eligible: 864, validated: 864, levels: [{name:"Primaire",average:14.1,count:402},{name:"Collège",average:13.2,count:286},{name:"Lycée",average:12.6,count:176}], terms:[{name:"T1",value:12.9},{name:"T2",value:13.4}] },
  finance: { collected: 1842500, outstanding: 326400, debtors: 118, expenses: 742300, net: 1100200, expensesRecent: [{name:"Fournitures pédagogiques",category:"Pédagogie",date:"2026-11-06",amount:8450,status:"Payée"},{name:"Maintenance informatique",category:"Maintenance",date:"2026-11-04",amount:6200,status:"À régler"},{name:"Consommables sanitaires",category:"Entretien",date:"2026-11-02",amount:3150,status:"Payée"}] },
  risk: [
    {id:"ELV-0241",className:"3ème collège B",category:"Absences répétées",reason:"Plusieurs absences enregistrées",status:"À examiner",tone:"danger"},
    {id:"ELV-0187",className:"1ère Bac Sciences A",category:"Baisse des résultats",reason:"Résultats en baisse sur la période",status:"Suivi en cours",tone:"warning"},
    {id:"ELV-0316",className:"6ème primaire C",category:"Retards fréquents",reason:"Retards récurrents signalés",status:"En observation",tone:"info"},
  ],
  approvals: [
    {id:"grades",title:"Notes à valider",count:8,age:"Depuis hier",route:"/grades-validation",permission:"pedagogy.grades.view"},
    {id:"reports",title:"Rapports pédagogiques",count:3,age:"Depuis 2 jours",route:"/pedagogical-reports",permission:"pedagogy.reports.view"},
    {id:"content",title:"Ressources pédagogiques",count:5,age:"Depuis 3 jours",route:"/courses-exercises",permission:"pedagogy.content.view"},
  ],
  events: [
    {id:"exam-1",title:"Évaluation de mathématiques",detail:"3ème collège · Mathématiques",date:"2026-11-10T09:00:00",route:"/examinations",tag:"Examen"},
    {id:"event-1",title:"Réunion des parents",detail:"Salle polyvalente · 16:00",date:"2026-11-12T16:00:00",route:"/events",tag:"Événement"},
    {id:"exam-2",title:"Contrôle de français",detail:"2ème Bac · Français",date:"2026-11-14T10:00:00",route:"/examinations",tag:"Examen"},
  ],
  activities: [
    {id:"a1",title:"Les notes de 2ème année Bac ont été validées.",who:"Responsable pédagogique",when:"2026-11-08T10:35:00",route:"/grades-validation"},
    {id:"a2",title:"Un dossier d'inscription a été créé.",who:"Service administratif",when:"2026-11-08T09:50:00",route:"/students"},
    {id:"a3",title:"Un paiement a été confirmé.",who:"Service financier",when:"2026-11-07T16:20:00",route:"/payments"},
    {id:"a4",title:"Un rapport pédagogique a été soumis.",who:"Enseignant",when:"2026-11-07T14:05:00",route:"/pedagogical-reports"},
  ],
};
function Heading({eyebrow,title,action,onClick}:{eyebrow:string;title:string;action?:string;onClick?:()=>void}) {
  return <div className="director-section-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action&&onClick&&<button type="button" onClick={onClick}>{action}<ArrowRight size={14}/></button>}</div>;
}
function Metric({label,value,detail,icon:Icon,tone,onClick}:{label:string;value:string;detail:string;icon:typeof Users;tone:string;onClick:()=>void}) {
  return <button type="button" className="director-metric" onClick={onClick}><span className={`director-metric-icon director-tone--${tone}`}><Icon size={18}/></span><span className="director-metric-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></span><ArrowRight size={14} className="director-metric-arrow"/></button>;
}
function Empty({children}:{children:string}) { return <div className="director-empty-state">{children}</div>; }
function Bar({label,value,max,caption}:{label:string;value:number;max:number;caption:string}) {
  return <div className="director-bar-row"><div><strong>{label}</strong><span>{caption}</span></div><div className="director-bar-track"><i style={{width:`${max ? value/max*100 : 0}%`}}/></div></div>;
}
export function DirectorOverviewPage({user,onNavigate}:Props) {
  const allowed = (permission:string) => user.permissions.includes(permission as never);
  const [students,setStudents] = useState<LoadState<StudentsData>>({status:"loading"});
  const [teachers,setTeachers] = useState<LoadState<TeachersData>>({status:"loading"});
  const [employees,setEmployees] = useState<LoadState<EmployeesData>>({status:"loading"});
  const [refreshKey,setRefreshKey] = useState(0);
  const [yearId,setYearId] = useState("");
  const [showAllActivities,setShowAllActivities] = useState(false);
  const [activeTab,setActiveTab] = useState<"overview"|"academic"|"students"|"operations"|"finance"|"activity">("overview");
  const refresh = useCallback(() => setRefreshKey(v=>v+1),[]);
  useEffect(() => {
    let alive = true;
    if (allowed("people.students.view")) studentsRepository.list().then(data=>{if(alive){setStudents({status:"ready",data});setYearId(current=>current||data.academicYears.find(y=>y.status==="Active")?.id||"");}}).catch(e=>{if(alive)setStudents({status:"error",message:e instanceof Error?e.message:"Chargement impossible."});});
    else setStudents({status:"error",message:"Accès aux dossiers élèves non autorisé."});
    if (allowed("people.teachers.view")) teachersRepository.list().then(data=>{if(alive)setTeachers({status:"ready",data});}).catch(e=>{if(alive)setTeachers({status:"error",message:e instanceof Error?e.message:"Chargement impossible."});});
    else setTeachers({status:"error",message:"Accès aux dossiers enseignants non autorisé."});
    if (allowed("people.employees.view")) employeesRepository.list().then(data=>{if(alive)setEmployees({status:"ready",data});}).catch(e=>{if(alive)setEmployees({status:"error",message:e instanceof Error?e.message:"Chargement impossible."});});
    else setEmployees({status:"error",message:"Accès aux dossiers du personnel non autorisé."});
    return ()=>{alive=false;};
  },[refreshKey,user.permissions]);
  const studentData = students.status==="ready" ? students.data : null;
  const year = studentData?.academicYears.find(y=>y.id===yearId) ?? null;
  const yearRows = useMemo(()=>studentData?.students.filter(s=>s.enrollment?.academicYearId===yearId)??[],[studentData,yearId]);
  const activeStudents = yearRows.filter(s=>s.enrollment?.status==="Actif");
  const teacherCount = teachers.status==="ready" ? teachers.data.teachers.filter(t=>t.employmentStatus==="Actif").length : null;
  const employeeCount = employees.status==="ready" ? employees.data.employees.filter(e=>e.employmentStatus==="Actif").length : null;
  const cycles = useMemo(()=>{const map=new Map<string,number>();activeStudents.forEach(s=>{const k=s.cycleName||s.levelName||"Niveau non renseigné";map.set(k,(map.get(k)||0)+1);});return [...map].map(([name,count])=>({name,count}));},[activeStudents]);
  const gender = useMemo(()=>({boys:activeStudents.filter(s=>s.gender==="Masculin").length,girls:activeStudents.filter(s=>s.gender==="Féminin").length,unknown:activeStudents.filter(s=>s.gender==="Non renseigné").length}),[activeStudents]);
  const isDirector = user.role==="director" && allowed("overview.view");
  const canFinance = allowed("finance.reports.view") && allowed("finance.balances.view");
  const greeting = new Date().getHours()<12?"Bonjour":new Date().getHours()<18?"Bon après-midi":"Bonsoir";
  const firstName = user.displayName.trim().split(/\s+/)[0]||"Directeur";
  const approvalRows = DEMO.approvals.filter(a=>allowed(a.permission));
  const upcoming = DEMO.events.slice().sort((a,b)=>a.date.localeCompare(b.date));
  const displayedActivities = (showAllActivities?DEMO.activities:DEMO.activities.slice(0,3));
  const totalStudents = activeStudents.length;
  const attendanceRate = DEMO.attendance.expected ? Math.round(DEMO.attendance.present/DEMO.attendance.expected*100) : 0;
  const yearWarning = studentData && !year;
  if(!isDirector) return <main className="director-dashboard"><div className="director-access"><ShieldAlert size={24}/><h1>Accès réservé à la direction</h1><p>Ce tableau de bord est accessible uniquement au compte Directeur autorisé.</p></div></main>;
  return <main className="director-dashboard">
    <header className="director-welcome">
      <div className="director-welcome-copy"><div className="director-breadcrumb"><GraduationCap size={15}/> Direction <span>/</span> Vue d’ensemble</div><h1>{greeting}, {firstName}</h1><p>Voici un aperçu de votre établissement.</p><div className="director-context"><span><CalendarDays size={14}/>{year?.name??"Année scolaire non définie"}</span><span>{dateLabel}</span><span className="director-school-name">{schoolBranding.name}</span></div></div>
      <div className="director-welcome-actions"><label className="director-period"><span>Année scolaire active</span><select value={yearId} onChange={e=>setYearId(e.target.value)} disabled={!studentData?.academicYears.length}><option value="">Aucune année active</option>{studentData?.academicYears.map(y=><option key={y.id} value={y.id}>{y.name} · {y.status}</option>)}</select></label><button className="director-refresh" type="button" onClick={refresh}><RefreshCw size={15}/> Actualiser</button></div>
    </header>
    <div className="director-demo-banner"><span><AlertCircle size={16}/><strong>Mode démonstration</strong></span><p>Les données affichées sont fictives ou issues des dépôts locaux du navigateur. Elles ne représentent pas des statistiques réelles et ne sont pas synchronisées avec un serveur central.</p></div>
    {yearWarning&&<div className="director-error"><AlertCircle size={16}/>Aucune année scolaire active n’est configurée. Les indicateurs d’effectifs ne peuvent pas être calculés.</div>}
    <nav className="director-tabs" aria-label="Catégories du tableau de bord">
      {([
        ["overview","Vue générale"],
        ["academic","Académique"],
        ["students","Élèves"],
        ["operations","Personnel & opérations"],
        ["finance","Finances"],
        ["activity","Validations & activité"],
      ] as const).map(([id,label])=><button key={id} type="button" className={activeTab===id?"is-active":""} aria-current={activeTab===id?"page":undefined} onClick={()=>setActiveTab(id)}>{label}</button>)}
    </nav>
    {activeTab==="overview"&&<div className="director-tab-content">
<section className="director-metrics" aria-label="Indicateurs clés">
      <Metric label="Effectif total" value={students.status==="ready"?fmt(totalStudents):"—"} detail={students.status==="ready"?"Inscriptions actives · année sélectionnée":"Données élèves indisponibles"} icon={GraduationCap} tone="blue" onClick={()=>onNavigate("/students")}/>
      <Metric label="Enseignants actifs" value={teacherCount===null?"—":fmt(teacherCount)} detail="Personnel enseignant uniquement" icon={BookOpen} tone="green" onClick={()=>onNavigate("/teachers")}/>
      <Metric label="Personnel administratif" value={employeeCount===null?"—":fmt(employeeCount)} detail="Employés non enseignants actifs" icon={Users} tone="violet" onClick={()=>onNavigate("/employees")}/>
      <Metric label="Présence aujourd’hui" value={fmt(attendanceRate)+" %"} detail={`${fmt(DEMO.attendance.present)} présents · ${fmt(DEMO.attendance.expected-DEMO.attendance.present)} absents · démonstration`} icon={UserRoundCheck} tone="green" onClick={()=>onNavigate("/student-attendance")}/>
      <Metric label="Performance académique" value={DEMO.academic.average.toFixed(1).replace(".",",")+"/20"} detail={`+${(DEMO.academic.average-DEMO.academic.previous).toFixed(1).replace(".",",")} pt vs période précédente · démo`} icon={TrendingUp} tone="blue" onClick={()=>onNavigate("/pedagogical-reports")}/>
      <Metric label="Impayés" value={canFinance?dh(DEMO.finance.outstanding):"Masqué"} detail={canFinance?`${fmt(DEMO.finance.debtors)} élèves concernés · démonstration`:"Accès financier restreint"} icon={Wallet} tone="amber" onClick={()=>canFinance&&onNavigate("/student-balances")}/>
    </section>
      <section className="director-grid director-grid--two"><article className="director-panel"><Heading eyebrow="RÉSULTATS SCOLAIRES · DÉMONSTRATION" title="Performance académique" action="Voir les rapports" onClick={()=>onNavigate("/pedagogical-reports")}/><div className="director-academic-summary"><div><span>Moyenne générale</span><strong>{DEMO.academic.average.toFixed(1).replace(".",",")}<small>/20</small></strong></div><div className="director-trend"><ArrowUpRight size={16}/><strong>+0,5 pt</strong><span>vs période précédente</span></div><div className="director-meta">Période : Trimestre 2 · {DEMO.academic.validated} résultats validés sur {DEMO.academic.eligible}</div></div><div className="director-bars">{DEMO.academic.levels.map(l=><Bar key={l.name} label={l.name} value={l.average} max={20} caption={l.average.toFixed(1).replace(".",",")+"/20 · "+l.count+" résultats"}/>)}</div><div className="director-term-row">{DEMO.academic.terms.map(t=><span key={t.name}>{t.name} <strong>{t.value.toFixed(1).replace(".",",")}/20</strong></span>)}</div></article><article className="director-panel"><Heading eyebrow="STRUCTURE SCOLAIRE" title="Aperçu des élèves" action="Voir les élèves" onClick={()=>onNavigate("/students")}/>{students.status==="loading"?<div className="director-loading">Chargement des effectifs…</div>:students.status==="error"?<div className="director-error-inline">{students.message}</div>:<><div className="director-student-total"><strong>{fmt(totalStudents)}</strong><span>élèves inscrits actifs</span></div><div className="director-bars">{cycles.map(c=><Bar key={c.name} label={c.name} value={c.count} max={Math.max(...cycles.map(x=>x.count),1)} caption={fmt(c.count)+" élèves"}/>)}</div><div className="director-gender"><span>Garçons <strong>{gender.boys}</strong></span><span>Filles <strong>{gender.girls}</strong></span><span>Non renseigné <strong>{gender.unknown}</strong></span></div></>}<div className="director-risk-count"><ShieldAlert size={16}/><span><strong>{DEMO.risk.length}</strong> suivis élèves actifs</span><button type="button" onClick={()=>onNavigate("/student-risk")}>Consulter<ArrowRight size={13}/></button></div></article></section>
    </div>}
    {activeTab==="academic"&&<div className="director-tab-content">
      <section className="director-grid director-grid--two"><article className="director-panel"><Heading eyebrow="RÉSULTATS SCOLAIRES · DÉMONSTRATION" title="Performance académique" action="Voir les rapports" onClick={()=>onNavigate("/pedagogical-reports")}/><div className="director-academic-summary"><div><span>Moyenne générale</span><strong>{DEMO.academic.average.toFixed(1).replace(".",",")}<small>/20</small></strong></div><div className="director-trend"><ArrowUpRight size={16}/><strong>+0,5 pt</strong><span>vs période précédente</span></div><div className="director-meta">Période : Trimestre 2 · {DEMO.academic.validated} résultats validés sur {DEMO.academic.eligible}</div></div><div className="director-bars">{DEMO.academic.levels.map(l=><Bar key={l.name} label={l.name} value={l.average} max={20} caption={l.average.toFixed(1).replace(".",",")+"/20 · "+l.count+" résultats"}/>)}</div><div className="director-term-row">{DEMO.academic.terms.map(t=><span key={t.name}>{t.name} <strong>{t.value.toFixed(1).replace(".",",")}/20</strong></span>)}</div></article></section>
      <article className="director-panel"><Heading eyebrow="ACCÈS PÉDAGOGIQUE" title="Ressources et rapports académiques" action="Voir les rapports" onClick={()=>onNavigate("/pedagogical-reports")}/><p className="director-footnote">Consultez les rapports de performance et les ressources pédagogiques de l’établissement.</p><div className="director-quick-actions">{allowed("pedagogy.reports.view")&&<button type="button" onClick={()=>onNavigate("/pedagogical-reports")}><BookOpen size={16}/>Rapports pédagogiques<ArrowRight size={13}/></button>}{allowed("pedagogy.content.view")&&<button type="button" onClick={()=>onNavigate("/courses-exercises")}><ClipboardList size={16}/>Ressources pédagogiques<ArrowRight size={13}/></button>}</div></article>
    </div>}
    {activeTab==="students"&&<div className="director-tab-content">
      <section className="director-grid director-grid--two"><article className="director-panel"><Heading eyebrow="STRUCTURE SCOLAIRE" title="Aperçu des élèves" action="Voir les élèves" onClick={()=>onNavigate("/students")}/>{students.status==="loading"?<div className="director-loading">Chargement des effectifs…</div>:students.status==="error"?<div className="director-error-inline">{students.message}</div>:<><div className="director-student-total"><strong>{fmt(totalStudents)}</strong><span>élèves inscrits actifs</span></div><div className="director-bars">{cycles.map(c=><Bar key={c.name} label={c.name} value={c.count} max={Math.max(...cycles.map(x=>x.count),1)} caption={fmt(c.count)+" élèves"}/>)}</div><div className="director-gender"><span>Garçons <strong>{gender.boys}</strong></span><span>Filles <strong>{gender.girls}</strong></span><span>Non renseigné <strong>{gender.unknown}</strong></span></div></>}<div className="director-risk-count"><ShieldAlert size={16}/><span><strong>{DEMO.risk.length}</strong> suivis élèves actifs</span><button type="button" onClick={()=>onNavigate("/student-risk")}>Consulter<ArrowRight size={13}/></button></div></article><article className="director-panel"><Heading eyebrow="SUIVI INDIVIDUEL · DÉMONSTRATION" title="Élèves nécessitant un suivi" action="Voir tous les suivis" onClick={()=>onNavigate("/student-risk")}/><div className="director-table-wrap"><table className="director-table"><thead><tr><th>Élève</th><th>Classe</th><th>Catégorie</th><th>Motif</th><th>Suivi</th><th></th></tr></thead><tbody>{DEMO.risk.map(r=><tr key={r.id}><td><strong>{r.id}</strong></td><td>{r.className}</td><td>{r.category}</td><td>{r.reason}</td><td><span className={`director-status director-status--${r.tone}`}>{r.status}</span></td><td><button className="director-icon-action" type="button" aria-label="Ouvrir le suivi" onClick={()=>onNavigate("/student-risk")}><ArrowRight size={14}/></button></td></tr>)}</tbody></table></div><p className="director-footnote">Identifiants fictifs. Aucun diagnostic ni score automatique n’est calculé.</p></article></section>
    </div>}
    {activeTab==="operations"&&<div className="director-tab-content">
      <section className="director-grid director-grid--two"><article className="director-panel"><Heading eyebrow="VIE DE L’ÉTABLISSEMENT" title="Opérations scolaires"/><div className="director-ops-grid"><button type="button" onClick={()=>onNavigate("/student-attendance")}><CalendarCheck size={17}/><span><strong>{attendanceRate}%</strong><small>Présence élèves · démo</small></span></button><button type="button" onClick={()=>onNavigate("/staff-attendance")}><Users size={17}/><span><strong>2 absences</strong><small>Personnel · démo</small></span></button><button type="button" onClick={()=>onNavigate("/transport")}><Bus size={17}/><span><strong>1 alerte</strong><small>Transport · démo</small></span></button><button type="button" onClick={()=>onNavigate("/inventory")}><Package size={17}/><span><strong>2 seuils</strong><small>Stocks · démo</small></span></button></div><div className="director-upcoming">{upcoming.map(item=><button key={item.id} type="button" onClick={()=>onNavigate(item.route)}><span className="director-upcoming-date">{new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"short"}).format(new Date(item.date))}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><em>{item.tag}</em><ArrowRight size={13}/></button>)}</div><p className="director-footnote">Présences, absences et alertes opérationnelles sont des exemples fictifs.</p></article><article className="director-panel"><Heading eyebrow="RESSOURCES HUMAINES" title="Effectifs du personnel"/><div className="director-student-total"><strong>{teacherCount===null?"—":fmt(teacherCount)}</strong><span>enseignants actifs</span></div><div className="director-student-total"><strong>{employeeCount===null?"—":fmt(employeeCount)}</strong><span>employés administratifs actifs</span></div><div className="director-quick-actions">{allowed("people.teachers.view")&&<button type="button" onClick={()=>onNavigate("/teachers")}><BookOpen size={16}/>Gérer les enseignants<ArrowRight size={13}/></button>}{allowed("people.employees.view")&&<button type="button" onClick={()=>onNavigate("/employees")}><Users size={16}/>Gérer le personnel<ArrowRight size={13}/></button>}{allowed("people.employees.view")&&<button type="button" onClick={()=>onNavigate("/staff-attendance")}><CalendarCheck size={16}/>Présences du personnel<ArrowRight size={13}/></button>}</div></article></section>
    </div>}
    {activeTab==="finance"&&<div className="director-tab-content">
      <section className="director-grid director-grid--two"><article className="director-panel">{canFinance?<><Heading eyebrow="FINANCES · DÉMONSTRATION" title="Situation financière" action="Voir les rapports" onClick={()=>onNavigate("/financial-reports")}/><div className="director-finance-primary"><span>Encaissements sur la période</span><strong>{dh(DEMO.finance.collected)}</strong></div><div className="director-finance-pairs"><div><span>Reste à recouvrer</span><strong>{dh(DEMO.finance.outstanding)}</strong></div><div><span>Dépenses enregistrées</span><strong>{dh(DEMO.finance.expenses)}</strong></div><div><span>Solde indicatif</span><strong>{dh(DEMO.finance.net)}</strong></div></div><div className="director-expenses">{DEMO.finance.expensesRecent.map(e=><div key={e.name}><span><strong>{e.name}</strong><small>{e.category} · {e.date}</small></span><span><b>{dh(e.amount)}</b><small>{e.status}</small></span></div>)}</div><p className="director-footnote">Montants fictifs en DH. Le solde indicatif est calculé sur les encaissements moins les dépenses enregistrées.</p></>:<><Heading eyebrow="FINANCES" title="Situation financière"/><Empty>Les informations financières sont masquées pour ce compte.</Empty></>}</article></section>
    </div>}
    {activeTab==="activity"&&<div className="director-tab-content">
      <section className="director-grid director-grid--two"><article className="director-panel director-panel--approvals"><Heading eyebrow="DÉCISIONS À PRENDRE" title="Validations en attente"/>{approvalRows.length?approvalRows.map(a=><button className="director-approval" key={a.id} type="button" onClick={()=>onNavigate(a.route)}><span className="director-approval-icon"><ClipboardList size={17}/></span><span className="director-approval-copy"><strong>{a.title}</strong><small>{a.age}</small></span><b>{a.count}</b><ArrowRight size={14}/></button>):<Empty> Aucune validation en attente.</Empty>}<p className="director-footnote">Flux de démonstration : l’ouverture du module permet de consulter les dossiers. Aucune validation n’est exécutée depuis cette vue.</p></article><article className="director-panel"><Heading eyebrow="JOURNAL DE L’ÉTABLISSEMENT · DÉMONSTRATION" title="Activité récente" action="Voir tout l’historique" onClick={()=>onNavigate("/activity-history")}/><div className="director-activity-list">{displayedActivities.map(a=><button key={a.id} type="button" onClick={()=>onNavigate(a.route)}><span className="director-activity-dot"><Activity size={14}/></span><span><strong>{a.title}</strong><small>{a.who} · {timeLabel(a.when)}</small></span><ArrowRight size={13}/></button>)}</div><button className="director-show-more" type="button" onClick={()=>setShowAllActivities(v=>!v)}>{showAllActivities?"Réduire":"Afficher plus"}</button><p className="director-footnote">Événements fictifs d’illustration, non issus d’un journal d’audit central.</p></article></section>
      <section className="director-grid director-grid--two"><article className="director-panel"><Heading eyebrow="ACCÈS DIRECTS" title="Actions de la direction"/><div className="director-quick-actions">{allowed("pedagogy.grades.view")&&<button type="button" onClick={()=>onNavigate("/grades-validation")}><FileCheck2 size={16}/>Valider les notes<ArrowRight size={13}/></button>}{allowed("pedagogy.reports.view")&&<button type="button" onClick={()=>onNavigate("/pedagogical-reports")}><BookOpen size={16}/>Examiner les rapports<ArrowRight size={13}/></button>}{allowed("pedagogy.content.view")&&<button type="button" onClick={()=>onNavigate("/courses-exercises")}><ClipboardList size={16}/>Examiner les ressources<ArrowRight size={13}/></button>}{allowed("student.analytics.view")&&<button type="button" onClick={()=>onNavigate("/student-risk")}><ShieldAlert size={16}/>Suivi des élèves à risque<ArrowRight size={13}/></button>}{allowed("archive.view")&&<button type="button" onClick={()=>onNavigate("/academic-years")}><CalendarDays size={16}/>Archives scolaires<ArrowRight size={13}/></button>}</div></article></section>
    </div>}
    <footer className="director-footer"><span>{schoolBranding.name} · Espace Direction</span><span>Actualisation manuelle · données locales et démonstratives</span></footer>
  </main>;
}
