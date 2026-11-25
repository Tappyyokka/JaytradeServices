export const sortOptions = {
  relevance: "Relevance",
  priceAsc: "Price: Low to High",
  priceDesc: "Price: High to Low",
  popular: "Popularity",
  rated: "Highest Rated",
  newest: "Newest Arrivals",
  discount: "Highest Discount",
};

export const collectionNames = {
  flash: "Flash Deals",
  trending: "Trending Products",
  new: "New Arrivals",
  recommended: "Recommended for You",
  recent: "Recently Viewed",
};

const filterKeys = ["category", "min", "max", "budget", "brand", "store", "rating", "discount", "availability", "verified", "affordable"];
const numericKeys = new Set(["min", "max", "budget", "rating", "discount"]);
const booleanKeys = new Set(["verified", "affordable"]);

// Keep the query and collection context when clearing filters.
export function clearFilters(params) {
  return Object.fromEntries(Object.entries(params).filter(([key]) => !filterKeys.includes(key)));
}

export function readProductParams(search = "") {
  const parsed = new URLSearchParams(search);
  const params = {};
  for (const key of ["q", "scope", "collection", "sort", ...filterKeys]) {
    const value = parsed.get(key)?.trim().slice(0, 120);
    if (!value) continue;
    if (numericKeys.has(key) && (!/^\d+(\.\d+)?$/.test(value) || !Number.isFinite(Number(value)))) continue;
    if (booleanKeys.has(key) && value !== "1") continue;
    if (key === "sort" && !Object.hasOwn(sortOptions, value)) continue;
    if (key === "collection" && !Object.hasOwn(collectionNames, value)) continue;
    if (key === "availability" && !["in", "out"].includes(value)) continue;
    params[key] = value;
  }
  return params;
}

export function productRoute(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, value);
  }
  const search = query.toString();
  return search ? "products?" + search : "products";
}

function terms(value) {
  return (value ?? "").toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "").match(/[\p{L}\p{N}]+/gu) ?? [];
}

function matchesTerm(word, candidate) {
  return candidate.includes(word) || (word.length > 3 && word.endsWith("s") && candidate === word.slice(0, -1));
}

export function matchScore(product, query) {
  const words = terms(query);
  if (!words.length) return 0;
  const name = terms(product.name);
  const labels = terms([product.brand, product.category, product.seller].filter(Boolean).join(" "));
  const description = terms([product.description, product.keywords?.join(" ")].filter(Boolean).join(" "));
  let score = 0;
  for (const word of words) {
    if (name.some((candidate) => matchesTerm(word, candidate))) score += 5;
    else if (labels.some((candidate) => matchesTerm(word, candidate))) score += 3;
    else if (description.some((candidate) => matchesTerm(word, candidate))) score += 1;
    else return -1;
  }
  return score + (name.join(" ").includes(words.join(" ")) ? 8 : 0);
}

export function discountPercent(product) {
  return product.original > product.price ? Math.round((product.original - product.price) * 100 / product.original) : 0;
}

function newestValue(product) {
  return Date.parse(product.createdAt) || 0;
}

export function discoverProducts(products, params, balance) {
  const scored = [];
  for (const product of products) {
    if (params.scope && product.storeId !== params.scope) continue;
    if (params.category && product.category !== params.category) continue;
    if (params.brand && product.brand !== params.brand) continue;
    if (params.store && product.storeId !== params.store) continue;
    if (params.min !== undefined && product.price < Number(params.min)) continue;
    if (params.max !== undefined && product.price > Number(params.max)) continue;
    if (params.budget !== undefined && product.price >= Number(params.budget)) continue;
    if (params.rating && (product.rating ?? 0) < Number(params.rating)) continue;
    if (params.discount && discountPercent(product) < Number(params.discount)) continue;
    if (params.availability === "in" && !(product.stock > 0)) continue;
    if (params.availability === "out" && product.stock !== 0) continue;
    if (params.verified && !product.verified) continue;
    if (params.affordable && (!Number.isFinite(balance) || product.price > balance)) continue;
    const score = matchScore(product, params.q);
    if (score >= 0) scored.push({ product, score });
  }

  const comparisons = {
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    popular: (a, b) => (b.popularity ?? -1) - (a.popularity ?? -1),
    rated: (a, b) => (b.rating ?? -1) - (a.rating ?? -1),
    newest: (a, b) => newestValue(b) - newestValue(a),
    discount: (a, b) => discountPercent(b) - discountPercent(a),
  };
  const compare = Object.hasOwn(comparisons, params.sort) ? comparisons[params.sort] : null;
  return scored.sort((a, b) => compare?.(a.product, b.product) || b.score - a.score).map(({ product }) => product);
}

export function findStores(stores, query) {
  const words = terms(query);
  return stores.filter((store) => {
    const name = terms(store.name);
    return words.every((word) => name.some((candidate) => matchesTerm(word, candidate)));
  });
}

export function filterChips(params, money, stores) {
  const labels = {
    category: (value) => value,
    min: (value) => "From " + money.format(value),
    max: (value) => "Up to " + money.format(value),
    budget: (value) => "Under " + money.format(value),
    brand: (value) => value,
    store: (value) => stores.find((store) => store.id === value)?.name ?? "Selected store",
    rating: (value) => value + "+ stars",
    discount: (value) => value + "%+ off",
    availability: (value) => value === "in" ? "In stock" : "Out of stock",
    verified: () => "Verified sellers",
    affordable: () => "Within my balance",
  };
  return filterKeys.filter((key) => params[key]).map((key) => ({ key, label: labels[key](params[key]) }));
}
