import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, ChevronRight, Heart, Star, UserRound, Package, PackageCheck, Home, LayoutGrid, Wallet, ShoppingBag, ShoppingCart, Laptop, Shirt, ShoppingBasket, Sparkles, Lamp, Watch, Store, Settings, Moon } from "lucide-react";
import { budgetPreviews, categories, deliveryStages, flashDealProgress, sampleDiscovery } from "./marketplaceData";
import { FlashDeals, PromotionalCarousel, ShopByBudget } from "./MarketplacePromotions";
import MarketplaceSearch from "./MarketplaceSearch";
import MarketplaceWallet from "./MarketplaceWallet";
import WalletEstimate from "./WalletEstimate";
import { formatPaise, rupeesToPaise } from "../../wallet/walletData";
import ProductDetails from "./ProductDetails";
import { sampleProductDetails } from "./productDetailData";
import { buyNowRoute, cartLines, detailsRoute, itemIds, productOffer, validQuantity } from "./productDetailUtils";
import { ProductListing, StoreProductListing } from "./ProductListing";
import { collectionNames, discountPercent, productRoute, readProductParams } from "./productDiscovery";
import { StoreDirectory, StoreProfile } from "./StoreProfiles";
import { endStoreSession, getDirectory, ownedStore, subscribeStores, toggleFollow } from "./storeDirectory";
import { subscriptionPlans } from "./subscriptionPlans";
import SellerDashboard from "./SellerDashboard";
import MarketplaceAdmin from "./MarketplaceAdmin";
import Indibot from "./Indibot";
import marketplaceRequest from "../../config/marketplaceApi";
import "./Marketplace.css";

const categoryIcons = {
  "All Products": ShoppingBag,
  Electronics: Laptop,
  Fashion: Shirt,
  Grocery: ShoppingBasket,
  Beauty: Sparkles,
  "Home & Living": Lamp,
  Accessories: Watch,
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
});

const storageKey = "indipay-marketplace-demo-v1";
const recentKey = "indipay-marketplace-recent-v1";
const searchesKey = "indipay-marketplace-searches-v1";
const recentLimit = 8;
const initialShop = { cart: {}, saved: [] };



function readShop() {
  try {
    const savedShop = JSON.parse(localStorage.getItem(storageKey));
    return { cart: savedShop?.cart ?? {}, saved: savedShop?.saved ?? [] };
  } catch {
    return initialShop;
  }
}

function readHistory(key) {
  try {
    const items = JSON.parse(localStorage.getItem(key));
    return Array.isArray(items) ? [...new Set(items.filter((item) => typeof item === "string" && item.trim()))].slice(0, recentLimit) : [];
  } catch {
    return [];
  }
}

function ProductCard({ product, saved, canAdd, onSave, onAdd, onDetails, onStore, sold }) {
  const savings = product.original - product.price;
  return (
    <article className="mp-card">
      <div className="mp-photo">
        <span aria-hidden="true">{product.icon}</span>
        {product.image && <img key={product.image} src={product.image} alt={product.name} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.hidden = true; }} />}
        {savings > 0 && <span className="mp-discount">{discountPercent(product)}% off</span>}
        <button type="button" aria-pressed={saved} aria-label={`Wishlist for ${product.name}`} onClick={onSave}>
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="mp-card-body">
        <h3><button type="button" className="mp-product-link" onClick={onDetails}>{product.name}</button></h3>
        <p>{onStore ? <button type="button" className="mp-card-store" onClick={onStore}>{product.seller}</button> : product.seller}{product.demo && " · Demo"}</p>
        <span className="mp-rating"><Star size={14} aria-hidden="true" /> {product.rating === undefined ? "Not rated yet" : `${product.rating.toFixed(1)} / 5`}</span>
        <div className="mp-price">
          <strong>{money.format(product.price)}</strong>
          {savings > 0 && <del>{money.format(product.original)}</del>}
        </div>
        {sold !== undefined
          ? <div className="mp-deal-progress">
            <progress max={100} value={sold} aria-label={`Sample stock sold for ${product.name}`} />
            <span>{sold}% sold</span>
          </div>
          : savings > 0 && <span className="mp-savings">Save {money.format(savings)}</span>}
        <button type="button" className="mp-add" disabled={!canAdd} onClick={onAdd}>
          {product.sample ? "Catalog preview" : product.variantOptions?.length
            ? canAdd ? "Choose options" : "Out of stock"
            : product.stock === 0 ? "Out of stock" : canAdd ? "Add to cart" : "Stock limit reached"}
        </button>
      </div>
    </article>
  );
}

function marketplaceTab(fallback) {
  const fragment = window.location.hash.slice(1);
  if (["products", "details", "checkout", "wallet", "orders"].some((tab) => fragment === tab || fragment.startsWith(tab + "?"))) return fragment;
  if (/^store\/[a-zA-Z0-9_-]+$/.test(fragment) || ["my-store", "stores", "cart", "wishlist", "orders", "wallet", "categories", "settings", "seller", "admin", "flash-deals"].includes(fragment)) return fragment;
  return fallback;
}

export default function Marketplace({ initialTab = "shop", customer, walletState, darkMode, onThemeChange, onBack, onLogin, onOpenWallet, onOpenIndipayPage, onOpenSellerRegistration, onOpenSellerLogin }) {
  const profileMenu = useRef(null);

  useEffect(() => {
    function closeOutside(event) {
      const menu = profileMenu.current;
      if (menu?.open && !menu.contains(event.target)) menu.open = false;
    }

    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);
  const [recentIds, setRecentIds] = useState(() => readHistory(recentKey));
  const [searchHistory, setSearchHistory] = useState(() => readHistory(searchesKey));
  const [notice, setNotice] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [indibotOpen, setIndibotOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(() => marketplaceTab(initialTab));
  const activeTab = activeRoute.split("?", 1)[0];
  const routeParams = new URLSearchParams(activeRoute.split("?")[1]);
  const requestedId = routeParams.get("id");
  const requestedVariant = routeParams.get("variant");
  const requestedQuantity = Number(routeParams.get("quantity") ?? 1);
  const directCheckout = activeRoute.startsWith("checkout?");
  useEffect(() => {
    const restore = () => {
      setActiveRoute(marketplaceTab(initialTab));
      setNotice("");
    };
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => { window.removeEventListener("popstate", restore); window.removeEventListener("hashchange", restore); };
  }, [initialTab]);
  const directory = useSyncExternalStore(subscribeStores, getDirectory);
  const myStore = useSyncExternalStore(subscribeStores, () => ownedStore(customer, getDirectory()) || null);
  const viewer = customer ? "customer-" + customer.id : myStore ? "seller-" + myStore.id : "guest";
  const [shop, setShop] = useState(readShop);
  const [remote, setRemote] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [returnTab, setReturnTab] = useState("shop");
  const [confirmation, setConfirmation] = useState(null);
  const liveProducts = (remote?.catalog ?? []).map((product) => ({
    ...product, storeId: "live-" + product.sellerId, seller: product.store.name, section: "Featured", icon: "📦",
  }));
  const liveStores = new Map();
  for (const product of liveProducts) {
    if (!liveStores.has(product.storeId)) liveStores.set(product.storeId, {
      id: product.storeId, name: product.seller, username: product.storeId, category: product.category, cover: product.image,
    });
  }
  const stores = [...directory.stores, ...liveStores.values()];
  const storesById = new Map(stores.map((store) => [store.id, store]));
  const products = [...liveProducts, ...directory.products.map((product) => {
    const sample = sampleProductDetails.get(product.id);
    const options = product.variantOptions ?? sample?.variantOptions ?? [];
    const availableStock = options.length ? Math.max(...options.map((option) => option.stock ?? product.stock)) : product.stock;
    return {
      ...sampleDiscovery.get(product.id), ...sample, ...product,
      images: product.images?.length === 1 && product.images[0] === sample?.images?.[0] ? sample.images : product.images,
      demo: true, sellerId: product.storeId, seller: storesById.get(product.storeId)?.name,
      verified: storesById.get(product.storeId)?.status === "approved",
      inventoryStock: product.stock, stock: product.available === false ? 0 : availableStock,
    };
  })];
  const sampleStore = storesById.get("sample-hill-roast");
  const catalogProducts = [...products, ...budgetPreviews.map((product) => ({
    ...product, storeId: sampleStore?.id, seller: sampleStore?.name ?? product.seller,
    brand: "Hill Roast", keywords: ["coffee", "beans"], verified: sampleStore?.status === "approved",
  }))];
  const selected = activeTab === "details" ? catalogProducts.find((product) => product.id === requestedId) : null;
  const viewedId = selected?.id;
  const selectedStore = storesById.get(selected?.storeId);
  const selectedStoreProducts = selectedStore ? catalogProducts.filter((product) => product.storeId === selectedStore.id) : [];
  const checkoutProduct = directCheckout ? products.find((product) => product.id === requestedId) : null;
  const checkoutOffer = checkoutProduct ? productOffer(checkoutProduct, requestedVariant) : null;
  const isOwnerPage = activeTab === "my-store";
  const currentStore = isOwnerPage ? myStore : stores.find((store) => "store/" + store.id === activeTab);
  const storeProducts = currentStore ? (isOwnerPage ? products : catalogProducts).filter((product) => product.storeId === currentStore.id) : [];
  const { account, wallet, refresh: refreshAccount, error: walletError, loading: walletLoading } = walletState;
  const balance = wallet.availablePaise === null ? null : wallet.availablePaise / 100;
  const orders = account?.orders ?? [];
  const visibleOrders = requestedId ? orders.filter((order) => order.id === requestedId) : orders;
  const walletDemoActive = routeParams.get("demo") === "1";
  const walletView = routeParams.get("view");
  const walletWithOrderDetails = activeTab === "wallet" ? {
    ...wallet,
    transactions: wallet.transactions.map((transaction) => {
      const order = orders.find((item) => item.id === transaction.orderId);
      if (!order?.lines?.length) return transaction;
      const store = storesById.get("live-" + order.lines[0].sellerId);
      const categories = [...new Set(order.lines.map((line) => products.find((product) => product.id === line.id)?.category).filter(Boolean))];
      return { ...transaction, store: transaction.store ?? store?.name,
        category: transaction.category ?? (categories.length > 1 ? "Mixed categories" : categories[0]) };
    }),
  } : wallet;

  async function refreshCatalog() {
    setRefreshing(true);
    try {
      setRemote(await loadRemote());
      setError("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setRefreshing(false);
    }
  }

  async function loadRemote() {
    const [catalog] = await Promise.all([marketplaceRequest("/catalog"), refreshAccount()]);
    return { catalog: catalog.products };
  }

  useEffect(() => {
    let cancelled = false;
    marketplaceRequest("/catalog")
      .then((catalog) => {
        if (cancelled) return;
        setRemote({ catalog: catalog.products });
      })
      .catch((failure) => {
        if (cancelled) return;
        setRemote({ catalog: [] });
        setError(failure.message);
      });
    return () => { cancelled = true; };
  }, []);

  async function sellerAction(path, method, body) {
    await marketplaceRequest(path, method, body);
    setRemote(await loadRemote());
  }
  const lines = cartLines(shop.cart, products);
  const stockIssue = lines.some((line) => !validQuantity(line.quantity, line));
  const demoLines = lines.some((line) => line.demo || line.variantId);
  const mixedSellers = new Set(lines.map((line) => line.sellerId)).size > 1;
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const cartCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(shop));
    } catch {
      // Shopping remains usable when browser storage is unavailable.
    }
  }, [shop]);

  useEffect(() => {
    try {
      localStorage.setItem(recentKey, JSON.stringify(recentIds));
    } catch {
      // Recently viewed items are still available during this visit.
    }
  }, [recentIds]);

  useEffect(() => {
    if (!viewedId) return;
    const frame = requestAnimationFrame(() => {
      setRecentIds((previous) => previous[0] === viewedId ? previous
        : [viewedId, ...previous.filter((id) => id !== viewedId)].slice(0, recentLimit));
      document.querySelector("[data-product-heading]")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [viewedId]);

  useEffect(() => {
    try {
      localStorage.setItem(searchesKey, JSON.stringify(searchHistory));
    } catch {
      // Search history is still available during this visit.
    }
  }, [searchHistory]);

  function changeQuantity(offer, delta, announce = false) {
    if (busy || (delta > 0 && !validQuantity(delta, offer, shop.cart[offer.key] ?? 0))) return;
    setPendingOrderId(null);
    setShop((previous) => {
      const cart = { ...previous.cart };
      const quantity = (cart[offer.key] ?? 0) + delta;
      if (delta > 0 && !validQuantity(quantity, offer)) return previous;
      if (quantity > 0) cart[offer.key] = quantity;
      else delete cart[offer.key];
      return { ...previous, cart };
    });
    if (announce) setNotice("Added to cart");
  }

  async function placeOrder() {
    if (!customer) { onLogin(); return; }
    if (!account || directCheckout || demoLines || busy || !lines.length || balance === null || total > balance || stockIssue || mixedSellers) return;
    const id = pendingOrderId ?? crypto.randomUUID();
    setPendingOrderId(id);
    setBusy(true);
    setError("");
    try {
      const order = await marketplaceRequest("/checkout", "POST", {
        id, expectedTotal: total, items: lines.map(({ id: productId, quantity }) => ({ id: productId, quantity })),
      });
      setShop((previous) => ({ ...previous, cart: {} }));
      setConfirmation(order.id);
      setPendingOrderId(null);
      openTab("orders");
      setRemote(await loadRemote());
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  function toggleSaved(id) {
    setShop((previous) => ({
      ...previous,
      saved: previous.saved.includes(id) ? previous.saved.filter((item) => item !== id) : [...previous.saved, id],
    }));
  }

  function renderProduct(product, sold) {
    const offer = productOffer(product);
    const options = product.variantOptions ?? [];
    const canAdd = options.length
      ? options.some((variant) => productOffer(product, variant.id).stock > 0)
      : validQuantity(1, offer, shop.cart[offer.key] ?? 0);
    return (
      <ProductCard
        key={product.id}
        product={product}
        sold={sold}
        saved={shop.saved.includes(product.id)}
        canAdd={!busy && canAdd}
        onSave={() => toggleSaved(product.id)}
        onAdd={() => options.length ? openProduct(product) : changeQuantity(offer, 1, true)}
        onDetails={() => openProduct(product)}
        onStore={product.storeId ? () => openTab("store/" + product.storeId) : undefined}
      />
    );
  }
  const showCatalog = activeTab === "shop" || activeTab === "categories";

  useEffect(() => {
    if (activeTab === "categories") {
      document.getElementById("marketplace-categories")?.focus();
    }
    if (activeTab === "products" || activeTab === "flash-deals") {
      document.querySelector("[data-listing-heading]")?.focus();
    }
  }, [activeTab]);

  function closeProfile(restoreFocus = false) {
    const menu = profileMenu.current;
    if (!menu?.open) return;
    menu.open = false;
    if (restoreFocus) menu.querySelector("summary")?.focus();
  }

  function openTab(tab) {
    closeProfile(true);
    setNotice("");
    const hash = tab === "shop" ? "" : "#" + tab;
    if (window.location.hash !== hash) window.history.pushState(null, "", window.location.pathname + window.location.search + hash);
    setActiveRoute(tab);
    window.scrollTo(0, 0);
    if (tab === "categories" && activeTab === tab) {
      document.getElementById("marketplace-categories")?.focus();
    }
  }

  function openProduct(product) {
    setReturnTab(activeTab === "details" ? returnTab : activeRoute);
    openTab(detailsRoute(product.id));
  }

  function openWalletView(view, id, demo = walletDemoActive) {
    const params = new URLSearchParams({ view });
    if (id) params.set("id", id);
    if (demo) params.set("demo", "1");
    openTab("wallet?" + params);
  }

  const openEarnMore = () => openWalletView("earn", null, false);

  const recent = recentIds.map((id) => catalogProducts.find((product) => product.id === id)).filter(Boolean);
  const recommendations = selected ? [
    { label: "More from This Store", items: selectedStoreProducts.filter((product) => product.id !== viewedId).slice(0, 4) },
    { label: "Similar Products", items: catalogProducts.filter((product) => product.id !== viewedId && product.category === selected.category).slice(0, 4) },
    { label: "Recently Viewed Products", items: recent.filter((product) => product.id !== viewedId).slice(0, 4) },
  ] : [];
  const collections = {
    trending: products.filter(({ section }) => section === "Trending"),
    new: products.filter(({ section }) => section === "Featured"),
    recommended: products.filter(({ section }) => section === "Recommended"),
    recent,
    flash: products.filter((product) => product.demo && flashDealProgress.has(product.id) && product.stock > 0 && product.original > product.price),
  };
  const flashDeals = collections.flash.map((product) => ({ product, sold: flashDealProgress.get(product.id) }));
  const listingPage = activeTab === "products" || activeTab === "flash-deals";
  const listingParams = activeTab === "flash-deals" ? { collection: "flash" } : readProductParams(activeRoute.slice("products?".length));
  const listingProducts = listingParams.collection ? collections[listingParams.collection] : catalogProducts;
  const listingStore = storesById.get(listingParams.scope);
  const openListing = (params) => openTab(productRoute(params));
  const openStore = (id) => openTab("store/" + id);
  const openShop = () => openTab("shop");

  function rememberSearch(value) {
    const term = value.trim();
    if (term) setSearchHistory((previous) => [term, ...previous.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, recentLimit));
  }

  const searchProps = {
    history: searchHistory,
    onClearHistory: () => setSearchHistory([]),
    onSearch: rememberSearch,
    onProduct: (product, term) => { rememberSearch(term); openProduct(product); },
    onStore: (id, term) => { rememberSearch(term); openStore(id); },
  };
  const listingProps = {
    stores, searchProps, money, onLogin,
    balance,
    signedIn: Boolean(customer),
    loading: !remote || refreshing,
    error,
    onRetry: refreshCatalog,
  };
  const role = account?.role ?? customer?.role;
  const accountType = myStore ? "Marketplace seller" : !customer ? "Guest account" : role === "ADMIN" ? "Administrator" : role === "SELLER" ? "Seller account" : "Customer account";
  const profileLinks = [
    { label: "Indipay Home", Icon: Home, tab: "home" },
    { label: "My Cart", Icon: ShoppingCart, tab: "cart", count: cartCount },
    { label: "My Wishlist", Icon: Heart, tab: "wishlist", count: shop.saved.length },
    { label: "My Orders", Icon: Package, tab: "orders" },
    { label: "My Wallet", Icon: Wallet, tab: "wallet" },
    { label: "Seller Dashboard", Icon: Store, tab: "seller" },
  ];

  return (
    <div className={selected ? "indipay-marketplace mp-product-route" : "indipay-marketplace"}>
      <header className="mp-header">
        <div className="mp-wrap mp-toolbar">
          <details className="mp-profile-menu" ref={profileMenu} onKeyDown={(event) => {
            if (event.key === "Escape" && event.currentTarget.open) {
              event.preventDefault();
              closeProfile(true);
            }
          }}>
            <summary className="mp-profile-trigger" aria-label="Marketplace profile">
              <span className="mp-profile-avatar"><UserRound size={19} aria-hidden="true" /></span>
              <ChevronDown className="mp-profile-chevron" size={13} aria-hidden="true" />
            </summary>
            <div className="mp-profile-panel">
              <div className="mp-profile-identity">
                <span className="mp-profile-avatar"><UserRound size={19} aria-hidden="true" /></span>
                <div>
                  <strong>{customer?.name || myStore?.owner || myStore?.name || (customer ? "Indipay customer" : "Guest")}</strong>
                  <small>{accountType}</small>
                  {!customer && <button type="button" className="mp-profile-signin" onClick={() => { closeProfile(); onLogin(); }}>Sign in</button>}
                </div>
              </div>
              <hr />
              <button type="button" className="mp-profile-link store-menu-link" onClick={() => {
                if (myStore) openTab("my-store"); else { closeProfile(); onOpenSellerRegistration(); }
              }}>
                {myStore?.logo ? <img src={myStore.logo} alt="" /> : <Store size={19} />}
                <span><strong>{myStore ? myStore.name : "Become a Seller"}</strong><small>{myStore ? "My Store · " + subscriptionPlans[myStore.plan].name + " plan" : "Choose a store plan"}</small></span><ChevronRight size={15} />
              </button>
              {profileLinks.map(({ label, Icon, tab, count }) => (
                <button key={label} className="mp-profile-link" type="button" aria-current={tab === activeTab ? "page" : undefined} onClick={() => {
                  if (tab === "home") {
                    closeProfile();
                    onBack();
                  } else {
                    openTab(tab);
                  }
                }}>
                  <Icon size={17} aria-hidden="true" />
                  <span>{label}</span>
                  {count !== undefined && <span className="mp-profile-count">{count}</span>}
                </button>
              ))}
              <hr />
              <button className="mp-profile-link" type="button" aria-current={activeTab === "settings" ? "page" : undefined} onClick={() => openTab("settings")}>
                <Settings size={17} aria-hidden="true" /><span>Settings</span>
              </button>
            </div>
          </details>
          <div className="mp-brand">Indipay Marketplace</div>
          <button type="button" className="mp-wallet" onClick={() => openTab("wallet")} aria-label={balanceVisible && balance !== null
            ? "Open Marketplace Wallet. Available spending balance " + formatPaise(wallet.availablePaise) : "Open Marketplace Wallet"}>
            <Wallet size={17} aria-hidden="true" />
            <span><small>Marketplace balance</small><strong>{balance === null ? "—" : balanceVisible ? formatPaise(wallet.availablePaise) : "••••"}</strong></span>
          </button>
        </div>
      </header>
      <main className="mp-wrap mp-main">
        {error && activeTab !== "wallet" && !listingPage && !(currentStore && !isOwnerPage) && <p role="alert">{error} <button type="button" disabled={refreshing} onClick={refreshCatalog}>Refresh marketplace</button></p>}
        {activeTab === "admin" && account?.role === "ADMIN" && <MarketplaceAdmin request={marketplaceRequest} onChange={async () => setRemote(await loadRemote())} money={money} />}
        {activeTab === "stores" && <StoreDirectory stores={stores} products={catalogProducts} discovery onVisit={openStore} />}
        {(isOwnerPage || activeTab.startsWith("store/")) && (currentStore ?
          <StoreProfile key={activeTab + currentStore.id} store={currentStore} manage={isOwnerPage} customer={customer}
            products={storeProducts} follows={directory.follows} viewer={viewer}
            renderProduct={renderProduct} onPublic={() => openStore(currentStore.id)}
            productListing={!isOwnerPage && <StoreProductListing {...listingProps} products={storeProducts}
              storeId={currentStore.id} renderProduct={renderProduct} />}
            onSeeProducts={!isOwnerPage ? () => openListing({ scope: currentStore.id }) : undefined}
            onExitSession={currentStore.ownerId == null ? () => { endStoreSession(); openTab("shop"); } : null}
            onDelete={(id) => setShop((previous) => {
              const cart = Object.fromEntries(Object.entries(previous.cart).filter(([key]) => itemIds(key)[0] !== id));
              return { cart, saved: previous.saved.filter((item) => item !== id) };
            })} />
          : <section className="mp-panel"><h1>{isOwnerPage ? "My store" : "Store unavailable"}</h1>
            <p>{isOwnerPage ? "Sign in to your demo seller account to manage a store." : "This store is unavailable in this browser."}</p>
            <button onClick={isOwnerPage ? onOpenSellerLogin : () => openTab("stores")}>{isOwnerPage ? "Seller login" : "Explore stores"}</button></section>)}
        {activeTab === "settings" && (
          <section className="mp-panel mp-settings" aria-labelledby="mp-settings-title">
            <h1 id="mp-settings-title">Settings</h1>
            <div className="mp-settings-row">
              <Moon size={20} aria-hidden="true" />
              <div><strong>Dark mode</strong><p>Applies across Indipay.</p></div>
              <button type="button" role="switch" aria-label="Dark mode" aria-checked={darkMode} onClick={() => onThemeChange(!darkMode)}>
                {darkMode ? "On" : "Off"}
              </button>
            </div>
            {account?.role === "ADMIN" && <button type="button" onClick={() => openTab("admin")}>Marketplace admin</button>}
          </section>
        )}
        {activeTab === "wallet" && (
          <MarketplaceWallet wallet={walletWithOrderDetails} demo={walletDemoActive} view={
            ["history", "statements", "analytics", "notifications", "earn", "transaction", "order", "help"].includes(walletView) ? walletView : "overview"
          } transactionId={requestedId} customer={customer} loading={walletLoading} error={walletError}
            visible={balanceVisible} onToggleVisible={() => setBalanceVisible((visible) => !visible)}
            onView={openWalletView} onToggleDemo={() => openWalletView("overview", null, !walletDemoActive)}
            onRetry={refreshAccount} onLogin={onLogin} onShop={openShop} onAffordable={() => openListing({ affordable: "1" })}
            onMainWallet={onOpenWallet} onOpenIndipayPage={onOpenIndipayPage} onSupport={() => setIndibotOpen(true)}
            orders={orders} onOrder={(id) => openTab("orders?" + new URLSearchParams({ id }))} />
        )}
        {activeTab === "seller" && (
          ["SELLER", "ADMIN"].includes(account?.role) || account?.store
            ? <SellerDashboard shop={{
              store: account.store ?? { name: "", description: "" },
              listings: account.store?.products ?? [],
              orders: account.sellerOrders.filter((order) => !order.refunded).map((order) => ({
                ...order, lines: order.lines.map((line) => ({ ...line, sellerListing: true })),
              })),
            }} action={sellerAction} money={money} />
            : <p>{customer ? "Seller approval is required." : "Sign in to access your seller account."} {!customer && <button type="button" onClick={onLogin}>Sign in</button>}</p>
        )}
        {activeTab === "details" && (selected ? (
          <ProductDetails key={activeRoute} product={selected} initialVariant={requestedVariant}
            initialQuantity={Number.isSafeInteger(requestedQuantity) && requestedQuantity > 0 ? requestedQuantity : 1}
            money={money} balance={wallet.availablePaise} signedIn={Boolean(customer)} onEarn={openEarnMore}
            saved={shop.saved.includes(selected.id)} cart={shop.cart} cartCount={cartCount} busy={busy}
            store={selectedStore} storeProducts={selectedStoreProducts}
            following={directory.follows[viewer]?.includes(selected.storeId) ?? false}
            onFollow={() => toggleFollow(viewer, selected.storeId)} onStore={() => openStore(selected.storeId)}
            onBack={() => openTab(returnTab)} onCart={() => openTab("cart")} onSave={() => toggleSaved(selected.id)}
            onAdd={(offer, quantity) => changeQuantity(offer, quantity, true)}
            onBuy={(offer, quantity) => { if (validQuantity(quantity, offer)) openTab(buyNowRoute(offer, quantity)); }}
            recommendations={recommendations} renderProduct={renderProduct} />
        ) : (
          <section className="mp-panel">
            <h1>{!remote || refreshing ? "Loading product…" : "Product unavailable"}</h1>
            {!remote || refreshing ? <p role="status">Checking the marketplace catalog.</p>
              : <p>This product may have been removed or may belong to a store saved in another browser.</p>}
            <button type="button" onClick={() => openTab(returnTab)}>Browse products</button>
          </section>
        ))}
        {activeTab === "wishlist" && (
          <section className="mp-panel">
            <h1>Your wishlist</h1>
            {catalogProducts.some(({ id }) => shop.saved.includes(id)) ? <div className="mp-grid">{catalogProducts.filter(({ id }) => shop.saved.includes(id)).map((product) => renderProduct(product))}</div> : <p>Save a product using its heart icon.</p>}
          </section>
        )}
        {activeTab === "cart" && (
          <section className="mp-panel">
            <h1>Your cart</h1>
            {!lines.length && <p>Your cart is empty.</p>}
            {lines.map((line) => (
              <div className="mp-cart-line" key={line.key}>
                <div><strong>{line.name}{line.demo && " · Demo"}</strong>
                  {line.variantName && <div className="mp-detail-muted">{line.variantName}</div>}
                  {line.needsVariant && <button type="button" onClick={() => openProduct(line)}>Choose available options</button>}
                  {!line.needsVariant && line.stock === 0 && <div className="mp-detail-muted">Unavailable</div>}
                </div>
                <span>{money.format(line.quantity * line.price)}</span>
                <div>
                  <button type="button" disabled={busy} aria-label={`Decrease quantity of ${line.name} ${line.variantName}`} onClick={() => changeQuantity(line, -1)}>−</button>
                  <span> {line.quantity} </span>
                  <button type="button" disabled={busy || !validQuantity(line.quantity + 1, line)} aria-label={`Increase quantity of ${line.name} ${line.variantName}`} onClick={() => changeQuantity(line, 1)}>+</button>
                </div>
              </div>
            ))}
            {lines.length > 0 && <div className="mp-cart-wallet-estimate">
              <WalletEstimate balance={wallet.availablePaise} subtotal={rupeesToPaise(total)} subtotalLabel="Cart subtotal"
                signedIn={Boolean(customer)} onEarn={openEarnMore} />
            </div>}
            <button type="button" onClick={() => lines.length ? openTab("checkout") : openTab("shop")}>{lines.length ? "Review checkout" : "Browse products"}</button>
          </section>
        )}
        {directCheckout && (
          <section className="mp-panel">
            <h1>Buy Now preview</h1>
            {checkoutOffer && validQuantity(requestedQuantity, checkoutOffer) ? (
              <>
                <h2>{checkoutOffer.name}</h2>
                {checkoutOffer.variantName && <p>{checkoutOffer.variantName}</p>}
                <p>Quantity {requestedQuantity}</p>
                <WalletEstimate balance={wallet.availablePaise} subtotal={rupeesToPaise(checkoutOffer.price * requestedQuantity)}
                  subtotalLabel="Product subtotal" signedIn={Boolean(customer)} onEarn={openEarnMore} />
                <p>Preview only · No payment or order is created. Delivery charges are excluded.</p>
                {!customer && <button type="button" onClick={onLogin}>Sign in to view balance</button>}
              </>
            ) : <p role="status">{!remote || refreshing ? "Checking product availability…" : "This selection is unavailable. Choose a product or update your options."}</p>}
            <button type="button" onClick={() => openTab(checkoutProduct ? detailsRoute(checkoutProduct.id, requestedVariant, requestedQuantity) : "shop")}>
              {checkoutProduct ? "Back to product" : "Browse products"}
            </button>
          </section>
        )}
        {activeTab === "checkout" && !directCheckout && (
          <section className="mp-panel">
            <h1>Marketplace wallet checkout</h1>
            <WalletEstimate balance={wallet.availablePaise} subtotal={rupeesToPaise(total)} subtotalLabel="Order subtotal"
              signedIn={Boolean(customer)} onEarn={openEarnMore} />
            <button type="button" onClick={() => openTab("cart")}>Back to cart</button>
            {demoLines && <p role="status">Demo products can be saved in your cart. Remove them to check out live products.</p>}
            {stockIssue && <p role="alert">A cart item or quantity is unavailable. Update your cart before placing the order.</p>}
            {mixedSellers && <p role="alert">Checkout supports one store per order. Remove items from other stores to continue.</p>}
            {customer
              ? <button type="button" disabled={demoLines || busy || !account || !lines.length || stockIssue || mixedSellers || balance === null || total > balance} onClick={placeOrder}>{busy ? "Placing order…" : "Place order"}</button>
              : <button type="button" onClick={onLogin}>Sign in to place order</button>}
          </section>
        )}
        {activeTab === "orders" && (
          <section className="mp-panel">
            <h1>{requestedId ? "Related order" : "Your orders"}</h1>
            {requestedId && <button type="button" onClick={() => openTab("orders")}>View all orders</button>}
            {visibleOrders.length === 0 &&
              <p>{walletLoading ? "Loading orders…" : customer ? "No orders to display." : "Sign in to view your orders."}</p>}
            {visibleOrders.map((order) => (
              <article className="mp-order" key={order.id}>
                {confirmation === order.id && <p role="status"><strong>Order confirmed.</strong></p>}
                <h2>Order {order.id.slice(0, 8).toUpperCase()}</h2>
                <p>{new Date(order.createdAt).toLocaleDateString("en-IN")} · {money.format(order.total)}{order.refunded && " · Refunded"}</p>
                <ul>{order.lines.map((line) => <li key={line.id ?? line.name}>{line.quantity} × {line.name}{line.sellerListing && ` · ${deliveryStages[order.sellerStage ?? 0]}`}</li>)}</ul>
                {!order.refunded && <details><summary>Track order</summary><ol>{deliveryStages.map((stage, index) => <li key={stage}>{stage}{index > (order.sellerStage ?? 0) ? " (pending)" : ""}</li>)}</ol></details>}
              </article>
            ))}
          </section>
        )}
        {listingPage && (
          <ProductListing {...listingProps} products={listingProducts} params={listingParams} onChange={openListing}
            onBack={listingStore ? () => openStore(listingStore.id) : openShop} backLabel={listingStore?.name}
            onClearRecent={listingParams.collection === "recent" && recentIds.length ? () => setRecentIds([]) : undefined}
            renderProduct={(product) => renderProduct(product, listingParams.collection === "flash" ? flashDealProgress.get(product.id) : undefined)} />
        )}
        {showCatalog && (
          <>
            <h1 className="mp-visually-hidden">Indipay Marketplace</h1>
            <MarketplaceSearch {...searchProps} products={catalogProducts} stores={stores} onSearch={(q) => {
              rememberSearch(q);
              openListing({ q });
            }} />
            <nav id="marketplace-categories" className="mp-categories" aria-label="Product categories" tabIndex={-1}>
              {categories.map((item) => {
                const Icon = categoryIcons[item] ?? LayoutGrid;
                return (
                  <button key={item} type="button" onClick={() => openListing({ category: item === categories[0] ? undefined : item })}>
                    <span className="mp-category-icon"><Icon aria-hidden="true" strokeWidth={1.6} /></span>
                    <span>{item}</span>
                  </button>
                );
              })}
            </nav>
            <PromotionalCarousel onExplore={(category) => openListing({ category })} />
            <FlashDeals products={flashDeals} renderProduct={renderProduct} onViewAll={() => openListing({ collection: "flash" })} />
            <StoreDirectory stores={stores} products={catalogProducts} onVisit={openStore} onDiscover={() => openTab("stores")} />
            <ShopByBudget money={money} onSelect={(budget) => openListing({ budget })} />
            {["trending", "new", "recommended", "recent"].map((id) => {
              const items = collections[id];
              if (!items.length && id !== "recent") return null;
              return (
                <section key={id} className="mp-section">
                  <header className="mp-discovery-section-heading">
                    <h2>{collectionNames[id]}</h2>
                    {id === "recent" && recentIds.length > 0 && <button className="mp-promotion-button" type="button" onClick={() => setRecentIds([])}>Clear history</button>}
                    {items.length > 0 && <button className="mp-promotion-button" type="button" onClick={() => openListing({
                      collection: id, sort: id === "new" ? "newest" : undefined,
                    })}>View All <ChevronRight size={16} aria-hidden="true" /></button>}
                  </header>
                  {items.length > 0 ? <div className="mp-grid">{items.map((product) => renderProduct(product))}</div> : <p>Products you open will appear here.</p>}
                </section>
              );
            })}
            {!myStore && (
              <section className="mp-seller-promo">
                <Store size={36} aria-hidden="true" />
                <div>
                  <h2>Want to list your products on Indipay Marketplace?</h2>
                  <p>Reach new customers, showcase your products and grow your business with Indipay. Register as a marketplace user today.</p>
                  <div>
                    <button type="button" onClick={onOpenSellerRegistration}>Become a Seller</button>
                    <button type="button" onClick={onOpenSellerLogin}>Already registered? Seller Login</button>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      {notice && <div className="mp-notice"><span role="status">{notice}</span><button type="button" onClick={() => openTab("cart")}>View cart</button><button type="button" onClick={() => setNotice("")}>Dismiss</button></div>}
      <nav className="mp-bottom-nav" aria-label="Marketplace navigation">
        {[["shop", Home, "Home"], ["categories", LayoutGrid, "Categories"], ["orders", PackageCheck, "Orders"], ["wallet", Wallet, "Wallet"]].map(([tab, Icon, label]) => (
          <button type="button" key={tab} aria-current={activeTab === tab ? "page" : undefined} onClick={tab === "shop" ? openShop : () => openTab(tab)}>
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <Indibot catalog={catalogProducts} onOpenProduct={openProduct} onOpenTab={openTab} open={indibotOpen} onOpenChange={setIndibotOpen} />
    </div>
  );
}
