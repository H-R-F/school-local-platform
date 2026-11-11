import { useMemo, useState } from "react";
import { BookOpen, Search, ShieldCheck, ChevronRight, Info } from "lucide-react";
import "./platform-documentation-page.css";

type DocSection = { id: string; number: string; title: string; summary: string; keywords: string; body: React.ReactNode };

const sections: DocSection[] = [
  { id:"blueprint", number:"01", title:"Platform blueprint", summary:"How the central control plane and each school's local platform fit together.", keywords:"architecture blueprint central school tenant control plane", body:<>
    <p>The product is a <b>central management plane plus independent school environments</b>. The Central Platform manages school identity, routing, subscriptions, releases and operational visibility. Each school runs its own School Local Platform and database.</p>
    <div className="pd-architecture">
      <div className="pd-arch-central"><span>CENTRAL CONTROL PLANE</span><b>Central Platform</b><small>School directory · Access resolution · Billing · Releases · Monitoring API</small></div>
      <div className="pd-arch-line">Secure outbound HTTPS / authenticated APIs</div>
      <div className="pd-arch-schools">
        {["School A","School B","School C"].map((s,i)=><div className="pd-arch-school" key={s}><b>{s}</b><span>Cloudflare Tunnel</span><span>Local API + Update Agent</span><span>Local PostgreSQL</span></div>)}
      </div>
    </div>
    <p><b>Tenant isolation:</b> school operational and student data stays in that school's environment. Central services should store only the minimum directory, commercial, routing and operational metadata required to manage the fleet.</p>
  </> },
  { id:"modules", number:"02", title:"Central Platform modules", summary:"What each page owns—and what it must not own.", keywords:"schools installations servers access directory plans subscriptions payments licenses releases versions update status", body:<>
    <div className="pd-table-wrap"><table className="pd-table"><thead><tr><th>Module</th><th>Responsibility</th><th>Not responsible for</th></tr></thead><tbody>
      <tr><td>Overview</td><td>Fleet summary, alerts and recent activity</td><td>Replacing detailed operational pages</td></tr>
      <tr><td>All Schools / Register School</td><td>Tenant registry and onboarding identity</td><td>Creating local student records</td></tr>
      <tr><td>Installations</td><td>Technician work orders, assignment, checklist and handover</td><td>Automated software update jobs</td></tr>
      <tr><td>Servers / School Workspace</td><td>Server inventory and one school-level view of installation, services, tunnel, connectivity, monitoring, incidents and logs</td><td>Replacing specialist fleet-wide pages</td></tr>
      <tr><td>School Access & Directory</td><td>Resolve school code to approved public endpoint and policy</td><td>Proxying all school data or storing passwords</td></tr>
      <tr><td>Plans / Subscriptions / Payments / Licenses</td><td>Commercial plan, billing and entitlement lifecycle</td><td>Server health or installation progress</td></tr>
      <tr><td>Releases</td><td>Build metadata, validate and publish signed packages</td><td>Installing releases on school servers</td></tr>
      <tr><td>Versions</td><td>Last reported installed version per school/server</td><td>Publishing packages or tracking each job stage</td></tr>
      <tr><td>Update Status</td><td>Individual update jobs, progress, results and failures</td><td>Claiming an update is live without an agent report</td></tr>
      <tr><td>System</td><td>Administrators, permissions, notifications and settings</td><td>Bypassing audit or tenant boundaries</td></tr>
    </tbody></table></div>
  </> },
  { id:"access", number:"03", title:"School access and request routing", summary:"From school code and login to the correct isolated school API.", keywords:"school code login password domain route cloudflare access authentication authorization", body:<>
    <ol className="pd-steps"><li><b>Resolve school code.</b> App sends school code to Central Directory. Central checks tenant status and returns only the approved public API hostname and required auth metadata.</li><li><b>Authenticate with the school.</b> User credentials are validated by the school identity service (or a deliberately designed central identity provider). Never send a school password to the directory resolver.</li><li><b>Protect the route.</b> Request travels over HTTPS through the configured Cloudflare hostname and tunnel to the local School API.</li><li><b>Authorize every request.</b> School API validates token, tenant, user, role, permission scope and resource ownership before returning data.</li></ol>
    <div className="pd-callout"><ShieldCheck size={16}/><span><b>Important distinction:</b> Cloudflare Tunnel provides a private network path. Cloudflare Access protects the origin route. The School API still owns application authentication and authorization. Never put tunnel tokens or Access service secrets in mobile/web clients.</span></div>
    <p>Suggested directory response: <code>tenant_id</code>, <code>api_base_url</code>, <code>status</code>, <code>auth_mode</code>, <code>public_key_id</code>. Do not return internal IP addresses, tunnel tokens or credentials.</p>
  </> },
  { id:"servers", number:"04", title:"How each server is tracked", summary:"A lightweight agent collects operational metrics and reports them centrally.", keywords:"monitoring agent heartbeat cpu ram disk os services database metrics server tracking telemetry", body:<>
    <div className="pd-flow"><div>School server</div><ChevronRight/><div>Monitoring Agent</div><ChevronRight/><div>HTTPS Monitoring API</div><ChevronRight/><div>Central metrics DB</div><ChevronRight/><div>Servers / Workspace UI</div></div>
    <p>Install one least-privilege Monitoring Agent on each school server. It initiates outbound HTTPS requests; central infrastructure does not need inbound access to the school LAN.</p>
    <div className="pd-grid">
      <div><b>Host metrics</b><span>CPU, RAM, disk capacity/usage, uptime, OS and kernel.</span></div>
      <div><b>Service checks</b><span>School API, PostgreSQL, Redis (if used), Cloudflared and agent status.</span></div>
      <div><b>Connectivity</b><span>DNS, internet reachability, tunnel state, API latency and packet loss where measurable.</span></div>
      <div><b>Database health</b><span>PostgreSQL readiness, size, connection count, query latency and backup result metadata.</span></div>
    </div>
    <p><b>Heartbeat:</b> agent sends a timestamped heartbeat (e.g. every 60 seconds). Central stores last-seen time. Example policy: Online under 3 minutes, Stale after 7 minutes, Offline suspected after 25 minutes. Tune these thresholds to the reporting interval. A missing heartbeat means communication is unconfirmed—not proof that the machine is powered off.</p>
    <p>Never collect student records, passwords, database rows or raw application content for infrastructure monitoring. Collect operational measurements only.</p>
  </> },
  { id:"connectivity", number:"05", title:"Connectivity and Cloudflare", summary:"Measure the path separately from the health of the school application.", keywords:"connectivity cloudflare tunnel dns latency packet loss origin health", body:<>
    <p>Track independent checks: <b>Internet/DNS → Cloudflare Tunnel → Origin School API</b>. A healthy tunnel does not guarantee the School API or database is healthy. Show each check, last probe time, latency, packet loss (when measured), and error detail separately.</p>
    <p>Use Cloudflare API for tunnel metadata and connector state; use the Monitoring Agent or a safe central probe for origin health. Do not treat Cloudflare status alone as server monitoring.</p>
  </> },
  { id:"software", number:"06", title:"Software releases, versions and updates", summary:"Three separate records answer three different operational questions.", keywords:"releases versions update status update agent rollout artifact r2 checksum signature", body:<>
    <div className="pd-grid pd-three"><div><b>Releases</b><span>What package is approved and published? Store metadata in PostgreSQL; store binaries in private object storage such as Cloudflare R2.</span></div><div><b>Versions</b><span>What version did each school last report as installed? Display report freshness so stale reports are not mistaken for current state.</span></div><div><b>Update Status</b><span>What happened during this particular update job? Track stage events, attempts, failures and final agent report.</span></div></div>
    <p>School administrator approves an update locally. The local Update Agent downloads a short-lived authorized package URL, verifies checksum and signature, creates and validates a backup, installs, runs health checks, then reports the result. Central monitors; it must not silently force an update.</p>
  </> },
  { id:"database", number:"07", title:"Central database blueprint", summary:"Suggested production tables, relationships and data ownership.", keywords:"database schema postgres tables columns foreign keys indexes metrics heartbeat incidents", body:<>
    <p>Use PostgreSQL for relational records and time-series summaries. Keep school academic data in each school's local database. The schema below is a recommended starting point—not a claim that the demo frontend already has these tables.</p>
    <div className="pd-table-wrap"><table className="pd-table"><thead><tr><th>Table</th><th>Important columns</th><th>Purpose</th></tr></thead><tbody>
      <tr><td><code>schools</code></td><td>id, code, name, status, created_at</td><td>Tenant registry; unique school code.</td></tr>
      <tr><td><code>school_endpoints</code></td><td>id, school_id, environment, hostname, tunnel_id, enabled, verified_at</td><td>Approved routing target; unique school + environment.</td></tr>
      <tr><td><code>servers</code></td><td>id, school_id, hostname, environment, os, status, last_seen_at</td><td>Server inventory.</td></tr>
      <tr><td><code>monitoring_agents</code></td><td>id, server_id, agent_version, credential_hash, enrolled_at, revoked_at</td><td>Agent identity and credential lifecycle.</td></tr>
      <tr><td><code>server_metrics</code></td><td>id, server_id, captured_at, cpu_pct, memory_pct, disk_pct, load</td><td>Time-stamped measurements; partition by date at scale.</td></tr>
      <tr><td><code>service_checks</code></td><td>id, server_id, service, status, latency_ms, checked_at, detail_code</td><td>API/DB/tunnel/agent health checks.</td></tr>
      <tr><td><code>cloudflare_tunnels</code></td><td>id, school_id, tunnel_ref, name, status, connector_seen_at</td><td>Tunnel metadata; never store plaintext tunnel tokens.</td></tr>
      <tr><td><code>backup_checks</code></td><td>id, server_id, backup_type, status, size_bytes, verified_at, object_ref</td><td>Backup freshness and verification metadata.</td></tr>
      <tr><td><code>server_incidents</code></td><td>id, server_id, severity, state, opened_at, resolved_at</td><td>Alert lifecycle and acknowledgement.</td></tr>
      <tr><td><code>installations</code></td><td>id, school_id, assigned_technician_id, status, scheduled_at, completed_at</td><td>Technician work orders and checklist.</td></tr>
      <tr><td><code>installation_events</code></td><td>id, installation_id, actor_id, event_type, note, created_at</td><td>Assignment, checklist and handover history.</td></tr>
      <tr><td><code>releases</code></td><td>id, version, channel, status, object_key, sha256, signature_ref</td><td>Published package metadata; binary stored outside DB.</td></tr>
      <tr><td><code>update_jobs</code></td><td>id, school_id, server_id, release_id, status, requested_by, started_at, finished_at</td><td>One update operation per attempt/job.</td></tr>
      <tr><td><code>update_attempts</code></td><td>id, job_id, attempt_no, status, started_at, finished_at, error_code</td><td>Retry history without overwriting previous attempts.</td></tr>
      <tr><td><code>update_job_events</code></td><td>id, job_id, stage, event_type, message_code, created_at</td><td>Append-only timeline and diagnostics.</td></tr>
      <tr><td><code>plans</code></td><td>id, name, billing_period, limits_json, active</td><td>Commercial product catalogue.</td></tr>
      <tr><td><code>subscriptions</code> / <code>licenses</code></td><td>id, school_id, plan_id, status, starts_at, ends_at</td><td>Commercial entitlement, isolated from server health.</td></tr>
      <tr><td><code>payments</code></td><td>id, school_id, subscription_id, amount, currency, status, paid_at</td><td>Payment records and provider references; no card secrets.</td></tr>
      <tr><td><code>platform_users</code> / <code>roles</code></td><td>id, email, password_hash or identity_subject, role_id, status</td><td>Central operators and least-privilege access.</td></tr>
      <tr><td><code>audit_logs</code></td><td>id, actor_id, school_id, action, target_type, target_id, created_at</td><td>Who changed what and when.</td></tr>
    </tbody></table></div>
    <p><b>Relationships:</b> one school has many endpoints, servers, installations, subscriptions and update jobs. A server has one or more agent enrollments, many metrics, service checks and incidents. A release can be referenced by many update jobs. Every tenant-owned row carries a <code>school_id</code> directly or through a foreign key. Keep central operator identities separate from school-local student, parent and teacher identities.</p>
    <p><b>Indexes:</b> unique <code>schools(code)</code>; unique <code>school_endpoints(school_id, environment)</code>; indexes on <code>servers(school_id)</code>, <code>server_metrics(server_id, captured_at DESC)</code>, <code>update_jobs(school_id, created_at DESC)</code> and <code>audit_logs(school_id, created_at DESC)</code>. Add foreign keys, check constraints and tenant-aware authorization.</p>
  </> },
  { id:"api", number:"08", title:"Core APIs and data flow", summary:"Small authenticated APIs connect the control plane to local agents and clients.", keywords:"api endpoints monitoring heartbeat directory report upload download", body:<>
    <div className="pd-api-list"><div><code>POST /api/public/v1/school-resolutions</code><span>Resolve school code to an approved public endpoint.</span></div><div><code>POST /api/monitoring/v1/heartbeats</code><span>Agent heartbeat and server identity.</span></div><div><code>POST /api/monitoring/v1/metrics</code><span>Batch time-stamped host metrics and service checks.</span></div><div><code>GET /api/platform/servers</code><span>Authorized central operator fleet inventory.</span></div><div><code>POST /api/platform/releases/upload-url</code><span>Create short-lived private artifact upload URL.</span></div><div><code>POST /api/updates/v1/jobs/:jobId/reports</code><span>Receive signed/authorized update progress and final result.</span></div></div>
    <p>Authenticate every machine with a unique revocable credential (prefer mTLS or short-lived signed tokens). Validate payload size, timestamps, replay protection and server-to-school association. Use pagination and batch ingestion for metrics.</p>
  </> },
  { id:"security", number:"09", title:"Security, privacy and reliability", summary:"Controls required before real schools and student information are connected.", keywords:"security privacy tls secrets roles rbac audit backup retention encryption", body:<>
    <ul className="pd-checks"><li>TLS everywhere; private object bucket; short-lived signed upload/download URLs.</li><li>Unique per-agent credentials, rotation and immediate revocation; least-privilege agent account.</li><li>RBAC plus resource-level scopes; enforce tenant isolation server-side on every query.</li><li>Rate limits, login throttling, MFA for platform administrators and audit trails for privileged actions.</li><li>Encrypt backups, test restoration, monitor backup age and integrity.</li><li>Define retention: e.g. detailed metrics 30 days, aggregates longer; document and validate policy.</li><li>Never expose internal IPs, tunnel tokens, passwords, private keys or raw student data to central dashboards.</li></ul>
  </> },
  { id:"roadmap", number:"10", title:"Build and rollout sequence", summary:"Implement the real platform in safe, testable stages.", keywords:"roadmap implementation phases acceptance", body:<>
    <ol className="pd-steps"><li><b>Foundation:</b> PostgreSQL schema, tenant IDs, authentication, RBAC, audit logging and migrations.</li><li><b>Directory:</b> school-code resolution, endpoint registry, status checks and safe client routing.</li><li><b>Server agent:</b> enroll one Ubuntu test server; report heartbeat, CPU, RAM, disk and OS.</li><li><b>Monitoring:</b> service checks, history, stale detection, incidents and alerts.</li><li><b>Connectivity:</b> Cloudflare API integration plus independent origin/API probes.</li><li><b>Software lifecycle:</b> private R2 artifacts, checksum/signature verification, local update agent and update job reports.</li><li><b>Production hardening:</b> backup/restore drills, load tests, security review, retention and incident runbooks.</li></ol>
    <div className="pd-callout"><Info size={16}/><span>Current pages are frontend demonstrations with fictional/local state. They do not yet prove that these APIs, tables, agents, Cloudflare checks or persistent services exist. Implement and test each integration before describing it as live.</span></div>
  </> }
];

export function PlatformDocumentationPage() {
  const [query,setQuery] = useState("");
  const [active,setActive] = useState("blueprint");
  const filtered = useMemo(()=>sections.filter(s=>(s.title+" "+s.summary+" "+s.keywords).toLowerCase().includes(query.trim().toLowerCase())),[query]);
  const goTo = (id:string) => { setActive(id); document.getElementById("pd-"+id)?.scrollIntoView({behavior:"smooth",block:"start"}); };
  return <div className="pd-page">
    <header className="pd-header"><div><span className="pd-eyebrow">CENTRAL PLATFORM / ENGINEERING HANDBOOK</span><h1>Platform Documentation</h1><p>One blueprint for the Central Platform, school environments, server monitoring, security and production database design.</p></div><div className="pd-header-icon"><BookOpen size={23}/></div></header>
    <div className="pd-status"><Info size={15}/><span><b>Architecture specification.</b> This documents the intended production design. Current UI demo data is local and is not connected to live infrastructure.</span></div>
    <div className="pd-layout">
      <aside className="pd-sidebar"><label className="pd-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find in documentation…"/></label><span className="pd-nav-label">CONTENTS · {filtered.length}</span>{filtered.map(s=><button key={s.id} className={active===s.id?"active":""} onClick={()=>goTo(s.id)}><small>{s.number}</small>{s.title}</button>)}{filtered.length===0&&<p className="pd-empty">No matching section.</p>}</aside>
      <main className="pd-content">{filtered.map(s=><section className="pd-section" id={"pd-"+s.id} key={s.id} onMouseEnter={()=>setActive(s.id)}><div className="pd-section-head"><span>{s.number}</span><div><h2>{s.title}</h2><p>{s.summary}</p></div></div><div className="pd-section-body">{s.body}</div></section>)}</main>
    </div>
  </div>;
}
