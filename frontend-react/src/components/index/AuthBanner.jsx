
function AuthBanner({ onRegister, onLogin }) {
  return (
    <section className="auth-banner-section">
      <div className="auth-banner-container">

        <div className="auth-banner-content">
          <span className="auth-banner-eyebrow">
            YOUR JOURNEY STARTS HERE
          </span>

          <h2>
            Ready to take your
            <br />
            <span>next step with Indipay?</span>
          </h2>

          <p>
            Create your account to explore services, manage your
            requests and stay connected with everything you need.
          </p>

          <div className="auth-banner-buttons">
            <button
              type="button"
              className="auth-register-btn"
              onClick={onRegister}
            >
              Create an Account <span>↗</span>
            </button>

            <button
              type="button"
              className="auth-login-btn"
              onClick={onLogin}
            >
              Already a member? Login
            </button>
          </div>

          <div className="auth-banner-note">
            <span>✦</span>
            Simple access. Convenient services. One platform.
          </div>
        </div>

        <div className="auth-banner-visual">
          <div className="auth-visual-glow"></div>

          <div className="auth-visual-card">
            <div className="auth-card-top">
              <span className="auth-card-logo">I.</span>
              <span>INDIPAY</span>
            </div>

            <div className="auth-card-main">
              <span>WELCOME TO</span>
              <h3>Possibilities<br />Start Here.</h3>
            </div>

            <div className="auth-card-bottom">
              <span>YOUR SERVICES, SIMPLIFIED.</span>
              <span>✦</span>
            </div>
          </div>

          <div className="auth-floating-element auth-float-one">
            <span>✓</span>
            Easy Access
          </div>

          <div className="auth-floating-element auth-float-two">
            <span>✦</span>
            One Platform
          </div>
        </div>

      </div>
    </section>
  );
}

export default AuthBanner;
