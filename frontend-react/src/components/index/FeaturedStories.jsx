
const stories = [
  {
    category: "FINANCIAL INSIGHTS",
    title: "Making Financial Services More Accessible",
    description:
      "Discover how the right financial solutions can help you move forward.",
    date: "FEATURED STORY",
    number: "01",
    style: "story-one",
  },
  {
    category: "BUSINESS",
    title: "Building a Stronger Business Future",
    description:
      "Explore opportunities and professional support for your business.",
    date: "LATEST UPDATE",
    number: "02",
    style: "story-two",
  },
  {
    category: "INDIPAY UPDATES",
    title: "One Platform. Multiple Solutions.",
    description:
      "Stay connected with the latest services and announcements from Indipay.",
    date: "COMPANY NEWS",
    number: "03",
    style: "story-three",
  },
];

function FeaturedStories() {
  return (
    <section className="stories-section">

      <div className="stories-container">

        <div className="stories-heading">
          <div>
            <span className="section-tag">EXPLORE & DISCOVER</span>
            <h2>Stories That <span>Matter.</span></h2>
            <p>
              Insights, updates and opportunities from
              the world of finance and business.
            </p>
          </div>

          <button className="stories-view-all">
            View All Stories ↗
          </button>
        </div>

        <div className="stories-grid">

          {stories.map((story) => (
            <article
              className={`story-card ${story.style}`}
              key={story.number}
            >

              <div className="story-banner">
                <span className="story-placeholder">
                  IMAGE PLACEHOLDER
                </span>

                <span className="story-number">
                  {story.number}
                </span>

                <div className="story-banner-decoration">
                  {story.number}
                </div>
              </div>

              <div className="story-content">

                <div className="story-meta">
                  <span>{story.category}</span>
                  <small>{story.date}</small>
                </div>

                <h3>{story.title}</h3>

                <p>{story.description}</p>

                <a href="#stories">
                  Read Story <span>→</span>
                </a>

              </div>

            </article>
          ))}

        </div>

      </div>

    </section>
  );
}

export default FeaturedStories;
