import { useEffect, useState } from "react";
import { OrderRequestSummary } from "./OrderManagement";

export default function MarketplaceAdmin({ request, onChange, money }) {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [refundId, setRefundId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    request("/admin/recent").then((result) => {
      if (!cancelled) setData(result);
    }).catch((error) => { if (!cancelled) setMessage(error.message); });
    return () => { cancelled = true; };
  }, [request]);

  async function mutate(path, method, body, success) {
    const remarks = window.prompt("Enter audit remarks to confirm this action.");
    if (!remarks?.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      await request(path, method, { ...body, confirmed: true, remarks });
      setMessage(success);
      setRefundId(null);
      setData(await request("/admin/recent"));
      await onChange();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mp-panel mp-seller">
      <h1>Superstore admin</h1>
      <p role="status">{message}</p>
      {data && (
        <fieldset disabled={busy}>
          <legend>Manage Superstore accounts and orders</legend>
          <form onSubmit={(event) => {
            event.preventDefault();
            const fields = new FormData(event.currentTarget);
            void mutate(`/admin/wallets/${encodeURIComponent(fields.get("userId"))}/credits`, "POST", {
              amount: Number(fields.get("amount")),
              reference: fields.get("reference"),
            }, "Wallet credited.");
          }}>
            <label>Account<select name="userId" required>
              <option value="">Select an account</option>
              {data.users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.email}</option>)}
            </select></label>
            <label>Credit amount (₹)<input name="amount" min="1" max="10000000" type="number" required /></label>
            <label>Unique credit reference<input name="reference" minLength={8} maxLength={80} pattern="[A-Za-z0-9_\-]+" required /></label>
            <button type="submit">Credit wallet</button>
          </form>
          <h2>Recent accounts</h2>
          {data.users.filter((user) => user.role !== "ADMIN").map((user) => (
            <div className="mp-cart-line" key={user.id}>
              <strong>{user.name} · {user.email}</strong>
              <button type="button" onClick={() => void mutate(`/admin/sellers/${user.id}`, "PATCH", { approved: user.role !== "SELLER" }, "Seller access updated.")}>
                {user.role === "SELLER" ? "Revoke seller access" : "Approve seller"}
              </button>
            </div>
          ))}
          <h2>Recent orders</h2>
          {data.orders.map((order) => {
            const canRefund = !order.checkoutDetails?.demo || (data.demoRefundsEnabled && order.management?.request?.status === "approved");
            return (
            <div className="mp-cart-line" key={order.id}>
              <strong>Order {order.checkoutDetails ? order.id : order.id.slice(0, 8).toUpperCase()} · {money.format(order.total)}</strong>
              {order.checkoutDetails && <span>{order.checkoutDetails.store} · {order.checkoutDetails.paymentReference} · Demo</span>}
              <OrderRequestSummary key={order.management?.request?.at ?? "none"} order={order} />
              {order.refunded ? <span>Refunded</span> : canRefund && (refundId === order.id ? (
                <>
                  <button type="button" onClick={() => void mutate(`/admin/orders/${order.id}/refund`, "POST", undefined, "Refund credited to Customer Money.")}>Confirm refund</button>
                  <button type="button" onClick={() => setRefundId(null)}>Cancel</button>
                </>
              ) : <button type="button" onClick={() => setRefundId(order.id)}>{order.checkoutDetails?.demo ? "Approve demo refund" : "Refund"}</button>)}
            </div>
            );
          })}
          <h2>Review reports</h2>
          {data.reviewReports?.length ? <ul>{data.reviewReports.map((report) => <li key={report.reviewId + ":" + report.userId}>
            <strong>{report.review.product.name} · {report.review.rating} / 5</strong>
            <p>{report.review.text}</p><p>Reported reason: {report.reason}</p>
          </li>)}</ul> : <p>No review reports.</p>}
          <h2>Recent wallet transactions</h2>
          <ul>{data.transactions?.map((entry) => <li key={entry.id}>
            {entry.reference} · {money.format(entry.amountPaise / 100)} · {new Date(entry.createdAt).toLocaleDateString("en-IN")}
          </li>)}</ul>
        </fieldset>
      )}
    </section>
  );
}
