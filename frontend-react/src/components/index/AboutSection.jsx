function AboutSection() {
  return (
    <section className="about-section" id="about">

      <div className="about-container">

        <div className="about-left">
          <span className="section-tag">
            ABOUT INDIPAY
          </span>

          <h2>
            Simplifying Your Journey,
            <span> One Service at a Time.</span>
          </h2>

          <p>
            Indipay brings financial, legal and business
            services together under one platform. We aim
            to make essential services more accessible,
            convenient and easier to navigate.
          </p>

          <p>
            Whether you're an individual looking for
            financial assistance or a business looking
            for professional support, Indipay is here
            to help you move forward.
          </p>

          <button className="about-button">
            Discover Indipay <span>↗</span>
          </button>
        </div>

        <div className="about-right">

          <div className="about-visual">
            <div className="about-visual-circle"></div>

            <div className="about-brand-card">
              <span>YOUR FINANCIAL PARTNER</span>
              <h3>Indipay</h3>
              <div className="about-orange-line"></div>
              <p>Financial. Legal. Business.</p>
            </div>

            <div className="about-stat">
              <strong>03</strong>
              <span>Major Service Categories</span>
            </div>
          </div>

          <div className="about-highlights">

            <div>
              <span>01</span>
              <strong>Financial Solutions</strong>
            </div>

            <div>
              <span>02</span>
              <strong>Legal Assistance</strong>
            </div>

            <div>
              <span>03</span>
              <strong>Business Support</strong>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default AboutSection;