import type { ReactNode } from "react";
export function FormSection({title,description,children}: {title?:string;description?:string;children:ReactNode}) {
  return <section className="app-form-section">{(title||description)&&<header className="app-form-section__header">{title&&<h3>{title}</h3>}{description&&<p>{description}</p>}</header>}<div className="app-form-section__content">{children}</div></section>;
}
