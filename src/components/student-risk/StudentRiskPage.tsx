import { useMemo, useState } from "react";
import { AlertCircle, ArrowUpRight, BookOpen, ChevronRight, CircleHelp, FilterX, Info, MapPin, Search, ShieldAlert, ShieldCheck, Users, X } from "lucide-react";
import { academicAlerts } from "../../data/pedagogical-dashboard";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./StudentRiskPage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type AlertRecord = typeof academicAlerts[number];
type SchoolIncident = {
  id: string; student: string; className: string; date: string; time: string;
  location: string; category: string; severity: "Faible" | "Modérée" | "Élevée";
  status: "À examiner" | "En suivi" | "Clôturé"; summary: string; immediateAction: string;
};
const schoolIncidentExamples: readonly SchoolIncident[] = [
  { id: "INC-SCOL-003", student: "Adam El Mansouri", className: "3e B", date: "2026-11-05", time: "10:25", location: "Cour de récréation", category: "Chute pendant la récréation", severity: "Modérée", status: "En suivi", summary: "Exemple fictif d’un incident survenu pendant une période de récréation.", immediateAction: "Prise en charge initiale par l’équipe de surveillance." },
  { id: "INC-SCOL-002", student: "Lina Berrada", className: "2e A", date: "2026-11-03", time: "14:10", location: "Terrain de sport", category: "Incident pendant une activité sportive", severity: "Faible", status: "À examiner", summary: "Exemple fictif d’un incident déclaré pendant une activité encadrée.", immediateAction: "Information transmise au responsable de la vie scolaire." },
  { id: "INC-SCOL-001", student: "Omar Chraïbi", className: "5e B", date: "2026-10-29", time: "09:40", location: "Couloir – bâtiment A", category: "Incident entre élèves", severity: "Élevée", status: "En suivi", summary: "Exemple fictif nécessitant une vérification et un suivi par l’établissement.", immediateAction: "Élèves séparés et situation transmise au responsable." },
];
const incidentSeverityClass = (value: SchoolIncident["severity"]) => value === "Élevée" ? "sr-incident-severity--high" : value === "Modérée" ? "sr-incident-severity--medium" : "sr-incident-severity--low";
const incidentStatusClass = (value: SchoolIncident["status"]) => value === "En suivi" ? "sr-status--active" : value === "À examiner" ? "sr-status--review" : "sr-status--closed";

const statusLabel = (value: string) => value === "Suivi en cours" ? "Suivi en cours" : value;
const statusClass = (value: string) => value === "Suivi en cours" ? "sr-status--active" : "sr-status--review";

export function StudentRiskPage({ user, onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("Toutes les classes");
  const [reasonFilter, setReasonFilter] = useState("Tous les motifs");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");
  const [selected, setSelected] = useState<AlertRecord | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SchoolIncident | null>(null);

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
  const incidentInFollowUp = schoolIncidentExamples.filter(item => item.status === "En suivi").length;
  const categoryCounts = reasons.map(reason => ({ reason, count: records.filter(item => item.indicator === reason).length, pending: records.filter(item => item.indicator === reason && item.status === "À démarrer").length }));

  const resetFilters = () => { setQuery(""); setClassFilter("Toutes les classes"); setReasonFilter("Tous les motifs"); setStatusFilter("Tous les statuts"); };

  if (!permitted) return <main className="sr-page"><section className="sr-access"><ShieldCheck size={26}/><h1>Accès non autorisé</h1><p>Vous ne disposez pas de l’autorisation nécessaire pour consulter le suivi des élèves.</p></section></main>;

  return (
    <main className="sr-page">
      <header className="sr-header">
        <div className="sr-breadcrumb"><span>Vie scolaire</span><ChevronRight size={13}/><strong>Suivi des élèves</strong></div>
        <div className="sr-heading-row">
          <div><h1>Suivi des élèves</h1><p>Suivez séparément les situations pédagogiques et les accidents ou incidents survenus dans l’établissement.</p></div>
          <div className="sr-header-meta"><span className="sr-count"><Users size={14}/>{activeCount} suivi{activeCount > 1 ? "s" : ""} pédagogique{activeCount > 1 ? "s" : ""} en cours</span><span className="sr-demo-tag"><Info size={13}/> Aperçu de démonstration</span></div>
        </div>
      </header>

      <section className="sr-notice" aria-label="Limites des données">
        <Info size={16}/><div><strong>Données d’aperçu uniquement</strong><span>Les données affichées sont des exemples de démonstration. Aucun registre persistant de suivi pédagogique ou d’accidents scolaires n’est encore connecté.</span></div>
      </section>

      <section className="sr-kpis" aria-label="Indicateurs de suivi">
        <article className="sr-kpi"><span className="sr-kpi-icon sr-kpi-icon--blue"><Users size={17}/></span><div><strong>{uniqueStudents}</strong><span>Élèves signalés</span><small>Élèves distincts dans les alertes d’aperçu</small></div></article>
        <article className="sr-kpi"><span className="sr-kpi-icon sr-kpi-icon--amber"><AlertCircle size={17}/></span><div><strong>{reviewCount}</strong><span>Alertes à examiner</span><small>Statut « À démarrer » dans les données d’aperçu</small></div></article>
        <article className="sr-kpi"><span className="sr-kpi-icon sr-kpi-icon--teal"><BookOpen size={17}/></span><div><strong>{activeCount}</strong><span>Suivis indiqués en cours</span><small>Statut fourni par le tableau de bord</small></div></article>
        <article className="sr-kpi"><span className="sr-kpi-icon sr-kpi-icon--amber"><ShieldAlert size={17}/></span><div><strong>{schoolIncidentExamples.length}</strong><span>Accidents et incidents</span><small>Exemples fictifs · registre non connecté</small></div></article>
      </section>


      <section className="sr-section sr-incident-section">
        <div className="sr-section-heading">
          <div><span className="sr-eyebrow">SÉCURITÉ ET VIE SCOLAIRE</span><h2>Accidents et incidents scolaires</h2></div>
          <span className="sr-section-note">{incidentInFollowUp} situation{incidentInFollowUp > 1 ? "s" : ""} en suivi dans les exemples</span>
        </div>
        <div className="sr-incident-intro">
          <span className="sr-incident-intro-icon"><ShieldAlert size={17}/></span>
          <div><strong>Un registre distinct du suivi pédagogique</strong><span>Déclarez et suivez ici les événements survenus dans l’enceinte scolaire : cour, classe, couloirs, sanitaires ou installations sportives. Un accident ne constitue pas automatiquement un indicateur de risque scolaire.</span></div>
          <span className="sr-demo-tag"><Info size={13}/> Exemples fictifs</span>
        </div>
        <div className="sr-incident-table-wrap">
          <table className="sr-table sr-incident-table">
            <thead><tr><th>Élève</th><th>Date et heure</th><th>Lieu</th><th>Nature de l’incident</th><th>Gravité</th><th>Statut</th><th>Détail</th></tr></thead>
            <tbody>{schoolIncidentExamples.map(item => <tr key={item.id} onClick={() => setSelectedIncident(item)} className={selectedIncident?.id === item.id ? "sr-row--selected" : ""}>
              <td><strong className="sr-incident-student">{item.student}</strong><small className="sr-incident-class">{item.className} · {item.id}</small></td>
              <td><span className="sr-incident-date">{new Date(item.date + "T00:00:00").toLocaleDateString("fr-FR")}</span><small className="sr-incident-class">{item.time}</small></td>
              <td><span className="sr-incident-location"><MapPin size={12}/>{item.location}</span></td>
              <td>{item.category}</td>
              <td><span className={`sr-incident-severity ${incidentSeverityClass(item.severity)}`}>{item.severity}</span></td>
              <td><span className={`sr-status ${incidentStatusClass(item.status)}`}>{item.status}</span></td>
              <td><button type="button" className="sr-open" aria-label={`Consulter l’incident ${item.id}`} onClick={e => {e.stopPropagation();setSelectedIncident(item);}}><ArrowUpRight size={15}/></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="sr-table-footer"><span>Les exemples ne constituent pas des déclarations réelles. Aucun enregistrement ni changement de statut n’est sauvegardé.</span><span>{schoolIncidentExamples.length} exemples</span></div>
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

      {selectedIncident && <div className="sr-drawer-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) setSelectedIncident(null);}}>
        <aside className="sr-drawer" aria-label="Détail de l’accident ou de l’incident">
          <header className="sr-drawer-header"><div><span className="sr-eyebrow">ACCIDENT / INCIDENT SCOLAIRE</span><h2>{selectedIncident.student}</h2><span className="sr-reference">{selectedIncident.id}</span></div><button type="button" onClick={() => setSelectedIncident(null)} aria-label="Fermer"><X size={18}/></button></header>
          <div className="sr-drawer-content">
            <section className="sr-detail-card"><h3>Informations sur l’événement</h3><dl>
              <div><dt>Élève</dt><dd>{selectedIncident.student}</dd></div><div><dt>Classe</dt><dd>{selectedIncident.className}</dd></div>
              <div><dt>Date et heure</dt><dd>{new Date(selectedIncident.date + "T00:00:00").toLocaleDateString("fr-FR")} · {selectedIncident.time}</dd></div>
              <div><dt>Lieu</dt><dd>{selectedIncident.location}</dd></div><div><dt>Nature</dt><dd>{selectedIncident.category}</dd></div>
              <div><dt>Gravité déclarée</dt><dd><span className={`sr-incident-severity ${incidentSeverityClass(selectedIncident.severity)}`}>{selectedIncident.severity}</span></dd></div>
              <div><dt>Statut</dt><dd><span className={`sr-status ${incidentStatusClass(selectedIncident.status)}`}>{selectedIncident.status}</span></dd></div>
            </dl></section>
            <section className="sr-detail-card"><h3>Description</h3><p>{selectedIncident.summary}</p><h3 className="sr-subheading">Mesure immédiate indiquée</h3><p>{selectedIncident.immediateAction}</p></section>
            <section className="sr-detail-limitation"><Info size={15}/><span>Exemple fictif à des fins de conception. Le formulaire de déclaration, les coordonnées du déclarant, l’information des responsables légaux, les pièces jointes et l’historique de prise en charge nécessitent un registre dédié et une sauvegarde sécurisée.</span></section>
          </div>
        </aside>
      </div>}
    </main>
  );
}
