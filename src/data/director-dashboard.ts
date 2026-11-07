export type DashboardRange = "7" | "30" | "90";

export const dashboardRangeOptions: { value: DashboardRange; label: string }[] = [
  { value: "7", label: "7 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "90 derniers jours" },
];

export const directorKpis = [
  { id: "students", label: "Élèves inscrits", value: "1 248", detail: "1 216 élèves actifs", trend: "+4,8 %", direction: "up" as const, icon: "students", route: "/students" },
  { id: "teachers", label: "Enseignants", value: "86", detail: "82 en activité", trend: "+2 ce trimestre", direction: "up" as const, icon: "teachers", route: "/teachers" },
  { id: "employees", label: "Personnel", value: "34", detail: "32 membres actifs", trend: "2 postes à pourvoir", direction: "neutral" as const, icon: "employees", route: "/employees" },
  { id: "attendance", label: "Présence aujourd’hui", value: "94,2 %", detail: "1 176 présents · 49 absents", trend: "+1,6 pt", direction: "up" as const, icon: "attendance", route: "/student-attendance" },
  { id: "performance", label: "Moyenne générale", value: "14,6/20", detail: "Toutes les classes", trend: "+0,4 pt", direction: "up" as const, icon: "performance", route: "/pedagogical-reports" },
  { id: "outstanding", label: "Impayés à recouvrer", value: "184 500 DH", detail: "127 dossiers concernés", trend: "−6,2 %", direction: "up" as const, icon: "payments", route: "/financial-reports" },
];

export const academicLevels = [
  { label: "Primaire", value: 13.8, students: 420 },
  { label: "Collège", value: 14.2, students: 468 },
  { label: "Lycée", value: 15.1, students: 360 },
];

export const classPerformance = [
  { label: "6e A", value: 15.2 }, { label: "5e B", value: 14.7 },
  { label: "4e A", value: 13.9 }, { label: "3e B", value: 15.6 },
  { label: "2e A", value: 14.4 }, { label: "1re B", value: 15.8 },
];

export const academicTrend = [
  { label: "T1 25/26", value: 13.7 }, { label: "T2 25/26", value: 14.0 },
  { label: "T3 25/26", value: 14.2 }, { label: "T1 26/27", value: 14.6 },
];

export const studentDistribution = [
  { label: "Filles", value: 612, color: "var(--color-primary)" },
  { label: "Garçons", value: 636, color: "var(--color-secondary)" },
];

export const attendanceSeries = [
  { label: "Lun", present: 94, absent: 4, late: 2 },
  { label: "Mar", present: 95, absent: 3, late: 2 },
  { label: "Mer", present: 92, absent: 5, late: 3 },
  { label: "Jeu", present: 96, absent: 2, late: 2 },
  { label: "Ven", present: 94, absent: 4, late: 2 },
  { label: "Lun", present: 93, absent: 5, late: 2 },
  { label: "Mar", present: 94, absent: 4, late: 2 },
];

export const studentsAtRisk = [
  { id: "EL-0248", name: "Adam El Mansouri", initials: "AE", className: "3e B", risk: "Absences répétées", reason: "6 absences en 30 jours", status: "En cours", tone: "amber" },
  { id: "EL-0183", name: "Lina Berrada", initials: "LB", className: "2e A", risk: "Baisse des résultats", reason: "Moyenne en baisse de 3 points", status: "À démarrer", tone: "red" },
  { id: "EL-0391", name: "Omar Chraïbi", initials: "OC", className: "5e B", risk: "Impayés", reason: "2 échéances non réglées", status: "En cours", tone: "amber" },
  { id: "EL-0117", name: "Sara Alaoui", initials: "SA", className: "1re B", risk: "Absences répétées", reason: "4 retards cette semaine", status: "Résolu", tone: "green" },
];

export const pendingApprovals = [
  { id: "grades", title: "Notes à valider", count: 18, detail: "Dans 6 classes", route: "/grades-validation", icon: "grades" },
  { id: "reports", title: "Rapports pédagogiques", count: 4, detail: "En attente de lecture", route: "/pedagogical-reports", icon: "reports" },
  { id: "courses", title: "Cours à approuver", count: 3, detail: "Soumis par les enseignants", route: "/courses-exercises", icon: "courses" },
  { id: "exercises", title: "Exercices à approuver", count: 7, detail: "En attente de validation", route: "/courses-exercises", icon: "exercises" },
];

export const revenueByRange: Record<DashboardRange, { label: string; amount: number }[]> = {
  "7": [{ label: "Lun", amount: 18 }, { label: "Mar", amount: 24 }, { label: "Mer", amount: 20 }, { label: "Jeu", amount: 31 }, { label: "Ven", amount: 27 }, { label: "Sam", amount: 16 }, { label: "Dim", amount: 12 }],
  "30": [{ label: "S1", amount: 62 }, { label: "S2", amount: 78 }, { label: "S3", amount: 70 }, { label: "S4", amount: 91 }],
  "90": [{ label: "Août", amount: 48 }, { label: "Sept.", amount: 76 }, { label: "Oct.", amount: 88 }, { label: "Nov.", amount: 96 }],
};

export const recentActivities = [
  { id: 1, daysAgo: 0, time: "09:42", title: "Nouvelle inscription", description: "Nour El Fassi · Classe 6e A", actor: "Salma Idrissi", type: "student" },
  { id: 2, daysAgo: 0, time: "09:18", title: "Paiement reçu", description: "Frais de scolarité · 3 500 DH", actor: "Meryem Alaoui", type: "payment" },
  { id: 3, daysAgo: 1, time: "16:05", title: "Notes validées", description: "Évaluations du trimestre · 2e A", actor: "Youssef Amrani", type: "grade" },
  { id: 4, daysAgo: 2, time: "11:30", title: "Présences enregistrées", description: "Niveau collège · 18 classes", actor: "Service de vie scolaire", type: "attendance" },
  { id: 5, daysAgo: 3, time: "10:12", title: "Cours approuvé", description: "Sciences de la vie et de la terre", actor: "Youssef Amrani", type: "course" },
  { id: 6, daysAgo: 5, time: "08:55", title: "Nouveau membre du personnel", description: "Hind Tazi · Assistante administrative", actor: "Amine Benali", type: "employee" },
  { id: 7, daysAgo: 34, time: "14:20", title: "Sortie scolaire enregistrée", description: "Visite pédagogique · Niveau lycée", actor: "Service de vie scolaire", type: "course" },
  { id: 8, daysAgo: 61, time: "10:40", title: "Réunion de rentrée", description: "Préparation de l’année scolaire 2026–2027", actor: "Amine Benali", type: "employee" },
];

export const importantAlerts = [
  { id: "attendance", severity: "critical", title: "Présences incomplètes", description: "3 classes n’ont pas encore transmis les présences.", action: "Vérifier", route: "/student-attendance" },
  { id: "absence", severity: "warning", title: "Absences répétées", description: "12 élèves dépassent le seuil d’absences.", action: "Consulter", route: "/student-risk" },
  { id: "exams", severity: "info", title: "Examens à venir", description: "Les examens du trimestre commencent dans 8 jours.", action: "Voir le calendrier", route: "/examinations" },
];

export const financialSummary = {
  collected: "1 284 000 DH",
  outstanding: "184 500 DH",
  expenses: "642 300 DH",
  comparison: "+8,4 %",
};

export type TaskPriority = "urgent" | "high" | "normal";
export type TaskDue = "today" | "week" | "later";
export type TaskStatus = "todo" | "doing" | "done";
export type TaskCategory = "validation" | "attendance" | "student" | "finance" | "pedagogy" | "event";

export interface DirectorTask {
  id: string;
  title: string;
  detail: string;
  category: TaskCategory;
  priority: TaskPriority;
  due: TaskDue;
  dueLabel: string;
  route: string;
  action: string;
  initialStatus: TaskStatus;
}

/** Everything the director must act on, in one place (replaces the separate approvals and alerts lists). */
export const directorTasks: DirectorTask[] = [
  { id: "t-attendance", title: "Présences incomplètes", detail: "3 classes n’ont pas encore transmis les présences du jour.", category: "attendance", priority: "urgent", due: "today", dueLabel: "Aujourd’hui", route: "/student-attendance", action: "Vérifier", initialStatus: "todo" },
  { id: "t-grades", title: "Valider les notes", detail: "18 notes en attente dans 6 classes.", category: "validation", priority: "urgent", due: "today", dueLabel: "Aujourd’hui", route: "/grades-validation", action: "Valider", initialStatus: "doing" },
  { id: "t-absences", title: "Suivre les absences répétées", detail: "12 élèves dépassent le seuil d’absences.", category: "student", priority: "high", due: "today", dueLabel: "Aujourd’hui", route: "/student-risk", action: "Consulter", initialStatus: "todo" },
  { id: "t-reports", title: "Lire les rapports pédagogiques", detail: "4 rapports en attente de lecture.", category: "pedagogy", priority: "high", due: "week", dueLabel: "Cette semaine", route: "/pedagogical-reports", action: "Ouvrir", initialStatus: "todo" },
  { id: "t-courses", title: "Approuver les cours", detail: "3 cours soumis par les enseignants.", category: "validation", priority: "high", due: "week", dueLabel: "Cette semaine", route: "/courses-exercises", action: "Approuver", initialStatus: "todo" },
  { id: "t-exercises", title: "Approuver les exercices", detail: "7 exercices en attente de validation.", category: "validation", priority: "normal", due: "week", dueLabel: "Cette semaine", route: "/courses-exercises", action: "Approuver", initialStatus: "todo" },
  { id: "t-balances", title: "Relancer les impayés", detail: "127 dossiers · 184 500 DH à recouvrer.", category: "finance", priority: "high", due: "week", dueLabel: "Vendredi", route: "/student-balances", action: "Voir les soldes", initialStatus: "todo" },
  { id: "t-exams", title: "Préparer les examens du trimestre", detail: "Les examens commencent dans 8 jours.", category: "event", priority: "normal", due: "later", dueLabel: "Dans 8 jours", route: "/examinations", action: "Voir le calendrier", initialStatus: "todo" },
];

export const weekAgenda = [
  { id: "a1", day: "Lun", date: "9", title: "Conseil de classe · 3e B", time: "16:00", route: "/meetings" },
  { id: "a2", day: "Mer", date: "11", title: "Réunion parents · 6e A", time: "17:30", route: "/meetings" },
  { id: "a3", day: "Jeu", date: "12", title: "Sortie pédagogique · Lycée", time: "08:30", route: "/trips-outings" },
  { id: "a4", day: "Ven", date: "13", title: "Remise des bulletins", time: "14:00", route: "/events" },
];

export const todaySnapshot = [
  { id: "present", label: "Présents", value: "1 176", tone: "success" as const },
  { id: "absent", label: "Absents", value: "49", tone: "danger" as const },
  { id: "late", label: "En retard", value: "23", tone: "warning" as const },
];
