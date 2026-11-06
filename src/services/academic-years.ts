export type AcademicYearStatus = "Brouillon" | "Active" | "Terminée" | "Archivée";

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  studentCount: number;
  classCount: number;
  status: AcademicYearStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYearInput {
  name: string;
  startDate: string;
  endDate: string;
}

const STORAGE_KEY = "school-platform-academic-years-v1";

// Explicitly labelled development fixtures; replace this repository with the authenticated API adapter later.
const demoAcademicYears: AcademicYear[] = [
  { id: "AY-2026-2027", name: "2026–2027", startDate: "2026-09-01", endDate: "2027-06-30", studentCount: 1248, classCount: 42, status: "Active", createdAt: "2026-08-01T09:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "AY-2025-2026", name: "2025–2026", startDate: "2025-09-01", endDate: "2026-06-30", studentCount: 1196, classCount: 40, status: "Terminée", createdAt: "2025-07-15T09:00:00.000Z", updatedAt: "2026-07-01T08:00:00.000Z" },
  { id: "AY-2024-2025", name: "2024–2025", startDate: "2024-09-01", endDate: "2025-06-30", studentCount: 1104, classCount: 38, status: "Archivée", createdAt: "2024-07-10T09:00:00.000Z", updatedAt: "2025-07-05T08:00:00.000Z" },
];

export class AcademicYearRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AcademicYearRepositoryError";
  }
}

function readStore(): AcademicYear[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoAcademicYears));
      return [...demoAcademicYears];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Format de données invalide.");
    return parsed as AcademicYear[];
  } catch (error) {
    if (error instanceof AcademicYearRepositoryError) throw error;
    throw new AcademicYearRepositoryError("Impossible de lire les années scolaires enregistrées dans ce navigateur.");
  }
}

function writeStore(rows: AcademicYear[]): AcademicYear[] {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    return rows;
  } catch {
    throw new AcademicYearRepositoryError("L'enregistrement a échoué. Vérifiez l'espace de stockage de votre navigateur puis réessayez.");
  }
}

function validateInput(input: AcademicYearInput, rows: AcademicYear[], excludedId?: string) {
  const name = input.name.trim();
  if (!name) throw new AcademicYearRepositoryError("Le nom de l'année scolaire est obligatoire.");
  if (!input.startDate || !input.endDate) throw new AcademicYearRepositoryError("Les deux dates sont obligatoires.");
  const start = new Date(input.startDate + "T00:00:00");
  const end = new Date(input.endDate + "T00:00:00");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new AcademicYearRepositoryError("Veuillez saisir des dates valides.");
  if (start >= end) throw new AcademicYearRepositoryError("La date de début doit être antérieure à la date de fin.");
  if (rows.some(row => row.id !== excludedId && row.name.trim().toLocaleLowerCase("fr-FR") === name.toLocaleLowerCase("fr-FR"))) {
    throw new AcademicYearRepositoryError("Une année scolaire portant ce nom existe déjà.");
  }
  const overlap = rows.find(row => row.id !== excludedId && start <= new Date(row.endDate + "T23:59:59") && end >= new Date(row.startDate + "T00:00:00"));
  if (overlap) throw new AcademicYearRepositoryError(`La période chevauche déjà l'année scolaire « ${overlap.name} » (${formatDate(overlap.startDate)} – ${formatDate(overlap.endDate)}).`);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value + "T12:00:00"));
}

export const academicYearRepository = {
  async list(): Promise<AcademicYear[]> {
    return readStore().sort((a, b) => b.startDate.localeCompare(a.startDate));
  },
  async create(input: AcademicYearInput): Promise<AcademicYear[]> {
    const rows = readStore();
    validateInput(input, rows);
    const now = new Date().toISOString();
    const row: AcademicYear = {
      id: `AY-${Date.now()}`,
      name: input.name.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      studentCount: 0,
      classCount: 0,
      status: "Brouillon",
      createdAt: now,
      updatedAt: now,
    };
    return writeStore([row, ...rows]);
  },
  async update(id: string, input: AcademicYearInput): Promise<AcademicYear[]> {
    const rows = readStore();
    const current = rows.find(row => row.id === id);
    if (!current) throw new AcademicYearRepositoryError("Cette année scolaire n'existe plus. Actualisez la page.");
    if (current.status === "Archivée") throw new AcademicYearRepositoryError("Une année scolaire archivée ne peut pas être modifiée.");
    validateInput(input, rows, id);
    return writeStore(rows.map(row => row.id === id ? { ...row, name: input.name.trim(), startDate: input.startDate, endDate: input.endDate, updatedAt: new Date().toISOString() } : row));
  },
  async activate(id: string): Promise<AcademicYear[]> {
    const rows = readStore();
    const target = rows.find(row => row.id === id);
    if (!target) throw new AcademicYearRepositoryError("Cette année scolaire n'existe plus. Actualisez la page.");
    if (target.status !== "Brouillon") throw new AcademicYearRepositoryError("Seule une année scolaire en brouillon peut être activée.");
    if (rows.some(row => row.status === "Active")) throw new AcademicYearRepositoryError("Une année scolaire est déjà active. Terminez-la avant d'en activer une autre.");
    return writeStore(rows.map(row => row.id === id ? { ...row, status: "Active", updatedAt: new Date().toISOString() } : row));
  },
  async complete(id: string): Promise<AcademicYear[]> {
    const rows = readStore();
    const target = rows.find(row => row.id === id);
    if (!target) throw new AcademicYearRepositoryError("Cette année scolaire n'existe plus. Actualisez la page.");
    if (target.status !== "Active") throw new AcademicYearRepositoryError("Seule l'année scolaire active peut être marquée comme terminée.");
    return writeStore(rows.map(row => row.id === id ? { ...row, status: "Terminée", updatedAt: new Date().toISOString() } : row));
  },
};
