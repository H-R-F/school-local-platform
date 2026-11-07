import { useMemo, useState } from "react";
import { AlertCircle, ArrowUpRight, BookOpen, ChevronRight, CircleHelp, FilterX, Info, Search, ShieldCheck, Users, X } from "lucide-react";
import { academicAlerts } from "../../data/pedagogical-dashboard";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./StudentRiskPage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type AlertRecord = typeof academicAlerts[number];

const statusLabel = (value: string) => value === "Suivi en cours" ? "Suivi en cours" : value;
const statusClass = (value: string) => value === "Suivi en cours" ? "sr-status--active" : "sr-status--review";

export function StudentRiskPage({ user, onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("Toutes les classes");
  const [reasonFilter, setReasonFilter] = useState("Tous les motifs");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");
  const [selected, setSelected] = useState<AlertRecord | null>(null);

  const permitted = user.permissions.includes("student.analytics.view");
  const records = academicAlerts as readonly AlertRecord[];
  const classes = useMemo(() => [...new Set(records.map(item => item.className))].sort(), [records]);
  const reasons = useMemo(() => [...new Set(records.map(item => item.indicator))].sort(), [records]);
  const filtered = useMemo(() => records.filter(item => {
    const text = query.trim().toLocaleLowerCase("fr");
    const matchesText = !text || item.student.toLocaleLowerCase("fr").includes(text) || item.id.toLocaleLowerCase("fr").includes(text);
    return matchesText && (classFilter === "Toutes les classes" || item.className === classFilter)
      && (reasonFilter === "Tous les motifs" || item.indicator === reasonFilter)
      && (statusFilter === "Tous les statuts" || item.status === statusFilter);
  }), [records, query, classFilter, reasonFilter, statusFilter]);

  const activeCount = records.filter(item => item.status === "Suivi en cours").length;
  const reviewCount = records.filter(item => item.status === "À démarrer").length;
  const uniqueStudents = new Set(records.map(item => item.student)).size;
  const categoryCounts = reasons.map(reason => ({ reason, count: records.filter(item => item.indicator === reason).length, pending: records.filter(item => item.indicator === reason && item.status === "À démarrer").length }));

  const resetFilters = () => { setQuery(""); setClassFilter("Toutes les classes"); setReasonFilter("Tous les motifs"); setStatusFilter("Tous les statuts"); };

  if (!permitted) return <main className="sr-page"><section className="sr-access"><ShieldCheck size={26}/><h1>Accès non autorisé</h1><p>Vous ne disposez pas de l’autorisation nécessaire pour consulter le suivi des élèves.</p></section></main>;

  return (
    <main className="sr-page">
      <header className="sr-header">
        <div className="sr-breadcrumb"><span>Vie scolaire</span><ChevronRight size={13}/><strong>Suivi des élèves à risque</strong></div>
        <div className="sr-heading-row">
          <div><h1>Suivi des élèves à risque</h1><p>Identifiez les situations nécessitant une attention et un accompagnement pédagogique.</p></div>
          <div className="sr-header-meta"><span className="sr-count"><Users size={14}/>{activeCount} suivi{activeCount > 1 ? "s" : ""} en cours</span><span className="sr-demo-tag"><Info size={13}/> Aperçu de démonstration</span></div>
        </div>
      </header>

      <section className="sr-notice" aria-label="Limites des données">
        <Info size={16}/><div><strong>Données d’aperçu uniquement</strong><span>Les alertes ci-dessous proviennent des exemples du tableau de bord pédagogique. Le projet ne dispose pas encore d’un registre de suivi persistant ni d’un historique d’interventions.</span></div>
      </section>

      <section className="sr-kpis" aria-label="Indicateurs de suivi">
        <article className="sr-kpi"><span className="sr-kpi-icon sr-kpi-icon--blue"><Users size={17}/></span><div><strong>{uniqueStudents}</strong><span>Élèves signalés</span><small>Élèves distincts dans les alertes d’aperçu</small></div></article>
        <article className="sr-kpi"><span className="sr-kpi-icon sr-kpi-icon--amber"><AlertCircle size={17}/></span><div><strong>{reviewCount}</strong><span>Alertes à examiner</span><small>Statut « À démarrer » dans les données d’aperçu</small></div></article>
        <article className="sr-kpi"><span className="sr-kpi-icon sr-kpi-icon--teal"><BookOpen size={17}/></span><div><strong>{activeCount}</strong><span>Suivis indiqués en cours</span><small>Statut fourni par le tableau de bord</small></div></article>
        <article className="sr-kpi sr-kpi--unavailable"><span className="sr-kpi-icon sr-kpi-icon--neutral"><CircleHelp size={17}/></span><div><strong>—</strong><span>Interventions réalisées</span><small>Historique d’intervention non disponible</small></div></article>
      </section>

      <section className="sr-section">
        <div className="sr-section-heading"><div><span className="sr-eyebrow">SITUATIONS SIGNALÉES</span><h2>Indicateurs pédagogiques enregistrés</h2></div><span className="sr-section-note">Catégories issues des alertes existantes</span></div>
        <div className="sr-category-grid">
          {categoryCounts.map(item => <button type="button" key={item.reason} className={reasonFilter === item.reason ? "sr-category sr-category--selected" : "sr-category"} onClick={() => setReasonFilter(reasonFilter === item.reason ? "Tous les motifs" : item.reason)}>
            <span className="sr-category-top"><span className="sr-category-dot"/><strong>{item.count}</strong></span><span className="sr-category-name">{item.reason}</span><small>{item.pending} à examiner</small>
          </button>)}
        </div>
      </section>

      <section className="sr-section sr-table-section">
        <div className="sr-section-heading"><div><span className="sr-eyebrow">REGISTRE DES ALERTES</span><h2>Élèves nécessitant une attention</h2></div><span className="sr-results">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span></div>
        <div className="sr-filters">
          <label className="sr-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un élève ou une référence…" aria-label="Rechercher un élève ou une référence"/></label>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} aria-label="Filtrer par classe"><option>Toutes les classes</option>{classes.map(value => <option key={value}>{value}</option>)}</select>
          <select value={reasonFilter} onChange={e => setReasonFilter(e.target.value)} aria-label="Filtrer par motif"><option>Tous les motifs</option>{reasons.map(value => <option key={value}>{value}</option>)}</select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filtrer par statut"><option>Tous les statuts</option>{[...new Set(records.map(item => item.status))].map(value => <option key={value}>{value}</option>)}</select>
          <button type="button" className="sr-reset" onClick={resetFilters}><FilterX size={14}/>Réinitialiser</button>
        </div>
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead><tr><th>Élève</th><th>Référence alerte</th><th>Classe</th><th>Motif du signalement</th><th>Indicateur principal</th><th>Statut indiqué</th><th>Consulter</th></tr></thead>
            <tbody>{filtered.map(item => <tr key={item.id} onClick={() => setSelected(item)} className={selected?.id === item.id ? "sr-row--selected" : ""}>
              <td><button type="button" className="sr-student-link" onClick={e => {e.stopPropagation();setSelected(item);}}>{item.student}</button></td>
              <td><span className="sr-reference">{item.id}</span></td><td>{item.className}</td><td>{item.reason}</td><td>{item.indicator}</td>
              <td><span className={`sr-status ${statusClass(item.status)}`}>{statusLabel(item.status)}</span></td>
              <td><button type="button" className="sr-open" aria-label={`Consulter l’alerte de ${item.student}`} onClick={e => {e.stopPropagation();setSelected(item);}}><ArrowUpRight size={15}/></button></td>
            </tr>)}</tbody>
          </table>
          {filtered.length === 0 && <div className="sr-empty"><Search size={20}/><strong>Aucune alerte ne correspond à votre recherche</strong><span>Modifiez les filtres ou réinitialisez la recherche.</span><button type="button" onClick={resetFilters}>Réinitialiser les filtres</button></div>}
        </div>
        <div className="sr-table-footer"><span>Les dates de signalement et les responsables ne sont pas fournis par la source actuelle.</span><span>{filtered.length} / {records.length} alertes d’aperçu</span></div>
      </section>

      {selected && <div className="sr-drawer-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) setSelected(null);}}>
        <aside className="sr-drawer" aria-label="Détail de l’alerte">
          <header className="sr-drawer-header"><div><span className="sr-eyebrow">DÉTAIL DU SIGNALEMENT</span><h2>{selected.student}</h2><span className="sr-reference">{selected.id}</span></div><button type="button" onClick={() => setSelected(null)} aria-label="Fermer"><X size={18}/></button></header>
          <div className="sr-drawer-content">
            <section className="sr-detail-card"><h3>Contexte de l’élève</h3><dl><div><dt>Élève</dt><dd>{selected.student}</dd></div><div><dt>Classe</dt><dd>{selected.className}</dd></div><div><dt>Référence du signalement</dt><dd>{selected.id}</dd></div><div><dt>Statut indiqué</dt><dd><span className={`sr-status ${statusClass(selected.status)}`}>{selected.status}</span></dd></div></dl></section>
            <section className="sr-detail-card"><h3>Indicateur signalé</h3><div className="sr-indicator-detail">{selected.indicator}</div><p>{selected.reason}</p><small>Information reprise telle quelle depuis le tableau de bord pédagogique. La source et la date de calcul détaillées ne sont pas disponibles.</small></section>
            <section className="sr-detail-card"><h3>Historique du suivi</h3><div className="sr-history-empty"><CircleHelp size={18}/><strong>Aucun historique disponible</strong><span>Le projet ne contient pas encore de journal des observations, affectations ou interventions pour ce signalement.</span></div></section>
            <section className="sr-detail-limitation"><Info size={15}/><span>Les actions de prise en charge, d’observation, de planification et de clôture ne sont pas activées : aucun workflow persistant correspondant n’a été trouvé.</span></section>
            <button type="button" className="sr-secondary-action" onClick={() => {setSelected(null);onNavigate(`/students?search=${encodeURIComponent(selected.student)}`);}}>Consulter la gestion des élèves <ChevronRight size={15}/></button>
          </div>
        </aside>
      </div>}
    </main>
  );
}
