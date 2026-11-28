import { useState } from "react";
import { Store } from "lucide-react";
import { categories } from "./marketplaceData";
import { subscriptionPlans } from "./subscriptionPlans";
import "./MarketplaceRegister.css";

export default function MarketplaceRegister({ customer, plan, onRegister, onChangePlan }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const planName = subscriptionPlans[plan].name;

  async function register(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (key) => fields.get(key).trim();
    const details = {
      owner: customer.name,
      name: value("store"), username: value("username").toLowerCase(), category: value("category"),
      address: value("address"), pin: value("pin"), description: value("description"),
      email: value("email").toLowerCase(), mobile: value("mobile"),
    };

    if (!details.name || !details.address || !details.description) {
      setError("Enter a business name, address and description.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(details.mobile) || !/^[1-9]\d{5}$/.test(details.pin)) {
      setError("Enter a valid 10-digit business mobile number and 6-digit PIN code.");
      return;
    }
    setBusy(true);
    setError("");
    try { await onRegister(details); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="mp-seller-card">
      <Store size={32} aria-hidden="true" />
      <h1>Register your store</h1>
      <p>{planName} plan · Signed in as {customer.name}</p>
      <button type="button" onClick={onChangePlan}>Change plan</button>
      <p>Your business address, email and phone appear on your public storefront after activation.</p>
      <form className="mp-seller-form" onSubmit={register}>
        <fieldset>
          <legend>Business details</legend>
          <label>Business or store name<input name="store" autoComplete="organization" maxLength={80} required /></label>
          <label>Store username<input name="username" required minLength={3} maxLength={30} placeholder="your-store" autoCapitalize="none" /></label>
          <label>Business category<select name="category" defaultValue="" required><option value="" disabled>Choose a category</option>
            {categories.slice(1).map((category) => <option key={category}>{category}</option>)}<option>Other</option>
          </select></label>
          <label>Business address<textarea name="address" autoComplete="street-address" maxLength={500} required /></label>
          <label>PIN code<input name="pin" inputMode="numeric" autoComplete="postal-code" pattern="[1-9][0-9]{5}" maxLength={6} required /></label>
          <label>Business description<textarea name="description" maxLength={1000} required /></label>
        </fieldset>
        <fieldset>
          <legend>Public store contact</legend>
          <label>Business email<input name="email" type="email" maxLength={254} required /></label>
          <label>Business mobile number<input name="mobile" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} required /></label>
        </fieldset>
        <label className="mp-seller-check"><input name="terms" type="checkbox" required /> Link this store to my existing Indipay account</label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" className="mp-seller-primary" disabled={busy}>{busy ? "Saving…" : "Register Store"}</button>
      </form>
    </section>
  );
}
