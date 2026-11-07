import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  AlertCircle, BookOpen, Check, CheckCircle2, Clock3, Download, Eye, File, FileText,
  FilterX, FolderOpen, Info, Library, MessageSquareText, Search, ShieldAlert, Users, X,
} from "lucide-react";
import { academicYearRepository } from "../../services/academic-years";
import { classesGroupsRepository } from "../../services/classes-groups";
import { subjectsRepository } from "../../services/subjects";
import { teachersRepository } from "../../services/teachers";
import { schoolBranding } from "../../config/school";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./CoursesExercisesPage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type Tab = "queue" | "library" | "returned";
type ReviewStatus = "pending" | "reviewing" | "approved" | "rejected" | "correction" | "information";
type PublicationStatus = "unpublished" | "published" | "unpublished-again";
type ResourceType = "Cours" | "Leçon" | "Exercice" | "Devoir" | "Document complémentaire";
interface Resource {
  id: string; title: string; description: string; type: ResourceType; teacherId: string; teacher: string;
  subjectId: string; subject: string; yearId: string; year: string; programId: string; program: string;
  levelId: string; level: string; classId: string; className: string; group: string;
  submittedAt: string; updatedAt: string; review: ReviewStatus; publication: PublicationStatus;
  fileName: string; format: string; size: string; preview: "pdf" | "unsupported";
  reviewer?: string; reviewedAt?: string; feedback?: string; publishedBy?: string; publishedAt?: string;
  audience: string; history: { actor: string; action: string; date: string; comment?: string }[];
}
type Academic = Awaited<ReturnType<typeof classesGroupsRepository.list>>;
type SubjectData = Awaited<ReturnType<typeof subjectsRepository.list>>;
type TeacherData = Awaited<ReturnType<typeof teachersRepository.list>>;
const types: ResourceType[] = ["Cours", "Leçon", "Exercice", "Devoir", "Document complémentaire"];
const tabLabels: { id: Tab; label: string }[] = [
  { id: "queue", label: "File de validation" },
  { id: "library", label: "Bibliothèque" },
  { id: "returned", label: "Refusées / À corriger" },
];
const fmt = (v: string) => v ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(v)) : "—";
const fmtTime = (v: string) => v ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v)) : "—";
const reviewLabel = (s: ReviewStatus) => ({ pending: "En attente", reviewing: "En cours de validation", approved: "Validée", rejected: "Refusée", correction: "Correction demandée", information: "Informations demandées" }[s]);
const publicationLabel = (s: PublicationStatus) => s === "published" ? "Publié" : s === "unpublished-again" ? "Dépublié" : "En attente de publication";
function makeDemo(academic: Academic, subjectData: SubjectData, teacherData: TeacherData): Resource[] {
  const classes = academic.classes.filter(c => c.status === "Actif");
  const subjects = subjectData.subjects.filter(s => s.status === "Actif");
  const teachers = teacherData.teachers.filter(t => t.employmentStatus === "Actif");
  if (!classes.length || !subjects.length || !teachers.length) return [];
  const rows: Array<{ type: ResourceType; title: string; description: string; review: ReviewStatus; publication: PublicationStatus; file: string; format: string; size: string; preview: "pdf" | "unsupported"; feedback?: string; published?: boolean }> = [
    { type: "Cours", title: "Les fonctions polynômes du second degré", description: "Cours structuré présentant les formes canonique et factorisée, les variations et les applications.", review: "pending", publication: "unpublished", file: "Fonctions_polynomes_2nd_degre.pdf", format: "PDF", size: "2,4 Mo", preview: "pdf" },
    { type: "Leçon", title: "La respiration cellulaire", description: "Support de leçon avec objectifs pédagogiques et schémas explicatifs.", review: "reviewing", publication: "unpublished", file: "Respiration_cellulaire.pdf", format: "PDF", size: "1,8 Mo", preview: "pdf" },
    { type: "Exercice", title: "Série d'exercices — Électricité", description: "Application des lois électriques avec exercices progressifs.", review: "pending", publication: "unpublished", file: "Serie_electricite.docx", format: "DOCX", size: "840 Ko", preview: "unsupported" },
    { type: "Document complémentaire", title: "Fiche méthode : analyse de texte", description: "Fiche récapitulative destinée à accompagner le cours de français.", review: "pending", publication: "unpublished", file: "Fiche_methode_analyse.pdf", format: "PDF", size: "620 Ko", preview: "pdf" },
    { type: "Cours", title: "Introduction à la géométrie dans l'espace", description: "Présentation des notions fondamentales et des représentations dans l'espace.", review: "approved", publication: "unpublished", file: "Geometrie_espace.pdf", format: "PDF", size: "3,1 Mo", preview: "pdf" },
    { type: "Devoir", title: "Devoir maison — Fonctions", description: "Travail individuel à réaliser à la maison.", review: "approved", publication: "published", file: "DM_fonctions.pdf", format: "PDF", size: "960 Ko", preview: "pdf", published: true },
    { type: "Leçon", title: "Les mouvements littéraires", description: "Synthèse des principaux mouvements littéraires au programme.", review: "approved", publication: "published", file: "Mouvements_litteraires.pdf", format: "PDF", size: "1,2 Mo", preview: "pdf", published: true },
    { type: "Exercice", title: "Application — Réactions chimiques", description: "Exercices d'application sur les transformations chimiques.", review: "rejected", publication: "unpublished", file: "Reactions_chimiques.pdf", format: "PDF", size: "1,1 Mo", preview: "pdf", feedback: "Plusieurs consignes sont ambiguës. Merci de préciser les données de l'exercice 3 et de joindre le barème." },
    { type: "Cours", title: "Les suites numériques", description: "Cours introductif sur les suites arithmétiques et géométriques.", review: "correction", publication: "unpublished", file: "Suites_numeriques.pptx", format: "PPTX", size: "4,7 Mo", preview: "unsupported", feedback: "La progression pédagogique est pertinente, mais les objectifs d'apprentissage et les références des exercices doivent être ajoutés." },
    { type: "Document complémentaire", title: "Bibliographie — Histoire contemporaine", description: "Sélection de ressources documentaires complémentaires.", review: "information", publication: "unpublished", file: "Bibliographie_histoire.pdf", format: "PDF", size: "510 Ko", preview: "pdf", feedback: "Merci de préciser l'édition et la date de consultation des sources citées." },
  ];
  return rows.map((row, i) => {
    const cls = classes[i % classes.length];
    const subject = subjects.find(s => s.assignments.some(a => a.active && a.academicYearId === cls.academicYearId && a.programId === cls.programId && a.levelId === cls.levelId)) ?? subjects[i % subjects.length];
    const teacher = teachers.find(t => t.assignmentsResolved.some(a => a.active && a.academicYearId === cls.academicYearId && a.classId === cls.id && a.subjectId === subject.id)) ?? teachers[i % teachers.length];
    const stamp = new Date(Date.now() - (i + 1) * 86400000).toISOString();
    const reviewer = row.review === "pending" || row.review === "reviewing" ? undefined : "Nadia El Fassi";
    const reviewedAt = reviewer ? new Date(Date.now() - Math.max(1, i) * 43200000).toISOString() : undefined;
    return {
      id: "DEMO-RES-" + String(i + 1).padStart(3, "0"), ...row, teacherId: teacher.id, teacher: teacher.fullName,
      subjectId: subject.id, subject: subject.name, yearId: cls.academicYearId, year: cls.academicYearName,
      programId: cls.programId, program: cls.programName, levelId: cls.levelId, level: cls.levelName,
      classId: cls.id, className: cls.name, group: cls.groups[0]?.name ?? "Classe entière",
      submittedAt: stamp, updatedAt: reviewedAt ?? stamp, fileName: row.file, format: row.format, size: row.size,
      reviewer, reviewedAt, publishedBy: row.published ? "Karim Benali" : undefined,
      publishedAt: row.published ? new Date(Date.now() - 3600000 * 20).toISOString() : undefined,
      audience: cls.name, history: [
        { actor: teacher.fullName, action: "Ressource déposée", date: stamp },
        ...(reviewer ? [{ actor: reviewer, action: reviewLabel(row.review), date: reviewedAt!, comment: row.feedback }] : []),
        ...(row.published ? [{ actor: "Karim Benali", action: "Ressource publiée", date: new Date(Date.now() - 3600000 * 20).toISOString() }] : []),
      ],
    };
  });
}
function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) { return <span className={"ce-badge ce-badge--" + tone}>{children}</span>; }
export function CoursesExercisesPage({ user, onNavigate }: Props) {
  const canRead = user.permissions.includes("pedagogy.content.view");
  const [loading, setLoading] = useState(true), [loadError, setLoadError] = useState("");
  const [academic, setAcademic] = useState<Academic | null>(null), [subjects, setSubjects] = useState<SubjectData | null>(null), [teachers, setTeachers] = useState<TeacherData | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [tab, setTab] = useState<Tab>(() => new URLSearchParams(window.location.search).get("tab") === "exercises" ? "queue" : "queue");
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(window.location.search).get("item"));
  const [search, setSearch] = useState(""), [typeFilter, setTypeFilter] = useState(() => new URLSearchParams(window.location.search).get("tab") === "exercises" ? "Exercice" : "all"), [yearFilter, setYearFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all"), [levelFilter, setLevelFilter] = useState("all"), [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all"), [teacherFilter, setTeacherFilter] = useState("all"), [statusFilter, setStatusFilter] = useState("all");
  const [dialog, setDialog] = useState<"approve" | "reject" | "correction" | "information" | "publish" | "unpublish" | null>(null);
  const [message, setMessage] = useState(""), [actionError, setActionError] = useState(""), [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!canRead) { setLoading(false); return; }
    let active = true;
    Promise.all([academicYearRepository.list(), classesGroupsRepository.list(), subjectsRepository.list(), teachersRepository.list()])
      .then(([years, classRows, subjectRows, teacherRows]) => {
        if (!active) return;
        setAcademic(classRows); setSubjects(subjectRows); setTeachers(teacherRows);
        setResources(makeDemo(classRows, subjectRows, teacherRows));
        setYearFilter(years.find(y => y.status === "Active")?.id ?? "all");
      }).catch(e => { if (active) setLoadError(e instanceof Error ? e.message : "Impossible de charger les données pédagogiques."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canRead]);
  const selected = resources.find(r => r.id === selectedId) ?? null;
  const filtered = useMemo(() => resources.filter(r => {
    const q = search.trim().toLocaleLowerCase("fr-FR");
    const inTab = tab === "queue" ? r.review === "pending" || r.review === "reviewing" : tab === "library" ? r.review === "approved" : r.review === "rejected" || r.review === "correction" || r.review === "information";
    return inTab && (!q || r.title.toLocaleLowerCase("fr-FR").includes(q)) &&
      (typeFilter === "all" || r.type === typeFilter) && (yearFilter === "all" || r.yearId === yearFilter) &&
      (programFilter === "all" || r.programId === programFilter) && (levelFilter === "all" || r.levelId === levelFilter) &&
      (classFilter === "all" || r.classId === classFilter) && (subjectFilter === "all" || r.subjectId === subjectFilter) &&
      (teacherFilter === "all" || r.teacherId === teacherFilter) && (statusFilter === "all" || (tab === "library" ? r.publication === statusFilter : r.review === statusFilter));
  }), [resources, tab, search, typeFilter, yearFilter, programFilter, levelFilter, classFilter, subjectFilter, teacherFilter, statusFilter]);
  const counts = useMemo(() => ({
    queue: resources.filter(r => r.review === "pending" || r.review === "reviewing").length,
    library: resources.filter(r => r.review === "approved").length,
    returned: resources.filter(r => r.review === "rejected" || r.review === "correction" || r.review === "information").length,
  }), [resources]);
  const clearFilters = () => { setSearch(""); setTypeFilter("all"); setYearFilter("all"); setProgramFilter("all"); setLevelFilter("all"); setClassFilter("all"); setSubjectFilter("all"); setTeacherFilter("all"); setStatusFilter("all"); };
  function changeTab(next: Tab) { setTab(next); setSelectedId(null); setStatusFilter("all"); }
  function openResource(r: Resource) { setSelectedId(r.id); setDialog(null); setMessage(""); setActionError(""); }
  function startAction(action: NonNullable<typeof dialog>) { setDialog(action); setMessage(""); setActionError(""); }
  function confirmAction() {
    if (!selected || busy) return;
    if (["reject", "correction", "information"].includes(dialog ?? "") && !message.trim()) { setActionError("Ce champ est obligatoire. Veuillez préciser votre retour à l'enseignant."); return; }
    setBusy(true); setActionError("");
    window.setTimeout(() => {
      setResources(prev => prev.map(r => {
        if (r.id !== selected.id) return r;
        const now = new Date().toISOString();
        if (dialog === "publish" || dialog === "unpublish") {
          const publication: PublicationStatus = dialog === "publish" ? "published" : "unpublished-again";
          return { ...r, publication, publishedBy: dialog === "publish" ? user.displayName : undefined, publishedAt: dialog === "publish" ? now : undefined, updatedAt: now, history: [...r.history, { actor: user.displayName, action: dialog === "publish" ? "Ressource publiée" : "Ressource dépubliée", date: now }] };
        }
        const review: ReviewStatus = dialog === "approve" ? "approved" : dialog === "reject" ? "rejected" : dialog === "correction" ? "correction" : "information";
        return { ...r, review, reviewer: user.displayName, reviewedAt: now, feedback: message.trim() || undefined, updatedAt: now, history: [...r.history, { actor: user.displayName, action: reviewLabel(review), date: now, comment: message.trim() || undefined }] };
      }));
      setNotice(dialog === "approve" ? "Ressource approuvée dans cette démonstration. Elle reste non publiée." : dialog === "publish" ? "Ressource publiée dans cette démonstration." : dialog === "unpublish" ? "Ressource dépubliée dans cette démonstration." : "Retour enregistré dans cette démonstration.");
      setDialog(null); setMessage(""); setBusy(false);
    }, 250);
  }
  const activePrograms = academic?.structure.programs.filter(p => p.status === "Actif" && (academic.levels.some(l => l.programId === p.id && (yearFilter === "all" || academic.classes.some(c => c.academicYearId === yearFilter && c.levelId === l.id))))) ?? [];
  const activeLevels = academic?.levels.filter(l => l.status === "Actif" && (programFilter === "all" || l.programId === programFilter)) ?? [];
  const activeClasses = academic?.classes.filter(c => c.status === "Actif" && (yearFilter === "all" || c.academicYearId === yearFilter) && (programFilter === "all" || c.programId === programFilter) && (levelFilter === "all" || c.levelId === levelFilter)) ?? [];
  const activeSubjects = subjects?.subjects.filter(s => s.status === "Actif" && s.assignments.some(a => a.active && (yearFilter === "all" || a.academicYearId === yearFilter) && (programFilter === "all" || a.programId === programFilter) && (levelFilter === "all" || a.levelId === levelFilter))) ?? [];
  const activeTeachers = teachers?.teachers.filter(t => t.employmentStatus === "Actif") ?? [];
  const actionTone = (s: ReviewStatus) => s === "approved" ? "green" : s === "rejected" ? "red" : s === "reviewing" ? "blue" : s === "correction" || s === "information" ? "amber" : "neutral";
  const publicationTone = (s: PublicationStatus) => s === "published" ? "green" : s === "unpublished-again" ? "neutral" : "amber";
  if (!canRead) return <main className="ce-page" style={{ "--school-primary": schoolBranding.primaryColor } as CSSProperties}><div className="ce-denied"><ShieldAlert size={25}/><h2>Accès non autorisé</h2><p>Votre compte ne dispose pas de l'autorisation nécessaire pour consulter les ressources pédagogiques.</p><button onClick={() => onNavigate("/overview")}>Retour au tableau de bord</button></div></main>;
  return <main className="ce-page" style={{ "--school-primary": schoolBranding.primaryColor } as CSSProperties}>
    <header className="ce-header"><div><div className="ce-breadcrumb"><span>Opérations pédagogiques</span><i>/</i><strong>Cours et exercices</strong></div><h1>Cours et exercices</h1><p>Consultez, organisez et gérez les ressources pédagogiques déposées par les enseignants.</p></div><button className="ce-primary" onClick={() => changeTab("library")}><FolderOpen size={15}/>Parcourir les ressources</button></header>
    <div className="ce-demo-notice"><Info size={15}/><div><strong>Mode démonstration — données fictives</strong><span>Les ressources, fichiers, avis et actions présentés ici sont des exemples locaux à cette page. Aucune action n'est transmise à un serveur et aucun fichier réel n'est disponible au téléchargement.</span></div></div>
    {notice && <div className="ce-notice" role="status"><CheckCircle2 size={15}/>{notice}<button onClick={() => setNotice("")} aria-label="Fermer"><X size={13}/></button></div>}
    {loadError && <div className="ce-error"><AlertCircle size={15}/><span>{loadError}</span><button onClick={() => window.location.reload()}>Réessayer</button></div>}
    <section className="ce-stats">
      <article><span className="ce-stat-icon"><Library size={17}/></span><div><small>TOTAL DES RESSOURCES</small><strong>248</strong><em>Volume illustratif</em></div></article>
      <article><span className="ce-stat-icon amber"><Clock3 size={17}/></span><div><small>EN ATTENTE DE VALIDATION</small><strong>18</strong><em>Soumissions à examiner</em></div></article>
      <article><span className="ce-stat-icon green"><CheckCircle2 size={17}/></span><div><small>RESSOURCES VALIDÉES</small><strong>176</strong><em>Validation pédagogique</em></div></article>
      <article><span className="ce-stat-icon blue"><BookOpen size={17}/></span><div><small>RESSOURCES PUBLIÉES</small><strong>142</strong><em>Disponibles aux publics ciblés</em></div></article>
    </section>
    <nav className="ce-tabs" aria-label="Sections des ressources">{tabLabels.map(t=><button key={t.id} className={tab===t.id?"active":""} onClick={()=>changeTab(t.id)}>{t.label}<small>{counts[t.id]}</small></button>)}</nav>
    <section className="ce-filter-panel">
      <div className="ce-filter-head"><div><strong>Recherche et filtres</strong><span>{filtered.length} ressource(s) dans cette vue</span></div><button onClick={clearFilters}><FilterX size={13}/>Effacer les filtres</button></div>
      <div className="ce-filters">
        <label className="ce-search"><span>Rechercher une ressource</span><div><Search size={14}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par titre…"/></div></label>
        <label><span>Type de ressource</span><select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="all">Tous les types</option>{types.map(t=><option key={t}>{t}</option>)}</select></label>
        <label><span>Année scolaire</span><select value={yearFilter} onChange={e=>{setYearFilter(e.target.value);setProgramFilter("all");setLevelFilter("all");setClassFilter("all");setSubjectFilter("all");}}><option value="all">Toutes les années</option>{academic?.academicYears.map(y=><option key={y.id} value={y.id}>{y.name}</option>)}</select></label>
        <label><span>Filière / Programme</span><select value={programFilter} onChange={e=>{setProgramFilter(e.target.value);setLevelFilter("all");setClassFilter("all");setSubjectFilter("all");}}><option value="all">Toutes les filières</option>{activePrograms.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label><span>Niveau</span><select value={levelFilter} onChange={e=>{setLevelFilter(e.target.value);setClassFilter("all");setSubjectFilter("all");}}><option value="all">Tous les niveaux</option>{activeLevels.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
        <label><span>Classe / Groupe</span><select value={classFilter} onChange={e=>setClassFilter(e.target.value)}><option value="all">Toutes les classes</option>{activeClasses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label><span>Matière</span><select value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}><option value="all">Toutes les matières</option>{activeSubjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label><span>Enseignant</span><select value={teacherFilter} onChange={e=>setTeacherFilter(e.target.value)}><option value="all">Tous les enseignants</option>{activeTeachers.map(t=><option key={t.id} value={t.id}>{t.fullName}</option>)}</select></label>
        <label><span>Statut {tab==="library"?"de publication":"de validation"}</span><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">Tous les statuts</option>{(tab==="library"?["unpublished","published","unpublished-again"]:["pending","reviewing","rejected","correction","information"]).map(s=><option key={s} value={s}>{tab==="library"?publicationLabel(s as PublicationStatus):reviewLabel(s as ReviewStatus)}</option>)}</select></label>
      </div>
    </section>
    <section className="ce-table-panel">
      <div className="ce-table-heading"><div><span>{tab==="queue"?"EXAMEN PÉDAGOGIQUE":tab==="library"?"RESSOURCES APPROUVÉES":"RETOURS AUX ENSEIGNANTS"}</span><h2>{tab==="queue"?"File de validation":tab==="library"?"Bibliothèque pédagogique":"Refusées / À corriger"}</h2><p>{tab==="queue"?"Consultez les dépôts et ouvrez leur espace d'examen.":tab==="library"?"Les ressources validées restent distinctes de leur état de publication.":"Les motifs et demandes de correction restent visibles pour assurer le suivi."}</p></div><span className="ce-result-count">{filtered.length} résultat(s)</span></div>
      {loading ? <div className="ce-empty"><span className="ce-spinner"/><strong>Chargement des ressources pédagogiques…</strong></div> : loadError ? <div className="ce-empty"><AlertCircle size={24}/><strong>Les données pédagogiques n'ont pas pu être chargées.</strong><span>Vérifiez les données académiques puis réessayez.</span></div> : filtered.length === 0 ? <div className="ce-empty"><FolderOpen size={25}/><strong>{resources.length===0?"Aucune ressource de démonstration disponible.":"Aucune ressource ne correspond à vos critères."}</strong><span>{resources.length===0?"Les données académiques nécessaires aux exemples sont absentes.":"Modifiez votre recherche ou réinitialisez les filtres."}</span><button onClick={clearFilters}>Effacer les filtres</button></div> :
      <div className="ce-table-scroll"><table><thead><tr>{tab==="queue"?<><th>TITRE DE LA RESSOURCE</th><th>TYPE</th><th>ENSEIGNANT</th><th>MATIÈRE</th><th>CLASSE / NIVEAU</th><th>DATE DE DÉPÔT</th><th>STATUT</th><th>ACTIONS</th></>:tab==="library"?<><th>TITRE DE LA RESSOURCE</th><th>TYPE</th><th>MATIÈRE</th><th>FILIÈRE / NIVEAU</th><th>CLASSE / GROUPE</th><th>ENSEIGNANT</th><th>PUBLICATION</th><th>MODIFIÉ LE</th><th>ACTIONS</th></>:<><th>TITRE DE LA RESSOURCE</th><th>ENSEIGNANT</th><th>MATIÈRE</th><th>MOTIF DU RETOUR</th><th>DATE DE VALIDATION</th><th>STATUT</th><th>ACTIONS</th></>}</tr></thead><tbody>{filtered.map(r=><tr key={r.id}>
        <td><button className="ce-resource-title" onClick={()=>openResource(r)}><span className="ce-file-icon"><FileText size={16}/></span><span><strong>{r.title}</strong><small>{r.fileName}</small></span></button></td>
        {tab==="queue"?<><td>{r.type}</td><td>{r.teacher}</td><td>{r.subject}</td><td><strong>{r.className}</strong><small>{r.level}</small></td><td>{fmtTime(r.submittedAt)}</td><td><Badge tone={actionTone(r.review)}>{reviewLabel(r.review)}</Badge></td><td><button className="ce-row-action" onClick={()=>openResource(r)}><Eye size={13}/>Examiner</button></td></>:tab==="library"?<><td>{r.type}</td><td>{r.subject}</td><td>{r.program}<small>{r.level}</small></td><td><strong>{r.className}</strong><small>{r.group}</small></td><td>{r.teacher}</td><td><Badge tone={publicationTone(r.publication)}>{publicationLabel(r.publication)}</Badge></td><td>{fmt(r.updatedAt)}</td><td><button className="ce-row-action" onClick={()=>openResource(r)}><Eye size={13}/>Consulter</button></td></>:<><td>{r.teacher}</td><td>{r.subject}</td><td className="ce-feedback-cell">{r.feedback}</td><td>{fmtTime(r.reviewedAt ?? "")}</td><td><Badge tone={actionTone(r.review)}>{reviewLabel(r.review)}</Badge></td><td><button className="ce-row-action" onClick={()=>openResource(r)}><Eye size={13}/>Consulter</button></td></>}
      </tr>)}</tbody></table></div>}
      <footer className="ce-table-foot"><span>Les données affichées sont fictives et servent à présenter les parcours de travail.</span><span>{filtered.length} ressource(s) affichée(s)</span></footer>
    </section>
    {selected && <div className="ce-drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedId(null);}}><aside className="ce-drawer">
      <header className="ce-drawer-head"><div><span>ESPACE DE RESSOURCE · {selected.id}</span><h2>{selected.title}</h2><p>{selected.type} · {selected.subject} · {selected.className}</p></div><button aria-label="Fermer" onClick={()=>setSelectedId(null)}><X size={18}/></button></header>
      <div className="ce-drawer-body">
        <section className="ce-detail-section"><h3>Informations sur la ressource</h3><div className="ce-info-grid">{[["Enseignant",selected.teacher],["Année scolaire",selected.year],["Filière",selected.program],["Niveau",selected.level],["Classe / Groupe",selected.className+" · "+selected.group],["Date de dépôt",fmtTime(selected.submittedAt)],["Matière",selected.subject],["Type",selected.type]].map(x=><div key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong></div>)}</div><p className="ce-description">{selected.description}</p></section>
        <section className="ce-detail-section"><h3>Aperçu du fichier</h3><div className="ce-file-meta"><span className="ce-file-icon large"><FileText size={20}/></span><div><strong>{selected.fileName}</strong><small>{selected.format} · {selected.size}</small></div><Badge tone="neutral">Fichier fictif</Badge></div>
          {selected.preview==="pdf"?<div className="ce-pdf-preview"><div className="ce-pdf-toolbar"><span><File size={13}/> Aperçu PDF de démonstration</span><small>Page 1 / 3</small></div><div className="ce-pdf-sheet"><span>SUPPORT PÉDAGOGIQUE · {selected.subject.toLocaleUpperCase("fr-FR")}</span><h4>{selected.title}</h4><p>{selected.description}</p><div/><div/><div/><small>Document de démonstration — aucun fichier source n'est associé.</small></div></div>:<div className="ce-preview-fallback"><File size={22}/><strong>Aperçu non disponible</strong><p>L'aperçu de ce fichier n'est pas disponible. Téléchargez le document pour le consulter.</p><small>Dans cette démonstration, aucun fichier réel n'est associé à cette ressource.</small></div>}
          <button className="ce-download" disabled title="Aucun fichier réel n'est associé à cet exemple"><Download size={14}/>Télécharger <small>Indisponible en mode démonstration</small></button>
        </section>
        <section className="ce-detail-section"><h3>Validation et publication</h3><div className="ce-status-pair"><div><small>Statut de validation</small><Badge tone={actionTone(selected.review)}>{reviewLabel(selected.review)}</Badge></div><div><small>Statut de publication</small><Badge tone={publicationTone(selected.publication)}>{publicationLabel(selected.publication)}</Badge></div></div>
          {selected.feedback&&<div className="ce-feedback-box"><strong><MessageSquareText size={14}/>Retour du validateur</strong><p>{selected.feedback}</p><small>{selected.reviewer??"Équipe pédagogique"} · {fmtTime(selected.reviewedAt??"")}</small></div>}
          <div className="ce-history"><strong>Historique des actions</strong>{selected.history.map((h,i)=><div className="ce-history-item" key={i}><i/><div><b>{h.action}</b><small>{h.actor} · {fmtTime(h.date)}</small>{h.comment&&<p>{h.comment}</p>}</div></div>)}</div>
        </section>
        {selected.review==="approved"&&<section className="ce-detail-section"><h3>Gestion de la publication</h3><div className="ce-publication-info"><div><small>Public concerné</small><strong>{selected.audience}</strong></div><div><small>Date de publication</small><strong>{fmtTime(selected.publishedAt??"")}</strong></div><div><small>Publié par</small><strong>{selected.publishedBy??"Non publié"}</strong></div></div></section>}
      </div>
      <footer className="ce-drawer-foot"><span>Actions locales de démonstration</span>{(selected.review==="pending"||selected.review==="reviewing")&&<><button className="ce-action-secondary" onClick={()=>startAction("correction")}>Demander une correction</button><button className="ce-action-secondary" onClick={()=>startAction("reject")}>Refuser</button><button className="ce-action-primary" onClick={()=>startAction("approve")}><Check size={14}/>Approuver</button></>}{selected.review==="approved"&&selected.publication!=="published"&&<button className="ce-action-primary" onClick={()=>startAction("publish")}>Publier auprès des élèves</button>}{selected.review==="approved"&&selected.publication==="published"&&<button className="ce-action-secondary" onClick={()=>startAction("unpublish")}>Dépublier</button>}{(selected.review==="rejected"||selected.review==="correction"||selected.review==="information")&&<button className="ce-action-secondary" onClick={()=>startAction("information")}>Demander des informations complémentaires</button>}</footer>
    </aside></div>}
    {dialog&&selected&&<div className="ce-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget){setDialog(null);setActionError("");}}}><section className="ce-modal"><header><div><span>GESTION DES RESSOURCES</span><h2>{dialog==="approve"?"Approuver la ressource":dialog==="reject"?"Refuser la ressource":dialog==="correction"?"Demander une correction":dialog==="information"?"Demander des informations complémentaires":dialog==="publish"?"Publier la ressource":"Dépublier la ressource"}</h2></div><button onClick={()=>setDialog(null)} aria-label="Fermer"><X size={17}/></button></header><div className="ce-modal-content"><p>{dialog==="approve"?"La ressource sera marquée comme validée. Elle ne sera pas publiée automatiquement.":dialog==="reject"?"Le motif du refus sera conservé dans l'historique de démonstration.":dialog==="correction"?"Décrivez précisément les modifications attendues par l'enseignant.":dialog==="information"?"Précisez les informations complémentaires nécessaires.":dialog==="publish"?"La ressource approuvée sera indiquée comme publiée auprès de la classe ciblée.":"La ressource ne sera plus indiquée comme publiée. Son historique de validation sera conservé."}</p>{["reject","correction","information"].includes(dialog)&&<label className="ce-message-field"><span>{dialog==="reject"?"Motif du refus *":"Message à l'enseignant *"}</span><textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} placeholder="Saisissez un message clair et exploitable…"/></label>}{dialog==="approve"&&<label className="ce-message-field"><span>Note du validateur (facultatif)</span><textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} placeholder="Ajouter une remarque…"/></label>}{dialog==="publish"&&<div className="ce-confirm-audience"><Users size={16}/><div><strong>Public concerné</strong><span>{selected.audience}</span></div></div>}{actionError&&<div className="ce-inline-error"><AlertCircle size={14}/>{actionError}</div>}</div><footer><button className="ce-action-secondary" disabled={busy} onClick={()=>setDialog(null)}>Annuler</button><button className="ce-action-primary" disabled={busy} onClick={confirmAction}>{busy?"Traitement…":"Confirmer"}</button></footer></section></div>}
  </main>;
}
