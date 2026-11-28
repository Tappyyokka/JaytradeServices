import { useEffect, useState } from "react";
import API from "../config/api";
import "./AdminCentre.css";

export default function PublishedAdminContent({ channel, merchant = false }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    const path = merchant ? "/merchant-notifications" : "/published/" + channel;
    fetch(API + "/api/admin-centre" + path, { credentials: "include", signal: controller.signal })
      .then((response) => response.ok ? response.json() : [])
      .then((rows) => { if (!controller.signal.aborted && Array.isArray(rows)) setItems(rows); }).catch(() => {});
    return () => controller.abort();
  }, [channel, merchant]);
  if (!items.length) return null;
  return <section className="published-admin-content" aria-label={merchant ? "Merchant notices" : "Published updates"}>
    {items.map((item) => <article key={item.id}>
      {item.image && <img src={item.image} alt="" loading="lazy" />}
      <h2>{item.title}</h2><p>{item.body}</p>
    </article>)}
  </section>;
}

export function SupportRequestForm() {
  const [state, setState] = useState({ busy: false, error: "", id: "" });
  return <details className="published-admin-content"><summary>Contact support or submit a complaint</summary>
    <form className="admin-record-form" onSubmit={async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const body = Object.fromEntries(new FormData(form));
      setState({ busy: true, error: "", id: "" });
      try {
        const response = await fetch(API + "/api/admin-centre/support", {
          credentials: "include", method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not submit the request.");
        form.reset();
        setState({ busy: false, error: "", id: data.id });
      } catch (error) { setState({ busy: false, error: error.message, id: "" }); }
    }}>
      <label>Request type <select name="kind"><option value="support">Support</option><option value="complaint">Complaint</option><option value="dispute">Dispute</option></select></label>
      <label>Subject <input name="subject" required minLength={4} maxLength={140} /></label>
      <label>Details <textarea name="message" required minLength={10} maxLength={2000} /></label>
      <button disabled={state.busy}>Submit request</button>
      {state.error && <p role="alert">{state.error}</p>}
      {state.id && <p role="status">Request received. Reference {state.id}</p>}
    </form>
  </details>;
}
