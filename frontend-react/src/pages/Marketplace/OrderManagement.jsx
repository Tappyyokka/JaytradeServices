import { useState } from "react";
import { Check, Package, Truck } from "lucide-react";
import marketplaceRequest from "../../config/marketplaceApi";
import { isClosedOrder, orderStage, orderStages } from "./marketplaceData";
import { OrderReceipt } from "./ShoppingCheckout";
import "./OrderManagement.css";

const dateTime = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const dateOnly = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });

function orderStatus(order) {
  if (order.refunded) return "Refunded";
  const request = order.management?.request;
  if (request?.status === "approved") return request.kind === "cancel" ? "Cancelled" : "Returned";
  return orderStages[orderStage(order)];
}

function displayDate(value, formatter = dateTime) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime()) ? formatter.format(date) : "Unavailable";
}

function Delivery({ order }) {
  const details = order.checkoutDetails;
  const address = details?.address;
  const { courier, tracking } = order.management ?? {};
  return <dl className="mp-order-facts">
    <div><dt>Delivery address</dt><dd>{address ? [address.fullName, address.mobile, address.building, address.locality,
      address.landmark, address.city, address.district, address.state, address.pin].filter(Boolean).join(", ") : "Unavailable"}</dd></div>
    <div><dt>Estimated delivery</dt><dd>{displayDate(details?.estimatedDate, dateOnly)}{details?.deliveryLabel && ` · ${details.deliveryLabel}`}</dd></div>
    {details?.notes && <div><dt>Delivery notes</dt><dd>{details.notes}</dd></div>}
    {courier && <div><dt>Courier</dt><dd>{courier}</dd></div>}
    {tracking && <div><dt>Tracking number</dt><dd>{tracking}</dd></div>}
  </dl>;
}

function Tracking({ order }) {
  const current = orderStage(order);
  const events = order.management?.events ?? [];
  const closed = isClosedOrder(order);
  return <details className="mp-order-disclosure">
    <summary><Truck size={17} aria-hidden="true" /> Track Order</summary>
    <Delivery order={order} />
    <ol className="mp-order-timeline">
      {orderStages.map((label, stage) => {
        const at = stage === 0 ? order.createdAt : events.find((event) => event.stage === stage)?.at;
        return <li key={label} data-reached={stage <= current} aria-current={!closed && stage === current ? "step" : undefined}>
          <span className="mp-order-marker" aria-hidden="true">{stage <= current && <Check size={13} />}</span>
          <div><strong>{label}</strong><small>{at ? displayDate(at) : stage <= current ? "Time unavailable" : closed ? "Not reached" : "Pending"}</small></div>
        </li>;
      })}
    </ol>
    {!!events.some((event) => event.stage == null) && <ul className="mp-order-updates">
      {events.filter((event) => event.stage == null).map((event, index) =>
        <li key={index}>{event.title} · {displayDate(event.at)}</li>)}
    </ul>}
  </details>;
}

export function OrderRequestSummary({ order }) {
  const request = order.management?.request;
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  if (!request) return null;
  const labels = { pending: "Awaiting review", approved: "Accepted · refund awaiting admin approval", rejected: "Declined", refunded: "Refunded to Customer Money" };
  async function viewEvidence() {
    setError("");
    try {
      const result = await marketplaceRequest(`/orders/${encodeURIComponent(order.id)}/evidence`);
      setImage(result.image);
    } catch (failure) { setError(failure.message); }
  }
  return <div className="mp-order-request">
    <strong>{request.kind === "cancel" ? "Cancellation" : "Return"} · {labels[request.status]}</strong>
    <p>{request.reason}</p>
    {request.note && <p>Review note: {request.note}</p>}
    {request.hasEvidence && !image && <button type="button" onClick={viewEvidence}>View supporting image</button>}
    {image && <img className="mp-order-evidence" src={image} alt="Photo submitted with this order request" />}
    {error && <p role="alert">{error}</p>}
  </div>;
}

function evidenceData(file) {
  if (!file?.size) return Promise.resolve(undefined);
  if (!["image/png", "image/jpeg"].includes(file.type) || file.size > 250 * 1024) {
    throw new Error("Attach a PNG or JPEG up to 250 KB.");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the supporting image."));
    reader.readAsDataURL(file);
  });
}

function OrderCard({ order, money, products, action, merchant, storeName }) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const stage = orderStage(order);
  const status = orderStatus(order);
  const request = order.management?.request;
  const kind = order.requestOptions?.[0];
  const canFulfil = merchant && order.canManage && !isClosedOrder(order) && stage < 6 &&
    !(request?.kind === "cancel" && request.status === "pending");
  const path = "/orders/" + encodeURIComponent(order.id);
  const store = order.checkoutDetails?.store || storeName || products.get(order.lines[0]?.id)?.seller || "Store unavailable";
  async function submit(run) {
    setBusy(true);
    setFeedback("");
    try { await run(); setFeedback("Order updated."); }
    catch (error) { setFeedback(error.message); }
    finally { setBusy(false); }
  }
  return <article className="mp-order-card">
    <header className="mp-order-heading">
      <div><h2>{store}</h2><small>Order {order.id}</small></div>
      <span className="mp-order-status">{status}</span>
    </header>
    <ul className="mp-order-lines">
      {order.lines.map((line, index) => {
        const product = products.get(line.id);
        return <li key={index}>
          {product?.image ? <img src={product.image} alt="" loading="lazy" /> : <span><Package size={20} aria-hidden="true" /></span>}
          <div><strong>{line.name}</strong><small>Qty {line.quantity}{line.variantName && ` · ${line.variantName}`}</small></div>
        </li>;
      })}
    </ul>
    <dl className="mp-order-facts">
      <div><dt>Order date</dt><dd>{displayDate(order.createdAt, dateOnly)}</dd></div>
      <div><dt>{merchant && !order.canManage ? "Store items" : "Amount paid"}</dt><dd>{money.format(order.total)}{order.checkoutDetails?.demo && " · Demo"}</dd></div>
    </dl>
    <details className="mp-order-disclosure" open={merchant || undefined}>
      <summary>Order details</summary>
      <Delivery order={order} />
      {!merchant && <OrderReceipt order={order} status={status} />}
    </details>
    {!merchant && <Tracking order={order} />}
    <OrderRequestSummary key={request?.at ?? "none"} order={order} />
    {kind && !merchant && <details className="mp-order-disclosure" key={kind}>
      <summary>{kind === "cancel" ? "Cancel Order" : "Request Return or Refund"} · Demo</summary>
      <form onSubmit={(event) => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        void submit(async () => action(path + "/requests", "POST", {
          kind, reason: fields.get("reason"), evidence: await evidenceData(fields.get("evidence")),
        }));
      }}>
        <p>{kind === "cancel" ? "Cancellation is available before shipping." : "Returns can be requested within 7 days of recorded delivery."} Refunds require approval.</p>
        <label>Reason<textarea name="reason" required minLength={5} maxLength={500} /></label>
        {kind === "return" && <label>Supporting image (PNG or JPEG, 250 KB max)<input name="evidence" type="file" accept="image/png,image/jpeg" required /></label>}
        <button type="submit" disabled={busy}>Submit request</button>
      </form>
    </details>}
    {canFulfil && <form onSubmit={(event) => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      const updateTracking = event.nativeEvent.submitter?.value === "courier";
      void submit(() => action(path + "/delivery", "PATCH", {
        stage: updateTracking ? stage : stage + 1, updateTracking,
        courier: fields.get("courier") ?? "", tracking: fields.get("tracking") ?? "",
      }));
    }}>
      {stage >= 3 && <div className="mp-order-fields" key={order.managementVersion}>
        <label>Courier name<input name="courier" maxLength={80} defaultValue={order.management?.courier} /></label>
        <label>Tracking number<input name="tracking" maxLength={100} defaultValue={order.management?.tracking} /></label>
      </div>}
      <div className="mp-order-actions">
        <button type="submit" disabled={busy}>{stage === 0 ? "Confirm order" : `Mark ${orderStages[stage + 1].toLowerCase()}`}</button>
        {stage >= 3 && <button type="submit" value="courier" disabled={busy}>Save tracking details</button>}
      </div>
    </form>}
    {merchant && order.canManage && request?.status === "pending" && <form onSubmit={(event) => {
      event.preventDefault();
      const note = new FormData(event.currentTarget).get("note");
      const decision = event.nativeEvent.submitter?.value;
      void submit(() => action(path + "/requests", "PATCH", { decision, note }));
    }}>
      <label>Review note<textarea name="note" required minLength={3} maxLength={500} /></label>
      <div className="mp-order-actions">
        <button type="submit" value="approved" disabled={busy}>{request.kind === "cancel" ? "Accept cancellation" : "Confirm return received"}</button>
        <button type="submit" value="rejected" disabled={busy}>Decline request</button>
      </div>
    </form>}
    {feedback && <p role="status">{feedback}</p>}
  </article>;
}

export default function OrderManagement({ orders, money, products, action, merchant = false, storeName, empty }) {
  const [filter, setFilter] = useState("");
  const statuses = [...orderStages, "Cancelled", "Returned", "Refunded", "Requests under review"];
  const visible = orders.filter((order) => !filter || (filter === "Requests under review"
    ? order.management?.request?.status === "pending" : orderStatus(order) === filter));
  return <div className="mp-orders">
    <label className="mp-order-filter">Filter by status
      <select value={filter} onChange={(event) => setFilter(event.target.value)}>
        <option value="">All orders</option>
        {statuses.map((status) => <option key={status}>{status}</option>)}
      </select>
    </label>
    {visible.length === 0 && <p>{filter ? "No orders match this status." : empty}</p>}
    {visible.map((order) => <OrderCard key={order.id} {...{ order, money, products, action, merchant, storeName }} />)}
  </div>;
}
