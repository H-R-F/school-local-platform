import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  AlertCircle, CalendarDays, CalendarRange, Check, ChevronLeft, ChevronRight, Clock3,
  DoorOpen, Eye, GraduationCap, Info, LayoutGrid, List, MapPin,
  Plus, Search, ShieldCheck, Users, X, Ban,
} from "lucide-react";
import { academicYearRepository } from "../../services/academic-years";
import { classesGroupsRepository } from "../../services/classes-groups";
import { subjectsRepository } from "../../services/subjects";
import { schoolBranding } from "../../config/school";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./ExaminationsPage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type MainTab = "sessions" | "schedule" | "rooms";
type ExamStatus = "À venir" | "En cours" | "Terminée" | "Annulée";
type SessionStatus = "À venir" | "En cours" | "Terminée";
type ExamRoom = { id: string; name: string; building: string; capacity: number; status: "Opérationnelle" | "Indisponible" };
type ExamSession = { id: string; name: string; yearId: string; yearName: string; period: string; startDate: string; endDate: string; description: string; classIds: string[]; programNames: string[]; levelNames: string[] };
type ExamRecord = { id: string; sessionId: string; classId: string; groupId: string; subjectId: string; date: string; startTime: string; endTime: string; roomId: string; instructions: string; cancelled?: boolean };
type Panel = { type: "session" | "exam"; id: string } | null;
type FormState = { type: "session" | "exam"; id?: string } | null;
const ROOM_FIXTURES: ExamRoom[] = [
  { id: "R-101", name: "Salle 101", building: "Bâtiment A · Rez-de-chaussée", capacity: 36, status: "Opérationnelle" },
  { id: "R-102", name: "Salle 102", building: "Bâtiment A · Rez-de-chaussée", capacity: 30, status: "Opérationnelle" },
  { id: "R-201", name: "Salle 201", building: "Bâtiment A · 1er étage", capacity: 32, status: "Opérationnelle" },
  { id: "R-202", name: "Salle informatique", building: "Bâtiment B · 1er étage", capacity: 24, status: "Opérationnelle" },
  { id: "R-301", name: "Amphithéâtre", building: "Bâtiment C · Rez-de-chaussée", capacity: 120, status: "Opérationnelle" },
  { id: "R-302", name: "Salle polyvalente", building: "Bâtiment C · Rez-de-chaussée", capacity: 80, status: "Indisponible" },
];
const PERIODS = ["Premier semestre", "Deuxième semestre", "Fin d'année", "Rattrapage"];
const dateLabel = (value: string) => new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value + "T12:00:00"));
const monthLabel = (date: Date) => new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);
const timeMinutes = (value: string) => { const [h, m] = value.split(":").map(Number); return h * 60 + m; };
const sameDay = (a: string, b: string) => a === b;
const sessionState = (session: ExamSession, exams: ExamRecord[], now = new Date()): SessionStatus => {
  const related = exams.filter(e => e.sessionId === session.id && !e.cancelled);
  if (related.length && related.every(e => new Date(e.date + "T" + e.endTime + ":00") < now)) return "Terminée";
  if (related.some(e => new Date(e.date + "T" + e.startTime + ":00") <= now && new Date(e.date + "T" + e.endTime + ":00") >= now)) return "En cours";
  if (!related.length && new Date(session.endDate + "T23:59:59") < now) return "Terminée";
  if (new Date(session.startDate + "T00:00:00") <= now && new Date(session.endDate + "T23:59:59") >= now) return "En cours";
  return "À venir";
};
const examState = (exam: ExamRecord, now = new Date()): ExamStatus => {
  if (exam.cancelled) return "Annulée";
  const start = new Date(exam.date + "T" + exam.startTime + ":00");
  const end = new Date(exam.date + "T" + exam.endTime + ":00");
  if (now > end) return "Terminée";
  if (now >= start && now <= end) return "En cours";
  return "À venir";
};
function Status({ value }: { value: string }) {
  const tone = value === "Terminée" || value === "Opérationnelle" ? "done" : value === "En cours" ? "live" : value === "Annulée" || value === "Indisponible" ? "danger" : "upcoming";
  return <span className={`ex-status ex-status--${tone}`}><i />{value}</span>;
}
function Empty({ title, detail, action }: { title: string; detail: string; action?: () => void }) {
  return <div className="ex-empty"><CalendarDays size={23}/><strong>{title}</strong><p>{detail}</p>{action && <button type="button" onClick={action}><Plus size={14}/>Programmer un examen</button>}</div>;
}
export function ExaminationsPage({ user, onNavigate }: Props) {
  const [academic, setAcademic] = useState<any>(null);
  const [subjectsData, setSubjectsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [yearId, setYearId] = useState("");
  const [sessionId, setSessionId] = useState("all");
  const [tab, setTab] = useState<MainTab>("sessions");
  const [view, setView] = useState<"calendar" | "table">("calendar");
  const [month, setMonth] = useState(() => new Date(2026, 10, 1));
  const [panel, setPanel] = useState<Panel>(null);
  const [form, setForm] = useState<FormState>(null);
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [sessionForm, setSessionForm] = useState({ name: "", yearId: "", period: PERIODS[0], startDate: "2026-11-16", endDate: "2026-11-27", description: "", classIds: [] as string[] });
  const [examForm, setExamForm] = useState({ sessionId: "", classId: "", groupId: "", subjectId: "", date: "2026-11-16", startTime: "08:30", endTime: "10:30", roomId: ROOM_FIXTURES[0].id, instructions: "" });
  const [formError, setFormError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState<ExamRecord | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const canView = user.permissions.includes("pedagogy.exams.view");

  useEffect(() => {
    let alive = true;
    Promise.all([academicYearRepository.list(), classesGroupsRepository.list(), subjectsRepository.list()])
      .then(([years, classes, subjectRows]) => {
        if (!alive) return;
        setAcademic({ years, ...classes });
        setSubjectsData(subjectRows);
        const currentYear = years.find((y: any) => y.status === "Active") ?? years[0];
        setYearId(currentYear?.id ?? "");
        if (currentYear) {
          const activeClasses = classes.classes.filter((c: any) => c.academicYearId === currentYear.id && c.status === "Actif");
          const cls = activeClasses;
          const first = cls[0], second = cls[1] ?? cls[0], third = cls[2] ?? cls[0];
          const start = "2026-11-09";
          const next = (n: number) => `2026-11-${String(n).padStart(2, "0")}`;
          const seedSession: ExamSession = { id: "DEMO-SESSION-1", name: "Examens du premier semestre", yearId: currentYear.id, yearName: currentYear.name, period: "Premier semestre", startDate: start, endDate: "2026-11-20", description: "Session de démonstration — évaluations du premier semestre.", classIds: cls.slice(0, Math.min(6, cls.length)).map((c: any) => c.id), programNames: [...new Set(cls.slice(0, 6).map((c: any) => c.programName))], levelNames: [...new Set(cls.slice(0, 6).map((c: any) => c.levelName))] };
          const getSubject = (classId: string, index: number) => {
            const c = cls.find((x: any) => x.id === classId);
            const available = subjectRows.subjects.filter((s: any) => s.status === "Actif" && s.assignments.some((a: any) => a.academicYearId === currentYear.id && a.levelId === c?.levelId));
            return available.length ? available[index % available.length]?.id ?? "" : "";
          };
          const room = ROOM_FIXTURES.filter(r => r.status === "Opérationnelle");
          const seedExams: ExamRecord[] = [];
          if (first && subjectRows.subjects.length) seedExams.push(
            { id: "DEMO-EX-01", sessionId: seedSession.id, classId: first.id, groupId: first.groups[0]?.id ?? "", subjectId: getSubject(first.id, 0), date: next(10), startTime: "08:30", endTime: "10:30", roomId: room[0].id, instructions: "Calculatrice non programmable autorisée." },
            { id: "DEMO-EX-02", sessionId: seedSession.id, classId: second.id, groupId: second.groups[0]?.id ?? "", subjectId: getSubject(second.id, 1), date: next(10), startTime: "09:00", endTime: "11:00", roomId: room[1]?.id ?? room[0].id, instructions: "Documents interdits." },
            { id: "DEMO-EX-03", sessionId: seedSession.id, classId: third.id, groupId: third.groups[0]?.id ?? "", subjectId: getSubject(third.id, 2), date: next(12), startTime: "13:30", endTime: "15:30", roomId: room[2]?.id ?? room[0].id, instructions: "Rédaction sur copie d'examen." },
            { id: "DEMO-EX-04", sessionId: seedSession.id, classId: first.id, groupId: first.groups[0]?.id ?? "", subjectId: getSubject(first.id, 1), date: next(14), startTime: "08:30", endTime: "10:00", roomId: room[3]?.id ?? room[0].id, instructions: "Épreuve écrite." },
            { id: "DEMO-EX-06", sessionId: seedSession.id, classId: third.id, groupId: third.groups[0]?.id ?? "", subjectId: getSubject(third.id, 1), date: next(10), startTime: "09:30", endTime: "11:00", roomId: room[0].id, instructions: "Exemple de conflit de salle à résoudre." },
            { id: "DEMO-EX-07", sessionId: seedSession.id, classId: first.id, groupId: first.groups[0]?.id ?? "", subjectId: getSubject(first.id, 2), date: next(10), startTime: "09:30", endTime: "10:30", roomId: room[2]?.id ?? room[0].id, instructions: "Exemple de chevauchement de classe à résoudre." },
          );
          const pastSession: ExamSession = { id: "DEMO-SESSION-2", name: "Examens du premier contrôle", yearId: currentYear.id, yearName: currentYear.name, period: "Premier semestre", startDate: "2026-10-12", endDate: "2026-10-16", description: "Exemple d'une session clôturée.", classIds: cls.slice(0, 4).map((c: any) => c.id), programNames: [...new Set(cls.slice(0, 4).map((c: any) => c.programName))], levelNames: [...new Set(cls.slice(0, 4).map((c: any) => c.levelName))] };
          const pastExams = first && subjectRows.subjects.length ? [{ id: "DEMO-EX-05", sessionId: pastSession.id, classId: first.id, groupId: "", subjectId: getSubject(first.id, 0), date: "2026-10-14", startTime: "08:30", endTime: "10:30", roomId: room[0].id, instructions: "" }] : [];
          setSessions([seedSession, pastSession]);
          setExams([...seedExams, ...pastExams]);
        }
        setLoading(false);
      })
      .catch((error) => { if (alive) { setLoadError(error instanceof Error ? error.message : "Impossible de charger les référentiels académiques."); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const years = academic?.years ?? [];
  const classes = academic?.classes ?? [];
  const subjects = subjectsData?.subjects ?? [];
  const visibleSessions = sessions.filter(s => s.yearId === yearId && (sessionId === "all" || s.id === sessionId));
  const activeSession = sessions.find(s => s.id === sessionId) ?? visibleSessions[0] ?? sessions.find(s => s.yearId === yearId);
  const currentExams = exams.filter(e => (sessionId === "all" || e.sessionId === sessionId) && sessions.find(s => s.id === e.sessionId)?.yearId === yearId);
  const scheduled = currentExams.filter(e => !e.cancelled);
  const sessionCounts = { total: sessions.filter(s => s.yearId === yearId).length, upcoming: sessions.filter(s => s.yearId === yearId && sessionState(s, exams) === "À venir").length, ongoing: sessions.filter(s => s.yearId === yearId && sessionState(s, exams) === "En cours").length, done: sessions.filter(s => s.yearId === yearId && sessionState(s, exams) === "Terminée").length };
  const getClass = (id: string) => classes.find((c: any) => c.id === id);
  const getSubject = (id: string) => subjects.find((s: any) => s.id === id);
  const getRoom = (id: string) => ROOM_FIXTURES.find(r => r.id === id);
  const getSession = (id: string) => sessions.find(s => s.id === id);
  const className = (id: string) => getClass(id)?.name ?? "Classe non disponible";
  const subjectName = (id: string) => getSubject(id)?.name ?? "Matière non disponible";
  const filteredExams = currentExams.filter(e => {
    const c = getClass(e.classId), s = getSubject(e.subjectId), r = getRoom(e.roomId);
    const haystack = [c?.name, c?.code, s?.name, r?.name, e.id].join(" ").toLocaleLowerCase("fr-FR");
    return (!query || haystack.includes(query.toLocaleLowerCase("fr-FR"))) && (classFilter === "all" || e.classId === classFilter) && (subjectFilter === "all" || e.subjectId === subjectFilter) && (roomFilter === "all" || e.roomId === roomFilter) && (statusFilter === "all" || examState(e) === statusFilter);
  }).sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const conflicts = (candidate: Omit<ExamRecord, "id" | "cancelled">, ignoreId?: string) => {
    const session = getSession(candidate.sessionId), cls = getClass(candidate.classId), room = getRoom(candidate.roomId);
    const sameDayExams = exams.filter(e => !e.cancelled && e.id !== ignoreId && e.date === candidate.date);
    const overlap = (a: ExamRecord) => timeMinutes(candidate.startTime) < timeMinutes(a.endTime) && timeMinutes(candidate.endTime) > timeMinutes(a.startTime);
    const roomConflict = sameDayExams.find(e => e.roomId === candidate.roomId && overlap(e));
    const classConflict = sameDayExams.find(e => e.classId === candidate.classId && (!candidate.groupId || !e.groupId || e.groupId === candidate.groupId) && overlap(e));
    const outOfRange = !!session && (candidate.date < session.startDate || candidate.date > session.endDate);
    const overCapacity = !!cls && !!room && cls.enrolledCount > room.capacity;
    return { roomConflict, classConflict, outOfRange, overCapacity, expected: cls?.enrolledCount ?? null, capacity: room?.capacity ?? null };
  };
  const selectedPanel = panel?.type === "session" ? getSession(panel.id) : panel?.type === "exam" ? exams.find(e => e.id === panel.id) : undefined;
  const activeSessionExams = activeSession ? exams.filter(e => e.sessionId === activeSession.id && !e.cancelled) : [];
  const roomAvailabilityDate = activeSessionExams[0]?.date ?? activeSession?.startDate ?? "2026-11-10";
  const selectedRoomAvailability = (room: ExamRoom) => {
    const atDate = activeSessionExams.filter(e => e.date === roomAvailabilityDate && e.roomId === room.id && !e.cancelled);
    return room.status === "Indisponible" ? "Indisponible" : atDate.length ? "Occupée" : "Disponible";
  };
  const openNewSession = () => { setFormError(""); setSessionForm({ name: "", yearId, period: PERIODS[0], startDate: "2026-11-16", endDate: "2026-11-27", description: "", classIds: [] }); setForm({ type: "session" }); };
  const openEditSession = (session: ExamSession) => { setFormError(""); setSessionForm({ name: session.name, yearId: session.yearId, period: session.period, startDate: session.startDate, endDate: session.endDate, description: session.description, classIds: [...session.classIds] }); setForm({ type: "session", id: session.id }); setPanel(null); };
  const openNewExam = (session?: ExamSession) => { const s = session ?? activeSession; const cls = s ? s.classIds.map(getClass).find(Boolean) : classes.find((c: any) => c.academicYearId === yearId); setFormError(""); setExamForm({ sessionId: s?.id ?? "", classId: cls?.id ?? "", groupId: "", subjectId: subjects.find((sub: any) => sub.assignments.some((a: any) => a.levelId === cls?.levelId && a.academicYearId === yearId))?.id ?? "", date: s?.startDate ?? "2026-11-16", startTime: "08:30", endTime: "10:30", roomId: ROOM_FIXTURES[0].id, instructions: "" }); setForm({ type: "exam" }); };
  const saveSession = () => {
    const year = years.find((y: any) => y.id === sessionForm.yearId);
    if (!sessionForm.name.trim() || !year || !sessionForm.startDate || !sessionForm.endDate || !sessionForm.classIds.length) { setFormError("Renseignez le nom, l'année, les dates et au moins une classe participante."); return; }
    if (sessionForm.endDate < sessionForm.startDate) { setFormError("La date de fin doit être postérieure ou égale à la date de début."); return; }
    const selected = sessionForm.classIds.map(getClass);
    if (selected.some((c: any) => !c || c.academicYearId !== year.id)) { setFormError("Toutes les classes doivent appartenir à l'année scolaire sélectionnée."); return; }
    const row: ExamSession = { id: form?.id ?? "DEMO-SESSION-" + Date.now(), name: sessionForm.name.trim(), yearId: year.id, yearName: year.name, period: sessionForm.period, startDate: sessionForm.startDate, endDate: sessionForm.endDate, description: sessionForm.description, classIds: [...new Set(sessionForm.classIds)], programNames: [...new Set(selected.map((c: any) => c.programName))], levelNames: [...new Set(selected.map((c: any) => c.levelName))] };
    const previous = sessions.find(s => s.id === row.id);
    const hasScheduledExams = exams.some(e => e.sessionId === row.id && !e.cancelled);
    const scheduleChanged = !!previous && (previous.startDate !== row.startDate || previous.endDate !== row.endDate || JSON.stringify(previous.classIds) !== JSON.stringify(row.classIds));
    if (scheduleChanged && hasScheduledExams && !window.confirm("Cette session possède déjà des épreuves. Les dates ou les classes seront modifiées sans supprimer les examens. Certaines épreuves pourraient se retrouver hors période. Continuer ?")) return;
    setSessions(old => previous ? old.map(s => s.id === row.id ? row : s) : [row, ...old]); setYearId(year.id); setSessionId(row.id); setTab("sessions"); setForm(null); setNotice(previous ? "La session a été modifiée dans la démonstration locale." : "La session a été ajoutée à la démonstration locale."); setPanel({ type: "session", id: row.id });
  };
  const saveExam = () => {
    const session = getSession(examForm.sessionId), cls = getClass(examForm.classId), subject = getSubject(examForm.subjectId);
    if (!session || !cls || !subject || !examForm.date || !examForm.startTime || !examForm.endTime || !examForm.roomId) { setFormError("Complétez tous les champs obligatoires avant de continuer."); return; }
    if (!session.classIds.includes(cls.id)) { setFormError("Cette classe ne participe pas à la session sélectionnée."); return; }
    if (!subject.assignments.some((a: any) => a.academicYearId === session.yearId && a.levelId === cls.levelId)) { setFormError("Cette matière n'est pas affectée au niveau de la classe pour cette année scolaire."); return; }
    if (examForm.endTime <= examForm.startTime) { setFormError("L'heure de fin doit être postérieure à l'heure de début."); return; }
    const candidate = { ...examForm, groupId: examForm.groupId, instructions: examForm.instructions, sessionId: session.id };
    const found = conflicts(candidate);
    const errors = [found.outOfRange && `Hors période de session : la session s’étend du ${dateLabel(session.startDate)} au ${dateLabel(session.endDate)}.`, found.roomConflict && `Salle déjà occupée : ${subjectName(found.roomConflict.subjectId)} le ${dateLabel(found.roomConflict.date)}, de ${found.roomConflict.startTime} à ${found.roomConflict.endTime}.`, found.classConflict && `Chevauchement de classe : ${subjectName(found.classConflict.subjectId)} pour ${className(found.classConflict.classId)}, de ${found.classConflict.startTime} à ${found.classConflict.endTime}.`].filter(Boolean);
    if (errors.length) { setFormError(errors.join(" ")); return; }
    const duplicate = exams.some(e => !e.cancelled && e.sessionId === session.id && e.classId === cls.id && e.subjectId === subject.id && e.groupId === examForm.groupId && e.id !== form?.id);
    if (duplicate) { setFormError("Une épreuve identique est déjà programmée pour cette classe et cette session."); return; }
    if (found.overCapacity) { setFormError(`Capacité insuffisante : ${found.expected} élèves pour ${found.capacity} places. Choisissez une salle adaptée avant de programmer cette épreuve.`); return; }
    const row: ExamRecord = { ...candidate, id: form?.id ?? "DEMO-EX-" + Date.now(), cancelled: false };
    setExams(old => form?.id ? old.map(e => e.id === form.id ? row : e) : [...old, row]);
    setForm(null); setNotice("L'épreuve a été ajoutée à la démonstration locale."); setPanel({ type: "exam", id: row.id });
  };
  const cancelExam = () => { if (!confirmCancel) return; setExams(old => old.map(e => e.id === confirmCancel.id ? { ...e, cancelled: true } : e)); setPanel(null); setConfirmCancel(null); setNotice("L'épreuve a été annulée dans la démonstration locale. Son historique est conservé."); };
  const changeMonth = (step: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + step, 1));
  const startOffset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const calendarCells = [...Array(startOffset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const monthExams = filteredExams.filter(e => e.date.startsWith(`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,"0")}`));
  const activeRoomCounts = ROOM_FIXTURES.map(r => ({ room: r, assigned: exams.filter(e => e.roomId === r.id && !e.cancelled && getSession(e.sessionId)?.yearId === yearId && (sessionId === "all" || e.sessionId === sessionId)).length }));
  const roomFilterOptions = ROOM_FIXTURES.filter(r => r.status === "Opérationnelle");

  if (!canView) return <main className="ex-page" style={{ "--school-primary": schoolBranding.primaryColor } as CSSProperties}><div className="ex-access"><ShieldCheck size={28}/><h1>Accès non autorisé</h1><p>Votre compte ne dispose pas de l'autorisation nécessaire pour consulter l'organisation des examens.</p><button onClick={() => onNavigate("/overview")}>Retour au tableau de bord</button></div></main>;

  return <main className="ex-page" style={{ "--school-primary": schoolBranding.primaryColor } as CSSProperties}>
    <header className="ex-header"><div><div className="ex-breadcrumb">Opérations pédagogiques <i>/</i><strong>Examens</strong></div><h1>Examens</h1><p>Planifiez les sessions d'examen, organisez les horaires et gérez la logistique des épreuves.</p></div><button className="ex-button ex-button--primary" onClick={openNewSession}><Plus size={15}/>Créer une session d'examens</button></header>
    <div className="ex-demo-note"><Info size={14}/><span>Mode démonstration · Les sessions, épreuves et salles affichées sont fictives. Les actions restent locales et ne sont pas enregistrées sur un serveur.</span></div>
    {notice && <div className="ex-notice"><Check size={14}/><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Fermer"><X size={14}/></button></div>}
    {loadError && <div className="ex-error"><AlertCircle size={15}/>{loadError}<button onClick={() => window.location.reload()}>Réessayer</button></div>}
    <section className="ex-summary">
      <article><span className="ex-summary-icon"><CalendarRange size={16}/></span><div><small>Total des sessions</small><strong>{loading ? "—" : sessionCounts.total}</strong><em>Année sélectionnée</em></div></article>
      <article><span className="ex-summary-icon ex-summary-icon--blue"><Clock3 size={16}/></span><div><small>Examens à venir</small><strong>{loading ? "—" : scheduled.filter(e => examState(e) === "À venir").length}</strong><em>Épreuves programmées</em></div></article>
      <article><span className="ex-summary-icon ex-summary-icon--teal"><GraduationCap size={16}/></span><div><small>Examens en cours</small><strong>{loading ? "—" : scheduled.filter(e => examState(e) === "En cours").length}</strong><em>Créneau actuel</em></div></article>
      <article><span className="ex-summary-icon ex-summary-icon--green"><Check size={16}/></span><div><small>Examens terminés</small><strong>{loading ? "—" : scheduled.filter(e => examState(e) === "Terminée").length}</strong><em>Épreuves clôturées</em></div></article>
    </section>
    <section className="ex-context">
      <label>Année scolaire<select value={yearId} onChange={e => { setYearId(e.target.value); setSessionId("all"); }}><option value="">Sélectionner une année</option>{years.map((y: any) => <option key={y.id} value={y.id}>{y.name}</option>)}</select></label>
      <label>Session d'examens<select value={sessionId} onChange={e => setSessionId(e.target.value)}><option value="all">Toutes les sessions</option>{sessions.filter(s => s.yearId === yearId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <span className="ex-context-count">{visibleSessions.length} session{visibleSessions.length > 1 ? "s" : ""} affichée{visibleSessions.length > 1 ? "s" : ""}</span>
    </section>
    <nav className="ex-tabs" aria-label="Sections des examens">
      {([["sessions","Sessions d'examens"],["schedule","Planning des examens"],["rooms","Salles"]] as [MainTab,string][]).map(([id,label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}{id === "schedule" && <small>{scheduled.length}</small>}</button>)}
    </nav>

    {loading ? <div className="ex-loading"><span/>Chargement des référentiels académiques…</div> : tab === "sessions" ? <section className="ex-panel">
      <div className="ex-panel-heading"><div><h2>Sessions d'examens</h2><p>Consultez les périodes et les classes concernées.</p></div><button className="ex-button ex-button--primary" onClick={openNewSession}><Plus size={14}/>Nouvelle session</button></div>
      <div className="ex-table-wrap"><table><thead><tr><th>Session</th><th>Année scolaire</th><th>Période</th><th>Date de début</th><th>Date de fin</th><th>Classes</th><th>Épreuves</th><th>Statut</th><th/></tr></thead><tbody>
        {visibleSessions.map(s => { const rows = exams.filter(e => e.sessionId === s.id && !e.cancelled); const status = sessionState(s, exams); return <tr key={s.id} onClick={() => setPanel({ type: "session", id: s.id })}><td><strong>{s.name}</strong><small>{s.description ? "Session organisée" : "Aucune description"}</small></td><td>{s.yearName}</td><td>{s.period}</td><td>{dateLabel(s.startDate)}</td><td>{dateLabel(s.endDate)}</td><td><span className="ex-inline-count"><Users size={13}/>{s.classIds.length} classes</span></td><td><strong>{rows.length}</strong></td><td><Status value={status}/></td><td><button className="ex-icon-button" aria-label="Consulter la session" onClick={e => { e.stopPropagation(); setPanel({ type: "session", id: s.id }); }}><Eye size={15}/></button></td></tr>; })}
      </tbody></table>{!visibleSessions.length && <Empty title="Aucune session pour cette année" detail="Créez une session d'examens pour commencer à organiser les épreuves." action={openNewSession}/>}</div>
      <div className="ex-table-footer"><span>{visibleSessions.length} session(s)</span><span>Les sessions sont distinctes des épreuves individuelles.</span></div>
    </section> : tab === "schedule" ? <section className="ex-panel">
      <div className="ex-panel-heading"><div><h2>Planning des examens</h2><p>{activeSession ? activeSession.name : "Toutes les sessions de l'année sélectionnée"}</p></div><div className="ex-view-switch"><button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}><LayoutGrid size={14}/>Calendrier</button><button className={view === "table" ? "active" : ""} onClick={() => setView("table")}><List size={14}/>Tableau</button><button className="ex-button ex-button--primary" onClick={() => openNewExam()}><Plus size={14}/>Programmer un examen</button></div></div>
      <div className="ex-filters"><label className="ex-search"><Search size={14}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher une épreuve…"/></label><select value={classFilter} onChange={e => setClassFilter(e.target.value)}><option value="all">Toutes les classes</option>{classes.filter((c: any) => c.academicYearId === yearId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}><option value="all">Toutes les matières</option>{subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><select value={roomFilter} onChange={e => setRoomFilter(e.target.value)}><option value="all">Toutes les salles</option>{roomFilterOptions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">Tous les statuts</option>{["À venir","En cours","Terminée","Annulée"].map(s => <option key={s}>{s}</option>)}</select></div>
      {view === "calendar" ? <div className="ex-calendar">
        <div className="ex-calendar-toolbar"><div><strong>{monthLabel(month)}</strong><span>{monthExams.length} épreuve{monthExams.length > 1 ? "s" : ""} ce mois</span></div><div><button onClick={() => setMonth(new Date())}>Aujourd'hui</button><button aria-label="Mois précédent" onClick={() => changeMonth(-1)}><ChevronLeft size={15}/></button><button aria-label="Mois suivant" onClick={() => changeMonth(1)}><ChevronRight size={15}/></button></div></div>
        <div className="ex-calendar-grid">{["Lun.","Mar.","Mer.","Jeu.","Ven.","Sam.","Dim."].map(d => <div className="ex-calendar-dayname" key={d}>{d}</div>)}{calendarCells.map((day, i) => { const key = day ? `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` : `blank-${i}`; const rows = day ? monthExams.filter(e => sameDay(e.date,key)) : []; return <div className={`ex-calendar-cell ${day ? "" : "is-blank"} ${day && key === new Date().toISOString().slice(0,10) ? "is-today" : ""}`} key={key}>{day && <><span className="ex-day-number">{day}</span>{rows.slice(0,2).map(e => <button className={`ex-event ${examState(e) === "Terminée" ? "is-done" : e.cancelled ? "is-cancelled" : ""}`} key={e.id} onClick={() => setPanel({ type: "exam", id: e.id })}><b>{e.startTime}</b><span>{subjectName(e.subjectId)}</span><small>{className(e.classId)} · {getRoom(e.roomId)?.name ?? "Salle non définie"}</small></button>)}{rows.length > 2 && <button className="ex-overflow" onClick={() => { setView("table"); setQuery(""); }}>+{rows.length - 2} autres épreuves</button>}</>}</div>; })}</div>
        {!monthExams.length && <div className="ex-calendar-empty">Aucune épreuve programmée pour ce mois.</div>}
      </div> : <div className="ex-table-wrap"><table><thead><tr><th>Date</th><th>Heure</th><th>Matière</th><th>Classe / Groupe</th><th>Salle</th><th>Statut</th><th>Conflit</th><th/></tr></thead><tbody>{filteredExams.map(e => { const c = conflicts(e, e.id); return <tr key={e.id} onClick={() => setPanel({ type: "exam", id: e.id })}><td>{dateLabel(e.date)}</td><td><strong>{e.startTime} – {e.endTime}</strong></td><td><strong>{subjectName(e.subjectId)}</strong></td><td>{className(e.classId)}{e.groupId && <small>{getClass(e.classId)?.groups.find((g: any) => g.id === e.groupId)?.name}</small>}</td><td>{getRoom(e.roomId)?.name}</td><td><Status value={examState(e)}/></td><td>{c.roomConflict || c.classConflict ? <span className="ex-conflict-chip"><AlertCircle size={12}/>Conflit</span> : "—"}</td><td><button className="ex-icon-button" onClick={e2 => { e2.stopPropagation(); setPanel({ type: "exam", id: e.id }); }}><Eye size={15}/></button></td></tr>; })}</tbody></table>{!filteredExams.length && <Empty title="Aucun examen programmé pour cette session" detail="Modifiez les filtres ou programmez une nouvelle épreuve." action={() => openNewExam()}/>}</div>}
      <div className="ex-schedule-footer"><span>{filteredExams.length} épreuve(s) affichée(s)</span><span>Les horaires sont présentés selon l'heure locale de l'établissement.</span></div>
    </section> : <section className="ex-panel">
      <div className="ex-panel-heading"><div><h2>Salles d'examen</h2><p>Capacité et disponibilité pour les créneaux de la session sélectionnée.</p></div><span className="ex-readonly-chip"><Info size={13}/>Référentiel de démonstration</span></div>
      <div className="ex-table-wrap"><table><thead><tr><th>Salle</th><th>Capacité</th><th>Examens affectés</th><th>Disponibilité · {dateLabel(roomAvailabilityDate)}</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{activeRoomCounts.map(({ room, assigned }) => <tr key={room.id}><td><strong>{room.name}</strong><small>{room.building}</small></td><td>{room.capacity} places</td><td><span className="ex-inline-count"><CalendarDays size={13}/>{assigned} épreuve(s)</span></td><td><b className={selectedRoomAvailability(room) === "Disponible" ? "ex-room-free" : selectedRoomAvailability(room) === "Occupée" ? "ex-room-busy" : "ex-room-unavailable"}>{selectedRoomAvailability(room)}</b></td><td><Status value={room.status}/></td><td><button className="ex-view-link" onClick={() => { setRoomFilter(room.id); setTab("schedule"); setView("table"); }}>Voir les épreuves</button></td></tr>)}</tbody></table></div>
      <div className="ex-room-note"><Info size={14}/><span>Les salles affichées sont des exemples visuels : aucun modèle de locaux ou de réservation de salles n'est encore connecté dans le projet.</span></div>
    </section>}

    {panel && selectedPanel && <div className="ex-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setPanel(null); }}><aside className="ex-drawer"><header><div><span className="ex-eyebrow">{panel.type === "session" ? "DÉTAILS DE LA SESSION" : "DÉTAILS DE L'ÉPREUVE"}</span><h2>{panel.type === "session" ? (selectedPanel as ExamSession).name : subjectName((selectedPanel as ExamRecord).subjectId)}</h2><p>{panel.type === "session" ? (selectedPanel as ExamSession).yearName : className((selectedPanel as ExamRecord).classId)}</p></div><button onClick={() => setPanel(null)} aria-label="Fermer"><X size={18}/></button></header><div className="ex-drawer-content">
      {panel.type === "session" ? (() => { const s = selectedPanel as ExamSession; const list = exams.filter(e => e.sessionId === s.id && !e.cancelled); const coveredClasses = s.classIds.filter(id => list.some(e => e.classId === id)).length; const progress = s.classIds.length ? Math.round(coveredClasses / s.classIds.length * 100) : 0; return <><div className="ex-detail-status"><Status value={sessionState(s,exams)}/><span>{list.length} épreuve(s) programmée(s)</span></div><div className="ex-detail-grid"><div><small>Année scolaire</small><strong>{s.yearName}</strong></div><div><small>Période</small><strong>{s.period}</strong></div><div><small>Date de début</small><strong>{dateLabel(s.startDate)}</strong></div><div><small>Date de fin</small><strong>{dateLabel(s.endDate)}</strong></div><div><small>Programmes</small><strong>{s.programNames.join(", ") || "—"}</strong></div><div><small>Niveaux</small><strong>{s.levelNames.join(", ") || "—"}</strong></div></div><section className="ex-detail-section"><h3>Avancement de la programmation</h3><div className="ex-progress-head"><strong>{progress}%</strong><span>{coveredClasses} classe(s) sur {s.classIds.length}</span></div><div className="ex-progress"><i style={{width:`${progress}%`}}/></div><small>Indicateur calculé sur les classes participantes ayant au moins une épreuve programmée. Les matières attendues ne sont pas configurées dans le modèle actuel.</small></section><section className="ex-detail-section"><h3>Classes participantes <span>{s.classIds.length}</span></h3>{s.classIds.map(getClass).filter(Boolean).map((c: any) => <div className="ex-class-line" key={c.id}><span><strong>{c.name}</strong><small>{c.programName} · {c.levelName}</small></span><b>{list.filter(e => e.classId === c.id).length} épreuve(s)</b></div>)}{!s.classIds.length && <p>Aucune classe associée.</p>}</section><section className="ex-detail-section"><h3>Épreuves programmées</h3>{list.map(e => <button className="ex-detail-exam" key={e.id} onClick={() => setPanel({type:"exam",id:e.id})}><span><strong>{subjectName(e.subjectId)}</strong><small>{dateLabel(e.date)} · {e.startTime}–{e.endTime}</small></span><ChevronRight size={15}/></button>)}{!list.length && <p>Aucune épreuve programmée pour cette session.</p>}</section></>; })() : (() => { const e = selectedPanel as ExamRecord; const c = getClass(e.classId); const room = getRoom(e.roomId); const issue = conflicts(e,e.id); return <><div className="ex-detail-status"><Status value={examState(e)}/><span>{e.id}</span></div><div className="ex-detail-grid"><div><small>Session</small><strong>{getSession(e.sessionId)?.name ?? "—"}</strong></div><div><small>Année scolaire</small><strong>{getSession(e.sessionId)?.yearName ?? "—"}</strong></div><div><small>Matière</small><strong>{subjectName(e.subjectId)}</strong></div><div><small>Classe</small><strong>{c?.name ?? "—"}</strong></div><div><small>Programme / Niveau</small><strong>{c?.programName} · {c?.levelName}</strong></div><div><small>Groupe</small><strong>{c?.groups.find((g: any) => g.id === e.groupId)?.name ?? "Classe entière"}</strong></div><div><small>Date</small><strong>{dateLabel(e.date)}</strong></div><div><small>Horaire</small><strong>{e.startTime} – {e.endTime}</strong></div><div><small>Salle</small><strong>{room?.name ?? "—"}</strong></div><div><small>Capacité / Effectif</small><strong>{room?.capacity ?? "—"} / {c?.enrolledCount ?? "—"}</strong></div></div>{e.instructions && <section className="ex-detail-section"><h3>Consignes</h3><p>{e.instructions}</p></section>}{(issue.roomConflict || issue.classConflict || issue.outOfRange || issue.overCapacity) && <section className="ex-conflict-panel"><h3><AlertCircle size={15}/>Points de vigilance</h3>{issue.roomConflict && <p>Salle déjà occupée : conflit avec {subjectName(issue.roomConflict.subjectId)} ({issue.roomConflict.startTime}–{issue.roomConflict.endTime}).</p>}{issue.classConflict && <p>Chevauchement de classe avec {subjectName(issue.classConflict.subjectId)}.</p>}{issue.outOfRange && <p>Cette épreuve se situe hors de la période de la session.</p>}{issue.overCapacity && <p>Capacité insuffisante : {issue.expected} élèves pour {issue.capacity} places.</p>}</section>}</>; })()}
      </div><footer><span>Mode démonstration uniquement</span>{panel.type === "session" ? <button className="ex-button ex-button--secondary" onClick={() => openEditSession(selectedPanel as ExamSession)}>Modifier la session</button><button className="ex-button ex-button--primary" onClick={() => { setPanel(null); setTab("schedule"); setSessionId((selectedPanel as ExamSession).id); }}>Gérer le planning</button> : <><button className="ex-button ex-button--danger" disabled={(selectedPanel as ExamRecord).cancelled} onClick={() => setConfirmCancel(selectedPanel as ExamRecord)}><Ban size={14}/>Annuler l'examen</button><button className="ex-button ex-button--primary" disabled={(selectedPanel as ExamRecord).cancelled} onClick={() => { const e = selectedPanel as ExamRecord; setExamForm({sessionId:e.sessionId,classId:e.classId,groupId:e.groupId,subjectId:e.subjectId,date:e.date,startTime:e.startTime,endTime:e.endTime,roomId:e.roomId,instructions:e.instructions}); setForm({type:"exam",id:e.id}); setPanel(null); }}>Modifier l'examen</button></>}</footer></aside></div>}

    {form && <div className="ex-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setForm(null); }}><section className="ex-modal" role="dialog" aria-modal="true"><header><div><span className="ex-eyebrow">MODE DÉMONSTRATION</span><h2>{form.type === "session" ? form.id ? "Modifier la session" : "Créer une session d'examens" : form.id ? "Modifier un examen" : "Programmer un examen"}</h2><p>Les données saisies restent locales à cette démonstration.</p></div><button onClick={() => setForm(null)} aria-label="Fermer"><X size={17}/></button></header>
      {formError && <div className="ex-form-error"><AlertCircle size={14}/>{formError}</div>}
      {form.type === "session" ? <div className="ex-form-grid"><label className="wide">Nom de la session<input value={sessionForm.name} onChange={e => setSessionForm({...sessionForm,name:e.target.value})} placeholder="Ex. Examens du premier semestre"/></label><label>Année scolaire<select value={sessionForm.yearId} onChange={e => setSessionForm({...sessionForm,yearId:e.target.value,classIds:[]})}>{years.map((y:any)=><option value={y.id} key={y.id}>{y.name}</option>)}</select></label><label>Période / Semestre<select value={sessionForm.period} onChange={e => setSessionForm({...sessionForm,period:e.target.value})}>{PERIODS.map(p=><option key={p}>{p}</option>)}</select></label><label>Date de début<input type="date" value={sessionForm.startDate} onChange={e => setSessionForm({...sessionForm,startDate:e.target.value})}/></label><label>Date de fin<input type="date" value={sessionForm.endDate} onChange={e => setSessionForm({...sessionForm,endDate:e.target.value})}/></label><label className="wide">Description (facultative)<textarea rows={2} value={sessionForm.description} onChange={e => setSessionForm({...sessionForm,description:e.target.value})}/></label><div className="wide ex-class-picker"><strong>Classes participantes *</strong><small>Sélectionnez les classes rattachées à l'année scolaire choisie.</small><div>{classes.filter((c:any)=>c.academicYearId===sessionForm.yearId&&c.status==="Actif").map((c:any)=><label key={c.id}><input type="checkbox" checked={sessionForm.classIds.includes(c.id)} onChange={e=>setSessionForm({...sessionForm,classIds:e.target.checked?[...sessionForm.classIds,c.id]:sessionForm.classIds.filter(id=>id!==c.id)})}/>{c.name}<small>{c.programName} · {c.levelName}</small></label>)}</div></div></div> : <div className="ex-form-grid"><label className="wide">Session d'examens<select value={examForm.sessionId} onChange={e=>{const s=getSession(e.target.value);setExamForm({...examForm,sessionId:e.target.value,classId:s?.classIds[0]??"",groupId:"",subjectId:"",date:s?.startDate??examForm.date})}}>{sessions.filter(s=>s.yearId===yearId).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Classe<select value={examForm.classId} onChange={e=>setExamForm({...examForm,classId:e.target.value,groupId:"",subjectId:""})}>{(getSession(examForm.sessionId)?.classIds??[]).map(id=>getClass(id)).filter(Boolean).map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Groupe<select value={examForm.groupId} onChange={e=>setExamForm({...examForm,groupId:e.target.value})}><option value="">Classe entière</option>{(getClass(examForm.classId)?.groups??[]).map((g:any)=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label><label className="wide">Matière<select value={examForm.subjectId} onChange={e=>setExamForm({...examForm,subjectId:e.target.value})}>{subjects.filter((s:any)=>s.status==="Actif"&&s.assignments.some((a:any)=>a.academicYearId===getSession(examForm.sessionId)?.yearId&&a.levelId===getClass(examForm.classId)?.levelId)).map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Date de l'examen<input type="date" value={examForm.date} onChange={e=>setExamForm({...examForm,date:e.target.value})}/></label><label>Salle<select value={examForm.roomId} onChange={e=>setExamForm({...examForm,roomId:e.target.value})}>{ROOM_FIXTURES.filter(r=>r.status==="Opérationnelle").map(r=><option key={r.id} value={r.id}>{r.name} · {r.capacity} places</option>)}</select></label><label>Heure de début<input type="time" value={examForm.startTime} onChange={e=>setExamForm({...examForm,startTime:e.target.value})}/></label><label>Heure de fin<input type="time" value={examForm.endTime} onChange={e=>setExamForm({...examForm,endTime:e.target.value})}/></label><label className="wide">Consignes (facultatives)<textarea rows={2} value={examForm.instructions} onChange={e=>setExamForm({...examForm,instructions:e.target.value})}/></label><div className="wide ex-form-hint"><Info size={13}/>Les conflits de salle, de classe et les limites de session sont vérifiés avant l'ajout.</div></div>}
      <footer><button className="ex-button ex-button--secondary" onClick={()=>setForm(null)}>Annuler</button><button className="ex-button ex-button--primary" onClick={form.type==="session"?saveSession:saveExam}>{form.type==="session"?"Enregistrer":"Enregistrer l'examen"}</button></footer>
    </section></div>}
    {confirmCancel && <div className="ex-modal-backdrop"><section className="ex-confirm" role="dialog" aria-modal="true"><span className="ex-confirm-icon"><AlertCircle size={20}/></span><h2>Annuler cette épreuve ?</h2><p>L'épreuve sera marquée comme annulée dans cette démonstration. Son enregistrement restera visible dans l'historique.</p><footer><button className="ex-button ex-button--secondary" onClick={()=>setConfirmCancel(null)}>Conserver l'épreuve</button><button className="ex-button ex-button--danger" onClick={cancelExam}>Confirmer l'annulation</button></footer></section></div>}
  </main>;
}
