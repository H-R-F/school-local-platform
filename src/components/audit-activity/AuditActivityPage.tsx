import { useMemo, useState } from "react";
import {
  AlertCircle, ArrowDown, ArrowUp, CalendarDays, ChevronLeft, ChevronRight,
  Clock3, Eye, FileSearch, Info, RefreshCw, Search, ShieldAlert, ShieldCheck, X
} from "lucide-react";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import { schoolBranding } from "../../config/school";
import "./AuditActivityPage.css";

interface Props { user: AuthenticatedSidebarUser }
type Category = "Authentification" | "Gestion des comptes" | "Données sensibles" | "Finance" | "Administration";
type Result = "Réussi" | "Refusé" | "Échoué";
type AuditEvent = {
  id: string; at: string; actor: string; actorId: string; role: string; category: Category;
  type: string; module: string; action: string; target: string; result: Result;
  detail: string; before?: { field: string; value: string }; after?: { field: string; value: string };
};
type Period = "today" | "7" | "30" | "90" | "all" | "custom";
type SortKey = "at" | "actor" | "module" | "type" | "result";
const categories: Category[] = ["Authentification", "Gestion des comptes", "Données sensibles", "Finance", "Administration"];
const now = Date.now();
const ago = (minutes: number) => new Date(now - minutes * 60000).toISOString();
const demoEvents: AuditEvent[] = [
  { id:"AUD-DEMO-2081",at:ago(12),actor:"Youssef Benali",actorId:"USR-DEMO-014",role:"Responsable financier et logistique",category:"Authentification",type:"Connexion échouée",module:"Authentification",action:"Tentative de connexion refusée après identifiants invalides",target:"Compte · usr-demo-014",result:"Échoué",detail:"Événement fictif. Aucun fournisseur d’authentification n’a enregistré cette tentative." },
  { id:"AUD-DEMO-2080",at:ago(18),actor:"Youssef Benali",actorId:"USR-DEMO-014",role:"Responsable financier et logistique",category:"Authentification",type:"Connexion échouée",module:"Authentification",action:"Tentative de connexion refusée après identifiants invalides",target:"Compte · usr-demo-014",result:"Échoué",detail:"Événement fictif lié au même compte de démonstration." },
  { id:"AUD-DEMO-2079",at:ago(26),actor:"Youssef Benali",actorId:"USR-DEMO-014",role:"Responsable financier et logistique",category:"Authentification",type:"Connexion échouée",module:"Authentification",action:"Tentative de connexion refusée après identifiants invalides",target:"Compte · usr-demo-014",result:"Échoué",detail:"Événement fictif lié au même compte de démonstration." },
  { id:"AUD-DEMO-2078",at:ago(54),actor:"Salma El Amrani",actorId:"USR-DEMO-001",role:"Directrice",category:"Gestion des comptes",type:"Modification du rôle",module:"Comptes et autorisations",action:"Rôle d’un compte modifié",target:"Compte · usr-demo-022",result:"Réussi",detail:"Modification fictive présentée à titre de démonstration.",before:{field:"Rôle",value:"Enseignant"},after:{field:"Rôle",value:"Responsable pédagogique"} },
  { id:"AUD-DEMO-2077",at:ago(130),actor:"Salma El Amrani",actorId:"USR-DEMO-001",role:"Directrice",category:"Administration",type:"Modification d’un paramètre",module:"Paramètres de l’établissement",action:"Paramètre de l’année scolaire modifié",target:"Configuration · année active",result:"Réussi",detail:"Modification fictive de configuration.",before:{field:"Année active",value:"2025–2026"},after:{field:"Année active",value:"2026–2027"} },
  { id:"AUD-DEMO-2076",at:ago(245),actor:"Nadia Rahmani",actorId:"USR-DEMO-009",role:"Responsable pédagogique",category:"Données sensibles",type:"Exportation de données",module:"Dossiers élèves",action:"Export d’un extrait de dossiers élèves",target:"Export · EXP-DEMO-041",result:"Réussi",detail:"Exemple fictif d’export. Aucun fichier réel ni dossier personnel n’a été consulté ou exporté." },
  { id:"AUD-DEMO-2075",at:ago(390),actor:"Youssef Benali",actorId:"USR-DEMO-014",role:"Responsable financier et logistique",category:"Finance",type:"Validation d’un paiement",module:"Paiements",action:"Paiement validé",target:"Paiement · PAY-DEMO-321",result:"Réussi",detail:"Transaction fictive. Aucun mouvement financier réel n’a été effectué." },
  { id:"AUD-DEMO-2074",at:ago(570),actor:"Salma El Amrani",actorId:"USR-DEMO-001",role:"Directrice",category:"Données sensibles",type:"Suppression d’un document",module:"Documents",action:"Suppression d’un document autorisée",target:"Document · DOC-DEMO-108",result:"Réussi",detail:"Exemple fictif. Aucun document réel n’a été supprimé." },
  { id:"AUD-DEMO-2073",at:ago(850),actor:"Hicham Alaoui",actorId:"USR-DEMO-031",role:"Responsable administratif",category:"Gestion des comptes",type:"Désactivation d’un compte",module:"Comptes et autorisations",action:"Demande de désactivation refusée",target:"Compte · usr-demo-001",result:"Refusé",detail:"Exemple fictif de refus. Aucun compte réel n’a été désactivé." },
  { id:"AUD-DEMO-2072",at:ago(1450),actor:"Nadia Rahmani",actorId:"USR-DEMO-009",role:"Responsable pédagogique",category:"Authentification",type:"Déconnexion",module:"Authentification",action:"Fin de session de démonstration",target:"Compte · usr-demo-009",result:"Réussi",detail:"Événement fictif. Aucun identifiant de session réel n’est disponible." },
  { id:"AUD-DEMO-2071",at:ago(2880),actor:"Salma El Amrani",actorId:"USR-DEMO-001",role:"Directrice",category:"Gestion des comptes",type:"Modification des permissions",module:"Comptes et autorisations",action:"Ensemble de permissions modifié",target:"Compte · usr-demo-022",result:"Réussi",detail:"Exemple fictif de changement de permissions.",before:{field:"Permission",value:"pedagogy.content.view"},after:{field:"Permission",value:"pedagogy.reports.view"} },
  { id:"AUD-DEMO-2070",at:ago(7200),actor:"Youssef Benali",actorId:"USR-DEMO-014",role:"Responsable financier et logistique",category:"Finance",type:"Validation d’une dépense",module:"Dépenses",action:"Dépense validée",target:"Dépense · EXP-DEMO-088",result:"Réussi",detail:"Opération financière fictive, sans effet comptable réel." },
  { id:"AUD-DEMO-2069",at:ago(16000),actor:"Hicham Alaoui",actorId:"USR-DEMO-031",role:"Responsable administratif",category:"Administration",type:"Modification du profil",module:"Profil de l’établissement",action:"Coordonnées de l’établissement modifiées",target:"Profil · établissement",result:"Réussi",detail:"Modification fictive du profil de l’établissement." },
  { id:"AUD-DEMO-2068",at:ago(30000),actor:"Nadia Rahmani",actorId:"USR-DEMO-009",role:"Responsable pédagogique",category:"Données sensibles",type:"Modification de données personnelles",module:"Dossiers élèves",action:"Champ de dossier modifié",target:"Dossier élève · ELEVE-DEMO-084",result:"Réussi",detail:"Exemple fictif. Les valeurs présentées ne correspondent à aucune personne réelle.",before:{field:"Classe",value:"3e A"},after:{field:"Classe",value:"3e B"} },
  { id:"AUD-DEMO-2067",at:ago(50000),actor:"Salma El Amrani",actorId:"USR-DEMO-001",role:"Directrice",category:"Authentification",type:"Connexion réussie",module:"Authentification",action:"Connexion de démonstration réussie",target:"Compte · usr-demo-001",result:"Réussi",detail:"Événement fictif, non issu d’un système de connexion réel." }
];
const formatDate = (value: string) => new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
const startOfToday = () => { const date = new Date(); date.setHours(0,0,0,0); return date.getTime(); };
function resultClass(result: Result) { return result === "Réussi" ? "success" : result === "Refusé" ? "denied" : "failed"; }
export function AuditActivityPage({ user }: Props) {
  const authorized = user.permissions.includes("audit.view") && user.role === "director";
  const [items] = useState<AuditEvent[]>(demoEvents);
  const [period,setPeriod] = useState<Period>("30");
  const [customFrom,setCustomFrom] = useState("");
  const [customTo,setCustomTo] = useState("");
  const [category,setCategory] = useState("Toutes");
  const [query,setQuery] = useState("");
  const [actor,setActor] = useState("Tous");
  const [role,setRole] = useState("Tous");
  const [module,setModule] = useState("Tous");
  const [result,setResult] = useState("Tous");
  const [quickFilter,setQuickFilter] = useState<"all"|"sensitive"|"failed"|"denied"|"permissions">("all");
  const [sortKey,setSortKey] = useState<SortKey>("at");
  const [sortDirection,setSortDirection] = useState<"asc"|"desc">("desc");
  const [page,setPage] = useState(1);
  const [selected,setSelected] = useState<AuditEvent|null>(null);
  const [refreshedAt,setRefreshedAt] = useState(new Date());
  const [refreshNotice,setRefreshNotice] = useState("");
  const [periodNotice,setPeriodNotice] = useState("");
  const pageSize = 8;

  const periodStart = useMemo(() => {
    if (period === "today") return startOfToday();
    if (period === "7" || period === "30" || period === "90") return now - Number(period) * 86400000;
    if (period === "custom" && customFrom) return new Date(customFrom + "T00:00:00").getTime();
    return 0;
  },[period,customFrom]);
  const periodEnd = useMemo(() => period === "custom" && customTo ? new Date(customTo + "T23:59:59.999").getTime() : Date.now(),[period,customTo]);
  const periodItems = useMemo(() => items.filter(item => {
    const at = new Date(item.at).getTime();
    return at >= periodStart && at <= periodEnd;
  }),[items,periodStart,periodEnd]);
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("fr");
    return periodItems.filter(item => {
      const matchesQuery = !q || [item.id,item.actor,item.actorId,item.role,item.type,item.action,item.module,item.target].some(value=>value.toLocaleLowerCase("fr").includes(q));
      const matchesQuick = quickFilter==="all" || (quickFilter==="sensitive" && ["Données sensibles","Finance","Administration"].includes(item.category)) || (quickFilter==="failed" && item.category==="Authentification" && item.result==="Échoué") || (quickFilter==="denied" && item.result==="Refusé") || (quickFilter==="permissions" && item.type.toLocaleLowerCase("fr").includes("permission"));
      return matchesQuery && matchesQuick && (category==="Toutes" || item.category===category) &&
        (actor==="Tous" || item.actor===actor) && (role==="Tous" || item.role===role) &&
        (module==="Tous" || item.module===module) && (result==="Tous" || item.result===result);
    }).sort((a,b) => {
      const sign = sortDirection==="asc" ? 1 : -1;
      const left = sortKey==="at" ? new Date(a.at).getTime() : a[sortKey].toLocaleLowerCase("fr");
      const right = sortKey==="at" ? new Date(b.at).getTime() : b[sortKey].toLocaleLowerCase("fr");
      const comparison = sortKey==="at" ? (Number(left)-Number(right)) : String(left).localeCompare(String(right),"fr");
      return comparison * sign;
    });
  },[periodItems,query,category,actor,role,module,result,quickFilter,sortKey,sortDirection]);
  const pages = Math.max(1,Math.ceil(filtered.length/pageSize));
  const visible = filtered.slice((page-1)*pageSize,page*pageSize);
  const counts = useMemo(() => ({
    total:periodItems.length,
    sensitive:periodItems.filter(e=>e.category==="Données sensibles" || e.category==="Finance" || e.category==="Administration").length,
    failed:periodItems.filter(e=>e.category==="Authentification" && e.result==="Échoué").length,
    denied:periodItems.filter(e=>e.result==="Refusé").length,
    permissions:periodItems.filter(e=>e.type.toLocaleLowerCase("fr").includes("permission") || e.type.toLocaleLowerCase("fr").includes("rôle")).length
  }),[periodItems]);
  const investigation = useMemo(() => {
    const failed = periodItems.filter(e=>e.category==="Authentification" && e.result==="Échoué");
    const grouped = new Map<string,AuditEvent[]>();
    failed.forEach(event=>grouped.set(event.actorId,[...(grouped.get(event.actorId)||[]),event]));
    return [...grouped.entries()].filter(([,events])=>events.length>1).map(([actorId,events])=>({actorId,actor:events[0].actor,events:events.sort((a,b)=>a.at.localeCompare(b.at))}));
  },[periodItems]);
  const actors = useMemo(()=>Array.from(new Set(items.map(e=>e.actor))).sort((a,b)=>a.localeCompare(b,"fr")),[items]);
  const roles = useMemo(()=>Array.from(new Set(items.map(e=>e.role))).sort((a,b)=>a.localeCompare(b,"fr")),[items]);
  const modules = useMemo(()=>Array.from(new Set(items.map(e=>e.module))).sort((a,b)=>a.localeCompare(b,"fr")),[items]);
  const hasFilters = query || category!=="Toutes" || actor!=="Tous" || role!=="Tous" || module!=="Tous" || result!=="Tous" || quickFilter!=="all";
  function resetFilters() { setCategory("Toutes");setQuery("");setActor("Tous");setRole("Tous");setModule("Tous");setResult("Tous");setQuickFilter("all");setPage(1); }
  function changePeriod(value: Period) { setPeriod(value);setPage(1);setPeriodNotice(""); }
  function refresh() { setRefreshedAt(new Date());setRefreshNotice("Données locales de démonstration actualisées. Aucun journal de production n’est connecté."); }
  function toggleSort(key: SortKey) { if(sortKey===key)setSortDirection(d=>d==="asc"?"desc":"asc");else{setSortKey(key);setSortDirection(key==="at"?"desc":"asc");}setPage(1); }
  function selectCategory(value: string) { setCategory(value);setQuickFilter("all");setPage(1); }
  function selectQuick(value: "all"|"sensitive"|"failed"|"denied"|"permissions") { setQuickFilter(value);setCategory("Toutes");setResult("Tous");setQuery("");setPage(1); }
  if (!authorized) return <main className="audit-page"><section className="audit-denied"><ShieldAlert size={28}/><h1>Accès non autorisé</h1><p>Votre rôle ne dispose pas de l’autorisation nécessaire pour consulter le journal d’audit.</p></section></main>;

  return <main className="audit-page">
    <div className="audit-breadcrumb">Administration <span>/</span> <b>Audit &amp; Activité</b></div>
    <header className="audit-header"><div><div className="audit-eyebrow">ADMINISTRATION · TRAÇABILITÉ</div><h1>Audit &amp; Activité</h1><p>Consultez les opérations sensibles, les événements de sécurité et les changements effectués sur la plateforme.</p><div className="audit-school-meta"><strong>{schoolBranding.name}</strong><span>·</span><span>Période : {period==="today"?"Aujourd’hui":period==="7"?"7 derniers jours":period==="30"?"30 derniers jours":period==="90"?"90 derniers jours":period==="custom"?"Période personnalisée":"Toute la période"}</span><span>·</span><span>Actualisé : {formatDate(refreshedAt.toISOString())}</span></div></div><div className="audit-header-actions"><button type="button" onClick={refresh}><RefreshCw size={14}/>Actualiser</button><button type="button" className="audit-export-disabled" disabled title="Aucun service d’export d’audit n’est connecté.">Exporter le journal <span>Indisponible</span></button></div></header>
    <div className="audit-demo-banner"><Info size={17}/><div><strong>Mode démonstration — Données simulées</strong><p>Les événements, identités, résultats et horodatages de cette page sont fictifs. Ils ne proviennent pas d’un journal d’audit réel et ne constituent pas une preuve de traçabilité. Aucun événement de l’historique général des activités n’est réutilisé ici.</p></div><span>LOCAL</span></div>
    {refreshNotice&&<div className="audit-notice"><CheckIcon/>{refreshNotice}<button type="button" onClick={()=>setRefreshNotice("")}><X size={13}/></button></div>}
    <section className="audit-period-bar"><div><CalendarDays size={15}/><strong>Période d’analyse</strong></div><div className="audit-period-options"><button className={period==="today"?"active":""} onClick={()=>changePeriod("today")}>Aujourd’hui</button><button className={period==="7"?"active":""} onClick={()=>changePeriod("7")}>7 jours</button><button className={period==="30"?"active":""} onClick={()=>changePeriod("30")}>30 jours</button><button className={period==="90"?"active":""} onClick={()=>changePeriod("90")}>90 jours</button><button className={period==="all"?"active":""} onClick={()=>changePeriod("all")}>Tout</button><button className={period==="custom"?"active":""} onClick={()=>changePeriod("custom")}>Personnalisée</button></div></section>
    {period==="custom"&&<div className="audit-custom-range"><label>Du <input type="date" value={customFrom} max={customTo||undefined} onChange={e=>{setCustomFrom(e.target.value);setPage(1);}}/></label><label>Au <input type="date" value={customTo} min={customFrom||undefined} onChange={e=>{setCustomTo(e.target.value);setPage(1);}}/></label>{customFrom&&customTo&&new Date(customFrom)>new Date(customTo)&&<span>La date de début doit précéder la date de fin.</span>}</div>}
    <section className="audit-kpis">
      <button type="button" onClick={()=>selectQuick("all")} className={quickFilter==="all"?"selected":""}><span className="audit-kpi-icon blue"><FileSearch size={17}/></span><span><small>Événements audités</small><strong>{counts.total}</strong><em>Enregistrements de démonstration</em></span></button>
      <button type="button" onClick={()=>selectQuick("sensitive")} className={quickFilter==="sensitive"?"selected":""}><span className="audit-kpi-icon violet"><ShieldCheck size={17}/></span><span><small>Modifications sensibles</small><strong>{counts.sensitive}</strong><em>Données, finance et administration</em></span></button>
      <button type="button" onClick={()=>selectQuick("failed")} className={quickFilter==="failed"?"selected":""}><span className="audit-kpi-icon amber"><AlertCircle size={17}/></span><span><small>Tentatives échouées</small><strong>{counts.failed}</strong><em>Authentification uniquement</em></span></button>
      <button type="button" onClick={()=>selectQuick("denied")} className={quickFilter==="denied"?"selected":""}><span className="audit-kpi-icon red"><ShieldAlert size={17}/></span><span><small>Opérations refusées</small><strong>{counts.denied}</strong><em>Résultat enregistré · démo</em></span></button>
      <button type="button" onClick={()=>selectQuick("permissions")} className={quickFilter==="permissions"?"selected":""}><span className="audit-kpi-icon teal"><Clock3 size={17}/></span><span><small>Changements de permissions</small><strong>{counts.permissions}</strong><em>Rôles et autorisations</em></span></button>
    </section>
    <section className="audit-panel">
      <header className="audit-panel-heading"><div><h2>Journal des événements</h2><p>{filtered.length} événement(s) correspondant aux critères sélectionnés</p></div><span className="audit-readonly"><ShieldCheck size={13}/> Consultation seule</span></header>
      <nav className="audit-categories" aria-label="Catégories d’audit"><button className={category==="Toutes"?"active":""} onClick={()=>selectCategory("Toutes")}>Toutes les catégories <b>{periodItems.length}</b></button>{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>selectCategory(c)}>{c}<b>{periodItems.filter(e=>e.category===c).length}</b></button>)}</nav>
      <div className="audit-filters"><label className="audit-search"><Search size={15}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Rechercher un utilisateur, une action, une référence ou un identifiant…"/></label><select aria-label="Filtrer par utilisateur" value={actor} onChange={e=>{setActor(e.target.value);setPage(1);}}><option>Tous</option>{actors.map(a=><option key={a}>{a}</option>)}</select><select aria-label="Filtrer par rôle" value={role} onChange={e=>{setRole(e.target.value);setPage(1);}}><option>Tous</option>{roles.map(r=><option key={r}>{r}</option>)}</select><select aria-label="Filtrer par module" value={module} onChange={e=>{setModule(e.target.value);setPage(1);}}><option>Tous</option>{modules.map(m=><option key={m}>{m}</option>)}</select><select aria-label="Filtrer par résultat" value={result} onChange={e=>{setResult(e.target.value);setPage(1);}}><option>Tous</option><option>Réussi</option><option>Refusé</option><option>Échoué</option></select>{hasFilters&&<button type="button" className="audit-reset" onClick={resetFilters}>Effacer les filtres</button>}</div>
      <div className="audit-table-wrap"><table className="audit-table"><thead><tr><th><button onClick={()=>toggleSort("at")}>Date et heure <SortIcon active={sortKey==="at"} direction={sortDirection}/></button></th><th><button onClick={()=>toggleSort("actor")}>Utilisateur <SortIcon active={sortKey==="actor"} direction={sortDirection}/></button></th><th>Rôle</th><th><button onClick={()=>toggleSort("type")}>Type d’événement <SortIcon active={sortKey==="type"} direction={sortDirection}/></button></th><th><button onClick={()=>toggleSort("module")}>Module <SortIcon active={sortKey==="module"} direction={sortDirection}/></button></th><th>Action effectuée</th><th>Enregistrement concerné</th><th><button onClick={()=>toggleSort("result")}>Résultat <SortIcon active={sortKey==="result"} direction={sortDirection}/></button></th><th> </th></tr></thead><tbody>{visible.map(item=><tr key={item.id}><td><strong>{formatDate(item.at)}</strong><small>{item.id}</small></td><td><strong>{item.actor}</strong><small>{item.actorId}</small></td><td>{item.role}</td><td><span className="audit-category-tag">{item.category}</span><small className="audit-event-type">{item.type}</small></td><td>{item.module}</td><td>{item.action}</td><td>{item.target}</td><td><span className={"audit-result "+resultClass(item.result)}>{item.result}</span></td><td><button type="button" className="audit-view" title="Consulter l’événement" onClick={()=>setSelected(item)}><Eye size={15}/></button></td></tr>)}</tbody></table>
        {visible.length===0&&<div className="audit-empty"><FileSearch size={25}/><strong>{periodItems.length===0?"Aucun événement trouvé pour cette période.":"Aucun événement ne correspond aux filtres sélectionnés."}</strong><span>Essayez une autre période ou réinitialisez les filtres.</span><button type="button" onClick={resetFilters}>Réinitialiser les filtres</button></div>}
      </div>
      <footer className="audit-pagination"><span>Affichage de {filtered.length?(page-1)*pageSize+1:0} à {Math.min(page*pageSize,filtered.length)} sur {filtered.length} événement(s)</span><div><button type="button" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={15}/>Précédent</button><span>Page {page} / {pages}</span><button type="button" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Suivant<ChevronRight size={15}/></button></div></footer>
    </section>
    <section className="audit-investigations"><header><div><h2>Activité à examiner</h2><p>Regroupement en lecture seule de séquences observables dans les événements simulés.</p></div><span>Sans score de risque</span></header>{investigation.length===0?<div className="audit-investigation-empty">Aucune donnée de sécurité disponible pour cette période.</div>:investigation.map(group=><article key={group.actorId}><div className="audit-investigation-icon"><AlertCircle size={17}/></div><div className="audit-investigation-copy"><strong>Plusieurs tentatives de connexion échouées</strong><p>{group.events.length} événements associés au compte de démonstration {group.actor} · {group.actorId}</p><small>Du {formatDate(group.events[0].at)} au {formatDate(group.events[group.events.length-1].at)}</small><div className="audit-related-events">{group.events.map(event=><button key={event.id} type="button" onClick={()=>setSelected(event)}>{event.id} · {formatDate(event.at)} <Eye size={12}/></button>)}</div></div></article>)}</section>
    <div className="audit-integrity-note"><ShieldCheck size={16}/><p><strong>Intégrité et limites du journal</strong><br/>Les événements affichés sont des exemples locaux non modifiables depuis cette interface. Le projet ne fournit pas actuellement de stockage d’audit append-only, de journalisation backend, de rétention vérifiable ni d’export d’audit autorisé. Cette page ne revendique aucune garantie d’immutabilité ou de protection contre l’altération.</p></div>
    {selected&&<div className="audit-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}><aside className="audit-drawer" role="dialog" aria-modal="true" aria-label="Détail de l’événement"><header><div><small>DÉTAIL DE L’ÉVÉNEMENT · DONNÉES SIMULÉES</small><h2>{selected.type}</h2><p>{selected.id}</p></div><button type="button" onClick={()=>setSelected(null)} aria-label="Fermer"><X size={18}/></button></header><div className="audit-drawer-content"><div className="audit-detail-result"><span className={"audit-result "+resultClass(selected.result)}>{selected.result}</span><span>{selected.category}</span></div><h3>Informations de l’événement</h3><dl className="audit-detail-list"><dt>Identifiant unique</dt><dd>{selected.id}</dd><dt>Date et heure</dt><dd>{formatDate(selected.at)}</dd><dt>Utilisateur</dt><dd>{selected.actor}</dd><dt>Identifiant utilisateur</dt><dd>{selected.actorId}</dd><dt>Rôle au moment de l’événement</dt><dd>{selected.role}</dd><dt>Module d’origine</dt><dd>{selected.module}</dd><dt>Type d’événement</dt><dd>{selected.type}</dd><dt>Action effectuée</dt><dd>{selected.action}</dd><dt>Enregistrement concerné</dt><dd>{selected.target}</dd><dt>Résultat</dt><dd>{selected.result}</dd></dl><div className="audit-metadata-warning"><Info size={15}/><div><strong>Métadonnées techniques non enregistrées</strong><p>Aucune adresse IP, aucun appareil, identifiant de session ou serveur local n’est disponible pour cet exemple. Aucune valeur technique n’est inventée.</p></div></div><h3>Détails de la modification</h3>{selected.before&&selected.after?<div className="audit-change-table"><div className="audit-change-head"><span>Champ</span><span>Valeur précédente</span><span>Nouvelle valeur</span></div><div><strong>{selected.before.field}</strong><span>{selected.before.value}</span><span>{selected.after.value}</span></div></div>:<div className="audit-no-change">Aucun détail avant/après n’est enregistré pour cet événement de démonstration.</div>}<h3>Contexte</h3><p className="audit-event-description">{selected.detail}</p><div className="audit-immutable-note"><ShieldCheck size={14}/>Consultation seule : aucun événement historique ne peut être modifié ou supprimé depuis cette page.</div></div></aside></div>}
  </main>;
}
function SortIcon({active,direction}:{active:boolean;direction:"asc"|"desc"}) { return active ? (direction==="asc"?<ArrowUp size={12}/>:<ArrowDown size={12}/>) : <ArrowDown size={12} className="audit-sort-muted"/>; }
function CheckIcon() { return <ShieldCheck size={14}/>; }
