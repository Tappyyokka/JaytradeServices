
const serviceCategories = [
  {
    number: "01",
    title: "Financial Services",
    description:
      "Explore financial solutions designed to support your personal and business needs.",
    icon: "₹",
    label: "FINANCIAL SOLUTIONS",
    style: "financial",
  },
  {
    number: "02",
    title: "Legal Services",
    description:
      "Professional assistance with registrations, documentation, compliance and more.",
    icon: "§",
    label: "LEGAL SOLUTIONS",
    style: "legal",
  },
  {
    number: "03",
    title: "Business Development",
    description:
      "Find the right support and opportunities to take your business forward.",
    icon: "↗",
    label: "BUSINESS SOLUTIONS",
    style: "business",
  },
  {
    number: "04",
    title: "Jaytrade Jobs",
    description:
      "Discover employment opportunities and job-related services to support your career.",
    icon: "✦",
    label: "CAREER OPPORTUNITIES",
    style: "jobs",
  },
  {
    number: "05",
    title: "Jaytrade Times & Technologies",
    description:
      "Promote your brand, reach wider audiences and explore professional advertising and media solutions.",
    icon: "▤",
    label: "ADVERTISING & MEDIA",
    style: "media",
  },
];

function ServicesOverview() {
  return (
    <section className="services-section" id="services">
      <div className="services-container">

        <div className="services-heading">
          <div>
            <span className="section-tag">WHAT WE OFFER</span>

            <h2>
              Services Designed
              <span> Around You.</span>
            </h2>

            <p>
              From financial solutions to professional business
              assistance, explore everything Indipay has to offer.
            </p>
          </div>

          <button className="services-view-all">
            Explore All Services ↗
          </button>
        </div>

        <div className="services-grid">
          {serviceCategories.map((service) => (
            <article
              className={`service-card ${service.style}`}
              key={service.number}
            >
              <div className="service-card-top">
                <span>{service.number}</span>
                <span className="service-icon">{service.icon}</span>
              </div>

              <div className="service-card-content">
                <span className="service-count">
                  {service.label}
                </span>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <a href="#services">
                  Explore Services <span>→</span>
                </a>
              </div>

              <div className="service-card-decoration">
                {service.number}
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ServicesOverview;
