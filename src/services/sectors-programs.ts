export type EducationalCycle = "Enseignement primaire" | "Enseignement secondaire collégial" | "Enseignement secondaire qualifiant";
export type EntityStatus = "Actif" | "Inactif";

export interface EducationalLevel {
  id: string;
  name: string;
  cycle: EducationalCycle;
}
export interface Sector {
  id: string;
  name: string;
  code: string;
  description: string;
  cycle: EducationalCycle;
  status: EntityStatus;
}
export interface EducationalProgram {
  id: string;
  sectorId: string;
  name: string;
  code: string;
  description: string;
  levelId: string;
  classCount: number;
  status: EntityStatus;
}
export interface SectorInput {
  name: string;
  code: string;
  description: string;
  cycle: EducationalCycle;
  status: EntityStatus;
}
export interface ProgramInput {
  name: string;
  code: string;
  description: string;
  sectorId: string;
  levelId: string;
  status: EntityStatus;
}
export interface SectorProgramData {
  sectors: Sector[];
  programs: EducationalProgram[];
  levels: EducationalLevel[];
}

const STORAGE_KEY = "school-platform-sectors-programs-v1";
const QUALIFIANT: EducationalCycle = "Enseignement secondaire qualifiant";
const levels: EducationalLevel[] = [
  { id: "LV-TC", name: "Tronc Commun", cycle: QUALIFIANT },
  { id: "LV-1BAC", name: "1ère Bac", cycle: QUALIFIANT },
  { id: "LV-2BAC", name: "2ème Bac", cycle: QUALIFIANT },
  ...["Première année primaire","Deuxième année primaire","Troisième année primaire","Quatrième année primaire","Cinquième année primaire","Sixième année primaire"].map((name,i)=>({id:`LV-PRI-${i+1}`,name,cycle:"Enseignement primaire" as EducationalCycle})),
  ...["Première année collège","Deuxième année collège","Troisième année collège"].map((name,i)=>({id:`LV-COL-${i+1}`,name,cycle:"Enseignement secondaire collégial" as EducationalCycle})),
];
const demo: SectorProgramData = {
  levels,
  sectors: [
    {id:"SEC-TC",name:"Tronc Commun",code:"TC",description:"Première année du secondaire qualifiant, avec un enseignement commun avant la spécialisation.",cycle:QUALIFIANT,status:"Actif"},
    {id:"SEC-SCEXP",name:"Sciences Expérimentales",code:"SC-EXP",description:"Parcours scientifique axé sur les mathématiques, la physique, la chimie et les sciences de la vie et de la terre.",cycle:QUALIFIANT,status:"Actif"},
    {id:"SEC-SCMATH",name:"Sciences Mathématiques",code:"SC-MATH",description:"Parcours scientifique mettant l'accent sur les mathématiques et les sciences physiques.",cycle:QUALIFIANT,status:"Actif"},
    {id:"SEC-LSH",name:"Lettres et Sciences Humaines",code:"LSH",description:"Parcours littéraire et humaniste axé sur les langues, la littérature, l'histoire, la géographie et la philosophie.",cycle:QUALIFIANT,status:"Actif"},
    {id:"SEC-SEG",name:"Sciences Économiques et Gestion",code:"SEG",description:"Parcours orienté vers les sciences économiques et la gestion.",cycle:QUALIFIANT,status:"Actif"},
    {id:"SEC-EO",name:"Enseignement Originel",code:"EO",description:"Parcours mettant l'accent sur l'éducation islamique, la langue arabe et les disciplines associées.",cycle:QUALIFIANT,status:"Actif"},
    {id:"SEC-PENDING",name:"Filière en attente de paramétrage",code:"A-CONFIG",description:"Emplacement de démonstration à configurer uniquement lorsqu’une filière est autorisée pour l’établissement.",cycle:QUALIFIANT,status:"Actif"},
  ],
  programs: [
    {id:"PR-TC-SCI",sectorId:"SEC-TC",name:"Tronc Commun Sciences",code:"TC-SCI",description:"Enseignement commun à dominante scientifique.",levelId:"LV-TC",classCount:4,status:"Actif"},
    {id:"PR-TC-LSH",sectorId:"SEC-TC",name:"Tronc Commun Lettres et Sciences Humaines",code:"TC-LSH",description:"Enseignement commun à dominante littéraire et humaine.",levelId:"LV-TC",classCount:3,status:"Actif"},
    {id:"PR-TC-EO",sectorId:"SEC-TC",name:"Tronc Commun Enseignement Originel",code:"TC-EO",description:"Enseignement commun de la filière originelle.",levelId:"LV-TC",classCount:1,status:"Actif"},
    {id:"PR-SE-1",sectorId:"SEC-SCEXP",name:"Sciences Expérimentales — Première Bac",code:"SE-1BAC",description:"Programme de première année du baccalauréat.",levelId:"LV-1BAC",classCount:3,status:"Actif"},
    {id:"PR-SE-2",sectorId:"SEC-SCEXP",name:"Sciences Expérimentales — Deuxième Bac",code:"SE-2BAC",description:"Programme de deuxième année du baccalauréat.",levelId:"LV-2BAC",classCount:2,status:"Actif"},
    {id:"PR-SMA",sectorId:"SEC-SCMATH",name:"Sciences Mathématiques A",code:"SMA",description:"Parcours de sciences mathématiques, option A.",levelId:"LV-2BAC",classCount:2,status:"Actif"},
    {id:"PR-SMB",sectorId:"SEC-SCMATH",name:"Sciences Mathématiques B",code:"SMB",description:"Parcours de sciences mathématiques, option B.",levelId:"LV-2BAC",classCount:1,status:"Inactif"},
    {id:"PR-LSH-L",sectorId:"SEC-LSH",name:"Lettres",code:"LSH-L",description:"Programme à dominante littéraire.",levelId:"LV-2BAC",classCount:2,status:"Actif"},
    {id:"PR-LSH-H",sectorId:"SEC-LSH",name:"Sciences Humaines",code:"LSH-H",description:"Programme à dominante sciences humaines.",levelId:"LV-2BAC",classCount:2,status:"Actif"},
    {id:"PR-SEG-SE",sectorId:"SEC-SEG",name:"Sciences Économiques",code:"SEG-SE",description:"Programme de sciences économiques.",levelId:"LV-2BAC",classCount:2,status:"Actif"},
    {id:"PR-SEG-SGC",sectorId:"SEC-SEG",name:"Sciences de Gestion Comptable",code:"SEG-SGC",description:"Programme de gestion et comptabilité.",levelId:"LV-2BAC",classCount:1,status:"Actif"},
    {id:"PR-EO-1",sectorId:"SEC-EO",name:"Enseignement Originel — Première Bac",code:"EO-1BAC",description:"Programme de première année du baccalauréat.",levelId:"LV-1BAC",classCount:1,status:"Actif"},
    {id:"PR-EO-2",sectorId:"SEC-EO",name:"Enseignement Originel — Deuxième Bac",code:"EO-2BAC",description:"Programme de deuxième année du baccalauréat.",levelId:"LV-2BAC",classCount:1,status:"Actif"},
  ],
};

export class SectorProgramError extends Error {
  constructor(message: string) { super(message); this.name = "SectorProgramError"; }
}
function cloneDemo(): SectorProgramData { return JSON.parse(JSON.stringify(demo)) as SectorProgramData; }
function read(): SectorProgramData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) { const initial=cloneDemo(); window.localStorage.setItem(STORAGE_KEY,JSON.stringify(initial)); return initial; }
    const parsed=JSON.parse(raw) as SectorProgramData;
    if (!parsed || !Array.isArray(parsed.sectors) || !Array.isArray(parsed.programs) || !Array.isArray(parsed.levels)) throw new Error("Données invalides");
    return parsed;
  } catch { throw new SectorProgramError("Impossible de charger les filières et programmes depuis ce navigateur."); }
}
function write(data: SectorProgramData): SectorProgramData {
  try { window.localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); return data; }
  catch { throw new SectorProgramError("L'enregistrement a échoué. Vérifiez l'espace disponible puis réessayez."); }
}
function uniqueCode(code: string, values: {id:string;code:string}[], excludedId?: string) {
  const normalized=code.trim().toLocaleUpperCase("fr-FR");
  if(!normalized) throw new SectorProgramError("Le code est obligatoire.");
  if(values.some(item=>item.id!==excludedId&&item.code.toLocaleUpperCase("fr-FR")===normalized)) throw new SectorProgramError("Ce code est déjà utilisé dans cet établissement.");
}
function validateSector(input: SectorInput, data: SectorProgramData, excludedId?: string) {
  if(!input.name.trim()) throw new SectorProgramError("Le nom de la filière est obligatoire.");
  if(!input.description.trim()) throw new SectorProgramError("La description est obligatoire.");
  if(input.cycle!==QUALIFIANT) throw new SectorProgramError("Les filières spécialisées sont réservées au secondaire qualifiant. Les cycles primaire et collégial suivent leurs niveaux standards.");
  uniqueCode(input.code,data.sectors,excludedId);
}
function validateProgram(input: ProgramInput, data: SectorProgramData, excludedId?: string) {
  if(!input.name.trim()) throw new SectorProgramError("Le nom du programme est obligatoire.");
  if(!input.description.trim()) throw new SectorProgramError("La description est obligatoire.");
  uniqueCode(input.code,data.programs,excludedId);
  const sector=data.sectors.find(item=>item.id===input.sectorId);
  if(!sector) throw new SectorProgramError("Veuillez sélectionner une filière valide.");
  const level=data.levels.find(item=>item.id===input.levelId);
  if(!level||level.cycle!==sector.cycle) throw new SectorProgramError("Le niveau sélectionné n'est pas compatible avec le cycle éducatif de cette filière.");
}
export const sectorsProgramsRepository = {
  async list(): Promise<SectorProgramData> { return read(); },
  async createSector(input: SectorInput): Promise<SectorProgramData> {
    const data=read(); validateSector(input,data);
    return write({...data,sectors:[...data.sectors,{id:`SEC-${Date.now()}`,...input,name:input.name.trim(),code:input.code.trim().toUpperCase(),description:input.description.trim()}]});
  },
  async updateSector(id: string,input: SectorInput): Promise<SectorProgramData> {
    const data=read(); const old=data.sectors.find(item=>item.id===id);
    if(!old) throw new SectorProgramError("Cette filière n'existe plus. Actualisez la page.");
    validateSector(input,data,id);
    return write({...data,sectors:data.sectors.map(item=>item.id===id?{...item,...input,name:input.name.trim(),code:input.code.trim().toUpperCase(),description:input.description.trim()}:item)});
  },
  async setSectorStatus(id:string,status:EntityStatus):Promise<SectorProgramData> {
    const data=read(); const sector=data.sectors.find(item=>item.id===id);
    if(!sector) throw new SectorProgramError("Cette filière n'existe plus.");
    if(status==="Inactif"&&data.programs.some(item=>item.sectorId===id&&item.status==="Actif")) throw new SectorProgramError("Cette filière contient des programmes actifs. Désactivez d'abord ses programmes pour préserver les associations existantes.");
    return write({...data,sectors:data.sectors.map(item=>item.id===id?{...item,status}:item)});
  },
  async createProgram(input:ProgramInput):Promise<SectorProgramData> {
    const data=read(); validateProgram(input,data);
    if(data.sectors.find(item=>item.id===input.sectorId)?.status!=="Actif") throw new SectorProgramError("Impossible d'ajouter un programme à une filière inactive.");
    return write({...data,programs:[...data.programs,{id:`PR-${Date.now()}`,...input,name:input.name.trim(),code:input.code.trim().toUpperCase(),description:input.description.trim(),classCount:0}]});
  },
  async updateProgram(id:string,input:ProgramInput):Promise<SectorProgramData> {
    const data=read(); const old=data.programs.find(item=>item.id===id);
    if(!old) throw new SectorProgramError("Ce programme n'existe plus.");
    validateProgram(input,data,id);
    if(data.sectors.find(item=>item.id===input.sectorId)?.status!=="Actif") throw new SectorProgramError("Le programme doit appartenir à une filière active.");
    return write({...data,programs:data.programs.map(item=>item.id===id?{...item,...input,name:input.name.trim(),code:input.code.trim().toUpperCase(),description:input.description.trim()}:item)});
  },
  async setProgramStatus(id:string,status:EntityStatus):Promise<SectorProgramData> {
    const data=read(); const program=data.programs.find(item=>item.id===id);
    if(!program) throw new SectorProgramError("Ce programme n'existe plus.");
    if(status==="Actif"&&data.sectors.find(item=>item.id===program.sectorId)?.status!=="Actif") throw new SectorProgramError("Impossible d’activer un programme dans une filière inactive. Réactivez d’abord la filière.");
    if(status==="Inactif"&&program.classCount>0) throw new SectorProgramError("Ce programme est associé à des classes. Les associations doivent être réaffectées avant sa désactivation.");
    return write({...data,programs:data.programs.map(item=>item.id===id?{...item,status}:item)});
  },
};
