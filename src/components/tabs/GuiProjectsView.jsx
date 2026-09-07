import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Github,
  ExternalLink,
  Star,
  GitFork,
  Search,
  Copy,
  Check,
  Code2,
} from "lucide-react";
import { projects } from "../../data/portfolio";

const LANG_COLORS = {
  Dart: "#00b4ab",
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  HTML: "#e34f26",
  CSS: "#1572b6",
  React: "#61dafb",
};

export default function GuiProjectsView({ theme }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [copiedName, setCopiedName] = useState(null);

  const categories = useMemo(() => {
    const set = new Set(["All"]);
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCat = filter === "All" || p.category === filter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.language.toLowerCase().includes(q) ||
        p.topics?.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [filter, search]);

  const handleCopyClone = (p) => {
    navigator.clipboard.writeText(`git clone ${p.url}.git`);
    setCopiedName(p.name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header controls: Search & Category Chips */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3 border-[var(--hairline)]">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--phosphor-dim)]"
          />
          <input
            type="text"
            placeholder="Search projects or tech tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-black/30 border border-[var(--hairline)] text-[var(--phosphor-bright)] placeholder-[var(--phosphor-dim)] focus:outline-none focus:border-[var(--hairline-strong)]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`text-[11px] px-2.5 py-1 rounded transition-all ${
                filter === cat
                  ? "border font-medium shadow-sm"
                  : "hover:bg-white/5 border border-transparent"
              }`}
              style={{
                borderColor: filter === cat ? theme.primary : "transparent",
                background: filter === cat ? `${theme.primary}1a` : "transparent",
                color: filter === cat ? theme.primaryBright : "var(--phosphor-mid)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filteredProjects.map((p, idx) => {
          const langColor = LANG_COLORS[p.language] || theme.primary;
          const isCopied = copiedName === p.name;

          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: idx * 0.04 }}
              className="group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all hover:scale-[1.01]"
              style={{
                borderColor: "var(--hairline)",
                background: "rgba(0, 0, 0, 0.25)",
              }}
            >
              <div>
                {/* Title & Lang indicator */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-2 ring-black/40"
                      style={{ backgroundColor: langColor }}
                    />
                    <h3
                      className="font-bold text-sm tracking-tight group-hover:underline"
                      style={{ color: theme.primaryBright }}
                    >
                      {p.name}
                    </h3>
                  </div>

                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--hairline)]"
                    style={{ color: "var(--phosphor-dim)" }}
                  >
                    {p.language}
                  </span>
                </div>

                <p
                  className="mt-2 text-xs leading-relaxed line-clamp-3"
                  style={{ color: "var(--phosphor-mid)" }}
                >
                  {p.description}
                </p>
              </div>

              {/* Tags and Stats */}
              <div className="mt-3.5 pt-2.5 border-t border-[var(--hairline)] space-y-2.5">
                {p.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.topics.map((t) => (
                      <span
                        key={t}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 border border-[var(--hairline)]"
                        style={{ color: "var(--phosphor-dim)" }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2.5 text-[var(--phosphor-dim)]">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Star size={11} style={{ color: theme.accent }} />
                      {p.stars}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <GitFork size={11} />
                      {p.forks}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyClone(p)}
                      title="Copy git clone command"
                      className="p-1 rounded hover:bg-white/10 transition text-[var(--phosphor-mid)]"
                    >
                      {isCopied ? (
                        <Check size={13} className="text-green-400" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>

                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded hover:bg-white/10 transition text-[var(--phosphor-mid)] hover:text-[var(--phosphor-bright)]"
                      title="GitHub Repository"
                    >
                      <Github size={13} />
                    </a>

                    {p.demo && (
                      <a
                        href={p.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition"
                        style={{
                          borderColor: theme.primary,
                          color: theme.primaryBright,
                          background: `${theme.primary}18`,
                        }}
                      >
                        <ExternalLink size={11} />
                        Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-2 text-center py-10 text-xs text-[var(--phosphor-dim)]">
            <Code2 size={24} className="mx-auto mb-2 opacity-50" />
            No projects found matching &ldquo;{search}&rdquo; in &ldquo;{filter}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}

GuiProjectsView.propTypes = {
  theme: PropTypes.shape({
    primary: PropTypes.string.isRequired,
    primaryBright: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
  }).isRequired,
};
