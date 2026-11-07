import { CalendarDays, ClipboardList, FileText, ListChecks, ShieldAlert, Users } from "lucide-react";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./MeetingsPage.css";

interface Props { user: AuthenticatedSidebarUser }

const unavailableItems = [
  { title: "Planification et gestion des réunions", detail: "Aucun modèle, dépôt ou service de réunions n’est présent dans le projet." },
  { title: "Participants et présences", detail: "Les annuaires du personnel existent, mais aucune relation de participants ou de présence liée aux réunions n’est disponible." },
  { title: "Ordres du jour et comptes rendus", detail: "Aucun workflow de rédaction, validation ou versionnement des comptes rendus n’a été identifié." },
  { title: "Décisions et actions de suivi", detail: "Aucun modèle d’action associé à une réunion ni service de tâches réutilisable n’a été identifié." },
  { title: "Documents et invitations", detail: "Aucune association documentaire ou opération d’invitation propre aux réunions n’est disponible." },
];

export function MeetingsPage({ user }: Props) {
  const canAccess = user.permissions.includes("communication.meetings.manage");

  if (!canAccess) {
    return (
      <main className="meetings-page">
        <div className="mt-breadcrumb">Communication <span>/</span> <b>Réunions</b></div>
        <section className="mt-access">
          <ShieldAlert size={25} />
          <h1>Accès non autorisé</h1>
          <p>Votre rôle ne dispose pas de la permission nécessaire pour consulter le module Réunions.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="meetings-page">
      <div className="mt-breadcrumb">Communication <span>/</span> <b>Réunions</b></div>
      <header className="mt-heading">
        <div>
          <div className="mt-eyebrow">COMMUNICATION · COORDINATION INTERNE</div>
          <h1>Réunions</h1>
          <p>Planifiez les réunions, gérez les participants et assurez le suivi des décisions.</p>
        </div>
      </header>

      <section className="mt-integration" role="status">
        <div className="mt-integration-icon"><ShieldAlert size={19} /></div>
        <div className="mt-integration-copy">
          <strong>Le module de gestion des réunions n’est pas encore connecté</strong>
          <p>La navigation et la permission d’accès existent, mais le projet ne contient pas encore de service ni de modèle permettant de charger ou d’enregistrer des réunions. Aucun enregistrement fictif n’est affiché.</p>
        </div>
        <span className="mt-integration-state">NON DISPONIBLE</span>
      </section>

      <section className="mt-kpis" aria-label="Indicateurs des réunions">
        <article className="mt-kpi"><div className="mt-kpi-top"><span>Réunions à venir</span><CalendarDays size={16}/></div><strong>—</strong><small>Source de réunions indisponible</small></article>
        <article className="mt-kpi"><div className="mt-kpi-top"><span>Réunions cette semaine</span><CalendarDays size={16}/></div><strong>—</strong><small>Calcul impossible sans données</small></article>
        <article className="mt-kpi"><div className="mt-kpi-top"><span>Comptes rendus en attente</span><FileText size={16}/></div><strong>—</strong><small>Aucun statut de compte rendu accessible</small></article>
        <article className="mt-kpi"><div className="mt-kpi-top"><span>Actions à suivre</span><ListChecks size={16}/></div><strong>—</strong><small>Aucune action liée à une réunion accessible</small></article>
      </section>

      <section className="mt-panel">
        <div className="mt-panel-heading">
          <div><h2>Liste des réunions</h2><p>Les réunions apparaîtront ici lorsqu’un service de gestion sera disponible.</p></div>
          <span className="mt-count">0 réunion</span>
        </div>
        <div className="mt-table-scroll">
          <table>
            <thead><tr><th>RÉUNION</th><th>TYPE</th><th>DATE ET HEURE</th><th>LIEU</th><th>ORGANISATEUR</th><th>PARTICIPANTS</th><th>STATUT</th><th>COMPTE RENDU</th><th/></tr></thead>
            <tbody><tr><td colSpan={9}>
              <div className="mt-empty">
                <div className="mt-empty-icon"><Users size={23}/></div>
                <strong>Aucune donnée de réunion disponible</strong>
                <p>La liste reste vide tant qu’aucun modèle et service de réunions n’est intégré. Les données des événements, annonces et notifications ne sont pas réutilisées comme des réunions.</p>
              </div>
            </td></tr></tbody>
          </table>
        </div>
      </section>

      <section className="mt-capabilities">
        <div className="mt-capabilities-heading"><div><h2>État des fonctionnalités</h2><p>Capacités identifiées lors de l’inspection du projet.</p></div><span>Intégration à prévoir</span></div>
        <div className="mt-capability-list">
          {unavailableItems.map((item) => <article key={item.title}><span className="mt-capability-mark"><ClipboardList size={15}/></span><div><strong>{item.title}</strong><p>{item.detail}</p></div><span className="mt-unavailable">Non disponible</span></article>)}
        </div>
        <p className="mt-footnote">Les indicateurs, filtres, exports, historiques et actions de réunion ne sont pas activés en l’absence de données et de services correspondants. Cette page ne crée aucune réunion et n’envoie aucune notification.</p>
      </section>
    </main>
  );
}
