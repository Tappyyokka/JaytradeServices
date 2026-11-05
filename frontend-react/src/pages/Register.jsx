
import { useState } from "react";
import transparentLogo from "../assets/images/logo-transparent.png";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import "./Register.css";

function Register({ onBack, onLogin, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      setMessage("Please accept the terms and conditions.");
      return;
    }

    if (onSuccess) {
  onSuccess();
}
  };

  return (
    <main className="indipay-auth-page register-page">
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

      <div className="auth-layout register-layout">
        <section className="auth-presentation">
          <span className="auth-eyebrow">
            <span className="auth-eyebrow-dot" />
            START YOUR INDIPAY JOURNEY
          </span>

          <h1>
            A better way
            <br />
            to access <span>services.</span>
          </h1>

          <p>
            Create your Indipay account and discover convenient
            financial, legal and business solutions.
          </p>

          <div className="auth-benefits">
            <div>
              <ShieldCheck size={21} />
              <span>Convenient service access</span>
            </div>
            <div>
              <UserRound size={21} />
              <span>Your details in one place</span>
            </div>
            <div>
              <LockKeyhole size={21} />
              <span>A simple account experience</span>
            </div>
          </div>

          <div className="auth-decoration">
            <div className="auth-decoration-circle" />
            <div className="auth-decoration-card">
              <span>WELCOME TO INDIPAY</span>
              <strong>Start Something</strong>
              <strong>Better Today.</strong>
              <small>YOUR SERVICES, SIMPLIFIED.</small>
            </div>
          </div>
        </section>

        <section className="auth-form-side">
          <div className="auth-form-card register-form-card">
            <div className="auth-form-heading">
              <span className="auth-form-icon">
                <UserRound size={24} />
              </span>
              <span className="auth-form-label">CREATE YOUR ACCOUNT</span>
              <h2>Join Indipay</h2>
              <p>Fill in your details to get started.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="auth-field">
                Full Name
                <span className="auth-input-wrap">
                  <UserRound size={19} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </span>
              </label>

              <label className="auth-field">
                Mobile Number
                <span className="auth-input-wrap">
                  <Phone size={19} />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    autoComplete="tel"
                    required
                  />
                </span>
              </label>

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
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    minLength={8}
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

              <label className="auth-field">
                Confirm Password
                <span className="auth-input-wrap">
                  <LockKeyhole size={19} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </span>
              </label>

              <label className="auth-terms">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />
                <span>
                  I agree to the Terms and Conditions and Privacy Policy.
                </span>
              </label>

              <button type="submit" className="auth-submit-button">
                Create My Account <ArrowRight size={19} />
              </button>

              {message && (
                <p className="auth-feedback" role="status">{message}</p>
              )}
            </form>

            <div className="auth-switch">
              Already have an account?
              <button type="button" onClick={onLogin}>
                Login
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

export default Register;

