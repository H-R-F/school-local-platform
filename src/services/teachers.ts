import { academicYearRepository } from "./academic-years";
import { classesGroupsRepository } from "./classes-groups";
import { departmentsRepository } from "./departments";
import { subjectsRepository } from "./subjects";

export type TeacherEmploymentStatus = "Actif" | "En congé" | "Inactif";
export type TeacherAccountStatus = "Actif" | "Non activé" | "Gelé";
export type TeacherDocumentStatus = "À vérifier" | "Vérifié" | "Rejeté";
export interface TeacherDocument { id:string; name:string; category:string; uploadedAt:string|null; status:TeacherDocumentStatus }
export interface TeachingAssignment { id:string; academicYearId:string; programId:string; levelId:string; classId:string; groupId:string|null; subjectId:string; weeklyHours:number; active:boolean; createdAt:string }
export interface Teacher {
 id:string; fullName:string; employeeCode:string; birthDate:string; phone:string; email:string; address:string; nationalId:string;
 departmentId:string|null; specialization:string; qualifications:string; recruitmentDate:string; employmentStatus:TeacherEmploymentStatus;
 accountStatus:TeacherAccountStatus; lastActivity:string|null; documents:TeacherDocument[]; assignments:TeachingAssignment[]; createdAt:string;
}
export interface TeacherInput {
 fullName:string; employeeCode:string; birthDate:string; phone:string; email:string; address:string; nationalId:string;
 departmentId:string|null; specialization:string; qualifications:string; recruitmentDate:string; employmentStatus:TeacherEmploymentStatus;
}
export interface TeacherAssignmentInput extends Omit<TeachingAssignment,"id"|"active"|"createdAt"> {}
export interface TeacherRecord extends Teacher {
 departmentName:string; assignmentsResolved:Array<TeachingAssignment&{academicYearName:string;programName:string;levelName:string;className:string;groupName:string;subjectName:string;subjectCode:string}>;
}
export interface TeachersData {
 teachers:TeacherRecord[];
 departments:Awaited<ReturnType<typeof departmentsRepository.list>>["departments"];
 academicYears:Awaited<ReturnType<typeof academicYearRepository.list>>;
 classes:Awaited<ReturnType<typeof classesGroupsRepository.list>>["classes"];
 subjects:Awaited<ReturnType<typeof subjectsRepository.list>>["subjects"];
}
const KEY="school-platform-teachers-v1";
const ASSIGNMENTS_KEY="school-platform-teaching-assignments-v1";
const DEMO:Teacher[]=[
 {id:"EMP-001",fullName:"Youssef El Amrani",employeeCode:"ENS-001",birthDate:"1984-03-12",phone:"+212 6 12 34 56 01",email:"y.elamrani@northstar.ma",address:"Casablanca",nationalId:"",departmentId:"DEP-MATH",specialization:"Mathématiques",qualifications:"Master en mathématiques appliquées",recruitmentDate:"2012-09-01",employmentStatus:"Actif",accountStatus:"Actif",lastActivity:"2026-11-05T16:20:00.000Z",documents:[{id:"TD-1",name:"Diplôme universitaire",category:"Diplômes et qualifications",uploadedAt:"2024-06-12",status:"Vérifié"},{id:"TD-2",name:"Contrat de travail",category:"Documents liés à l'emploi",uploadedAt:"2025-09-01",status:"À vérifier"}],assignments:[],createdAt:"2025-09-01T09:00:00.000Z"},
 {id:"EMP-002",fullName:"Salma Benali",employeeCode:"ENS-002",birthDate:"1989-07-22",phone:"+212 6 12 34 56 02",email:"s.benali@northstar.ma",address:"Casablanca",nationalId:"",departmentId:"DEP-LANG",specialization:"Français et littérature",qualifications:"Licence en études françaises",recruitmentDate:"2016-09-01",employmentStatus:"Actif",accountStatus:"Non activé",lastActivity:null,documents:[{id:"TD-3",name:"Diplôme de licence",category:"Diplômes et qualifications",uploadedAt:"2023-08-20",status:"Vérifié"}],assignments:[],createdAt:"2025-09-01T09:00:00.000Z"},
 {id:"EMP-003",fullName:"Omar Berrada",employeeCode:"ENS-003",birthDate:"1982-11-08",phone:"+212 6 12 34 56 03",email:"o.berrada@northstar.ma",address:"Bouskoura",nationalId:"",departmentId:"DEP-CS",specialization:"Informatique",qualifications:"Master en systèmes d'information",recruitmentDate:"2010-09-01",employmentStatus:"En congé",accountStatus:"Gelé",lastActivity:"2026-10-20T10:00:00.000Z",documents:[],assignments:[],createdAt:"2025-09-01T09:00:00.000Z"},
 {id:"EMP-004",fullName:"Nadia Alaoui",employeeCode:"ENS-004",birthDate:"1990-01-16",phone:"+212 6 12 34 56 04",email:"n.alaoui@northstar.ma",address:"Casablanca",nationalId:"",departmentId:"DEP-MATH",specialization:"Sciences physiques",qualifications:"Master en physique",recruitmentDate:"2018-09-01",employmentStatus:"Actif",accountStatus:"Actif",lastActivity:"2026-11-04T08:45:00.000Z",documents:[],assignments:[],createdAt:"2025-09-01T09:00:00.000Z"},
 {id:"EMP-005",fullName:"Karim Tazi",employeeCode:"ENS-005",birthDate:"1987-04-03",phone:"+212 6 12 34 56 05",email:"k.tazi@northstar.ma",address:"Mohammedia",nationalId:"",departmentId:"DEP-LANG",specialization:"Anglais",qualifications:"Licence en langue anglaise",recruitmentDate:"2015-09-01",employmentStatus:"Inactif",accountStatus:"Actif",lastActivity:"2026-09-15T12:00:00.000Z",documents:[],assignments:[],createdAt:"2025-09-01T09:00:00.000Z"}
];
export class TeachersRepositoryError extends Error { constructor(message:string){super(message);this.name="TeachersRepositoryError";} }
function read<T>(key:string,seed:T[]):T[]{try{const raw=localStorage.getItem(key);if(!raw){localStorage.setItem(key,JSON.stringify(seed));return seed;}const parsed:unknown=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error();return parsed as T[];}catch{throw new TeachersRepositoryError("Impossible de charger les données des enseignants depuis ce navigateur.");}}
function write<T>(key:string,rows:T[]):T[]{try{localStorage.setItem(key,JSON.stringify(rows));return rows;}catch{throw new TeachersRepositoryError("L'enregistrement a échoué. Vérifiez l'espace disponible dans le navigateur puis réessayez.");}}
async function loadRaw(){
 const [academicYears,classData,departmentData,subjectData]=await Promise.all([academicYearRepository.list(),classesGroupsRepository.list(),departmentsRepository.list(),subjectsRepository.list()]);
 const teachers=read(KEY,DEMO);
 const assignments=read(ASSIGNMENTS_KEY,[]);
 return {academicYears,classes:classData.classes,departments:departmentData.departments,subjects:subjectData.subjects,teachers,assignments};
}
function build(raw:Awaited<ReturnType<typeof loadRaw>>):TeachersData{
 const teachers=raw.teachers.map(t=>{
  const assignments=raw.assignments.filter(a=>a.teacherId===t.id&&a.active);
  const assignmentsResolved=assignments.flatMap(a=>{
   const year=raw.academicYears.find(y=>y.id===a.academicYearId),c=raw.classes.find(x=>x.id===a.classId),subject=raw.subjects.find(x=>x.id===a.subjectId);
   const group=c?.groups.find(g=>g.id===a.groupId);
   if(!year||!c||!subject)return [];
   return [{...a,academicYearName:year.name,programName:c.programName,levelName:c.levelName,className:c.name,groupName:group?.name??"—",subjectName:subject.name,subjectCode:subject.code}];
  });
  return {...t,departmentName:raw.departments.find(d=>d.id===t.departmentId)?.name??"Non affecté",assignments:assignmentsResolved};
 }).sort((a,b)=>a.fullName.localeCompare(b.fullName,"fr"));
 return {teachers,departments:raw.departments,academicYears:raw.academicYears,classes:raw.classes,subjects:raw.subjects};
}
function validateTeacher(v:TeacherInput,rows:Teacher[],id?:string){
 if(!v.fullName.trim())throw new TeachersRepositoryError("Le nom complet est obligatoire.");
 if(!v.employeeCode.trim())throw new TeachersRepositoryError("Le matricule est obligatoire.");
 if(!/^[A-Z0-9][A-Z0-9_-]{1,19}$/i.test(v.employeeCode.trim()))throw new TeachersRepositoryError("Le matricule doit contenir de 2 à 20 caractères : lettres, chiffres, tirets ou soulignés.");
 if(rows.some(t=>t.id!==id&&t.employeeCode.toLocaleUpperCase("fr-FR")===v.employeeCode.trim().toLocaleUpperCase("fr-FR")))throw new TeachersRepositoryError("Ce matricule est déjà utilisé.");
 if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))throw new TeachersRepositoryError("L'adresse e-mail n'est pas valide.");
 if(v.phone&&!/^\+?[0-9 ()-]{8,20}$/.test(v.phone))throw new TeachersRepositoryError("Le numéro de téléphone n'est pas valide.");
 if(v.birthDate&&v.birthDate>new Date().toISOString().slice(0,10))throw new TeachersRepositoryError("La date de naissance ne peut pas être dans le futur.");
 if(v.departmentId&&!rows.length)throw new TeachersRepositoryError("Le département sélectionné est indisponible.");
 if(rows.some(t=>t.id!==id&&v.email&&t.email.toLocaleLowerCase()===v.email.trim().toLocaleLowerCase()))throw new TeachersRepositoryError("Un enseignant utilise déjà cette adresse e-mail. Vérifiez le dossier avant de continuer.");
}
export const teachersRepository={
 async list():Promise<TeachersData>{return build(await loadRaw());},
 async save(input:TeacherInput,id?:string):Promise<TeachersData>{
  const raw=await loadRaw();validateTeacher(input,raw.teachers,id);
  if(input.departmentId&&!raw.departments.some(d=>d.id===input.departmentId))throw new TeachersRepositoryError("Le département sélectionné n'existe plus.");
  const current=raw.teachers.find(t=>t.id===id);const value:Teacher={...(current??{id:"EMP-"+Date.now(),accountStatus:"Non activé" as TeacherAccountStatus,lastActivity:null,documents:[],createdAt:new Date().toISOString(),assignments:[]}),...input,fullName:input.fullName.trim(),employeeCode:input.employeeCode.trim().toLocaleUpperCase("fr-FR")};
  write(KEY,current?raw.teachers.map(t=>t.id===id?value:t):[value,...raw.teachers]);return this.list();
 },
 async saveAssignments(teacherId:string,inputs:TeacherAssignmentInput[]):Promise<TeachersData>{
  const raw=await loadRaw();if(!raw.teachers.some(t=>t.id===teacherId))throw new TeachersRepositoryError("Cet enseignant n'existe plus.");
  const seen=new Set<string>();const now=new Date().toISOString();
  for(const a of inputs){
   const c=raw.classes.find(x=>x.id===a.classId&&x.status==="Actif"),year=raw.academicYears.find(y=>y.id===a.academicYearId&&y.status!=="Terminée"&&y.status!=="Archivée");
   if(!c||!year||c.academicYearId!==a.academicYearId)throw new TeachersRepositoryError("La classe ne correspond pas à l'année scolaire sélectionnée.");
   if(a.groupId&&!c.groups.some(g=>g.id===a.groupId&&g.status==="Actif"))throw new TeachersRepositoryError("Le groupe sélectionné n'appartient pas à cette classe.");
   const subject=raw.subjects.find(s=>s.id===a.subjectId&&s.status==="Actif");
   if(!subject||!subject.assignments.some(x=>x.academicYearId===a.academicYearId&&x.programId===c.programId&&x.levelId===c.levelId))throw new TeachersRepositoryError("Cette matière n'est pas associée au programme, au niveau et à l'année de la classe.");
   if(!Number.isFinite(a.weeklyHours)||a.weeklyHours<=0||a.weeklyHours>40)throw new TeachersRepositoryError("Les heures hebdomadaires doivent être comprises entre 0 et 40.");
   const key=[a.academicYearId,a.classId,a.groupId??"",a.subjectId].join("::");if(seen.has(key))throw new TeachersRepositoryError("Cette affectation est présente plusieurs fois.");seen.add(key);
  }
  const existing=raw.assignments.filter(a=>a.teacherId===teacherId);
  if(inputs.some(a=>existing.some(x=>x.active&&x.academicYearId===a.academicYearId&&x.classId===a.classId&&x.groupId===a.groupId&&x.subjectId===a.subjectId)))throw new TeachersRepositoryError("Une affectation identique existe déjà pour cet enseignant.");
  const next=[...raw.assignments,...inputs.map(a=>({id:"TAS-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),teacherId,...a,active:true,createdAt:now}))];
  write(ASSIGNMENTS_KEY,next);return this.list();
 },
 async removeAssignment(id:string):Promise<TeachersData>{const raw=await loadRaw();if(!raw.assignments.some(a=>a.id===id))throw new TeachersRepositoryError("Cette affectation n'existe plus.");write(ASSIGNMENTS_KEY,raw.assignments.map(a=>a.id===id?{...a,active:false}:a));return this.list();},
 async setAccountStatus(id:string,status:TeacherAccountStatus):Promise<TeachersData>{const raw=await loadRaw();const t=raw.teachers.find(x=>x.id===id);if(!t)throw new TeachersRepositoryError("Enseignant introuvable.");if(status==="Actif"&&t.accountStatus==="Non activé")throw new TeachersRepositoryError("Ce compte n'a pas encore été activé.");write(KEY,raw.teachers.map(x=>x.id===id?{...x,accountStatus:status}:x));return this.list();}
};
