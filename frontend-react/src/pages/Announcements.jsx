import { useState } from "react";
import { ArrowLeft, Megaphone, CalendarDays, Pin } from "lucide-react";
import "./Announcements.css";

const announcements = [
  {
    id: 1,
    title: "Welcome to Indipay!",
    date: "November 4, 2026",
    category: "General",
    pinned: true,
    description:
      "Welcome to Indipay! Explore our financial, legal and business services through one convenient platform. Stay connected for the latest updates and opportunities.",
  },
  {
    id: 2,
    title: "New Services and Opportunities Coming Soon",
    date: "November 4, 2026",
    category: "Updates",
    pinned: false,
    description:
      "We are working on bringing you more services and exciting opportunities. Keep checking this page for future announcements.",
  },
];

function Announcements({ onBack }) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  return (
    <div className="indipay-announcements-page">
      <div className="announcements-header">
        <button type="button" onClick={onBack} className="announcements-back">
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="announcements-heading">
          <span className="announcements-heading-icon">
            <Megaphone size={25} />
          </span>
          <div>
            <h1>Announcements</h1>
            <p>Latest news, updates and important information from Indipay.</p>
          </div>
        </div>
      </div>

      <main className="announcements-content">
        {selectedAnnouncement ? (
          <article className="announcement-detail-card">
            <button
              type="button"
              className="announcement-detail-back"
              onClick={() => setSelectedAnnouncement(null)}
            >
              <ArrowLeft size={16} />
              All Announcements
            </button>

            <span className="announcement-category">
              {selectedAnnouncement.category}
            </span>

            <h2>{selectedAnnouncement.title}</h2>

            <span className="announcement-date">
              <CalendarDays size={15} />
              {selectedAnnouncement.date}
            </span>

            <p>{selectedAnnouncement.description}</p>
          </article>
        ) : (
          <>
            <div className="announcements-section-heading">
              <h2>Latest Updates</h2>
              <span>{announcements.length} Announcements</span>
            </div>

            <div className="announcements-list">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="announcement-card"
                  onClick={() => setSelectedAnnouncement(announcement)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedAnnouncement(announcement);
                    }
                  }}
                >
                  <div className="announcement-card-icon">
                    <Megaphone size={22} />
                  </div>

                  <div className="announcement-card-content">
                    <div className="announcement-card-meta">
                      <span className="announcement-category">
                        {announcement.category}
                      </span>
                      {announcement.pinned && (
                        <span className="announcement-pinned">
                          <Pin size={12} />
                          Pinned
                        </span>
                      )}
                    </div>

                    <h3>{announcement.title}</h3>
                    <p>{announcement.description}</p>

                    <span className="announcement-date">
                      <CalendarDays size={14} />
                      {announcement.date}
                    </span>
                  </div>

                  <span className="announcement-card-arrow">→</span>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Announcements;