import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";

export default function MatrixRain({ color = "#4ade80", onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Matrix characters (Katakana + Numbers + Latin)
    const characters =
      "アカサタナハマヤラワイキシチニヒミリヰウクスツヌフムユルエケセテネヘメレヱオコソトノホモヨロヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&*+-/=";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    const draw = () => {
      // Translucent black trail
      ctx.fillStyle = "rgba(4, 7, 5, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head of stream is brighter
        if (Math.random() > 0.92) {
          ctx.fillStyle = "#ffffff";
        } else {
          ctx.fillStyle = color;
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [color]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/95">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span
          className="text-xs px-2.5 py-1 rounded border bg-black/80 backdrop-blur font-mono"
          style={{ borderColor: color, color }}
        >
          MATRIX RAIN · ESC to exit
        </span>
        <button
          onClick={onClose}
          type="button"
          className="p-1.5 rounded-full border bg-black/80 transition hover:scale-110 active:scale-95"
          style={{ borderColor: color, color }}
          title="Exit Matrix Rain"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

MatrixRain.propTypes = {
  color: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
