import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, AlertCircle } from "lucide-react";

interface ActionDrawerOptions {
  open: boolean;
  title: string;
  description?: string;
  actionType: "create" | "edit" | "view" | "delete" | "confirm";
  width?: "standard" | "wide";
  onClose: () => void;
  children: ReactNode;
}

const ActionContext = createContext<{
  openAction: (options: Omit<ActionDrawerOptions, "open" | "onClose">) => void;
  closeAction: () => void;
}>({ openAction: () => {}, closeAction: () => {} });

export function GlobalActionProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ActionDrawerOptions | null>(null);

  const openAction = (opts: Omit<ActionDrawerOptions, "open" | "onClose">) => {
    setOptions({ ...opts, open: true, onClose: () => setOptions(null) });
  };

  return (
    <ActionContext.Provider value={{ openAction, closeAction: () => setOptions(null) }}>
      {children}
      {options && createPortal(
        <div className="app-form-drawer-backdrop" onClick={options.onClose}>
          <div className={`app-form-drawer ${options.width === "wide" ? "app-form-drawer--wide" : ""}`} onClick={e => e.stopPropagation()}>
            <header className="app-form-drawer__header">
              <div className="app-form-drawer__heading">
                <span className="app-form-drawer__eyebrow">{options.actionType}</span>
                <h2>{options.title}</h2>
                {options.description && <p>{options.description}</p>}
              </div>
              <button className="app-icon-button" onClick={options.onClose}><X size={20}/></button>
            </header>
            <div className="app-form-drawer__body">{options.children}</div>
          </div>
        </div>,
        document.body
      )}
    </ActionContext.Provider>
  );
}

export const useGlobalAction = () => useContext(ActionContext);
