import { useEffect, useMemo, useState } from "react";
import "./DirectorOverviewPage.css";
import {
  Activity, AlertCircle, ArrowRight, ArrowUpRight, BadgeCheck,
  Banknote, BookOpenCheck, CalendarDays, ChevronDown, CircleAlert,
  Clock3, GraduationCap, LayoutDashboard, Receipt, ShieldAlert, TrendingUp,
  UserRound, Users, Wallet, X,
} from "lucide-react";
import {
  academicLevels, academicTrend, attendanceSeries, classPerformance,
  dashboardRangeOptions, directorKpis, financialSummary, importantAlerts,
  pendingApprovals, recentActivities, revenueByRange, studentDistribution,
  studentsAtRisk, type DashboardRange,
} from "../../data/director-dashboard";
import type { AuthenticatedSidebarUser } from "../../types/navigation";

interface Props {
  user: AuthenticatedSidebarUser;
  onNavigate: (route: string) => void;
}

const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: { label: string; onClick: () => void } }) {
  return <div className="dash-section-heading">
    <div>{eyebrow && <span className="dash-eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>
    {action && <button type="button" className="dash-text-action" onClick={action.onClick}>{action.label}<ArrowRight size={14}/></button>}
  </div>;
}

function KpiIcon({ name }: { name: string }) {
  const icons: Record<string, typeof Users> = {
    students: GraduationCap, teachers: Users, employees: UserRound,
    attendance: CalendarDays, performance: TrendingUp, payments: Wallet,
  };
  const Icon = icons[name] ?? Activity;
  return <span className="dash-kpi-icon"><Icon size={18}/></span>;
}

function BarChart({ data, max = 20, suffix = "/20" }: { data: { label: string; value: number }[]; max?: number; suffix?: string }) {
  return <div className="dash-bars" role="img" aria-label={data.map(item => `${item.label} : ${item.value}${suffix}`).join(", ")}>
    <div className="dash-bars-scale"><span>{max}{suffix}</span><span>{Math.round(max / 2)}{suffix}</span><span>0</span></div>
    <div className="dash-bars-grid">{data.map(item => <div className="dash-bar-column" key={item.label}>
      <span className="dash-bar-value">{item.value.toLocaleString("fr-FR")}{suffix}</span>
      <div className="dash-bar-track"><span style={{ height: `${Math.min(100, item.value / max * 100)}%` }}/></div>
      <span className="dash-bar-label">{item.label}</span>
    </div>)}</div>
  </div>;
}

function TrendChart({ data }: { data: { label: string; value: number }[] }) {
  const points = data.map((item, index) => ({ x: 22 + index * (256 / Math.max(1, data.length - 1)), y: 108 - (item.value - 12) * 12 }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  return <div className="dash-trend-chart">
    <svg viewBox="0 0 300 132" role="img" aria-label="Évolution de la moyenne générale">
      {[36, 72, 108].map(y => <line key={y} x1="16" x2="286" y1={y} y2={y} className="dash-chart-gridline"/>)}
      <path d={`${path} L 278 118 L 22 118 Z`} className="dash-trend-area"/>
      <path d={path} className="dash-trend-line"/>
      {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3.5" className="dash-trend-dot"/>)}
    </svg>
    <div className="dash-trend-labels">{data.map(item => <span key={item.label}>{item.label}</span>)}</div>
  </div>;
}

function DistributionDonut() {
  const total = studentDistribution.reduce((sum, item) => sum + item.value, 0);
  const first = studentDistribution[0].value / total * 100;
  return <div className="dash-donut-wrap">
    <div className="dash-donut" style={{ background: `conic-gradient(#8b9ed0 0 ${first}%, #4f86a8 ${first}% 100%)` }}>
      <div><strong>{formatNumber(total)}</strong><span>élèves</span></div>
    </div>
    <div className="dash-legend">{studentDistribution.map(item => <div key={item.label}><span className="dash-legend-dot" style={{ background: item.color }}/><span>{item.label}</span><strong>{formatNumber(item.value)}</strong></div>)}</div>
  </div>;
}

function AttendanceChart({ range }: { range: DashboardRange }) {
  const rows = range === "7" ? attendanceSeries.slice(-7) : range === "30" ? [
    { label: "S1", present: 94, absent: 4, late: 2 },
    { label: "S2", present: 93, absent: 5, late: 2 },
    { label: "S3", present: 95, absent: 3, late: 2 },
    { label: "S4", present: 94, absent: 4, late: 2 },
  ] : [
    { label: "Sept.", present: 93, absent: 5, late: 2 },
    { label: "Oct.", present: 94, absent: 4, late: 2 },
    { label: "Nov.", present: 95, absent: 3, late: 2 },
  ];
  return <div className="dash-attendance-chart">
    <div className="dash-attendance-legend"><span><i className="is-present"/>Présents</span><span><i className="is-absent"/>Absents</span><span><i className="is-late"/>En retard</span></div>
    <div className="dash-attendance-bars" style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}>{rows.map((row, index) => <div className="dash-attendance-column" key={`${row.label}-${index}`}>
      <div className="dash-attendance-stack"><span className="is-present" style={{ height: `${row.present}%` }}/><span className="is-late" style={{ height: `${row.late}%` }}/><span className="is-absent" style={{ height: `${row.absent}%` }}/></div>
      <small>{row.label}</small>
    </div>)}</div>
  </div>;
}

export function DirectorOverviewPage({ user, onNavigate }: Props) {
  const [range, setRange] = useState<DashboardRange>("30");
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showDemoNotice, setShowDemoNotice] = useState(true);
  const filteredActivities = useMemo(() => recentActivities.filter(item => item.daysAgo <= Number(range)), [range]);
  const activities = showAllActivities ? filteredActivities : filteredActivities.slice(0, 4);
  const revenue = revenueByRange[range];
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const greeting = new Date().getHours() < 12 ? "Bonjour" : new Date().getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const selected = studentsAtRisk.find(student => student.id === selectedStudent);

  useEffect(() => {
    if (!selectedStudent) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedStudent(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStudent]);

  return <main className="director-dashboard">
    <div className="dash-welcome">
      <div>
        <div className="dash-breadcrumb"><LayoutDashboard size={13}/> Tableau de bord <span>/</span> Vue d’ensemble</div>
        <h1>Vue d’ensemble</h1>
        <p>{greeting} {user.displayName.split(" ")[0]}, voici la situation de votre établissement.</p>
        <div className="dash-context"><span><CalendarDays size={14}/> Année scolaire 2026–2027</span><span className="dash-date">{today}</span></div>
      </div>
      <label className="dash-range-select"><span>Période d’analyse</span><span className="dash-select-wrap"><select value={range} onChange={event => setRange(event.target.value as DashboardRange)}>{dashboardRangeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={15}/></span></label>
    </div>

    {showDemoNotice && <div className="dash-demo-notice"><span><AlertCircle size={16}/><span><strong>Données de démonstration</strong> — Ces chiffres illustrent le tableau de bord et ne proviennent pas encore d’une base de données réelle.</span></span><button type="button" onClick={() => setShowDemoNotice(false)} aria-label="Fermer l’avertissement"><X size={16}/></button></div>}

    <section className="dash-kpi-grid" aria-label="Indicateurs clés">
      {directorKpis.map(item => <article className="dash-kpi-card" key={item.id}>
        <div className="dash-kpi-top"><span>{item.label}</span><KpiIcon name={item.icon}/></div>
        <strong className="dash-kpi-value">{item.value}</strong>
        <div className="dash-kpi-bottom"><span>{item.detail}</span><span className={`dash-kpi-trend dash-kpi-trend--${item.direction}`}>{item.direction === "up" ? <ArrowUpRight size={13}/> : <Activity size={13}/>} {item.trend}</span></div>
      </article>)}
    </section>

    <section className="dash-grid dash-grid--academic">
      <article className="dash-panel">
        <SectionHeading eyebrow="RÉSULTATS SCOLAIRES" title="Performance académique" action={{ label: "Rapports détaillés", onClick: () => onNavigate("/pedagogical-reports") }}/>
        <div className="dash-academic-summary"><strong>14,6<span>/20</span></strong><span className="dash-positive"><ArrowUpRight size={14}/> +0,4 pt</span><small>Moyenne générale · Trimestre en cours</small></div>
        <div className="dash-chart-title">Moyenne par niveau</div>
        <BarChart data={academicLevels.map(item => ({ label: item.label, value: item.value }))}/>
        <div className="dash-subchart">
          <div className="dash-chart-title">Comparaison des classes</div>
          <BarChart data={classPerformance} />
        </div>
        <div className="dash-subchart">
          <div className="dash-chart-title">Évolution par trimestre</div>
          <TrendChart data={academicTrend}/>
        </div>
        <div className="dash-class-strip"><span>Meilleure classe</span><strong>1re B · 15,8/20</strong><span>À suivre</span><strong>4e A · 13,9/20</strong></div>
      </article>
      <article className="dash-panel">
        <SectionHeading eyebrow="EFFECTIFS" title="Répartition des élèves"/>
        <div className="dash-student-total"><strong>1 248</strong><span>élèves inscrits au total</span></div>
        <DistributionDonut/>
        <div className="dash-divider"/>
        <div className="dash-chart-title">Effectifs par niveau</div>
        <div className="dash-level-list">{academicLevels.map(item => <div key={item.label}><div><span>{item.label}</span><strong>{formatNumber(item.students)}</strong></div><div className="dash-level-track"><span style={{ width: `${item.students / 468 * 100}%` }}/></div></div>)}</div>
        <button type="button" className="dash-panel-link" onClick={() => onNavigate("/students")}>Consulter les élèves<ArrowRight size={14}/></button>
      </article>
    </section>

    <section className="dash-grid dash-grid--attendance">
      <article className="dash-panel">
        <SectionHeading eyebrow="SUIVI QUOTIDIEN" title="Aperçu des présences" action={{ label: "Voir les présences", onClick: () => onNavigate("/student-attendance") }}/>
        <div className="dash-attendance-summary"><div><strong>94,2 %</strong><span>Taux de présence aujourd’hui</span></div><span className="dash-positive"><ArrowUpRight size={14}/> +1,6 pt</span></div>
        <div className="dash-attendance-stats"><div><i className="is-present"/><strong>1 176</strong><span>Présents</span></div><div><i className="is-absent"/><strong>49</strong><span>Absents</span></div><div><i className="is-late"/><strong>23</strong><span>En retard</span></div></div>
        <div className="dash-chart-title">Tendance des derniers jours</div>
        <AttendanceChart range={range}/>
      </article>
      <article className="dash-panel">
        <SectionHeading eyebrow="ACCOMPAGNEMENT" title="Élèves nécessitant une attention" action={{ label: "Voir tout", onClick: () => onNavigate("/student-risk") }}/>
        <div className="dash-risk-summary"><strong>12</strong><span>élèves signalés nécessitent un suivi actif</span><span className="dash-risk-badge"><ShieldAlert size={13}/> À surveiller</span></div>
        <div className="dash-risk-table-wrap"><table className="dash-risk-table">
          <thead><tr><th>Élève</th><th>Classe</th><th>Motif principal</th><th>Suivi</th><th/></tr></thead>
          <tbody>{(showAllStudents ? studentsAtRisk : studentsAtRisk.slice(0, 3)).map(student => <tr key={student.id}>
            <td><div className="dash-student-cell"><span>{student.initials}</span><div><strong>{student.name}</strong><small>{student.id}</small></div></div></td>
            <td>{student.className}</td><td><span className={`dash-risk-tag dash-risk-tag--${student.tone}`}>{student.risk}</span><small className="dash-reason">{student.reason}</small></td>
            <td><span className={`dash-status dash-status--${student.status === "Résolu" ? "done" : student.status === "En cours" ? "progress" : "pending"}`}>{student.status}</span></td>
            <td><button type="button" className="dash-icon-action" onClick={() => setSelectedStudent(student.id)} aria-label={`Voir le suivi de ${student.name}`}><ArrowRight size={15}/></button></td>
          </tr>)}</tbody>
        </table></div>
        <button type="button" className="dash-panel-link" onClick={() => setShowAllStudents(value => !value)}>{showAllStudents ? "Réduire la liste" : "Afficher les élèves de démonstration"}<ArrowRight size={14}/></button>
      </article>
    </section>

    <section className="dash-grid dash-grid--operations">
      <article className="dash-panel">
        <SectionHeading eyebrow="À TRAITER" title="Validations en attente"/>
        <div className="dash-approval-list">{pendingApprovals.map(item => <button type="button" className="dash-approval-item" key={item.id} onClick={() => onNavigate(item.route)}>
          <span className="dash-approval-icon">{item.icon === "grades" ? <BadgeCheck size={18}/> : item.icon === "reports" ? <Receipt size={18}/> : <BookOpenCheck size={18}/>}</span>
          <span className="dash-approval-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>
          <strong className="dash-approval-count">{item.count}</strong><ArrowRight size={15} className="dash-muted-arrow"/>
        </button>)}</div>
      </article>
      <article className="dash-panel">
        <SectionHeading eyebrow="SUIVI FINANCIER" title="Aperçu financier" action={{ label: "Rapports financiers", onClick: () => onNavigate("/financial-reports") }}/>
        <div className="dash-finance-metrics"><div><span>Encaissements</span><strong>{financialSummary.collected}</strong><small className="dash-positive"><ArrowUpRight size={12}/>{financialSummary.comparison} vs période précédente</small></div><div><span>Reste à recouvrer</span><strong>{financialSummary.outstanding}</strong><small>127 dossiers concernés</small></div><div><span>Dépenses</span><strong>{financialSummary.expenses}</strong><small>Budget de fonctionnement</small></div></div>
        <div className="dash-revenue-head"><span>Évolution des recettes</span><small>{range === "7" ? "7 jours" : range === "30" ? "30 jours" : "90 jours"} · milliers de DH</small></div>
        <div className="dash-revenue-bars">{revenue.map(item => <div key={item.label}><span>{item.amount}</span><i style={{ height: `${item.amount / 100 * 100}%` }}/><small>{item.label}</small></div>)}</div>
      </article>
    </section>

    <section className="dash-grid dash-grid--monitoring">
      <article className="dash-panel">
        <SectionHeading eyebrow="JOURNAL DE L’ÉTABLISSEMENT" title="Activité récente" action={{ label: "Historique complet", onClick: () => onNavigate("/activity-history") }}/>
        <div className="dash-activity-list">{activities.map(item => <div className="dash-activity-item" key={item.id}>
          <span className={`dash-activity-icon dash-activity-icon--${item.type}`}>{item.type === "student" ? <GraduationCap size={16}/> : item.type === "payment" ? <Banknote size={16}/> : item.type === "grade" ? <BadgeCheck size={16}/> : item.type === "attendance" ? <CalendarDays size={16}/> : item.type === "course" ? <BookOpenCheck size={16}/> : <UserRound size={16}/>}</span>
          <div><strong>{item.title}</strong><p>{item.description}</p><small>{item.actor}</small></div><time>{item.daysAgo === 0 ? "Aujourd’hui" : item.daysAgo === 1 ? "Hier" : `Il y a ${item.daysAgo} j`} · {item.time}</time>
        </div>)}</div>
        {filteredActivities.length > 4 && <button type="button" className="dash-panel-link" onClick={() => setShowAllActivities(value => !value)}>{showAllActivities ? "Afficher moins" : "Afficher plus d’activités"}<ArrowRight size={14}/></button>}
      </article>
      <article className="dash-panel">
        <SectionHeading eyebrow="POINTS DE VIGILANCE" title="Alertes importantes"/>
        <div className="dash-alert-list">{importantAlerts.map(alert => <div className={`dash-alert dash-alert--${alert.severity}`} key={alert.id}>
          <span className="dash-alert-icon">{alert.severity === "critical" ? <CircleAlert size={17}/> : alert.severity === "warning" ? <AlertCircle size={17}/> : <Clock3 size={17}/>}</span>
          <div><strong>{alert.title}</strong><p>{alert.description}</p><button type="button" onClick={() => onNavigate(alert.route)}>{alert.action}<ArrowRight size={12}/></button></div>
        </div>)}</div>
      </article>
    </section>

    <footer className="dash-footer"><span>Tableau de bord de direction</span><span>Données fictives à des fins de démonstration · Actualisation à l’ouverture</span></footer>

    {selected && <div className="dash-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedStudent(null); }}>
      <section className="dash-student-modal" role="dialog" aria-modal="true" aria-labelledby="dash-modal-title">
        <button type="button" className="dash-modal-close" onClick={() => setSelectedStudent(null)} aria-label="Fermer"><X size={18}/></button>
        <span className="dash-modal-avatar">{selected.initials}</span><span className="dash-eyebrow">DOSSIER ÉLÈVE · {selected.id}</span><h2 id="dash-modal-title">{selected.name}</h2>
        <p>{selected.className} · {selected.risk}</p><div className="dash-modal-reason">{selected.reason}</div>
        <p className="dash-modal-note">Aperçu de démonstration : les informations de suivi réelles seront chargées depuis le dossier de l’élève lorsque le backend sera connecté.</p>
        <button type="button" className="dash-primary-button" onClick={() => { setSelectedStudent(null); onNavigate("/student-risk"); }}>Ouvrir le suivi des élèves<ArrowRight size={15}/></button>
      </section>
    </div>}
  </main>;
}
