import { useMemo, useState } from "react";
import { CalendarDays, CalendarClock, CheckCircle2, Clock3, FilterX, Info, Search, Users, ChevronRight, ClipboardList, ShieldCheck, MapPin, UserRound, X, Tag, GraduationCap, Eye } from "lucide-react";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./StudentActivitiesPage.css";

interface Props { user: AuthenticatedSidebarUser }
type ActivityStatus = "À venir" | "En cours" | "Terminée";
type Activity = {
  id: string; name: string; category: string; date: string; start: string; end: string;
  location: string; manager: string; groups: string[]; participants: number;
  status: ActivityStatus; description: string; participantRefs: string[];
};

const demoActivities: Activity[] = [
  { id:"ACT-2026-001", name:"Club de programmation", category:"Clubs scolaires", date:"2026-11-12", start:"14:00", end:"16:00", location:"Salle informatique 2", manager:"Mme Salma El Idrissi", groups:["3e collège A","3e collège B"], participants:18, status:"À venir", description:"Initiation à la programmation avec des exercices pratiques et la création d’un petit projet collectif.", participantRefs:["ELV-1024","ELV-1031","ELV-1042","ELV-1058","ELV-1063","ELV-1077"] },
  { id:"ACT-2026-002", name:"Tournoi sportif interclasses", category:"Activités sportives", date:"2026-11-18", start:"09:00", end:"12:30", location:"Terrain multisport", manager:"M. Youssef Amrani", groups:["1re année collège","2e année collège"], participants:32, status:"À venir", description:"Rencontres sportives entre les classes, encadrées par l’équipe d’éducation physique.", participantRefs:["ELV-1101","ELV-1102","ELV-1103","ELV-1104","ELV-1105","ELV-1106"] },
  { id:"ACT-2026-003", name:"Atelier scientifique", category:"Ateliers scientifiques", date:"2026-11-24", start:"10:00", end:"12:00", location:"Laboratoire de sciences", manager:"Mme Nadia Bennis", groups:["Tronc commun scientifique"], participants:14, status:"À venir", description:"Expériences encadrées autour de l’énergie et des phénomènes physiques du quotidien.", participantRefs:["ELV-1201","ELV-1202","ELV-1203","ELV-1204","ELV-1205"] },
  { id:"ACT-2026-004", name:"Semaine du livre et de la lecture", category:"Concours et compétitions", date:"2026-11-05", start:"08:30", end:"16:00", location:"Centre de documentation", manager:"Mme Hajar Alaoui", groups:["2e collège A","2e collège B","3e collège A"], participants:26, status:"En cours", description:"Une semaine d’animations autour de la lecture : présentation de livres, lecture à voix haute et échanges.", participantRefs:["ELV-1301","ELV-1302","ELV-1303","ELV-1304","ELV-1305","ELV-1306"] },
  { id:"ACT-2026-005", name:"Journée culturelle", category:"Événements scolaires", date:"2026-10-22", start:"09:00", end:"15:30", location:"Cour principale", manager:"M. Karim Benjelloun", groups:["Tous les niveaux"], participants:85, status:"Terminée", description:"Présentations artistiques et stands préparés par les élèves pour célébrer la diversité culturelle.", participantRefs:["ELV-1401","ELV-1402","ELV-1403","ELV-1404","ELV-1405","ELV-1406"] },
  { id:"ACT-2026-006", name:"Atelier artistique", category:"Activités culturelles", date:"2026-10-15", start:"14:00", end:"16:00", location:"Salle polyvalente", manager:"Mme Imane Chraibi", groups:["1re collège A","1re collège C"], participants:16, status:"Terminée", description:"Atelier de création visuelle et d’expression artistique avec une exposition des réalisations.", participantRefs:["ELV-1501","ELV-1502","ELV-1503","ELV-1504"] },
  { id:"ACT-2026-007", name:"Journée de sensibilisation à l’environnement", category:"Journées de sensibilisation", date:"2026-09-30", start:"09:30", end:"12:00", location:"Salle de conférence", manager:"M. Anas Tazi", groups:["Tous les niveaux"], participants:42, status:"Terminée", description:"Sensibilisation aux gestes écoresponsables et à la réduction des déchets au sein de l’établissement.", participantRefs:["ELV-1601","ELV-1602","ELV-1603","ELV-1604","ELV-1605"] },
];

const views = [
  { id:"all", label:"Toutes les activités", icon:ClipboardList },
  { id:"upcoming", label:"À venir", icon:CalendarClock },
  { id:"active", label:"En cours", icon:Clock3 },
  { id:"completed", label:"Terminées", icon:CheckCircle2 },
] as const;
const categories = [...new Set(demoActivities.map(item=>item.category))];
const classes = [...new Set(demoActivities.flatMap(item=>item.groups))];
const formatDate = (value:string) => new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value+"T12:00:00"));

export function StudentActivitiesPage({ user }: Props) {
  const [view,setView] = useState<(typeof views)[number]["id"]>("all");
  const [search,setSearch] = useState("");
  const [category,setCategory] = useState("all");
  const [group,setGroup] = useState("all");
  const [status,setStatus] = useState("all");
  const [period,setPeriod] = useState("all");
  const [selected,setSelected] = useState<Activity|null>(null);
  const canView = user.permissions.includes("student.activities.view");

  const filtered = useMemo(()=>demoActivities.filter(activity=>{
    const matchesView = view==="all" || (view==="upcoming" && activity.status==="À venir") || (view==="active" && activity.status==="En cours") || (view==="completed" && activity.status==="Terminée");
    const term=search.trim().toLocaleLowerCase("fr");
    const matchesSearch=!term || activity.name.toLocaleLowerCase("fr").includes(term) || activity.id.toLocaleLowerCase("fr").includes(term);
    const matchesCategory=category==="all" || activity.category===category;
    const matchesGroup=group==="all" || activity.groups.includes(group);
    const matchesStatus=status==="all" || activity.status===status;
    const month=activity.date.slice(0,7);
    const matchesPeriod=period==="all" || (period==="nov" && month==="2026-11") || (period==="oct" && month==="2026-10") || (period==="sep" && month==="2026-09");
    return matchesView && matchesSearch && matchesCategory && matchesGroup && matchesStatus && matchesPeriod;
  }),[view,search,category,group,status,period]);

  const uniqueParticipants = new Set(demoActivities.flatMap(activity=>activity.participantRefs)).size;
  const upcomingCount=demoActivities.filter(item=>item.status==="À venir").length;
  const activeCount=demoActivities.filter(item=>item.status==="En cours").length;
  const resetFilters=()=>{setSearch("");setCategory("all");setGroup("all");setStatus("all");setPeriod("all");setView("all");};

  if (!canView) return <main className="activities-page"><section className="activities-access"><ShieldCheck size={25}/><h1>Accès non autorisé</h1><p>Votre compte ne dispose pas de l’autorisation nécessaire pour consulter les activités des élèves.</p></section></main>;

  return <main className="activities-page">
    <header className="activities-header">
      <div className="activities-breadcrumb"><span>Vie scolaire</span><ChevronRight size={13}/><strong>Activités des élèves</strong></div>
      <div className="activities-heading">
        <div><h1>Activités des élèves</h1><p>Organisez les activités scolaires et suivez la participation des élèves.</p></div>
        <div className="activities-header-meta"><span className="activities-upcoming"><CalendarDays size={15}/><strong>{upcomingCount}</strong> activités à venir</span></div>
      </div>
    </header>

    <section className="activities-demo-banner" role="status"><Info size={16}/><div><strong>Données de démonstration</strong><span>Ces activités, responsables, groupes et effectifs sont fictifs. Ils servent uniquement à visualiser l’interface et ne sont ni enregistrés ni reliés aux dossiers réels des élèves.</span></div><span className="activities-demo-tag">EXEMPLE</span></section>

    <section className="activities-kpis" aria-label="Indicateurs des activités">
      <article className="activities-kpi"><span className="activities-kpi-icon blue"><CalendarClock size={17}/></span><div><strong>{upcomingCount}</strong><span>Activités à venir</span><small>Dans les données de démonstration</small></div></article>
      <article className="activities-kpi"><span className="activities-kpi-icon teal"><Clock3 size={17}/></span><div><strong>{activeCount}</strong><span>Activités en cours</span><small>Dans les données de démonstration</small></div></article>
      <article className="activities-kpi"><span className="activities-kpi-icon slate"><Users size={17}/></span><div><strong>{uniqueParticipants}</strong><span>Élèves participants</span><small>Élèves fictifs uniques, sans doublons</small></div></article>
    </section>

    <section className="activities-workspace">
      <div className="activities-workspace-head"><div><span className="activities-eyebrow">SUIVI DES ÉVÉNEMENTS</span><h2>Activités scolaires</h2><p>Consultez les activités organisées par l’établissement et leur état d’avancement.</p></div><span className="activities-readonly"><Eye size={13}/> Démonstration en lecture seule</span></div>
      <nav className="activities-tabs" aria-label="Filtrer les activités">{views.map(item=>{const Icon=item.icon;const count=item.id==="all"?demoActivities.length:item.id==="upcoming"?upcomingCount:item.id==="active"?activeCount:demoActivities.filter(a=>a.status==="Terminée").length;return <button type="button" key={item.id} onClick={()=>setView(item.id)} className={view===item.id?"active":""}><Icon size={14}/>{item.label}<span>{count}</span></button>;})}</nav>
      <div className="activities-filters">
        <label className="activities-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom ou référence…"/></label>
        <select value={period} onChange={e=>setPeriod(e.target.value)} aria-label="Période"><option value="all">Toute période</option><option value="nov">Novembre 2026</option><option value="oct">Octobre 2026</option><option value="sep">Septembre 2026</option></select>
        <select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Catégorie"><option value="all">Toutes les catégories</option>{categories.map(value=><option key={value} value={value}>{value}</option>)}</select>
        <select value={group} onChange={e=>setGroup(e.target.value)} aria-label="Classe ou groupe"><option value="all">Toutes les classes / groupes</option>{classes.map(value=><option key={value} value={value}>{value}</option>)}</select>
        <select value={status} onChange={e=>setStatus(e.target.value)} aria-label="Statut"><option value="all">Tous les statuts</option><option>À venir</option><option>En cours</option><option>Terminée</option></select>
        <button className="activities-reset" type="button" onClick={resetFilters}><FilterX size={14}/>Réinitialiser</button>
      </div>
      <div className="activities-filter-note"><Info size={13}/>Les filtres se combinent avec la vue sélectionnée. Les données affichées sont fictives.</div>
      <div className="activities-table-wrap"><table className="activities-table"><thead><tr>{["Nom de l'activité","Catégorie","Date et horaires","Lieu","Responsable","Classes / Groupes","Participants","Statut","Actions"].map(column=><th key={column}>{column}</th>)}</tr></thead>
        <tbody>{filtered.map(activity=><tr key={activity.id} className="activities-row" onClick={()=>setSelected(activity)} tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(activity);}}}>
          <td><div className="activities-name-cell"><strong>{activity.name}</strong><small>{activity.id}</small></div></td>
          <td><span className="activities-category">{activity.category}</span></td>
          <td><div className="activities-date-cell"><strong>{formatDate(activity.date)}</strong><small>{activity.start} – {activity.end}</small></div></td>
          <td><span className="activities-location"><MapPin size={12}/>{activity.location}</span></td>
          <td>{activity.manager}</td><td><div className="activities-groups">{activity.groups.map(value=><span key={value}>{value}</span>)}</div></td>
          <td><span className="activities-participants"><Users size={13}/>{activity.participants}</span></td>
          <td><span className={"activities-status-pill "+(activity.status==="À venir"?"upcoming":activity.status==="En cours"?"active":"completed")}>{activity.status}</span></td>
          <td><button className="activities-view-button" type="button" onClick={e=>{e.stopPropagation();setSelected(activity);}}>Consulter</button></td>
        </tr>)}
        {filtered.length===0&&<tr><td colSpan={9}><div className="activities-empty"><span className="activities-empty-icon"><Search size={22}/></span><strong>Aucune activité trouvée</strong><p>Aucune activité de démonstration ne correspond aux filtres sélectionnés.</p><button type="button" onClick={resetFilters}>Effacer les filtres</button></div></td></tr>}
        </tbody></table></div>
      <footer className="activities-table-footer"><span>{filtered.length} activité{filtered.length>1?"s":""} affichée{filtered.length>1?"s":""} sur {demoActivities.length}</span><span>Jeu de données fictif · Année scolaire 2026–2027</span></footer>
    </section>

    <section className="activities-capabilities"><div className="activities-capabilities-heading"><div><span className="activities-eyebrow">PÉRIMÈTRE FONCTIONNEL</span><h2>Fonctionnalités non disponibles</h2></div><span className="activities-status">À développer</span></div>
      <div className="activities-capability-grid">
        <article><CalendarDays size={16}/><div><strong>Création et publication</strong><span>Les exemples affichés ne peuvent pas être modifiés ni publiés.</span></div></article>
        <article><Users size={16}/><div><strong>Inscriptions et participants</strong><span>Les effectifs sont fictifs et ne correspondent à aucun dossier élève réel.</span></div></article>
        <article><CheckCircle2 size={16}/><div><strong>Présence aux activités</strong><span>Aucun service de présence aux événements n’est actuellement connecté.</span></div></article>
        <article><ClipboardList size={16}/><div><strong>Historique et résultats</strong><span>Les activités de démonstration ne disposent pas d’un journal d’audit réel.</span></div></article>
      </div>
    </section>

    {selected&&<div className="activities-drawer-backdrop" onClick={()=>setSelected(null)}><aside className="activities-detail-drawer" role="dialog" aria-modal="true" aria-label="Détail de l’activité" onClick={e=>e.stopPropagation()}>
      <div className="activities-drawer-head"><div><span className="activities-eyebrow">DÉTAIL DE L’ACTIVITÉ · EXEMPLE</span><h2>{selected.name}</h2><small>{selected.id}</small></div><button type="button" aria-label="Fermer" onClick={()=>setSelected(null)}><X size={18}/></button></div>
      <span className={"activities-status-pill "+(selected.status==="À venir"?"upcoming":selected.status==="En cours"?"active":"completed")}>{selected.status}</span>
      <p className="activities-detail-description">{selected.description}</p>
      <div className="activities-detail-list">
        <div><CalendarDays size={15}/><span><small>Date et horaires</small><strong>{formatDate(selected.date)} · {selected.start} – {selected.end}</strong></span></div>
        <div><MapPin size={15}/><span><small>Lieu</small><strong>{selected.location}</strong></span></div>
        <div><UserRound size={15}/><span><small>Responsable</small><strong>{selected.manager}</strong></span></div>
        <div><Tag size={15}/><span><small>Catégorie</small><strong>{selected.category}</strong></span></div>
        <div><GraduationCap size={15}/><span><small>Classes / Groupes</small><strong>{selected.groups.join(", ")}</strong></span></div>
        <div><Users size={15}/><span><small>Participants (fictifs)</small><strong>{selected.participants} élèves</strong></span></div>
      </div>
      <div className="activities-detail-notice"><Info size={15}/><span>Fiche de démonstration uniquement. Les inscriptions, présences et modifications ne sont pas disponibles.</span></div>
    </aside></div>}
  </main>;
}
