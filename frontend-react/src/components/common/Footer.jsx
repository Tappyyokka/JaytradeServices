const footerSections = [
  {
    title: "Home",
    links: [
      { label: "Home", href: "#home" },
      { label: "Our Services", href: "#services" },
      { label: "Contact Us", href: "#contact" },
    ],
  },
  {
    title: "Financial",
    links: [
      "Housing Loan",
      "Property Loan",
      "Personal Loan",
      "Business Loan – Secured",
      "Business Loan – Unsecured",
    ],
  },
  {
    title: "Legal",
    links: [
      "CIBIL Report",
      "MSME",
      "Mudra Project Report (up to 5 lakh)",
      "Mudra Project Report (above 5 lakh)",
      "GST Registration",
      "ITR – Income Tax Filing",
      "FSSAI Registration Fee",
      "FSSAI License Fee",
      "FSSAI Registration Modification",
      "FSSAI License Modification",
      "FSSAI Manufacture Registration",
      "FSSAI Manufacture License",
      "Import Export Code",
      "ISO Certificate",
    ],
  },
  {
    title: "Jobs",
    links: [
      "Udyog Registration",
      "Basic Registration",
      "Udyog Plus Registration",
      "Standard Registration",
      "Corporate Plus",
    ],
  },
  {
    title: "Times",
    links: [
      "Growup Package",
      "Standard Package",
      "Premium Package",
      "Corporate Package",
    ],
  },
  {
    title: "Business Development",
    links: [
      "Business Associate",
      "Premium Franchise",
      "Normal Franchise",
      "Virtual Franchise",
    ],
  },
  {
    title: "Wallet",
    links: [
      { label: "My Wallet", href: "#wallet" },
    ],
  },
  {
    title: "About Us",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Contact Us", href: "#contact" },
    ],
  },
];

function Footer({ onSelectService }) {
  const handleServiceClick = (serviceName) => {
    onSelectService?.({ name: serviceName });
  };

  return (
    <footer className="site-footer">

      <div className="footer-container">

        {footerSections.map((section) => (
          <div className="footer-column" key={section.title}>

            <h3>{section.title}</h3>

            {section.links.map((item) => {
              const isObject = typeof item === "object";
              const label = isObject ? item.label : item;

              if (isObject) {
                return (
                  <a key={label} href={item.href}>
                    {label}
                  </a>
                );
              }

              return (
                <a
                  key={label}
                  href="#services"
                  onClick={() => handleServiceClick(label)}
                >
                  {label}
                </a>
              );
            })}

          </div>
        ))}

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Indipay. All rights reserved.
        </p>

        <p>
          Simplifying access to financial, legal and business services.
        </p>
      </div>

    </footer>
  );
}

export default Footer;