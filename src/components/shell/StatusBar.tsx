import { useEffect, useRef, useState, type ReactNode } from "react";
import { Cloud, CloudOff, DatabaseBackup, ServerCog, ShieldCheck } from "lucide-react";
import { systemStatus } from "../../config/system-status";

type ItemId = "server" | "internet" | "backup" | "license";
type Tone = "ok" | "warn" | "danger" | "neutral";

function useOnline() {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
}

interface ItemProps {
  id: ItemId;
  open: ItemId | null;
  onToggle: (id: ItemId) => void;
  tone: Tone;
  icon: ReactNode;
  label: string;
  title: string;
  detail: ReactNode;
}

function StatusItem({ id, open, onToggle, tone, icon, label, title, detail }: ItemProps) {
  const isOpen = open === id;
  return (
    <div className="status-item-wrap">
      <button type="button" className={`status-item status-item--${tone}`} onClick={() => onToggle(id)} aria-expanded={isOpen} aria-haspopup="dialog">
        <span className="status-dot" aria-hidden="true" />
        {icon}
        <span>{label}</span>
      </button>
      {isOpen && (
        <div className="status-popover" role="dialog" aria-label={title}>
          <strong>{title}</strong>
          <div>{detail}</div>
          <small>Valeurs de démonstration : aucun serveur n’est encore connecté.</small>
        </div>
      )}
    </div>
  );
}

export function StatusBar() {
  const online = useOnline();
  const [open, setOpen] = useState<ItemId | null>(null);
  const ref = useRef<HTMLElement>(null);
  const s = systemStatus;

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (id: ItemId) => setOpen((current) => (current === id ? null : id));
  const backupTone: Tone = s.backup.state === "ok" ? "ok" : s.backup.state === "stale" ? "warn" : "danger";
  const licenseTone: Tone = s.license.mode === "active" ? "ok" : s.license.mode === "grace" ? "warn" : "danger";
  const licenseLabel =
    s.license.mode === "active"
      ? `Licence active jusqu’au ${s.license.validUntil}`
      : s.license.mode === "grace"
        ? `Période de grâce : ${s.license.graceDaysLeft ?? 0} jours restants`
        : "Mode restreint";

  return (
    <footer className="statusbar" ref={ref} aria-label="État du système">
      <div className="status-group">
        <StatusItem
          id="server" open={open} onToggle={toggle}
          tone={s.server === "connected" ? "ok" : "danger"}
          icon={<ServerCog size={14} aria-hidden="true" />}
          label={s.server === "connected" ? "Serveur local connecté" : "Serveur local injoignable"}
          title="Serveur local"
          detail="L’application communique avec le serveur de l’établissement sur le réseau local. Elle ne dépend pas d’Internet."
        />
        <StatusItem
          id="internet" open={open} onToggle={toggle}
          tone={online ? "ok" : "neutral"}
          icon={online ? <Cloud size={14} aria-hidden="true" /> : <CloudOff size={14} aria-hidden="true" />}
          label={online ? "Internet connecté" : "Hors ligne : le travail local continue"}
          title="Connexion Internet"
          detail={online
            ? "Internet est disponible : licence, notifications et mises à jour peuvent être synchronisées."
            : "Internet est indisponible. Le travail sur le réseau local n’est pas affecté ; les notifications sont mises en file d’attente."}
        />
      </div>
      <div className="status-group">
        {s.queuedNotifications > 0 && <span className="status-plain">Notifications en attente : {s.queuedNotifications}</span>}
        <StatusItem
          id="backup" open={open} onToggle={toggle}
          tone={backupTone}
          icon={<DatabaseBackup size={14} aria-hidden="true" />}
          label={s.backup.state === "failed" ? "Échec de la dernière sauvegarde" : `Dernière sauvegarde ${s.backup.lastRunLabel}`}
          title="Sauvegarde"
          detail="Sauvegarde chiffrée quotidienne. Une alerte apparaît si elle a plus de 24 h ou si elle échoue."
        />
        <StatusItem
          id="license" open={open} onToggle={toggle}
          tone={licenseTone}
          icon={<ShieldCheck size={14} aria-hidden="true" />}
          label={licenseLabel}
          title="Licence"
          detail="La licence est vérifiée localement. En cas de coupure Internet, elle reste valable pendant la période de grâce ; aucune donnée n’est supprimée à l’expiration."
        />
        <span className="status-version">v{s.version}</span>
      </div>
    </footer>
  );
}
