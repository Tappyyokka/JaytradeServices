
import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

import "./AboutUs.css";

function AboutUs() {
  return (
    <div className="about-page">

      <section className="about-hero">
        <span>ABOUT JAYTRADE</span>
        <h1>Growing Businesses.<br />Creating Opportunities.</h1>
        <p>
          Jaytrade provides financial, legal, business development,
          recruitment and media solutions to support individuals
          and businesses in achieving their goals.
        </p>
      </section>

      <section className="about-contact">
        <div className="about-contact-heading">
          <span>GET IN TOUCH</span>
          <h2>Contact Details</h2>
        </div>

        <div className="about-contact-list">

          <div className="about-contact-item">
            <div className="about-contact-icon">
              <MapPin />
            </div>
            <div>
              <h3>Address</h3>
              <p>
                Corporate Office: 1st Floor, Marina Mall,
                YMCA Cross Road, Calicut - 673001
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Marina+Mall+YMCA+Cross+Road+Calicut+673001"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
              </a>
            </div>
          </div>

          <div className="about-contact-item">
            <div className="about-contact-icon">
              <Phone />
            </div>
            <div>
              <h3>Phone</h3>
              <p>
                <a href="tel:+919656745269">+91 96567 45269</a>
                {" | "}
                <a href="tel:04952762250">0495 2762250</a>
              </p>
            </div>
          </div>

          <div className="about-contact-item">
            <div className="about-contact-icon">
              <Mail />
            </div>
            <div>
              <h3>Email</h3>
              <p>
                <a href="mailto:communication@jaytrade.in">
                  communication@jaytrade.in
                </a>
              </p>
            </div>
          </div>

        </div>
      </section>

      <section className="about-map-section">
        <span>OUR LOCATION</span>
        <h2>Visit Our Office</h2>

        <div className="about-map">
          <iframe
            title="Jaytrade Corporate Office Location"
            src="https://maps.google.com/maps?q=Marina%20Mall%2C%20YMCA%20Cross%20Road%2C%20Calicut%20673001&t=&z=16&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

    </div>
  );
}

export default AboutUs;
