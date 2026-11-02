function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Brand */}
        <a href="#top" className="brand">
          <span className="brand-icon">I</span>
          <span className="brand-name">
            Indi<span>pay</span>
          </span>
        </a>

        {/* Navigation */}
        <nav className="nav-links">
          <a href="#top">Home</a>
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>

        {/* Account buttons */}
        <div className="nav-buttons">
          <button className="login-btn">Login</button>
          <button className="register-btn">
            Get Started <span>↗</span>
          </button>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
