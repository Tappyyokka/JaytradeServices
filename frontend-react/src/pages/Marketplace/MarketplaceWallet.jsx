import { useEffect, useRef, useState } from "react";
import {
  ArrowDownLeft, ArrowLeft, ArrowUpRight, Bell, ChevronRight, Download,
  Eye, EyeOff, Gift, Headphones, History, ShoppingBag, Wallet as WalletIcon,
} from "lucide-react";
import {
  dateKey, filterWallet, formatPaise, statementRange, summarizeWallet, walletAnalytics, walletCsv,
  walletDemo, walletStatement, walletStatusLabels, walletTypeLabels,
} from "../../wallet/walletData";
import "./MarketplaceWallet.css";

const tabs = {
  overview: "Overview", history: "Transactions", statements: "Statements",
  analytics: "Analytics", notifications: "Notifications", earn: "Earn More",
};

const transactionFilters = {
  all: "All transactions", credits: "Credits", debits: "Debits", purchases: "Marketplace purchases",
  rewards: "Rewards", refunds: "Refunds and reversals", pending: "Pending", completed: "Completed", failed: "Failed",
};

const dateTime = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function signedAmount(row) {
  return (row.direction === "credit" ? "+" : "−") + formatPaise(row.amountPaise);
}

function transactionTone(row) {
  if (["refund", "reversal"].includes(row.type)) return "refund";
  return row.direction;
}

function TransactionList({ rows, onSelect, empty = "No wallet transactions yet." }) {
  return rows.length ? (
    <ul className="mp-wallet-transactions">
      {rows.map((row) => {
        const Icon = row.direction === "credit" ? ArrowDownLeft : ArrowUpRight;
        return <li key={row.id}>
          <button type="button" onClick={() => onSelect(row.id)}>
            <span className="mp-wallet-transaction-icon" data-tone={transactionTone(row)}><Icon size={18} aria-hidden="true" /></span>
            <span className="mp-wallet-transaction-main">
              <strong>{walletTypeLabels[row.type]}</strong>
              <span>{row.description}</span>
              <small>{row.id}{row.orderId && " · Order " + row.orderId}{!row.orderId && row.referenceId && " · " + row.referenceId}</small>
              <small>{dateTime.format(new Date(row.timestamp))}</small>
            </span>
            <span className="mp-wallet-transaction-value">
              <strong data-tone={transactionTone(row)}>{signedAmount(row)}</strong>
              <small data-status={row.status}>{walletStatusLabels[row.status]}</small>
            </span>
            <ChevronRight className="mp-wallet-transaction-chevron" size={15} aria-hidden="true" />
          </button>
        </li>;
      })}
    </ul>
  ) : <p className="mp-wallet-empty">{empty}</p>;
}

function Overview({ wallet, visible, onToggle, onView, onShop, onAffordable, onMainWallet }) {
  const totals = summarizeWallet(wallet.transactions);
  const hasLedger = wallet.availablePaise !== null;
  const metrics = [
    ["Total Indipay Money", wallet.totalPaise],
    ["Eligible money earned", hasLedger ? totals.earned : null],
    ["Marketplace spending", hasLedger ? totals.spent : null],
    ["Pending credits", wallet.pendingPaise],
    ["Refunds received", hasLedger ? totals.refunded : null],
    ...(wallet.restrictedPaise !== null ? [["Restricted balance", wallet.restrictedPaise]] : []),
    ...(wallet.reservedPaise !== null ? [["Reserved balance", wallet.reservedPaise]] : []),
  ];
  const amount = (value) => value === null ? "Unavailable" : visible ? formatPaise(value) : "••••••";
  return <>
    <div className="mp-wallet-balance-card">
      <div><WalletIcon size={20} aria-hidden="true" /><span>Marketplace spending balance</span></div>
      <button type="button" onClick={onToggle} className="mp-wallet-visibility" aria-label={visible ? "Hide wallet balances" : "Show wallet balances"}>
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
      <strong>{amount(wallet.availablePaise)}</strong>
      {wallet.demo && <small>Sample balance for this preview</small>}
    </div>
    <dl className="mp-wallet-metrics">
      {metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{amount(value)}</dd></div>)}
    </dl>
    <section className="mp-wallet-panel">
      <h2>Quick actions</h2>
      <div className="mp-wallet-actions">
        <button type="button" onClick={onShop}><ShoppingBag size={18} aria-hidden="true" /> Shop Now</button>
        <button type="button" onClick={() => onView("history")}><History size={18} aria-hidden="true" /> Transaction History</button>
        <button type="button" onClick={() => onView("earn")}><Gift size={18} aria-hidden="true" /> Earn More</button>
        <button type="button" onClick={() => onView("help")}><Headphones size={18} aria-hidden="true" /> Help and Support</button>
      </div>
      <div className="mp-wallet-affordable">
        <div><strong>Shop Within My Balance</strong><p>{wallet.demo ? "Uses your account’s marketplace balance. " : "Filters products by your available marketplace balance. "}
          Delivery and other charges may affect checkout.</p></div>
        <button type="button" className="mp-wallet-primary" onClick={onAffordable}>Find affordable products</button>
      </div>
    </section>
    <section className="mp-wallet-panel">
      <h2>Recent activity</h2>
      <TransactionList rows={wallet.transactions.slice(0, 3)} onSelect={(id) => onView("transaction", id)} />
      <div className="mp-wallet-actions"><button type="button" onClick={onMainWallet}>Open Indipay Wallet</button></div>
    </section>
  </>;
}

function HistoryView({ wallet, filters, setFilters, onSelect }) {
  const { query = "", filter = "all", from = "", to = "" } = filters;
  const invalid = from && to && from > to;
  const rows = invalid ? [] : filterWallet(wallet.transactions, filters);
  const set = (key, value) => setFilters((old) => ({ ...old, [key]: value }));
  return <section className="mp-wallet-panel">
    <h2>Transaction history</h2>
    <div className="mp-wallet-fields">
      <label>Search transactions<input type="search" placeholder="ID, order, store or description" value={query}
        onChange={(event) => set("query", event.target.value)} /></label>
      <label>Transaction filter<select value={filter} onChange={(event) => set("filter", event.target.value)}>
        {Object.entries(transactionFilters).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></label>
      <label>From<input type="date" value={from} onChange={(event) => set("from", event.target.value)} /></label>
      <label>To<input type="date" value={to} onChange={(event) => set("to", event.target.value)} /></label>
    </div>
    <div className="mp-wallet-results">
      <span role="status">{rows.length} {rows.length === 1 ? "transaction" : "transactions"}</span>
      {(query || filter !== "all" || from || to) && <button type="button" onClick={() => setFilters({})}>Clear filters</button>}
    </div>
    {invalid ? <p role="alert">The end date must be on or after the start date.</p>
      : <TransactionList rows={rows} onSelect={onSelect} empty="No transactions match these filters." />}
  </section>;
}

function TransactionDetails({ row, canViewOrder, onOrder, onHelp, onBack }) {
  if (!row) return <section className="mp-wallet-panel"><h2>Transaction unavailable</h2><button type="button" onClick={onBack}>Back to history</button></section>;
  const receipt = () => download(
    "indipay-demo-" + String(row.id).replace(/[^a-z0-9-]/gi, "-") + ".txt",
    [
      "INDIPAY MARKETPLACE — DEMONSTRATION RECEIPT", "",
      "Transaction: " + row.id, "Type: " + walletTypeLabels[row.type], "Amount: " + signedAmount(row),
      "Status: " + walletStatusLabels[row.status], "Date: " + dateTime.format(new Date(row.timestamp)),
      "Reference: " + (row.referenceId || "Unavailable"), "Description: " + row.description,
    ].join("\n"), "text/plain;charset=utf-8",
  );
  const fields = [
    ["Transaction ID", row.id], ["Status", walletStatusLabels[row.status]],
    ["Date and time", dateTime.format(new Date(row.timestamp))], ["Description", row.description],
    ["Reference ID", row.referenceId], ["Related order", row.orderId], ["Store", row.store],
    ["Payment method", row.paymentMethod], ["Previous marketplace balance", formatPaise(row.previousBalance)],
    ["Updated marketplace balance", formatPaise(row.updatedBalance)], ["Refund or reversal reference", row.reversalReference],
  ];
  return <section className="mp-wallet-panel">
    <button type="button" className="mp-wallet-back" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Transaction history</button>
    <h2>{walletTypeLabels[row.type]}</h2>
    <strong className="mp-wallet-detail-amount" data-tone={transactionTone(row)}>{signedAmount(row)}</strong>
    <dl className="mp-wallet-detail-fields">{fields.filter(([, value]) => value).map(([label, value]) => (
      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
    ))}</dl>
    <div className="mp-wallet-actions">
      {row.status === "completed" && ["purchase", "refund", "reversal", "adjustment"].includes(row.type) &&
        <button type="button" onClick={receipt}><Download size={16} aria-hidden="true" /> Download demo receipt</button>}
      {canViewOrder && <button type="button" onClick={onOrder}>View Related Order</button>}
      <button type="button" onClick={onHelp}>Get Help</button>
    </div>
  </section>;
}

function Statements({ wallet, now, onSelect }) {
  const [preset, setPreset] = useState("current");
  const [custom, setCustom] = useState(() => statementRange("current", now));
  const { from, to } = preset === "custom" ? custom : statementRange(preset, now);
  const valid = Boolean(from && to && from <= to);
  const report = valid ? walletStatement(wallet, from, to) : null;
  return <section className="mp-wallet-panel">
    <h2>Marketplace wallet statements</h2>
    <div className="mp-wallet-fields">
      <label>Statement period<select value={preset} onChange={(event) => setPreset(event.target.value)}>
        <option value="current">Current month</option><option value="previous">Previous month</option>
        <option value="three">Last three months</option><option value="six">Last six months</option><option value="custom">Custom date range</option>
      </select></label>
      {preset === "custom" && <>
        <label>From<input type="date" value={from} max={dateKey(now)} onChange={(event) => setCustom({ ...custom, from: event.target.value })} /></label>
        <label>To<input type="date" value={to} max={dateKey(now)} onChange={(event) => setCustom({ ...custom, to: event.target.value })} /></label>
      </>}
    </div>
    {report ? <>
      <p className="mp-wallet-muted">Completed transactions that affect marketplace spending are included in statement totals.</p>
      <dl className="mp-wallet-metrics">{[
        ["Opening balance", report.opening], ["Total credits", report.credits],
        ["Total debits", report.debits], ["Closing balance", report.closing],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{formatPaise(value)}</dd></div>)}</dl>
      {wallet.demo && <button type="button" className="mp-wallet-primary" disabled={!report.rows.length}
        onClick={() => download("indipay-demo-statement-" + from + ".csv", walletCsv(report.rows), "text/csv;charset=utf-8")}>
        <Download size={17} aria-hidden="true" /> Export demo CSV
      </button>}
      <TransactionList rows={report.rows} onSelect={onSelect} empty="No transactions in this period." />
    </> : <p role="alert">Choose a valid date range.</p>}
  </section>;
}

function ActivityBars({ rows, series }) {
  const peak = Math.max(1, ...rows.flatMap((row) => series.map(({ key }) => row[key])));
  return <div className="mp-wallet-bars">
    {rows.map((row) => <div key={row.label}>
      <strong>{row.label}</strong>
      <div>{series.map(({ key, name, tone }) => <div className="mp-wallet-bar" key={key} data-tone={tone}>
        <progress max={peak} value={row[key]} aria-label={name + " for " + row.label + " " + formatPaise(row[key])} />
        <span>{formatPaise(row[key])}</span>
      </div>)}</div>
    </div>)}
  </div>;
}

function Analytics({ wallet, now }) {
  if (!wallet.transactions.some((row) => row.status === "completed")) {
    return <section className="mp-wallet-panel"><h2>Wallet analytics</h2><p className="mp-wallet-empty">Analytics will appear after your first completed wallet transaction.</p></section>;
  }
  const data = walletAnalytics(wallet.transactions, now);
  const spending = [{ key: "amount", name: "Spending", tone: "debit" }];
  return <div className="mp-wallet-analytics">
    <section className="mp-wallet-panel">
      <h2>Monthly earnings and spending</h2>
      <p className="mp-wallet-muted">Eligible earnings and completed marketplace purchases</p>
      <div className="mp-wallet-legend"><span data-tone="credit">Earnings</span><span data-tone="debit">Spending</span></div>
      <ActivityBars rows={data.monthly} series={[{ key: "earned", name: "Earnings", tone: "credit" }, { key: "spent", name: "Spending", tone: "debit" }]} />
    </section>
    <section className="mp-wallet-panel"><h2>Wallet activity · last 7 days</h2>
      <ActivityBars rows={data.weekly} series={[{ key: "amount", name: "Completed wallet activity", tone: "credit" }]} />
      <p><strong>Total refunds received</strong> {formatPaise(data.refunds)}</p>
    </section>
    <section className="mp-wallet-panel"><h2>Spending by category</h2>
      {data.category.length ? <ActivityBars rows={data.category} series={spending} /> : <p>No completed marketplace purchases.</p>}
    </section>
    <section className="mp-wallet-panel"><h2>Spending by store</h2>
      {data.store.length ? <ActivityBars rows={data.store} series={spending} /> : <p>No completed marketplace purchases.</p>}
    </section>
  </div>;
}

function EarnMore({ onOpenIndipayPage }) {
  return <section className="mp-wallet-panel">
    <h2>Earn More</h2>
    <p className="mp-wallet-muted">Marketplace eligibility is determined for each credit.</p>
    <div className="mp-wallet-actions mp-wallet-earn">
      {[
        ["refer", "Refer & Earn"], ["rewards", "Rewards and Scratch Cards"], ["learn-earn", "Learn & Earn"],
        ["business-development", "Business and commission opportunities"],
      ].map(([page, label]) => <button type="button" key={page} onClick={() => onOpenIndipayPage(page)}>{label}<ChevronRight size={16} aria-hidden="true" /></button>)}
    </div>
  </section>;
}

export default function MarketplaceWallet({
  wallet, view, transactionId, demo, visible, onToggleVisible, onView, onToggleDemo,
  customer, loading, error, onRetry, onLogin, onShop, onAffordable, onMainWallet, onOpenIndipayPage, onSupport, orders, onOrder,
}) {
  const [now] = useState(() => new Date());
  const [sample] = useState(() => walletDemo(now));
  const [filters, setFilters] = useState({});
  const heading = useRef(null);
  const current = demo ? sample : wallet;
  const focused = current.transactions.find((row) => row.id === transactionId);
  const relatedOrder = focused?.orderId && (demo || orders.some((order) => order.id === focused.orderId));
  const select = (id) => onView("transaction", id);

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [view]);

  return <section className="mp-wallet-page">
    <header className="mp-wallet-page-heading">
      <div><h1 ref={heading} tabIndex={-1}>Marketplace Wallet</h1>
        <p>{demo ? "Demo wallet · Sample transactions and balances" : "Balance, transactions and spending"}</p></div>
      <button type="button" onClick={() => { setFilters({}); onToggleDemo(); }}>{demo ? "Back to my wallet" : "Preview demo wallet"}</button>
    </header>
    <nav className="mp-wallet-tabs" aria-label="Marketplace wallet navigation">
      {Object.entries(tabs).map(([key, label]) => <button type="button" key={key}
        aria-current={view === key ? "page" : undefined} onClick={() => onView(key)}>{label}</button>)}
    </nav>
    {!demo && loading && <p role="status">Loading wallet data…</p>}
    {!demo && error && <p role="alert">{error} <button type="button" onClick={onRetry}>Try again</button></p>}
    {!demo && !customer && !loading && <p>Sign in to view your wallet. <button type="button" onClick={onLogin}>Sign in</button></p>}
    {current.partial && <p className="mp-wallet-muted">The marketplace currently provides its latest 25 entries. History and totals reflect available records.</p>}
    {view === "overview" && <Overview wallet={current} visible={visible} onToggle={onToggleVisible} onView={onView} onShop={onShop} onAffordable={onAffordable} onMainWallet={onMainWallet} />}
    {view === "history" && <HistoryView wallet={current} filters={filters} setFilters={setFilters} onSelect={select} />}
    {view === "statements" && <Statements wallet={current} now={now} onSelect={select} />}
    {view === "analytics" && <Analytics wallet={current} now={now} />}
    {view === "earn" && <EarnMore onOpenIndipayPage={onOpenIndipayPage} />}
    {view === "notifications" && <section className="mp-wallet-panel">
      <h2><Bell size={18} aria-hidden="true" /> Wallet notifications</h2>
      <p className="mp-wallet-muted">{demo ? "Sample notifications from the demo ledger." : "Recent wallet activity grouped into notifications."}</p>
      <TransactionList rows={current.transactions} onSelect={select} empty="No wallet notifications yet." />
    </section>}
    {view === "transaction" && <TransactionDetails row={focused} canViewOrder={Boolean(relatedOrder)}
      onBack={() => onView("history")} onHelp={() => onView("help", focused?.id)}
      onOrder={() => demo ? onView("order", focused.id) : onOrder(focused.orderId)} />}
    {view === "order" && <section className="mp-wallet-panel">
      <h2>{demo && focused?.orderId ? "Demo order " + focused.orderId : "Order unavailable"}</h2>
      <TransactionList rows={demo && focused?.orderId ? current.transactions.filter((row) => row.orderId === focused.orderId) : []} onSelect={select} />
      <div className="mp-wallet-actions"><button type="button" onClick={() => onView("history")}>Back to transactions</button></div>
    </section>}
    {view === "help" && <section className="mp-wallet-panel">
      <h2>Wallet help and support</h2>
      {focused && <p>Transaction reference <strong>{focused.id}</strong></p>}
      <p>IndiBot can explain marketplace balances, orders, and refunds.</p>
      <div className="mp-wallet-actions"><button type="button" onClick={onSupport}>Open IndiBot</button>
        <button type="button" onClick={onMainWallet}>Open Indipay Wallet</button></div>
    </section>}
  </section>;
}
