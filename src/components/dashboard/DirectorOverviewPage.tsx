import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, ArrowUpRight, Banknote, BookOpenCheck,
  CalendarDays, CheckCircle2, Clock3, GraduationCap, LayoutDashboard,
  ShieldAlert, TrendingUp, Users, Wallet, X,
} from "lucide-react";
import {
  academicLevels, attendanceSeries, classPerformance, dashboardRangeOptions,
  financialSummary, importantAlerts, recentActivities, revenueByRange,
  studentsAtRisk, type DashboardRange,
} from "../../data/director-dashboard";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import { DirectorTaskCenter } from "./DirectorTaskCenter";
import "./DirectorOverviewPage.css";

interface Props {
  user: AuthenticatedSidebarUser;
  onNavigate: (route: string) => void;
}

const number = (value: number) => new Intl.NumberFormat("fr-FR").format(value);
const todayLabel = () => new Intl.DateTimeFormat("fr-FR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
}).format(new Date());

function SectionTitle({ eyebrow, title, action }: {
  eyebrow: string;
  title: string;
  action?: { label: string; run: () => void };
}) {
  return (
    <div className="director-section-title">
      <div><span>{eyebrow}</span><h2>{title}</h2></div>
      {action && <button type="button" onClick={action.run}>{action.label}<ArrowRight size={15}/></button>}
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone, onClick }: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  tone: "blue" | "green" | "amber" | "violet";
  onClick: () => void;
}) {
  return (
    <button type="button" className="director-metric" onClick={onClick}>
      <span className={`director-metric-icon director-tone--${tone}`}><Icon size={19}/></span>
      <span className="director-metric-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></span>
      <ArrowRight className="director-metric-arrow" size={16}/>
    </button>
  );
}

function AttendancePanel({ onNavigate }: { onNavigate: (route: string) => void }) {
  const total = 1248;
  const present = 1176;
  const absent = 49;
  const late = 23;
  return (
    <article className="director-panel">
      <SectionTitle eyebrow="VIE SCOLAIRE · AUJOURD’HUI" title="Présence des élèves"
        action={{ label: "Ouvrir les présences", run: () => onNavigate("/student-attendance") }}/>
      <div className="director-attendance-main">
        <div><strong>94,2<span>%</span></strong><small>Taux de présence</small></div>
        <div className="director-attendance-track" role="img" aria-label="94,2 % présents, 3,9 % absents, 1,9 % en retard">
          <span className="is-present" style={{ width: "94.2%" }}/><span className="is-absent" style={{ width: "3.9%" }}/><span className="is-late" style={{ width: "1.9%" }}/>
        </div>
      </div>
      <div className="director-attendance-breakdown">
        <div><i className="is-present"/><span>Présents</span><strong>{number(present)}</strong></div>
        <div><i className="is-absent"/><span>Absents</span><strong>{number(absent)}</strong></div>
        <div><i className="is-late"/><span>En retard</span><strong>{number(late)}</strong></div>
      </div>
      <div className="director-panel-footnote">Sur {number(total)} élèves inscrits · chiffres simulés pour la démonstration</div>
    </article>
  );
}

export function DirectorOverviewPage({ user, onNavigate }: Props) {
  const [range, setRange] = useState<DashboardRange>("30");
  const [showDemoNotice, setShowDemoNotice] = useState(true);
  const firstName = user.displayName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const activities = useMemo(() => recentActivities.filter(item => item.daysAgo <= Number(range)).slice(0, 5), [range]);
  const revenue = revenueByRange[range];
  const maxRevenue = Math.max(...revenue.map(item => item.amount), 1);
  const average = "14,6";
  const riskCount = studentsAtRisk.filter(item => item.status !== "Résolu").length;
  const periodLabel = range === "7" ? "7 derniers jours" : range === "30" ? "30 derniers jours" : "90 derniers jours";

  return (
    <main className="director-dashboard">
      <header className="director-welcome">
        <div className="director-welcome-copy">
          <div className="director-breadcrumb"><LayoutDashboard size={14}/> Direction <span>/</span> Tableau de bord</div>
          <div className="director-title-row"><div><h1>Tableau de bord</h1><p>{greeting} {firstName}, voici les points essentiels de votre établissement.</p></div></div>
          <div className="director-context"><span><CalendarDays size={14}/> Année scolaire 2026–2027</span><span>{todayLabel()}</span></div>
        </div>
        <label className="director-period"><span>Période d’analyse</span><select value={range} onChange={event => setRange(event.target.value as DashboardRange)}>{dashboardRangeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      </header>

      {showDemoNotice && (
        <div className="director-demo-notice" role="status">
          <span><AlertTriangle size={17}/><span><strong>Mode démonstration</strong> — Les indicateurs de cette page sont fictifs. Les données ne sont pas encore consolidées depuis une base centrale.</span></span>
          <button type="button" onClick={() => setShowDemoNotice(false)} aria-label="Masquer l’avertissement"><X size={16}/></button>
        </div>
      )}

      <section className="director-metrics" aria-label="Indicateurs clés de l’établissement">
        <MetricCard label="Élèves inscrits" value="1 248" detail="1 216 actifs · 32 dossiers à vérifier" icon={GraduationCap} tone="blue" onClick={() => onNavigate("/students")}/>
        <MetricCard label="Présence aujourd’hui" value="94,2 %" detail="49 absents · 23 retards" icon={Users} tone="green" onClick={() => onNavigate("/student-attendance")}/>
        <MetricCard label="Suivis prioritaires" value={String(riskCount + 8)} detail={`${riskCount} situations élèves · autres alertes`} icon={ShieldAlert} tone="amber" onClick={() => onNavigate("/student-risk")}/>
        <MetricCard label="Encaissements" value={financialSummary.collected} detail={`${financialSummary.comparison} par rapport à la période précédente`} icon={Wallet} tone="violet" onClick={() => onNavigate("/financial-reports")}/>
      </section>

      <section className="director-priority-section">
        <DirectorTaskCenter onNavigate={onNavigate}/>
      </section>

      <section className="director-content-grid director-content-grid--equal">
        <AttendancePanel onNavigate={onNavigate}/>
        <article className="director-panel director-alert-panel">
          <SectionTitle eyebrow="POINTS DE VIGILANCE" title="Ce qui demande votre attention"
            action={{ label: "Suivi des élèves", run: () => onNavigate("/student-risk") }}/>
          <div className="director-alert-list">
            {importantAlerts.map(alert => (
              <div className={`director-alert director-alert--${alert.severity}`} key={alert.id}>
                <span className="director-alert-icon">{alert.severity === "critical" ? <AlertTriangle size={17}/> : alert.severity === "warning" ? <ShieldAlert size={17}/> : <CalendarDays size={17}/>}</span>
                <div><strong>{alert.title}</strong><p>{alert.description}</p></div>
                <button type="button" onClick={() => onNavigate(alert.route)}>{alert.action}<ArrowRight size={14}/></button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="director-content-grid director-content-grid--wide-left">
        <article className="director-panel">
          <SectionTitle eyebrow="RÉSULTATS SCOLAIRES" title="Vue pédagogique"
            action={{ label: "Rapports pédagogiques", run: () => onNavigate("/pedagogical-reports") }}/>
          <div className="director-academic-summary"><div><strong>{average}<small>/20</small></strong><span>Moyenne générale simulée</span></div><span className="director-trend"><ArrowUpRight size={15}/> +0,4 pt</span></div>
          <div className="director-chart-caption">Moyenne par niveau · sur 20</div>
          <div className="director-level-bars">
            {academicLevels.map(level => <div className="director-level-row" key={level.label}>
              <span>{level.label}</span><div><i style={{ width: `${level.value / 20 * 100}%` }}/></div><strong>{level.value.toLocaleString("fr-FR")}</strong>
            </div>)}
          </div>
          <div className="director-class-summary">
            <div><span>Meilleure classe</span><strong>1re B · 15,8/20</strong></div>
            <div><span>À accompagner</span><strong>4e A · 13,9/20</strong></div>
          </div>
          <div className="director-inline-link"><button type="button" onClick={() => onNavigate("/class-rankings")}>Comparer les classes<ArrowRight size={14}/></button></div>
        </article>

        <article className="director-panel">
          <SectionTitle eyebrow="PILOTAGE FINANCIER" title="Situation financière"
            action={{ label: "Rapports financiers", run: () => onNavigate("/financial-reports") }}/>
          <div className="director-finance-list">
            <div><span className="director-finance-icon is-income"><Banknote size={17}/></span><span><strong>Encaissements</strong><small>Montants reçus</small></span><b>{financialSummary.collected}</b></div>
            <div><span className="director-finance-icon is-outstanding"><Clock3 size={17}/></span><span><strong>Reste à recouvrer</strong><small>127 dossiers concernés</small></span><b>{financialSummary.outstanding}</b></div>
            <div><span className="director-finance-icon is-expense"><Activity size={17}/></span><span><strong>Dépenses enregistrées</strong><small>Charges de fonctionnement</small></span><b>{financialSummary.expenses}</b></div>
          </div>
          <div className="director-chart-caption">Évolution des recettes · milliers de DH · {periodLabel}</div>
          <div className="director-revenue-chart" role="img" aria-label={revenue.map(item => `${item.label} : ${item.amount} milliers de dirhams`).join(", ")}>
            {revenue.map(item => <div key={item.label}><strong>{item.amount}</strong><span><i style={{ height: `${item.amount / maxRevenue * 100}%` }}/></span><small>{item.label}</small></div>)}
          </div>
        </article>
      </section>

      <section className="director-content-grid director-content-grid--wide-left">
        <article className="director-panel">
          <SectionTitle eyebrow="ACCOMPAGNEMENT DES ÉLÈVES" title="Situations à suivre"
            action={{ label: "Ouvrir le suivi", run: () => onNavigate("/student-risk") }}/>
          <div className="director-risk-list">
            {studentsAtRisk.slice(0, 3).map(student => <button type="button" className="director-risk-row" key={student.id} onClick={() => onNavigate(`/student-risk?student=${student.id}`)}>
              <span className={`director-risk-avatar director-risk-avatar--${student.tone}`}>{student.initials}</span>
              <span className="director-risk-copy"><strong>{student.name}</strong><small>{student.className} · {student.reason}</small></span>
              <span className={`director-risk-status director-risk-status--${student.tone}`}>{student.status}</span>
              <ArrowRight size={15}/>
            </button>)}
          </div>
          <div className="director-panel-footnote">Exemples fictifs · consulter le dossier complet dans le module de suivi</div>
        </article>
        <article className="director-panel">
          <SectionTitle eyebrow="VIE DE L’ÉTABLISSEMENT" title="Activité récente"
            action={{ label: "Tout l’historique", run: () => onNavigate("/activity-history") }}/>
          <div className="director-activity-list">
            {activities.map(item => <div className="director-activity-row" key={item.id}>
              <span className={`director-activity-icon director-activity-icon--${item.type}`}>{item.type === "payment" ? <Banknote size={15}/> : item.type === "grade" ? <CheckCircle2 size={15}/> : item.type === "attendance" ? <CalendarDays size={15}/> : item.type === "course" ? <BookOpenCheck size={15}/> : <GraduationCap size={15}/>}</span>
              <span><strong>{item.title}</strong><small>{item.description}</small></span>
              <time>{item.daysAgo === 0 ? "Aujourd’hui" : item.daysAgo === 1 ? "Hier" : `Il y a ${item.daysAgo} j`} · {item.time}</time>
            </div>)}
            {activities.length === 0 && <p className="director-empty">Aucune activité sur cette période.</p>}
          </div>
        </article>
      </section>

      <footer className="director-footer"><span>Direction · Tableau de bord</span><span>Données de démonstration · Période : {periodLabel}</span></footer>
    </main>
  );
}
