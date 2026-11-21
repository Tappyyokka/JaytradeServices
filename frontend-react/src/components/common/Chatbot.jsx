
import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import "./Chatbot.css";

const serviceGroups = [
  {
    name: "Financial Services",
    items: [
      "Housing Loan",
      "Property Loan",
      "Personal Loan",
      "Business Loan – Secured",
      "Business Loan – Unsecured",
      "Take Over Loan",
      "MSME Loan",
    ],
  },
  {
    name: "Legal Services",
    items: [
      "CIBIL Report",
      "MSME",
      "Mudra Project Report",
      "GST Registration",
      "ITR – Income Tax Filing",
      "FSSAI Registration",
      "FSSAI License",
      "Import Export Code",
      "ISO Certificate",
      "Company Registration",
      "Partnership Registration",
      "LLP Registration",
      "Trademark Services",
      "Police Clearance Certificate",
      "Vyapar Mithra",
    ],
  },
  {
    name: "Business Development",
    items: [
      "Business Associate",
      "Virtual Franchise",
      "Normal Franchise",
      "Premium Franchise",
    ],
  },
  {
    name: "Jaytrade Jobs",
    items: [
      "Udyog Registration",
      "Udyog Plus Registration",
      "Standard Registration",
      "Corporate Plus",
    ],
  },
  {
    name: "Jaytrade Times & Technologies",
    items: [
      "Growup Package",
      "Standard Package",
      "Premium Package",
      "Corporate Package",
    ],
  },
];

const initialMessage = {
  role: "bot",
  text: "Hi, I'm your Indipay assistant. What do you need help with?",
};

function Chatbot({
  customer,
  currentService,
  onOpenApplications,
  onLogin,
  onOpenCategory,
  hideLauncher = false,
  externalOpenSignal = 0,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const previousExternalOpenSignal = useRef(externalOpenSignal);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([initialMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (externalOpenSignal === previousExternalOpenSignal.current) {
      return undefined;
    }

    previousExternalOpenSignal.current = externalOpenSignal;

    if (externalOpenSignal <= 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsOpen(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [externalOpenSignal]);

  const addBotMessage = (text) => {
    setIsTyping(true);

    setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        { role: "bot", text },
      ]);
      setIsTyping(false);
    }, 450);
  };

  const chatbotCategories = [
  { id: "financial-services", name: "Financial Services" },
  { id: "legal-services", name: "Legal Services" },
  { id: "business-development", name: "Business Development" },
  { id: "jaytrade-jobs", name: "Jaytrade Jobs" },
  { id: "jaytrade-times", name: "Jaytrade Times & Technologies" },
];

  const showServices = () => {
  setShowCategories(true);

  addBotMessage(
    "Here are our service categories. Please select a category to explore the available services."
  );
};

  const showApplicationHelp = () => {
    addBotMessage(
      "Here's how to apply through Indipay:\n\n1. Explore the available services.\n2. Select the service you're interested in.\n3. Read the service details and requirements.\n4. Select Apply Now.\n5. Complete and submit the application form.\n\nYou can then track your application through My Applications.\n\nOur team will review your submission. Approval and processing depend on the service and its requirements."
    );
  };

  const showApplications = () => {
    if (customer) {
      addBotMessage(
        "Sure! I'll take you to your personal application history."
      );

      setTimeout(() => {
        onOpenApplications?.();
        setIsOpen(false);
      }, 700);
    } else {
      addBotMessage(
        "You'll need to log in to view your applications. Your application information is private and only available through your account."
      );

      setTimeout(() => {
        onLogin?.();
        setIsOpen(false);
      }, 1200);
    }
  };

  const showContact = () => {
    addBotMessage(
      "Our team is here to help!\n\n📞 Phone: +91 96567 45269\n☎️ Office: 0495 2762250\n✉️ Email: communication@jaytrade.in\n\nYou can also contact our team through WhatsApp."
    );
  };

  const getResponse = (rawMessage) => {
    const message = rawMessage.toLowerCase().trim();

    if (
      /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(
        message
      )
    ) {
      return "Hello! 👋 Welcome to Indipay. How can I help you today?";
    }

    if (
      /(my application|track application|application status|check application|where.*application)/.test(
        message
      )
    ) {
      showApplications();
      return null;
    }

    if (
      /(how.*apply|application process|how.*application|apply for)/.test(
        message
      )
    ) {
      return "Here's how to apply through Indipay:\n\n1. Explore our services.\n2. Select the service you need.\n3. Review its details.\n4. Click Apply Now.\n5. Complete and submit the form.\n\nAfter submission, you can track your application through My Applications.";
    }

    if (
      /(financial|loan|housing loan|personal loan|property loan|msme loan)/.test(
        message
      )
    ) {
      return `We offer several financial services:\n\n${serviceGroups[0].items.join(
        "\n"
      )}\n\nWhich one would you like to explore?`;
    }

    if (
      /(legal|gst|itr|income tax|fssai|trademark|registration|cibil|iso|llp)/.test(
        message
      )
    ) {
      return `Our Legal Services include:\n\n${serviceGroups[1].items.join(
        "\n"
      )}\n\nTell me which service you're interested in.`;
    }

    if (
      /(franchise|business associate|business development|partner)/.test(
        message
      )
    ) {
      return `Our Business Development opportunities include:\n\n${serviceGroups[2].items.join(
        "\n"
      )}\n\nWould you like to explore one of these opportunities?`;
    }

    if (
      /(job|jobs|udyog|employment|career)/.test(message)
    ) {
      return `Jaytrade Jobs offers these packages:\n\n${serviceGroups[3].items.join(
        "\n"
      )}\n\nWould you like to know more about a particular package?`;
    }

    if (
      /(times|technology|technologies|advertising|media|growup package)/.test(
        message
      )
    ) {
      return `Jaytrade Times & Technologies offers:\n\n${serviceGroups[4].items.join(
        "\n"
      )}\n\nWhich package would you like to explore?`;
    }

    if (
      /(contact|phone|email|support|human|talk to someone|whatsapp)/.test(
        message
      )
    ) {
      return "You can contact our support team:\n\n📞 +91 96567 45269\n☎️ 0495 2762250\n✉️ communication@jaytrade.in";
    }

    if (
      /(price|cost|charge|fee|amount|how much)/.test(message)
    ) {
      return "Service charges can vary depending on the service and your requirements. I don't have verified live pricing information yet. Please contact our team at +91 96567 45269 for the latest charges.";
    }

    if (
      /(eligibility|eligible|documents|required documents|requirements)/.test(
        message
      )
    ) {
      return "Requirements and documents depend on the service you choose. Please open that service's details page to review the available information, or contact our team at +91 96567 45269 for assistance.";
    }

    if (
      /(thank you|thanks|thank)/.test(message)
    ) {
      return "You're welcome! 😊 We're happy to help. Is there anything else you'd like to know?";
    }

    if (
      /(help|what can you do|options)/.test(message)
    ) {
      return "I can help you with:\n\n• Exploring Indipay services\n• Financial and legal services\n• Business development opportunities\n• Jaytrade Jobs and Times packages\n• Application guidance\n• Application tracking\n• Contacting our support team\n\nChoose one of the options below!";
    }

    if (currentService?.name) {
      return `You're currently exploring ${currentService.name}.\n\nI can help with general information about this service, but I don't have verified details about its exact pricing or eligibility requirements. Would you like help with the application process or contacting our team?`;
    }

    return "I'm sorry, I couldn't quite understand that. 😅 Try asking about our services, application process, application status or customer support. You can also choose one of the quick options below.";
  };

  const sendMessage = (text = input) => {
    const message = text.trim();

    if (!message || isTyping) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text: message },
    ]);

    setInput("");

    const response = getResponse(message);

    if (response) {
      addBotMessage(response);
    }
  };

  const handleQuickAction = (action) => {
    if (action === "services") {
      showServices();
    } else if (action === "application") {
      showApplicationHelp();
    } else if (action === "tracking") {
      showApplications();
    } else if (action === "contact") {
      showContact();
    }
  };

  const resetChat = () => {
  setMessages([initialMessage]);
  setInput("");
  setIsTyping(false);
  setShowCategories(false);
};

  return (
    <>
      {isOpen && (
        <section className="indipay-chat-window">
          <header className="indipay-chat-header">
            <div className="indipay-chat-avatar">
              <Bot size={25} />
            </div>

            <div className="indipay-chat-heading">
              <strong>Indipay Assistant</strong>
              <span>
                <i /> Online · Here to help
              </span>
            </div>

            <button
              type="button"
              aria-label="Reset conversation"
              onClick={resetChat}
              title="New conversation"
            >
              <RotateCcw size={17} />
            </button>

            <button
              type="button"
              aria-label="Close chatbot"
              onClick={() => setIsOpen(false)}
            >
              <X size={21} />
            </button>
          </header>

          <div className="indipay-chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`indipay-chat-message ${
                  message.role === "user" ? "user" : "bot"
                }`}
              >
                {message.role === "bot" && (
                  <span className="indipay-chat-message-avatar">
                    <Bot size={16} />
                  </span>
                )}

                <div className="indipay-chat-bubble">
                  {message.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="indipay-chat-message bot">
                <span className="indipay-chat-message-avatar">
                  <Bot size={16} />
                </span>
                <div className="indipay-chat-bubble indipay-chat-typing">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}

            {!isTyping && (
  <>
    {!showCategories ? (
  <div className="indipay-chat-quick-help">
    <div className="indipay-chat-quick-actions">
      {[
        {
          id: "services",
          label: "Explore services",
          description: "Loans and more",
          icon: LayoutGrid,
        },
        {
          id: "application",
          label: "How to apply",
          description: "Steps and documents",
          icon: FileText,
        },
        {
          id: "tracking",
          label: "Track application",
          description: "See your status",
          icon: Search,
        },
        {
          id: "contact",
          label: "Contact support",
          description: "Call, chat or email",
          icon: Phone,
        },
      ].map((action) => {
        const Icon = action.icon;

        return (
          <button
            type="button"
            key={action.id}
            className="indipay-chat-category-option"
            onClick={() => handleQuickAction(action.id)}
          >
            <span className="chat-action-icon">
              <Icon size={19} />
            </span>

            <strong>{action.label}</strong>
            <small>{action.description}</small>
          </button>
        );
      })}
    </div>
  </div>
) : (
  <div className="indipay-chat-quick-help">

    <span className="indipay-chat-quick-label">
      EXPLORE SERVICE CATEGORIES
    </span>

        <div className="indipay-chat-category-options">
          {chatbotCategories.map((category) => (
            
            <button
              type="button"
              key={category.id}
              className="indipay-chat-category-option"
              onClick={() => {
                onOpenCategory?.(category.id);
                setIsOpen(false);
              }}
            >
              <span>{category.name}</span>
              <ChevronRight size={19} />
            </button>
          ))}
          <button
  type="button"
  className="indipay-chat-category-option indipay-chat-back-option"
  onClick={() => setShowCategories(false)}
>
  <span>← Back to Quick Help</span>
</button>
        </div>
      </div>
    )}
  </>
)}

            <div ref={messagesEndRef} />
          </div>

          <div className="indipay-chat-support-strip">
  <span>Need a person instead?</span>

  <button
    type="button"
    onClick={showContact}
  >
    <Headset size={16} />
    Talk to support
  </button>
</div>

          <form
            className="indipay-chat-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask me anything..."
              aria-label="Type your message"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <Send size={19} />
            </button>
          </form>

          <div className="indipay-chat-footer">
            Indipay Virtual Assistant · Automated responses
          </div>
        </section>
      )}

      {!isOpen && !hideLauncher && (
  <button
    type="button"
    className="indipay-chat-launcher"
    onClick={() => setIsOpen(true)}
    aria-label="Open Indipay Assistant"
  >
    <MessageCircle size={26} />
    <span>Talk To AI</span>
  </button>
)}
    </>
  );
}

export default Chatbot;
