import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3,
  FileCheck2, GraduationCap, LayoutDashboard, RefreshCw, Search, ShieldAlert,
  Users, Wallet,
} from "lucide-react";
import { studentsRepository, type StudentRecord, type StudentsData } from "../../services/students";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./DirectorOverviewPage.css";

interface Props {
  user: AuthenticatedSidebarUser;
  onNavigate: (route: string) => void;
}

type FollowUp = {
  id: string;
  title: string;
  detail: string;
  reason: string;
  route: string;
  tone: "warning" | "danger" | "info";
};

const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);
const formatDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
};
const initials = (student: StudentRecord) =>
  (student.firstName.slice(0, 1) + student.lastName.slice(0, 1)).toLocaleUpperCase("fr-FR");

function SectionHeading({ eyebrow, title, action }: {
  eyebrow: string;
  title: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="director-section-heading">
      <div><span>{eyebrow}</span><h2>{title}</h2></div>
      {action && <button type="button" onClick={action.onClick}>{action.label}<ArrowRight size={15}/></button>}
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, tone, onClick }: {
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

function buildFollowUps(data: StudentsData): FollowUp[] {
  const followUps: FollowUp[] = [];
  const active = data.students.filter(student => student.enrollment?.status === "Actif");
  const pendingEnrollments = data.students.filter(student => student.enrollment?.status === "En attente");
  const suspendedEnrollments = data.students.filter(student => student.enrollment?.status === "Suspendu");
  const incompleteDocuments = active.filter(student =>
    student.documents.length === 0 || student.documents.some(document => document.status !== "Vérifié")
  );
  const withoutGuardian = active.filter(student => student.guardiansResolved.length === 0);

  if (pendingEnrollments.length) {
    followUps.push({
      id: "pending-enrollments",
      title: "Inscriptions en attente",
      detail: `${formatNumber(pendingEnrollments.length)} dossier(s) nécessitent une vérification administrative.`,
      reason: "Inscription",
      route: "/students",
      tone: "warning",
    });
  }
  if (incompleteDocuments.length) {
    followUps.push({
      id: "incomplete-documents",
      title: "Pièces justificatives à vérifier",
      detail: `${formatNumber(incompleteDocuments.length)} dossier(s) actif(s) contiennent des pièces manquantes ou non vérifiées.`,
      reason: "Documents",
      route: "/students",
      tone: "danger",
    });
  }
  if (withoutGuardian.length) {
    followUps.push({
      id: "missing-guardian",
      title: "Responsable légal non renseigné",
      detail: `${formatNumber(withoutGuardian.length)} élève(s) actif(s) sans parent ou tuteur associé.`,
      reason: "Dossier élève",
      route: "/students",
      tone: "warning",
    });
  }
  if (suspendedEnrollments.length) {
    followUps.push({
      id: "suspended-enrollments",
      title: "Inscriptions suspendues",
      detail: `${formatNumber(suspendedEnrollments.length)} dossier(s) ont un statut suspendu.`,
      reason: "Inscription",
      route: "/students",
      tone: "info",
    });
  }
  return followUps;
}

export function DirectorOverviewPage({ user, onNavigate }: Props) {
  const canViewStudents = user.permissions.includes("people.students.view");
  const [data, setData] = useState<StudentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [yearId, setYearId] = useState("");
  const [query, setQuery] = useState("");

  const load = () => {
    if (!canViewStudents) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    studentsRepository.list()
      .then(result => {
        setData(result);
        setYearId(current => current || result.academicYears.find(year => year.status === "Active")?.id || result.academicYears[0]?.id || "");
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : "Impossible de charger les données de l’établissement."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [canViewStudents]);

  const selectedYear = data?.academicYears.find(year => year.id === yearId) ?? null;
  const yearStudents = useMemo(
    () => (data?.students ?? []).filter(student => student.enrollment?.academicYearId === yearId),
    [data, yearId],
  );
  const activeStudents = yearStudents.filter(student => student.enrollment?.status === "Actif");
  const pendingStudents = yearStudents.filter(student => student.enrollment?.status === "En attente");
  const suspendedStudents = yearStudents.filter(student => student.enrollment?.status === "Suspendu");
  const withdrawnStudents = yearStudents.filter(student => student.enrollment?.status === "Retiré");
  const incompleteDocuments = activeStudents.filter(student =>
    student.documents.length === 0 || student.documents.some(document => document.status !== "Vérifié")
  );
  const activeClasses = (data?.classes ?? []).filter(item => item.academicYearId === yearId && item.status === "Actif");
  const activeLevels = useMemo(() => {
    const grouped = new Map<string, { label: string; students: number; classes: Set<string> }>();
    activeStudents.forEach(student => {
      const label = student.cycleName || student.levelName || "Niveau non affecté";
      const current = grouped.get(label) ?? { label, students: 0, classes: new Set<string>() };
      current.students += 1;
      if (student.enrollment?.classId) current.classes.add(student.enrollment.classId);
      grouped.set(label, current);
    });
    return [...grouped.values()].map(item => ({ ...item, classes: item.classes.size })).sort((a, b) => a.label.localeCompare(b.label, "fr"));
  }, [activeStudents]);
  const followUps = useMemo(() => buildFollowUps({ ...(data as StudentsData), students: yearStudents }), [data, yearStudents]);
  const recentStudents = useMemo(
    () => [...yearStudents].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [yearStudents],
  );
  const filteredStudents = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("fr-FR");
    if (!term) return recentStudents;
    return yearStudents.filter(student =>
      [student.firstName, student.lastName, student.code, student.className]
        .some(value => value.toLocaleLowerCase("fr-FR").includes(term))
    ).slice(0, 6);
  }, [query, recentStudents, yearStudents]);

  const greeting = new Date().getHours() < 12 ? "Bonjour" : new Date().getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const firstName = user.displayName.trim().split(/\s+/)[0] || "Directeur";
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  if (!user.permissions.includes("overview.view")) {
    return <main className="director-dashboard"><div className="director-access"><ShieldAlert size={24}/><h1>Accès non autorisé</h1><p>Votre compte ne dispose pas de l’autorisation nécessaire pour consulter le tableau de bord.</p></div></main>;
  }

  return (
    <main className="director-dashboard">
      <header className="director-welcome">
        <div className="director-welcome-copy">
          <div className="director-breadcrumb"><LayoutDashboard size={14}/> Direction <span>/</span> Tableau de bord</div>
          <h1>Tableau de bord</h1>
          <p>{greeting} {firstName}, voici la situation de votre établissement.</p>
          <div className="director-context"><span><CalendarDays size={14}/>{selectedYear?.name ?? "Année scolaire non définie"}</span><span>{today}</span></div>
        </div>
        <label className="director-period"><span>Année scolaire</span><select value={yearId} onChange={event => setYearId(event.target.value)} disabled={!data?.academicYears.length}>
          {(data?.academicYears ?? []).map(year => <option key={year.id} value={year.id}>{year.name}</option>)}
        </select></label>
      </header>

      <div className="director-source-banner">
        <span><CheckCircle2 size={16}/><strong>Données locales de l’établissement</strong></span>
        <p>Les indicateurs de scolarité proviennent des dossiers élèves et des inscriptions enregistrés dans ce navigateur. Ils ne sont pas synchronisés avec un serveur central.</p>
      </div>

      {error && <div className="director-error" role="alert"><AlertCircle size={17}/><span>{error}</span><button type="button" onClick={load}><RefreshCw size={14}/>Réessayer</button></div>}

      <section className="director-metrics" aria-label="Indicateurs de scolarité">
        <Metric label="Élèves inscrits actifs" value={loading ? "—" : formatNumber(activeStudents.length)} detail="Inscriptions actives pour l’année sélectionnée" icon={GraduationCap} tone="blue" onClick={() => onNavigate("/students")}/>
        <Metric label="Classes actives" value={loading ? "—" : formatNumber(activeClasses.length)} detail="Classes ouvertes pour l’année sélectionnée" icon={BookOpen} tone="green" onClick={() => onNavigate("/classes-groups")}/>
        <Metric label="Dossiers à vérifier" value={loading ? "—" : formatNumber(incompleteDocuments.length)} detail="Pièces manquantes ou non vérifiées" icon={FileCheck2} tone="amber" onClick={() => onNavigate("/students")}/>
        <Metric label="Inscriptions en attente" value={loading ? "—" : formatNumber(pendingStudents.length)} detail={`${formatNumber(suspendedStudents.length)} suspendue(s) · ${formatNumber(withdrawnStudents.length)} retirée(s)`} icon={Users} tone="violet" onClick={() => onNavigate("/students")}/>
      </section>

      <section className="director-main-grid">
        <article className="director-panel director-panel--overview">
          <SectionHeading eyebrow="STRUCTURE SCOLAIRE" title="Effectifs par cycle"/>
          {loading ? <div className="director-loading">Chargement des effectifs…</div> : activeLevels.length ? (
            <div className="director-level-list">
              {activeLevels.map(level => {
                const share = activeStudents.length ? Math.round(level.students / activeStudents.length * 100) : 0;
                return <div className="director-level-row" key={level.label}>
                  <div className="director-level-top"><strong>{level.label}</strong><span>{formatNumber(level.students)} élèves · {level.classes} classe(s)</span></div>
                  <div className="director-level-track"><i style={{ width: `${share}%` }}/></div>
                  <small>{share}% des inscriptions actives</small>
                </div>;
              })}
            </div>
          ) : <div className="director-empty-state">Aucun effectif actif pour cette année scolaire.</div>}
          <div className="director-panel-footer"><span>{formatNumber(activeStudents.length)} inscription(s) active(s)</span><button type="button" onClick={() => onNavigate("/classes-groups")}>Gérer les classes<ArrowRight size={14}/></button></div>
        </article>

        <article className="director-panel">
          <SectionHeading eyebrow="SUIVI ADMINISTRATIF" title="Points à examiner" action={{ label: "Ouvrir les élèves", onClick: () => onNavigate("/students") }}/>
          {loading ? <div className="director-loading">Analyse des dossiers…</div> : followUps.length ? (
            <div className="director-followups">
              {followUps.map(item => <button type="button" className="director-followup" key={item.id} onClick={() => onNavigate(item.route)}>
                <span className={`director-followup-icon director-followup-icon--${item.tone}`}>{item.tone === "danger" ? <AlertCircle size={17}/> : item.tone === "warning" ? <ShieldAlert size={17}/> : <Clock3 size={17}/>}</span>
                <span className="director-followup-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>
                <span className="director-followup-count">{item.reason}</span>
                <ArrowRight size={15}/>
              </button>)}
            </div>
          ) : <div className="director-empty-state">Aucun suivi administratif calculé à partir des dossiers actuels.</div>}
          <p className="director-panel-footnote">Les alertes sont déduites des statuts et documents présents dans les dossiers élèves. Elles ne remplacent pas un workflow de validation.</p>
        </article>
      </section>

      <section className="director-main-grid director-main-grid--lower">
        <article className="director-panel">
          <SectionHeading eyebrow="DOSSIERS ÉLÈVES" title="Inscriptions récentes" action={{ label: "Tous les élèves", onClick: () => onNavigate("/students") }}/>
          <label className="director-search"><Search size={15}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un élève, une référence ou une classe…"/></label>
          {loading ? <div className="director-loading">Chargement des dossiers…</div> : filteredStudents.length ? (
            <div className="director-student-list">
              {filteredStudents.map(student => <button type="button" className="director-student-row" key={student.id} onClick={() => onNavigate("/students")}>
                <span className="director-student-avatar">{initials(student)}</span>
                <span className="director-student-copy"><strong>{student.firstName} {student.lastName}</strong><small>{student.code} · {student.className}</small></span>
                <span className="director-student-status">{student.enrollment?.status ?? "Sans inscription"}</span>
                <time>{formatDate(student.createdAt)}</time>
                <ArrowRight size={14}/>
              </button>)}
            </div>
          ) : <div className="director-empty-state">{query ? "Aucun élève ne correspond à cette recherche." : "Aucune inscription à afficher."}</div>}
        </article>

        <article className="director-panel director-modules-panel">
          <SectionHeading eyebrow="PILOTAGE DE L’ÉTABLISSEMENT" title="Accès rapides"/>
          <div className="director-module-links">
            <button type="button" onClick={() => onNavigate("/student-attendance")}><span className="director-module-icon"><Users size={17}/></span><span><strong>Présences des élèves</strong><small>Relevé illustratif · saisie non connectée</small></span><ArrowRight size={15}/></button>
            <button type="button" onClick={() => onNavigate("/pedagogical-reports")}><span className="director-module-icon"><BookOpen size={17}/></span><span><strong>Suivi pédagogique</strong><small>Rapports et résultats à consolider</small></span><ArrowRight size={15}/></button>
            <button type="button" onClick={() => onNavigate("/financial-reports")}><span className="director-module-icon"><Wallet size={17}/></span><span><strong>Situation financière</strong><small>Consulter les données de démonstration du module</small></span><ArrowRight size={15}/></button>
            <button type="button" onClick={() => onNavigate("/activity-history")}><span className="director-module-icon"><Clock3 size={17}/></span><span><strong>Historique des opérations</strong><small>Journal central non connecté</small></span><ArrowRight size={15}/></button>
          </div>
        </article>
      </section>

      <footer className="director-footer"><span>Direction · Tableau de bord</span><span>{data ? `Source : dossiers élèves locaux · ${formatNumber(yearStudents.length)} dossier(s) sur l’année sélectionnée` : "Source des indicateurs indisponible"}</span></footer>
    </main>
  );
}
