export type HealthState = "healthy" | "warning" | "down" | "unknown";
export type DemoLog = {
  id: string; at: string; component: string; severity: "Information" | "Avertissement" | "Erreur" | "Critique";
  message: string; status: "Résolu" | "En cours" | "Ouvert"; details: string;
};
export type DemoBackup = {
  id: string; at: string; type: "Automatique" | "Manuelle" | "Avant maintenance";
  size: string; status: "Réussie" | "Échec" | "En cours" | "Vérification requise";
  destination: string; note: string; verified: boolean;
};
export type DemoSync = {
  id: string; at: string; operation: string; records: number;
  status: "En attente" | "Échec" | "Réussie"; detail: string;
};

// Fictional fixtures for the local demonstration only. No infrastructure API exists in this project.
export const demoInfrastructure = {
  checkedAt: "08/11/2026 à 22:10",
  hostname: "ecole-local-demo",
  localIp: "192.168.10.10",
  uptime: "12 j 04 h 32 min",
  appVersion: "0.1.0",
  os: "Non exposé par l’application",
  database: { engine: "PostgreSQL (exemple)", version: "Non vérifiée", size: "1,8 Go (exemple)" },
  storage: { label: "Disque local de démonstration", total: "250 Go", used: "164 Go", available: "86 Go", percent: 66 },
  resources: { cpu: "Non mesuré", memory: "Non mesurée", disk: "Non mesuré" },
  backupFrequency: "Non configurée",
  centralEndpoint: "Plateforme centrale (service externe)",
};

export const demoBackups: DemoBackup[] = [
  { id: "BK-DEMO-0042", at: "08/11/2026 02:00", type: "Automatique", size: "—", status: "Vérification requise", destination: "Stockage local (destination fictive)", note: "Enregistrement illustratif. Aucun fichier de sauvegarde n’existe.", verified: false },
  { id: "BK-DEMO-0041", at: "07/11/2026 02:00", type: "Automatique", size: "—", status: "Échec", destination: "Stockage local (destination fictive)", note: "Échec simulé pour illustrer le suivi. Aucune tâche réelle n’a été exécutée.", verified: false },
  { id: "BK-DEMO-0040", at: "06/11/2026 02:00", type: "Automatique", size: "—", status: "Réussie", destination: "Stockage local (destination fictive)", note: "Résultat historique fictif, non vérifié et non restaurable.", verified: false },
];

export const demoSyncHistory: DemoSync[] = [
  { id: "SYNC-DEMO-018", at: "08/11/2026 21:45", operation: "Mise à jour des dossiers", records: 18, status: "En attente", detail: "Les données restent dans la démonstration locale. Aucun envoi vers une plateforme centrale." },
  { id: "SYNC-DEMO-017", at: "08/11/2026 18:30", operation: "Référentiels scolaires", records: 6, status: "Échec", detail: "Connexion centrale indisponible dans le scénario fictif." },
  { id: "SYNC-DEMO-016", at: "07/11/2026 16:10", operation: "Mise à jour des dossiers", records: 12, status: "Réussie", detail: "Succès historique illustratif uniquement ; aucune synchronisation réelle." },
];

export const demoLogs: DemoLog[] = [
  { id: "LOG-DEMO-1052", at: "08/11/2026 22:10:00", component: "Réseau", severity: "Avertissement", message: "Connexion Internet indisponible dans le scénario de démonstration.", status: "En cours", details: "Le réseau local et les dépendances locales sont présentés comme disponibles. L’accès Internet n’est pas requis pour les opérations locales." },
  { id: "LOG-DEMO-1051", at: "08/11/2026 21:45:00", component: "Synchronisation", severity: "Erreur", message: "Synchronisation centrale en attente de connectivité.", status: "Ouvert", details: "18 enregistrements fictifs restent en attente. Aucune donnée réelle n’est en file d’attente." },
  { id: "LOG-DEMO-1050", at: "08/11/2026 02:00:00", component: "Sauvegarde", severity: "Avertissement", message: "Vérification de la sauvegarde requise.", status: "Ouvert", details: "La référence BK-DEMO-0042 est fictive. Aucun contrôle d’intégrité réel n’a été effectué." },
  { id: "LOG-DEMO-1049", at: "07/11/2026 17:22:14", component: "Application", severity: "Information", message: "Vérification applicative de démonstration terminée.", status: "Résolu", details: "Événement de démonstration, sans lien avec le serveur réel." },
  { id: "LOG-DEMO-1048", at: "07/11/2026 16:10:00", component: "Base de données", severity: "Information", message: "État de base de données illustratif : opérationnel.", status: "Résolu", details: "Aucune connexion à une base de données n’est testée depuis cette page." },
  { id: "LOG-DEMO-1047", at: "06/11/2026 09:30:00", component: "Stockage", severity: "Information", message: "Capacité de stockage illustrative mise à jour.", status: "Résolu", details: "Les valeurs de capacité sont des exemples fictifs et ne proviennent pas du système de fichiers." },
];

export const demoServices = [
  { name: "Application locale", state: "healthy" as HealthState, info: "État simulé · v0.1.0" },
  { name: "Base de données", state: "healthy" as HealthState, info: "Moteur non vérifié" },
  { name: "Stockage des fichiers", state: "unknown" as HealthState, info: "Service non connecté" },
  { name: "Worker de synchronisation", state: "warning" as HealthState, info: "File d’attente fictive" },
  { name: "Service de sauvegarde", state: "unknown" as HealthState, info: "Non configuré" },
];
