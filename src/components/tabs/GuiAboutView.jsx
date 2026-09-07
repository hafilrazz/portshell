import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  MapPin,
  Github,
  Linkedin,
  Mail,
  Download,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { profile, projects } from "../../data/portfolio";
import resumePdf from "../../assets/resume.pdf";

export default function GuiAboutView({ theme }) {
  const totalStars = projects.reduce((acc, curr) => acc + (curr.stars || 0), 0);

  const handleDownloadResume = async () => {
    try {
      const response = await fetch(resumePdf);
      if (!response.ok) throw new Error("Resume not found");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "Hafil_Razak_Resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(resumePdf, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Profile Header Card */}
      <div
        className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderColor: "var(--hairline)",
          background: "rgba(0, 0, 0, 0.28)",
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-16 w-16 rounded-xl border object-cover sm:h-20 sm:w-20"
              style={{ borderColor: "var(--hairline-strong)" }}
            />
            <span
              className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2"
              style={{
                borderColor: "var(--panel)",
                backgroundColor: profile.available ? "#4ade80" : "#9ca3af",
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2
                className="text-lg font-bold sm:text-xl"
                style={{ color: theme.primaryBright }}
              >
                {profile.name}
              </h2>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                style={{
                  borderColor: theme.primary,
                  color: theme.primaryBright,
                  background: `${theme.primary}18`,
                }}
              >
                @{profile.username}
              </span>
            </div>

            <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--phosphor-mid)" }}>
              {profile.role}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--phosphor-dim)" }}>
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {profile.location}
              </span>
              <span className="flex items-center gap-1 text-green-400">
                <Sparkles size={12} />
                {profile.statusText}
              </span>
            </div>
          </div>
        </div>

        {/* Resume Download button */}
        <button
          type="button"
          onClick={handleDownloadResume}
          className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition hover:scale-105 active:scale-95 self-start sm:self-center"
          style={{
            borderColor: theme.primary,
            background: `${theme.primary}22`,
            color: theme.primaryBright,
          }}
        >
          <Download size={14} />
          Download Resume
        </button>
      </div>

      {/* Bio Card */}
      <div
        className="rounded-xl border p-3.5"
        style={{
          borderColor: "var(--hairline)",
          background: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <h4 className="text-xs font-semibold mb-1" style={{ color: theme.primaryBright }}>
          SYSTEM // BIO
        </h4>
        <p className="text-xs sm:text-[13px] leading-relaxed" style={{ color: "var(--phosphor-mid)" }}>
          {profile.bio}
        </p>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: "Total Projects", val: `${projects.length}+` },
          { label: "GitHub Stars", val: `${totalStars} ★` },
          { label: "Primary Focus", val: "Full Stack & AI" },
          { label: "Status", val: profile.available ? "Available" : "Engaged" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border p-2.5 text-center"
            style={{
              borderColor: "var(--hairline)",
              background: "rgba(0,0,0,0.22)",
            }}
          >
            <div className="text-xs text-[var(--phosphor-dim)]">{stat.label}</div>
            <div className="font-bold text-sm mt-0.5" style={{ color: theme.primaryBright }}>
              {stat.val}
            </div>
          </div>
        ))}
      </div>

      {/* Education & Experience Timeline */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold" style={{ color: theme.primaryBright }}>
          TIMELINE // EXPERIENCE & EDUCATION
        </h4>

        <div className="space-y-2">
          {profile.experience.map((item) => (
            <div
              key={item.role}
              className="flex items-start gap-3 rounded-xl border p-3"
              style={{
                borderColor: "var(--hairline)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            >
              <div
                className="p-2 rounded-lg border mt-0.5"
                style={{
                  borderColor: "var(--hairline)",
                  background: `${theme.primary}12`,
                  color: theme.primary,
                }}
              >
                {item.role.includes("B.Tech") ? (
                  <GraduationCap size={15} />
                ) : (
                  <Briefcase size={15} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h5 className="text-xs font-bold" style={{ color: theme.primaryBright }}>
                    {item.role}
                  </h5>
                  <span
                    className="flex items-center gap-1 text-[11px]"
                    style={{ color: "var(--phosphor-dim)" }}
                  >
                    <Calendar size={10} />
                    {item.period}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-[var(--phosphor-mid)]">
                  {item.organization}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--phosphor-dim)]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Social Links */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--hairline)]">
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border hover:bg-white/5 transition"
          style={{ borderColor: "var(--hairline)", color: "var(--phosphor-mid)" }}
        >
          <Github size={13} />
          GitHub
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border hover:bg-white/5 transition"
          style={{ borderColor: "var(--hairline)", color: "var(--phosphor-mid)" }}
        >
          <Linkedin size={13} />
          LinkedIn
        </a>
        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border hover:bg-white/5 transition"
          style={{ borderColor: "var(--hairline)", color: "var(--phosphor-mid)" }}
        >
          <Mail size={13} />
          {profile.email}
        </a>
      </div>
    </motion.div>
  );
}

GuiAboutView.propTypes = {
  theme: PropTypes.shape({
    primary: PropTypes.string.isRequired,
    primaryBright: PropTypes.string.isRequired,
  }).isRequired,
};
