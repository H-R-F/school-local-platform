import { useMemo, useState } from "react";
import { AlertCircle, Check, ChevronDown, ChevronRight, CircleHelp, LockKeyhole, Plus, Search, ShieldCheck, Users, X } from "lucide-react";
import { demoAccounts, getRoleLabel } from "../../data/demo-accounts";
import { roleDefaultPermissions } from "../../data/role-permissions";
import type { AuthenticatedSidebarUser, Permission, StaffRole } from "../../types/navigation";
import "./roles-permissions.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type RoleTab = "permissions" | "users";
type PermissionEntry = { id: Permission; label: string; description: string; category: string; sensitive?: boolean };
const roles: StaffRole[] = ["director", "administrative", "pedagogical", "finance"];
const roleDescriptions: Record<StaffRole,string> = {
 director: "Accès complet à l’administration de l’établissement et aux fonctions réservées à la direction.",
 administrative: "Gestion administrative des dossiers, des personnes et du fonctionnement quotidien.",
 pedagogical: "Gestion du suivi pédagogique, des évaluations et de l’organisation des apprentissages.",
 finance: "Gestion des opérations financières et des services logistiques."
};
const permissionCatalog: PermissionEntry[] = [
 {id:"overview.view",label:"Consulter la vue d’ensemble",description:"Accéder au tableau de bord correspondant au rôle.",category:"Vue d’ensemble"},
 {id:"academic.structure.view",label:"Consulter la structure académique",description:"Consulter les années, filières, niveaux, classes, matières et départements.",category:"Gestion académique"},
 {id:"academic.structure.manage",label:"Gérer la structure académique",description:"Créer et modifier les éléments de la structure académique.",category:"Gestion académique"},
 {id:"people.students.view",label:"Consulter les élèves",description:"Accéder aux dossiers et listes des élèves.",category:"Personnes"},
 {id:"people.parents.view",label:"Consulter les parents",description:"Accéder aux dossiers des parents et tuteurs.",category:"Personnes"},
 {id:"people.teachers.view",label:"Consulter les enseignants",description:"Accéder aux dossiers des enseignants.",category:"Personnes"},
 {id:"people.employees.view",label:"Consulter les employés",description:"Accéder aux dossiers du personnel non enseignant.",category:"Personnes"},
 {id:"people.roles.manage",label:"Gérer les rôles et autorisations",description:"Accéder à la gestion des rôles et des permissions.",category:"Personnes",sensitive:true},
 {id:"pedagogy.grades.view",label:"Consulter les notes et validations",description:"Accéder aux notes et à leur suivi.",category:"Opérations pédagogiques"},
 {id:"pedagogy.exams.view",label:"Consulter les examens",description:"Accéder à l’organisation et au suivi des examens.",category:"Opérations pédagogiques"},
 {id:"pedagogy.content.view",label:"Consulter les cours et exercices",description:"Accéder aux contenus pédagogiques.",category:"Opérations pédagogiques"},
 {id:"pedagogy.schedule.view",label:"Consulter les emplois du temps",description:"Consulter les emplois du temps et horaires.",category:"Opérations pédagogiques"},
 {id:"pedagogy.reports.view",label:"Consulter les rapports pédagogiques",description:"Accéder aux rapports de suivi pédagogique.",category:"Opérations pédagogiques"},
 {id:"pedagogy.recognition.manage",label:"Gérer les distinctions",description:"Gérer les badges et reconnaissances des élèves.",category:"Opérations pédagogiques"},
 {id:"student.attendance.view",label:"Consulter la présence des élèves",description:"Accéder aux relevés de présence des élèves.",category:"Vie scolaire"},
 {id:"staff.attendance.view",label:"Consulter la présence du personnel",description:"Accéder aux relevés de présence du personnel.",category:"Vie scolaire"},
 {id:"documents.view",label:"Consulter les documents",description:"Accéder aux documents administratifs autorisés.",category:"Vie scolaire"},
 {id:"student.analytics.view",label:"Consulter les analyses des élèves",description:"Accéder aux indicateurs et classements des élèves.",category:"Vie scolaire"},
 {id:"student.activities.view",label:"Consulter les activités des élèves",description:"Accéder aux activités et événements des élèves.",category:"Vie scolaire"},
 {id:"finance.registers.view",label:"Consulter les registres de paiement",description:"Accéder aux registres des paiements.",category:"Finances"},
 {id:"finance.payments.manage",label:"Gérer les paiements",description:"Créer et gérer les opérations de paiement.",category:"Finances"},
 {id:"finance.balances.view",label:"Consulter les soldes et services",description:"Consulter les soldes et services des élèves.",category:"Finances"},
 {id:"finance.expenses.manage",label:"Gérer les dépenses",description:"Créer et suivre les dépenses.",category:"Finances"},
 {id:"finance.reports.view",label:"Consulter les rapports financiers",description:"Accéder aux rapports financiers.",category:"Finances"},
 {id:"logistics.transport.manage",label:"Gérer le transport",description:"Gérer les services et opérations de transport.",category:"Logistique"},
 {id:"logistics.trips.manage",label:"Gérer les sorties et excursions",description:"Gérer les sorties et déplacements scolaires.",category:"Logistique"},
 {id:"logistics.incidents.manage",label:"Gérer les accidents et incidents",description:"Enregistrer et suivre les incidents.",category:"Logistique"},
 {id:"logistics.inventory.manage",label:"Gérer l’inventaire",description:"Gérer les biens et équipements.",category:"Logistique"},
 {id:"communication.view",label:"Consulter la communication",description:"Accéder aux annonces, notifications et événements.",category:"Communication"},
 {id:"communication.meetings.manage",label:"Gérer les réunions",description:"Organiser et gérer les réunions.",category:"Communication"},
 {id:"activity.history.view",label:"Consulter l’historique des activités",description:"Consulter l’historique disponible.",category:"Communication"},
 {id:"reports.view",label:"Consulter les rapports et analyses",description:"Accéder aux rapports généraux.",category:"Rapports et analyses"},
 {id:"employees.manage",label:"Gérer les employés",description:"Gérer les opérations administratives liées aux employés.",category:"Administration",sensitive:true},
 {id:"access.manage",label:"Gérer le contrôle des accès",description:"Gérer les paramètres de contrôle des accès.",category:"Administration",sensitive:true},
 {id:"audit.view",label:"Consulter l’audit",description:"Accéder aux informations d’audit disponibles.",category:"Administration",sensitive:true},
 {id:"school.profile.manage",label:"Gérer le profil de l’établissement",description:"Modifier les informations de l’établissement.",category:"Administration"},
 {id:"archive.view",label:"Consulter les archives",description:"Accéder aux archives de l’établissement. Réservé au rôle Directeur.",category:"Archives",sensitive:true},
 {id:"settings.school.manage",label:"Gérer les paramètres de l’établissement",description:"Gérer les paramètres généraux de l’établissement.",category:"Paramètres"},
 {id:"settings.academic.manage",label:"Gérer les paramètres pédagogiques",description:"Gérer la configuration pédagogique.",category:"Paramètres"},
 {id:"settings.system.manage",label:"Gérer les paramètres système",description:"Gérer la configuration technique du système.",category:"Paramètres",sensitive:true},
 {id:"settings.user.manage",label:"Gérer les paramètres utilisateur",description:"Gérer les préférences utilisateur.",category:"Paramètres"}
];
const categoryOrder = ["Vue d’ensemble","Gestion académique","Personnes","Opérations pédagogiques","Vie scolaire","Finances","Logistique","Communication","Rapports et analyses","Administration","Archives","Paramètres"];
const initials = (name:string) => name.split(/\\s+/).slice(0,2).map(part=>part[0]??"").join("").toLocaleUpperCase("fr");
const roleColors:Record<StaffRole,string>={director:"violet",administrative:"blue",pedagogical:"teal",finance:"amber"};
export function RolesPermissionsPage({user}:Props) {
 const canManage = user.permissions.includes("people.roles.manage");
 const [selected,setSelected]=useState<StaffRole>("director");
 const [tab,setTab]=useState<RoleTab>("permissions");
 const [search,setSearch]=useState("");
 const [expanded,setExpanded]=useState<Record<string,boolean>>({"Vue d’ensemble":true,"Gestion académique":true,"Personnes":true});
 const [drafts,setDrafts]=useState<Partial<Record<StaffRole,Permission[]>>>({});
 const [confirm,setConfirm]=useState<PermissionEntry|null>(null);
 const [notice,setNotice]=useState("");
 const [userSearch,setUserSearch]=useState("");
 const [pendingRole,setPendingRole]=useState<StaffRole|null>(null);
 const [showLimits,setShowLimits]=useState(false);
 const currentPermissions = drafts[selected] ?? [...roleDefaultPermissions[selected]];
 const originalPermissions = roleDefaultPermissions[selected] as readonly Permission[];
 const dirty = drafts[selected] !== undefined && !samePermissions(currentPermissions,originalPermissions);
 const selectedUsers = demoAccounts.filter(account=>account.user.role===selected);
 const categories = useMemo(()=>categoryOrder.map(category=>({category,items:permissionCatalog.filter(item=>item.category===category && (selected==="director" || item.id!=="archive.view"))})).filter(group=>group.items.length>0),[selected]);
 const filteredCategories = categories.map(group=>({...group,items:group.items.filter(item=>!search.trim() || (item.label+" "+item.description+" "+group.category+" "+item.id).toLocaleLowerCase("fr").includes(search.trim().toLocaleLowerCase("fr")))})).filter(group=>group.items.length>0);
 const matchingUsers=selectedUsers.filter(({user:staff})=>[staff.displayName,staff.id,getRoleLabel(staff.role)].some(value=>value.toLocaleLowerCase("fr").includes(userSearch.toLocaleLowerCase("fr"))));
 const totalUsers=new Set(demoAccounts.map(account=>account.user.id)).size;
 const roleCount=roles.length;
 function togglePermission(item:PermissionEntry){
  if(!canManage || selected==="director" || item.id==="archive.view")return;
  if(item.sensitive && !currentPermissions.includes(item.id)){setConfirm(item);return;}
  applyPermission(item.id);
 }
 function applyPermission(id:Permission){
  setDrafts(previous=>{const base=previous[selected]??[...roleDefaultPermissions[selected]];const next=base.includes(id)?base.filter(value=>value!==id):[...base,id];return {...previous,[selected]:next};});
  setNotice("");
 }
 function changeRole(next:StaffRole){
  if(next===selected)return;
  if(dirty){setPendingRole(next);return;}
  setSelected(next);setTab("permissions");setSearch("");
 }
 function saveDraft(){
  setNotice("Aucun service backend de gestion des rôles n’est configuré. Les modifications restent une simulation locale et ne changent pas les accès des utilisateurs.");
 }
 function discardDraft(){setDrafts(previous=>({...previous,[selected]:undefined}));setNotice("");}
 function confirmSensitive(){if(confirm){applyPermission(confirm.id);setConfirm(null);}}
 function toggleCategory(groupItems:PermissionEntry[]){
  if(!canManage || selected==="director")return;
  const allowed=groupItems.filter(item=>item.id!=="archive.view" && !item.sensitive);
  const allOn=allowed.length>0 && allowed.every(item=>currentPermissions.includes(item.id));
  setDrafts(previous=>{const base=new Set(previous[selected]??[...roleDefaultPermissions[selected]]);allowed.forEach(item=>allOn?base.delete(item.id):base.add(item.id));return {...previous,[selected]:[...base]};});
  setNotice("");
 }
 const canEditSelected=canManage && selected!=="director";
 return <main className="rp-page">
  <header className="rp-header"><div><div className="rp-breadcrumb">Personnes <span>/</span> <b>Rôles et permissions</b></div><h1>Rôles et permissions</h1><p>Contrôlez les accès des utilisateurs et gérez les autorisations sur la plateforme scolaire.</p></div><button className="rp-primary" type="button" disabled title="La création de rôles personnalisés nécessite un modèle et un service backend."><Plus size={15}/>Créer un rôle</button></header>
  <div className="rp-kpis">
   <article><span className="rp-kpi-icon"><ShieldCheck size={17}/></span><div><small>Nombre total de rôles</small><strong>{roleCount}</strong><em>Rôles prédéfinis</em></div></article>
   <article><span className="rp-kpi-icon"><Check size={17}/></span><div><small>Rôles actifs</small><strong>{roleCount}</strong><em>Selon la configuration de démonstration</em></div></article>
   <article><span className="rp-kpi-icon"><Users size={17}/></span><div><small>Utilisateurs affectés</small><strong>{totalUsers}</strong><em>Comptes de démonstration distincts</em></div></article>
   <article><span className="rp-kpi-icon"><LockKeyhole size={17}/></span><div><small>Rôles personnalisés</small><strong>0</strong><em>Non pris en charge actuellement</em></div></article>
  </div>
  <div className="rp-layout">
   <aside className="rp-role-panel"><div className="rp-panel-heading"><div><h2>Rôles</h2><span>{roles.length} rôles système</span></div><span className="rp-count">{roles.length}</span></div>
    <div className="rp-role-list">{roles.map(role=><button key={role} type="button" className={"rp-role-item "+(selected===role?"selected":"")} onClick={()=>changeRole(role)}>
      <span className={"rp-role-mark "+roleColors[role]}>{initials(getRoleLabel(role)).slice(0,2)}</span><span className="rp-role-copy"><strong>{getRoleLabel(role)}</strong><small>{roleDescriptions[role]}</small><em>{demoAccounts.filter(a=>a.user.role===role).length} utilisateur(s)</em></span><span className="rp-system-tag">Système</span>
     </button>)}</div>
    <div className="rp-protected-note"><LockKeyhole size={14}/><span>Les rôles système sont prédéfinis et ne peuvent pas être supprimés ou convertis.</span></div>
   </aside>
   <section className="rp-detail-panel">
    <div className="rp-role-summary"><div className={"rp-role-mark large "+roleColors[selected]}>{initials(getRoleLabel(selected)).slice(0,2)}</div><div className="rp-summary-copy"><div className="rp-summary-title"><h2>{getRoleLabel(selected)}</h2><span className="rp-system-tag">Rôle système</span><span className="rp-active-tag">Actif</span></div><p>{roleDescriptions[selected]}</p><div className="rp-meta"><span><Users size={13}/>{selectedUsers.length} utilisateur(s) affecté(s)</span><span><LockKeyhole size={13}/>Identité protégée</span></div></div><button type="button" className="rp-secondary" onClick={()=>setShowLimits(true)}><CircleHelp size={14}/>Détails du rôle</button></div>
    <div className="rp-tabs"><button type="button" className={tab==="permissions"?"active":""} onClick={()=>setTab("permissions")}>Permissions <span>{currentPermissions.length}</span></button><button type="button" className={tab==="users"?"active":""} onClick={()=>setTab("users")}>Utilisateurs affectés <span>{selectedUsers.length}</span></button></div>
    {tab==="permissions"?<div className="rp-permissions">
      <div className="rp-permission-toolbar"><label className="rp-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une permission..."/></label><span>{currentPermissions.length} autorisation(s) active(s)</span></div>
      {!canManage&&<div className="rp-info"><LockKeyhole size={15}/>Vous disposez d’un accès en lecture seule à cette configuration.</div>}
      {selected==="director"&&<div className="rp-info protected"><ShieldCheck size={15}/>Le rôle Directeur est protégé. Ses autorisations exclusives ne peuvent pas être modifiées depuis cet écran.</div>}
      {filteredCategories.length===0?<div className="rp-empty"><Search size={22}/><strong>Aucune permission trouvée</strong><span>Essayez un autre terme de recherche.</span></div>:filteredCategories.map(group=>{
       const isOpen=search.trim().length>0 || !!expanded[group.category];
       const enabled=group.items.filter(item=>currentPermissions.includes(item.id)).length;
       return <section className="rp-category" key={group.category}><button className="rp-category-head" type="button" onClick={()=>setExpanded(previous=>({...previous,[group.category]:!previous[group.category]}))}><span className="rp-category-title">{isOpen?<ChevronDown size={16}/>:<ChevronRight size={16}/>}<strong>{group.category}</strong><small>{enabled}/{group.items.length} autorisations</small></span>{canEditSelected&&<span className="rp-category-actions" onClick={e=>e.stopPropagation()}><button type="button" onClick={()=>toggleCategory(group.items)}>Tout sélectionner / désélectionner</button></span>}</button>
        {isOpen&&<div className="rp-permission-rows">{group.items.map(item=>{const checked=currentPermissions.includes(item.id);const protectedItem=item.id==="archive.view"||selected==="director";return <div className="rp-permission-row" key={item.id}><div className="rp-permission-name"><strong>{item.label}</strong><small>{item.description}</small><code>{item.id}</code></div><div className="rp-permission-control">{item.sensitive&&<span className="rp-sensitive">Sensible</span>}{protectedItem?<span className="rp-protected-label"><LockKeyhole size={12}/>{item.id==="archive.view"?"Directeur uniquement":"Protégée"}</span>:<button type="button" role="switch" aria-checked={checked} aria-label={item.label} disabled={!canEditSelected} className={"rp-switch "+(checked?"on":"")} onClick={()=>togglePermission(item)}><i/></button>}</div></div>})}</div>}
       </section>
      })}
      {dirty&&<div className="rp-unsaved"><div><AlertCircle size={16}/><span><strong>Modifications non enregistrées</strong><small>Simulation locale uniquement : aucun droit réel n’est modifié.</small></span></div><div><button type="button" className="rp-secondary" onClick={discardDraft}>Annuler</button><button type="button" className="rp-primary" onClick={saveDraft}>Enregistrer les modifications</button></div></div>}
      {notice&&<div className="rp-info"><AlertCircle size={15}/>{notice}</div>}
     </div>:<div className="rp-users"><div className="rp-users-toolbar"><div><h3>Utilisateurs affectés</h3><p>Comptes existants associés à ce rôle dans la configuration de démonstration.</p></div><button type="button" className="rp-secondary" disabled title="L’affectation nécessite un service backend."><Plus size={14}/>Affecter un utilisateur</button></div><label className="rp-search user-search"><Search size={15}/><input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Rechercher un utilisateur..."/></label><div className="rp-user-table-wrap"><table className="rp-user-table"><thead><tr><th>Utilisateur</th><th>Matricule</th><th>Département</th><th>Rôle attribué</th><th>Statut du compte</th></tr></thead><tbody>{matchingUsers.map(({user:staff})=><tr key={staff.id}><td><div className="rp-user"><span>{staff.initials}</span><strong>{staff.displayName}</strong></div></td><td>{staff.id}</td><td>—</td><td>{getRoleLabel(staff.role)}</td><td><span className="rp-account-state">Actif · Démo</span></td></tr>)}</tbody></table>{matchingUsers.length===0&&<div className="rp-empty compact">Aucun utilisateur affecté à ce rôle.</div>}</div></div>}
   </section>
  </div>
  {confirm&&<div className="rp-overlay" role="presentation"><div className="rp-dialog" role="dialog" aria-modal="true" aria-labelledby="rp-confirm-title"><div className="rp-dialog-icon"><AlertCircle size={20}/></div><h3 id="rp-confirm-title">Autorisation sensible</h3><p>Vous êtes sur le point d’ajouter « {confirm.label} » au rôle « {getRoleLabel(selected)} ». Cette autorisation peut élargir les accès de tous les utilisateurs affectés.</p><div className="rp-dialog-actions"><button type="button" className="rp-secondary" onClick={()=>setConfirm(null)}>Annuler</button><button type="button" className="rp-primary" onClick={confirmSensitive}>Confirmer la modification</button></div></div></div>}
  {pendingRole&&<div className="rp-overlay"><div className="rp-dialog" role="dialog" aria-modal="true"><h3>Modifications en attente</h3><p>Vous avez des changements non enregistrés pour ce rôle. Que souhaitez-vous faire avant de continuer ?</p><div className="rp-dialog-actions stacked"><button type="button" className="rp-secondary" onClick={()=>setPendingRole(null)}>Continuer les modifications</button><button type="button" className="rp-secondary" onClick={()=>{discardDraft();setSelected(pendingRole);setPendingRole(null);setTab("permissions");setSearch("");}}>Abandonner et changer de rôle</button></div></div></div>}
  {showLimits&&<div className="rp-overlay"><div className="rp-dialog" role="dialog" aria-modal="true"><h3>Informations sur le rôle</h3><p>Cette page lit les quatre rôles et les autorisations définis dans la configuration actuelle du projet. La création de rôles personnalisés, l’affectation des utilisateurs, l’enregistrement serveur et l’historique d’audit nécessitent encore une API et un modèle de données dédiés.</p><div className="rp-dialog-actions"><button type="button" className="rp-primary" onClick={()=>setShowLimits(false)}>Fermer</button></div></div></div>}
 </main>;
}
function samePermissions(a:Permission[],b:readonly Permission[]){return a.length===b.length && a.every(value=>b.includes(value));}
