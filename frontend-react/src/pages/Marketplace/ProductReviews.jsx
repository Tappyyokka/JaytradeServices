import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Star, ThumbsUp } from "lucide-react";
import marketplaceRequest from "../../config/marketplaceApi";
import { readStoreImage } from "./storeImages";

export default function ProductReviews({ product, access = {} }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const heading = useRef(null);
  const endpoint = "/social/products/" + encodeURIComponent(product.id) + "/reviews";
  const demo = product.demo || product.sample;
  const reviews = demo ? product.reviews ?? [] : data?.reviews ?? [];
  const total = data?.total ?? reviews.length;
  const average = data?.average ?? (total ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : null);
  const [rating, setRating] = useState("");
  const [sort, setSort] = useState("newest");
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState([]);
  const matching = reviews.filter((review) => !rating || review.rating === Number(rating))
    .sort((a, b) => sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));

  useEffect(() => {
    if (access.focus) heading.current?.scrollIntoView({ block: "start" });
  }, [access.focus]);
  useEffect(() => {
    if (demo) return;
    let active = true;
    marketplaceRequest(endpoint).then((result) => { if (active) setData(result); })
      .catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [demo, endpoint, reload]);

  async function submit(event, action, reviewId) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      if (action === "write") {
        const file = fields.get("image");
        await marketplaceRequest(endpoint, "POST", {
          rating: Number(fields.get("rating")), text: fields.get("text"),
          image: file.size ? await readStoreImage(file, 250) : undefined,
        });
        setSubmitted(true);
      } else {
        await marketplaceRequest("/social/reviews/" + encodeURIComponent(reviewId) + "/" + action,
          action === "reply" ? "PUT" : "POST", { [action === "reply" ? "reply" : "reason"]: fields.get("text") });
      }
      setForm("");
      setMessage(action === "report" ? "Review reported." : "Published.");
      if (action !== "report") setReload((value) => value + 1);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="mp-detail-panel mp-reviews" aria-labelledby="mp-reviews-title">
      <h2 id="mp-reviews-title" ref={heading}>Ratings and reviews</h2>
      {total > 0 ? <>
        {demo && <p className="mp-detail-muted">Demo reviews and purchase indicators</p>}
        {total > reviews.length && <p>Showing the latest {reviews.length} reviews. The summary includes all ratings.</p>}
        <div className="mp-review-summary">
          <div><strong>{average.toFixed(1)} / 5</strong><p>{total} {total === 1 ? "review" : "reviews"}</p></div>
          <div className="mp-rating-distribution">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = data ? data.counts[stars] ?? 0 : reviews.filter((review) => review.rating === stars).length;
              return <div key={stars}><span>{stars} <Star size={12} aria-hidden="true" /></span>
                <progress max={total} value={count} aria-label={stars + "-star reviews"} /><span>{count}</span></div>;
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
              {review.verifiedPurchase && <span><BadgeCheck size={14} aria-hidden="true" /> Verified purchase</span>}
            </div>
            <p>{review.text}</p>
            {review.images?.length > 0 && <div className="mp-review-photos">{review.images.map((image, index) => (
              <img key={image} src={image} alt={"Review photo " + (index + 1) + " by " + review.author} loading="lazy" decoding="async"
                onError={(event) => { event.currentTarget.hidden = true; }} />
            ))}</div>}
            {demo && <button type="button" className="mp-detail-button" aria-pressed={voted}
              onClick={() => setHelpful((previous) => previous.includes(review.id) ? previous.filter((id) => id !== review.id) : [...previous, review.id])}>
              <ThumbsUp size={15} aria-hidden="true" /> Helpful ({(review.helpful ?? 0) + Number(voted)})
            </button>}
            {review.reply && <div data-merchant-reply><strong>Merchant reply</strong><p>{review.reply}</p></div>}
            {!demo && access.signedIn && <div className="mp-social-actions">
              {access.canReply && <button type="button" className="mp-detail-button" onClick={() => setForm("reply:" + review.id)}>{review.reply ? "Edit reply" : "Reply"}</button>}
              <button type="button" className="mp-detail-button" onClick={() => setForm("report:" + review.id)}>Report review</button>
            </div>}
            {["reply:" + review.id, "report:" + review.id].includes(form) && <form className="mp-review-form"
              onSubmit={(event) => submit(event, form.split(":")[0], review.id)}>
              <label>{form.startsWith("reply") ? "Merchant reply" : "Reason for reporting"}
                <textarea name="text" required minLength={form.startsWith("reply") ? 2 : 5}
                  maxLength={form.startsWith("reply") ? 1000 : 500} defaultValue={form.startsWith("reply") ? review.reply : ""} />
              </label>
              <button type="submit" disabled={busy}>{form.startsWith("reply") ? "Publish reply" : "Submit report"}</button>
              <button type="button" onClick={() => setForm("")}>Cancel</button>
            </form>}
          </article>;
        })}
        {matching.length > 2 && <button type="button" className="mp-detail-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show fewer reviews" : "View All Reviews"}
        </button>}
      </> : <p>{demo || data ? "No written reviews yet." : message ? "Reviews unavailable." : "Loading reviews…"}</p>}
      {!demo && (submitted || access.alreadyReviewed ? <p>You’ve reviewed this product.</p>
        : access.canReview ? <button type="button" className="mp-detail-button" onClick={() => setForm("write")}>Write a review</button>
          : <p>A delivered purchase is required to review this product.</p>)}
      {form === "write" && <form className="mp-review-form" onSubmit={(event) => submit(event, "write")}>
        <label>Rating <select name="rating" required defaultValue=""><option value="">Choose a rating</option>
          {[5, 4, 3, 2, 1].map((stars) => <option value={stars} key={stars}>{stars} / 5</option>)}</select></label>
        <label>Review <textarea name="text" required minLength={5} maxLength={1500} /></label>
        <label>Photo (optional, up to 250 KB)<input type="file" name="image" accept="image/jpeg,image/png,image/webp" /></label>
        <button type="submit" disabled={busy}>Publish review</button>
        <button type="button" onClick={() => setForm("")}>Cancel</button>
      </form>}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
