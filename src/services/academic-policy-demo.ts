export type AcademicRounding = "math" | "down" | "up";
export type AcademicPolicyDemo = {
  gradingScale: 10 | 20 | 100;
  decimals: 0 | 1 | 2;
  rounding: AcademicRounding;
  passingGrade: number;
  missingGrade: "exclude";
  unassessed: "exclude";
  averageMode: "simple" | "weighted";
  missingAverage: "exclude" | "block";
  calculationDecimals: 2 | 3 | 4;
  periodModel: "semesters" | "trimesters";
  updatedAt: string;
  updatedBy: string;
};
export const ACADEMIC_POLICY_DEMO_KEY = "school-academic-policy-demo-v1";
export const defaultAcademicPolicyDemo = (): AcademicPolicyDemo => ({
  gradingScale: 20, decimals: 2, rounding: "math", passingGrade: 10,
  missingGrade: "exclude", unassessed: "exclude", averageMode: "weighted",
  missingAverage: "exclude", calculationDecimals: 4, periodModel: "semesters",
  updatedAt: "", updatedBy: ""
});
export function validateAcademicPolicyDemo(value: AcademicPolicyDemo): string[] {
  const errors: string[] = [];
  if (![10,20,100].includes(value.gradingScale)) errors.push("Sélectionnez un barème pris en charge.");
  if (![0,1,2].includes(value.decimals)) errors.push("La précision d’affichage doit être comprise entre 0 et 2 décimales.");
  if (!["math","down","up"].includes(value.rounding)) errors.push("Sélectionnez une règle d’arrondi valide.");
  if (!Number.isFinite(value.passingGrade) || value.passingGrade < 0 || value.passingGrade > value.gradingScale) errors.push("La note minimale de réussite doit être comprise dans le barème.");
  if (![2,3,4].includes(value.calculationDecimals)) errors.push("La précision de calcul doit être comprise entre 2 et 4 décimales.");
  if (!["simple","weighted"].includes(value.averageMode)) errors.push("Sélectionnez un mode de calcul valide.");
  if (!["exclude","block"].includes(value.missingAverage)) errors.push("Sélectionnez un traitement valide des notes manquantes.");
  if (!["semesters","trimesters"].includes(value.periodModel)) errors.push("Sélectionnez une structure de périodes valide.");
  return errors;
}
function isPolicy(value: unknown): value is AcademicPolicyDemo {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<AcademicPolicyDemo>;
  return typeof row.gradingScale === "number" && typeof row.decimals === "number" &&
    typeof row.rounding === "string" && typeof row.passingGrade === "number" &&
    row.missingGrade === "exclude" && row.unassessed === "exclude" &&
    typeof row.averageMode === "string" && typeof row.missingAverage === "string" &&
    typeof row.calculationDecimals === "number" && typeof row.periodModel === "string" &&
    typeof row.updatedAt === "string" && typeof row.updatedBy === "string";
}
function readAll(): Record<string, AcademicPolicyDemo> {
  let raw: string | null;
  try { raw = window.localStorage.getItem(ACADEMIC_POLICY_DEMO_KEY); }
  catch { throw new Error("Le stockage local des paramètres académiques est inaccessible."); }
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    const entries = Object.entries(parsed as Record<string, unknown>);
    if (entries.some(([key, value]) => !key || !isPolicy(value) || validateAcademicPolicyDemo(value).length > 0)) throw new Error();
    return parsed as Record<string, AcademicPolicyDemo>;
  } catch {
    throw new Error("Les paramètres académiques locaux sont illisibles ou invalides. Aucune valeur n’a été écrasée.");
  }
}
export function readAcademicPolicyDemo(yearId: string): AcademicPolicyDemo {
  if (!yearId) return defaultAcademicPolicyDemo();
  return readAll()[yearId] ?? defaultAcademicPolicyDemo();
}
export function saveAcademicPolicyDemo(yearId: string, value: AcademicPolicyDemo, updatedBy: string): AcademicPolicyDemo {
  if (!yearId) throw new Error("Sélectionnez une année scolaire avant d’enregistrer les paramètres.");
  const errors = validateAcademicPolicyDemo(value);
  if (errors.length) throw new Error(errors.join(" "));
  const all = readAll();
  const saved = { ...value, updatedAt: new Date().toISOString(), updatedBy };
  all[yearId] = saved;
  try { window.localStorage.setItem(ACADEMIC_POLICY_DEMO_KEY, JSON.stringify(all)); }
  catch { throw new Error("L’enregistrement local a échoué. Vos modifications restent dans le formulaire ; vérifiez l’espace disponible puis réessayez."); }
  return saved;
}
