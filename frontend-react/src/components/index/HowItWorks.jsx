
const steps = [
  {
    number: "01",
    icon: "⌕",
    title: "Explore Services",
    description:
      "Discover a range of financial, legal and business services designed to meet different needs.",
  },
  {
    number: "02",
    icon: "◈",
    title: "Choose Your Service",
    description:
      "Find the service that matches your requirement and understand what you need to get started.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Submit Your Request",
    description:
      "Share your details and the necessary information so our team can understand your requirements.",
  },
  {
    number: "04",
    icon: "✓",
    title: "Get Assistance",
    description:
      "Our team guides you through the process and helps you move forward with your request.",
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works-section">
      <div className="how-container">

        <div className="how-heading">
          <span className="how-eyebrow">A SIMPLE JOURNEY</span>

          <h2>
            Getting started
            <br />
            <span>is easier than you think.</span>
          </h2>

          <p>
            We've made accessing essential services simpler.
            Follow four easy steps to get started with Indipay.
          </p>
        </div>

        <div className="how-steps-grid">
          {steps.map((step, index) => (
            <div className="how-step-card" key={step.number}>

              <div className="how-step-top">
                <div className="how-step-icon">
                  {step.icon}
                </div>

                <span className="how-step-number">
                  STEP {step.number}
                </span>
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

              {index !== steps.length - 1 && (
                <div className="how-step-connector">→</div>
              )}

            </div>
          ))}
        </div>

        <div className="how-bottom-note">
          <span>✦</span>
          <p>Your next step starts with a simple choice.</p>
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
