import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Banknote, BookOpenCheck, CalendarCheck, CalendarDays, CheckCircle2,
  ClipboardCheck, GraduationCap, RotateCcw, Users,
} from "lucide-react";
import {
  directorTasks, todaySnapshot, weekAgenda,
  type DirectorTask, type TaskCategory, type TaskPriority, type TaskStatus,
} from "../../data/director-dashboard";
import "./DirectorTaskCenter.css";

interface Props {
  onNavigate: (route: string) => void;
}

type Filter = "all" | "urgent" | "today" | "doing" | "done";

const STORAGE_KEY = "director-tasks-v1";

const categoryMeta: Record<TaskCategory, { label: string; icon: typeof Users }> = {
  validation: { label: "Validation", icon: ClipboardCheck },
  attendance: { label: "Présences", icon: CalendarCheck },
  student: { label: "Élèves", icon: GraduationCap },
  finance: { label: "Finances", icon: Banknote },
  pedagogy: { label: "Pédagogie", icon: BookOpenCheck },
  event: { label: "Événement", icon: CalendarDays },
};

const priorityMeta: Record<TaskPriority, { label: string; rank: number }> = {
  urgent: { label: "Urgent", rank: 0 },
  high: { label: "Important", rank: 1 },
  normal: { label: "Normal", rank: 2 },
};

const statusLabel: Record<TaskStatus, string> = { todo: "À faire", doing: "En cours", done: "Terminé" };
const nextStatus: Record<TaskStatus, TaskStatus> = { todo: "doing", doing: "done", done: "todo" };

function loadStatuses(): Record<string, TaskStatus> {
  const defaults = Object.fromEntries(directorTasks.map(task => [task.id, task.initialStatus])) as Record<string, TaskStatus>;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, TaskStatus>;
    return { ...defaults, ...Object.fromEntries(Object.entries(saved).filter(([id, value]) => id in defaults && value in statusLabel)) };
  } catch {
    return defaults;
  }
}

export function DirectorTaskCenter({ onNavigate }: Props) {
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>(loadStatuses);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch {
      /* storage unavailable: statuses stay in memory for this session */
    }
  }, [statuses]);

  const total = directorTasks.length;
  const done = directorTasks.filter(task => statuses[task.id] === "done").length;
  const open = total - done;
  const percent = Math.round((done / total) * 100);

  const counts: Record<Filter, number> = useMemo(() => ({
    all: total,
    urgent: directorTasks.filter(task => task.priority === "urgent" && statuses[task.id] !== "done").length,
    today: directorTasks.filter(task => task.due === "today" && statuses[task.id] !== "done").length,
    doing: directorTasks.filter(task => statuses[task.id] === "doing").length,
    done,
  }), [statuses, total, done]);

  const visible = useMemo(() => {
    const matches = (task: DirectorTask) => {
      const status = statuses[task.id];
      switch (filter) {
        case "urgent": return task.priority === "urgent" && status !== "done";
        case "today": return task.due === "today" && status !== "done";
        case "doing": return status === "doing";
        case "done": return status === "done";
        default: return true;
      }
    };
    return directorTasks
      .filter(matches)
      .sort((a, b) => Number(statuses[a.id] === "done") - Number(statuses[b.id] === "done") || priorityMeta[a.priority].rank - priorityMeta[b.priority].rank);
  }, [filter, statuses]);

  const setStatus = (id: string, status: TaskStatus) => setStatuses(current => ({ ...current, [id]: status }));
  const reset = () => setStatuses(Object.fromEntries(directorTasks.map(task => [task.id, task.initialStatus])));

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Toutes" },
    { id: "urgent", label: "Urgentes" },
    { id: "today", label: "Aujourd’hui" },
    { id: "doing", label: "En cours" },
    { id: "done", label: "Terminées" },
  ];

  return (
    <section className="task-center" aria-labelledby="task-center-title">
      <article className="task-panel">
        <header className="task-head">
          <div>
            <span className="dash-eyebrow">MES PRIORITÉS</span>
            <h2 id="task-center-title">À traiter aujourd’hui</h2>
          </div>
          <div className="task-progress" aria-live="polite">
            <div className="task-progress-text">
              <strong>{done}/{total}</strong>
              <span>{open === 0 ? "Tout est traité" : `${open} restante${open > 1 ? "s" : ""}`}</span>
            </div>
            <div className="task-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Avancement des tâches">
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>
        </header>

        <div className="task-filters" role="tablist" aria-label="Filtrer les tâches">
          {filters.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={filter === item.id ? "is-active" : ""}
              onClick={() => setFilter(item.id)}
            >
              {item.label}<span>{counts[item.id]}</span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="task-empty">
            <CheckCircle2 size={22} aria-hidden="true" />
            <strong>Rien à afficher ici</strong>
            <span>{filter === "done" ? "Aucune tâche terminée pour le moment." : "Toutes les tâches de ce filtre sont traitées."}</span>
          </div>
        ) : (
          <ul className="task-list">
            {visible.map(task => {
              const status = statuses[task.id];
              const Category = categoryMeta[task.category].icon;
              return (
                <li key={task.id} className={`task-item task-item--${status}`}>
                  <input
                    type="checkbox"
                    className="task-check"
                    checked={status === "done"}
                    onChange={() => setStatus(task.id, status === "done" ? "todo" : "done")}
                    aria-label={`Marquer « ${task.title} » comme ${status === "done" ? "à faire" : "terminée"}`}
                  />
                  <span className={`task-icon task-icon--${task.priority}`} aria-hidden="true"><Category size={17} /></span>
                  <div className="task-copy">
                    <strong>{task.title}</strong>
                    <small>{task.detail}</small>
                  </div>
                  <div className="task-meta">
                    <span className={`task-priority task-priority--${task.priority}`}>{priorityMeta[task.priority].label}</span>
                    <span className="task-due">{task.dueLabel}</span>
                  </div>
                  <button
                    type="button"
                    className={`task-status task-status--${status}`}
                    onClick={() => setStatus(task.id, nextStatus[status])}
                    title="Changer le statut"
                  >
                    {statusLabel[status]}
                  </button>
                  <button type="button" className="task-open" onClick={() => onNavigate(task.route)}>
                    {task.action}<ArrowRight size={14} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <footer className="task-foot">
          <span>Statuts enregistrés sur cet appareil · données de démonstration</span>
          <button type="button" onClick={reset}><RotateCcw size={13} aria-hidden="true" />Réinitialiser</button>
        </footer>
      </article>

      <article className="task-panel task-agenda">
        <header className="task-head">
          <div>
            <span className="dash-eyebrow">AGENDA</span>
            <h2>Cette semaine</h2>
          </div>
        </header>
        <ul className="agenda-list">
          {weekAgenda.map(item => (
            <li key={item.id}>
              <button type="button" onClick={() => onNavigate(item.route)}>
                <span className="agenda-date"><small>{item.day}</small><strong>{item.date}</strong></span>
                <span className="agenda-copy"><strong>{item.title}</strong><small>{item.time}</small></span>
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="dash-panel-link" onClick={() => onNavigate("/events")}>Voir le calendrier<ArrowRight size={14} aria-hidden="true" /></button>

        <div className="snapshot">
          <div className="snapshot-head"><strong>Présences aujourd’hui</strong><button type="button" onClick={() => onNavigate("/student-attendance")}>Détails<ArrowRight size={13} aria-hidden="true" /></button></div>
          <div className="snapshot-grid">
            {todaySnapshot.map(item => (
              <div key={item.id} className={`snapshot-item snapshot-item--${item.tone}`}><strong>{item.value}</strong><span>{item.label}</span></div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
