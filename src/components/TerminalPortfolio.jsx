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
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  profile,
  skills,
  projects,
  animeWallpapers,
} from "../data/portfolio";

const COMMANDS = {
  help: "Show available commands",
  about: "About me",
  skills: "Tech stack",
  projects: "Featured projects",
  contact: "Get in touch",
  neofetch: "System / profile card",
  wallpaper: "Load a new background",
  clear: "Clear terminal",
  github: "Open GitHub profile",
};

const BOOT_LINES = [
  "Initializing hafil@portfolio...",
  "Loading kernel modules .............. OK",
  "Mounting anime wallpaper engine ...... OK",
  "Starting shell session ............... OK",
  "",
  "Welcome to hafilrazz.dev",
  'Type "help" to see available commands.',
];

export default function TerminalPortfolio() {
  const [wallpaper, setWallpaper] = useState(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [booting, setBooting] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const loadAnimeBg = useCallback(async () => {
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
      /* fallback below */
    }
    const fallback =
      animeWallpapers[Math.floor(Math.random() * animeWallpapers.length)];
    await preloadImage(fallback);
    setWallpaper(fallback);
    setBgLoaded(true);
  }, []);

  useEffect(() => {
    loadAnimeBg();
  }, [loadAnimeBg]);

  // Boot sequence
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i];
        setHistory((prev) => [
          ...prev,
          {
            type: line.startsWith("Welcome") || line.startsWith("Type")
              ? "system"
              : "boot",
            content: line || " ",
          },
        ]);
        i += 1;
      } else {
        clearInterval(id);
        setBooting(false);
      }
    }, 180);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (!booting) inputRef.current?.focus();
  }, [booting]);

  const addLines = (lines) => setHistory((prev) => [...prev, ...lines]);

  const runCommand = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd || booting) return;

    addLines([{ type: "input", content: cmd }]);

    switch (cmd) {
      case "clear":
        setHistory([]);
        return;

      case "help":
        addLines([
          { type: "output", content: "┌─ available commands ─────────────┐" },
          ...Object.entries(COMMANDS).map(([k, v]) => ({
            type: "output",
            content: `│  ${k.padEnd(12)} ${v}`,
          })),
          { type: "output", content: "└──────────────────────────────────┘" },
        ]);
        return;

      case "about":
        addLines([
          { type: "output", content: `> ${profile.name}` },
          { type: "output", content: `  ${profile.role}` },
          { type: "output", content: `  ${profile.bio}` },
          { type: "output", content: `  Location · ${profile.location}` },
          {
            type: "output",
            content: profile.available
              ? "  Status   · ● Available for work"
              : "  Status   · ○ Busy",
          },
        ]);
        return;

      case "skills":
        addLines([
          { type: "output", content: "┌─ tech stack ─────────────────────┐" },
          {
            type: "output",
            content: `│ Frontend  ${skills.frontend.join(" · ")}`,
          },
          {
            type: "output",
            content: `│ Backend   ${skills.backend.join(" · ")}`,
          },
          {
            type: "output",
            content: `│ AI / ML   ${skills.ai.join(" · ")}`,
          },
          {
            type: "output",
            content: `│ Tools     ${skills.tools.join(" · ")}`,
          },
          { type: "output", content: "└──────────────────────────────────┘" },
        ]);
        return;

      case "projects":
        addLines([{ type: "output", content: "Featured projects" }]);
        projects.forEach((p, i) => {
          addLines([{ type: "project", content: p, index: i + 1 }]);
        });
        addLines([
          {
            type: "dim",
            content: 'Tip: click a repo · or type "github"',
          },
        ]);
        return;

      case "contact":
        addLines([
          { type: "output", content: "┌─ contact ────────────────────────┐" },
          { type: "output", content: `│ GitHub    ${profile.github}` },
          { type: "output", content: `│ LinkedIn  ${profile.linkedin}` },
          { type: "output", content: `│ Site      ${profile.portfolio}` },
          { type: "output", content: "└──────────────────────────────────┘" },
        ]);
        return;

      case "neofetch":
        addLines([
          {
            type: "neofetch",
            content: null,
          },
        ]);
        return;

      case "wallpaper":
        addLines([
          { type: "output", content: "Fetching new wallpaper..." },
        ]);
        loadAnimeBg().then(() => {
          addLines([{ type: "system", content: "Wallpaper updated ✓" }]);
        });
        return;

      case "github":
        window.open(profile.github, "_blank");
        addLines([{ type: "output", content: "Opening GitHub..." }]);
        return;

      default:
        addLines([
          {
            type: "error",
            content: `command not found: ${cmd} — try "help"`,
          },
        ]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-mono text-green-400">
      {/* background */}
      <div
        className={`fixed inset-0 scale-110 bg-cover bg-center bg-no-repeat transition-all duration-1000 ${
          bgLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
        }`}
        style={{
          backgroundImage: wallpaper ? `url(${wallpaper})` : "none",
          backgroundColor: "#050505",
        }}
      />

      {/* Overlays */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/80" />
      <div className="vignette fixed inset-0" />
      <div className="scanlines fixed inset-0 z-10 opacity-40" />

      {/* Loading badge */}
      {!bgLoaded && (
        <div className="fixed right-4 top-4 z-30 rounded-full border border-green-500/30 bg-black/60 px-3 py-1 text-[11px] text-green-500 backdrop-blur">
          loading wallpaper...
        </div>
      )}

      <div className="relative z-20 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-3 py-6 sm:px-4 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-hidden rounded-2xl border border-green-500/20 bg-[#0a0a0a]/88 shadow-[0_0_80px_-12px_rgba(34,197,94,0.35)] backdrop-blur-xl"
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-green-500/15 bg-gradient-to-r from-[#0f0f0f]/95 to-[#121212]/95 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/90 shadow-[0_0_8px_#ef4444]" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/90 shadow-[0_0_8px_#eab308]" />
              <span className="h-3 w-3 rounded-full bg-green-500/90 shadow-[0_0_8px_#22c55e]" />
            </div>
            <div className="ml-2 flex items-center gap-2 text-xs text-green-500/80">
              <TerminalIcon size={13} />
              <span className="tracking-wide">hafil@portfolio:~</span>
            </div>
            <div className="ml-auto flex items-center gap-2 text-[10px] text-green-600/70">
              <Sparkles size={11} className="text-green-500/60" />
              {profile.available ? "● online" : "○ away"}
            </div>
          </div>

          {/* Terminal body */}
          <div
            className="term-scroll h-[62vh] overflow-y-auto p-4 sm:h-[68vh] sm:p-5"
            onClick={() => !booting && inputRef.current?.focus()}
          >
            {/* Identity header */}
            <div className="mb-5 flex flex-col gap-3 border-b border-green-500/10 pb-4 sm:flex-row sm:items-center">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-14 w-14 rounded-xl border border-green-500/40 object-cover shadow-[0_0_20px_rgba(34,197,94,0.25)] sm:h-16 sm:w-16"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0a] bg-green-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-green-300 sm:text-xl">
                  {profile.name}
                </h1>
                <p className="text-xs text-green-500/80 sm:text-sm">
                  {profile.role}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-green-600">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {profile.location}
                  </span>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 transition hover:text-green-400"
                  >
                    <Github size={11} /> @{profile.username}
                  </a>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="space-y-1.5 text-[13px] leading-relaxed sm:text-sm">
              <AnimatePresence initial={false}>
                {history.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    {item.type === "boot" && (
                      <p className="text-green-700/90">{item.content}</p>
                    )}
                    {item.type === "system" && (
                      <p className="text-green-500/75">{item.content}</p>
                    )}
                    {item.type === "dim" && (
                      <p className="text-green-700/80">{item.content}</p>
                    )}
                    {item.type === "input" && (
                      <div className="flex items-center gap-2 text-green-300">
                        <ChevronRight size={14} className="shrink-0 text-green-500" />
                        <span>{item.content}</span>
                      </div>
                    )}
                    {item.type === "output" && (
                      <pre className="whitespace-pre-wrap text-green-400/90">
                        {item.content}
                      </pre>
                    )}
                    {item.type === "error" && (
                      <p className="text-red-400/90">{item.content}</p>
                    )}
                    {item.type === "project" && (
                      <ProjectLine project={item.content} index={item.index} />
                    )}
                    {item.type === "neofetch" && <NeofetchCard />}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Prompt */}
            {!booting && (
              <form
                onSubmit={handleSubmit}
                className="mt-3 flex items-center gap-2"
              >
                <span className="shrink-0 text-green-500">❯</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-transparent text-green-300 caret-green-400 outline-none placeholder:text-green-900"
                  placeholder="type a command..."
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className="animate-pulse text-green-500">▌</span>
              </form>
            )}
          </div>

          {/* Footer shortcuts */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-green-500/10 bg-[#0c0c0c]/95 px-3 py-2 text-[10px] text-green-700 sm:px-4 sm:text-[11px]">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {["help", "projects", "skills", "neofetch", "wallpaper"].map(
                (c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={booting}
                    onClick={() => runCommand(c)}
                    className="rounded px-1.5 py-0.5 transition hover:bg-green-500/10 hover:text-green-400 disabled:opacity-40"
                  >
                    {c}
                  </button>
                )
              )}
            </div>
            <span className="text-green-800">hafilrazz · v1.1</span>
          </div>
        </motion.div>

        {/* Social row */}
        <div className="mt-5 flex flex-wrap justify-center gap-5 text-sm text-green-500/70">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-green-300"
          >
            <Github size={15} /> GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-green-300"
          >
            <User size={15} /> LinkedIn
          </a>
          <a
            href={profile.portfolio}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-green-300"
          >
            <ExternalLink size={15} /> Site
          </a>
        </div>
      </div>
    </div>
  );
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function ProjectLine({ project, index }) {
  return (
    <div className="group my-2.5 rounded-xl border border-green-500/15 bg-green-950/25 p-3 transition hover:border-green-400/35 hover:bg-green-950/40 hover:shadow-[0_0_24px_-8px_rgba(34,197,94,0.4)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-green-700">[{index}]</span>
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-green-300 transition hover:text-green-200 hover:underline"
          >
            {project.name}
          </a>
          <span className="rounded-md bg-green-900/50 px-1.5 py-0.5 text-[10px] text-green-400">
            {project.language}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-green-600">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-500/80" /> {project.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={12} /> {project.forks}
          </span>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-green-400 hover:underline"
            >
              <ExternalLink size={12} /> demo
            </a>
          )}
        </div>
      </div>
      <p className="mt-1.5 text-[13px] text-green-500/85">
        {project.description}
      </p>
      {project.topics?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {project.topics.map((t) => (
            <span
              key={t}
              className="rounded border border-green-800/40 px-1.5 py-0.5 text-[10px] text-green-600"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function NeofetchCard() {
  return (
    <div className="my-2 flex flex-col gap-3 rounded-xl border border-green-500/15 bg-black/40 p-3 sm:flex-row sm:gap-5">
      <img
        src={profile.avatar}
        alt=""
        className="h-20 w-20 rounded-lg border border-green-500/30 object-cover sm:h-24 sm:w-24"
      />
      <div className="space-y-0.5 text-[12px] sm:text-[13px]">
        <p className="font-bold text-green-300">
          {profile.username}
          <span className="text-green-600">@portfolio</span>
        </p>
        <p className="text-green-700">----------------------</p>
        <p>
          <span className="text-green-500">Name</span> · {profile.name}
        </p>
        <p>
          <span className="text-green-500">Role</span> · {profile.role}
        </p>
        <p>
          <span className="text-green-500">Host</span> · {profile.location}
        </p>
        <p>
          <span className="text-green-500">Shell</span> · zsh / react-terminal
        </p>
        <p>
          <span className="text-green-500">Theme</span> · anime-crt-green
        </p>
        <p>
          <span className="text-green-500">Status</span> ·{" "}
          {profile.available ? "available for work" : "busy"}
        </p>
        <div className="mt-1.5 flex gap-1">
          {["#14532d", "#166534", "#22c55e", "#4ade80", "#86efac", "#dcfce7"].map(
            (c) => (
              <span
                key={c}
                className="h-3 w-3 rounded-sm"
                style={{ background: c }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}