import { isClosedOrder, orderStage } from "./marketplaceData";

const activityKey = "indipay-store-activity-v1";
const dayMs = 86_400_000;
const istOffset = 330 * 60_000;
const dayKey = (value) => new Date(new Date(value).getTime() + istOffset).toISOString().slice(0, 10);
const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" });

export function browserActivity() {
  try {
    const stored = JSON.parse(localStorage.getItem(activityKey) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch { return []; }
}

export function recordStoreActivity(storeId, productId) {
  const day = dayKey(Date.now());
  const rows = browserActivity().filter((row) => row.day >= dayKey(Date.now() - 90 * dayMs));
  const previous = rows.find((row) => row.day === day && row.storeId === storeId && row.productId === productId);
  if (previous) previous.count += 1;
  else rows.push({ day, storeId, productId, count: 1 });
  try { localStorage.setItem(activityKey, JSON.stringify(rows.slice(-3000))); }
  catch { /* Local activity is optional when browser storage is full. */ }
}

export function availableStock(product) {
  if (product.available === false) return 0;
  const variants = product.variantOptions ?? product.variants ?? [];
  if (!variants.length) return product.stock ?? 0;
  return variants.reduce((total, variant) => total + (variant.stock ?? product.stock ?? 0), 0);
}

function summarize(orders) {
  let sales = 0;
  let delivered = 0;
  let cancelled = 0;
  let pending = 0;
  const products = new Map();
  for (const order of orders) {
    const request = order.management?.request;
    if (isClosedOrder(order)) {
      if (request?.kind === "cancel" && ["approved", "refunded"].includes(request.status)) cancelled += 1;
      continue;
    }
    if (orderStage(order) === 6) delivered += 1;
    else pending += 1;
    for (const line of order.lines) {
      sales += line.price * line.quantity;
      const prior = products.get(line.id);
      products.set(line.id, { name: line.name, quantity: (prior?.quantity ?? 0) + line.quantity });
    }
  }
  return { sales, delivered, pending, cancelled, products, volume: orders.length };
}

export function storeInsights(orders, activity, storeId, period, now = Date.now()) {
  const today = dayKey(now);
  const date = new Date(today + "T00:00:00Z");
  const start = period === "week" ? dayKey(date.getTime() - ((date.getUTCDay() + 6) % 7) * dayMs)
    : period === "month" ? today.slice(0, 7) + "-01" : today;
  const dated = orders.map((order) => ({ ...order, day: dayKey(order.createdAt) }));
  const recent = dated.filter((order) => order.day >= start && order.day <= today);
  const totals = summarize(recent);
  const local = activity.filter((row) => row.storeId === storeId && row.day >= start && row.day <= today);
  const daily = Array.from({ length: 7 }, (_, index) => {
    const day = dayKey(date.getTime() - (6 - index) * dayMs);
    return { key: day, label: day.slice(5), ...summarize(dated.filter((order) => order.day === day)),
      views: activity.filter((row) => row.storeId === storeId && row.productId && row.day === day).reduce((sum, row) => sum + row.count, 0) };
  });
  const monthly = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 5 + index, 1));
    const key = month.toISOString().slice(0, 7);
    return { key, label: monthLabel.format(month), ...summarize(dated.filter((order) => order.day.startsWith(key))) };
  });
  return {
    ...totals, daily, monthly, recent: recent.slice(0, 5),
    visitors: local.filter((row) => !row.productId).reduce((sum, row) => sum + row.count, 0),
    views: local.filter((row) => row.productId).reduce((sum, row) => sum + row.count, 0),
    best: [...totals.products.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    allSold: summarize(orders).products,
  };
}
