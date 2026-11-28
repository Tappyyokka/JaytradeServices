import { useEffect, useRef, useState } from "react";
import { ArrowRight, Send, X, Zap } from "lucide-react";
import { answerIndibot } from "./indibotRules";
import { indibotCopy } from "./indibotTranslations";
import "./Indibot.css";

const languageKey = "indipay-indibot-language";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function Indibot({ catalog, onOpenProduct, onOpenTab, open, onOpenChange }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem(languageKey) === "ml" ? "ml" : "en"; }
    catch { return "en"; }
  });
  const copy = indibotCopy[language];
  const greeting = { id: 0, text: copy.greeting, language };
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
  }, [open, messages, language]);

  function changeLanguage(next) {
    setLanguage(next);
    try { localStorage.setItem(languageKey, next); }
    catch { /* The selection still applies during this visit. */ }
  }

  function close() {
    onOpenChange(false);
    launcher.current?.focus();
  }

  function send(question) {
    const text = question.trim();
    if (!text) return;
    const reply = answerIndibot(text, catalog, lastProductId.current, language);
    if (reply.products.length) lastProductId.current = reply.products[0].id;
    const id = messageId.current;
    messageId.current += 2;
    setMessages((previous) => [...previous, { id, text, user: true }, { id: id + 1, language, ...reply }]);
    setInput("");
  }

  function openProduct(product) {
    lastProductId.current = product.id;
    close();
    onOpenProduct(product);
  }

  return (
    <div className="indibot" lang={language}>
      <button
        ref={launcher}
        className="indibot-launcher"
        type="button"
        aria-label={open ? copy.close : copy.open}
        aria-expanded={open}
        aria-controls={open ? "indibot-panel" : undefined}
        title={open ? copy.close : copy.ask}
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
            <div><h2 id="indibot-title">IndiBot</h2><p>{copy.assistant}</p></div>
            <select className="indibot-language" value={language} aria-label={copy.language} onChange={(event) => changeLanguage(event.target.value)}>
              <option value="en" lang="en">English</option>
              <option value="ml" lang="ml">മലയാളം</option>
            </select>
            <button type="button" aria-label={copy.close} onClick={close}><X size={20} aria-hidden="true" /></button>
          </div>
          <div ref={chatLog} className="indibot-log" role="log" aria-label={copy.conversation} tabIndex={0}>
            {[greeting, ...messages].map((message) => (
              <div key={message.id} lang={message.language} className={message.user ? "indibot-message indibot-user" : "indibot-message"}>
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
                    <span>{indibotCopy[message.language].tabs[message.tab]}</span><ArrowRight size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {messages.length === 0 && <div className="indibot-prompts">
            {copy.prompts.map((prompt) => <button key={prompt} type="button" onClick={() => { send(prompt); inputElement.current?.focus(); }}>{prompt}</button>)}
          </div>}
          <form className="indibot-form" onSubmit={(event) => { event.preventDefault(); send(input); inputElement.current?.focus(); }}>
            <input ref={inputElement} aria-label={copy.ask} value={input} onChange={(event) => setInput(event.target.value)} maxLength={300} placeholder={copy.placeholder} />
            <button type="submit" disabled={!input.trim()} aria-label={copy.send}><Send size={18} aria-hidden="true" /></button>
          </form>
        </section>
      )}
    </div>
  );
}
