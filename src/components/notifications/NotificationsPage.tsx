import { Bell, CheckCircle2, CircleAlert, Clock3, Mail, ShieldCheck, XCircle } from "lucide-react";
import { schoolBranding } from "../../config/school";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./NotificationsPage.css";

interface Props { user: AuthenticatedSidebarUser }

const capabilities = [
  { label: "Enregistrement des notifications", detail: "Aucun modèle ni dépôt de notifications n’est présent dans le projet.", state: "absent" as const },
  { label: "Canaux de diffusion", detail: "Aucun service d’envoi e-mail, SMS ou notification mobile n’est connecté.", state: "absent" as const },
  { label: "Suivi des livraisons", detail: "Aucun événement de livraison ou de lecture n’est disponible.", state: "absent" as const },
  { label: "Relance des échecs", detail: "Aucune file d’attente ni mécanisme de nouvelle tentative n’est implémenté.", state: "absent" as const },
];

export function NotificationsPage({ user }: Props) {
  const canRead = user.permissions.includes("communication.view");

  if (!canRead) {
    return (
      <main className="notif-page">
        <section className="notif-denied">
          <ShieldCheck size={30} />
          <h1>Accès non autorisé</h1>
          <p>Votre rôle ne dispose pas de l’autorisation nécessaire pour consulter les notifications.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="notif-page">
      <header className="notif-header">
        <div>
          <div className="notif-breadcrumb"><span>Communication</span><span className="notif-separator">/</span><strong>Notifications</strong></div>
          <h1>Notifications</h1>
          <p>Consultez et suivez les notifications générées par la plateforme.</p>
        </div>
      </header>

      <section className="notif-notice" role="status">
        <div className="notif-notice-icon"><CircleAlert size={19} /></div>
        <div>
          <strong>Service de notifications non connecté</strong>
          <p>Cette page est prête à accueillir le suivi des notifications, mais le projet ne contient actuellement aucun service permettant de créer, distribuer ou suivre des notifications individuelles. Aucune donnée d’envoi n’est donc affichée.</p>
        </div>
      </section>

      <section className="notif-overview" aria-label="État du module">
        <article className="notif-overview-card">
          <span className="notif-card-icon"><Bell size={17} /></span>
          <div><span>Notifications enregistrées</span><strong>—</strong><small>Source de données absente</small></div>
        </article>
        <article className="notif-overview-card">
          <span className="notif-card-icon"><Mail size={17} /></span>
          <div><span>Envois confirmés</span><strong>—</strong><small>Aucun événement de livraison</small></div>
        </article>
        <article className="notif-overview-card">
          <span className="notif-card-icon"><Clock3 size={17} /></span>
          <div><span>En attente</span><strong>—</strong><small>Aucune file d’attente connectée</small></div>
        </article>
        <article className="notif-overview-card">
          <span className="notif-card-icon"><XCircle size={17} /></span>
          <div><span>Échecs d’envoi</span><strong>—</strong><small>Aucun journal de tentatives</small></div>
        </article>
      </section>

      <section className="notif-panel">
        <div className="notif-panel-heading">
          <div>
            <h2>Suivi des notifications</h2>
            <p>Les enregistrements apparaîtront ici lorsque le service de notifications sera disponible.</p>
          </div>
          <span className="notif-readonly"><ShieldCheck size={14} /> Consultation indisponible</span>
        </div>
        <div className="notif-empty">
          <div className="notif-empty-icon"><Bell size={25} /></div>
          <strong>Aucune donnée de notification disponible</strong>
          <p>Les annonces de l’établissement sont gérées dans le module « Annonces ». Elles ne constituent pas des preuves d’envoi individuel et ne sont pas converties en notifications dans cette page.</p>
        </div>
      </section>

      <section className="notif-capabilities">
        <div className="notif-panel-heading">
          <div>
            <h2>Disponibilité des fonctionnalités</h2>
            <p>État constaté dans la version actuelle du projet.</p>
          </div>
        </div>
        <div className="notif-capability-list">
          {capabilities.map((item) => (
            <article key={item.label}>
              <span className="notif-capability-state"><XCircle size={15} /> Non disponible</span>
              <div><strong>{item.label}</strong><p>{item.detail}</p></div>
            </article>
          ))}
        </div>
      </section>

      <footer className="notif-footnote">
        <span className="notif-footnote-mark"><CheckCircle2 size={14} /></span>
        <p>Établissement : <strong>{schoolBranding.name}</strong>. Les notifications ne seront considérées comme envoyées, livrées ou lues qu’après confirmation par un service et des événements réels.</p>
      </footer>
    </main>
  );
}
