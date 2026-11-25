import { useState } from "react";
import ProductEditor from "./ProductEditor";
import { categories, deliveryStages } from "./marketplaceData";

const emptyListing = {
  name: "", description: "", category: categories[1], price: "", original: "", stock: "", image: "",
};

export default function SellerDashboard({ shop, action, money }) {
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [message, setMessage] = useState("");
  const orders = shop.orders.flatMap((order) => {
    const lines = order.lines.filter((line) => line.sellerListing);
    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
    return lines.length ? [{ ...order, lines, subtotal }] : [];
  });
  const sales = orders.reduce((sum, order) => sum + order.subtotal, 0);
  const delivered = orders.reduce((sum, order) =>
    order.sellerStage === deliveryStages.length - 1 ? sum + order.subtotal : sum, 0);

  async function submit(path, method, body, success) {
    try {
      await action(path, method, body);
      setMessage(success);
      return true;
    } catch (failure) {
      setMessage(failure.message);
      return false;
    }
  }

  function saveStore(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = fields.get("name").trim();
    if (!name) { setMessage("Enter a store name."); return; }
    void submit("/store", "PUT", { name, description: fields.get("description").trim() }, "Store saved.");
  }

  async function deleteListing(id) {
    if (await submit(`/products/${id}`, "DELETE", undefined, "Listing deleted.")) setRemoving(null);
  }

  return (
    <div className="mp-seller">
      <h1>Seller dashboard</h1>
      <p role="status">{message}</p>
      <section className="mp-panel">
        <h2>Store profile</h2>
        <form onSubmit={saveStore}>
          <label>Store name<input name="name" required maxLength={80} defaultValue={shop.store.name} /></label>
          <label>Description<textarea name="description" maxLength={500} defaultValue={shop.store.description} /></label>
          <button type="submit">Save store</button>
        </form>
      </section>
      <section className="mp-panel">
        <h2>Products and inventory</h2>
        {shop.store.name
          ? <button type="button" onClick={() => setEditing(emptyListing)}>Add product</button>
          : <p>Save a store name to publish products.</p>}
        {editing && (
          <ProductEditor key={editing.id ?? "new"} listing={editing} onCancel={() => setEditing(null)} onSave={async (listing) => {
            if (await submit(`/products/${editing.id ?? "new"}`, "PUT", listing, "Listing published.")) setEditing(null);
          }} />
        )}
        {!shop.listings.length && <p>No products published yet.</p>}
        {shop.listings.map((item) => (
          <div className="mp-cart-line" key={item.id}>
            <strong>{item.name}</strong><span>{money.format(item.price)} · {item.stock ? `${item.stock} in stock` : "Out of stock"}</span>
            <button type="button" onClick={() => setEditing(item)}>Edit</button>
            {removing === item.id ? (
              <><button type="button" onClick={() => deleteListing(item.id)}>Confirm delete</button><button type="button" onClick={() => setRemoving(null)}>Cancel</button></>
            ) : <button type="button" onClick={() => setRemoving(item.id)}>Delete</button>}
          </div>
        ))}
      </section>
      <section className="mp-panel">
        <h2>Sales and settlements</h2>
        <dl><dt>Gross sales</dt><dd>{money.format(sales)}</dd><dt>Delivered earnings</dt><dd>{money.format(delivered)}</dd><dt>Pending settlement</dt><dd>{money.format(sales - delivered)}</dd></dl>
      </section>
      <section className="mp-panel">
        <h2>Customer orders</h2>
        {!orders.length && <p>Purchases of your products will appear here.</p>}
        {orders.map((order) => (
          <article className="mp-order" key={order.id}>
            <h3>Order {order.id.slice(0, 8).toUpperCase()}</h3>
            <ul>{order.lines.map((line) => <li key={line.id}>{line.quantity} × {line.name}</li>)}</ul>
            <p>{money.format(order.subtotal)}</p>
            <p>Delivery status: {deliveryStages[order.sellerStage]}</p>
            {order.sellerStage < deliveryStages.length - 1 && <button type="button" onClick={() => {
              void submit(`/orders/${order.id}/delivery`, "PATCH", { stage: order.sellerStage + 1 }, "Delivery status updated.");
            }}>Mark {deliveryStages[order.sellerStage + 1].toLowerCase()}</button>}
          </article>
        ))}
      </section>
    </div>
  );
}
