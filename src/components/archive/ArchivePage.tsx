import { useEffect, useMemo, useState } from "react";
import {
  Archive, AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, CalendarDays,
  Check, ChevronLeft, ChevronRight, Clock3, Database,
  Eye, FileCheck2, Filter, Info, LockKeyhole, RefreshCw,
  Search, ShieldAlert, X
} from "lucide-react";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import { archiveDemoRepository, type ArchiveRecord } from "../../services/archive-demo";
import { academicYearRepository, type AcademicYear } from "../../services/academic-years";
import "./ArchivePage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route:string)=>void }
type WizardStep = 1|2|3|4|5;
type SortKey = "academicYearName"|"createdAt"|"status";
const formatDate=(value:string)=>new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(value));
const formatDateTime=(value:string)=>new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
const moduleDescriptions:Record<string,string>={
 "Informations de l’établissement":"Identité et coordonnées de l’établissement.",
 "Structure académique":"Années, filières, niveaux, classes et matières.",
 "Élèves et dossiers":"Dossiers scolaires et informations des élèves.",
 "Parents":"Informations des parents et représentants légaux.",
 "Enseignants et personnel":"Dossiers des enseignants et employés.",
 "Notes et résultats":"Évaluations, notes et résultats scolaires.",
 "Examens":"Organisation et résultats des examens.",
 "Emplois du temps":"Horaires et organisation des cours.",
 "Présences et vie scolaire":"Absences, retards et suivi de la vie scolaire.",
 "Documents":"Documents administratifs et pédagogiques.",
 "Paiements et soldes":"Registres de paiement et soldes.",
 "Dépenses et rapports financiers":"Dépenses et états financiers.",
 "Transport et logistique":"Transport, sorties, incidents et inventaire.",
 "Communication":"Annonces, notifications et réunions.",
 "Traçabilité":"Historique et informations nécessaires à la traçabilité."
};
const wizardLabels=["Sélection de l’année","Contenu de l’archive","Vérifications préalables","Confirmation","Traitement"];
function Status({label}:{label:string}) {
 const cls=label==="Simulation terminée"?"done":label==="Terminée"||label==="Validé"?"good":label==="Bloquant"?"danger":label==="Avertissement"?"warn":"muted";
 return <span className={"ar-status "+cls}><i/>{label}</span>;
}
export function ArchivePage({user,onNavigate}:Props) {
 const authorized=user.role==="director"&&user.permissions.includes("archive.view");
 const [records,setRecords]=useState<ArchiveRecord[]>([]);
 const [years,setYears]=useState<AcademicYear[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [query,setQuery]=useState("");
 const [yearFilter,setYearFilter]=useState("Toutes les années");
 const [statusFilter,setStatusFilter]=useState("Tous les statuts");
 const [sortKey,setSortKey]=useState<SortKey>("createdAt");
 const [sortDir,setSortDir]=useState<"asc"|"desc">("desc");
 const [page,setPage]=useState(1);
 const [pageSize,setPageSize]=useState(5);
 const [selected,setSelected]=useState<ArchiveRecord|null>(null);
 const [wizard,setWizard]=useState(false);
 const [step,setStep]=useState<WizardStep>(1);
 const [selectedYear,setSelectedYear]=useState("");
 const [eligible,setEligible]=useState<AcademicYear[]>([]);
 const [loadingEligible,setLoadingEligible]=useState(false);
 const [wizardError,setWizardError]=useState("");
 const [confirmed,setConfirmed]=useState(false);
 const [processing,setProcessing]=useState(false);
 const [phase,setPhase]=useState(0);
 const [completedRecord,setCompletedRecord]=useState<ArchiveRecord|null>(null);
 const [lastRefresh,setLastRefresh]=useState("");
 const [notice,setNotice]=useState("");

 async function refresh() {
  if(!authorized)return;
  setLoading(true);setError("");
  try {
   const [archiveRows,yearRows]=await Promise.all([archiveDemoRepository.list(),academicYearRepository.list()]);
   setRecords(archiveRows);setYears(yearRows);setLastRefresh(new Date().toISOString());
  } catch(e) {setError(e instanceof Error?e.message:"Impossible de charger les archives.");}
  finally {setLoading(false);}
 }
 useEffect(()=>{void refresh();},[authorized]);
 const activeYear=years.find(y=>y.status==="Active");
 const filtered=useMemo(()=>{
  const q=query.trim().toLocaleLowerCase("fr-FR");
  return [...records].filter(r=>(!q||r.academicYearName.toLocaleLowerCase("fr-FR").includes(q)||r.id.toLocaleLowerCase("fr-FR").includes(q))&&(yearFilter==="Toutes les années"||r.academicYearName===yearFilter)&&(statusFilter==="Tous les statuts"||r.status===statusFilter))
   .sort((a,b)=>{const c=sortKey==="createdAt"?a.createdAt.localeCompare(b.createdAt):a[sortKey].localeCompare(b[sortKey],"fr");return sortDir==="asc"?c:-c;});
 },[records,query,yearFilter,statusFilter,sortKey,sortDir]);
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
 const safePage=Math.min(page,pages);
 const visible=filtered.slice((safePage-1)*pageSize,safePage*pageSize);
 useEffect(()=>setPage(1),[query,yearFilter,statusFilter,pageSize]);
 const latest=records[0]??null;
 const yearNames=[...new Set(records.map(r=>r.academicYearName))];
 async function openWizard(){
  setWizard(true);setStep(1);setWizardError("");setConfirmed(false);setCompletedRecord(null);setProcessing(false);setPhase(0);setSelectedYear("");
  setLoadingEligible(true);
  try{setEligible(await archiveDemoRepository.eligibleYears());}catch(e){setWizardError(e instanceof Error?e.message:"Impossible de charger les années éligibles.");}
  finally{setLoadingEligible(false);}
 }
 function closeWizard(){if(processing)return;setWizard(false);setWizardError("");}
 async function beginSimulation(){
  if(!confirmed||!selectedYear||processing)return;
  setProcessing(true);setStep(5);setPhase(0);setWizardError("");
  const phases=[0,1,2,3,4];
  for(const next of phases){setPhase(next);await new Promise(resolve=>window.setTimeout(resolve,850));}
  try{
   const record=await archiveDemoRepository.createSimulation(selectedYear,user.displayName);
   setCompletedRecord(record);setRecords(await archiveDemoRepository.list());setYears(await academicYearRepository.list());setNotice("Une entrée de démonstration a été créée. Aucun fichier ni jeu de données archivé n’existe.");
  }catch(e){setWizardError(e instanceof Error?e.message:"La simulation n’a pas pu être enregistrée.");}
  finally{setProcessing(false);}
 }
 const selectedAcademicYear=eligible.find(y=>y.id===selectedYear);
 const detail=selected;
 function changeSort(key:SortKey){if(sortKey===key)setSortDir(v=>v==="asc"?"desc":"asc");else{setSortKey(key);setSortDir("desc");}}
 function sortIcon(key:SortKey){return sortKey!==key?<ArrowUpDown size={12}/>:sortDir==="asc"?<ArrowUp size={12}/>:<ArrowDown size={12}/>}
 if(!authorized)return <main className="ar-page"><div className="ar-denied"><LockKeyhole size={27}/><h1>Accès non autorisé</h1><p>Le module Archives est exclusivement réservé à la direction de l’établissement.</p><button className="ar-btn secondary" onClick={()=>onNavigate("/overview")}>Retour au tableau de bord</button></div></main>;
 return <main className="ar-page">
  <div className="ar-breadcrumb">Administration <ChevronRight size={13}/> <strong>Archives</strong></div>
  <header className="ar-header"><div><span className="ar-eyebrow">ADMINISTRATION · CONSERVATION DES DONNÉES</span><h1>Archives</h1><p>Préservez, consultez et gérez les archives des années scolaires de votre établissement.</p></div><div className="ar-header-actions"><button className="ar-btn secondary" onClick={()=>void refresh()} disabled={loading}><RefreshCw size={14}/>Actualiser</button><button className="ar-btn primary" onClick={()=>void openWizard()}><Archive size={15}/>Créer une archive</button></div></header>
  <div className="ar-demo-banner"><Info size={17}/><div><strong>Mode démonstration — Données simulées</strong><p>Les éléments affichés sont des métadonnées fictives stockées dans ce navigateur. Aucune donnée scolaire n’est extraite, aucun fichier d’archive n’est créé et aucune vérification d’intégrité réelle n’est effectuée.</p></div><span>LOCAL · DEMO</span></div>
  {notice&&<div className="ar-notice"><Check size={15}/>{notice}<button onClick={()=>setNotice("")}><X size={14}/></button></div>}
  {error&&<div className="ar-error"><AlertCircle size={16}/><span>{error}</span><button onClick={()=>void refresh()}>Réessayer</button></div>}
  <section className="ar-context"><div><small>ANNÉE SCOLAIRE ACTIVE</small><strong>{activeYear?.name??"Aucune année active"}</strong><span>{activeYear?"Les années actives ne sont pas éligibles à la simulation d’archivage.":"Aucun statut actif n’est défini dans les données actuelles."}</span></div><div><small>DERNIÈRE ACTUALISATION</small><strong>{lastRefresh?formatDateTime(lastRefresh):"—"}</strong><span>Lecture des données locales du navigateur</span></div><div><small>DESTINATION DE STOCKAGE</small><strong>Non configurée</strong><span>Aucun service de stockage d’archives connecté</span></div></section>
  <section className="ar-kpis">
   <article><span className="ar-kpi-icon"><Archive size={17}/></span><div><small>Archives disponibles</small><strong>{records.length}</strong><em>Métadonnées de démonstration</em></div></article>
   <article><span className="ar-kpi-icon"><CalendarDays size={17}/></span><div><small>Années scolaires archivées</small><strong>{new Set(records.map(r=>r.academicYearId)).size}</strong><em>Entrées locales simulées</em></div></article>
   <article><span className="ar-kpi-icon"><Clock3 size={17}/></span><div><small>Dernière archive créée</small><strong>{latest?formatDate(latest.createdAt):"Aucune"}</strong><em>{latest?.academicYearName??"Aucune entrée disponible"}</em></div></article>
  </section>
  <section className="ar-table-card">
   <div className="ar-table-heading"><div><h2>Archives de l’établissement</h2><p>Consultez les entrées de démonstration enregistrées localement.</p></div><span className="ar-count">{filtered.length} résultat(s)</span></div>
   <div className="ar-filters"><label className="ar-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher une année ou un identifiant…"/></label><label className="ar-select"><Filter size={14}/><select value={yearFilter} onChange={e=>setYearFilter(e.target.value)}><option>Toutes les années</option>{yearNames.map(y=><option key={y}>{y}</option>)}</select></label><label className="ar-select"><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Tous les statuts</option><option>Simulation terminée</option></select></label></div>
   {loading?<div className="ar-loading"><i/><i/><i/><i/></div>:visible.length===0?<div className="ar-empty"><Archive size={27}/><strong>{records.length===0?"Aucune archive disponible pour le moment.":"Aucun résultat ne correspond aux filtres sélectionnés."}</strong><span>{records.length===0?"Créez une entrée de démonstration à partir d’une année scolaire terminée.":"Modifiez les filtres ou la recherche pour afficher des résultats."}</span>{records.length===0&&<button className="ar-btn secondary" onClick={()=>void openWizard()}>Créer une archive de démonstration</button>}</div>:<><div className="ar-table-wrap"><table className="ar-table"><thead><tr><th><button onClick={()=>changeSort("academicYearName")}>Année scolaire {sortIcon("academicYearName")}</button></th><th><button onClick={()=>changeSort("createdAt")}>Date d’archivage {sortIcon("createdAt")}</button></th><th>Créée par</th><th>Élèves</th><th>Classes</th><th>Modules</th><th>Taille</th><th><button onClick={()=>changeSort("status")}>Statut {sortIcon("status")}</button></th><th>Actions</th></tr></thead><tbody>{visible.map(row=><tr key={row.id}><td><strong>{row.academicYearName}</strong><small>{row.id}</small></td><td>{formatDateTime(row.createdAt)}</td><td>{row.createdBy}</td><td>{row.studentCount.toLocaleString("fr-FR")}</td><td>{row.classCount}</td><td><span className="ar-module-count">{row.modules.length} catégories</span></td><td><span className="ar-unavailable">Non disponible</span></td><td><Status label={row.status}/><small className="ar-verify">Vérification : {row.verificationStatus}</small></td><td><button className="ar-icon-btn" title="Consulter les détails" aria-label="Consulter les détails" onClick={()=>setSelected(row)}><Eye size={15}/></button></td></tr>)}</tbody></table></div><footer className="ar-pagination"><span>Affichage de {(safePage-1)*pageSize+1} à {Math.min(safePage*pageSize,filtered.length)} sur {filtered.length}</span><label>Par page <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select></label><button disabled={safePage===1} onClick={()=>setPage(v=>Math.max(1,v-1))}><ChevronLeft size={15}/></button><span>Page {safePage} / {pages}</span><button disabled={safePage===pages} onClick={()=>setPage(v=>Math.min(pages,v+1))}><ChevronRight size={15}/></button></footer></>}
  </section>
  <div className="ar-footnote"><ShieldAlert size={15}/><span>Une archive enregistrée sur le même appareil n’est pas une sauvegarde indépendante. La restauration, le téléchargement, la suppression et la sauvegarde externe ne sont pas disponibles dans cette version.</span></div>
  {detail&&<div className="ar-drawer-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}><aside className="ar-drawer"><header><div><small>CONSULTATION · MÉTADONNÉES LOCALES</small><h2>Archive {detail.academicYearName}</h2><span>{detail.id}</span></div><button className="ar-icon-btn" onClick={()=>setSelected(null)} aria-label="Fermer"><X size={17}/></button></header><div className="ar-drawer-content"><div className="ar-detail-banner"><Archive size={20}/><div><strong>{detail.academicYearName}</strong><span>Entrée de démonstration uniquement</span></div><Status label={detail.status}/></div><section><h3>Informations générales</h3><dl><div><dt>Identifiant</dt><dd>{detail.id}</dd></div><div><dt>Date de création</dt><dd>{formatDateTime(detail.createdAt)}</dd></div><div><dt>Créée par</dt><dd>{detail.createdBy}</dd></div><div><dt>Élèves associés à l’année</dt><dd>{detail.studentCount.toLocaleString("fr-FR")}</dd></div><div><dt>Classes associées à l’année</dt><dd>{detail.classCount}</dd></div><div><dt>Taille du fichier</dt><dd>Non disponible — aucun fichier créé</dd></div></dl></section><section><h3>Contenu illustratif</h3><div className="ar-detail-warning"><Info size={15}/><span>Les catégories ci-dessous illustrent le périmètre envisagé. Leur présence ne signifie pas que des données ont été extraites ou conservées.</span></div><ul className="ar-module-list">{detail.modules.map(m=><li key={m}><span><strong>{m}</strong><small>{moduleDescriptions[m]}</small></span><Status label="Simulation"/></li>)}</ul></section><section><h3>Vérification</h3><div className="ar-verification"><FileCheck2 size={18}/><div><strong>Intégrité non vérifiée</strong><span>Aucun processus de contrôle d’intégrité n’est connecté. Aucun checksum ni test de restauration n’a été exécuté.</span></div></div></section><section><h3>Historique</h3><div className="ar-history"><span className="ar-history-dot"/><div><strong>Entrée de démonstration enregistrée</strong><small>{formatDateTime(detail.createdAt)} · {detail.createdBy}</small><p>Aucune opération réelle d’extraction, d’exportation ou de restauration.</p></div></div></section></div><footer><button className="ar-btn secondary" onClick={()=>setSelected(null)}>Fermer</button></footer></aside></div>}
  {wizard&&<div className="ar-modal-overlay"><section className="ar-wizard" role="dialog" aria-modal="true" aria-labelledby="ar-wizard-title"><header><div><small>ASSISTANT DE CRÉATION · MODE DÉMONSTRATION</small><h2 id="ar-wizard-title">Créer une archive</h2></div><button className="ar-icon-btn" onClick={closeWizard} disabled={processing} aria-label="Fermer"><X size={17}/></button></header><div className="ar-steps">{wizardLabels.map((label,i)=><div key={label} className={(step===i+1?"current ":"")+(step>i+1?"passed":"")}><span>{step>i+1?<Check size={12}/>:i+1}</span><small>{label}</small></div>)}</div><div className="ar-wizard-content">
   {step===1&&<><h3>Sélection de l’année</h3><p>Seules les années dont le statut existant est « Terminée » sont proposées. L’année active et les brouillons sont exclus.</p>{loadingEligible?<div className="ar-loading"><i/><i/></div>:eligible.length===0?<div className="ar-empty compact"><CalendarDays size={23}/><strong>Aucune année scolaire n'est actuellement disponible pour l'archivage.</strong><span>Une année doit être marquée « Terminée » dans Gestion académique. Les années déjà représentées par une entrée de démonstration sont exclues.</span></div>:<div className="ar-year-options">{eligible.map(y=><button key={y.id} className={selectedYear===y.id?"selected":""} onClick={()=>setSelectedYear(y.id)}><span className="ar-radio">{selectedYear===y.id&&<i/>}</span><span><strong>Année scolaire {y.name}</strong><small>{formatDate(y.startDate)} – {formatDate(y.endDate)}</small><small>{y.studentCount.toLocaleString("fr-FR")} élèves · {y.classCount} classes</small></span><Status label={y.status}/></button>)}</div>}</>}
   {step===2&&<><h3>Contenu de l’archive</h3><p>Liste indicative des catégories prévues. Le projet ne dispose pas encore d’un moteur d’extraction ni d’une sélection de modules côté stockage.</p><div className="ar-module-legend"><Database size={15}/>Catégories illustratives · non extraites</div><div className="ar-wizard-modules">{archiveDemoRepository.demoModules.map(m=><div key={m}><span><strong>{m}</strong><small>{moduleDescriptions[m]}</small></span><Status label="Simulation"/></div>)}</div></>}
   {step===3&&<><h3>Vérifications préalables</h3><p>Les données disponibles permettent uniquement de confirmer le statut de l’année. Les contrôles techniques et d’intégrité ne sont pas fournis par le projet.</p><div className="ar-check-list"><div><span><Check size={15}/></span><div><strong>Année scolaire terminée</strong><small>{selectedAcademicYear?.name??"Année sélectionnée"} — statut issu du registre des années scolaires.</small></div><Status label="Validé"/></div><div><span><Info size={15}/></span><div><strong>Accès aux données sources</strong><small>Aucun service d’export ou d’extraction d’archives n’est connecté.</small></div><Status label="Non vérifié"/></div><div><span><Info size={15}/></span><div><strong>Relations entre enregistrements</strong><small>Aucun contrôle de cohérence des données archivées n’est disponible.</small></div><Status label="Non vérifié"/></div><div><span><Info size={15}/></span><div><strong>Destination de stockage</strong><small>Aucun stockage de fichiers d’archives n’est configuré.</small></div><Status label="Non vérifié"/></div><div><span><Info size={15}/></span><div><strong>Intégrité et possibilité de restauration</strong><small>Aucun mécanisme de vérification ou de restauration n’est implémenté.</small></div><Status label="Non vérifié"/></div></div><div className="ar-readiness-note"><ShieldAlert size={16}/><span>Ces contrôles ne permettent pas de créer une véritable archive. L’action proposée à l’étape suivante enregistrera uniquement une entrée de démonstration dans ce navigateur.</span></div></>}
   {step===4&&<><h3>Confirmation de la simulation</h3><p>Vérifiez les informations avant d’enregistrer les métadonnées fictives.</p><div className="ar-confirm-summary"><div><small>ANNÉE SCOLAIRE</small><strong>{selectedAcademicYear?.name??"—"}</strong></div><div><small>CRÉÉE PAR</small><strong>{user.displayName}</strong></div><div><small>CATÉGORIES ILLUSTRATIVES</small><strong>{archiveDemoRepository.demoModules.length}</strong></div><div><small>TAILLE / NOMBRE DE DONNÉES</small><strong>Non disponible</strong></div></div><div className="ar-confirm-warning"><AlertCircle size={17}/><div><strong>Ce n’est pas une sauvegarde.</strong><p>Aucun dossier élève, paiement, document ou autre enregistrement ne sera copié. Les données sources restent inchangées. Aucun fichier ne sera créé et aucune restauration ne sera possible.</p></div></div><label className="ar-confirm-check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> <span>Je comprends qu’il s’agit uniquement d’une simulation locale et non d’une archive de données.</span></label></>}
   {step===5&&<><h3>{completedRecord?"Simulation enregistrée":"Traitement de démonstration"}</h3><p>Les étapes ci-dessous illustrent un flux d’interface. Elles ne correspondent pas à une extraction ou à un traitement de données réel.</p><div className="ar-process-list">{["Préparation","Extraction des données (simulée)","Vérification (non exécutée)","Enregistrement des métadonnées locales","Terminé"].map((p,i)=><div key={p} className={phase===i?"active":phase>i?"passed":""}><span>{phase>i||completedRecord?<Check size={13}/>:i+1}</span><strong>{p}</strong><small>{phase===i&&!completedRecord?"En cours…":phase>i||completedRecord?"Étape de démonstration":"En attente"}</small></div>)}</div>{processing&&<div className="ar-processing-note"><span className="ar-spinner"/><span>Simulation en cours. Ne fermez pas cette fenêtre.</span></div>}{wizardError&&<div className="ar-error"><AlertCircle size={15}/>{wizardError}</div>}{completedRecord&&<div className="ar-complete"><Check size={18}/><div><strong>Entrée de démonstration enregistrée</strong><span>{completedRecord.id} · {formatDateTime(completedRecord.createdAt)}</span><small>Aucun fichier d’archive n’a été créé.</small></div></div>}</>}
   {wizardError&&step!==5&&<div className="ar-error"><AlertCircle size={15}/>{wizardError}</div>}
  </div><footer><div>{step>1&&step<5&&<button className="ar-btn secondary" onClick={()=>setStep(v=>(v-1) as WizardStep)}><ChevronLeft size={14}/>Précédent</button>}</div><div>{step<4?<button className="ar-btn primary" disabled={step===1?!selectedYear||loadingEligible:step===2?false:!selectedYear} onClick={()=>setStep(v=>(v+1) as WizardStep)}>Continuer<ChevronRight size={14}/></button>:step===4?<button className="ar-btn primary" disabled={!confirmed||!selectedYear} onClick={()=>void beginSimulation()}><Archive size={14}/>Confirmer la simulation</button>:<button className="ar-btn primary" disabled={processing||!completedRecord} onClick={()=>{setWizard(false);setSelected(completedRecord);setCompletedRecord(null);}}>{completedRecord?"Consulter l’entrée":"Traitement…"}<ChevronRight size={14}/></button>}</div></footer></section></div>}
 </main>;
}
