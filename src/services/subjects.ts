import { academicYearRepository, type AcademicYear } from "./academic-years";
import { levelsRepository, type LevelRecord } from "./levels";
import { sectorsProgramsRepository, type EducationalCycle, type EntityStatus, type SectorProgramData } from "./sectors-programs";

export type SubjectCategory = "Langues" | "Sciences" | "Sciences humaines et sociales" | "Autres matières";
export interface Subject {
  id: string; name: string; code: string; category: SubjectCategory; description: string;
  status: EntityStatus; defaultWeeklyHours: number | null; defaultCoefficient: number | null;
  createdAt: string; updatedAt: string;
}
export interface SubjectAssignment {
  id: string; subjectId: string; programId: string; levelId: string;
  weeklyHours: number | null; coefficient: number | null; academicYearId: string;
  active: boolean; createdAt: string; updatedAt: string;
}
export interface TeacherSubjectAssignment {
  id: string; subjectId: string; classId: string; teacherName: string; academicYearId: string;
}
export interface SubjectRecord extends Subject {
  assignments: (SubjectAssignment & {cycle:EducationalCycle;sectorId:string;sectorName:string;programName:string;levelName:string;academicYearName:string})[];
  programCount: number; levelCount: number; weeklyHoursLabel: string; coefficientLabel: string;
  teachers: TeacherSubjectAssignment[];
}
export interface SubjectsData {
  subjects: SubjectRecord[]; structure: SectorProgramData; levels: LevelRecord[];
  academicYears: AcademicYear[]; teachers: TeacherSubjectAssignment[];
}
export interface SubjectInput {
  name: string; code: string; category: SubjectCategory; description: string;
  defaultWeeklyHours: number | null; defaultCoefficient: number | null;
}
export interface SubjectAssignmentInput {
  programId: string; levelId: string; weeklyHours: number | null; coefficient: number | null; academicYearId: string;
}
export class SubjectsRepositoryError extends Error {
  constructor(message:string){super(message);this.name="SubjectsRepositoryError";}
}
const SUBJECT_KEY="school-platform-subjects-v1";
const ASSIGNMENT_KEY="school-platform-subject-assignments-v1";
const TEACHER_KEY="school-platform-teacher-subject-assignments-v1";
const categories:SubjectCategory[]=["Langues","Sciences","Sciences humaines et sociales","Autres matières"];
const subjectSeeds:Omit<Subject,"createdAt"|"updatedAt">[]=[
 {id:"SUB-MAT",name:"Mathématiques",code:"MAT-01",category:"Sciences",description:"Enseignement des mathématiques.",status:"Actif",defaultWeeklyHours:5,defaultCoefficient:3},
 {id:"SUB-PHY",name:"Physique-Chimie",code:"PHY-01",category:"Sciences",description:"Physique et chimie.",status:"Actif",defaultWeeklyHours:4,defaultCoefficient:2},
 {id:"SUB-SVT",name:"Sciences de la Vie et de la Terre",code:"SVT-01",category:"Sciences",description:"Sciences de la vie et de la terre.",status:"Actif",defaultWeeklyHours:3,defaultCoefficient:2},
 {id:"SUB-FR",name:"Français",code:"FR-01",category:"Langues",description:"Langue française.",status:"Actif",defaultWeeklyHours:4,defaultCoefficient:2},
 {id:"SUB-ENG",name:"English",code:"ENG-01",category:"Langues",description:"Langue anglaise.",status:"Actif",defaultWeeklyHours:2,defaultCoefficient:1},
 {id:"SUB-ARB",name:"اللغة العربية",code:"ARB-01",category:"Langues",description:"اللغة العربية.",status:"Actif",defaultWeeklyHours:3,defaultCoefficient:2},
 {id:"SUB-HG",name:"Histoire-Géographie",code:"HG-01",category:"Sciences humaines et sociales",description:"Histoire et géographie.",status:"Actif",defaultWeeklyHours:2,defaultCoefficient:1},
 {id:"SUB-ISL",name:"التربية الإسلامية",code:"ISL-01",category:"Sciences humaines et sociales",description:"التربية الإسلامية.",status:"Actif",defaultWeeklyHours:2,defaultCoefficient:1},
 {id:"SUB-EPS",name:"Éducation physique et sportive",code:"EPS-01",category:"Autres matières",description:"Éducation physique et sportive.",status:"Actif",defaultWeeklyHours:2,defaultCoefficient:1},
];
function read<T>(key:string,seed:T[]):T[]{
 try{const raw=window.localStorage.getItem(key);if(!raw){window.localStorage.setItem(key,JSON.stringify(seed));return seed;}const parsed:unknown=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error("Format invalide");return parsed as T[];}
 catch{throw new SubjectsRepositoryError("Impossible de charger le catalogue des matières depuis ce navigateur.");}
}
function write<T>(key:string,rows:T[]):T[]{
 try{window.localStorage.setItem(key,JSON.stringify(rows));return rows;}
 catch{throw new SubjectsRepositoryError("L'enregistrement a échoué. Vérifiez l'espace disponible dans le navigateur puis réessayez.");}
}
function seedSubjects():Subject[]{
 const now=new Date().toISOString();return subjectSeeds.map(row=>({...row,createdAt:now,updatedAt:now}));
}
function seedAssignments(structure:SectorProgramData,levels:LevelRecord[],years:AcademicYear[]):SubjectAssignment[]{
 const year=years.find(y=>y.status==="Active")??years[0];if(!year)return [];
 const links:{subjectId:string;programCodes:string[];hours:number;coefficient:number}[]=[
  {subjectId:"SUB-MAT",programCodes:["TC-SCI","SE-1BAC","SE-2BAC","SMA","SMB"],hours:5,coefficient:3},
  {subjectId:"SUB-PHY",programCodes:["TC-SCI","SE-1BAC","SE-2BAC","SMA"],hours:4,coefficient:2},
  {subjectId:"SUB-SVT",programCodes:["SE-1BAC","SE-2BAC"],hours:3,coefficient:2},
  {subjectId:"SUB-FR",programCodes:["TC-SCI","TC-LSH","SE-1BAC","SE-2BAC","LSH-L"],hours:4,coefficient:2},
  {subjectId:"SUB-ENG",programCodes:["TC-SCI","TC-LSH","SE-1BAC","SE-2BAC","SMA"],hours:2,coefficient:1},
  {subjectId:"SUB-ARB",programCodes:["TC-SCI","TC-LSH","SE-1BAC","SE-2BAC","EO-1BAC","EO-2BAC"],hours:3,coefficient:2},
  {subjectId:"SUB-HG",programCodes:["TC-LSH","LSH-L","LSH-H"],hours:2,coefficient:1},
  {subjectId:"SUB-ISL",programCodes:["TC-SCI","TC-LSH","EO-1BAC","EO-2BAC"],hours:2,coefficient:1},
  {subjectId:"SUB-EPS",programCodes:["TC-SCI","TC-LSH","SE-1BAC","SE-2BAC","SMA"],hours:2,coefficient:1},
 ];
 const now=new Date().toISOString();
 return links.flatMap(link=>structure.programs.filter(p=>link.programCodes.includes(p.code)&&p.status==="Actif").flatMap(program=>levels.filter(l=>l.programId===program.id&&l.status==="Actif").map(level=>({id:`ASG-${link.subjectId}-${program.id}-${level.id}`,subjectId:link.subjectId,programId:program.id,levelId:level.id,weeklyHours:link.hours,coefficient:link.coefficient,academicYearId:year.id,active:true,createdAt:now,updatedAt:now}))));
}
async function loadRaw(){
 const [structure,levels,academicYears]=await Promise.all([sectorsProgramsRepository.list(),levelsRepository.list(),academicYearRepository.list()]);
 const subjects=read(SUBJECT_KEY,seedSubjects());
 const assignments=read(ASSIGNMENT_KEY,seedAssignments(structure,levels,academicYears));
 const teachers=read(TEACHER_KEY,[]);
 return {structure,levels,academicYears,subjects,assignments,teachers};
}
function validateSubject(input:SubjectInput,rows:Subject[],excludedId?:string){
 if(!input.name.trim())throw new SubjectsRepositoryError("Le nom de la matière est obligatoire.");
 if(!input.code.trim())throw new SubjectsRepositoryError("Le code de la matière est obligatoire.");
 if(!categories.includes(input.category))throw new SubjectsRepositoryError("Sélectionnez une catégorie valide.");
 if(input.defaultWeeklyHours!==null&&(!Number.isFinite(input.defaultWeeklyHours)||input.defaultWeeklyHours<=0||input.defaultWeeklyHours>40))throw new SubjectsRepositoryError("Le volume horaire par défaut doit être compris entre 0 et 40 heures.");
 if(input.defaultCoefficient!==null&&(!Number.isFinite(input.defaultCoefficient)||input.defaultCoefficient<=0||input.defaultCoefficient>20))throw new SubjectsRepositoryError("Le coefficient par défaut doit être supérieur à 0 et inférieur ou égal à 20.");
 const code=input.code.trim().toLocaleUpperCase("fr-FR");
 if(rows.some(s=>s.id!==excludedId&&s.code.toLocaleUpperCase("fr-FR")===code))throw new SubjectsRepositoryError("Ce code est déjà utilisé par une autre matière de l'établissement.");
}
function buildRecords(raw:Awaited<ReturnType<typeof loadRaw>>):SubjectRecord[]{
 return raw.subjects.map(subject=>{
  const assignments=raw.assignments.filter(a=>a.subjectId===subject.id&&a.active).flatMap(a=>{
   const program=raw.structure.programs.find(p=>p.id===a.programId);const sector=program&&raw.structure.sectors.find(s=>s.id===program.sectorId);
   const level=raw.levels.find(l=>l.id===a.levelId);const year=raw.academicYears.find(y=>y.id===a.academicYearId);
   if(!program||!sector||!level||!year)return [];
   return [{...a,cycle:sector.cycle,sectorId:sector.id,sectorName:sector.name,programName:program.name,levelName:level.name,academicYearName:year.name}];
  });
  const hours=[...new Set(assignments.map(a=>a.weeklyHours))];const coefficients=[...new Set(assignments.map(a=>a.coefficient))];
  const label=(values:(number|null)[])=>values.length===0?"Non défini":values.length>1?"Variable":values[0]===null?"Non défini":String(values[0]);
  return {...subject,assignments,programCount:new Set(assignments.map(a=>a.programId)).size,levelCount:new Set(assignments.map(a=>a.levelId)).size,weeklyHoursLabel:label(hours),coefficientLabel:label(coefficients),teachers:raw.teachers.filter(t=>t.subjectId===subject.id)};
 }).sort((a,b)=>a.name.localeCompare(b.name,"fr"));
}
export const subjectsRepository={
 async list():Promise<SubjectsData>{const raw=await loadRaw();return {subjects:buildRecords(raw),structure:raw.structure,levels:raw.levels,academicYears:raw.academicYears,teachers:raw.teachers};},
 async create(input:SubjectInput):Promise<SubjectsData>{const raw=await loadRaw();validateSubject(input,raw.subjects);const now=new Date().toISOString();const row:Subject={id:`SUB-${Date.now()}`,...input,name:input.name.trim(),code:input.code.trim().toLocaleUpperCase("fr-FR"),description:input.description.trim(),status:"Actif",createdAt:now,updatedAt:now};write(SUBJECT_KEY,[row,...raw.subjects]);return this.list();},
 async update(id:string,input:SubjectInput):Promise<SubjectsData>{const raw=await loadRaw();const target=raw.subjects.find(s=>s.id===id);if(!target)throw new SubjectsRepositoryError("Cette matière n'existe plus. Actualisez la page.");validateSubject(input,raw.subjects,id);write(SUBJECT_KEY,raw.subjects.map(s=>s.id===id?{...s,...input,name:input.name.trim(),code:input.code.trim().toLocaleUpperCase("fr-FR"),description:input.description.trim(),updatedAt:new Date().toISOString()}:s));return this.list();},
 async saveAssignments(subjectId:string,academicYearId:string,inputs:SubjectAssignmentInput[]):Promise<SubjectsData>{
  const raw=await loadRaw();const subject=raw.subjects.find(s=>s.id===subjectId);if(!subject)throw new SubjectsRepositoryError("Cette matière n'existe plus.");
  if(subject.status!=="Actif")throw new SubjectsRepositoryError("Une matière inactive ne peut pas recevoir de nouvelles affectations.");
  const seen=new Set<string>();const now=new Date().toISOString();
  for(const input of inputs){
   const key=`${input.programId}::${input.levelId}`;if(seen.has(key))throw new SubjectsRepositoryError("Cette combinaison programme et niveau est sélectionnée plusieurs fois.");seen.add(key);
   const program=raw.structure.programs.find(p=>p.id===input.programId);const sector=program&&raw.structure.sectors.find(s=>s.id===program.sectorId);
   const level=raw.levels.find(l=>l.id===input.levelId&&l.programId===input.programId);
   if(!program||!sector||program.status!=="Actif"||sector.status!=="Actif"||!level||level.status!=="Actif")throw new SubjectsRepositoryError("Le programme ou le niveau sélectionné n'est plus disponible.");
   if(!raw.academicYears.some(y=>y.id===input.academicYearId&&y.status!=="Archivée"&&y.status!=="Terminée"))throw new SubjectsRepositoryError("Sélectionnez une année scolaire ouverte.");
   if(input.weeklyHours!==null&&(!Number.isFinite(input.weeklyHours)||input.weeklyHours<=0||input.weeklyHours>40))throw new SubjectsRepositoryError("Le volume horaire doit être compris entre 0 et 40 heures.");
   if(input.coefficient!==null&&(!Number.isFinite(input.coefficient)||input.coefficient<=0||input.coefficient>20))throw new SubjectsRepositoryError("Le coefficient doit être supérieur à 0 et inférieur ou égal à 20.");
  }
  const existing=raw.assignments.filter(a=>a.subjectId===subjectId);
  if(!raw.academicYears.some(y=>y.id===academicYearId&&y.status!=="Archivée"&&y.status!=="Terminée"))throw new SubjectsRepositoryError("Sélectionnez une année scolaire ouverte.");
  if(inputs.some(input=>input.academicYearId!==academicYearId))throw new SubjectsRepositoryError("Les affectations enregistrées doivent appartenir à l’année scolaire sélectionnée.");
  const retained=existing.filter(a=>a.academicYearId!==academicYearId||inputs.some(i=>i.programId===a.programId&&i.levelId===a.levelId)).map(a=>a.academicYearId===academicYearId?{...a,active:false,updatedAt:now}:a);
  const next=inputs.map(input=>{const old=existing.find(a=>a.programId===input.programId&&a.levelId===input.levelId&&a.academicYearId===academicYearId);return old?{...old,...input,active:true,updatedAt:now}:{id:`ASG-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,subjectId,...input,active:true,createdAt:now,updatedAt:now};});
  write(ASSIGNMENT_KEY,[...raw.assignments.filter(a=>a.subjectId!==subjectId),...retained,...next]);return this.list();
 },
 async removeAssignment(id:string):Promise<SubjectsData>{const raw=await loadRaw();const target=raw.assignments.find(a=>a.id===id);if(!target)throw new SubjectsRepositoryError("Cette affectation n'existe plus.");write(ASSIGNMENT_KEY,raw.assignments.map(a=>a.id===id?{...a,active:false,updatedAt:new Date().toISOString()}:a));return this.list();},
 async setStatus(id:string,status:EntityStatus):Promise<SubjectsData>{const raw=await loadRaw();const target=raw.subjects.find(s=>s.id===id);if(!target)throw new SubjectsRepositoryError("Cette matière n'existe plus.");if(status==="Inactif"&&raw.assignments.some(a=>a.subjectId===id&&a.active))throw new SubjectsRepositoryError("Cette matière possède des affectations actives. Désactivez ou archivez d'abord les affectations concernées.");write(SUBJECT_KEY,raw.subjects.map(s=>s.id===id?{...s,status,updatedAt:new Date().toISOString()}:s));return this.list();}
};
