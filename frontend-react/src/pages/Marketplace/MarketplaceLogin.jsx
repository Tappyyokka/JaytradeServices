import { useState } from "react";
import { LogIn } from "lucide-react";
import SellerPassword from "./SellerPassword";
import "./MarketplaceLogin.css";

const demoStatuses = {
  "approved@example.test": "approved",
  "pending@example.test": "pending",
  "rejected@example.test": "rejected",
};

export default function MarketplaceLogin({ navigate, onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);

  function login(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = identifier.trim().toLowerCase();
    const password = fields.get("password");
    try {
      if (Object.hasOwn(demoStatuses, value) && password !== "DemoSeller123") throw new Error("Enter the sample account password shown below.");
      onLogin(value, fields.has("remember"));
    } catch (failure) { setError(failure.message); }
  }

  return (
    <section className="mp-seller-card mp-seller-login">
      <LogIn size={32} aria-hidden="true" />
      <h1>Marketplace Seller Login</h1>
      <p>Seller account preview</p>
      <form className="mp-seller-form" onSubmit={login}>
        <label>Registered email or mobile number<input name="identifier" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} maxLength={254} required /></label>
        <SellerPassword autoComplete="current-password" minLength={8} />
        <div className="mp-seller-login-options">
          <label className="mp-seller-check"><input name="remember" type="checkbox" /> Remember me</label>
          <button type="button" aria-expanded={help} onClick={() => setHelp(!help)}>Forgot password?</button>
        </div>
        {help && <p role="status">Password reset is unavailable in this preview. Choose a sample account below and use its demo password.</p>}
        {error && <p role="alert">{error}</p>}
        <button className="mp-seller-primary" type="submit">Seller Login</button>
      </form>
      <details className="mp-seller-login-demo" open>
        <summary>Sample accounts</summary>
        <p>Choose a status and enter <code>DemoSeller123</code>. For a store registered in this browser, use its business email or mobile and any sample password of at least 8 characters.</p>
        <div>{Object.entries(demoStatuses).map(([email, status]) => (
          <button key={email} type="button" onClick={() => { setIdentifier(email); setError(""); }}>{status}</button>
        ))}</div>
      </details>
      <button type="button" onClick={() => navigate("seller-register")}>Choose a plan and register</button>
    </section>
  );
}
