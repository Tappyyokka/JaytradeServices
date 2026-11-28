import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import "../../pages/ApplicationRegistration.css";

export default function SlideToPay({ onPay, disabled }) {
  const track = useRef(null);
  const drag = useRef(null);
  const [position, setPosition] = useState(0);
  const [confirm, setConfirm] = useState(false);
  return <>
    <div ref={track} className="registration-slider" aria-hidden="true">
      <span>{disabled ? "Processing…" : "Slide to Pay"}</span>
      <div className="registration-slider-thumb" style={{ left: position }}
        onPointerDown={(event) => {
          if (disabled || !event.isPrimary || event.button !== 0) return;
          const distance = track.current.clientWidth - event.currentTarget.clientWidth - 4;
          drag.current = { x: event.clientX, distance };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          setPosition(Math.max(0, Math.min(drag.current.distance, event.clientX - drag.current.x)));
        }}
        onPointerUp={(event) => {
          const start = drag.current;
          drag.current = null;
          setPosition(0);
          if (start && event.clientX - start.x >= start.distance - 3) onPay();
        }}
        onPointerCancel={() => { drag.current = null; setPosition(0); }}>
        <ChevronRight size={22} />
      </div>
    </div>
    {!confirm ? <button type="button" disabled={disabled} onClick={() => setConfirm(true)}>Confirm without swiping</button> :
      <div className="registration-confirm"><p>Confirm this demo wallet payment?</p>
        <button type="button" disabled={disabled} onClick={onPay}>Confirm payment</button>
        <button type="button" disabled={disabled} onClick={() => setConfirm(false)}>Cancel</button>
      </div>}
  </>;
}
