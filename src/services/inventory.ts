import { employeesRepository } from "./employees";
import { departmentsRepository } from "./departments";

export type InventoryType = "Consommable" | "Équipement";
export type InventoryStatus = "Actif" | "Inactif";
export type EquipmentCondition = "Neuf" | "Bon état" | "À réparer" | "Hors service";
export type MovementType = "Entrée" | "Sortie" | "Affectation" | "Retour";
export interface InventoryItem {
 id:string; reference:string; name:string; category:string; type:InventoryType; description:string;
 unit:string; quantity:number; minimum:number|null; location:string; condition:EquipmentCondition|null;
 status:InventoryStatus; createdAt:string; updatedAt:string;
}
export interface StockMovement {
 id:string; date:string; itemId:string; type:MovementType; quantity:number; location:string;
 responsible:string; reason:string; notes:string;
}
export interface EquipmentAssignment {
 id:string; itemId:string; quantity:number; assigneeType:"Employé"|"Département"; assigneeId:string;
 assigneeName:string; location:string; assignedAt:string; returnedAt:string|null; condition:EquipmentCondition;
 notes:string;
}
export interface InventoryData {
 items:InventoryItem[]; movements:StockMovement[]; assignments:EquipmentAssignment[];
 employees:Awaited<ReturnType<typeof employeesRepository.list>>["employees"];
 departments:Awaited<ReturnType<typeof departmentsRepository.list>>["departments"];
}
export type InventoryItemInput=Omit<InventoryItem,"id"|"createdAt"|"updatedAt"|"quantity"> & {initialQuantity:number};
const KEY="school-platform-inventory-demo-v1";
const categories=["Fournitures scolaires","Informatique","Mobilier","Matériel pédagogique","Laboratoire","Sport","Entretien","Autres"];
const seedItems:InventoryItem[]=[
{id:"INV-001",reference:"FOU-PAP-001",name:"Papier A4 — ramette 500 feuilles",category:"Fournitures scolaires",type:"Consommable",description:"Papier blanc pour impression et photocopie.",unit:"Ramette",quantity:86,minimum:30,location:"Magasin principal",condition:null,status:"Actif",createdAt:"2026-09-01",updatedAt:"2026-11-05"},
{id:"INV-002",reference:"FOU-STY-002",name:"Stylos bleus",category:"Fournitures scolaires",type:"Consommable",description:"Stylos à bille bleus.",unit:"Boîte",quantity:12,minimum:15,location:"Magasin principal",condition:null,status:"Actif",createdAt:"2026-09-01",updatedAt:"2026-11-04"},
{id:"INV-003",reference:"INF-CRT-003",name:"Cartouche d'encre noire",category:"Informatique",type:"Consommable",description:"Consommable d'impression compatible.",unit:"Unité",quantity:0,minimum:4,location:"Salle informatique",condition:null,status:"Actif",createdAt:"2026-09-02",updatedAt:"2026-11-02"},
{id:"INV-004",reference:"INF-ORD-004",name:"Ordinateur portable",category:"Informatique",type:"Équipement",description:"Ordinateur portable pour usage pédagogique.",unit:"Unité",quantity:8,minimum:null,location:"Réserve informatique",condition:"Bon état",status:"Actif",createdAt:"2026-09-03",updatedAt:"2026-11-03"},
{id:"INV-005",reference:"PED-VID-005",name:"Vidéoprojecteur",category:"Matériel pédagogique",type:"Équipement",description:"Vidéoprojecteur pour salles de cours.",unit:"Unité",quantity:3,minimum:null,location:"Magasin principal",condition:"Bon état",status:"Actif",createdAt:"2026-09-04",updatedAt:"2026-11-01"},
{id:"INV-006",reference:"MOB-TAB-006",name:"Table scolaire",category:"Mobilier",type:"Équipement",description:"Table individuelle pour salle de classe.",unit:"Unité",quantity:42,minimum:null,location:"Magasin mobilier",condition:"Bon état",status:"Actif",createdAt:"2026-09-04",updatedAt:"2026-10-30"},
{id:"INV-007",reference:"ENT-PRD-007",name:"Détergent multi-usages",category:"Entretien",type:"Consommable",description:"Produit d'entretien des locaux.",unit:"Bidon",quantity:18,minimum:10,location:"Local entretien",condition:null,status:"Actif",createdAt:"2026-09-05",updatedAt:"2026-11-06"}
];
const seedMovements:StockMovement[]=[
{id:"MVT-001",date:"2026-11-06T09:10:00",itemId:"INV-007",type:"Entrée",quantity:10,location:"Local entretien",responsible:"Meryem Alaoui",reason:"Réapprovisionnement initial",notes:"Donnée fictive de démonstration."},
{id:"MVT-002",date:"2026-11-05T11:25:00",itemId:"INV-001",type:"Sortie",quantity:8,location:"Magasin principal",responsible:"Meryem Alaoui",reason:"Distribution aux enseignants",notes:"Donnée fictive de démonstration."},
{id:"MVT-003",date:"2026-11-04T14:00:00",itemId:"INV-002",type:"Sortie",quantity:6,location:"Magasin principal",responsible:"Youssef Amrani",reason:"Fournitures des classes",notes:"Donnée fictive de démonstration."},
{id:"MVT-004",date:"2026-11-03T10:30:00",itemId:"INV-004",type:"Affectation",quantity:2,location:"Salle informatique",responsible:"Mehdi Aït Lahcen",reason:"Mise à disposition",notes:"Affectation de démonstration."}
];
const seedAssignments:EquipmentAssignment[]=[
{id:"AFF-001",itemId:"INV-004",quantity:2,assigneeType:"Département",assigneeId:"DEP-CS",assigneeName:"Département Informatique",location:"Salle informatique",assignedAt:"2026-11-03",returnedAt:null,condition:"Bon état",notes:"Affectation de démonstration."},
{id:"AFF-002",itemId:"INV-005",quantity:1,assigneeType:"Employé",assigneeId:"EMP-N-003",assigneeName:"Mehdi Aït Lahcen",location:"Salle polyvalente",assignedAt:"2026-10-20",returnedAt:null,condition:"Bon état",notes:"Affectation de démonstration."}
];
type Stored={items:InventoryItem[];movements:StockMovement[];assignments:EquipmentAssignment[]};
function read():Stored{try{const raw=localStorage.getItem(KEY);if(!raw){const data={items:seedItems,movements:seedMovements,assignments:seedAssignments};localStorage.setItem(KEY,JSON.stringify(data));return structuredClone(data);}const data=JSON.parse(raw) as Stored;if(!Array.isArray(data.items)||!Array.isArray(data.movements)||!Array.isArray(data.assignments))throw new Error();return data;}catch{throw new Error("Impossible de charger l'inventaire local de démonstration.");}}
function write(data:Stored){try{localStorage.setItem(KEY,JSON.stringify(data));}catch{throw new Error("Enregistrement local impossible. Vérifiez l'espace disponible dans le navigateur.");}return data;}
export const inventoryCategories=categories;
export const inventoryRepository={
 async list():Promise<InventoryData>{const [employees,departments]=await Promise.all([employeesRepository.list(),departmentsRepository.list()]);const d=read();return {...d,employees:employees.employees,departments:departments.departments};},
 async saveItem(input:InventoryItemInput,id?:string){const d=read();const ref=input.reference.trim().toUpperCase();if(!input.name.trim()||!ref)throw new Error("La désignation et la référence sont obligatoires.");if(d.items.some(x=>x.id!==id&&x.reference.toUpperCase()===ref))throw new Error("Cette référence interne est déjà utilisée.");if(!Number.isFinite(input.initialQuantity)||input.initialQuantity<0)throw new Error("La quantité initiale doit être positive ou nulle.");const old=d.items.find(x=>x.id===id);if(old&&old.type!==input.type&&(d.movements.some(m=>m.itemId===id)||d.assignments.some(a=>a.itemId===id)))throw new Error("Le type ne peut pas être modifié après des mouvements ou affectations.");if(old&&input.initialQuantity!==old.quantity)throw new Error("La quantité disponible ne se modifie pas depuis la fiche article. Enregistrez une entrée ou une sortie de stock.");const item:InventoryItem={...input,id:old?.id??"INV-"+Date.now(),quantity:old?.quantity??input.initialQuantity,reference:ref,name:input.name.trim(),createdAt:old?.createdAt??new Date().toISOString(),updatedAt:new Date().toISOString()};const next={...d,items:old?d.items.map(x=>x.id===id?item:x):[item,...d.items]};if(!old&&input.initialQuantity>0)next.movements=[{id:"MVT-"+Date.now(),date:new Date().toISOString(),itemId:item.id,type:"Entrée",quantity:input.initialQuantity,location:item.location,responsible:"Utilisateur connecté",reason:"Stock initial",notes:"Mouvement d'ouverture de démonstration."},...d.movements];write(next);return this.list();},
 async movement(input:{itemId:string;type:"Entrée"|"Sortie";quantity:number;location:string;reason:string;notes:string;responsible:string;date:string}){const d=read();const item=d.items.find(x=>x.id===input.itemId&&x.status==="Actif");if(!item)throw new Error("Article introuvable ou inactif.");if(!Number.isInteger(input.quantity)||input.quantity<=0)throw new Error("La quantité doit être un entier strictement positif.");if(input.type==="Sortie"&&input.quantity>item.quantity)throw new Error("Stock insuffisant : la quantité disponible ne permet pas cette sortie.");const updated={...item,quantity:item.quantity+(input.type==="Entrée"?input.quantity:-input.quantity),updatedAt:new Date().toISOString()};write({...d,items:d.items.map(x=>x.id===item.id?updated:x),movements:[{id:"MVT-"+Date.now(),...input},...d.movements]});return this.list();},
 async assign(input:{itemId:string;quantity:number;assigneeType:"Employé"|"Département";assigneeId:string;location:string;condition:EquipmentCondition;notes:string}){const d=read();const item=d.items.find(x=>x.id===input.itemId&&x.type==="Équipement"&&x.status==="Actif");if(!item)throw new Error("Équipement introuvable ou indisponible.");if(!Number.isInteger(input.quantity)||input.quantity<=0||input.quantity>item.quantity)throw new Error("La quantité demandée dépasse le stock disponible.");const [employees,departments]=await Promise.all([employeesRepository.list(),departmentsRepository.list()]);const assignee=input.assigneeType==="Employé"?employees.employees.find(x=>x.id===input.assigneeId&&x.employmentStatus==="Actif"):departments.departments.find(x=>x.id===input.assigneeId&&x.status==="Actif");if(!assignee)throw new Error("Le bénéficiaire sélectionné n'est plus disponible.");const name=input.assigneeType==="Employé"?(assignee as typeof employees.employees[number]).fullName:(assignee as typeof departments.departments[number]).name;const now=new Date().toISOString();const updated={...item,quantity:item.quantity-input.quantity,updatedAt:now};write({...d,items:d.items.map(x=>x.id===item.id?updated:x),assignments:[{id:"AFF-"+Date.now(),...input,assigneeName:name,assignedAt:now,returnedAt:null},...d.assignments],movements:[{id:"MVT-"+Date.now(),date:now,itemId:item.id,type:"Affectation",quantity:input.quantity,location:input.location,responsible:"Utilisateur connecté",reason:"Affectation d'équipement",notes:input.notes},...d.movements]});return this.list();},
 async returnAssignment(id:string,condition:EquipmentCondition,location:string,notes:string){const d=read();const a=d.assignments.find(x=>x.id===id&&!x.returnedAt);if(!a)throw new Error("Cette affectation est déjà clôturée ou introuvable.");const item=d.items.find(x=>x.id===a.itemId);if(!item)throw new Error("Article introuvable.");const now=new Date().toISOString();write({...d,items:d.items.map(x=>x.id===item.id?{...x,quantity:x.quantity+a.quantity,location,condition,updatedAt:now}:x),assignments:d.assignments.map(x=>x.id===id?{...x,returnedAt:now,condition,location,notes:notes||x.notes}:x),movements:[{id:"MVT-"+Date.now(),date:now,itemId:item.id,type:"Retour",quantity:a.quantity,location,responsible:"Utilisateur connecté",reason:"Retour d'affectation",notes},...d.movements]});return this.list();}
};
