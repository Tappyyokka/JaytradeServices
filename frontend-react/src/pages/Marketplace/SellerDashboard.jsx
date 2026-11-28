import { useEffect, useRef, useState } from "react";
import PublishedAdminContent from "../PublishedAdminContent";
import ProductEditor from "./ProductEditor";
import { categories } from "./marketplaceData";
import OrderManagement from "./OrderManagement";
import { StoreEditor } from "./StoreProfiles";
import { subscriptionPlans } from "./subscriptionPlans";
import { availableStock, browserActivity, storeInsights } from "./merchantInsights";
import "./MerchantManagement.css";

const emptyListing = { category: categories[1], stock: 0 };

function BarChart({ title, rows, field, format = String }) {
  const maximum = Math.max(1, ...rows.map((row) => row[field]));
  return <section className="mp-merchant-chart">
    <h3>{title}</h3>
    {rows.map((row) => <div key={row.key}>
      <span>{row.label}</span><progress aria-label={title + " " + row.label} value={row[field]} max={maximum} />
      <strong>{format(row[field])}</strong>
    </div>)}
  </section>;
}

export default function SellerDashboard({ shop, storeId, followers, onPublic, onPlans, subscriptionStatus, canPublish, action, onProduct,
  orderAction, selectedOrder, money, renderAnnouncements }) {
  const [editing, setEditing] = useState(null);
  const [editingStore, setEditingStore] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [period, setPeriod] = useState("week");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("");
  const ordersSection = useRef(null);
  useEffect(() => {
    if (selectedOrder) ordersSection.current?.scrollIntoView({ block: "start" });
  }, [selectedOrder]);

  const { orders, listings, store } = shop;
  const insights = storeInsights(orders, browserActivity(), storeId, period);
  const plan = subscriptionPlans[store.plan];
  const limit = store.subscriptionProductLimit === -1 ? Infinity : store.subscriptionProductLimit ?? plan?.limit;
  const slots = plan ? Math.max(0, limit - listings.length) : null;
  const low = (item) => item.active !== false && availableStock(item) <= (item.lowStockThreshold ?? 5);
  const lowItems = listings.filter(low);
  const active = listings.filter((item) => item.active !== false).length;
  const visible = listings.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()) &&
    (!category || category === item.category) &&
    (!inventoryFilter || (inventoryFilter === "active" && item.active !== false) ||
      (inventoryFilter === "inactive" && item.active === false) || (inventoryFilter === "low" && low(item)) ||
      (inventoryFilter === "out" && availableStock(item) === 0)));

  async function submit(run, success) {
    setBusy(true);
    setMessage("");
    try { await run(); setMessage(success); return true; }
    catch (failure) { setMessage(failure.message); return false; }
    finally { setBusy(false); }
  }

  const changeInventory = (item, change) => submit(() => action(`/products/${item.id}/inventory`, "PATCH", change), "Inventory updated.");

  const rate = (count) => insights.volume ? Math.round(count * 100 / insights.volume) + "%" : "—";
  const metrics = [
    ["Total products", listings.length], ["Active products", active], ["Inactive products", listings.length - active],
    ["Total orders", insights.volume], ["Pending orders", insights.pending], ["Completed orders", insights.delivered],
    ["Product sales value", money.format(insights.sales)], ["Low-stock alerts", lowItems.length],
    ["Store visits · this browser", insights.visitors], ["Store followers", followers],
    ["Product views · this browser", insights.views], ["Completed / cancelled", rate(insights.delivered) + " / " + rate(insights.cancelled)],
  ];

  return <div className="mp-seller mp-merchant">
    <header className="mp-panel mp-merchant-heading">
      <div><h1>My Store</h1><p>{store.name || "Set up your store"}</p></div>
      {canPublish && <button type="button" onClick={onPublic}>View public store</button>}
    </header>
    {message && <p role="status">{message}</p>}
    <PublishedAdminContent merchant />
    <section className="mp-panel">
      <div className="mp-merchant-heading"><h2>Overview</h2>
        <label>Activity period<select value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="today">Today</option><option value="week">This Week</option><option value="month">This Month</option>
        </select></label></div>
      <dl className="mp-merchant-metrics">{metrics.map(([label, value]) =>
        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <p>Sales show item value excluding delivery, refunds and closed orders. Visits and views reflect activity stored in this browser.</p>
      {lowItems.length > 0 && <p>Low stock: {lowItems.map((item) => item.name).join(", ")}</p>}
      <div className="mp-merchant-columns">
        <div><h3>Recent orders</h3>{insights.recent.length ? <ul>{insights.recent.map((order) =>
          <li key={order.id}><a href={`#seller?id=${encodeURIComponent(order.id)}`}>Order {order.id.slice(0, 8)}</a> · {money.format(order.total)}</li>)}</ul> : <p>No orders in this period.</p>}</div>
        <div><h3>Best-selling products</h3>{insights.best.length ? <ol>{insights.best.map(({ name, quantity }, index) =>
          <li key={index}>{name} · {quantity} sold</li>)}</ol> : <p>No sales in this period.</p>}</div>
      </div>
    </section>
    <section className="mp-panel">
      <h2>Store profile</h2>
      {canPublish ? (editingStore ? <StoreEditor store={store} onDone={() => setEditingStore(false)} onSave={async (details) => {
        const { name, username, description, ...profile } = details;
        await action("/store", "PUT", { name, username, description, profile });
        setMessage("Store profile saved.");
      }} /> : <button type="button" onClick={() => setEditingStore(true)}>Edit store profile</button>) : <p>Activate a subscription to edit your public profile.</p>}
    </section>
    <section className="mp-panel">
      <h2>Subscription</h2>
      <p>{plan ? plan.name : "No paid plan"} · {subscriptionStatus ?? "pending"}</p>
      {store.subscriptionEnd && <p>Valid until {new Date(store.subscriptionEnd).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>}
      {store.subscriptionReference && <p>Payment reference {store.subscriptionReference}</p>}
      <p>{canPublish && plan ? `Product limit ${Number.isFinite(limit) ? limit : "Unlimited"} · ${Number.isFinite(slots) ? slots : "Unlimited"} slots remaining` : `${listings.length} products saved`}</p>
      <button type="button" onClick={onPlans}>{canPublish ? "View, renew or upgrade plan" : "Activate subscription"}</button>
    </section>
    <section className="mp-panel">
      <div className="mp-merchant-heading"><h2>Products and inventory</h2>
        <button type="button" disabled={!canPublish || slots === 0 || busy} onClick={() => setEditing(emptyListing)}>Add product</button></div>
      {canPublish && editing && <ProductEditor key={editing.id ?? "new"} listing={editing} onCancel={() => setEditing(null)} onSave={async (details) => {
        if (await submit(() => action(`/products/${editing.id ?? "new"}`, "PUT", details), "Product saved.")) setEditing(null);
      }} />}
      <div className="mp-merchant-columns mp-merchant-filters">
        <label>Search products<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>
          {categories.slice(1).map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Stock and visibility<select value={inventoryFilter} onChange={(event) => setInventoryFilter(event.target.value)}>
          <option value="">All products</option><option value="active">Active</option><option value="inactive">Inactive</option>
          <option value="low">Low stock</option><option value="out">Out of stock</option></select></label>
      </div>
      {!visible.length && <p>No matching products.</p>}
      {visible.map((item) => {
        const stock = availableStock(item);
        return <article className="mp-merchant-listing" key={item.id}>
          {item.image && <img src={item.image} alt="" loading="lazy" width={56} height={56} />}
          <div><strong>{item.name}</strong><p>{money.format(item.price)} · {item.active === false ? "Inactive" : "Active"} · {stock} available · {insights.allSold.get(item.id)?.quantity ?? 0} sold</p>
            {low(item) && <small role="status">{stock ? "Low stock" : "Out of stock"} · Alert at {item.lowStockThreshold ?? 5}</small>}</div>
          <div className="mp-merchant-actions">
            <button type="button" disabled={busy || !canPublish} onClick={() => setEditing(item)}>Edit</button>
            {canPublish && item.active && <button type="button" onClick={() => onProduct(item)}>Reviews</button>}
            <button type="button" disabled={busy || !canPublish} onClick={() => changeInventory(item, { active: item.active === false })}>{item.active === false ? "Show" : "Hide"}</button>
            {stock > 0 && <button type="button" disabled={busy || !canPublish} onClick={() => changeInventory(item, { outOfStock: true })}>Mark out of stock</button>}
            {removing === item.id ? <>
              <button type="button" disabled={busy} onClick={async () => {
                if (await submit(() => action(`/products/${item.id}`, "DELETE"), "Product deleted.")) {
                  setRemoving(null);
                  if (editing?.id === item.id) setEditing(null);
                }
              }}>Confirm delete</button><button type="button" onClick={() => setRemoving(null)}>Cancel</button>
            </> : <button type="button" disabled={!canPublish} onClick={() => setRemoving(item.id)}>Delete</button>}
          </div>
        </article>;
      })}
    </section>
    <section className="mp-panel">
      <h2>Store analytics</h2>
      <div className="mp-merchant-columns">
        <BarChart title="Daily sales · 7 days" rows={insights.daily} field="sales" format={(amount) => money.format(amount)} />
        <BarChart title="Monthly sales · 6 months" rows={insights.monthly} field="sales" format={(amount) => money.format(amount)} />
        <BarChart title="Daily order volume" rows={insights.daily} field="volume" />
        <BarChart title="Daily product views · this browser" rows={insights.daily} field="views" />
      </div>
    </section>
    {canPublish && renderAnnouncements?.(listings)}
    <section className="mp-panel" ref={ordersSection}>
      <h2>Customer orders</h2>
      {selectedOrder && <a href="#seller">View all customer orders</a>}
      <OrderManagement key={selectedOrder || "all"} orders={selectedOrder ? orders.filter((order) => order.id === selectedOrder) : orders}
        money={money} products={new Map(listings.map((product) => [product.id, product]))} action={orderAction}
        merchant storeName={store.name} empty="Purchases of your products will appear here." />
    </section>
  </div>;
}
