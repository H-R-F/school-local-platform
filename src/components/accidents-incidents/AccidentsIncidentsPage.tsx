import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, CheckCircle2, ChevronRight, ClipboardList, Clock3,
  Eye, FilterX, History, Info, MapPin, MessageCircle, Paperclip,
  Plus, Search, ShieldAlert, ShieldCheck, UserPlus, Users, X
} from "lucide-react";
import { studentsRepository, type StudentRecord } from "../../services/students";
import { employeesRepository } from "../../services/employees";
import { teachersRepository } from "../../services/teachers";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./AccidentsIncidentsPage.css";

interface Props { user: AuthenticatedSidebarUser }
type IncidentStatus = "À examiner" | "En suivi" | "Clôturé";
type PersonCategory = "Élève" | "Enseignant" | "Employé";
type PersonRole = "Personne concernée" | "Témoin" | "Déclarant" | "Intervenant";
type IncidentPerson = { id: string; name: string; category: PersonCategory; role: PersonRole; reference?: string; className?: string };
type FollowUp = { id: string; note: string; actor: string; createdAt: string; kind: "Note" | "Statut" | "Affectation" };
type IncidentEvent = { id: string; label: string; detail: string; actor: string; createdAt: string };
type IncidentRecord = {
  id: string; occurredAt: string; category: string; location: string; description: string;
  circumstances: string; immediateActions: string; people: IncidentPerson[];
  responsibleId: string; responsibleName: string; status: IncidentStatus;
  createdAt: string; createdBy: string; followUps: FollowUp[]; history: IncidentEvent[];
};
type StaffOption = { id: string; name: string; category: "Enseignant" | "Employé" };
type FormState = {
  date: string; time: string; category: string; location: string; description: string;
  circumstances: string; immediateActions: string; responsibleId: string;
  selectedPersonId: string; selectedPersonCategory: PersonCategory; selectedPersonRole: PersonRole;
};
const STORAGE_KEY = "school-platform-incident-demo-v1";
const INCIDENT_CATEGORIES = [
  "Accident physique", "Incident sportif", "Incident de transport",
  "Incident pendant une sortie", "Incident matériel", "Incident de sécurité", "Autre"
];
const STATUS_OPTIONS: IncidentStatus[] = ["À examiner", "En suivi", "Clôturé"];
const DEMO_SEED: IncidentRecord[] = [
  {
    id: "INC-SCOL-003", occurredAt: "2026-11-05T10:25", category: "Accident physique",
    location: "Cour de récréation", description: "Chute signalée pendant la récréation.",
    circumstances: "Événement rapporté à l'équipe de surveillance.",
    immediateActions: "Prise en charge initiale rapportée par l'équipe présente.",
    people: [{ id: "demo-student-1", name: "Adam El Mansouri", category: "Élève", role: "Personne concernée", reference: "ELV-001", className: "3e B" }],
    responsibleId: "demo-staff-1", responsibleName: "Service de vie scolaire", status: "En suivi",
    createdAt: "2026-11-05T10:40", createdBy: "Service de vie scolaire",
    followUps: [{ id: "FU-1", note: "Vérification complémentaire à effectuer auprès de l'équipe présente.", actor: "Service de vie scolaire", createdAt: "2026-11-05T11:00", kind: "Note" }],
    history: [{ id: "EV-1", label: "Incident déclaré", detail: "Création d'un exemple de démonstration.", actor: "Service de vie scolaire", createdAt: "2026-11-05T10:40" }]
  },
  {
    id: "INC-SCOL-002", occurredAt: "2026-11-03T14:10", category: "Incident sportif",
    location: "Terrain de sport", description: "Incident rapporté pendant une activité sportive encadrée.",
    circumstances: "Les circonstances restent à préciser avec l'équipe encadrante.",
    immediateActions: "Information transmise au responsable de la vie scolaire.",
    people: [{ id: "demo-student-2", name: "Lina Berrada", category: "Élève", role: "Personne concernée", reference: "ELV-002", className: "2e A" }],
    responsibleId: "demo-staff-2", responsibleName: "Responsable pédagogique", status: "À examiner",
    createdAt: "2026-11-03T14:25", createdBy: "Service de vie scolaire", followUps: [],
    history: [{ id: "EV-2", label: "Incident déclaré", detail: "Création d'un exemple de démonstration.", actor: "Service de vie scolaire", createdAt: "2026-11-03T14:25" }]
  },
  {
    id: "INC-SCOL-001", occurredAt: "2026-10-29T09:40", category: "Incident de sécurité",
    location: "Couloir – bâtiment A", description: "Situation signalée dans un couloir de l'établissement.",
    circumstances: "Signalement transmis à l'équipe responsable.",
    immediateActions: "Situation transmise au responsable concerné.",
    people: [{ id: "demo-student-3", name: "Omar Chraïbi", category: "Élève", role: "Personne concernée", reference: "ELV-003", className: "5e B" }],
    responsibleId: "demo-staff-1", responsibleName: "Service de vie scolaire", status: "Clôturé",
    createdAt: "2026-10-29T10:00", createdBy: "Service de vie scolaire",
    followUps: [{ id: "FU-3", note: "Suivi de démonstration terminé.", actor: "Service de vie scolaire", createdAt: "2026-10-30T12:00", kind: "Note" }],
    history: [{ id: "EV-3", label: "Incident déclaré", detail: "Création d'un exemple de démonstration.", actor: "Service de vie scolaire", createdAt: "2026-10-29T10:00" }, { id: "EV-4", label: "Incident clôturé", detail: "Exemple clôturé dans le registre local.", actor: "Service de vie scolaire", createdAt: "2026-10-30T12:00" }]
  }
];
const emptyForm = (): FormState => ({
  date: new Date().toISOString().slice(0, 10), time: new Date().toTimeString().slice(0, 5),
  category: INCIDENT_CATEGORIES[0], location: "", description: "", circumstances: "",
  immediateActions: "", responsibleId: "", selectedPersonId: "", selectedPersonCategory: "Élève",
  selectedPersonRole: "Personne concernée"
});
function readIncidents(): IncidentRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SEED)); return DEMO_SEED; }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error();
    return parsed as IncidentRecord[];
  } catch { throw new Error("Impossible de charger le registre local de démonstration."); }
}
function writeIncidents(rows: IncidentRecord[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); }
  catch { throw new Error("Enregistrement local impossible. Vérifiez l'espace disponible dans le navigateur."); }
}
function formatDate(value: string, withTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", withTime ? { dateStyle: "short", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
}
function statusClass(status: IncidentStatus) {
  return status === "Clôturé" ? "ai-status--closed" : status === "En suivi" ? "ai-status--follow" : "ai-status--new";
}
function personName(student: StudentRecord) { return student.firstName + " " + student.lastName; }

export function AccidentsIncidentsPage({ user }: Props) {
  const canManage = user.permissions.includes("logistics.incidents.manage");
  const canStudents = user.permissions.includes("people.students.view");
  const canEmployees = user.permissions.includes("people.employees.view");
  const canTeachers = user.permissions.includes("people.teachers.view");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [personFilter, setPersonFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [responsibleFilter, setResponsibleFilter] = useState("all");
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState("Résumé");
  const [followUpNote, setFollowUpNote] = useState("");
  const [newStatus, setNewStatus] = useState<IncidentStatus>("En suivi");
  const [newResponsible, setNewResponsible] = useState("");
  const [saving, setSaving] = useState(false);
  const pageSize = 8;

  useEffect(() => {
    if (!canManage) { setLoading(false); return; }
    let live = true;
    setLoading(true); setError("");
    const jobs: Promise<unknown>[] = [Promise.resolve().then(() => readIncidents())];
    jobs.push(canStudents ? studentsRepository.list() : Promise.resolve(null));
    jobs.push(canEmployees ? employeesRepository.list() : Promise.resolve(null));
    jobs.push(canTeachers ? teachersRepository.list() : Promise.resolve(null));
    Promise.all(jobs).then(results => {
      if (!live) return;
      setIncidents(results[0] as IncidentRecord[]);
      const studentData = results[1] as Awaited<ReturnType<typeof studentsRepository.list>> | null;
      const employeeData = results[2] as Awaited<ReturnType<typeof employeesRepository.list>> | null;
      const teacherData = results[3] as Awaited<ReturnType<typeof teachersRepository.list>> | null;
      setStudents(studentData?.students.filter(s => s.accountStatus === "Actif" && s.enrollment?.status === "Actif") ?? []);
      const employeeRows: StaffOption[] = employeeData?.employees.filter(e => e.employmentStatus === "Actif").map(e => ({ id: e.id, name: e.fullName, category: "Employé" })) ?? [];
      const teacherRows: StaffOption[] = teacherData?.teachers.filter(t => t.employmentStatus === "Actif").map(t => ({ id: t.id, name: t.fullName, category: "Enseignant" })) ?? [];
      setStaff([...teacherRows, ...employeeRows]);
    }).catch(e => { if (live) setError(e instanceof Error ? e.message : "Impossible de charger les données."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [canManage, canStudents, canEmployees, canTeachers]);

  const personLabel = (person: IncidentPerson) => (person.category === "Élève" && !canStudents) || (person.category === "Enseignant" && !canTeachers) || (person.category === "Employé" && !canEmployees) ? "Identité restreinte" : person.name;
  const responsibleLabel = (name: string) => canEmployees && canTeachers ? name : "Personnel autorisé";
  const filtered = useMemo(() => incidents.filter(item => {
    const q = query.trim().toLocaleLowerCase("fr-FR");
    const matchesQuery = !q || [item.id, item.category, item.location, item.description, item.people.map(p => personLabel(p)).join(" ")].join(" ").toLocaleLowerCase("fr-FR").includes(q);
    const date = item.occurredAt.slice(0, 10);
    return matchesQuery && (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo)
      && (categoryFilter === "all" || item.category === categoryFilter)
      && (personFilter === "all" || item.people.some(p => p.category === personFilter))
      && (locationFilter === "all" || item.location === locationFilter)
      && (statusFilter === "all" || item.status === statusFilter)
      && (responsibleFilter === "all" || item.responsibleId === responsibleFilter);
  }).sort((a, b) => sortNewest ? b.occurredAt.localeCompare(a.occurredAt) : a.occurredAt.localeCompare(b.occurredAt)),
  [incidents, query, dateFrom, dateTo, categoryFilter, personFilter, locationFilter, statusFilter, responsibleFilter, sortNewest, canStudents, canTeachers, canEmployees]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selected = incidents.find(i => i.id === selectedId) ?? null;
  const followCount = incidents.filter(i => i.status === "En suivi").length;
  const closedCount = incidents.filter(i => i.status === "Clôturé").length;
  const studentAccidents = incidents.filter(i => i.category === "Accident physique" && i.people.some(p => p.category === "Élève")).length;
  const locations = [...new Set(incidents.map(i => i.location))].sort();
  const responsibles = [...new Map(incidents.map(i => [i.responsibleId, { id: i.responsibleId, name: responsibleLabel(i.responsibleName) }])).values()];

  const resetFilters = () => {
    setQuery(""); setDateFrom(""); setDateTo(""); setCategoryFilter("all"); setPersonFilter("all");
    setLocationFilter("all"); setStatusFilter("all"); setResponsibleFilter("all"); setPage(1);
  };
  const persist = (rows: IncidentRecord[]) => { writeIncidents(rows); setIncidents(rows); };
  const [formPeople, setFormPeople] = useState<IncidentPerson[]>([]);
  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(old => ({ ...old, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm()); setFormPeople([]); setError(""); setNotice(""); setShowForm(true);
  };
  const createIncident = () => {
    if (!form.date || !form.time || !form.location.trim() || !form.description.trim()) {
      setError("Renseignez la date, l'heure, le lieu et la description des faits."); return;
    }
    if (form.date > new Date().toISOString().slice(0, 10)) { setError("La date de l'incident ne peut pas être dans le futur."); return; }
    setSaving(true); setError("");
    try {
      const now = new Date().toISOString().slice(0, 16);
      const id = "INC-" + now.replace(/\D/g, "").slice(2, 12) + "-" + Math.floor(Math.random() * 90 + 10);
      const responsible = staff.find(s => s.id === form.responsibleId);
      const actor = user.displayName;
      const record: IncidentRecord = {
        id, occurredAt: form.date + "T" + form.time, category: form.category, location: form.location.trim(),
        description: form.description.trim(), circumstances: form.circumstances.trim(),
        immediateActions: form.immediateActions.trim(), people: formPeople,
        responsibleId: responsible?.id ?? "", responsibleName: responsible?.name ?? "Non affecté",
        status: "À examiner", createdAt: now, createdBy: actor, followUps: [],
        history: [{ id: "EV-" + Date.now(), label: "Incident déclaré", detail: "Enregistrement local de démonstration.", actor, createdAt: now }]
      };
      const rows = [record, ...incidents]; persist(rows); setSelectedId(id); setShowForm(false); setNotice("Incident ajouté au registre local de démonstration."); setPage(1);
    } catch (e) { setError(e instanceof Error ? e.message : "Enregistrement impossible."); }
    finally { setSaving(false); }
  };
  const updateStatus = () => {
    if (!selected || selected.status === "Clôturé" || newStatus === selected.status) return;
    if (newStatus === "Clôturé" && !window.confirm("Confirmer la clôture de cet incident dans le registre local de démonstration ?")) return;
    const actor = user.displayName; const now = new Date().toISOString().slice(0, 16);
    const event: IncidentEvent = { id: "EV-" + Date.now(), label: "Statut modifié", detail: selected.status + " → " + newStatus, actor, createdAt: now };
    const updated = { ...selected, status: newStatus, history: [...selected.history, event] };
    try { persist(incidents.map(i => i.id === selected.id ? updated : i)); setNotice("Statut actualisé dans le registre local."); }
    catch (e) { setError(e instanceof Error ? e.message : "Mise à jour impossible."); }
  };
  const addFollowUp = () => {
    if (!selected || selected.status === "Clôturé" || !followUpNote.trim()) return;
    const now = new Date().toISOString().slice(0, 16); const actor = user.displayName;
    const entry: FollowUp = { id: "FU-" + Date.now(), note: followUpNote.trim(), actor, createdAt: now, kind: "Note" };
    const event: IncidentEvent = { id: "EV-" + Date.now(), label: "Note de suivi ajoutée", detail: "Une note de suivi a été ajoutée.", actor, createdAt: now };
    const updated = { ...selected, followUps: [...selected.followUps, entry], history: [...selected.history, event] };
    try { persist(incidents.map(i => i.id === selected.id ? updated : i)); setFollowUpNote(""); setNotice("Note ajoutée au suivi local."); }
    catch (e) { setError(e instanceof Error ? e.message : "Ajout impossible."); }
  };
  const assignResponsible = () => {
    if (!selected || selected.status === "Clôturé" || !newResponsible) return;
    const person = staff.find(s => s.id === newResponsible); if (!person) return;
    const now = new Date().toISOString().slice(0, 16); const actor = user.displayName;
    const event: IncidentEvent = { id: "EV-" + Date.now(), label: "Responsable modifié", detail: "Nouveau responsable : " + person.name, actor, createdAt: now };
    const updated = { ...selected, responsibleId: person.id, responsibleName: person.name, history: [...selected.history, event] };
    try { persist(incidents.map(i => i.id === selected.id ? updated : i)); setNewResponsible(""); setNotice("Responsable modifié dans le registre local."); }
    catch (e) { setError(e instanceof Error ? e.message : "Affectation impossible."); }
  };
  const closeIncident = () => {
    if (!selected || selected.status === "Clôturé") return;
    if (!window.confirm("Confirmer la clôture de cet incident dans le registre local de démonstration ?")) return;
    const now = new Date().toISOString().slice(0, 16); const actor = user.displayName;
    const event: IncidentEvent = { id: "EV-" + Date.now(), label: "Incident clôturé", detail: "Clôture enregistrée localement.", actor, createdAt: now };
    const updated = { ...selected, status: "Clôturé" as const, history: [...selected.history, event] };
    try { persist(incidents.map(i => i.id === selected.id ? updated : i)); setNotice("Incident clôturé dans le registre local."); }
    catch (e) { setError(e instanceof Error ? e.message : "Clôture impossible."); }
  };

  if (!canManage) return <main className="ai-page"><section className="ai-access"><ShieldCheck size={28}/><h1>Accès non autorisé</h1><p>Vous ne disposez pas de l'autorisation nécessaire pour consulter les accidents et incidents.</p></section></main>;
  if (loading) return <main className="ai-page"><div className="ai-loading">Chargement du registre des incidents et des référentiels…</div></main>;
  if (error && incidents.length === 0) return <main className="ai-page"><div className="ai-alert ai-alert--error"><AlertCircle size={16}/>{error}</div><button className="ai-btn ai-btn--secondary" onClick={() => window.location.reload()}>Réessayer</button></main>;

  return (
    <main className="ai-page">
      <header className="ai-header">
        <div><div className="ai-breadcrumb">Logistique <ChevronRight size={13}/><strong>Accidents &amp; Incidents</strong></div><h1>Accidents &amp; Incidents</h1><p>Déclarez, documentez et suivez les incidents survenus dans l’établissement.</p></div>
        <button className="ai-btn ai-btn--primary" onClick={openCreate}><Plus size={15}/>Déclarer un incident</button>
      </header>
      <section className="ai-demo"><Info size={16}/><div><strong>Mode démonstration — registre local</strong><p>Les exemples sont fictifs. Les déclarations, notes et changements de statut sont enregistrés uniquement dans ce navigateur. Aucun dossier réel, document, parent ou service d'urgence n'est contacté. N'y saisissez pas de données médicales ou confidentielles réelles.</p></div></section>
      {error && <div className="ai-alert ai-alert--error"><AlertCircle size={15}/><span>{error}</span><button onClick={()=>setError("")}><X size={14}/></button></div>}
      {notice && <div className="ai-alert ai-alert--success"><CheckCircle2 size={15}/><span>{notice}</span><button onClick={()=>setNotice("")}><X size={14}/></button></div>}
      <section className="ai-kpis">
        <article><i><ClipboardList size={18}/></i><div><small>TOTAL DES INCIDENTS</small><strong>{incidents.length}</strong><span>Registre local</span></div></article>
        <article><i><Users size={18}/></i><div><small>ACCIDENTS PHYSIQUES IMPLIQUANT DES ÉLÈVES</small><strong>{studentAccidents}</strong><span>Événements distincts</span></div></article>
        <article><i><Clock3 size={18}/></i><div><small>INCIDENTS EN SUIVI</small><strong>{followCount}</strong><span>À traiter ou compléter</span></div></article>
        <article><i><CheckCircle2 size={18}/></i><div><small>INCIDENTS CLÔTURÉS</small><strong>{closedCount}</strong><span>Historique conservé</span></div></article>
      </section>
      <section className="ai-panel">
        <div className="ai-panel-heading"><div><span className="ai-eyebrow">REGISTRE DES ÉVÉNEMENTS</span><h2>Incidents déclarés</h2><p>Consultez les événements et ouvrez un dossier pour suivre les actions.</p></div><div className="ai-panel-tools"><button className="ai-sort" onClick={()=>setSortNewest(v=>!v)}>{sortNewest?"Plus récents":"Plus anciens"}</button><span className="ai-result-count">{filtered.length} résultat{filtered.length>1?"s":""}</span></div></div>
        <div className="ai-filters">
          <label className="ai-search"><Search size={15}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Référence, description, personne…"/></label>
          <label><span>Du</span><input type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPage(1);}}/></label>
          <label><span>Au</span><input type="date" value={dateTo} onChange={e=>{setDateTo(e.target.value);setPage(1);}}/></label>
          <label><span>Catégorie</span><select value={categoryFilter} onChange={e=>{setCategoryFilter(e.target.value);setPage(1);}}><option value="all">Toutes</option>{[...new Set(incidents.map(i=>i.category))].map(v=><option key={v}>{v}</option>)}</select></label>
          <label><span>Personne</span><select value={personFilter} onChange={e=>{setPersonFilter(e.target.value);setPage(1);}}><option value="all">Toutes</option>{["Élève","Enseignant","Employé"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label><span>Lieu</span><select value={locationFilter} onChange={e=>{setLocationFilter(e.target.value);setPage(1);}}><option value="all">Tous</option>{locations.map(v=><option key={v}>{v}</option>)}</select></label>
          <label><span>Suivi</span><select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}><option value="all">Tous</option>{STATUS_OPTIONS.map(v=><option key={v}>{v}</option>)}</select></label>
          <label><span>Responsable</span><select value={responsibleFilter} onChange={e=>{setResponsibleFilter(e.target.value);setPage(1);}}><option value="all">Tous</option>{responsibles.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
          <button className="ai-reset" onClick={resetFilters}><FilterX size={14}/>Réinitialiser</button>
        </div>
        <div className="ai-table-wrap"><table className="ai-table"><thead><tr><th>Référence</th><th>Date et heure</th><th>Type d'incident</th><th>Personne(s)</th><th>Lieu</th><th>Responsable</th><th>Statut</th><th></th></tr></thead><tbody>
          {visible.map(item=><tr key={item.id} onClick={()=>{setSelectedId(item.id);setDetailTab("Résumé");setNewStatus(item.status);setNewResponsible("");}} className={selectedId===item.id?"is-selected":""}>
            <td><strong>{item.id}</strong><small>{responsibleLabel(item.createdBy)}</small></td><td>{formatDate(item.occurredAt,true)}</td><td>{item.category}</td>
            <td><strong>{item.people.length===0?"Aucune personne renseignée":item.people.length===1?personLabel(item.people[0]):item.people.length+" personnes"}</strong><small>{[...new Set(item.people.map(p=>p.category))].join(", ")}</small></td>
            <td><span className="ai-location"><MapPin size={12}/>{item.location}</span></td><td>{responsibleLabel(item.responsibleName)}</td>
            <td><span className={"ai-status "+statusClass(item.status)}>{item.status}</span></td>
            <td><button className="ai-icon-btn" aria-label="Consulter l'incident" onClick={e=>{e.stopPropagation();setSelectedId(item.id);setDetailTab("Résumé");setNewStatus(item.status);}}><Eye size={15}/></button></td>
          </tr>)}
          {!visible.length&&<tr><td colSpan={8}><div className="ai-empty"><ShieldAlert size={22}/><strong>Aucun incident trouvé</strong><span>Aucun dossier ne correspond aux filtres sélectionnés.</span><button onClick={resetFilters}>Réinitialiser les filtres</button></div></td></tr>}
        </tbody></table></div>
        <div className="ai-table-footer"><span>Affichage de {filtered.length?((page-1)*pageSize+1):0} à {Math.min(page*pageSize,filtered.length)} sur {filtered.length}</span><div><button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Précédent</button><strong>{page} / {pageCount}</strong><button disabled={page>=pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))}>Suivant</button></div></div>
      </section>
      <section className="ai-capabilities">
        <article><Paperclip size={16}/><div><strong>Documents et pièces jointes</strong><span>Le stockage documentaire sécurisé n'est pas connecté à ce module.</span></div></article>
        <article><MessageCircle size={16}/><div><strong>Communication avec les familles</strong><span>Aucune notification ni communication parentale n'est déclenchée depuis cette démonstration.</span></div></article>
        <article><History size={16}/><div><strong>Historique et audit</strong><span>La chronologie affichée est locale et ne remplace pas un journal d'audit centralisé.</span></div></article>
      </section>

      {showForm&&<div className="ai-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false);}}><section className="ai-modal">
        <header><div><span className="ai-eyebrow">NOUVEAU DOSSIER</span><h2>Déclarer un incident</h2><p>Consignez les faits rapportés sans interprétation ni diagnostic.</p></div><button className="ai-icon-btn" onClick={()=>setShowForm(false)}><X size={18}/></button></header>
        <div className="ai-form-body">
          <div className="ai-form-section"><h3>Informations sur l'événement</h3><div className="ai-form-grid">
            <label><span>Type d'incident *</span><select value={form.category} onChange={e=>updateForm("category",e.target.value)}>{INCIDENT_CATEGORIES.map(v=><option key={v}>{v}</option>)}</select></label>
            <label><span>Date *</span><input type="date" value={form.date} onChange={e=>updateForm("date",e.target.value)}/></label>
            <label><span>Heure *</span><input type="time" value={form.time} onChange={e=>updateForm("time",e.target.value)}/></label>
            <label className="ai-wide"><span>Lieu précis *</span><input value={form.location} onChange={e=>updateForm("location",e.target.value)} placeholder="Ex. : Cour de récréation, bâtiment B…"/></label>
            <label className="ai-wide"><span>Description factuelle *</span><textarea rows={3} value={form.description} onChange={e=>updateForm("description",e.target.value)} placeholder="Décrivez les faits observés ou rapportés…"/></label>
            <label className="ai-wide"><span>Circonstances connues</span><textarea rows={2} value={form.circumstances} onChange={e=>updateForm("circumstances",e.target.value)} placeholder="Éléments factuels disponibles…"/></label>
          </div></div>
          <div className="ai-form-section"><h3>Personnes impliquées</h3><div className="ai-form-grid">
            <label><span>Catégorie</span><select value={form.selectedPersonCategory} onChange={e=>updateForm("selectedPersonCategory",e.target.value as PersonCategory)}>{["Élève","Enseignant","Employé"].map(v=><option key={v}>{v}</option>)}</select></label>
            <label><span>Rôle</span><select value={form.selectedPersonRole} onChange={e=>updateForm("selectedPersonRole",e.target.value as PersonRole)}>{["Personne concernée","Témoin","Déclarant","Intervenant"].map(v=><option key={v}>{v}</option>)}</select></label>
            <label className="ai-wide"><span>Personne existante</span><select value={form.selectedPersonId} onChange={e=>updateForm("selectedPersonId",e.target.value)}><option value="">Sélectionner…</option>{(form.selectedPersonCategory==="Élève"?students.map(s=>({id:s.id,name:personName(s)+" · "+s.className})):staff.filter(s=>s.category===form.selectedPersonCategory).map(s=>({id:s.id,name:s.name}))).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            <div className="ai-wide"><button className="ai-btn ai-btn--secondary" type="button" onClick={()=>{const id=form.selectedPersonId;if(!id){setError("Sélectionnez une personne.");return;}const student=students.find(s=>s.id===id);const member=staff.find(s=>s.id===id);const p=student?{id,name:personName(student),category:"Élève" as const,role:form.selectedPersonRole,reference:student.code,className:student.className}:member?{id,name:member.name,category:member.category,role:form.selectedPersonRole,reference:id}:null;if(!p){setError("Cette personne n'est pas accessible.");return;}if(formPeople.some(x=>x.id===p.id)){setError("Cette personne est déjà associée à l'incident.");return;}setFormPeople(old=>[...old,p]);updateForm("selectedPersonId","");setError("");}}><UserPlus size={14}/>Ajouter la personne</button></div>
          </div>
          <div className="ai-person-chips">{formPeople.length?formPeople.map(p=><span key={p.id}><strong>{p.name}</strong><small>{p.category} · {p.role}</small><button onClick={()=>setFormPeople(old=>old.filter(x=>x.id!==p.id))}><X size={12}/></button></span>):<p>Aucune personne ajoutée (facultatif selon la nature de l’incident).</p>}</div></div>
          <div className="ai-form-section"><h3>Mesures immédiates rapportées</h3><label className="ai-full"><span>Actions effectivement réalisées</span><textarea rows={3} value={form.immediateActions} onChange={e=>updateForm("immediateActions",e.target.value)} placeholder="Indiquez uniquement les actions qui ont réellement été effectuées…"/></label></div>
          <div className="ai-form-section"><h3>Suivi</h3><label className="ai-full"><span>Responsable du suivi</span><select value={form.responsibleId} onChange={e=>updateForm("responsibleId",e.target.value)}><option value="">Non affecté</option>{staff.map(s=><option key={s.id} value={s.id}>{s.name} · {s.category}</option>)}</select></label></div>
          <div className="ai-inline-note"><Info size={14}/>Les champs médicaux détaillés, pièces jointes et communications parentales ne sont pas disponibles : aucune autorisation dédiée ni aucun service sécurisé correspondant n'a été identifié.</div>
        </div>
        <footer><button className="ai-btn ai-btn--secondary" onClick={()=>setShowForm(false)}>Annuler</button><button className="ai-btn ai-btn--primary" disabled={saving} onClick={createIncident}>{saving?"Enregistrement…":"Enregistrer localement"}</button></footer>
      </section></div>}

      {selected&&<div className="ai-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedId(null);}}><aside className="ai-drawer">
        <header><div><span className="ai-eyebrow">DOSSIER D'INCIDENT</span><h2>{selected.id}</h2><span className={"ai-status "+statusClass(selected.status)}>{selected.status}</span></div><button className="ai-icon-btn" onClick={()=>setSelectedId(null)}><X size={18}/></button></header>
        <nav className="ai-detail-tabs">{["Résumé","Suivi et actions","Historique"].map(t=><button className={detailTab===t?"active":""} key={t} onClick={()=>setDetailTab(t)}>{t}</button>)}</nav>
        <div className="ai-drawer-body">
          {detailTab==="Résumé"&&<><div className="ai-detail-facts"><div><small>Date et heure</small><strong>{formatDate(selected.occurredAt,true)}</strong></div><div><small>Type</small><strong>{selected.category}</strong></div><div><small>Lieu</small><strong>{selected.location}</strong></div><div><small>Responsable</small><strong>{responsibleLabel(selected.responsibleName)}</strong></div></div>
            <section><h3>Description des faits</h3><p>{selected.description}</p>{selected.circumstances&&<><h3>Circonstances rapportées</h3><p>{selected.circumstances}</p></>}</section>
            <section><h3>Personnes impliquées ({selected.people.length})</h3>{selected.people.length===0?<p>Aucune personne associée à ce dossier.</p>:selected.people.map(p=><div className="ai-detail-person" key={p.id}><Users size={15}/><div><strong>{personLabel(p)}</strong><span>{p.category} · {p.role}{personLabel(p)!=="Identité restreinte"&&p.className?" · "+p.className:""}</span><small>{personLabel(p)==="Identité restreinte"?"Référence masquée":p.reference??"Référence non disponible"}</small></div></div>)}</section>
            <section><h3>Mesures immédiates rapportées</h3><p>{selected.immediateActions||"Aucune mesure renseignée."}</p></section>
            <section className="ai-muted-section"><h3>Documents joints</h3><p>Le service de stockage documentaire n'est pas connecté.</p></section>
            <section className="ai-muted-section"><h3>Communications</h3><p>Aucune communication parentale ou notification n'est enregistrée par cette démonstration.</p></section>
          </>}
          {detailTab==="Suivi et actions"&&<><section><h3>Responsable du suivi</h3><div className="ai-inline-control"><select disabled={selected.status==="Clôturé"} value={newResponsible||selected.responsibleId} onChange={e=>setNewResponsible(e.target.value)}><option value="">Non affecté</option>{staff.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><button className="ai-btn ai-btn--secondary" onClick={assignResponsible} disabled={selected.status==="Clôturé"||!newResponsible||newResponsible===selected.responsibleId}>Affecter</button></div></section>
            <section><h3>Statut du dossier</h3><div className="ai-inline-control"><select disabled={selected.status==="Clôturé"} value={newStatus} onChange={e=>setNewStatus(e.target.value as IncidentStatus)}>{STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}</select><button className="ai-btn ai-btn--secondary" onClick={updateStatus} disabled={selected.status==="Clôturé"||newStatus===selected.status}>Mettre à jour</button></div>{selected.status!=="Clôturé"&&<button className="ai-close-btn" onClick={closeIncident}>Clôturer le dossier</button>}</section>
            <section><h3>Ajouter une note de suivi</h3><textarea disabled={selected.status==="Clôturé"} rows={4} value={followUpNote} onChange={e=>setFollowUpNote(e.target.value)} placeholder="Consignez une action ou un élément de suivi…"/><button className="ai-btn ai-btn--primary" onClick={addFollowUp} disabled={selected.status==="Clôturé"||!followUpNote.trim()}>Ajouter la note</button></section>
            <section><h3>Notes enregistrées ({selected.followUps.length})</h3>{selected.followUps.length?selected.followUps.slice().reverse().map(n=><article className="ai-follow-card" key={n.id}><strong>{responsibleLabel(n.actor)}</strong><small>{formatDate(n.createdAt,true)}</small><p>{n.note}</p></article>):<p>Aucune note de suivi.</p>}</section>
          </>}
          {detailTab==="Historique"&&<section><h3>Chronologie locale</h3><div className="ai-timeline">{selected.history.slice().sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).map(e=><article key={e.id}><i/><div><strong>{e.label}</strong><p>{e.detail}</p><small>{responsibleLabel(e.actor)} · {formatDate(e.createdAt,true)}</small></div></article>)}</div><div className="ai-inline-note"><Info size={14}/>Historique de démonstration uniquement : aucun journal d'audit centralisé n'est disponible.</div></section>}
        </div>
        <footer><button className="ai-btn ai-btn--secondary" onClick={()=>setSelectedId(null)}>Fermer</button></footer>
      </aside></div>}
    </main>
  );
}
