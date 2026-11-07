import { useMemo, useState } from "react";
import "./DirectorOverviewPage.css";
import {
  AlertCircle, ArrowRight, ArrowUpRight, Award, BadgeCheck,
  Banknote, BookOpen, BookOpenCheck, Calendar, CalendarDays, Check,
  CheckCircle2, ChevronDown, CircleAlert, Clock3, Download, ExternalLink,
  FileText, GraduationCap, LayoutDashboard,
  Notebook, Printer, Receipt, Search,
  Send, ShieldAlert, Sparkles, TrendingUp, UserRound,
  Users, Wallet, X
} from "lucide-react";
import {
  academicLevels, academicTrend, attendanceSeries, classPerformance,
  dashboardRangeOptions, directorKpis, financialSummary, importantAlerts,
  pendingApprovals, recentActivities, revenueByRange,
  studentsAtRisk as initialStudentsAtRisk, type DashboardRange,
} from "../../data/director-dashboard";
import { demoAccounts } from "../../data/demo-accounts";
import type { AuthenticatedSidebarUser } from "../../types/navigation";

interface Props {
  user: AuthenticatedSidebarUser;
  onNavigate: (route: string) => void;
  onSwitchUser?: (user: AuthenticatedSidebarUser) => void;
}

type DashboardTab = "overview" | "academic" | "attendance" | "operations";

const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

export function DirectorOverviewPage({ user, onNavigate, onSwitchUser }: Props) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [range, setRange] = useState<DashboardRange>("30");
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState(initialStudentsAtRisk);
  const [riskFilter, setRiskFilter] = useState<string>("Tous");
  const [approvalsList, setApprovalsList] = useState(pendingApprovals);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [directorNotes, setDirectorNotes] = useState(() => {
    try {
      return localStorage.getItem("school-director-notes") || 
        "• Conseil d'établissement : jeudi 12 novembre à 17h00\n• Suivi des fiches d'orientation pour les classes de 3e et 1re Bac\n• Point budget avec Mme Alaoui : finalisation du rapport trimestriel";
    } catch {
      return "";
    }
  });
  const [academicCycleFilter, setAcademicCycleFilter] = useState<string>("Tous");

  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const greeting = new Date().getHours() < 12 ? "Bonjour" : new Date().getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  // Trigger toast
  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }

  // Save notes
  function handleNotesChange(text: string) {
    setDirectorNotes(text);
    try {
      localStorage.setItem("school-director-notes", text);
    } catch {
      // ignore storage failure
    }
  }

  // Handle student status update
  function handleUpdateStudentStatus(id: string, newStatus: string) {
    setStudentsList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    showToast(`Dossier de l'élève mis à jour : statut changé en "${newStatus}"`);
  }

  // Quick validate approval
  function handleQuickApprove(id: string, title: string) {
    setApprovalsList(prev => prev.filter(item => item.id !== id));
    showToast(`Validation confirmée pour : ${title}`);
  }

  // Notify parents
  function handleNotifyAbsentParents() {
    showToast("49 notifications SMS & emails envoyées aux responsables légaux des élèves absents.");
  }

  // Export CSV
  function handleExportCsv() {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Indicateur,Valeur,Tendance,Detail\n" +
      directorKpis.map(k => `"${k.label}","${k.value}","${k.trend}","${k.detail}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `synthese_direction_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Export CSV des indicateurs téléchargé avec succès.");
  }

  const selectedStudent = useMemo(() => {
    return studentsList.find(s => s.id === selectedStudentId);
  }, [studentsList, selectedStudentId]);

  const filteredStudents = useMemo(() => {
    return studentsList.filter(s => {
      const matchSearch = !globalSearch || 
        s.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
        s.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
        s.className.toLowerCase().includes(globalSearch.toLowerCase());
      const matchRisk = riskFilter === "Tous" || s.risk === riskFilter;
      return matchSearch && matchRisk;
    });
  }, [studentsList, globalSearch, riskFilter]);

  const filteredLevels = useMemo(() => {
    if (academicCycleFilter === "Tous") return academicLevels;
    return academicLevels.filter(l => l.label === academicCycleFilter);
  }, [academicCycleFilter]);

  const filteredClassPerformance = useMemo(() => {
    if (academicCycleFilter === "Tous") return classPerformance;
    if (academicCycleFilter === "Primaire") return classPerformance.slice(0, 2);
    if (academicCycleFilter === "Collège") return classPerformance.slice(2, 4);
    return classPerformance.slice(4, 6);
  }, [academicCycleFilter]);

  const revenue = revenueByRange[range] || revenueByRange["30"];

  return (
    <main className="director-dashboard">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="dash-toast-notification" role="status">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} aria-label="Fermer"><X size={14}/></button>
        </div>
      )}

      {/* Top Executive Header */}
      <header className="dash-top-hero">
        <div className="dash-hero-main">
          <div className="dash-breadcrumb">
            <LayoutDashboard size={14} className="text-blue-600" />
            <span>Tableau de bord</span>
            <span className="dash-crumb-sep">/</span>
            <span className="text-slate-800 font-semibold">Direction générale</span>
          </div>
          
          <div className="dash-hero-title-row">
            <div>
              <h1>Vue d'ensemble de l'établissement</h1>
              <p className="dash-hero-subtitle">
                {greeting}, <strong>{user.displayName}</strong>. Voici la synthèse stratégique et opérationnelle de votre école.
              </p>
            </div>

            {/* Quick Demo Role Switcher */}
            {onSwitchUser && (
              <div className="dash-role-switcher" title="Changer d'espace pour tester les différents profils">
                <span className="dash-role-switcher-label">Profil de travail :</span>
                <div className="dash-role-pills">
                  {demoAccounts.map(account => {
                    const isActive = account.user.id === user.id;
                    return (
                      <button
                        key={account.user.id}
                        type="button"
                        className={`dash-role-pill ${isActive ? "dash-role-pill--active" : ""}`}
                        onClick={() => onSwitchUser(account.user)}
                      >
                        <span className="dash-role-avatar">{account.user.initials}</span>
                        <span className="dash-role-name">{account.user.displayName.split(" ")[0]}</span>
                        <span className="dash-role-tag">
                          {account.user.role === "director" ? "Dir." : account.user.role === "administrative" ? "Adm." : account.user.role === "pedagogical" ? "Pédag." : "Fin."}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="dash-hero-meta-bar">
            <div className="dash-meta-badge">
              <Calendar size={13} />
              <span>Année académique <strong>2026–2027</strong></span>
              <span className="dash-dot-sep">·</span>
              <span>1er Semestre</span>
            </div>
            <div className="dash-meta-badge">
              <Clock3 size={13} />
              <span className="dash-date-capitalized">{today}</span>
            </div>
            <div className="dash-meta-badge dash-meta-badge--emerald">
              <span className="dash-pulse-dot" />
              <span>Établissement ouvert · 42 salles actives</span>
            </div>
          </div>
        </div>

        {/* Global Executive Controls */}
        <div className="dash-hero-controls">
          <div className="dash-control-group">
            <label htmlFor="dash-range-select" className="dash-control-label">Période d'analyse</label>
            <div className="dash-select-container">
              <select
                id="dash-range-select"
                value={range}
                onChange={e => setRange(e.target.value as DashboardRange)}
                className="dash-styled-select"
              >
                {dashboardRangeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="dash-select-arrow" />
            </div>
          </div>

          <div className="dash-action-buttons">
            <button
              type="button"
              className="dash-btn dash-btn--secondary"
              onClick={() => setShowNotesDrawer(!showNotesDrawer)}
              title="Bloc-notes personnel du directeur"
            >
              <Notebook size={14} />
              <span>Mémo du jour</span>
            </button>
            <button
              type="button"
              className="dash-btn dash-btn--secondary"
              onClick={() => setShowSummaryModal(true)}
              title="Générer une synthèse complète imprimable"
            >
              <Printer size={14} />
              <span>Fiche de synthèse</span>
            </button>
            <button
              type="button"
              className="dash-btn dash-btn--primary"
              onClick={handleExportCsv}
              title="Exporter les indicateurs en format tableur CSV"
            >
              <Download size={14} />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Collapsible Executive Memo Notepad */}
      {showNotesDrawer && (
        <section className="dash-memo-drawer" aria-label="Bloc-notes de direction">
          <div className="dash-memo-head">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <h3 className="font-semibold text-slate-800 text-sm">Bloc-notes & Priorités du Directeur</h3>
              <span className="text-xs text-slate-400">· Enregistré localement</span>
            </div>
            <button type="button" onClick={() => setShowNotesDrawer(false)} className="dash-icon-button" aria-label="Fermer"><X size={15}/></button>
          </div>
          <textarea
            value={directorNotes}
            onChange={e => handleNotesChange(e.target.value)}
            rows={3}
            placeholder="Notez ici les urgences de la journée, rendez-vous parents, décisions en attente..."
            className="dash-memo-textarea"
          />
        </section>
      )}

      {/* Master Tabs for Better Organization */}
      <nav className="dash-nav-tabs" aria-label="Sections du tableau de bord">
        <button
          type="button"
          className={`dash-tab-item ${activeTab === "overview" ? "dash-tab-item--active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <LayoutDashboard size={15} />
          <span>Vue globale & Stratégie</span>
        </button>
        <button
          type="button"
          className={`dash-tab-item ${activeTab === "academic" ? "dash-tab-item--active" : ""}`}
          onClick={() => setActiveTab("academic")}
        >
          <GraduationCap size={15} />
          <span>Académique & Résultats</span>
          <span className="dash-tab-badge">14,6/20</span>
        </button>
        <button
          type="button"
          className={`dash-tab-item ${activeTab === "attendance" ? "dash-tab-item--active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          <CalendarDays size={15} />
          <span>Vie scolaire & Présences</span>
          <span className="dash-tab-badge dash-tab-badge--emerald">94,2 %</span>
        </button>
        <button
          type="button"
          className={`dash-tab-item ${activeTab === "operations" ? "dash-tab-item--active" : ""}`}
          onClick={() => setActiveTab("operations")}
        >
          <Receipt size={15} />
          <span>Finances & Validations</span>
          <span className="dash-tab-badge dash-tab-badge--amber">{approvalsList.length} en attente</span>
        </button>
      </nav>

      {/* KPI Deck - Consistent Across All Tabs for High-Level Context */}
      <section className="dash-kpi-deck" aria-label="Indicateurs de performance de l'établissement">
        {/* KPI 1: Students */}
        <article
          className="dash-kpi-card dash-kpi-card--blue"
          onClick={() => onNavigate("/students")}
          role="button"
          tabIndex={0}
        >
          <div className="dash-kpi-header">
            <span className="dash-kpi-label">Élèves inscrits</span>
            <span className="dash-kpi-symbol dash-kpi-symbol--blue">
              <GraduationCap size={18} />
            </span>
          </div>
          <div className="dash-kpi-main">
            <strong className="dash-kpi-number">1 248</strong>
            <span className="dash-kpi-trend dash-kpi-trend--up">
              <ArrowUpRight size={13} /> +4,8 %
            </span>
          </div>
          <div className="dash-kpi-footer">
            <span>1 216 élèves actifs</span>
            <span className="dash-kpi-action">Gérer <ArrowRight size={12}/></span>
          </div>
        </article>

        {/* KPI 2: Teachers */}
        <article
          className="dash-kpi-card dash-kpi-card--indigo"
          onClick={() => onNavigate("/teachers")}
          role="button"
          tabIndex={0}
        >
          <div className="dash-kpi-header">
            <span className="dash-kpi-label">Corps enseignant</span>
            <span className="dash-kpi-symbol dash-kpi-symbol--indigo">
              <Users size={18} />
            </span>
          </div>
          <div className="dash-kpi-main">
            <strong className="dash-kpi-number">86</strong>
            <span className="dash-kpi-trend dash-kpi-trend--neutral">
              +2 ce trimestre
            </span>
          </div>
          <div className="dash-kpi-footer">
            <span>82 en activité · 4 remplaçants</span>
            <span className="dash-kpi-action">Équipe <ArrowRight size={12}/></span>
          </div>
        </article>

        {/* KPI 3: Attendance */}
        <article
          className="dash-kpi-card dash-kpi-card--emerald"
          onClick={() => setActiveTab("attendance")}
          role="button"
          tabIndex={0}
        >
          <div className="dash-kpi-header">
            <span className="dash-kpi-label">Présence du jour</span>
            <span className="dash-kpi-symbol dash-kpi-symbol--emerald">
              <CalendarDays size={18} />
            </span>
          </div>
          <div className="dash-kpi-main">
            <strong className="dash-kpi-number">94,2 %</strong>
            <span className="dash-kpi-trend dash-kpi-trend--up">
              <ArrowUpRight size={13} /> +1,6 pt
            </span>
          </div>
          <div className="dash-kpi-footer">
            <span>1 176 présents · 49 absents</span>
            <span className="dash-kpi-action">Détails <ArrowRight size={12}/></span>
          </div>
        </article>

        {/* KPI 4: Academic Average */}
        <article
          className="dash-kpi-card dash-kpi-card--purple"
          onClick={() => setActiveTab("academic")}
          role="button"
          tabIndex={0}
        >
          <div className="dash-kpi-header">
            <span className="dash-kpi-label">Moyenne générale</span>
            <span className="dash-kpi-symbol dash-kpi-symbol--purple">
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="dash-kpi-main">
            <strong className="dash-kpi-number">14,6<span className="text-sm font-normal text-slate-400">/20</span></strong>
            <span className="dash-kpi-trend dash-kpi-trend--up">
              <ArrowUpRight size={13} /> +0,4 pt
            </span>
          </div>
          <div className="dash-kpi-footer">
            <span>Trimestre en cours · Objectif : 14,0</span>
            <span className="dash-kpi-action">Niveaux <ArrowRight size={12}/></span>
          </div>
        </article>

        {/* KPI 5: Pending Validations */}
        <article
          className="dash-kpi-card dash-kpi-card--amber"
          onClick={() => setActiveTab("operations")}
          role="button"
          tabIndex={0}
        >
          <div className="dash-kpi-header">
            <span className="dash-kpi-label">Validations en attente</span>
            <span className="dash-kpi-symbol dash-kpi-symbol--amber">
              <BadgeCheck size={18} />
            </span>
          </div>
          <div className="dash-kpi-main">
            <strong className="dash-kpi-number">{approvalsList.reduce((acc, curr) => acc + curr.count, 0)}</strong>
            <span className="dash-kpi-badge-pill dash-kpi-badge-pill--amber">
              À traiter
            </span>
          </div>
          <div className="dash-kpi-footer">
            <span>Notes, cours & rapports</span>
            <span className="dash-kpi-action">Examiner <ArrowRight size={12}/></span>
          </div>
        </article>

        {/* KPI 6: Financial Recovery */}
        <article
          className="dash-kpi-card dash-kpi-card--rose"
          onClick={() => onNavigate("/financial-reports")}
          role="button"
          tabIndex={0}
        >
          <div className="dash-kpi-header">
            <span className="dash-kpi-label">Reste à recouvrer</span>
            <span className="dash-kpi-symbol dash-kpi-symbol--rose">
              <Wallet size={18} />
            </span>
          </div>
          <div className="dash-kpi-main">
            <strong className="dash-kpi-number">{financialSummary.outstanding}</strong>
            <span className="dash-kpi-trend dash-kpi-trend--up">
              −6,2 %
            </span>
          </div>
          <div className="dash-kpi-footer">
            <span>127 dossiers en suivi</span>
            <span className="dash-kpi-action">Recouvrement <ArrowRight size={12}/></span>
          </div>
        </article>
      </section>

      {/* Critical Vigilance Banner */}
      <section className="dash-vigilance-banner">
        <div className="dash-vigilance-title">
          <CircleAlert size={17} className="text-amber-600 shrink-0" />
          <div>
            <strong>Points d'attention immédiats</strong>
            <span>3 événements requièrent la vigilance de la direction aujourd'hui</span>
          </div>
        </div>
        <div className="dash-vigilance-items">
          {importantAlerts.map(alert => (
            <div key={alert.id} className={`dash-vigilance-chip dash-vigilance-chip--${alert.severity}`}>
              <div className="dash-vigilance-chip-text">
                <strong>{alert.title}</strong>
                <span>{alert.description}</span>
              </div>
              <button
                type="button"
                className="dash-chip-action"
                onClick={() => onNavigate(alert.route)}
              >
                {alert.action} <ArrowRight size={12}/>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* TAB CONTENT 1: OVERVIEW (INTEGRATED VIEW) */}
      {(activeTab === "overview" || activeTab === "academic") && (
        <section className="dash-grid-double">
          {/* Academic Overview Card */}
          <article className="dash-card">
            <div className="dash-card-header">
              <div>
                <span className="dash-card-eyebrow">PÉDAGOGIE & NIVEAUX</span>
                <h2 className="dash-card-title">Performance académique par cycle</h2>
              </div>
              <div className="dash-card-actions">
                <div className="dash-segmented-tabs">
                  {["Tous", "Primaire", "Collège", "Lycée"].map(cyc => (
                    <button
                      key={cyc}
                      type="button"
                      className={`dash-segment-btn ${academicCycleFilter === cyc ? "dash-segment-btn--active" : ""}`}
                      onClick={() => setAcademicCycleFilter(cyc)}
                    >
                      {cyc}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="dash-text-link"
                  onClick={() => onNavigate("/pedagogical-reports")}
                >
                  Rapports complets <ExternalLink size={13}/>
                </button>
              </div>
            </div>

            {/* Academic Level Bars */}
            <div className="dash-academic-metrics-deck">
              <div className="dash-metric-stat">
                <span className="dash-stat-caption">Moyenne générale</span>
                <div className="dash-stat-value-row">
                  <strong className="text-2xl font-bold text-slate-800">14,6</strong>
                  <span className="text-xs text-slate-400">/20</span>
                  <span className="dash-badge-emerald">+0,4 pt</span>
                </div>
                <span className="dash-stat-note">Trimestre 1 · 2026–2027</span>
              </div>
              <div className="dash-metric-stat">
                <span className="dash-stat-caption">Meilleur niveau</span>
                <div className="dash-stat-value-row">
                  <strong className="text-xl font-bold text-indigo-700">Lycée</strong>
                  <span className="text-xs font-semibold text-slate-600">· 15,1/20</span>
                </div>
                <span className="dash-stat-note">360 élèves inscrits</span>
              </div>
              <div className="dash-metric-stat">
                <span className="dash-stat-caption">Taux de réussite estimé</span>
                <div className="dash-stat-value-row">
                  <strong className="text-xl font-bold text-emerald-600">92,4 %</strong>
                  <span className="dash-badge-emerald">Objectif atteint</span>
                </div>
                <span className="dash-stat-note">Moyenne &gt; 10/20</span>
              </div>
            </div>

            <div className="dash-subheading-row">
              <span className="dash-subheading">Comparaison des moyennes par niveau</span>
              <span className="text-xs text-slate-500">Moyenne trimestrielle sur 20</span>
            </div>

            <div className="dash-level-bars-container">
              {filteredLevels.map(lvl => {
                const percent = (lvl.value / 20) * 100;
                return (
                  <div key={lvl.label} className="dash-level-row">
                    <div className="dash-level-info">
                      <span className="dash-level-name font-semibold text-slate-800">{lvl.label}</span>
                      <span className="dash-level-students text-slate-500 text-xs">{formatNumber(lvl.students)} élèves</span>
                    </div>
                    <div className="dash-level-bar-track">
                      <div
                        className="dash-level-bar-fill"
                        style={{ width: `${percent}%` }}
                      >
                        <span className="dash-level-bar-tooltip">{lvl.value.toLocaleString("fr-FR")}/20</span>
                      </div>
                    </div>
                    <div className="dash-level-score font-bold text-slate-800 text-sm">
                      {lvl.value.toLocaleString("fr-FR")}<span className="text-slate-400 text-xs font-normal">/20</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="dash-divider-line" />

            {/* Class comparison strip */}
            <div className="dash-subheading-row">
              <span className="dash-subheading">Aperçu par classe représentative</span>
              <span className="text-xs text-slate-500">Du CP à la Terminale</span>
            </div>

            <div className="dash-class-pills-grid">
              {filteredClassPerformance.map(cls => {
                const isHigh = cls.value >= 15.0;
                return (
                  <div key={cls.label} className={`dash-class-pill ${isHigh ? "dash-class-pill--high" : ""}`}>
                    <span className="dash-class-pill-name">{cls.label}</span>
                    <strong className="dash-class-pill-value">{cls.value.toLocaleString("fr-FR")}</strong>
                    <span className="dash-class-pill-max">/20</span>
                  </div>
                );
              })}
            </div>

            {/* Longitudinal Trend */}
            <div className="dash-trend-wrapper">
              <div className="dash-subheading-row">
                <span className="dash-subheading">Trajectoire des 4 derniers trimestres</span>
                <span className="text-xs text-emerald-600 font-semibold">+0,9 pt sur 1 an</span>
              </div>
              <div className="dash-trend-chart-box">
                <svg viewBox="0 0 420 90" className="w-full h-24 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="academicGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  <line x1="20" y1="20" x2="400" y2="20" stroke="#E2E8F0" strokeDasharray="3 3"/>
                  <line x1="20" y1="50" x2="400" y2="50" stroke="#E2E8F0" strokeDasharray="3 3"/>
                  <line x1="20" y1="80" x2="400" y2="80" stroke="#E2E8F0" />
                  
                  {/* Coordinates for academicTrend: 13.7 -> 70, 14.0 -> 55, 14.2 -> 45, 14.6 -> 25 */}
                  <path
                    d="M 40 70 L 150 55 L 260 45 L 370 25 L 370 85 L 40 85 Z"
                    fill="url(#academicGrad)"
                  />
                  <path
                    d="M 40 70 L 150 55 L 260 45 L 370 25"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {academicTrend.map((pt, idx) => {
                    const cx = 40 + idx * 110;
                    const cy = 70 - idx * 15;
                    return (
                      <g key={pt.label}>
                        <circle cx={cx} cy={cy} r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1E293B">
                          {pt.value.toLocaleString("fr-FR")}
                        </text>
                        <text x={cx} y="92" textAnchor="middle" fontSize="10" fill="#64748B">
                          {pt.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </article>

          {/* Student Demographics & Effective Distribution */}
          <article className="dash-card">
            <div className="dash-card-header">
              <div>
                <span className="dash-card-eyebrow">DÉMOGRAPHIE SCOLAIRE</span>
                <h2 className="dash-card-title">Répartition & Inscriptions</h2>
              </div>
              <button
                type="button"
                className="dash-text-link"
                onClick={() => onNavigate("/students")}
              >
                Annuaire des élèves <ExternalLink size={13}/>
              </button>
            </div>

            <div className="dash-student-hero-banner">
              <div>
                <span className="dash-stat-caption">Effectif total consolidé</span>
                <strong className="text-3xl font-extrabold text-slate-800">1 248</strong>
                <span className="text-xs text-slate-500 block mt-1">Élèves inscrits pour l'année 2026–2027</span>
              </div>
              <div className="dash-student-ratios">
                <div className="dash-ratio-box">
                  <span className="text-xs text-slate-500">Filles</span>
                  <strong className="text-base font-bold text-slate-800">612</strong>
                  <span className="text-xs text-indigo-600 font-semibold">49,0 %</span>
                </div>
                <div className="dash-ratio-box">
                  <span className="text-xs text-slate-500">Garçons</span>
                  <strong className="text-base font-bold text-slate-800">636</strong>
                  <span className="text-xs text-blue-600 font-semibold">51,0 %</span>
                </div>
              </div>
            </div>

            {/* Parity Bar */}
            <div className="dash-gender-track">
              <div className="dash-gender-fill-f" style={{ width: "49%" }} title="Filles : 612 (49%)" />
              <div className="dash-gender-fill-m" style={{ width: "51%" }} title="Garçons : 636 (51%)" />
            </div>

            <div className="dash-subheading-row mt-4">
              <span className="dash-subheading">Capacité d'accueil par cycle</span>
              <span className="text-xs text-slate-500">Taux d'occupation</span>
            </div>

            <div className="dash-capacity-list">
              <div className="dash-capacity-row">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700">Cycle Primaire (CP à CM2)</span>
                  <span className="text-slate-500"><strong>420</strong> / 450 places · <b className="text-emerald-600">93 %</b></span>
                </div>
                <div className="dash-capacity-bar">
                  <div className="dash-capacity-fill bg-blue-500" style={{ width: "93%" }} />
                </div>
              </div>

              <div className="dash-capacity-row">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700">Cycle Collège (6e à 3e)</span>
                  <span className="text-slate-500"><strong>468</strong> / 480 places · <b className="text-emerald-600">97 %</b></span>
                </div>
                <div className="dash-capacity-bar">
                  <div className="dash-capacity-fill bg-indigo-500" style={{ width: "97%" }} />
                </div>
              </div>

              <div className="dash-capacity-row">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700">Cycle Lycée (Tronc commun à Bac)</span>
                  <span className="text-slate-500"><strong>360</strong> / 400 places · <b className="text-emerald-600">90 %</b></span>
                </div>
                <div className="dash-capacity-bar">
                  <div className="dash-capacity-fill bg-purple-500" style={{ width: "90%" }} />
                </div>
              </div>
            </div>

            <div className="dash-quick-links-strip">
              <button
                type="button"
                className="dash-quick-action-pill"
                onClick={() => onNavigate("/classes-groups")}
              >
                <BookOpen size={14} className="text-blue-600" />
                <span>Consulter les 42 classes</span>
              </button>
              <button
                type="button"
                className="dash-quick-action-pill"
                onClick={() => onNavigate("/sectors-programs")}
              >
                <Award size={14} className="text-purple-600" />
                <span>Filières et spécialités</span>
              </button>
            </div>
          </article>
        </section>
      )}

      {/* TAB CONTENT 2: ATTENDANCE & STUDENT CARE (VIE SCOLAIRE) */}
      {(activeTab === "overview" || activeTab === "attendance") && (
        <section className="dash-grid-double mt-5">
          {/* Daily Attendance Pulse */}
          <article className="dash-card">
            <div className="dash-card-header">
              <div>
                <span className="dash-card-eyebrow">VIE SCOLAIRE & ASSIDUITÉ</span>
                <h2 className="dash-card-title">Suivi des présences & Ponctualité</h2>
              </div>
              <div className="dash-card-actions">
                <button
                  type="button"
                  className="dash-btn dash-btn--sm dash-btn--emerald"
                  onClick={handleNotifyAbsentParents}
                  title="Envoyer une alerte aux familles des absents d'aujourd'hui"
                >
                  <Send size={13} />
                  <span>Notifier les familles</span>
                </button>
                <button
                  type="button"
                  className="dash-text-link"
                  onClick={() => onNavigate("/student-attendance")}
                >
                  Détail par classe <ArrowRight size={13}/>
                </button>
              </div>
            </div>

            {/* Attendance Big KPI Triplet */}
            <div className="dash-attendance-pulse-deck">
              <div className="dash-pulse-card dash-pulse-card--present">
                <div className="flex items-center gap-2">
                  <span className="dash-bullet dash-bullet--present" />
                  <span className="dash-stat-caption">Élèves présents</span>
                </div>
                <strong className="text-2xl font-bold text-emerald-700">1 176</strong>
                <span className="text-xs text-emerald-600 font-semibold">94,2 % du total</span>
              </div>
              <div className="dash-pulse-card dash-pulse-card--absent">
                <div className="flex items-center gap-2">
                  <span className="dash-bullet dash-bullet--absent" />
                  <span className="dash-stat-caption">Absents signalés</span>
                </div>
                <strong className="text-2xl font-bold text-rose-700">49</strong>
                <span className="text-xs text-rose-600 font-semibold">3,9 % (32 justifiées)</span>
              </div>
              <div className="dash-pulse-card dash-pulse-card--late">
                <div className="flex items-center gap-2">
                  <span className="dash-bullet dash-bullet--late" />
                  <span className="dash-stat-caption">Retards du matin</span>
                </div>
                <strong className="text-2xl font-bold text-amber-700">23</strong>
                <span className="text-xs text-amber-600 font-semibold">1,9 % régularisés</span>
              </div>
            </div>

            {/* Daily Trend Chart for attendance */}
            <div className="dash-subheading-row mt-4">
              <span className="dash-subheading">Historique des présences sur la période</span>
              <span className="text-xs text-slate-500">Taux de présence effectif</span>
            </div>

            <div className="dash-attendance-barchart">
              {attendanceSeries.map((day, idx) => (
                <div key={`${day.label}-${idx}`} className="dash-attendance-bar-col">
                  <span className="dash-att-val text-xs font-semibold text-slate-700">{day.present}%</span>
                  <div className="dash-att-bar-track">
                    <div className="dash-att-slice dash-att-slice--present" style={{ height: `${day.present}%` }} />
                    <div className="dash-att-slice dash-att-slice--late" style={{ height: `${day.late * 4}%` }} />
                    <div className="dash-att-slice dash-att-slice--absent" style={{ height: `${day.absent * 4}%` }} />
                  </div>
                  <span className="dash-att-day text-xs text-slate-500">{day.label}</span>
                </div>
              ))}
            </div>

            <div className="dash-legend-strip">
              <span className="dash-legend-item"><i className="dash-legend-dot bg-emerald-500"/> Présents</span>
              <span className="dash-legend-item"><i className="dash-legend-dot bg-amber-400"/> Retards</span>
              <span className="dash-legend-item"><i className="dash-legend-dot bg-rose-500"/> Absences non justifiées</span>
            </div>
          </article>

          {/* Early Intervention & Students Requiring Support */}
          <article className="dash-card">
            <div className="dash-card-header">
              <div>
                <span className="dash-card-eyebrow">ACCOMPAGNEMENT INDIVIDUALISÉ</span>
                <h2 className="dash-card-title">Élèves prioritaires & Suivi de vigilance</h2>
              </div>
              <span className="dash-badge-amber">
                <ShieldAlert size={13} className="text-amber-600" />
                12 élèves signalés
              </span>
            </div>

            {/* Filter pills for risk */}
            <div className="dash-risk-filter-bar">
              <div className="dash-search-input-wrap">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrer par nom ou identifiant..."
                  value={globalSearch}
                  onChange={e => setGlobalSearch(e.target.value)}
                  className="dash-inline-search"
                />
                {globalSearch && (
                  <button type="button" onClick={() => setGlobalSearch("")} aria-label="Effacer">
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="dash-risk-tag-filters">
                {["Tous", "Absences répétées", "Baisse des résultats", "Impayés"].map(risk => (
                  <button
                    key={risk}
                    type="button"
                    className={`dash-risk-filter-btn ${riskFilter === risk ? "dash-risk-filter-btn--active" : ""}`}
                    onClick={() => setRiskFilter(risk)}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>

            {/* Students Table */}
            <div className="dash-table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Classe</th>
                    <th>Signalement</th>
                    <th>Statut dossier</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                        Aucun élève ne correspond aux critères de filtre.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr key={student.id} className="dash-table-row">
                        <td>
                          <div className="dash-student-cell">
                            <span className="dash-student-avatar">{student.initials}</span>
                            <div>
                              <strong className="text-xs font-semibold text-slate-800 block">{student.name}</strong>
                              <span className="text-xs text-slate-400">{student.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="dash-class-badge">{student.className}</span>
                        </td>
                        <td>
                          <span className={`dash-risk-badge-cell dash-risk-badge-cell--${student.tone}`}>
                            {student.risk}
                          </span>
                          <span className="text-xs text-slate-400 block mt-0.5">{student.reason}</span>
                        </td>
                        <td>
                          <span className={`dash-status-pill dash-status-pill--${student.status === "Résolu" ? "done" : student.status === "En cours" ? "progress" : "todo"}`}>
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="dash-action-icon-btn"
                            onClick={() => setSelectedStudentId(student.id)}
                            title={`Consulter le dossier de ${student.name}`}
                          >
                            <ExternalLink size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="dash-card-footer">
              <span className="text-xs text-slate-400">Cliquez sur un élève pour ouvrir son dossier et planifier un entretien</span>
              <button
                type="button"
                className="dash-text-link"
                onClick={() => onNavigate("/student-risk")}
              >
                Ouvrir le module de vie scolaire <ArrowRight size={13}/>
              </button>
            </div>
          </article>
        </section>
      )}

      {/* TAB CONTENT 3: OPERATIONS & FINANCES */}
      {(activeTab === "overview" || activeTab === "operations") && (
        <section className="dash-grid-double mt-5">
          {/* Pending Approvals Hub */}
          <article className="dash-card">
            <div className="dash-card-header">
              <div>
                <span className="dash-card-eyebrow">FLUX OPÉRATIONNELS</span>
                <h2 className="dash-card-title">Validations & Demandes en attente</h2>
              </div>
              <span className="dash-badge-blue">
                {approvalsList.length} catégories à traiter
              </span>
            </div>

            <div className="dash-approvals-deck">
              {approvalsList.length === 0 ? (
                <div className="dash-empty-approvals">
                  <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                  <strong className="text-slate-800 text-sm">Toutes les validations sont à jour !</strong>
                  <p className="text-slate-400 text-xs">Aucune soumission n'est actuellement en attente d'arbitrage de la direction.</p>
                </div>
              ) : (
                approvalsList.map(item => (
                  <div key={item.id} className="dash-approval-card">
                    <div className="dash-approval-icon-col">
                      <span className="dash-approval-icon-box">
                        {item.icon === "grades" ? <BadgeCheck size={18} className="text-blue-600" /> :
                         item.icon === "reports" ? <Receipt size={18} className="text-purple-600" /> :
                         <BookOpenCheck size={18} className="text-emerald-600" />}
                      </span>
                    </div>
                    <div className="dash-approval-body">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-slate-800">{item.title}</strong>
                        <span className="dash-count-badge font-bold">{item.count}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                    </div>
                    <div className="dash-approval-actions">
                      <button
                        type="button"
                        className="dash-btn-quick-approve"
                        onClick={() => handleQuickApprove(item.id, item.title)}
                        title="Valider immédiatement ce lot"
                      >
                        <Check size={13} />
                        <span>Valider</span>
                      </button>
                      <button
                        type="button"
                        className="dash-btn-inspect"
                        onClick={() => onNavigate(item.route)}
                        title="Consulter le détail avant validation"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="dash-card-footer mt-4">
              <span className="text-xs text-slate-400">Les validations approuvées sont transmises directement aux enseignants et coordinateurs</span>
              <button
                type="button"
                className="dash-text-link"
                onClick={() => onNavigate("/grades-validation")}
              >
                Espace de validation des notes <ArrowRight size={13}/>
              </button>
            </div>
          </article>

          {/* Financial Performance Overview */}
          <article className="dash-card">
            <div className="dash-card-header">
              <div>
                <span className="dash-card-eyebrow">SITUATION BUDGÉTAIRE</span>
                <h2 className="dash-card-title">Recettes & Recouvrement financier</h2>
              </div>
              <button
                type="button"
                className="dash-text-link"
                onClick={() => onNavigate("/financial-reports")}
              >
                Rapport financier détaillé <ExternalLink size={13}/>
              </button>
            </div>

            {/* Financial Summary Triplet */}
            <div className="dash-finance-overview-deck">
              <div className="dash-finance-stat-card">
                <span className="dash-stat-caption">Total encaissé</span>
                <strong className="text-xl font-bold text-slate-800">{financialSummary.collected}</strong>
                <span className="dash-badge-emerald mt-1">
                  <ArrowUpRight size={11} /> {financialSummary.comparison} vs N-1
                </span>
              </div>
              <div className="dash-finance-stat-card">
                <span className="dash-stat-caption">Impayés à recouvrer</span>
                <strong className="text-xl font-bold text-rose-700">{financialSummary.outstanding}</strong>
                <span className="text-xs text-slate-500 mt-1 block">127 dossiers en relance</span>
              </div>
              <div className="dash-finance-stat-card">
                <span className="dash-stat-caption">Dépenses opérationnelles</span>
                <strong className="text-xl font-bold text-slate-800">{financialSummary.expenses}</strong>
                <span className="text-xs text-slate-500 mt-1 block">Budget sous contrôle</span>
              </div>
            </div>

            {/* Collection Progress */}
            <div className="dash-collection-meter mt-4">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Taux de recouvrement des frais scolaires</span>
                <span className="text-slate-600"><strong>87,4 %</strong> de l'objectif trimestriel atteint</span>
              </div>
              <div className="dash-collection-track">
                <div className="dash-collection-fill bg-emerald-500" style={{ width: "87.4%" }} />
              </div>
            </div>

            {/* Revenue Trend by Range */}
            <div className="dash-subheading-row mt-4">
              <span className="dash-subheading">Flux des encaissements sur {range === "7" ? "7 jours" : range === "30" ? "30 jours" : "90 jours"}</span>
              <span className="text-xs text-slate-400">Montants en milliers de DH</span>
            </div>

            <div className="dash-revenue-barchart">
              {revenue.map(item => {
                const max = Math.max(...revenue.map(r => r.amount), 100);
                const heightPct = (item.amount / max) * 100;
                return (
                  <div key={item.label} className="dash-rev-bar-col">
                    <span className="dash-rev-val text-xs font-semibold text-slate-700">{item.amount}k</span>
                    <div className="dash-rev-track">
                      <div className="dash-rev-fill" style={{ height: `${heightPct}%` }} />
                    </div>
                    <span className="dash-rev-label text-xs text-slate-500">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      )}

      {/* Activity Timeline Section (Available on Overview) */}
      {activeTab === "overview" && (
        <section className="dash-card mt-5">
          <div className="dash-card-header">
            <div>
              <span className="dash-card-eyebrow">TRAÇABILITÉ</span>
              <h2 className="dash-card-title">Journal d'activité récent de l'établissement</h2>
            </div>
            <button
              type="button"
              className="dash-text-link"
              onClick={() => onNavigate("/activity-history")}
            >
              Historique complet des opérations <ArrowRight size={13}/>
            </button>
          </div>

          <div className="dash-timeline-list">
            {recentActivities.slice(0, 5).map(act => (
              <div key={act.id} className="dash-timeline-row">
                <span className={`dash-timeline-icon dash-timeline-icon--${act.type}`}>
                  {act.type === "student" ? <GraduationCap size={15} /> :
                   act.type === "payment" ? <Banknote size={15} /> :
                   act.type === "grade" ? <BadgeCheck size={15} /> :
                   act.type === "attendance" ? <CalendarDays size={15} /> :
                   act.type === "course" ? <BookOpen size={15} /> :
                   <UserRound size={15} />}
                </span>
                <div className="dash-timeline-content">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-slate-800">{act.title}</strong>
                    <span className="dash-timeline-dot">·</span>
                    <span className="text-xs text-slate-500">{act.description}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>Par <strong>{act.actor}</strong></span>
                    <span>·</span>
                    <time>{act.daysAgo === 0 ? "Aujourd'hui" : act.daysAgo === 1 ? "Hier" : `Il y a ${act.daysAgo} j`} à {act.time}</time>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODAL 1: STUDENT DOSSIER INSPECTOR & EARLY INTERVENTION */}
      {selectedStudent && (
        <div
          className="dash-modal-backdrop"
          role="presentation"
          onMouseDown={e => { if (e.target === e.currentTarget) setSelectedStudentId(null); }}
        >
          <div className="dash-modal-window" role="dialog" aria-modal="true" aria-labelledby="modal-student-name">
            <header className="dash-modal-header">
              <div className="flex items-center gap-3">
                <span className="dash-modal-avatar">{selectedStudent.initials}</span>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block tracking-wide uppercase">Dossier de suivi prioritaire · {selectedStudent.id}</span>
                  <h2 id="modal-student-name" className="text-lg font-bold text-slate-800">{selectedStudent.name}</h2>
                </div>
              </div>
              <button
                type="button"
                className="dash-modal-close-btn"
                onClick={() => setSelectedStudentId(null)}
                aria-label="Fermer"
              >
                <X size={17} />
              </button>
            </header>

            <div className="dash-modal-body">
              <div className="dash-modal-info-grid">
                <div className="dash-modal-info-box">
                  <span className="dash-modal-box-label">Classe actuelle</span>
                  <strong className="dash-modal-box-val">{selectedStudent.className}</strong>
                </div>
                <div className="dash-modal-info-box">
                  <span className="dash-modal-box-label">Motif de vigilance</span>
                  <strong className="dash-modal-box-val text-amber-700">{selectedStudent.risk}</strong>
                </div>
                <div className="dash-modal-info-box">
                  <span className="dash-modal-box-label">Statut du suivi</span>
                  <span className={`dash-status-pill dash-status-pill--${selectedStudent.status === "Résolu" ? "done" : selectedStudent.status === "En cours" ? "progress" : "todo"}`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>

              <div className="dash-modal-section">
                <h4 className="text-xs font-bold text-slate-700 mb-1">Diagnostic et constat de l'équipe :</h4>
                <div className="dash-modal-reason-box">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedStudent.reason}</p>
                </div>
              </div>

              <div className="dash-modal-section">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Actions d'accompagnement de la Direction :</h4>
                <div className="dash-modal-status-buttons">
                  <button
                    type="button"
                    className={`dash-status-toggle-btn ${selectedStudent.status === "À démarrer" ? "dash-status-toggle-btn--active" : ""}`}
                    onClick={() => handleUpdateStudentStatus(selectedStudent.id, "À démarrer")}
                  >
                    À démarrer
                  </button>
                  <button
                    type="button"
                    className={`dash-status-toggle-btn ${selectedStudent.status === "En cours" ? "dash-status-toggle-btn--active" : ""}`}
                    onClick={() => handleUpdateStudentStatus(selectedStudent.id, "En cours")}
                  >
                    En cours de suivi
                  </button>
                  <button
                    type="button"
                    className={`dash-status-toggle-btn ${selectedStudent.status === "Résolu" ? "dash-status-toggle-btn--active" : ""}`}
                    onClick={() => handleUpdateStudentStatus(selectedStudent.id, "Résolu")}
                  >
                    Situation résolue
                  </button>
                </div>
              </div>
            </div>

            <footer className="dash-modal-footer">
              <button
                type="button"
                className="dash-btn dash-btn--secondary"
                onClick={() => setSelectedStudentId(null)}
              >
                Fermer
              </button>
              <button
                type="button"
                className="dash-btn dash-btn--primary"
                onClick={() => {
                  setSelectedStudentId(null);
                  onNavigate("/student-risk");
                }}
              >
                <span>Accéder au dossier complet</span>
                <ArrowRight size={14} />
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE EXECUTIVE SYNTHESIS REPORT */}
      {showSummaryModal && (
        <div
          className="dash-modal-backdrop"
          role="presentation"
          onMouseDown={e => { if (e.target === e.currentTarget) setShowSummaryModal(false); }}
        >
          <div className="dash-modal-window dash-modal-window--large" role="dialog" aria-modal="true">
            <header className="dash-modal-header">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-800">Fiche de Synthèse Exécutive de Direction</h2>
                  <span className="text-xs text-slate-500">Document prêt pour impression ou présentation au conseil de gestion</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="dash-btn dash-btn--sm dash-btn--primary"
                  onClick={() => window.print()}
                >
                  <Printer size={13} />
                  <span>Imprimer la fiche</span>
                </button>
                <button
                  type="button"
                  className="dash-modal-close-btn"
                  onClick={() => setShowSummaryModal(false)}
                  aria-label="Fermer"
                >
                  <X size={17} />
                </button>
              </div>
            </header>

            <div className="dash-modal-body print-ready-body">
              <div className="dash-print-meta-header">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">North Star International School</h3>
                  <p className="text-xs text-slate-500">Rapport de direction · Année scolaire 2026–2027 · Trimestre 1</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-700 block">Édité par : {user.displayName}</span>
                  <span className="text-xs text-slate-400">{today}</span>
                </div>
              </div>

              <div className="dash-print-grid">
                <div className="dash-print-metric-box">
                  <span className="text-xs text-slate-500">Effectifs inscrits</span>
                  <strong className="text-xl font-bold text-slate-800">1 248 élèves</strong>
                  <span className="text-xs text-slate-400">42 classes en activité</span>
                </div>
                <div className="dash-print-metric-box">
                  <span className="text-xs text-slate-500">Moyenne générale</span>
                  <strong className="text-xl font-bold text-blue-700">14,6 / 20</strong>
                  <span className="text-xs text-emerald-600">+0,4 pt vs N-1</span>
                </div>
                <div className="dash-print-metric-box">
                  <span className="text-xs text-slate-500">Taux de présence</span>
                  <strong className="text-xl font-bold text-emerald-700">94,2 %</strong>
                  <span className="text-xs text-slate-400">1 176 élèves présents ce jour</span>
                </div>
                <div className="dash-print-metric-box">
                  <span className="text-xs text-slate-500">Recouvrement financier</span>
                  <strong className="text-xl font-bold text-slate-800">87,4 %</strong>
                  <span className="text-xs text-slate-400">1 284 000 DH encaissés</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Moyennes par cycle éducatif</h4>
                <table className="w-full text-xs border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 text-left font-semibold text-slate-600 border-b">Cycle</th>
                      <th className="p-2 text-center font-semibold text-slate-600 border-b">Effectif</th>
                      <th className="p-2 text-right font-semibold text-slate-600 border-b">Moyenne trimestrielle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicLevels.map(lvl => (
                      <tr key={lvl.label} className="border-b">
                        <td className="p-2 font-medium text-slate-800">{lvl.label}</td>
                        <td className="p-2 text-center text-slate-600">{lvl.students}</td>
                        <td className="p-2 text-right font-bold text-slate-800">{lvl.value.toLocaleString("fr-FR")} / 20</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Priorités de la Direction Générale :</h4>
                <p className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-200">
                  {directorNotes}
                </p>
              </div>
            </div>

            <footer className="dash-modal-footer">
              <button
                type="button"
                className="dash-btn dash-btn--secondary"
                onClick={() => setShowSummaryModal(false)}
              >
                Fermer
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
