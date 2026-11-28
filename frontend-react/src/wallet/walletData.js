export const walletTypeLabels = {
  subscription: "Merchant subscription payment",
  "wallet-credit": "Wallet credit",
  "application-payment": "Application registration payment",
  reward: "Reward credit",
  referral: "Referral earnings",
  learning: "Learn & Earn reward",
  commission: "Eligible commission",
  purchase: "Superstore purchase",
  refund: "Order refund",
  reversal: "Cancelled order reversal",
  adjustment: "Administrative adjustment",
};

export const walletStatusLabels = { completed: "Completed", pending: "Pending", failed: "Failed" };

const earningTypes = new Set(["reward", "referral", "learning", "commission"]);
// A type can be disabled here. Individual credits also require explicit eligibility.
const marketplaceEarningTypes = new Set(earningTypes);
const currencyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export const formatPaise = (amount) => Number.isSafeInteger(amount) ? currencyFormatter.format(amount / 100) : "Unavailable";
export const rupeesToPaise = (value) => typeof value === "number" && Number.isSafeInteger(Math.round(value * 100)) ? Math.round(value * 100) : null;
const knownPaise = (value) => Number.isSafeInteger(value) && value >= 0 ? value : null;

export function walletEstimate(balance, subtotal) {
  return {
    remaining: balance !== null && subtotal !== null && balance >= subtotal ? balance - subtotal : null,
    required: balance !== null && subtotal !== null && balance < subtotal ? subtotal - balance : null,
  };
}

const completed = (transaction) => transaction.status === "completed";
const earned = (transaction) => completed(transaction) && transaction.direction === "credit" &&
  marketplaceEarningTypes.has(transaction.type) && transaction.eligible && transaction.affectsSpending;
const spent = (transaction) => completed(transaction) && transaction.type === "purchase" && transaction.direction === "debit";
const refunded = (transaction) => completed(transaction) && transaction.type === "refund" && transaction.direction === "credit";
const sum = (rows) => rows.reduce((total, row) => total + row.amountPaise, 0);
const signedAmount = (transaction) => transaction.direction === "credit" ? transaction.amountPaise : -transaction.amountPaise;

function transactionType(entry) {
  if (Object.hasOwn(walletTypeLabels, entry.type)) return entry.type;
  const prefix = (entry.reference ?? "").split(":")[0];
  const types = {
    order: "purchase", refund: "refund", reversal: "reversal", application: "application-payment",
    "application-credit": "wallet-credit", credit: "wallet-credit", referral: "referral", subscription: "subscription",
    learning: "learning", reward: "reward", commission: "commission", adjustment: "adjustment",
  };
  if (String(entry.reference ?? "").startsWith("DEMO-REG-")) return "application-payment";
  if (String(entry.reference ?? "").startsWith("DEMO-CREDIT-")) return "wallet-credit";
  return Object.hasOwn(types, prefix) ? types[prefix] : "adjustment";
}

function normalizeLedger(entries, customerId, orders) {
  return entries.flatMap((entry) => {
    if (entry.userId != null && entry.userId !== customerId) return [];
    const signed = Number.isInteger(entry.amountPaise) ? entry.amountPaise : rupeesToPaise(entry.amount);
    const amountPaise = signed === null ? null : Math.abs(signed);
    const timestamp = entry.timestamp ?? entry.createdAt;
    if (amountPaise === null || !Number.isFinite(Date.parse(timestamp))) return [];
    const type = transactionType(entry);
    const referenceId = entry.referenceId ?? entry.reference ?? "";
    const status = entry.status ?? "completed";
    if (!Object.hasOwn(walletStatusLabels, status)) return [];
    const orderId = entry.orderId ?? (["purchase", "refund", "reversal"].includes(type) ? referenceId.split(":")[1] ?? "" : "");
    const order = orders.find((item) => item.id === orderId);
    return [{
      id: entry.id ?? referenceId, customerId, type, amountPaise, currency: "INR", status, timestamp, referenceId, orderId,
      direction: entry.direction === "debit" || (!entry.direction && signed < 0) ? "debit" : "credit",
      description: entry.description ?? walletTypeLabels[type],
      eligible: entry.eligible === true,
      // Legacy entries come from the dedicated marketplace ledger.
      affectsSpending: entry.affectsSpending !== false,
      store: entry.store ?? order?.store, category: entry.category ?? order?.category,
      reversalReference: entry.reversalReference ?? (["refund", "reversal"].includes(type) ? referenceId : ""),
      paymentMethod: entry.paymentMethod ?? (orderId ? "Customer Money" : "Wallet credit"),
    }];
  });
}

function attachBalances(rows, startingBalance) {
  let balance = startingBalance;
  return [...rows].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).map((row) => {
    const updatedBalance = row.affectsSpending ? balance : null;
    if (balance !== null && completed(row) && row.affectsSpending) balance -= signedAmount(row);
    return { ...row, previousBalance: row.affectsSpending ? balance : null, updatedBalance };
  });
}

export function accountWallet(account, customer) {
  const details = account?.indipayMoney ?? customer?.indipayMoney;
  const wallet = account?.wallet;
  const availablePaise = knownPaise(wallet?.balancePaise) ?? knownPaise(rupeesToPaise(wallet?.balance)) ??
    knownPaise(details?.marketplaceBalancePaise) ?? (account && !wallet ? 0 : null);
  const entries = wallet?.entries ?? [];
  const rows = normalizeLedger(entries, customer?.id, account?.orders ?? []);
  return {
    availablePaise, totalPaise: knownPaise(details?.totalBalancePaise) ?? availablePaise,
    restrictedPaise: knownPaise(details?.restrictedBalancePaise),
    reservedPaise: knownPaise(details?.reservedPaise),
    pendingPaise: knownPaise(details?.pendingCreditsPaise) ?? (account ? sum(rows.filter((row) => row.status === "pending" && row.direction === "credit")) : null),
    transactions: attachBalances(rows, availablePaise),
    partial: account?.partial === true,
    demo: false,
  };
}

export function shoppingWallet(wallet) {
  return {
    ...wallet,
    transactions: wallet.transactions.filter((row) => ["purchase", "refund", "reversal"].includes(row.type) ||
      (row.type === "wallet-credit" && row.referenceId.startsWith("credit:")) ||
      (row.direction === "credit" && row.eligible && row.affectsSpending && marketplaceEarningTypes.has(row.type))),
  };
}

export function walletDemo(now) {
  const fixtures = [
    [95, "reward", "credit", 150000, "completed", "Sample reward credit", { eligible: true }],
    [56, "referral", "credit", 57500, "completed", "Sample referral reward", { eligible: true }],
    [41, "learning", "credit", 32500, "completed", "Sample Learn & Earn reward", { eligible: true }],
    [19, "commission", "credit", 65000, "completed", "Sample verified commission credit", { eligible: true }],
    [14, "purchase", "debit", 64900, "completed", "Botanical facial serum", { orderId: "DEMO-201", store: "Root & Bloom", category: "Beauty" }],
    [10, "purchase", "debit", 44900, "completed", "Roasted coffee", { orderId: "DEMO-202", store: "Hill Roast", category: "Grocery" }],
    [8, "refund", "credit", 44900, "completed", "Sample refund for returned coffee", { orderId: "DEMO-202", store: "Hill Roast", category: "Grocery", reversalReference: "DEMO-202-REFUND" }],
    [6, "reward", "credit", 25000, "completed", "Sample reward reserved for services", { affectsSpending: false }],
    [5, "purchase", "debit", 24900, "completed", "Roasted coffee sampler duo", { orderId: "DEMO-203", store: "Hill Roast", category: "Grocery" }],
    [4, "reversal", "credit", 24900, "completed", "Sample cancellation reversal", { orderId: "DEMO-203", store: "Hill Roast", category: "Grocery", reversalReference: "DEMO-203-CANCEL" }],
    [3, "adjustment", "credit", 12500, "completed", "Sample administrator correction", {}],
    [2, "purchase", "debit", 399900, "failed", "Sample payment failed", { orderId: "DEMO-204", store: "Oakline Home", category: "Home & Living" }],
    [1, "referral", "credit", 15000, "pending", "Sample referral credit awaiting approval", { eligible: true }],
  ];
  const rows = fixtures.map(([offset, type, direction, amountPaise, status, description, extra], index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    return {
      id: "DEMO-TX-" + String(index + 1).padStart(3, "0"), customerId: "demo-customer", type, direction, amountPaise, currency: "INR",
      status, description, timestamp: date.toISOString(), referenceId: extra.orderId ?? "DEMO-REF-" + (index + 1),
      paymentMethod: extra.orderId ? "Demo Superstore wallet" : "Demo wallet credit",
      affectsSpending: true, ...extra,
    };
  });
  const totalPaise = rows.filter(completed).reduce((total, row) => total + signedAmount(row), 0);
  const availablePaise = rows.filter((row) => completed(row) && row.affectsSpending).reduce((total, row) => total + signedAmount(row), 0);
  return {
    availablePaise, totalPaise, restrictedPaise: totalPaise - availablePaise, reservedPaise: 0,
    pendingPaise: sum(rows.filter((row) => row.status === "pending" && row.direction === "credit")),
    transactions: attachBalances(rows, availablePaise), partial: false, demo: true,
  };
}

export function summarizeWallet(rows) {
  return { earned: sum(rows.filter(earned)), spent: sum(rows.filter(spent)), refunded: sum(rows.filter(refunded)) };
}

export function filterWallet(rows, { filter = "all", query = "", from = "", to = "" } = {}) {
  const filters = {
    all: () => true,
    credits: (row) => row.direction === "credit",
    debits: (row) => row.direction === "debit",
    purchases: (row) => row.type === "purchase",
    rewards: (row) => earningTypes.has(row.type),
    refunds: (row) => ["refund", "reversal"].includes(row.type),
    pending: (row) => row.status === "pending",
    completed,
    failed: (row) => row.status === "failed",
  };
  const selected = Object.hasOwn(filters, filter) ? filters[filter] : filters.all;
  const term = query.trim().toLowerCase();
  return rows.filter((row) => {
    const day = dateKey(new Date(row.timestamp));
    return selected(row) && (!from || day >= from) && (!to || day <= to) &&
      [row.id, row.orderId, row.referenceId, row.store, row.description].filter(Boolean).join(" ").toLowerCase().includes(term);
  });
}

export function dateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function statementRange(preset, now) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const offsets = { current: 0, previous: 1, three: 2, six: 5 };
  return {
    from: dateKey(new Date(year, month - (offsets[preset] ?? 0), 1)),
    to: dateKey(preset === "previous" ? new Date(year, month, 0) : now),
  };
}

export function walletStatement(wallet, from, to) {
  const rows = filterWallet(wallet.transactions, { from, to });
  const ledger = wallet.transactions.filter((row) => row.affectsSpending && completed(row));
  const inRange = rows.filter((row) => row.affectsSpending && completed(row));
  const credits = sum(inRange.filter((row) => row.direction === "credit"));
  const debits = sum(inRange.filter((row) => row.direction === "debit"));
  const oldest = wallet.transactions.at(-1);
  const oldestDay = oldest ? dateKey(new Date(oldest.timestamp)) : "";
  const day = (row) => dateKey(new Date(row.timestamp));
  const anchor = wallet.availablePaise;
  const opening = anchor === null || (wallet.partial && from <= oldestDay)
    ? null : anchor - ledger.filter((row) => day(row) >= from).reduce((total, row) => total + signedAmount(row), 0);
  const closing = anchor === null || (wallet.partial && to < oldestDay)
    ? null : anchor - ledger.filter((row) => day(row) > to).reduce((total, row) => total + signedAmount(row), 0);
  const reportAvailable = anchor !== null || rows.length > 0;
  return { rows, opening, closing, credits: reportAvailable ? credits : null, debits: reportAvailable ? debits : null };
}

function breakdown(rows, field) {
  const values = new Map();
  for (const row of rows.filter(spent)) {
    const label = row[field] || (field === "store" ? "Store unavailable" : "Category unavailable");
    values.set(label, (values.get(label) ?? 0) + row.amountPaise);
  }
  return [...values].map(([label, amount]) => ({ label, amount })).sort((a, b) => b.amount - a.amount);
}

export function walletAnalytics(rows, now) {
  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const month = dateKey(date).slice(0, 7);
    const totals = summarizeWallet(rows.filter((row) => dateKey(new Date(row.timestamp)).startsWith(month)));
    return { label: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }), ...totals };
  });
  const weekly = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - index));
    const key = dateKey(date);
    return { label: date.toLocaleDateString("en-IN", { weekday: "short" }), amount: sum(rows.filter((row) => completed(row) && dateKey(new Date(row.timestamp)) === key)) };
  });
  return { monthly, weekly, category: breakdown(rows, "category"), store: breakdown(rows, "store"), refunds: summarizeWallet(rows).refunded };
}

export function walletCsv(rows) {
  const escape = (value) => {
    const asText = String(value ?? "");
    const text = /^\s*[=+\-@\t\r]/.test(asText) ? "'" + asText : asText;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const headers = ["Dataset", "Transaction ID", "Type", "Direction", "Amount (INR)", "Status", "Date and time", "Order ID", "Reference", "Store", "Description"];
  const records = rows.map((row) => ["Demonstration", row.id, walletTypeLabels[row.type], row.direction, (row.amountPaise / 100).toFixed(2),
    walletStatusLabels[row.status], row.timestamp, row.orderId, row.referenceId, row.store, row.description]);
  return "\ufeff" + [headers, ...records].map((record) => record.map(escape).join(",")).join("\r\n");
}
