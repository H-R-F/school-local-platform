import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle, BookOpen, Check, ChevronDown, CircleHelp,
  Eye, Filter, GraduationCap, Layers3, MoreHorizontal, Pencil, Plus, Search,
  ShieldCheck, ToggleRight, X,
} from "lucide-react";
import {
  sectorsProgramsRepository,
  type EducationalCycle, type EducationalProgram, type EntityStatus,
  type ProgramInput, type Sector, type SectorInput, type SectorProgramData,
} from "../../services/sectors-programs";
import type { AuthenticatedSidebarUser } from "../../types/navigation";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route:string)=>void; }
type CycleFilter = "Tous les cycles" | EducationalCycle;
type StatusFilter = "Tous les statuts" | EntityStatus;
type ModalState = {type:"sector-create"}|{type:"sector-edit";sector:Sector}|{type:"program-create";sectorId:string}|{type:"program-edit";program:EducationalProgram}|{type:"sector-details";sector:Sector}|{type:"program-details";program:EducationalProgram}|null;
type PendingChange = {entity:"sector"|"program";id:string;name:string;next:EntityStatus}|null;
const cycles:EducationalCycle[]=["Enseignement primaire","Enseignement secondaire collégial","Enseignement secondaire qualifiant"];
const statuses:EntityStatus[]=["Actif","Inactif"];
function StatusPill({status}:{status:EntityStatus}) {
  return <span className={`sp-status ${status==="Actif"?"sp-status--active":"sp-status--inactive"}`}><i/>{status}</span>;
}
function SectorForm({initial,saving,error,onCancel,onSubmit}:{initial?:Sector;saving:boolean;error:string;onCancel:()=>void;onSubmit:(value:SectorInput)=>void}) {
  const [name,setName]=useState(initial?.name??"");
  const [code,setCode]=useState(initial?.code??"");
  const [description,setDescription]=useState(initial?.description??"");
  const [cycle]=useState<EducationalCycle>(initial?.cycle??"Enseignement secondaire qualifiant");
  const [status,setStatus]=useState<EntityStatus>(initial?.status??"Actif");
  const [validation,setValidation]=useState("");
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!name.trim()||!code.trim()||!description.trim()){setValidation("Veuillez renseigner tous les champs obligatoires.");return;}if(cycle!=="Enseignement secondaire qualifiant"){setValidation("Les filières spécialisées sont réservées au secondaire qualifiant.");return;}setValidation("");onSubmit({name,code,description,cycle,status});}
  return <form className="sp-form" onSubmit={submit}>
    <div className="sp-form-note"><GraduationCap size={17}/><span>Les filières spécialisées sont configurées au niveau du secondaire qualifiant. Les cycles primaire et collégial conservent leurs niveaux standards.</span></div>
    <label>Nom de la filière <em>*</em><input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. : Sciences Expérimentales" maxLength={100}/></label>
    <label>Code <em>*</em><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Ex. : SC-EXP" maxLength={20}/></label>
    <label>Description <em>*</em><textarea rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Présentez brièvement ce parcours éducatif…"/></label>
    <label>Cycle éducatif <em>*</em><select value={cycle} disabled><option value="Enseignement secondaire qualifiant">Enseignement secondaire qualifiant</option></select></label>
    <label>Statut<select value={status} onChange={e=>setStatus(e.target.value as EntityStatus)}>{statuses.map(item=><option key={item}>{item}</option>)}</select></label>
    {(validation||error)&&<div className="sp-form-error"><AlertCircle size={15}/>{validation||error}</div>}
    <div className="sp-modal-actions"><button type="button" className="sp-button sp-button--secondary" onClick={onCancel} disabled={saving}>Annuler</button><button type="submit" className="sp-button sp-button--primary" disabled={saving}>{saving?"Enregistrement…":initial?"Enregistrer les modifications":"Créer la filière"}</button></div>
  </form>;
}

function ProgramForm({initial,sectorId,sectors,levels,saving,error,onCancel,onSubmit}:{initial?:EducationalProgram;sectorId:string;sectors:Sector[];levels:SectorProgramData["levels"];saving:boolean;error:string;onCancel:()=>void;onSubmit:(value:ProgramInput)=>void}) {
  const initialSector=sectors.find(s=>s.id===(initial?.sectorId??sectorId));
  const [name,setName]=useState(initial?.name??"");
  const [code,setCode]=useState(initial?.code??"");
  const [description,setDescription]=useState(initial?.description??"");
  const [selectedSector,setSelectedSector]=useState(initial?.sectorId??sectorId);
  const compatibleLevels=levels.filter(level=>level.cycle===sectors.find(s=>s.id===selectedSector)?.cycle);
  const [levelId,setLevelId]=useState(initial?.levelId??compatibleLevels[0]?.id??"");
  const [status,setStatus]=useState<EntityStatus>(initial?.status??"Actif");
  const [validation,setValidation]=useState("");
  useEffect(()=>{if(!compatibleLevels.some(level=>level.id===levelId))setLevelId(compatibleLevels[0]?.id??"");},[selectedSector,levelId,compatibleLevels]);
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!name.trim()||!code.trim()||!description.trim()||!selectedSector||!levelId){setValidation("Veuillez renseigner tous les champs obligatoires.");return;}setValidation("");onSubmit({name,code,description,sectorId:selectedSector,levelId,status});}
  return <form className="sp-form" onSubmit={submit}>
    <label>Nom du programme <em>*</em><input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. : Sciences Expérimentales — Première Bac"/></label>
    <label>Code <em>*</em><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Ex. : SE-1BAC" maxLength={24}/></label>
    <label>Description <em>*</em><textarea rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description courte du programme…"/></label>
    <label>Filière associée <em>*</em><select value={selectedSector} onChange={e=>setSelectedSector(e.target.value)}>{sectors.filter(s=>s.status==="Actif").map(s=><option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></label>
    <label>Niveau scolaire associé <em>*</em><select value={levelId} onChange={e=>setLevelId(e.target.value)}>{compatibleLevels.map(level=><option key={level.id} value={level.id}>{level.name}</option>)}</select><small className="sp-field-hint">Les niveaux proposés correspondent au cycle éducatif de la filière sélectionnée.</small></label>
    <label>Statut<select value={status} onChange={e=>setStatus(e.target.value as EntityStatus)}>{statuses.map(item=><option key={item}>{item}</option>)}</select></label>
    {(validation||error)&&<div className="sp-form-error"><AlertCircle size={15}/>{validation||error}</div>}
    <div className="sp-modal-actions"><button type="button" className="sp-button sp-button--secondary" onClick={onCancel} disabled={saving}>Annuler</button><button type="submit" className="sp-button sp-button--primary" disabled={saving||!initialSector}>{saving?"Enregistrement…":initial?"Enregistrer les modifications":"Ajouter le programme"}</button></div>
  </form>;
}

function DetailPanel({title,code,description,status,cycle,level,onClose,onEdit}:{title:string;code:string;description:string;status:EntityStatus;cycle?:EducationalCycle;level?:string;onClose:()=>void;onEdit?:()=>void}) {
  return <div className="sp-detail-view"><div className="sp-detail-top"><span className="sp-detail-symbol"><BookOpen size={20}/></span><div><small>FICHE DE RÉFÉRENCE</small><h3>{title}</h3><div className="sp-detail-tags"><span className="sp-code">{code}</span><StatusPill status={status}/></div></div></div><p className="sp-detail-description">{description}</p><div className="sp-detail-meta">{cycle&&<div><span>Cycle éducatif</span><strong>{cycle}</strong></div>}{level&&<div><span>Niveau associé</span><strong>{level}</strong></div>}</div><div className="sp-modal-actions"><button type="button" className="sp-button sp-button--secondary" onClick={onClose}>Fermer</button>{onEdit&&<button type="button" className="sp-button sp-button--primary" onClick={onEdit}><Pencil size={14}/> Modifier</button>}</div></div>;
}

export function SectorsProgramsPage({user,onNavigate}:Props) {
  const canRead=user.permissions.includes("academic.structure.view");
  const canCreate=user.permissions.includes("academic.structure.manage");
  const canUpdate=user.permissions.includes("academic.structure.manage");
  const [data,setData]=useState<SectorProgramData>({sectors:[],programs:[],levels:[]});
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState("");
  const [search,setSearch]=useState("");
  const [cycleFilter,setCycleFilter]=useState<CycleFilter>("Tous les cycles");
  const [statusFilter,setStatusFilter]=useState<StatusFilter>("Tous les statuts");
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [modal,setModal]=useState<ModalState>(null);
  const [pending,setPending]=useState<PendingChange>(null);
  const [saving,setSaving]=useState(false);
  const [formError,setFormError]=useState("");
  const [actionError,setActionError]=useState("");
  const [openMenu,setOpenMenu]=useState<string|null>(null);
  const [notice,setNotice]=useState("");

  async function load(){setLoading(true);setLoadError("");try{const result=await sectorsProgramsRepository.list();setData(result);setSelectedId(current=>current&&result.sectors.some(s=>s.id===current)?current:result.sectors.find(s=>s.code==="SC-EXP")?.id??result.sectors[0]?.id??null);}catch(error){setLoadError(error instanceof Error?error.message:"Le chargement des filières a échoué.");}finally{setLoading(false);}}
  useEffect(()=>{if(canRead)void load();else setLoading(false);},[canRead]);

  const programsBySector=useMemo(()=>{const map=new Map<string,EducationalProgram[]>();data.sectors.forEach(s=>map.set(s.id,data.programs.filter(p=>p.sectorId===s.id)));return map;},[data]);
  const filteredSectors=useMemo(()=>{
    const query=search.trim().toLocaleLowerCase("fr-FR");
    return data.sectors.filter(sector=>{
      const programs=programsBySector.get(sector.id)??[];
      const matchesSearch=!query||sector.name.toLocaleLowerCase("fr-FR").includes(query)||sector.code.toLocaleLowerCase("fr-FR").includes(query)||programs.some(p=>p.name.toLocaleLowerCase("fr-FR").includes(query)||p.code.toLocaleLowerCase("fr-FR").includes(query));
      return matchesSearch&&(cycleFilter==="Tous les cycles"||sector.cycle===cycleFilter)&&(statusFilter==="Tous les statuts"||sector.status===statusFilter||programs.some(p=>p.status===statusFilter));
    });
  },[data,programsBySector,search,cycleFilter,statusFilter]);
  const selectedSector=data.sectors.find(s=>s.id===selectedId)??null;
  const visiblePrograms=selectedSector?(programsBySector.get(selectedSector.id)??[]).filter(p=>{
    const query=search.trim().toLocaleLowerCase("fr-FR");
    const matchesSearch=!query||p.name.toLocaleLowerCase("fr-FR").includes(query)||p.code.toLocaleLowerCase("fr-FR").includes(query)||selectedSector.name.toLocaleLowerCase("fr-FR").includes(query)||selectedSector.code.toLocaleLowerCase("fr-FR").includes(query);
    return matchesSearch&&(statusFilter==="Tous les statuts"||p.status===statusFilter);
  }):[];

  useEffect(()=>{if(selectedId&&!filteredSectors.some(s=>s.id===selectedId))setSelectedId(filteredSectors[0]?.id??null);},[filteredSectors,selectedId]);

  async function mutate(operation:()=>Promise<SectorProgramData>,message:string){setSaving(true);setFormError("");try{const next=await operation();setData(next);setNotice(message);setModal(null);setPending(null);setActionError("");}catch(error){const message=error instanceof Error?error.message:"L’opération a échoué.";if(pending)setActionError(message);else setFormError(message);}finally{setSaving(false);}}
  function saveSector(value:SectorInput){if(!canUpdate)return;const editing=modal?.type==="sector-edit"?modal.sector:undefined;void mutate(()=>editing?sectorsProgramsRepository.updateSector(editing.id,value):sectorsProgramsRepository.createSector(value),editing?"La filière a été mise à jour.":"La filière a été créée.");}
  function saveProgram(value:ProgramInput){if(!canUpdate)return;const editing=modal?.type==="program-edit"?modal.program:undefined;void mutate(()=>editing?sectorsProgramsRepository.updateProgram(editing.id,value):sectorsProgramsRepository.createProgram(value),editing?"Le programme a été mis à jour.":"Le programme a été ajouté.");}
  function confirmStatus(){const change=pending;if(!change||!canUpdate)return;void mutate(()=>change.entity==="sector"?sectorsProgramsRepository.setSectorStatus(change.id,change.next):sectorsProgramsRepository.setProgramStatus(change.id,change.next),change.next==="Actif"?"Le statut a été activé.":"Le statut a été désactivé.");}

  if(!canRead)return <main className="sp-page sp-page--redesign"><div className="sp-access-denied"><ShieldCheck size={26}/><h1>Accès non autorisé</h1><p>Votre compte ne dispose pas de l’autorisation nécessaire pour consulter les filières et programmes.</p><button className="sp-button sp-button--secondary" onClick={()=>onNavigate("/overview")}>Retour au tableau de bord</button></div></main>;

  const emptySearch=search.trim().length>0&&filteredSectors.length===0;
  return <main className="sp-page sp-page--redesign">
    <header className="sp-header"><div><div className="sp-breadcrumb"><span>Gestion académique</span><i>/</i><strong>Structure pédagogique</strong></div><h1>Filières et programmes</h1><p>Consultez les filières de l’établissement et leurs programmes associés.</p></div>{canCreate&&<button className="sp-button sp-button--primary" onClick={()=>{setFormError("");setModal({type:"sector-create"});}}><Plus size={16}/> Nouvelle filière</button>}</header>
    {notice&&<div className="sp-notice"><Check size={15}/><span>{notice}</span><button onClick={()=>setNotice("")} aria-label="Fermer"><X size={14}/></button></div>}
    {loadError&&<div className="sp-error-banner"><AlertCircle size={15}/><span>{loadError}</span><button onClick={()=>void load()}>Réessayer</button></div>}
    <section className="sp-workspace">
      <aside className="sp-sector-column">
        <div className="sp-sector-heading"><div><h2>Filières <b>{filteredSectors.length}</b></h2></div>{canCreate&&<button className="sp-add-icon" aria-label="Créer une filière" title="Créer une filière" onClick={()=>{setFormError("");setModal({type:"sector-create"});}}><Plus size={16}/></button>}</div>
        <div className="sp-filters">
          <label className="sp-search"><Search size={15}/><input aria-label="Rechercher une filière ou un programme" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…"/>{search&&<button onClick={()=>setSearch("")} aria-label="Effacer"><X size={13}/></button>}</label>
          <label className="sp-filter-select"><Filter size={13}/><select aria-label="Filtrer par cycle" value={cycleFilter} onChange={e=>setCycleFilter(e.target.value as CycleFilter)}><option>Tous les cycles</option>{cycles.map(c=><option key={c}>{c}</option>)}</select><ChevronDown size={13}/></label>
          <label className="sp-filter-select"><span className="sp-filter-dot"/><select aria-label="Filtrer par statut" value={statusFilter} onChange={e=>setStatusFilter(e.target.value as StatusFilter)}><option>Tous les statuts</option>{statuses.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={13}/></label>
        </div>
        <div className="sp-sector-list">
          {loading?<div className="sp-list-loading"><span className="sp-spinner"/>Chargement des filières…</div>:emptySearch?<div className="sp-list-empty"><Search size={20}/><strong>Aucune filière ou aucun programme trouvé.</strong><button onClick={()=>{setSearch("");setCycleFilter("Tous les cycles");setStatusFilter("Tous les statuts");}}>Réinitialiser la recherche</button></div>:filteredSectors.length===0?<div className="sp-list-empty"><CircleHelp size={20}/><strong>Aucune filière pour ces filtres.</strong><button onClick={()=>{setCycleFilter("Tous les cycles");setStatusFilter("Tous les statuts");}}>Effacer les filtres</button></div>:filteredSectors.map(sector=>{const count=(programsBySector.get(sector.id)??[]).length;return <article key={sector.id} className={`sp-sector-card ${selectedId===sector.id?"sp-sector-card--selected":""}`}><button className="sp-sector-select" onClick={()=>setSelectedId(sector.id)} aria-pressed={selectedId===sector.id}><span className="sp-sector-mark"><GraduationCap size={17}/></span><span className="sp-sector-copy"><strong>{sector.name}</strong><span><code>{sector.code}</code></span><span className="sp-sector-foot"><b>{count} programme{count!==1?"s":""}</b><StatusPill status={sector.status}/></span></span></button><div className="sp-sector-menu-wrap"><button className="sp-menu-trigger" aria-label={`Actions pour ${sector.name}`} aria-expanded={openMenu===sector.id} onClick={()=>setOpenMenu(v=>v===sector.id?null:sector.id)}><MoreHorizontal size={16}/></button>{openMenu===sector.id&&<><button className="sp-menu-dismiss" aria-label="Fermer le menu" onClick={()=>setOpenMenu(null)}/><div className="sp-action-menu"><button onClick={()=>{setModal({type:"sector-details",sector});setOpenMenu(null);}}><Eye size={14}/> Voir les détails</button>{canUpdate&&<button onClick={()=>{setModal({type:"sector-edit",sector});setFormError("");setOpenMenu(null);}}><Pencil size={14}/> Modifier</button>}{canUpdate&&<button onClick={()=>{setPending({entity:"sector",id:sector.id,name:sector.name,next:sector.status==="Actif"?"Inactif":"Actif"});setActionError("");setOpenMenu(null);}}><ToggleRight size={14}/> {sector.status==="Actif"?"Désactiver":"Activer"}</button>}</div></>}</div></article>;})}
        </div>
      </aside>
      <section className="sp-program-column">
        {!selectedSector?<div className="sp-no-selection"><span><Layers3 size={23}/></span><h2>Sélectionnez une filière</h2><p>Choisissez une filière dans la liste pour consulter les programmes qui lui sont associés.</p></div>:<>
          <div className="sp-program-header"><div className="sp-program-title"><span className="sp-program-symbol"><GraduationCap size={19}/></span><div><div className="sp-program-kicker">FILIÈRE <span className="sp-code">{selectedSector.code}</span></div><h2>{selectedSector.name}</h2><div className="sp-program-meta"><StatusPill status={selectedSector.status}/><span>{(programsBySector.get(selectedSector.id)??[]).length} programmes</span></div></div></div><div className="sp-program-actions"><button className="sp-clear-selection" onClick={()=>setSelectedId(null)} aria-label="Désélectionner la filière" title="Désélectionner"><X size={15}/></button>{canCreate&&<button className="sp-button sp-button--primary" disabled={selectedSector.status!=="Actif"} onClick={()=>{setFormError("");setModal({type:"program-create",sectorId:selectedSector.id});}}><Plus size={14}/> Ajouter</button>}</div></div>
          <div className="sp-program-content"><div className="sp-program-content-heading"><div><h3>Programmes <b>{visiblePrograms.length}</b></h3></div></div>
            {loading?<div className="sp-program-loading"><span className="sp-spinner"/>Chargement des programmes…</div>:visiblePrograms.length===0?<div className="sp-program-empty"><span><BookOpen size={21}/></span><h3>{(programsBySector.get(selectedSector.id)??[]).length===0?"Aucun programme n'a encore été ajouté à cette filière.":"Aucun programme ne correspond aux critères de recherche."}</h3><p>Les programmes associés à cette filière apparaîtront ici.</p>{canCreate&&selectedSector.status==="Actif"&&<button className="sp-button sp-button--secondary" onClick={()=>setModal({type:"program-create",sectorId:selectedSector.id})}><Plus size={14}/> Ajouter un programme</button>}</div>:<div className="sp-program-table-wrap"><table className="sp-program-table"><thead><tr><th>Programme</th><th>Niveau</th><th>Classes</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{visiblePrograms.map(program=>{const level=data.levels.find(l=>l.id===program.levelId);return <tr key={program.id}><td><div className="sp-program-name"><span><BookOpen size={14}/></span><span><strong>{program.name}</strong><small>{program.code}</small></span></div></td><td><span className="sp-level-chip">{level?.name??"—"}</span></td><td><strong className="sp-class-count">{program.classCount}</strong></td><td><StatusPill status={program.status}/></td><td><div className="sp-row-actions"><button className="sp-icon-action" aria-label={`Détails de ${program.name}`} onClick={()=>setModal({type:"program-details",program})}><Eye size={14}/></button><div className="sp-sector-menu-wrap"><button className="sp-icon-action" aria-label={`Actions de ${program.name}`} aria-expanded={openMenu===program.id} onClick={()=>setOpenMenu(v=>v===program.id?null:program.id)}><MoreHorizontal size={15}/></button>{openMenu===program.id&&<><button className="sp-menu-dismiss" aria-label="Fermer le menu" onClick={()=>setOpenMenu(null)}/><div className="sp-action-menu"><button onClick={()=>{setModal({type:"program-details",program});setOpenMenu(null);}}><Eye size={14}/> Voir les détails</button>{canUpdate&&<button onClick={()=>{setModal({type:"program-edit",program});setFormError("");setOpenMenu(null);}}><Pencil size={14}/> Modifier</button>}{canUpdate&&<button onClick={()=>{setPending({entity:"program",id:program.id,name:program.name,next:program.status==="Actif"?"Inactif":"Actif"});setActionError("");setOpenMenu(null);}}><ToggleRight size={14}/> {program.status==="Actif"?"Désactiver":"Activer"}</button>}</div></>}</div></div></td></tr>;})}</tbody></table></div>}
          </div>
        </>}
      </section>
    </section>
    <footer className="sp-page-footer"><span><ShieldCheck size={14}/> Données de démonstration · Enregistrées dans ce navigateur.</span></footer>
    {modal&&<div className={`sp-overlay ${(modal.type.endsWith("create")||modal.type.endsWith("edit"))?"sp-drawer-overlay":""}`} onMouseDown={e=>{if(e.target===e.currentTarget&&!saving){setModal(null);setFormError("");}}}><section className={`sp-modal ${(modal.type.endsWith("create")||modal.type.endsWith("edit"))?"sp-drawer":""}`} role="dialog" aria-modal="true" aria-labelledby="sp-modal-title"><button className="sp-modal-close" onClick={()=>setModal(null)} disabled={saving} aria-label="Fermer"><X size={17}/></button><div className="sp-modal-heading"><span>{modal.type.includes("sector")?"FILIÈRE ÉDUCATIVE":"PROGRAMME SCOLAIRE"}</span><h2 id="sp-modal-title">{modal.type==="sector-create"?"Créer une filière":modal.type==="sector-edit"?"Modifier la filière":modal.type==="program-create"?"Ajouter un programme":modal.type==="program-edit"?"Modifier le programme":modal.type==="sector-details"?"Détails de la filière":"Détails du programme"}</h2></div>
      {modal.type==="sector-details"?<DetailPanel title={modal.sector.name} code={modal.sector.code} description={modal.sector.description} status={modal.sector.status} cycle={modal.sector.cycle} onClose={()=>setModal(null)} onEdit={canUpdate?()=>setModal({type:"sector-edit",sector:modal.sector}):undefined}/>:modal.type==="program-details"?<DetailPanel title={modal.program.name} code={modal.program.code} description={modal.program.description} status={modal.program.status} level={data.levels.find(l=>l.id===modal.program.levelId)?.name} onClose={()=>setModal(null)} onEdit={canUpdate?()=>setModal({type:"program-edit",program:modal.program}):undefined}/>:modal.type.startsWith("sector-")?<SectorForm key={modal.type==="sector-edit"?modal.sector.id:"new-sector"} initial={modal.type==="sector-edit"?modal.sector:undefined} saving={saving} error={formError} onCancel={()=>setModal(null)} onSubmit={saveSector}/>:<ProgramForm key={modal.type==="program-edit"?modal.program.id:`new-program-${modal.type==="program-create"?modal.sectorId:""}`} initial={modal.type==="program-edit"?modal.program:undefined} sectorId={modal.type==="program-create"?modal.sectorId:""} sectors={data.sectors} levels={data.levels} saving={saving} error={formError} onCancel={()=>setModal(null)} onSubmit={saveProgram}/>}</section></div>}
    {pending&&<div className="sp-overlay" onMouseDown={e=>{if(e.target===e.currentTarget&&!saving)setPending(null);}}><section className="sp-modal sp-confirm" role="dialog" aria-modal="true" aria-labelledby="sp-confirm-title"><button className="sp-modal-close" onClick={()=>setPending(null)} disabled={saving} aria-label="Fermer"><X size={17}/></button><span className="sp-confirm-icon"><ToggleRight size={20}/></span><h2 id="sp-confirm-title">{pending.next==="Actif"?"Activer cet élément ?":"Désactiver cet élément ?"}</h2><p>Confirmez le changement de statut de <strong>{pending.name}</strong>. {pending.next==="Inactif"?"Les associations existantes doivent rester cohérentes. Si des programmes ou classes actifs y sont liés, l'opération sera refusée.":"L'élément redeviendra disponible dans la structure pédagogique."}</p>{actionError&&<div className="sp-form-error"><AlertCircle size={15}/>{actionError}</div>}<div className="sp-modal-actions"><button className="sp-button sp-button--secondary" onClick={()=>setPending(null)} disabled={saving}>Annuler</button><button className="sp-button sp-button--primary" onClick={confirmStatus} disabled={saving}>{saving?"Traitement…":"Confirmer"}</button></div></section></div>}
  </main>;
}
