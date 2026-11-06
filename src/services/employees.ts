import { departmentsRepository } from "./departments";

export type EmploymentStatus = "Actif" | "En congé" | "Inactif";
export type EmployeeAccountStatus = "Actif" | "Non activé" | "Gelé";
export type EmployeeDocumentStatus = "À vérifier" | "Vérifié" | "Rejeté";
export interface EmployeeDocument { id:string; name:string; category:string; uploadedAt:string|null; status:EmployeeDocumentStatus }
export interface Employee {
 id:string; fullName:string; employeeCode:string; jobTitle:string; departmentId:string|null;
 phone:string; email:string; address:string; nationalId:string; birthDate:string;
 recruitmentDate:string; contractType:string; employmentStatus:EmploymentStatus; accountStatus:EmployeeAccountStatus;
 systemRole:string|null; lastActivity:string|null; responsibilities:string; documents:EmployeeDocument[];
}
export type EmployeeInput=Omit<Employee,"id"|"accountStatus"|"systemRole"|"lastActivity"|"documents">;
export interface EmployeeRecord extends Employee { departmentName:string }
export interface EmployeesData { employees:EmployeeRecord[]; departments:Awaited<ReturnType<typeof departmentsRepository.list>>["departments"] }
const KEY="school-platform-non-teaching-employees-v1";
const DEMO:Employee[]=[
{id:"EMP-N-001",fullName:"Imane El Fassi",employeeCode:"ADM-001",jobTitle:"Assistante administrative",departmentId:"DEP-ADM",phone:"+212 6 22 31 45 10",email:"i.elfassi@northstar.ma",address:"Casablanca",nationalId:"",birthDate:"1991-05-12",recruitmentDate:"2019-09-02",contractType:"CDI",employmentStatus:"Actif",accountStatus:"Actif",systemRole:"Responsable administratif",lastActivity:"2026-11-05T15:10:00.000Z",responsibilities:"Accueil administratif, suivi des dossiers et coordination interne.",documents:[{id:"ED-1",name:"Contrat de travail",category:"Documents liés à l'emploi",uploadedAt:"2024-09-02",status:"Vérifié"},{id:"ED-2",name:"Attestation de formation",category:"Certificats et attestations",uploadedAt:"2025-01-18",status:"À vérifier"}]},
{id:"EMP-N-002",fullName:"Rachid Mansouri",employeeCode:"FIN-002",jobTitle:"Comptable",departmentId:"DEP-ADM",phone:"+212 6 22 31 45 11",email:"r.mansouri@northstar.ma",address:"Casablanca",nationalId:"",birthDate:"1986-02-08",recruitmentDate:"2017-03-15",contractType:"CDI",employmentStatus:"Actif",accountStatus:"Non activé",systemRole:null,lastActivity:null,responsibilities:"Suivi comptable et préparation des pièces justificatives.",documents:[]},
{id:"EMP-N-003",fullName:"Mehdi Aït Lahcen",employeeCode:"IT-003",jobTitle:"Technicien informatique",departmentId:"DEP-CS",phone:"+212 6 22 31 45 12",email:"m.aitlahcen@northstar.ma",address:"Bouskoura",nationalId:"",birthDate:"1993-10-21",recruitmentDate:"2021-01-04",contractType:"CDD",employmentStatus:"En congé",accountStatus:"Gelé",systemRole:"Technicien",lastActivity:"2026-10-20T09:30:00.000Z",responsibilities:"Maintenance du parc informatique et assistance technique.",documents:[{id:"ED-3",name:"Diplôme technicien spécialisé",category:"Diplômes et qualifications",uploadedAt:"2021-01-04",status:"Vérifié"}]},
{id:"EMP-N-004",fullName:"Samira Ouhajji",employeeCode:"ACC-004",jobTitle:"Réceptionniste",departmentId:"DEP-ADM",phone:"+212 6 22 31 45 13",email:"",address:"Casablanca",nationalId:"",birthDate:"1995-06-30",recruitmentDate:"2022-09-01",contractType:"CDD",employmentStatus:"Actif",accountStatus:"Actif",systemRole:null,lastActivity:null,responsibilities:"Accueil des familles et orientation des visiteurs.",documents:[]},
{id:"EMP-N-005",fullName:"Abdelkader Bennis",employeeCode:"LOG-005",jobTitle:"Agent de maintenance",departmentId:"DEP-ADM",phone:"+212 6 22 31 45 14",email:"a.bennis@northstar.ma",address:"Casablanca",nationalId:"",birthDate:"1979-12-11",recruitmentDate:"2010-04-12",contractType:"CDI",employmentStatus:"Inactif",accountStatus:"Gelé",systemRole:null,lastActivity:"2026-08-12T11:00:00.000Z",responsibilities:"Entretien courant des locaux.",documents:[]}
];
export class EmployeesRepositoryError extends Error { constructor(message:string){super(message);this.name="EmployeesRepositoryError";} }
function read():Employee[]{try{const raw=localStorage.getItem(KEY);if(!raw){localStorage.setItem(KEY,JSON.stringify(DEMO));return DEMO;}const parsed:unknown=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error();return parsed as Employee[];}catch{throw new EmployeesRepositoryError("Impossible de charger les dossiers employés depuis ce navigateur.");}}
function write(rows:Employee[]){try{localStorage.setItem(KEY,JSON.stringify(rows));}catch{throw new EmployeesRepositoryError("L'enregistrement a échoué. Vérifiez l'espace disponible dans le navigateur.");}}
function validate(v:EmployeeInput,rows:Employee[],id?:string){
 if(!v.fullName.trim())throw new EmployeesRepositoryError("Le nom complet est obligatoire.");
 if(!v.employeeCode.trim())throw new EmployeesRepositoryError("Le matricule est obligatoire.");
 if(!/^[A-Z0-9][A-Z0-9_-]{1,19}$/i.test(v.employeeCode.trim()))throw new EmployeesRepositoryError("Le matricule doit contenir de 2 à 20 caractères : lettres, chiffres, tirets ou soulignés.");
 if(!v.jobTitle.trim())throw new EmployeesRepositoryError("Le poste est obligatoire.");
 if(rows.some(x=>x.id!==id&&x.employeeCode.toUpperCase()===v.employeeCode.trim().toUpperCase()))throw new EmployeesRepositoryError("Ce matricule est déjà utilisé.");
 if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))throw new EmployeesRepositoryError("L'adresse e-mail n'est pas valide.");
 if(v.phone&&!/^\+?[0-9 ()-]{8,20}$/.test(v.phone))throw new EmployeesRepositoryError("Le numéro de téléphone n'est pas valide.");
 if(rows.some(x=>x.id!==id&&v.email&&x.email.toLowerCase()===v.email.trim().toLowerCase()))throw new EmployeesRepositoryError("Un dossier utilise déjà cette adresse e-mail. Vérifiez qu'il ne s'agit pas d'un doublon.");
}
export const employeesRepository={
 async list():Promise<EmployeesData>{const [departments]=await Promise.all([departmentsRepository.list()]);const employees=read().map(e=>({...e,departmentName:departments.departments.find(d=>d.id===e.departmentId)?.name??"Non affecté"})).sort((a,b)=>a.fullName.localeCompare(b.fullName,"fr"));return {employees,departments:departments.departments};},
 async save(v:EmployeeInput,id?:string){const rows=read();validate(v,rows,id);const current=rows.find(x=>x.id===id);const value:Employee={...(current??{id:"EMP-N-"+Date.now(),accountStatus:"Non activé",systemRole:null,lastActivity:null,documents:[]}),...v,fullName:v.fullName.trim(),employeeCode:v.employeeCode.trim().toUpperCase(),jobTitle:v.jobTitle.trim()};write(current?rows.map(x=>x.id===id?value:x):[value,...rows]);return this.list();},
 async setAccountStatus(id:string,status:EmployeeAccountStatus){const rows=read();if(!rows.some(x=>x.id===id))throw new EmployeesRepositoryError("Employé introuvable.");if(status==="Actif"&&rows.find(x=>x.id===id)?.accountStatus==="Non activé")throw new EmployeesRepositoryError("Ce compte n'a pas encore été activé.");write(rows.map(x=>x.id===id?{...x,accountStatus:status}:x));return this.list();},
 async addDocument(id:string,name:string,category:string){const rows=read();if(!rows.some(x=>x.id===id))throw new EmployeesRepositoryError("Employé introuvable.");if(!name.trim())throw new EmployeesRepositoryError("Le nom du document est obligatoire.");write(rows.map(x=>x.id===id?{...x,documents:[...x.documents,{id:"ED-"+Date.now(),name:name.trim(),category,uploadedAt:new Date().toISOString(),status:"À vérifier" as EmployeeDocumentStatus}]}:x));return this.list();},
 async setDocumentStatus(id:string,documentId:string,status:EmployeeDocumentStatus){const rows=read();write(rows.map(x=>x.id===id?{...x,documents:x.documents.map(d=>d.id===documentId?{...d,status}:d)}:x));return this.list();}
};
