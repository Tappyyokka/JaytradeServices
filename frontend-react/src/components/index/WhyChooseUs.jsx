import AnimatedCounter from "./AnimatedCounter";
const benefits = [
  {
    number: "01",
    icon: "✦",
    title: "Trusted Guidance",
    description:
      "Get clear guidance and practical assistance to make confident decisions for your financial and business needs.",
  },
  {
    number: "02",
    icon: "◈",
    title: "Multiple Services, One Platform",
    description:
      "Explore financial, legal, business development and other essential services in one convenient place.",
  },
  {
    number: "03",
    icon: "♡",
    title: "Customer-First Approach",
    description:
      "Every requirement matters. We focus on understanding your needs and helping you find suitable solutions.",
  },
  {
    number: "04",
    icon: "↗",
    title: "Support Through Every Step",
    description:
      "From understanding a service to moving forward with your requirements, we're here to make the process easier.",
  },
];

function WhyChooseUs() {
  return (
    <section className="why-choose-section">
      <div className="why-choose-container">

        <div className="why-choose-heading">
          <span className="why-eyebrow">THE INDI PAY DIFFERENCE</span>

          <h2>
            More than services.
            <br />
            <span>A partner in your progress.</span>
          </h2>

          <p>
            Finding the right service shouldn't be complicated.
            We bring essential solutions together with a friendly,
            customer-focused approach that puts your needs first.
          </p>

          <div className="why-trust-note">
            <span className="trust-dot"></span>
            Here to make your next step easier.
          </div>
        </div>

        <div className="why-benefits-grid">
          {benefits.map((benefit) => (
            <div className="why-benefit-card" key={benefit.number}>
              <div className="benefit-card-top">
                <span className="benefit-icon">{benefit.icon}</span>
                <span className="benefit-number">{benefit.number}</span>
              </div>

              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>

              <div className="benefit-card-line"></div>
            </div>
          ))}
        </div>

      </div>

      
<div className="why-bottom-strip">
  <div>
    <AnimatedCounter value={100} suffix="+" />
    <span>Branches</span>
  </div>

  <div>
    <AnimatedCounter value={750} suffix="+" />
    <span>Business Associates</span>
  </div>

  <div>
    <AnimatedCounter value={100} suffix="+" />
    <span>Products</span>
  </div>

  <div>
    <AnimatedCounter value={25000} suffix="+" />
    <span>Happy Customers</span>
  </div>
</div>

    </section>
  );
}

export default WhyChooseUs;
