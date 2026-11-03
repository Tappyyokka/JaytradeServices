
import transparentLogo from "../../assets/images/logo-transparent.png";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Brand - temporary logo comparison */}
        <a href="#top" className="brand">
        

<img
  src={transparentLogo}
  alt="Indipay logo with transparent background"
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
