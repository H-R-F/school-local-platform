export type ReviewStatus = "En attente" | "Approuvé" | "À corriger";
export type ContentKind = "Cours" | "Exercice";

export const pedagogicalKpis = [
  { id: "average", label: "Moyenne académique générale", value: "14,2/20", detail: "+0,4 point par rapport au trimestre précédent", icon: "average", trend: "+0,4", tone: "blue" },
  { id: "grades", label: "Notes en attente de validation", value: "18", detail: "Soumissions dans 6 classes", icon: "grades", tone: "amber" },
  { id: "courses", label: "Cours en attente d’approbation", value: "7", detail: "3 soumis cette semaine", icon: "courses", tone: "violet" },
  { id: "exercises", label: "Exercices en attente d’approbation", value: "12", detail: "5 soumis cette semaine", icon: "exercises", tone: "violet" },
  { id: "reports", label: "Rapports pédagogiques en attente", value: "4", detail: "2 échéances proches", icon: "reports", tone: "amber" },
  { id: "alerts", label: "Classes avec alertes académiques", value: "5", detail: "3 nécessitent un suivi prioritaire", icon: "alerts", tone: "red" },
] as const;

export const gradeSubmissions = [
  { id: "NOT-2026-018", teacher: "Nadia El Idrissi", className: "3e B", subject: "Mathématiques", term: "1er semestre", submittedAt: "06/11/2026", submittedSort: "2026-11-06", grades: 28, status: "En attente" },
  { id: "NOT-2026-017", teacher: "Omar Bennis", className: "2e A", subject: "Physique-chimie", term: "1er semestre", submittedAt: "06/11/2026", submittedSort: "2026-11-06", grades: 31, status: "En attente" },
  { id: "NOT-2026-016", teacher: "Samira Alaoui", className: "6e A", subject: "Français", term: "1er semestre", submittedAt: "05/11/2026", submittedSort: "2026-11-05", grades: 26, status: "En attente" },
  { id: "NOT-2026-015", teacher: "Yassine Rami", className: "1re B", subject: "Histoire-géographie", term: "1er semestre", submittedAt: "04/11/2026", submittedSort: "2026-11-04", grades: 24, status: "En attente" },
  { id: "NOT-2026-014", teacher: "Hind Tazi", className: "5e B", subject: "Sciences", term: "1er semestre", submittedAt: "03/11/2026", submittedSort: "2026-11-03", grades: 29, status: "En attente" },
];

export const contentReviews: {
  id: string; kind: ContentKind; title: string; teacher: string; subject: string; target: string;
  submittedAt: string; status: ReviewStatus;
}[] = [
  { id: "CRS-084", kind: "Cours", title: "Les fonctions affines", teacher: "Nadia El Idrissi", subject: "Mathématiques", target: "3e B", submittedAt: "06/11/2026", status: "En attente" },
  { id: "CRS-083", kind: "Cours", title: "La reproduction cellulaire", teacher: "Mehdi Rami", subject: "Sciences", target: "2e A", submittedAt: "05/11/2026", status: "En attente" },
  { id: "CRS-082", kind: "Cours", title: "Analyse de texte", teacher: "Samira Alaoui", subject: "Français", target: "6e A", submittedAt: "04/11/2026", status: "Approuvé" },
  { id: "CRS-081", kind: "Cours", title: "Électricité et circuits", teacher: "Omar Bennis", subject: "Physique", target: "1re B", submittedAt: "02/11/2026", status: "À corriger" },
  { id: "EX-112", kind: "Exercice", title: "Équations du premier degré", teacher: "Nadia El Idrissi", subject: "Mathématiques", target: "3e B", submittedAt: "06/11/2026", status: "En attente" },
  { id: "EX-111", kind: "Exercice", title: "Lecture et compréhension", teacher: "Samira Alaoui", subject: "Français", target: "6e A", submittedAt: "05/11/2026", status: "En attente" },
  { id: "EX-110", kind: "Exercice", title: "Les mélanges", teacher: "Mehdi Rami", subject: "Sciences", target: "2e A", submittedAt: "03/11/2026", status: "Approuvé" },
  { id: "EX-109", kind: "Exercice", title: "Travail sur les forces", teacher: "Omar Bennis", subject: "Physique", target: "1re B", submittedAt: "01/11/2026", status: "À corriger" },
];

export const performanceByLevel: Record<string, { label: string; value: number }[]> = {
  Tous: [{ label: "Primaire", value: 14.8 }, { label: "Collège", value: 13.9 }, { label: "Lycée", value: 14.5 }],
  Primaire: [{ label: "CE2", value: 15.1 }, { label: "CM1", value: 14.6 }, { label: "CM2", value: 14.8 }],
  Collège: [{ label: "6e", value: 14.3 }, { label: "5e", value: 13.7 }, { label: "4e", value: 13.8 }, { label: "3e", value: 13.9 }],
  Lycée: [{ label: "2e", value: 14.2 }, { label: "1re", value: 14.6 }, { label: "Terminale", value: 14.7 }],
};

export const performanceByClass: Record<string, { label: string; value: number }[]> = {
  Tous: [{ label: "6e A", value: 15.2 }, { label: "5e B", value: 13.8 }, { label: "3e B", value: 13.4 }, { label: "2e A", value: 14.6 }, { label: "1re B", value: 15.1 }],
  Primaire: [{ label: "CE2 A", value: 15.4 }, { label: "CM1 A", value: 14.7 }, { label: "CM2 B", value: 14.9 }],
  Collège: [{ label: "6e A", value: 15.2 }, { label: "5e B", value: 13.8 }, { label: "3e B", value: 13.4 }],
  Lycée: [{ label: "2e A", value: 14.6 }, { label: "1re B", value: 15.1 }, { label: "Tle A", value: 14.3 }],
};

export const performanceTrends: Record<string, { label: string; value: number }[]> = {
  "2026–2027": [{ label: "Sept.", value: 13.6 }, { label: "Oct.", value: 13.9 }, { label: "Nov.", value: 14.2 }],
  "2025–2026": [{ label: "T1", value: 13.4 }, { label: "T2", value: 13.8 }, { label: "T3", value: 14.1 }],
};

export const academicAlerts = [
  { id: "EL-0248", student: "Adam El Mansouri", className: "3e B", indicator: "Moyenne en baisse", average: "8,7/20", reason: "Baisse de 3,2 points sur la période", status: "Suivi en cours" },
  { id: "EL-0183", student: "Lina Berrada", className: "2e A", indicator: "Résultats faibles", average: "7,9/20", reason: "Deux évaluations sous 8/20", status: "À démarrer" },
  { id: "EL-0391", student: "Omar Chraïbi", className: "5e B", indicator: "Évaluations manquantes", average: "—", reason: "3 évaluations non renseignées", status: "À démarrer" },
  { id: "EL-0117", student: "Sara Alaoui", className: "1re B", indicator: "Moyenne en baisse", average: "9,4/20", reason: "Baisse continue sur deux périodes", status: "Suivi en cours" },
];

export const teacherReports = [
  { id: "RAP-042", teacher: "Nadia El Idrissi", className: "3e B", period: "Octobre 2026", submittedAt: "06/11/2026", status: "En attente" },
  { id: "RAP-041", teacher: "Mehdi Rami", className: "2e A", period: "Octobre 2026", submittedAt: "05/11/2026", status: "En attente" },
  { id: "RAP-040", teacher: "Samira Alaoui", className: "6e A", period: "Septembre 2026", submittedAt: "03/11/2026", status: "Approuvé" },
  { id: "RAP-039", teacher: "Omar Bennis", className: "1re B", period: "Septembre 2026", submittedAt: "02/11/2026", status: "À corriger" },
] as const;

export const timetableOverview = {
  scheduledClasses: 37, missingClasses: 5, updatesThisWeek: 8,
  today: [
    { time: "08:00 – 09:00", className: "3e B", subject: "Mathématiques", teacher: "Nadia El Idrissi", room: "Salle 12" },
    { time: "09:00 – 10:00", className: "2e A", subject: "Sciences", teacher: "Mehdi Rami", room: "Laboratoire 2" },
    { time: "10:30 – 11:30", className: "6e A", subject: "Français", teacher: "Samira Alaoui", room: "Salle 04" },
  ],
  tasks: ["Compléter les emplois du temps de 5 classes", "Valider les changements de salles de la semaine prochaine"],
};

export const badgeOverview = {
  total: 18,
  badges: [
    { id: "excellence", name: "Excellence académique", icon: "award", assignments: 42 },
    { id: "progress", name: "Progression remarquable", icon: "trending", assignments: 28 },
    { id: "participation", name: "Participation active", icon: "star", assignments: 19 },
  ],
  recent: [
    { id: "BA-208", student: "Lina Berrada", badge: "Progression remarquable", date: "06/11/2026" },
    { id: "BA-207", student: "Adam El Mansouri", badge: "Participation active", date: "05/11/2026" },
  ],
};

export const pedagogicalActivities = [
  { id: 1, date: "06/11/2026 · 11:20", title: "Notes soumises à validation", detail: "Mathématiques · Classe 3e B", actor: "Nadia El Idrissi", type: "grade" },
  { id: 2, date: "06/11/2026 · 10:45", title: "Nouveau cours soumis", detail: "Les fonctions affines · 3e B", actor: "Nadia El Idrissi", type: "course" },
  { id: 3, date: "06/11/2026 · 09:30", title: "Rapport pédagogique transmis", detail: "Période : octobre 2026 · 2e A", actor: "Mehdi Rami", type: "report" },
  { id: 4, date: "05/11/2026 · 16:10", title: "Exercice approuvé", detail: "Les mélanges · 2e A", actor: "Youssef Amrani", type: "exercise" },
  { id: 5, date: "05/11/2026 · 14:05", title: "Emploi du temps mis à jour", detail: "Classe 1re B · Salle 08", actor: "Service pédagogique", type: "timetable" },
  { id: 6, date: "05/11/2026 · 11:30", title: "Badge attribué à un élève", detail: "Progression remarquable · Lina Berrada", actor: "Youssef Amrani", type: "badge" },
];

export const pedagogicalQuickActions = [
  { id: "grades", label: "Examiner les notes", route: "/grades-validation", permission: "pedagogy.grades.view", icon: "grades" },
  { id: "courses", label: "Examiner les cours", route: "/courses-exercises?tab=courses", permission: "pedagogy.content.view", icon: "courses" },
  { id: "exercises", label: "Examiner les exercices", route: "/courses-exercises?tab=exercises", permission: "pedagogy.content.view", icon: "exercises" },
  { id: "reports", label: "Examiner les rapports pédagogiques", route: "/pedagogical-reports", permission: "pedagogy.reports.view", icon: "reports" },
  { id: "timetables", label: "Gérer les emplois du temps", route: "/timetables", permission: "pedagogy.schedule.view", icon: "timetable" },
  { id: "badges", label: "Gérer les badges", route: "/badges-recognition", permission: "pedagogy.recognition.manage", icon: "badges" },
] as const;
