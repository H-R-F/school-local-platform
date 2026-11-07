import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Archive, CheckCircle2, ChevronRight, Clock3, Download, Eye, FileCheck2, FileText, FilterX, Info, Search, ShieldAlert, UserRound, X } from "lucide-react";
import { studentsRepository, type StudentRecord } from "../../services/students";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./DocumentsPage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type RequestStatus = "Nouvelle demande" | "En cours" | "Informations requises" | "Approuvée" | "Rejetée" | "Document prêt" | "Délivrée";
type RequestRecord = {
  id: string; student: StudentRecord; parent: string; relationship: string; type: string;
  submittedAt: string; status: RequestStatus; assignedTo?: string; note: string;
  history: { label: string; actor: string; date: string; detail?: string }[];
};
type IssuedRecord = { id: string; student: StudentRecord; type: string; issuedAt: string; issuedBy: string; requestId: string; fileName: string };
type Tab = "requests" | "issued";
const statusTone: Record<RequestStatus,string> = {
  "Nouvelle demande":"new", "En cours":"progress", "Informations requises":"info",
  "Approuvée":"approved", "Rejetée":"rejected", "Document prêt":"ready", "Délivrée":"delivered"
};
const dateLabel = (value:string) => new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value+"T12:00:00"));
const dateTime = (value:string) => new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
const initials = (value:string) => value.trim().split(/\s+/).slice(0,2).map(x=>x[0]??"").join("").toLocaleUpperCase("fr-FR");

function buildDemoRecords(students: StudentRecord[]) {
  const eligible = students.filter(s=>s.enrollment && s.enrollment.status==="Actif");
  const types = ["Certificat de scolarité","Attestation de présence","Attestation d'inscription","Relevé de notes"];
  const statuses: RequestStatus[] = ["En cours","Nouvelle demande","Document prêt","Rejetée","Délivrée"];
  const records: RequestRecord[] = eligible.slice(0,5).map((student,index)=>{
    const guardian = student.guardiansResolved[0];
    const submittedAt = new Date(Date.now()-(index+1)*86400000*2).toISOString();
    const status = statuses[index];
    const parent = guardian?.name ?? "Demandeur non renseigné";
    const history: RequestRecord["history"] = [{label:"Demande reçue",actor:parent,date:submittedAt}];
    if(status!=="Nouvelle demande") history.push({label:status,actor:index%2===0?"Nadia El Fassi":"Service administratif",date:new Date(Date.now()-(index+1)*86400000).toISOString(),detail:status==="Rejetée"?"Informations justificatives insuffisantes.":undefined});
    return {id:"DEM-DOC-"+String(2026001+index),student,parent,relationship:guardian?.relationship??"Non précisée",type:types[index%types.length],submittedAt,status,assignedTo:index===1||index===2?"Nadia El Fassi":undefined,note:index===0?"Document demandé pour un dossier administratif.":index===3?"La demande nécessite une vérification complémentaire.":"Demande transmise depuis l’espace parent (exemple).",history};
  });
  const issued: IssuedRecord[] = records.filter(r=>r.status==="Délivrée").map((r,index)=>({id:"DOC-EMIS-"+String(2026001+index),student:r.student,type:r.type,issuedAt:r.history[r.history.length-1].date,issuedBy:"Service administratif",requestId:r.id,fileName:"Document_scolaire_demo.pdf"}));
  return {records,issued};
}

export function DocumentsPage({user}:Props) {
  const canRead = user.permissions.includes("documents.view");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [students,setStudents] = useState<StudentRecord[]>([]);
  const [tab,setTab] = useState<Tab>("requests");
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [search,setSearch] = useState("");
  const [year,setYear] = useState("all");
  const [classId,setClassId] = useState("all");
  const [type,setType] = useState("all");
  const [status,setStatus] = useState("all");
  const [page,setPage] = useState(1);
  const pageSize = 7;

  useEffect(()=>{
    if(!canRead){setLoading(false);return;}
    let active=true;
    studentsRepository.list().then(data=>{if(active)setStudents(data.students);})
      .catch(e=>{if(active)setError(e instanceof Error?e.message:"Impossible de charger les dossiers élèves.");})
      .finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[canRead]);

  const demo = useMemo(()=>buildDemoRecords(students),[students]);
  const requests = demo.records;
  const issued = demo.issued;
  const years = useMemo(()=>Array.from(new Map(students.filter(s=>s.enrollment).map(s=>[s.enrollment!.academicYearId,s.academicYearName])).entries()),[students]);
  const classes = useMemo(()=>Array.from(new Map(students.filter(s=>s.enrollment).map(s=>[s.enrollment!.classId,s.className])).entries()),[students]);
  const types = useMemo(()=>Array.from(new Set(requests.map(r=>r.type))),[requests]);
  const activeRecords = tab==="requests"?requests:issued;
  const filteredRequests = useMemo(()=>requests.filter(r=>
    (year==="all"||r.student.enrollment?.academicYearId===year)&&
    (classId==="all"||r.student.enrollment?.classId===classId)&&
    (type==="all"||r.type===type)&&(status==="all"||r.status===status)&&
    (!search.trim()||[r.id,r.student.firstName+" "+r.student.lastName,r.parent,r.student.code].some(v=>v.toLocaleLowerCase("fr-FR").includes(search.trim().toLocaleLowerCase("fr-FR"))))
  ),[requests,year,classId,type,status,search]);
  const filteredIssued = useMemo(()=>issued.filter(r=>
    (year==="all"||r.student.enrollment?.academicYearId===year)&&
    (classId==="all"||r.student.enrollment?.classId===classId)&&
    (type==="all"||r.type===type)&&
    (!search.trim()||[r.id,r.student.firstName+" "+r.student.lastName,r.requestId,r.student.code].some(v=>v.toLocaleLowerCase("fr-FR").includes(search.trim().toLocaleLowerCase("fr-FR"))))
  ),[issued,year,classId,type,search]);
  const rows = tab==="requests"?filteredRequests:filteredIssued;
  const pages = Math.max(1,Math.ceil(rows.length/pageSize));
  const visible = rows.slice((page-1)*pageSize,page*pageSize);
  const selected = requests.find(r=>r.id===selectedId)??null;
  const reset = ()=>{setSearch("");setYear("all");setClassId("all");setType("all");setStatus("all");setPage(1);};
  useEffect(()=>setPage(1),[tab,search,year,classId,type,status]);
  const count = (value:RequestStatus)=>requests.filter(r=>r.status===value).length;

  if(!canRead) return <main className="doc-page"><div className="doc-denied"><ShieldAlert size={25}/><h1>Accès non autorisé</h1><p>Votre compte ne dispose pas de l’autorisation nécessaire pour consulter la gestion des documents.</p></div></main>;

  return <main className="doc-page">
    <header className="doc-header">
      <div className="doc-breadcrumb">Vie scolaire <ChevronRight size={13}/><strong>Gestion des documents</strong></div>
      <div className="doc-heading"><div><h1>Gestion des documents</h1><p>Traitez les demandes et consultez les documents scolaires délivrés.</p></div><div className="doc-pending"><Clock3 size={15}/><span><b>{count("Nouvelle demande")+count("En cours")}</b> demandes à traiter</span></div></div>
    </header>

    <div className="doc-demo-notice"><Info size={17}/><div><strong>Mode démonstration — aucune opération documentaire n’est connectée</strong><p>Le projet contient les dossiers élèves et leurs pièces administratives, mais aucun modèle de demande parent, service de délivrance, stockage de fichiers, génération de documents ou notification. Les demandes et documents ci-dessous sont des exemples temporaires construits à partir des élèves inscrits. Aucune action de traitement ou de délivrance n’est simulée comme étant enregistrée.</p></div></div>
    {error&&<div className="doc-error"><AlertCircle size={16}/><span>{error}</span><button onClick={()=>window.location.reload()}>Réessayer</button></div>}

    <section className="doc-kpis">
      <article><span>Demandes reçues</span><strong>{loading?"—":requests.length}</strong><small>Exemples de demandes</small></article>
      <article><span>En attente de traitement</span><strong className="tone-pending">{loading?"—":count("Nouvelle demande")}</strong><small>Non prises en charge</small></article>
      <article><span>En cours de traitement</span><strong>{loading?"—":count("En cours")}</strong><small>Exemples en cours</small></article>
      <article><span>Documents délivrés</span><strong className="tone-success">{loading?"—":issued.length}</strong><small>Éléments de démonstration</small></article>
      <article><span>Demandes rejetées</span><strong className="tone-danger">{loading?"—":count("Rejetée")}</strong><small>Exemples rejetés</small></article>
    </section>

    <section className="doc-workspace">
      <div className="doc-tabs" role="tablist" aria-label="Espaces documentaires">
        <button role="tab" aria-selected={tab==="requests"} className={tab==="requests"?"active":""} onClick={()=>{setTab("requests");setSelectedId(null);}}><FileText size={15}/>Demandes de documents<span>{requests.length}</span></button>
        <button role="tab" aria-selected={tab==="issued"} className={tab==="issued"?"active":""} onClick={()=>{setTab("issued");setSelectedId(null);}}><FileCheck2 size={15}/>Documents délivrés<span>{issued.length}</span></button>
      </div>
      <div className="doc-panel-head"><div><h2>{tab==="requests"?"Demandes de documents":"Documents délivrés"}</h2><p>{tab==="requests"?"Suivi des demandes transmises par les responsables légaux.":"Registre des documents remis aux familles."}</p></div><span>{rows.length} résultat(s)</span></div>
      <div className="doc-filters">
        <label className="doc-search"><span><Search size={15}/></span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tab==="requests"?"Rechercher un élève, parent ou référence…":"Rechercher un document, élève ou demande…"}/></label>
        <select aria-label="Année scolaire" value={year} onChange={e=>setYear(e.target.value)}><option value="all">Toutes les années</option>{years.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>
        <select aria-label="Classe ou groupe" value={classId} onChange={e=>setClassId(e.target.value)}><option value="all">Toutes les classes</option>{classes.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>
        <select aria-label="Type de document" value={type} onChange={e=>setType(e.target.value)}><option value="all">Tous les types</option>{types.map(v=><option key={v}>{v}</option>)}</select>
        {tab==="requests"&&<select aria-label="Statut" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Tous les statuts</option>{Object.keys(statusTone).map(v=><option key={v}>{v}</option>)}</select>}
        <button className="doc-reset" onClick={reset}><FilterX size={14}/>Réinitialiser</button>
      </div>
      <div className="doc-table-wrap">
        {loading?<div className="doc-loading"><span className="doc-spinner"/><span>Chargement des dossiers élèves…</span></div>:tab==="requests"?(
          filteredRequests.length?<table><thead><tr><th>RÉFÉRENCE</th><th>ÉLÈVE</th><th>PARENT DEMANDEUR</th><th>CLASSE / GROUPE</th><th>TYPE DE DOCUMENT</th><th>DATE DE DEMANDE</th><th>STATUT</th><th>RESPONSABLE</th><th/></tr></thead><tbody>{visible.map(r=><tr key={r.id} onClick={()=>setSelectedId(r.id)}><td><b className="doc-ref">{r.id}</b></td><td><strong className="doc-primary">{r.student.firstName} {r.student.lastName}</strong><small className="doc-subline">{r.student.code}</small></td><td>{r.parent}<small className="doc-subline">{r.relationship}</small></td><td>{r.student.className}<small className="doc-subline">{r.student.groupName}</small></td><td>{r.type}</td><td>{dateLabel(r.submittedAt.slice(0,10))}</td><td><span className={"doc-status "+statusTone[r.status]}>{r.status}</span></td><td>{r.assignedTo??"Non affecté"}</td><td><button className="doc-icon-button" aria-label={"Consulter la demande "+r.id} onClick={e=>{e.stopPropagation();setSelectedId(r.id);}}><Eye size={15}/></button></td></tr>)}</tbody></table>:<div className="doc-empty"><FileText size={24}/><strong>{requests.length?"Aucune demande ne correspond aux filtres":"Aucune demande de document"}</strong><p>{requests.length?"Modifiez les filtres ou la recherche pour afficher d’autres demandes.":"Les demandes apparaîtront ici lorsque le workflow parent sera intégré."}</p><button onClick={reset}>Réinitialiser les filtres</button></div>
        ):filteredIssued.length?<table><thead><tr><th>RÉFÉRENCE</th><th>ÉLÈVE</th><th>TYPE DE DOCUMENT</th><th>DATE DE DÉLIVRANCE</th><th>DÉLIVRÉ PAR</th><th>DEMANDE ASSOCIÉE</th><th>FICHIER</th><th/></tr></thead><tbody>{visible.map(r=><tr key={r.id}><td><b className="doc-ref">{r.id}</b></td><td><strong className="doc-primary">{r.student.firstName} {r.student.lastName}</strong><small className="doc-subline">{r.student.code}</small></td><td>{r.type}</td><td>{dateLabel(r.issuedAt.slice(0,10))}</td><td>{r.issuedBy}</td><td>{r.requestId}</td><td><span className="doc-file-state"><FileText size={13}/>Exemple PDF</span></td><td><span className="doc-no-action">Non disponible</span></td></tr>)}</tbody></table>:<div className="doc-empty"><Archive size={24}/><strong>Aucun document délivré</strong><p>Les documents remis seront listés ici lorsque le service de délivrance sera disponible.</p><button onClick={reset}>Réinitialiser les filtres</button></div>}
      </div>
      <div className="doc-pagination"><span>Affichage de {rows.length?(page-1)*pageSize+1:0} à {Math.min(page*pageSize,rows.length)} sur {rows.length}</span><div><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Précédent</button><b>{page} / {pages}</b><button disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Suivant</button></div></div>
    </section>

    {selected&&<div className="doc-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedId(null);}}><aside className="doc-drawer">
      <div className="doc-drawer-head"><div><span>DÉTAIL DE LA DEMANDE · DÉMONSTRATION</span><h2>{selected.type}</h2><p>{selected.id} · reçue le {dateTime(selected.submittedAt)}</p></div><button onClick={()=>setSelectedId(null)} aria-label="Fermer"><X size={17}/></button></div>
      <div className="doc-drawer-body">
        <div className="doc-detail-status"><span className={"doc-status "+statusTone[selected.status]}>{selected.status}</span><span>Exemple non enregistré</span></div>
        <section className="doc-detail-section"><h3><UserRound size={15}/>Élève</h3><div className="doc-person"><span>{initials(selected.student.firstName+" "+selected.student.lastName)}</span><div><strong>{selected.student.firstName} {selected.student.lastName}</strong><small>{selected.student.code}</small></div></div><dl><dt>Classe / Groupe</dt><dd>{selected.student.className} · {selected.student.groupName}</dd><dt>Niveau</dt><dd>{selected.student.levelName}</dd><dt>Année scolaire</dt><dd>{selected.student.academicYearName}</dd></dl></section>
        <section className="doc-detail-section"><h3><UserRound size={15}/>Parent demandeur</h3><dl><dt>Nom</dt><dd>{selected.parent}</dd><dt>Lien avec l’élève</dt><dd>{selected.relationship}</dd><dt>Coordonnées</dt><dd className="doc-muted">Non affichées dans cette démonstration</dd></dl></section>
        <section className="doc-detail-section"><h3><FileText size={15}/>Informations de traitement</h3><dl><dt>Type demandé</dt><dd>{selected.type}</dd><dt>Responsable</dt><dd>{selected.assignedTo??"Non affecté"}</dd><dt>Informations transmises</dt><dd>{selected.note}</dd></dl></section>
        <section className="doc-detail-section"><h3><Clock3 size={15}/>Historique de traitement</h3><div className="doc-history">{selected.history.map((h,i)=><div key={i}><i/><span><strong>{h.label}</strong><small>{h.actor} · {dateTime(h.date)}</small>{h.detail&&<em>{h.detail}</em>}</span></div>)}</div></section>
        <div className="doc-drawer-note"><Info size={15}/><p>Les pièces jointes, fichiers finaux et décisions de traitement ne sont pas disponibles : aucun workflow documentaire ni stockage sécurisé n’est présent dans le projet.</p></div>
      </div>
      <div className="doc-drawer-footer"><span>Consultation uniquement</span><button onClick={()=>setSelectedId(null)}>Fermer</button></div>
    </aside></div>}
  </main>;
}
