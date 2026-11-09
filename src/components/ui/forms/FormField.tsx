import type { ReactNode } from "react";
export function FormField({label,htmlFor,required,help,error,children}: {label:string;htmlFor?:string;required?:boolean;help?:string;error?:string;children:ReactNode}) {
  return <div className={`app-form-field${error?" app-form-field--error":""}`}><label htmlFor={htmlFor}>{label}{required&&<span aria-hidden="true" className="app-form-field__required"> *</span>}</label>{children}{help&&<small className="app-form-field__help">{help}</small>}{error&&<small className="app-form-field__error" role="alert">{error}</small>}</div>;
}
