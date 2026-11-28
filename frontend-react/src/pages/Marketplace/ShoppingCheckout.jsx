import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Package, ShoppingCart } from "lucide-react";
import SlideToPay from "../../components/common/SlideToPay";
import marketplaceRequest from "../../config/marketplaceApi";
import { formatPaise, rupeesToPaise } from "../../wallet/walletData";
import { productImages, validQuantity } from "./productDetailUtils";
import "./ShoppingCheckout.css";

const money = (amount) => formatPaise(rupeesToPaise(amount));
const deliveryDate = (value) => new Date(value + "T00:00:00+05:30").toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
const fields = [
  ["fullName", "Full name", "name", 100], ["mobile", "Mobile number", "tel", 20],
  ["building", "House or building name", "address-line1", 120], ["locality", "Street or locality", "address-line2", 120],
  ["landmark", "Landmark (optional)", "off", 120], ["city", "City", "address-level2", 80],
  ["district", "District", "off", 80], ["state", "State", "address-level1", 80], ["pin", "PIN code", "postal-code", 6],
];

function groupCart(lines) {
  const groups = new Map();
  for (const line of lines) {
    const storeId = line.sellerId ?? line.storeId ?? "";
    if (!groups.has(storeId)) groups.set(storeId, { id: storeId, name: line.seller ?? "Unavailable store", lines: [] });
    groups.get(storeId).lines.push(line);
  }
  return [...groups.values()];
}

function Image({ item }) {
  const variant = item.variantOptions?.find(({ id }) => id === item.variantId);
  const [image] = productImages(item, variant);
  return <span className="mp-checkout-image">{image ? <img src={image} alt="" loading="lazy" width={64} height={64} /> : <Package aria-hidden="true" />}</span>;
}

function Selection({ lines, excluded, onSelect, label }) {
  const ref = useRef(null);
  const count = lines.filter((line) => !excluded[line.key]).length;
  useEffect(() => { ref.current.indeterminate = count > 0 && count < lines.length; }, [count, lines.length]);
  return <label className="mp-checkout-check">
    <input type="checkbox" ref={ref} checked={count === lines.length} onChange={(event) => onSelect(lines, event.target.checked)} /> {label}
  </label>;
}

export function ShoppingCartPage({ lines, selected, excluded, loading, onSelect, onQuantity, onRemove, onProduct, onCheckout, onBrowse }) {
  const subtotal = selected.reduce((sum, line) => sum + (line.missing ? 0 : line.price * line.quantity), 0);
  const blocked = selected.some((line) => line.demo || line.missing || !validQuantity(line.quantity, line));
  return <section className="mp-panel mp-checkout-page">
    <h1>Your cart</h1>
    {lines.length === 0 ? <div className="mp-checkout-empty">
      <ShoppingCart aria-hidden="true" /><p>Your cart is empty.</p><button type="button" onClick={onBrowse}>Browse products</button>
    </div> : <>
      {loading && <p role="status">Checking prices and availability…</p>}
      <Selection lines={lines} excluded={excluded} onSelect={onSelect} label="Select all products" />
      {groupCart(lines).map((group) => <fieldset className="mp-checkout-store" key={group.id}>
        <legend>{group.name}</legend>
        <Selection lines={group.lines} excluded={excluded} onSelect={onSelect} label={`Select all from ${group.name}`} />
        {group.lines.map((line) => <article className="mp-checkout-item" key={line.key}>
          <label className="mp-checkout-check"><input type="checkbox" checked={!excluded[line.key]}
            aria-label={`Select ${line.name} ${line.variantName ?? ""}`} onChange={(event) => onSelect([line], event.target.checked)} /></label>
          <Image item={line} />
          <div>
            <strong>{line.name}{line.demo && " · Demo catalogue"}</strong>
            {line.variantName && <p>{line.variantName}</p>}
            {line.missing ? <p>{loading ? "Checking availability…" : "This listing is no longer available."}</p> : <>
              <p>{money(line.price)}{line.original > line.price && <> <del>{money(line.original)}</del></>}</p>
              {line.priceChanged && <p>Price updated since this item was added.</p>}
              <p>{line.stock ? `${line.stock} in stock` : "Unavailable"}</p>
            </>}
            {line.needsVariant && <button type="button" onClick={() => onProduct(line)}>Choose a variant</button>}
            <div className="mp-checkout-actions">
              <button type="button" disabled={line.quantity <= 1 || line.missing} aria-label={`Decrease quantity of ${line.name}`}
                onClick={() => onQuantity(line, -1)}>−</button>
              <span>{line.quantity}</span>
              <button type="button" disabled={!validQuantity(line.quantity + 1, line)} aria-label={`Increase quantity of ${line.name}`}
                onClick={() => onQuantity(line, 1)}>+</button>
              <button type="button" onClick={() => onRemove(line, false)}>Remove</button>
              <button type="button" disabled={line.missing} onClick={() => onRemove(line, true)}>Move to Wishlist</button>
            </div>
          </div>
        </article>)}
      </fieldset>)}
      <div className="mp-checkout-summary">
        <span>{selected.length} selected · Subtotal <strong>{money(subtotal)}</strong></span>
        {blocked && !loading && <p role="status">Deselect unavailable or sample catalogue products to proceed. Demo checkout uses test listings from the server.</p>}
        <button type="button" disabled={!selected.length || blocked || loading} onClick={onCheckout}>Proceed to Checkout</button>
      </div>
    </>}
  </section>;
}

function AddressBook({ addresses, selected, customer, onSelect, onChange }) {
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  async function update(address, method, body) {
    setError("");
    setBusy(true);
    try {
      const result = await marketplaceRequest("/addresses/" + encodeURIComponent(address), method, body);
      setCreated(method === "PUT" ? result.id : null);
      await onChange(method === "PUT" ? result.id : null);
      setEditing(null);
      setRemoving(null);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <section className="mp-checkout-store" aria-label="Delivery address">
    <h2>Delivery address</h2>
    {error && <p role="alert">{error}</p>}
    {created && <p role="status">Address saved.</p>}
    {addresses.map((address) => <article key={address.id} className="mp-checkout-address">
      <label className="mp-checkout-check"><input type="radio" name="checkout-address" checked={selected === address.id}
        onChange={() => onSelect(address.id)} /> <strong>{address.details.fullName} · {address.details.type}</strong></label>
      <p>{address.details.building}, {address.details.locality}, {address.details.city} {address.details.pin}{address.isDefault && " · Default"}</p>
      <div className="mp-checkout-actions">
        <button type="button" disabled={busy} onClick={() => setEditing(address)}>Edit</button>
        {!address.isDefault && <button type="button" disabled={busy} onClick={() => update(address.id, "PUT", { details: address.details, isDefault: true })}>Make default</button>}
        {removing === address.id ? <>
          <button type="button" disabled={busy} onClick={() => update(address.id, "DELETE")}>Confirm delete</button>
          <button type="button" onClick={() => setRemoving(null)}>Keep address</button>
        </> : <button type="button" disabled={busy} onClick={() => setRemoving(address.id)}>Delete</button>}
      </div>
    </article>)}
    <button type="button" disabled={busy} onClick={() => setEditing({ id: "new", details: { fullName: customer.name, mobile: customer.phone, type: "Home" } })}>Add address</button>
    {editing && <form key={editing.id} className="mp-checkout-address-form" onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const details = Object.fromEntries([...fields.map(([name]) => name), "type"].map((name) => [name, data.get(name)]));
      void update(editing.id, "PUT", { details, isDefault: data.has("default") });
    }}>
      {fields.map(([name, label, autocomplete, length]) => <label key={name}>{label}<input name={name} autoComplete={autocomplete}
        required={name !== "landmark"} defaultValue={editing.details[name] ?? ""} maxLength={length}
        inputMode={name === "pin" ? "numeric" : name === "mobile" ? "tel" : undefined} pattern={name === "pin" ? "[1-9][0-9]{5}" : undefined} /></label>)}
      <label>Address type<select name="type" defaultValue={editing.details.type}>
        {["Home", "Work", "Other"].map((type) => <option key={type}>{type}</option>)}
      </select></label>
      <label className="mp-checkout-check"><input type="checkbox" name="default" defaultChecked={editing.isDefault || !addresses.length} /> Default address</label>
      <div className="mp-checkout-actions">
        <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save address"}</button>
        <button type="button" onClick={() => setEditing(null)}>Cancel</button>
      </div>
    </form>}
  </section>;
}

function readDraft(key) {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? {}; } catch { return {}; }
}

export function ShoppingCheckout({ lines, customer, draftKey, availablePaise, onBack, onLogin, onAddMoney, onComplete, onPurchased, refresh }) {
  const [draft, setDraft] = useState(() => readDraft(draftKey));
  const [config, setConfig] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const paymentPending = useRef(false);
  const groups = groupCart(lines);
  const addressId = addresses.some((address) => address.id === draft.addressId) ? draft.addressId : addresses[0]?.id;
  const validCart = lines.length > 0 && lines.every((line) => !line.demo && !line.missing && validQuantity(line.quantity, line));
  const payload = JSON.stringify({
    addressId, delivery: draft.delivery ?? {}, notes: draft.notes ?? "",
    items: lines.map(({ id, variantId, quantity }) => ({ id, variantId, quantity })),
  });
  const quote = snapshot?.key === payload ? snapshot.quote : null;
  const quoteError = snapshot?.key === payload ? snapshot.error : null;

  useEffect(() => {
    if (!customer?.id) return;
    let active = true;
    marketplaceRequest("/checkout/config").then(async (result) => {
      if (!active) return;
      setConfig(result);
      if (result.enabled) {
        const list = await marketplaceRequest("/addresses");
        if (active) setAddresses(list);
      }
    }).catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [customer?.id]);

  useEffect(() => {
    if (!config?.enabled || !addressId || !validCart) return;
    let active = true;
    const timer = window.setTimeout(() => marketplaceRequest("/checkout/quote", "POST", JSON.parse(payload))
      .then((result) => { if (active) setSnapshot({ key: payload, quote: result }); })
      .catch((failure) => { if (active) setSnapshot({ key: payload, error: failure.message }); }), 180);
    return () => { active = false; window.clearTimeout(timer); };
  }, [addressId, payload, config, validCart, revision]);

  useEffect(() => {
    if (!receipt) return;
    const timer = window.setTimeout(() => onComplete(receipt.id), 2000);
    return () => window.clearTimeout(timer);
  }, [receipt, onComplete]);

  function saveDraft(fields) {
    const next = { ...draft, ...fields };
    setDraft(next);
    try { sessionStorage.setItem(draftKey, JSON.stringify(next)); } catch { /* Continue for this visit. */ }
  }

  function acceptReceipt(purchase) {
    if (!purchase.id || !Array.isArray(purchase.orderIds) || !purchase.orderIds.length || !Array.isArray(purchase.purchased)) {
      throw new Error("Payment confirmation was unavailable. Check payment status before trying again.");
    }
    try { sessionStorage.removeItem(draftKey); } catch { /* The server still prevents duplicate deductions. */ }
    setReceipt(purchase);
    onPurchased(purchase);
  }

  async function checkPayment() {
    if (!draft.id || paymentPending.current) return;
    paymentPending.current = true;
    setBusy(true);
    setError("");
    try { acceptReceipt(await marketplaceRequest("/checkout/" + encodeURIComponent(draft.id))); }
    catch (failure) { setError(failure.message); }
    finally { paymentPending.current = false; setBusy(false); }
  }

  async function confirmPayment() {
    if (!confirmation || paymentPending.current) return;
    paymentPending.current = true;
    setBusy(true);
    setError("");
    const id = draft.id ?? crypto.randomUUID();
    saveDraft({ id });
    try {
      const purchase = await marketplaceRequest("/checkout", "POST", {
        ...JSON.parse(confirmation.payload), id, fingerprint: confirmation.quote.fingerprint,
      });
      acceptReceipt(purchase);
    } catch (failure) {
      setError(failure.message);
      setConfirmation(null);
      setSnapshot(null);
      setRevision((value) => value + 1);
      void refresh();
    } finally {
      paymentPending.current = false;
      setBusy(false);
    }
  }

  if (receipt) return <section role="status" className="mp-checkout-success">
    <CheckCircle2 size={72} aria-hidden="true" /><h1>Payment Successful</h1><p>Order Placed Successfully</p>
    <p>Demo checkout {receipt.id}</p><button type="button" onClick={() => onComplete(receipt.id)}>View Order</button>
  </section>;

  if (confirmation) {
    const { quote: confirmed } = confirmation;
    return <section className="mp-panel mp-checkout-page">
      <button type="button" disabled={busy} onClick={() => setConfirmation(null)}>Back to checkout</button>
      <h1>Confirm Customer Money payment</h1><p>Demo checkout</p>
      <p>Available balance {money(confirmed.balance)}</p>
      <ul>{confirmed.stores.map((store) => <li key={store.sellerId}>{store.store} · {store.lines.reduce((sum, item) => sum + item.quantity, 0)} items · {money(store.total)}</li>)}</ul>
      <p>Total payable <strong>{money(confirmed.total)}</strong></p>
      <p>Estimated remaining balance {money(confirmed.balance - confirmed.total)}</p>
      <SlideToPay disabled={busy} onPay={confirmPayment} />
      {busy && <p role="status">Processing demo payment…</p>}
    </section>;
  }

  const subtotal = quote?.subtotal ?? lines.reduce((sum, line) => sum + (line.missing ? 0 : line.price * line.quantity), 0);
  const delivery = quote?.deliveryTotal ?? groups.reduce((sum, group) => sum + (config?.methods[draft.delivery?.[group.id] ?? "standard"]?.charge ?? 0), 0);
  const total = quote?.total ?? (subtotal + delivery);
  const balance = quote ? quote.balance : availablePaise == null ? null : availablePaise / 100;
  const required = balance == null ? null : Math.max(0, total - balance);
  return <section className="mp-panel mp-checkout-page">
    <button type="button" onClick={onBack}><ArrowLeft size={17} aria-hidden="true" /> Back</button>
    <h1>Indipay Super Store checkout</h1>
    <p>Demo checkout. Delivery methods, fees and dates are simulated.</p>
    {!customer && <p><button type="button" onClick={onLogin}>Sign in to check out</button></p>}
    {customer && !config && !error && <p role="status">Checking checkout availability…</p>}
    {config && !config.enabled && <p role="status">Checkout is available only in the enabled test environment.</p>}
    {!validCart && <p role="status">Select available server listings to check out. Sample catalogue items are browsing previews.</p>}
    {error && <p role="alert">{error}</p>}
    {quoteError && <p role="alert">{quoteError}</p>}
    {config?.enabled && <AddressBook addresses={addresses} selected={addressId} customer={customer}
      onSelect={(id) => saveDraft({ addressId: id })} onChange={async (id) => {
        setAddresses(await marketplaceRequest("/addresses")); saveDraft({ addressId: id ?? draft.addressId }); setRevision((value) => value + 1);
      }} />}
    {groups.map((group) => <section className="mp-checkout-store" key={group.id}>
      <h2>{group.name}</h2>
      {group.lines.map((line) => {
        const quoted = quote?.stores.find((store) => store.sellerId === group.id)?.lines
          .find((item) => item.id === line.id && item.variantId === line.variantId);
        return <div className="mp-checkout-item compact" key={line.key}>
          <Image item={line} /><div><strong>{line.name}</strong>
            <p>{line.variantName ? line.variantName + " · " : ""}Quantity {line.quantity}</p>
            {!line.missing && <p>{money((quoted?.price ?? line.price) * line.quantity)}</p>}
          </div>
        </div>;
      })}
      {config?.enabled && <label>Demo delivery method <select value={draft.delivery?.[group.id] ?? "standard"}
        onChange={(event) => saveDraft({ delivery: { ...draft.delivery, [group.id]: event.target.value } })}>
        {Object.entries(config.methods).map(([id, method]) => <option value={id} key={id}>{method.label} · {money(method.charge)}</option>)}
      </select></label>}
      {quote?.stores.find((store) => store.sellerId === group.id)?.estimatedDate && <p>
        Demo estimate {deliveryDate(quote.stores.find((store) => store.sellerId === group.id).estimatedDate)}
      </p>}
    </section>)}
    {config?.enabled && <label>Order notes (optional)<textarea maxLength={500} value={draft.notes ?? ""}
      onChange={(event) => saveDraft({ notes: event.target.value })} /></label>}
    <div className="mp-checkout-summary">
      <dl>
        <dt>Products subtotal</dt><dd>{money(subtotal)}</dd>
        <dt>Discount included in price</dt><dd>{money(quote?.discount ?? 0)}</dd>
        <dt>Demo delivery charges</dt><dd>{money(delivery)}</dd>
        <dt>Other charges</dt><dd>{money(0)}</dd>
        <dt>Total payable</dt><dd><strong>{money(total)}</strong></dd>
        <dt>Available Customer Money</dt><dd>{balance == null ? "Unavailable" : money(balance)}</dd>
        <dt>Estimated remaining balance</dt><dd>{required === 0 ? money(balance - total) : "—"}</dd>
      </dl>
      {quote && required > 0 && <p role="status">Insufficient balance. Add {money(required)} to continue.</p>}
      {quote && required === 0 && <p role="status">Eligible Customer Money covers this checkout.</p>}
      {config?.enabled && <>
        {draft.id && <button type="button" disabled={busy} onClick={checkPayment}>Check payment status</button>}
        {quote && required > 0 && <button type="button" disabled={busy} onClick={() => onAddMoney(required * 100)}>Add Money</button>}
        <button type="button" disabled={busy || !quote || required !== 0} onClick={() => {
          setError(""); setConfirmation({ quote, payload });
        }}>Review payment</button>
      </>}
    </div>
  </section>;
}

export function OrderReceipt({ order, status }) {
  const details = order.checkoutDetails;
  if (!details) return null;
  const address = details.address ?? {};
  return <details className="mp-checkout-receipt">
    <summary>Preview demo receipt</summary>
    <dl>
      <dt>Store order</dt><dd>{order.id}</dd><dt>Checkout reference</dt><dd>{details.checkoutId}</dd>
      <dt>Store</dt><dd>{details.store}</dd><dt>Total paid</dt><dd>{money(order.total)}</dd>
      <dt>Wallet transaction</dt><dd>{details.walletTransactionId}</dd><dt>Payment reference</dt><dd>{details.paymentReference}</dd>
      <dt>Payment status</dt><dd>{order.refunded ? "Refunded" : "Paid · Demo"}</dd>
      <dt>Order status</dt><dd>{status}</dd>
      <dt>Delivery address</dt><dd>{[address.fullName, address.mobile, address.building, address.locality,
        address.landmark, address.city, address.district, address.state, address.pin].filter(Boolean).join(", ")}</dd>
      <dt>Demo delivery</dt><dd>{details.deliveryLabel} · {deliveryDate(details.estimatedDate)} · {money(details.deliveryCharge)}</dd>
      {details.notes && <><dt>Order notes</dt><dd>{details.notes}</dd></>}
    </dl>
    <ul>{order.lines.map((line) => <li key={line.id + ":" + line.variantId}>
      {line.name}{line.variantName && ` · ${line.variantName}`} · {line.quantity} × {money(line.price)}
    </li>)}</ul>
  </details>;
}
