import { useState } from "react";
import { BadgeCheck, ChevronRight, ImagePlus, MapPin, ShoppingBag, Star, Store, UsersRound } from "lucide-react";
import { categories } from "./marketplaceData";
import { listingAllowance, subscriptionPlans } from "./subscriptionPlans";
import { editStore, removeProduct, saveProduct, toggleFollow } from "./storeDirectory";
import { readStoreImage } from "./storeImages";
import ProductEditor from "./ProductEditor";
import { storeRating } from "./productDetailUtils";
import { findStores } from "./productDiscovery";
import "./StoreProfiles.css";

function Avatar({ store }) {
  return <span className="store-avatar">{store.logo ? <img src={store.logo} alt="" /> : <Store aria-hidden="true" />}</span>;
}

export function StoreDirectory({ stores, products, discovery, onVisit, onDiscover }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const visible = discovery ? findStores(stores, search).filter((store) => !category || store.category === category) : stores;
  return <section className="store-directory mp-section">
    <header className="store-heading">{discovery ? <h1>Explore stores</h1> : <><h2>Shop by store</h2><button onClick={onDiscover}>View all <ChevronRight size={16} /></button></>}</header>
    {discovery && <div className="store-filters"><label>Search stores<input type="search" placeholder="Store name" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      <label>Business category<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{[...new Set(stores.map((s) => s.category))].sort().map((c) => <option key={c}>{c}</option>)}</select></label></div>}
    <div className="store-card-grid">{visible.map((store) => {
      const count = products.filter((item) => item.storeId === store.id).length;
      return <button key={store.id} className="store-card" onClick={() => onVisit(store.id)}>
        <Avatar store={store} /><strong>{store.name} {store.status === "approved" && <BadgeCheck size={15} aria-label="Verified seller" />}</strong>
        <small>{store.category} · {count} {count === 1 ? "product" : "products"}</small>
      </button>;
    })}</div>
    {!visible.length && <p>No stores match your search.</p>}
  </section>;
}

function StoreEditor({ store, customer, onDone }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const changes = {};
      for (const key of ["name", "username", "description", "category", "address", "pin", "email", "mobile", "owner"]) changes[key] = fields.get(key).trim();
      changes.email = changes.email.toLowerCase();
      changes.username = changes.username.toLowerCase();
      if (!changes.name || !changes.address || !changes.owner) throw new Error("Enter the store name, owner name and business address.");
      for (const key of ["logo", "cover"]) {
        const file = fields.get(key);
        if (file.size) changes[key] = await readStoreImage(file);
      }
      editStore(customer, store.id, changes);
      onDone();
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  }
  return <form className="store-edit" onSubmit={submit}>
    <h2>Edit store</h2>
    <label>Store name<input name="name" defaultValue={store.name} required maxLength={80} /></label>
    <label>Store username<input name="username" defaultValue={store.username} required maxLength={30} /></label>
    <label>Owner name<input name="owner" defaultValue={store.owner} required maxLength={100} /></label>
    <label>Business category<select name="category" defaultValue={store.category}>{[...categories.slice(1), "Other"].map((c) => <option key={c}>{c}</option>)}</select></label>
    <label>Description<textarea name="description" defaultValue={store.description} maxLength={1000} /></label>
    <label>Business address<textarea name="address" defaultValue={store.address} required maxLength={500} /></label>
    <label>PIN code<input name="pin" defaultValue={store.pin} pattern="[1-9][0-9]{5}" maxLength={6} /></label>
    <label>Business email<input name="email" type="email" defaultValue={store.email} required maxLength={254} /></label>
    <label>Business mobile<input name="mobile" type="tel" defaultValue={store.mobile} required pattern="[6-9][0-9]{9}" /></label>
    <label>Profile image<input type="file" name="logo" accept="image/jpeg,image/png,image/webp" /></label>
    <label>Cover banner<input type="file" name="cover" accept="image/jpeg,image/png,image/webp" /></label>
    <small>Use sample business details and images up to 400 KB.</small>
    {error && <p role="alert">{error}</p>}
    <div><button disabled={saving} type="submit">Save store</button> <button disabled={saving} type="button" onClick={onDone}>Cancel</button></div>
  </form>;
}

export function StoreProfile({ store, products, manage, customer, viewer, follows, renderProduct, productListing, onSeeProducts, onPublic, onExitSession, onDelete }) {
  const [tab, setTab] = useState("Products");
  const [editor, setEditor] = useState(null);
  const [remove, setRemove] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [inStock, setInStock] = useState(false);
  const [notice, setNotice] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const plan = manage && subscriptionPlans[store.plan];
  const following = (follows[viewer] || []).includes(store.id);
  const followers = (store.followers || 0) + Object.values(follows).filter((ids) => ids.includes(store.id)).length;
  const rating = storeRating(products);
  const visible = products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()) && (!category || p.category === category) && (!inStock || p.stock > 0));
  async function share() {
    const url = new URL(window.location.href);
    url.pathname = "/marketplace";
    url.hash = "store/" + encodeURIComponent(store.id);
    try { await navigator.clipboard.writeText(url.href); setNotice("Store link copied."); }
    catch { setShareUrl(url.href); }
  }
  function handleRemove(id) {
    try { removeProduct(customer, store.id, id); onDelete(id); setRemove(null); setNotice("Product removed."); }
    catch (error) { setNotice(error.message); }
  }
  return <section className="store-profile">
    <div className="store-cover">{store.cover && <img src={store.cover} alt="" />}</div>
    <div className="store-profile-body">
      <Avatar store={store} />
      <div className="store-heading"><div><h1>{store.name} {store.status === "approved" && <BadgeCheck size={20} aria-label="Verified seller" />}</h1><small>@{store.username} · {store.category}</small></div>
        <div className="store-actions">{manage ? <>
          <button onClick={() => setEditor("profile")}>Edit store</button><button onClick={onPublic}>View public store</button>
        </> : <>
          <button className="store-primary" aria-pressed={following} onClick={() => {
            try { toggleFollow(viewer, store.id); } catch (error) { setNotice(error.message); }
          }}>{following ? "Following" : "Follow store"}</button><button onClick={share}>Share store</button>
        </>}</div></div>
      {shareUrl && <label>Copy store link<input readOnly value={shareUrl} onFocus={(e) => e.target.select()} /></label>}
      {store.description && <p>{store.description}</p>}
      {store.address && <p><MapPin size={15} /> {store.address} {store.pin}</p>}
      {(store.email || store.mobile) && <p className="store-contacts"><a href={"mailto:" + store.email}>{store.email}</a> <a href={"tel:" + store.mobile}>{store.mobile}</a></p>}
      <div className="store-stats"><span><ShoppingBag /> {products.length} products</span><span><UsersRound /> {followers} followers</span><span><Star /> {rating}</span></div>
      {manage && <div className="store-subscription"><div><strong>{plan.name} plan</strong><p>{listingAllowance(plan)} · {products.length} listed · {store.status === "pending" ? "Pending verification" : store.status}</p></div>
        <button className="store-primary" disabled={products.length >= plan.limit || store.status === "rejected"} onClick={() => { setTab("Products"); setEditor({ category: categories[1] }); }}><ImagePlus size={16} /> Add product</button>
        {products.length >= plan.limit && <small>Listing limit reached.</small>}
      </div>}
      {manage && <div className="store-tabs" aria-label="Store sections">{["Products", "Orders", "Insights"].map((name) => <button aria-pressed={tab === name} key={name} onClick={() => { setTab(name); setEditor(null); }}>{name}</button>)}</div>}
      {notice && <p role="status">{notice}</p>}
      {manage && editor && <div className="mp-seller store-editor">{editor === "profile" ? <StoreEditor store={store} customer={customer} onDone={() => setEditor(null)} /> :
        <ProductEditor key={editor.id || "new"} preview listing={editor} onCancel={() => setEditor(null)} onSave={(details) => {
          saveProduct(customer, store.id, editor.id, details); setEditor(null); setNotice("Product saved to the demo marketplace.");
        }} />}</div>}
      {!manage && <>
        {productListing}
        <button type="button" onClick={onSeeProducts}>View all store products <ChevronRight size={16} aria-hidden="true" /></button>
      </>}
      {manage && tab === "Products" && <>
        <h2>Products</h2>
        <div className="store-filters"><label>Search this store<input type="search" placeholder="Product name" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <label>Product category<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{[...new Set(products.map((p) => p.category))].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="store-inline"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock</label></div>
        <div className="mp-grid">{visible.map((p) => <div key={p.id}>{renderProduct(p)}{manage &&
          <div className="store-actions"><button onClick={() => { setEditor({ ...p, stock: p.inventoryStock ?? p.stock }); document.querySelector(".store-subscription")?.scrollIntoView(); }}>Edit</button>
            {remove === p.id ? <><button onClick={() => handleRemove(p.id)}>Confirm removal</button><button onClick={() => setRemove(null)}>Cancel</button></> : <button onClick={() => setRemove(p.id)}>Remove</button>}
          </div>}</div>)}</div>
        {!visible.length && <p>{products.length ? "No products match these filters." : "This store has no listings yet."}</p>}
      </>}
      {manage && tab === "Orders" && <><h2>Store orders</h2><p>No demo orders yet.</p></>}
      {manage && tab === "Insights" && <><h2>Store insights</h2><p>{followers} followers · {products.filter((p) => p.stock > 0).length} listings in stock</p><p>Sales insights will appear when store orders are available.</p></>}
      {manage && onExitSession && <button onClick={onExitSession}>Leave demo seller session</button>}
    </div>
  </section>;
}
