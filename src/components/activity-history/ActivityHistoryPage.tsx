import { Activity, CalendarClock, FileClock, History, Info, ShieldAlert, Users, Wallet, XCircle } from "lucide-react";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./ActivityHistoryPage.css";

interface Props { user: AuthenticatedSidebarUser }

const unavailableCapabilities = [
  { title: "Recherche et filtres", detail: "Aucun point d’accès ne permet actuellement de rechercher ou filtrer des événements d’activité." },
  { title: "Chronologie et pagination", detail: "Aucun flux d’événements horodatés ni mécanisme de pagination n’a été trouvé." },
  { title: "Détails et historique des modifications", detail: "Aucun enregistrement ne fournit les détails d’une action ou des valeurs avant/après." },
  { title: "Actualisation et export", detail: "Aucun service de lecture ou d’export de l’historique n’est disponible." },
];

export function ActivityHistoryPage({ user }: Props) {
  const canView = user.permissions.includes("activity.history.view");

  if (!canView) {
    return (
      <main className="ah-page">
        <div className="ah-breadcrumb">Communication <span>/</span> <b>Historique des activités</b></div>
        <section className="ah-access">
          <ShieldAlert size={26} />
          <h1>Accès non autorisé</h1>
          <p>Votre rôle ne dispose pas de la permission nécessaire pour consulter l’historique des activités.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="ah-page">
      <div className="ah-breadcrumb">Communication <span>/</span> <b>Historique des activités</b></div>
      <header className="ah-heading">
        <div>
          <div className="ah-eyebrow">COMMUNICATION · SUIVI OPÉRATIONNEL</div>
          <h1>Historique des activités</h1>
          <p>Consultez les dernières activités effectuées sur la plateforme.</p>
        </div>
      </header>

      <section className="ah-source" role="status">
        <div className="ah-source-icon"><Info size={19} /></div>
        <div className="ah-source-copy">
          <strong>La source d’activités n’est pas disponible dans le projet</strong>
          <p>L’inspection du code n’a révélé aucun service, modèle, point d’accès ou flux d’événements d’activité exploitable. Cette page ne peut donc pas charger de données réelles. Aucun exemple fictif, chiffre ou événement n’est présenté comme une activité enregistrée.</p>
        </div>
        <span className="ah-source-state">SOURCE ABSENTE</span>
      </section>

      <section className="ah-kpis" aria-label="Indicateurs d’activité">
        <article><div className="ah-kpi-label"><span>Activités aujourd’hui</span><CalendarClock size={16}/></div><strong>—</strong><small>Horodatages non disponibles</small></article>
        <article><div className="ah-kpi-label"><span>Activités cette semaine</span><Activity size={16}/></div><strong>—</strong><small>Flux d’activités non connecté</small></article>
        <article><div className="ah-kpi-label"><span>Utilisateurs actifs</span><Users size={16}/></div><strong>—</strong><small>Aucun acteur d’activité vérifiable</small></article>
        <article><div className="ah-kpi-label"><span>Activités à examiner</span><FileClock size={16}/></div><strong>—</strong><small>Aucun indicateur de revue identifié</small></article>
      </section>

      <section className="ah-feed">
        <header className="ah-feed-heading">
          <div><h2>Activité récente</h2><p>Chronologie des actions enregistrées sur la plateforme.</p></div>
          <span className="ah-readonly"><History size={13}/> Consultation</span>
        </header>
        <div className="ah-feed-empty">
          <div className="ah-empty-icon"><Activity size={24}/></div>
          <strong>Historique indisponible</strong>
          <p>Il ne s’agit pas d’un historique vide : le projet ne dispose pas encore d’une source permettant de vérifier si des activités ont été enregistrées.</p>
          <span>Les activités récentes affichées sur certains tableaux de bord sont des données de présentation propres à ces écrans. Elles ne constituent pas un journal opérationnel central et ne sont pas réutilisées ici.</span>
        </div>
      </section>

      <section className="ah-capabilities">
        <header><div><h2>État des fonctionnalités</h2><p>Capacités qui nécessitent une infrastructure d’activité existante.</p></div><span>Intégration nécessaire</span></header>
        <div className="ah-capability-list">
          {unavailableCapabilities.map(item => <article key={item.title}><span className="ah-capability-icon"><XCircle size={15}/></span><div><strong>{item.title}</strong><p>{item.detail}</p></div><em>Non disponible</em></article>)}
        </div>
        <footer>La permission <code>activity.history.view</code> est respectée côté interface. Le filtrage des données et l’autorisation côté serveur ne pourront être garantis qu’après intégration d’un service backend dédié ou réutilisation d’un journal existant. Cette page ne crée et ne modifie aucun enregistrement d’activité.</footer>
      </section>
    </main>
  );
}
