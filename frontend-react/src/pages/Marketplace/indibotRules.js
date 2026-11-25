const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const normalize = (value = "") => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

const categoryAliases = [
  ["Electronics", /\b(electronics?|gadgets?|tech)\b/],
  ["Fashion", /\b(fashion|clothes|clothing|apparel|footwear)\b/],
  ["Grocery", /\b(grocer(?:y|ies)|food)\b/],
  ["Beauty", /\b(beauty|skincare|skin care|cosmetics)\b/],
  ["Home & Living", /\b(home and living|home living|furniture|home decor)\b/],
  ["Accessories", /\b(accessories|accessory)\b/],
];

const ignored = new Set("a an all and are best buy can cheapest cost details do does for from get have here how i in is it its list looking me most much my of on one only or popular price product products recommend sell seller show tell that the their this top under up want what which with you your".split(" "));
const tokens = (value) => normalize(value).split(" ").filter((word) => word.length > 1 && !ignored.has(word));
const singular = (word) => word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word;
const matchesWord = (word, candidate) => singular(word) === singular(candidate);

function readBudget(question) {
  const match = question.match(/\b(under|below|less than|at most|up to|within|max(?:imum)?(?: of)?|budget(?: of| is|:)?)(?:\s+|\s*:\s*)(?:₹\s*|rs\.?\s*|inr\s*)?([\d,]+(?:\.\d+)?)\s*(k|lakhs?|lacs?|l)?\b/i)
    ?? question.match(/(?:₹\s*|\brs\.?\s*|\binr\s*)([\d,]+(?:\.\d+)?)\s*(k|lakhs?|lacs?|l)?\b/i);
  if (!match) return null;
  const [, prefix, number, unit] = match.length === 4 ? match : [match[0], "", match[1], match[2]];
  const multiplier = unit ? (unit.toLowerCase() === "k" ? 1000 : 100000) : 1;
  const limit = Number(number.replaceAll(",", "")) * multiplier;
  return Number.isFinite(limit) ? { limit, exclusive: /^(under|below|less than)$/i.test(prefix) } : null;
}

function describeProduct(product) {
  const parts = [
    `${product.name} costs ${rupees.format(product.price)}${product.seller ? ` from ${product.seller}` : ""}.`,
    product.description,
    product.original > product.price ? `Savings: ${rupees.format(product.original - product.price)}.` : "",
    Number.isFinite(product.rating) ? `Rated ${product.rating.toFixed(1)} out of 5.` : "",
    product.sample ? "This is a sample listing for browsing." : Number.isInteger(product.stock)
      ? (product.stock > 0 ? `${product.stock} in stock.` : "Currently out of stock.") : "",
  ];
  return parts.filter(Boolean).join(" ");
}

function result(text, products = [], tab) {
  return { text, products, tab };
}

export function answerIndibot(question, catalog, previousProductId) {
  const query = normalize(question);
  const previous = catalog.find((product) => product.id === previousProductId);
  const budget = readBudget(question);
  const category = categoryAliases.find(([, aliases]) => aliases.test(query))?.[0];
  const words = tokens(question);
  const fullNameMatch = catalog.find((product) => normalize(product.name) && ` ${query} `.includes(` ${normalize(product.name)} `));
  const popular = /\b(popular|trending|bestseller|best seller|most sold|most bought)\b/.test(query);
  const cheapest = /\b(cheapest|lowest price|most affordable|least expensive)\b/.test(query);
  const recommend = popular || cheapest || /\b(best(?! sellers?\b)|top|recommend(?:ation|ations)?|suggest|highest rated|deals?)\b/.test(query);
  const productQuestion = /\b(details?|price|cost|stock|available|availability|rating|reviews?|seller|discount|description|how much|tell me)\b/.test(query);
  const followUp = /\b(it|its|that one|this one|that product|this product)\b/.test(query);

  if (/\b(under|below|less than|budget|up to|within)\s+(?:₹|rs\.?\s*|inr\s*)?\d/i.test(question) && !budget) {
    return result("Try a budget like “under ₹10,000” or “up to 5k”.");
  }

  if (fullNameMatch && !budget && !recommend) return result(describeProduct(fullNameMatch), [fullNameMatch]);
  if (previous && followUp && productQuestion && !budget && !recommend) return result(describeProduct(previous), [previous]);

  const supportRules = [
    [/\b(seller login|seller registration|register as a seller|list my products?|sell on|publish|business verification|seller approval)\b/, "Use Register as a Marketplace User or Seller Login in the seller section on Marketplace Home. Demo registrations start as pending verification. Publishing through the existing seller dashboard requires seller approval.", "shop"],
    [/\b(refunds?|returns?|cancel(?:lation)?|money back)\b/, "Open Orders to identify the purchase. A Marketplace admin can issue a refund back to your Marketplace wallet. IndiBot can explain the process and show Orders.", "orders"],
    [/\b(track(?:ing)?|delivery status|shipping status|my orders?|order history|where is my order)\b/, "Sign in and open Orders, then choose Track order for the latest status. Delivery can move through Confirmed, Packed, Shipped, and Delivered.", "orders"],
    [/\b(wallet|balance|credits?|payment|pay|checkout)\b/, "Checkout uses your Marketplace wallet. Sign in to check your available balance and recent activity. You can check out items from one seller per order.", "wallet"],
    [/\b(wishlist|wish list|saved items?|favorites?)\b/, "Tap the heart on a product to save it. Open Wishlist from the profile dropdown to view your saved products.", "wishlist"],
    [/\b(cart|basket|quantit(?:y|ies))\b/, "Add an available product to your cart, then open Cart in the profile dropdown. You can adjust quantities and review the total before checkout.", "cart"],
    [/\b(categories|browse all|all products|shopping categories)\b/, "Browse Electronics, Fashion, Grocery, Beauty, Home & Living, and Accessories. Choose a category or search by product or seller name.", "categories"],
  ];
  if (!budget && !recommend) {
    const support = supportRules.find(([pattern]) => pattern.test(query));
    if (support) return result(support[1], [], support[2]);
  }

  const matches = catalog.map((product) => {
    const nameWords = tokens(product.name);
    const sellerWords = tokens(product.seller);
    const descriptionWords = tokens(product.description ?? "");
    const score = words.reduce((total, word) => total + (
      nameWords.some((candidate) => matchesWord(word, candidate)) ? 4
        : sellerWords.some((candidate) => matchesWord(word, candidate)) ? 3
          : descriptionWords.some((candidate) => matchesWord(word, candidate)) ? 1 : 0
    ), fullNameMatch?.id === product.id ? 100 : 0);
    return { product, score };
  });
  const scope = matches.filter(({ product }) => !category || product.category === category);
  const matched = scope.filter(({ score }) => score > 0);
  const hasNamedTarget = /\b(headphones?|earbuds?|cameras?|sneakers?|shoes?|coffee|serum|chairs?|watches?|daypacks?|backpacks?|lamps?|laptops?|phones?|mobiles?|sofas?|tablets?)\b/.test(query);
  if (!matched.length && (hasNamedTarget || (!category && !budget && !recommend && productQuestion))) {
    return result("I couldn’t find a matching product in the current catalog. Try its full name or a category like Electronics.", [], "categories");
  }
  if (!budget && !recommend && !category && matched.length) {
    const ranked = matched.sort((a, b) => b.score - a.score);
    if (ranked.length === 1 || ranked[0].score > ranked[1].score) return result(describeProduct(ranked[0].product), [ranked[0].product]);
    return result("I found a few matches. Which one are you looking for?", ranked.slice(0, 4).map(({ product }) => product));
  }
  if (budget || recommend || category) {
    const pool = (matched.length ? matched : scope).map(({ product }) => product);
    const eligible = pool.filter((product) => product.stock !== 0 && (!budget || (
      budget.exclusive ? product.price < budget.limit : product.price <= budget.limit
    )));
    const range = budget ? ` ${budget.exclusive ? "under" : "up to"} ${rupees.format(budget.limit)}` : "";
    if (!eligible.length) return result(`I couldn’t find an available match${range}${category ? ` in ${category}` : ""}. Try another category or budget.`, [], "categories");
    const trending = popular && eligible.some(({ section }) => section === "Trending");
    const topRated = eligible.some(({ rating }) => Number.isFinite(rating));
    eligible.sort((a, b) => {
      if (cheapest) return a.price - b.price;
      if (trending && (a.section === "Trending") !== (b.section === "Trending")) return a.section === "Trending" ? -1 : 1;
      return (b.rating ?? 0) - (a.rating ?? 0) || a.price - b.price;
    });
    const basis = cheapest ? "Lowest-priced" : trending ? "Trending" : topRated ? "Highest-rated" : "Lowest-priced";
    const salesNote = popular ? " I don’t have sales counts, so this uses the catalog’s available signals." : "";
    return result(`${basis} match${range}: ${describeProduct(eligible[0])}${salesNote}`, eligible.slice(0, 3));
  }

  if (/^(hi|hello|hey|help|what can you do)[!. ]*$/.test(query)) {
    return result("Hi! Ask me about products, prices, stock, popular picks, budgets, orders, or becoming a seller.");
  }
  return result("I can help with the Marketplace catalog and shopping. Try “What’s popular?”, “Best product under 10k”, or the name of a product.");
}
