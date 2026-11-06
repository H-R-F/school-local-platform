import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, ArrowUpRight, Banknote,
  Boxes, Bus, CalendarDays, Clock3, CreditCard,
  Package, Receipt, Search, ShieldAlert, Truck, Wallet, X,
} from "lucide-react";
import {
  financeActivities, financeMonthlyFlow, financePayments, financeQuickActions,
  financeSchoolSettings, financeExpenses, inventoryAlerts, outstandingBalances,
  recentIncidents, rechargeRequests, transportLines, upcomingTrips,
  type FinancePeriod,
} from "../../data/finance-logistics-dashboard";
import type { AuthenticatedSidebarUser, Permission } from "../../types/navigation";

interface Props { user: AuthenticatedSidebarUser; onNavigate: (route: string) => void; }
type RequestDecision = { id: string; action: "Approuver" | "Rejeter" } | null;
const currency = new Intl.NumberFormat(financeSchoolSettings.locale, { style: "currency", currency: financeSchoolSettings.currency, maximumFractionDigits: 0 });
const money = (amount: number) => currency.format(amount);
const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const formatDate = (date: string) => dateFormat.format(new Date(date + "T12:00:00"));
const periodLabels: Record<FinancePeriod,string> = { month:"Ce mois-ci", lastMonth:"Le mois dernier", academicYear:"Cette année scolaire", custom:"Période personnalisée" };
const statusClass = (status: string) => /Payé|Payée|Prête|Résolu|Active|Normal/.test(status) ? "fl-status--good" : /Critique|Élevée|Échoué/.test(status) ? "fl-status--danger" : "fl-status--warning";

function SectionTitle({ eyebrow, title, action }: { eyebrow:string; title:string; action?:{label:string;run:()=>void} }) {
  return <div className="fl-section-title"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action&&<button type="button" onClick={action.run}>{action.label}<ArrowRight size={14}/></button>}</div>;
}
function FinancialChart({ rows }: { rows: typeof financeMonthlyFlow }) {
  const max = Math.max(...rows.map(x=>Math.max(x.payments,x.expenses)),1);
  return <div className="fl-chart">
    <div className="fl-chart-legend"><span><i className="fl-legend-payments"/>Paiements encaissés</span><span><i className="fl-legend-expenses"/>Dépenses</span></div>
    <div className="fl-chart-bars">{rows.map(row=><div className="fl-chart-month" key={row.month}>
      <div className="fl-chart-pair"><div className="fl-chart-column"><b>{money(row.payments)}</b><i className="fl-bar-payments" style={{height:`${row.payments/max*100}%`}}/></div><div className="fl-chart-column"><b>{money(row.expenses)}</b><i className="fl-bar-expenses" style={{height:`${row.expenses/max*100}%`}}/></div></div>
      <small>{row.month}</small></div>)}</div>
  </div>;
}

export function FinanceLogisticsOverviewPage({ user, onNavigate }: Props) {
  const [period,setPeriod]=useState<FinancePeriod>("month");
  const [paymentSearch,setPaymentSearch]=useState("");
  const [paymentStatus,setPaymentStatus]=useState("Tous");
  const [customStart,setCustomStart]=useState("2026-11-01");
  const [customEnd,setCustomEnd]=useState("2026-11-06");
  const [requestDecision,setRequestDecision]=useState<RequestDecision>(null);
  const [requestNotice,setRequestNotice]=useState("");
  const [showAllPayments,setShowAllPayments]=useState(false);
  const allowed=(p:Permission)=>user.permissions.includes(p);
  const now=new Date();
  const greeting=now.getHours()<12?"Bonjour":now.getHours()<18?"Bon après-midi":"Bonsoir";
  const firstName=user.displayName.split(" ")[0];
  const dateLabel=new Intl.DateTimeFormat("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(now);

  const periodRange=useMemo(()=>{
    const y=now.getFullYear(),m=now.getMonth();
    if(period==="month") return {start:new Date(y,m,1),end:new Date(y,m+1,0)};
    if(period==="lastMonth") return {start:new Date(y,m-1,1),end:new Date(y,m,0)};
    if(period==="academicYear") return {start:new Date(financeSchoolSettings.academicYearStart+"T00:00:00"),end:now};
    return {start:new Date(customStart+"T00:00:00"),end:new Date(customEnd+"T23:59:59")};
  },[period,customStart,customEnd]);
  const inRange=(date:string)=>{const d=new Date(date+"T12:00:00");return d>=periodRange.start&&d<=periodRange.end;};
  const paymentsInPeriod=financePayments.filter(x=>x.status==="Payé"&&inRange(x.date));
  const expensesInPeriod=financeExpenses.filter(x=>x.status==="Payée"&&inRange(x.date));
  const collected=paymentsInPeriod.reduce((s,x)=>s+x.amount,0);
  const expenses=expensesInPeriod.reduce((s,x)=>s+x.amount,0);
  const filteredPayments=useMemo(()=>financePayments.filter(x=>
    (x.student+" "+x.id).toLocaleLowerCase("fr-FR").includes(paymentSearch.toLocaleLowerCase("fr-FR")) &&
    (paymentStatus==="Tous"||x.status===paymentStatus)
  ),[paymentSearch,paymentStatus]);
  const visiblePayments=showAllPayments?filteredPayments:filteredPayments.slice(0,5);
  const outstandingTotal=outstandingBalances.reduce((s,x)=>s+x.amount,0);
  const lowStock=inventoryAlerts.filter(x=>x.status!=="Normal");
  const activeLines=transportLines.filter(x=>x.status==="Active");
  const assignedStudents=activeLines.reduce((s,x)=>s+x.assigned,0);
  const quickActions=financeQuickActions.filter(x=>allowed(x.permission as Permission));
  const serviceTotals=outstandingBalances.reduce<Record<string,number>>((acc,x)=>{acc[x.service]=(acc[x.service]??0)+x.amount;return acc;},{});
  const chartRows=financeMonthlyFlow.filter(row=>{const monthDate=new Date(row.date+"T12:00:00");return monthDate>=new Date(periodRange.start.getFullYear(),periodRange.start.getMonth(),1)&&monthDate<=new Date(periodRange.end.getFullYear(),periodRange.end.getMonth()+1,0);});

  function requestAction(action:"Approuver"|"Rejeter") {
    if(!requestDecision)return;
    // No financial API exists in this frontend-only project. Never mutate demo transaction state as if a real transaction succeeded.
    setRequestNotice(`La demande ${requestDecision.id} ne peut pas être ${action.toLocaleLowerCase("fr-FR")} : aucun service financier connecté n'est disponible. Aucune modification n'a été effectuée.`);
    setRequestDecision(null);
  }

  return <main className="finance-logistics-dashboard">
    <header className="fl-welcome">
      <div><div className="fl-breadcrumb"><Wallet size={14}/> Espace financier et logistique <span>/</span> Vue d’ensemble</div>
        <h1>Vue d'ensemble</h1><p>{greeting}, {firstName}. Voici votre aperçu financier et logistique.</p>
        <div className="fl-context"><span><CalendarDays size={14}/>{dateLabel}</span><span>Année scolaire {financeSchoolSettings.academicYear}</span><span>Devise : {financeSchoolSettings.currency}</span></div>
      </div>
      <div className="fl-period-control"><label htmlFor="fl-period">Période financière</label><select id="fl-period" value={period} onChange={e=>setPeriod(e.target.value as FinancePeriod)}>{Object.entries(periodLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
        {period==="custom"&&<div className="fl-custom-range"><input aria-label="Date de début" type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)}/><span>au</span><input aria-label="Date de fin" type="date" value={customEnd} min={customStart} onChange={e=>setCustomEnd(e.target.value)}/></div>}
      </div>
    </header>

    <section className="fl-kpis" aria-label="Indicateurs financiers et logistiques">
      <article className="fl-kpi"><div><span>Total des paiements encaissés</span><i className="fl-icon--blue"><Banknote size={17}/></i></div><strong>{money(collected)}</strong><small><ArrowUpRight size={12}/> Paiements confirmés sur la période</small></article>
      <article className="fl-kpi"><div><span>Soldes impayés</span><i className="fl-icon--amber"><Wallet size={17}/></i></div><strong>{money(outstandingTotal)}</strong><small>{outstandingBalances.length} élèves avec un solde restant</small></article>
      <article className="fl-kpi"><div><span>Total des dépenses</span><i className="fl-icon--violet"><Receipt size={17}/></i></div><strong>{money(expenses)}</strong><small>Dépenses payées sur la période</small></article>
      <article className="fl-kpi"><div><span>Demandes de recharge en attente</span><i className="fl-icon--amber"><Clock3 size={17}/></i></div><strong>{rechargeRequests.length}</strong><small>Demandes à examiner</small></article>
      <article className="fl-kpi"><div><span>Lignes de transport actives</span><i className="fl-icon--blue"><Bus size={17}/></i></div><strong>{activeLines.length}</strong><small>{assignedStudents} élèves affectés</small></article>
      <article className="fl-kpi"><div><span>Alertes de stock</span><i className="fl-icon--red"><Boxes size={17}/></i></div><strong>{lowStock.length}</strong><small>{lowStock.filter(x=>x.status==="Critique").length} articles en stock critique</small></article>
    </section>

    <section className="fl-main-grid">
      <article className="fl-panel"><SectionTitle eyebrow="SUIVI DES ENCAISSEMENTS ET DÉPENSES" title="Aperçu financier"/>
        <div className="fl-finance-summary"><div><span>Paiements encaissés</span><strong>{money(collected)}</strong></div><div><span>Soldes impayés</span><strong>{money(outstandingTotal)}</strong></div><div><span>Dépenses payées</span><strong>{money(expenses)}</strong></div><div><span>Mouvement financier net</span><strong className={collected-expenses>=0?"fl-positive":"fl-negative"}>{money(collected-expenses)}</strong></div></div>
        <FinancialChart rows={chartRows}/>
        <p className="fl-footnote">Les montants encaissés excluent les demandes en attente. Le mouvement net correspond aux paiements confirmés moins les dépenses payées ; il ne représente pas un bénéfice comptable. Les comparaisons avec la période précédente ne sont pas disponibles dans ce jeu de démonstration. {period==="custom"?"Le graphique présente des agrégats mensuels pour les mois qui recoupent la période sélectionnée.":""}</p>
      </article>
      {allowed("finance.registers.view") && (<article className="fl-panel"><SectionTitle eyebrow="DERNIÈRES TRANSACTIONS" title="Paiements récents" action={allowed("finance.registers.view")?{label:"Voir tous les paiements",run:()=>onNavigate("/payment-registers")}:undefined}/>
        <div className="fl-payment-filters"><label><Search size={14}/><input value={paymentSearch} onChange={e=>setPaymentSearch(e.target.value)} placeholder="Élève ou référence…"/></label><select aria-label="Filtrer par statut" value={paymentStatus} onChange={e=>setPaymentStatus(e.target.value)}><option>Tous</option><option>Payé</option><option>En attente</option><option>Partiel</option><option>Échoué</option></select></div>
        <div className="fl-payment-list">{visiblePayments.map(row=><div key={row.id}><span className="fl-payment-icon"><CreditCard size={15}/></span><div><strong>{row.student}</strong><small>{row.id} · {row.service} · {formatDate(row.date)}</small></div><div><b>{money(row.amount)}</b><span className={`fl-status ${statusClass(row.status)}`}>{row.status}</span></div><button type="button" aria-label={`Voir le paiement ${row.id}`} onClick={()=>onNavigate(`/payments?payment=${row.id}`)}><ArrowRight size={14}/></button></div>)}</div>
        {filteredPayments.length===0&&<p className="fl-empty">Aucun paiement trouvé.</p>}
        {filteredPayments.length>5&&<button className="fl-show-more" onClick={()=>setShowAllPayments(v=>!v)} type="button">{showAllPayments?"Réduire":"Afficher tous les résultats"}<ArrowRight size={13}/></button>}
      </article>)} 
    </section>

    <section className="fl-main-grid">
      {allowed("finance.balances.view") && (<article className="fl-panel"><SectionTitle eyebrow="SUIVI DES CRÉANCES" title="Soldes impayés" action={allowed("finance.balances.view")?{label:"Gérer les soldes",run:()=>onNavigate("/student-balances")}:undefined}/>
        <div className="fl-balance-total"><strong>{money(outstandingTotal)}</strong><span>{outstandingBalances.length} élèves concernés</span></div>
        <div className="fl-service-breakdown">{Object.entries(serviceTotals).map(([service,total])=><div key={service}><span>{service}</span><b>{money(total)}</b></div>)}</div>
        <div className="fl-table-wrap"><table className="fl-table"><thead><tr><th>Élève</th><th>Classe</th><th>Service</th><th>Montant dû</th><th>Dernier paiement</th><th/></tr></thead><tbody>{outstandingBalances.map(row=><tr key={row.id}><td>{row.student}</td><td>{row.className}</td><td>{row.service}</td><td><b>{money(row.amount)}</b></td><td>{formatDate(row.lastPayment)}</td><td><button type="button" aria-label={`Voir le solde de ${row.student}`} onClick={()=>onNavigate(`/student-balances?student=${row.id}`)}><ArrowRight size={14}/></button></td></tr>)}</tbody></table></div>
      </article>)} 
      {allowed("finance.balances.view") && (<article className="fl-panel"><SectionTitle eyebrow="À TRAITER" title="Demandes en attente"/>
        {requestNotice&&<div className="fl-notice" role="status"><AlertTriangle size={15}/><span>{requestNotice}</span><button type="button" onClick={()=>setRequestNotice("")} aria-label="Fermer"><X size={14}/></button></div>}
        <div className="fl-request-list">{rechargeRequests.map(row=><div key={row.id}><div className="fl-request-main"><strong>{row.student}</strong><small>{row.id} · {row.service} · {formatDate(row.date)}</small></div><b>{money(row.amount)}</b><span className="fl-status fl-status--warning">{row.status}</span><div className="fl-request-actions"><button type="button" onClick={()=>onNavigate(`/student-balances?tab=requests&request=${row.id}`)}>Examiner</button><button type="button" onClick={()=>setRequestDecision({id:row.id,action:"Approuver"})} disabled={!allowed("finance.balances.view")}>Approuver</button><button type="button" onClick={()=>setRequestDecision({id:row.id,action:"Rejeter"})} disabled={!allowed("finance.balances.view")}>Rejeter</button></div></div>)}</div>
        <p className="fl-footnote">Les décisions sont désactivées côté transaction : aucun service API financier n’est connecté à cette version.</p>
      </article>)} 
    </section>

    {allowed("finance.expenses.manage") && (<section className="fl-panel"><SectionTitle eyebrow="SUIVI DES SORTIES DE FONDS" title="Aperçu des dépenses" action={allowed("finance.expenses.manage")?{label:"Gérer les dépenses",run:()=>onNavigate("/expenses")}:undefined}/>
      <div className="fl-expense-categories">{["Énergie","Transport","Fournitures","Maintenance","Services"].map(category=><div key={category}><span>{category}</span><b>{money(financeExpenses.filter(x=>x.category===category).reduce((s,x)=>s+x.amount,0))}</b></div>)}</div>
      <div className="fl-table-wrap"><table className="fl-table"><thead><tr><th>Description</th><th>Catégorie</th><th>Montant</th><th>Date</th><th>Statut</th><th/></tr></thead><tbody>{financeExpenses.slice(0,4).map(row=><tr key={row.id}><td>{row.label}</td><td>{row.category}</td><td><b>{money(row.amount)}</b></td><td>{formatDate(row.date)}</td><td><span className={`fl-status ${statusClass(row.status)}`}>{row.status}</span></td><td><button type="button" onClick={()=>onNavigate(`/expenses?expense=${row.id}`)} aria-label={`Voir la dépense ${row.id}`}><ArrowRight size={14}/></button></td></tr>)}</tbody></table></div>
    </section>) }

    <section className="fl-main-grid">
      {allowed("logistics.transport.manage") && (<article className="fl-panel"><SectionTitle eyebrow="MOBILITÉ SCOLAIRE" title="Gestion du transport" action={allowed("logistics.transport.manage")?{label:"Gérer le transport",run:()=>onNavigate("/transport")}:undefined}/>
        <div className="fl-transport-summary"><div><strong>{activeLines.length}</strong><span>Lignes actives</span></div><div><strong>{assignedStudents}</strong><span>Élèves affectés</span></div><div><strong>{transportLines.filter(x=>x.status!=="Active").length}</strong><span>À vérifier</span></div></div>
        <div className="fl-table-wrap"><table className="fl-table"><thead><tr><th>Ligne</th><th>Élèves affectés</th><th>Capacité</th><th>Statut</th><th/></tr></thead><tbody>{transportLines.map(row=><tr key={row.id}><td>{row.name}</td><td>{row.assigned}</td><td>{row.capacity===null?"Non renseignée":`${row.assigned} / ${row.capacity} (${Math.round(row.assigned/row.capacity*100)} %)`}</td><td><span className={`fl-status ${statusClass(row.status)}`}>{row.status}</span></td><td><button type="button" onClick={()=>onNavigate(`/transport?line=${row.id}`)} aria-label={`Voir ${row.name}`})} ><ArrowRight size={14}/></button></td></tr>)}</tbody></table></div>
      </article>)} 
      {allowed("logistics.trips.manage") && (<article className="fl-panel"><SectionTitle eyebrow="CALENDRIER LOGISTIQUE" title="Sorties et excursions à venir" action={allowed("logistics.trips.manage")?{label:"Gérer les sorties",run:()=>onNavigate("/trips-outings")}:undefined}/>
        <div className="fl-trip-list">{[...upcomingTrips].sort((a,b)=>a.date.localeCompare(b.date)).map(row=><div key={row.id}><span className="fl-trip-date"><b>{new Date(row.date+"T12:00:00").getDate()}</b><small>{new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(new Date(row.date+"T12:00:00"))}</small></span><div><strong>{row.title}</strong><small>{row.destination} · {row.students} élèves · {row.transport}</small></div><span className={`fl-status ${statusClass(row.status)}`}>{row.status}</span></div>)}</div>
      </article>)} 
    </section>

    <section className="fl-main-grid">
      {allowed("logistics.inventory.manage") && (<article className="fl-panel"><SectionTitle eyebrow="RESSOURCES ET FOURNITURES" title="État du stock" action={allowed("logistics.inventory.manage")?{label:"Gérer le stock",run:()=>onNavigate("/inventory")}:undefined}/>
        <div className="fl-stock-summary"><div><strong>248</strong><span>Articles référencés</span></div><div><strong>{lowStock.length}</strong><span>Stocks à surveiller</span></div><div><strong>12</strong><span>Ajouts récents</span></div></div>
        <div className="fl-table-wrap"><table className="fl-table"><thead><tr><th>Article</th><th>Quantité</th><th>Seuil minimum</th><th>État</th><th/></tr></thead><tbody>{inventoryAlerts.map(row=><tr key={row.id}><td>{row.item}</td><td>{row.quantity}</td><td>{row.minimum}</td><td><span className={`fl-status ${statusClass(row.status)}`}>{row.status}</span></td><td><button type="button" onClick={()=>onNavigate(`/inventory?item=${row.id}`)} aria-label={`Voir ${row.item}`}><ArrowRight size={14}/></button></td></tr>)}</tbody></table></div>
      </article>)} 
      {allowed("logistics.incidents.manage") && (<article className="fl-panel"><SectionTitle eyebrow="SÉCURITÉ ET SUIVI" title="Incidents récents" action={allowed("logistics.incidents.manage")?{label:"Voir les incidents",run:()=>onNavigate("/accidents-incidents")}:undefined}/>
        <div className="fl-incident-list">{recentIncidents.map(row=><div key={row.id}><span className={`fl-incident-icon ${row.severity==="Élevée"?"is-danger":"is-warning"}`}><ShieldAlert size={16}/></span><div><strong>{row.category}</strong><small>{row.id} · {formatDate(row.date)} · {row.summary}</small></div><span className={`fl-status ${statusClass(row.severity)}`}>{row.severity}</span><span className={`fl-status ${statusClass(row.status)}`}>{row.status}</span></div>)}</div>
        <p className="fl-footnote">Informations limitées au suivi logistique autorisé. Aucun détail médical ou confidentiel n’est affiché.</p>
      </article>)} 
    </section>

    <section className="fl-main-grid">
      <article className="fl-panel"><SectionTitle eyebrow="JOURNAL DES OPÉRATIONS" title="Activité récente" action={allowed("activity.history.view")?{label:"Historique complet",run:()=>onNavigate("/activity-history")}:undefined}/>
        <div className="fl-activity-list">{[...financeActivities].sort((a,b)=>b.date.localeCompare(a.date)).map(row=><div key={row.id}><span><Activity size={15}/></span><div><strong>{row.title}</strong><small>{row.detail} · {row.actor}</small></div><time>{new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(row.date))}</time></div>)}</div>
      </article>
      <article className="fl-panel"><SectionTitle eyebrow="ACCÈS DIRECT" title="Actions rapides"/>
        <div className="fl-quick-actions">{quickActions.map(row=><button key={row.id} type="button" onClick={()=>onNavigate(row.route)}><span>{row.id==="payment"?<CreditCard size={16}/>:row.id==="expense"?<Receipt size={16}/>:row.id==="requests"?<Clock3 size={16}/>:row.id==="balances"?<Wallet size={16}/>:row.id==="transport"?<Bus size={16}/>:row.id==="trip"?<Truck size={16}/>:<Package size={16}/>}</span>{row.label}<ArrowRight size={14}/></button>)}</div>
      </article>
    </section>
    <footer className="fl-footer"><span>Tableau de bord financier et logistique</span><span>Données fictives de démonstration · Non connectées à une base réelle</span></footer>

    {requestDecision&&<div className="fl-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setRequestDecision(null);}}><section className="fl-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="fl-modal-title"><button className="fl-modal-close" type="button" onClick={()=>setRequestDecision(null)} aria-label="Fermer"><X size={17}/></button><span className="fl-modal-icon"><AlertTriangle size={20}/></span><h2 id="fl-modal-title">Confirmer la décision</h2><p>Vous avez demandé à {requestDecision.action.toLocaleLowerCase("fr-FR")} la demande <strong>{requestDecision.id}</strong>.</p><p className="fl-modal-warning">Aucun service financier n’est connecté. Cette action ne sera pas exécutée et aucun statut ne sera modifié.</p><div><button type="button" onClick={()=>setRequestDecision(null)}>Annuler</button><button type="button" onClick={()=>{if(requestDecision)requestAction(requestDecision.action);}}>Continuer</button></div></section></div>}
  </main>;
}
