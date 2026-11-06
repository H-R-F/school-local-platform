import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BookOpen, CalendarDays, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, FilterX, GraduationCap, Search, ShieldAlert, Users, XCircle } from "lucide-react";
import { academicYearRepository } from "../../services/academic-years";
import { classesGroupsRepository } from "../../services/classes-groups";
import { subjectsRepository } from "../../services/subjects";
import { teachersRepository } from "../../services/teachers";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./GradesValidationPage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type WorkflowTab = "all" | "pending" | "approved" | "rejected" | "published";
type AcademicData = Awaited<ReturnType<typeof classesGroupsRepository.list>>;
type YearData = Awaited<ReturnType<typeof academicYearRepository.list>>;
type SubjectData = Awaited<ReturnType<typeof subjectsRepository.list>>;
type TeacherData = Awaited<ReturnType<typeof teachersRepository.list>>;

const tabs: { id: WorkflowTab; label: string }[] = [
  { id: "all", label: "Toutes les soumissions" },
  { id: "pending", label: "En attente de validation" },
  { id: "approved", label: "Approuvées" },
  { id: "rejected", label: "Rejetées" },
  { id: "published", label: "Publiées" },
];

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
  const [periodId, setPeriodId] = useState("");
  const [programId, setProgramId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!canRead) { setLoading(false); return; }
    let active = true;
    Promise.all([
      academicYearRepository.list(),
      classesGroupsRepository.list(),
      subjectsRepository.list(),
      teachersRepository.list(),
    ]).then(([yearRows, classRows, subjectRows, teacherRows]) => {
      if (!active) return;
      setYears(yearRows);
      setAcademic(classRows);
      setSubjects(subjectRows);
      setTeachers(teacherRows);
      setYearId(yearRows.find(row => row.status === "Active")?.id ?? "");
    }).catch(error => {
      if (active) setLoadError(error instanceof Error ? error.message : "Impossible de charger les référentiels académiques.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canRead]);

  const availableClasses = useMemo(() => (academic?.classes ?? []).filter(row =>
    (!yearId || row.academicYearId === yearId) &&
    (!programId || row.programId === programId) &&
    (!levelId || row.levelId === levelId)
  ), [academic, yearId, programId, levelId]);

  const programs = useMemo(() => {
    const ids = new Set((academic?.classes ?? []).filter(row => !yearId || row.academicYearId === yearId).map(row => row.programId));
    return (academic?.structure.programs ?? []).filter(row => ids.has(row.id));
  }, [academic, yearId]);

  const levels = useMemo(() => {
    const ids = new Set((academic?.classes ?? []).filter(row =>
      (!yearId || row.academicYearId === yearId) && (!programId || row.programId === programId)
    ).map(row => row.levelId));
    return (academic?.levels ?? []).filter(row => ids.has(row.id));
  }, [academic, yearId, programId]);

  const availableSubjects = useMemo(() => {
    if (!subjects) return [];
    const selectedClass = academic?.classes.find(row => row.id === classId);
    if (!selectedClass) return subjects.subjects.filter(subject => subject.status === "Actif" && subject.assignments.some(a => a.academicYearId === yearId));
    return subjects.subjects.filter(subject => subject.status === "Actif" && subject.assignments.some(a =>
      a.academicYearId === selectedClass.academicYearId &&
      a.programId === selectedClass.programId &&
      a.levelId === selectedClass.levelId
    ));
  }, [subjects, academic, classId, yearId]);

  const availableTeachers = useMemo(() => {
    if (!teachers) return [];
    return teachers.teachers.filter(teacher => teacher.assignmentsResolved.some(a =>
      (!yearId || a.academicYearId === yearId) &&
      (!classId || a.classId === classId) &&
      (!subjectId || a.subjectId === subjectId)
    ));
  }, [teachers, yearId, classId, subjectId]);

  const hasFilters = Boolean(yearId || periodId || programId || levelId || classId || subjectId || teacherId || search);
  const clearFilters = () => {
    setYearId("");
    setPeriodId("");
    setProgramId("");
    setLevelId("");
    setClassId("");
    setSubjectId("");
    setTeacherId("");
    setSearch("");
  };

  if (!canRead) return <main className="gv-page"><section className="gv-access"><ShieldAlert size={24}/><h1>Accès non autorisé</h1><p>Votre rôle ne dispose pas de l’autorisation nécessaire pour consulter les notes et les validations.</p></section></main>;

  return <main className="gv-page">
    <header className="gv-header">
      <div className="gv-breadcrumb"><span>Opérations pédagogiques</span><ChevronRight size={13}/><strong>Notes et validation</strong></div>
      <div className="gv-heading-row"><div><h1>Notes et validation</h1><p>Examinez les soumissions des enseignants, validez les résultats et gérez leur publication.</p></div><span className="gv-demo-tag">Environnement de démonstration</span></div>
    </header>

    <section className="gv-source-notice" aria-label="État de la source des soumissions">
      <span className="gv-source-icon"><AlertCircle size={17}/></span>
      <div><strong>Source des soumissions non disponible</strong><p>Le projet ne contient pas encore de modèle de notes, d’évaluations ou de soumissions provenant de l’application mobile des enseignants. Cette page consulte les référentiels académiques existants, mais aucune soumission réelle ne peut encore être affichée ou traitée.</p></div>
    </section>

    <nav className="gv-tabs" aria-label="Filtrer par statut de workflow">
      {tabs.map(item => <button key={item.id} type="button" className={tab === item.id ? "is-active" : ""} aria-current={tab === item.id ? "page" : undefined} onClick={() => setTab(item.id)}>
        <span>{item.label}</span><small>0</small>
      </button>)}
    </nav>

    <section className="gv-filter-panel">
      <div className="gv-filter-heading"><div><strong>Filtres</strong><span>Affinez la recherche dans les soumissions</span></div><button type="button" onClick={clearFilters} disabled={!hasFilters}><FilterX size={14}/>Réinitialiser</button></div>
      <div className="gv-filters">
        <label><span>Année scolaire</span><select value={yearId} onChange={e => {setYearId(e.target.value);setProgramId("");setLevelId("");setClassId("");setSubjectId("");setTeacherId("");}}><option value="">Toutes les années</option>{years.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Période / Semestre</span><select value={periodId} onChange={e => setPeriodId(e.target.value)} disabled><option value="">Non configuré</option></select></label>
        <label><span>Programme</span><select value={programId} onChange={e => {setProgramId(e.target.value);setLevelId("");setClassId("");setSubjectId("");setTeacherId("");}}><option value="">Tous les programmes</option>{programs.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Niveau</span><select value={levelId} onChange={e => {setLevelId(e.target.value);setClassId("");setSubjectId("");setTeacherId("");}}><option value="">Tous les niveaux</option>{levels.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Classe</span><select value={classId} onChange={e => {setClassId(e.target.value);setSubjectId("");setTeacherId("");}}><option value="">Toutes les classes</option>{availableClasses.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Matière</span><select value={subjectId} onChange={e => {setSubjectId(e.target.value);setTeacherId("");}}><option value="">Toutes les matières</option>{availableSubjects.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Enseignant</span><select value={teacherId} onChange={e => setTeacherId(e.target.value)}><option value="">Tous les enseignants</option>{availableTeachers.map(row => <option key={row.id} value={row.id}>{row.fullName}</option>)}</select></label>
        <label className="gv-search"><span>Recherche</span><div><Search size={15}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une soumission…" /></div></label>
      </div>
      <div className="gv-filter-footer"><span><strong>0</strong> soumission correspondante</span>{hasFilters && <button type="button" onClick={clearFilters}><X size={13}/>Effacer les filtres</button>}</div>
    </section>

    <section className="gv-table-panel">
      <div className="gv-table-heading"><div><h2>Soumissions des enseignants</h2><p>Suivi des notes transmises depuis l’application mobile</p></div><span className="gv-table-count">0 résultat</span></div>
      {loading ? <div className="gv-loading"><span className="gv-spinner"/><span>Chargement des référentiels académiques…</span></div> :
        loadError ? <div className="gv-error" role="alert"><AlertCircle size={18}/><div><strong>Chargement impossible</strong><p>{loadError}</p></div></div> :
        <div className="gv-empty"><span className="gv-empty-icon"><ClipboardCheck size={22}/></span><h3>Aucune soumission disponible</h3><p>Les années, classes, matières et affectations sont chargées depuis les données de l’établissement. Les soumissions de notes ne sont pas encore intégrées au projet.</p><small>Les onglets et filtres sont prêts. Les données de notes et les actions de validation nécessitent un service dédié et une connexion à l’application mobile.</small></div>}
      <div className="gv-table-scroll"><table><thead><tr><th>Classe</th><th>Matière</th><th>Enseignant</th><th>Période scolaire</th><th>Élèves</th><th>Date de soumission</th><th>Statut de validation</th><th>Statut de publication</th><th>Actions</th></tr></thead><tbody/></table></div>
    </section>
    <footer className="gv-footer"><span><CalendarDays size={13}/>Référentiels académiques synchronisés depuis le stockage local de démonstration</span><span><Users size={13}/>Accès réservé au personnel pédagogique autorisé</span></footer>
  </main>;
}
