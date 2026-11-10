import { useMemo } from "react";
import {
  AlertTriangle, ArrowRight, BadgeCheck, BookOpen, Building2, CheckCircle2,
  CircleAlert, ClipboardCheck, FileWarning, GraduationCap, Info, ShieldCheck,
  UserRoundCheck, Users,
} from "lucide-react";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import type { StudentsData } from "../../services/students";
import type { TeachersData } from "../../services/teachers";
import type { EmployeesData } from "../../services/employees";
import "./DirectorDailyOverview.css";

type Source<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };

interface Props {
  user: AuthenticatedSidebarUser;
  yearId: string;
  students: Source<StudentsData>;
  teachers: Source<TeachersData>;
  employees: Source<EmployeesData>;
  onNavigate: (route: string) => void;
}

type Priority = { id: string; title: string; detail: string; count: number; tone: "danger" | "warning" | "info"; route: string; action: string };

const number = (value: number) => new Intl.NumberFormat("fr-FR").format(value);
const percent = (value: number) => `${Math.round(value)} %`;

function Stat({ label, value, detail, icon: Icon, tone, onClick }: {
  label: string; value: string; detail: string; icon: typeof Users; tone: string; onClick: () => void;
}) {
  return <button type="button" className="director-home-stat" onClick={onClick}>
    <span className={`director-home-stat-icon is-${tone}`}><Icon size={18}/></span>
    <span className="director-home-stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></span>
    <ArrowRight size={15} className="director-home-stat-arrow"/>
  </button>;
}

function PriorityRow({ item, onNavigate }: { item: Priority; onNavigate: (route: string) => void }) {
  const Icon = item.tone === "danger" ? CircleAlert : item.tone === "warning" ? AlertTriangle : Info;
  return <div className={`director-home-priority is-${item.tone}`}>
    <span className="director-home-priority-icon"><Icon size={16}/></span>
    <div className="director-home-priority-copy"><strong>{item.title}</strong><small>{item.detail}</small></div>
    <b>{number(item.count)}</b>
    <button type="button" onClick={() => onNavigate(item.route)}>{item.action}<ArrowRight size={13}/></button>
  </div>;
}

function ModuleRow({ title, detail, route, label, onNavigate }: {
  title: string; detail: string; route: string; label: string; onNavigate: (route: string) => void;
}) {
  return <div className="director-home-module">
    <span className="director-home-module-state">Démo</span>
    <div><strong>{title}</strong><small>{detail}</small></div>
    <button type="button" onClick={() => onNavigate(route)}>{label}<ArrowRight size={13}/></button>
  </div>;
}

export function DirectorDailyOverview({ user, yearId, students, teachers, employees, onNavigate }: Props) {
  const allowed = (permission: string) => user.permissions.includes(permission as never);
  const studentData = students.status === "ready" ? students.data : null;
  const teacherData = teachers.status === "ready" ? teachers.data : null;
  const employeeData = employees.status === "ready" ? employees.data : null;
  const year = studentData?.academicYears.find(item => item.id === yearId) ?? null;
  const yearRows = useMemo(
    () => studentData?.students.filter(item => item.enrollment?.academicYearId === yearId) ?? [],
    [studentData, yearId],
  );
  const activeStudents = yearRows.filter(item => item.enrollment?.status === "Actif");
  const pendingEnrollments = yearRows.filter(item => item.enrollment?.status === "En attente").length;
  const suspendedEnrollments = yearRows.filter(item => item.enrollment?.status === "Suspendu").length;
  const studentDocumentsToReview = activeStudents.reduce(
    (total, student) => total + student.documents.filter(doc =>
      doc.status === "À fournir" || doc.status === "En attente de vérification" || doc.status === "Refusé"
    ).length, 0,
  );
  const studentsWithoutGuardian = activeStudents.filter(item => item.guardiansResolved.length === 0).length;
  const studentAccountsToReview = activeStudents.filter(item => item.accountStatus !== "Actif").length;
  const activeTeachers = teacherData?.teachers.filter(item => item.employmentStatus === "Actif") ?? [];
  const activeEmployees = employeeData?.employees.filter(item => item.employmentStatus === "Actif") ?? [];
  const staffOnLeave = [
    ...(teacherData?.teachers ?? []).filter(item => item.employmentStatus === "En congé"),
    ...(employeeData?.employees ?? []).filter(item => item.employmentStatus === "En congé"),
  ].length;
  const staffDocumentsToReview = [
    ...(teacherData?.teachers ?? []).flatMap(item => item.documents),
    ...(employeeData?.employees ?? []).flatMap(item => item.documents),
  ].filter(doc => doc.status !== "Vérifié").length;
  const staffAccountsToReview = [
    ...(teacherData?.teachers ?? []),
    ...(employeeData?.employees ?? []),
  ].filter(item => item.accountStatus !== "Actif").length;
  const activeAssignments = activeTeachers.reduce(
    (total, teacher) => total + teacher.assignmentsResolved.filter(item => item.active && item.academicYearId === yearId).length, 0,
  );
  const teachersWithoutAssignment = activeTeachers.filter(
    teacher => !teacher.assignmentsResolved.some(item => item.active && item.academicYearId === yearId),
  ).length;
  const weeklyTeachingHours = activeTeachers.flatMap(teacher =>
    teacher.assignmentsResolved.filter(item => item.active && item.academicYearId === yearId),
  ).reduce((total, assignment) => total + assignment.weeklyHours, 0);
  const activeClasses = studentData?.classes.filter(item => item.academicYearId === yearId && item.status === "Actif") ?? [];
  const classOccupancy = activeClasses.map(cls => {
    const enrolled = activeStudents.filter(student => student.enrollment?.classId === cls.id).length;
    return { ...cls, actualEnrolled: enrolled, ratio: cls.capacity > 0 ? enrolled / cls.capacity : 0 };
  }).sort((a, b) => b.ratio - a.ratio);
  const totalCapacity = classOccupancy.reduce((total, cls) => total + cls.capacity, 0);
  const usedSeats = classOccupancy.reduce((total, cls) => total + cls.actualEnrolled, 0);
  const seatsAvailable = Math.max(0, totalCapacity - usedSeats);
  const classesNearCapacity = classOccupancy.filter(cls => cls.capacity > 0 && cls.ratio >= 0.9);
  const capacityRate = totalCapacity > 0 ? usedSeats / totalCapacity * 100 : 0;

  const priorities = useMemo(() => {
    const items: Priority[] = [];
    if (pendingEnrollments && allowed("people.students.view")) items.push({ id: "pending-enrollments", title: "Inscriptions en attente", detail: "Des dossiers attendent une décision administrative.", count: pendingEnrollments, tone: "warning", route: "/students", action: "Examiner" });
    if (studentDocumentsToReview && (allowed("documents.view") || allowed("people.students.view"))) items.push({ id: "student-documents", title: "Pièces élèves à vérifier", detail: "Documents manquants, en attente de contrôle ou refusés.", count: studentDocumentsToReview, tone: "warning", route: allowed("documents.view") ? "/documents" : "/students", action: "Vérifier" });
    if (suspendedEnrollments && allowed("people.students.view")) items.push({ id: "suspended", title: "Inscriptions suspendues", detail: "Confirmer le motif et la prochaine action à mener.", count: suspendedEnrollments, tone: "danger", route: "/students", action: "Consulter" });
    if (studentsWithoutGuardian && allowed("people.students.view")) items.push({ id: "guardians", title: "Élèves sans parent lié", detail: "La relation famille n'est pas renseignée dans le dossier.", count: studentsWithoutGuardian, tone: "info", route: "/students", action: "Compléter" });
    if (teachersWithoutAssignment && allowed("people.teachers.view")) items.push({ id: "teacher-assignment", title: "Enseignants sans affectation", detail: "Aucune affectation active trouvée pour l'année sélectionnée.", count: teachersWithoutAssignment, tone: "warning", route: "/teachers", action: "Affecter" });
    if (staffDocumentsToReview && (allowed("people.teachers.view") || allowed("people.employees.view"))) items.push({ id: "staff-documents", title: "Documents du personnel à vérifier", detail: "Diplômes, contrats et justificatifs non validés.", count: staffDocumentsToReview, tone: "warning", route: allowed("people.teachers.view") ? "/teachers" : "/employees", action: "Examiner" });
    if (classesNearCapacity.length && allowed("academic.structure.view")) items.push({ id: "capacity", title: "Classes proches de la capacité", detail: "Classes dont l'effectif atteint au moins 90 % de la capacité déclarée.", count: classesNearCapacity.length, tone: "warning", route: "/classes-groups", action: "Voir les classes" });
    if (staffOnLeave && (allowed("people.teachers.view") || allowed("people.employees.view"))) items.push({ id: "staff-leave", title: "Personnel déclaré en congé", detail: "À prendre en compte dans l'organisation des cours et services.", count: staffOnLeave, tone: "info", route: allowed("people.teachers.view") ? "/teachers" : "/employees", action: "Consulter" });
    if (staffAccountsToReview && allowed("access.manage")) items.push({ id: "staff-accounts", title: "Comptes du personnel à vérifier", detail: "Comptes non activés ou gelés dans les dossiers locaux.", count: staffAccountsToReview, tone: "info", route: "/access-control", action: "Contrôler" });
    if (studentAccountsToReview && allowed("people.students.view")) items.push({ id: "student-accounts", title: "Comptes élèves non actifs", detail: "Comptes gelés ou non activés parmi les inscriptions actives.", count: studentAccountsToReview, tone: "info", route: "/students", action: "Examiner" });
    return items.sort((a, b) => ({ danger: 0, warning: 1, info: 2 }[a.tone] - ({ danger: 0, warning: 1, info: 2 }[b.tone]) || b.count - a.count);
  }, [pendingEnrollments, studentDocumentsToReview, suspendedEnrollments, studentsWithoutGuardian, teachersWithoutAssignment, staffDocumentsToReview, classesNearCapacity.length, staffOnLeave, staffAccountsToReview, studentAccountsToReview, user.permissions]);

  const dataLoading = students.status === "loading" || teachers.status === "loading" || employees.status === "loading";
  const dataErrors = [students, teachers, employees].filter((item): item is { status: "error"; message: string } => item.status === "error");
  const sourceReady = students.status === "ready";
  const totalStaff = activeTeachers.length + activeEmployees.length;

  return <div className="director-home">
    <section className="director-home-trust" aria-label="Périmètre des données">
      <Info size={16}/>
      <p><strong>Lecture des données :</strong> les indicateurs de personnes, inscriptions, classes et affectations sont calculés depuis les dépôts locaux du navigateur. Le jeu initial contient des données de démonstration ; vérifiez les dossiers avant toute décision. Les modules sans registre persistant sont signalés séparément ci-dessous.</p>
    </section>

    {dataErrors.length > 0 && <div className="director-home-error" role="alert"><AlertTriangle size={16}/><span>{dataErrors.map(item => item.message).join(" ")}</span></div>}

    <section className="director-home-kpis" aria-label="Indicateurs de pilotage">
      {allowed("people.students.view") && <Stat label="Élèves actifs" value={sourceReady ? number(activeStudents.length) : "—"} detail={year?.name ?? "Année non définie"} icon={GraduationCap} tone="blue" onClick={() => onNavigate("/students")}/>}
      {allowed("people.students.view") && <Stat label="Inscriptions à traiter" value={sourceReady ? number(pendingEnrollments + suspendedEnrollments) : "—"} detail={`${number(pendingEnrollments)} en attente · ${number(suspendedEnrollments)} suspendues`} icon={ClipboardCheck} tone="amber" onClick={() => onNavigate("/students")}/>}
      {(allowed("documents.view") || allowed("people.students.view")) && <Stat label="Documents élèves à revoir" value={sourceReady ? number(studentDocumentsToReview) : "—"} detail="Pièces manquantes ou à vérifier" icon={FileWarning} tone="violet" onClick={() => onNavigate(allowed("documents.view") ? "/documents" : "/students")}/>}
      {(allowed("people.teachers.view") || allowed("people.employees.view")) && <Stat label="Personnel actif" value={teacherData && employeeData ? number(totalStaff) : "—"} detail={`${number(activeTeachers.length)} enseignants · ${number(activeEmployees.length)} employés`} icon={Users} tone="green" onClick={() => onNavigate(allowed("people.teachers.view") ? "/teachers" : "/employees")}/>}
    </section>

    <section className="director-home-grid">
      <article className="director-home-panel director-home-priorities-panel">
        <header className="director-home-panel-head"><div><span>À DÉCIDER OU DÉBLOQUER</span><h2>Priorités de la direction</h2><p>Éléments calculés à partir des dossiers actuellement disponibles.</p></div><span className="director-home-count">{priorities.length} sujet(s)</span></header>
        {dataLoading ? <div className="director-home-empty">Chargement des données locales…</div> : !sourceReady ? <div className="director-home-empty">Les priorités élèves ne peuvent pas être calculées tant que les dossiers ne sont pas disponibles.</div> : priorities.length ? <div className="director-home-priority-list">{priorities.slice(0, 7).map(item => <PriorityRow key={item.id} item={item} onNavigate={onNavigate}/>)}</div> : <div className="director-home-clear"><CheckCircle2 size={19}/><div><strong>Aucun point de vigilance détecté dans les données disponibles.</strong><small>Ce constat ne couvre pas les modules de présence, notes et finances, qui ne disposent pas de registres réels dans cette version.</small></div></div>}
        <footer className="director-home-panel-foot"><span>{priorities.length > 7 ? `7 priorités affichées sur ${priorities.length}` : `${priorities.length} priorité(s) calculée(s)`}</span><span>Actualisez après les changements de dossiers.</span></footer>
      </article>

      <article className="director-home-panel">
        <header className="director-home-panel-head"><div><span>CAPACITÉ D'ACCUEIL</span><h2>Effectifs par classe</h2><p>Comparaison des inscriptions actives avec la capacité définie pour chaque classe.</p></div><button type="button" className="director-home-text-link" onClick={() => onNavigate("/classes-groups")}>Gérer les classes <ArrowRight size={13}/></button></header>
        {students.status !== "ready" ? <div className="director-home-empty">{students.status === "loading" ? "Chargement des classes…" : "Les classes ne sont pas disponibles."}</div> : <>
          <div className="director-home-capacity-summary"><div><strong>{number(usedSeats)} <small>/ {number(totalCapacity)}</small></strong><span>places occupées sur capacité déclarée</span></div><b>{percent(capacityRate)}</b></div>
          <div className="director-home-capacity-track"><i style={{ width: `${Math.min(100, capacityRate)}%` }}/></div>
          <div className="director-home-capacity-meta"><span>{number(seatsAvailable)} places disponibles</span><span>{number(activeClasses.length)} classes actives</span></div>
          <div className="director-home-class-list">{classOccupancy.slice(0, 4).map(cls => <div key={cls.id}><span><strong>{cls.name}</strong><small>{number(cls.actualEnrolled)} / {number(cls.capacity)} élèves</small></span><div className="director-home-class-track"><i className={cls.ratio >= .9 ? "is-high" : ""} style={{ width: `${Math.min(100, cls.ratio * 100)}%` }}/></div><b>{percent(cls.ratio * 100)}</b></div>)}</div>
          <p className="director-home-footnote">Effectifs calculés depuis les inscriptions actives ; les capacités proviennent des fiches de classes. Vérifiez les capacités si elles n'ont pas été mises à jour.</p>
        </>}
      </article>
    </section>

    <section className="director-home-grid director-home-grid--lower">
      <article className="director-home-panel">
        <header className="director-home-panel-head"><div><span>RESSOURCES HUMAINES</span><h2>Disponibilité de l'équipe</h2><p>Effectif, affectations pédagogiques et dossiers administratifs.</p></div></header>
        {teacherData && employeeData ? <>
          <div className="director-home-team-stats">
            <div><strong>{number(totalStaff)}</strong><span>personnel actif</span></div>
            <div><strong>{number(staffOnLeave)}</strong><span>en congé</span></div>
            <div><strong>{number(teachersWithoutAssignment)}</strong><span>enseignants sans affectation</span></div>
          </div>
          <div className="director-home-team-detail">
            <span><BookOpen size={15}/> {number(activeAssignments)} affectations actives · {number(weeklyTeachingHours)} h / semaine</span>
            <span><FileWarning size={15}/> {number(staffDocumentsToReview)} document(s) à contrôler</span>
            <span><ShieldCheck size={15}/> {number(staffAccountsToReview)} compte(s) non actif(s)</span>
          </div>
          <div className="director-home-links">
            {allowed("people.teachers.view") && <button type="button" onClick={() => onNavigate("/teachers")}>Enseignants <ArrowRight size={13}/></button>}
            {allowed("people.employees.view") && <button type="button" onClick={() => onNavigate("/employees")}>Employés <ArrowRight size={13}/></button>}
            {allowed("staff.attendance.view") && <button type="button" onClick={() => onNavigate("/staff-attendance")}>Présence du personnel <ArrowRight size={13}/></button>}
          </div>
        </> : <div className="director-home-empty">{teachers.status === "error" || employees.status === "error" ? "Les dossiers du personnel sont indisponibles ou non autorisés." : "Chargement des dossiers du personnel…"}</div>}
      </article>

      <article className="director-home-panel">
        <header className="director-home-panel-head"><div><span>STRUCTURE DE L'ÉTABLISSEMENT</span><h2>Points de contrôle</h2><p>Indicateurs administratifs à vérifier régulièrement.</p></div></header>
        {studentData ? <>
          <div className="director-home-control-list">
            <div><span><Building2 size={15}/> Année scolaire</span><strong>{year?.name ?? "Aucune année sélectionnée"}</strong><small>{year?.status ?? "Vérifier la configuration de l'année"}</small></div>
            <div><span><GraduationCap size={15}/> Dossiers élèves</span><strong>{number(yearRows.length)} dossiers</strong><small>{number(activeStudents.length)} actifs · {number(pendingEnrollments)} en attente · {number(suspendedEnrollments)} suspendus</small></div>
            <div><span><UserRoundCheck size={15}/> Familles renseignées</span><strong>{number(activeStudents.length - studentsWithoutGuardian)} / {number(activeStudents.length)}</strong><small>{number(studentsWithoutGuardian)} élève(s) sans parent lié</small></div>
            <div><span><BadgeCheck size={15}/> Affectations professeurs</span><strong>{number(activeAssignments)} affectations</strong><small>{number(teachersWithoutAssignment)} enseignant(s) actif(s) sans affectation sur cette année</small></div>
          </div>
        </> : <div className="director-home-empty">Les données élèves et structurelles ne sont pas disponibles.</div>}
        <div className="director-home-links">
          {allowed("academic.structure.view") && <button type="button" onClick={() => onNavigate("/academic-years")}>Années scolaires <ArrowRight size={13}/></button>}
          {allowed("academic.structure.view") && <button type="button" onClick={() => onNavigate("/classes-groups")}>Classes et groupes <ArrowRight size={13}/></button>}
          {allowed("documents.view") && <button type="button" onClick={() => onNavigate("/documents")}>Documents <ArrowRight size={13}/></button>}
        </div>
      </article>
    </section>

    <section className="director-home-panel director-home-reliability">
      <header className="director-home-panel-head"><div><span>LIMITES ACTUELLES DU PROJET</span><h2>Suivis quotidiens à fiabiliser</h2><p>Ces écrans existent, mais leurs chiffres ne doivent pas encore être utilisés comme indicateurs réels de l'établissement.</p></div><span className="director-home-demo-key">Données de démonstration</span></header>
      <div className="director-home-modules">
        {allowed("student.attendance.view") && <ModuleRow title="Présence des élèves" detail="Le relevé est généré à partir des inscriptions ; aucun registre de présence persistant n'est disponible." route="/student-attendance" label="Ouvrir" onNavigate={onNavigate}/>}
        {allowed("pedagogy.grades.view") && <ModuleRow title="Notes & validations" detail="Les soumissions et notes sont des exemples de démonstration, sans registre de notes réel." route="/grades-validation" label="Ouvrir" onNavigate={onNavigate}/>}
        {allowed("finance.reports.view") && <ModuleRow title="Paiements & soldes" detail="Les chiffres financiers affichés dans les modules sont statiques et ne proviennent pas d'un service financier." route="/financial-reports" label="Ouvrir" onNavigate={onNavigate}/>}
        {allowed("pedagogy.schedule.view") && <ModuleRow title="Emplois du temps" detail="Les séances sont des exemples temporaires en mémoire, non enregistrés durablement." route="/timetables" label="Ouvrir" onNavigate={onNavigate}/>}
        {allowed("communication.view") && <ModuleRow title="Événements & notifications" detail="Les contenus et statuts sont simulés localement ; aucun envoi réel n'est effectué." route="/events" label="Ouvrir" onNavigate={onNavigate}/>}
        {allowed("activity.history.view") && <ModuleRow title="Historique des opérations" detail="Le journal est fictif et ne constitue pas une piste d'audit fiable." route="/activity-history" label="Ouvrir" onNavigate={onNavigate}/>}
      </div>
      <div className="director-home-reliability-note"><ShieldCheck size={15}/><span>Ne pas prendre de décision sur la base d'un taux de présence, d'une moyenne, d'un solde ou d'un événement simulé. Les autres modules restent accessibles pour examiner leurs fonctionnalités.</span></div>
    </section>

    <footer className="director-home-footer">
      <span>Vue de pilotage · {year?.name ?? "Année scolaire non définie"}</span>
      <span>Source : dépôts locaux du navigateur · actualisation manuelle</span>
    </footer>
  </div>;
}
