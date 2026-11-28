import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import MarketplaceRegister from "./MarketplaceRegister";
import PlanPicker from "./PlanPicker";
import marketplaceRequest from "../../config/marketplaceApi";
import { formatPaise } from "../../wallet/walletData";
import { subscriptionPlans } from "./subscriptionPlans";
import "./SellerDashboard.css";

export default function MerchantOnboarding({ plan, customer, identity, onChoose, onLogin, onPlans, onMarketplace, onMyStore, onActivate, darkMode }) {
  const [merchant, setMerchant] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const customerId = customer?.id;
  const isAdmin = identity.accountType === "admin";
  useEffect(() => {
    if (!customerId || isAdmin) return;
    let active = true;
    marketplaceRequest("/merchant/subscription").then((data) => { if (active) setMerchant(data); })
      .catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [customerId, isAdmin]);

  async function register(details) {
    const { name, username, description, ...profile } = details;
    setMerchant(await marketplaceRequest("/merchant/registration", "POST", {
      plan, details: { name, username, description, profile },
    }));
  }

  async function preparePayment() {
    setBusy(true);
    setError("");
    try { setMerchant(await marketplaceRequest("/merchant/registration", "POST", { plan })); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const result = await marketplaceRequest("/merchant/payment", "POST", {
        intentId: merchant.store.intentId, amountPaise: merchant.store.amountPaise, days: merchant.store.days,
      });
      setMerchant(result);
      setReceipt(result.paymentReference);
      await onActivate();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  const store = merchant?.store;
  const intent = store?.intentId && (!plan || plan === store.pendingPlan);
  const enough = store && merchant.balancePaise >= store.amountPaise;
  let content;
  if (isAdmin) content = <section className="mp-seller-card"><h1>Merchant plans</h1><p>Use a customer account to activate a merchant plan.</p></section>;
  else if (customer && !merchant) content = <section className="mp-seller-card"><h1>Merchant plans</h1>{!error && <p role="status">Loading your subscription…</p>}</section>;
  else if (merchant?.status === "suspended") content = <section className="mp-seller-card"><h1>Merchant account suspended</h1></section>;
  else if (receipt) content = <section className="mp-seller-card">
    <h1>Merchant subscription active</h1>
    <p>Payment reference {receipt}</p>
    <p>Valid until {new Date(store.subscriptionEnd).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
    <button type="button" className="mp-seller-primary" disabled={busy} onClick={onMyStore}>Open My Store</button>
  </section>;
  else if (intent && plan) content = <section className="mp-seller-card">
    <h1>Pay subscription</h1>
    <p>{store.name} · {subscriptionPlans[store.pendingPlan].name} · {formatPaise(store.amountPaise)} for {store.days ?? 30} days</p>
    {store.planAvailable === false && <p>This plan is currently unavailable.</p>}
    <p>Available Customer Money {formatPaise(merchant.balancePaise)}</p>
    {!merchant.paymentEnabled ? <p>Subscription payments are unavailable on this server.</p>
      : <p>This test payment debits the Customer Money balance on this test server.</p>}
    {merchant.paymentEnabled && !enough && <p role="status">Insufficient Customer Money for this subscription.</p>}
    <button type="button" className="mp-seller-primary" disabled={busy || !merchant.paymentEnabled || !enough || store.planAvailable === false} onClick={pay}>
      {busy ? "Confirming payment…" : "Pay subscription"}</button>
    <button type="button" onClick={onPlans} disabled={busy}>Change plan</button>
  </section>;
  else if (plan && customer && !store) content = <MarketplaceRegister key={plan} customer={customer}
    plan={plan} onRegister={register} onChangePlan={onPlans} />;
  else if (plan && store) content = <section className="mp-seller-card">
    <h1>{store.name}</h1>
    <p>Selected plan {subscriptionPlans[plan].name}</p>
    <button type="button" className="mp-seller-primary" onClick={preparePayment} disabled={busy}>Review subscription payment</button>
    <button type="button" onClick={onPlans} disabled={busy}>Change plan</button>
  </section>;
  else content = <>
    {store && <section className="mp-seller-card"><h2>{store.name}</h2>
      {merchant.status === "active" && <button type="button" onClick={onMyStore}>Open My Store</button>}
      {store.intentId && <button type="button" onClick={() => onChoose(store.pendingPlan)}>Resume subscription payment</button>}
    </section>}
    <PlanPicker onChoose={onChoose} onLogin={customer ? undefined : onLogin} />
  </>;
  return <main className={`indipay-marketplace mp-seller-flow${darkMode ? " dark-mode" : ""}`}>
    <div className="mp-wrap">
      <button className="mp-seller-back" type="button" onClick={onMarketplace}><ArrowLeft size={18} aria-hidden="true" /> Back to Superstore</button>
      {error && <p role="alert">{error}</p>}
      {content}
    </div>
  </main>;
}
