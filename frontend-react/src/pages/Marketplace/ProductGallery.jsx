import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";

function Photo({ src, alt, eager = false }) {
  const [failed, setFailed] = useState(false);
  return src && !failed
    ? <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />
    : alt ? <span role="img" aria-label={alt + " unavailable"}><ImageOff size={28} aria-hidden="true" /></span>
      : <ImageOff size={20} aria-hidden="true" />;
}

function Viewer({ photo, name, index, count, move, onClose, swipe, keyboard }) {
  const dialog = useRef(null);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  return (
    <dialog className="mp-image-viewer" ref={dialog} aria-label={"Photos of " + name}
      onCancel={(event) => { event.preventDefault(); onClose(); }} onKeyDown={keyboard}>
      <header>
        <span>{index + 1} / {count}</span>
        <button type="button" aria-pressed={zoom} aria-label={zoom ? "Zoom out" : "Zoom in"} onClick={() => setZoom(!zoom)}>
          {zoom ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
        </button>
        <button type="button" aria-label="Close image viewer" onClick={onClose}><X size={20} /></button>
      </header>
      <div className={zoom ? "mp-viewer-photo mp-viewer-zoomed" : "mp-viewer-photo"} {...(zoom ? {} : swipe)} tabIndex={zoom ? 0 : undefined}>
        <Photo key={photo} src={photo} alt={name + " photo " + (index + 1)} eager />
      </div>
      {count > 1 && <div className="mp-viewer-controls">
        <button type="button" aria-label="Previous photo" onClick={() => move(-1)}><ChevronLeft size={22} /></button>
        <button type="button" aria-label="Next photo" onClick={() => move(1)}><ChevronRight size={22} /></button>
      </div>}
    </dialog>
  );
}

export default function ProductGallery({ images, name }) {
  const [position, setPosition] = useState(0);
  const [viewing, setViewing] = useState(false);
  const start = useRef(null);
  const lastSwipe = useRef(-Infinity);
  const count = images.length;
  const index = Math.min(position, Math.max(0, count - 1));
  const photo = images[index];

  function move(step) {
    if (count > 1) setPosition((current) => (Math.min(current, count - 1) + step + count) % count);
  }

  function keyboard(event) {
    if (count < 2 || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    if (event.target.closest(".mp-viewer-zoomed")) return;
    event.preventDefault();
    event.stopPropagation();
    move(event.key === "ArrowLeft" ? -1 : 1);
  }

  const swipe = {
    onTouchStart: (event) => { start.current = event.touches.length === 1 ? event.touches[0] : null; },
    onTouchCancel: () => { start.current = null; },
    onTouchEnd: (event) => {
      const first = start.current;
      const last = event.changedTouches[0];
      start.current = null;
      if (!first || !last || count < 2) return;
      const dx = last.clientX - first.clientX;
      if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(last.clientY - first.clientY)) return;
      lastSwipe.current = Date.now();
      move(dx < 0 ? 1 : -1);
    },
  };

  return (
    <section className="mp-detail-gallery" aria-label="Product photos" onKeyDown={keyboard}>
      <div className="mp-gallery-stage" {...swipe}>
        <Photo key={photo} src={photo} alt={name + " photo " + (index + 1)} eager />
        {count > 1 && <>
          <button className="mp-gallery-prev" type="button" aria-label="Previous photo" onClick={() => move(-1)}><ChevronLeft size={22} /></button>
          <button className="mp-gallery-next" type="button" aria-label="Next photo" onClick={() => move(1)}><ChevronRight size={22} /></button>
        </>}
        {photo && (
          <button className="mp-gallery-open" type="button" aria-label="Open full-screen photo viewer" onClick={(event) => {
            if (event.detail === 0 || Date.now() - lastSwipe.current > 400) setViewing(true);
          }}><Maximize2 size={19} /></button>
        )}
        {count > 0 ? <span className="mp-gallery-position" aria-live="polite">{index + 1} / {count}</span> : <small>No product photos yet</small>}
      </div>
      {count > 1 && <div className="mp-detail-thumbnails">
        {images.map((image, offset) => <button key={image + offset} type="button" aria-label={"View photo " + (offset + 1)}
          aria-pressed={index === offset} onClick={() => setPosition(offset)}><Photo src={image} alt="" /></button>)}
      </div>}
      {viewing && photo && <Viewer photo={photo} name={name} index={index} count={count} move={move}
        onClose={() => setViewing(false)} swipe={swipe} keyboard={keyboard} />}
    </section>
  );
}
