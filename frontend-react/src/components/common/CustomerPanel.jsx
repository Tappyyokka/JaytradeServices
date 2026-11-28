import { useEffect, useRef } from "react";

/** A modal surface for account sheets and navigation drawers. */
export default function CustomerPanel({ label, onClose, className, children }) {
  const panel = useRef(null);
  useEffect(() => {
    const trigger = document.activeElement;
    panel.current.querySelector("button, a[href]")?.focus();
    return () => { if (trigger?.isConnected) trigger.focus(); };
  }, []);

  function handleKey(event) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    }
    if (event.key !== "Tab") return;
    const controls = Array.from(panel.current.querySelectorAll(
      "button:not(:disabled), a[href], input:not(:disabled), [tabindex='0']"
    )).filter(element => element.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return <section ref={panel} className={className} role="dialog" aria-modal="true"
    aria-label={label} onClick={event => event.stopPropagation()} onKeyDown={handleKey}>
    {children}
  </section>;
}
