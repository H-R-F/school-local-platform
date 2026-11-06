import { sectorsProgramsRepository, type EducationalCycle, type EducationalProgram, type SectorProgramData, type EntityStatus } from "./sectors-programs";

export interface SchoolLevel {
  id: string;
  name: string;
  code: string;
  description: string;
  programId: string;
  order: number;
  status: EntityStatus;
  classCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface LevelRecord extends SchoolLevel {
  cycle: EducationalCycle;
  sectorId: string;
  sectorName: string;
  sectorCode: string;
  programName: string;
  programCode: string;
}
export interface LevelInput {
  name: string;
  code: string;
  description: string;
  programId: string;
  order: number;
}
export class LevelRepositoryError extends Error {
  constructor(message: string) { super(message); this.name = "LevelRepositoryError"; }
}
const STORAGE_KEY = "school-platform-levels-v1";
const identity: Record<string, {name:string;code:string;description:string}> = {
  "LV-TC": {name:"Tronc Commun",code:"TC",description:"Niveau commun du secondaire qualifiant."},
  "LV-1BAC": {name:"1ère année Baccalauréat",code:"BAC-1",description:"Première année du cycle du baccalauréat."},
  "LV-2BAC": {name:"2ème année Baccalauréat",code:"BAC-2",description:"Deuxième année du cycle du baccalauréat."},
  "LV-PRI-1": {name:"1ère année primaire",code:"PRI-1",description:"Première année de l’enseignement primaire."},
  "LV-PRI-2": {name:"2ème année primaire",code:"PRI-2",description:"Deuxième année de l’enseignement primaire."},
  "LV-PRI-3": {name:"3ème année primaire",code:"PRI-3",description:"Troisième année de l’enseignement primaire."},
  "LV-PRI-4": {name:"4ème année primaire",code:"PRI-4",description:"Quatrième année de l’enseignement primaire."},
  "LV-PRI-5": {name:"5ème année primaire",code:"PRI-5",description:"Cinquième année de l’enseignement primaire."},
  "LV-PRI-6": {name:"6ème année primaire",code:"PRI-6",description:"Sixième année de l’enseignement primaire."},
  "LV-COL-1": {name:"1ère année collège",code:"COL-1",description:"Première année de l’enseignement secondaire collégial."},
  "LV-COL-2": {name:"2ème année collège",code:"COL-2",description:"Deuxième année de l’enseignement secondaire collégial."},
  "LV-COL-3": {name:"3ème année collège",code:"COL-3",description:"Troisième année de l’enseignement secondaire collégial."},
};
function makeSeed(data:SectorProgramData): SchoolLevel[] {
  const now = new Date().toISOString();
  return data.programs.flatMap(program => {
    const standard = identity[program.levelId];
    if (!standard) return [];
    return [{id:`LEVEL-${program.id}`,...standard,programId:program.id,order:1,status:program.status,classCount:program.classCount,createdAt:now,updatedAt:now}];
  });
}
function readStore(data:SectorProgramData): SchoolLevel[] {
  try {
    const raw=window.localStorage.getItem(STORAGE_KEY);
    if(!raw){const initial=makeSeed(data);window.localStorage.setItem(STORAGE_KEY,JSON.stringify(initial));return initial;}
    const parsed:unknown=JSON.parse(raw);
    if(!Array.isArray(parsed))throw new Error("Format invalide");
    return parsed as SchoolLevel[];
  } catch { throw new LevelRepositoryError("Impossible de charger les niveaux scolaires enregistrés dans ce navigateur."); }
}
function writeStore(rows:SchoolLevel[]):SchoolLevel[] {
  try {window.localStorage.setItem(STORAGE_KEY,JSON.stringify(rows));return rows;}
  catch {throw new LevelRepositoryError("L’enregistrement a échoué. Vérifiez l’espace disponible dans le navigateur puis réessayez.");}
}
function programFor(data:SectorProgramData,programId:string):EducationalProgram {
  const program=data.programs.find(item=>item.id===programId);
  if(!program)throw new LevelRepositoryError("Le programme sélectionné n’existe plus. Actualisez les données puis réessayez.");
  const sector=data.sectors.find(item=>item.id===program.sectorId);
  if(!sector)throw new LevelRepositoryError("La filière associée à ce programme est introuvable.");
  if(sector.status!=="Actif"||program.status!=="Actif")throw new LevelRepositoryError("Un niveau ne peut être affecté qu’à un programme et une filière actifs.");
  return program;
}
function validate(input:LevelInput,rows:SchoolLevel[],data:SectorProgramData,excludedId?:string) {
  if(!input.name.trim())throw new LevelRepositoryError("Le nom du niveau est obligatoire.");
  if(!input.code.trim())throw new LevelRepositoryError("Le code du niveau est obligatoire.");
  if(!input.programId)throw new LevelRepositoryError("Veuillez sélectionner un programme.");
  if(!Number.isInteger(input.order)||input.order<1)throw new LevelRepositoryError("L’ordre doit être un nombre entier supérieur ou égal à 1.");
  programFor(data,input.programId);
  const sameProgram=rows.filter(row=>row.programId===input.programId&&row.id!==excludedId);
  const code=input.code.trim().toLocaleUpperCase("fr-FR");
  if(sameProgram.some(row=>row.code.toLocaleUpperCase("fr-FR")===code))throw new LevelRepositoryError("Ce code est déjà utilisé dans ce programme.");
  if(sameProgram.some(row=>row.name.trim().toLocaleLowerCase("fr-FR")===input.name.trim().toLocaleLowerCase("fr-FR")))throw new LevelRepositoryError("Ce niveau existe déjà dans ce programme.");
  if(sameProgram.some(row=>row.order===input.order))throw new LevelRepositoryError("Cette position est déjà utilisée dans ce programme. Choisissez un autre ordre.");
}
function join(rows:SchoolLevel[],data:SectorProgramData):LevelRecord[] {
  return rows.flatMap(row=>{
    const program=data.programs.find(item=>item.id===row.programId);
    const sector=program&&data.sectors.find(item=>item.id===program.sectorId);
    if(!program||!sector)return [];
    return [{...row,cycle:sector.cycle,sectorId:sector.id,sectorName:sector.name,sectorCode:sector.code,programName:program.name,programCode:program.code}];
  }).sort((a,b)=>a.programName.localeCompare(b.programName,"fr")||a.order-b.order||a.name.localeCompare(b.name,"fr"));
}
export const levelsRepository = {
  async list():Promise<LevelRecord[]> {
    const data=await sectorsProgramsRepository.list();
    return join(readStore(data),data);
  },
  async create(input:LevelInput):Promise<LevelRecord[]> {
    const data=await sectorsProgramsRepository.list();const rows=readStore(data);validate(input,rows,data);
    const now=new Date().toISOString();
    const next=[...rows,{id:`LEVEL-${Date.now()}`,...input,name:input.name.trim(),code:input.code.trim().toLocaleUpperCase("fr-FR"),description:input.description.trim(),status:"Actif" as EntityStatus,classCount:0,createdAt:now,updatedAt:now}];
    return join(writeStore(next),data);
  },
  async update(id:string,input:LevelInput):Promise<LevelRecord[]> {
    const data=await sectorsProgramsRepository.list();const rows=readStore(data);const current=rows.find(row=>row.id===id);
    if(!current)throw new LevelRepositoryError("Ce niveau n’existe plus. Actualisez la page.");
    validate(input,rows,data,id);
    const next=rows.map(row=>row.id===id?{...row,...input,name:input.name.trim(),code:input.code.trim().toLocaleUpperCase("fr-FR"),description:input.description.trim(),updatedAt:new Date().toISOString()}:row);
    return join(writeStore(next),data);
  },
  async changeOrder(id:string,order:number):Promise<LevelRecord[]> {
    const data=await sectorsProgramsRepository.list();const rows=readStore(data);const current=rows.find(row=>row.id===id);
    if(!current)throw new LevelRepositoryError("Ce niveau n’existe plus. Actualisez la page.");
    if(!Number.isInteger(order)||order<1)throw new LevelRepositoryError("L’ordre doit être un nombre entier supérieur ou égal à 1.");
    if(rows.some(row=>row.programId===current.programId&&row.id!==id&&row.order===order))throw new LevelRepositoryError("Cette position est déjà utilisée dans ce programme.");
    return join(writeStore(rows.map(row=>row.id===id?{...row,order,updatedAt:new Date().toISOString()}:row)),data);
  },
  async setStatus(id:string,status:EntityStatus):Promise<LevelRecord[]> {
    const data=await sectorsProgramsRepository.list();const rows=readStore(data);const current=rows.find(row=>row.id===id);
    if(!current)throw new LevelRepositoryError("Ce niveau n’existe plus. Actualisez la page.");
    if(status==="Inactif"&&current.classCount>0)throw new LevelRepositoryError("Ce niveau est associé à des classes. Réaffectez d’abord les classes avant sa désactivation.");
    if(status==="Actif")programFor(data,current.programId);
    return join(writeStore(rows.map(row=>row.id===id?{...row,status,updatedAt:new Date().toISOString()}:row)),data);
  },
};
