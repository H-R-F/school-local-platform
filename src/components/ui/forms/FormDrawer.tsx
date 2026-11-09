import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface FormDrawerProps {
  open: boolean;
  title: string;
  eyebrow?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  onClose: () => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  children: ReactNode;
  footer?: ReactNode;
  width?: "standard" | "wide";
  labelledBy?: string;
}

export function FormDrawer({
  open, title, eyebrow, description, submitLabel = "Enregistrer",
  cancelLabel = "Annuler", loading = false, submitDisabled = false,
  onClose, onSubmit, children, footer, width = "standard", labelledBy
}: FormDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const loadingRef = useRef(loading);
  onCloseRef.current = onClose;
  loadingRef.current = loading;

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusable = panel?.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])');
    requestAnimationFrame(() => (focusable ?? panel)?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loadingRef.current) { event.preventDefault(); onCloseRef.current(); }
      if (event.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')];
      if (!items.length) { event.preventDefault(); panel.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;
  const content = (
    <div className="app-form-drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !loading) onCloseRef.current(); }}>
      <section ref={panelRef} className={`app-form-drawer app-form-drawer--${width}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy || titleId} aria-describedby={description ? `${titleId}-description` : undefined} tabIndex={-1}>
        <header className="app-form-drawer__header">
          <div className="app-form-drawer__heading">
            {eyebrow && <span className="app-form-drawer__eyebrow">{eyebrow}</span>}
            <h2 id={labelledBy || titleId}>{title}</h2>
            {description && <p id={`${titleId}-description`}>{description}</p>}
          </div>
          <button type="button" className="app-icon-button" aria-label="Fermer" onClick={onClose} disabled={loading}><X size={18}/></button>
        </header>
        {onSubmit ? (
          <form className="app-form-drawer__form" onSubmit={event => { event.preventDefault(); void onSubmit(event); }}>
            <div className="app-form-drawer__body">{children}</div>
            <footer className="app-form-drawer__footer">
              {footer ?? <>
                <button type="button" className="app-button app-button--secondary" onClick={onClose} disabled={loading}>{cancelLabel}</button>
                <button type="submit" className="app-button app-button--primary" disabled={loading || submitDisabled}>{loading ? "Enregistrement…" : submitLabel}</button>
              </>}
            </footer>
          </form>
        ) : <div className="app-form-drawer__body">{children}</div>}
      </section>
    </div>
  );
  return createPortal(content, document.body);
}
