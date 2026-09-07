import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export default function CustomCursor({ mode = "reticle" }) {
  const cursorRef = useRef(null);

  useEffect(() => {
    if (mode === "native") {
      document.body.classList.remove("custom-cursor-active");
      return;
    }

    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      document.body.classList.remove("custom-cursor-active");
      return;
    }

    document.body.classList.add("custom-cursor-active");
    const cursor = cursorRef.current;
    if (!cursor) return;

    let isVisible = false;

    // Direct synchronous GPU transform without React re-render
    const onPointerMove = (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!isVisible) {
        cursor.style.opacity = "1";
        isVisible = true;
      }
    };

    const onMouseDown = () => cursor.classList.add("is-clicking");
    const onMouseUp = () => cursor.classList.remove("is-clicking");
    const onMouseLeave = () => {
      cursor.style.opacity = "0";
      isVisible = false;
    };
    const onMouseEnter = () => {
      cursor.style.opacity = "1";
      isVisible = true;
    };

    // Instant O(1) event delegation for hover states
    const onPointerOver = (e) => {
      const target = e.target;
      if (!target) return;

      if (target.closest("input, textarea, [contenteditable='true']")) {
        cursor.classList.add("is-text");
        cursor.classList.remove("is-hover");
      } else if (
        target.closest('a, button, [role="button"], select, label, .chip, .status-btn')
      ) {
        cursor.classList.add("is-hover");
        cursor.classList.remove("is-text");
      }
    };

    const onPointerOut = (e) => {
      const related = e.relatedTarget;
      if (!related) {
        cursor.classList.remove("is-hover", "is-text");
        return;
      }
      if (!related.closest("input, textarea, [contenteditable='true']")) {
        cursor.classList.remove("is-text");
      }
      if (!related.closest('a, button, [role="button"], select, label, .chip, .status-btn')) {
        cursor.classList.remove("is-hover");
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });
    document.addEventListener("mouseenter", onMouseEnter, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
    };
  }, [mode]);

  if (mode === "native") return null;

  return (
    <div ref={cursorRef} className="custom-cursor-wrapper">
      {mode === "reticle" && (
        <div className="reticle-root">
          <div className="cursor-dot" />
          <div className="cursor-ring">
            <span className="tick tick-t" />
            <span className="tick tick-b" />
            <span className="tick tick-l" />
            <span className="tick tick-r" />
          </div>
        </div>
      )}

      {mode === "dot" && (
        <div className="laser-dot-root">
          <div className="laser-dot" />
        </div>
      )}
    </div>
  );
}

CustomCursor.propTypes = {
  mode: PropTypes.oneOf(["reticle", "dot", "native"]),
};