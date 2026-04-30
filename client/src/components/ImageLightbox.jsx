import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // <-- The magic teleportation tool!

export function ImageLightbox({ src, alt = "Image", onClose }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const zoom = (delta) => {
    setScale((prev) => Math.min(5, Math.max(0.5, prev + delta)));
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleWheelEvent = (e) => {
      e.preventDefault();
      setScale((prev) =>
        Math.min(5, Math.max(0.5, prev + (e.deltaY < 0 ? 0.2 : -0.2))),
      );
    };

    element.addEventListener("wheel", handleWheelEvent, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheelEvent);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (e.target === imgRef.current) {
      setDragging(true);
      dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging || !dragStart.current) return;
    setPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const reset = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  // We save the entire UI into a variable
  const lightboxContent = (
    <div
      ref={containerRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)", // Made slightly darker for better contrast
        zIndex: 9999, // Super high z-index to ensure it beats everything
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: dragging ? "grabbing" : "default",
        userSelect: "none",
      }}
    >
      {/* Controls */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          display: "flex",
          gap: "8px",
          zIndex: 10000,
        }}
      >
        <button onClick={() => zoom(0.3)} title="Zoom In" style={ctrlBtn}>
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth="2"
          >
            <path
              strokeLinecap="square"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </button>
        <button onClick={() => zoom(-0.3)} title="Zoom Out" style={ctrlBtn}>
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth="2"
          >
            <path
              strokeLinecap="square"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6"
            />
          </svg>
        </button>
        <button onClick={reset} title="Reset" style={ctrlBtn}>
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth="2"
          >
            <path
              strokeLinecap="square"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
        <button
          onClick={onClose}
          title="Close"
          style={{ ...ctrlBtn, background: "rgba(192,57,43,0.8)" }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth="2"
          >
            <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Zoom indicator */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.6)",
          color: "rgba(255,255,255,0.7)",
          padding: "6px 16px",
          fontSize: "12px",
          letterSpacing: "0.06em",
          zIndex: 10000,
          whiteSpace: "nowrap",
        }}
      >
        {Math.round(scale * 100)}% &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp;
        Click outside to close
      </div>

      {/* Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        style={{
          maxWidth: scale === 1 ? "90vw" : "none",
          maxHeight: scale === 1 ? "90vh" : "none",
          objectFit: "contain",
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: dragging ? "none" : "transform 0.15s ease",
          cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );

  // AND HERE IS THE TELEPORTATION!
  // We render the UI directly into the <body> instead of inside your page layout.
  return createPortal(lightboxContent, document.body);
}

const ctrlBtn = {
  width: "36px",
  height: "36px",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.2)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s",
};

// Wrapper: makes any image clickable to open lightbox
export function ClickableImage({ src, alt, style = {}, imgStyle = {} }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{ cursor: "zoom-in", display: "inline-block", ...style }}
        title="Click to view full size"
      >
        <img src={src} alt={alt} style={{ display: "block", ...imgStyle }} />
      </div>
      {open && (
        <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
