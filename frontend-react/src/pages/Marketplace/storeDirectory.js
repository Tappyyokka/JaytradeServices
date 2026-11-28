import { products as samples } from "./marketplaceData.js";

const directoryKey = "indipay-demo-stores-v1";

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");


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
  if (event.key === directoryKey || event.key === null) {
    directory = undefined;
    notify();
  }
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

export function toggleFollow(viewer, storeId) {
  update((data) => {
    const following = data.follows[viewer] || [];
    const next = following.includes(storeId) ? following.filter((id) => id !== storeId) : [...following, storeId];
    return { ...data, follows: { ...data.follows, [viewer]: next } };
  });
}
