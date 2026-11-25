import { useState } from "react";
import { BadgeCheck, Star, ThumbsUp } from "lucide-react";

export default function ProductReviews({ product }) {
  const reviews = product.reviews ?? [];
  const [rating, setRating] = useState("");
  const [sort, setSort] = useState("newest");
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState([]);
  const matching = reviews.filter((review) => !rating || review.rating === Number(rating))
    .sort((a, b) => sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));

  return (
    <section className="mp-detail-panel mp-reviews" aria-labelledby="mp-reviews-title">
      <h2 id="mp-reviews-title">Ratings and reviews</h2>
      {reviews.length > 0 ? <>
        <p className="mp-detail-muted">Demo reviews and purchase indicators</p>
        <div className="mp-review-summary">
          <div><strong>{(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)} / 5</strong><p>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p></div>
          <div className="mp-rating-distribution">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((review) => review.rating === stars).length;
              return <div key={stars}><span>{stars} <Star size={12} aria-hidden="true" /></span>
                <progress max={reviews.length} value={count} aria-label={stars + "-star reviews"} /><span>{count}</span></div>;
            })}
          </div>
        </div>
        <div className="mp-review-controls">
          <label>Rating<select value={rating} onChange={(event) => setRating(event.target.value)}>
            <option value="">All ratings</option>{[5, 4, 3, 2, 1].map((stars) => <option key={stars} value={stars}>{stars} {stars === 1 ? "star" : "stars"}</option>)}
          </select></label>
          <label>Review date<select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
          </select></label>
        </div>
        {matching.length === 0 && <p>No reviews match this rating.</p>}
        {(expanded ? matching : matching.slice(0, 2)).map((review) => {
          const voted = helpful.includes(review.id);
          return <article className="mp-review" key={review.id}>
            <header><strong>{review.author}</strong><time dateTime={review.date}>{new Date(review.date).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "UTC" })}</time></header>
            <div className="mp-review-meta"><span><Star size={14} aria-hidden="true" /> {review.rating} / 5</span>
              {review.demoPurchase && <span><BadgeCheck size={14} aria-hidden="true" /> Demo verified purchase</span>}
            </div>
            <p>{review.text}</p>
            {review.images?.length > 0 && <div className="mp-review-photos">{review.images.map((image, index) => (
              <img key={image} src={image} alt={"Review photo " + (index + 1) + " by " + review.author} loading="lazy" decoding="async"
                onError={(event) => { event.currentTarget.hidden = true; }} />
            ))}</div>}
            <button type="button" className="mp-detail-button" aria-pressed={voted}
              onClick={() => setHelpful((previous) => previous.includes(review.id) ? previous.filter((id) => id !== review.id) : [...previous, review.id])}>
              <ThumbsUp size={15} aria-hidden="true" /> Helpful ({(review.helpful ?? 0) + Number(voted)})
            </button>
          </article>;
        })}
        {matching.length > 2 && <button type="button" className="mp-detail-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show fewer reviews" : "View All Reviews"}
        </button>}
      </> : <p>{product.rating ? product.rating.toFixed(1) + " / 5 · " : ""}No written reviews yet.</p>}
      <p className="mp-detail-muted" id="mp-review-eligibility">Review submissions will require a completed purchase.</p>
      <button type="button" className="mp-detail-button" disabled aria-describedby="mp-review-eligibility">Write a review</button>
    </section>
  );
}
