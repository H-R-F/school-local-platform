import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean; title: string; description: string;
  confirmLabel?: string; cancelLabel?: string;
  variant?: "default" | "destructive"; loading?: boolean;
  onCancel: () => void; onConfirm: () => void | Promise<void>;
}
export function ConfirmDialog({open,title,description,confirmLabel="Confirmer",cancelLabel="Annuler",variant="default",loading=false,onCancel,onConfirm}:ConfirmDialogProps) {
  const titleId=useId(), descriptionId=useId(), ref=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(!open)return;
    const old=document.body.style.overflow; document.body.style.overflow="hidden";
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const key=(e:KeyboardEvent)=>{if(e.key==="Escape"&&!loading){e.preventDefault();onCancel();}};
    document.addEventListener("keydown",key);
    return()=>{document.removeEventListener("keydown",key);document.body.style.overflow=old;previous?.focus();};
  },[open,loading,onCancel]);
  if(!open||typeof document==="undefined")return null;
  return createPortal(<div className="app-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget&&!loading)onCancel();}}>
    <section ref={ref} className="app-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
      <header><span className={`app-confirm-dialog__icon app-confirm-dialog__icon--${variant}`}><AlertTriangle size={20}/></span><button className="app-icon-button" type="button" aria-label="Fermer" onClick={onCancel} disabled={loading}><X size={17}/></button></header>
      <h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p>
      <footer><button type="button" className="app-button app-button--secondary" onClick={onCancel} disabled={loading}>{cancelLabel}</button><button type="button" className={`app-button app-button--${variant==="destructive"?"danger":"primary"}`} onClick={()=>void onConfirm()} disabled={loading}>{loading?"Traitement…":confirmLabel}</button></footer>
    </section>
  </div>,document.body);
}
