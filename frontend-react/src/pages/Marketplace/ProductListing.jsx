import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowDownUp, SlidersHorizontal, X } from "lucide-react";
import MarketplaceSearch from "./MarketplaceSearch";
import { clearFilters, collectionNames, discoverProducts, filterChips, sortOptions } from "./productDiscovery";
import "./ProductDiscovery.css";

function Options({ values, label }) {
  return <><option value="">{label}</option>{values.map((value) => <option key={value}>{value}</option>)}</>;
}

function FilterDrawer({ params, products, stores, money, balance, signedIn, onLogin, onApply, onClose }) {
  const [draft, setDraft] = useState(params);
  const [error, setError] = useState("");
  const dialog = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => { node.close(); };
  }, []);

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort();
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))].sort();
  const highestPrice = products.reduce((highest, product) => Math.max(highest, product.price), 1);
  const rangeEnd = Math.max(highestPrice, Number(draft.min ?? 0), Number(draft.max ?? 0));
  const count = discoverProducts(products, draft, balance).length;
  const activeCount = filterChips(draft, money, stores).length;
  const set = (key, value) => {
    setError("");
    setDraft((previous) => ({ ...previous, [key]: value || undefined }));
  };

  function apply(event) {
    event.preventDefault();
    if (draft.min !== undefined && draft.max !== undefined && Number(draft.min) > Number(draft.max)) {
      setError("Maximum price must be at least the minimum price.");
      return;
    }
    onApply(draft);
  }

  return (
    <dialog ref={dialog} className="mp-filter-drawer" aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form onSubmit={apply}>
        <header>
          <div><h2 id={titleId}>Filters</h2><small>{activeCount} active · {count} {count === 1 ? "match" : "matches"}</small></div>
          <button className="mp-discovery-icon" type="button" aria-label="Close filters" onClick={onClose}><X size={20} aria-hidden="true" /></button>
        </header>
        <div className="mp-filter-fields">
          <label>Category<select value={draft.category ?? ""} onChange={(event) => set("category", event.target.value)}>
            <Options label="All categories" values={categories} />
          </select></label>
          <fieldset>
            <legend>Price range</legend>
            <div className="mp-price-fields">
              <label>Minimum (₹)<input type="number" min="0" inputMode="numeric" value={draft.min ?? ""} placeholder="0" onChange={(event) => set("min", event.target.value)} /></label>
              <label>Maximum (₹)<input type="number" min="0" inputMode="numeric" value={draft.max ?? ""} placeholder={String(highestPrice)} onChange={(event) => set("max", event.target.value)} /></label>
            </div>
            <label className="mp-range">Adjust minimum<input type="range" min="0" max={rangeEnd} value={draft.min ?? 0}
              onChange={(event) => set("min", String(Math.min(Number(event.target.value), Number(draft.max ?? rangeEnd))))} /></label>
            <label className="mp-range">Adjust maximum<input type="range" min="0" max={rangeEnd} value={draft.max ?? rangeEnd}
              onChange={(event) => set("max", String(Math.max(Number(event.target.value), Number(draft.min ?? 0))))} /></label>
            {draft.budget && <small>Budget limit · Under {money.format(draft.budget)}</small>}
          </fieldset>
          {brands.length > 0 && <label>Brand<select value={draft.brand ?? ""} onChange={(event) => set("brand", event.target.value)}>
            <Options label="All brands" values={brands} />
          </select></label>}
          {!params.scope && <label>Store<select value={draft.store ?? ""} onChange={(event) => set("store", event.target.value)}>
            <option value="">All stores</option>
            {stores.map((store) => <option value={store.id} key={store.id}>{store.name}</option>)}
          </select></label>}
          <label>Customer rating<select value={draft.rating ?? ""} onChange={(event) => set("rating", event.target.value)}>
            <option value="">Any rating</option><option value="3">3 stars and up</option><option value="4">4 stars and up</option><option value="4.5">4.5 stars and up</option>
          </select></label>
          <label>Minimum discount<select value={draft.discount ?? ""} onChange={(event) => set("discount", event.target.value)}>
            <option value="">Any discount</option><option value="10">10% and up</option><option value="25">25% and up</option><option value="40">40% and up</option><option value="50">50% and up</option>
          </select></label>
          <label>Availability<select value={draft.availability ?? ""} onChange={(event) => set("availability", event.target.value)}>
            <option value="">Any availability</option><option value="in">In stock</option><option value="out">Out of stock</option>
          </select></label>
          <label className="mp-checkbox"><input type="checkbox" checked={Boolean(draft.verified)} onChange={(event) => set("verified", event.target.checked ? "1" : "")} /> Verified sellers only</label>
          <fieldset className="mp-affordability">
            <legend>Superstore balance</legend>
            <label className="mp-checkbox"><input type="checkbox" checked={Boolean(draft.affordable)} disabled={balance === null}
              onChange={(event) => set("affordable", event.target.checked ? "1" : "")} /> Within my Indipay balance</label>
            {balance !== null ? <strong>{money.format(balance)} available</strong>
              : signedIn ? <small>Your Superstore balance is currently unavailable.</small>
                : <button className="mp-promotion-button" type="button" onClick={onLogin}>Sign in to use your balance</button>}
          </fieldset>
          {error && <p role="alert">{error}</p>}
        </div>
        <footer>
          <button className="mp-promotion-button" type="button" onClick={() => { setDraft(clearFilters(params)); setError(""); }}>Reset All</button>
          <button className="mp-discovery-primary" type="submit">Apply Filters</button>
        </footer>
      </form>
    </dialog>
  );
}

export function ProductListing({
  products, stores, params, onChange, renderProduct, money, balance, signedIn, onLogin,
  searchProps, loading, error, onRetry, onBack, backLabel = "Superstore", onClearRecent, inline = false,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButton = useRef(null);
  const store = stores.find((item) => item.id === params.scope);
  const candidates = params.scope ? products.filter((product) => product.storeId === params.scope) : products;
  const heading = params.q ? "Results for “" + params.q + "”"
    : params.category || collectionNames[params.collection] ||
      (store && !inline ? "Products from " + store.name : inline ? "Products" : "All Products");
  const matches = discoverProducts(candidates, params, balance);
  const chips = filterChips(params, money, stores);

  function closeFilters() {
    setFilterOpen(false);
    // The drawer restores focus on close. This also covers applying filters via navigation.
    requestAnimationFrame(() => filterButton.current?.focus({ preventScroll: true }));
  }

  const Heading = inline ? "h2" : "h1";
  return (
    <section className="mp-discovery-listing">
      {onBack && <button type="button" className="mp-discovery-back" onClick={onBack}><ArrowLeft size={17} aria-hidden="true" /> {backLabel}</button>}
      <Heading tabIndex={-1} data-listing-heading>{heading}</Heading>
      <MarketplaceSearch key={params.q ?? ""} {...searchProps} products={candidates} stores={stores} initialQuery={params.q} withinStore={Boolean(params.scope)}
        onSearch={(q) => {
          searchProps.onSearch(q);
          onChange({ ...params, q: q || undefined });
        }} />
      <div className="mp-discovery-toolbar">
        <p role="status">{matches.length} {matches.length === 1 ? "product" : "products"}</p>
        {onClearRecent && <button type="button" className="mp-promotion-button" onClick={onClearRecent}>Clear history</button>}
        <button ref={filterButton} type="button" className="mp-promotion-button" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal size={16} aria-hidden="true" /> Filters{chips.length > 0 && " (" + chips.length + ")"}
        </button>
        <label className="mp-discovery-sort">
          <ArrowDownUp size={16} aria-hidden="true" />
          <span className="mp-visually-hidden">Sort products</span>
          <select value={params.sort ?? "relevance"} onChange={(event) => onChange({ ...params, sort: event.target.value })}>
            {Object.entries(sortOptions).map(([sort, label]) => <option key={sort} value={sort}>{label}</option>)}
          </select>
        </label>
      </div>
      {chips.length > 0 && <div className="mp-filter-chips" aria-label="Active filters">
        {chips.map(({ key, label }) => (
          <button className="mp-filter-chip" type="button" aria-label={"Remove filter: " + label} key={key}
            onClick={() => onChange({ ...params, [key]: undefined })}>{label}<X size={13} aria-hidden="true" /></button>
        ))}
        <button className="mp-promotion-button" type="button" onClick={() => onChange(clearFilters(params))}>Clear filters</button>
      </div>}
      {params.affordable && <p className="mp-discovery-status">Matches product prices. Delivery and other charges may affect checkout.</p>}
      {error && <p className="mp-discovery-status" role="alert">{error} <button className="mp-promotion-button" type="button" disabled={loading} onClick={onRetry}>Try again</button></p>}
      {loading && <p className="mp-discovery-status" role="status">Loading Superstore listings…</p>}
      {matches.length > 0 ? <div className="mp-grid">{matches.map((product) => renderProduct(product))}</div>
        : !loading && <div className="mp-empty">
          <p>{params.affordable
            ? balance === null ? (signedIn ? "Your Superstore balance is currently unavailable." : "Sign in to search within your balance.") : "No matching products are within your Superstore balance."
            : params.collection === "recent" && !products.length ? "Products you open will appear here." : "No products match your search."}</p>
          {params.affordable && balance === null && !signedIn && <button type="button" onClick={onLogin}>Sign in</button>}
          {chips.length > 0 ? <button type="button" onClick={() => onChange(clearFilters(params))}>Clear filters</button>
            : params.q && <button type="button" onClick={() => onChange({ ...params, q: undefined })}>Clear search</button>}
        </div>}
      {filterOpen && <FilterDrawer params={params} products={candidates} stores={stores} money={money} balance={balance}
        signedIn={signedIn} onLogin={onLogin} onClose={closeFilters} onApply={(next) => {
          closeFilters();
          onChange(next);
        }} />}
    </section>
  );
}

export function StoreProductListing({ storeId, ...props }) {
  const [params, setParams] = useState({ scope: storeId });
  return <ProductListing {...props} params={params} onChange={setParams} inline />;
}
