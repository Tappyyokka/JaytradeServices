import { useState } from "react";
import { BadgeCheck, ChevronRight, MapPin, ShoppingBag, Star, Store, UsersRound } from "lucide-react";
import { categories } from "./marketplaceData";
import { ShareShopping } from "./SocialShopping";
import { readStoreImage } from "./storeImages";
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

export function StoreEditor({ store, onSave, onDone }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const changes = {};
      for (const key of ["name", "username", "description", "category", "address", "pin", "email", "mobile", "owner", "opensAt", "closesAt", "policies"]) changes[key] = fields.get(key).trim();
      changes.email = changes.email.toLowerCase();
      changes.username = changes.username.toLowerCase();
      if (!changes.name) throw new Error("Enter a store name.");
      if (Boolean(changes.opensAt) !== Boolean(changes.closesAt)) throw new Error("Enter both opening and closing times.");
      changes.deliveryAvailable = fields.has("deliveryAvailable");
      changes.pickupAvailable = fields.has("pickupAvailable");
      for (const key of ["logo", "cover"]) {
        const file = fields.get(key);
        if (file.size) changes[key] = await readStoreImage(file);
        else if (fields.has("remove-" + key)) changes[key] = "";
      }
      await onSave(changes);
      onDone();
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  }
  return <form className="store-edit" onSubmit={submit}>
    <h2>Edit store</h2>
    <label>Store name<input name="name" defaultValue={store.name} required maxLength={80} /></label>
    <label>Store username<input name="username" defaultValue={store.username} required minLength={3} maxLength={30} /></label>
    <label>Public owner name<input name="owner" defaultValue={store.owner} maxLength={100} /></label>
    <label>Business category<select name="category" defaultValue={store.category}>{[...categories.slice(1), "Other"].map((c) => <option key={c}>{c}</option>)}</select></label>
    <label>Description<textarea name="description" defaultValue={store.description} maxLength={1000} /></label>
    <label>Business address<textarea name="address" defaultValue={store.address} maxLength={500} /></label>
    <label>PIN code<input name="pin" defaultValue={store.pin} pattern="[1-9][0-9]{5}" maxLength={6} /></label>
    <label>Business email<input name="email" type="email" defaultValue={store.email} maxLength={254} /></label>
    <label>Business mobile<input name="mobile" type="tel" defaultValue={store.mobile} maxLength={25} /></label>
    <div className="mp-editor-field-grid">
      <label>Opens at (IST)<input name="opensAt" type="time" defaultValue={store.opensAt} /></label>
      <label>Closes at (IST)<input name="closesAt" type="time" defaultValue={store.closesAt} /></label>
    </div>
    <label>Store policies<textarea name="policies" defaultValue={store.policies} maxLength={1000} /></label>
    <label className="store-inline"><input type="checkbox" name="deliveryAvailable" defaultChecked={store.deliveryAvailable ?? true} /> Advertise delivery</label>
    <label className="store-inline"><input type="checkbox" name="pickupAvailable" defaultChecked={store.pickupAvailable} /> Advertise pickup</label>
    <label>Profile image<input type="file" name="logo" accept="image/jpeg,image/png,image/webp" /></label>
    <label>Cover banner<input type="file" name="cover" accept="image/jpeg,image/png,image/webp" /></label>
    {store.logo && <label className="store-inline"><input type="checkbox" name="remove-logo" /> Remove logo</label>}
    {store.cover && <label className="store-inline"><input type="checkbox" name="remove-cover" /> Remove cover</label>}
    <small>Contact details appear on your public profile. Images can be up to 400 KB each.</small>
    {error && <p role="alert">{error}</p>}
    <div><button disabled={saving} type="submit">Save store</button> <button disabled={saving} type="button" onClick={onDone}>Cancel</button></div>
  </form>;
}

export function StoreProfile({ store, products, following, followers, followBusy, onFollow, productListing, onSeeProducts }) {
  const username = store.username ? "@" + store.username : "";
  return <section className="store-profile">
    <div className="store-cover">{store.cover && <img src={store.cover} alt="" />}</div>
    <div className="store-profile-body">
      <Avatar store={store} />
      <div className="store-heading">
        <div><h1>{store.name} {store.status === "approved" && <BadgeCheck size={20} aria-label="Verified seller" />}</h1>
          <small>{[username, store.category].filter(Boolean).join(" · ")}</small></div>
        <div className="store-actions"><button className="store-primary" aria-pressed={following} disabled={followBusy || !onFollow}
          onClick={onFollow}>{following ? "Unfollow store" : "Follow store"}</button>
          <ShareShopping title={store.name} route={"store/" + encodeURIComponent(store.id)} /></div>
      </div>
      {store.description && <p>{store.description}</p>}
      {store.address && <p><MapPin size={15} /> {store.address} {store.pin}</p>}
      {(store.email || store.mobile) && <p className="store-contacts">
        {store.email && <a href={"mailto:" + store.email}>{store.email}</a>}
        {" "}{store.mobile && <a href={"tel:" + store.mobile}>{store.mobile}</a>}
      </p>}
      {store.opensAt && store.closesAt && <p>Hours: {store.opensAt}–{store.closesAt} IST</p>}
      {(store.deliveryAvailable !== undefined || store.pickupAvailable !== undefined) && <p>
        {store.deliveryAvailable ? "Delivery advertised" : "Delivery by arrangement"} · {store.pickupAvailable ? "Pickup advertised" : "Pickup unavailable"}. Confirm with the store.
      </p>}
      {store.policies && <details><summary>Store policies</summary><p>{store.policies}</p></details>}
      <div className="store-stats"><span><ShoppingBag /> {products.length} products</span><span><UsersRound /> {followers} followers{store.id.startsWith("live-") ? "" : " on this browser"}</span><span><Star /> {storeRating(products)}</span></div>
      {productListing}
      <button type="button" onClick={onSeeProducts}>View all store products <ChevronRight size={16} aria-hidden="true" /></button>
    </div>
  </section>;
}
