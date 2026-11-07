export type AnnouncementStatus = "Brouillon" | "Programmée" | "Publiée" | "Archivée";
export type AnnouncementCategory = "Administration" | "Vie scolaire" | "Pédagogie" | "Examens" | "Événements" | "Urgent";
export type AudienceType = "Toute l'école" | "Parents" | "Élèves" | "Enseignants" | "Employés" | "Classes / groupes" | "Départements";
export interface AnnouncementAudience { type: AudienceType; ids: string[]; labels: string[] }
export interface AnnouncementHistory { action: string; actor: string; at: string; detail?: string }
export interface AnnouncementRecord {
  id: string; title: string; category: AnnouncementCategory; summary: string; content: string;
  audience: AnnouncementAudience[]; author: string; createdAt: string; updatedAt: string;
  publishAt: string | null; publishedAt: string | null; expiresAt: string | null;
  status: AnnouncementStatus; history: AnnouncementHistory[];
}
export interface AnnouncementInput {
  title: string; category: AnnouncementCategory; summary: string; content: string;
  audience: AnnouncementAudience[]; publishAt: string | null; expiresAt: string | null;
}
const KEY = "school-platform-announcements-v1";
const demo: AnnouncementRecord[] = [
 {id:"ANN-2026-014",title:"Organisation des vacances scolaires",category:"Administration",summary:"Calendrier et dates de fermeture de l'établissement.",content:"Chers parents et membres de la communauté éducative,\n\nVeuillez consulter le calendrier des vacances scolaires communiqué par l'administration. L'accueil reprendra aux horaires habituels à la date indiquée dans le calendrier officiel.",audience:[{type:"Toute l'école",ids:[],labels:["Toute l'école"]}],author:"Direction",createdAt:"2026-10-20T09:15:00.000Z",updatedAt:"2026-10-20T09:15:00.000Z",publishAt:"2026-10-20T10:00:00.000Z",publishedAt:"2026-10-20T10:00:00.000Z",expiresAt:"2026-11-15T23:59:00.000Z",status:"Publiée",history:[{action:"Annonce créée",actor:"Direction",at:"2026-10-20T09:15:00.000Z"},{action:"Annonce publiée",actor:"Direction",at:"2026-10-20T10:00:00.000Z"}]},
 {id:"ANN-2026-013",title:"Rappel des horaires de sortie",category:"Vie scolaire",summary:"Rappel des horaires de sortie des élèves.",content:"Nous rappelons aux familles que les élèves doivent être récupérés aux horaires communiqués par leur niveau. Merci de respecter les consignes de circulation aux abords de l'établissement.",audience:[{type:"Parents",ids:[],labels:["Parents"]}],author:"Service de vie scolaire",createdAt:"2026-10-28T08:30:00.000Z",updatedAt:"2026-10-28T08:30:00.000Z",publishAt:"2026-10-28T09:00:00.000Z",publishedAt:"2026-10-28T09:00:00.000Z",expiresAt:null,status:"Publiée",history:[{action:"Annonce créée",actor:"Service de vie scolaire",at:"2026-10-28T08:30:00.000Z"},{action:"Annonce publiée",actor:"Service de vie scolaire",at:"2026-10-28T09:00:00.000Z"}]},
 {id:"ANN-2026-015",title:"Réunion d'information pédagogique",category:"Pédagogie",summary:"Rencontre d'information destinée aux familles.",content:"Une réunion d'information pédagogique est prévue. Les modalités pratiques seront communiquées par l'équipe pédagogique.",audience:[{type:"Classes / groupes",ids:["CLS-DEMO-1"],labels:["Tronc Commun Sciences - 1"]}],author:"Responsable pédagogique",createdAt:"2026-11-03T11:00:00.000Z",updatedAt:"2026-11-03T11:00:00.000Z",publishAt:"2026-11-10T08:00:00.000Z",publishedAt:null,expiresAt:"2026-11-20T18:00:00.000Z",status:"Programmée",history:[{action:"Annonce créée",actor:"Responsable pédagogique",at:"2026-11-03T11:00:00.000Z"},{action:"Publication programmée",actor:"Responsable pédagogique",at:"2026-11-03T11:00:00.000Z",detail:"Publication prévue le 10/11/2026 à 08:00"}]},
 {id:"ANN-2026-016",title:"Préparation des examens",category:"Examens",summary:"Informations à compléter avant diffusion.",content:"",audience:[],author:"Service pédagogique",createdAt:"2026-11-05T14:00:00.000Z",updatedAt:"2026-11-05T14:00:00.000Z",publishAt:null,publishedAt:null,expiresAt:null,status:"Brouillon",history:[{action:"Brouillon créé",actor:"Service pédagogique",at:"2026-11-05T14:00:00.000Z"}]},
 {id:"ANN-2026-009",title:"Journée portes ouvertes",category:"Événements",summary:"Retour sur la journée portes ouvertes.",content:"La journée portes ouvertes est désormais terminée. Merci aux équipes et aux familles pour leur participation.",audience:[{type:"Toute l'école",ids:[],labels:["Toute l'école"]}],author:"Direction",createdAt:"2026-09-12T09:00:00.000Z",updatedAt:"2026-10-01T12:00:00.000Z",publishAt:"2026-09-15T08:00:00.000Z",publishedAt:"2026-09-15T08:00:00.000Z",expiresAt:null,status:"Archivée",history:[{action:"Annonce créée",actor:"Direction",at:"2026-09-12T09:00:00.000Z"},{action:"Annonce publiée",actor:"Direction",at:"2026-09-15T08:00:00.000Z"},{action:"Annonce archivée",actor:"Direction",at:"2026-10-01T12:00:00.000Z"}]}
];
export class AnnouncementsError extends Error { constructor(message:string){super(message);this.name="AnnouncementsError";} }
function read():AnnouncementRecord[]{
 try { const raw=localStorage.getItem(KEY); if(!raw){localStorage.setItem(KEY,JSON.stringify(demo));return [...demo];}
 const parsed:unknown=JSON.parse(raw); if(!Array.isArray(parsed))throw new Error(); return parsed as AnnouncementRecord[];
 } catch { throw new AnnouncementsError("Impossible de charger les annonces enregistrées dans ce navigateur."); }
}
function write(rows:AnnouncementRecord[]):AnnouncementRecord[]{
 try{localStorage.setItem(KEY,JSON.stringify(rows));return rows;}catch{throw new AnnouncementsError("Enregistrement impossible. Vérifiez l'espace de stockage du navigateur.");}
}
function validate(input:AnnouncementInput,rows:AnnouncementRecord[],id?:string){
 if(!input.title.trim())throw new AnnouncementsError("Le titre de l'annonce est obligatoire.");
 if(!input.content.trim())throw new AnnouncementsError("Le contenu de l'annonce est obligatoire.");
 if(!input.audience.length)throw new AnnouncementsError("Sélectionnez au moins un public cible.");
 if(input.audience.some(a=>a.type!=="Toute l'école"&&!a.labels.length))throw new AnnouncementsError("La sélection du public cible est incomplète.");
 if(input.audience.some(a=>a.type==="Toute l'école")&&input.audience.length>1)throw new AnnouncementsError("Le public « Toute l'école » ne peut pas être combiné à un autre ciblage.");
 if(input.publishAt&&Number.isNaN(new Date(input.publishAt).getTime()))throw new AnnouncementsError("La date de publication est invalide.");
 if(input.expiresAt&&(!input.publishAt||new Date(input.expiresAt)<=new Date(input.publishAt)))throw new AnnouncementsError("La date d'expiration doit être postérieure à la publication.");
 if(rows.some(r=>r.id!==id&&r.title.trim().toLocaleLowerCase("fr-FR")===input.title.trim().toLocaleLowerCase("fr-FR")&&r.status!=="Archivée"))throw new AnnouncementsError("Une annonce active porte déjà ce titre.");
}
export const announcementsRepository={
 async list(){return read().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));},
 async save(input:AnnouncementInput,author:string,id?:string){
  const rows=read();validate(input,rows,id);const now=new Date().toISOString();
  if(id){const old=rows.find(r=>r.id===id);if(!old)throw new AnnouncementsError("Cette annonce n'existe plus.");
   if(old.status==="Publiée"||old.status==="Archivée")throw new AnnouncementsError("Une annonce publiée ou archivée ne peut pas être modifiée dans cette démonstration.");
   const status:AnnouncementStatus=input.publishAt&&new Date(input.publishAt)>new Date()? "Programmée":"Brouillon";
   const updated={...old,...input,title:input.title.trim(),summary:input.summary.trim(),content:input.content.trim(),status,updatedAt:now,history:[...old.history,{action:"Contenu modifié",actor:author,at:now}]};
   return write(rows.map(r=>r.id===id?updated:r));
  }
  const status:AnnouncementStatus=input.publishAt&&new Date(input.publishAt)>new Date()?"Programmée":"Brouillon";
  const row:AnnouncementRecord={...input,id:"ANN-"+Date.now(),title:input.title.trim(),summary:input.summary.trim(),content:input.content.trim(),author,createdAt:now,updatedAt:now,publishedAt:null,status,history:[{action:"Annonce créée",actor:author,at:now},...(status==="Programmée"?[{action:"Publication programmée",actor:author,at:now,detail:input.publishAt??undefined}]:[])]};
  return write([row,...rows);
 },
 async publish(id:string,actor:string){
  const rows=read();const row=rows.find(r=>r.id===id);if(!row)throw new AnnouncementsError("Cette annonce n'existe plus.");
  if(row.status!=="Brouillon")throw new AnnouncementsError("Seul un brouillon peut être publié depuis cette page.");
  if(!row.audience.length||!row.content.trim())throw new AnnouncementsError("Complétez le contenu et le public cible avant publication.");
  const now=new Date().toISOString();return write(rows.map(r=>r.id===id?{...r,status:"Publiée",publishAt:now,publishedAt:now,updatedAt:now,history:[...r.history,{action:"Annonce publiée",actor,at:now}]}:r));
 },
 async cancelSchedule(id:string,actor:string){
  const rows=read();const row=rows.find(r=>r.id===id);if(!row||row.status!=="Programmée")throw new AnnouncementsError("Cette programmation n'est plus disponible.");
  const now=new Date().toISOString();return write(rows.map(r=>r.id===id?{...r,status:"Brouillon",publishAt:null,updatedAt:now,history:[...r.history,{action:"Programmation annulée",actor,at:now}]}:r));
 },
 async archive(id:string,actor:string){
  const rows=read();const row=rows.find(r=>r.id===id);if(!row||row.status!=="Publiée")throw new AnnouncementsError("Seule une annonce publiée peut être archivée.");
  const now=new Date().toISOString();return write(rows.map(r=>r.id===id?{...r,status:"Archivée",updatedAt:now,history:[...r.history,{action:"Annonce archivée",actor,at:now}]}:r));
 }
};
