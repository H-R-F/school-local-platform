import { CalendarDays, CalendarClock, CheckCircle2, Clock3, FilterX, Info, LockKeyhole, Search, Users, ChevronRight, CircleDashed, ClipboardList, ShieldCheck } from "lucide-react";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./StudentActivitiesPage.css";

interface Props { user: AuthenticatedSidebarUser }

const views = [
  { id: "all", label: "Toutes les activités", icon: ClipboardList },
  { id: "upcoming", label: "À venir", icon: CalendarClock },
  { id: "active", label: "En cours", icon: Clock3 },
  { id: "completed", label: "Terminées", icon: CheckCircle2 },
] as const;

const columns = ["Nom de l'activité", "Catégorie", "Date et horaires", "Lieu", "Responsable", "Classes / Groupes", "Participants", "Statut", "Actions"];

export function StudentActivitiesPage({ user }: Props) {
  const canView = user.permissions.includes("student.activities.view");

  if (!canView) {
    return <main className="activities-page"><section className="activities-access"><ShieldCheck size={25}/><h1>Accès non autorisé</h1><p>Votre compte ne dispose pas de l’autorisation nécessaire pour consulter les activités des élèves.</p></section></main>;
  }

  return (
    <main className="activities-page">
      <header className="activities-header">
        <div className="activities-breadcrumb"><span>Vie scolaire</span><ChevronRight size={13}/><strong>Activités des élèves</strong></div>
        <div className="activities-heading">
          <div><h1>Activités des élèves</h1><p>Organisez les activités scolaires et suivez la participation des élèves.</p></div>
          <div className="activities-header-meta"><span className="activities-upcoming"><CalendarDays size={15}/><strong>—</strong> activité à venir</span></div>
        </div>
      </header>

      <section className="activities-notice" role="status">
        <Info size={17}/>
        <div><strong>Registre des activités non configuré</strong><span>Le projet ne contient pas encore de modèle ni de service dédié aux activités scolaires. Aucun événement, participant, indicateur ou statut n’est donc affiché comme une donnée réelle. Cette page présente uniquement la structure de gestion disponible à ce stade.</span></div>
      </section>

      <section className="activities-kpis" aria-label="Indicateurs des activités">
        <article className="activities-kpi"><span className="activities-kpi-icon blue"><CalendarClock size={17}/></span><div><strong>—</strong><span>Activités à venir</span><small>Registre non disponible</small></div></article>
        <article className="activities-kpi"><span className="activities-kpi-icon teal"><Clock3 size={17}/></span><div><strong>—</strong><span>Activités en cours</span><small>Statuts non configurés</small></div></article>
        <article className="activities-kpi"><span className="activities-kpi-icon slate"><Users size={17}/></span><div><strong>—</strong><span>Élèves participants</span><small>Participation non enregistrée</small></div></article>
      </section>

      <section className="activities-workspace">
        <div className="activities-workspace-head">
          <div><span className="activities-eyebrow">SUIVI DES ÉVÉNEMENTS</span><h2>Activités scolaires</h2><p>Consultez les activités organisées par l’établissement et leur état d’avancement.</p></div>
          <span className="activities-readonly"><LockKeyhole size={13}/> Consultation uniquement</span>
        </div>

        <nav className="activities-tabs" aria-label="Filtrer les activités">
          {views.map((view, index) => { const Icon = view.icon; return <button type="button" key={view.id} className={index === 0 ? "active" : ""} disabled aria-disabled="true"><Icon size={14}/>{view.label}<span>—</span></button>; })}
        </nav>

        <div className="activities-filters">
          <label className="activities-search"><Search size={15}/><input disabled placeholder="Rechercher par nom ou référence…"/></label>
          <select disabled aria-label="Année scolaire"><option>Année scolaire</option></select>
          <select disabled aria-label="Période"><option>Toute période</option></select>
          <select disabled aria-label="Catégorie"><option>Toutes les catégories</option></select>
          <select disabled aria-label="Classe ou groupe"><option>Toutes les classes / groupes</option></select>
          <select disabled aria-label="Statut"><option>Tous les statuts</option></select>
          <button className="activities-reset" type="button" disabled><FilterX size={14}/>Réinitialiser</button>
        </div>
        <div className="activities-filter-note"><Info size={13}/>La recherche et les filtres seront activés lorsque le registre des activités et ses référentiels seront disponibles.</div>

        <div className="activities-table-wrap">
          <table className="activities-table">
            <thead><tr>{columns.map(column=><th key={column}>{column}</th>)}</tr></thead>
            <tbody><tr><td colSpan={columns.length}>
              <div className="activities-empty">
                <span className="activities-empty-icon"><CalendarDays size={23}/></span>
                <strong>Aucune activité disponible</strong>
                <p>Aucune activité ne peut être chargée : le projet ne dispose pas encore d’un registre d’activités scolaires.</p>
                <small>Les activités ne sont pas créées automatiquement et aucun exemple fictif n’est mélangé aux données de l’établissement.</small>
              </div>
            </td></tr></tbody>
          </table>
        </div>
        <footer className="activities-table-footer"><span>0 activité affichée</span><span>Source : registre d’activités non configuré</span></footer>
      </section>

      <section className="activities-capabilities">
        <div className="activities-capabilities-heading"><div><span className="activities-eyebrow">PÉRIMÈTRE FONCTIONNEL</span><h2>Fonctionnalités non disponibles</h2></div><span className="activities-status"><CircleDashed size={13}/> À développer</span></div>
        <div className="activities-capability-grid">
          <article><CalendarDays size={16}/><div><strong>Création et publication</strong><span>Aucun formulaire ni service de création d’activité n’existe actuellement.</span></div></article>
          <article><Users size={16}/><div><strong>Inscriptions et participants</strong><span>Aucun lien d’inscription entre une activité et les dossiers élèves n’est défini.</span></div></article>
          <article><CheckCircle2 size={16}/><div><strong>Présence aux activités</strong><span>Le suivi de présence aux événements est distinct de la présence scolaire et n’a pas de service dédié.</span></div></article>
          <article><ClipboardList size={16}/><div><strong>Historique et résultats</strong><span>Aucun journal d’événements ni modèle de bilan d’activité n’est disponible.</span></div></article>
        </div>
      </section>
    </main>
  );
}
