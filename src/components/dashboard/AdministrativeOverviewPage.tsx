import { useMemo, useState } from "react";
import "./RoleDashboards.css";
import {
  ArrowRight, BookOpen, BriefcaseBusiness, CalendarDays,
  ClipboardList, FileText, GraduationCap, LayoutDashboard, Plus, Search,
  ShieldAlert, Users, UserRoundCheck,
} from "lucide-react";
import {
  administrativeActivities, administrativeAttendance, administrativeKpis,
  administrativeQuickActions, administrativeTasks, academicStructure,
  enrollmentLevels, enrollmentTrend, peopleMetrics, recentRegistrations,
  type RegistrationKind,
} from "../../data/administrative-dashboard";
import type { AuthenticatedSidebarUser, Permission } from "../../types/navigation";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void; }

const peopleTabs: { id: RegistrationKind | "Personnel"; label: string; key: keyof typeof peopleMetrics; icon: typeof Users }[] = [
  { id: "Élève", label: "Élèves", key: "students", icon: GraduationCap },
  { id: "Parent", label: "Parents", key: "parents", icon: Users },
  { id: "Enseignant", label: "Enseignants", key: "teachers", icon: UserRoundCheck },
  { id: "Personnel", label: "Employés", key: "employees", icon: BriefcaseBusiness },
];
const kpiIcons: Record<string, typeof Users> = {
  students: GraduationCap, parents: Users, teachers: UserRoundCheck,
  employees: BriefcaseBusiness, classes: BookOpen, documents: FileText,
};
const actionIcons: Record<string, typeof Users> = {
  student: GraduationCap, parent: Users, teacher: UserRoundCheck,
  employee: BriefcaseBusiness, class: BookOpen, document: FileText,
};
const activityIcons: Record<string, typeof Users> = {
  student: GraduationCap, parent: Users, teacher: UserRoundCheck,
  document: FileText, employee: BriefcaseBusiness,
};

function Heading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: { label: string; onClick: () => void } }) {
  return <div className="admin-dash-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action && <button type="button" onClick={action.onClick}>{action.label}<ArrowRight size={14}/></button>}</div>;
}

function EnrollmentChart() {
  const max = Math.max(...enrollmentTrend.map(item => item.count));
  return <div className="admin-enrollment-chart" role="img" aria-label="Évolution mensuelle des inscriptions">
    {enrollmentTrend.map(item => <div className="admin-enrollment-column" key={item.month}>
      <strong>{item.count}</strong><span className="admin-enrollment-track"><i style={{ height: `${item.count / max * 100}%` }}/></span><small>{item.month}</small>
    </div>)}
  </div>;
}

export function AdministrativeOverviewPage({ user, onNavigate }: Props) {
  const [activePeople, setActivePeople] = useState<keyof typeof peopleMetrics>("students");
  const [search, setSearch] = useState("");
  const [showAllRegistrations, setShowAllRegistrations] = useState(false);
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const greeting = new Date().getHours() < 12 ? "Bonjour" : new Date().getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const filteredRegistrations = useMemo(() => recentRegistrations.filter(item =>
    [item.name, item.id, item.kind, item.related].join(" ").toLocaleLowerCase("fr-FR").includes(search.trim().toLocaleLowerCase("fr-FR"))
  ), [search]);
  const visibleRegistrations = showAllRegistrations ? filteredRegistrations : filteredRegistrations.slice(0, 5);
  const currentPeople = peopleMetrics[activePeople];
  const visibleTasks = administrativeTasks.filter(task => user.permissions.includes(task.permission as Permission));
  const visibleActions = administrativeQuickActions.filter(action => user.permissions.includes(action.permission as Permission));

  return <main className="administrative-dashboard">
    <header className="admin-dash-welcome">
      <div>
        <div className="admin-dash-breadcrumb"><LayoutDashboard size={14}/> Tableau de bord <span>/</span> Vue d’ensemble</div>
        <h1>Vue d’ensemble</h1>
        <p>{greeting} {user.displayName.split(" ")[0]}, voici votre aperçu administratif pour aujourd’hui.</p>
        <div className="admin-dash-context"><span><CalendarDays size={14}/> Année scolaire 2026–2027</span><span>{today}</span></div>
      </div>
      <div className="admin-dash-role"><span>ESPACE ADMINISTRATIF</span><strong>Responsable administratif</strong></div>
    </header>

    <section className="admin-dash-kpis" aria-label="Indicateurs administratifs">
      {administrativeKpis.map(item => {
        const Icon = kpiIcons[item.icon] ?? ClipboardList;
        return <article className="admin-dash-kpi" key={item.id}>
          <div className="admin-dash-kpi-top"><span>{item.label}</span><i className={`admin-kpi-icon admin-kpi-icon--${item.tone}`}><Icon size={17}/></i></div>
          <strong>{item.value}</strong><small>{item.detail}</small>
        </article>;
      })}
    </section>

    <section className="admin-dash-grid admin-dash-grid--enrollment">
      <article className="admin-dash-panel">
        <Heading eyebrow="ADMISSIONS" title="Suivi des inscriptions" action={{ label: "Gérer les inscriptions", onClick: () => onNavigate("/students") }}/>
        <div className="admin-enrollment-summary">
          <div><strong>338</strong><span>Nouvelles inscriptions</span></div>
          <div><strong>12</strong><span>Dossiers à compléter</span></div>
          <div><strong>32</strong><span>Élèves ajoutés ce mois</span></div>
        </div>
        <div className="admin-dash-subtitle">Évolution des inscriptions · derniers mois</div>
        <EnrollmentChart/>
        <div className="admin-level-breakdown"><strong>Répartition par niveau</strong>{enrollmentLevels.map(item => <div key={item.label}><span>{item.label}</span><b>{item.count}</b><i><em style={{ width: `${item.count / 138 * 100}%` }}/></i></div>)}</div>
      </article>
      <article className="admin-dash-panel">
        <Heading eyebrow="ORGANISATION" title="Structure pédagogique"/>
        <div className="admin-structure-list">{academicStructure.map(item => <button type="button" key={item.id} onClick={() => onNavigate(item.route)}>
          <span className="admin-structure-icon"><BookOpen size={16}/></span><span className="admin-structure-copy"><strong>{item.label}</strong><small>{item.active}</small></span><b>{item.total}</b><ArrowRight size={14}/>
        </button>)}</div>
      </article>
    </section>

    <section className="admin-dash-panel admin-dash-people">
      <Heading eyebrow="ANNUAIRE" title="Gestion du personnel et des personnes" action={{ label: "Ouvrir l’annuaire", onClick: () => onNavigate("/students") }}/>
      <div className="admin-people-tabs" role="tablist" aria-label="Catégories de personnes">
        {peopleTabs.map(tab => { const Icon = tab.icon; return <button type="button" role="tab" aria-selected={activePeople === tab.key} className={activePeople === tab.key ? "is-active" : ""} key={tab.key} onClick={() => setActivePeople(tab.key)}><Icon size={16}/>{tab.label}</button>; })}
      </div>
      <div className="admin-people-content" role="tabpanel">
        <div><span>{peopleTabs.find(tab => tab.key === activePeople)?.label} enregistrés</span><strong>{currentPeople.total}</strong><small>{currentPeople.recent}</small></div>
        <button type="button" onClick={() => onNavigate(currentPeople.route)}>Gérer cette catégorie<ArrowRight size={15}/></button>
      </div>
    </section>

    <section className="admin-dash-grid admin-dash-grid--monitor">
      <article className="admin-dash-panel">
        <Heading eyebrow="SUIVI QUOTIDIEN" title="Suivi des présences"/>
        <div className="admin-attendance-grid">
          <div><strong>{administrativeAttendance.studentAbsences}</strong><span>Absences élèves</span></div>
          <div><strong>{administrativeAttendance.staffAbsences}</strong><span>Absences personnel</span></div>
          <div className="is-warning"><strong>{administrativeAttendance.unjustified}</strong><span>Non justifiées</span></div>
          <div className="is-critical"><strong>{administrativeAttendance.attention}</strong><span>À traiter</span></div>
        </div>
        <div className="admin-dash-subtitle">Taux de présence · 7 derniers jours</div>
        <div className="admin-attendance-trend">{administrativeAttendance.trend.map((value, index) => <div key={index}><i style={{ height: `${value}%` }}/><small>{["L","M","M","J","V","S","D"][index]}</small></div>)}</div>
        <div className="admin-inline-links"><button type="button" onClick={() => onNavigate("/student-attendance")}>Présence des élèves<ArrowRight size={13}/></button><button type="button" onClick={() => onNavigate("/staff-attendance")}>Présence du personnel<ArrowRight size={13}/></button></div>
      </article>
      <article className="admin-dash-panel">
        <Heading eyebrow="PRIORITÉS" title="Tâches administratives en attente"/>
        <div className="admin-task-list">{visibleTasks.map(task => <div className="admin-task" key={task.id}>
          <span className={`admin-task-priority admin-task-priority--${task.priority === "Urgente" ? "urgent" : task.priority === "Élevée" ? "high" : "normal"}`}><ShieldAlert size={15}/></span>
          <div><strong>{task.title}</strong><small>{task.detail}</small></div><b>{task.count}</b><button type="button" onClick={() => onNavigate(task.route)} aria-label={`Traiter : ${task.title}`}><ArrowRight size={15}/></button>
        </div>)}{visibleTasks.length === 0 && <p className="admin-dash-empty">Aucune tâche accessible avec vos autorisations actuelles.</p>}</div>
      </article>
    </section>

    <section className="admin-dash-grid admin-dash-grid--recent">
      <article className="admin-dash-panel">
        <Heading eyebrow="DERNIÈRES OPÉRATIONS" title="Inscriptions récentes" action={{ label: "Voir l’annuaire", onClick: () => onNavigate("/students") }}/>
        <label className="admin-registration-search"><Search size={15}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un nom, un type ou une classe…" /></label>
        <div className="admin-registration-wrap"><table className="admin-registration-table">
          <thead><tr><th>Nom</th><th>Type</th><th>Date</th><th>Classe / Service</th><th>Statut</th><th/></tr></thead>
          <tbody>{visibleRegistrations.map(item => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.id}</small></td><td>{item.kind}</td><td>{item.date}</td><td>{item.related}</td><td><span className={`admin-registration-status admin-registration-status--${item.status === "Validé" ? "ok" : item.status === "À vérifier" ? "review" : "pending"}`}>{item.status}</span></td><td><button type="button" onClick={() => onNavigate(item.route)} aria-label={`Ouvrir le dossier de ${item.name}`}><ArrowRight size={14}/></button></td></tr>)}</tbody>
        </table>{visibleRegistrations.length === 0 && <p className="admin-dash-empty">Aucune inscription ne correspond à votre recherche.</p>}</div>
        {filteredRegistrations.length > 5 && <button className="admin-show-more" type="button" onClick={() => setShowAllRegistrations(value => !value)}>{showAllRegistrations ? "Afficher moins" : "Afficher toutes les inscriptions"}<ArrowRight size={13}/></button>}
      </article>
      <article className="admin-dash-panel">
        <Heading eyebrow="JOURNAL" title="Activité administrative récente" action={{ label: "Historique complet", onClick: () => onNavigate("/activity-history") }}/>
        <div className="admin-activity-list">{administrativeActivities.map(item => { const Icon = activityIcons[item.icon] ?? ClipboardList; return <div className="admin-activity-item" key={item.id}>
          <span><Icon size={16}/></span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.actor}</small></div><time>{item.date}</time>
        </div>; })}</div>
      </article>
    </section>

    <section className="admin-dash-panel admin-quick-panel">
      <Heading eyebrow="ACCÈS DIRECT" title="Actions rapides"/>
      <div className="admin-quick-actions">{visibleActions.map(action => { const Icon = actionIcons[action.icon] ?? Plus; return <button type="button" key={action.id} onClick={() => onNavigate(action.route)}><span><Icon size={17}/></span>{action.label}<ArrowRight size={14}/></button>; })}</div>
      {visibleActions.length === 0 && <p className="admin-dash-empty">Aucune action rapide disponible pour ce compte.</p>}
    </section>

    <footer className="admin-dash-footer"><span>Tableau de bord administratif</span><span>Données fictives de démonstration · Non connectées à une base réelle</span></footer>
  </main>;
}
