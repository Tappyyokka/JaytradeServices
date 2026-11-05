
import transparentLogo from "../../assets/images/logo-transparent.png";

function Navbar({ onLogin, onRegister }) {
  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Brand */}
        <a href="#top" className="brand">
          <img
            src={transparentLogo}
            alt="Indipay logo"
            className="logo-comparison"
            style={{ height: "75px", width: "auto" }}
          />
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
          <button
            type="button"
            className="login-btn"
            onClick={onLogin}
          >
            Login
          </button>

          <button
            type="button"
            className="register-btn"
            onClick={onRegister}
          >
            Get Started <span>↗</span>
          </button>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
