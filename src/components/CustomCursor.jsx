import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const crosshairRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia(
      "(hover: none) and (pointer: coarse)"
    ).matches;
    if (isTouch) return;

    const crosshair = crosshairRef.current;
    if (!crosshair) return;

    const onMove = (e) => {
      setVisible(true);
      // No lerp/lag — a reticle should track 1:1 with the pointer.
      crosshair.style.left = `${e.clientX}px`;
      crosshair.style.top = `${e.clientY}px`;
    };

    const onEnter = () => setIsHovering(true);
    const onLeave = () => setIsHovering(false);

    const bind = () => {
      document
        .querySelectorAll(
          'a, button, [role="button"], input, textarea, select, label'
        )
        .forEach((el) => {
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
        });
    };

    bind();
    window.addEventListener("mousemove", onMove);

    const observer = new MutationObserver(bind);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={crosshairRef}
      className={`custom-cursor-crosshair ${isHovering ? "hover" : ""} ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="crosshair-arm top" />
      <span className="crosshair-arm bottom" />
      <span className="crosshair-arm left" />
      <span className="crosshair-arm right" />
      <span className="crosshair-dot" />
    </div>
  );
}