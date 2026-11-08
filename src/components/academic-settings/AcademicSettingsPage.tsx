import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle, BookOpenCheck, Calculator, CalendarDays, Check, ChevronRight,
  ClipboardCheck, FileText, GraduationCap, Info, LockKeyhole,
  Save, ShieldAlert, ShieldCheck, SlidersHorizontal, X
} from "lucide-react";
import { academicYearRepository, type AcademicYear } from "../../services/academic-years";
import { subjectsRepository, type SubjectsData } from "../../services/subjects";
import {
  readAcademicPolicyDemo, saveAcademicPolicyDemo,
  validateAcademicPolicyDemo, type AcademicPolicyDemo
} from "../../services/academic-policy-demo";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./AcademicSettingsPage.css";

interface Props { user: AuthenticatedSidebarUser }
type Section = "grading"|"averages"|"evaluation"|"validation"|"progression"|"periods"|"general";
const sections:{id:Section;label:string;description:string;icon:typeof GraduationCap}[]=[
 {id:"grading",label:"Notation",description:"Barème, précision et notes absentes",icon:Calculator},
 {id:"averages",label:"Calcul des moyennes",description:"Coefficients et pondérations",icon:BookOpenCheck},
 {id:"evaluation",label:"Évaluation",description:"Types et règles d’évaluation",icon:ClipboardCheck},
 {id:"validation",label:"Validation des résultats",description:"Soumission, vérification et publication",icon:ShieldCheck},
 {id:"progression",label:"Passage et redoublement",description:"Éligibilité et décisions",icon:GraduationCap},
 {id:"periods",label:"Périodes scolaires",description:"Périodes des années existantes",icon:CalendarDays},
 {id:"general",label:"Règles académiques générales",description:"Valeurs par défaut et bulletins",icon:SlidersHorizontal}
];
const roundValue=(value:number,decimals:number,rule:AcademicPolicyDemo["rounding"])=>{
 const factor=10**decimals;
 const adjusted=value*factor;
 const rounded=rule==="down"?Math.floor(adjusted+1e-10):rule==="up"?Math.ceil(adjusted-1e-10):Math.round(adjusted);
 return rounded/factor;
};
const display=(value:number,decimals:number)=>value.toLocaleString("fr-FR",{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
function Field({label,help,children}:{label:string;help?:string;children:ReactNode}){
 return <label className="as-field"><span>{label}</span>{children}{help&&<small>{help}</small>}</label>;
}
function ReadOnly({value,help}:{value:string;help?:string}){
 return <div className="as-readonly"><strong>{value||"Non disponible"}</strong>{help&&<small>{help}</small>}</div>;
}
function PanelTitle({index,title,description}:{index:string;title:string;description:string}){
 return <div className="as-panel-title"><div><span>SECTION {index}</span><h2>{title}</h2><p>{description}</p></div><span className="as-scope-pill">Année scolaire sélectionnée</span></div>;
}
function Unavailable({title,description}:{title:string;description:string}){
 return <article className="as-unavailable"><span><LockKeyhole size={15}/></span><div><strong>{title}</strong><p>{description}</p><small>Fonctionnalité non connectée dans la version actuelle.</small></div><em>INDISPONIBLE</em></article>;
}
function InfoBlock({title,children}:{title:string;children:ReactNode}){
 return <div className="as-info"><Info size={16}/><div><strong>{title}</strong><p>{children}</p></div></div>;
}
export function AcademicSettingsPage({user}:Props){
 const canManage=user.permissions.includes("settings.academic.manage");
 const canView=canManage||user.permissions.includes("pedagogy.grades.view");
 const [years,setYears]=useState<AcademicYear[]>([]);
 const [subjects,setSubjects]=useState<SubjectsData|null>(null);
 const [yearId,setYearId]=useState("");
 const [saved,setSaved]=useState<AcademicPolicyDemo|null>(null);
 const [draft,setDraft]=useState<AcademicPolicyDemo|null>(null);
 const [section,setSection]=useState<Section>("grading");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [validation,setValidation]=useState<string[]>([]);
 const [confirm,setConfirm]=useState(false);
 const [pendingYear,setPendingYear]=useState("");
 const dirty=!!saved&&!!draft&&JSON.stringify(saved)!==JSON.stringify(draft);
 const activeValidation=validation.length?validation:dirty&&draft?validateAcademicPolicyDemo(draft):[];
 const hasInvalidSettings=activeValidation.length>0;
 useEffect(()=>{
  if(!dirty)return;
  const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue="";};
  window.addEventListener("beforeunload",warn);
  return()=>window.removeEventListener("beforeunload",warn);
 },[dirty]);
 useEffect(()=>{
  let active=true;
  if(!canView){setLoading(false);return;}
  Promise.all([academicYearRepository.list(),subjectsRepository.list()]).then(([yearRows,subjectRows])=>{
   if(!active)return;
   setYears(yearRows);setSubjects(subjectRows);
   const initial=yearRows.find(y=>y.status==="Active")??yearRows[0];
   const id=initial?.id??"";
   const policy=readAcademicPolicyDemo(id);
   setYearId(id);setSaved(policy);setDraft({...policy});
  }).catch(e=>{if(active)setError(e instanceof Error?e.message:"Impossible de charger les référentiels académiques.");})
  .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[canView]);
 const selectedYear=years.find(y=>y.id===yearId);
 const yearSubjects=useMemo(()=>subjects?.subjects.filter(s=>s.status==="Actif").flatMap(s=>s.assignments.filter(a=>a.academicYearId===yearId).map(a=>({name:s.name,coefficient:a.coefficient??s.defaultCoefficient??1,source:a.coefficient!==null||s.defaultCoefficient!==null})))??[],[subjects,yearId]);
 const mathAssignment=yearSubjects.find(s=>s.name.toLocaleLowerCase("fr").includes("math"));
 const frenchAssignment=yearSubjects.find(s=>s.name.toLocaleLowerCase("fr").includes("français"));
 const historyAssignment=yearSubjects.find(s=>s.name.toLocaleLowerCase("fr").includes("histoire"));
 const coefficientsAreAssigned=Boolean(mathAssignment?.source&&frenchAssignment?.source&&historyAssignment?.source);
 const mathCoeff=mathAssignment?.coefficient??3;
 const frenchCoeff=frenchAssignment?.coefficient??2;
 const historyCoeff=historyAssignment?.coefficient??1;
 const mathSource=mathAssignment?.source??false;
 const frenchSource=frenchAssignment?.source??false;
 const historySource=historyAssignment?.source??false;
 const preview=useMemo(()=>{
  if(!draft)return null;
  const entered=14.567*(draft.gradingScale/20);
  const shown=roundValue(entered,draft.decimals,draft.rounding);
  const marks=[{name:"Mathématiques",grade:16*draft.gradingScale/20,coefficient:mathCoeff,source:mathSource},{name:"Français",grade:14*draft.gradingScale/20,coefficient:frenchCoeff,source:frenchSource},{name:"Histoire-Géographie",grade:12*draft.gradingScale/20,coefficient:historyCoeff,source:historySource}];
  const denominator=marks.reduce((sum,row)=>sum+(draft.averageMode==="weighted"?row.coefficient:1),0);
  const averageRaw=marks.reduce((sum,row)=>sum+row.grade*(draft.averageMode==="weighted"?row.coefficient:1),0)/denominator;
  const average=roundValue(averageRaw,draft.calculationDecimals,draft.rounding);
  const averageDisplayed=roundValue(average,draft.decimals,draft.rounding);
  const averageOn20=average*20/draft.gradingScale;
  const passing=draft.passingGrade;
  const eligibility=average>=passing&&draft.gradingScale===20?"Seuil atteint — examen des conditions complémentaires requis":average>=passing?"Seuil indicatif atteint":"Seuil indicatif non atteint";
  const bulletin=marks.map(m=>({name:m.name,grade:roundValue(m.grade,draft.decimals,draft.rounding)}));
  return {entered,shown,marks,average:averageDisplayed,averageRaw:average,averageOn20:roundValue(averageOn20,draft.decimals,draft.rounding),eligibility,bulletin};
 },[draft,mathCoeff,frenchCoeff,historyCoeff,mathSource,frenchSource,historySource]);
 function update<K extends keyof AcademicPolicyDemo>(key:K,value:AcademicPolicyDemo[K]){
  setDraft(current=>current?({...current,[key]:value}):current);setNotice("");setError("");setValidation([]);
 }
 function switchYear(next:string){
  if(next===yearId)return;
  if(dirty){setPendingYear(next);setConfirm(true);return;}
  loadYear(next);
 }
 function loadYear(next:string){
  const policy=readAcademicPolicyDemo(next);
  setYearId(next);setSaved(policy);setDraft({...policy});setValidation([]);setNotice("");setError("");setConfirm(false);setPendingYear("");
 }
 function save(){
  if(!draft||!dirty||!canManage||!yearId)return;
  const errors=validateAcademicPolicyDemo(draft);
  if(errors.length){setValidation(errors);setSection("grading");return;}
  const changes:string[]=[];
  if(draft.gradingScale!==saved?.gradingScale)changes.push("Barème : "+saved?.gradingScale+" → "+draft.gradingScale);
  if(draft.passingGrade!==saved?.passingGrade)changes.push("Seuil de réussite : "+saved?.passingGrade+" → "+draft.passingGrade);
  if(draft.averageMode!==saved?.averageMode)changes.push("Calcul des moyennes : "+(saved?.averageMode==="weighted"?"pondéré":"simple")+" → "+(draft.averageMode==="weighted"?"pondéré":"simple"));
  if(draft.decimals!==saved?.decimals||draft.rounding!==saved?.rounding||draft.calculationDecimals!==saved?.calculationDecimals)changes.push("Précision et arrondi des résultats modifiés.");
  if(draft.missingAverage!==saved?.missingAverage)changes.push("Traitement des notes manquantes modifié.");
  if(changes.length&&!window.confirm("Confirmer les préférences locales pour "+(selectedYear?.name??"l’année sélectionnée")+" ?\n\n"+changes.join("\n")+"\n\nAucune note réelle, moyenne publiée, décision de passage ou bulletin ne sera recalculé ou modifié."))return;
  setSaving(true);setError("");setNotice("");
  try{
   const next=saveAcademicPolicyDemo(yearId,draft,user.displayName);
   setSaved(next);setDraft({...next});setNotice("Préférences enregistrées dans ce navigateur pour "+(selectedYear?.name??"l’année sélectionnée")+". Aucune donnée académique réelle n’a été modifiée.");
  }catch(e){setError(e instanceof Error?e.message:"Échec de l’enregistrement local. Vos modifications sont conservées.");}
  finally{setSaving(false);}
 }
 function cancel(){if(saved)setDraft({...saved});setValidation([]);setError("");setNotice("Les modifications non enregistrées ont été annulées.");}
 if(!canView)return <main className="as-page"><section className="as-denied"><ShieldAlert size={27}/><h1>Accès non autorisé</h1><p>Votre compte ne dispose pas de l’autorisation nécessaire pour consulter les paramètres académiques.</p></section></main>;
 if(loading)return <main className="as-page"><div className="as-loading"/><p>Chargement des référentiels académiques…</p></main>;
 if(!draft||!saved||!selectedYear)return <main className="as-page"><div className="as-error"><AlertCircle size={17}/><span>{error||"Aucune année scolaire n’est disponible. Créez d’abord une année scolaire dans Gestion académique."}</span><button onClick={()=>window.location.reload()}>Réessayer</button></div></main>;
 const updated=saved.updatedAt?new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(saved.updatedAt)):"Aucun enregistrement local";
 const decimals=draft.decimals;
 return <main className="as-page">
  <div className="as-breadcrumb">Paramètres <ChevronRight size={13}/><strong>Paramètres académiques</strong></div>
  <header className="as-header"><div><span className="as-eyebrow">CONFIGURATION · POLITIQUES ACADÉMIQUES</span><h1>Paramètres académiques</h1><p>Configurez les règles de notation, d’évaluation et de progression scolaire de votre établissement.</p></div><div className="as-actions"><span className={"as-dirty "+(dirty?"pending":"")}>{dirty?"Modifications non enregistrées":"Préférences enregistrées"}</span><button className="as-btn secondary" onClick={cancel} disabled={!dirty||saving}>Annuler</button><button className="as-btn primary" onClick={save} disabled={!dirty||saving||!canManage||hasInvalidSettings}><Save size={14}/>{saving?"Enregistrement…":"Enregistrer les modifications"}</button></div></header>
  <section className="as-demo-banner"><Info size={17}/><div><strong>Mode démonstration — politiques locales fictives</strong><p>Les préférences éditables sont enregistrées uniquement dans le stockage local de ce navigateur, par année scolaire. Elles ne sont pas lues par le moteur de notes, les bulletins, les validations ou les décisions de passage. Aucune note réelle n’est modifiée.</p></div><span>LOCAL · DÉMO</span></section>
  <div className="as-meta"><label>Année scolaire concernée<select value={yearId} onChange={e=>switchYear(e.target.value)}>{years.map(y=><option key={y.id} value={y.id}>{y.name} · {y.status}</option>)}</select></label><span>Dernier enregistrement : <strong>{updated}</strong></span><span>Enregistré par : <strong>{saved.updatedBy||"Aucun enregistrement"}</strong></span><span className="as-scope">Portée : <strong>Année sélectionnée · démonstration</strong></span></div>
  {!canManage&&<div className="as-readonly-banner"><LockKeyhole size={15}/> Consultation seule : votre compte ne dispose pas de l’autorisation de gestion des paramètres académiques.</div>}
  {notice&&<div className="as-notice success" role="status"><Check size={15}/><span>{notice}</span><button onClick={()=>setNotice("")}><X size={14}/></button></div>}
  {error&&<div className="as-notice error" role="alert"><AlertCircle size={15}/><span>{error}</span><button onClick={()=>setError("")}><X size={14}/></button></div>}
  {activeValidation.length>0&&<div className="as-validation" role="alert"><AlertCircle size={15}/><div>{activeValidation.map(x=><p key={x}>{x}</p>)}</div></div>}
  <div className="as-layout"><nav className="as-nav" aria-label="Sections des paramètres académiques">{sections.map(item=>{const Icon=item.icon;return <button type="button" key={item.id} className={section===item.id?"active":""} onClick={()=>setSection(item.id)}><span><Icon size={16}/></span><div><strong>{item.label}</strong><small>{item.description}</small></div>{dirty&&<i title="Modifications en attente"/>}{section===item.id&&<ChevronRight size={14}/>}</button>})}<div className="as-nav-note"><Info size={14}/><p>Les paramètres restent propres à l’année sélectionnée. Les autres modules ne les appliquent pas encore.</p></div></nav>
   <section className="as-content">
    {section==="grading"&&<><PanelTitle index="01" title="Notation" description="Définissez un barème et les règles d’affichage des notes."/><div className="as-fields"><Field label="Barème principal" help="Barèmes pris en charge par cette démonstration."><select disabled={!canManage} value={draft.gradingScale} onChange={e=>{const scale=Number(e.target.value) as 10|20|100;update("gradingScale",scale);update("passingGrade",Math.min(draft.passingGrade,scale));}}><option value="10">Sur 10</option><option value="20">Sur 20</option><option value="100">Sur 100</option></select></Field><Field label="Note minimale"><input disabled value="0" readOnly/></Field><Field label="Note maximale"><input disabled value={draft.gradingScale} readOnly/></Field><Field label="Nombre de décimales autorisées"><select disabled={!canManage} value={decimals} onChange={e=>update("decimals",Number(e.target.value) as 0|1|2)}><option value="0">0 décimale</option><option value="1">1 décimale</option><option value="2">2 décimales</option></select></Field><Field label="Règle d’arrondi"><select disabled={!canManage} value={draft.rounding} onChange={e=>update("rounding",e.target.value as AcademicPolicyDemo["rounding"])}><option value="math">Arrondi mathématique</option><option value="down">Arrondi inférieur</option><option value="up">Arrondi supérieur</option></select></Field><Field label="Note minimale de réussite"><input disabled={!canManage} type="number" min="0" max={draft.gradingScale} step="0.5" value={draft.passingGrade} onChange={e=>update("passingGrade",Number(e.target.value))}/></Field><Field label="Élève absent"><ReadOnly value="Statut distinct — jamais converti en zéro" help="La gestion opérationnelle des absences relève du module de notes."/></Field><Field label="Note non saisie"><ReadOnly value="Distincte d’une note égale à zéro" help="Une note non renseignée n’est pas transformée automatiquement en zéro."/></Field><Field label="Élève non évalué / non applicable"><ReadOnly value="États distincts non configurables ici" help="Le moteur central ne propose pas de règle de traitement partagée."/></Field></div><div className="as-example"><div><strong>Exemple de notation</strong><small>Valeur fictive, calculée en direct</small></div><div className="as-example-grid"><span>Note saisie<strong>14,567 / 20</strong></span><span>Note affichée<strong>{display(preview!.shown,decimals)} / {draft.gradingScale}</strong></span><span>Règle<strong>{draft.rounding==="math"?"Mathématique":draft.rounding==="down"?"Inférieur":"Supérieur"}</strong></span></div></div><InfoBlock title="Notes absentes et évaluations non réalisées">Les notes absentes, les notes non saisies et les élèves non évalués restent des états distincts. Le moteur actuel ne fournit pas de configuration centrale pour leur traitement ; les valeurs affichées ici sont des préférences de démonstration.</InfoBlock></>}
    {section==="averages"&&<><PanelTitle index="02" title="Calcul des moyennes" description="Visualisez les modes de calcul et les coefficients affectés aux matières, avec leur source."/><div className="as-fields"><Field label="Mode de calcul" help="Le mode choisi pilote uniquement l’exemple fictif de cette page."><select disabled={!canManage} value={draft.averageMode} onChange={e=>update("averageMode",e.target.value as AcademicPolicyDemo["averageMode"])}><option value="simple">Moyenne simple</option><option value="weighted">Moyenne pondérée</option></select></Field><Field label="Application des coefficients"><ReadOnly value="Coefficients des affectations de matières" help="Source : service existant des matières, filtré par année scolaire."/></Field><Field label="Traitement des notes manquantes" help="L’exemple de calcul ci-dessous est complet ; ce choix illustre le comportement souhaité en présence d’une note manquante."><select disabled={!canManage} value={draft.missingAverage} onChange={e=>update("missingAverage",e.target.value as AcademicPolicyDemo["missingAverage"])}><option value="exclude">Exclure du calcul fictif</option><option value="block">Bloquer le calcul fictif</option></select></Field><Field label="Précision intermédiaire"><select disabled={!canManage} value={draft.calculationDecimals} onChange={e=>update("calculationDecimals",Number(e.target.value) as 2|3|4)}><option value="2">2 décimales</option><option value="3">3 décimales</option><option value="4">4 décimales</option></select></Field><Field label="Pondération des catégories"><ReadOnly value="Non disponible" help="Aucun modèle central de pondération par catégorie n’a été trouvé."/></Field><Field label="Poids des évaluations"><ReadOnly value="Non disponible" help="Aucune pondération des évaluations n’est exposée dans le modèle actuel."/></Field></div><div className="as-table-wrap"><table className="as-table"><thead><tr><th>Matière</th><th>Moyenne fictive</th><th>Coefficient existant</th><th>Contribution indicative</th></tr></thead><tbody>{preview!.marks.map(row=><tr key={row.name}><td>{row.name}</td><td>{display(roundValue(row.grade,draft.decimals,draft.rounding),draft.decimals)} / {draft.gradingScale}</td><td>{row.coefficient} · {row.source?"Affectation":"Exemple"}</td><td>{display(row.grade*(draft.averageMode==="weighted"?row.coefficient:1),2)}</td></tr>)}</tbody></table></div><div className="as-average-result"><span>{draft.averageMode==="weighted"?"Moyenne pondérée fictive":"Moyenne simple fictive"}</span><strong>{display(preview!.average,decimals)} / {draft.gradingScale}</strong><small>Résultat intermédiaire : {display(preview!.averageRaw,draft.calculationDecimals)}. Formule : somme des notes × coefficients ÷ somme des coefficients.</small></div><InfoBlock title="Ne pas confondre les pondérations">{coefficientsAreAssigned?"Les coefficients affichés proviennent des affectations réelles de matières pour cette année.":"Au moins une affectation de coefficient manque : les valeurs manquantes utilisent les coefficients fictifs 3, 2 et 1 indiqués dans le cahier des charges."} Le coefficient d’une matière est distinct du poids d’une évaluation ; ce dernier n’est pas configurable dans le modèle existant.</InfoBlock></>}
    {section==="evaluation"&&<><PanelTitle index="03" title="Évaluation" description="Références du module de notes et limites de configuration disponibles."/><div className="as-fields"><Field label="Types d’évaluation détectés"><ReadOnly value="Devoir surveillé 1 · exemple dans le module Notes et validation" help="Ce libellé provient de données fictives d’aperçu, pas d’un catalogue partagé."/></Field><Field label="Catalogue des types"><ReadOnly value="Non disponible" help="Aucun service ou modèle central de types d’évaluation n’a été trouvé."/></Field><Field label="Pondération par type"><ReadOnly value="Non disponible"/></Field><Field label="Fréquence maximale"><ReadOnly value="Non disponible"/></Field></div><Unavailable title="Configuration du catalogue des évaluations" description="Le projet ne fournit pas de référentiel partagé pour Contrôle continu, Examen, Travail pratique, Projet ou Devoir. La page ne crée donc pas un second catalogue."/><Unavailable title="Portée par programme, niveau ou matière" description="Aucune règle d’applicabilité des types d’évaluation n’est exposée par le modèle actuel."/><InfoBlock title="Les examens restent dans leur module">Les dates, salles, sessions, classes participantes et planification ne sont pas configurées ici. Elles restent dans Opérations pédagogiques → Examens.</InfoBlock></>}
    {section==="validation"&&<><PanelTitle index="04" title="Validation des résultats" description="Cycle de vie observé dans le module existant de soumission des notes."/><div className="as-workflow">{["Saisie des notes","Soumission","Vérification","Validation","Publication"].map((label,i)=><div key={label} className={i===0?"complete":i===1?"demo":"unavailable"}><span>{i+1}</span><strong>{label}</strong><small>{i===0?"Saisie illustrative":i===1?"Soumissions fictives":"Non configuré dans un service d’autorisation"}</small></div>)}</div><div className="as-fields"><Field label="Soumission des notes"><ReadOnly value="Démonstration dans Notes et validation" help="Aucune persistance de soumission réelle."/></Field><Field label="Vérification pédagogique"><ReadOnly value="Non configurable" help="Aucune matrice de responsabilité partagée n’a été trouvée."/></Field><Field label="Validation des résultats"><ReadOnly value="Action temporaire de démonstration" help="Les actions du module ne sont pas enregistrées côté serveur."/></Field><Field label="Publication"><ReadOnly value="Action temporaire de démonstration" help="Une publication affichée dans le module ne constitue pas une publication réelle."/></Field></div><Unavailable title="Rôles et autorisations par étape" description="Le projet possède des permissions de consultation et de gestion de paramètres, mais aucune permission dédiée à approuver, valider ou publier chaque étape. Aucune attribution de rôle n’est inventée."/><Unavailable title="Réouverture et correction après publication" description="Aucun flux central de révision, versionnage ou réouverture d’une période validée n’est exposé."/><InfoBlock title="Protection des résultats">Cette page ne modifie aucune note, ne valide aucune soumission et ne publie aucun bulletin. Les actions de démonstration existantes restent temporaires dans leur propre page.</InfoBlock></>}
    {section==="progression"&&<><PanelTitle index="05" title="Passage et redoublement" description="Présentation indicative des règles de progression non encore connectées."/><div className="as-fields"><Field label="Moyenne minimale de passage"><ReadOnly value="Non configurée" help="Aucune règle centrale de passage n’existe dans les services actuels."/></Field><Field label="Conditions par matière obligatoire"><ReadOnly value="Non disponibles"/></Field><Field label="Rattrapage"><ReadOnly value="Non disponible"/></Field><Field label="Décision finale"><ReadOnly value="Workflow autorisé non implémenté"/></Field></div><Unavailable title="Règles de passage et de redoublement" description="Le projet ne contient pas de service de calcul d’éligibilité, de critères de redoublement ou de workflow de décision finale. Aucun seuil réel n’est appliqué."/><div className="as-example"><div><strong>Cas fictif — élève exemple</strong><small>Aucune donnée réelle d’élève</small></div><div className="as-example-grid"><span>Moyenne générale<strong>13,20 / 20</strong></span><span>Français<strong>8 / 20</strong></span><span>Conclusion<strong>Examen complémentaire requis (exemple)</strong></span></div><p>La moyenne dépasse le seuil illustratif de 10/20, mais la note de français est inférieure à la condition illustrative. Cette condition n’est pas une règle configurée dans l’application.</p></div><InfoBlock title="Aucune décision automatique">Modifier une préférence ne promeut, ne redouble et ne réaffecte aucun élève. Une décision finale doit rester dans un workflow académique autorisé.</InfoBlock></>}
    {section==="periods"&&<><PanelTitle index="06" title="Périodes scolaires" description="Années scolaires existantes et disponibilité des périodes académiques."/><div className="as-year-card"><div><small>ANNÉE SCOLAIRE SÉLECTIONNÉE</small><strong>{selectedYear.name}</strong><span>{selectedYear.startDate} → {selectedYear.endDate}</span></div><span className="as-status">{selectedYear.status}</span></div><Unavailable title="Structure des semestres et trimestres" description="Le modèle AcademicYear contient les dates de début et de fin de l’année, mais aucun enregistrement de période, date limite de saisie ou de publication. Aucune période n’est inventée."/><div className="as-period-placeholder"><CalendarDays size={22}/><strong>Aucune période académique enregistrée dans le modèle actuel</strong><p>La période « Semestre 1 » visible dans les données de démonstration de Notes et validation est un libellé d’exemple, pas une période reliée à l’année scolaire.</p></div><InfoBlock title="Réutilisation du registre existant">La gestion des dates et statuts de l’année scolaire reste dans Gestion académique → Années scolaires. Cette page ne crée pas de calendrier concurrent.</InfoBlock></>}
    {section==="general"&&<><PanelTitle index="07" title="Règles académiques générales" description="Valeurs de démonstration et préférences de présentation disponibles."/><div className="as-fields"><Field label="Langue académique par défaut"><ReadOnly value="Français" help="Langue de l’interface actuellement prise en charge."/></Field><Field label="Barème par défaut"><ReadOnly value={"Sur "+draft.gradingScale+" · préférence locale"}/></Field><Field label="Modèle d’évaluation par défaut"><ReadOnly value="Non disponible" help="Aucun modèle partagé d’évaluation n’existe."/></Field><Field label="Précision d’affichage des résultats"><ReadOnly value={draft.decimals+" décimale(s) · préférence locale"}/></Field></div><div className="as-subheading"><strong>Préférences de bulletin</strong><span>Le modèle de génération de bulletins n’expose pas ces options.</span></div><div className="as-bulletin"><div><FileText size={17}/><strong>Bulletin exemple — aperçu uniquement</strong></div>{["Moyennes par matière","Coefficients","Moyenne générale","Période scolaire","Mentions","Décision de passage"].map(label=><span key={label}><i/>{label}<em>Non configurable</em></span>)}</div><Unavailable title="Héritage et dérogations par programme ou niveau" description="Aucun modèle d’override de politique par programme ou niveau n’est présent. Les préférences enregistrées ici sont propres à l’année choisie et restent locales au navigateur."/><InfoBlock title="Historique des politiques">Aucun journal d’audit de configuration académique ni versionnage des politiques n’est connecté. La date du dernier enregistrement local n’est pas un historique d’audit.</InfoBlock></>}
    <footer className="as-footer"><span>{dirty?"Modifications en attente pour "+selectedYear.name:"Aucune modification en attente"}</span><div><button className="as-btn secondary" disabled={!dirty||saving} onClick={cancel}>Annuler</button><button className="as-btn primary" disabled={!dirty||saving||!canManage} onClick={save}><Save size={14}/>{saving?"Enregistrement…":"Enregistrer les modifications"}</button></div></footer>
   </section>
   <aside className="as-preview"><div className="as-preview-heading"><span>APERÇU EN DIRECT</span><h2>Aperçu des règles académiques</h2><p>Exemples fictifs, sans données réelles d’élèves.</p></div><div className="as-preview-card"><small>01 · NOTE AFFICHÉE</small><strong>{display(preview!.shown,decimals)} / {draft.gradingScale}</strong><span>Entrée : 14,567 / 20 · exemple fictif</span></div><div className="as-preview-card"><small>02 · MOYENNE D’UNE MATIÈRE</small><strong>{display(15.5*draft.gradingScale/20,decimals)} / {draft.gradingScale}</strong><span>Exemple fictif de moyenne de matière.</span></div><div className="as-preview-card"><small>03 · MOYENNE GÉNÉRALE</small><strong>{display(preview!.average,decimals)} / {draft.gradingScale}</strong><span>{draft.averageMode==="weighted"?"Pondération selon les coefficients existants":"Moyenne simple"}</span></div><div className="as-preview-card"><small>04 · PASSAGE INDICATIF</small><strong className="as-preview-long">{preview!.eligibility}</strong><span>Ne constitue pas une décision de passage.</span></div><div className="as-preview-card"><small>05 · BULLETIN EXEMPLE</small><strong>{display(preview!.averageOn20,decimals)} / 20</strong><span>Résultat fictif, non généré ni publié.</span></div><div className="as-preview-warning"><ShieldAlert size={15}/><p>Exemple de démonstration — aucune donnée réelle d’élève. Les paramètres ne sont pas appliqués par les autres modules.</p></div><div className="as-preview-coeff"><strong>Coefficients lus dans le référentiel</strong><span>Mathématiques : {mathCoeff}{mathAssignment?"":" · exemple"}</span><span>Français : {frenchCoeff}{frenchAssignment?"":" · exemple"}</span><span>Histoire-Géographie : {historyCoeff}{historyAssignment?"":" · exemple"}</span></div></aside>
  </div>
  {confirm&&<div className="as-overlay"><section className="as-confirm" role="dialog" aria-modal="true" aria-labelledby="as-confirm-title"><span><AlertCircle size={20}/></span><h2 id="as-confirm-title">Changements non enregistrés</h2><p>Vous avez des modifications pour {selectedYear.name}. Changer d’année scolaire les abandonnera. Voulez-vous continuer ?</p><div><button className="as-btn secondary" onClick={()=>setConfirm(false)}>Continuer la modification</button><button className="as-btn primary" onClick={()=>loadYear(pendingYear)}>Abandonner et changer d’année</button></div></section></div>}
 </main>;
}
