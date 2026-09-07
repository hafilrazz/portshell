import { useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  Copy,
  Check,
  Github,
  Linkedin,
  Globe,
  Radio,
  Sparkles,
} from "lucide-react";
import { profile } from "../../data/portfolio";

export default function GuiContactView({ theme }) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // Open mailto link
    const subject = encodeURIComponent(`Portfolio Inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.open(`mailto:${profile.email}?subject=${subject}&body=${body}`, "_blank");

    setDispatched(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setDispatched(false), 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {/* Contact Form */}
      <div
        className="rounded-xl border p-4 space-y-3"
        style={{
          borderColor: "var(--hairline)",
          background: "rgba(0, 0, 0, 0.28)",
        }}
      >
        <div className="flex items-center gap-2 border-b pb-2.5 border-[var(--hairline)]">
          <Radio size={14} style={{ color: theme.primary }} />
          <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primaryBright }}>
            TRANSMISSION TERMINAL // DIRECT MESSAGE
          </h4>
        </div>

        {dispatched ? (
          <div
            className="rounded-lg border p-4 text-center space-y-2"
            style={{
              borderColor: theme.primary,
              background: `${theme.primary}15`,
              color: theme.primaryBright,
            }}
          >
            <Sparkles size={24} className="mx-auto" />
            <div className="font-bold text-xs">TRANSMISSION PREPARED</div>
            <p className="text-[11px] text-[var(--phosphor-mid)]">
              Mail client opened to transmit message to {profile.email}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label className="block text-[11px] text-[var(--phosphor-dim)] mb-1">
                CALLSIGN / YOUR NAME
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Linus Torvalds"
                className="w-full text-xs px-3 py-1.5 rounded-md bg-black/40 border border-[var(--hairline)] text-[var(--phosphor-bright)] placeholder-[var(--phosphor-dim)] focus:outline-none focus:border-[var(--hairline-strong)]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--phosphor-dim)] mb-1">
                FREQUENCY / YOUR EMAIL
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. linus@kernel.org"
                className="w-full text-xs px-3 py-1.5 rounded-md bg-black/40 border border-[var(--hairline)] text-[var(--phosphor-bright)] placeholder-[var(--phosphor-dim)] focus:outline-none focus:border-[var(--hairline-strong)]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--phosphor-dim)] mb-1">
                PAYLOAD / MESSAGE
              </label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Type your message, opportunity, or idea..."
                className="w-full text-xs px-3 py-1.5 rounded-md bg-black/40 border border-[var(--hairline)] text-[var(--phosphor-bright)] placeholder-[var(--phosphor-dim)] focus:outline-none focus:border-[var(--hairline-strong)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border transition hover:scale-[1.01] active:scale-[0.99]"
              style={{
                borderColor: theme.primary,
                background: `${theme.primary}25`,
                color: theme.primaryBright,
              }}
            >
              <Send size={12} />
              Transmit Message
            </button>
          </form>
        )}
      </div>

      {/* Social and Quick Connect */}
      <div className="space-y-3">
        {/* Email Quick Copy Card */}
        <div
          className="rounded-xl border p-4 space-y-2.5"
          style={{
            borderColor: "var(--hairline)",
            background: "rgba(0, 0, 0, 0.28)",
          }}
        >
          <div className="text-[11px] text-[var(--phosphor-dim)] uppercase tracking-wider">
            PRIMARY TRANSMISSION CHANNEL
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg bg-black/40 border border-[var(--hairline)] p-2.5">
            <div className="flex items-center gap-2 truncate text-xs font-mono" style={{ color: theme.primaryBright }}>
              <Mail size={14} style={{ color: theme.primary }} />
              <span className="truncate">{profile.email}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="p-1.5 rounded border border-[var(--hairline)] hover:bg-white/10 transition text-xs flex items-center gap-1 shrink-0"
              style={{ color: "var(--phosphor-mid)" }}
            >
              {copied ? (
                <>
                  <Check size={12} className="text-green-400" />
                  <span className="text-[10px] text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Network Nodes */}
        <div
          className="rounded-xl border p-4 space-y-2"
          style={{
            borderColor: "var(--hairline)",
            background: "rgba(0, 0, 0, 0.28)",
          }}
        >
          <div className="text-[11px] text-[var(--phosphor-dim)] uppercase tracking-wider mb-2">
            NETWORK ENDPOINTS
          </div>

          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2 rounded-lg border border-[var(--hairline)] bg-black/20 hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2 text-xs">
              <Github size={14} style={{ color: theme.primary }} />
              <span style={{ color: "var(--phosphor-bright)" }}>GitHub</span>
            </div>
            <span className="text-[11px] text-[var(--phosphor-dim)] font-mono">
              @{profile.username}
            </span>
          </a>

          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2 rounded-lg border border-[var(--hairline)] bg-black/20 hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2 text-xs">
              <Linkedin size={14} style={{ color: theme.primary }} />
              <span style={{ color: "var(--phosphor-bright)" }}>LinkedIn</span>
            </div>
            <span className="text-[11px] text-[var(--phosphor-dim)] font-mono">
              in/hafilrazz
            </span>
          </a>

          <a
            href={profile.portfolio}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2 rounded-lg border border-[var(--hairline)] bg-black/20 hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2 text-xs">
              <Globe size={14} style={{ color: theme.primary }} />
              <span style={{ color: "var(--phosphor-bright)" }}>Portfolio Website</span>
            </div>
            <span className="text-[11px] text-[var(--phosphor-dim)] font-mono">
              hafilrazz.github.io
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

GuiContactView.propTypes = {
  theme: PropTypes.shape({
    primary: PropTypes.string.isRequired,
    primaryBright: PropTypes.string.isRequired,
  }).isRequired,
};
