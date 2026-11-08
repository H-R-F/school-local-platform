import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
export interface ActionMenuItem { label:string; onSelect:()=>void; icon?:ReactNode; destructive?:boolean; disabled?:boolean; separatorBefore?:boolean; }
export function ActionMenu({items,label="Actions"}:{items:ActionMenuItem[];label?:string}) {
  const [open,setOpen]=useState(false), root=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(!open)return;const close=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};const key=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false);};document.addEventListener("pointerdown",close);document.addEventListener("keydown",key);return()=>{document.removeEventListener("pointerdown",close);document.removeEventListener("keydown",key);};},[open]);
  return <div className="app-action-menu" ref={root}><button type="button" className="app-icon-button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><MoreHorizontal size={18}/></button>{open&&<div className="app-action-menu__list" role="menu">{items.map((item,index)=><button key={index} type="button" role="menuitem" disabled={item.disabled} className={`app-action-menu__item${item.destructive?" is-destructive":""}${item.separatorBefore?" has-separator":""}`} onClick={()=>{setOpen(false);item.onSelect();}}>{item.icon}<span>{item.label}</span></button>)}</div>}</div>;
}
