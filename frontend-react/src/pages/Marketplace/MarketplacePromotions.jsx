import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, ShoppingBag } from "lucide-react";
import { promotionalBanners, shoppingBudgets } from "./marketplaceData";

const slideCount = promotionalBanners.length;

export function PromotionalCarousel({ onExplore }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touch = useRef(null);
  const lastSwipeAt = useRef(-Infinity);
  const banner = promotionalBanners[index];
  const rotating = !paused && !hovered && !focused;

  useEffect(() => {
    if (!rotating) return;
    const timeout = window.setTimeout(() => setIndex((index + 1) % slideCount), 5000);
    return () => window.clearTimeout(timeout);
  }, [index, rotating]);

  function move(direction) {
    setIndex((current) => (current + direction + slideCount) % slideCount);
  }

  function finishSwipe(event) {
    const start = touch.current;
    const end = event.changedTouches[0];
    touch.current = null;
    if (!start || !end) return;
    const horizontal = end.clientX - start.clientX;
    const vertical = end.clientY - start.clientY;
    if (Math.abs(horizontal) < 40 || Math.abs(horizontal) <= Math.abs(vertical)) return;
    lastSwipeAt.current = Date.now();
    move(horizontal < 0 ? 1 : -1);
  }

  return (
    <section className="mp-hero" aria-label="Promotional offers" aria-roledescription="carousel"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
      <div className="mp-hero-slide" aria-live={rotating ? "off" : "polite"}
        onTouchStart={(event) => { touch.current = event.touches.length === 1 ? event.touches[0] : null; }}
        onTouchEnd={finishSwipe}
        onTouchCancel={() => { touch.current = null; }}
      >
        <div className="mp-hero-copy">
          <span className="mp-hero-category">Demo offer · {banner.category}</span>
          <h2>{banner.title}</h2>
          <p>{banner.description}</p>
          <button type="button" className="mp-hero-cta" aria-label={"Shop now in " + banner.category} onClick={(event) => {
            if (event.detail === 0 || Date.now() - lastSwipeAt.current > 400) onExplore(banner.category);
          }}>Shop Now <ArrowRight size={16} aria-hidden="true" /></button>
        </div>
        <div className="mp-hero-art">
          <ShoppingBag size={42} aria-hidden="true" />
          <img key={banner.image} src={banner.image} alt="" decoding="async" fetchPriority={index === 0 ? "high" : undefined}
            onError={(event) => { event.currentTarget.hidden = true; }} />
        </div>
      </div>
      <div className="mp-hero-controls">
        <button type="button" aria-label="Previous offer" onClick={() => move(-1)}><ChevronLeft size={18} aria-hidden="true" /></button>
        {promotionalBanners.map(({ category }, position) => (
          <button key={category} type="button" className="mp-hero-dot" aria-label={"Show " + category + " offer"}
            aria-current={position === index ? "true" : undefined} onClick={() => setIndex(position)} />
        ))}
        <button type="button" aria-label="Next offer" onClick={() => move(1)}><ChevronRight size={18} aria-hidden="true" /></button>
        <button type="button" className="mp-hero-play" aria-label={paused ? "Play automatic rotation" : "Pause automatic rotation"}
          onClick={() => setPaused(!paused)}>
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}

function FlashCountdown() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Every visit on the same day counts down to local midnight.
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const seconds = Math.ceil((midnight.getTime() - now) / 1000);
  const time = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");

  return <span className="mp-flash-countdown" role="timer" aria-label="Time until tonight's demo deals end">{time}</span>;
}

export function FlashDeals({ products, renderProduct, onViewAll }) {
  return (
    <section className="mp-section mp-flash" aria-labelledby="mp-flash-title">
      <div className="mp-flash-heading">
        <h2 id="mp-flash-title">Flash Deals</h2>
        <FlashCountdown />
        <button type="button" className="mp-promotion-button" onClick={onViewAll}>View All <ChevronRight size={16} aria-hidden="true" /></button>
      </div>
      <p>Demo offers · Sample sales progress</p>
      {products.length > 0
        ? <div className="mp-flash-strip" tabIndex={0} aria-label="Scrollable flash deal products">
          {products.map(({ product, sold }) => renderProduct(product, sold))}
        </div>
        : <p>No demo deals are available right now.</p>}
    </section>
  );
}

export function ShopByBudget({ money, onSelect }) {
  return (
    <section className="mp-section" aria-labelledby="mp-budget-title">
      <h2 id="mp-budget-title">Shop by Budget</h2>
      <div className="mp-budget-grid">
        {shoppingBudgets.map((budget) => (
          <button type="button" key={budget} onClick={() => onSelect(budget)}>Under <strong>{money.format(budget)}</strong></button>
        ))}
      </div>
    </section>
  );
}
