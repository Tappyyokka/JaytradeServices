
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        {/* Brand information */}
        <div className="footer-brand">
          <a href="#home" className="footer-logo">
            <span className="footer-logo-icon">I.</span>
            <span>INDIPAY</span>
          </a>

          <p>
            Simplifying access to essential financial, legal and
            business services. Bringing solutions closer to you,
            all in one place.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="LinkedIn">IN</a>
          </div>
        </div>

        {/* Quick links */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#services">Our Services</a>
          <a href="#contact">Contact Us</a>
        </div>

        {/* Services */}
        <div className="footer-column">
          <h3>Our Services</h3>
          <a href="#services">Financial Services</a>
          <a href="#services">Legal Services</a>
          <a href="#services">Business Development</a>
          <a href="#services">Jaytrade Jobs</a>
          <a href="#services">Jaytrade Times</a>
        </div>

        {/* Account */}
        <div className="footer-column">
          <h3>Your Account</h3>
          <a href="/login">Customer Login</a>
          <a href="/register">Create Account</a>
          <p className="footer-account-note">
            Join Indipay and explore our range of services.
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Indipay. All rights reserved.</p>
        <p>Designed to simplify your journey.</p>
      </div>
    </footer>
  );
}

export default Footer;
