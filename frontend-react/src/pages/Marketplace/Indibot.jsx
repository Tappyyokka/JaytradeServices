import { useEffect, useRef, useState } from "react";
import { ArrowRight, Send, X, Zap } from "lucide-react";
import { answerIndibot } from "./indibotRules";
import "./Indibot.css";

const prompts = ["What's popular here?", "Best product under 10k", "How do I track my order?"];
const greeting = { id: 0, text: "Hi, I’m IndiBot. Ask me about products, prices, or how to shop on Indipay Marketplace." };
const tabLabels = { shop: "Marketplace Home", categories: "Browse categories", cart: "Open cart", wishlist: "Open wishlist", wallet: "Open wallet", orders: "Open orders" };
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function Indibot({ catalog, onOpenProduct, onOpenTab, open, onOpenChange }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([greeting]);
  const lastProductId = useRef(null);
  const messageId = useRef(1);
  const launcher = useRef(null);
  const inputElement = useRef(null);
  const chatLog = useRef(null);

  useEffect(() => {
    if (open) inputElement.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open && chatLog.current) chatLog.current.scrollTop = chatLog.current.scrollHeight;
  }, [open, messages]);

  function close() {
    onOpenChange(false);
    launcher.current?.focus();
  }

  function send(question) {
    const text = question.trim();
    if (!text) return;
    const reply = answerIndibot(text, catalog, lastProductId.current);
    if (reply.products.length) lastProductId.current = reply.products[0].id;
    const id = messageId.current;
    messageId.current += 2;
    setMessages((previous) => [...previous, { id, text, user: true }, { id: id + 1, ...reply }]);
    setInput("");
  }

  function openProduct(product) {
    lastProductId.current = product.id;
    close();
    onOpenProduct(product);
  }

  return (
    <div className="indibot">
      <button
        ref={launcher}
        className="indibot-launcher"
        type="button"
        aria-label={open ? "Close IndiBot" : "Open IndiBot"}
        aria-expanded={open}
        aria-controls={open ? "indibot-panel" : undefined}
        title={open ? "Close IndiBot" : "Ask IndiBot"}
        onClick={() => open ? close() : onOpenChange(true)}
      >
        {open ? <X size={25} aria-hidden="true" /> : <Zap size={27} aria-hidden="true" />}
      </button>
      {open && (
        <section id="indibot-panel" className="indibot-panel" aria-labelledby="indibot-title" onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}>
          <div className="indibot-heading">
            <Zap size={20} aria-hidden="true" />
            <div><h2 id="indibot-title">IndiBot</h2><p>Marketplace assistant</p></div>
            <button type="button" aria-label="Close chat" onClick={close}><X size={20} aria-hidden="true" /></button>
          </div>
          <div ref={chatLog} className="indibot-log" role="log" aria-label="IndiBot conversation" tabIndex={0}>
            {messages.map((message) => (
              <div key={message.id} className={message.user ? "indibot-message indibot-user" : "indibot-message"}>
                <p>{message.text}</p>
                {message.products?.map((product) => (
                  <button className="indibot-link" type="button" key={product.id} onClick={() => {
                    const current = catalog.find((item) => item.id === product.id);
                    if (current) openProduct(current);
                    else send(`Is ${product.name} available?`);
                  }}>
                    <span>{product.name} · {money.format(product.price)}</span><ArrowRight size={16} aria-hidden="true" />
                  </button>
                ))}
                {message.tab && (
                  <button className="indibot-link" type="button" onClick={() => { close(); onOpenTab(message.tab); }}>
                    <span>{tabLabels[message.tab]}</span><ArrowRight size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {messages.length === 1 && <div className="indibot-prompts">
            {prompts.map((prompt) => <button key={prompt} type="button" onClick={() => { send(prompt); inputElement.current?.focus(); }}>{prompt}</button>)}
          </div>}
          <form className="indibot-form" onSubmit={(event) => { event.preventDefault(); send(input); inputElement.current?.focus(); }}>
            <input ref={inputElement} aria-label="Ask IndiBot" value={input} onChange={(event) => setInput(event.target.value)} maxLength={300} placeholder="Ask about a product…" />
            <button type="submit" disabled={!input.trim()} aria-label="Send message"><Send size={18} aria-hidden="true" /></button>
          </form>
        </section>
      )}
    </div>
  );
}
