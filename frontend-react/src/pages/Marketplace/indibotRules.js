import { indibotCopy } from "./indibotTranslations.js";

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

// Translate recognized Malayalam phrases into the same intents used by the catalog rules.
function adaptMalayalam(question) {
  if (!/[\u0D00-\u0D7F]/u.test(question)) return question;
  return question.normalize("NFC")
    .replace(/[൦-൯]/gu, (digit) => String(digit.codePointAt(0) - 0x0D66))
    .replace(/പതിനായിരം|പതിനായിരത്തിന്|പതിനായിരത്തിൽ/gu, "10000")
    .replace(/([\d,.]+)\s*(?:ആയിരം|ആയിരത്തിന്|ആയിരത്തിൽ)/gu, "$1k")
    .replace(/([\d,.]+)\s*(?:ലക്ഷം|ലക്ഷത്തിന്|ലക്ഷത്തിൽ)/gu, "$1l")
    .replace(/(?:₹\s*)?([\d,]+(?:\.\d+)?\s*[kl]?)\s*(?:രൂപ[\p{L}\p{M}]*)?\s*(?:[-–]?\s*ൽ|ത്തിന്)?\s*(താഴെ|താഴെയുള്ള|കുറവുള്ള|കുറവ്|വരെ)/gu,
      (_, amount, qualifier) => (qualifier === "വരെ" ? " up to " : " under ") + amount.trim() + " ")
    .replace(/([\d,]+(?:\.\d+)?\s*[kl]?)\s*രൂപ[\p{L}\p{M}]*/gu, " ₹$1 ")
    .replace(/ജനപ്രിയ[\p{L}\p{M}]*|പ്രശസ്ത[\p{L}\p{M}]*|ട്രെൻഡിംഗ്/gu, " popular ")
    .replace(/കുറഞ്ഞ വില|ഏറ്റവും വിലക്കുറവുള്ള/gu, " cheapest ")
    .replace(/മികച്ച|നല്ലത്|ശുപാർശ|നിർദ്ദേശിക്കൂ/gu, " best ")
    .replace(/വ്യാപാരി|വ്യാപാരിയാകാൻ|മെർച്ചന്റ്|വിൽപ്പനക്കാരനാകാൻ|വിൽക്കാൻ/gu, " become a merchant ")
    .replace(/റീഫണ്ട്|തിരികെ നൽകാൻ|പണം തിരികെ|റദ്ദാക്കാൻ/gu, " refund ")
    .replace(/ട്രാക്ക്|ഡെലിവറി സ്റ്റാറ്റസ്|ഓർഡറിന്റെ നില|ഓർഡർ എവിടെ/gu, " track ")
    .replace(/ഓർഡർ[\p{L}\p{M}]*|ഓർഡറുകൾ/gu, " my orders ")
    .replace(/വാലറ്റ്|വാലറ്റിൽ|ബാലൻസ്|പേയ്മെന്റ്|പണം അടയ്ക്കാൻ|ചെക്കൗട്ട്/gu, " wallet ")
    .replace(/വിഷ്‌ലിസ്റ്റ്|വിഷ്ലിസ്റ്റ്|വിഷ് ലിസ്റ്റ്|ഇഷ്ടപ്പെട്ടവ/gu, " wishlist ")
    .replace(/കാർട്ട്|കാർട്ടിൽ|കാർട്ടിലെ|ബാസ്കറ്റ്/gu, " cart ")
    .replace(/വിഭാഗങ്ങൾ|എല്ലാ ഉൽപ്പന്നങ്ങളും/gu, " categories ")
    .replace(/ഇലക്ട്രോണിക്സ്|ഗാഡ്‌ജറ്റുകൾ/gu, " electronics ")
    .replace(/ഫാഷൻ|വസ്ത്രങ്ങൾ/gu, " fashion ")
    .replace(/പലചരക്ക്|ഗ്രോസറി/gu, " grocery ")
    .replace(/സൗന്ദര്യവർധക|ബ്യൂട്ടി/gu, " beauty ")
    .replace(/വീട്ടുപകരണങ്ങൾ|ഫർണിച്ചർ/gu, " furniture ")
    .replace(/ആക്സസറികൾ|ആക്‌സസറികൾ/gu, " accessories ")
    .replace(/ഹെഡ്‌ഫോൺ|ഹെഡ്ഫോൺ|ഹെഡ് ഫോൺ/gu, " headphones ")
    .replace(/കാപ്പി|കോഫി/gu, " coffee ")
    .replace(/ക്യാമറ/gu, " camera ")
    .replace(/കസേര/gu, " chair ")
    .replace(/ഷൂസ്|സ്നീക്കർ/gu, " sneakers ")
    .replace(/സീറം/gu, " serum ")
    .replace(/വാച്ച്/gu, " watch ")
    .replace(/ബാഗ്/gu, " bag ")
    .replace(/ലാമ്പ്|വിളക്ക്/gu, " lamp ")
    .replace(/ഫോൺ|മൊബൈൽ/gu, " phone ")
    .replace(/സ്റ്റോക്ക്|ലഭ്യമാണോ|ലഭ്യത/gu, " available ")
    .replace(/വില|എത്ര/gu, " price ")
    .replace(/റേറ്റിംഗ്|അവലോകനം/gu, " rating ")
    .replace(/ഇതിന്റെ|അതിന്റെ|ഇതിന്|അതിന്|ഈ ഉൽപ്പന്നം/gu, " it ")
    .replace(/നമസ്കാരം|ഹലോ|ഹായ്|സഹായം/gu, " hello ");
}

function describeProduct(product, copy) {
  const parts = [
    copy.price(product.name, rupees.format(product.price), product.seller),
    product.description,
    product.original > product.price ? copy.savings(rupees.format(product.original - product.price)) : "",
    Number.isFinite(product.rating) ? copy.rating(product.rating.toFixed(1)) : "",
    product.sample ? copy.sample : Number.isInteger(product.stock)
      ? (product.stock > 0 ? copy.stock(product.stock) : copy.noStock) : "",
  ];
  return parts.filter(Boolean).join(" ");
}

function result(text, products = [], tab) {
  return { text, products, tab };
}

export function answerIndibot(question, catalog, previousProductId, language = "en") {
  const copy = indibotCopy[language] ?? indibotCopy.en;
  question = adaptMalayalam(question);
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
    return result(copy.budgetHint);
  }

  if (fullNameMatch && !budget && !recommend) return result(describeProduct(fullNameMatch, copy), [fullNameMatch]);
  if (previous && followUp && productQuestion && !budget && !recommend) return result(describeProduct(previous, copy), [previous]);

  const supportRules = [
    [/\b(merchant login|merchant plans?|merchant registration|become a merchant|seller login|seller registration|register as a seller|list my products?|sell on|publish|business verification|seller approval)\b/, copy.support.merchant, "shop"],
    [/\b(refunds?|returns?|cancel(?:lation)?|money back)\b/, copy.support.refund, "orders"],
    [/\b(track(?:ing)?|delivery status|shipping status|my orders?|order history|where is my order)\b/, copy.support.orders, "orders"],
    [/\b(wallet|balance|credits?|payment|pay|checkout)\b/, copy.support.wallet, "wallet"],
    [/\b(wishlist|wish list|saved items?|favorites?)\b/, copy.support.wishlist, "wishlist"],
    [/\b(cart|basket|quantit(?:y|ies))\b/, copy.support.cart, "cart"],
    [/\b(categories|browse all|all products|shopping categories)\b/, copy.support.categories, "categories"],
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
    return result(copy.notFound, [], "categories");
  }
  if (!budget && !recommend && !category && matched.length) {
    const ranked = matched.sort((a, b) => b.score - a.score);
    if (ranked.length === 1 || ranked[0].score > ranked[1].score) return result(describeProduct(ranked[0].product, copy), [ranked[0].product]);
    return result(copy.several, ranked.slice(0, 4).map(({ product }) => product));
  }
  if (budget || recommend || category) {
    const pool = (matched.length ? matched : scope).map(({ product }) => product);
    const eligible = pool.filter((product) => product.stock !== 0 && (!budget || (
      budget.exclusive ? product.price < budget.limit : product.price <= budget.limit
    )));
    const range = budget ? copy.range(rupees.format(budget.limit), budget.exclusive) : "";
    if (!eligible.length) return result(copy.noMatch(range, category), [], "categories");
    const trending = popular && eligible.some(({ section }) => section === "Trending");
    const topRated = eligible.some(({ rating }) => Number.isFinite(rating));
    eligible.sort((a, b) => {
      if (cheapest) return a.price - b.price;
      if (trending && (a.section === "Trending") !== (b.section === "Trending")) return a.section === "Trending" ? -1 : 1;
      return (b.rating ?? 0) - (a.rating ?? 0) || a.price - b.price;
    });
    const basis = cheapest ? copy.picks.lowest : trending ? copy.picks.trending : topRated ? copy.picks.rated : copy.picks.lowest;
    const salesNote = popular ? copy.salesNote : "";
    return result(copy.recommendation(basis, range, describeProduct(eligible[0], copy)) + salesNote, eligible.slice(0, 3));
  }

  if (/^(hi|hello|hey|help|what can you do)[!. ]*$/.test(query)) {
    return result(copy.help);
  }
  return result(copy.fallback);
}
