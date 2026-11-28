import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import { SUPERSTORE_PATH } from "../../auth/accountRoutes";
import { detailsRoute } from "./productDetailUtils";
import "./SocialShopping.css";

export function ShareShopping({ title, route }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const url = new URL(SUPERSTORE_PATH, window.location.href);
  url.hash = route;
  return <div className="mp-social-share">
    <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <Share2 size={16} aria-hidden="true" /> Share
    </button>
    {open && <div className="mp-social-share-actions">
      <a href={"https://wa.me/?text=" + encodeURIComponent(title + " " + url.href)} target="_blank" rel="noreferrer">WhatsApp</a>
      {typeof navigator.share === "function" && <button type="button" onClick={async () => {
        try { await navigator.share({ title, url: url.href }); }
        catch (error) { if (error.name !== "AbortError") setStatus("Choose a sharing option below."); }
      }}>Share via device</button>}
      <button type="button" onClick={async () => {
        try { await navigator.clipboard.writeText(url.href); setStatus("Link copied."); }
        catch { setStatus("Select and copy the link below."); }
      }}>Copy Link</button>
      {status && <p role="status">{status}</p>}
      <input aria-label="Shareable link" readOnly value={url.href} onFocus={(event) => event.target.select()} />
    </div>}
  </div>;
}

export function FollowingFeed({ stores, feed, products, follows, liked, saved, onLike, onSave, onStore, onProduct, busy, money,
  signedIn, onLogin, onRefresh }) {
  const followed = stores.filter((store) => follows.has(store.id));
  const listings = new Map(products.map((product) => [product.id, product]));
  const demoFeed = products.filter((product) => product.demo && follows.has(product.storeId))
    .slice(0, 12).map((product) => ({ id: product.id, productId: product.id, kind: "demo" }));
  const rows = [...feed, ...demoFeed].filter((entry) => listings.has(entry.productId));
  const kinds = { new: "New product", offer: "Store offer", announcement: "Product announcement", demo: "Demo store product" };
  return <section className="mp-panel mp-social">
    <h1>Following</h1>
    {!signedIn && <p><button type="button" onClick={onLogin}>Sign in</button> to follow live stores and sync your wishlist.</p>}
    <h2>Following Stores</h2>
    {followed.length ? <ul className="mp-social-store-list">{followed.map((store) => <li key={store.id}>
      <button type="button" onClick={() => onStore(store.id)}>{store.name}</button></li>)}</ul> : <p>Follow a store to see its updates here.</p>}
    <h2>Store updates</h2>
    {signedIn && <button type="button" disabled={busy} onClick={onRefresh}>Refresh updates</button>}
    {rows.length === 0 && <p>No updates from followed stores yet.</p>}
    {rows.map((entry) => {
      const product = listings.get(entry.productId);
      return <article key={entry.id} className="mp-social-feed-card">
        {product.image && <img src={product.image} width={92} height={92} alt="" loading="lazy" />}
        <div><small>{kinds[entry.kind]}{entry.demo && " · Browser demo"}{entry.date && " · " + new Date(entry.date).toLocaleDateString("en-IN")}</small>
          <h3><button type="button" onClick={() => onProduct(product)}>{product.name}</button></h3>
          <button type="button" onClick={() => onStore(product.storeId)}>{product.seller}</button>
          <strong>{money.format(product.price)}</strong>
          {entry.text && <p>{entry.text}</p>}
          <div className="mp-social-actions">
            <button type="button" aria-pressed={liked.has(product.id)} disabled={busy} onClick={() => onLike(product.id)}>
              <Heart size={16} fill={liked.has(product.id) ? "currentColor" : "none"} aria-hidden="true" /> Like
            </button>
            <button type="button" aria-pressed={saved.has(product.id)} disabled={busy} onClick={() => onSave(product.id)}>
              {saved.has(product.id) ? "Saved" : "Save"}
            </button>
            <ShareShopping title={product.name} route={detailsRoute(product.id)} />
          </div>
        </div>
      </article>;
    })}
  </section>;
}

export function StoreAnnouncementEditor({ listings, publish, demo }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const products = listings.filter((product) => product.active !== false);
  return <section className="mp-panel mp-social">
    <h2>Publish a store update</h2>
    {demo && <p>Demo updates appear for followers using this browser.</p>}
    {products.length ? <form onSubmit={async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const fields = Object.fromEntries(new FormData(form));
      setBusy(true);
      setMessage("");
      try { await publish(fields); form.reset(); setMessage("Published to your followers."); }
      catch (failure) { setMessage(failure.message); }
      finally { setBusy(false); }
    }}>
      <label>Product <select name="productId" required><option value="">Choose a product</option>{products.map((product) =>
        <option value={product.id} key={product.id}>{product.name}</option>)}</select></label>
      <label>Update type <select name="kind"><option value="announcement">Announcement</option><option value="offer">Offer or promotion</option></select></label>
      <label>Message <textarea name="text" required minLength={5} maxLength={500} /></label>
      <button type="submit" disabled={busy}>Publish update</button>
    </form> : <p>Publish an active product before posting a store update.</p>}
    {message && <p role="status">{message}</p>}
  </section>;
}
