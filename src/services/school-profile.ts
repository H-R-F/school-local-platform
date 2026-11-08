import { schoolBranding } from "../config/school";

export interface SchoolProfile {
  name: string;
  shortName: string;
  institutionType: string;
  status: string;
  description: string;
  creationYear: string;
  language: "Français";
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  website: string;
  administrativeId: string;
  taxId: string;
  registryReference: string;
  authorizationNumber: string;
  officialReference: string;
  directorName: string;
  directorTitle: string;
  directorEmployeeId: string;
  administrativeContact: string;
  administrativeEmail: string;
  emergencyContact: string;
  logoDataUrl: string;
  primaryColor: string;
  secondaryColor: string;
  updatedAt: string;
  updatedBy: string;
}
export const SCHOOL_PROFILE_KEY = "school-profile-demo-v1";
export const SCHOOL_PROFILE_UPDATED_EVENT = "school-profile-demo-updated";
export const defaultSchoolProfile: SchoolProfile = {
  name: schoolBranding.name,
  shortName: "AN",
  institutionType: "Groupe scolaire privé",
  status: "En activité",
  description: "Un établissement engagé dans un accompagnement pédagogique exigeant et un environnement d’apprentissage bienveillant.",
  creationYear: "2012",
  language: "Français",
  address: "Boulevard Mohammed VI, quartier administratif",
  city: "Casablanca",
  region: "Casablanca-Settat",
  postalCode: "",
  country: "Maroc",
  phone: "+212 5 22 00 00 00",
  secondaryPhone: "",
  email: "contact@northstar.exemple",
  website: "",
  administrativeId: "",
  taxId: "",
  registryReference: "",
  authorizationNumber: "",
  officialReference: "",
  directorName: "Salma El Amrani",
  directorTitle: "Directrice de l’établissement",
  directorEmployeeId: "",
  administrativeContact: "",
  administrativeEmail: "",
  emergencyContact: "",
  logoDataUrl: "",
  primaryColor: schoolBranding.primaryColor,
  secondaryColor: schoolBranding.secondaryColor ?? "#EAF1FF",
  updatedAt: "",
  updatedBy: ""
};
export function readSchoolProfile(): SchoolProfile {
  try {
    const raw = window.localStorage.getItem(SCHOOL_PROFILE_KEY);
    if (!raw) return { ...defaultSchoolProfile };
    const value = JSON.parse(raw) as Partial<SchoolProfile>;
    return { ...defaultSchoolProfile, ...value, language: "Français" };
  } catch {
    return { ...defaultSchoolProfile };
  }
}
export function saveSchoolProfile(profile: SchoolProfile): SchoolProfile {
  const saved = { ...profile, updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(SCHOOL_PROFILE_KEY, JSON.stringify(saved));
  } catch {
    throw new Error("L’enregistrement local a échoué. Vérifiez l’espace disponible dans le navigateur, notamment la taille du logo.");
  }
  window.dispatchEvent(new CustomEvent(SCHOOL_PROFILE_UPDATED_EVENT, { detail: saved }));
  return saved;
}
export function toSchoolBranding(profile: SchoolProfile) {
  return {
    ...schoolBranding,
    name: profile.name || schoolBranding.name,
    location: [profile.city, profile.country].filter(Boolean).join(" · "),
    logoUrl: profile.logoDataUrl || undefined,
    primaryColor: profile.primaryColor,
    secondaryColor: profile.secondaryColor
  };
}
