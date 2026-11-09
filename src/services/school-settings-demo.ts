export type SchoolSettingsDemo = {
  defaultAcademicYearId: string;
  timeZone: string;
  dateFormat: "DD/MM/YYYY" | "YYYY-MM-DD";
  timeFormat: "24h" | "12h";
  numberFormat: "fr-FR" | "en-US";
  firstDayOfWeek: number;
  workingDays: number[];
  openingTime: string;
  closingTime: string;
  updatedAt: string;
  updatedBy: string;
};
export const SCHOOL_SETTINGS_DEMO_KEY = "school-operational-settings-demo-v1";
export const SCHOOL_SETTINGS_UPDATED_EVENT = "school-operational-settings-demo-updated";
export const defaultSchoolSettingsDemo = (defaultAcademicYearId = ""): SchoolSettingsDemo => ({
  defaultAcademicYearId,
  timeZone: "Africa/Casablanca",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  numberFormat: "fr-FR",
  firstDayOfWeek: 1,
  workingDays: [1, 2, 3, 4, 5],
  openingTime: "",
  closingTime: "",
  updatedAt: "",
  updatedBy: ""
});
function isValidTimeZone(value: string) {
  try { new Intl.DateTimeFormat("fr-FR", { timeZone: value }).format(new Date()); return true; }
  catch { return false; }
}
function isTime(value: string) { return value === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }
export function validateSchoolSettingsDemo(value: SchoolSettingsDemo, validAcademicYearIds: string[]) {
  const errors: string[] = [];
  if (value.defaultAcademicYearId && !validAcademicYearIds.includes(value.defaultAcademicYearId)) {
    errors.push("L’année scolaire par défaut doit correspondre à une année existante.");
  }
  if (!isValidTimeZone(value.timeZone)) errors.push("Saisissez un fuseau horaire IANA valide, par exemple Africa/Casablanca.");
  if (!Number.isInteger(value.firstDayOfWeek) || value.firstDayOfWeek < 0 || value.firstDayOfWeek > 6) errors.push("Sélectionnez un premier jour de semaine valide.");
  if (!Array.isArray(value.workingDays) || value.workingDays.length === 0) errors.push("Sélectionnez au moins un jour ouvrable.");
  if (value.workingDays.some(day => !Number.isInteger(day) || day < 0 || day > 6) || new Set(value.workingDays).size !== value.workingDays.length) {
    errors.push("La sélection des jours ouvrables est invalide.");
  }
  if (!isTime(value.openingTime) || !isTime(value.closingTime)) errors.push("Les horaires doivent respecter le format HH:MM.");
  if (Boolean(value.openingTime) !== Boolean(value.closingTime)) errors.push("Renseignez les deux horaires ou laissez-les tous les deux vides.");
  if (value.openingTime && value.closingTime && value.closingTime <= value.openingTime) errors.push("L’heure de fermeture doit être postérieure à l’heure d’ouverture.");
  return errors;
}
export function readSchoolSettingsDemo(defaultAcademicYearId = ""): SchoolSettingsDemo {
  let raw: string | null;
  try { raw = window.localStorage.getItem(SCHOOL_SETTINGS_DEMO_KEY); }
  catch { throw new Error("Impossible d’accéder au stockage local des paramètres de démonstration."); }
  if (!raw) return defaultSchoolSettingsDemo(defaultAcademicYearId);
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") throw new Error();
    const row = value as Partial<SchoolSettingsDemo>;
    if (typeof row.defaultAcademicYearId !== "string" || typeof row.timeZone !== "string" ||
      !["DD/MM/YYYY", "YYYY-MM-DD"].includes(row.dateFormat ?? "") ||
      !["24h", "12h"].includes(row.timeFormat ?? "") ||
      !["fr-FR", "en-US"].includes(row.numberFormat ?? "") ||
      !Number.isInteger(row.firstDayOfWeek) || (row.firstDayOfWeek as number) < 0 || (row.firstDayOfWeek as number) > 6 ||
      !isValidTimeZone(row.timeZone) || !Array.isArray(row.workingDays) ||
      row.workingDays.some(day => !Number.isInteger(day) || day < 0 || day > 6) ||
      typeof row.openingTime !== "string" || !isTime(row.openingTime) || typeof row.closingTime !== "string" || !isTime(row.closingTime) ||
      typeof row.updatedAt !== "string" || typeof row.updatedBy !== "string") throw new Error();
    if (new Set(row.workingDays).size !== row.workingDays.length || row.workingDays.length === 0 || Boolean(row.openingTime) !== Boolean(row.closingTime) || (row.openingTime && row.closingTime && row.closingTime <= row.openingTime)) throw new Error();
    return row as SchoolSettingsDemo;
  } catch {
    throw new Error("Les paramètres locaux sont illisibles ou incomplets. Aucune valeur par défaut n’a été appliquée automatiquement.");
  }
}
export function saveSchoolSettingsDemo(value: SchoolSettingsDemo, validAcademicYearIds: string[], updatedBy: string): SchoolSettingsDemo {
  const errors = validateSchoolSettingsDemo(value, validAcademicYearIds);
  if (errors.length) throw new Error(errors.join(" "));
  const saved: SchoolSettingsDemo = { ...value, workingDays: [...value.workingDays].sort((a,b)=>a-b), updatedAt: new Date().toISOString(), updatedBy };
  try { window.localStorage.setItem(SCHOOL_SETTINGS_DEMO_KEY, JSON.stringify(saved)); }
  catch { throw new Error("L’enregistrement local a échoué. Vérifiez l’espace disponible dans le navigateur puis réessayez."); }
  window.dispatchEvent(new CustomEvent(SCHOOL_SETTINGS_UPDATED_EVENT, { detail: saved }));
  return saved;
}
