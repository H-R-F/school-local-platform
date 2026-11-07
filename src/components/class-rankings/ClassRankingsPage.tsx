import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Award, ChevronDown, ChevronRight, FilterX, Info, Search, ShieldAlert, TrendingUp, Users, X } from "lucide-react";
import { academicYearRepository } from "../../services/academic-years";
import { classesGroupsRepository } from "../../services/classes-groups";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./ClassRankingsPage.css";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void }
type RankingRow = { id: string; name: string; reference: string; average: number; rank: number; previousRank?: number; mention: string; className: string; subjects: { name: string; average: number }[] };

const previewRows: RankingRow[] = [
  { id: "demo-1", name: "Yasmine El Amrani", reference: "APERÇU-001", average: 18.42, rank: 1, previousRank: 2, mention: "Très bien", className: "", subjects: [{name:"Mathématiques",average:19},{name:"Français",average:17.5},{name:"Sciences",average:18.75}] },
  { id: "demo-2", name: "Adam Benali", reference: "APERÇU-002", average: 17.86, rank: 2, previousRank: 1, mention: "Très bien", className: "", subjects: [{name:"Mathématiques",average:18.5},{name:"Français",average:17},{name:"Sciences",average:18.25}] },
  { id: "demo-3", name: "Omar Berrada", reference: "APERÇU-003", average: 16.94, rank: 3, previousRank: 4, mention: "Bien", className: "", subjects: [{name:"Mathématiques",average:17.5},{name:"Français",average:16},{name:"Sciences",average:17.25}] },
  { id: "demo-4", name: "Nour Idrissi", reference: "APERÇU-004", average: 16.2, rank: 4, previousRank: 3, mention: "Bien", className: "", subjects: [{name:"Mathématiques",average:16.5},{name:"Français",average:16.25},{name:"Sciences",average:16.75}] },
  { id: "demo-5", name: "Mehdi Tazi", reference: "APERÇU-005", average: 15.48, rank: 5, mention: "Assez bien", className: "", subjects: [{name:"Mathématiques",average:16},{name:"Français",average:14.75},{name:"Sciences",average:15.75}] },
  { id: "demo-6", name: "Salma Alaoui", reference: "APERÇU-006", average: 14.75, rank: 6, mention: "Assez bien", className: "", subjects: [{name:"Mathématiques",average:15},{name:"Français",average:14.5},{name:"Sciences",average:14.75}] },
  { id: "demo-7", name: "Anas Chraibi", reference: "APERÇU-007", average: 13.9, rank: 7, mention: "Assez bien", className: "", subjects: [{name:"Mathématiques",average:14.25},{name:"Français",average:13.5},{name:"Sciences",average:14}] },
  { id: "demo-8", name: "Aya Mansouri", reference: "APERÇU-008", average: 12.65, rank: 8, mention: "Passable", className: "", subjects: [{name:"Mathématiques",average:13},{name:"Français",average:12.5},{name:"Sciences",average:12.75}] },
];
const number = (value: number) => value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateLabel = (value: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(value));

export function ClassRankingsPage({ user }: Props) {
  const canRead = user.permissions.includes("student.analytics.view");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [years, setYears] = useState<Awaited<ReturnType<typeof academicYearRepository.list>>>([]);
  const [academic, setAcademic] = useState<Awaited<ReturnType<typeof classesGroupsRepository.list>> | null>(null);
  const [yearId, setYearId] = useState("");
  const [programId, setProgramId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [classId, setClassId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<RankingRow | null>(null);

  useEffect(() => {
    if (!canRead) { setLoading(false); return; }
    let active = true;
    Promise.all([academicYearRepository.list(), classesGroupsRepository.list()])
      .then(([yearRows, classRows]) => {
        if (!active) return;
        setYears(yearRows);
        setAcademic(classRows);
        const activeYear = yearRows.find(row => row.status === "Active");
        setYearId(activeYear?.id ?? "");
      })
      .catch(error => { if (active) setLoadError(error instanceof Error ? error.message : "Impossible de charger les référentiels académiques."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canRead]);

  const classes = useMemo(() => (academic?.classes ?? []).filter(row =>
    (!yearId || row.academicYearId === yearId) &&
    (!programId || row.programId === programId) &&
    (!levelId || row.levelId === levelId)
  ), [academic, yearId, programId, levelId]);
  const programs = useMemo(() => {
    const ids = new Set((academic?.classes ?? []).filter(row => !yearId || row.academicYearId === yearId).map(row => row.programId));
    return (academic?.structure.programs ?? []).filter(row => ids.has(row.id));
  }, [academic, yearId]);
  const levels = useMemo(() => {
    const ids = new Set((academic?.classes ?? []).filter(row => (!yearId || row.academicYearId === yearId) && (!programId || row.programId === programId)).map(row => row.levelId));
    return (academic?.levels ?? []).filter(row => ids.has(row.id));
  }, [academic, yearId, programId]);
  const selectedClass = classes.find(row => row.id === classId) ?? null;
  const groups = selectedClass?.groups ?? [];
  const scopedRows = useMemo(() => previewRows.map(row => ({ ...row, className: selectedClass?.name ?? "Classe de démonstration" })), [selectedClass]);
  const filtered = useMemo(() => scopedRows.filter(row => {
    const q = search.trim().toLocaleLowerCase("fr-FR");
    return (!q || row.name.toLocaleLowerCase("fr-FR").includes(q) || row.reference.toLocaleLowerCase("fr-FR").includes(q));
  }), [scopedRows, search]);
  const average = scopedRows.length ? scopedRows.reduce((sum, row) => sum + row.average, 0) / scopedRows.length : 0;
  const best = scopedRows.length ? Math.max(...scopedRows.map(row => row.average)) : 0;
  const lowest = scopedRows.length ? Math.min(...scopedRows.map(row => row.average)) : 0;
  const yearName = years.find(row => row.id === yearId)?.name ?? "Année scolaire non sélectionnée";
  const clearFilters = () => { setYearId(""); setProgramId(""); setLevelId(""); setClassId(""); setGroupId(""); setSearch(""); };

  if (!canRead) return <main className="cr-page"><section className="cr-access"><ShieldAlert size={24}/><h1>Accès non autorisé</h1><p>Votre rôle ne dispose pas de l’autorisation nécessaire pour consulter les classements académiques.</p></section></main>;

  return <main className="cr-page">
    <header className="cr-header">
      <div className="cr-breadcrumb"><span>Résultats scolaires</span><ChevronRight size={13}/><strong>Classements</strong></div>
      <div className="cr-heading-row">
        <div><h1>Classements des élèves</h1><p>Consultez les classements académiques par classe et période.</p></div>
        <div className="cr-header-meta"><span className="cr-status"><i/>Non disponible</span><span className="cr-year-chip">{yearName}</span></div>
      </div>
    </header>

    <section className="cr-notice" role="note">
      <span className="cr-notice-icon"><AlertCircle size={18}/></span>
      <div><strong>Classement de démonstration — non officiel</strong><p>Le projet ne dispose pas encore d’un modèle de résultats consolidés, d’un service de calcul des moyennes ni d’une règle de départage. Les notes et rangs affichés ci-dessous sont fictifs et servent uniquement à illustrer l’interface. Aucun classement officiel ne peut être calculé ou publié.</p></div>
    </section>

    {loadError && <div className="cr-error" role="alert"><AlertCircle size={15}/>{loadError}</div>}

    <section className="cr-filter-panel">
      <div className="cr-filter-head"><div><strong>Paramètres du classement</strong><span>Référentiels académiques existants</span></div><button type="button" onClick={clearFilters} disabled={!yearId&&!programId&&!levelId&&!classId&&!groupId&&!search}><FilterX size={14}/>Réinitialiser</button></div>
      <div className="cr-filters">
        <label><span>Année scolaire</span><select value={yearId} onChange={e=>{setYearId(e.target.value);setProgramId("");setLevelId("");setClassId("");setGroupId("");}}><option value="">Toutes les années</option>{years.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Programme / Filière</span><select value={programId} onChange={e=>{setProgramId(e.target.value);setLevelId("");setClassId("");setGroupId("");}}><option value="">Tous les programmes</option>{programs.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Niveau</span><select value={levelId} onChange={e=>{setLevelId(e.target.value);setClassId("");setGroupId("");}}><option value="">Tous les niveaux</option>{levels.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Classe</span><select value={classId} onChange={e=>{setClassId(e.target.value);setGroupId("");}}><option value="">Toutes les classes</option>{classes.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label><span>Groupe</span><select value={groupId} onChange={e=>setGroupId(e.target.value)} disabled={!selectedClass}><option value="">Tous les groupes</option>{groups.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label className="cr-search"><span>Rechercher un élève</span><div><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom ou référence élève"/></div></label>
      </div>
      <div className="cr-period-row"><span><Info size={13}/>Période de démonstration : <strong>Semestre 1</strong></span><span>Critère configuré : <strong>Non défini</strong></span></div>
    </section>

    <section className="cr-kpis" aria-label="Indicateurs du classement">
      <article><span className="cr-kpi-icon blue"><Users size={17}/></span><div><strong>{loading ? "—" : scopedRows.length}</strong><small>Élèves classés</small></div><em>Population fictive</em></article>
      <article><span className="cr-kpi-icon teal"><TrendingUp size={17}/></span><div><strong>{loading ? "—" : number(average)}</strong><small>Moyenne de la classe</small></div><em>Sur 20 · aperçu</em></article>
      <article><span className="cr-kpi-icon gold"><Award size={17}/></span><div><strong>{loading ? "—" : number(best)}</strong><small>Meilleure moyenne</small></div><em>Sur 20 · aperçu</em></article>
      <article><span className="cr-kpi-icon slate"><ChevronDown size={17}/></span><div><strong>{loading ? "—" : number(lowest)}</strong><small>Moyenne minimale</small></div><em>Sur 20 · aperçu</em></article>
    </section>

    <section className="cr-table-panel">
      <div className="cr-table-heading"><div><div><h2>Classement de la classe</h2><span className="cr-demo-pill">APERÇU FICTIF</span></div><p>{selectedClass?.name ?? "Toutes les classes"} · {yearName} · Semestre 1</p></div><span className="cr-result-count">{filtered.length} élève{filtered.length>1?"s":""}</span></div>
      {loading ? <div className="cr-skeletons">{Array.from({length:6},(_,i)=><div key={i}/>)}</div> : filtered.length ? <div className="cr-table-wrap"><table className="cr-table"><thead><tr><th>Rang</th><th>Élève</th><th>Référence élève</th><th>Moyenne générale</th><th>Évolution</th><th>Mention</th><th>Statut des résultats</th></tr></thead><tbody>{filtered.map(row=><tr key={row.id} className={row.rank<=3?"cr-top-row":""} onClick={()=>setSelected(row)}><td><span className={`cr-rank rank-${row.rank}`}>{row.rank===1?"1er":row.rank===2?"2e":row.rank===3?"3e":row.rank}</span></td><td><button className="cr-student-link" type="button" onClick={e=>{e.stopPropagation();setSelected(row);}}>{row.name}</button></td><td><code>{row.reference}</code></td><td><strong className="cr-average">{number(row.average)}</strong><small className="cr-out-of">/ 20</small></td><td><span className={row.previousRank===undefined?"cr-evolution neutral":row.previousRank>row.rank?"cr-evolution up":"cr-evolution down"}>{row.previousRank===undefined?"—":row.previousRank>row.rank?`↑ ${row.previousRank-row.rank}`:`↓ ${row.rank-row.previousRank}`}</span></td><td>{row.mention}</td><td><span className="cr-status-tag">Donnée fictive</span></td></tr>)}</tbody></table></div> : <div className="cr-empty"><Search size={22}/><strong>Aucun élève trouvé</strong><p>Modifiez votre recherche pour afficher les lignes de démonstration.</p></div>}
      <div className="cr-table-footer"><span>Les rangs et moyennes de cet aperçu ne sont pas officiels.</span><span>Affichage de {filtered.length} sur {scopedRows.length}</span></div>
    </section>

    {selected && <div className="cr-drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}><aside className="cr-drawer" role="dialog" aria-modal="true" aria-label="Détail du classement élève">
      <div className="cr-drawer-head"><div><span>DÉTAIL DU CLASSEMENT · APERÇU</span><h2>{selected.name}</h2><p>{selected.reference}</p></div><button type="button" onClick={()=>setSelected(null)} aria-label="Fermer"><X size={18}/></button></div>
      <div className="cr-drawer-body"><div className="cr-detail-rank"><div><small>Rang affiché</small><strong>{selected.rank===1?"1er":selected.rank===2?"2e":selected.rank===3?"3e":selected.rank}</strong></div><div><small>Moyenne fictive</small><strong>{number(selected.average)} / 20</strong></div></div>
        <section><h3>Informations académiques</h3><dl><div><dt>Classe</dt><dd>{selectedClass?.name??"Classe de démonstration"}</dd></div><div><dt>Année scolaire</dt><dd>{yearName}</dd></div><div><dt>Période</dt><dd>Semestre 1 · aperçu</dd></div><div><dt>Critère de classement</dt><dd>Non configuré</dd></div><div><dt>Calcul officiel</dt><dd>Non disponible</dd></div></dl></section>
        <section><h3>Résultats par matière · fictifs</h3><div className="cr-subject-list">{selected.subjects.map(subject=><div key={subject.name}><span>{subject.name}</span><strong>{number(subject.average)} / 20</strong></div>)}</div></section>
        <div className="cr-detail-note"><Info size={14}/>Les résultats détaillés sont des exemples visuels. Ils ne proviennent pas d’une saisie, validation ou publication réelle.</div>
      </div>
      <div className="cr-drawer-footer"><span>Consultation uniquement</span><button type="button" onClick={()=>setSelected(null)}>Fermer</button></div>
    </aside></div>}
  </main>;
}
