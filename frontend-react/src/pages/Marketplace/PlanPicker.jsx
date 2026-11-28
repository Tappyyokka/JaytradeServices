import { Store } from "lucide-react";
import { useEffect, useState } from "react";
import API from "../../config/api";
import { formatPaise } from "../../wallet/walletData";
import { listingAllowance, subscriptionPlans } from "./subscriptionPlans";
import "./StoreProfiles.css";

export default function PlanPicker({ onChoose, onLogin }) {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(API + "/api/admin-centre/subscription-plans", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Plans are unavailable.");
        return response.json();
      }).then(setPlans).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
    return () => controller.abort();
  }, []);
  return <section className="mp-seller-card store-plans">
    <Store size={30} aria-hidden="true" /><h1>Choose a Merchant Plan</h1>
    <p>Choose a plan for your existing Indipay account. Payment is available on test servers.</p>
    {error && <p role="alert">{error}</p>}
    {!plans && !error && <p role="status">Loading plans…</p>}
    {plans?.length === 0 && <p>No plans are available.</p>}
    <div className="store-plan-grid">{plans?.map(({ id, amountPaise, days, limit }) =>
      <article key={id}><h2>{subscriptionPlans[id].name}</h2><p><strong>{formatPaise(amountPaise)}</strong> / {days} days</p>
        <ul>{[listingAllowance({ limit: limit ?? Infinity }), ...subscriptionPlans[id].benefits].map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
        <button className="mp-seller-primary" onClick={() => onChoose(id)}>Choose {subscriptionPlans[id].name}</button>
      </article>)}</div>
    {onLogin && <button type="button" onClick={onLogin}>Already have an Indipay account? Sign in</button>}
  </section>;
}
