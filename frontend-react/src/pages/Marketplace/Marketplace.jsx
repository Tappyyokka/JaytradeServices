import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import PublishedAdminContent from "../PublishedAdminContent";
import { ChevronDown, ChevronRight, Heart, Star, UserRound, Package, PackageCheck, Home, LayoutGrid, Wallet, ShoppingBag, ShoppingCart, Laptop, Shirt, ShoppingBasket, Sparkles, Lamp, Watch, Store, Settings, Moon } from "lucide-react";
import { budgetPreviews, categories, flashDealProgress, isClosedOrder, orderStage, sampleDiscovery } from "./marketplaceData";
import { FlashDeals, PromotionalCarousel, ShopByBudget } from "./MarketplacePromotions";
import MarketplaceSearch from "./MarketplaceSearch";
import MarketplaceWallet from "./MarketplaceWallet";
import { ShoppingCartPage, ShoppingCheckout } from "./ShoppingCheckout";
import OrderManagement from "./OrderManagement";
import { formatPaise, shoppingWallet } from "../../wallet/walletData";
import ProductDetails from "./ProductDetails";
import { sampleProductDetails } from "./productDetailData";
import { buyNowRoute, cartLines, detailsRoute, itemKey, productOffer, validQuantity } from "./productDetailUtils";
import { ProductListing, StoreProductListing } from "./ProductListing";
import { collectionNames, discountPercent, productRoute, readProductParams } from "./productDiscovery";
import { StoreDirectory, StoreProfile } from "./StoreProfiles";
import { getDirectory, subscribeStores, toggleFollow } from "./storeDirectory";
import { recordStoreActivity } from "./merchantInsights";
import useSuperstoreSocial from "./useSuperstoreSocial";
import { FollowingFeed, StoreAnnouncementEditor } from "./SocialShopping";
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
const initialShop = { cart: {}, saved: [], excluded: {}, details: {} };
const guestTransferKey = storageKey + ":guest-transfer";



function readShop(viewer) {
  try {
    const savedShop = JSON.parse(localStorage.getItem(storageKey + ":" + viewer) ??
      (viewer === "guest" ? localStorage.getItem(storageKey) : null));
    const shop = { ...initialShop, ...savedShop };
    const transfer = viewer !== "guest" && window.location.hash === "#checkout"
      ? JSON.parse(sessionStorage.getItem(guestTransferKey)) : null;
    if (!Array.isArray(transfer) || !transfer.length) return shop;
    const cart = { ...shop.cart };
    const details = { ...shop.details };
    const excluded = Object.fromEntries(Object.keys(cart).map((key) => [key, true]));
    for (const entry of transfer) {
      if (typeof entry.key !== "string" || !Number.isSafeInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 100) continue;
      cart[entry.key] = entry.quantity;
      details[entry.key] = entry.details;
      delete excluded[entry.key];
    }
    return { ...shop, cart, details, excluded };
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
        <span className="mp-rating"><Star size={14} aria-hidden="true" /> {Number.isFinite(product.rating) ? `${product.rating.toFixed(1)} / 5` : "Not rated yet"}</span>
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
  if (["products", "details", "checkout", "wallet", "orders", "seller"].some((tab) => fragment === tab || fragment.startsWith(tab + "?"))) return fragment;
  if (/^store\/[a-zA-Z0-9_-]+$/.test(fragment) || ["my-store", "stores", "following", "cart", "wishlist", "orders", "wallet", "categories", "settings", "seller", "admin", "flash-deals"].includes(fragment)) return fragment;
  return fallback;
}

export default function Marketplace({ initialTab = "shop", customer, identity, walletState, darkMode, onThemeChange, onBack, onLogin, onOpenWallet, onOpenIndipayPage, onOpenMerchantPlans, onAddMoney }) {
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
  const directCheckout = activeTab === "checkout" && Boolean(requestedId);
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
  const viewer = customer ? "customer-" + customer.id : "guest";
  const [shop, setShop] = useState(() => readShop(viewer));
  const social = useSuperstoreSocial(customer?.id, shop.saved, directory.follows[viewer] ?? []);
  const saved = new Set(social.data ? social.data.products.filter((item) => item.saved).map((item) => item.productKey) : shop.saved);
  const liked = new Set(social.data?.products.filter((item) => item.liked).map((item) => item.productKey));
  const follows = new Set([...(directory.follows[viewer] ?? []).filter((id) => !id.startsWith("live-") || !customer),
    ...(social.data?.following ?? []).map((id) => "live-" + id)]);
  const [followerCounts, setFollowerCounts] = useState({});
  const [remote, setRemote] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [returnTab, setReturnTab] = useState("shop");
  const liveProducts = (remote?.catalog ?? []).map((product) => ({
    ...product, storeId: "live-" + product.sellerId, seller: product.store.name, section: "Featured", icon: "📦",
    variantOptions: product.variants ?? [],
    stock: product.hasVariants ? Math.max(0, ...(product.variants ?? []).map((variant) => variant.stock)) : product.stock,
  }));
  const liveStores = new Map((remote?.stores ?? []).map(({ userId, profile, ...store }) => {
    const id = "live-" + userId;
    return [id, { ...profile, ...store, id, category: profile?.category || "Other" }];
  }));
  for (const product of liveProducts) {
    if (!liveStores.has(product.storeId)) liveStores.set(product.storeId, {
      id: product.storeId, name: product.seller, username: product.storeId, category: product.category, cover: product.image,
    });
  }
  const stores = [...directory.stores, ...liveStores.values()];
  const storesById = new Map(stores.map((store) => [store.id, store]));
  const products = [...liveProducts, ...directory.products.filter((product) => !product.deletedAt && product.active !== false).map((product) => {
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
  const showMerchantDashboard = activeTab === "seller" || (activeTab === "my-store" && identity.canManageLive);
  const currentStore = stores.find((store) => "store/" + store.id === activeTab);
  const storeProducts = currentStore ? catalogProducts.filter((product) => product.storeId === currentStore.id) : [];
  const activityStoreId = currentStore?.id ?? selectedStore?.id;
  const lastActivity = useRef("");
  useEffect(() => {
    const key = activityStoreId ? activityStoreId + ":" + (viewedId ?? "") : "";
    if (key && key !== lastActivity.current) recordStoreActivity(activityStoreId, viewedId);
    lastActivity.current = key;
  }, [activityStoreId, viewedId]);
  const { account, wallet, refresh: refreshAccount, error: walletError, loading: walletLoading } = walletState;
  const balance = wallet.availablePaise === null ? null : wallet.availablePaise / 100;
  const orders = account?.orders ?? [];
  const followerCount = (store) => !store ? 0 : store.id.startsWith("live-")
    ? followerCounts[store.id] ?? store.followers ?? 0
    : (store.followers ?? 0) + Object.values(directory.follows).filter((ids) => ids.includes(store.id)).length;
  const visibleOrders = requestedId ? orders.filter((order) => order.id === requestedId || order.checkoutDetails?.checkoutId === requestedId) : orders;
  const walletDemoActive = routeParams.get("demo") === "1";
  const walletView = routeParams.get("view");
  const walletWithOrderDetails = activeTab === "wallet" ? {
    ...wallet,
    transactions: shoppingWallet(wallet).transactions.map((transaction) => {
      const order = orders.find((item) => item.id === transaction.orderId || item.checkoutDetails?.checkoutId === transaction.orderId);
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
    return { catalog: catalog.products, stores: catalog.stores };
  }

  useEffect(() => {
    let cancelled = false;
    marketplaceRequest("/catalog")
      .then((catalog) => {
        if (cancelled) return;
        setRemote({ catalog: catalog.products, stores: catalog.stores });
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

  async function orderAction(path, method, body) {
    await marketplaceRequest(path, method, body);
    await refreshAccount();
  }
  const lines = cartLines(shop.cart, products, shop.details);
  const selectedLines = lines.filter((line) => !shop.excluded[line.key]);
  const cartCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey + ":" + viewer, JSON.stringify(shop));
      if (viewer !== "guest" && window.location.hash === "#checkout") sessionStorage.removeItem(guestTransferKey);
    } catch {
      // Shopping remains usable when browser storage is unavailable.
    }
  }, [shop, viewer]);

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
    if (delta > 0 && !validQuantity(delta, offer, shop.cart[offer.key] ?? 0)) return;
    setShop((previous) => {
      const cart = { ...previous.cart };
      const details = { ...previous.details };
      const quantity = (cart[offer.key] ?? 0) + delta;
      if (delta > 0 && !validQuantity(quantity, offer)) return previous;
      if (quantity <= 0) return previous;
      cart[offer.key] = quantity;
      details[offer.key] ??= { storeId: offer.storeId, sellerId: offer.sellerId, seller: offer.seller, name: offer.name, price: offer.price };
      return { ...previous, cart, details };
    });
    if (announce) setNotice("Added to cart");
  }

  function selectLines(items, selected) {
    setShop((previous) => {
      const excluded = { ...previous.excluded };
      for (const { key } of items) {
        if (selected) delete excluded[key];
        else excluded[key] = true;
      }
      return { ...previous, excluded };
    });
  }

  async function removeLine(line, save) {
    if (save && !saved.has(line.id) && !await toggleSaved(line.id)) return;
    setShop((previous) => {
      const cart = { ...previous.cart };
      const excluded = { ...previous.excluded };
      const details = { ...previous.details };
      delete cart[line.key];
      delete excluded[line.key];
      delete details[line.key];
      return { ...previous, cart, excluded, details };
    });
  }

  function loginToCheckout() {
    if (!directCheckout && !customer) {
      try {
        sessionStorage.setItem(guestTransferKey, JSON.stringify(selectedLines.map(({ key, quantity }) => ({ key, quantity, details: shop.details[key] }))));
      } catch { /* Guest cart stays on this device. */ }
    }
    onLogin();
  }

  function finishCheckout(id) {
    openTab("orders?" + new URLSearchParams({ id }));
  }

  async function toggleSaved(id) {
    if (customer) return social.change("/social/products/" + encodeURIComponent(id) + "/state", "PUT", { field: "saved", value: !saved.has(id) });
    setShop((previous) => ({
      ...previous,
      saved: previous.saved.includes(id) ? previous.saved.filter((item) => item !== id) : [...previous.saved, id],
    }));
    return true;
  }

  async function follow(store) {
    if (!store.id.startsWith("live-")) {
      try { toggleFollow(viewer, store.id); } catch (error) { setNotice(error.message); }
      return;
    }
    if (!customer) { onLogin(); return; }
    const following = !follows.has(store.id);
    const result = await social.change("/social/stores/" + encodeURIComponent(store.userId ?? store.id.slice(5)) + "/follow", "PUT", { following });
    if (result) setFollowerCounts((current) => ({ ...current, [store.id]: result.followers }));
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
        saved={saved.has(product.id)}
        canAdd={canAdd}
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
  const merchantPlan = identity.planName;
  const showMyStore = identity.accountType === "merchant" && identity.canManageLive;
  const canBecomeMerchant = !customer || identity.canUpgrade;
  const profileLinks = [
    { label: "Indipay Home", Icon: Home, tab: "home" },
    { label: "My Cart", Icon: ShoppingCart, tab: "cart", count: cartCount },
    { label: "My Wishlist", Icon: Heart, tab: "wishlist", count: saved.size },
    { label: "Following Stores", Icon: Store, tab: "following" },
    { label: "My Orders", Icon: Package, tab: "orders" },
    { label: "My Wallet", Icon: Wallet, tab: "wallet" },
    ...(identity.canManageLive ? [{ label: "Seller Dashboard", Icon: Store, tab: "seller" }] : []),
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
            <summary className="mp-profile-trigger" aria-label="Superstore profile">
              <span className="mp-profile-avatar"><UserRound size={19} aria-hidden="true" /></span>
              <ChevronDown className="mp-profile-chevron" size={13} aria-hidden="true" />
            </summary>
            <div className="mp-profile-panel">
              <div className="mp-profile-identity">
                <span className="mp-profile-avatar"><UserRound size={19} aria-hidden="true" /></span>
                <div>
                  <strong>{customer?.name || (customer ? "Indipay customer" : "Guest")}</strong>
                  <small>{identity.label}</small>
                  {!customer && <button type="button" className="mp-profile-signin" onClick={() => { closeProfile(); onLogin(); }}>Sign in</button>}
                </div>
              </div>
              <hr />
              {(showMyStore || canBecomeMerchant) && <button type="button" className="mp-profile-link store-menu-link" onClick={() => {
                if (showMyStore) openTab("my-store");
                else { closeProfile(); onOpenMerchantPlans(); }
              }}>
                {account?.store?.profile?.logo ? <img src={account.store.profile.logo} alt="" /> : <Store size={19} />}
                <span><strong>{showMyStore ? "My Store" : "Become a Merchant"}</strong>
                  <small>{showMyStore ? [identity.storeName, merchantPlan && merchantPlan + " plan"].filter(Boolean).join(" · ") || "Merchant management"
                    : "Explore merchant plans"}</small></span><ChevronRight size={15} />
              </button>}
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
          <div className="mp-brand">Indipay Superstore</div>
          <button type="button" className="mp-wallet" onClick={() => openTab("wallet")} aria-label={balanceVisible && balance !== null
            ? "Open Superstore Wallet. Available spending balance " + formatPaise(wallet.availablePaise) : "Open Superstore Wallet"}>
            <Wallet size={17} aria-hidden="true" />
            <span><small>Superstore balance</small><strong>{balance === null ? "—" : balanceVisible ? formatPaise(wallet.availablePaise) : "••••"}</strong></span>
          </button>
        </div>
      </header>
      <main className="mp-wrap mp-main">
        {error && activeTab !== "wallet" && !listingPage && !currentStore && <p role="alert">{error} <button type="button" disabled={refreshing} onClick={refreshCatalog}>Refresh Superstore</button></p>}
        {activeTab === "admin" && account?.role === "ADMIN" && <MarketplaceAdmin request={marketplaceRequest} onChange={async () => setRemote(await loadRemote())} money={money} />}
        {activeTab === "stores" && <StoreDirectory stores={stores} products={catalogProducts} discovery onVisit={openStore} />}
        {social.error && <p role="alert">{social.error}</p>}
        {activeTab === "following" && <FollowingFeed stores={stores} products={catalogProducts} follows={follows}
          feed={[...(social.data?.feed ?? []), ...(directory.posts ?? []).filter((post) => follows.has(post.storeId))]}
          onRefresh={social.refresh}
          liked={liked} saved={saved} onSave={toggleSaved} onLike={(id) => customer
            ? social.change("/social/products/" + encodeURIComponent(id) + "/state", "PUT", { field: "liked", value: !liked.has(id) })
            : onLogin()} onStore={openStore} onProduct={openProduct} busy={social.busy} money={money} signedIn={Boolean(customer)} onLogin={onLogin} />}
        {activeTab.startsWith("store/") && (currentStore ?
          <StoreProfile key={currentStore.id} store={currentStore}
            products={storeProducts} following={follows.has(currentStore.id)} followers={followerCount(currentStore)} followBusy={social.busy}
            onFollow={currentStore.id === "live-" + customer?.id ? undefined : () => follow(currentStore)}
            productListing={<StoreProductListing {...listingProps} products={storeProducts}
              storeId={currentStore.id} renderProduct={renderProduct} />}
            onSeeProducts={() => openListing({ scope: currentStore.id })} />
          : <section className="mp-panel"><h1>Store unavailable</h1>
            <p>This store is unavailable in this browser.</p>
            <button type="button" onClick={() => openTab("stores")}>Explore stores</button></section>)}
        {activeTab === "settings" && (
          <section className="mp-panel mp-settings" aria-labelledby="mp-settings-title">
            <h1 id="mp-settings-title">Settings</h1>
            {customer && social.data && <label className="mp-settings-row">
              <span>Notifications for new products, announcements and offers from followed stores</span>
              <input type="checkbox" checked={social.data.storeUpdates} disabled={social.busy} onChange={(event) =>
                social.change("/social/preferences", "PUT", { storeUpdates: event.target.checked })} />
            </label>}
            <div className="mp-settings-row">
              <Moon size={20} aria-hidden="true" />
              <div><strong>Dark mode</strong><p>Applies across Indipay.</p></div>
              <button type="button" role="switch" aria-label="Dark mode" aria-checked={darkMode} onClick={() => onThemeChange(!darkMode)}>
                {darkMode ? "On" : "Off"}
              </button>
            </div>
            {account?.role === "ADMIN" && <button type="button" onClick={() => openTab("admin")}>Superstore admin</button>}
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
            onAddMoney={() => onAddMoney(0, "wallet")}
            orders={orders} onOrder={(id) => openTab("orders?" + new URLSearchParams({ id }))} />
        )}
        {showMerchantDashboard && (
          identity.canManageLive && account
            ? <SellerDashboard shop={{
              store: { ...account.store?.profile, ...account.store },
              listings: (account.store?.products ?? []).map((item) => ({ ...item, variantOptions: item.variants })),
              orders: account.sellerOrders ?? [],
            }} storeId={"live-" + customer.id} subscriptionStatus={identity.subscriptionStatus} canPublish={identity.canPublish}
              followers={followerCount(storesById.get("live-" + customer.id))}
              onPublic={() => openStore("live-" + customer.id)} onPlans={onOpenMerchantPlans}
              action={sellerAction} orderAction={orderAction} selectedOrder={requestedId} money={money}
              onProduct={(item) => openTab(detailsRoute(item.id) + "&reviews=1")}
              renderAnnouncements={(listings) => <StoreAnnouncementEditor listings={listings}
                publish={(fields) => marketplaceRequest("/social/posts", "POST", fields)} />} />
            : <section className="mp-panel"><h1>Merchant Dashboard</h1>
              <p>{walletLoading ? "Loading merchant access…" : identity.canManageLive ? "Merchant information is unavailable." : "An approved Superstore seller account is required."}</p>
              {identity.canManageLive && !account && !walletLoading && <button type="button" onClick={refreshAccount}>Try again</button>}
              {!customer && !walletLoading && <button type="button" onClick={() => onLogin("merchant")}>Sign in to Indipay</button>}
            </section>
        )}
        {activeTab === "my-store" && !showMerchantDashboard && (
          <section className="mp-panel"><h1>My Store</h1>
            {walletLoading ? <p role="status">Checking merchant access…</p> : <>
              <p>{!customer ? "Sign in with your Indipay account to manage a store." : "Register a store and activate a subscription to publish products."}</p>
              {!customer && <button type="button" onClick={() => onLogin("merchant")}>Sign in to Indipay</button>}
              {canBecomeMerchant && <button type="button" onClick={onOpenMerchantPlans}>Become a Merchant</button>}
            </>}
          </section>
        )}
        {activeTab === "details" && (selected ? (
          <ProductDetails key={activeRoute} product={selected} initialVariant={requestedVariant}
            initialQuantity={Number.isSafeInteger(requestedQuantity) && requestedQuantity > 0 ? requestedQuantity : 1}
            money={money} balance={wallet.availablePaise} signedIn={Boolean(customer)} onEarn={openEarnMore}
            saved={saved.has(selected.id)} cart={shop.cart} cartCount={cartCount}
            store={selectedStore} storeProducts={selectedStoreProducts}
            following={follows.has(selected.storeId)}
            onFollow={selectedStore?.id === "live-" + customer?.id ? undefined : () => selectedStore && follow(selectedStore)} onStore={() => openStore(selected.storeId)}
            reviewAccess={{ signedIn: Boolean(customer), onLogin, canReply: identity.canPublish && selected.sellerId === customer?.id,
              alreadyReviewed: social.data?.reviewed.includes(selected.id),
              canReview: orders.some((order) => !isClosedOrder(order) && orderStage(order) === 6 && order.lines.some((line) => line.id === selected.id)),
              focus: routeParams.has("reviews") }}
            onBack={() => openTab(returnTab)} onCart={() => openTab("cart")} onSave={() => toggleSaved(selected.id)}
            onAdd={(offer, quantity) => changeQuantity(offer, quantity, true)}
            onBuy={(offer, quantity) => { if (validQuantity(quantity, offer)) openTab(buyNowRoute(offer, quantity)); }}
            recommendations={recommendations} renderProduct={renderProduct} />
        ) : (
          <section className="mp-panel">
            <h1>{!remote || refreshing ? "Loading product…" : "Product unavailable"}</h1>
            {!remote || refreshing ? <p role="status">Checking the Superstore catalog.</p>
              : <p>This product may have been removed or may belong to a store saved in another browser.</p>}
            <button type="button" onClick={() => openTab(returnTab)}>Browse products</button>
          </section>
        ))}
        {activeTab === "wishlist" && (
          <section className="mp-panel">
            <h1>Your wishlist</h1>
            {catalogProducts.some(({ id }) => saved.has(id)) ? <div className="mp-grid">{catalogProducts.filter(({ id }) => saved.has(id)).map((product) => renderProduct(product))}</div> : <p>Save a product using its heart icon.</p>}
            {[...saved].filter((id) => remote && !catalogProducts.some((item) => item.id === id)).map((id) =>
              <p key={id}>Unavailable saved product <button type="button" onClick={() => toggleSaved(id)}>Remove</button></p>)}
          </section>
        )}
        {activeTab === "cart" && <ShoppingCartPage lines={lines} selected={selectedLines} excluded={shop.excluded}
          loading={!remote || refreshing} onSelect={selectLines} onQuantity={changeQuantity} onRemove={removeLine}
          onProduct={openProduct} onCheckout={() => openTab("checkout")} onBrowse={openShop} />}
        {activeTab === "checkout" && <ShoppingCheckout key={activeRoute} lines={directCheckout
          ? checkoutOffer ? [{ ...checkoutOffer, quantity: requestedQuantity }] : []
          : selectedLines} customer={customer} availablePaise={wallet.availablePaise}
          draftKey={`indipay-checkout-draft:${viewer}:${activeRoute}`}
          onBack={() => openTab(directCheckout && checkoutProduct ? detailsRoute(checkoutProduct.id, requestedVariant, requestedQuantity) : "cart")}
          onLogin={loginToCheckout} onAddMoney={(required) => onAddMoney(required, activeRoute)}
          onComplete={finishCheckout} onPurchased={(purchase) => {
            if (!directCheckout) {
              setShop((previous) => {
                const cart = { ...previous.cart };
                const excluded = { ...previous.excluded };
                const details = { ...previous.details };
                for (const line of purchase.purchased) {
                  const key = itemKey(line.id, line.variantId);
                  if ((cart[key] ?? 0) > line.quantity) cart[key] -= line.quantity;
                  else { delete cart[key]; delete excluded[key]; delete details[key]; }
                }
                return { ...previous, cart, excluded, details };
              });
            }
            void refreshCatalog();
          }} refresh={refreshCatalog} />}
        {activeTab === "orders" && (
          <section className="mp-panel">
            <h1>{requestedId ? "Related order" : "Your orders"}</h1>
            {requestedId && <button type="button" onClick={() => openTab("orders")}>View all orders</button>}
            {walletError && <p role="alert">{walletError} <button type="button" onClick={refreshAccount}>Retry</button></p>}
            <OrderManagement key={requestedId || "all"} orders={visibleOrders} money={money}
              products={new Map(products.map((product) => [product.id, product]))} action={orderAction}
              empty={walletLoading ? "Loading orders…" : customer ? "No orders to display." : "Sign in to view your orders."} />
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
            <h1 className="mp-visually-hidden">Indipay Superstore</h1>
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
            <PublishedAdminContent channel="superstore" />
            <PublishedAdminContent channel="offers" />
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
            {(canBecomeMerchant || showMyStore) && (
              <section className="mp-seller-promo">
                <Store size={36} aria-hidden="true" />
                <div>
                  <h2>{showMyStore ? "My Store" : "Become a Merchant"}</h2>
                  <p>{showMyStore ? [identity.storeName, merchantPlan && merchantPlan + " plan"].filter(Boolean).join(" · ") || "Manage your Superstore listings and orders."
                    : "Choose a merchant plan and link a storefront to your Indipay account."}</p>
                  <div>
                    <button type="button" onClick={showMyStore ? () => openTab("my-store") : onOpenMerchantPlans}>{showMyStore ? "Open My Store" : "Explore Merchant Plans"}</button>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      {notice && <div className="mp-notice"><span role="status">{notice}</span><button type="button" onClick={() => openTab("cart")}>View cart</button><button type="button" onClick={() => setNotice("")}>Dismiss</button></div>}
      <nav className="mp-bottom-nav" aria-label="Superstore navigation">
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
