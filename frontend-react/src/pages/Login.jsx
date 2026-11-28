
import { useState } from "react";
import transparentLogo from "../assets/images/logo-transparent.png";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import "./Login.css";
import API_BASE_URL from "../config/api";

function Login({ mode = "customer", onModeChange, onBack, onRegister, onMerchantRegister, onPlans, onAdmin, onSuccess }) {
  const merchant = mode === "merchant";
  const admin = mode === "admin";
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    remember: false,
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setMessage("");
    const identifier = formData.identifier.trim();
    if (merchant && !/^[6-9]\d{9}$/.test(identifier) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setMessage("Enter your Indipay email or 10-digit mobile number.");
      return;
    }
    setIsSubmitting(true);

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: identifier,
                    password: formData.password,
                    mode,
                    remember: formData.remember,
                }),
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            setMessage(result.message || "Login failed.");
            return;
        }

        if (admin !== (result.user?.role === "ADMIN")) {
            await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
            setMessage(admin ? "Administrator access is required." : "Use Administrator Sign-in for this account.");
            return;
        }

        if (onSuccess) {
            onSuccess(result.user);
        }

    } catch (error) {
        console.error("Login error:", error);
        setMessage("Unable to connect to the server. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <main className="indipay-auth-page">
      <header className="auth-topbar">
        <button
  className="auth-brand"
  onClick={onBack}
  type="button"
  aria-label="Return to Indipay home"
>
  <img
    src={transparentLogo}
    alt="Indipay"
    className="auth-brand-logo"
  />
</button>

        <button className="auth-back-link" onClick={onBack} type="button">
          Back to Home
        </button>
      </header>

      <div className="auth-layout">
        <section className="auth-presentation">
          <span className="auth-eyebrow">
            <span className="auth-eyebrow-dot" />
            YOUR FINANCIAL PARTNER
          </span>

          <h1>
            Everything starts
            <br />
            with <span>one account.</span>
          </h1>

          <p>
            Access your services, stay connected and manage your
            Indipay journey through one convenient platform.
          </p>

          <div className="auth-benefits">
            <div>
              <ShieldCheck size={21} />
              <span>Convenient access to services</span>
            </div>
            <div>
              <LockKeyhole size={21} />
              <span>Designed with security in mind</span>
            </div>
            <div>
              <UserRound size={21} />
              <span>Your services in one place</span>
            </div>
          </div>

          <div className="auth-decoration">
            <div className="auth-decoration-circle" />
            <div className="auth-decoration-card">
              <span>INDIPAY</span>
              <strong>Your Services.</strong>
              <strong>Your Convenience.</strong>
              <small>ONE PLATFORM. MANY POSSIBILITIES.</small>
            </div>
          </div>
        </section>

        <section className="auth-form-side">
          <div className="auth-form-card">
            {!admin && <div className="auth-account-toggle" role="group" aria-label="Account sign-in type">
              {[["customer", "Customer Login"], ["merchant", "Merchant Login"]].map(([value, label]) => (
                <button key={value} type="button" aria-pressed={mode === value} disabled={isSubmitting} onClick={() => {
                  if (mode !== value) {
                    setFormData((current) => ({ ...current, identifier: "", password: "" }));
                    setShowPassword(false);
                    setMessage("");
                    onModeChange(value);
                  }
                }}>{label}</button>
              ))}
            </div>}
            <div className="auth-form-heading">
              <span className="auth-form-icon">
                <LockKeyhole size={24} />
              </span>
              <span className="auth-form-label">WELCOME BACK</span>
              <h2>{admin ? "Administrator Sign-in" : merchant ? "Merchant Login" : "Customer Login"}</h2>
              <p>{admin ? "Sign in to access the Indipay Admin Control Centre."
                : merchant ? "Use your Indipay account to access your merchant features."
                  : "Sign in to access your Indipay services and Superstore."}</p>
            </div>

            <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
              <label className="auth-field">
                {merchant ? "Email address or mobile number" : "Email address"}
                <span className="auth-input-wrap">
                  <Mail size={19} />
                  <input
                    type={merchant ? "text" : "email"}
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder={merchant ? "Email or 10-digit mobile number" : "Enter your email address"}
                    autoComplete="username"
                    maxLength={254}
                    required
                  />
                </span>
              </label>

              <label className="auth-field">
                Password
                <span className="auth-input-wrap">
                  <LockKeyhole size={19} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </span>
              </label>

              <div className="auth-form-options">
                <label className="auth-remember">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  className="auth-text-button"
                  onClick={() =>
                    setMessage("Contact Indipay support for account recovery.")
                  }
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="auth-submit-button" disabled={isSubmitting}>
                {isSubmitting ? "Signing in…" : admin ? "Sign in as Administrator" : merchant ? "Login as Merchant" : "Login to Account"} <ArrowRight size={19} />
              </button>

              {message && (
                <p className="auth-feedback" role="status">{message}</p>
              )}
            </form>

            {!admin && <div className="auth-switch auth-account-links">
              {merchant ? <>
                <button type="button" onClick={onMerchantRegister}>Register as Merchant</button>
                <button type="button" onClick={onPlans}>Explore Merchant Plans</button>
              </> : <button type="button" onClick={onRegister}>Create Account</button>}
              <button type="button" className="auth-admin-link" onClick={onAdmin}>Administrator Sign-in</button>
            </div>}
          </div>
        </section>
      </div>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Indipay. All rights reserved.</span>
        <span>Financial · Legal · Business Solutions</span>
      </footer>
    </main>
  );
}

export default Login;
