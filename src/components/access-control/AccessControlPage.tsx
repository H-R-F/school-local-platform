import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle, ArrowDownUp, Check, ChevronLeft, ChevronRight, Download,
  Eye, Info, LockKeyhole, Plus, RefreshCw, Search, ShieldAlert, ShieldCheck,
  Users, X
} from "lucide-react";
import { employeesRepository, type EmployeeRecord, type EmployeesData } from "../../services/employees";
import { roleDefaultPermissions } from "../../data/role-permissions";
import type { AuthenticatedSidebarUser, StaffRole } from "../../types/navigation";
import "./AccessControlPage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type AccountStatus = "Actif" | "Désactivé" | "Invitation en attente" | "Verrouillé";
type Account = {
  id: string; employeeId: string; username: string; email: string; role: StaffRole;
  department: string; status: AccountStatus; createdAt: string; lastLogin: string | null;
};
type AccessEvent = { id: string; accountId: string; type: string; detail: string; at: string; result: string };
type Session = { id: string; accountId: string; startedAt: string; lastActivity: string; device: string; status: string };
type DetailTab = "account" | "permissions" | "history" | "sessions";
const ACCOUNT_KEY = "school-access-control-demo-accounts-v1";
const HISTORY_KEY = "school-access-control-demo-history-v1";
const PAGE_SIZE = 8;
const ROLES: StaffRole[] = ["director", "administrative", "pedagogical", "finance"];
const roleShort: Record<StaffRole,string> = {
  director: "Directeur", administrative: "Responsable administratif",
  pedagogical: "Responsable pédagogique", finance: "Responsable financier et logistique"
};
const dateLabel = (value: string | null) => value
  ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "Jamais";
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
const safeRead = <T,>(key: string): T | null => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
};
const safeWrite = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
};
function seedAccounts(employees: EmployeeRecord[]): Account[] {
  const roles: StaffRole[] = ["administrative", "finance", "administrative", "administrative", "administrative"];
  return employees.slice(0, 5).map((employee, index) => ({
    id: "DEMO-ACC-" + employee.id,
    employeeId: employee.id,
    username: employee.employeeCode.toLowerCase(),
    email: employee.email || "",
    role: roles[index] || "administrative",
    department: employee.departmentName,
    status: index === 2 ? "Verrouillé" : index === 1 ? "Invitation en attente" : index === 4 ? "Désactivé" : "Actif",
    createdAt: new Date(Date.UTC(2024, index + 1, 5, 9, 0)).toISOString(),
    lastLogin: index === 0 ? "2026-11-07T15:10:00.000Z" : index === 2 ? "2026-10-20T09:30:00.000Z" : index === 3 ? "2026-11-05T08:45:00.000Z" : null
  }));
}
function seedEvents(accounts: Account[]): AccessEvent[] {
  const first = accounts[0], locked = accounts.find(a => a.status === "Verrouillé");
  return [
    ...(first ? [{ id: "EV-001", accountId: first.id, type: "Connexion réussie", detail: "Accès à la plateforme", at: "2026-11-07T15:10:00.000Z", result: "Réussi" }] : []),
    ...(locked ? [{ id: "EV-002", accountId: locked.id, type: "Compte verrouillé", detail: "État de démonstration — motif non connecté à un service d’authentification", at: "2026-11-06T10:20:00.000Z", result: "Simulé" }] : []),
    ...(accounts[1] ? [{ id: "EV-003", accountId: accounts[1].id, type: "Invitation en attente", detail: "Aucune invitation réelle n’a été envoyée", at: "2026-11-04T11:00:00.000Z", result: "Simulé" }] : [])
  ];
}
const demoSessions = (accounts: Account[]): Session[] => accounts.filter(a => a.status === "Actif" && a.lastLogin).slice(0, 2).map((a, i) => ({
  id: "SESSION-DEMO-" + (i + 1), accountId: a.id, startedAt: a.lastLogin || "",
  lastActivity: a.lastLogin || "", device: i === 0 ? "Poste administratif · navigateur" : "Poste de travail · navigateur",
  status: "Exemple local"
}));
function Status({ value }: { value: AccountStatus }) {
  const cls = value === "Actif" ? "active" : value === "Verrouillé" ? "locked" : value === "Invitation en attente" ? "pending" : "disabled";
  return <span className={"ac-status " + cls}><i />{value}</span>;
}
export function AccessControlPage({ user, onNavigate }: Props) {
  const authorized = user.permissions.includes("access.manage") && user.role === "director";
  const [data, setData] = useState<EmployeesData | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [events, setEvents] = useState<AccessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loginFilter, setLoginFilter] = useState("all");
  const [sort, setSort] = useState<"name" | "login" | "role">("name");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Account | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("account");
  const [createOpen, setCreateOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [confirm, setConfirm] = useState<"activate" | "disable" | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("administrative");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setLoading(true); setError("");
    try {
      const result = await employeesRepository.list();
      setData(result);
      const saved = safeRead<Account[]>(ACCOUNT_KEY);
      const nextAccounts = saved ?? seedAccounts(result.employees);
      setAccounts(nextAccounts);
      const savedEvents = safeRead<AccessEvent[]>(HISTORY_KEY);
      setEvents(savedEvents ?? seedEvents(nextAccounts));
      if (!saved) safeWrite(ACCOUNT_KEY, nextAccounts);
      if (!savedEvents) safeWrite(HISTORY_KEY, seedEvents(nextAccounts));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les données du répertoire.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);
  useEffect(() => { if (accounts.length) safeWrite(ACCOUNT_KEY, accounts); }, [accounts]);
  useEffect(() => { if (events.length) safeWrite(HISTORY_KEY, events); }, [events]);

  const employees = data?.employees ?? [];
  const employeeById = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);
  const filtered = useMemo(() => accounts.filter(account => {
    const employee = employeeById.get(account.employeeId);
    const text = [employee?.fullName || "", account.username, account.email, employee?.employeeCode || ""].join(" ").toLocaleLowerCase("fr");
    const matchesQuery = !query.trim() || text.includes(query.trim().toLocaleLowerCase("fr"));
    const matchesRole = roleFilter === "all" || account.role === roleFilter;
    const matchesDepartment = departmentFilter === "all" || account.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || account.status === statusFilter;
    const age = account.lastLogin ? Date.now() - new Date(account.lastLogin).getTime() : Infinity;
    const matchesLogin = loginFilter === "all" || (loginFilter === "never" && !account.lastLogin) || (loginFilter === "30" && age <= 30 * 86400000) || (loginFilter === "older" && age > 30 * 86400000);
    return matchesQuery && matchesRole && matchesDepartment && matchesStatus && matchesLogin;
  }).sort((a, b) => {
    if (sort === "role") return roleShort[a.role].localeCompare(roleShort[b.role], "fr");
    if (sort === "login") return (b.lastLogin || "").localeCompare(a.lastLogin || "");
    return (employeeById.get(a.employeeId)?.fullName || "").localeCompare(employeeById.get(b.employeeId)?.fullName || "", "fr");
  }), [accounts, employeeById, query, roleFilter, departmentFilter, statusFilter, loginFilter, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = accounts.filter(a => a.status === "Actif").length;
  const disabledCount = accounts.filter(a => a.status === "Désactivé").length;
  const reviewCount = accounts.filter(a => a.status === "Verrouillé").length;
  const selectedEmployee = selected ? employeeById.get(selected.employeeId) : null;
  const selectedEvents = selected ? events.filter(e => e.accountId === selected.id).sort((a,b)=>b.at.localeCompare(a.at)) : [];
  const sessions = selected ? demoSessions(accounts).filter(s => s.accountId === selected.id) : [];

  function persistAccounts(next: Account[]) {
    setAccounts(next);
    if (!safeWrite(ACCOUNT_KEY, next)) setError("Le stockage local est indisponible. Les changements ne sont pas conservés.");
  }
  function addEvent(accountId: string, type: string, detail: string) {
    const next = [{ id: "EV-" + Date.now(), accountId, type, detail, at: new Date().toISOString(), result: "Simulation locale" }, ...events];
    setEvents(next); safeWrite(HISTORY_KEY, next);
  }
  function exportCsv() {
    const rows = [["Utilisateur", "Identifiant", "Matricule", "Rôle", "Département", "Statut", "Dernière connexion"], ...filtered.map(a => {
      const e = employeeById.get(a.employeeId);
      return [e?.fullName || "", a.username, e?.employeeCode || "", roleShort[a.role], a.department, a.status, a.lastLogin || ""];
    })];
    const blob = new Blob(["\uFEFF" + rows.map(row => row.map(v => '"' + String(v).replaceAll('"', '""') + '"').join(";")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = "comptes-acces-demonstration.csv"; link.click(); URL.revokeObjectURL(url);
    setNotice("Export local généré. Il contient uniquement les données de démonstration affichées.");
  }
  function openCreate() {
    const available = employees.find(e => !accounts.some(a => a.employeeId === e.id));
    setEmployeeId(available?.id || "");
    setUsername(available?.employeeCode.toLowerCase() || "");
    setEmail(available?.email || "");
    setNewRole("administrative"); setCreateOpen(true);
  }
  function createAccount(event: FormEvent) {
    event.preventDefault(); setError("");
    const employee = employeeById.get(employeeId);
    if (!employee) { setError("Sélectionnez un employé existant."); return; }
    if (accounts.some(a => a.employeeId === employeeId)) { setError("Un compte de démonstration est déjà associé à cet employé."); return; }
    if (!username.trim()) { setError("L’identifiant est obligatoire."); return; }
    if (accounts.some(a => a.username.toLowerCase() === username.trim().toLowerCase())) { setError("Cet identifiant est déjà utilisé."); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("L’adresse e-mail n’est pas valide."); return; }
    setSubmitting(true);
    const account: Account = {
      id: "DEMO-ACC-" + Date.now(), employeeId, username: username.trim(), email: email.trim(),
      role: newRole, department: employee.departmentName, status: "Invitation en attente",
      createdAt: new Date().toISOString(), lastLogin: null
    };
    persistAccounts([account, ...accounts]);
    addEvent(account.id, "Compte de démonstration ajouté", "Aucun compte réel n’a été créé et aucune invitation n’a été envoyée.");
    setSubmitting(false); setCreateOpen(false);
    setNotice("Compte ajouté à la démonstration locale uniquement. Aucun accès réel n’a été créé et aucune invitation n’a été envoyée.");
  }
  function saveRole() {
    if (!selected || selected.role === "director") return;
    if (newRole === "director") { setError("L’attribution du rôle Directeur est protégée et ne peut pas être effectuée depuis cette page."); return; }
    const next = accounts.map(a => a.id === selected.id ? { ...a, role: newRole } : a);
    persistAccounts(next); addEvent(selected.id, "Rôle modifié (démo)", "Rôle local : " + roleShort[newRole]);
    setSelected({ ...selected, role: newRole }); setRoleOpen(false);
    setNotice("Rôle modifié dans la démonstration locale. Les permissions réelles n’ont pas changé.");
  }
  function applyStatus() {
    if (!selected || !confirm) return;
    if (selected.id === "demo-director" || selected.role === "director") {
      setError("Le compte Directeur est protégé contre la désactivation depuis cette interface."); setConfirm(null); return;
    }
    const nextStatus: AccountStatus = confirm === "activate" ? "Actif" : "Désactivé";
    persistAccounts(accounts.map(a => a.id === selected.id ? { ...a, status: nextStatus } : a));
    addEvent(selected.id, nextStatus === "Actif" ? "Activation simulée" : "Désactivation simulée", "Modification locale de démonstration uniquement.");
    setSelected({ ...selected, status: nextStatus }); setConfirm(null);
    setNotice("Statut modifié dans la démonstration locale. L’authentification réelle n’a pas été modifiée.");
  }
  function clearFilters() { setQuery(""); setRoleFilter("all"); setDepartmentFilter("all"); setStatusFilter("all"); setLoginFilter("all"); setPage(1); }

  if (!authorized) return <main className="ac-page"><section className="ac-denied"><ShieldAlert size={28}/><h1>Accès non autorisé</h1><p>La consultation du contrôle des accès est réservée aux utilisateurs disposant de l’autorisation correspondante.</p></section></main>;

  return <main className="ac-page">
    <header className="ac-header">
      <div><div className="ac-breadcrumb">Administration <span>/</span> <b>Contrôle des accès</b></div><h1>Contrôle des accès</h1><p>Gérez les comptes utilisateurs, les rôles et les autorisations d'accès à la plateforme.</p></div>
      <div className="ac-header-actions"><button type="button" onClick={exportCsv} disabled={!accounts.length}><Download size={15}/>Exporter la liste</button><button type="button" onClick={() => void refresh()}><RefreshCw size={15}/>Actualiser</button><button type="button" className="primary" onClick={openCreate} disabled={!employees.length || employees.every(e => accounts.some(a => a.employeeId === e.id))}><Plus size={15}/>Créer un compte</button></div>
    </header>
    <div className="ac-demo-banner"><Info size={18}/><div><strong>Mode démonstration — données et interactions simulées</strong><p>Les comptes sont associés aux identités du répertoire « Personnes → Employés ». Les changements de rôle et de statut, l’historique et les sessions sont stockés localement dans ce navigateur. Ils ne modifient pas l’authentification réelle. Aucun service de création sécurisée de compte, d’invitation, de réinitialisation de mot de passe ou de révocation de session n’est connecté.</p></div></div>
    {error && <div className="ac-message error"><AlertCircle size={15}/>{error}<button type="button" onClick={()=>setError("")}>Fermer</button></div>}
    {notice && <div className="ac-message success"><Check size={15}/>{notice}<button type="button" onClick={()=>setNotice("")}><X size={14}/></button></div>}
    <section className="ac-kpis">
      <article><span className="icon"><Users size={18}/></span><div><small>Comptes utilisateurs</small><strong>{loading ? "—" : accounts.length}</strong><em>Comptes distincts · démo</em></div></article>
      <article><span className="icon green"><ShieldCheck size={18}/></span><div><small>Comptes actifs</small><strong>{loading ? "—" : activeCount}</strong><em>Statut simulé localement</em></div></article>
      <article><span className="icon grey"><LockKeyhole size={18}/></span><div><small>Comptes désactivés</small><strong>{loading ? "—" : disabledCount}</strong><em>Statut simulé localement</em></div></article>
      <article><span className="icon amber"><ShieldAlert size={18}/></span><div><small>Accès à vérifier</small><strong>{loading ? "—" : reviewCount}</strong><em>Comptes verrouillés · démo</em></div></article>
    </section>
    <section className="ac-panel">
      <div className="ac-panel-head"><div><h2>Comptes utilisateurs</h2><p>Répertoire des comptes associés aux employés existants.</p></div><span>{filtered.length} résultat(s)</span></div>
      <div className="ac-filters">
        <label className="ac-search"><Search size={15}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Rechercher un nom, identifiant ou matricule…"/></label>
        <select aria-label="Filtrer par rôle" value={roleFilter} onChange={e=>{setRoleFilter(e.target.value);setPage(1);}}><option value="all">Tous les rôles</option>{ROLES.map(r=><option key={r} value={r}>{roleShort[r]}</option>)}</select>
        <select aria-label="Filtrer par département" value={departmentFilter} onChange={e=>{setDepartmentFilter(e.target.value);setPage(1);}}><option value="all">Tous les départements</option>{Array.from(new Set(accounts.map(a=>a.department))).filter(Boolean).map(d=><option key={d} value={d}>{d}</option>)}</select>
        <select aria-label="Filtrer par statut" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}><option value="all">Tous les statuts</option>{(["Actif","Désactivé","Invitation en attente","Verrouillé"] as AccountStatus[]).map(s=><option key={s}>{s}</option>)}</select>
        <select aria-label="Filtrer par dernière connexion" value={loginFilter} onChange={e=>{setLoginFilter(e.target.value);setPage(1);}}><option value="all">Toutes les connexions</option><option value="30">30 derniers jours</option><option value="older">Plus de 30 jours</option><option value="never">Jamais connecté</option></select>
        <button type="button" className="ac-clear" onClick={clearFilters}>Réinitialiser</button>
      </div>
      <div className="ac-table-wrap"><table className="ac-table"><thead><tr><th>Utilisateur</th><th>Identifiant / Matricule</th><th>Rôle attribué</th><th>Département</th><th><button type="button" onClick={()=>setSort("login")}>Dernière connexion <ArrowDownUp size={12}/></button></th><th>Statut du compte</th><th>Actions</th></tr></thead>
        <tbody>{visible.map(account=>{const employee=employeeById.get(account.employeeId);return <tr key={account.id} onClick={()=>{setSelected(account);setDetailTab("account");}}><td><div className="ac-person"><span>{initials(employee?.fullName || "Compte")}</span><div><strong>{employee?.fullName || "Employé indisponible"}</strong><small>{employee?.jobTitle || "Identité non disponible"}</small></div></div></td><td><strong>{account.username}</strong><small className="ac-subcell">{employee?.employeeCode || "—"}</small></td><td>{roleShort[account.role]}</td><td>{account.department || "—"}</td><td>{dateLabel(account.lastLogin)}</td><td><Status value={account.status}/></td><td><button type="button" className="ac-view" onClick={e=>{e.stopPropagation();setSelected(account);setDetailTab("account");}}><Eye size={14}/>Consulter</button></td></tr>;})}</tbody>
      </table>{loading?<div className="ac-empty">Chargement des comptes…</div>:filtered.length===0?<div className="ac-empty"><Search size={22}/><strong>Aucun compte utilisateur trouvé.</strong><span>Aucun compte ne correspond à vos critères.</span><button type="button" onClick={clearFilters}>Effacer les filtres</button></div>:null}</div>
      <footer className="ac-pagination"><span>Affichage de {filtered.length ? (page-1)*PAGE_SIZE+1 : 0} à {Math.min(page*PAGE_SIZE,filtered.length)} sur {filtered.length} compte(s)</span><div><button type="button" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}><ChevronLeft size={15}/>Précédent</button><span>Page {page} / {pages}</span><button type="button" disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>Suivant<ChevronRight size={15}/></button></div></footer>
    </section>
    <section className="ac-bottom-grid">
      <article className="ac-panel ac-security"><div className="ac-panel-head"><div><h2>Vue sécurité</h2><p>Indicateurs disponibles dans les données de démonstration.</p></div><LockKeyhole size={17}/></div><div className="ac-security-grid"><div><span>Comptes verrouillés</span><strong>{reviewCount}</strong></div><div><span>Invitations en attente</span><strong>{accounts.filter(a=>a.status==="Invitation en attente").length}</strong></div><div><span>Historique simulé</span><strong>{events.length}</strong></div><div><span>Sessions d’exemple</span><strong>{demoSessions(accounts).length}</strong></div></div><p className="ac-muted-note">Les tentatives échouées et les sessions réelles ne sont pas exposées par un service d’authentification dans cette version.</p></article>
      <article className="ac-panel ac-role-link"><div className="ac-panel-head"><div><h2>Rôles et permissions</h2><p>Référentiel existant du projet.</p></div><ShieldCheck size={18}/></div><p>Les permissions affichées dans le détail sont héritées des quatre rôles système définis dans la configuration actuelle.</p><button type="button" onClick={()=>onNavigate("/roles-permissions")}>Gérer les rôles et permissions <ChevronRight size={15}/></button><small>Le rôle Directeur et l’autorisation exclusive « archive.view » restent protégés.</small></article>
    </section>

    {selected && <div className="ac-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}><aside className="ac-drawer" role="dialog" aria-modal="true" aria-label="Détails du compte"><header><div><span className="ac-drawer-eyebrow">FICHE DU COMPTE</span><h2>{employeeById.get(selected.employeeId)?.fullName || "Compte utilisateur"}</h2><p>{selected.username} · {roleShort[selected.role]}</p></div><button type="button" onClick={()=>setSelected(null)} aria-label="Fermer"><X size={18}/></button></header>
      <div className="ac-drawer-tabs"><button className={detailTab==="account"?"active":""} onClick={()=>setDetailTab("account")}>Compte</button><button className={detailTab==="permissions"?"active":""} onClick={()=>setDetailTab("permissions")}>Rôle & permissions</button><button className={detailTab==="history"?"active":""} onClick={()=>setDetailTab("history")}>Historique</button><button className={detailTab==="sessions"?"active":""} onClick={()=>setDetailTab("sessions")}>Sessions</button></div>
      <div className="ac-drawer-body">
        {detailTab==="account" && <><div className="ac-detail-card"><div className="ac-detail-avatar">{initials(employeeById.get(selected.employeeId)?.fullName || "Compte")}</div><div><strong>{employeeById.get(selected.employeeId)?.fullName || "Identité non disponible"}</strong><small>{employeeById.get(selected.employeeId)?.jobTitle || "—"}</small><Status value={selected.status}/></div></div><h3>Informations du compte</h3><dl className="ac-dl"><dt>Identifiant</dt><dd>{selected.username}</dd><dt>Adresse e-mail</dt><dd>{selected.email || "Non renseignée"}</dd><dt>Matricule</dt><dd>{employeeById.get(selected.employeeId)?.employeeCode || "—"}</dd><dt>Employé associé</dt><dd>{employeeById.get(selected.employeeId)?.fullName || "—"}</dd><dt>Département</dt><dd>{selected.department || "—"}</dd><dt>Rôle attribué</dt><dd>{roleShort[selected.role]}</dd><dt>Création du compte</dt><dd>{dateLabel(selected.createdAt)}</dd><dt>Dernière connexion</dt><dd>{dateLabel(selected.lastLogin)}</dd></dl><div className="ac-demo-callout"><Info size={15}/>Ces informations sont locales et ne proviennent pas d’un fournisseur d’identité.</div><h3>Actions de démonstration</h3><div className="ac-action-list"><button type="button" onClick={()=>{setNewRole(selected.role);setRoleOpen(true);}} disabled={selected.role==="director"}>Modifier le rôle</button>{selected.status==="Actif"?<button type="button" className="danger" onClick={()=>setConfirm("disable")} disabled={selected.role==="director"}>Désactiver le compte</button>:<button type="button" onClick={()=>setConfirm("activate")}>Activer le compte</button>}<button type="button" disabled title="Aucun service sécurisé de réinitialisation n’est connecté.">Réinitialiser l’accès · indisponible</button></div></>}
        {detailTab==="permissions" && <><h3>Rôle attribué</h3><div className="ac-role-card"><strong>{roleShort[selected.role]}</strong><span>Permissions héritées du rôle système</span></div><p className="ac-permission-note">Aucune permission individuelle supplémentaire ou restriction explicite n’est prise en charge dans le modèle actuel.</p><h3>Permissions héritées</h3><div className="ac-permission-list">{roleDefaultPermissions[selected.role].map(permission=><div key={permission}><Check size={14}/><code>{permission}</code>{permission==="archive.view"&&<span>Protégée · Directeur uniquement</span>}</div>)}</div><button type="button" className="ac-link-button" onClick={()=>onNavigate("/roles-permissions")}>Gérer les rôles et permissions <ChevronRight size={14}/></button></>}
        {detailTab==="history" && <><h3>Historique des accès</h3><div className="ac-demo-callout"><Info size={15}/>Historique fictif de démonstration. Aucun journal d’authentification réel n’est connecté.</div>{selectedEvents.length===0?<div className="ac-empty">Aucun historique d'accès disponible.</div>:<div className="ac-timeline">{selectedEvents.map(event=><article key={event.id}><i/><div><strong>{event.type}</strong><p>{event.detail}</p><small>{dateLabel(event.at)} · {event.result}</small></div></article>)}</div>}</>}
        {detailTab==="sessions" && <><h3>Sessions</h3><div className="ac-demo-callout"><Info size={15}/>Les sessions ci-dessous sont des exemples locaux et ne représentent pas des connexions actives réelles.</div>{sessions.length===0?<div className="ac-empty">Les informations de session ne sont pas disponibles.</div>:sessions.map(session=><article className="ac-session" key={session.id}><div><strong>{session.device}</strong><small>Début : {dateLabel(session.startedAt)}</small><small>Dernière activité : {dateLabel(session.lastActivity)}</small></div><span>{session.status}</span></article>)}<button type="button" className="ac-disabled-action" disabled title="La révocation nécessite un service de session.">Révoquer une session · indisponible</button></>}
      </div>
    </aside></div>}
    {createOpen && <div className="ac-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setCreateOpen(false);}}><section className="ac-modal" role="dialog" aria-modal="true" aria-labelledby="ac-create-title"><header><div><span className="ac-drawer-eyebrow">DÉMONSTRATION LOCALE</span><h2 id="ac-create-title">Créer un compte</h2><p>Associez un compte fictif à un employé existant.</p></div><button type="button" onClick={()=>setCreateOpen(false)}><X size={18}/></button></header><form onSubmit={createAccount}><label>Employé associé<select required value={employeeId} onChange={e=>{setEmployeeId(e.target.value);const employee=employeeById.get(e.target.value);setUsername(employee?.employeeCode.toLowerCase() || "");setEmail(employee?.email || "");}}><option value="">Sélectionner un employé</option>{employees.filter(e=>!accounts.some(a=>a.employeeId===e.id)).map(e=><option key={e.id} value={e.id}>{e.fullName} · {e.employeeCode}</option>)}</select></label><label>Nom d'utilisateur<input required value={username} onChange={e=>setUsername(e.target.value)} autoComplete="off"/></label><label>Adresse e-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nom@ecole.ma"/></label><label>Rôle<select value={newRole} onChange={e=>setNewRole(e.target.value as StaffRole)}>{ROLES.filter(r=>r!=="director").map(r=><option key={r} value={r}>{roleShort[r]}</option>)}</select></label><div className="ac-modal-warning"><Info size={15}/>La création sécurisée n’est pas disponible. Ce formulaire ajoute uniquement une entrée fictive au stockage local ; aucun accès ni invitation ne sera créé.</div><footer><button type="button" onClick={()=>setCreateOpen(false)}>Annuler</button><button type="submit" className="primary" disabled={submitting}>{submitting?"Ajout…":"Ajouter à la démo"}</button></footer></form></section></div>}
    {roleOpen && selected && <div className="ac-overlay"><section className="ac-modal" role="dialog" aria-modal="true" aria-labelledby="ac-role-title"><header><div><span className="ac-drawer-eyebrow">MODIFICATION SIMULÉE</span><h2 id="ac-role-title">Modifier le rôle</h2><p>{employeeById.get(selected.employeeId)?.fullName || selected.username}</p></div><button type="button" onClick={()=>setRoleOpen(false)}><X size={18}/></button></header><label>Nouveau rôle<select value={newRole} onChange={e=>setNewRole(e.target.value as StaffRole)}>{ROLES.filter(r=>r!=="director").map(r=><option key={r} value={r}>{roleShort[r]}</option>)}</select></label><div className="ac-modal-warning"><ShieldAlert size={15}/>Le rôle Directeur et ses privilèges exclusifs, notamment archive.view, ne peuvent pas être attribués ici. Le changement reste local à la démonstration.</div><footer><button type="button" onClick={()=>setRoleOpen(false)}>Annuler</button><button type="button" className="primary" onClick={saveRole}>Confirmer la simulation</button></footer></section></div>}
    {confirm && selected && <div className="ac-overlay"><section className="ac-modal ac-confirm" role="dialog" aria-modal="true" aria-labelledby="ac-confirm-title"><div className="ac-confirm-icon"><AlertCircle size={22}/></div><h2 id="ac-confirm-title">{confirm==="disable"?"Désactiver ce compte ?":"Activer ce compte ?"}</h2><p>{employeeById.get(selected.employeeId)?.fullName || selected.username} — {confirm==="disable"?"La désactivation simulée empêchera cet utilisateur d’être considéré comme actif dans cette démonstration. Son historique local sera conservé.":"L’activation simulée modifiera uniquement le statut local de ce compte."}</p><div className="ac-modal-warning"><Info size={15}/>Aucun accès réel à la plateforme ne sera modifié.</div><footer><button type="button" onClick={()=>setConfirm(null)}>Annuler</button><button type="button" className="primary" onClick={applyStatus}>Confirmer</button></footer></section></div>}
  </main>;
}
