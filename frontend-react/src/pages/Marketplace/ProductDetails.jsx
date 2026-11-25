import { useState } from "react";
import { ArrowLeft, BadgeCheck, Heart, Minus, Plus, Share2, ShoppingCart, Star, Store, Truck } from "lucide-react";
import { rupeesToPaise } from "../../wallet/walletData";
import WalletEstimate from "./WalletEstimate";
import ProductGallery from "./ProductGallery";
import ProductReviews from "./ProductReviews";
import { discountPercent } from "./productDiscovery";
import { detailsRoute, productImages, productOffer, storeRating, validQuantity, variantAttributes } from "./productDetailUtils";
import "./ProductDetails.css";

function Delivery({ product, money }) {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState(null);
  const shipping = product.delivery ?? {};
  function check(event) {
    event.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setResult({ error: "Enter a valid six-digit PIN code." });
      return;
    }
    const date = new Date();
    date.setDate(date.getDate() + (shipping.days ?? 5));
    setResult({ pin, date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" }) });
  }

  return <section className="mp-detail-panel">
    <h2><Truck size={18} aria-hidden="true" /> Delivery</h2>
    <p className="mp-detail-muted">Demo estimates only. Delivery availability is unverified.</p>
    <form className="mp-delivery-form" onSubmit={check}>
      <label>Delivery PIN code<input autoComplete="postal-code" inputMode="numeric" maxLength={6} value={pin}
        onChange={(event) => { setPin(event.target.value); setResult(null); }} placeholder="6-digit PIN" /></label>
      <button type="submit" className="mp-detail-button">Check availability</button>
    </form>
    {result?.error && <p role="alert">{result.error}</p>}
    {result?.date && <p role="status">{shipping.days === 0 ? "Demo estimate for " + result.pin + " · Today"
      : "Demo estimate for " + result.pin + " · " + result.date}</p>}
    <p>{shipping.fee !== undefined ? "Demo delivery fee · " + money.format(shipping.fee) : "Delivery charges pending confirmation"}</p>
    {shipping.pickup && <p>Demo in-store pickup available</p>}
    <p>{product.returnPolicy || "Return and replacement terms have yet to be provided."}</p>
  </section>;
}

function Specifications({ product }) {
  return <section className="mp-detail-panel mp-specifications">
    <h2>About this product</h2>
    <details open>
      <summary>Description</summary>
      <p>{product.description || "No product description provided."}</p>
      {typeof product.variants === "string" && product.variants && <p>Seller options · {product.variants}</p>}
    </details>
    {product.features?.length > 0 && <details><summary>Key features</summary><ul>{product.features.map((feature, index) => <li key={index}>{feature}</li>)}</ul></details>}
    {product.specifications?.length > 0 && <details><summary>Specifications</summary>
      <dl>{product.specifications.map(({ name, value }) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
    </details>}
    {[
      ["Package contents", product.packageContents],
      ["Warranty", product.warranty],
      ["Returns and replacements", product.returnPolicy],
      ["Additional details", product.additionalDetails],
    ].filter(([, value]) => value).map(([label, value]) => <details key={label}><summary>{label}</summary><p>{value}</p></details>)}
  </section>;
}



function SellerCard({ store, products, following, onStore, onFollow }) {
  const [error, setError] = useState("");
  const rating = storeRating(products);
  return <section className="mp-detail-panel mp-detail-seller" aria-label="Seller information">
    <div className="mp-detail-seller-avatar">
      <Store size={22} aria-hidden="true" />
      {store.logo && <img src={store.logo} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />}
    </div>
    <div>
      <h2>{store.name} {store.status === "approved" && <BadgeCheck size={17} aria-label="Verified seller" />}</h2>
      <p>{rating} {rating !== "Unrated" && "/ 5"} · {products.length} {products.length === 1 ? "product" : "products"}</p>
    </div>
    <button type="button" className="mp-detail-button" onClick={onStore}>Visit Store</button>
    <button type="button" className="mp-detail-button" aria-pressed={following} onClick={() => {
      try { onFollow(); setError(""); } catch (failure) { setError(failure.message); }
    }}>{following ? "Following" : "Follow Store"}</button>
    {error && <p role="alert">{error}</p>}
  </section>;
}

export default function ProductDetails({
  product, initialVariant, initialQuantity = 1, money, balance, signedIn, onEarn, saved, cartCount, cart,
  store, storeProducts, following, onFollow, onStore, onBack, onCart, onSave, onAdd, onBuy, busy,
  recommendations, renderProduct,
}) {
  const options = product.variantOptions ?? [];
  const attributes = variantAttributes(options);
  const [selection, setSelection] = useState(() => options.find((option) => option.id === initialVariant)?.attributes ?? {});
  const [quantity, setQuantity] = useState(initialQuantity);
  const [shareStatus, setShareStatus] = useState("");
  const [copyLink, setCopyLink] = useState("");
  const variant = options.find((option) => attributes.every((name) => option.attributes[name] === selection[name]));
  const offer = productOffer(product, variant?.id);
  const count = Math.min(Math.max(quantity, 1), Math.max(offer.quantityLimit, 1));
  const subtotal = offer.needsVariant ? null : offer.price * count;
  const discount = discountPercent(offer);
  const canBuy = !busy && validQuantity(count, offer);
  const canAdd = !busy && validQuantity(count, offer, cart[offer.key] ?? 0);
  const hasAvailableOption = options.some((option) => productOffer(product, option.id).stock > 0);
  const images = productImages(product, variant);

  function choose(name, value, index) {
    setSelection({ ...Object.fromEntries(attributes.slice(0, index).map((key) => [key, selection[key]])), [name]: value });
    setQuantity(1);
  }

  async function share() {
    const url = new URL("/marketplace", window.location.href);
    url.hash = detailsRoute(product.id);
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url: url.href }); return; }
      catch (error) { if (error.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(url.href);
      setShareStatus("Product link copied.");
    } catch {
      setCopyLink(url.href);
    }
  }

  return <article className="mp-product-detail">
    <header className="mp-detail-header">
      <button type="button" className="mp-detail-button mp-detail-icon" onClick={onBack} aria-label="Back to products"><ArrowLeft size={20} /></button>
      <h1 tabIndex={-1} data-product-heading>Product Details</h1>
      <button type="button" className="mp-detail-button mp-detail-icon" onClick={share} aria-label="Share product"><Share2 size={18} /></button>
      <button type="button" className="mp-detail-button" onClick={onCart} aria-label={"Shopping cart, " + cartCount + " items"}>
        <ShoppingCart size={18} aria-hidden="true" /> <span>{cartCount}</span>
      </button>
    </header>
    {shareStatus && <p className="mp-detail-muted" role="status">{shareStatus}</p>}
    {copyLink && <label className="mp-copy-product">Copy product link<input value={copyLink} readOnly onFocus={(event) => event.target.select()} /></label>}
    <div className="mp-detail-overview">
      <ProductGallery key={variant?.images?.length ? variant.id : "main-gallery"} images={images} name={product.name} />
      <section className="mp-detail-panel mp-detail-info">
        <div className="mp-detail-name">
          <div><p className="mp-detail-muted">{[product.brand, product.category, product.demo && "Demo listing"].filter(Boolean).join(" · ")}</p><h2>{product.name}</h2></div>
          <button type="button" className="mp-detail-button mp-detail-icon" aria-label="Save to wishlist" aria-pressed={saved} onClick={onSave}>
            <Heart size={21} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        </div>
        <div className="mp-detail-rating">
          <span><Star size={16} aria-hidden="true" /> {Number.isFinite(product.rating) ? product.rating.toFixed(1) + " / 5" : "Unrated"}</span>
          <span>{product.reviews?.length ?? 0} reviews</span>
          {product.sold !== undefined && <span>{product.sold} sold</span>}
        </div>
        <div className="mp-detail-price"><strong>{money.format(offer.price)}</strong>
          {discount > 0 && <><del>{money.format(offer.original)}</del><span>{discount}% off</span></>}
        </div>
        <p aria-live="polite">{product.sample ? "Catalog preview" : offer.needsVariant
          ? hasAvailableOption ? "Select options to check stock." : "Out of stock"
          : offer.stock > 0 ? offer.stock + " in stock" : "Out of stock"}</p>
        {attributes.length > 0 && <fieldset className="mp-detail-variants">
          <legend>Choose options</legend>
          {attributes.map((name, index) => <label key={name}>{name}
            <select value={selection[name] ?? ""} disabled={attributes.slice(0, index).some((key) => !selection[key])}
              onChange={(event) => choose(name, event.target.value, index)}>
              <option value="">Select {name.toLowerCase()}</option>
              {[...new Set(options.map((option) => option.attributes[name]))].map((value) => <option key={value} value={value}
                disabled={!options.some((option) => option.attributes[name] === value && productOffer(product, option.id).stock > 0 &&
                  attributes.slice(0, index).every((key) => !selection[key] || option.attributes[key] === selection[key]))}>{value}</option>)}
            </select>
          </label>)}
        </fieldset>}
        <div className="mp-detail-quantity">
          <div><span>Quantity</span>
            <div>
              <button type="button" className="mp-detail-button mp-detail-icon" aria-label="Decrease quantity" disabled={count <= 1} onClick={() => setQuantity(count - 1)}><Minus size={16} /></button>
              <output aria-label="Quantity">{count}</output>
              <button type="button" className="mp-detail-button mp-detail-icon" aria-label="Increase quantity" disabled={count >= offer.quantityLimit} onClick={() => setQuantity(count + 1)}><Plus size={16} /></button>
            </div>
          </div>
          {subtotal !== null && <div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>}
        </div>
        {canBuy && !canAdd && <p className="mp-detail-muted">Your cart already contains some of this stock. Try a smaller quantity.</p>}
        <div className="mp-detail-purchase">
          <button type="button" className="mp-detail-button" disabled={!canAdd} onClick={() => onAdd(offer, count)}>Add to Cart</button>
          <button type="button" className="mp-detail-button mp-detail-primary" disabled={!canBuy} onClick={() => onBuy(offer, count)}>Buy Now</button>
        </div>
      </section>
    </div>
    <div className="mp-detail-service">
      <WalletEstimate balance={balance} subtotal={rupeesToPaise(subtotal)} subtotalLabel="Product subtotal" signedIn={signedIn} onEarn={onEarn} />
      <Delivery product={product} money={money} />
    </div>
    {store && <SellerCard store={store} products={storeProducts} following={following} onStore={onStore} onFollow={onFollow} />}
    <Specifications product={product} />
    <ProductReviews product={product} />
    {recommendations.map(({ label, items }) => <section className="mp-section" key={label}>
      <h2>{label}</h2>
      {items.length ? <div className="mp-grid">{items.map((item) => renderProduct(item))}</div> : <p>No products to display yet.</p>}
    </section>)}
  </article>;
}
