
import { useState } from "react";

const slides = [
  {
    tag: "YOUR FINANCIAL PARTNER",
    title: "Your Goals.",
    highlight: "Our Solutions.",
    description:
      "Discover financial services designed to simplify your journey and help you move forward with confidence.",
    button: "Explore Our Services",
    visual: "₹",
    visualTitle: "Financial Freedom",
    visualText: "Solutions for every milestone",
  },
  {
    tag: "BUSINESS MADE SIMPLER",
    title: "Build Better.",
    highlight: "Grow Bigger.",
    description:
      "From business registration to professional assistance, find the support you need to grow.",
    button: "Explore Business Services",
    visual: "↗",
    visualTitle: "Business Growth",
    visualText: "Your ambitions deserve support",
  },
  {
    tag: "ONE PLATFORM. MANY SOLUTIONS.",
    title: "Everything You Need.",
    highlight: "One Destination.",
    description:
      "Access financial, legal and business services through one convenient platform.",
    button: "Discover Indipay",
    visual: "✦",
    visualTitle: "All-in-One Services",
    visualText: "Convenience at your fingertips",
  },
];

function IndexHero() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  const previous = () => {
    setCurrent((current - 1 + slides.length) % slides.length);
  };

  const next = () => {
    setCurrent((current + 1) % slides.length);
  };

  return (
    <section className="index-hero">
      <div className="hero-inner">

        <div className="hero-copy" key={current}>
          <span className="hero-tag">
            <span className="hero-tag-line"></span>
            {slide.tag}
          </span>

          <h1>
            {slide.title}
            <br />
            <span>{slide.highlight}</span>
          </h1>

          <p>{slide.description}</p>

          <button className="hero-cta">
            {slide.button}
            <span>↗</span>
          </button>

          <div className="hero-caption">
            <span>✦</span>
            Financial · Legal · Business Solutions
          </div>
        </div>

        <div className="hero-art">

          <div className="hero-glow"></div>
          <div className="hero-ring ring-one"></div>
          <div className="hero-ring ring-two"></div>

          <div className="hero-feature-card">
            <div className="feature-card-top">
              <span>INDIPAY</span>
              <span className="feature-dot">●</span>
            </div>

            <div className="feature-symbol" key={current}>
              {slide.visual}
            </div>

            <h3>{slide.visualTitle}</h3>
            <p>{slide.visualText}</p>

            <div className="feature-card-bottom">
              <span>FINANCIAL PARTNER</span>
              <span>01 — 03</span>
            </div>
          </div>

          <div className="hero-float float-one">
            <span>₹</span>
            <div>
              <strong>Financial Services</strong>
              <small>Smart solutions</small>
            </div>
          </div>

          <div className="hero-float float-two">
            <span>⚖</span>
            <div>
              <strong>Legal Services</strong>
              <small>Expert assistance</small>
            </div>
          </div>

          <div className="hero-float float-three">
            <span>↗</span>
            <div>
              <strong>Business Support</strong>
              <small>Grow with confidence</small>
            </div>
          </div>

        </div>

        <button
          className="hero-control hero-prev"
          onClick={previous}
          aria-label="Previous slide"
        >
          ←
        </button>

        <button
          className="hero-control hero-next"
          onClick={next}
          aria-label="Next slide"
        >
          →
        </button>

        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={current === index ? "active" : ""}
              onClick={() => setCurrent(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default IndexHero;
