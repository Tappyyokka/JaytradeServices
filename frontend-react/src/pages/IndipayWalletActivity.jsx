import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { filterWallet, formatPaise, statementRange, walletStatement, walletTypeLabels } from "../wallet/walletData";
import "./IndipayWalletActivity.css";

const filters = {
  all: "All activity", credits: "Money in", debits: "Money out",
  purchases: "Super Store purchases", rewards: "Rewards",
  refunds: "Refunds", pending: "Pending",
};

function Transactions({ rows, empty }) {
  if (!rows.length) return <p className="indipay-activity-empty">{empty}</p>;
  return <ul className="indipay-activity-list">{rows.map((row) =>
    <li key={row.id}>
      <details>
        <summary>
          <span className="indipay-activity-icon">{row.direction === "credit" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</span>
          <span className="indipay-activity-main"><strong>{walletTypeLabels[row.type] ?? "Wallet activity"}</strong>
            <small>{row.description} · {new Date(row.timestamp).toLocaleDateString("en-IN")}</small></span>
          <strong className={row.direction === "credit" ? "indipay-activity-credit" : ""}>
            {row.direction === "credit" ? "+" : "−"}{formatPaise(row.amountPaise)}
          </strong>
        </summary>
        <dl>
          <div><dt>Source</dt><dd>{walletTypeLabels[row.type] ?? "Other"}</dd></div>
          <div><dt>Status</dt><dd>{row.status}</dd></div>
          <div><dt>Date and time</dt><dd>{new Date(row.timestamp).toLocaleString("en-IN")}</dd></div>
          <div><dt>Reference</dt><dd>{row.referenceId || "Unavailable"}</dd></div>
          {row.orderId && <div><dt>Order</dt><dd>{row.orderId}</dd></div>}
          {row.store && <div><dt>Store</dt><dd>{row.store}</dd></div>}
          {row.updatedBalance !== null && <div><dt>Balance after</dt><dd>{formatPaise(row.updatedBalance)}</dd></div>}
        </dl>
      </details>
    </li>)}</ul>;
}

export default function IndipayWalletActivity({ wallet, view, creditRequests, onAddMoney }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [period, setPeriod] = useState("current");
  const now = new Date();
  const periodDates = period === "custom" ? { from, to } : statementRange(period, now);
  const invalid = Boolean(from && to && from > to);
  const rows = invalid ? [] : filterWallet(wallet.transactions, { query, filter, from, to });
  const statement = periodDates.from && periodDates.to && periodDates.from <= periodDates.to
    ? walletStatement(wallet, periodDates.from, periodDates.to) : null;

  return <div className="indipay-wallet-activity">
    {view === "history" && <section className="indipay-activity-panel">
      <h2>Transaction History</h2>
      <p>All Customer Money activity, including applications and Super Store orders.</p>
      <div className="indipay-activity-filters">
        <label>Search<input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
          placeholder="Search source, reference or store" /></label>
        <label>Type<select value={filter} onChange={(event) => setFilter(event.target.value)}>
          {Object.entries(filters).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <label>From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label>To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
      </div>
      {invalid && <p role="alert">The start date must be before the end date.</p>}
      <Transactions rows={rows} empty="No transactions match these filters." />
    </section>}
    {view === "statements" && <section className="indipay-activity-panel">
      <h2>Account Statements</h2>
      <p>Customer Money credits and debits for the selected period.</p>
      <div className="indipay-activity-filters">
        <label>Period<select value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="current">Current month</option><option value="previous">Previous month</option>
          <option value="three">Last three months</option><option value="six">Last six months</option>
          <option value="custom">Custom range</option>
        </select></label>
        {period === "custom" && <>
          <label>From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label>To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        </>}
      </div>
      {statement ? <>
        <dl className="indipay-statement-totals">
          {[["Opening balance", statement.opening], ["Money in", statement.credits], ["Money out", statement.debits],
            ["Closing balance", statement.closing]].map(([label, amount]) =>
            <div key={label}><dt>{label}</dt><dd>{formatPaise(amount)}</dd></div>)}
        </dl>
        <Transactions rows={statement.rows} empty="No transactions in this period." />
      </> : <p role="alert">Choose a valid date range.</p>}
    </section>}
    <section className="indipay-activity-panel">
      <h2><Clock3 size={19} aria-hidden="true" /> Wallet credit requests</h2>
      <p>Credits appear in Customer Money after review and approval.</p>
      {!creditRequests ? <p role="status">Loading request history…</p> :
        creditRequests.length ? <ul className="indipay-request-list">{creditRequests.map((row) =>
          <li key={row.id}><strong>{formatPaise(row.amountPaise)} · {row.status}</strong>
            <span>{row.purpose === "superstore" ? "Super Store" : "Indipay"} · {new Date(row.createdAt).toLocaleDateString("en-IN")}</span>
            {row.remarks && <small>{row.remarks}</small>}</li>)}</ul> :
          <p className="indipay-activity-empty">No credit requests yet.</p>}
      <button type="button" className="indipay-activity-add" onClick={onAddMoney}>Add Money</button>
    </section>
  </div>;
}
