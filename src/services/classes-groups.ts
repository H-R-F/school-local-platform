import { academicYearRepository, type AcademicYear } from "./academic-years";
import { levelsRepository, type LevelRecord } from "./levels";
import { sectorsProgramsRepository, type EducationalCycle, type EntityStatus, type SectorProgramData } from "./sectors-programs";

export type ClassStatus = "Actif" | "Inactif";
export interface SchoolGroup {
  id: string; classId: string; name: string; code: string; capacity: number;
  studentCount: number; teacherName: string; status: ClassStatus;
}
export interface SchoolClass {
  id: string; name: string; code: string; academicYearId: string; levelId: string;
  capacity: number; enrolledCount: number; homeroomTeacher: string; description: string;
  status: ClassStatus; createdAt: string; updatedAt: string;
}
export interface ClassRecord extends SchoolClass {
  academicYearName: string; cycle: EducationalCycle; sectorId: string; sectorName: string;
  programId: string; programName: string; levelName: string; groups: SchoolGroup[];
  availablePlaces: number; capacityRatio: number;
}
export interface ClassInput {
  name: string; code: string; academicYearId: string; levelId: string;
  capacity: number; homeroomTeacher: string; description: string;
}
export interface GroupInput {
  name: string; code: string; classId: string; capacity: number; teacherName: string;
}
export interface ClassesData {
  academicYears: AcademicYear[]; structure: SectorProgramData; levels: LevelRecord[];
  classes: ClassRecord[];
}
const CLASS_KEY="school-platform-classes-v1";
const GROUP_KEY="school-platform-groups-v1";
const demoTeachers=["Ahmed El Amrani","Fatima Zahra Alaoui","Youssef Bennani","Salma Idrissi"];
export class ClassesRepositoryError extends Error {
  constructor(message:string){super(message);this.name="ClassesRepositoryError";}
}
function read<T>(key:string,seed:T[]):T[]{
  try{const raw=window.localStorage.getItem(key);if(!raw){window.localStorage.setItem(key,JSON.stringify(seed));return seed;}
    const parsed:unknown=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error("Format invalide");return parsed as T[];
  }catch{throw new ClassesRepositoryError("Impossible de charger les données des classes depuis ce navigateur.");}
}
function write<T>(key:string,rows:T[]):T[]{
  try{window.localStorage.setItem(key,JSON.stringify(rows));return rows;}
  catch{throw new ClassesRepositoryError("L'enregistrement a échoué. Vérifiez l'espace disponible dans le navigateur puis réessayez.");}
}
function seedClasses(years:AcademicYear[],levels:LevelRecord[]):SchoolClass[]{
  const year=years.find(y=>y.status==="Active")??years[0];
  if(!year)return [];
  const byCode=(code:string)=>levels.find(l=>l.code===code)??levels[0];
  const templates=[
    {name:"Tronc Commun Sciences - 1",code:"TCS-1",level:byCode("TC"),capacity:30,enrolled:26,teacher:demoTeachers[0]},
    {name:"Tronc Commun Lettres - 1",code:"TCL-1",level:byCode("TC"),capacity:30,enrolled:24,teacher:demoTeachers[1]},
    {name:"2ème Bac Sciences Expérimentales - 1",code:"2BSE-1",level:byCode("BAC-2"),capacity:25,enrolled:22,teacher:demoTeachers[2]},
    {name:"2ème Bac Sciences Mathématiques - 1",code:"2BSM-1",level:byCode("BAC-2"),capacity:30,enrolled:30,teacher:demoTeachers[3]},
    {name:"1ère Bac Sciences Expérimentales - 1",code:"1BSE-1",level:byCode("BAC-1"),capacity:30,enrolled:28,teacher:demoTeachers[0]},
  ].filter(x=>x.level);
  const now=new Date().toISOString();
  return templates.map((x,i)=>({id:`CLS-DEMO-${i+1}`,name:x.name,code:x.code,academicYearId:year.id,levelId:x.level!.id,capacity:x.capacity,enrolledCount:x.enrolled,homeroomTeacher:x.teacher,description:"Donnée illustrative de développement.",status:"Actif",createdAt:now,updatedAt:now}));
}
function seedGroups(classes:SchoolClass[]):SchoolGroup[]{
  const specs=[{classCode:"TCS-1",groups:[["Groupe A","TCS-1-A",13,15,demoTeachers[0]],["Groupe B","TCS-1-B",13,15,demoTeachers[1]]]},{classCode:"TCL-1",groups:[["Groupe A","TCL-1-A",12,15,demoTeachers[1]],["Groupe B","TCL-1-B",12,15,demoTeachers[2]]]},{classCode:"2BSE-1",groups:[["Groupe A","2BSE-1-A",22,25,demoTeachers[2]]]},{classCode:"1BSE-1",groups:[["Groupe A","1BSE-1-A",14,15,demoTeachers[0]],["Groupe B","1BSE-1-B",14,15,demoTeachers[3]]]}];
  return specs.flatMap(s=>{const parent=classes.find(c=>c.code===s.classCode);return parent?s.groups.map((g,i)=>({id:`GRP-DEMO-${s.classCode}-${i+1}`,classId:parent.id,name:g[0] as string,code:g[1] as string,studentCount:g[2] as number,capacity:g[3] as number,teacherName:g[4] as string,status:"Actif" as ClassStatus})):[];});
}
function makeRecords(classes:SchoolClass[],groups:SchoolGroup[],years:AcademicYear[],levels:LevelRecord[]):ClassRecord[]{
  return classes.flatMap(row=>{
    const level=levels.find(l=>l.id===row.levelId);const year=years.find(y=>y.id===row.academicYearId);
    if(!level||!year)return [];
    const program=level.programName;
    const ownGroups=groups.filter(g=>g.classId===row.id);
    return [{...row,academicYearName:year.name,cycle:level.cycle,sectorId:level.sectorId,sectorName:level.sectorName,programId:level.programId,programName:program,levelName:level.name,groups:ownGroups,availablePlaces:Math.max(0,row.capacity-row.enrolledCount),capacityRatio:row.capacity?row.enrolledCount/row.capacity:0}];
  }).sort((a,b)=>a.code.localeCompare(b.code,"fr"));
}
async function loadRaw(){
  const [academicYears,structure,levels]=await Promise.all([academicYearRepository.list(),sectorsProgramsRepository.list(),levelsRepository.list()]);
  const classes=read(CLASS_KEY,seedClasses(academicYears,levels));
  const groups=read(GROUP_KEY,seedGroups(classes));
  return {academicYears,structure,levels,classes,groups};
}
function validateClass(input:ClassInput,classes:SchoolClass[],years:AcademicYear[],levels:LevelRecord[],excludedId?:string){
  if(!input.name.trim())throw new ClassesRepositoryError("Le nom de la classe est obligatoire.");
  if(!input.code.trim())throw new ClassesRepositoryError("Le code de la classe est obligatoire.");
  const year=years.find(y=>y.id===input.academicYearId);
  if(!year)throw new ClassesRepositoryError("Veuillez sélectionner une année scolaire valide.");
  if(year.status==="Terminée"||year.status==="Archivée")throw new ClassesRepositoryError("Cette année scolaire n'accepte plus de nouvelles classes.");
  const level=levels.find(l=>l.id===input.levelId&&l.status==="Actif");
  if(!level)throw new ClassesRepositoryError("Le niveau sélectionné est indisponible. Vérifiez le programme et la filière.");
  if(!Number.isInteger(input.capacity)||input.capacity<1)throw new ClassesRepositoryError("La capacité maximale doit être un entier positif.");
  const code=input.code.trim().toLocaleUpperCase("fr-FR");
  if(classes.some(c=>c.id!==excludedId&&c.academicYearId===input.academicYearId&&c.code.toLocaleUpperCase("fr-FR")===code))throw new ClassesRepositoryError("Ce code de classe est déjà utilisé pour cette année scolaire.");
}
export const classesGroupsRepository={
  async list():Promise<ClassesData>{
    const raw=await loadRaw();
    return {academicYears:raw.academicYears,structure:raw.structure,levels:raw.levels,classes:makeRecords(raw.classes,raw.groups,raw.academicYears,raw.levels)};
  },
  async create(input:ClassInput):Promise<ClassesData>{
    const raw=await loadRaw();validateClass(input,raw.classes,raw.academicYears,raw.levels);
    const now=new Date().toISOString();const row:SchoolClass={id:`CLS-${Date.now()}`,...input,name:input.name.trim(),code:input.code.trim().toLocaleUpperCase("fr-FR"),homeroomTeacher:input.homeroomTeacher.trim(),description:input.description.trim(),enrolledCount:0,status:"Actif",createdAt:now,updatedAt:now};
    write(CLASS_KEY,[row,...raw.classes]);return this.list();
  },
  async update(id:string,input:ClassInput):Promise<ClassesData>{
    const raw=await loadRaw();const current=raw.classes.find(c=>c.id===id);if(!current)throw new ClassesRepositoryError("Cette classe n'existe plus. Actualisez la page.");
    validateClass(input,raw.classes,raw.academicYears,raw.levels,id);
    if(input.capacity<current.enrolledCount)throw new ClassesRepositoryError(`La capacité ne peut pas être inférieure à l'effectif actuel (${current.enrolledCount} élèves).`);
    const groups=raw.groups.filter(g=>g.classId===id);if(groups.reduce((sum,g)=>sum+g.capacity,0)>input.capacity)throw new ClassesRepositoryError("La capacité de la classe est inférieure au total des capacités de ses groupes. Ajustez d'abord les groupes.");
    write(CLASS_KEY,raw.classes.map(c=>c.id===id?{...c,...input,name:input.name.trim(),code:input.code.trim().toLocaleUpperCase("fr-FR"),homeroomTeacher:input.homeroomTeacher.trim(),description:input.description.trim(),updatedAt:new Date().toISOString()}:c));
    return this.list();
  },
  async setStatus(id:string,status:ClassStatus):Promise<ClassesData>{
    const raw=await loadRaw();const target=raw.classes.find(c=>c.id===id);if(!target)throw new ClassesRepositoryError("Cette classe n'existe plus.");
    if(status==="Inactif"&&target.enrolledCount>0)throw new ClassesRepositoryError("Cette classe contient des élèves inscrits. Transférez les élèves avant de la désactiver.");
    write(CLASS_KEY,raw.classes.map(c=>c.id===id?{...c,status,updatedAt:new Date().toISOString()}:c));return this.list();
  },
  async createGroup(input:GroupInput):Promise<ClassesData>{
    const raw=await loadRaw();const parent=raw.classes.find(c=>c.id===input.classId);
    if(!parent||parent.status!=="Actif")throw new ClassesRepositoryError("La classe parente est introuvable ou inactive.");
    if(!input.name.trim()||!input.code.trim())throw new ClassesRepositoryError("Le nom et le code du groupe sont obligatoires.");
    if(!Number.isInteger(input.capacity)||input.capacity<1)throw new ClassesRepositoryError("La capacité du groupe doit être un entier positif.");
    const siblings=raw.groups.filter(g=>g.classId===parent.id);
    if(siblings.some(g=>g.code.toLocaleLowerCase("fr-FR")===input.code.trim().toLocaleLowerCase("fr-FR")))throw new ClassesRepositoryError("Ce code de groupe existe déjà dans cette classe.");
    if(siblings.reduce((sum,g)=>sum+g.capacity,0)+input.capacity>parent.capacity)throw new ClassesRepositoryError("La capacité du groupe dépasse les places encore disponibles dans la capacité globale de la classe.");
    const row:SchoolGroup={id:`GRP-${Date.now()}`,...input,name:input.name.trim(),code:input.code.trim().toLocaleUpperCase("fr-FR"),teacherName:input.teacherName.trim(),studentCount:0,status:"Actif"};
    write(GROUP_KEY,[row,...raw.groups]);return this.list();
  },
  async updateGroup(id:string,input:GroupInput):Promise<ClassesData>{
    const raw=await loadRaw();const current=raw.groups.find(g=>g.id===id);if(!current)throw new ClassesRepositoryError("Ce groupe n'existe plus.");
    const parent=raw.classes.find(c=>c.id===input.classId);if(!parent)throw new ClassesRepositoryError("Sélectionnez une classe parente valide.");
    if(!input.name.trim()||!input.code.trim())throw new ClassesRepositoryError("Le nom et le code du groupe sont obligatoires.");
    if(!Number.isInteger(input.capacity)||input.capacity<1)throw new ClassesRepositoryError("La capacité du groupe doit être un entier positif.");
    const siblings=raw.groups.filter(g=>g.classId===parent.id&&g.id!==id);
    if(siblings.some(g=>g.code.toLocaleLowerCase("fr-FR")===input.code.trim().toLocaleLowerCase("fr-FR")))throw new ClassesRepositoryError("Ce code de groupe existe déjà dans cette classe.");
    if(siblings.reduce((sum,g)=>sum+g.capacity,0)+input.capacity>parent.capacity)throw new ClassesRepositoryError("La somme des capacités des groupes ne peut pas dépasser celle de la classe.");
    if(input.capacity<current.studentCount)throw new ClassesRepositoryError("La capacité ne peut pas être inférieure au nombre d'élèves déjà affectés à ce groupe.");
    write(GROUP_KEY,raw.groups.map(g=>g.id===id?{...g,...input,name:input.name.trim(),code:input.code.trim().toLocaleUpperCase("fr-FR"),teacherName:input.teacherName.trim()}:g));return this.list();
  },
  async setGroupStatus(id:string,status:ClassStatus):Promise<ClassesData>{
    const raw=await loadRaw();const target=raw.groups.find(g=>g.id===id);if(!target)throw new ClassesRepositoryError("Ce groupe n'existe plus.");
    if(status==="Inactif"&&target.studentCount>0)throw new ClassesRepositoryError("Ce groupe contient des élèves. Réaffectez-les avant de le désactiver.");
    write(GROUP_KEY,raw.groups.map(g=>g.id===id?{...g,status}:g));return this.list();
  },
};
