import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, CalendarDays, Check, ChevronRight, Clock3, Globe2,
  Info, Languages, MapPin, Monitor, Save, Settings2, ShieldCheck,
  SlidersHorizontal, X
} from "lucide-react";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import { schoolBranding } from "../../config/school";
import { academicYearRepository, type AcademicYear } from "../../services/academic-years";
import { readSchoolProfile, type SchoolProfile } from "../../services/school-profile";
import {
  defaultSchoolSettingsDemo, readSchoolSettingsDemo, saveSchoolSettingsDemo,
  type SchoolSettingsDemo
} from "../../services/school-settings-demo";
import "./SchoolSettingsPage.css";

interface Props { user: AuthenticatedSidebarUser }
type Section = "general"|"region"|"calendar"|"display"|"contacts"|"institution";
const sections:{id:Section;label:string;description:string;icon:typeof Settings2}[]=[
 {id:"general",label:"Général",description:"Préférences principales",icon:Settings2},
 {id:"region",label:"Langue et région",description:"Formats et fuseau horaire",icon:Globe2},
 {id:"calendar",label:"Calendrier et jours ouvrables",description:"Organisation hebdomadaire",icon:CalendarDays},
 {id:"display",label:"Préférences d’affichage",description:"Options disponibles",icon:Monitor},
 {id:"contacts",label:"Coordonnées opérationnelles",description:"Références du profil",icon:MapPin},
 {id:"institution",label:"Options institutionnelles",description:"Fonctionnalités prises en charge",icon:SlidersHorizontal}
];
const dayNames=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const timeZones=["Africa/Casablanca","Europe/Paris","Europe/London","Europe/Berlin","Asia/Dubai","UTC"];
const countries=["Maroc","France","Belgique","Allemagne","Espagne","Royaume-Uni","Émirats arabes unis"];
const dateLabel=(value:string)=>new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
const same=(a:SchoolSettingsDemo,b:SchoolSettingsDemo)=>JSON.stringify({...a,workingDays:[...a.workingDays].sort()})===JSON.stringify({...b,workingDays:[...b.workingDays].sort()});
function Field({label,help,children}:{label:string;help?:string;children:React.ReactNode}){
 return <label className="ss-field"><span>{label}</span>{children}{help&&<small>{help}</small>}</label>;
}
function ReadOnly({value,help}:{value:string;help?:string}){
 return <div className="ss-readonly"><strong>{value||"Non renseigné"}</strong>{help&&<small>{help}</small>}</div>;
}
export function SchoolSettingsPage({user}:Props){
 const allowed=user.role==="director"&&user.permissions.includes("settings.school.manage");
 const [years,setYears]=useState<AcademicYear[]>([]);
 const [profile,setProfile]=useState<SchoolProfile|null>(null);
 const [saved,setSaved]=useState<SchoolSettingsDemo|null>(null);
 const [draft,setDraft]=useState<SchoolSettingsDemo|null>(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [section,setSection]=useState<Section>("general");
 const [showCancel,setShowCancel]=useState(false);
 const [validation,setValidation]=useState<string[]>([]);
 const dirty=!!saved&&!!draft&&!same(saved,draft);
 useEffect(()=>{
  let active=true;
  async function load(){
   if(!allowed){setLoading(false);return;}
   setLoading(true);setError("");
   try{
    const [ys]=await Promise.all([academicYearRepository.list()]);
    const p=readSchoolProfile();
    const activeYear=ys.find(y=>y.status==="Active");
    const config=readSchoolSettingsDemo(activeYear?.id??"");
    if(active){setYears(ys);setProfile(p);setSaved(config);setDraft({...config,workingDays:[...config.workingDays]});}
   }catch(e){if(active)setError(e instanceof Error?e.message:"Impossible de charger les paramètres de l’établissement.");}
   finally{if(active)setLoading(false);}
  }
  void load();
  return()=>{active=false;};
 },[allowed]);
 const activeYear=years.find(y=>y.status==="Active");
 const selectedYear=years.find(y=>y.id===draft?.defaultAcademicYearId);
 const preview=useMemo(()=>{
  if(!draft)return null;
  const now=new Date();
  const dateParts=draft.dateFormat==="DD/MM/YYYY"?{day:"2-digit" as const,month:"2-digit" as const,year:"numeric" as const}:{year:"numeric" as const,month:"2-digit" as const,day:"2-digit" as const};
  const date=new Intl.DateTimeFormat(draft.numberFormat,{...dateParts,timeZone:draft.timeZone}).format(now);
  const time=new Intl.DateTimeFormat("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:draft.timeFormat==="12h",timeZone:draft.timeZone}).format(now);
  const number=new Intl.NumberFormat(draft.numberFormat,{minimumFractionDigits:2,maximumFractionDigits:2}).format(12345.67);
  const currency=new Intl.NumberFormat("fr-FR",{style:"currency",currency:"MAD",maximumFractionDigits:2}).format(1234.5);
  const localTime=new Intl.DateTimeFormat("fr-FR",{hour:"2-digit",minute:"2-digit",timeZone:draft.timeZone}).format(now);
  return {date,time,number,currency,localTime};
 },[draft]);
 function update<K extends keyof SchoolSettingsDemo>(key:K,value:SchoolSettingsDemo[K]){
  setDraft(current=>current?({...current,[key]:value}):current);setNotice("");setValidation([]);setError("");
 }
 function toggleDay(day:number){
  if(!draft)return;
  const next=draft.workingDays.includes(day)?draft.workingDays.filter(v=>v!==day):[...draft.workingDays,day];
  update("workingDays",next);
 }
 function cancel(){
  if(!saved)return;
  if(dirty){setShowCancel(true);return;}
  setDraft({...saved,workingDays:[...saved.workingDays]});
 }
 function discard(){if(saved)setDraft({...saved,workingDays:[...saved.workingDays]});setShowCancel(false);setValidation([]);setError("");setNotice("Les modifications non enregistrées ont été annulées.");}
 function save(){
  if(!draft||!saved||!dirty||!allowed)return;
  const validIds=years.map(y=>y.id);
  const errors:string[]=[];
  if(draft.defaultAcademicYearId&&!validIds.includes(draft.defaultAcademicYearId))errors.push("L’année scolaire par défaut sélectionnée n’existe plus.");
  if(draft.workingDays.length===0)errors.push("Sélectionnez au moins un jour ouvrable.");
  if(Boolean(draft.openingTime)!==Boolean(draft.closingTime))errors.push("Renseignez les deux horaires ou laissez-les tous les deux vides.");
  if(draft.openingTime&&draft.closingTime&&draft.closingTime<=draft.openingTime)errors.push("L’heure de fermeture doit être postérieure à l’heure d’ouverture.");
  if(errors.length){setValidation(errors);setSection(errors.some(e=>e.includes("année"))?"general":"calendar");return;}
  const impacts:string[]=[];
  if(draft.defaultAcademicYearId!==saved.defaultAcademicYearId)impacts.push("L’année scolaire proposée par défaut dans ce module de paramètres sera modifiée. Les statuts des années scolaires et les inscriptions existantes ne changent pas.");
  if(draft.timeZone!==saved.timeZone||draft.dateFormat!==saved.dateFormat||draft.timeFormat!==saved.timeFormat||draft.numberFormat!==saved.numberFormat)impacts.push("Les aperçus régionaux de cette page utiliseront les nouveaux formats. Les horodatages et montants historiques ne seront pas réécrits ni convertis.");
  if(draft.workingDays.join(",")!==saved.workingDays.join(",")||draft.openingTime!==saved.openingTime||draft.closingTime!==saved.closingTime)impacts.push("Le calendrier hebdomadaire enregistré ici est une préférence de démonstration. Il ne modifie aucun emploi du temps, cours ou jour de fermeture.");
  if(impacts.length&&!window.confirm("Confirmer les changements ?\n\n"+impacts.map((v,i)=>(i+1)+". "+v).join("\n\n")))return;
  setSaving(true);setError("");setNotice("");
  try{
   const next=saveSchoolSettingsDemo(draft,validIds,user.displayName);
   setSaved(next);setDraft({...next,workingDays:[...next.workingDays]});setNotice("Préférences de démonstration enregistrées dans ce navigateur. Elles ne sont pas synchronisées avec une base de données serveur.");setValidation([]);
  }catch(e){setError(e instanceof Error?e.message:"Erreur lors de l’enregistrement.");}
  finally{setSaving(false);}
 }
 if(!allowed)return <main className="ss-page"><div className="ss-denied"><ShieldCheck size={27}/><h1>Accès non autorisé</h1><p>Votre compte ne dispose pas de l’autorisation nécessaire pour gérer les paramètres généraux de l’établissement.</p></div></main>;
 if(loading)return <main className="ss-page"><div className="ss-loading"><i/><i/><i/></div><p className="ss-muted">Chargement des paramètres de l’établissement…</p></main>;
 if(!draft||!saved||!profile)return <main className="ss-page"><div className="ss-error"><AlertCircle size={17}/><span>{error||"Les paramètres ne sont pas disponibles."}</span><button onClick={()=>window.location.reload()}>Réessayer</button></div></main>;
 const schoolName=profile.name||schoolBranding.name;
 const updatedAt=saved.updatedAt?dateLabel(saved.updatedAt):"Aucun enregistrement local";
 return <main className="ss-page">
  <div className="ss-breadcrumb">Paramètres <ChevronRight size={13}/><strong>Paramètres de l’établissement</strong></div>
  <header className="ss-header"><div><span className="ss-eyebrow">CONFIGURATION · PRÉFÉRENCES GÉNÉRALES</span><h1>Paramètres de l’établissement</h1><p>Configurez les préférences générales et les règles de fonctionnement de votre établissement.</p><div className="ss-school-name">{schoolName}</div></div><div className="ss-header-actions"><span className={"ss-save-state "+(saving?"busy":dirty?"dirty":"saved")}>{saving?"Enregistrement en cours":dirty?"Modifications non enregistrées":"Modifications enregistrées"}</span><button className="ss-btn secondary" onClick={cancel} disabled={!dirty||saving}>Annuler</button><button className="ss-btn primary" onClick={save} disabled={!dirty||saving}><Save size={14}/>{saving?"Enregistrement…":"Enregistrer les modifications"}</button></div></header>
  <div className="ss-demo-banner"><Info size={17}/><div><strong>Mode démonstration — Préférences simulées</strong><p>Les préférences modifiables sont enregistrées dans le stockage local de ce navigateur. Aucun service central de configuration n’est connecté. Les valeurs du profil et des années scolaires proviennent des modules existants.</p></div><span>LOCAL · DEMO</span></div>
  <div className="ss-meta"><span>Dernier enregistrement : <strong>{updatedAt}</strong></span><span>Enregistré par : <strong>{saved.updatedBy||"Non disponible"}</strong></span><span className="ss-meta-unsaved">{dirty?"● Modifications en attente":"✓ Aucune modification en attente"}</span></div>
  {notice&&<div className="ss-notice success"><Check size={15}/><span>{notice}</span><button onClick={()=>setNotice("")}><X size={14}/></button></div>}
  {error&&<div className="ss-notice error" role="alert"><AlertCircle size={15}/><span>{error}</span><button onClick={()=>setError("")}><X size={14}/></button></div>}
  {validation.length>0&&<div className="ss-validation" role="alert"><AlertCircle size={15}/><div>{validation.map(v=><p key={v}>{v}</p>)}</div></div>}
  <div className="ss-workspace"><nav className="ss-nav" aria-label="Sections des paramètres">{sections.map((item,i)=>{const Icon=item.icon;return <button key={item.id} className={section===item.id?"active":""} onClick={()=>setSection(item.id)}><span className="ss-nav-icon"><Icon size={16}/></span><span className="ss-nav-copy"><strong>{item.label}</strong><small>{item.description}</small></span>{dirty&&<i className="ss-unsaved-dot" title="Modifications non enregistrées"/>}{section===item.id&&<ChevronRight size={14}/>}</button>;})}<div className="ss-nav-note"><Info size={15}/><p>Les préférences non prises en charge sont indiquées comme indisponibles. Elles ne modifient pas les autres modules.</p></div></nav>
  <section className="ss-panel">
   {section==="general"&&<><PanelTitle number="01" title="Général" subtitle="Valeurs de référence de l’établissement et de ses opérations."/><div className="ss-form-grid"><Field label="Nom d’affichage de l’établissement" help="Le nom officiel reste géré dans Administration → Profil de l’établissement. Aucun nom secondaire n’est créé ici."><ReadOnly value={schoolName} help="Référence directe au profil de l’établissement."/></Field><Field label="Code interne de l’établissement" help="Aucun identifiant interne distinct n’existe dans le modèle actuel."><ReadOnly value="Non configuré" help="Géré uniquement si un identifiant est ajouté au modèle institutionnel."/></Field><Field label="Type d’établissement"><ReadOnly value={profile.institutionType}/></Field><Field label="Statut opérationnel"><ReadOnly value={profile.status} help="Lecture seule : les transitions de statut ne sont pas gérées dans les paramètres."/></Field><Field label="Année scolaire par défaut" help="Ce choix ne modifie pas le statut de l’année et ne clôture ni n’active aucune période."><select value={draft.defaultAcademicYearId} onChange={e=>update("defaultAcademicYearId",e.target.value)}><option value="">Aucune préférence</option>{years.map(y=><option key={y.id} value={y.id}>{y.name} · {y.status}</option>)}</select></Field><Field label="Langue par défaut de l’application"><ReadOnly value="Français" help="Seule langue réellement prise en charge par l’interface actuelle. Les préférences individuelles ne sont pas modifiées."/></Field></div><div className="ss-info-block"><Info size={16}/><div><strong>Portée de l’année scolaire par défaut</strong><p>Cette préférence est conservée dans les paramètres de démonstration. Les modules de création ne la consultent pas encore comme valeur partagée ; l’année active du registre académique reste inchangée.</p></div></div><div className="ss-current-year"><span>Année scolaire active dans Gestion académique</span><strong>{activeYear?.name??"Aucune année active"}</strong><small>Cette valeur provient du registre académique existant.</small></div></>}
   {section==="region"&&<><PanelTitle number="02" title="Langue et région" subtitle="Formats régionaux utilisés dans les aperçus de cette page."/><div className="ss-form-grid"><Field label="Langue de l’interface"><ReadOnly value="Français" help="La traduction multilingue n’est pas implémentée."/></Field><Field label="Pays"><ReadOnly value={profile.country||"Non renseigné"} help="Le pays légal reste géré dans le profil officiel."/></Field><Field label="Fuseau horaire" help="Identifiant IANA. Le changement ne réécrit aucun horodatage stocké."><select value={draft.timeZone} onChange={e=>update("timeZone",e.target.value)}>{timeZones.map(t=><option key={t} value={t}>{t}</option>)}</select></Field><Field label="Format de date"><select value={draft.dateFormat} onChange={e=>update("dateFormat",e.target.value as SchoolSettingsDemo["dateFormat"])}><option value="DD/MM/YYYY">JJ/MM/AAAA</option><option value="YYYY-MM-DD">AAAA-MM-JJ</option></select></Field><Field label="Format d’heure"><select value={draft.timeFormat} onChange={e=>update("timeFormat",e.target.value as SchoolSettingsDemo["timeFormat"])}><option value="24h">24 heures</option><option value="12h">12 heures</option></select></Field><Field label="Format des nombres"><select value={draft.numberFormat} onChange={e=>update("numberFormat",e.target.value as SchoolSettingsDemo["numberFormat"])}><option value="fr-FR">Français — 12 345,67</option><option value="en-US">Anglais — 12,345.67</option></select></Field><Field label="Devise principale"><ReadOnly value={schoolBranding.currency==="MAD"?"MAD (DH)":schoolBranding.currency??"Non configurée"} help="La devise affichée est issue de la configuration existante. Aucun montant n’est converti."/></Field></div><div className="ss-preview"><div className="ss-preview-head"><div><strong>Aperçu régional</strong><small>Mis à jour immédiatement, sans enregistrement</small></div><span>APERÇU</span></div><div className="ss-preview-grid"><div><small>Date actuelle</small><strong>{preview?.date}</strong></div><div><small>Heure locale</small><strong>{preview?.time}</strong></div><div><small>Exemple numérique</small><strong>{preview?.number}</strong></div><div><small>Exemple de montant</small><strong>{preview?.currency}</strong></div></div><small className="ss-preview-zone">Heure actuelle dans {draft.timeZone} : {preview?.localTime}</small></div></>}
   {section==="calendar"&&<><PanelTitle number="03" title="Calendrier et jours ouvrables" subtitle="Définissez une semaine opérationnelle indicative pour l’établissement."/><div className="ss-form-grid"><Field label="Premier jour de la semaine"><select value={draft.firstDayOfWeek} onChange={e=>update("firstDayOfWeek",Number(e.target.value))}>{dayNames.map((d,i)=><option key={d} value={i}>{d}</option>)}</select></Field><Field label="Calendrier des jours fériés"><ReadOnly value="Non disponible" help="Aucun calendrier de jours fériés n’est connecté. Aucun jour de fermeture ne sera généré."/></Field></div><div className="ss-subheading"><strong>Jours ouvrables</strong><span>Sélectionnez les jours de fonctionnement habituels.</span></div><div className="ss-days">{dayNames.map((d,i)=><label key={d} className={draft.workingDays.includes(i)?"selected":""}><input type="checkbox" checked={draft.workingDays.includes(i)} onChange={()=>toggleDay(i)}/><span>{d.slice(0,3)}</span><small>{draft.workingDays.includes(i)?"Ouvrable":"Repos"}</small></label>)}</div><div className="ss-form-grid ss-time-grid"><Field label="Heure habituelle d’ouverture" help="Facultatif. Format 24 heures."><input type="time" value={draft.openingTime} onChange={e=>update("openingTime",e.target.value)}/></Field><Field label="Heure habituelle de fermeture" help="Facultatif. Doit être postérieure à l’ouverture."><input type="time" value={draft.closingTime} onChange={e=>update("closingTime",e.target.value)}/></Field></div><div className="ss-week-preview"><div className="ss-week-title"><div><strong>Aperçu hebdomadaire</strong><small>Prévisualisation de la préférence locale</small></div><Clock3 size={18}/></div><div className="ss-week-days">{Array.from({length:7},(_,offset)=>(draft.firstDayOfWeek+offset)%7).map(i=><div key={i} className={draft.workingDays.includes(i)?"work":"rest"}><strong>{dayNames[i].slice(0,3)}</strong><span>{draft.workingDays.includes(i)?"Ouvrable":"Repos"}</span></div>)}</div><div className="ss-week-hours"><span>Horaires habituels</span><strong>{draft.openingTime&&draft.closingTime?draft.openingTime+" – "+draft.closingTime:"Non définis"}</strong></div></div><div className="ss-info-block"><Info size={16}/><div><strong>Pas d’impact automatique sur les emplois du temps</strong><p>Ces préférences ne créent aucune fermeture, aucun jour férié et ne modifient aucune séance existante dans le module Emplois du temps.</p></div></div></>}
   {section==="display"&&<><PanelTitle number="04" title="Préférences d’affichage" subtitle="État des préférences d’affichage disponibles dans cette version."/><div className="ss-capability-list"><Capability title="Page d’accueil après connexion" status="Non disponible" description="Aucun mécanisme de préférence de page d’accueil n’est implémenté. La destination reste déterminée par le rôle et les routes autorisées."/><Capability title="Nombre de lignes par tableau" status="Non disponible" description="La pagination est configurée individuellement dans les modules. Il n’existe pas encore de valeur globale partagée."/><Capability title="Densité des tableaux" status="Non disponible" description="Les composants actuels n’exposent pas de réglage global compact ou confortable."/><Capability title="Confirmation avant de quitter un formulaire" status="Non disponible" description="Aucune préférence transversale n’est disponible. Les confirmations sensibles restent gérées dans leurs modules."/><Capability title="Format de date préféré" status="Pris en charge ici" description="Le format régional sélectionné dans « Langue et région » alimente l’aperçu de cette page uniquement."/><Capability title="Préférences individuelles" status="Séparées" description="Aucun changement n’est appliqué aux préférences personnelles des utilisateurs."/></div><div className="ss-info-block"><ShieldCheck size={16}/><div><strong>Les contrôles de sécurité restent obligatoires</strong><p>Les confirmations de paiements, remboursements, archives, exports sensibles, comptes, autorisations et suppressions ne peuvent pas être désactivées ici.</p></div></div></>}
   {section==="contacts"&&<><PanelTitle number="05" title="Coordonnées opérationnelles" subtitle="Consultez les coordonnées institutionnelles déjà renseignées dans le profil officiel."/><div className="ss-contact-grid"><Contact label="Téléphone administratif principal" value={profile.phone} note="Téléphone officiel partagé — Profil de l’établissement"/><Contact label="E-mail opérationnel" value={profile.email} note="E-mail officiel partagé — Profil de l’établissement"/><Contact label="Contact administratif" value={profile.administrativeContact} note="Référence du profil officiel"/><Contact label="E-mail administratif" value={profile.administrativeEmail} note="Référence du profil officiel"/><Contact label="Contact d’urgence institutionnel" value={profile.emergencyContact} note="Référence du profil officiel"/><Contact label="Adresse de l’établissement" value={[profile.address,profile.city,profile.country].filter(Boolean).join(", ")} note="Adresse officielle — lecture seule"/></div><div className="ss-info-block"><Info size={16}/><div><strong>Modifier les coordonnées officielles</strong><p>Pour éviter les doublons, ces valeurs sont lues directement depuis Administration → Profil de l’établissement. Les coordonnées des personnes ne sont pas exposées ici.</p></div></div></>}
   {section==="institution"&&<><PanelTitle number="06" title="Options institutionnelles" subtitle="Fonctionnalités dont le comportement est actuellement défini dans l’application."/><div className="ss-capability-list"><Capability title="Format de référence des élèves" status="Non disponible" description="Les références sont générées par le service des élèves. Aucun réglage de format configurable n’existe."/><Capability title="Format de référence du personnel" status="Non disponible" description="Les matricules sont validés et enregistrés par le service des employés. Aucun modèle global n’est exposé."/><Capability title="Langue par défaut des documents" status="Non disponible" description="Aucun service de génération documentaire avec préférence de langue partagée n’est connecté."/><Capability title="Notifications institutionnelles par défaut" status="Non disponible" description="Les notifications sont gérées dans leur module. Aucun réglage global de canaux ou de destinataires n’est disponible."/><Capability title="Calendrier des jours fériés" status="Non disponible" description="Aucun calendrier régional n’est fourni ; aucun congé ni fermeture n’est généré automatiquement."/><Capability title="Synchronisation centrale" status="Non disponible" description="Aucun service central de configuration n’est présent. Les préférences de démonstration restent sur ce navigateur."/></div><div className="ss-info-block"><ShieldCheck size={16}/><div><strong>Protection des identifiants existants</strong><p>Les formats de référence actuels ne sont pas modifiés. Aucun matricule élève ou employé, document historique ou lien entre dossiers n’est réécrit.</p></div></div></>}
   <div className="ss-panel-footer"><span>{dirty?"Des modifications restent à enregistrer.":"Aucune modification en attente."}</span><div><button className="ss-btn secondary" onClick={cancel} disabled={!dirty||saving}>Annuler</button><button className="ss-btn primary" onClick={save} disabled={!dirty||saving}><Save size={14}/>{saving?"Enregistrement…":"Enregistrer les modifications"}</button></div></div>
  </section></div>
  {showCancel&&<div className="ss-overlay"><section className="ss-confirm" role="dialog" aria-modal="true" aria-labelledby="ss-confirm-title"><span className="ss-confirm-icon"><AlertCircle size={20}/></span><h2 id="ss-confirm-title">Annuler les modifications ?</h2><p>Les changements non enregistrés seront perdus. Les préférences déjà enregistrées resteront inchangées.</p><div><button className="ss-btn secondary" onClick={()=>setShowCancel(false)}>Continuer la modification</button><button className="ss-btn danger" onClick={discard}>Annuler les modifications</button></div></section></div>}
 </main>;
}
function PanelTitle({number,title,subtitle}:{number:string;title:string;subtitle:string}){
 return <div className="ss-panel-title"><div><span>SECTION {number}</span><h2>{title}</h2><p>{subtitle}</p></div></div>;
}
function Capability({title,status,description}:{title:string;status:string;description:string}){
 return <article className="ss-capability"><div><strong>{title}</strong><p>{description}</p></div><span className={status==="Pris en charge ici"?"available":status==="Séparées"?"separate":"unavailable"}>{status}</span></article>;
}
function Contact({label,value,note}:{label:string;value:string;note:string}){
 return <article className="ss-contact"><small>{label}</small><strong>{value||"Non renseigné"}</strong><span>{note}</span></article>;
}
