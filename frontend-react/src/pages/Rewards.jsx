
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Gift,
  Sparkles,
  Clock,
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


function ScratchCard({ reward, onCopy }) {
  const canvasRef = useRef(null);
  const scratchingRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const card = canvas.parentElement;
    if (!card) return;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));

      const ctx = canvas.getContext("2d");
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const gradient = ctx.createLinearGradient(
        0, 0, rect.width, rect.height
      );

      gradient.addColorStop(0, "#D8DCE3");
      gradient.addColorStop(0.5, "#F5F6F8");
      gradient.addColorStop(1, "#BEC5D0");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Scratch instruction
      ctx.fillStyle = "#667085";
      ctx.font = "800 13px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        "SCRATCH TO REVEAL",
        rect.width / 2,
        rect.height / 2 - 12
      );

      ctx.font = "30px Arial";
      ctx.fillText(
        "✦",
        rect.width / 2,
        rect.height / 2 + 23
      );
    };

    setupCanvas();

    const resizeObserver = new ResizeObserver(setupCanvas);
    resizeObserver.observe(card);

    return () => resizeObserver.disconnect();
  }, []);

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
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    // Check scratched percentage occasionally
    if (Math.random() < 0.2) {
      const image = ctx.getImageData(
        0, 0, canvas.width, canvas.height
      );

      let transparent = 0;

      for (let i = 3; i < image.data.length; i += 4) {
        if (image.data[i] < 10) transparent++;
      }

      const percentage =
        transparent / (image.data.length / 4);

      if (percentage >= 0.55) {
        setRevealed(true);
        scratchingRef.current = false;
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
    if (scratchingRef.current) {
      scratch(event);
    }
  };

  const handlePointerUp = () => {
    scratchingRef.current = false;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reward.code);

      setCopied(true);
      onCopy?.(reward.code);

      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className={`reward-card reward-${reward.color}`}>

      <div className="reward-card-top">
        <span className="reward-category">
          {reward.category}
        </span>

        <span className="reward-new-label">
          INDIPAY REWARD
        </span>
      </div>

      <div className="reward-value-area">
        <span className="reward-value">{reward.value}</span>
        <Gift size={34} />
      </div>

      <h3>{reward.title}</h3>

      <p className="reward-description">
        {reward.description}
      </p>

      <div className="reward-scratch-area">
        
<div className={`reward-reveal-content ${revealed ? "revealed" : ""}`}>
  <span>YOUR REWARD CODE</span>

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

      </div>

      <div className="reward-card-footer">
        <span>
          <Clock size={13} /> {reward.expiry}
        </span>

        <span>{revealed ? "Revealed" : "Scratch card"}</span>
      </div>

      <small className="reward-terms">
        {reward.terms}
      </small>

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

    </article>
  );
}


export default function Rewards({ customer, onBack }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [copiedCode, setCopiedCode] = useState("");

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
            {filteredRewards.map((reward) => (
              <ScratchCard
                key={reward.id}
                reward={reward}
                onCopy={setCopiedCode}
              />
            ))}
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

    </div>
  );
}
