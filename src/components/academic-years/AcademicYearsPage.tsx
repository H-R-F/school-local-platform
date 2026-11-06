import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, CalendarDays, Check,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Eye, MoreHorizontal,
  Pencil, Plus, Search, ShieldCheck, X,
} from "lucide-react";
import {
  academicYearRepository,
  type AcademicYear,
  type AcademicYearInput,
  type AcademicYearStatus,
} from "../../services/academic-years";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import { schoolBranding } from "../../config/school";

interface Props {
  user: AuthenticatedSidebarUser;
  onNavigate: (route: string) => void;
}
type StatusFilter = "Tous les statuts" | AcademicYearStatus;
type ModalState = { type: "create" } | { type: "edit"; year: AcademicYear } | { type: "details"; year: AcademicYear } | null;
type PendingStatus = { year: AcademicYear; action: "activate" | "complete" } | null;

const statusOrder: AcademicYearStatus[] = ["Brouillon", "Active", "Terminée", "Archivée"];
const formatDate = (value: string) => new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value + "T12:00:00"));
const formatLongDate = (value: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value + "T12:00:00"));

function StatusBadge({ status }: { status: AcademicYearStatus }) {
  const className = status === "Active" ? "ay-status--active" : status === "Terminée" ? "ay-status--completed" : status === "Archivée" ? "ay-status--archived" : "ay-status--draft";
  return <span className={`ay-status ${className}`}><i/>{status}</span>;
}

function AcademicYearForm({ initial, saving, error, onCancel, onSubmit }: {
  initial?: AcademicYear;
  saving: boolean;
  error: string;
  onCancel: () => void;
  onSubmit: (input: AcademicYearInput) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [validation, setValidation] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !startDate || !endDate) {
      setValidation("Veuillez renseigner tous les champs obligatoires.");
      return;
    }
    if (startDate >= endDate) {
      setValidation("La date de début doit être antérieure à la date de fin.");
      return;
    }
    setValidation("");
    onSubmit({ name: name.trim(), startDate, endDate });
  }
  return <form className="ay-form" onSubmit={submit}>
    <div className="ay-form-intro"><span className="ay-form-icon"><CalendarDays size={18}/></span><p>{initial ? "Modifiez les informations de cette année scolaire. Son statut actuel sera conservé." : "Créez une nouvelle période scolaire. Elle sera enregistrée en brouillon jusqu’à son activation."}</p></div>
    <label>Nom de l’année scolaire <em>*</em><input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. : 2027–2028" maxLength={40}/></label>
    <div className="ay-form-dates">
      <label>Date de début <em>*</em><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/></label>
      <label>Date de fin <em>*</em><input type="date" value={endDate} min={startDate || undefined} onChange={e=>setEndDate(e.target.value)}/></label>
    </div>
    <div className="ay-form-status"><span>Statut initial</span><StatusBadge status={initial?.status ?? "Brouillon"}/><small>Le statut ne peut pas être modifié depuis ce formulaire.</small></div>
    {(validation || error) && <div className="ay-form-error" role="alert"><AlertCircle size={15}/>{validation || error}</div>}
    <div className="ay-modal-actions"><button type="button" className="ay-button ay-button--secondary" onClick={onCancel} disabled={saving}>Annuler</button><button type="submit" className="ay-button ay-button--primary" disabled={saving}>{saving ? "Enregistrement…" : initial ? "Enregistrer les modifications" : "Créer l’année scolaire"}</button></div>
  </form>;
}

function YearDetails({ year, onEdit, canEdit, onClose }: { year: AcademicYear; onEdit: () => void; canEdit: boolean; onClose: () => void }) {
  return <div className="ay-details">
    <div className="ay-detail-highlight"><span className="ay-detail-icon"><CalendarDays size={20}/></span><div><small>ANNÉE SCOLAIRE</small><h3>{year.name}</h3><StatusBadge status={year.status}/></div></div>
    <div className="ay-detail-grid"><div><span>Date de début</span><strong>{formatLongDate(year.startDate)}</strong></div><div><span>Date de fin</span><strong>{formatLongDate(year.endDate)}</strong></div><div><span>Élèves associés</span><strong>{year.studentCount.toLocaleString("fr-FR")}</strong></div><div><span>Classes associées</span><strong>{year.classCount.toLocaleString("fr-FR")}</strong></div></div>
    <div className="ay-detail-meta"><span>Créée le {formatLongDate(year.createdAt.slice(0,10))}</span><span>Dernière mise à jour : {formatLongDate(year.updatedAt.slice(0,10))}</span></div>
    <div className="ay-modal-actions"><button type="button" className="ay-button ay-button--secondary" onClick={onClose}>Fermer</button>{canEdit&&year.status!=="Archivée"&&<button type="button" className="ay-button ay-button--primary" onClick={onEdit}><Pencil size={14}/> Modifier</button>}</div>
  </div>;
}

function ConfirmStatusDialog({ pending, saving, error, onCancel, onConfirm }: {
  pending: PendingStatus; saving: boolean; error: string; onCancel: () => void; onConfirm: () => void;
}) {
  if (!pending) return null;
  const activating = pending.action === "activate";
  return <div className="ay-overlay" onMouseDown={e=>{if(e.target===e.currentTarget&&!saving)onCancel();}}><section className="ay-modal ay-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="ay-confirm-title">
    <button type="button" className="ay-modal-close" onClick={onCancel} disabled={saving} aria-label="Fermer"><X size={17}/></button>
    <span className="ay-confirm-icon">{activating?<Check size={20}/>:<Clock3 size={20}/>}</span>
    <h2 id="ay-confirm-title">{activating?"Activer cette année scolaire ?":"Terminer cette année scolaire ?"}</h2>
    <p>{activating?<>L’année <strong>{pending.year.name}</strong> deviendra l’année scolaire active de l’établissement. Une seule année peut être active à la fois.</>:<>L’année <strong>{pending.year.name}</strong> passera au statut « Terminée ». Cette opération libère le statut actif pour une autre année scolaire.</>}</p>
    {error&&<div className="ay-form-error" role="alert"><AlertCircle size={15}/>{error}</div>}
    <div className="ay-modal-actions"><button type="button" className="ay-button ay-button--secondary" onClick={onCancel} disabled={saving}>Annuler</button><button type="button" className="ay-button ay-button--primary" onClick={onConfirm} disabled={saving}>{saving?"Traitement…":activating?"Confirmer l’activation":"Confirmer la clôture"}</button></div>
  </section></div>;
}

export function AcademicYearsPage({ user, onNavigate }: Props) {
  const canRead = user.permissions.includes("academic.structure.view");
  const canCreate = user.permissions.includes("academic.structure.manage");
  const canUpdate = user.permissions.includes("academic.structure.manage");
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Tous les statuts");
  const [sortDirection, setSortDirection] = useState<"asc"|"desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [modal, setModal] = useState<ModalState>(null);
  const [pending, setPending] = useState<PendingStatus>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [openMenu, setOpenMenu] = useState<string|null>(null);
  const [notice, setNotice] = useState("");

  async function loadYears() {
    setLoading(true);
    setLoadError("");
    try { setYears(await academicYearRepository.list()); }
    catch (error) { setLoadError(error instanceof Error ? error.message : "Impossible de charger les années scolaires."); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ if(canRead) void loadYears(); else setLoading(false); },[canRead]);

  const activeYear = years.find(year=>year.status==="Active") ?? null;
  const filtered = useMemo(()=>{
    const query=search.trim().toLocaleLowerCase("fr-FR");
    return [...years].filter(year=>(!query||year.name.toLocaleLowerCase("fr-FR").includes(query))&&(status==="Tous les statuts"||year.status===status))
      .sort((a,b)=>sortDirection==="asc"?a.startDate.localeCompare(b.startDate):b.startDate.localeCompare(a.startDate));
  },[years,search,status,sortDirection]);
  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const safePage=Math.min(page,totalPages);
  const visibleRows=filtered.slice((safePage-1)*pageSize,safePage*pageSize);
  const firstItem=filtered.length===0?0:(safePage-1)*pageSize+1;
  const lastItem=Math.min(safePage*pageSize,filtered.length);

  useEffect(()=>{setPage(1);},[search,status,pageSize]);

  async function saveYear(input: AcademicYearInput) {
    if(!canUpdate)return;
    setSaving(true);setFormError("");
    try {
      const next=modal?.type==="edit"?await academicYearRepository.update(modal.year.id,input):await academicYearRepository.create(input);
      setYears(next);setModal(null);setNotice(modal?.type==="edit"?"Les modifications ont été enregistrées.":"L’année scolaire a été créée en brouillon.");
    } catch(error) { setFormError(error instanceof Error?error.message:"L’enregistrement a échoué."); }
    finally {setSaving(false);}
  }
  async function changeStatus() {
    if(!pending||!canUpdate)return;
    setSaving(true);setActionError("");
    try {
      const next=pending.action==="activate"?await academicYearRepository.activate(pending.year.id):await academicYearRepository.complete(pending.year.id);
      setYears(next);setNotice(pending.action==="activate"?"L’année scolaire est maintenant active.":"L’année scolaire a été marquée comme terminée.");setPending(null);
    } catch(error) {setActionError(error instanceof Error?error.message:"La modification du statut a échoué.");}
    finally {setSaving(false);}
  }

  if(!canRead) return <main className="ay-page" style={{ "--school-primary": schoolBranding.primaryColor } as React.CSSProperties}><div className="ay-access-denied"><ShieldCheck size={26}/><h1>Accès non autorisé</h1><p>Votre compte ne dispose pas de l’autorisation nécessaire pour consulter les années scolaires.</p><button type="button" className="ay-button ay-button--secondary" onClick={()=>onNavigate("/overview")}>Retour au tableau de bord</button></div></main>;

  return <main className="ay-page">
    <header className="ay-page-header"><div><div className="ay-breadcrumb"><span>Gestion académique</span><i>/</i><strong>Années scolaires</strong></div><h1>Années scolaires</h1><p>Gérez les années scolaires de votre établissement et leur statut opérationnel.</p></div>{canCreate&&<button type="button" className="ay-button ay-button--primary" onClick={()=>{setFormError("");setModal({type:"create"});}}><Plus size={16}/> Créer une année scolaire</button>}</header>

    {notice&&<div className="ay-success" role="status"><Check size={15}/><span>{notice}</span><button type="button" onClick={()=>setNotice("")} aria-label="Fermer"><X size={14}/></button></div>}
    {loadError&&<div className="ay-error-banner" role="alert"><AlertCircle size={16}/><span>{loadError}</span><button type="button" onClick={()=>void loadYears()}>Réessayer</button></div>}

    <section className="ay-current-section"><div className="ay-section-heading"><div><span>VOTRE ÉTABLISSEMENT</span><h2>Année scolaire actuelle</h2></div><span className="ay-record-count">{years.length} année{years.length>1?"s":""} enregistrée{years.length>1?"s":""}</span></div>
      {loading?<div className="ay-current-card ay-skeleton"><div/><div/><div/></div>:activeYear?<article className="ay-current-card"><div className="ay-current-left"><span className="ay-current-icon"><CalendarDays size={21}/></span><div><small>ANNÉE SCOLAIRE EN COURS</small><h2>{activeYear.name}</h2><div className="ay-current-dates"><span><CalendarDays size={13}/>{formatDate(activeYear.startDate)}</span><i>→</i><span>{formatDate(activeYear.endDate)}</span></div></div></div><div className="ay-current-right"><StatusBadge status="Active"/><button type="button" onClick={()=>setModal({type:"details",year:activeYear})}>Voir les détails <ChevronRight size={15}/></button></div></article>:<div className="ay-no-current"><span><CircleHelp size={19}/></span><div><strong>Aucune année scolaire active</strong><p>Aucune année n’est actuellement marquée comme active. Activez une année en brouillon lorsque ses dates sont prêtes.</p></div>{canCreate&&<button type="button" className="ay-button ay-button--secondary" onClick={()=>{setFormError("");setModal({type:"create"});}}><Plus size={14}/> Créer une année</button>}</div>}
    </section>

    <section className="ay-table-panel"><div className="ay-table-heading"><div><span>STRUCTURE DE L’ÉTABLISSEMENT</span><h2>Historique des années scolaires</h2><p>Consultez et gérez les périodes scolaires enregistrées.</p></div><div className="ay-table-summary"><strong>{filtered.length}</strong><span>résultat{filtered.length>1?"s":""}</span></div></div>
      <div className="ay-toolbar"><label className="ay-search"><Search size={16}/><input type="search" placeholder="Rechercher une année scolaire…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button type="button" onClick={()=>setSearch("")} aria-label="Effacer la recherche"><X size={14}/></button>}</label><label className="ay-filter"><span>Statut</span><select value={status} onChange={e=>setStatus(e.target.value as StatusFilter)}><option>Tous les statuts</option>{statusOrder.map(value=><option key={value}>{value}</option>)}</select></label><button type="button" className="ay-sort-button" onClick={()=>setSortDirection(value=>value==="asc"?"desc":"asc")}><ArrowUpDown size={14}/> Année scolaire {sortDirection==="asc"?<ArrowUp size={13}/>:<ArrowDown size={13}/>}</button></div>

      {loading?<div className="ay-loading"><span className="ay-spinner"/>Chargement des années scolaires…</div>:visibleRows.length===0?<div className="ay-empty"><span><Search size={21}/></span><h3>{years.length===0?"Aucune année scolaire enregistrée":search.trim()?"Aucun résultat pour cette recherche":"Aucune année ne correspond à ce statut"}</h3><p>{years.length===0?"Commencez par créer la première année scolaire de votre établissement.":search.trim()?"Vérifiez l’orthographe ou essayez un autre nom.":"Modifiez le filtre de statut pour afficher d’autres années scolaires."}</p>{years.length===0&&canCreate&&<button type="button" className="ay-button ay-button--primary" onClick={()=>setModal({type:"create"})}><Plus size={15}/> Créer une année scolaire</button>}{(search||status!=="Tous les statuts")&&<button type="button" className="ay-clear-filters" onClick={()=>{setSearch("");setStatus("Tous les statuts");}}>Effacer les filtres</button>}</div>:<><div className="ay-table-wrap"><table className="ay-table"><thead><tr><th>Année scolaire</th><th>Date de début</th><th>Date de fin</th><th>Élèves</th><th>Classes</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{visibleRows.map(year=><tr key={year.id}><td><div className="ay-year-cell"><span className="ay-year-icon"><CalendarDays size={15}/></span><div><strong>{year.name}</strong>{year.status==="Active"&&<small>Année en cours</small>}</div></div></td><td>{formatDate(year.startDate)}</td><td>{formatDate(year.endDate)}</td><td><span className="ay-count">{year.studentCount.toLocaleString("fr-FR")}</span></td><td><span className="ay-count">{year.classCount.toLocaleString("fr-FR")}</span></td><td><StatusBadge status={year.status}/></td><td><div className="ay-row-actions"><button type="button" className="ay-icon-button" aria-label={`Voir les détails de ${year.name}`} onClick={()=>setModal({type:"details",year})}><Eye size={15}/></button>{canUpdate&&year.status!=="Archivée"&&<button type="button" className="ay-icon-button" aria-label={`Modifier ${year.name}`} onClick={()=>{setFormError("");setModal({type:"edit",year});}}><Pencil size={15}/></button>}<div className="ay-menu-wrap"><button type="button" className="ay-icon-button" aria-label={`Autres actions pour ${year.name}`} aria-expanded={openMenu===year.id} onClick={()=>setOpenMenu(value=>value===year.id?null:year.id)}><MoreHorizontal size={16}/></button>{openMenu===year.id&&<><button className="ay-menu-dismiss" type="button" aria-label="Fermer le menu" onClick={()=>setOpenMenu(null)}/><div className="ay-action-menu"><button type="button" onClick={()=>{setModal({type:"details",year});setOpenMenu(null);}}><Eye size={14}/> Voir les détails</button>{canUpdate&&year.status!=="Archivée"&&<button type="button" onClick={()=>{setFormError("");setModal({type:"edit",year});setOpenMenu(null);}}><Pencil size={14}/> Modifier</button>}{canUpdate&&year.status==="Brouillon"&&!activeYear&&<button type="button" onClick={()=>{setPending({year,action:"activate"});setActionError("");setOpenMenu(null);}}><Check size={14}/> Activer</button>}{canUpdate&&year.status==="Active"&&<button type="button" onClick={()=>{setPending({year,action:"complete"});setActionError("");setOpenMenu(null);}}><Clock3 size={14}/> Marquer comme terminée</button>}</div></>}</div></div></td></tr>)}</tbody></table></div>
      <div className="ay-pagination"><span>Affichage de <strong>{firstItem}–{lastItem}</strong> sur <strong>{filtered.length}</strong> années</span><div className="ay-pagination-controls"><label>Lignes par page<select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select></label><span>Page <strong>{safePage}</strong> sur <strong>{totalPages}</strong></span><button type="button" aria-label="Page précédente" disabled={safePage<=1} onClick={()=>setPage(value=>Math.max(1,value-1))}><ChevronLeft size={16}/></button><button type="button" aria-label="Page suivante" disabled={safePage>=totalPages} onClick={()=>setPage(value=>Math.min(totalPages,value+1))}><ChevronRight size={16}/></button></div></div></>}
    </section>

    <footer className="ay-page-footer"><span><ShieldCheck size={14}/> Les actions disponibles dépendent des autorisations de votre compte.</span><span>Données de démonstration enregistrées localement dans ce navigateur · Aucun serveur connecté</span></footer>

    {modal&&<div className="ay-overlay" onMouseDown={e=>{if(e.target===e.currentTarget&&!saving){setModal(null);setFormError("");}}}><section className="ay-modal" role="dialog" aria-modal="true" aria-labelledby="ay-modal-title"><button type="button" className="ay-modal-close" onClick={()=>{setModal(null);setFormError("");}} disabled={saving} aria-label="Fermer"><X size={17}/></button><div className="ay-modal-heading"><span>{modal.type==="details"?"DÉTAILS":modal.type==="edit"?"MODIFICATION":"NOUVELLE PÉRIODE"}</span><h2 id="ay-modal-title">{modal.type==="details"?"Détails de l’année scolaire":modal.type==="edit"?"Modifier l’année scolaire":"Créer une année scolaire"}</h2></div>{modal.type==="details"?<YearDetails year={modal.year} canEdit={canUpdate} onClose={()=>setModal(null)} onEdit={()=>{setFormError("");setModal({type:"edit",year:modal.year});}}/>:<AcademicYearForm key={modal.type==="edit"?modal.year.id:"new"} initial={modal.type==="edit"?modal.year:undefined} saving={saving} error={formError} onCancel={()=>{setModal(null);setFormError("");}} onSubmit={saveYear}/>}</section></div>}
    <ConfirmStatusDialog pending={pending} saving={saving} error={actionError} onCancel={()=>{setPending(null);setActionError("");}} onConfirm={()=>void changeStatus()}/>
  </main>;
}
