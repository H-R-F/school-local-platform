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
        setError("We couldn't find a staff account with those credentials.");
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
          <div><strong>{schoolBranding.name}</strong><small>STAFF WORKSPACE</small></div>
        </div>
        <div className="auth-brand-message">
          <span className="auth-eyebrow"><Sparkles size={13}/> ONE WORKSPACE. EVERY SCHOOL DAY.</span>
          <h1>Everything your school needs, <em>in one place.</em></h1>
          <p>A calmer way to manage your school's academic, administrative and financial operations.</p>
          <div className="auth-trust-row"><ShieldCheck size={17}/><span>Private workspace for authorized school staff</span></div>
        </div>
        <div className="auth-brand-bottom"><span>{schoolBranding.location}</span><span>School Local Platform</span></div>
        <div className="auth-decoration auth-decoration--one"/><div className="auth-decoration auth-decoration--two"/>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><div className="auth-brand-mark"><span>{schoolBranding.name.slice(0, 1)}</span></div><strong>{schoolBranding.name}</strong></div>
          <div className="auth-heading">
            <span className="auth-step-label">STAFF ACCESS</span>
            <h2>Welcome back</h2>
            <p>Sign in with the staff account provided by your school.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="staff-email">Work email</label>
            <div className="auth-input-wrap"><Mail size={17}/><input id="staff-email" type="email" autoComplete="username" placeholder="you@school.edu" value={email} onChange={event=>setEmail(event.target.value)} required/></div>
            <div className="auth-password-label"><label htmlFor="staff-password">Password</label><button type="button" className="auth-text-button" onClick={()=>setError("Please contact your school administrator to reset your password.")}>Forgot password?</button></div>
            <div className="auth-input-wrap"><LockKeyhole size={17}/><input id="staff-password" type={showPassword?"text":"password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={event=>setPassword(event.target.value)} required/><button type="button" className="auth-password-toggle" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>
            {error&&<div className="auth-error" role="alert">{error}</div>}
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting?"Signing in...":"Sign in to workspace"}<ArrowRight size={17}/></button>
          </form>

          <div className="auth-demo">
            <div className="auth-demo-heading"><span>DEMO ACCESS</span><span className="auth-demo-badge">PREVIEW ONLY</span></div>
            <p>Choose a sample staff account to explore its role-specific workspace.</p>
            <div className="auth-demo-grid">
              {demoAccounts.map(account=><button type="button" className="auth-demo-account" key={account.user.id} onClick={()=>{setEmail(account.email);setPassword(demoPassword);setError("");}}>
                <span className={`auth-demo-avatar auth-demo-avatar--${account.user.role}`}>{account.user.initials}</span>
                <span><strong>{getRoleLabel(account.user.role)}</strong><small>{account.email}</small></span>
              </button>)}
            </div>
            <div className="auth-demo-password">Demo password <code>{demoPassword}</code></div>
          </div>
          <p className="auth-legal">By continuing, you confirm that you are an authorized member of this school.</p>
        </div>
      </section>
    </main>
  );
}