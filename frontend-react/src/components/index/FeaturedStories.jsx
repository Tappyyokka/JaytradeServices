
import { useEffect, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import "./FeaturedStories.css";

const stories = [
  {
    category: "FINANCIAL SERVICES",
    name: "Mr. Nidheesh Kumar C P",
    description:
      "A personal journey highlighting financial guidance, opportunities and support through Jaytrade.",
    image: `${import.meta.env.BASE_URL}images/storyboards/secured-1.jpeg`,
    imageAlt: "Nidheesh Kumar customer storyboard",
  },
  {
    category: "BUSINESS DEVELOPMENT",
    name: "Featured Customer",
    description:
      "A story showcasing personal experiences, business opportunities and professional support.",
    image: `${import.meta.env.BASE_URL}images/storyboards/secured-2.jpeg`,
    imageAlt: "Business development customer storyboard",
  },
  {
    category: "FINANCIAL ASSISTANCE",
    name: "Mr. Abhishek",
    description:
      "A customer experience highlighting financial assistance and business support.",
    image: `${import.meta.env.BASE_URL}images/storyboards/secured-3.jpeg`,
    imageAlt: "Abhishek customer storyboard",
  },
];

function FeaturedStories() {
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedStory(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <section className="stories-section" id="stories">
      <div className="stories-container">

        {/* Section Heading */}
        <div className="stories-heading">
          <div>
            <span className="section-tag">
              THE INDIPAY STORYBOARD COLLECTION
            </span>

            <h2>
              Real Stories. <span>Real Impact.</span>
            </h2>

            <p>
              Recognising the people and journeys behind our services.
            </p>
          </div>

          <button
            className="stories-view-all"
            type="button"
          >
            View All Stories <ArrowUpRight size={17} />
          </button>
        </div>

        {/* Storyboard Cards */}
        <div className="stories-grid">
          {stories.map((story, index) => (
            
<article className="story-card" key={story.image}>

  <div className="story-visual">
    <img
      src={story.image}
      alt={story.imageAlt}
      className="story-background-image"
    />

    <span className="story-number">
      {String(index + 1).padStart(2, "0")}
    </span>
  </div>

  <div className="story-content">

    <div className="story-meta">
      <span>{story.category}</span>
      <small>
        STORYBOARD {String(index + 1).padStart(2, "0")}
      </small>
    </div>

    <h3>{story.name}</h3>

    <p>{story.description}</p>

    <button
      className="story-view-button"
      type="button"
      onClick={() => setSelectedStory(story)}
    >
      View Storyboard
      <span>→</span>
    </button>

  </div>
</article>

          ))}
        </div>

      </div>

      {/* Full-size Storyboard Modal */}
      {selectedStory && (
        <div
          className="story-modal"
          onClick={() => setSelectedStory(null)}
        >
          <div
            className="story-modal-content"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedStory.name + " storyboard"}
          >
            <button
              className="story-modal-close"
              type="button"
              onClick={() => setSelectedStory(null)}
              aria-label="Close storyboard"
            >
              <X size={24} />
            </button>

            <img
              src={selectedStory.image}
              alt={selectedStory.imageAlt}
              className="story-modal-image"
            />
          </div>
        </div>
      )}

    </section>
  );
}

export default FeaturedStories;
