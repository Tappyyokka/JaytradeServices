export const SUPERSTORE_PATH = "/superstore";

export function canonicalAccountUrl(input) {
  const url = new URL(input);
  const path = url.pathname.replace(/\/+$/, "");
  if (path === "/marketplace/seller/login") {
    url.pathname = "/login";
    url.searchParams.set("mode", "merchant");
  } else if (path === "/marketplace/seller/register") {
    url.pathname = "/merchant/plans";
  } else if (path === "/marketplace" || path === SUPERSTORE_PATH) {
    url.pathname = SUPERSTORE_PATH;
  } else if (path === "/marketplace/seller/dashboard" || path === SUPERSTORE_PATH + "/seller/dashboard") {
    url.pathname = SUPERSTORE_PATH + "/seller/dashboard";
  }
  return url;
}

export function safeReturnUrl(value, origin, pages) {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;
  try {
    const url = canonicalAccountUrl(new URL(value, origin));
    const page = Object.keys(pages).find((key) => pages[key] === url.pathname);
    if (url.origin === origin && page && !["login", "register", "admin-login"].includes(page)) {
      return url.pathname + url.search + url.hash;
    }
  } catch { /* Ignore invalid return destinations. */ }
  return null;
}
