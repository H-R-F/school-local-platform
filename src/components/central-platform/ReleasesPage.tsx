import { useMemo, useState } from "react";
import {
  Archive, Check, ChevronRight, CircleAlert, Clock3, Copy, Download,
  FileArchive, FileCheck2, GitBranch, HardDrive, LoaderCircle, MoreHorizontal, Package, Plus,
  Rocket, Search, ShieldCheck, Upload, X, Zap,
} from "lucide-react";
import { getReleaseDownloadUrl, uploadReleaseArtifact } from "../../services/release-artifacts";
import "./releases-page.css";

type ReleaseStatus = "Draft" | "Testing" | "Published" | "Deprecated";
type SchoolRollout = { school: string; code: string; current: string; status: "Up to date" | "Update available" | "In progress" | "Failed" };
type Release = {
  id: string; version: string; name: string; channel: "Stable" | "Beta";
  status: ReleaseStatus; publishedAt: string; createdAt: string; author: string;
  packageName: string; packageSize: string; checksum: string; signature: "Verified" | "Pending";
  objectKey?: string;
  minAgent: string; minServer: string; notes: string[]; schools: SchoolRollout[];
};

const schoolRollout: SchoolRollout[] = [
  { school: "École Atlas", code: "SCH-001", current: "v2.8.1", status: "Up to date" },
  { school: "Groupe Scolaire Al Amal", code: "SCH-002", current: "v2.7.4", status: "Update available" },
  { school: "Institution Al Manar", code: "SCH-003", current: "v2.8.1", status: "Up to date" },
  { school: "École Les Orangers", code: "SCH-004", current: "v2.8.0", status: "In progress" },
  { school: "Groupe Scolaire Al Waha", code: "SCH-005", current: "v2.6.9", status: "Failed" },
  { school: "Institution Al Fajr", code: "SCH-006", current: "v2.8.1", status: "Up to date" },
];

const seed: Release[] = [
  {
    id: "REL-0281", version: "2.8.1", name: "Stability & security patch", channel: "Stable",
    status: "Published", publishedAt: "08 Nov 2026 · 10:30 UTC", createdAt: "06 Nov 2026",
    author: "Amina Ops", packageName: "school-platform-2.8.1-linux-amd64.tar.gz", packageSize: "184.6 MB",
    checksum: "sha256: 7f3a…c91d", signature: "Verified", minAgent: "1.4.0", minServer: "Ubuntu 22.04",
    notes: ["Patched authentication session renewal.", "Improved database connection recovery.", "Fixed attendance export formatting."],
    schools: schoolRollout.map(s => ({ ...s, status: s.current === "v2.8.1" ? "Up to date" : s.status })),
  },
  {
    id: "REL-0290", version: "2.9.0", name: "Academic year workflow", channel: "Beta",
    status: "Testing", publishedAt: "—", createdAt: "09 Nov 2026", author: "Release Engineering",
    packageName: "school-platform-2.9.0-rc1-linux-amd64.tar.gz", packageSize: "191.2 MB",
    checksum: "sha256: 2bd1…9a80", signature: "Verified", minAgent: "1.5.0", minServer: "Ubuntu 22.04",
    notes: ["New academic year preparation workflow.", "Updated student promotion rules.", "Added staged database migration checks."],
    schools: [],
  },
  {
    id: "REL-0274", version: "2.7.4", name: "Previous stable release", channel: "Stable",
    status: "Deprecated", publishedAt: "14 Sep 2026 · 09:00 UTC", createdAt: "12 Sep 2026", author: "Release Engineering",
    packageName: "school-platform-2.7.4-linux-amd64.tar.gz", packageSize: "179.1 MB",
    checksum: "sha256: 0a41…b731", signature: "Verified", minAgent: "1.3.0", minServer: "Ubuntu 20.04",
    notes: ["Maintenance release.", "Deprecated after v2.8.1 became stable."], schools: [],
  },
  {
    id: "REL-0291", version: "2.9.1", name: "Database performance improvements", channel: "Beta",
    status: "Draft", publishedAt: "—", createdAt: "10 Nov 2026", author: "Amina Ops",
    packageName: "Not uploaded", packageSize: "—", checksum: "Not generated", signature: "Pending",
    minAgent: "1.5.0", minServer: "Ubuntu 22.04",
    notes: ["Optimize report query execution.", "Add database health diagnostics."], schools: [],
  },
];

const statusTone = (status: ReleaseStatus) => status === "Published" ? "success" : status === "Testing" ? "info" : status === "Draft" ? "warning" : "muted";
const rolloutTone = (status: SchoolRollout["status"]) => status === "Up to date" ? "success" : status === "Failed" ? "danger" : status === "In progress" ? "info" : "warning";

export function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>(seed);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [selected, setSelected] = useState<Release | null>(null);
  const [draft, setDraft] = useState<Release | null>(null);
  const [panel, setPanel] = useState<"create" | "edit" | "details" | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Release | null>(null);
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3000); };
  const visible = useMemo(() => releases.filter(r =>
    (r.version.toLowerCase().includes(query.toLowerCase()) || r.name.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase())) &&
    (statusFilter === "All" || r.status === statusFilter) &&
    (channelFilter === "All" || r.channel === channelFilter)
  ), [releases, query, statusFilter, channelFilter]);

  const openCreate = () => {
    const item: Release = { id: "REL-" + String(Date.now()).slice(-5), version: "", name: "", channel: "Stable", status: "Draft", publishedAt: "—", createdAt: "10 Nov 2026", author: "Amina Ops", packageName: "Not uploaded", packageSize: "—", checksum: "Not generated", signature: "Pending", minAgent: "1.4.0", minServer: "Ubuntu 22.04", notes: [""], schools: [] };
    setDraft(item); setPanel("create"); setErrors({});
  };
  const openEdit = (item: Release) => { setDraft({ ...item, notes: [...item.notes] }); setPanel("edit"); setErrors({});  setMenuId(null); };
  const closePanel = () => { setPanel(null); setDraft(null); setErrors({}); setArtifactFile(null); setUploadError(""); };
  const updateDraft = (patch: Partial<Release>) => { setDraft(current => current ? { ...current, ...patch } : current); };
  const downloadArtifact = async (item: Release) => {
    if (!item.objectKey) { notify("This sample artifact has no linked R2 object."); return; }
    try {
      const url = await getReleaseDownloadUrl(item.objectKey);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not create a secure download link.");
    }
  };
  const uploadArtifact = async () => {
    if (!draft || !artifactFile) return;
    if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(draft.version.trim())) {
      setErrors(current => ({ ...current, version: "Enter a valid version before uploading the package." }));
      return;
    }
    if (!/\.(tar\.gz|tgz|zip)$/i.test(artifactFile.name)) { setUploadError("Use a .tar.gz, .tgz or .zip release package."); return; }
    if (artifactFile.size > 1024 * 1024 * 1024) { setUploadError("The package exceeds the 1 GB upload limit."); return; }
    setUploading(true); setUploadError("");
    try {
      const result = await uploadReleaseArtifact({ file: artifactFile, releaseId: draft.id, version: draft.version.trim() });
      updateDraft({
        packageName: artifactFile.name,
        packageSize: \`\${(artifactFile.size / (1024 * 1024)).toFixed(1)} MB\`,
        checksum: result.checksum ? \`sha256: \${result.checksum}\` : "Pending server verification",
        signature: result.signatureStatus === "Verified" ? "Verified" : "Pending",
        objectKey: result.objectKey,
      });
      setArtifactFile(null);
      notify("Package uploaded to R2 and registered by the release API.");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Package upload failed.");
    } finally {
      setUploading(false);
    }
  };
  const validate = () => {
    if (!draft) return false;
    const next: Record<string,string> = {};
    if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(draft.version.trim())) next.version = "Use semantic versioning, for example 2.9.0.";
    if (!draft.name.trim()) next.name = "Release name is required.";
    if (releases.some(r => r.version === draft.version.trim() && r.id !== draft.id)) next.version = "This version already exists.";
    setErrors(next); return Object.keys(next).length === 0;
  };
  const saveDraft = () => {
    if (!draft || !validate()) return;
    const saved = { ...draft, version: draft.version.trim(), name: draft.name.trim(), status: "Draft" as ReleaseStatus };
    setReleases(current => current.some(r => r.id === saved.id) ? current.map(r => r.id === saved.id ? saved : r) : [saved, ...current]);
    closePanel(); notify("Release saved as a local demo draft.");
  };
  const runValidation = (item: Release) => {
    if (item.status !== "Draft") return;
    const missing: string[] = [];
    if (item.packageName === "Not uploaded" || !item.packageName.trim()) missing.push("package artifact");
    if (item.checksum === "Not generated" || !item.checksum.trim()) missing.push("checksum");
    if (item.signature !== "Verified") missing.push("verified digital signature");
    if (!item.notes.some(note => note.trim())) missing.push("release notes");
    if (missing.length) {
      notify("Validation blocked. Missing: " + missing.join(", ") + ".");
      return;
    }
    setReleases(current => current.map(r => r.id === item.id ? { ...r, status: "Testing" as ReleaseStatus } : r));
    setMenuId(null); setSelected(null); setPanel(null);
    notify("Demo validation checks passed. Release moved to Testing; no package was executed.");
  };
  const publish = (item: Release) => {
    if (item.status !== "Testing" || item.signature !== "Verified" || item.packageName === "Not uploaded") {
      notify("Cannot publish: package and verified signature are required, and release must pass Testing.");
      return;
    }
    setReleases(current => current.map(r => r.id === item.id ? { ...r, status: "Published" as ReleaseStatus, publishedAt: "10 Nov 2026 · just now" } : r));
    setMenuId(null); setSelected(null); setPanel(null); notify("Release published in this demo only. No school servers were updated.");
  };
  const duplicate = (item: Release) => {
    const copy = { ...item, id: "REL-" + String(Date.now()).slice(-5), version: "", name: item.name + " (copy)", status: "Draft" as ReleaseStatus, publishedAt: "—", createdAt: "10 Nov 2026", packageName: "Not uploaded", packageSize: "—", checksum: "Not generated", signature: "Pending" as const, schools: [], notes: [...item.notes] };
    setDraft(copy); setPanel("create");  setErrors({}); setMenuId(null);
  };
  const deprecate = (item: Release) => {
    setReleases(current => current.map(r => r.id === item.id ? { ...r, status: "Deprecated" as ReleaseStatus } : r));
    setConfirm(null); setMenuId(null); setSelected(null); setPanel(null); notify("Release marked as deprecated in demo data. Existing school installs are unchanged.");
  };
  const clearFilters = () => { setQuery(""); setStatusFilter("All"); setChannelFilter("All"); };

  const published = releases.filter(r => r.status === "Published").length;
  const testing = releases.filter(r => r.status === "Testing").length;
  const drafts = releases.filter(r => r.status === "Draft").length;
  const selectedRelease = selected ? releases.find(r => r.id === selected.id) || selected : null;
  const editing = panel === "create" || panel === "edit";

  return <div className="releases-page">
    <header className="rel-header">
      <div><div className="rel-eyebrow">SOFTWARE DELIVERY / RELEASE MANAGEMENT</div><h1>Releases</h1><p>Prepare, validate and publish application packages for your school fleet.</p></div>
      <button className="rel-primary" onClick={openCreate}><Plus size={16}/>Create release</button>
    </header>
    <div className="rel-demo"><span/>DEMO RECORDS <i>Release registry and rollout figures are sample data. Package uploads require the secured R2 API; no R2 credentials are exposed in this browser.</i></div>
    <div className="rel-storage-banner"><div className="rel-storage-icon"><HardDrive size={17}/></div><div><strong>Artifact storage · Cloudflare R2 integration</strong><span>Private bucket · Short-lived signed upload URLs · Server-side checksum and signature verification</span></div><span className="rel-storage-state"><i/>API integration required</span></div>

    <section className="rel-metrics">
      <div><span>Total releases</span><strong>{releases.length}</strong><small>All release records</small></div>
      <div><span>Published</span><strong>{published}</strong><small>Available for eligible schools</small></div>
      <div><span>In testing</span><strong>{testing}</strong><small>Not yet available to production</small></div>
      <div><span>Drafts</span><strong>{drafts}</strong><small>Work in progress</small></div>
    </section>

    <section className="rel-current">
      <div className="rel-current-icon"><Rocket size={19}/></div>
      <div className="rel-current-main"><span className="rel-overline">CURRENT STABLE RELEASE</span><h2>v2.8.1 <span>Stability &amp; security patch</span></h2><p>Published 08 Nov 2026 · Stable channel · Signed package verified</p></div>
      <div className="rel-current-meta"><strong>3 / 6</strong><span>schools on current release</span></div>
      <button className="rel-secondary" onClick={() => { const item = releases.find(r => r.version === "2.8.1"); if (item) { setSelected(item); setPanel("details"); } }}>View release <ChevronRight size={14}/></button>
    </section>

    <div className="rel-toolbar">
      <label className="rel-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search version, release name or ID…" aria-label="Search releases"/></label>
      <label className="rel-filter"><span>Status</span><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option><option>Draft</option><option>Testing</option><option>Published</option><option>Deprecated</option></select></label>
      <label className="rel-filter"><span>Channel</span><select value={channelFilter} onChange={e=>setChannelFilter(e.target.value)}><option>All</option><option>Stable</option><option>Beta</option></select></label>
      <button className="rel-clear" disabled={!query && statusFilter==="All" && channelFilter==="All"} onClick={clearFilters}>Clear filters</button>
      <span className="rel-count">{visible.length} of {releases.length} releases</span>
    </div>

    <section className="rel-list-section">
      <div className="rel-section-heading"><div><h2>Release registry</h2><p>Version history, package readiness and fleet adoption.</p></div><span>VERSION HISTORY</span></div>
      <div className="rel-table-wrap"><table className="rel-table"><thead><tr><th>RELEASE</th><th>CHANNEL</th><th>STATUS</th><th>PACKAGE</th><th>SCHOOLS ON VERSION</th><th>CREATED / PUBLISHED</th><th/></tr></thead><tbody>
        {visible.map(item => {
          const adopted = item.schools.filter(s=>s.status==="Up to date").length;
          return <tr key={item.id}>
            <td><button className="rel-release-cell" onClick={()=>{setSelected(item);setPanel("details");}}><strong>v{item.version || "—"}</strong><span>{item.name || "Untitled release"}</span><small>{item.id}</small></button></td>
            <td><span className="rel-channel">{item.channel}</span></td>
            <td><span className={`rel-status rel-status--${statusTone(item.status)}`}>{item.status}</span></td>
            <td><span className="rel-package-state">{item.packageName === "Not uploaded" ? "Not uploaded" : item.packageSize}</span><small className="rel-subtext">{item.signature === "Verified" ? "Signature verified" : "Package pending"}</small></td>
            <td><strong className="rel-adoption">{adopted} / {item.schools.length || "—"}</strong><small className="rel-subtext">{item.schools.length ? "schools up to date" : "No rollout records"}</small></td>
            <td><span>{item.publishedAt !== "—" ? item.publishedAt : item.createdAt}</span><small className="rel-subtext">{item.author}</small></td>
            <td><div className="rel-actions"><button className="rel-icon-btn" onClick={()=>{setSelected(item);setPanel("details");}} aria-label={`View ${item.version} details`}><ChevronRight size={16}/></button><button className="rel-icon-btn" onClick={()=>setMenuId(menuId===item.id?null:item.id)} aria-label="More release actions"><MoreHorizontal size={17}/></button>{menuId===item.id&&<div className="rel-menu"><button onClick={()=>{setSelected(item);setPanel("details");setMenuId(null);}}>View details</button><button onClick={()=>duplicate(item)}><Copy size={14}/>Duplicate as draft</button>{item.status==="Draft"&&<button onClick={()=>openEdit(item)}>Edit draft</button>}{item.status==="Draft"&&<button onClick={()=>runValidation(item)}><FileCheck2 size={14}/>Run validation</button>}{item.status==="Testing"&&<button onClick={()=>publish(item)}><Rocket size={14}/>Publish release</button>}{item.status==="Published"&&<button className="rel-danger" onClick={()=>setConfirm(item)}><Archive size={14}/>Deprecate release</button>}</div>}</div></td>
          </tr>;
        })}
      </tbody></table>{visible.length===0&&<div className="rel-empty"><Search size={22}/><strong>No releases found</strong><span>Try another search or clear your filters.</span><button onClick={clearFilters}>Clear filters</button></div>}</div>
      <div className="rel-table-foot"><span>Showing {visible.length} of {releases.length} local demo records</span><span>Release publishing is separate from school installation and rollout.</span></div>
    </section>

    <section className="rel-lifecycle">
      <div><h2>Release lifecycle</h2><p>Each release moves through controlled stages before it can be offered to schools.</p></div>
      <div className="rel-steps"><div><span>01</span><b>Draft</b><small>Prepare notes and package metadata</small></div><i/><div><span>02</span><b>Testing</b><small>Validate compatibility and integrity</small></div><i/><div><span>03</span><b>Published</b><small>Available for controlled rollout</small></div><i/><div><span>04</span><b>Deprecated</b><small>Retire from new deployments</small></div></div>
      <p className="rel-lifecycle-note"><ShieldCheck size={15}/> A published release does not automatically install itself. School servers check for eligible updates and report their result separately.</p>
    </section>

    {panel === "details" && selectedRelease && <div className="rel-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closePanel();}}><aside className="rel-drawer" role="dialog" aria-modal="true" aria-label="Release details">
      <header className="rel-drawer-head"><div><span className="rel-eyebrow">RELEASE RECORD / {selectedRelease.id}</span><h2>v{selectedRelease.version}</h2><p>{selectedRelease.name}</p></div><button className="rel-icon-btn" onClick={closePanel} aria-label="Close"><X size={18}/></button></header>
      <div className="rel-drawer-body">
        <div className="rel-detail-status"><span className={`rel-status rel-status--${statusTone(selectedRelease.status)}`}>{selectedRelease.status}</span><span className="rel-channel">{selectedRelease.channel} channel</span></div>
        <section className="rel-detail-section"><h3><Package size={15}/>Package &amp; integrity</h3><div className="rel-detail-grid"><div><small>Artifact</small><b>{selectedRelease.packageName}</b></div><div><small>Package size</small><b>{selectedRelease.packageSize}</b></div><div><small>Checksum</small><b>{selectedRelease.checksum}</b></div><div><small>Digital signature</small><b className={selectedRelease.signature==="Verified"?"rel-good":"rel-pending"}>{selectedRelease.signature}</b></div></div><p className="rel-security-note"><ShieldCheck size={14}/> Production systems should verify the full checksum and cryptographic signature before installation.</p></section>
        <section className="rel-detail-section"><h3><GitBranch size={15}/>Compatibility</h3><div className="rel-detail-grid"><div><small>Minimum agent version</small><b>{selectedRelease.minAgent}</b></div><div><small>Supported server OS</small><b>{selectedRelease.minServer}</b></div></div></section>
        <section className="rel-detail-section"><h3><FileArchive size={15}/>Release notes</h3><ul className="rel-notes">{selectedRelease.notes.filter(Boolean).map((note,i)=><li key={i}>{note}</li>)}</ul></section>
        <section className="rel-detail-section"><h3><Zap size={15}/>School rollout <span>{selectedRelease.schools.length} schools tracked</span></h3>{selectedRelease.schools.length ? <div className="rel-rollout-list">{selectedRelease.schools.map(s=><div key={s.code}><div><b>{s.school}</b><small>{s.code} · Current {s.current}</small></div><span className={`rel-status rel-status--${rolloutTone(s.status)}`}>{s.status}</span></div>)}</div> : <p className="rel-muted">No school rollout records yet. Published releases become eligible for rollout according to update policy.</p>}</section>
        <section className="rel-detail-section"><h3><Clock3 size={15}/>Release history</h3><div className="rel-history"><p><b>Created</b><span>{selectedRelease.createdAt} · {selectedRelease.author}</span></p><p><b>Published</b><span>{selectedRelease.publishedAt}</span></p></div></section>
      </div>
      <footer className="rel-drawer-footer">
        <button className="rel-secondary" onClick={()=>void downloadArtifact(selectedRelease)} disabled={!selectedRelease.objectKey}><Download size={14}/>Download package</button>
        <div>{selectedRelease.status==="Draft"&&<button className="rel-primary" onClick={()=>runValidation(selectedRelease)}><FileCheck2 size={14}/>Run validation</button>}{selectedRelease.status==="Testing"&&<button className="rel-primary" onClick={()=>publish(selectedRelease)}><Rocket size={14}/>Publish release</button>}</div>
      </footer>
    </aside></div>}

    {editing && draft && <div className="rel-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closePanel();}}><aside className="rel-drawer" role="dialog" aria-modal="true" aria-label={panel==="create"?"Create release":"Edit release"}>
      <header className="rel-drawer-head"><div><span className="rel-eyebrow">SOFTWARE DELIVERY / CONFIGURATION</span><h2>{panel==="create"?"Create release":"Edit draft release"}</h2><p>Define release metadata before validation and publication.</p></div><button className="rel-icon-btn" onClick={closePanel} aria-label="Close"><X size={18}/></button></header>
      <form className="rel-drawer-body rel-form" onSubmit={e=>{e.preventDefault();saveDraft();}}>
        <div className="rel-form-note"><CircleAlert size={15}/> Release metadata remains local demo data in this build. The upload control calls the secured backend contract; the backend must authenticate the operator and issue a short-lived R2 upload URL.</div>
        <section className="rel-detail-section"><h3>01 / Release identity</h3>
          <label>Version <input value={draft.version} onChange={e=>updateDraft({version:e.target.value})} placeholder="2.9.0" aria-invalid={!!errors.version}/>{errors.version&&<small className="rel-error">{errors.version}</small>}<small>Use semantic versioning: MAJOR.MINOR.PATCH.</small></label>
          <label>Release name <input value={draft.name} onChange={e=>updateDraft({name:e.target.value})} placeholder="e.g. Academic year workflow" aria-invalid={!!errors.name}/>{errors.name&&<small className="rel-error">{errors.name}</small>}</label>
          <label>Release channel <select value={draft.channel} onChange={e=>updateDraft({channel:e.target.value as Release["channel"]})}><option>Stable</option><option>Beta</option></select></label>
        </section>
        <section className="rel-detail-section"><h3>02 / Release artifact</h3>
          <div className="rel-upload-card">
            <div className="rel-upload-heading"><div><b><Upload size={15}/> Upload release package</b><small>Accepted: .tar.gz, .tgz, .zip · Maximum 1 GB</small></div><span>R2 STORAGE</span></div>
            <label className="rel-file-picker"><input type="file" accept=".tar.gz,.tgz,.zip,application/gzip,application/zip" disabled={uploading} onChange={e=>{setArtifactFile(e.target.files?.[0] || null);setUploadError("");}}/><span><Upload size={17}/><b>{artifactFile ? artifactFile.name : "Choose a package file"}</b><small>{artifactFile ? \`\${(artifactFile.size / (1024 * 1024)).toFixed(1)} MB selected\` : "Select the build artifact from your computer"}</small></span></label>
            {artifactFile && <div className="rel-upload-selected"><FileArchive size={15}/><span>{artifactFile.name}</span><button type="button" onClick={()=>setArtifactFile(null)} disabled={uploading} aria-label="Remove selected package"><X size={14}/></button></div>}
            {uploadError && <p className="rel-upload-error"><CircleAlert size={14}/>{uploadError}</p>}
            <button type="button" className="rel-primary rel-upload-button" onClick={uploadArtifact} disabled={!artifactFile || uploading || !draft.version.trim()}>{uploading ? <><LoaderCircle size={14} className="rel-spin"/>Uploading to R2…</> : <><Upload size={14}/>Upload package to R2</>}</button>
            <p className="rel-help">The browser receives a temporary upload URL only. R2 credentials stay on the backend. The backend must verify the uploaded object and register its checksum and signature before validation can pass.</p>
          </div>
          <div className="rel-detail-grid rel-artifact-metadata"><div><small>Artifact</small><b>{draft.packageName}</b></div><div><small>Package size</small><b>{draft.packageSize}</b></div><div><small>SHA-256 checksum</small><b>{draft.checksum}</b></div><div><small>Digital signature</small><b className={draft.signature==="Verified"?"rel-good":"rel-pending"}>{draft.signature} · backend verified</b></div></div>
          {draft.objectKey && <p className="rel-object-key"><HardDrive size={13}/>R2 object key: <code>{draft.objectKey}</code></p>}
        </section>
        <section className="rel-detail-section"><h3>03 / Compatibility requirements</h3>
          <div className="rel-form-grid"><label>Minimum agent version <input value={draft.minAgent} onChange={e=>updateDraft({minAgent:e.target.value})}/></label><label>Supported server OS <input value={draft.minServer} onChange={e=>updateDraft({minServer:e.target.value})}/></label></div>
        </section>
        <section className="rel-detail-section"><h3>04 / Release notes</h3>
          {draft.notes.map((note,index)=><div className="rel-note-input" key={index}><input value={note} onChange={e=>updateDraft({notes:draft.notes.map((n,i)=>i===index?e.target.value:n)})} placeholder="Describe a feature, fix or security change"/><button type="button" className="rel-icon-btn" aria-label="Remove note" onClick={()=>updateDraft({notes:draft.notes.filter((_,i)=>i!==index)})}><X size={14}/></button></div>)}
          <button type="button" className="rel-add-note" onClick={()=>updateDraft({notes:[...draft.notes,""]})}><Plus size={14}/>Add release note</button>
        </section>
      </form>
      <footer className="rel-drawer-footer"><button className="rel-secondary" onClick={closePanel}>Cancel</button><div><button className="rel-primary" onClick={saveDraft}><Check size={14}/>Save draft</button></div></footer>
    </aside></div>}

    {confirm&&<div className="rel-confirm-backdrop"><section className="rel-confirm" role="dialog" aria-modal="true"><h2>Deprecate v{confirm.version}?</h2><p>This removes the release from future rollout recommendations. Existing school installations remain unchanged. This is a local demo action.</p><div><button className="rel-secondary" onClick={()=>setConfirm(null)}>Cancel</button><button className="rel-primary rel-danger-button" onClick={()=>deprecate(confirm)}>Deprecate release</button></div></section></div>}
    {toast&&<div className="rel-toast"><Check size={15}/>{toast}</div>}
  </div>;
}
