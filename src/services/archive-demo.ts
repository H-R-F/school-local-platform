import { academicYearRepository, type AcademicYear } from "./academic-years";

export type ArchiveDemoStatus = "Simulation terminée";
export type ArchiveVerificationStatus = "Non vérifiée";
export interface ArchiveRecord {
  id: string;
  academicYearId: string;
  academicYearName: string;
  createdAt: string;
  createdBy: string;
  studentCount: number;
  classCount: number;
  modules: string[];
  status: ArchiveDemoStatus;
  verificationStatus: ArchiveVerificationStatus;
  estimatedRecords: null;
  sizeBytes: null;
  isDemo: true;
  note: string;
}
export const ARCHIVE_DEMO_KEY = "school-archive-demo-v1";
const demoModules = [
  "Informations de l’établissement", "Structure académique", "Élèves et dossiers",
  "Parents", "Enseignants et personnel", "Notes et résultats", "Examens",
  "Emplois du temps", "Présences et vie scolaire", "Documents",
  "Paiements et soldes", "Dépenses et rapports financiers",
  "Transport et logistique", "Communication", "Traçabilité"
];
const initialDemoArchives: ArchiveRecord[] = [{
  id: "ARC-DEMO-2024-2025",
  academicYearId: "AY-2024-2025",
  academicYearName: "2024–2025",
  createdAt: "2025-07-05T10:30:00.000Z",
  createdBy: "Salma El Amrani",
  studentCount: 1104,
  classCount: 38,
  modules: demoModules,
  status: "Simulation terminée",
  verificationStatus: "Non vérifiée",
  estimatedRecords: null,
  sizeBytes: null,
  isDemo: true,
  note: "Enregistrement fictif fourni pour illustrer l’interface. Aucun fichier d’archive n’existe et aucune donnée historique n’a été extraite."
}];

function readStore(): ArchiveRecord[] {
  try {
    const raw = window.localStorage.getItem(ARCHIVE_DEMO_KEY);
    if (!raw) {
      window.localStorage.setItem(ARCHIVE_DEMO_KEY, JSON.stringify(initialDemoArchives));
      return [...initialDemoArchives];
    }
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || !value.every(item => item && item.isDemo === true && typeof item.id === "string")) {
      throw new Error("Format des métadonnées d’archive invalide.");
    }
    return value as ArchiveRecord[];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Format")) throw error;
    throw new Error("Impossible de lire les métadonnées locales des archives.");
  }
}
function writeStore(rows: ArchiveRecord[]): ArchiveRecord[] {
  try {
    window.localStorage.setItem(ARCHIVE_DEMO_KEY, JSON.stringify(rows));
    return rows;
  } catch {
    throw new Error("Impossible d’enregistrer les métadonnées de démonstration dans ce navigateur.");
  }
}
export const archiveDemoRepository = {
  async list(): Promise<ArchiveRecord[]> {
    return readStore().sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },
  async eligibleYears(): Promise<AcademicYear[]> {
    return (await academicYearRepository.list()).filter(year => year.status === "Terminée");
  },
  async createSimulation(yearId: string, createdBy: string): Promise<ArchiveRecord[]> {
    const years = await academicYearRepository.list();
    const year = years.find(item => item.id === yearId);
    if (!year) throw new Error("Cette année scolaire n’existe plus. Actualisez la liste.");
    if (year.status !== "Terminée") throw new Error("Seule une année scolaire dont le statut est « Terminée » peut être sélectionnée.");
    const rows = readStore();
    if (rows.some(item => item.academicYearId === year.id)) throw new Error("Une entrée d’archive de démonstration existe déjà pour cette année.");
    const record: ArchiveRecord = {
      id: "ARC-DEMO-" + Date.now().toString(36).toUpperCase(),
      academicYearId: year.id,
      academicYearName: year.name,
      createdAt: new Date().toISOString(),
      createdBy,
      studentCount: year.studentCount,
      classCount: year.classCount,
      modules: [...demoModules],
      status: "Simulation terminée",
      verificationStatus: "Non vérifiée",
      estimatedRecords: null,
      sizeBytes: null,
      isDemo: true,
      note: "Métadonnées fictives uniquement. Aucun fichier n’a été créé, aucune donnée n’a été extraite et l’intégrité n’a pas été vérifiée."
    };
    return writeStore([record, ...rows]);
  },
  demoModules
};
