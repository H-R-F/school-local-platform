import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Check, ChevronRight, ClipboardCheck, FilterX, Search, ShieldAlert, Users, X, Eye, Clock3, Send, BookOpen, GraduationCap, CheckCircle2, XCircle, FileText, Info } from "lucide-react";
import { academicYearRepository } from "../../services/academic-years";
import { classesGroupsRepository } from "../../services/classes-groups";
import { subjectsRepository } from "../../services/subjects";
import { teachersRepository } from "../../services/teachers";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./GradesValidationPage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type WorkflowTab = "all" | "pending" | "approved" | "rejected" | "published";
type ValidationStatus = "pending" | "approved" | "rejected";
type PublicationStatus = "unpublished" | "published";
type AcademicData = Awaited<ReturnType<typeof classesGroupsRepository.list>>;
type YearData = Awaited<ReturnType<typeof academicYearRepository.list>>;
type SubjectData = Awaited<ReturnType<typeof subjectsRepository.list>>;
type TeacherData = Awaited<ReturnType<typeof teachersRepository.list>>;

interface DemoGrade { id: string; studentCode: string; studentName: string; grade: number | null; assessment: string; remark: string; status: "Saisie" | "Manquante" }
interface DemoSubmission {
  id: string; classId: string; className: string; groupName: string; subjectId: string; subjectName: string;
  teacherId: string; teacherName: string; yearId: string; yearName: string; programId: string; levelId: string;
  period: string; submittedAt: string; validation: ValidationStatus; publication: PublicationStatus;
  studentCount: number; grades: DemoGrade[]; reviewedBy?: string; reviewedAt?: string; rejectionReason?: string;
  publishedBy?: string; publishedAt?: string; completion: number;
}

const tabs: { id: WorkflowTab; label: string }[] = [
  { id: "all", label: "Toutes les soumissions" },
  { id: "pending", label: "En attente de validation" },
  { id: "approved", label: "Approuvées" },
  { id: "rejected", label: "Rejetées" },
  { id: "published", label: "Publiées" },
];
const demoStudents: DemoGrade[] = [
  { id: "1", studentCode: "ELV-24081", studentName: "Adam El Mansouri", grade: 16.5, assessment: "Devoir surveillé 1", remark: "Très bonne maîtrise des notions.", status: "Saisie" },
  { id: "2", studentCode: "ELV-24082", studentName: "Salma Berrada", grade: 14, assessment: "Devoir surveillé 1", remark: "Travail régulier.", status: "Saisie" },
  { id: "3", studentCode: "ELV-24083", studentName: "Yassine Tazi", grade: 0, assessment: "Devoir surveillé 1", remark: "Copie rendue blanche.", status: "Saisie" },
  { id: "4", studentCode: "ELV-24084", studentName: "Meryem Alaoui", grade: null, assessment: "Devoir surveillé 1", remark: "Note non saisie.", status: "Manquante" },
  { id: "5", studentCode: "ELV-24085", studentName: "Omar Chraibi", grade: 12.75, assessment: "Devoir surveillé 1", remark: "Peut progresser en rédaction.", status: "Saisie" },
  { id: "6", studentCode: "ELV-24086", studentName: "Inès Amrani", grade: 18, assessment: "Devoir surveillé 1", remark: "Excellent résultat.", status: "Saisie" },
];

function buildDemoSubmissions(academic: AcademicData, years: YearData, subjects: SubjectData, teachers: TeacherData): DemoSubmission[] {
  const activeYear = years.find(row => row.status === "Active") ?? years[0];
  const classes = academic.classes.filter(row => row.status === "Actif" && (!activeYear || row.academicYearId === activeYear.id));
  const subjectRows = subjects.subjects.filter(row => row.status === "Actif");
  const teacherRows = teachers.teachers;
  if (!classes.length || !subjectRows.length || !teacherRows.length || !activeYear) return [];
  const templates = [
    { validation: "pending" as const, publication: "unpublished" as const, period: "Semestre 1", submittedAt: "2026-10-28T09:42:00", completion: 83, grades: demoStudents, },
    { validation: "approved" as const, publication: "unpublished" as const, period: "Semestre 1", submittedAt: "2026-10-26T14:18:00", completion: 100, grades: demoStudents.map((g, i) => ({ ...g, grade: [15, 13.5, 11, 17, 14.25, 16][i], status: "Saisie" as const })), reviewedBy: "Nadia El Fassi", reviewedAt: "2026-10-27T10:15:00" },
    { validation: "rejected" as const, publication: "unpublished" as const, period: "Semestre 1", submittedAt: "2026-10-23T11:05:00", completion: 100, grades: demoStudents.map(g => ({ ...g, grade: g.grade ?? 10 })), reviewedBy: "Nadia El Fassi", reviewedAt: "2026-10-24T08:30:00", rejectionReason: "Merci de vérifier les notes de deux élèves et d'ajouter les justificatifs des absences." },
    { validation: "approved" as const, publication: "published" as const, period: "Semestre 1", submittedAt: "2026-10-18T16:32:00", completion: 100, grades: demoStudents.map((g, i) => ({ ...g, grade: [17, 15, 12, 14.5, 13, 18][i], status: "Saisie" as const })), reviewedBy: "Nadia El Fassi", reviewedAt: "2026-10-19T09:10:00", publishedBy: "Karim Benali", publishedAt: "2026-10-20T12:00:00" },
  ];
  return templates.map((template, index) => {
    const cls = classes[index % classes.length];
    const subject = subjectRows.find(row => row.assignments.some(a => a.academicYearId === cls.academicYearId && a.programId === cls.programId && a.levelId === cls.levelId)) ?? subjectRows[index % subjectRows.length];
    const teacher = teacherRows.find(row => row.assignmentsResolved.some(a => a.academicYearId === cls.academicYearId && a.classId === cls.id && a.subjectId === subject.id)) ?? teacherRows[index % teacherRows.length];
    const grades = template.grades.map((grade, i) => ({ ...grade, status: index === 0 && i === 3 ? "Manquante" as const : grade.status, grade: index === 0 && i === 3 ? null : grade.grade }));
    return {
      id: `DEMO-SUB-2026-${String(index + 1).padStart(3, "0")}`, classId: cls.id, className: cls.name, groupName: cls.groups[0]?.name ?? "",
      subjectId: subject.id, subjectName: subject.name, teacherId: teacher.id, teacherName: teacher.fullName,
      yearId: cls.academicYearId, yearName: activeYear.name, programId: cls.programId, levelId: cls.levelId,
      period: template.period, submittedAt: template.submittedAt, validation: template.validation, publication: template.publication,
      studentCount: cls.enrolledCount || grades.length, grades, completion: template.completion,
      reviewedBy: "reviewedBy" in template ? template.reviewedBy : undefined,
      reviewedAt: "reviewedAt" in template ? template.reviewedAt : undefined,
      rejectionReason: "rejectionReason" in template ? template.rejectionReason : undefined,
      publishedBy: "publishedBy" in template ? template.publishedBy : undefined,
      publishedAt: "publishedAt" in template ? template.publishedAt : undefined,
    };
  });
}
const dateTime = (value?: string) => value ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—";
const statusLabel = (status: ValidationStatus) => status === "pending" ? "En attente de validation" : status === "approved" ? "Approuvée" : "Rejetée";

export function GradesValidationPage({ user }: Props) {
  const canRead = user.permissions.includes("pedagogy.grades.view");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [academic, setAcademic] = useState<AcademicData | null>(null);
  const [years, setYears] = useState<YearData>([]);
  const [subjects, setSubjects] = useState<SubjectData | null>(null);
  const [teachers, setTeachers] = useState<TeacherData | null>(null);
  const [tab, setTab] = useState<WorkflowTab>("all");
  const [yearId, setYearId] = useState("");
  const [period, setPeriod] = useState("");
  const [programId, setProgramId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<DemoSubmission[]>([]);
  const [dialog, setDialog] = useState<"approve" | "reject" | "publish" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!canRead) { setLoading(false); return; }
    let active = true;
    Promise.all([academicYearRepository.list(), classesGroupsRepository.list(), subjectsRepository.list(), teachersRepository.list()])
      .then(([yearRows, classRows, subjectRows, teacherRows]) => {
        if (!active) return;
        setYears(yearRows); setAcademic(classRows); setSubjects(subjectRows); setTeachers(teacherRows);
        const demo = buildDemoSubmissions(classRows, yearRows, subjectRows, teacherRows);
        setSubmissions(demo);
        setYearId(yearRows.find(row => row.status === "Active")?.id ?? "");
      }).catch(error => {
        if (active) setLoadError(error instanceof Error ? error.message : "Impossible de charger les référentiels académiques.");
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canRead]);

  const availableClasses = useMemo(() => (academic?.classes ?? []).filter(row => (!yearId || row.academicYearId === yearId) && (!programId || row.programId === programId) && (!levelId || row.levelId === levelId)), [academic, yearId, programId, levelId]);
  const programs = useMemo(() => {
    const ids = new Set((academic?.classes ?? []).filter(row => !yearId || row.academicYearId === yearId).map(row => row.programId));
    return (academic?.structure.programs ?? []).filter(row => ids.has(row.id));
  }, [academic, yearId]);
  const levels = useMemo(() => {
    const ids = new Set((academic?.classes ?? []).filter(row => (!yearId || row.academicYearId === yearId) && (!programId || row.programId === programId)).map(row => row.levelId));
    return (academic?.levels ?? []).filter(row => ids.has(row.id));
  }, [academic, yearId, programId]);
  const availableSubjects = useMemo(() => {
    if (!subjects) return [];
    const selectedClass = academic?.classes.find(row => row.id === classId);
    return subjects.subjects.filter(subject => subject.status === "Actif" && subject.assignments.some(a => a.academicYearId === (selectedClass?.academicYearId ?? yearId) && (!selectedClass || (a.programId === selectedClass.programId && a.levelId === selectedClass.levelId))));
  }, [subjects, academic, classId, yearId]);
  const availableTeachers = useMemo(() => teachers?.teachers.filter(teacher => teacher.assignmentsResolved.some(a => (!yearId || a.academicYearId === yearId) && (!classId || a.classId === classId) && (!subjectId || a.subjectId === subjectId))) ?? [], [teachers, yearId, classId, subjectId]);
  const filtered = useMemo(() => submissions.filter(row => {
    const statusMatch = tab === "all" || (tab === "pending" && row.validation === "pending") || (tab === "approved" && row.validation === "approved") || (tab === "rejected" && row.validation === "rejected") || (tab === "published" && row.publication === "published");
    const query = search.trim().toLocaleLowerCase("fr-FR");
    return statusMatch && (!yearId || row.yearId === yearId) && (!period || row.period === period) && (!programId || row.programId === programId) && (!levelId || row.levelId === levelId) && (!classId || row.classId === classId) && (!subjectId || row.subjectId === subjectId) && (!teacherId || row.teacherId === teacherId) && (!query || [row.id,row.className,row.subjectName,row.teacherName,row.yearName,row.period].some(v => v.toLocaleLowerCase("fr-FR").includes(query)));
  }), [submissions, tab, yearId, period, programId, levelId, classId, subjectId, teacherId, search]);
  const counts = useMemo(() => ({
    all: submissions.filter(row => (!yearId || row.yearId === yearId) && (!period || row.period === period) && (!programId || row.programId === programId) && (!levelId || row.levelId === levelId) && (!classId || row.classId === classId) && (!subjectId || row.subjectId === subjectId) && (!teacherId || row.teacherId === teacherId)).length,
    pending: submissions.filter(row => row.validation === "pending" && (!yearId || row.yearId === yearId) && (!period || row.period === period) && (!programId || row.programId === programId) && (!levelId || row.levelId === levelId) && (!classId || row.classId === classId) && (!subjectId || row.subjectId === subjectId) && (!teacherId || row.teacherId === teacherId)).length,
    approved: submissions.filter(row => row.validation === "approved" && row.publication === "unpublished" && (!yearId || row.yearId === yearId) && (!period || row.period === period) && (!programId || row.programId === programId) && (!levelId || row.levelId === levelId) && (!classId || row.classId === classId) && (!subjectId || row.subjectId === subjectId) && (!teacherId || row.teacherId === teacherId)).length,
    rejected: submissions.filter(row => row.validation === "rejected" && (!yearId || row.yearId === yearId) && (!period || row.period === period) && (!programId || row.programId === programId) && (!levelId || row.levelId === levelId) && (!classId || row.classId === classId) && (!subjectId || row.subjectId === subjectId) && (!teacherId || row.teacherId === teacherId)).length,
    published: submissions.filter(row => row.publication === "published" && (!yearId || row.yearId === yearId) && (!period || row.period === period) && (!programId || row.programId === programId) && (!levelId || row.levelId === levelId) && (!classId || row.classId === classId) && (!subjectId || row.subjectId === subjectId) && (!teacherId || row.teacherId === teacherId)).length,
  }), [submissions, yearId, period, programId, levelId, classId, subjectId, teacherId]);
  const selected = submissions.find(row => row.id === selectedId) ?? null;
  const hasFilters = Boolean(yearId || period || programId || levelId || classId || subjectId || teacherId || search);
  const clearFilters = () => { setYearId(""); setPeriod(""); setProgramId(""); setLevelId(""); setClassId(""); setSubjectId(""); setTeacherId(""); setSearch(""); };
  const updateDemo = (id: string, changes: Partial<DemoSubmission>) => setSubmissions(rows => rows.map(row => row.id === id ? { ...row, ...changes } : row));
  const closeDialog = () => { setDialog(null); setRejectReason(""); };
  const confirmDemoAction = () => {
    if (!selected) return;
    const now = new Date().toISOString();
    if (dialog === "approve") updateDemo(selected.id, { validation: "approved", reviewedBy: user.name || "Utilisateur de démonstration", reviewedAt: now });
    if (dialog === "reject" && rejectReason.trim()) updateDemo(selected.id, { validation: "rejected", publication: "unpublished", reviewedBy: user.name || "Utilisateur de démonstration", reviewedAt: now, rejectionReason: rejectReason.trim() });
    if (dialog === "publish" && selected.validation === "approved") updateDemo(selected.id, { publication: "published", publishedBy: user.name || "Utilisateur de démonstration", publishedAt: now });
    setActionMessage("Action appliquée uniquement à cette démonstration locale. Aucune donnée réelle n’a été enregistrée.");
    closeDialog();
  };

  if (!canRead) return <main className="gv-page"><section className="gv-access"><ShieldAlert size={24}/><h1>Accès non autorisé</h1><p>Votre rôle ne dispose pas de l’autorisation nécessaire pour consulter les notes et les validations.</p></section></main>;

  return <main className="gv-page">
    <header className="gv-header">
      <div className="gv-breadcrumb"><span>Opérations pédagogiques</span><ChevronRight size={13}/><strong>Notes et validation</strong></div>
      <div className="gv-heading-row"><div><h1>Notes et validation</h1><p>Examinez les soumissions des enseignants, validez les résultats et gérez leur publication.</p></div><span className="gv-demo-tag"><Info size={12}/>Données fictives · Démonstration</span></div>
    </header>
    <section className="gv-source-notice"><span className="gv-source-icon"><AlertCircle size={17}/></span><div><strong>Mode aperçu — données entièrement fictives</strong><p>Les soumissions, élèves, notes, dates et historiques ci-dessous sont des exemples visuels. Les actions de validation et de publication modifient uniquement l’état temporaire de cette page et ne sont envoyées à aucun serveur.</p></div></section>

    {actionMessage && <div className="gv-action-message" role="status"><CheckCircle2 size={15}/><span>{actionMessage}</span><button type="button" onClick={() => setActionMessage("")} aria-label="Fermer"><X size={14}/></button></div>}
    <nav className="gv-tabs" aria-label="Filtrer par statut de workflow">
      {tabs.map(item => <button key={item.id} type="button" className={tab === item.id ? "is-active" : ""} aria-current={tab === item.id ? "page" : undefined} onClick={() => setTab(item.id)}><span>{item.label}</span><small>{counts[item.id]}</small></button>)}
    </nav>
    <section className="gv-filter-panel">
      <div className="gv-filter-heading"><div><strong>Filtres</strong><span>Affinez la recherche dans les soumissions</span></div><button type="button" onClick={clearFilters} disabled={!hasFilters}><FilterX size={14}/>Réinitialiser</button></div>
      <div className="gv-filters">
        <label><span>Année scolaire</span><select value={yearId} onChange={e => {setYearId(e.target.value);setProgramId("");setLevelId("");setClassId("");setSubjectId("");setTeacherId("");}}><option value="">Toutes les années</option>{years.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Période / Semestre <em>démo</em></span><select value={period} onChange={e => setPeriod(e.target.value)}><option value="">Toutes les périodes</option>{Array.from(new Set(submissions.map(row => row.period))).map(value => <option key={value} value={value}>{value}</option>)}</select></label>
        <label><span>Programme</span><select value={programId} onChange={e => {setProgramId(e.target.value);setLevelId("");setClassId("");setSubjectId("");setTeacherId("");}}><option value="">Tous les programmes</option>{programs.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Niveau</span><select value={levelId} onChange={e => {setLevelId(e.target.value);setClassId("");setSubjectId("");setTeacherId("");}}><option value="">Tous les niveaux</option>{levels.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Classe</span><select value={classId} onChange={e => {setClassId(e.target.value);setSubjectId("");setTeacherId("");}}><option value="">Toutes les classes</option>{availableClasses.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Matière</span><select value={subjectId} onChange={e => {setSubjectId(e.target.value);setTeacherId("");}}><option value="">Toutes les matières</option>{availableSubjects.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Enseignant</span><select value={teacherId} onChange={e => setTeacherId(e.target.value)}><option value="">Tous les enseignants</option>{availableTeachers.map(row => <option key={row.id} value={row.id}>{row.fullName}</option>)}</select></label>
        <label className="gv-search"><span>Recherche</span><div><Search size={15}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une soumission…"/></div></label>
      </div>
      <div className="gv-filter-footer"><span><strong>{filtered.length}</strong> soumission{filtered.length > 1 ? "s" : ""} correspondante{filtered.length > 1 ? "s" : ""}</span>{hasFilters && <button type="button" onClick={clearFilters}><X size={13}/>Effacer les filtres</button>}</div>
    </section>

    <section className="gv-table-panel">
      <div className="gv-table-heading"><div><h2>Soumissions des enseignants</h2><p>Exemples de transmissions depuis l’application mobile</p></div><span className="gv-table-count">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span></div>
      {loading ? <div className="gv-loading"><span className="gv-spinner"/><span>Chargement des référentiels académiques…</span></div> :
        loadError ? <div className="gv-error" role="alert"><AlertCircle size={18}/><div><strong>Chargement impossible</strong><p>{loadError}</p></div></div> :
        filtered.length === 0 ? <div className="gv-empty"><span className="gv-empty-icon"><ClipboardCheck size={22}/></span><h3>Aucune soumission trouvée</h3><p>Aucune donnée fictive ne correspond à ces critères. Modifiez les filtres ou réinitialisez la recherche.</p><button type="button" onClick={clearFilters}>Réinitialiser les filtres</button></div> :
        <div className="gv-table-scroll"><table><thead><tr><th>Classe</th><th>Matière</th><th>Enseignant</th><th>Période scolaire</th><th>Élèves</th><th>Date de soumission</th><th>Statut de validation</th><th>Statut de publication</th><th>Actions</th></tr></thead><tbody>
          {filtered.map(row => <tr key={row.id} onClick={() => setSelectedId(row.id)} tabIndex={0} onKeyDown={e => {if(e.key === "Enter" || e.key === " "){e.preventDefault();setSelectedId(row.id);}}}>
            <td><strong>{row.className}</strong>{row.groupName && <small>{row.groupName}</small>}</td><td><strong>{row.subjectName}</strong><small>{row.id}</small></td><td>{row.teacherName}</td><td><strong>{row.yearName}</strong><small>{row.period}</small></td><td><span className="gv-student-count"><Users size={12}/>{row.studentCount}</span></td><td>{dateTime(row.submittedAt)}</td>
            <td><span className={`gv-status gv-validation ${row.validation}`}>{row.validation === "pending" ? <Clock3 size={11}/> : row.validation === "approved" ? <CheckCircle2 size={11}/> : <XCircle size={11}/ >}{statusLabel(row.validation)}</span></td>
            <td><span className={`gv-status gv-publication ${row.publication}`}>{row.publication === "published" ? <CheckCircle2 size={11}/> : <Clock3 size={11}/ >}{row.publication === "published" ? "Publiée" : "Non publiée"}</span></td>
            <td><button className="gv-view-button" type="button" onClick={e => {e.stopPropagation();setSelectedId(row.id);}}><Eye size={13}/>Consulter</button></td>
          </tr>)}
        </tbody></table></div>}
      <div className="gv-table-bottom"><span>Affichage de {filtered.length} sur {submissions.length} soumissions fictives</span><span>Jeu de données de démonstration</span></div>
    </section>
    <footer className="gv-footer"><span><CalendarDays size={13}/>Périodes et historiques fictifs à des fins de conception</span><span><Users size={13}/>Aucune donnée d’élève réelle</span></footer>

    {selected && <div className="gv-drawer-backdrop" onMouseDown={e => {if(e.target === e.currentTarget)setSelectedId(null);}}>
      <aside className="gv-drawer" role="dialog" aria-modal="true" aria-label="Détail de la soumission">
        <div className="gv-drawer-header"><div><span className="gv-eyebrow">DÉTAIL DE LA SOUMISSION</span><h2>{selected.className}</h2><p>{selected.subjectName} · {selected.teacherName}</p></div><button type="button" onClick={() => setSelectedId(null)} aria-label="Fermer"><X size={18}/></button></div>
        <div className="gv-drawer-content">
          <div className="gv-detail-id"><span>{selected.id}</span><span className="gv-demo-pill">DÉMO</span></div>
          <div className="gv-detail-status"><div><small>Validation</small><span className={`gv-status gv-validation ${selected.validation}`}>{statusLabel(selected.validation)}</span></div><div><small>Publication</small><span className={`gv-status gv-publication ${selected.publication}`}>{selected.publication === "published" ? "Publiée" : "Non publiée"}</span></div></div>
          <section className="gv-detail-section"><h3><FileText size={14}/>Informations générales</h3><div className="gv-detail-grid">
            <div><small>Classe / Groupe</small><strong>{selected.className}{selected.groupName ? ` · ${selected.groupName}` : ""}</strong></div><div><small>Enseignant</small><strong>{selected.teacherName}</strong></div>
            <div><small>Année scolaire</small><strong>{selected.yearName}</strong></div><div><small>Période</small><strong>{selected.period} <em>(fictive)</em></strong></div>
            <div><small>Soumise le</small><strong>{dateTime(selected.submittedAt)}</strong></div><div><small>Effectif</small><strong>{selected.studentCount} élèves</strong></div>
          </div></section>
          <section className="gv-completion"><div><div><strong>Saisie des notes</strong><span>{selected.grades.filter(g => g.grade !== null).length} / {selected.grades.length} notes renseignées</span></div><b>{Math.round(selected.grades.filter(g => g.grade !== null).length / selected.grades.length * 100)}%</b></div><div className="gv-progress"><span style={{width:`${selected.grades.filter(g => g.grade !== null).length / selected.grades.length * 100}%`}}/></div></section>
          <section className="gv-detail-section"><h3><GraduationCap size={14}/>Notes des élèves <span>{selected.grades.length}</span></h3><div className="gv-grade-table"><table><thead><tr><th>Élève</th><th>Évaluation / Note</th><th>Remarque</th></tr></thead><tbody>{selected.grades.map(grade => <tr key={grade.id}><td><strong>{grade.studentName}</strong><small>{grade.studentCode}</small></td><td><strong className={grade.grade === null ? "gv-missing" : "gv-grade-value"}>{grade.grade === null ? "Non saisie" : `${grade.grade.toLocaleString("fr-FR")} / 20`}</strong><small>{grade.assessment}</small></td><td>{grade.remark}</td></tr>)}</tbody></table></div><p className="gv-zero-note"><Info size={12}/>Une note de 0/20 est une valeur saisie ; « Non saisie » indique une note manquante.</p></section>
          {selected.rejectionReason && <div className="gv-rejection-note"><strong>Motif du rejet</strong><p>{selected.rejectionReason}</p><small>{selected.reviewedBy} · {dateTime(selected.reviewedAt)}</small></div>}
          {(selected.reviewedBy || selected.publishedBy) && <section className="gv-detail-section"><h3><Clock3 size={14}/>Historique</h3><div className="gv-history">{selected.reviewedBy && <div><i className={selected.validation === "rejected" ? "rejected" : "approved"}/><span><strong>{selected.validation === "rejected" ? "Soumission rejetée" : "Soumission approuvée"}</strong><small>{selected.reviewedBy} · {dateTime(selected.reviewedAt)}</small></span></div>}{selected.publishedBy && <div><i className="published"/><span><strong>Notes publiées</strong><small>{selected.publishedBy} · {dateTime(selected.publishedAt)}</small></span></div>}</div></section>}
        </div>
        <div className="gv-drawer-actions"><span className="gv-action-disclaimer">Actions de démonstration uniquement</span>
          {selected.validation === "pending" && <><button type="button" className="gv-btn-danger" onClick={() => setDialog("reject")}>Rejeter</button><button type="button" className="gv-btn-primary" onClick={() => setDialog("approve")}><Check size={14}/>Approuver</button></>}
          {selected.validation === "approved" && selected.publication === "unpublished" && <button type="button" className="gv-btn-primary gv-publish-button" onClick={() => setDialog("publish")}><Send size={14}/>Publier les notes</button>}
          {selected.publication === "published" && <span className="gv-published-lock"><CheckCircle2 size={14}/>Notes déjà publiées</span>}
          {selected.validation === "rejected" && <span className="gv-published-lock">Soumission rejetée · Aucune publication possible</span>}
        </div>
      </aside>
    </div>}
    {dialog && selected && <div className="gv-modal-backdrop"><section className="gv-modal" role="dialog" aria-modal="true" aria-labelledby="gv-modal-title"><div className="gv-modal-icon">{dialog === "reject" ? <XCircle size={20}/> : dialog === "publish" ? <Send size={20}/> : <CheckCircle2 size={20}/>}</div><h2 id="gv-modal-title">{dialog === "reject" ? "Rejeter la soumission ?" : dialog === "publish" ? "Publier les notes ?" : "Approuver la soumission ?"}</h2><p>{dialog === "reject" ? "Le motif du rejet sera conservé dans l’historique de cette démonstration." : dialog === "publish" ? "La publication rendrait les notes visibles aux élèves et aux parents dans un environnement réel. Ici, seul l’aperçu local sera modifié." : "L’approbation ne publie pas automatiquement les notes."}</p>
      {dialog === "reject" && <label className="gv-reason-field"><span>Motif du rejet <b>*</b></span><textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Précisez les corrections attendues…" rows={4}/>{!rejectReason.trim() && <small>Veuillez saisir un motif pour continuer.</small>}</label>}
      <div className="gv-modal-actions"><button type="button" onClick={closeDialog}>Annuler</button><button type="button" className={dialog === "reject" ? "gv-btn-danger" : "gv-btn-primary"} disabled={dialog === "reject" && !rejectReason.trim()} onClick={confirmDemoAction}>{dialog === "reject" ? "Confirmer le rejet" : dialog === "publish" ? "Confirmer la publication" : "Confirmer l’approbation"}</button></div>
    </section></div>}
  </main>;
}
