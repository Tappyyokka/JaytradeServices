
import {
  
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

import transparentLogo from "../../assets/images/logo-transparent.png";

function Footer() {
  return (
    <footer className="indipay-footer" id="about">
      <div className="indipay-footer-container">

        {/* BRAND */}
        
<div className="indipay-footer-brand">

  <div className="indipay-footer-logo">
  <img
    src={transparentLogo}
    alt="Indipay - India's No. 1 Digital Interface"
    className="indipay-footer-logo-image"
  />

  <span className="indipay-footer-tagline">
    A Jaytrade Group Initiative
  </span>
</div>

  <p className="indipay-footer-description">
    A modern financial services and business solutions platform
    connecting customers with financial, legal, business development,
    and employment services.
  </p>

  <div className="indipay-footer-socials">

    <a href="#" aria-label="LinkedIn">
      {/* Keep your existing LinkedIn SVG here */}
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M5.2 3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.3 9h3.8v12H3.3V9Zm6.1 0H13v1.6h.1A4.1 4.1 0 0 1 16.8 8.7c4 0 4.8 2.6 4.8 6V21h-3.8v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9.4V9Z"/>
      </svg>
    </a>

    <a href="#" aria-label="Instagram">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    </a>

    <a href="#" aria-label="Facebook">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z"/>
      </svg>
    </a>

  </div>
</div>


        {/* QUICK LINKS */}
        <div className="indipay-footer-column">
          <h3>Quick Links</h3>

          <a href="/">Home</a>
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact Us</a>
        </div>

        {/* SERVICE LINKS */}
        <div className="indipay-footer-column">
          <h3>Service Links</h3>

          <a href="#services">Financial Services</a>
          <a href="#services">Legal Services</a>
          <a href="#services">Business Development</a>
          <a href="#services">Jaytrade Jobs</a>
        </div>

        {/* CUSTOMER SUPPORT */}
        <div className="indipay-footer-column indipay-footer-contact" id="contact">
          <h3>Customer Support</h3>

          <a href="tel:+910000000000">
            <Phone size={20} />
            <span>+91 00000 00000</span>
          </a>

          <a href="mailto:support@indipay.in">
            <Mail size={20} />
            <span>support@indipay.in</span>
          </a>

          <div className="indipay-footer-contact-item">
            <MapPin size={21} />
            <span>Jaytrade Corporate Office, Kerala, India</span>
          </div>

          <a
            href="https://wa.me/910000000000"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={20} className="indipay-footer-whatsapp-icon" />
            <span>WhatsApp Support</span>
          </a>
        </div>

      </div>

      {/* BOTTOM FOOTER */}
      <div className="indipay-footer-bottom">
        <p>
          © {new Date().getFullYear()} Indipay — A Jaytrade Group
          Initiative. All rights reserved.
        </p>

        <div>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms-and-conditions">Terms and Conditions</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
