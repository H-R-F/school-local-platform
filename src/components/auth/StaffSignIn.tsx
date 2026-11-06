import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { authenticateDemoStaff, demoAccounts, demoPassword, getRoleLabel } from "../../data/demo-accounts";
import { schoolBranding } from "../../config/school";
import type { AuthenticatedSidebarUser } from "../../types/navigation";

interface Props { onSignIn: (user: AuthenticatedSidebarUser) => void }

export function StaffSignIn({ onSignIn }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    window.setTimeout(() => {
      const user = authenticateDemoStaff(email, password);
      setSubmitting(false);
      if (!user) {
        setError("Aucun compte du personnel ne correspond à ces identifiants.");
        return;
      }
      onSignIn(user);
    }, 250);
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-top">
          <div className="auth-brand-mark"><span>{schoolBranding.name.slice(0, 1)}</span></div>
          <div><strong>{schoolBranding.name}</strong><small>ESPACE DU PERSONNEL</small></div>
        </div>
        <div className="auth-brand-message">
          <span className="auth-eyebrow"><Sparkles size={13}/> UN SEUL ESPACE. CHAQUE JOUR.</span>
          <h1>Tout ce dont votre établissement a besoin, <em>au même endroit.</em></h1>
          <p>Gérez plus simplement les activités pédagogiques, administratives et financières de votre établissement.</p>
          <div className="auth-trust-row"><ShieldCheck size={17}/><span>Espace privé réservé au personnel autorisé</span></div>
        </div>
        <div className="auth-brand-bottom"><span>{schoolBranding.location}</span><span>Plateforme locale de gestion scolaire</span></div>
        <div className="auth-decoration auth-decoration--one"/><div className="auth-decoration auth-decoration--two"/>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><div className="auth-brand-mark"><span>{schoolBranding.name.slice(0, 1)}</span></div><strong>{schoolBranding.name}</strong></div>
          <div className="auth-heading">
            <span className="auth-step-label">ACCÈS DU PERSONNEL</span>
            <h2>Bienvenue</h2>
            <p>Connectez-vous avec le compte professionnel fourni par votre établissement.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="staff-email">Adresse e-mail professionnelle</label>
            <div className="auth-input-wrap"><Mail size={17}/><input id="staff-email" type="email" autoComplete="username" placeholder="vous@ecole.ma" value={email} onChange={event=>setEmail(event.target.value)} required/></div>
            <div className="auth-password-label"><label htmlFor="staff-password">Mot de passe</label><button type="button" className="auth-text-button" onClick={()=>setError("Veuillez contacter l’administrateur de votre établissement pour réinitialiser votre mot de passe.")}>Mot de passe oublié ?</button></div>
            <div className="auth-input-wrap"><LockKeyhole size={17}/><input id="staff-password" type={showPassword?"text":"password"} autoComplete="current-password" placeholder="Saisissez votre mot de passe" value={password} onChange={event=>setPassword(event.target.value)} required/><button type="button" className="auth-password-toggle" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?"Masquer le mot de passe":"Afficher le mot de passe"}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>
            {error&&<div className="auth-error" role="alert">{error}</div>}
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting?"Connexion en cours...":"Se connecter à l’espace"}<ArrowRight size={17}/></button>
          </form>

          <div className="auth-demo">
            <div className="auth-demo-heading"><span>ACCÈS DE DÉMONSTRATION</span><span className="auth-demo-badge">APERÇU UNIQUEMENT</span></div>
            <p>Choisissez un compte de démonstration pour découvrir l’espace correspondant à chaque fonction.</p>
            <div className="auth-demo-grid">
              {demoAccounts.map(account=><button type="button" className="auth-demo-account" key={account.user.id} onClick={()=>{setEmail(account.email);setPassword(demoPassword);setError("");}}>
                <span className={`auth-demo-avatar auth-demo-avatar--${account.user.role}`}>{account.user.initials}</span>
                <span><strong>{getRoleLabel(account.user.role)}</strong><small>{account.email}</small></span>
              </button>)}
            </div>
            <div className="auth-demo-password">Mot de passe de démonstration <code>{demoPassword}</code></div>
          </div>
          <p className="auth-legal">En continuant, vous confirmez être un membre autorisé de cet établissement.</p>
        </div>
      </section>
    </main>
  );
}