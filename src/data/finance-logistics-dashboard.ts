export type FinancePeriod = "month" | "lastMonth" | "academicYear" | "custom";
export type PaymentStatus = "Payé" | "En attente" | "Partiel" | "Échoué";

export const financeSchoolSettings = {
  currency: "MAD",
  locale: "fr-MA",
  academicYear: "2026–2027",
  academicYearStart: "2026-09-01",
};

export const financePayments = [
  { id: "PAY-26091", student: "Nour El Fassi", service: "Scolarité", amount: 4200, date: "2026-11-06", status: "Payé" as PaymentStatus },
  { id: "PAY-26090", student: "Adam El Mansouri", service: "Transport", amount: 650, date: "2026-11-06", status: "Payé" as PaymentStatus },
  { id: "PAY-26089", student: "Lina Berrada", service: "Cantine", amount: 480, date: "2026-11-05", status: "En attente" as PaymentStatus },
  { id: "PAY-26088", student: "Sara Alaoui", service: "Scolarité", amount: 3500, date: "2026-11-04", status: "Payé" as PaymentStatus },
  { id: "PAY-26087", student: "Omar Chraïbi", service: "Transport", amount: 650, date: "2026-11-03", status: "Partiel" as PaymentStatus },
  { id: "PAY-26086", student: "Yassine Rami", service: "Scolarité", amount: 3900, date: "2026-11-02", status: "Payé" as PaymentStatus },
  { id: "PAY-26085", student: "Imane Bennis", service: "Cantine", amount: 520, date: "2026-10-29", status: "Payé" as PaymentStatus },
  { id: "PAY-26084", student: "Mehdi Rami", service: "Scolarité", amount: 4100, date: "2026-10-24", status: "Payé" as PaymentStatus },
  { id: "PAY-26083", student: "Hind Tazi", service: "Transport", amount: 600, date: "2026-10-18", status: "Payé" as PaymentStatus },
  { id: "PAY-26082", student: "Salma Naciri", service: "Scolarité", amount: 3800, date: "2026-09-21", status: "Payé" as PaymentStatus },
  { id: "PAY-26081", student: "Karim El Fassi", service: "Cantine", amount: 450, date: "2026-09-14", status: "Payé" as PaymentStatus },
  { id: "PAY-26080", student: "Yasmine Amrani", service: "Scolarité", amount: 4000, date: "2026-09-05", status: "Payé" as PaymentStatus },
];

export const outstandingBalances = [
  { id: "BAL-101", student: "Adam El Mansouri", className: "3e B", service: "Scolarité", amount: 2800, lastPayment: "2026-10-12" },
  { id: "BAL-102", student: "Lina Berrada", className: "2e A", service: "Cantine", amount: 640, lastPayment: "2026-09-28" },
  { id: "BAL-103", student: "Omar Chraïbi", className: "5e B", service: "Transport", amount: 1200, lastPayment: "2026-10-03" },
  { id: "BAL-104", student: "Sara Alaoui", className: "1re B", service: "Scolarité", amount: 1750, lastPayment: "2026-10-20" },
  { id: "BAL-105", student: "Mehdi Rami", className: "2e A", service: "Autres services", amount: 350, lastPayment: "2026-09-15" },
];

export const rechargeRequests = [
  { id: "REQ-0261", student: "Lina Berrada", service: "Cantine", amount: 500, date: "2026-11-06", status: "À examiner" },
  { id: "REQ-0260", student: "Adam El Mansouri", service: "Transport", amount: 700, date: "2026-11-05", status: "À examiner" },
  { id: "REQ-0259", student: "Sara Alaoui", service: "Scolarité", amount: 1500, date: "2026-11-04", status: "À examiner" },
];

export const financeExpenses = [
  { id: "EXP-811", label: "Facture d’électricité", category: "Énergie", amount: 6800, date: "2026-11-05", status: "Payée" },
  { id: "EXP-810", label: "Entretien des véhicules", category: "Transport", amount: 3200, date: "2026-11-03", status: "Payée" },
  { id: "EXP-809", label: "Fournitures pédagogiques", category: "Fournitures", amount: 1850, date: "2026-10-28", status: "En attente" },
  { id: "EXP-808", label: "Maintenance informatique", category: "Maintenance", amount: 2400, date: "2026-10-20", status: "Payée" },
  { id: "EXP-807", label: "Nettoyage des locaux", category: "Services", amount: 2900, date: "2026-09-18", status: "Payée" },
];

export const transportLines = [
  { id: "TR-01", name: "Ligne Centre-ville", assigned: 34, capacity: 40, status: "Active" },
  { id: "TR-02", name: "Ligne Californie", assigned: 28, capacity: 32, status: "Active" },
  { id: "TR-03", name: "Ligne Sidi Maarouf", assigned: 19, capacity: null as number | null, status: "À vérifier" },
  { id: "TR-04", name: "Ligne Ain Sebaâ", assigned: 22, capacity: 30, status: "Active" },
];

export const upcomingTrips = [
  { id: "TRIP-31", title: "Visite du musée des sciences", date: "2026-11-12", destination: "Musée des sciences", students: 48, transport: "Bus 02 et 03", status: "À confirmer" },
  { id: "TRIP-32", title: "Sortie pédagogique", date: "2026-11-19", destination: "Jardin botanique", students: 32, transport: "Bus 01", status: "Préparatifs en cours" },
  { id: "TRIP-30", title: "Rencontre sportive", date: "2026-11-26", destination: "Complexe sportif", students: 60, transport: "Bus 01 et 04", status: "Prête" },
];

export const inventoryAlerts = [
  { id: "INV-021", item: "Rames de papier A4", quantity: 8, minimum: 20, status: "Critique" },
  { id: "INV-034", item: "Cartouches d’encre noire", quantity: 4, minimum: 8, status: "Faible" },
  { id: "INV-041", item: "Produits d’entretien", quantity: 12, minimum: 10, status: "Normal" },
  { id: "INV-052", item: "Chaises de classe", quantity: 6, minimum: 15, status: "Critique" },
];

export const recentIncidents = [
  { id: "INC-108", category: "Incident de transport", date: "2026-11-05", status: "En cours", severity: "Élevée", summary: "Incident signalé sur une ligne de transport" },
  { id: "INC-107", category: "Incident logistique", date: "2026-11-03", status: "Résolu", severity: "Faible", summary: "Équipement endommagé lors d’une activité" },
  { id: "INC-105", category: "Accident de transport", date: "2026-10-29", status: "En suivi", severity: "Modérée", summary: "Dossier transmis au responsable concerné" },
];

export const financeActivities = [
  { id: 1, date: "2026-11-06T11:42:00", title: "Paiement enregistré", detail: "Nour El Fassi · PAY-26091", actor: "Meryem Alaoui", type: "payment" },
  { id: 2, date: "2026-11-06T10:18:00", title: "Demande de recharge reçue", detail: "Lina Berrada · Cantine", actor: "Système", type: "request" },
  { id: 3, date: "2026-11-05T16:25:00", title: "Dépense enregistrée", detail: "Facture d’électricité · EXP-811", actor: "Meryem Alaoui", type: "expense" },
  { id: 4, date: "2026-11-05T14:10:00", title: "Affectation au transport", detail: "Ligne Centre-ville · 3e B", actor: "Service logistique", type: "transport" },
  { id: 5, date: "2026-11-04T09:30:00", title: "Sortie créée", detail: "Visite du musée des sciences", actor: "Service logistique", type: "trip" },
  { id: 6, date: "2026-11-03T15:05:00", title: "Article de stock mis à jour", detail: "Cartouches d’encre noire", actor: "Meryem Alaoui", type: "inventory" },
  { id: 7, date: "2026-11-03T11:20:00", title: "Incident enregistré", detail: "Incident de transport · INC-108", actor: "Service logistique", type: "incident" },
];

export const financeMonthlyFlow = [
  { month: "Juin", date: "2026-06-01", payments: 84000, expenses: 51000 },
  { month: "Juil.", date: "2026-07-01", payments: 62000, expenses: 48000 },
  { month: "Août", date: "2026-08-01", payments: 96000, expenses: 57000 },
  { month: "Sept.", date: "2026-09-01", payments: 128000, expenses: 76000 },
  { month: "Oct.", date: "2026-10-01", payments: 146000, expenses: 89000 },
  { month: "Nov.", date: "2026-11-01", payments: 82400, expenses: 42350 },
];

export const financeQuickActions = [
  { id: "payment", label: "Enregistrer un paiement", route: "/payments", permission: "finance.payments.manage" },
  { id: "expense", label: "Ajouter une dépense", route: "/expenses", permission: "finance.expenses.manage" },
  { id: "requests", label: "Examiner les demandes de recharge", route: "/student-balances?tab=requests", permission: "finance.balances.view" },
  { id: "balances", label: "Gérer les soldes des élèves", route: "/student-balances", permission: "finance.balances.view" },
  { id: "transport", label: "Gérer les lignes de transport", route: "/transport", permission: "logistics.transport.manage" },
  { id: "trip", label: "Créer une sortie", route: "/trips-outings/new", permission: "logistics.trips.manage" },
  { id: "inventory", label: "Gérer le stock", route: "/inventory", permission: "logistics.inventory.manage" },
] as const;
