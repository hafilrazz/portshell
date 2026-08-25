import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal as TerminalIcon,
  Github,
  ExternalLink,
  Star,
  GitFork,
  MapPin,
  User,
  Sparkles,
} from "lucide-react";
import { profile, skills, projects, wallpapers } from "../data/portfolio";

const COMMANDS = {
  help: "show available commands",
  about: "about me",
  skills: "tech stack",
  projects: "featured projects",
  contact: "get in touch",
  neofetch: "system / profile card",
  wallpaper: "load a new background",
  clear: "clear terminal",
  github: "open github profile",
  resume: "download my resume",
};

const BOOT_LINES = [
  { t: "boot", c: "BIOS  hafilOS v2.4.1 ................ OK" },
  { t: "boot", c: "Loading kernel modules ............. OK" },
  { t: "boot", c: "Mounting wallpaper engine .......... OK" },
  { t: "boot", c: "Starting shell session ............. OK" },
  { t: "gap", c: "" },
  { t: "system", c: "Welcome to hafil@portfolio" },
  { t: "system", c: 'Type "help" to see available commands.' },
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export default function TerminalPortfolio() {
  const [wallpaper, setWallpaper] = useState(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [poweredOn, setPoweredOn] = useState(false);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [booting, setBooting] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const loadWallpaper = useCallback(async () => {
    setBgLoaded(false);
    try {
      const endpoints = [
        "https://api.waifu.pics/sfw/waifu",
        "https://api.waifu.pics/sfw/neko",
        "https://api.waifu.pics/sfw/shinobu",
        "https://api.waifu.pics/sfw/megumin",
        "https://api.waifu.pics/sfw/smile",
      ];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      if (data?.url) {
        await preloadImage(data.url);
        setWallpaper(data.url);
        setBgLoaded(true);
        return;
      }
    } catch {
      /* fall through to local wallpapers */
    }
    const fallback = wallpapers[Math.floor(Math.random() * wallpapers.length)];
    await preloadImage(fallback);
    setWallpaper(fallback);
    setBgLoaded(true);
  }, []);

  useEffect(() => {
    loadWallpaper();
  }, [loadWallpaper]);

  useEffect(() => {
    const t = setTimeout(() => setPoweredOn(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!poweredOn) return;
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setHistory((prev) => [...prev, { ...BOOT_LINES[i], key: `b${i}` }]);
        i += 1;
      } else {
        clearInterval(id);
        setBooting(false);
      }
    }, 140);
    return () => clearInterval(id);
  }, [poweredOn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history]);

  useEffect(() => {
    if (!booting) inputRef.current?.focus();
  }, [booting]);

  const addLines = (lines) =>
    setHistory((prev) => [
      ...prev,
      ...lines.map((l, i) => ({ ...l, key: `${Date.now()}-${i}-${Math.random()}` })),
    ]);

  const runCommand = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd || booting) return;

    addLines([{ t: "input", c: cmd }]);

    switch (cmd) {
      case "clear":
        setHistory([]);
        return;

      case "help":
        addLines([
          { t: "rule" },
          ...Object.entries(COMMANDS).map(([k, v]) => ({ t: "cmdline", k, v })),
          { t: "rule" },
        ]);
        return;

      case "about":
        addLines([
          { t: "kv", k: "name", v: profile.name },
          { t: "kv", k: "role", v: profile.role },
          { t: "output", c: profile.bio },
          { t: "kv", k: "location", v: profile.location },
          {
            t: "output",
            c: profile.available ? "status   · ● available for work" : "status   · ○ busy",
          },
        ]);
        return;

      case "skills":
        addLines([
          { t: "rule" },
          { t: "kv", k: "frontend", v: skills.frontend.join("  ") },
          { t: "kv", k: "backend", v: skills.backend.join("  ") },
          { t: "kv", k: "ai / ml", v: skills.ai.join("  ") },
          { t: "kv", k: "tools", v: skills.tools.join("  ") },
          { t: "rule" },
        ]);
        return;

      case "projects":
        addLines([{ t: "output", c: "featured projects" }]);
        projects.forEach((p, i) => addLines([{ t: "project", project: p, index: i + 1 }]));
        addLines([{ t: "dim", c: 'tip: click a repo name, or type "github"' }]);
        return;

      case "contact":
        addLines([
          { t: "rule" },
          { t: "kv", k: "github", v: profile.github.replace("https://", "") },
          { t: "kv", k: "linkedin", v: profile.linkedin.replace("https://", "") },
          { t: "kv", k: "site", v: profile.portfolio.replace("https://", "") },
          { t: "rule" },
        ]);
        return;

      case "neofetch":
        addLines([{ t: "neofetch" }]);
        return;

      case "wallpaper":
        addLines([{ t: "output", c: "fetching new wallpaper..." }]);
        loadWallpaper().then(() => {
          addLines([{ t: "system", c: "wallpaper updated ✓" }]);
        });
        return;

      case "github":
        window.open(profile.github, "_blank", "noreferrer");
        addLines([{ t: "output", c: "opening github..." }]);
        return;

      case "resume": {
        const link = document.createElement("a");
        link.href = "/resume.pdf";
        link.download = "Muhammad Hafil Razak - Resume.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        addLines([{ t: "system", c: "resume download started ✓" }]);
        return;
      }

      default:
        addLines([{ t: "error", c: `command not found: ${cmd} — try "help"` }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  return (
    <div className="crt-root">
      {/*
        Fonts, .scanlines, .vignette, .shell-glow, .caret and .term-scroll
        come from index.css. This block only adds what that file doesn't
        define: the extended phosphor ramp, the VT323 hero type, the
        power-on boot flicker, and the terminal's own component styles.
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

        .crt-root {
          --panel: #070b08;
          --panel-2: #0b110d;
          --hairline: rgba(74, 222, 128, 0.14);
          --hairline-strong: rgba(74, 222, 128, 0.28);
          --phosphor: var(--term-green);
          --phosphor-bright: #b9ffd4;
          --phosphor-mid: #4c9c74;
          --phosphor-dim: var(--term-green-dim);
          --amber: #ffc266;
          --sky: #7cd3ff;
          --red: #ff8080;
          --pixel: 'VT323', monospace;

          position: relative;
          min-height: 100vh;
          overflow: hidden;
          color: var(--phosphor);
        }

        .crt-shell {
          transform: scaleY(0.015);
          filter: brightness(3.2);
          opacity: 0;
        }
        .crt-shell.on {
          animation: power-on 620ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }
        @keyframes power-on {
          0%   { transform: scaleY(0.015); filter: brightness(3.4); opacity: 0.2; }
          55%  { transform: scaleY(1); filter: brightness(1.8); opacity: 1; }
          70%  { transform: scaleY(1); filter: brightness(0.7); opacity: 1; }
          100% { transform: scaleY(1); filter: brightness(1); opacity: 1; }
        }

        .crt-sweep {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 6;
          background: linear-gradient(to bottom, transparent 0%, rgba(126,242,168,0.05) 50%, transparent 100%);
          background-size: 100% 220%;
          animation: sweep 7s linear infinite;
          opacity: 0.6;
        }
        @keyframes sweep {
          0% { background-position: 0 -220%; }
          100% { background-position: 0 220%; }
        }

        .glow-sm { text-shadow: 0 0 6px rgba(126,242,168,0.45); }

        .ascii-name {
          font-family: var(--pixel);
          font-size: clamp(2.1rem, 7vw, 3.2rem);
          line-height: 1;
          letter-spacing: 0.04em;
          color: var(--phosphor-bright);
          text-shadow: 0 0 14px rgba(126,242,168,0.55), 2px 0 0 rgba(255,128,128,0.18), -2px 0 0 rgba(124,211,255,0.18);
        }

        .term-window {
          border: 1px solid var(--hairline);
          background: linear-gradient(180deg, var(--panel) 0%, var(--panel-2) 100%);
          border-radius: 14px;
        }

        .term-titlebar {
          border-bottom: 1px solid var(--hairline);
          background: linear-gradient(90deg, rgba(10,16,12,0.9), rgba(12,18,14,0.9));
        }
        .term-dot { box-shadow: 0 0 6px currentColor; }

        .rule { border-top: 1px solid var(--hairline); margin: 6px 0; }

        .kv-row { display: flex; gap: 10px; }
        .kv-key { color: var(--phosphor-mid); min-width: 92px; flex-shrink: 0; }
        .kv-key::before { content: '·'; margin-right: 8px; color: var(--phosphor-dim); }

        .cmd-key { color: var(--amber); min-width: 96px; display: inline-block; }

        .project-card {
          border: 1px solid var(--hairline);
          background: rgba(20, 40, 28, 0.18);
          border-radius: 10px;
          transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
        }
        .project-card:hover {
          border-color: var(--hairline-strong);
          background: rgba(20, 40, 28, 0.32);
          box-shadow: 0 0 24px -10px rgba(74,222,128,0.4);
        }

        .chip {
          border: 1px solid var(--hairline);
          color: var(--phosphor-mid);
        }

        .status-btn { transition: background 140ms ease, color 140ms ease; }
        .status-btn:hover { background: rgba(126,242,168,0.08); color: var(--phosphor-bright); }

        .prompt-user { color: var(--phosphor-mid); }
        .prompt-colon { color: var(--phosphor-dim); }
        .prompt-tilde { color: var(--sky); }
        .prompt-dollar { color: var(--phosphor-mid); }

        @media (prefers-reduced-motion: reduce) {
          .crt-shell, .crt-shell.on, .crt-sweep, .caret { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* Background photo */}
      <div
        className={`fixed inset-0 scale-110 bg-cover bg-center bg-no-repeat transition-all duration-1000 ${
          bgLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
        }`}
        style={{
          backgroundImage: wallpaper ? `url(${wallpaper})` : "none",
          backgroundColor: "var(--term-bg)",
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55" />
      <div className="vignette fixed inset-0 z-[5]" />
      <div className="scanlines fixed inset-0 z-[5] opacity-60" />
      <div className="crt-sweep" />

      {!bgLoaded && (
        <div
          className="fixed right-4 top-4 z-30 rounded-full border px-3 py-1 text-[11px] backdrop-blur"
          style={{ borderColor: "var(--hairline-strong)", background: "rgba(0,0,0,0.6)", color: "var(--phosphor)" }}
        >
          loading wallpaper...
        </div>
      )}

      <div className={`crt-shell ${poweredOn ? "on" : ""} relative z-20 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-3 py-6 sm:px-4 md:py-10`}>
        <div className="mb-4 flex items-end justify-between px-1">
          <h1 className="ascii-name">hafil@portfolio</h1>
          <Sparkles size={16} className="mb-2 hidden text-[var(--phosphor-dim)] sm:block" />
        </div>

        <div className="term-window shell-glow overflow-hidden">
          <div className="term-titlebar flex items-center gap-2 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="term-dot h-3 w-3 rounded-full bg-red-400/90 text-red-400" />
              <span className="term-dot h-3 w-3 rounded-full bg-amber-300/90 text-amber-300" />
              <span className="term-dot h-3 w-3 rounded-full bg-green-400/90 text-green-400" />
            </div>
            <div className="ml-2 flex items-center gap-2 text-xs" style={{ color: "var(--phosphor-mid)" }}>
              <TerminalIcon size={13} />
              <span className="tracking-wide">hafil@portfolio: ~</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px]" style={{ color: "var(--phosphor-dim)" }}>
              <span className={profile.available ? "text-green-400" : "text-neutral-500"}>●</span>
              {profile.available ? "online" : "away"}
            </div>
          </div>

          <div
            className="term-scroll h-[62vh] overflow-y-auto p-4 sm:h-[64vh] sm:p-5"
            onClick={() => !booting && inputRef.current?.focus()}
          >
            <div className="mb-5 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center" style={{ borderColor: "var(--hairline)" }}>
              <div className="relative shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-14 w-14 rounded-xl border object-cover sm:h-16 sm:w-16"
                  style={{ borderColor: "var(--hairline-strong)" }}
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                  style={{ borderColor: "var(--panel)", background: "#4ade80" }}
                />
              </div>
              <div>
                <h2 className="glow-sm text-lg font-bold tracking-tight sm:text-xl" style={{ color: "var(--phosphor-bright)" }}>
                  {profile.name}
                </h2>
                <p className="text-xs sm:text-sm" style={{ color: "var(--phosphor-mid)" }}>{profile.role}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px]" style={{ color: "var(--phosphor-dim)" }}>
                  <span className="flex items-center gap-1"><MapPin size={11} /> {profile.location}</span>
                  <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 transition hover:text-[var(--phosphor-bright)]">
                    <Github size={11} /> @{profile.username}
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-[13px] leading-relaxed sm:text-sm">
              <AnimatePresence initial={false}>
                {history.map((item) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <HistoryLine item={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {!booting && (
              <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="prompt-user shrink-0 text-[13px] sm:text-sm">hafil@portfolio</span>
                <span className="prompt-colon">:</span>
                <span className="prompt-tilde">~</span>
                <span className="prompt-dollar">$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-w-[12rem] flex-1 bg-transparent outline-none"
                  style={{ color: "var(--phosphor-bright)", caretColor: "var(--phosphor)" }}
                  placeholder="type a command..."
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className="caret" style={{ color: "var(--phosphor)" }}>▌</span>
              </form>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-[10px] sm:px-4 sm:text-[11px]" style={{ borderColor: "var(--hairline)", color: "var(--phosphor-dim)" }}>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {["help", "projects", "skills", "neofetch", "wallpaper"].map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={booting}
                  onClick={() => runCommand(c)}
                  className="status-btn rounded px-1.5 py-0.5 disabled:opacity-40"
                >
                  {c}
                </button>
              ))}
            </div>
            <span>portshell · v2.0</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-5 text-sm" style={{ color: "var(--phosphor-mid)" }}>
          <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:text-[var(--phosphor-bright)]">
            <Github size={15} /> GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:text-[var(--phosphor-bright)]">
            <User size={15} /> LinkedIn
          </a>
          <a href={profile.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:text-[var(--phosphor-bright)]">
            <ExternalLink size={15} /> Site
          </a>
        </div>
      </div>
    </div>
  );
}

function HistoryLine({ item }) {
  switch (item.t) {
    case "boot":
      return <p style={{ color: "var(--phosphor-dim)" }}>{item.c}</p>;
    case "gap":
      return <p>&nbsp;</p>;
    case "system":
      return <p style={{ color: "var(--phosphor-mid)" }}>{item.c}</p>;
    case "dim":
      return <p style={{ color: "var(--phosphor-dim)" }}>{item.c}</p>;
    case "rule":
      return <div className="rule" />;
    case "kv":
      return (
        <div className="kv-row">
          <span className="kv-key">{item.k}</span>
          <span>{item.v}</span>
        </div>
      );
    case "cmdline":
      return (
        <div className="kv-row">
          <span className="cmd-key">{item.k}</span>
          <span style={{ color: "var(--phosphor-mid)" }}>{item.v}</span>
        </div>
      );
    case "input":
      return (
        <div className="flex items-center gap-2" style={{ color: "var(--phosphor-bright)" }}>
          <span className="prompt-user shrink-0">hafil@portfolio</span>
          <span className="prompt-colon">:</span>
          <span className="prompt-tilde">~</span>
          <span className="prompt-dollar">$</span>
          <span>{item.c}</span>
        </div>
      );
    case "output":
      return <p className="whitespace-pre-wrap">{item.c}</p>;
    case "error":
      return <p style={{ color: "var(--red)" }}>{item.c}</p>;
    case "project":
      return <ProjectLine project={item.project} index={item.index} />;
    case "neofetch":
      return <NeofetchCard />;
    default:
      return null;
  }
}

function ProjectLine({ project, index }) {
  return (
    <div className="project-card my-2.5 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span style={{ color: "var(--phosphor-dim)" }}>[{index}]</span>
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="font-semibold transition hover:underline"
            style={{ color: "var(--phosphor-bright)" }}
          >
            {project.name}
          </a>
          <span className="rounded-md px-1.5 py-0.5 text-[10px]" style={{ background: "rgba(126,242,168,0.1)", color: "var(--phosphor)" }}>
            {project.language}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--phosphor-dim)" }}>
          <span className="flex items-center gap-1"><Star size={12} style={{ color: "var(--amber)" }} /> {project.stars}</span>
          <span className="flex items-center gap-1"><GitFork size={12} /> {project.forks}</span>
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: "var(--phosphor)" }}>
              <ExternalLink size={12} /> demo
            </a>
          )}
        </div>
      </div>
      <p className="mt-1.5 text-[13px]" style={{ color: "var(--phosphor-mid)" }}>{project.description}</p>
      {project.topics?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {project.topics.map((t) => (
            <span key={t} className="chip rounded px-1.5 py-0.5 text-[10px]">#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function NeofetchCard() {
  const swatches = ["#173404", "#27500a", "#3b6d11", "#639922", "#97c459", "#c0dd97"];
  return (
    <div className="my-2 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:gap-5" style={{ borderColor: "var(--hairline)", background: "rgba(0,0,0,0.25)" }}>
      <img src={profile.avatar} alt="" className="h-20 w-20 rounded-lg border object-cover sm:h-24 sm:w-24" style={{ borderColor: "var(--hairline-strong)" }} />
      <div className="space-y-0.5 text-[12px] sm:text-[13px]">
        <p className="font-bold" style={{ color: "var(--phosphor-bright)" }}>
          {profile.username}<span style={{ color: "var(--phosphor-dim)" }}>@portfolio</span>
        </p>
        <p style={{ color: "var(--phosphor-dim)" }}>----------------------</p>
        <p><span style={{ color: "var(--phosphor)" }}>name</span> · {profile.name}</p>
        <p><span style={{ color: "var(--phosphor)" }}>role</span> · {profile.role}</p>
        <p><span style={{ color: "var(--phosphor)" }}>host</span> · {profile.location}</p>
        <p><span style={{ color: "var(--phosphor)" }}>shell</span> · zsh / react-terminal</p>
        <p><span style={{ color: "var(--phosphor)" }}>theme</span> · crt-phosphor</p>
        <p><span style={{ color: "var(--phosphor)" }}>status</span> · {profile.available ? "available for work" : "busy"}</p>
        <div className="mt-1.5 flex gap-1">
          {swatches.map((c) => <span key={c} className="h-3 w-3 rounded-sm" style={{ background: c }} />)}
        </div>
      </div>
    </div>
  );
}