import { subscriptionPlans } from "../pages/Marketplace/subscriptionPlans.js";

export function accountIdentity(user, marketplaceAccount) {
  const role = marketplaceAccount?.role ?? user?.role ?? "CUSTOMER";
  const store = marketplaceAccount?.store;
  const administrator = Boolean(user?.id && role === "ADMIN");
  const liveSeller = Boolean(user?.id && role === "SELLER");
  const status = marketplaceAccount?.merchantSubscription;
  const accountType = !user?.id ? "guest" : administrator ? "admin" : liveSeller ? "merchant" : "customer";

  return {
    userId: user?.id ?? null,
    accountType,
    label: { guest: "Guest", customer: "Customer Account", merchant: "Merchant Account", admin: "Administrator" }[accountType],
    merchantId: liveSeller ? user.id : null,
    storeId: store ? "live-" + user.id : null,
    storeName: store?.name ?? "",
    merchantStatus: status ?? null,
    planId: store?.plan ?? null,
    planName: store && Object.hasOwn(subscriptionPlans, store.plan) ? subscriptionPlans[store.plan].name : "",
    subscriptionStatus: status ?? null,
    canPublish: liveSeller && status === "active",
    canManageLive: liveSeller,
    canUpgrade: accountType === "customer" && status !== "suspended",
  };
}
