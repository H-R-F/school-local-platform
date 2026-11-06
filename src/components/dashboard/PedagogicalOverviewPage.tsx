import { useMemo, useState } from "react";
import {
  Activity, ArrowRight, Award, BookOpen, CalendarDays, CheckCircle2,
  ClipboardCheck, Clock3, FileText, GraduationCap, Medal,
  NotebookPen, Search, ShieldAlert, Star, TrendingUp,
} from "lucide-react";
import {
  academicAlerts, badgeOverview, contentReviews, gradeSubmissions,
  pedagogicalActivities, pedagogicalKpis, pedagogicalQuickActions,
  performanceByClass, performanceByLevel, performanceTrends, teacherReports,
  timetableOverview, type ContentKind,
} from "../../data/pedagogical-dashboard";
import type { AuthenticatedSidebarUser, Permission } from "../../types/navigation";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void; }
type PerformanceLevel = "Tous" | "Primaire" | "Collège" | "Lycée";
type ReviewTab = "Cours" | "Exercices";

const iconMap = {
  average: TrendingUp, grades: ClipboardCheck, courses: BookOpen,
  exercises: NotebookPen, reports: FileText, alerts: ShieldAlert,
} as const;
const activityIconMap: Record<string, typeof Activity> = {
  grade: ClipboardCheck, course: BookOpen, report: FileText,
  exercise: NotebookPen, timetable: CalendarDays, badge: Award,
};
const statusClass = (status: string) => status === "Approuvé" ? "ped-status--approved" : status === "À corriger" ? "ped-status--revision" : "ped-status--pending";
const dateLabel = () => new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: { label: string; run: () => void } }) {
  return <div className="ped-section-title"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action && <button type="button" onClick={action.run}>{action.label}<ArrowRight size={14}/></button>}</div>;
}
function MiniBars({ data }: { data: { label: string; value: number }[] }) {
  return <div className="ped-bars" role="img" aria-label={data.map(x => x.label + " : " + x.value.toLocaleString("fr-FR") + " sur 20").join(", ")}>
    {data.map(item => <div className="ped-bar-item" key={item.label}><b>{item.value.toLocaleString("fr-FR")}</b><span><i style={{ height: `${item.value / 20 * 100}%` }}/></span><small>{item.label}</small></div>)}
  </div>;
}
function TrendLine({ data }: { data: { label: string; value: number }[] }) {
  const pts = data.map((item, i) => ({ x: 18 + i * (264 / Math.max(1, data.length - 1)), y: 112 - item.value * 6 }));
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  return <div className="ped-line-chart"><svg viewBox="0 0 300 142" role="img" aria-label="Tendance des moyennes académiques">
    {[22,62,102].map(y => <line key={y} x1="12" x2="288" y1={y} y2={y} className="ped-grid-line"/>)}
    <path d={path} className="ped-line-path"/>{pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="4" className="ped-line-dot"/> )}
    {data.map((item,i)=><text key={item.label} x={pts[i].x} y="134" textAnchor="middle">{item.label}</text>)}
  </svg><div className="ped-line-legend"><span/>Moyenne générale sur 20</div></div>;
}

export function PedagogicalOverviewPage({ user, onNavigate }: Props) {
  const [reviewTab, setReviewTab] = useState<ReviewTab>("Cours");
  const [level, setLevel] = useState<PerformanceLevel>("Tous");
  const [year, setYear] = useState("2026–2027");
  const [term, setTerm] = useState("1er semestre");
  const [gradeSearch, setGradeSearch] = useState("");
  const [showAllGrades, setShowAllGrades] = useState(false);
  const firstName = user.displayName.split(" ")[0];
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Bonjour" : currentHour < 18 ? "Bon après-midi" : "Bonsoir";
  const allowed = (permission: Permission) => user.permissions.includes(permission);
  const tasks = gradeSubmissions.filter(row => [row.teacher,row.className,row.subject,row.id].join(" ").toLocaleLowerCase("fr-FR").includes(gradeSearch.toLocaleLowerCase("fr-FR")));
  const visibleGrades = showAllGrades ? tasks : tasks.slice(0,4);
  const selectedContent = contentReviews.filter(item => item.kind === (reviewTab === "Cours" ? "Cours" : "Exercice"));
  const chartLevels = performanceByLevel[level];
  const chartClasses = performanceByClass[level];
  const trend = performanceTrends[year];
  const availableQuickActions = pedagogicalQuickActions.filter(action => allowed(action.permission as Permission));
  const reviewCounts = useMemo(() => ({
    courses: contentReviews.filter(x => x.kind === "Cours" && x.status === "En attente").length,
    exercises: contentReviews.filter(x => x.kind === "Exercice" && x.status === "En attente").length,
  }), []);

  const academicYearLabel = year;
  const semesterLabel = term;
  return <main className="pedagogical-dashboard">
    <header className="ped-welcome">
      <div><div className="ped-breadcrumb"><GraduationCap size={14}/> Espace pédagogique <span>/</span> Vue d’ensemble</div>
        <h1>Vue d'ensemble</h1><p>{greeting}, {firstName}. Suivez les progrès académiques et les activités pédagogiques de votre établissement.</p>
        <div className="ped-context"><span><CalendarDays size={14}/>{dateLabel()}</span><span>Année scolaire {academicYearLabel}</span><span>{semesterLabel}</span></div>
      </div><div className="ped-role-chip"><span>ESPACE PÉDAGOGIQUE</span><strong>Responsable pédagogique</strong></div>
    </header>

    <section className="ped-kpis" aria-label="Indicateurs pédagogiques">
      {pedagogicalKpis.map(kpi => { const Icon = iconMap[kpi.icon]; return <article className="ped-kpi" key={kpi.id}>
        <div className="ped-kpi-top"><span>{kpi.label}</span><i className={`ped-kpi-icon ped-tone--${kpi.tone}`}><Icon size={17}/></i></div>
        <strong>{kpi.value}</strong><small>{kpi.detail}</small>
      </article>; })}
    </section>

    <section className="ped-panel ped-grade-panel">
      <SectionTitle eyebrow="À TRAITER EN PRIORITÉ" title="Validation des notes" action={allowed("pedagogy.grades.view") ? {label:"Voir toutes les soumissions",run:()=>onNavigate("/grades-validation")} : undefined}/>
      <div className="ped-queue-summary"><div><strong>18</strong><span>Soumissions en attente</span></div><div><strong>6</strong><span>Classes concernées</span></div><div><strong>132</strong><span>Notes à vérifier</span></div><label className="ped-search"><Search size={14}/><input value={gradeSearch} onChange={e=>setGradeSearch(e.target.value)} placeholder="Rechercher une soumission…"/></label></div>
      <div className="ped-table-wrap"><table className="ped-table"><thead><tr><th>Enseignant</th><th>Classe</th><th>Matière</th><th>Semestre</th><th>Date d’envoi</th><th>Notes</th><th>Statut</th><th/></tr></thead>
        <tbody>{visibleGrades.map(row=><tr key={row.id}><td><strong>{row.teacher}</strong><small>{row.id}</small></td><td>{row.className}</td><td>{row.subject}</td><td>{row.term}</td><td>{row.submittedAt}</td><td>{row.grades}</td><td><span className="ped-status ped-status--pending">{row.status}</span></td><td><button type="button" onClick={()=>onNavigate(`/grades-validation?submission=${row.id}`)} aria-label={`Examiner la soumission ${row.id}`}>Examiner<ArrowRight size={13}/></button></td></tr>)}</tbody>
      </table>{visibleGrades.length===0&&<p className="ped-empty">Aucune soumission ne correspond à votre recherche.</p>}</div>
      {tasks.length>4&&<button className="ped-show-more" type="button" onClick={()=>setShowAllGrades(v=>!v)}>{showAllGrades?"Réduire la liste":"Afficher toutes les soumissions filtrées"}<ArrowRight size={13}/></button>}
    </section>

    <section className="ped-panel">
      <SectionTitle eyebrow="CONTENUS SOUMIS PAR LES ENSEIGNANTS" title="Validation des contenus pédagogiques"/>
      <div className="ped-tabs" role="tablist" aria-label="Type de contenu">
        <button type="button" role="tab" aria-selected={reviewTab==="Cours"} className={reviewTab==="Cours"?"is-active":""} onClick={()=>setReviewTab("Cours")}>Cours <b>{reviewCounts.courses}</b></button>
        <button type="button" role="tab" aria-selected={reviewTab==="Exercices"} className={reviewTab==="Exercices"?"is-active":""} onClick={()=>setReviewTab("Exercices")}>Exercices <b>{reviewCounts.exercises}</b></button>
      </div>
      <div className="ped-content-grid">{selectedContent.map(item=><article className="ped-content-item" key={item.id}>
        <div className="ped-content-item-head"><span className={`ped-status ${statusClass(item.status)}`}>{item.status}</span><small>{item.submittedAt}</small></div>
        <h3>{item.title}</h3><p>{item.teacher} · {item.subject}</p><div className="ped-content-meta"><span>{item.target}</span><span>Réf. {item.id}</span></div>
        <button type="button" onClick={()=>onNavigate(`/courses-exercises?tab=${item.kind==="Cours"?"courses":"exercises"}&item=${item.id}`)}>Examiner le {item.kind.toLocaleLowerCase("fr-FR")}<ArrowRight size={13}/></button>
      </article>)}</div>
      <div className="ped-approved-note"><CheckCircle2 size={14}/> Les contenus approuvés et à corriger sont également visibles dans la liste complète.</div>
    </section>

    <section className="ped-panel">
      <SectionTitle eyebrow="SUIVI DES RÉSULTATS" title="Performance académique"/>
      <div className="ped-filters">
        <label>Année scolaire<select value={year} onChange={e=>setYear(e.target.value)}><option>2026–2027</option><option>2025–2026</option></select></label>
        <label>Semestre<select value={term} onChange={e=>setTerm(e.target.value)}><option>1er semestre</option><option>2e semestre</option><option>Trimestre 1</option><option>Trimestre 2</option><option>Trimestre 3</option></select></label>
        <label>Niveau<select value={level} onChange={e=>setLevel(e.target.value as PerformanceLevel)}><option>Tous</option><option>Primaire</option><option>Collège</option><option>Lycée</option></select></label>
      </div>
      <div className="ped-performance-grid">
        <article><h3>Moyenne par niveau</h3><p>Résultats moyens sur 20</p><MiniBars data={chartLevels}/></article>
        <article><h3>Moyenne par classe</h3><p>Comparaison des classes sélectionnées</p><MiniBars data={chartClasses}/></article>
        <article><h3>Évolution des résultats</h3><p>Progression des moyennes par période · {year}</p><TrendLine data={trend}/></article>
      </div>
      <p className="ped-filter-note">Filtres actifs : {year} · {term} · {level==="Tous"?"Tous les niveaux":level}. Les graphiques par niveau et par classe suivent le niveau sélectionné.</p>
    </section>

    <section className="ped-panel">
      <SectionTitle eyebrow="SUIVI INDIVIDUEL" title="Élèves nécessitant une attention pédagogique" action={allowed("student.analytics.view")?{label:"Ouvrir le suivi des élèves à risque",run:()=>onNavigate("/student-risk")}:undefined}/>
      <div className="ped-table-wrap"><table className="ped-table"><thead><tr><th>Élève</th><th>Classe</th><th>Indicateur</th><th>Moyenne</th><th>Motif de l’alerte</th><th>Suivi</th><th/></tr></thead><tbody>
        {academicAlerts.map(row=><tr key={row.id}><td><strong>{row.student}</strong><small>{row.id}</small></td><td>{row.className}</td><td>{row.indicator}</td><td><b className="ped-low-average">{row.average}</b></td><td>{row.reason}</td><td><span className={`ped-status ${row.status==="À démarrer"?"ped-status--revision":"ped-status--pending"}`}>{row.status}</span></td><td><button type="button" onClick={()=>onNavigate(`/student-risk?student=${row.id}`)} aria-label={`Consulter le suivi de ${row.student}`}><ArrowRight size={14}/></button></td></tr>)}
      </tbody></table></div>
    </section>

    <section className="ped-ops-grid">
      <article className="ped-panel"><SectionTitle eyebrow="SUIVI DES ENSEIGNANTS" title="Rapports pédagogiques" action={allowed("pedagogy.reports.view")?{label:"Voir tous les rapports",run:()=>onNavigate("/pedagogical-reports")}:undefined}/>
        <div className="ped-report-summary"><div><strong>2</strong><span>À examiner</span></div><div><strong>1</strong><span>Approuvé récemment</span></div><div><strong>1</strong><span>À corriger</span></div></div>
        <div className="ped-report-list">{teacherReports.map(row=><div key={row.id}><span className="ped-report-icon"><FileText size={15}/></span><div><strong>{row.teacher}</strong><small>{row.className} · {row.period} · {row.submittedAt}</small></div><span className={`ped-status ${statusClass(row.status)}`}>{row.status}</span><button type="button" onClick={()=>onNavigate(`/pedagogical-reports?report=${row.id}`)} aria-label={`Examiner le rapport ${row.id}`}><ArrowRight size={14}/></button></div>)}</div>
      </article>
      <article className="ped-panel"><SectionTitle eyebrow="ORGANISATION" title="Aperçu des emplois du temps" action={allowed("pedagogy.schedule.view")?{label:"Gérer les emplois du temps",run:()=>onNavigate("/timetables")}:undefined}/>
        <div className="ped-timetable-stats"><div><strong>{timetableOverview.scheduledClasses}</strong><span>Classes avec emploi du temps</span></div><div className="is-alert"><strong>{timetableOverview.missingClasses}</strong><span>Sans emploi du temps</span></div><div><strong>{timetableOverview.updatesThisWeek}</strong><span>Mises à jour cette semaine</span></div></div>
        <h3 className="ped-subheading">Aujourd’hui</h3><div className="ped-schedule-list">{timetableOverview.today.map(item=><div key={item.time}><time>{item.time}</time><div><strong>{item.subject}</strong><small>{item.className} · {item.teacher}</small></div><span>{item.room}</span></div>)}</div>
        <div className="ped-timetable-tasks">{timetableOverview.tasks.map(task=><p key={task}><Clock3 size={13}/>{task}</p>)}</div>
      </article>
    </section>

    <section className="ped-ops-grid ped-ops-grid--bottom">
      <article className="ped-panel"><SectionTitle eyebrow="VALORISER LES PROGRÈS" title="Badges et distinctions" action={allowed("pedagogy.recognition.manage")?{label:"Gérer les badges",run:()=>onNavigate("/badges-recognition")}:undefined}/>
        <div className="ped-badge-total"><span><Award size={18}/></span><div><strong>{badgeOverview.total}</strong><small>Badges disponibles</small></div></div>
        <div className="ped-badge-list">{badgeOverview.badges.map(item=><div key={item.id}><span><Medal size={15}/></span><strong>{item.name}</strong><b>{item.assignments}</b></div>)}</div>
        <div className="ped-recent-badges"><strong>Attributions récentes</strong>{badgeOverview.recent.map(item=><p key={item.id}><Star size={13}/>{item.student}<span>{item.badge}</span><time>{item.date}</time></p>)}</div>
      </article>
      <article className="ped-panel"><SectionTitle eyebrow="JOURNAL DES OPÉRATIONS" title="Activité pédagogique récente" action={{label:"Historique complet",run:()=>onNavigate("/activity-history")}}/>
        <div className="ped-activity-list">{pedagogicalActivities.map(item=>{const Icon=activityIconMap[item.type]??Activity;return <div key={item.id}><span><Icon size={15}/></span><div><strong>{item.title}</strong><small>{item.detail} · {item.actor}</small></div><time>{item.date}</time></div>;})}</div>
      </article>
    </section>

    <section className="ped-panel ped-quick-panel"><SectionTitle eyebrow="ACCÈS DIRECT" title="Actions rapides"/><div className="ped-quick-actions">{availableQuickActions.map(action=><button type="button" key={action.id} onClick={()=>onNavigate(action.route)}><span>{action.id==="grades"?<ClipboardCheck size={17}/>:action.id==="courses"?<BookOpen size={17}/>:action.id==="exercises"?<NotebookPen size={17}/>:action.id==="reports"?<FileText size={17}/>:action.id==="timetables"?<CalendarDays size={17}/>:<Award size={17}/>}</span>{action.label}<ArrowRight size={14}/></button>)}</div></section>
    <footer className="ped-footer"><span>Tableau de bord pédagogique</span><span>Données fictives de démonstration · Non connectées à une base réelle</span></footer>
  </main>;
}
