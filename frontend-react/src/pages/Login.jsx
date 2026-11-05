
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

function Login({ onBack, onRegister, onSuccess  }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
  event.preventDefault();

  if (onSuccess) {
    onSuccess();
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
            <div className="auth-form-heading">
              <span className="auth-form-icon">
                <LockKeyhole size={24} />
              </span>
              <span className="auth-form-label">WELCOME BACK</span>
              <h2>Sign in to Indipay</h2>
              <p>Enter your details to access your account.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="auth-field">
                Email Address
                <span className="auth-input-wrap">
                  <Mail size={19} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    autoComplete="email"
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
                    setMessage("Forgot password functionality will be added later.")
                  }
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="auth-submit-button">
                Login to Account <ArrowRight size={19} />
              </button>

              {message && (
                <p className="auth-feedback" role="status">{message}</p>
              )}
            </form>

            <div className="auth-switch">
              Don't have an account?
              <button type="button" onClick={onRegister}>
                Create Account
              </button>
            </div>
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
