import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  X,
  Send,
  MessageCircle,
  ChevronRight,
  RotateCcw,
  Headset,
  LayoutGrid,
  FileText,
  Search,
  Phone,
  Mail,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import "./Chatbot.css";

/* -------------------------------------------------------------------------
   Data
   ---------------------------------------------------------------------- */

const CONTACT = {
  phone: "+91 96567 45269",
  phoneHref: "tel:+919656745269",
  office: "0495 2762250",
  officeHref: "tel:04952762250",
  email: "communication@jaytrade.in",
  whatsappHref: "https://wa.me/919656745269",
};

// Each service can list aliases so "home loan", "gst" or "credit score" still match.
const GROUPS = [
  {
    id: "financial-services",
    name: "Financial Services",
    keywords: ["loan", "loans", "finance", "financial", "funding", "credit"],
    items: [
      { name: "Housing Loan", aliases: ["home loan", "house loan"] },
      { name: "Property Loan", aliases: ["loan against property", "mortgage"] },
      { name: "Personal Loan", aliases: [] },
      {
        name: "Business Loan – Secured",
        aliases: ["secured business loan", "business loan secured"],
      },
      {
        name: "Business Loan – Unsecured",
        aliases: ["unsecured business loan", "business loan unsecured"],
      },
      {
        name: "Take Over Loan",
        aliases: ["takeover loan", "loan takeover", "balance transfer"],
      },
      { name: "MSME Loan", aliases: ["msme"] },
    ],
  },
  {
    id: "legal-services",
    name: "Legal Services",
    keywords: ["legal", "registration", "licence", "license", "certificate", "tax", "compliance"],
    items: [
      {
        name: "CIBIL Report",
        aliases: ["cibil", "cibil score", "credit score", "credit report"],
      },
      { name: "MSME", aliases: ["msme registration", "udyam"] },
      { name: "Mudra Project Report", aliases: ["mudra", "mudra loan", "project report"] },
      { name: "GST Registration", aliases: ["gst"] },
      {
        name: "ITR – Income Tax Filing",
        aliases: ["itr", "income tax", "income tax return", "tax filing"],
      },
      { name: "FSSAI Registration", aliases: ["fssai"] },
      { name: "FSSAI License", aliases: ["fssai", "fssai licence"] },
      { name: "Import Export Code", aliases: ["iec", "import export"] },
      { name: "ISO Certificate", aliases: ["iso", "iso certification"] },
      { name: "Company Registration", aliases: ["company", "private limited", "pvt ltd"] },
      { name: "Partnership Registration", aliases: ["partnership", "partnership firm"] },
      { name: "LLP Registration", aliases: ["llp"] },
      { name: "Trademark Services", aliases: ["trademark", "brand registration"] },
      {
        name: "Police Clearance Certificate",
        aliases: ["pcc", "police clearance", "police verification"],
      },
      { name: "Vyapar Mithra", aliases: ["vyapar mitra", "vyapar"] },
    ],
  },
  {
    id: "business-development",
    name: "Business Development",
    keywords: ["business development", "franchise", "associate", "opportunit"],
    items: [
      { name: "Business Associate", aliases: ["associate"] },
      { name: "Virtual Franchise", aliases: ["franchise"] },
      { name: "Normal Franchise", aliases: ["franchise"] },
      { name: "Premium Franchise", aliases: ["franchise"] },
    ],
  },
  {
    id: "jaytrade-jobs",
    name: "Jaytrade Jobs",
    keywords: ["job", "jobs", "career", "employment", "udyog"],
    items: [
      { name: "Udyog Registration", aliases: ["udyog"] },
      { name: "Udyog Plus Registration", aliases: ["udyog plus"] },
      { name: "Standard Registration", aliases: [] },
      { name: "Corporate Plus", aliases: [] },
    ],
  },
  {
    id: "jaytrade-times",
    name: "Jaytrade Times & Technologies",
    keywords: ["times", "technolog", "advertis", "media", "promotion", "marketing"],
    items: [
      { name: "Growup Package", aliases: ["grow up", "growup"] },
      { name: "Standard Package", aliases: [] },
      { name: "Premium Package", aliases: [] },
      { name: "Corporate Package", aliases: [] },
    ],
  },
];

const POPULAR = ["Housing Loan", "GST Registration", "CIBIL Report", "ITR – Income Tax Filing"];

const MENU = [
  { id: "services", label: "Explore services", hint: "Loans, legal and more", query: "What services do you offer?", icon: LayoutGrid },
  { id: "apply", label: "How to apply", hint: "Steps, start to finish", query: "How do I apply?", icon: FileText },
  { id: "track", label: "Track application", hint: "See where it stands", query: "Track my application", icon: Search },
  { id: "support", label: "Contact support", hint: "Call, WhatsApp, email", query: "Contact support", icon: Phone },
];

const QUICK_BAR = [
  { label: "Services", query: "What services do you offer?", icon: LayoutGrid },
  { label: "How to apply", query: "How do I apply?", icon: FileText },
  { label: "Track", query: "Track my application", icon: Search },
  { label: "Wallet", query: "Open my wallet", icon: Wallet },
  { label: "Support", query: "Contact support", icon: Headset },
];

const MENU_CHIPS = [
  { label: "Explore services", query: "What services do you offer?" },
  { label: "How to apply", query: "How do I apply?" },
  { label: "Contact support", query: "Contact support" },
];

const STORAGE_KEY = "indipay-chat-v2";

/* -------------------------------------------------------------------------
   Matching helpers
   ---------------------------------------------------------------------- */

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[–—-]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ALL_SERVICES = GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    name: item.name,
    groupId: group.id,
    groupName: group.name,
    keys: [normalize(item.name), ...item.aliases.map(normalize)],
  }))
);

const SERVICE_BY_NAME = Object.fromEntries(ALL_SERVICES.map((s) => [s.name, s]));

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = temp;
    }
  }
  return row[b.length];
}

// Returns every service tied for the best match. Falls back to typo-tolerant matching.
function findServices(msg) {
  const padded = ` ${msg} `;
  let best = 0;
  let hits = [];

  ALL_SERVICES.forEach((service) => {
    let score = 0;
    service.keys.forEach((key) => {
      if (padded.includes(` ${key} `)) {
        score = Math.max(score, key.split(" ").length * 100 + key.length);
      }
    });
    if (score > best) {
      best = score;
      hits = [service];
    } else if (score > 0 && score === best) {
      hits.push(service);
    }
  });

  if (hits.length) return { matches: hits, fuzzy: false };

  const words = msg.split(" ").filter(Boolean);
  let bestDistance = 99;
  let fuzzyHits = [];

  ALL_SERVICES.forEach((service) => {
    service.keys.forEach((key) => {
      if (key.length < 5) return;
      const size = key.split(" ").length;
      const allowed = key.length >= 9 ? 2 : 1;
      for (let i = 0; i + size <= words.length; i += 1) {
        const distance = editDistance(words.slice(i, i + size).join(" "), key);
        if (distance > 0 && distance <= allowed) {
          if (distance < bestDistance) {
            bestDistance = distance;
            fuzzyHits = [service];
          } else if (distance === bestDistance && !fuzzyHits.includes(service)) {
            fuzzyHits.push(service);
          }
        }
      }
    });
  });

  return { matches: fuzzyHits, fuzzy: fuzzyHits.length > 0 };
}

function findGroup(msg) {
  let best = null;
  let bestScore = 0;
  GROUPS.forEach((group) => {
    const score = group.keywords.filter((k) => msg.includes(k)).length;
    if (score > bestScore) {
      best = group;
      bestScore = score;
    }
  });
  return best;
}

/* -------------------------------------------------------------------------
   Reply engine. Pure function: message in, structured reply out.
   ---------------------------------------------------------------------- */

const serviceChips = (service) => [
  { label: "Open details", do: { type: "service", name: service.name, groupId: service.groupId }, primary: true },
  { label: "How to apply", query: `How do I apply for ${service.name}` },
  { label: "Documents", query: `What documents are needed for ${service.name}` },
  { label: "Charges", query: `What are the charges for ${service.name}` },
];

function buildReply(raw, ctx) {
  const msg = normalize(raw);
  const words = msg.split(" ").filter(Boolean);
  const is = (re) => re.test(msg);

  const found = findServices(msg);
  const service = found.matches.length === 1 ? found.matches[0] : null;
  const candidates = found.matches.length > 1 ? found.matches : null;
  const target = service || (!candidates ? ctx.lastService : null);
  const typoNote = service && found.fuzzy ? `I think you mean **${service.name}**.\n\n` : "";

  const askWhich = (prefix, lead) =>
    candidates
      ? {
          text: `${lead} Which one do you mean?`,
          services: candidates.map((c) => c.name),
          servicePrefix: prefix,
        }
      : {
          text: `${lead} Which service is this for? Pick one below or type its name.`,
          services: POPULAR,
          servicePrefix: prefix,
        };

  // Small talk
  if (words.length <= 5 && is(/^(hi+|hello|hey|namaste|namaskaram|good (morning|afternoon|evening))\b/)) {
    return {
      text: "Hello, welcome to Indipay. I can help you find a service, walk you through applying, or connect you with our team.\n\nWhat would you like to do?",
      menu: true,
    };
  }
  if (is(/\b(thanks|thank you|thankyou|thx)\b/)) {
    return {
      text: "You're welcome. Anything else I can help with?",
      chips: MENU_CHIPS,
    };
  }
  if (is(/\b(bye|goodbye|see you)\b/) || is(/\b(thats all|nothing else)\b/)) {
    return { text: "Thanks for chatting with Indipay. Open the assistant any time you need help." };
  }
  if (is(/\bhow are you\b/)) {
    return {
      text: "Doing well, thanks. Are you looking for a service, checking an application, or something else?",
      chips: MENU_CHIPS,
    };
  }

  // Account actions
  if (is(/\b(track|status|my applications?|application history|applied)\b/)) {
    if (!ctx.customer) {
      return {
        text: "Your applications are private, so you'll need to log in to see them.",
        chips: [{ label: "Log in", do: { type: "login" }, primary: true }],
      };
    }
    return {
      text: "Opening your application history.",
      action: { type: "applications" },
    };
  }

  if (is(/\b(wallet|balance|account id|statement|transactions?|payment history)\b/)) {
    if (!ctx.customer) {
      return {
        text: "Please log in to view your wallet and account details.",
        chips: [{ label: "Log in", do: { type: "login" }, primary: true }],
      };
    }
    return { text: "Opening your wallet.", action: { type: "wallet" } };
  }

  if (is(/\b(log ?in|sign ?in|sign ?up|create account|new account)\b/)) {
    return ctx.customer
      ? { text: "You're already signed in. What would you like to do next?", chips: MENU_CHIPS }
      : {
          text: "You can sign in or create an account from the login page.",
          chips: [{ label: "Go to login", do: { type: "login" }, primary: true }],
        };
  }

  if (is(/\b(refund|money back|cancel|cancellation|wrong payment|failed payment|payment failed|deducted)\b/)) {
    return {
      text: "I can't check or process refunds and cancellations from this chat. Our team can look into it if you share your application or transaction details.\n\nDon't share passwords, PINs or OTPs.",
      contact: true,
    };
  }

  if (is(/\b(contact|phone|call|email|mail|support|human|agent|whatsapp|customer care|representative|talk to)\b/)) {
    return { text: "Our team is happy to help. Reach them here:", contact: true };
  }

  // Service questions. These use the service in the message, or the last one discussed.
  if (is(/\b(how long|how many days|duration|timeline|processing time|turnaround|time taken|when will)\b/)) {
    if (!target) return askWhich("Processing time for ", "Timelines depend on the service.");
    return {
      text: `${typoNote}I don't have a verified timeline for **${target.name}**, and I'd rather not guess. Processing time depends on the service and on your documents.\n\nOur team can give you a realistic estimate.`,
      contact: true,
      service: target,
    };
  }

  if (is(/\b(price|pricing|cost|charges?|fees?|how much|rates?|interest|commission)\b/)) {
    if (!target) return askWhich("What are the charges for ", "Charges vary by service.");
    return {
      text: `${typoNote}I don't have a verified current charge for **${target.name}** in this chat, so I won't quote one.\n\nThe service page or our team can confirm the latest amount.`,
      chips: [{ label: "Open details", do: { type: "service", name: target.name, groupId: target.groupId }, primary: true }],
      contact: true,
      service: target,
    };
  }

  if (is(/\b(eligib\w*|qualify|qualification|can i (get|apply))\b/)) {
    if (!target) return askWhich("Am I eligible for ", "Eligibility depends on the service.");
    return {
      text: `${typoNote}Eligibility for **${target.name}** depends on its requirements and your individual details. I can't confirm it here.\n\nReview the service page, or ask our team for a personal check.`,
      chips: [{ label: "Open details", do: { type: "service", name: target.name, groupId: target.groupId }, primary: true }],
      contact: true,
      service: target,
    };
  }

  if (is(/\b(documents?|docs|required|requirements?|paperwork|what do i need|what is needed)\b/)) {
    if (!target) return askWhich("What documents are needed for ", "Required documents depend on the service.");
    return {
      text: `${typoNote}The documents for **${target.name}** can vary with your situation. The most reliable list is on the service details page.\n\nIf anything is unclear, our team can confirm.`,
      chips: [
        { label: "Open details", do: { type: "service", name: target.name, groupId: target.groupId }, primary: true },
        { label: "Contact support", query: "Contact support" },
      ],
      service: target,
    };
  }

  if (is(/\b(apply|application process|get started|how to start|procedure|process)\b/)) {
    if (candidates) return askWhich("How do I apply for ", "Happy to explain.");
    if (target) {
      return {
        text: `${typoNote}To apply for **${target.name}**:\n\n1. Open the service details page.\n2. Read the details and requirements.\n3. Select **Apply Now**.\n4. Complete and submit the form.\n5. Follow progress under **My Applications**.\n\nOur team reviews each submission, so approval and timing depend on the service.`,
        chips: [
          { label: `Open ${target.name}`, do: { type: "service", name: target.name, groupId: target.groupId }, primary: true },
          { label: "Documents", query: `What documents are needed for ${target.name}` },
        ],
        service: target,
      };
    }
    return {
      text: "Here's how to apply through Indipay:\n\n1. Browse services and pick the one you need.\n2. Read its details and requirements.\n3. Select **Apply Now**.\n4. Complete and submit the form.\n5. Follow progress under **My Applications**.\n\nOur team reviews each submission, so approval and timing depend on the service.",
      chips: [
        { label: "Explore services", query: "What services do you offer?", primary: true },
        { label: "Track application", query: "Track my application" },
      ],
    };
  }

  // Browsing
  if (candidates) {
    return { text: "A few services match that. Which one do you mean?", services: candidates.map((c) => c.name) };
  }

  if (service) {
    return {
      text: `${typoNote}**${service.name}** is part of ${service.groupName}.\n\nOpen its page to read the details and apply. I can also explain the steps, documents or charges.`,
      chips: serviceChips(service),
      service,
    };
  }

  const group = findGroup(msg);
  if (group) {
    return {
      text: `**${group.name}** has ${group.items.length} services. Select one for details.`,
      services: group.items.map((i) => i.name),
      chips: [
        { label: "Open full category", do: { type: "category", id: group.id } },
        { label: "All categories", query: "What services do you offer?" },
      ],
    };
  }

  if (is(/\b(services?|offer|provide|offerings|explore|catalogue|catalog|browse|categories|products)\b/)) {
    return {
      text: "We have five service categories. Choose one to see what's inside.",
      categories: true,
    };
  }

  if (is(/\b(help|what can you do|options|what can i ask)\b/)) {
    return {
      text: "I can help you:\n\n• Find a service and its category\n• Understand how to apply\n• Check what documents or eligibility to expect\n• Track an application or open your wallet\n• Reach the Jaytrade team\n\nTry “How do I apply for a housing loan?”",
      menu: true,
    };
  }

  // Fallback
  const here = ctx.currentService?.name
    ? `\n\nYou're currently viewing **${ctx.currentService.name}**. I can explain its steps or connect you with support.`
    : "";
  return {
    text: `I didn't catch that. You can ask about a service, how to apply, documents, your applications, or support.${here}`,
    chips: MENU_CHIPS,
  };
}

/* -------------------------------------------------------------------------
   Small presentational pieces
   ---------------------------------------------------------------------- */

function RichText({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>
  );
}

function ContactCard() {
  return (
    <div className="indipay-chat-contact">
      <a href={CONTACT.phoneHref}>
        <Phone size={16} />
        <span>
          <small>Mobile</small>
          {CONTACT.phone}
        </span>
      </a>
      <a href={CONTACT.officeHref}>
        <Headset size={16} />
        <span>
          <small>Office</small>
          {CONTACT.office}
        </span>
      </a>
      <a href={`mailto:${CONTACT.email}`}>
        <Mail size={16} />
        <span>
          <small>Email</small>
          {CONTACT.email}
        </span>
      </a>
      <a href={CONTACT.whatsappHref} target="_blank" rel="noreferrer" className="is-whatsapp">
        <MessageCircle size={16} />
        <span>
          <small>WhatsApp</small>
          Chat with the team
        </span>
        <ArrowUpRight size={15} />
      </a>
    </div>
  );
}

const makeMessage = (role, content) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  role,
  time: new Date().toISOString(),
  ...content,
});

const welcomeMessage = () =>
  makeMessage("bot", {
    text: "Hi, I'm your Indipay assistant. What do you need help with?",
    menu: true,
  });

function loadMessages() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    /* storage unavailable or corrupted: start fresh */
  }
  return [welcomeMessage()];
}

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
};

/* -------------------------------------------------------------------------
   Component
   ---------------------------------------------------------------------- */

function Chatbot({
  customer,
  currentService,
  onOpenApplications,
  onLogin,
  onOpenWallet,
  onOpenCategory,
  onOpenService, // optional: (serviceName, categoryId) => void. Falls back to onOpenCategory.
  hideLauncher = false,
  externalOpenSignal = 0,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(loadMessages);
  const [isTyping, setIsTyping] = useState(false);

  const previousExternalOpenSignal = useRef(externalOpenSignal);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastServiceRef = useRef(null);
  const timers = useRef([]);

  const later = useCallback((fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (externalOpenSignal === previousExternalOpenSignal.current) return undefined;
    previousExternalOpenSignal.current = externalOpenSignal;
    if (externalOpenSignal <= 0) return undefined;
    const id = window.setTimeout(() => setIsOpen(true), 0);
    return () => window.clearTimeout(id);
  }, [externalOpenSignal]);

  const closeChat = () => setIsOpen(false);

  const runAction = (action) => {
    if (!action) return;
    if (action.type === "applications") onOpenApplications?.();
    if (action.type === "wallet") onOpenWallet?.();
    if (action.type === "login") onLogin?.();
    if (action.type === "category") onOpenCategory?.(action.id);
    if (action.type === "service") {
      if (onOpenService) onOpenService(action.name, action.groupId);
      else onOpenCategory?.(action.groupId);
    }
    closeChat();
  };

  const pushBot = (reply) => {
    setIsTyping(true);
    const delay = 350 + Math.min((reply.text?.length || 0) * 3, 500);

    later(() => {
      const { action, ...content } = reply;
      delete content.service;
      setMessages((previous) => [...previous, makeMessage("bot", content)]);
      setIsTyping(false);
      if (action) later(() => runAction(action), 700);
    }, delay);
  };

  const sendMessage = (query = input, display = query) => {
    const text = query.trim();
    if (!text || isTyping) return;

    setMessages((previous) => [...previous, makeMessage("user", { text: display.trim() })]);
    setInput("");

    const reply = buildReply(text, { customer, currentService, lastService: lastServiceRef.current });
    if (reply.service) lastServiceRef.current = reply.service;
    pushBot(reply);
  };

  const handleChip = (chip) => {
    if (isTyping) return;
    if (chip.do) {
      if (chip.do.type === "login") {
        runAction(chip.do);
        return;
      }
      const service = SERVICE_BY_NAME[chip.do.name];
      if (service) lastServiceRef.current = service;
      runAction(chip.do);
      return;
    }
    sendMessage(chip.query, chip.label);
  };

  const handleServiceRow = (name, prefix = "") => {
    sendMessage(`${prefix}${name}`, name);
  };

  const resetChat = () => {
    clearTimers();
    lastServiceRef.current = null;
    setIsTyping(false);
    setInput("");
    setMessages([welcomeMessage()]);
  };

  const lastBotId = [...messages].reverse().find((m) => m.role === "bot")?.id;

  return (
    <>
      {isOpen && (
        <section
          className="indipay-chat-window"
          role="dialog"
          aria-label="Indipay Assistant"
          onKeyDown={(event) => event.key === "Escape" && closeChat()}
        >
          <header className="indipay-chat-header">
            <div className="indipay-chat-avatar">
              <Bot size={22} />
            </div>

            <div className="indipay-chat-heading">
              <strong>Indipay Assistant</strong>
              <span>
                <i /> Online · Replies instantly
              </span>
            </div>

            <button type="button" aria-label="Start a new conversation" title="New conversation" onClick={resetChat}>
              <RotateCcw size={17} />
            </button>
            <button type="button" aria-label="Close chat" onClick={closeChat}>
              <X size={20} />
            </button>
          </header>

          <div className="indipay-chat-messages" role="log" aria-live="polite">
            {messages.map((message) => {
              const isBot = message.role === "bot";
              const showChips = isBot && message.id === lastBotId && !isTyping && message.chips?.length;

              return (
                <div key={message.id} className={`indipay-chat-message ${isBot ? "bot" : "user"}`}>
                  {isBot && (
                    <span className="indipay-chat-message-avatar">
                      <Bot size={15} />
                    </span>
                  )}

                  <div className="indipay-chat-stack">
                    <div className="indipay-chat-bubble">
                      <RichText text={message.text} />
                    </div>

                    {message.contact && <ContactCard />}

                    {message.menu && (
                      <div className="indipay-chat-menu">
                        {MENU.map(({ id, label, hint, query, icon: Icon }) => (
                          <button
                            type="button"
                            key={id}
                            className="indipay-chat-menu-card"
                            disabled={isTyping}
                            onClick={() => sendMessage(query, label)}
                          >
                            <span className="chat-action-icon">
                              <Icon size={18} />
                            </span>
                            <strong>{label}</strong>
                            <small>{hint}</small>
                          </button>
                        ))}
                      </div>
                    )}

                    {message.categories && (
                      <div className="indipay-chat-list">
                        {GROUPS.map((group) => (
                          <button
                            type="button"
                            key={group.id}
                            disabled={isTyping}
                            onClick={() => sendMessage(group.name, group.name)}
                          >
                            <span>
                              {group.name}
                              <small>{group.items.length} services</small>
                            </span>
                            <ChevronRight size={18} />
                          </button>
                        ))}
                      </div>
                    )}

                    {message.services && (
                      <div className="indipay-chat-list">
                        {message.services.map((name) => (
                          <button
                            type="button"
                            key={name}
                            disabled={isTyping}
                            onClick={() => handleServiceRow(name, message.servicePrefix)}
                          >
                            <span>{name}</span>
                            <ChevronRight size={18} />
                          </button>
                        ))}
                      </div>
                    )}

                    {showChips ? (
                      <div className="indipay-chat-chips">
                        {message.chips.map((chip) => (
                          <button
                            type="button"
                            key={chip.label}
                            className={chip.primary ? "is-primary" : ""}
                            onClick={() => handleChip(chip)}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <time className="indipay-chat-time" dateTime={message.time}>
                      {formatTime(message.time)}
                    </time>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="indipay-chat-message bot">
                <span className="indipay-chat-message-avatar">
                  <Bot size={15} />
                </span>
                <div className="indipay-chat-bubble indipay-chat-typing" aria-label="Assistant is typing">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="indipay-chat-quickbar" aria-label="Quick actions">
            {QUICK_BAR.map(({ label, query, icon: Icon }) => (
              <button type="button" key={label} disabled={isTyping} onClick={() => sendMessage(query, label)}>
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <form
            className="indipay-chat-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              ref={inputRef}
              value={input}
              maxLength={300}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about a service, or how to apply"
              aria-label="Type your message"
              autoComplete="off"
            />
            <button type="submit" disabled={!input.trim() || isTyping} aria-label="Send message">
              <Send size={18} />
            </button>
          </form>

          <div className="indipay-chat-footer">Automated assistant. Our team confirms charges and eligibility.</div>
        </section>
      )}

      {!isOpen && !hideLauncher && (
        <button
          type="button"
          className="indipay-chat-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open Indipay Assistant"
        >
          <MessageCircle size={24} />
          <span>Talk To AI</span>
        </button>
      )}
    </>
  );
}

export default Chatbot;
