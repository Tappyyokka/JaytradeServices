import { Store } from "lucide-react";
import { listingAllowance, subscriptionPlans } from "./subscriptionPlans";
import "./StoreProfiles.css";

export default function PlanPicker({ onChoose, onLogin }) {
  return <section className="mp-seller-card store-plans">
    <Store size={30} aria-hidden="true" /><h1>Choose your store plan</h1>
    <p>Preview a storefront with sample business details. All plans are demos and there is no charge.</p>
    <div className="store-plan-grid">{Object.entries(subscriptionPlans).map(([id, plan]) =>
      <article key={id}><h2>{plan.name}</h2><p><strong>₹{plan.price.toLocaleString("en-IN")}</strong> / month</p>
        <ul>{[listingAllowance(plan), ...plan.benefits].map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
        <button className="mp-seller-primary" onClick={() => onChoose(id)}>Choose {plan.name}</button>
      </article>)}</div>
    <button onClick={onLogin}>Already registered? Seller Login</button>
  </section>;
}
