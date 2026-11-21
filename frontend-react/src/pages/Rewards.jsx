
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Gift,
  Sparkles,
  Copy,
  Check,
  TicketPercent,
  PartyPopper,
  Wallet,
  ChevronRight,
} from "lucide-react";
import "./Rewards.css";

const dummyRewards = [
  {
    id: 1,
    title: "Welcome Reward",
    value: "₹100",
    description: "Welcome cashback for new Indipay customers",
    category: "Welcome",
    code: "WELCOME100",
    expiry: "Valid for 6 months",
    terms: "One-time welcome reward. Subject to eligibility.",
    color: "orange",
    status: "available",
  },
  {
    id: 2,
    title: "Legal Services Offer",
    value: "15% OFF",
    description: "Discount on eligible legal services",
    category: "Services",
    code: "LEGAL15",
    expiry: "Valid for 6 months",
    terms: "Applicable to eligible legal services only.",
    color: "navy",
    status: "available",
  },
  {
    id: 3,
    title: "Financial Services Bonus",
    value: "₹250",
    description: "Special promotional reward on eligible services",
    category: "Financial",
    code: "FINANCE250",
    expiry: "Valid for 6 months",
    terms: "Subject to service and offer eligibility.",
    color: "gold",
    status: "available",
  },
  {
    id: 4,
    title: "Refer & Earn",
    value: "₹50",
    description: "Reward for a successful eligible referral",
    category: "Referral",
    code: "REFER50",
    expiry: "Valid for 6 months",
    terms: "Referral conditions apply.",
    color: "orange",
    status: "available",
  },
  {
    id: 5,
    title: "Festival Special",
    value: "10% OFF",
    description: "A special discount on selected services",
    category: "Special",
    code: "FESTIVE10",
    expiry: "Valid for 6 months",
    terms: "Valid on selected services only.",
    color: "navy",
    status: "available",
  },
];



function ScratchCard({ reward, revealed, onReveal }) {
  const canvasRef = useRef(null);
  const scratchingRef = useRef(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;

    const card = canvas.parentElement;
    if (!card) return;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));

      const ctx = canvas.getContext("2d");
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      
const coverColors = {
  orange: { background: "#F28C28", pattern: "#C65D0A" },
  navy: { background: "#387FE0", pattern: "#1760B5" },
  gold: { background: "#E9B94D", pattern: "#B18A27" },
};

const colors = coverColors[reward.color] || coverColors.orange;

ctx.clearRect(0, 0, rect.width, rect.height);

// Same colourful cover as the Rewards page
ctx.fillStyle = colors.background;
ctx.fillRect(0, 0, rect.width, rect.height);

ctx.strokeStyle = colors.pattern;
ctx.fillStyle = colors.pattern;
ctx.globalAlpha = 0.65;
ctx.lineWidth = 5;

// Decorative dots
[
  [0.68, 0.18],
  [0.48, 0.58],
  [0.14, 0.72],
  [0.62, 0.88],
].forEach(([x, y]) => {
  ctx.beginPath();
  ctx.arc(rect.width * x, rect.height * y, 9, 0, Math.PI * 2);
  ctx.fill();
});

// Gift illustrations
const drawGift = (x, y, size, rotation = 0) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.lineWidth = 5;
  ctx.strokeRect(-size / 2, -size / 2, size, size);
  ctx.beginPath();
  ctx.moveTo(-size / 2, -size / 5);
  ctx.lineTo(size / 2, -size / 5);
  ctx.moveTo(0, -size / 2);
  ctx.lineTo(0, size / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-size / 5, -size / 2, size / 6, size / 8, -0.5, 0, Math.PI * 2);
  ctx.ellipse(size / 5, -size / 2, size / 6, size / 8, 0.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

drawGift(rect.width * 0.25, rect.height * 0.3, 48, -0.2);
drawGift(rect.width * 0.78, rect.height * 0.67, 38, 0.3);

// Sparkle illustrations
const drawSparkle = (x, y, size) => {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const radius = i % 2 === 0 ? size : size * 0.25;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
};

drawSparkle(rect.width * 0.72, rect.height * 0.48, 19);
drawSparkle(rect.width * 0.22, rect.height * 0.78, 11);

// Brand label
ctx.globalAlpha = 0.9;
ctx.fillStyle = "#FFFFFF";
ctx.font = "800 11px Arial";
ctx.textAlign = "right";
ctx.textBaseline = "top";
ctx.fillText("INDIPAY REWARDS", rect.width - 16, 16);

ctx.globalAlpha = 1;

    };

    setupCanvas();

    const resizeObserver = new ResizeObserver(setupCanvas);
    resizeObserver.observe(card);

    return () => resizeObserver.disconnect();
  }, [revealed, reward.color]);

  const scratch = (event) => {
    if (revealed) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    if (Math.random() < 0.2) {
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparent = 0;

      for (let i = 3; i < image.data.length; i += 4) {
        if (image.data[i] < 10) transparent++;
      }

      const percentage = transparent / (image.data.length / 4);

      if (percentage >= 0.55) {
        scratchingRef.current = false;
        onReveal?.(reward.id);
      }
    }
  };

  const handlePointerDown = (event) => {
    if (revealed) return;

    scratchingRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    scratch(event);
  };

  const handlePointerMove = (event) => {
    if (scratchingRef.current) scratch(event);
  };

  const handlePointerUp = () => {
    scratchingRef.current = false;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reward.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  
return (
  <div className={`reward-scratch-popup-card reward-${reward.color}`}>
    <div className="reward-scratch-hidden-content">
      <span>YOU WON</span>
      <strong className="scratch-reward-value">{reward.value}</strong>
      <h3>{reward.title}</h3>

      <span className="scratch-code-label">YOUR REWARD CODE</span>

      <div className="reward-code-row">
        <strong>{reward.code}</strong>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy reward code"
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}
        </button>
      </div>
    </div>

    {!revealed && (
      <canvas
        ref={canvasRef}
        className="reward-scratch-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    )}
  </div>
);

}



export default function Rewards({ customer, onBack }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedReward, setSelectedReward] = useState(null);
const [revealedRewards, setRevealedRewards] = useState([]);
const handleReveal = (rewardId) => {
  setRevealedRewards((previous) =>
    previous.includes(rewardId)
      ? previous
      : [...previous, rewardId]
  );
};

  const filters = ["All", "Welcome", "Services", "Financial", "Referral", "Special"];

  const filteredRewards =
    activeFilter === "All"
      ? dummyRewards
      : dummyRewards.filter((reward) => reward.category === activeFilter);

  return (
    <div className="indipay-rewards-page">
      <header className="rewards-header">
        <button type="button" onClick={onBack} aria-label="Back to wallet">
          <ArrowLeft size={23} />
        </button>

        <div>
          <strong>Indipay Rewards</strong>
          <span>Discover your exclusive benefits</span>
        </div>

        <Gift size={25} />
      </header>

      <main className="rewards-main">
        <section className="rewards-hero">
          <div className="rewards-hero-content">
            <span>THE INDIPAY ADVANTAGE</span>
            <h1>Rewards made for you.</h1>
            <p>
              {customer?.name
                ? `Hello, ${customer.name}.`
                : "Enjoy exclusive offers and special benefits."}
              {" "}Scratch your cards to reveal exciting rewards.
            </p>
          </div>

          <div className="rewards-hero-icon">
            <PartyPopper size={52} />
            <Sparkles size={22} />
          </div>
        </section>

        <section className="rewards-summary">
          <div>
            <span>AVAILABLE REWARDS</span>
            <strong>{dummyRewards.length.toString().padStart(2, "0")}</strong>
          </div>
          <div>
            <span>REWARD COLLECTION</span>
            <strong><Gift size={24} /></strong>
          </div>
        </section>

        <section className="rewards-list-section">
          <div className="rewards-section-heading">
            <div>
              <span>EXCLUSIVE FOR YOU</span>
              <h2>Your scratch cards</h2>
              <p>Scratch the silver surface to reveal your coupon code.</p>
            </div>
            <TicketPercent size={27} />
          </div>

          <div className="rewards-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          

<div className="rewards-grid">
  {filteredRewards.map((reward) => {
    const isRevealed = revealedRewards.includes(reward.id);

    return (
      <article
        key={reward.id}
        className={`reward-preview reward-preview-${reward.color}`}
        onClick={() => setSelectedReward(reward)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedReward(reward);
          }
        }}
      >
        
{isRevealed ? (
  
<div className="reward-preview-revealed-content">
  <div className="reward-card-top">
    <span className="reward-category">{reward.category}</span>
    <span className="reward-new-label">INDIPAY REWARD</span>
  </div>

  <div className="reward-value-area">
    <span className="reward-value">{reward.value}</span>
    <Gift size={38} />
  </div>

  <h3>{reward.title}</h3>

  <p className="reward-description">{reward.description}</p>

  
<div className="reward-scratch-area">
  <div className="reward-reveal-content revealed">
    <Gift size={24} />
    <span>
      {isRevealed ? "Reward revealed" : "Tap to scratch"}
    </span>
    {!isRevealed && (
      <small>Scratch card →</small>
    )}
  </div>
</div>


  <div className="reward-code-row">
    <strong>{reward.code}</strong>
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        navigator.clipboard.writeText(reward.code);
      }}
      title="Copy reward code"
    >
      <Copy size={17} />
    </button>
  </div>
</div>

) : (
  <>
    <div className="reward-preview-pattern">
      <Gift className="pattern-gift gift-one" size={65} />
      <Gift className="pattern-gift gift-two" size={48} />
      <Sparkles className="pattern-sparkle sparkle-one" size={35} />
      <Sparkles className="pattern-sparkle sparkle-two" size={25} />
      <span className="pattern-dot dot-one" />
      <span className="pattern-dot dot-two" />
      <span className="pattern-dot dot-three" />
      <span className="pattern-dot dot-four" />
    </div>

    <span className="reward-preview-brand">INDIPAY REWARDS</span>
  </>
)}

      </article>
    );
  })}
</div>



          {filteredRewards.length === 0 && (
            <div className="rewards-empty">
              <Gift size={35} />
              <strong>No rewards in this category</strong>
              <p>Check back later for new offers.</p>
            </div>
          )}
        </section>

        <section className="rewards-note">
          <Wallet size={21} />
          <div>
            <strong>Redeem your rewards</strong>
            <p>
              Copy your revealed coupon code and use it when applying for an
              eligible Indipay service. Each offer has its own conditions.
            </p>
          </div>
          <ChevronRight size={18} />
        </section>

        <p className="rewards-disclaimer">
          These are sample rewards for the preview. Actual offers, eligibility,
          redemption and expiry will be managed by Indipay.
        </p>
      </main>



{selectedReward && (
  <div
    className="reward-modal-overlay"
    onClick={() => setSelectedReward(null)}
  >
    <div
      className="reward-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Scratch to reveal your reward"
      onClick={(event) => event.stopPropagation()}
    >
      <ScratchCard
        reward={selectedReward}
        revealed={revealedRewards.includes(selectedReward.id)}
        onReveal={handleReveal}
      />

      {revealedRewards.includes(selectedReward.id) && (
        <p className="reward-modal-success">
          <Check size={17} />
          Your reward has been revealed!
        </p>
      )}
    </div>
  </div>
)}



    </div>
  );
}
