export const subscriptionPlans = {
  starter: { name: "Starter", price: 299, limit: 10, benefits: ["Personal storefront", "Basic store customization", "Order management"] },
  business: { name: "Business", price: 699, limit: 50, benefits: ["Custom store banner", "Sales analytics", "Product promotions"] },
  premium: { name: "Premium", price: 1499, limit: Infinity, benefits: ["Advanced analytics", "Featured store placement", "Priority support"] },
};

export function listingAllowance(plan) {
  return Number.isFinite(plan.limit) ? `Up to ${plan.limit} product listings` : "Unlimited product listings";
}
