/**
 * Demonstration values for the bottom status bar.
 *
 * There is no backend in this repository yet. When the local server exists,
 * replace this module with real data:
 *  - server    -> GET /api/v1/health/ready
 *  - backup    -> backup worker status (latest successful backup)
 *  - license   -> signed lease verified locally (see architecture blueprint §9)
 *  - version   -> installed application version
 * The internet indicator is NOT simulated: it reads `navigator.onLine`.
 */
export type ServerState = "connected" | "unreachable";
export type LicenseMode = "active" | "grace" | "restricted";
export type BackupState = "ok" | "stale" | "failed";

export interface SystemStatus {
  server: ServerState;
  backup: { state: BackupState; lastRunLabel: string };
  license: { mode: LicenseMode; validUntil: string; graceDaysLeft?: number };
  version: string;
  queuedNotifications: number;
}

export const systemStatus: SystemStatus = {
  server: "connected",
  backup: { state: "ok", lastRunLabel: "02:00" },
  license: { mode: "active", validUntil: "04/12/2026" },
  version: "0.1.0",
  queuedNotifications: 0,
};
