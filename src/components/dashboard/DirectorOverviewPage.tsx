import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertCircle, AlertTriangle, ArrowRight, ArrowUpRight, Banknote, BookOpen,
  BriefcaseBusiness, Building2, Bus, CalendarCheck, CalendarDays, Check, CheckCircle2,
  ChevronRight, ClipboardCheck, ClipboardList, ClipboardPenLine, Clock3, CreditCard,
  FileCheck2, GraduationCap, HandCoins, Info, MapPin, Package, RefreshCw,
  ShieldAlert, ShieldCheck, Truck, UserCheck, UserPlus, UserRoundCheck, Users, Wallet,
} from "lucide-react";
import { studentsRepository, type StudentsData } from "../../services/students";
import { teachersRepository, type TeachersData } from "../../services/teachers";
import { employeesRepository, type EmployeesData } from "../../services/employees";
import { inventoryRepository, type InventoryData } from "../../services/inventory";
import { transportRepository, type TransportData } from "../../services/transport";
import {
  financeExpenses, outstandingBalances, inventoryAlerts, transportLines,
  upcomingTrips, recentIncidents,
} from "../../data/finance-logistics-dashboard";
import { weekAgenda } from "../../data/director-dashboard";
import { schoolBranding } from "../../config/school";
import type { AuthenticatedSidebarUser } from "../../types/navigation";
import "./DirectorOverviewPage.css";

interface Props {
  user: AuthenticatedSidebarUser;
  onNavigate: (route: string) => void;
}

type LoadState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };

type IncidentItem = {
  id: string;
  title: string;
  personName?: string;
  personClass?: string;
  location: string;
  occurredAt: string;
  severity: "Critique" | "Élevée" | "Modérée" | "Faible";
  status: "À examiner" | "En suivi" | "En cours" | "Clôturé";
};

type StockAlertItem = {
  id: string;
  name: string;
  quantity: number;
  minimum: number;
  unit: string;
  category: string;
  status: "Critique" | "Stock faible" | "Stock disponible";
};

type PriorityItem = {
  id: string;
  title: string;
  context: string;
  category: "incident" | "stock" | "finance" | "pedagogy" | "admin";
  severity: "Critique" | "Élevée" | "Modérée" | "Faible";
  route: string;
  action: string;
};

const number = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
const dh = (n: number) => `${number(n)} DH`;
const dateLabel = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

const DEMO_FALLBACK = {
  attendance: { present: 1176, absent: 49, late: 23, total: 1248, rate: 94.2 },
  finance: {
    collected: 1284000,
    outstanding: 184500,
    debtorsCount: 127,
    expensesTotal: 642300,
    expensesCount: 48,
    recoveryRate: 84.9,
    comparison: "−6,2 %",
  },
  transportSummary: { activeLines: 3, totalLines: 4, vehiclesCount: 4 },
};

export function DirectorOverviewPage({ user, onNavigate }: Props) {
  const allowed = (permission: string) => user.permissions.includes(permission as never);
  const isDirector = user.role === "director" && allowed("overview.view");

  const [studentsState, setStudentsState] = useState<LoadState<StudentsData>>({ status: "loading" });
  const [teachersState, setTeachersState] = useState<LoadState<TeachersData>>({ status: "loading" });
  const [employeesState, setEmployeesState] = useState<LoadState<EmployeesData>>({ status: "loading" });
  const [inventoryState, setInventoryState] = useState<LoadState<InventoryData>>({ status: "loading" });
  const [transportState, setTransportState] = useState<LoadState<TransportData>>({ status: "loading" });

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState("");
  const [yearId, setYearId] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "academic" | "students" | "operations" | "finance" | "activity">("overview");

  // Load all local data asynchronously
  useEffect(() => {
    let alive = true;

    studentsRepository.list()
      .then((data) => {
        if (alive) {
          setStudentsState({ status: "ready", data });
          setYearId((current) => current || data.academicYears.find((y) => y.status === "Active")?.id || "");
        }
      })
      .catch((e) => {
        if (alive) setStudentsState({ status: "error", message: e instanceof Error ? e.message : "Erreur élèves" });
      });

    teachersRepository.list()
      .then((data) => {
        if (alive) setTeachersState({ status: "ready", data });
      })
      .catch((e) => {
        if (alive) setTeachersState({ status: "error", message: e instanceof Error ? e.message : "Erreur enseignants" });
      });

    employeesRepository.list()
      .then((data) => {
        if (alive) setEmployeesState({ status: "ready", data });
      })
      .catch((e) => {
        if (alive) setEmployeesState({ status: "error", message: e instanceof Error ? e.message : "Erreur personnel" });
      });

    inventoryRepository.list()
      .then((data) => {
        if (alive) setInventoryState({ status: "ready", data });
      })
      .catch((e) => {
        if (alive) setInventoryState({ status: "error", message: e instanceof Error ? e.message : "Erreur inventaire" });
      });

    transportRepository.list()
      .then((data) => {
        if (alive) setTransportState({ status: "ready", data });
      })
      .catch((e) => {
        if (alive) setTransportState({ status: "error", message: e instanceof Error ? e.message : "Erreur transport" });
      });

    return () => { alive = false; };
  }, [refreshKey]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey((v) => v + 1);
    window.setTimeout(() => {
      setIsRefreshing(false);
      setRefreshToast("Données du tableau de bord actualisées");
      window.setTimeout(() => setRefreshToast(""), 3000);
    }, 450);
  }, []);

  // Derived student figures
  const studentData = studentsState.status === "ready" ? studentsState.data : null;
  const year = studentData?.academicYears.find((y) => y.id === yearId) ?? null;
  const yearRows = useMemo(
    () => studentData?.students.filter((s) => s.enrollment?.academicYearId === yearId) ?? studentData?.students ?? [],
    [studentData, yearId]
  );
  const activeStudents = useMemo(
    () => yearRows.filter((s) => s.enrollment?.status === "Actif"),
    [yearRows]
  );
  const totalEnrolledStudents = yearRows.length || 1248;
  const activeStudentsCount = activeStudents.length || 1216;

  // Breakdown by educational cycle
  const cycles = useMemo(() => {
    const map = new Map<string, number>();
    activeStudents.forEach((s) => {
      const k = s.cycleName && s.cycleName !== "—" ? s.cycleName : s.levelName || "Cycles scolaires";
      map.set(k, (map.get(k) || 0) + 1);
    });
    if (map.size === 0) {
      return [{ name: "Primaire", count: 420 }, { name: "Collège", count: 468 }, { name: "Lycée", count: 360 }];
    }
    return [...map].map(([name, count]) => ({ name, count }));
  }, [activeStudents]);

  // Derived staff figures
  const teacherRows = teachersState.status === "ready" ? teachersState.data.teachers : [];
  const employeeRows = employeesState.status === "ready" ? employeesState.data.employees : [];
  const activeTeachersCount = teacherRows.filter((t) => t.employmentStatus === "Actif").length || 86;
  const activeEmployeesCount = employeeRows.filter((e) => e.employmentStatus === "Actif").length || 34;
  const totalStaffCount = activeTeachersCount + activeEmployeesCount;

  // Incidents data (reconciled from localStorage and dashboard records)
  const openIncidents = useMemo<IncidentItem[]>(() => {
    const items: IncidentItem[] = [];

    // Attempt to load from localStorage first
    try {
      const raw = localStorage.getItem("school-platform-incident-demo-v1");
      if (raw) {
        const stored = JSON.parse(raw) as Array<{
          id: string;
          category: string;
          description: string;
          location: string;
          occurredAt: string;
          status: "À examiner" | "En suivi" | "Clôturé";
          people?: Array<{ name: string; className?: string }>;
        }>;
        stored
          .filter((inc) => inc.status !== "Clôturé")
          .forEach((inc) => {
            const isCritical = inc.category.includes("sécurité") || inc.category.includes("Accident");
            items.push({
              id: inc.id,
              title: inc.description || inc.category,
              personName: inc.people?.[0]?.name,
              personClass: inc.people?.[0]?.className,
              location: inc.location,
              occurredAt: inc.occurredAt ? new Date(inc.occurredAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "Récemment",
              severity: isCritical ? "Élevée" : "Modérée",
              status: inc.status,
            });
          });
      }
    } catch {
      // ignore
    }

    // Add recent incidents if not present
    recentIncidents
      .filter((inc) => inc.status !== "Résolu")
      .forEach((inc) => {
        if (!items.some((i) => i.id === inc.id)) {
          items.push({
            id: inc.id,
            title: inc.summary,
            location: inc.category.includes("transport") ? "Ligne Californie (TR-02)" : "Établissement",
            occurredAt: inc.date ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(inc.date)) : "Récemment",
            severity: (inc.severity as IncidentItem["severity"]) || "Élevée",
            status: "En cours",
          });
        }
      });

    // Fallback seed incident if empty
    if (items.length === 0) {
      items.push({
        id: "INC-108",
        title: "Incident de circulation signalé sur le circuit Californie",
        location: "Ligne Californie · Bus 02",
        occurredAt: "Aujourd'hui 07:45",
        severity: "Élevée",
        status: "En cours",
      });
      items.push({
        id: "INC-SCOL-003",
        title: "Chute d'un élève pendant la récréation",
        personName: "Adam El Mansouri",
        personClass: "3e B",
        location: "Cour de récréation",
        occurredAt: "05 nov. 10:25",
        severity: "Élevée",
        status: "En suivi",
      });
    }

    return items;
  }, []);

  // Stock alerts
  const stockAlerts = useMemo<StockAlertItem[]>(() => {
    const list: StockAlertItem[] = [];

    // From inventory repository
    if (inventoryState.status === "ready") {
      inventoryState.data.items
        .filter((item) => item.minimum !== null && item.quantity <= item.minimum)
        .forEach((item) => {
          list.push({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            minimum: item.minimum || 0,
            unit: item.unit,
            category: item.category,
            status: item.quantity === 0 ? "Critique" : "Stock faible",
          });
        });
    }

    // Combine with finance-logistics inventoryAlerts
    inventoryAlerts.forEach((item) => {
      if (!list.some((i) => i.id === item.id)) {
        list.push({
          id: item.id,
          name: item.item,
          quantity: item.quantity,
          minimum: item.minimum,
          unit: "unités",
          category: "Consommables",
          status: item.status === "Critique" ? "Critique" : item.status === "Faible" ? "Stock faible" : "Stock disponible",
        });
      }
    });

    // Sort: Critical first, then low stock
    return list.sort((a, b) => {
      const rank = { "Critique": 0, "Stock faible": 1, "Stock disponible": 2 };
      return rank[a.status] - rank[b.status];
    });
  }, [inventoryState]);

  // Transport overview
  const transportData = useMemo(() => {
    const lines = transportLines.map((line) => {
      return {
        id: line.id,
        name: line.name,
        assigned: line.assigned,
        capacity: line.capacity || 35,
        status: line.status,
        vehicle: line.id === "TR-01" ? "Mercedes Sprinter (VEH-001)" : line.id === "TR-02" ? "Iveco Daily (VEH-002)" : line.id === "TR-04" ? "Renault Master (VEH-003)" : "À affecter",
      };
    });
    return {
      lines,
      activeCount: lines.filter((l) => l.status === "Active").length,
      totalCount: lines.length,
      trips: upcomingTrips,
    };
  }, []);

  // Dynamic Director Priorities
  const dynamicPriorities = useMemo<PriorityItem[]>(() => {
    const priorities: PriorityItem[] = [];

    // 1. Critical & High Safety Incidents
    openIncidents.forEach((inc) => {
      priorities.push({
        id: `inc-${inc.id}`,
        title: inc.title,
        context: `${inc.location}${inc.personName ? ` · ${inc.personName}` : ""} (${inc.status})`,
        category: "incident",
        severity: inc.severity,
        route: "/accidents-incidents",
        action: "Traiter l'incident",
      });
    });

    // 2. Critical Stock Shortages (quantity == 0 or below minimum)
    stockAlerts
      .filter((s) => s.status === "Critique")
      .forEach((s) => {
        priorities.push({
          id: `stock-${s.id}`,
          title: `Rupture ou stock critique : ${s.name}`,
          context: `${s.quantity} ${s.unit} restant(s) · Seuil d'alerte : ${s.minimum}`,
          category: "stock",
          severity: "Critique",
          route: "/inventory",
          action: "Réapprovisionner",
        });
      });

    // 3. Outstanding Balances & Financial Issues
    priorities.push({
      id: "finance-outstanding",
      title: `${DEMO_FALLBACK.finance.debtorsCount} dossiers d'impayés de scolarité à relancer`,
      context: `Montant total à recouvrer : ${dh(DEMO_FALLBACK.finance.outstanding)}`,
      category: "finance",
      severity: "Modérée",
      route: "/student-balances",
      action: "Relancer les familles",
    });

    // 4. Pending Pedagogical Validations
    priorities.push({
      id: "pedagogy-grades",
      title: "18 notes trimestrielles en attente de validation",
      context: "6 classes concernées · Contrôle de clôture de période",
      category: "pedagogy",
      severity: "Modérée",
      route: "/grades-validation",
      action: "Valider les notes",
    });

    priorities.push({
      id: "pedagogy-reports",
      title: "4 rapports pédagogiques soumis par les enseignants",
      context: "En attente d'approbation par la direction",
      category: "pedagogy",
      severity: "Faible",
      route: "/pedagogical-reports",
      action: "Lire les rapports",
    });

    // 5. Inscriptions en attente
    const pendingStudents = yearRows.filter((s) => s.enrollment?.status === "En attente").length;
    if (pendingStudents > 0) {
      priorities.push({
        id: "admin-pending-enrollments",
        title: `${pendingStudents} dossier(s) d'inscription en attente de décision`,
        context: "Pièces à valider pour confirmer l'affectation en classe",
        category: "admin",
        severity: "Faible",
        route: "/students",
        action: "Examiner les dossiers",
      });
    }

    // Sort order: Critique -> Élevée -> Modérée -> Faible
    const rank: Record<PriorityItem["severity"], number> = {
      "Critique": 0,
      "Élevée": 1,
      "Modérée": 2,
      "Faible": 3,
    };

    return priorities.sort((a, b) => rank[a.severity] - rank[b.severity]);
  }, [openIncidents, stockAlerts, yearRows]);

  // Greeting logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const firstName = user.displayName.trim().split(/\s+/)[0] || "Directeur";

  if (!isDirector) {
    return (
      <main className="director-dashboard">
        <div className="director-card">
          <div className="director-empty-state">
            <ShieldAlert size={24} />
            <span>Accès réservé au directeur de l'établissement.</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="director-dashboard" id="main-content">
      {/* ====================================================================
          A. PAGE HEADER & CONTEXT
          ==================================================================== */}
      <header className="director-header">
        <div className="director-welcome">
          <div className="director-welcome-copy">
            <div className="director-breadcrumb">
              <GraduationCap size={15} />
              <span>Direction</span>
              <span>/</span>
              <strong>Tableau de bord de pilotage</strong>
            </div>
            <h1>{greeting}, {firstName}</h1>
            <p>Voici la situation de votre établissement aujourd'hui.</p>
            <div className="director-context">
              <span className="director-context-chip">
                <Building2 size={14} />
                <strong className="director-school-name">{schoolBranding.name}</strong>
              </span>
              <span className="director-context-chip">
                <CalendarDays size={14} />
                <span>{dateLabel}</span>
              </span>
              {year?.name && (
                <span className="director-context-chip">
                  <span>Année {year.name} ({year.status})</span>
                </span>
              )}
            </div>
          </div>

          <div className="director-welcome-actions">
            <label className="director-period">
              <span>Année scolaire active</span>
              <select
                value={yearId}
                onChange={(e) => setYearId(e.target.value)}
                disabled={!studentData?.academicYears.length}
                aria-label="Sélectionner l'année scolaire"
              >
                {studentData?.academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name} · {y.status}
                  </option>
                ))}
              </select>
            </label>

            <button
              className={`director-refresh-btn ${isRefreshing ? "is-spinning" : ""}`}
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Actualiser les données"
            >
              <RefreshCw size={15} />
              <span>{isRefreshing ? "Actualisation…" : "Actualiser"}</span>
            </button>
          </div>
        </div>

        {refreshToast && (
          <div className="director-toast" role="status">
            <Check size={16} />
            <span>{refreshToast}</span>
          </div>
        )}

        <div className="director-demo-banner" role="note">
          <span>
            <AlertCircle size={16} />
            <strong>Mode démonstration</strong>
          </span>
          <p>Les données affichées sont locales et ne représentent pas des données réelles.</p>
        </div>

        {/* Domain Navigation Tabs */}
        <nav className="director-tabs" role="tablist" aria-label="Domaines du tableau de bord">
          {[
            ["overview", "Vue générale"],
            ["academic", "Académique"],
            ["students", "Élèves & inscriptions"],
            ["operations", "Personnel & opérations"],
            ["finance", "Finances & régies"],
            ["activity", "Validations & activité"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              className={activeTab === key ? "is-active" : ""}
              onClick={() => setActiveTab(key as typeof activeTab)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* ====================================================================
          TAB: VUE GÉNÉRALE (DEFAULT COMMAND CENTER)
          ==================================================================== */}
      {activeTab === "overview" && (
        <>
          {/* ================================================================
              B. TOP KPI STRIP (6 CLICKABLE CARDS)
              ================================================================ */}
          <section className="director-kpi-strip" aria-label="Indicateurs clés opérationnels">
            {/* KPI 1 — Élèves inscrits */}
            <button
              type="button"
              className="director-kpi-card"
              onClick={() => onNavigate("/students")}
              aria-label="Consulter les dossiers élèves"
            >
              <div className="director-kpi-top">
                <div className="director-kpi-icon director-kpi-icon--blue">
                  <GraduationCap size={18} />
                </div>
                <span className="director-kpi-tag director-kpi-tag--success">
                  <span className="director-kpi-dot" />
                  Actif
                </span>
              </div>
              <div>
                <span className="director-kpi-label">Élèves inscrits</span>
                <div className="director-kpi-value">{number(activeStudentsCount)}</div>
              </div>
              <div className="director-kpi-detail">
                <span>{cycles.map((c) => `${c.count} ${c.name}`).join(" · ")}</span>
                <ChevronRight size={14} className="director-kpi-arrow" />
              </div>
            </button>

            {/* KPI 2 — Personnel */}
            <button
              type="button"
              className="director-kpi-card"
              onClick={() => onNavigate("/teachers")}
              aria-label="Consulter l'équipe pédagogique et administrative"
            >
              <div className="director-kpi-top">
                <div className="director-kpi-icon director-kpi-icon--green">
                  <Users size={18} />
                </div>
                <span className="director-kpi-tag director-kpi-tag--success">
                  <span className="director-kpi-dot" />
                  Complet
                </span>
              </div>
              <div>
                <span className="director-kpi-label">Personnel</span>
                <div className="director-kpi-value">{number(totalStaffCount)}</div>
              </div>
              <div className="director-kpi-detail">
                <span>{activeTeachersCount} enseignants · {activeEmployeesCount} administratifs</span>
                <ChevronRight size={14} className="director-kpi-arrow" />
              </div>
            </button>

            {/* KPI 3 — Présence aujourd'hui */}
            <button
              type="button"
              className="director-kpi-card"
              onClick={() => onNavigate("/student-attendance")}
              aria-label="Consulter le relevé des présences"
            >
              <div className="director-kpi-top">
                <div className="director-kpi-icon director-kpi-icon--green">
                  <UserRoundCheck size={18} />
                </div>
                <span className="director-kpi-tag director-kpi-tag--success">
                  <span className="director-kpi-dot" />
                  Normal
                </span>
              </div>
              <div>
                <span className="director-kpi-label">Présence aujourd'hui</span>
                <div className="director-kpi-value">{DEMO_FALLBACK.attendance.rate.toFixed(1).replace(".", ",")} %</div>
              </div>
              <div className="director-kpi-detail">
                <span>{DEMO_FALLBACK.attendance.present} présents · {DEMO_FALLBACK.attendance.absent} absents</span>
                <ChevronRight size={14} className="director-kpi-arrow" />
              </div>
            </button>

            {/* KPI 4 — Impayés à recouvrer */}
            <button
              type="button"
              className="director-kpi-card"
              onClick={() => onNavigate("/student-balances")}
              aria-label="Gérer les soldes et impayés des élèves"
            >
              <div className="director-kpi-top">
                <div className="director-kpi-icon director-kpi-icon--amber">
                  <Banknote size={18} />
                </div>
                <span className="director-kpi-tag director-kpi-tag--warning">
                  <span className="director-kpi-dot" />
                  À recouvrer
                </span>
              </div>
              <div>
                <span className="director-kpi-label">Impayés à recouvrer</span>
                <div className="director-kpi-value">{dh(DEMO_FALLBACK.finance.outstanding)}</div>
              </div>
              <div className="director-kpi-detail">
                <span>{DEMO_FALLBACK.finance.debtorsCount} comptes élèves concernés</span>
                <ChevronRight size={14} className="director-kpi-arrow" />
              </div>
            </button>

            {/* KPI 5 — Incidents ouverts */}
            <button
              type="button"
              className="director-kpi-card"
              onClick={() => onNavigate("/accidents-incidents")}
              aria-label="Voir le registre des accidents et incidents"
            >
              <div className="director-kpi-top">
                <div className="director-kpi-icon director-kpi-icon--red">
                  <ClipboardPenLine size={18} />
                </div>
                <span className={`director-kpi-tag ${openIncidents.length > 0 ? "director-kpi-tag--danger" : "director-kpi-tag--success"}`}>
                  <span className="director-kpi-dot" />
                  {openIncidents.length > 0 ? "Attention" : "Clôturé"}
                </span>
              </div>
              <div>
                <span className="director-kpi-label">Incidents ouverts</span>
                <div className="director-kpi-value">{openIncidents.length} ouvert{openIncidents.length > 1 ? "s" : ""}</div>
              </div>
              <div className="director-kpi-detail">
                <span>{openIncidents.filter((i) => i.severity === "Critique" || i.severity === "Élevée").length} prioritaire(s)</span>
                <ChevronRight size={14} className="director-kpi-arrow" />
              </div>
            </button>

            {/* KPI 6 — Transport */}
            <button
              type="button"
              className="director-kpi-card"
              onClick={() => onNavigate("/transport")}
              aria-label="Consulter les lignes et circuits de transport"
            >
              <div className="director-kpi-top">
                <div className="director-kpi-icon director-kpi-icon--blue">
                  <Bus size={18} />
                </div>
                <span className="director-kpi-tag director-kpi-tag--success">
                  <span className="director-kpi-dot" />
                  Actif
                </span>
              </div>
              <div>
                <span className="director-kpi-label">Transport scolaire</span>
                <div className="director-kpi-value">{transportData.activeCount} / {transportData.totalCount} lignes</div>
              </div>
              <div className="director-kpi-detail">
                <span>{transportData.totalCount} circuits · 4 bus affectés</span>
                <ChevronRight size={14} className="director-kpi-arrow" />
              </div>
            </button>
          </section>

          {/* ================================================================
              C. MAIN CONTENT — TWO-COLUMN LAYOUT
              ================================================================ */}
          <div className="director-two-col">
            {/* --------------------------------------------------------------
                LEFT COLUMN (65–70%) — OPERATIONAL OVERVIEW
                -------------------------------------------------------------- */}
            <div className="director-col-primary">
              {/* 1. Pulse opérationnel */}
              <article className="director-card" aria-labelledby="pulse-title">
                <header className="director-card-head">
                  <div className="director-card-title">
                    <span className="director-card-eyebrow">Aujourd'hui · Vie scolaire & sécurité</span>
                    <h2 id="pulse-title">Pulse opérationnel</h2>
                  </div>
                  <button
                    type="button"
                    className="director-card-action"
                    onClick={() => onNavigate("/accidents-incidents")}
                  >
                    Voir tous les incidents
                    <ArrowRight size={14} />
                  </button>
                </header>

                <div className="director-pulse-summary">
                  <div className="director-pulse-indicator">
                    <div className="director-pulse-indicator-icon director-kpi-icon--green">
                      <UserCheck size={16} />
                    </div>
                    <div className="director-pulse-indicator-copy">
                      <span>Présents</span>
                      <strong>{number(DEMO_FALLBACK.attendance.present)}</strong>
                    </div>
                  </div>

                  <div className="director-pulse-indicator">
                    <div className="director-pulse-indicator-icon director-kpi-icon--red">
                      <Users size={16} />
                    </div>
                    <div className="director-pulse-indicator-copy">
                      <span>Absents</span>
                      <strong>{number(DEMO_FALLBACK.attendance.absent)}</strong>
                    </div>
                  </div>

                  <div className="director-pulse-indicator">
                    <div className="director-pulse-indicator-icon director-kpi-icon--amber">
                      <Clock3 size={16} />
                    </div>
                    <div className="director-pulse-indicator-copy">
                      <span>En retard</span>
                      <strong>{number(DEMO_FALLBACK.attendance.late)}</strong>
                    </div>
                  </div>

                  <div className="director-pulse-indicator">
                    <div className="director-pulse-indicator-icon director-kpi-icon--red">
                      <AlertTriangle size={16} />
                    </div>
                    <div className="director-pulse-indicator-copy">
                      <span>Incidents ouverts</span>
                      <strong>{openIncidents.length}</strong>
                    </div>
                  </div>
                </div>

                {/* Latest open incidents */}
                <div className="director-incident-list">
                  {openIncidents.length === 0 ? (
                    <div className="director-empty-state director-empty-state--positive">
                      <CheckCircle2 size={16} />
                      <span>Aucun incident ouvert. La situation est normale.</span>
                    </div>
                  ) : (
                    openIncidents.slice(0, 4).map((inc) => {
                      const severityClass =
                        inc.severity === "Critique"
                          ? "director-badge--critique"
                          : inc.severity === "Élevée"
                          ? "director-badge--elevee"
                          : inc.severity === "Modérée"
                          ? "director-badge--moderee"
                          : "director-badge--faible";

                      return (
                        <button
                          key={inc.id}
                          type="button"
                          className="director-incident-row"
                          onClick={() => onNavigate("/accidents-incidents")}
                          aria-label={`Détails incident : ${inc.title}`}
                        >
                          <div className="director-incident-info">
                            <strong className="director-incident-title">{inc.title}</strong>
                            <small className="director-incident-sub">
                              {inc.personName ? `${inc.personName} (${inc.personClass || "Élève"})` : "Incident d'établissement"}
                            </small>
                          </div>

                          <div className="director-incident-meta">
                            <span>
                              <MapPin size={12} />
                              {inc.location}
                            </span>
                            <span>{inc.occurredAt}</span>
                          </div>

                          <span className={`director-badge ${severityClass}`}>
                            {inc.severity}
                          </span>

                          <span className="director-status-pill">{inc.status}</span>

                          <ChevronRight size={14} className="director-kpi-arrow" />
                        </button>
                      );
                    })
                  )}
                </div>
              </article>

              {/* 2. Situation financière */}
              <article className="director-card" aria-labelledby="finance-title">
                <header className="director-card-head">
                  <div className="director-card-title">
                    <span className="director-card-eyebrow">Pilotage financier & trésorerie</span>
                    <h2 id="finance-title">Situation financière</h2>
                  </div>
                  <button
                    type="button"
                    className="director-card-action"
                    onClick={() => onNavigate("/financial-reports")}
                  >
                    Rapports financiers
                    <ArrowRight size={14} />
                  </button>
                </header>

                {/* Highlights Strip */}
                <div className="director-finance-strip">
                  <div className="director-finance-stat">
                    <span>Impayés à recouvrer</span>
                    <strong>{dh(DEMO_FALLBACK.finance.outstanding)}</strong>
                    <small>{DEMO_FALLBACK.finance.debtorsCount} dossiers en retard · {DEMO_FALLBACK.finance.comparison}</small>
                  </div>

                  <div className="director-finance-stat">
                    <span>Dépenses engagées</span>
                    <strong>{dh(DEMO_FALLBACK.finance.expensesTotal)}</strong>
                    <small>{DEMO_FALLBACK.finance.expensesCount} transactions enregistrées</small>
                  </div>

                  <div className="director-finance-stat">
                    <span>Taux de recouvrement</span>
                    <strong>{DEMO_FALLBACK.finance.recoveryRate.toFixed(1).replace(".", ",")} %</strong>
                    <small>Encaissements : {dh(DEMO_FALLBACK.finance.collected)}</small>
                  </div>
                </div>

                {/* Two Subpanels: Top Unpaid Balances & Recent Expenses */}
                <div className="director-finance-subgrid">
                  {/* Top Unpaid Student Balances */}
                  <div className="director-subpanel">
                    <div className="director-subpanel-head">
                      <h3>Principaux impayés élèves</h3>
                      <button
                        type="button"
                        className="director-card-action"
                        onClick={() => onNavigate("/student-balances")}
                      >
                        Voir tous
                        <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className="director-data-list">
                      {outstandingBalances.slice(0, 5).map((deb) => (
                        <button
                          key={deb.id}
                          type="button"
                          className="director-debtor-row"
                          onClick={() => onNavigate("/student-balances")}
                          aria-label={`Dossier élève : ${deb.student}`}
                        >
                          <div className="director-debtor-info">
                            <strong>{deb.student}</strong>
                            <small>{deb.className} · {deb.service}</small>
                          </div>
                          <div className="director-debtor-amount">
                            <strong>{dh(deb.amount)}</strong>
                            <small>En retard</small>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Expenses */}
                  <div className="director-subpanel">
                    <div className="director-subpanel-head">
                      <h3>Dépenses récentes</h3>
                      <button
                        type="button"
                        className="director-card-action"
                        onClick={() => onNavigate("/expenses")}
                      >
                        Toutes
                        <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className="director-data-list">
                      {financeExpenses.slice(0, 5).map((exp) => (
                        <button
                          key={exp.id}
                          type="button"
                          className="director-expense-row"
                          onClick={() => onNavigate("/expenses")}
                          aria-label={`Dépense : ${exp.label}`}
                        >
                          <div className="director-expense-info">
                            <strong>{exp.label}</strong>
                            <small>{exp.category} · {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(exp.date))}</small>
                          </div>
                          <div className="director-expense-amount">
                            <strong>{dh(exp.amount)}</strong>
                            <small className={exp.status === "Payée" ? "is-paid" : "is-pending"}>
                              {exp.status}
                            </small>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              {/* 3. Stock & Transport (Side by Side on Desktop) */}
              <div className="director-stock-transport-grid">
                {/* Panel A — Alertes de stock */}
                <article className="director-card" aria-labelledby="stock-title">
                  <header className="director-card-head">
                    <div className="director-card-title">
                      <span className="director-card-eyebrow">Matériel & consommables</span>
                      <h2 id="stock-title">Alertes de stock</h2>
                    </div>
                    <button
                      type="button"
                      className="director-card-action"
                      onClick={() => onNavigate("/inventory")}
                    >
                      Inventaire
                      <ArrowRight size={14} />
                    </button>
                  </header>

                  <div className="director-stock-list">
                    {stockAlerts.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="director-stock-row"
                        onClick={() => onNavigate("/inventory")}
                        aria-label={`Article stock : ${item.name}`}
                      >
                        <div className="director-stock-info">
                          <strong>{item.name}</strong>
                          <small>{item.category}</small>
                        </div>
                        <div className="director-stock-qty">
                          <strong>{item.quantity}</strong>
                          <span> / {item.minimum} min</span>
                        </div>
                        <span
                          className={`director-badge ${
                            item.status === "Critique"
                              ? "director-badge--critique"
                              : item.status === "Stock faible"
                              ? "director-badge--moderee"
                              : "director-badge--faible"
                          }`}
                        >
                          {item.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </article>

                {/* Panel B — Transport scolaire */}
                <article className="director-card" aria-labelledby="transport-title">
                  <header className="director-card-head">
                    <div className="director-card-title">
                      <span className="director-card-eyebrow">Circuits & sorties</span>
                      <h2 id="transport-title">Transport scolaire</h2>
                    </div>
                    <button
                      type="button"
                      className="director-card-action"
                      onClick={() => onNavigate("/transport")}
                    >
                      Transport
                      <ArrowRight size={14} />
                    </button>
                  </header>

                  {/* Active Lines */}
                  <span className="director-transport-section-title">Circuits actifs</span>
                  <div className="director-transport-list">
                    {transportData.lines.slice(0, 3).map((line) => (
                      <button
                        key={line.id}
                        type="button"
                        className="director-transport-row"
                        onClick={() => onNavigate("/transport")}
                        aria-label={`Ligne transport : ${line.name}`}
                      >
                        <div className="director-transport-info">
                          <strong>{line.name}</strong>
                          <small>{line.vehicle} · {line.assigned}/{line.capacity} élèves</small>
                        </div>
                        <span className="director-badge director-badge--faible">
                          {line.status}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Upcoming Trips */}
                  <span className="director-transport-section-title">Prochaines sorties scolaires</span>
                  <div className="director-transport-list">
                    {transportData.trips.slice(0, 2).map((trip) => (
                      <button
                        key={trip.id}
                        type="button"
                        className="director-trip-row"
                        onClick={() => onNavigate("/trips-outings")}
                        aria-label={`Sortie : ${trip.title}`}
                      >
                        <div className="director-trip-date">
                          {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(trip.date))}
                        </div>
                        <div className="director-trip-info">
                          <strong>{trip.title}</strong>
                          <small>{trip.destination} · {trip.students} élèves ({trip.transport})</small>
                        </div>
                        <span className="director-status-pill">{trip.status}</span>
                      </button>
                    ))}
                  </div>
                </article>
              </div>
            </div>

            {/* --------------------------------------------------------------
                RIGHT COLUMN (30–35%) — ATTENTION & ACTION
                -------------------------------------------------------------- */}
            <div className="director-col-secondary">
              {/* 4. Priorités de la direction */}
              <article className="director-card director-priorities-card" aria-labelledby="priorities-title">
                <header className="director-card-head">
                  <div className="director-card-title">
                    <span className="director-card-eyebrow">À traiter en priorité</span>
                    <h2 id="priorities-title">Priorités de la direction</h2>
                    <p>{dynamicPriorities.length} sujet(s) requérant attention</p>
                  </div>
                </header>

                <div className="director-priorities-list">
                  {dynamicPriorities.length === 0 ? (
                    <div className="director-empty-state director-empty-state--positive">
                      <CheckCircle2 size={16} />
                      <span>Aucune priorité urgente. L'établissement fonctionne normalement.</span>
                    </div>
                  ) : (
                    dynamicPriorities.slice(0, 6).map((item) => {
                      const severityClass =
                        item.severity === "Critique"
                          ? "director-priority-item--critique"
                          : item.severity === "Élevée"
                          ? "director-priority-item--elevee"
                          : item.severity === "Modérée"
                          ? "director-priority-item--moderee"
                          : "director-priority-item--faible";

                      return (
                        <div key={item.id} className={`director-priority-item ${severityClass}`}>
                          <div className="director-priority-icon">
                            {item.category === "incident" ? (
                              <AlertTriangle size={15} />
                            ) : item.category === "stock" ? (
                              <Package size={15} />
                            ) : item.category === "finance" ? (
                              <Banknote size={15} />
                            ) : (
                              <ClipboardCheck size={15} />
                            )}
                          </div>
                          <div className="director-priority-copy">
                            <strong className="director-priority-title">{item.title}</strong>
                            <small className="director-priority-sub">{item.context}</small>
                          </div>
                          <button
                            type="button"
                            className="director-priority-btn"
                            onClick={() => onNavigate(item.route)}
                          >
                            <span>{item.action}</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </article>

              {/* 5. Agenda de la semaine */}
              <article className="director-card" aria-labelledby="agenda-title">
                <header className="director-card-head">
                  <div className="director-card-title">
                    <span className="director-card-eyebrow">Planning institutionnel</span>
                    <h2 id="agenda-title">Agenda de la semaine</h2>
                  </div>
                  <button
                    type="button"
                    className="director-card-action"
                    onClick={() => onNavigate("/events")}
                  >
                    Ouvrir l'agenda
                    <ArrowRight size={14} />
                  </button>
                </header>

                <div className="director-agenda-list">
                  {[
                    { id: "ev-1", day: "Lun", date: "9", time: "16:00", title: "Conseil de classe · 3e B", category: "Réunion", location: "Salle 12", route: "/meetings", isToday: false },
                    { id: "ev-2", day: "Mar", date: "10", time: "14:30", title: "Point de coordination de direction", category: "Réunion", location: "Bureau direction", route: "/meetings", isToday: true },
                    { id: "ev-3", day: "Mer", date: "11", time: "17:30", title: "Réunion parents-professeurs · 6e A", category: "Réunion", location: "Salle polyvalente", route: "/meetings", isToday: false },
                    { id: "ev-4", day: "Jeu", date: "12", time: "08:30", title: "Sortie pédagogique musée des sciences", category: "Sortie scolaire", location: "Musée des sciences", route: "/trips-outings", isToday: false },
                    { id: "ev-5", day: "Ven", date: "13", time: "14:00", title: "Remise des bulletins trimestriels", category: "Échéance administrative", location: "Amphithéâtre", route: "/events", isToday: false },
                  ].map((evt) => (
                    <button
                      key={evt.id}
                      type="button"
                      className="director-agenda-item"
                      onClick={() => onNavigate(evt.route)}
                      aria-label={`Événement : ${evt.title}`}
                    >
                      <div className={`director-agenda-day ${evt.isToday ? "is-today" : ""}`}>
                        <span>{evt.day}</span>
                        <strong>{evt.date}</strong>
                      </div>
                      <div className="director-agenda-body">
                        <div className="director-agenda-title-row">
                          <strong>{evt.title}</strong>
                          {evt.isToday && (
                            <span className="director-agenda-today-tag">Aujourd'hui</span>
                          )}
                        </div>
                        <div className="director-agenda-meta">
                          <span>{evt.time}</span>
                          <span>·</span>
                          <span className="director-agenda-category">{evt.category}</span>
                          {evt.location && (
                            <>
                              <span>·</span>
                              <span>{evt.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={14} className="director-kpi-arrow" />
                    </button>
                  ))}
                </div>
              </article>

              {/* 6. Accès directs */}
              <article className="director-card" aria-labelledby="shortcuts-title">
                <header className="director-card-head">
                  <div className="director-card-title">
                    <span className="director-card-eyebrow">Raccourcis fréquents</span>
                    <h2 id="shortcuts-title">Accès directs</h2>
                  </div>
                </header>

                <div className="director-quick-grid">
                  <button
                    type="button"
                    className="director-quick-item"
                    onClick={() => onNavigate("/students")}
                  >
                    <UserPlus size={16} />
                    <span>Ajouter un élève</span>
                  </button>

                  <button
                    type="button"
                    className="director-quick-item"
                    onClick={() => onNavigate("/payments")}
                  >
                    <CreditCard size={16} />
                    <span>Enregistrer un paiement</span>
                  </button>

                  <button
                    type="button"
                    className="director-quick-item"
                    onClick={() => onNavigate("/accidents-incidents")}
                  >
                    <ClipboardPenLine size={16} />
                    <span>Déclarer un incident</span>
                  </button>

                  <button
                    type="button"
                    className="director-quick-item"
                    onClick={() => onNavigate("/student-attendance")}
                  >
                    <UserRoundCheck size={16} />
                    <span>Consulter les présences</span>
                  </button>

                  <button
                    type="button"
                    className="director-quick-item"
                    onClick={() => onNavigate("/teachers")}
                  >
                    <Users size={16} />
                    <span>Gérer le personnel</span>
                  </button>

                  <button
                    type="button"
                    className="director-quick-item"
                    onClick={() => onNavigate("/inventory")}
                  >
                    <Package size={16} />
                    <span>Consulter les stocks</span>
                  </button>

                  <button
                    type="button"
                    className="director-quick-item"
                    onClick={() => onNavigate("/transport")}
                  >
                    <Bus size={16} />
                    <span>Gérer le transport</span>
                  </button>

                  <button
                    type="button"
                    className="director-quick-item"
                    onClick={() => onNavigate("/events")}
                  >
                    <CalendarDays size={16} />
                    <span>Ouvrir l'agenda</span>
                  </button>
                </div>
              </article>
            </div>
          </div>
        </>
      )}

      {/* ====================================================================
          DETAILED DOMAIN TABS (Preserved for in-depth drilling)
          ==================================================================== */}
      {activeTab === "academic" && (
        <div className="director-col-primary">
          <div className="director-card">
            <header className="director-card-head">
              <div className="director-card-title">
                <span className="director-card-eyebrow">RÉSULTATS & CYCLES</span>
                <h2>Performance académique de l'établissement</h2>
              </div>
              <button type="button" className="director-card-action" onClick={() => onNavigate("/pedagogical-reports")}>
                Rapports complets <ArrowRight size={14} />
              </button>
            </header>
            <div className="director-finance-strip">
              <div className="director-finance-stat">
                <span>Moyenne générale</span>
                <strong>14,6 / 20</strong>
                <small>+0,4 pt vs trimestre précédent</small>
              </div>
              <div className="director-finance-stat">
                <span>Évaluations validées</span>
                <strong>864 / 864</strong>
                <small>100 % des résultats attendus</small>
              </div>
              <div className="director-finance-stat">
                <span>Examens programmés</span>
                <strong>12 épreuves</strong>
                <small>Sur les 14 prochains jours</small>
              </div>
            </div>
            <div className="director-quick-grid">
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/examinations")}>
                <CalendarDays size={16} /> Calendrier des examens
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/grades-validation")}>
                <FileCheck2 size={16} /> Validation des notes
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/timetables")}>
                <CalendarCheck size={16} /> Emplois du temps
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/pedagogical-reports")}>
                <BookOpen size={16} /> Rapports pédagogiques
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div className="director-col-primary">
          <div className="director-card">
            <header className="director-card-head">
              <div className="director-card-title">
                <span className="director-card-eyebrow">INSCRIPTIONS & FAMILLES</span>
                <h2>Dossiers élèves et structures</h2>
              </div>
              <button type="button" className="director-card-action" onClick={() => onNavigate("/students")}>
                Gérer les élèves <ArrowRight size={14} />
              </button>
            </header>
            <div className="director-finance-strip">
              <div className="director-finance-stat">
                <span>Inscriptions actives</span>
                <strong>{number(activeStudentsCount)}</strong>
                <small>Année {year?.name || "en cours"}</small>
              </div>
              <div className="director-finance-stat">
                <span>Dossiers en attente</span>
                <strong>{yearRows.filter((s) => s.enrollment?.status === "En attente").length}</strong>
                <small>À finaliser par l'administration</small>
              </div>
              <div className="director-finance-stat">
                <span>Élèves à risque suivi</span>
                <strong>4 signalés</strong>
                <small>Absences répétées ou fragilité</small>
              </div>
            </div>
            <div className="director-quick-grid">
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/students")}>
                <GraduationCap size={16} /> Dossiers et inscriptions
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/parents")}>
                <Users size={16} /> Dossiers des familles
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/student-risk")}>
                <AlertTriangle size={16} /> Suivi des élèves à risque
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/classes-groups")}>
                <Building2 size={16} /> Classes et groupes
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "operations" && (
        <div className="director-col-primary">
          <div className="director-card">
            <header className="director-card-head">
              <div className="director-card-title">
                <span className="director-card-eyebrow">RESSOURCES HUMAINES & SERVICES</span>
                <h2>Équipe pédagogique et logistique</h2>
              </div>
              <button type="button" className="director-card-action" onClick={() => onNavigate("/teachers")}>
                Équipe enseignante <ArrowRight size={14} />
              </button>
            </header>
            <div className="director-finance-strip">
              <div className="director-finance-stat">
                <span>Enseignants actifs</span>
                <strong>{number(activeTeachersCount)}</strong>
                <small>Affectations conformes</small>
              </div>
              <div className="director-finance-stat">
                <span>Personnel administratif</span>
                <strong>{number(activeEmployeesCount)}</strong>
                <small>Services généraux & administration</small>
              </div>
              <div className="director-finance-stat">
                <span>Véhicules de transport</span>
                <strong>4 bus</strong>
                <small>3 affectés · 1 en maintenance</small>
              </div>
            </div>
            <div className="director-quick-grid">
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/teachers")}>
                <BookOpen size={16} /> Enseignants
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/employees")}>
                <BriefcaseBusiness size={16} /> Employés
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/staff-attendance")}>
                <CalendarCheck size={16} /> Présences du personnel
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/inventory")}>
                <Package size={16} /> Équipements & magasins
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "finance" && (
        <div className="director-col-primary">
          <div className="director-card">
            <header className="director-card-head">
              <div className="director-card-title">
                <span className="director-card-eyebrow">RECOUVREMENT & FACTURATION</span>
                <h2>Supervision financière et régies</h2>
              </div>
              <button type="button" className="director-card-action" onClick={() => onNavigate("/financial-reports")}>
                Rapports financiers <ArrowRight size={14} />
              </button>
            </header>
            <div className="director-finance-strip">
              <div className="director-finance-stat">
                <span>Recouvrement scolarité</span>
                <strong>{dh(1284000)}</strong>
                <small>84,9 % des droits facturés</small>
              </div>
              <div className="director-finance-stat">
                <span>Reste à recouvrer</span>
                <strong>{dh(184500)}</strong>
                <small>127 dossiers actifs</small>
              </div>
              <div className="director-finance-stat">
                <span>Dépenses cumulées</span>
                <strong>{dh(642300)}</strong>
                <small>Sur la période en cours</small>
              </div>
            </div>
            <div className="director-quick-grid">
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/payments")}>
                <CreditCard size={16} /> Enregistrement des paiements
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/student-balances")}>
                <Wallet size={16} /> Soldes et impayés
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/expenses")}>
                <HandCoins size={16} /> Dépenses et factures
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/cash-registers")}>
                <Banknote size={16} /> Registres de caisse
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="director-col-primary">
          <div className="director-card">
            <header className="director-card-head">
              <div className="director-card-title">
                <span className="director-card-eyebrow">JOURNAL & VALIDATIONS</span>
                <h2>Historique et gouvernance</h2>
              </div>
              <button type="button" className="director-card-action" onClick={() => onNavigate("/activity-history")}>
                Journal d'audit <ArrowRight size={14} />
              </button>
            </header>
            <div className="director-finance-strip">
              <div className="director-finance-stat">
                <span>Validations en attente</span>
                <strong>22 éléments</strong>
                <small>Notes, rapports et dispenses</small>
              </div>
              <div className="director-finance-stat">
                <span>Actes enregistrés</span>
                <strong>142 cette semaine</strong>
                <small>Dossiers, paiements, présences</small>
              </div>
              <div className="director-finance-stat">
                <span>Sécurité & accès</span>
                <strong>Conforme</strong>
                <small>Rôles et autorisations à jour</small>
              </div>
            </div>
            <div className="director-quick-grid">
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/grades-validation")}>
                <FileCheck2 size={16} /> Valider les notes
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/activity-history")}>
                <Activity size={16} /> Historique des activités
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/roles-permissions")}>
                <ShieldCheck size={16} /> Rôles et autorisations
              </button>
              <button type="button" className="director-quick-item" onClick={() => onNavigate("/audit-activity")}>
                <FileCheck2 size={16} /> Journal d'audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="director-footer">
        <span>{schoolBranding.name} · Espace de Direction Générale</span>
        <span>Système local de gestion scolaire · Actualisation manuelle des dépôts</span>
      </footer>
    </main>
  );
}
