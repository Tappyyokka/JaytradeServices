import { useEffect, useRef, useState } from "react";
import {
  Activity, ArrowDownToLine, ArrowRight, BadgeIndianRupee, ClipboardList,
  FileText, Filter, Headphones, History, House, LayoutDashboard, LogOut,
  Menu, MessageSquareWarning, Package, PanelLeftClose, PanelLeftOpen, Plus,
  Search, ShieldCheck, ShoppingBag, Store, Users, Wallet, X,
} from "lucide-react";
import API from "../config/api";
import marketplaceRequest from "../config/marketplaceApi";
import { formatPaise } from "../wallet/walletData";
import { registrationRequest } from "../wallet/registrationDemo";
import { readStoreImage } from "./Marketplace/storeImages";
import { CreditRequestsAdmin } from "./WalletCreditRequests";
import { serviceCatalog } from "./serviceCatalog";
import "./AdminCentre.css";

const names = {
  dashboard: "Overview", customers: "Customers", applications: "Applications", registrations: "Registration payments",
  wallets: "Customer Money", credits: "Wallet credit requests", transactions: "Transactions and statements",
  merchants: "Merchants and stores", subscriptions: "Subscription payments", products: "Products and inventory",
  orders: "Orders", refunds: "Refund queue", reviews: "Review reports", support: "Support and disputes",
  content: "Content management", admins: "Administrators", audit: "Audit log",
  services: "Service catalogue", plans: "Subscription plans", rewards: "Reward ledger",
};
const navigation = [
  ["Workspace", [["dashboard", LayoutDashboard]]],
  ["Customer operations", [["customers", Users], ["applications", ClipboardList], ["services", FileText]]],
  ["Finance", [["credits", Wallet], ["wallets", Wallet], ["registrations", BadgeIndianRupee],
    ["transactions", Activity], ["subscriptions", BadgeIndianRupee], ["refunds", History], ["rewards", BadgeIndianRupee]]],
  ["Super Store", [["merchants", Store], ["products", Package], ["orders", ShoppingBag], ["plans", ClipboardList], ["reviews", MessageSquareWarning]]],
  ["Administration", [["support", Headphones], ["content", FileText], ["admins", ShieldCheck], ["audit", History]]],
];
const descriptions = {
  dashboard: "Monitor operations, review pending work and see recent admin activity.",
  customers: "Find customer accounts and review their details.",
  applications: "Review submitted applications and check their Jaytrade sync status.",
  credits: "Review submitted wallet credit requests and their payment evidence.",
};
const roleNames = {
  SUPER: "Super admin", FINANCE: "Finance admin", APPLICATION: "Applications admin",
  MARKETPLACE: "Super Store admin", CONTENT: "Content admin", SUPPORT: "Support admin", AUDITOR: "Auditor",
};
const editable = ["customers", "registrations", "merchants", "products", "refunds", "support", "content", "admins", "services", "plans"];
const fields = {
  customers: ["name", "email", "accountId", "isActive"], applications: ["applicationId", "service", "status", "leadSyncStatus"],
  registrations: ["applicationId", "staff", "department", "amountPaise"], wallets: ["userId", "balancePaise"],
  transactions: ["reference", "amountPaise", "createdAt"], merchants: ["name", "plan", "subscriptionEnd", "merchantSuspended"],
  subscriptions: ["reference", "amountPaise", "createdAt"], products: ["name", "category", "stock", "active"],
  orders: ["id", "total", "sellerStage", "refunded"], refunds: ["id", "total", "createdAt"],
  reviews: ["reviewId", "reason", "createdAt"], support: ["subject", "kind", "status", "createdAt"],
  content: ["title", "channel", "active", "updatedAt"], admins: ["name", "email", "adminRole", "isActive"],
  audit: ["actorId", "action", "target", "reason", "createdAt"],
  services: ["id", "description", "available"], plans: ["id", "amountPaise", "days", "limit", "available"],
  rewards: ["reference", "amountPaise", "createdAt"],
};
const title = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (first) => first.toUpperCase());
const number = new Intl.NumberFormat("en-IN");
const dateTime = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });
const present = (key, value) => {
  if (value == null) return "—";
  if (key.endsWith("Paise")) return formatPaise(value);
  if (key === "total" || key === "price") return formatPaise(value * 100);
  if (key.endsWith("At") || key === "subscriptionEnd") {
    const date = new Date(value);
    if (Number.isFinite(date.getTime())) return dateTime.format(date);
  }
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};
async function api(path, body, signal) {
  const response = await fetch(API + "/api/admin-centre" + path, {
    credentials: "include", signal, ...(body && { method: "PUT", headers: { "Content-Type": "application/json", "X-Indipay-Admin": "1" }, body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Admin request failed.");
  return data;
}

function StatusValue({ field, value }) {
  if (value == null) return present(field, value);
  const booleanLabels = {
    isActive: ["Inactive", "Active"], active: ["Inactive", "Active"], available: ["Unavailable", "Available"],
    merchantSuspended: ["Active", "Suspended"], refunded: ["Not refunded", "Refunded"],
  };
  if (typeof value === "boolean" && booleanLabels[field]) {
    const positive = field === "merchantSuspended" ? !value : value;
    return <span className="admin-status" data-tone={positive ? "success" : field === "merchantSuspended" ? "danger" : "neutral"}>
      {booleanLabels[field][Number(value)]}
    </span>;
  }
  if (!["status", "leadSyncStatus", "sellerStage"].includes(field)) return present(field, value);
  const normalized = String(value).toLowerCase().replaceAll("_", " ");
  const tone = ["approved", "synced", "resolved", "delivered", "completed"].includes(normalized) ? "success"
    : ["rejected", "failed", "cancelled"].includes(normalized) ? "danger" : "attention";
  return <span className="admin-status" data-tone={tone}>{normalized}</span>;
}

function RecordDialog({ heading, onClose, returnFocus, children }) {
  const dialog = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    const element = dialog.current;
    const trigger = returnFocus.current;
    element.showModal();
    return () => {
      element.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, [returnFocus]);

  useEffect(() => { headingRef.current.focus(); }, [heading]);

  return <dialog ref={dialog} className="admin-dialog" aria-labelledby="admin-record-heading" onCancel={(event) => {
    event.preventDefault();
    onClose();
  }}>
    <header className="admin-dialog-header">
      <h2 id="admin-record-heading" ref={headingRef} tabIndex={-1}>{heading}</h2>
      <button type="button" className="admin-icon-button" onClick={onClose} aria-label="Close record"><X size={20} /></button>
    </header>
    <div className="admin-dialog-body">{children}</div>
  </dialog>;
}

function AdminOverview({ data, nav, select }) {
  const queues = [["credits", "Pending wallet verifications", Wallet], ["applications", "Application sync failures", ClipboardList],
    ["refunds", null, History], ["support", "Open complaints", Headphones]].filter(([key]) => nav.includes(key));
  const metricGroups = [
    ["Operational counts", Activity, data.metrics.filter(({ unit }) => unit !== "paise")],
    ["Financial totals", Wallet, data.metrics.filter(({ unit }) => unit === "paise")],
  ];
  return <>
    {queues.length > 0 && <section className="admin-section">
      <h2>Work queues</h2>
      <div className="admin-queues">{queues.map(([key, metric, Icon]) => {
        const item = data.metrics.find(({ label }) => label === metric);
        return <button className="admin-queue admin-panel" type="button" key={key} onClick={() => select(key)}>
          <span className="admin-tile-icon"><Icon size={19} /></span>
          <span><strong>{names[key]}</strong>{item && <small>{number.format(item.value)} {item.label.toLowerCase()}</small>}</span>
          <ArrowRight className="admin-queue-arrow" size={18} />
        </button>;
      })}</div>
    </section>}
    {metricGroups.filter(([, , metrics]) => metrics.length > 0).map(([label, Icon, metrics]) =>
      <section className="admin-section" key={label}>
        <h2><Icon size={19} />{label}</h2>
        <dl className="admin-metrics">{metrics.map(({ label, value, unit }) => <div className="admin-panel" key={label}>
          <dt>{label}</dt><dd>{unit === "paise" ? formatPaise(value) : number.format(value)}</dd>
        </div>)}</dl>
        {label === "Financial totals" && <p className="admin-note">Actual company revenue is unavailable. Wallet liabilities, marketplace sales and test subscription payments are shown separately.</p>}
      </section>
    )}
    <section className="admin-section">
      <h2><History size={19} />Recent admin activity</h2>
      {data.recent.length > 0 ? <ul className="admin-panel admin-activity">{data.recent.map((item) => <li key={item.id}>
        <div><strong>{item.action}</strong><p>{item.reason}</p></div>
        <time dateTime={item.createdAt}>{present("createdAt", item.createdAt)}</time>
      </li>)}</ul> : <p className="admin-panel admin-empty">No recent activity to display.</p>}
    </section>
  </>;
}
function exportPage(section, rows) {
  const keys = fields[section];
  const escape = (value) => {
    const text = String(value ?? "");
    return '"' + (/^\s*[=+\-@]/.test(text) ? "'" + text : text).replaceAll('"', '""') + '"';
  };
  const data = [keys, ...rows.map((row) => keys.map((key) => row[key]))].map((row) => row.map(escape).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\ufeff", data], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = section + ".csv"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function RecordEditor({ section, row, roles, onSave, onClose }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const body = { confirmed: values.has("confirmed"), remarks: values.get("remarks") };
    let id = row.id ?? row.userId;
    setBusy(true);
    try {
      if (section === "customers") body.isActive = !row.isActive;
      else if (section === "merchants") body.merchantSuspended = !row.merchantSuspended;
      else if (section === "products") body.active = false;
      else if (section === "support" || section === "applications") body.status = values.get("status");
      else if (section === "admins") { id = values.get("account"); body.adminRole = values.get("role"); }
      else if (section === "services") Object.assign(body, { name: values.get("name"), description: values.get("description"), available: values.has("available") });
      else if (section === "plans") Object.assign(body, { amountPaise: Math.round(Number(values.get("amount")) * 100),
        days: Number(values.get("days")), limit: values.get("limit") ? Number(values.get("limit")) : null, available: values.has("available") });
      else if (section === "content") {
        Object.assign(body, Object.fromEntries(["title", "body", "channel"].map((name) => [name, values.get(name)])));
        body.position = Number(values.get("position"));
        body.active = values.has("active");
        body.startsAt = values.get("startsAt") ? new Date(values.get("startsAt")).toISOString() : null;
        body.endsAt = values.get("endsAt") ? new Date(values.get("endsAt")).toISOString() : null;
        body.image = values.get("image").size ? await readStoreImage(values.get("image")) : row.image;
      }
      if (section === "wallets") await marketplaceRequest(`/admin/wallets/${encodeURIComponent(id)}/credits`, "POST",
        { ...body, amount: Number(values.get("amount")), reference: values.get("reference") });
      else if (section === "refunds") await marketplaceRequest(`/admin/orders/${encodeURIComponent(id)}/refund`, "POST", body);
      else if (section === "registrations") await registrationRequest(`/admin/registrations/${encodeURIComponent(row.applicationId)}/sync`, body);
      else await api(`/manage/${section}/${encodeURIComponent(id)}`, body);
      onSave();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  const dateInput = (value) => value ? new Date(Date.parse(value) - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
  return <form className="admin-record-form" onSubmit={save}>
    {section === "customers" && <p>{row.isActive ? "Suspend" : "Reactivate"} {row.name}</p>}
    {section === "merchants" && <p>{row.merchantSuspended ? "Reactivate" : "Suspend"} {row.name}</p>}
    {section === "products" && <p>Disable {row.name}</p>}
    {section === "refunds" && <p>Refund {present("total", row.total)} to Customer Money.</p>}
    {section === "registrations" && <p>Retry Jaytrade registration synchronization with payment reference {row.reference}.</p>}
    {section === "wallets" && <>
      <label>Credit amount (whole rupees)<input name="amount" type="number" required min="1" max="10000000" /></label>
      <label>Unique reference<input name="reference" required minLength={8} maxLength={80} /></label>
    </>}
    {["support", "applications"].includes(section) && <label>Status<select name="status" defaultValue={row.status}>
      {(section === "support" ? ["open", "in_review", "resolved"] : ["Pending", "Under Review", "Approved", "Rejected"])
        .map((value) => <option key={value}>{value}</option>)}</select></label>}
    {section === "admins" && <>
      <label>Account ID from customer records<input name="account" defaultValue={row.id === "new" ? "" : row.id} required /></label>
      <label>Admin role<select name="role" defaultValue={row.adminRole ?? "AUDITOR"}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
    </>}
    {section === "services" && <>
      <label>Service<select name="name" required defaultValue={row.id === "new" ? "" : row.id}><option value="">Select a service</option>
        {serviceCatalog.flatMap((category) => category.services).map((service, index) =>
          <option key={index} value={service.name.toLowerCase()}>{service.name}</option>)}</select></label>
      <label>Public description<textarea name="description" defaultValue={row.description} maxLength={1500} /></label>
      <label className="admin-check"><input name="available" type="checkbox" defaultChecked={row.available !== false} /> Accept new applications</label>
    </>}
    {section === "plans" && <>
      <label>Price in rupees<input name="amount" type="number" step=".01" min="1" max="1000000" defaultValue={row.amountPaise / 100} required /></label>
      <label>Validity in days<input name="days" type="number" min="1" max="366" defaultValue={row.days} required /></label>
      <label>Product limit (blank for unlimited)<input name="limit" type="number" min="1" max="10000" defaultValue={row.limit ?? ""} /></label>
      <label className="admin-check"><input name="available" type="checkbox" defaultChecked={row.available} /> Available to subscribe</label>
    </>}
    {section === "content" && <>
      <label>Channel<select name="channel" defaultValue={row.channel}>{["indipay", "superstore", "offers", "announcements", "merchant-notifications"].map((channel) => <option key={channel}>{channel}</option>)}</select></label>
      <label>Title<input name="title" defaultValue={row.title} maxLength={140} required /></label>
      <label>Message<textarea name="body" defaultValue={row.body} maxLength={2000} required /></label>
      <label>Image<input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label>
      <label>Display order<input name="position" type="number" min="0" max="1000" defaultValue={row.position ?? 0} required /></label>
      <label>Starts (local time)<input name="startsAt" type="datetime-local" defaultValue={dateInput(row.startsAt)} /></label>
      <label>Ends (local time)<input name="endsAt" type="datetime-local" defaultValue={dateInput(row.endsAt)} /></label>
      <label className="admin-check"><input name="active" type="checkbox" defaultChecked={row.active} /> Published</label>
    </>}
    <label>Audit remarks<textarea name="remarks" required minLength={3} maxLength={1000} /></label>
    <label className="admin-check"><input name="confirmed" type="checkbox" required /> I confirm this change</label>
    {error && <p role="alert">{error}</p>}
    <div className="admin-dialog-actions"><button type="button" onClick={onClose}>Cancel</button>
      <button className="admin-primary" disabled={busy}>{busy ? "Applying…" : "Apply change"}</button></div>
  </form>;
}

export default function AdminCentre({ initial = "dashboard", onExit, onLogout }) {
  const [session, setSession] = useState(null);
  const [section, setSection] = useState(initial);
  const [menu, setMenu] = useState(false);
  const [compact, setCompact] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const [sessionError, setSessionError] = useState("");
  const [record, setRecord] = useState(null);
  const [editing, setEditing] = useState(false);
  const recordTrigger = useRef(null);
  const menuButton = useRef(null);
  const pageHeading = useRef(null);
  useEffect(() => {
    if (!menu) return;
    function closeOnEscape(event) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      setMenu(false);
      menuButton.current?.focus();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menu]);
  useEffect(() => {
    const controller = new AbortController();
    api("/session", undefined, controller.signal).then(setSession).catch((error) => { if (!controller.signal.aborted) setSessionError(error.message); });
    return () => controller.abort();
  }, []);
  const allowed = session && (section === "dashboard" || (section === "credits" ? session.finance : session.sections.includes(section)));
  const request = (section === "dashboard" ? "/dashboard" : "/records/" + section) + "?" + new URLSearchParams({ ...filters, page });
  useEffect(() => {
    if (!allowed || section === "credits") return;
    const controller = new AbortController();
    api(request, undefined, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ request, revision, data });
    }).catch((error) => { if (!controller.signal.aborted) setResult({ request, revision, error: error.message }); });
    return () => controller.abort();
  }, [allowed, request, revision, section]);
  const current = result?.request === request && result.revision === revision ? result : null;
  const data = current?.data;
  const select = (next) => {
    if (next !== section) {
      setSection(next); setFilters({}); setPage(1); setRecord(null); setEditing(false);
    }
    setMenu(false);
    pageHeading.current?.focus();
  };
  const canWrite = session?.role !== "AUDITOR" && editable.includes(section);
  const nav = ["dashboard", ...(session?.sections ?? []), ...(session?.finance ? ["credits"] : [])];
  const group = navigation.find(([, items]) => items.some(([key]) => key === section))?.[0];
  const closeRecord = () => { setEditing(false); setRecord(null); };
  const applyFilters = (next) => { closeRecord(); setPage(1); setFilters(next); };
  const changePage = (next) => { closeRecord(); setPage(next); };
  async function inspect(row, trigger) {
    recordTrigger.current = trigger;
    setEditing(false);
    setRecord(row);
    if (section === "applications") api("/application-delivery/" + encodeURIComponent(row.applicationId)).then((delivery) => {
      setRecord((current) => current?.id === row.id ? { ...current, delivery } : current);
    }).catch((error) => {
      setRecord((current) => current?.id === row.id ? { ...current, deliveryError: error.message } : current);
    });
    if (section === "customers") try {
      const detail = await api("/customers/" + row.id);
      setRecord((current) => current?.id === row.id ? detail : current);
    } catch (error) { setRecord((current) => current?.id === row.id ? { ...row, detailError: error.message } : current); }
    if (section === "applications" && row.leadSyncStatus === "SYNCED") {
      try {
        const response = await fetch(API + "/api/applications/" + encodeURIComponent(row.applicationId) + "/jaytrade-status", { credentials: "include" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setRecord((current) => current?.id === row.id ? { ...current, jaytrade: result.jaytrade ?? result } : current);
      } catch (error) { setRecord((current) => current?.id === row.id ? { ...current, jaytradeError: error.message } : current); }
    }
  }
  return <div className={`admin-centre${compact ? " compact" : ""}`}>
    <header className="admin-top">
      <button ref={menuButton} type="button" className="admin-drawer-button admin-icon-button" aria-expanded={menu}
        aria-controls="admin-navigation" onClick={() => setMenu(!menu)} aria-label={menu ? "Close admin navigation" : "Open admin navigation"}>
        {menu ? <X size={21} /> : <Menu size={21} />}
      </button>
      <div className="admin-brand"><span className="admin-brand-icon"><ShieldCheck size={22} /></span>
        <strong>Indipay <span>Admin Centre</span></strong>
      </div>
      <div className="admin-top-actions">
        {session?.role && <span className="admin-role">{roleNames[session.role] ?? session.role}</span>}
        <button type="button" onClick={onExit} aria-label="Indipay Home"><House size={18} /><span>Indipay Home</span></button>
        <button type="button" onClick={onLogout} aria-label="Sign out"><LogOut size={18} /><span>Sign out</span></button>
      </div>
    </header>
    <nav id="admin-navigation" className={menu ? "admin-nav open" : "admin-nav"} aria-label="Admin modules">
      <button className="admin-collapse" type="button" onClick={() => setCompact(!compact)}
        aria-label={compact ? "Expand navigation" : "Collapse navigation"} title={compact ? "Expand navigation" : "Collapse navigation"}>
        {compact ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}<span>Collapse navigation</span>
      </button>
      {navigation.map(([label, items]) => {
        const visible = items.filter(([key]) => nav.includes(key));
        return visible.length > 0 && <div role="group" aria-label={label} className="admin-nav-group" key={label}>
          <p aria-hidden="true">{label}</p>
          {visible.map(([key, Icon]) => <button key={key} type="button" title={compact ? names[key] : undefined}
            aria-label={names[key]} aria-current={key === section ? "page" : undefined} onClick={() => select(key)}>
            <Icon size={18} aria-hidden="true" /><span>{names[key]}</span>
          </button>)}
        </div>;
      })}
    </nav>
    <main className="admin-main">
      <div className="admin-page-heading">
        {group && <p className="admin-kicker">{group}</p>}
        <h1 ref={pageHeading} tabIndex={-1}>{names[section]}</h1>
        {descriptions[section] && <p>{descriptions[section]}</p>}
      </div>
      {sessionError && <p className="admin-feedback" role="alert">{sessionError}</p>}
      {!session && !sessionError && <p className="admin-feedback" role="status">Checking admin access…</p>}
      {session && !allowed && <p className="admin-feedback" role="alert">You do not have access to this section.</p>}
      {allowed && section === "credits" && <CreditRequestsAdmin embedded />}
      {allowed && section !== "credits" && <>
        <form className="admin-filters admin-panel" key={section} aria-label="Filter records" onReset={() => applyFilters({})}
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters(Object.fromEntries([...new FormData(event.currentTarget)].filter(([, value]) => value)));
          }}>
          {section !== "dashboard" && <label className="admin-search">Search
            <span><Search size={17} aria-hidden="true" /><input name="q" type="search" placeholder="Search records" /></span>
          </label>}
          {!["wallets", "merchants"].includes(section) && <><label>From<input name="from" type="date" /></label><label>To<input name="to" type="date" /></label></>}
          <div className="admin-filter-actions">
            <button type="submit"><Filter size={16} /> Apply filters</button>
            {Object.keys(filters).length > 0 && <button className="admin-quiet" type="reset">Clear</button>}
          </div>
        </form>
        {!current && <p className="admin-feedback" role="status">Loading records…</p>}
        {current?.error && <div className="admin-feedback" role="alert">{current.error}
          <button type="button" onClick={() => setRevision((count) => count + 1)}>Retry</button>
        </div>}
        {data && section === "dashboard" && <AdminOverview data={data} nav={nav} select={select} />}
        {data && section !== "dashboard" && <section className="admin-panel admin-records" aria-label={names[section] + " records"}>
          <div className="admin-record-toolbar">
            <span>{number.format(data.total)} {data.total === 1 ? "record" : "records"}</span>
            <div className="admin-actions">
              {canWrite && ["content", "admins", "services"].includes(section) && <button type="button" className="admin-primary"
                onClick={(event) => {
                  recordTrigger.current = event.currentTarget;
                  setRecord({ id: "new" }); setEditing(true);
                }}><Plus size={17} />
                {section === "services" ? "Override service" : section === "content" ? "Add content" : "Add administrator"}
              </button>}
              <button type="button" disabled={!data.rows.length} onClick={() => exportPage(section, data.rows)}><ArrowDownToLine size={16} /> Export page CSV</button>
            </div>
          </div>
          {data.rows.length ? <div className="admin-table" tabIndex={0} role="region" aria-label={names[section] + " table"}><table>
            <thead><tr>{fields[section].map((key) => <th key={key} scope="col">{title(key)}</th>)}<th scope="col">Details</th></tr></thead>
            <tbody>{data.rows.map((row, index) => <tr key={row.id ?? row.userId + ":" + index}>
              {fields[section].map((key) => <td key={key}><StatusValue field={key} value={row[key]} /></td>)}
              <td><button className="admin-row-button" type="button" onClick={(event) => inspect(row, event.currentTarget)}>View <ArrowRight size={15} /></button></td>
            </tr>)}</tbody></table></div> : <div className="admin-empty"><FileText size={24} /><p>No records match these filters.</p></div>}
          {data.total > data.size && <div className="admin-pagination">
            <span>Page {page} of {Math.ceil(data.total / data.size)}</span>
            <div className="admin-actions">
              <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</button>
              <button type="button" disabled={page * data.size >= data.total} onClick={() => changePage(page + 1)}>Next</button>
            </div>
          </div>}
        </section>}
      </>}
      {record && <RecordDialog heading={editing ? `Manage ${names[section].toLowerCase()}` : "Record details"}
        onClose={closeRecord} returnFocus={recordTrigger}>
        {editing ? <RecordEditor key={record.id ?? record.userId} section={section} row={record} roles={session.roles}
          onClose={closeRecord} onSave={() => { closeRecord(); setRevision((count) => count + 1); }} /> : <>
          <dl className="admin-details">
            {Object.entries(record).filter(([key]) => key !== "image").map(([key, value]) =>
              <div key={key}><dt>{title(key)}</dt><dd><StatusValue field={key} value={value} /></dd></div>)}
          </dl>
          {record.image && <img className="admin-content-image" src={record.image} alt="Published artwork" />}
          {section === "applications" && record.leadSyncStatus === "FAILED" && session?.role !== "AUDITOR" &&
            <form className="admin-record-form" onSubmit={async (event) => {
              event.preventDefault();
              const reason = new FormData(event.currentTarget).get("remarks");
              try {
                await api("/application-delivery/" + encodeURIComponent(record.applicationId) + "/retry", { confirmed: true, remarks: reason });
                closeRecord();
                setRevision((count) => count + 1);
              } catch (failure) {
                setRecord((current) => current?.id === record.id ? { ...current, retryError: failure.message } : current);
              }
            }}>
              <label>Reason for retry<input name="remarks" required minLength={3} maxLength={1000} /></label>
              <button type="submit">Queue Jaytrade delivery retry</button>
            </form>}
          <div className="admin-dialog-actions">
            <button type="button" onClick={closeRecord}>Close</button>
            {canWrite && (section !== "registrations" || !record.syncedAt) && <button className="admin-primary" type="button"
              onClick={() => setEditing(true)}>Manage record</button>}
          </div>
        </>}
      </RecordDialog>}
    </main>
  </div>;
}
