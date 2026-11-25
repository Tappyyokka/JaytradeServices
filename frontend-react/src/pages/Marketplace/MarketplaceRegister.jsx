import { useEffect, useState } from "react";
import { CheckCircle, Store } from "lucide-react";
import { categories } from "./marketplaceData";
import { subscriptionPlans } from "./subscriptionPlans";
import PlanPicker from "./PlanPicker";
import SellerPassword from "./SellerPassword";
import "./MarketplaceRegister.css";

export default function MarketplaceRegister({ navigate, onRegister }) {
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!complete) return;
    const timer = window.setTimeout(() => navigate("marketplace"), 4000);
    return () => window.clearTimeout(timer);
  }, [complete, navigate]);

  function register(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const email = fields.get("email").trim().toLowerCase();
    const mobile = fields.get("mobile").trim();
    const gstin = fields.get("gstin").trim().toUpperCase();
    if (["name", "store", "address", "description"].some((key) => !fields.get(key).trim())) {
      setError("Fill in your name and all required business details.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile) || !/^[1-9]\d{5}$/.test(fields.get("pin").trim())) {
      setError("Enter a valid 10-digit Indian mobile number and 6-digit PIN code.");
      return;
    }
    if (gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[A-Z0-9]$/.test(gstin)) {
      setError("Enter a valid GSTIN format or leave it blank.");
      return;
    }
    if (fields.get("password") !== fields.get("confirm")) {
      setError("Passwords don’t match.");
      return;
    }
    try {
      onRegister({
        owner: fields.get("name").trim(), name: fields.get("store").trim(),
        username: fields.get("username").trim().toLowerCase(), category: fields.get("category"),
        address: fields.get("address").trim(), pin: fields.get("pin").trim(),
        description: fields.get("description").trim(), email, mobile,
      }, plan);
      setComplete(true);
    } catch (failure) { setError(failure.message); }
  }

  if (!plan) return <PlanPicker onChoose={setPlan} onLogin={() => navigate("seller-login")} />;

  if (complete) return (
    <section className="mp-seller-card">
      <CheckCircle size={32} aria-hidden="true" />
      <h1>Seller registration complete</h1>
      <p role="status">Your demo seller account is pending verification and approval by Indipay.</p>
      <button type="button" className="mp-seller-primary" onClick={() => navigate("marketplace")}>Continue to Marketplace</button>
    </section>
  );

  return (
    <section className="mp-seller-card">
      <Store size={32} aria-hidden="true" />
      <h1>Marketplace seller registration</h1>
      <p>{subscriptionPlans[plan].name} plan · Demo registration</p>
      <button type="button" onClick={() => setPlan(null)}>Change plan</button>
      <p>Enter sample details. Your business address, email and mobile will appear on the public store profile in this browser.</p>
      <form className="mp-seller-form" onSubmit={register}>
        <fieldset>
          <legend>Personal details</legend>
          <label>Full name<input name="name" autoComplete="name" maxLength={100} required /></label>
          <label>Mobile number<input name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[6-9][0-9]{9}" maxLength={10} required /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        </fieldset>
        <fieldset>
          <legend>Business details</legend>
          <label>Business or store name<input name="store" autoComplete="organization" maxLength={80} required /></label>
          <label>Store username<input name="username" required minLength={3} maxLength={30} placeholder="your-store" autoCapitalize="none" /></label>
          <label>Business category<select name="category" defaultValue="" required><option value="" disabled>Choose a category</option>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}<option>Other</option></select></label>
          <label>Business address<textarea name="address" autoComplete="street-address" maxLength={500} required /></label>
          <label>PIN code<input name="pin" inputMode="numeric" autoComplete="postal-code" pattern="[1-9][0-9]{5}" maxLength={6} required /></label>
          <label>GSTIN (optional)<input name="gstin" maxLength={15} /></label>
          <label>Business description<textarea name="description" maxLength={1000} required /></label>
        </fieldset>
        <fieldset>
          <legend>Account credentials</legend>
          <SellerPassword minLength={8} />
          <SellerPassword name="confirm" label="Confirm password" minLength={8} />
          <p>Use at least 8 characters and choose a sample password for the demo.</p>
        </fieldset>
        <details><summary>Seller demo terms and conditions</summary><p>Use sample details for this preview. Completing registration does not create a live seller account or authorize publication.</p></details>
        <label className="mp-seller-check"><input name="terms" type="checkbox" required /> I accept the seller demo terms and conditions</label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" className="mp-seller-primary">Register as a Marketplace User</button>
      </form>
      <button type="button" onClick={() => navigate("seller-login")}>Already registered? Seller Login</button>
    </section>
  );
}
