import { useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Cpu, Server, Layers, Wrench } from "lucide-react";
import { skills } from "../../data/portfolio";

const CATEGORY_META = {
  frontend: { label: "Frontend Architecture", icon: Layers },
  backend: { label: "Backend & Systems", icon: Server },
  ai: { label: "AI & Machine Learning", icon: Cpu },
  tools: { label: "DevOps & Tooling", icon: Wrench },
};

export default function GuiSkillsView({ theme }) {
  const [activeCat, setActiveCat] = useState("all");

  const categories = Object.keys(skills);

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div className="flex flex-wrap gap-1.5 border-b pb-3 border-[var(--hairline)]">
        <button
          type="button"
          onClick={() => setActiveCat("all")}
          className="text-xs px-3 py-1.5 rounded-lg border transition font-medium"
          style={{
            borderColor: activeCat === "all" ? theme.primary : "var(--hairline)",
            background: activeCat === "all" ? `${theme.primary}22` : "transparent",
            color: activeCat === "all" ? theme.primaryBright : "var(--phosphor-mid)",
          }}
        >
          All Domains
        </button>

        {categories.map((catKey) => {
          const meta = CATEGORY_META[catKey];
          const Icon = meta?.icon || Layers;
          const isActive = activeCat === catKey;

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setActiveCat(catKey)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition font-medium"
              style={{
                borderColor: isActive ? theme.primary : "var(--hairline)",
                background: isActive ? `${theme.primary}22` : "transparent",
                color: isActive ? theme.primaryBright : "var(--phosphor-mid)",
              }}
            >
              <Icon size={12} />
              {meta?.label || catKey}
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories
          .filter((cat) => activeCat === "all" || activeCat === cat)
          .map((catKey) => {
            const meta = CATEGORY_META[catKey];
            const Icon = meta?.icon || Layers;
            const skillList = skills[catKey];

            return (
              <motion.div
                key={catKey}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="rounded-xl border p-3.5 space-y-3"
                style={{
                  borderColor: "var(--hairline)",
                  background: "rgba(0, 0, 0, 0.25)",
                }}
              >
                <div className="flex items-center justify-between border-b pb-2 border-[var(--hairline)]">
                  <div className="flex items-center gap-2">
                    <Icon size={14} style={{ color: theme.primary }} />
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primaryBright }}>
                      {meta?.label || catKey}
                    </h4>
                  </div>
                  <span className="text-[10px] text-[var(--phosphor-dim)]">
                    {skillList.length} technologies
                  </span>
                </div>

                <div className="space-y-2.5">
                  {skillList.map((skill) => {
                    const skillName = typeof skill === "string" ? skill : skill.name;
                    const skillLevel = typeof skill === "string" ? 85 : skill.level;

                    return (
                      <div key={skillName} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono" style={{ color: "var(--phosphor-bright)" }}>
                            {skillName}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--phosphor-dim)]">
                            {skillLevel}%
                          </span>
                        </div>

                        {/* Progress meter bar */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/50 border border-[var(--hairline)]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skillLevel}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: theme.primary,
                              boxShadow: `0 0 8px ${theme.primary}`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}

GuiSkillsView.propTypes = {
  theme: PropTypes.shape({
    primary: PropTypes.string.isRequired,
    primaryBright: PropTypes.string.isRequired,
  }).isRequired,
};
