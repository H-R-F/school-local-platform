export type RegistrationKind = "Élève" | "Parent" | "Enseignant" | "Employé";
export type RegistrationStatus = "Validé" | "À vérifier" | "En attente";

export const administrativeKpis = [
  { id: "students", label: "Total des élèves", value: "1 248", detail: "1 216 actifs · 32 nouvelles inscriptions", icon: "students", tone: "blue" },
  { id: "parents", label: "Total des parents", value: "986", detail: "18 nouveaux parents ce mois", icon: "parents", tone: "violet" },
  { id: "teachers", label: "Total des enseignants", value: "86", detail: "82 enseignants actifs", icon: "teachers", tone: "green" },
  { id: "employees", label: "Total du personnel", value: "34", detail: "32 employés actifs", icon: "employees", tone: "amber" },
  { id: "classes", label: "Classes actives", value: "42", detail: "58 groupes pédagogiques", icon: "classes", tone: "blue" },
  { id: "documents", label: "Documents en attente", value: "17", detail: "Demandes à traiter", icon: "documents", tone: "red" },
] as const;

export const enrollmentTrend = [
  { month: "Juin", count: 28 }, { month: "Juil.", count: 42 },
  { month: "Août", count: 65 }, { month: "Sept.", count: 94 },
  { month: "Oct.", count: 71 }, { month: "Nov.", count: 38 },
];

export const enrollmentLevels = [
  { label: "Primaire", count: 104 }, { label: "Collège", count: 138 }, { label: "Lycée", count: 96 },
];

export const peopleMetrics = {
  students: { total: "1 248", recent: "32 nouvelles inscriptions", route: "/students" },
  parents: { total: "986", recent: "18 nouveaux parents", route: "/parents" },
  teachers: { total: "86", recent: "4 nouveaux enseignants", route: "/teachers" },
  employees: { total: "34", recent: "2 nouveaux employés", route: "/employees" },
};

export const academicStructure = [
  { id: "programs", label: "Filières et programmes", total: "8", active: "7 actifs", route: "/sectors-programs" },
  { id: "levels", label: "Niveaux", total: "12", active: "12 actifs", route: "/levels" },
  { id: "classes", label: "Classes et groupes", total: "42", active: "58 groupes", route: "/classes-groups" },
  { id: "subjects", label: "Matières", total: "36", active: "34 actives", route: "/subjects" },
  { id: "departments", label: "Départements", total: "5", active: "5 actifs", route: "/departments" },
];

export const administrativeAttendance = {
  studentAbsences: 49,
  staffAbsences: 3,
  unjustified: 12,
  attention: 7,
  trend: [91, 94, 92, 96, 93, 95, 94],
};

export const administrativeTasks = [
  { id: "documents", title: "Demandes de documents à examiner", count: 17, priority: "Urgente", detail: "Certificats et attestations", route: "/documents", permission: "documents.view" },
  { id: "enrollment", title: "Dossiers d’inscription incomplets", count: 12, priority: "Élevée", detail: "Pièces justificatives manquantes", route: "/students", permission: "people.students.view" },
  { id: "absence", title: "Justificatifs d’absence à traiter", count: 7, priority: "Élevée", detail: "Absences d’élèves non justifiées", route: "/student-attendance", permission: "student.attendance.view" },
  { id: "parents", title: "Informations des parents à vérifier", count: 5, priority: "Normale", detail: "Coordonnées et liens familiaux", route: "/parents", permission: "people.parents.view" },
  { id: "employees", title: "Dossiers du personnel à actualiser", count: 3, priority: "Normale", detail: "Informations administratives", route: "/employees", permission: "people.employees.view" },
] as const;

export const recentRegistrations: {
  id: string; name: string; kind: RegistrationKind; date: string; related: string; status: RegistrationStatus; route: string;
}[] = [
  { id: "REG-26091", name: "Nour El Fassi", kind: "Élève", date: "06/11/2026", related: "6e A", status: "Validé", route: "/students" },
  { id: "REG-26090", name: "Karim El Fassi", kind: "Parent", date: "06/11/2026", related: "Nour El Fassi", status: "Validé", route: "/parents" },
  { id: "REG-26089", name: "Hind Tazi", kind: "Employé", date: "05/11/2026", related: "Administration", status: "À vérifier", route: "/employees" },
  { id: "REG-26088", name: "Mehdi Rami", kind: "Enseignant", date: "04/11/2026", related: "Sciences", status: "Validé", route: "/teachers" },
  { id: "REG-26087", name: "Salma Naciri", kind: "Élève", date: "03/11/2026", related: "2e B", status: "En attente", route: "/students" },
  { id: "REG-26086", name: "Yassine Naciri", kind: "Parent", date: "03/11/2026", related: "Salma Naciri", status: "À vérifier", route: "/parents" },
  { id: "REG-26085", name: "Imane Bennis", kind: "Élève", date: "02/11/2026", related: "4e A", status: "Validé", route: "/students" },
];

export const administrativeActivities = [
  { id: 1, date: "Aujourd’hui · 10:42", title: "Nouvelle inscription d’un élève", detail: "Nour El Fassi · Classe 6e A", actor: "Salma Idrissi", icon: "student" },
  { id: 2, date: "Aujourd’hui · 09:58", title: "Dossier parent mis à jour", detail: "Karim El Fassi · Coordonnées vérifiées", actor: "Salma Idrissi", icon: "parent" },
  { id: 3, date: "Hier · 16:20", title: "Affectation d’un enseignant", detail: "Mehdi Rami · Département Sciences", actor: "Service administratif", icon: "teacher" },
  { id: 4, date: "Hier · 14:05", title: "Document traité", detail: "Attestation de scolarité · EL-0184", actor: "Service administratif", icon: "document" },
  { id: 5, date: "05/11/2026 · 11:30", title: "Dossier employé actualisé", detail: "Hind Tazi · Administration", actor: "Salma Idrissi", icon: "employee" },
];

export const administrativeQuickActions = [
  { id: "student", label: "Ajouter un élève", route: "/students", permission: "people.students.view", icon: "student" },
  { id: "parent", label: "Ajouter un parent", route: "/parents", permission: "people.parents.view", icon: "parent" },
  { id: "teacher", label: "Ajouter un enseignant", route: "/teachers", permission: "people.teachers.view", icon: "teacher" },
  { id: "employee", label: "Ajouter un employé", route: "/employees", permission: "people.employees.view", icon: "employee" },
  { id: "class", label: "Créer une classe", route: "/classes-groups", permission: "academic.structure.manage", icon: "class" },
  { id: "documents", label: "Gérer les documents", route: "/documents", permission: "documents.view", icon: "document" },
] as const;
