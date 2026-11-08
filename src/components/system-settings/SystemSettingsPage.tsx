import { useMemo, useState, type ReactNode } from "react";
import {
  Activity, AlertCircle, AlertTriangle, Archive, ArrowRight,
  CheckCircle2, ChevronRight, Clock3, Database, FileSearch, HardDrive, Info,
  Laptop, LockKeyhole,
  Network, RefreshCw, RotateCcw, Search, Server, ShieldAlert, ShieldCheck,
  Wifi, WifiOff, X, Zap
} from "lucide-react";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import {
  demoBackups, demoInfrastructure, demoLogs, demoServices, demoSyncHistory,
  type DemoBackup, type DemoLog, type DemoSync, type HealthState
} from "../../services/system-settings-demo";
import "./SystemSettingsPage.css";

interface Props { user: AuthenticatedSidebarUser }
type Tab = "overview" | "server" | "storage" | "network" | "backup" | "sync" | "logs" | "maintenance";
type Detail = { title: string; description: string; rows: [string, string][] };

const tabs: { id: Tab; label: string; icon: typeof Activity; group: string }[] = [
  { id: "overview", label: "Vue d’ensemble", icon: Activity, group: "Système" },
  { id: "server", label: "Serveur local", icon: Server, group: "Infrastructure" },
  { id: "storage", label: "Base de données et stockage", icon: Database, group: "Infrastructure" },
  { id: "network", label: "Réseau et connectivité", icon: Network, group: "Infrastructure" },
  { id: "backup", label: "Sauvegarde et restauration", icon: Archive, group: "Protection des données" },
  { id: "sync", label: "Synchronisation centrale", icon: RefreshCw, group: "Protection des données" },
  { id: "logs", label: "Journaux et diagnostics", icon: FileSearch, group: "Diagnostics" },
  { id: "maintenance", label: "Maintenance", icon: ShieldAlert, group: "Administration technique" },
];

const initialStates = {
  server: "healthy" as HealthState, database: "healthy" as HealthState,
  lan: "healthy" as HealthState, internet: "down" as HealthState,
  central: "down" as HealthState, backup: "warning" as HealthState,
};

function StatePill({ state, children }: { state: HealthState; children: ReactNode }) {
  const label = state === "healthy" ? "Opérationnel" : state === "warning" ? "Attention" : state === "down" ? "Indisponible" : "Non vérifié";
  return <span className={`sys-pill ${state}`}><i />{children || label}</span>;
}
function Metric({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: typeof Activity }) {
  return <div className="sys-metric"><span className="sys-metric-icon"><Icon size={17}/></span><div><small>{label}</small><strong>{value}</strong><span>{hint}</span></div></div>;
}
function Panel({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="sys-panel"><div className="sys-panel-head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>{children}</section>;
}

export function SystemSettingsPage({ user }: Props) {
  const allowed = user.permissions.includes("settings.system.manage") && user.role === "director";
  const [tab, setTab] = useState<Tab>("overview");
  const [states, setStates] = useState(initialStates);
  const [lastCheck, setLastCheck] = useState("08/11/2026 · 22:10");
  const [logs, setLogs] = useState<DemoLog[]>(demoLogs);
  const [backups, setBackups] = useState<DemoBackup[]>(demoBackups);
  const [syncRows, setSyncRows] = useState<DemoSync[]>(demoSyncHistory);
  const [logQuery, setLogQuery] = useState("");
  const [logSeverity, setLogSeverity] = useState("Toutes");
  const [logComponent, setLogComponent] = useState("Tous");
  const [selected, setSelected] = useState<Detail | null>(null);
  const [confirm, setConfirm] = useState<"backup" | "restore" | "restart" | "maintenance" | "sync" | "health" | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [restoreStep, setRestoreStep] = useState(1);

  const localDown = states.server === "down" || states.database === "down" || states.lan === "down";
  const overall: HealthState = localDown ? "down" : states.server === "warning" || states.database === "warning" || states.lan === "warning" ? "warning" : "healthy";
  const overallLabel = localDown ? "Dégradé — disponibilité locale compromise" : overall === "warning" ? "Attention requise" : "Opérationnel localement";
  const filteredLogs = useMemo(() => logs.filter((log) =>
    (logSeverity === "Toutes" || log.severity === logSeverity) &&
    (logComponent === "Tous" || log.component === logComponent) &&
    (log.message + " " + log.id + " " + log.details).toLowerCase().includes(logQuery.toLowerCase())
  ), [logs, logSeverity, logComponent, logQuery]);

  function refresh() {
    setLastCheck(new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) + " · démonstration");
    setNotice("Actualisation de démonstration terminée. Aucun contrôle réel du serveur n’a été exécuté.");
  }
  function simulate(kind: NonNullable<typeof confirm>) {
    setBusy(true);
    const now = new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
    if (kind === "backup") {
      setBackups((rows) => [{ id: "BK-DEMO-" + String(Date.now()).slice(-4), at: now, type: "Manuelle", size: "—", status: "Vérification requise", destination: "Destination fictive", note: "Sauvegarde simulée : aucun fichier n’a été créé.", verified: false }, ...rows]);
      setNotice("Simulation terminée : aucune sauvegarde réelle n’a été créée.");
    } else if (kind === "sync") {
      setSyncRows((rows) => [{ id: "SYNC-DEMO-" + String(Date.now()).slice(-3), at: now, operation: "Tentative manuelle", records: 18, status: "Échec", detail: "Simulation locale : aucune connexion ni transmission réelle." }, ...rows]);
      setNotice("Tentative de synchronisation simulée. Les données réelles n’ont pas été transmises.");
    } else if (kind === "maintenance") {
      setMaintenance((v) => !v);
      setNotice("État du mode maintenance modifié dans la démonstration uniquement.");
    } else if (kind === "health") {
      setLastCheck(now + " · simulation");
      setNotice("Diagnostic simulé terminé. Aucune commande système n’a été exécutée.");
    } else if (kind === "restart") {
      setNotice("Redémarrage non exécuté : aucune commande de gestion de services n’est connectée.");
    } else if (kind === "restore") {
      setRestoreStep(3);
      setNotice("Restauration non exécutée : aucun fichier de sauvegarde réel n’est disponible.");
    }
    setBusy(false);
    setConfirm(null);
  }
  function showDetail(title: string, description: string, rows: [string, string][]) {
    setSelected({ title, description, rows });
  }
  if (!allowed) return <main className="sys-page"><div className="sys-denied"><LockKeyhole size={28}/><h1>Accès non autorisé</h1><p>Votre compte ne dispose pas de l’autorisation nécessaire pour consulter les paramètres système.</p></div></main>;

  const healthCards = [
    { key: "server", label: "Serveur local", detail: "Application locale", state: states.server, icon: Server, local: true },
    { key: "database", label: "Base de données", detail: "Connexion non vérifiée par un backend", state: states.database, icon: Database, local: true },
    { key: "lan", label: "Réseau local", detail: "Connectivité LAN simulée", state: states.lan, icon: Network, local: true },
    { key: "backup", label: "Sauvegarde", detail: "Dernière référence fictive", state: states.backup, icon: Archive, local: true },
    { key: "internet", label: "Internet", detail: "Connectivité externe simulée", state: states.internet, icon: Wifi, local: false },
    { key: "central", label: "Plateforme centrale", detail: "Service externe simulé", state: states.central, icon: Zap, local: false },
  ] as const;

  return <main className="sys-page">
    <div className="sys-breadcrumb">Paramètres <ChevronRight size={13}/> <strong>System Settings</strong></div>
    <header className="sys-header">
      <div><span className="sys-eyebrow">ADMINISTRATION TECHNIQUE</span><h1>System Settings</h1><p>Surveillez l’infrastructure locale, les sauvegardes, la synchronisation et l’état général du système.</p></div>
      <div className="sys-header-actions"><span className="sys-env">ENVIRONNEMENT · DÉMONSTRATION</span><button className="sys-btn secondary" onClick={refresh}><RefreshCw size={15}/>Actualiser</button></div>
    </header>
    <div className="sys-demo-banner"><Info size={18}/><div><strong>Mode démonstration — données fictives, aucune opération réelle sur le serveur.</strong><p>Ce dépôt ne contient pas de service de supervision, de sauvegarde, de synchronisation centrale ni de maintenance système. Les états et actions ci-dessous illustrent l’expérience attendue sans toucher à l’infrastructure.</p></div></div>
    {notice && <div className="sys-notice"><CheckCircle2 size={16}/><span>{notice}</span><button onClick={() => setNotice("")}><X size={14}/></button></div>}
    <div className="sys-health-strip"><div className="sys-health-main"><StatePill state={overall}>{overallLabel}</StatePill><p>{localDown ? "Une dépendance locale est indisponible dans le scénario. L’accès des utilisateurs peut être compromis." : "Les services locaux sont présentés comme disponibles. Une panne Internet ou centrale n’interrompt pas automatiquement le travail sur le réseau local."}</p></div><div className="sys-health-meta"><span>Dernière vérification <strong>{lastCheck}</strong></span><span>Version affichée <strong>{demoInfrastructure.appVersion} · exemple</strong></span></div></div>

    <div className="sys-layout">
      <aside className="sys-sidebar"><span className="sys-sidebar-label">ESPACE TECHNIQUE</span>{tabs.map((item, index) => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><Icon size={16}/><span>{item.label}</span>{tab === item.id && <ChevronRight size={14}/>}</button>; })}<div className="sys-sidebar-note"><ShieldCheck size={16}/><p>Les actions sensibles restent désactivées tant qu’aucun backend autorisé n’est connecté.</p></div></aside>
      <div className="sys-content">
        {tab === "overview" && <>
          <div className="sys-section-intro"><div><h2>Vue d’ensemble</h2><p>État des composants locaux et des services externes.</p></div><span className="sys-demo-tag">ÉTATS SIMULÉS</span></div>
          <div className="sys-health-grid">{healthCards.map((card) => { const Icon = card.icon; return <button className="sys-health-card" key={card.key} onClick={() => showDetail(card.label, card.local ? "Composant local de démonstration. Aucun contrôle technique réel n’est exécuté." : "Service externe de démonstration. Son indisponibilité ne détermine pas la disponibilité locale.", [["État illustratif", card.state === "healthy" ? "Opérationnel" : card.state === "warning" ? "Attention requise" : card.state === "down" ? "Indisponible" : "Non vérifié"], ["Dernier contrôle", lastCheck], ["Source", "Données fictives"], ["Impact local", card.local ? "Peut affecter les opérations locales selon la dépendance" : "N’interrompt pas à elle seule le fonctionnement local"]])}><span className="sys-card-icon"><Icon size={18}/></span><span className="sys-card-title">{card.label}</span><StatePill state={card.state}>{card.state === "healthy" ? (card.key === "backup" ? "Réussie (exemple)" : card.key === "central" ? "Connectée (exemple)" : "Opérationnel") : card.state === "warning" ? "Attention" : card.state === "down" ? (card.key === "internet" ? "Déconnecté" : card.key === "central" ? "Déconnectée" : "Indisponible") : "Non vérifié"}</StatePill><small>{card.detail}</small></button>; })}</div>
          <div className="sys-local-external"><div><span className="sys-block-label">DISPONIBILITÉ LOCALE</span><strong><CheckCircle2 size={17}/> Application utilisable sur le réseau local</strong><p>Serveur, base de données et LAN sont indépendants de l’accès Internet dans l’architecture cible. Les valeurs affichées sont ici simulées.</p></div><div><span className="sys-block-label">CONNECTIVITÉ EXTERNE</span><strong><WifiOff size={17}/> Internet et plateforme centrale indisponibles</strong><p>Les opérations en attente doivent rester locales jusqu’au rétablissement de la connexion.</p></div></div>
          <div className="sys-metrics-grid"><Metric label="Utilisation CPU" value="Non mesurée" hint="Service système absent" icon={Activity}/><Metric label="Mémoire disponible" value="Non mesurée" hint="Service système absent" icon={Laptop}/><Metric label="Espace disque" value="86 Go · exemple" hint="Valeur fictive, non mesurée" icon={HardDrive}/><Metric label="Éléments en attente" value="18 · exemple" hint="File de synchronisation fictive" icon={RefreshCw}/></div>
          <Panel title="État des services essentiels" description="Inventaire illustratif ; aucun processus système n’est interrogé."><div className="sys-service-list">{demoServices.map((service) => <div key={service.name}><span><i className={"sys-dot " + service.state}/>{service.name}</span><StatePill state={service.state}/><small>{service.info}</small></div>)}</div></Panel>
        </>}
        {tab === "server" && <>
          <div className="sys-section-intro"><div><h2>Serveur local</h2><p>Informations d’hôte et état des services de l’installation.</p></div><span className="sys-demo-tag">DONNÉES FICTIVES</span></div>
          <Panel title="Informations du serveur" description="Toutes les valeurs d’identification ci-dessous sont des exemples."><div className="sys-info-grid"><Metric label="Nom d’hôte" value={demoInfrastructure.hostname} hint="Exemple" icon={Server}/><Metric label="Adresse IP locale" value={demoInfrastructure.localIp} hint="Exemple RFC1918" icon={Network}/><Metric label="Temps de fonctionnement" value={demoInfrastructure.uptime} hint="Non mesuré" icon={Clock3}/><Metric label="Version application" value={demoInfrastructure.appVersion} hint="Version package" icon={Activity}/></div><div className="sys-key-values"><span>Dernier redémarrage <strong>Non disponible</strong></span><span>Système d’exploitation <strong>{demoInfrastructure.os}</strong></span><span>Dernier contrôle <strong>{lastCheck}</strong></span></div></Panel>
          <Panel title="Ressources système" description="Aucune métrique CPU ou mémoire n’est exposée par le projet."><div className="sys-unavailable-grid"><div><Activity/><strong>Processeur</strong><span>Non mesuré</span></div><div><Laptop/><strong>Mémoire</strong><span>Non mesurée</span></div><div><HardDrive/><strong>Disque</strong><span>Exemple uniquement · 66 %</span></div></div></Panel>
          <Panel title="Services essentiels"><div className="sys-service-list">{demoServices.map((s) => <div key={s.name}><span><i className={"sys-dot "+s.state}/>{s.name}</span><StatePill state={s.state}/><small>{s.info}</small><button className="sys-link-btn" onClick={() => showDetail(s.name, "État illustratif ; aucun service système n’est interrogé.", [["État", s.state], ["Information", s.info], ["Source", "Fixture locale"]])}>Détails</button></div>)}</div></Panel>
        </>}
        {tab === "storage" && <>
          <div className="sys-section-intro"><div><h2>Base de données et stockage</h2><p>Distinguez la base de données, les fichiers applicatifs et le disque physique.</p></div><span className="sys-demo-tag">NON CONNECTÉ</span></div>
          <Panel title="Base de données" description="Le dépôt ne contient actuellement aucun adaptateur de connexion à une base de données."><div className="sys-database-card"><Database size={22}/><div><strong>Connexion non vérifiée</strong><span>Moteur : {demoInfrastructure.database.engine} · exemple non confirmé</span></div><StatePill state="unknown">Non vérifié</StatePill></div><div className="sys-key-values"><span>Version <strong>{demoInfrastructure.database.version}</strong></span><span>Taille <strong>{demoInfrastructure.database.size}</strong></span><span>Dernière connexion réussie <strong>Non disponible</strong></span></div></Panel>
          <Panel title="Stockage des fichiers" description="Capacité fictive pour illustrer la présentation des seuils."><div className="sys-storage-top"><div><span>Disque local de démonstration</span><strong>164 Go utilisés <small>/ 250 Go</small></strong></div><span className="sys-demo-tag">EXEMPLE</span></div><div className="sys-storage-bar"><i style={{width:"66%"}}/></div><div className="sys-storage-legend"><span>Utilisé <strong>164 Go</strong></span><span>Disponible <strong>86 Go</strong></span><span>Total <strong>250 Go</strong></span></div><div className="sys-info-callout"><Info size={16}/><p>Ces valeurs ne proviennent pas du système de fichiers. La capacité du disque, la taille de la base et le stockage documentaire ne sont pas additionnés : ils peuvent partager le même support physique.</p></div></Panel>
          <Panel title="Capacités non disponibles"><div className="sys-capability-rows"><span>Emplacement réel des fichiers <strong>Non exposé</strong></span><span>Nombre de fichiers <strong>Non mesuré</strong></span><span>Seuil d’alerte configuré <strong>Non disponible</strong></span><span>Accès au stockage <strong>Non vérifié</strong></span></div></Panel>
        </>}
        {tab === "network" && <>
          <div className="sys-section-intro"><div><h2>Réseau et connectivité</h2><p>La connectivité locale est indépendante des services Internet et centraux.</p></div><span className="sys-demo-tag">SCÉNARIO HORS LIGNE</span></div>
          <div className="sys-scenario-control"><label htmlFor="sys-scenario">Scénario réseau de démonstration</label><select id="sys-scenario" defaultValue="offline" onChange={(e)=>{const v=e.target.value;setStates(v==="lan-down"?{...initialStates,lan:"down"}:v==="db-down"?{...initialStates,database:"down"}:v==="online"?{server:"healthy",database:"healthy",lan:"healthy",internet:"healthy",central:"healthy",backup:"healthy"}:initialStates);}}><option value="offline">Internet et plateforme centrale indisponibles</option><option value="online">Toutes les connexions disponibles</option><option value="lan-down">Réseau local indisponible</option><option value="db-down">Base de données indisponible</option></select><small>Modifie uniquement les indicateurs de démonstration ; aucun contrôle réseau réel.</small></div><div className="sys-connectivity-grid"><article><span className="sys-card-icon"><Network/></span><h3>Réseau local (LAN)</h3><StatePill state={states.lan}>{states.lan==="healthy"?"Connecté · exemple":states.lan==="down"?"Déconnecté · exemple":"Non vérifié"}</StatePill><p>Les utilisateurs sont présentés comme pouvant accéder au serveur local.</p><small>Adresse serveur · {demoInfrastructure.localIp}</small></article><article><span className="sys-card-icon"><WifiOff/></span><h3>Connexion Internet</h3><StatePill state={states.internet}>{states.internet==="healthy"?"Connectée · exemple":states.internet==="down"?"Déconnectée · exemple":"Non vérifiée"}</StatePill><p>Une panne Internet ne constitue pas automatiquement une panne de l’application locale.</p><small>Dernier succès réel · Non disponible</small></article><article><span className="sys-card-icon"><Zap/></span><h3>Plateforme centrale</h3><StatePill state={states.central}>{states.central==="healthy"?"Connectée · exemple":states.central==="down"?"Déconnectée · exemple":"Non vérifiée"}</StatePill><p>Le service externe n’est pas joignable dans ce scénario fictif.</p><small>Dernière communication réelle · Non disponible</small></article></div>
          <div className="sys-info-callout"><Info size={17}/><p>La connexion Internet est indisponible. Les utilisateurs peuvent continuer à accéder à l’application via le réseau local tant que le serveur et le réseau local fonctionnent correctement.</p></div>
          <Panel title="État de la synchronisation" description="La plateforme centrale est un service externe. Les enregistrements locaux ne doivent pas être supprimés en cas d’échec."><div className="sys-key-values"><span>Dernière synchronisation réussie <strong>Non disponible</strong></span><span>Prochaine synchronisation <strong>Non configurée</strong></span><span>En attente <strong>18 · exemple fictif</strong></span><span>Échecs <strong>1 · exemple fictif</strong></span><span>Conflits à examiner <strong>0 · exemple fictif</strong></span></div><button className="sys-btn secondary" onClick={() => setTab("sync")}>Ouvrir la synchronisation <ArrowRight size={14}/></button></Panel>
        </>}
        {tab === "backup" && <>
          <div className="sys-section-intro"><div><h2>Sauvegarde et restauration</h2><p>Consultez les références illustratives et les limites de protection actuelles.</p></div><button className="sys-btn primary" onClick={() => setConfirm("backup")}><Archive size={15}/>Lancer une sauvegarde</button></div>
          <div className="sys-info-callout warning"><AlertTriangle size={17}/><p><strong>Sauvegarde automatique non configurée.</strong> Les entrées ci-dessous sont fictives. Aucun fichier n’a été créé, et aucune restauration n’est possible.</p></div>
          <div className="sys-backup-summary"><Metric label="Fréquence automatique" value="Non configurée" hint="Aucun planificateur détecté" icon={Clock3}/><Metric label="Dernière sauvegarde réussie" value="Non disponible" hint="Référence fictive uniquement" icon={CheckCircle2}/><Metric label="Destination" value="Non configurée" hint="Aucun stockage de sauvegarde" icon={HardDrive}/></div>
          <Panel title="Historique des sauvegardes" description="Historique de démonstration, non restaurable."><div className="sys-table-wrap"><table className="sys-table"><thead><tr><th>Référence / Date</th><th>Type</th><th>Taille</th><th>Statut</th><th>Destination</th><th></th></tr></thead><tbody>{backups.map((b) => <tr key={b.id}><td><strong>{b.id}</strong><small>{b.at}</small></td><td>{b.type}</td><td>{b.size}</td><td><span className={"sys-status-text "+(b.status==="Réussie"?"ok":b.status==="Échec"?"bad":"warn")}>{b.status}</span></td><td>{b.destination}</td><td><button className="sys-link-btn" onClick={() => showDetail(b.id, b.note, [["Date",b.at],["Type",b.type],["Taille",b.size],["Statut",b.status],["Intégrité","Non vérifiée"],["Restaurable","Non — aucune archive réelle"]])}>Détails</button></td></tr>)}</tbody></table></div></Panel>
          <Panel title="Restauration" description="Une restauration réelle est bloquée tant qu’aucun service de sauvegarde n’est connecté."><button className="sys-btn danger-outline" onClick={() => { setRestoreStep(1); setConfirm("restore"); }}>Examiner une restauration</button><p className="sys-muted">Aucune sauvegarde réelle sélectionnable. Le parcours de confirmation est une démonstration de sécurité uniquement.</p></Panel>
        </>}
        {tab === "sync" && <>
          <div className="sys-section-intro"><div><h2>Synchronisation centrale</h2><p>Suivez les opérations locales en attente de la plateforme externe.</p></div><button className="sys-btn primary" onClick={() => setConfirm("sync")}><RefreshCw size={15}/>Synchroniser maintenant</button></div>
          <div className="sys-sync-banner"><WifiOff size={20}/><div><strong>Connexion centrale indisponible · scénario de démonstration</strong><p>Les données enregistrées localement restent disponibles. Les opérations en attente seront synchronisées lorsque la connexion à la plateforme centrale sera rétablie.</p></div></div>
          <div className="sys-metrics-grid"><Metric label="Opérations en attente" value="18 · exemple" hint="Pas de file réelle connectée" icon={Clock3}/><Metric label="Opérations échouées" value="1 · exemple" hint="Échec illustratif" icon={AlertCircle}/><Metric label="Conflits à examiner" value="0 · exemple" hint="Aucun moteur de conflit connecté" icon={ShieldAlert}/><Metric label="Dernier succès réel" value="Non disponible" hint="Aucune trace backend" icon={CheckCircle2}/></div>
          <Panel title="Historique de synchronisation" description="Les références SYNC-DEMO ne correspondent à aucune opération réseau."><div className="sys-table-wrap"><table className="sys-table"><thead><tr><th>Date</th><th>Type d’opération</th><th>Enregistrements</th><th>Résultat</th><th>Référence</th><th></th></tr></thead><tbody>{syncRows.map((s) => <tr key={s.id}><td>{s.at}</td><td>{s.operation}</td><td>{s.records}</td><td><span className={"sys-status-text "+(s.status==="Réussie"?"ok":s.status==="Échec"?"bad":"warn")}>{s.status}</span></td><td>{s.id}</td><td><button className="sys-link-btn" onClick={() => showDetail(s.id,s.detail,[["Date",s.at],["Opération",s.operation],["Enregistrements",String(s.records)],["Résultat",s.status],["Nature","Simulation locale"]])}>Détails</button></td></tr>)}</tbody></table></div></Panel>
          <div className="sys-info-callout"><ShieldCheck size={17}/><p>Aucune donnée locale n’est supprimée après un échec simulé. Aucun conflit ne peut être résolu ici sans le workflow de synchronisation réel.</p></div>
        </>}
        {tab === "logs" && <>
          <div className="sys-section-intro"><div><h2>Journaux et diagnostics</h2><p>Filtrez les événements techniques fictifs sans dupliquer le module Audit et activités.</p></div><button className="sys-btn secondary" onClick={refresh}><RefreshCw size={14}/>Actualiser</button></div>
          <Panel title="Filtres des diagnostics"><div className="sys-filters"><label className="sys-search"><Search size={15}/><input value={logQuery} onChange={(e)=>setLogQuery(e.target.value)} placeholder="Rechercher un événement ou une référence"/></label><select value={logSeverity} onChange={e=>setLogSeverity(e.target.value)}><option>Toutes</option><option>Information</option><option>Avertissement</option><option>Erreur</option><option>Critique</option></select><select value={logComponent} onChange={e=>setLogComponent(e.target.value)}><option>Tous</option>{Array.from(new Set(logs.map(l=>l.component))).map(c=><option key={c}>{c}</option>)}</select></div><div className="sys-table-wrap"><table className="sys-table"><thead><tr><th>Date et heure</th><th>Composant</th><th>Gravité</th><th>Description</th><th>Statut</th><th></th></tr></thead><tbody>{filteredLogs.map((l)=><tr key={l.id}><td>{l.at}<small>{l.id}</small></td><td>{l.component}</td><td><span className={"sys-severity "+(l.severity==="Critique"?"critical":l.severity==="Erreur"?"error":l.severity==="Avertissement"?"warning":"info")}>{l.severity}</span></td><td className="sys-log-message">{l.message}</td><td>{l.status}</td><td><button className="sys-link-btn" onClick={()=>showDetail(l.id,l.details,[["Date",l.at],["Composant",l.component],["Gravité",l.severity],["Statut",l.status],["Référence",l.id],["Détails","Aucune donnée sensible ou secret n’est exposé dans les fixtures"]])}>Détails</button></td></tr>)}</tbody></table>{filteredLogs.length===0&&<div className="sys-empty"><FileSearch size={22}/><strong>Aucun événement trouvé</strong><span>Modifiez les filtres ou la recherche.</span></div>}</div><div className="sys-table-foot">{filteredLogs.length} événement(s) · données fictives · export non disponible</div></Panel>
        </>}
        {tab === "maintenance" && <>
          <div className="sys-section-intro"><div><h2>Maintenance et actions système</h2><p>Zone protégée : les opérations réelles ne sont pas disponibles dans cette version.</p></div><span className="sys-demo-tag">AUCUN BACKEND</span></div>
          <div className="sys-maintenance-warning"><ShieldAlert size={21}/><div><strong>Les actions système sont désactivées en production.</strong><p>Aucun gestionnaire de services, mode maintenance backend ou moteur de diagnostic n’est connecté à cette application.</p></div></div>
          <Panel title="Mode maintenance" description="État purement local de démonstration."><div className="sys-maintenance-row"><div><strong>{maintenance?"Mode maintenance activé (démo)":"Mode maintenance désactivé (démo)"}</strong><p>Ce commutateur ne bloque aucun utilisateur et ne change aucun accès.</p></div><StatePill state={maintenance?"warning":"unknown"}>{maintenance?"Actif · démo":"Non activé"}</StatePill><button className="sys-btn secondary" onClick={()=>setConfirm("maintenance")}>{maintenance?"Désactiver":"Activer"} le mode maintenance</button></div></Panel>
          <Panel title="Opérations disponibles dans la démonstration"><div className="sys-operation-list"><div><span><RefreshCw/>Vérification complète du système</span><p>Afficher un résultat illustratif sans commande système.</p><button className="sys-btn secondary" onClick={()=>setConfirm("health")}>Lancer le diagnostic</button></div><div><span><RotateCcw/>Redémarrage des services de l’application</span><p>Non connecté : aucune interruption de service n’est provoquée.</p><button className="sys-btn secondary" onClick={()=>setConfirm("restart")}>Examiner l’opération</button></div></div></Panel>
          <div className="sys-info-callout"><LockKeyhole size={17}/><p>Une restauration, un redémarrage ou une modification de maintenance réelle nécessitera une autorisation vérifiée côté serveur et une entrée dans le journal d’audit existant.</p></div>
        </>}
      </div>
    </div>

    {selected && <div className="sys-overlay" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelected(null);}}><section className="sys-drawer" role="dialog" aria-modal="true" aria-label={selected.title}><div className="sys-drawer-head"><div><span>DÉTAIL TECHNIQUE</span><h2>{selected.title}</h2></div><button onClick={()=>setSelected(null)} aria-label="Fermer"><X/></button></div><p>{selected.description}</p><div className="sys-detail-rows">{selected.rows.map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div><div className="sys-drawer-footer"><span>Mode démonstration · aucune donnée réelle</span><button className="sys-btn secondary" onClick={()=>setSelected(null)}>Fermer</button></div></section></div>}
    {confirm && <div className="sys-overlay"><section className="sys-confirm" role="dialog" aria-modal="true" aria-labelledby="sys-confirm-title"><span className="sys-confirm-icon"><AlertTriangle size={21}/></span><h2 id="sys-confirm-title">{confirm==="backup"?"Lancer une sauvegarde de démonstration ?":confirm==="restore"?"Parcours de restauration — étape "+restoreStep:confirm==="restart"?"Redémarrer les services ?":confirm==="maintenance"?(maintenance?"Désactiver":"Activer")+" le mode maintenance ?":confirm==="sync"?"Lancer une synchronisation simulée ?":"Lancer une vérification simulée ?"}</h2><p>{confirm==="backup"?"Cette action ajoute une référence fictive à l’historique. Aucun fichier ne sera créé et aucune ressource serveur ne sera utilisée.":confirm==="restore"?(restoreStep===1?"Étape 1 — Sélection : aucune sauvegarde réelle n’est disponible. La référence illustrative n’est pas restaurable.":restoreStep===2?"Étape 2 — Impact : une restauration réelle pourrait remplacer les données actuelles et interrompre le service. Aucun mécanisme de pré-sauvegarde ni de retour arrière n’est connecté.":"Étape 3 — Résultat : la restauration est bloquée. Aucune donnée n’a été modifiée.") :confirm==="restart"?"Aucun service géré n’est configuré. Aucun redémarrage ne sera effectué.":confirm==="maintenance"?"Ce changement ne concerne que l’indicateur local de démonstration. Aucun utilisateur ne sera bloqué.":confirm==="sync"?"Une tentative fictive sera ajoutée à l’historique. Aucun enregistrement ne sera envoyé ni supprimé.":"Un résultat illustratif sera affiché. Aucune commande ou vérification système ne sera exécutée."}</p>{confirm==="restore"&&<div className="sys-restore-steps"><span className={restoreStep===1?"active":""}>1 · Sélection</span><span className={restoreStep===2?"active":""}>2 · Impact</span><span className={restoreStep===3?"active":""}>3 · Résultat</span></div>}<div className="sys-confirm-actions"><button className="sys-btn secondary" onClick={()=>setConfirm(null)}>Annuler</button><button className="sys-btn primary" disabled={busy} onClick={()=>{if(confirm==="restore"){if(restoreStep===1)setRestoreStep(2);else if(restoreStep===2){setRestoreStep(3);setNotice("Restauration bloquée : aucune sauvegarde réelle n’est disponible. Aucune donnée n’a été modifiée.");}else setConfirm(null);}else simulate(confirm);}}>{busy?"Traitement…":confirm==="restore"?(restoreStep===1?"Continuer vers l’impact":restoreStep===2?"Confirmer le blocage (démo)":"Terminer"):confirm==="restart"?"Confirmer l’examen":"Confirmer (démo)"}</button></div></section></div>}
  </main>;
}
