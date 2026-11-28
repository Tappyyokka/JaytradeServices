export const categories = ["All Products", "Electronics", "Fashion", "Grocery", "Beauty", "Home & Living", "Accessories"];
export const demoBalance = 2450;
export const orderStages = ["Order Placed", "Order Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"];
const defaultStage = [1, 3, 4, 6];

export function orderStage(order) {
  return order.management?.stage ?? (order.checkoutDetails?.demo && order.sellerStage === 0 ? 0 : defaultStage[order.sellerStage] ?? 0);
}

export function isClosedOrder(order) {
  return order.refunded || order.management?.request?.status === "approved";
}

const catalog = [
  ["Wireless over-ear headphones", "Soundcraft Studio", "Electronics", 899, 1499, 4.5, "1505740420928-5e560c06d30e", "🎧", "Trending"],
  ["Everyday cotton sneakers", "Stride Co.", "Fashion", 1299, 1899, 4.4, "1542291026-7eec264c27ff", "👟", "Trending"],
  ["Small-batch roasted coffee", "Hill Roast", "Grocery", 449, 599, 4.7, "1447933601403-0c6688de566e", "☕", "Trending"],
  ["Botanical facial serum", "Root & Bloom", "Beauty", 649, 899, 4.3, "1608248543803-ba4f8c70ae0b", "🧴", "Featured"],
  ["Nordic accent chair", "Oakline Home", "Home & Living", 3999, 4999, 4.6, "1503602642458-232111445657", "🪑", "Featured"],
  ["Classic everyday watch", "Minute House", "Accessories", 1099, 1599, 4.4, "1523275335684-37898b6baf30", "⌚", "Featured"],
  ["Compact camera", "Frame Supply", "Electronics", 5999, 7499, 4.5, "1516035069371-29a1b244cc32", "📷", "Recommended"],
  ["Canvas daypack", "Carrywell", "Accessories", 799, 1099, 4.6, "1553062407-98eeb64c6a62", "🎒", "Recommended"],
  ["Minimal reading lamp", "Oakline Home", "Home & Living", 1199, 1699, 4.4, "1507473885765-e6ed057f782c", "💡", "Recommended"],
];

export const products = catalog.map(([name, seller, category, price, original, rating, photo, icon, section]) => ({
  name, seller, category, price, original, rating, icon, section,
  image: `https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=640&q=75`,
}));

const coffee = products.find(({ seller }) => seller === "Hill Roast");

export const budgetPreviews = [
  { id: "preview-coffee-sampler", name: "Roasted coffee sampler", price: 89, original: 119 },
  { id: "preview-coffee-duo", name: "Roasted coffee sampler duo", price: 249, original: 299 },
].map((preview) => ({
  seller: coffee.seller, category: coffee.category, image: coffee.image, icon: coffee.icon,
  demo: true, sample: true, ...preview,
}));

export const promotionalBanners = [
  {
    category: "Electronics",
    title: "Upgrade your everyday tech",
    description: "Find offers on gadgets and audio.",
    image: products[0].image,
  },
  {
    category: "Fashion",
    title: "Easy everyday style",
    description: "Explore offers on wardrobe essentials.",
    image: products[1].image,
  },
  {
    category: "Home & Living",
    title: "Refresh your favourite room",
    description: "Find offers on furniture and lighting.",
    image: products[4].image,
  },
];

export const flashDealProgress = new Map([
  ["Wireless over-ear headphones", 72],
  ["Everyday cotton sneakers", 58],
  ["Small-batch roasted coffee", 84],
  ["Botanical facial serum", 43],
  ["Minimal reading lamp", 65],
]);

export const shoppingBudgets = [99, 299, 499, 999];

// Discovery attributes for the sample listings, including browsers with older saved copies.
export const sampleDiscovery = new Map([
  ["Wireless over-ear headphones", { brand: "Soundcraft", popularity: 92, keywords: ["audio", "bluetooth", "headset"] }],
  ["Everyday cotton sneakers", { brand: "Stride", popularity: 74, keywords: ["shoes", "trainers", "footwear"] }],
  ["Small-batch roasted coffee", { brand: "Hill Roast", popularity: 87, keywords: ["beans", "brewing", "coffee"] }],
  ["Botanical facial serum", { brand: "Root & Bloom", popularity: 58, keywords: ["skin care", "face", "beauty"], createdAt: "2026-11-19" }],
  ["Nordic accent chair", { brand: "Oakline", popularity: 69, keywords: ["furniture", "seating", "living room"], createdAt: "2026-11-21" }],
  ["Classic everyday watch", { brand: "Minute House", popularity: 63, keywords: ["wristwatch", "timepiece"], createdAt: "2026-11-23" }],
  ["Compact camera", { brand: "Frame Supply", popularity: 41, keywords: ["photography", "digital camera"] }],
  ["Canvas daypack", { brand: "Carrywell", popularity: 56, keywords: ["bag", "backpack", "travel"] }],
  ["Minimal reading lamp", { brand: "Oakline", popularity: 52, keywords: ["lighting", "desk lamp", "study"] }],
]);
