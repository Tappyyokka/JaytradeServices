import { products as samples } from "./marketplaceData.js";
import { subscriptionPlans } from "./subscriptionPlans.js";

const directoryKey = "indipay-demo-stores-v1";
const sessionKey = "indipay-demo-store-selection";
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
export const sampleAccounts = {
  "approved@example.test": "soundcraft-studio",
  "pending@example.test": "stride-co",
  "rejected@example.test": "hill-roast",
};

function seedDirectory() {
  const stores = [];
  const products = samples.map((item) => {
    const username = slug(item.seller);
    const storeId = "sample-" + username;
    if (!stores.some((store) => store.id === storeId)) {
      const status = username === "hill-roast" ? "rejected" : username === "stride-co" ? "pending" : "approved";
      stores.push({ id: storeId, username, name: item.seller, category: item.category,
        description: `Explore the ${item.category.toLowerCase()} collection from ${item.seller}.`,
        plan: username === "soundcraft-studio" ? "business" : "starter", status, cover: item.image, logo: "",
        ownerId: null, followers: 0, address: "Kozhikode, Kerala", email: username + "@example.test", mobile: "", owner: item.seller + " team" });
    }
    return { ...item, id: item.name, storeId, stock: 10, available: true, images: [item.image], variants: "" };
  });
  return { stores, products, follows: {} };
}

let directory;
function readDirectory() {
  const raw = localStorage.getItem(directoryKey);
  if (!raw) return seedDirectory();
  const data = JSON.parse(raw);
  if (!Array.isArray(data.stores) || !Array.isArray(data.products) || !data.follows) throw new Error("Store data could not be read.");
  return data;
}

export function getDirectory() {
  if (!directory) {
    try { directory = readDirectory(); } catch { directory = seedDirectory(); }
  }
  return directory;
}

const listeners = new Set();
function notify() { listeners.forEach((listener) => listener()); }
function sync(event) {
  if (event.key === directoryKey || event.key === null) directory = undefined;
  if ([directoryKey, sessionKey, null].includes(event.key)) notify();
}
export function subscribeStores(listener) {
  if (!listeners.size) window.addEventListener("storage", sync);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", sync);
  };
}

function update(change) {
  const next = change(readDirectory());
  try { localStorage.setItem(directoryKey, JSON.stringify(next)); }
  catch { throw new Error("Changes could not be saved in this browser. Try smaller images or free up browser storage."); }
  directory = next;
  notify();
}

export function endStoreSession() {
  sessionStorage.removeItem(sessionKey);
  localStorage.removeItem(sessionKey);
  notify();
}

export function selectStore(store, customer, remember = false) {
  if (store.ownerId != null && store.ownerId !== customer?.id) throw new Error("Sign in to the Indipay account that owns this store.");
  const existing = customer && getDirectory().stores.find((item) => item.ownerId === customer.id);
  if (existing && existing.id !== store.id) throw new Error("Your Indipay account already has a store.");
  endStoreSession();
  (remember ? localStorage : sessionStorage).setItem(sessionKey, JSON.stringify({ id: store.id, customerId: customer?.id ?? null }));
  notify();
}

export function ownedStore(customer, data = getDirectory()) {
  const linked = customer && data.stores.find((store) => store.ownerId === customer.id);
  if (linked) return linked;
  try {
    const selected = JSON.parse(sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey));
    if (selected && selected.customerId === (customer?.id ?? null)) {
      return data.stores.find((store) => store.id === selected.id && store.ownerId == null);
    }
  } catch { /* No demo selection in this browser. */ }
  return null;
}

function requireOwner(data, customer, storeId) {
  const store = ownedStore(customer, data);
  if (!store || store.id !== storeId) throw new Error("Open My Store with the account that owns this listing.");
  return store;
}

function validateStore(data, profile, id) {
  if (!/^[a-z0-9][a-z0-9_-]{2,29}$/.test(profile.username)) throw new Error("Use 3–30 lowercase letters, numbers, hyphens or underscores for your store username.");
  if (data.stores.some((store) => store.id !== id && store.username === profile.username)) throw new Error("That store username is already taken.");
  if ((Object.hasOwn(sampleAccounts, profile.email) && id !== "sample-" + sampleAccounts[profile.email]) || data.stores.some((store) => store.id !== id && (store.email === profile.email || store.mobile === profile.mobile))) throw new Error("That email or mobile number already belongs to a demo store.");
}

export function registerStore(customer, details, plan) {
  const store = { ...details, plan, id: "store-" + crypto.randomUUID(), ownerId: customer?.id ?? null,
    status: "pending", logo: "", cover: "", followers: 0 };
  update((data) => {
    if (ownedStore(customer, data)) throw new Error("You already have a store. Open My Store in the marketplace.");
    if (!Object.hasOwn(subscriptionPlans, plan)) throw new Error("Choose a plan first.");
    validateStore(data, store);
    return { ...data, stores: [...data.stores, store] };
  });
  selectStore(store, customer);
}

export function editStore(customer, id, changes) {
  update((data) => {
    const store = requireOwner(data, customer, id);
    const profile = { ...store, ...changes };
    validateStore(data, profile, id);
    return { ...data, stores: data.stores.map((item) => item.id === id ? profile : item) };
  });
}

export function saveProduct(customer, storeId, id, details) {
  update((data) => {
    const store = requireOwner(data, customer, storeId);
    if (store.status === "rejected") throw new Error("Publishing is unavailable for this store.");
    const listings = data.products.filter((item) => item.storeId === storeId);
    if (id && !listings.some((item) => item.id === id)) throw new Error("This listing is no longer available.");
    if (!id && listings.length >= subscriptionPlans[store.plan].limit) throw new Error("Your plan’s listing limit has been reached.");
    const previous = listings.find((item) => item.id === id);
    const product = { section: "Featured", icon: "📦", ...previous, ...details, storeId, id: id || "demo-" + crypto.randomUUID() };
    if (!id) product.createdAt = new Date().toISOString();
    return { ...data, products: id ? data.products.map((item) => item.id === id ? product : item) : [...data.products, product] };
  });
}

export function removeProduct(customer, storeId, id) {
  update((data) => {
    requireOwner(data, customer, storeId);
    return { ...data, products: data.products.filter((item) => item.storeId !== storeId || item.id !== id) };
  });
}

export function toggleFollow(viewer, storeId) {
  update((data) => {
    const following = data.follows[viewer] || [];
    const next = following.includes(storeId) ? following.filter((id) => id !== storeId) : [...following, storeId];
    return { ...data, follows: { ...data.follows, [viewer]: next } };
  });
}
