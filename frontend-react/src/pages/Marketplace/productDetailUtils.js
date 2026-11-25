const variantPrefix = "variant:";

export function itemKey(productId, variantId) {
  return variantId ? variantPrefix + JSON.stringify([productId, variantId]) : productId;
}

export function itemIds(key) {
  if (!key.startsWith(variantPrefix)) return [key, null];
  try {
    const ids = JSON.parse(key.slice(variantPrefix.length));
    if (Array.isArray(ids) && ids.length === 2 && ids.every((id) => typeof id === "string")) return ids;
  } catch { /* Ignore an invalid saved cart key. */ }
  return [];
}

export function productImages(product, variant) {
  if (variant?.images?.length) return variant.images;
  return [...new Set([...(product.images ?? []), product.image].filter(Boolean))];
}

export function productOffer(product, variantId) {
  const options = product.variantOptions ?? [];
  const variant = options.find((option) => option.id === variantId);
  const needsVariant = options.length > 0 && !variant;
  const price = variant?.price ?? product.price;
  const original = variant?.original ?? Math.max(price, product.original ?? price);
  const stock = product.sample || product.available === false || needsVariant || (variantId && !variant)
    ? 0 : (variant?.stock ?? product.inventoryStock ?? product.stock ?? 0);

  return {
    ...product, price, original, stock, variantId: variantId ?? null,
    variantName: variant ? Object.values(variant.attributes).join(" · ") : "",
    key: itemKey(product.id, variantId), needsVariant,
    quantityLimit: Math.min(100, stock),
  };
}

export function validQuantity(quantity, offer, alreadyInCart = 0) {
  return Number.isSafeInteger(quantity) && quantity >= 1 && quantity + alreadyInCart <= offer.quantityLimit;
}

export function cartLines(cart, products) {
  const byId = new Map(products.map((product) => [product.id, product]));
  return Object.entries(cart).flatMap(([key, quantity]) => {
    const [productId, variantId] = itemIds(key);
    const product = byId.get(productId);
    if (!product || !Number.isSafeInteger(quantity) || quantity < 1) return [];
    return [{ ...productOffer(product, variantId), quantity }];
  });
}

export function detailsRoute(id, variantId, quantity) {
  const params = new URLSearchParams({ id });
  if (variantId) params.set("variant", variantId);
  if (quantity) params.set("quantity", quantity);
  return "details?" + params;
}

export function buyNowRoute(offer, quantity) {
  const params = new URLSearchParams({ id: offer.id, quantity });
  if (offer.variantId) params.set("variant", offer.variantId);
  return "checkout?" + params;
}

export function parseDetailPairs(text, label, max = 16) {
  const entries = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const used = new Set();
  if (entries.length > max) throw new Error("Enter up to " + max + " " + label.toLowerCase() + ".");
  return entries.map((entry) => {
    const separator = entry.indexOf(":");
    const name = entry.slice(0, separator).trim();
    const value = entry.slice(separator + 1).trim();
    if (separator < 1 || !name || !value) throw new Error(label + " must use Name: value on each line.");
    const key = name.toLowerCase();
    if (used.has(key)) throw new Error(label + " must use unique names.");
    used.add(key);
    return { name, value };
  });
}

export function variantAttributes(options) {
  return Object.keys(options[0]?.attributes ?? {});
}

export function storeRating(products) {
  const rated = products.filter((product) => Number.isFinite(product.rating));
  return rated.length ? (rated.reduce((sum, product) => sum + product.rating, 0) / rated.length).toFixed(1) : "Unrated";
}
