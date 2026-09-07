import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Terminal as TerminalIcon,
  Github,
  Linkedin,
  ExternalLink,
  Star,
  GitFork,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  FolderGit2,
  Cpu,
  Mail,
  Palette,
  RotateCcw,
  Clock,
  Copy,
  Check,
} from "lucide-react";

import { profile, skills, projects } from "../data/portfolio";
import { WALLPAPERS } from "../data/wallpapers";
import { THEMES, DEFAULT_THEME_ID } from "../data/themes";
import { soundFx } from "../utils/sound";
import MatrixRain from "./MatrixRain";
import GuiProjectsView from "./tabs/GuiProjectsView";
import GuiAboutView from "./tabs/GuiAboutView";
import GuiSkillsView from "./tabs/GuiSkillsView";
import GuiContactView from "./tabs/GuiContactView";
import resumePdf from "../assets/resume.pdf";

const COMMANDS = {
  help: "show available shell commands",
  about: "bio, timeline & education",
  skills: "technical stack breakdown",
  projects: "featured repositories & demos",
  contact: "transmission endpoints & email",
  neofetch: "system profile hardware card",
  theme: "switch color theme [matrix/cyberpunk/dracula/amber/monokai/tokyo]",
  cursor: "switch cursor mode [reticle / dot / native]",
  matrix: "launch falling digital rain screensaver",
  wallpaper: "fetch a fresh background",
  time: "display system time & session uptime",
  history: "view shell command history",
  resume: "download curriculum vitae (PDF)",
  github: "open github profile in browser",
  clear: "clear terminal output buffer",
};

const BOOT_LINES = [
  { t: "boot", c: "BIOS  hafilOS v3.2.0-release ............. OK" },
  { t: "boot", c: "Initializing CPU & neural modules ........ OK" },
  { t: "boot", c: "Mounting theme engine & GPU shaders ...... OK" },
  { t: "boot", c: "Network handshake: ESTABLISHED ........... OK" },
  { t: "gap", c: "" },
  { t: "system", c: "Welcome to hafil@portfolio (portshell v3.2)" },
  { t: "system", c: 'Type "help" to see commands, or explore the tabs above.' },
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export default function TerminalPortfolio({
  cursorMode = "reticle",
  onCursorModeChange,
}) {
  // Theme state
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem("hafil_theme") || DEFAULT_THEME_ID;
  });
  const theme = useMemo(() => THEMES[themeId] || THEMES.phosphor, [themeId]);

  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("hafil_sound") === "true";
  });

  // UI display toggles
  const [scanlines, setScanlines] = useState(true);
  const [windowMode, setWindowMode] = useState("normal"); // "normal" | "fullscreen" | "compact"
  const [activeTab, setActiveTab] = useState("terminal"); // "terminal" | "projects" | "about" | "skills" | "contact"
  const [matrixActive, setMatrixActive] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  // Background state
  const [wallpaperIndex, setWallpaperIndex] = useState(() => {
    const saved = localStorage.getItem("hafil_wallpaper_idx");
    return saved !== null
      ? parseInt(saved, 10) % WALLPAPERS.length
      : Math.floor(Math.random() * WALLPAPERS.length);
  });
  const [wallpaper, setWallpaper] = useState(WALLPAPERS[0]?.url || null);
  const [bgLoaded, setBgLoaded] = useState(false);

  // Shell state
  const [poweredOn, setPoweredOn] = useState(false);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [booting, setBooting] = useState(true);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  // Session uptime ref (calculated on-demand without interval re-renders)
  const sessionStartRef = useRef(Date.now());
  const getUptimeFormatted = useCallback(() => {
    const diff = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;
    return `${hrs > 0 ? `${hrs}h ` : ""}${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  }, []);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Synchronize CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--term-primary", theme.primary);
    root.style.setProperty("--term-primary-dim", theme.primaryDim);
    root.style.setProperty("--term-primary-bright", theme.primaryBright);
    root.style.setProperty("--term-accent", theme.accent);
    root.style.setProperty("--term-secondary", theme.secondary);
    root.style.setProperty("--term-danger", theme.danger);
    root.style.setProperty("--term-bg", theme.bg);
    root.style.setProperty("--term-panel", theme.panel);
    root.style.setProperty("--term-panel2", theme.panel2);
    root.style.setProperty("--term-hairline", theme.hairline);
    root.style.setProperty("--term-hairline-strong", theme.hairlineStrong);
    root.style.setProperty("--term-glow", theme.glow);

    localStorage.setItem("hafil_theme", theme.id);
  }, [theme]);

  // Sound toggle helper
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("hafil_sound", String(next));
    if (next) soundFx.playThemeSwitch(false);
  };

  const switchTheme = (id) => {
    if (THEMES[id]) {
      setThemeId(id);
      soundFx.playThemeSwitch(!soundEnabled);
      setThemePickerOpen(false);
    }
  };

  // Wallpaper loader
  const loadWallpaperByIndex = useCallback(async (idx) => {
    const safeIdx = ((idx % WALLPAPERS.length) + WALLPAPERS.length) % WALLPAPERS.length;
    setBgLoaded(false);
    setWallpaperIndex(safeIdx);
    localStorage.setItem("hafil_wallpaper_idx", String(safeIdx));

    const selected = WALLPAPERS[safeIdx];
    await preloadImage(selected.url);
    setWallpaper(selected.url);
    setBgLoaded(true);
    return selected;
  }, []);

  const nextWallpaper = useCallback(() => {
    return loadWallpaperByIndex(wallpaperIndex + 1);
  }, [loadWallpaperByIndex, wallpaperIndex]);

  useEffect(() => {
    loadWallpaperByIndex(wallpaperIndex);
  }, [loadWallpaperByIndex, wallpaperIndex]);

  // Power on sequence
  useEffect(() => {
    const t = setTimeout(() => setPoweredOn(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Boot sequence lines
  useEffect(() => {
    if (!poweredOn) return;
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setHistory((prev) => [
          ...prev,
          {
            ...BOOT_LINES[i],
            key: `boot-${i}-${Date.now()}`,
          },
        ]);
        i += 1;
      } else {
        clearInterval(id);
        setBooting(false);
        soundFx.playBoot(!soundEnabled);
      }
    }, 120);
    return () => clearInterval(id);
  }, [poweredOn, soundEnabled]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (activeTab === "terminal") {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [history, activeTab]);

  // Auto-focus input on terminal tab activation
  useEffect(() => {
    if (!booting && activeTab === "terminal") {
      inputRef.current?.focus();
    }
  }, [booting, activeTab]);

  // Global ESC key for matrix dismissal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMatrixActive(false);
        setThemePickerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addLines = (lines) =>
    setHistory((prev) => [
      ...prev,
      ...lines.map((l, i) => ({
        ...l,
        key: `${Date.now()}-${i}-${Math.random()}`,
      })),
    ]);

  // Inline Ghost suggestion lookup
  const ghostSuggestion = useMemo(() => {
    if (!input.trim()) return "";
    const lower = input.toLowerCase().trim();
    const match = Object.keys(COMMANDS).find(
      (cmd) => cmd.startsWith(lower) && cmd !== lower
    );
    if (match) {
      return match.slice(lower.length);
    }
    return "";
  }, [input]);

  const runCommand = async (raw) => {
    const trimmed = raw.trim();
    const parts = trimmed.split(" ");
    const cmd = parts[0]?.toLowerCase() || "";
    const arg = parts[1]?.toLowerCase() || "";

    if (!cmd || booting) return;

    soundFx.playEnter(!soundEnabled);

    // Save to command history
    setCommandHistory((prev) => [trimmed, ...prev.filter((c) => c !== trimmed)]);
    setHistoryPointer(-1);

    addLines([{ t: "input", c: trimmed }]);

    switch (cmd) {
      case "clear":
        setHistory([]);
        return;

      case "help":
        addLines([
          { t: "rule" },
          { t: "system", c: "AVAILABLE COMMANDS (type or click any command to execute):" },
          ...Object.entries(COMMANDS).map(([k, v]) => ({
            t: "cmdline",
            k,
            v,
          })),
          { t: "rule" },
        ]);
        return;

      case "about":
        addLines([
          { t: "rule" },
          { t: "kv", k: "identity", v: `${profile.name} (@${profile.username})` },
          { t: "kv", k: "role", v: profile.role },
          { t: "kv", k: "location", v: profile.location },
          { t: "output", c: profile.bio },
          {
            t: "output",
            c: profile.available
              ? "● STATUS: Available for work & collaborations"
              : "○ STATUS: Busy",
          },
          {
            t: "tab_hint",
            tab: "about",
            c: "💡 Tip: Switch to the 'about' tab above for the visual timeline & resume view.",
          },
          { t: "rule" },
        ]);
        return;

      case "skills":
        addLines([
          { t: "rule" },
          { t: "system", c: "SKILLS MATRIX (Proficiency Breakdown):" },
          {
            t: "kv",
            k: "frontend",
            v: skills.frontend.map((s) => (typeof s === "string" ? s : s.name)).join("  "),
          },
          {
            t: "kv",
            k: "backend",
            v: skills.backend.map((s) => (typeof s === "string" ? s : s.name)).join("  "),
          },
          {
            t: "kv",
            k: "ai / ml",
            v: skills.ai.map((s) => (typeof s === "string" ? s : s.name)).join("  "),
          },
          {
            t: "kv",
            k: "tools",
            v: skills.tools.map((s) => (typeof s === "string" ? s : s.name)).join("  "),
          },
          {
            t: "tab_hint",
            tab: "skills",
            c: "💡 Tip: Switch to 'skills' tab above to view interactive animated skill bars.",
          },
          { t: "rule" },
        ]);
        return;

      case "projects":
        addLines([{ t: "output", c: "FETCHING FEATURED REPOSITORIES..." }]);
        projects.forEach((p, i) => {
          addLines([{ t: "project", project: p, index: i + 1 }]);
        });
        addLines([
          {
            t: "tab_hint",
            tab: "projects",
            c: "💡 Tip: Open the 'projects' tab for category filters, search, and one-click clone.",
          },
        ]);
        return;

      case "contact":
        addLines([
          { t: "rule" },
          { t: "kv", k: "email", v: profile.email },
          { t: "kv", k: "github", v: profile.github.replace("https://", "") },
          { t: "kv", k: "linkedin", v: profile.linkedin.replace("https://", "") },
          { t: "kv", k: "site", v: profile.portfolio.replace("https://", "") },
          {
            t: "tab_hint",
            tab: "contact",
            c: "💡 Tip: Switch to 'contact' tab to send a direct message via interactive form.",
          },
          { t: "rule" },
        ]);
        return;

      case "neofetch":
        addLines([{ t: "neofetch", uptime: getUptimeFormatted() }]);
        return;

      case "theme":
        if (arg && THEMES[arg]) {
          switchTheme(arg);
          addLines([
            { t: "system", c: `Theme switched to "${THEMES[arg].name}" (${THEMES[arg].badge}) ✓` },
          ]);
        } else {
          addLines([
            { t: "system", c: `Current theme: ${theme.name}` },
            { t: "output", c: "Available themes: " + Object.keys(THEMES).join(" | ") },
            { t: "theme_selector" },
          ]);
        }
        return;

      case "cursor":
        if (arg === "native" || arg === "reticle" || arg === "dot") {
          onCursorModeChange?.(arg);
          addLines([
            { t: "system", c: `Cursor mode set to "${arg.toUpperCase()}" ✓` },
          ]);
        } else {
          const modes = ["reticle", "dot", "native"];
          const nextIndex = (modes.indexOf(cursorMode) + 1) % modes.length;
          const nextMode = modes[nextIndex];
          onCursorModeChange?.(nextMode);
          addLines([
            { t: "system", c: `Cursor mode switched to "${nextMode.toUpperCase()}". (Options: "cursor reticle" | "cursor dot" | "cursor native")` },
          ]);
        }
        return;

      case "matrix":
        setMatrixActive(true);
        addLines([{ t: "system", c: "Matrix screensaver initiated. Press ESC to terminate." }]);
        return;

      case "time":
      case "date":
        addLines([
          { t: "kv", k: "local_time", v: new Date().toString() },
          { t: "kv", k: "uptime", v: getUptimeFormatted() },
        ]);
        return;

      case "history":
        if (commandHistory.length === 0) {
          addLines([{ t: "dim", c: "No command history recorded yet." }]);
        } else {
          addLines([
            { t: "system", c: "COMMAND HISTORY:" },
            ...commandHistory.map((h, idx) => ({
              t: "kv",
              k: `#${idx + 1}`,
              v: h,
            })),
          ]);
        }
        return;

      case "wallpaper": {
        if (arg === "list") {
          addLines([
            { t: "rule" },
            {
              t: "system",
              c: `CURATED WALLPAPERS (${WALLPAPERS.length} HD Backgrounds):`,
            },
            ...WALLPAPERS.map((w, idx) => ({
              t: "kv",
              k: `[${idx + 1}]`,
              v: `${w.title} · ${w.category}${idx === wallpaperIndex ? " [ACTIVE]" : ""}`,
            })),
            {
              t: "dim",
              c: 'Tip: Type "wallpaper <1-18>" or click WP button to change.',
            },
            { t: "rule" },
          ]);
          return;
        }

        const num = parseInt(arg, 10);
        if (!isNaN(num) && num >= 1 && num <= WALLPAPERS.length) {
          addLines([{ t: "output", c: `Loading wallpaper [${num}]...` }]);
          loadWallpaperByIndex(num - 1).then((wp) => {
            addLines([
              {
                t: "system",
                c: `Wallpaper updated: "${wp.title}" (${wp.category}) ✓`,
              },
            ]);
          });
          return;
        }

        addLines([{ t: "output", c: "Loading next wallpaper..." }]);
        nextWallpaper().then((wp) => {
          addLines([
            {
              t: "system",
              c: `Wallpaper updated: "${wp.title}" (${wp.category}) ✓`,
            },
          ]);
        });
        return;
      }

      case "github":
        window.open(profile.github, "_blank", "noreferrer");
        addLines([{ t: "output", c: `Opening GitHub profile (${profile.github})...` }]);
        return;

      case "resume":
        try {
          addLines([{ t: "output", c: "Preparing resume transmission..." }]);
          const response = await fetch(resumePdf);
          if (!response.ok) throw new Error("Failed to load resume");
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = "Hafil_Razak_Resume.pdf";
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          addLines([{ t: "system", c: "Resume downloaded successfully ✓" }]);
        } catch {
          window.open(resumePdf, "_blank");
          addLines([{ t: "system", c: "Resume opened in browser tab ✓" }]);
        }
        return;

      case "sudo":
        soundFx.playError(!soundEnabled);
        addLines([
          {
            t: "error",
            c: `hafil@portfolio: User is not in the sudoers file. This incident will be reported to Hafil.`,
          },
        ]);
        return;

      default:
        soundFx.playError(!soundEnabled);
        addLines([
          {
            t: "error",
            c: `command not found: "${cmd}" — type "help" or click a suggestion chip below.`,
          },
        ]);
        return;
    }
  };

  // Keyboard Navigation: Up/Down for history, Tab for autocomplete, Ctrl+L for clear
  const handleKeyDown = (e) => {
    soundFx.playKeyClick(!soundEnabled);

    if (e.key === "Tab") {
      e.preventDefault();
      if (ghostSuggestion) {
        setInput((prev) => prev + ghostSuggestion);
      } else {
        const lower = input.toLowerCase().trim();
        const match = Object.keys(COMMANDS).find((cmd) => cmd.startsWith(lower));
        if (match) setInput(match);
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextPtr = Math.min(historyPointer + 1, commandHistory.length - 1);
        setHistoryPointer(nextPtr);
        setInput(commandHistory[nextPtr]);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer > 0) {
        const nextPtr = historyPointer - 1;
        setHistoryPointer(nextPtr);
        setInput(commandHistory[nextPtr]);
      } else if (historyPointer === 0) {
        setHistoryPointer(-1);
        setInput("");
      }
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setHistory([]);
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      setInput("");
      return;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden select-none font-mono"
      style={{
        backgroundColor: "var(--term-bg)",
        color: "var(--term-primary)",
      }}
    >
      {/* Background wallpaper with smooth crossfade */}
      <div
        className={`fixed inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300 pointer-events-none ${
          bgLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: wallpaper ? `url(${wallpaper})` : "none",
          backgroundColor: "var(--term-bg)",
          transform: "translateZ(0)",
        }}
      />

      {/* Dark Ambient Overlays (Zero GPU blur overhead) */}
      <div className="fixed inset-0 bg-black/75 pointer-events-none" />
      <div className="vignette fixed inset-0 z-[4]" />
      {scanlines && <div className="scanlines fixed inset-0 z-[5] opacity-40" />}

      {/* Fullscreen Matrix Rain Screen */}
      {matrixActive && (
        <MatrixRain
          color={theme.primary}
          onClose={() => setMatrixActive(false)}
        />
      )}

      {/* Top Notification / Wallpaper Status */}
      {!bgLoaded && (
        <div
          className="fixed right-4 top-4 z-40 rounded-full border px-3 py-1 text-[11px] backdrop-blur"
          style={{
            borderColor: "var(--term-hairline-strong)",
            background: "rgba(0,0,0,0.7)",
            color: "var(--term-primary)",
          }}
        >
          loading wallpaper...
        </div>
      )}

      {/* Main Terminal Window Frame */}
      <div
        className={`relative z-20 mx-auto flex min-h-screen flex-col justify-center px-2 py-4 transition-all duration-300 sm:px-4 md:py-6 ${
          windowMode === "fullscreen"
            ? "max-w-[96vw] min-h-[96vh] my-auto"
            : windowMode === "compact"
            ? "max-w-xl"
            : "max-w-4xl"
        }`}
      >
        {/* Terminal Header Bar */}
        <header className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <div className="flex items-center gap-2">
            <h1
              className="text-lg sm:text-xl font-extrabold tracking-tight"
              style={{
                fontFamily: "'VT323', monospace",
                color: theme.primaryBright,
                textShadow: `0 0 12px ${theme.glow}`,
              }}
            >
              hafil@portfolio: ~
            </h1>
            <span
              className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded border"
              style={{
                borderColor: "var(--term-hairline)",
                color: "var(--term-primary-dim)",
              }}
            >
              git:(main)
            </span>
          </div>

          <HeaderTelemetry available={profile.available} />
        </header>

        {/* Outer Window Box (Optimized GPU rendering) */}
        <div
          className="shell-glow overflow-hidden rounded-xl border transition-all duration-200"
          style={{
            borderColor: "var(--term-hairline-strong)",
            background: "linear-gradient(180deg, var(--term-panel) 0%, var(--term-panel2) 100%)",
          }}
        >
          {/* Titlebar with Window Buttons and Utility Toggles */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 text-xs sm:px-4"
            style={{
              borderColor: "var(--term-hairline)",
              background: "rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Functional Window Dots */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="Clear terminal buffer"
                  onClick={() => {
                    setHistory([]);
                    soundFx.playKeyClick(!soundEnabled);
                  }}
                  className="group relative h-3 w-3 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition"
                >
                  <RotateCcw size={8} className="text-black opacity-0 group-hover:opacity-100" />
                </button>

                <button
                  type="button"
                  title="Toggle compact mode"
                  onClick={() => {
                    setWindowMode((prev) => (prev === "compact" ? "normal" : "compact"));
                    soundFx.playKeyClick(!soundEnabled);
                  }}
                  className="group relative h-3 w-3 rounded-full bg-amber-400/80 hover:bg-amber-400 flex items-center justify-center transition"
                >
                  <Minimize2 size={8} className="text-black opacity-0 group-hover:opacity-100" />
                </button>

                <button
                  type="button"
                  title="Toggle fullscreen mode"
                  onClick={() => {
                    setWindowMode((prev) => (prev === "fullscreen" ? "normal" : "fullscreen"));
                    soundFx.playKeyClick(!soundEnabled);
                  }}
                  className="group relative h-3 w-3 rounded-full bg-green-500/80 hover:bg-green-500 flex items-center justify-center transition"
                >
                  <Maximize2 size={8} className="text-black opacity-0 group-hover:opacity-100" />
                </button>
              </div>

              <span className="ml-2 font-mono text-[11px]" style={{ color: "var(--term-primary-dim)" }}>
                portshell v3.2
              </span>
            </div>

            {/* Quick Actions (Sound, Theme, Scanlines, Matrix) */}
            <div className="flex items-center gap-2 text-[11px]">
              {/* Theme Picker Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setThemePickerOpen((prev) => !prev)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded border transition"
                  style={{
                    borderColor: "var(--term-hairline)",
                    background: "rgba(0,0,0,0.3)",
                    color: theme.primaryBright,
                  }}
                  title="Change Color Theme"
                >
                  <Palette size={12} style={{ color: theme.primary }} />
                  <span className="hidden sm:inline">{theme.name}</span>
                </button>

                {themePickerOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border p-1.5 shadow-2xl backdrop-blur-lg"
                    style={{
                      borderColor: "var(--term-hairline-strong)",
                      backgroundColor: "var(--term-panel)",
                    }}
                  >
                    <div className="text-[10px] px-2 py-1 uppercase text-[var(--term-primary-dim)] font-bold">
                      SELECT THEME
                    </div>
                    {Object.values(THEMES).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => switchTheme(t.id)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition text-left"
                        style={{
                          backgroundColor: themeId === t.id ? `${t.primary}22` : "transparent",
                          color: themeId === t.id ? t.primaryBright : "var(--term-primary-bright)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: t.primary }}
                          />
                          <span>{t.name}</span>
                        </div>
                        <span className="text-[9px] text-[var(--term-primary-dim)]">
                          {t.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cursor Mode Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  const modes = ["reticle", "dot", "native"];
                  const next = modes[(modes.indexOf(cursorMode) + 1) % modes.length];
                  onCursorModeChange?.(next);
                  soundFx.playKeyClick(!soundEnabled);
                }}
                className="px-2 py-0.5 rounded border text-[10px] transition hidden sm:inline-flex items-center gap-1 font-mono"
                style={{
                  borderColor: "var(--term-hairline)",
                  color: cursorMode === "native" ? "var(--term-primary-dim)" : theme.primaryBright,
                  background: cursorMode !== "native" ? `${theme.primary}18` : "rgba(0,0,0,0.3)",
                }}
                title="Toggle Cursor: Reticle (1:1 HUD) / Dot (Laser) / Native (OS Hardware)"
              >
                CUR: {cursorMode.toUpperCase()}
              </button>

              {/* Wallpaper Cycle Button */}
              <button
                type="button"
                onClick={() => {
                  nextWallpaper();
                  soundFx.playKeyClick(!soundEnabled);
                }}
                className="px-2 py-0.5 rounded border text-[10px] transition hidden sm:inline-flex items-center gap-1 font-mono"
                style={{
                  borderColor: "var(--term-hairline)",
                  color: theme.primaryBright,
                  background: "rgba(0,0,0,0.3)",
                }}
                title={`Current: "${WALLPAPERS[wallpaperIndex]?.title}" (${WALLPAPERS[wallpaperIndex]?.category}) — Click to cycle`}
              >
                WP: {wallpaperIndex + 1}/{WALLPAPERS.length} ↻
              </button>

              {/* Sound FX Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className="p-1 rounded border transition"
                style={{
                  borderColor: "var(--term-hairline)",
                  background: soundEnabled ? `${theme.primary}22` : "rgba(0,0,0,0.3)",
                  color: soundEnabled ? theme.primaryBright : "var(--term-primary-dim)",
                }}
                title={soundEnabled ? "Mute audio synthesizer" : "Enable retro 8-bit sound effects"}
              >
                {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>

              {/* Scanline CRT Toggle */}
              <button
                type="button"
                onClick={() => setScanlines((prev) => !prev)}
                className="px-1.5 py-0.5 rounded border text-[10px] transition hidden sm:inline-block"
                style={{
                  borderColor: "var(--term-hairline)",
                  color: scanlines ? theme.primaryBright : "var(--term-primary-dim)",
                }}
                title="Toggle CRT Scanlines"
              >
                CRT: {scanlines ? "ON" : "OFF"}
              </button>

              {/* Matrix Screensaver Trigger */}
              <button
                type="button"
                onClick={() => setMatrixActive(true)}
                className="px-1.5 py-0.5 rounded border text-[10px] transition"
                style={{
                  borderColor: "var(--term-hairline)",
                  color: theme.primaryBright,
                }}
                title="Launch Matrix Screensaver"
              >
                [MATRIX]
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div
            className="flex items-center border-b px-2 overflow-x-auto term-scroll bg-black/25 text-xs"
            style={{ borderColor: "var(--term-hairline)" }}
          >
            {[
              { id: "terminal", label: "terminal.sh", icon: TerminalIcon },
              { id: "projects", label: "projects.json", icon: FolderGit2 },
              { id: "about", label: "about.md", icon: Sparkles },
              { id: "skills", label: "skills.yaml", icon: Cpu },
              { id: "contact", label: "contact.env", icon: Mail },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    soundFx.playKeyClick(!soundEnabled);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-mono text-[11px] sm:text-xs transition-all shrink-0 ${
                    isActive
                      ? "border-current font-bold"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    color: isActive ? theme.primaryBright : "var(--term-primary-dim)",
                    borderColor: isActive ? theme.primary : "transparent",
                    background: isActive ? `${theme.primary}12` : "transparent",
                  }}
                >
                  <Icon size={12} style={{ color: isActive ? theme.primary : "inherit" }} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Main Content Area: Terminal or GUI Tab */}
          <div
            className={`term-scroll overflow-y-auto p-3 sm:p-5 transition-all duration-300 ${
              windowMode === "fullscreen"
                ? "h-[75vh]"
                : windowMode === "compact"
                ? "h-[50vh]"
                : "h-[62vh] sm:h-[65vh]"
            }`}
          >
            {activeTab === "terminal" && (
              <div
                className="h-full flex flex-col justify-between"
                onClick={() => !booting && inputRef.current?.focus()}
              >
                {/* Profile Header Snippet in Terminal */}
                <div
                  className="mb-4 flex flex-col gap-3 border-b pb-3.5 sm:flex-row sm:items-center"
                  style={{ borderColor: "var(--term-hairline)" }}
                >
                  <div className="relative shrink-0">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-12 w-12 rounded-lg border object-cover sm:h-14 sm:w-14"
                      style={{ borderColor: "var(--term-hairline-strong)" }}
                    />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                      style={{
                        borderColor: "var(--term-panel)",
                        backgroundColor: profile.available ? "#4ade80" : "#9ca3af",
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h2
                        className="text-base font-bold sm:text-lg"
                        style={{ color: theme.primaryBright }}
                      >
                        {profile.name}
                      </h2>
                      <span className="text-[10px] text-[var(--term-primary-dim)] font-mono">
                        {profile.location}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--term-primary-dim)]">
                      {profile.role}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px]">
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:underline"
                        style={{ color: theme.primaryBright }}
                      >
                        <Github size={11} />
                        @{profile.username}
                      </a>

                      <button
                        type="button"
                        onClick={() => runCommand("help")}
                        className="text-[10px] underline hover:text-[var(--term-primary-bright)]"
                        style={{ color: theme.primaryDim }}
                      >
                        type &ldquo;help&rdquo; for options
                      </button>
                    </div>
                  </div>
                </div>

                {/* History Stream (Memoized to eliminate re-render on typing) */}
                <HistoryStream
                  history={history}
                  theme={theme}
                  onRunCommand={runCommand}
                  onSwitchTab={setActiveTab}
                  onSwitchTheme={switchTheme}
                />
                <div ref={bottomRef} />

                {/* Interactive Shell Prompt Form */}
                {!booting && (
                  <form
                    onSubmit={handleSubmit}
                    className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-2.5"
                    style={{ borderColor: "var(--term-hairline)" }}
                  >
                    <span
                      className="font-bold text-xs sm:text-sm shrink-0"
                      style={{ color: theme.promptUser }}
                    >
                      hafil@portfolio
                    </span>
                    <span style={{ color: "var(--term-primary-dim)" }}>:</span>
                    <span
                      className="text-xs sm:text-sm"
                      style={{ color: theme.promptPath }}
                    >
                      ~
                    </span>
                    <span style={{ color: "var(--term-primary-dim)" }}>$</span>

                    <div className="relative flex-1 min-w-[14rem]">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent outline-none font-mono text-xs sm:text-sm"
                        style={{
                          color: theme.primaryBright,
                          caretColor: theme.primary,
                        }}
                        placeholder="type a command... (try 'help' or 'projects')"
                        autoComplete="off"
                        spellCheck={false}
                      />

                      {/* Ghost Autocomplete text suggestion */}
                      {ghostSuggestion && (
                        <div
                          className="pointer-events-none absolute left-0 top-0 font-mono text-xs sm:text-sm select-none"
                          style={{ color: "rgba(255, 255, 255, 0.25)" }}
                        >
                          <span className="opacity-0">{input}</span>
                          <span>{ghostSuggestion}</span>
                          <span className="ml-2 text-[10px] rounded border px-1 border-white/20">
                            Tab ⇥
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="caret font-mono" style={{ color: theme.primary }}>
                      ▌
                    </span>
                  </form>
                )}
              </div>
            )}

            {/* GUI Tab Views */}
            {activeTab === "projects" && <GuiProjectsView theme={theme} />}
            {activeTab === "about" && <GuiAboutView theme={theme} />}
            {activeTab === "skills" && <GuiSkillsView theme={theme} />}
            {activeTab === "contact" && <GuiContactView theme={theme} />}
          </div>

          {/* Bottom Dock / Quick-Command Bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-[10px] sm:px-4 sm:text-[11px]"
            style={{
              borderColor: "var(--term-hairline)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] text-[var(--term-primary-dim)] mr-1 hidden sm:inline">
                QUICK EXEC:
              </span>
              {[
                { cmd: "help", label: "help" },
                { cmd: "projects", label: "projects" },
                { cmd: "skills", label: "skills" },
                { cmd: "about", label: "about" },
                { cmd: "contact", label: "contact" },
                { cmd: "neofetch", label: "neofetch" },
                { cmd: "theme", label: "theme" },
                { cmd: "cursor", label: "cursor" },
                { cmd: "matrix", label: "matrix" },
                { cmd: "wallpaper", label: "wallpaper" },
                { cmd: "resume", label: "resume" },
              ].map(({ cmd, label }) => (
                <button
                  key={cmd}
                  type="button"
                  disabled={booting}
                  onClick={() => {
                    setActiveTab("terminal");
                    runCommand(cmd);
                  }}
                  className="rounded px-2 py-0.5 border transition disabled:opacity-30 hover:scale-105 active:scale-95"
                  style={{
                    borderColor: "var(--term-hairline)",
                    background: "rgba(0, 0, 0, 0.3)",
                    color: theme.primaryBright,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Terminal version tag & clear shortcut */}
            <div className="flex items-center gap-3 text-[var(--term-primary-dim)] shrink-0">
              <button
                type="button"
                onClick={() => runCommand("clear")}
                className="hover:underline hover:text-[var(--term-primary-bright)]"
                title="Clear screen (Ctrl+L)"
              >
                clear buffer
              </button>
              <span>portshell · v3.2</span>
            </div>
          </div>
        </div>

        {/* External Social Links Footer */}
        <footer
          className="mt-4 flex flex-wrap justify-center items-center gap-6 text-xs"
          style={{ color: "var(--term-primary-dim)" }}
        >
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-[var(--term-primary-bright)]"
          >
            <Github size={14} />
            GitHub
          </a>

          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-[var(--term-primary-bright)]"
          >
            <Linkedin size={14} />
            LinkedIn
          </a>

          <a
            href={profile.portfolio}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-[var(--term-primary-bright)]"
          >
            <ExternalLink size={14} />
            Website
          </a>

          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-1.5 transition hover:text-[var(--term-primary-bright)]"
          >
            <Mail size={14} />
            {profile.email}
          </a>
        </footer>
      </div>
    </div>
  );
}

// History Line Renderer
function HistoryLine({ item, theme, onRunCommand, onSwitchTab, onSwitchTheme }) {
  switch (item.t) {
    case "boot":
      return <p style={{ color: "var(--term-primary-dim)" }}>{item.c}</p>;

    case "gap":
      return <p>&nbsp;</p>;

    case "system":
      return <p style={{ color: theme.primaryBright }}>{item.c}</p>;

    case "dim":
      return <p style={{ color: "var(--term-primary-dim)" }}>{item.c}</p>;

    case "rule":
      return (
        <div
          className="my-1.5 border-t"
          style={{ borderColor: "var(--term-hairline)" }}
        />
      );

    case "kv":
      return (
        <div className="flex gap-2">
          <span
            className="min-w-[100px] shrink-0"
            style={{ color: "var(--term-primary-dim)" }}
          >
            · {item.k}
          </span>
          <span style={{ color: "var(--term-primary-bright)" }}>{item.v}</span>
        </div>
      );

    case "cmdline":
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onRunCommand(item.k)}
            className="font-bold min-w-[90px] text-left hover:underline"
            style={{ color: theme.accent }}
            title={`Click to execute: ${item.k}`}
          >
            {item.k}
          </button>
          <span style={{ color: "var(--term-primary-dim)" }}>{item.v}</span>
        </div>
      );

    case "input":
      return (
        <div
          className="flex items-center gap-2"
          style={{ color: theme.primaryBright }}
        >
          <span style={{ color: theme.promptUser }}>hafil@portfolio</span>
          <span style={{ color: "var(--term-primary-dim)" }}>:</span>
          <span style={{ color: theme.promptPath }}>~</span>
          <span style={{ color: "var(--term-primary-dim)" }}>$</span>
          <span className="font-bold">{item.c}</span>
        </div>
      );

    case "output":
      return <p className="whitespace-pre-wrap">{item.c}</p>;

    case "error":
      return <p style={{ color: theme.danger }}>{item.c}</p>;

    case "tab_hint":
      return (
        <div className="flex items-center gap-2 my-1">
          <span className="text-[11px]" style={{ color: theme.secondary }}>
            {item.c}
          </span>
          {item.tab && (
            <button
              type="button"
              onClick={() => onSwitchTab(item.tab)}
              className="text-[10px] px-2 py-0.5 rounded border underline"
              style={{
                borderColor: theme.secondary,
                color: theme.secondary,
              }}
            >
              Open [{item.tab}] Tab →
            </button>
          )}
        </div>
      );

    case "theme_selector":
      return (
        <div className="flex flex-wrap gap-1.5 my-2">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSwitchTheme(t.id)}
              className="text-xs px-2 py-1 rounded border flex items-center gap-1.5"
              style={{
                borderColor: t.primary,
                background: `${t.primary}18`,
                color: t.primaryBright,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: t.primary }}
              />
              {t.name}
            </button>
          ))}
        </div>
      );

    case "project":
      return <TerminalProjectCard project={item.project} index={item.index} theme={theme} />;

    case "neofetch":
      return <NeofetchCard uptime={item.uptime} theme={theme} />;

    default:
      return null;
  }
}

HistoryLine.propTypes = {
  item: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  onRunCommand: PropTypes.func.isRequired,
  onSwitchTab: PropTypes.func.isRequired,
  onSwitchTheme: PropTypes.func.isRequired,
};

// Inline Terminal Project Card
function TerminalProjectCard({ project, index, theme }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`git clone ${project.url}.git`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="my-2 rounded-lg border p-3 transition"
      style={{
        borderColor: "var(--term-hairline)",
        background: "rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span style={{ color: "var(--term-primary-dim)" }}>[{index}]</span>
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="font-bold hover:underline"
            style={{ color: theme.primaryBright }}
          >
            {project.name}
          </a>
          <span
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{
              background: `${theme.primary}18`,
              color: theme.primary,
            }}
          >
            {project.language}
          </span>
        </div>

        <div
          className="flex items-center gap-3 text-xs"
          style={{ color: "var(--term-primary-dim)" }}
        >
          <span className="flex items-center gap-1">
            <Star size={12} style={{ color: theme.accent }} />
            {project.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={12} />
            {project.forks}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="hover:underline flex items-center gap-1 text-[11px]"
            title="Copy git clone command"
          >
            {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
            clone
          </button>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline"
              style={{ color: theme.secondary }}
            >
              <ExternalLink size={12} />
              demo
            </a>
          )}
        </div>
      </div>

      <p className="mt-1.5 text-xs" style={{ color: "var(--term-primary-dim)" }}>
        {project.description}
      </p>

      {project.topics?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {project.topics.map((t) => (
            <span
              key={t}
              className="rounded px-1.5 py-0.5 text-[9px] border border-[var(--term-hairline)]"
              style={{ color: "var(--term-primary-dim)" }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

TerminalProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
};

// Neofetch Card with ASCII Logo and System Breakdown
function NeofetchCard({ uptime, theme }) {
  const swatches = [
    theme.primary,
    theme.primaryDim,
    theme.accent,
    theme.secondary,
    theme.danger,
    theme.primaryBright,
  ];

  return (
    <div
      className="my-2.5 flex flex-col gap-4 rounded-xl border p-3.5 sm:flex-row sm:gap-6"
      style={{
        borderColor: "var(--term-hairline)",
        background: "rgba(0,0,0,0.3)",
      }}
    >
      <div className="shrink-0 flex flex-col items-center">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="h-20 w-20 rounded-lg border object-cover sm:h-24 sm:w-24"
          style={{ borderColor: "var(--term-hairline-strong)" }}
        />
        <span className="text-[10px] mt-1.5 font-mono text-[var(--term-primary-dim)]">
          arch-hafilOS
        </span>
      </div>

      <div className="space-y-0.5 text-xs leading-tight flex-1 font-mono">
        <p className="font-bold" style={{ color: theme.primaryBright }}>
          {profile.username}
          <span style={{ color: "var(--term-primary-dim)" }}>@hafil-machine</span>
        </p>

        <p style={{ color: "var(--term-primary-dim)" }}>
          ---------------------------------------
        </p>

        <p>
          <span style={{ color: theme.primary }}>OS:</span> hafilOS x86_64 (Linux / React 19)
        </p>
        <p>
          <span style={{ color: theme.primary }}>Host:</span> {profile.location} (Remote Gateway)
        </p>
        <p>
          <span style={{ color: theme.primary }}>Kernel:</span> portshell 3.2.0-generic
        </p>
        <p>
          <span style={{ color: theme.primary }}>Uptime:</span> {uptime || "0m 00s"}
        </p>
        <p>
          <span style={{ color: theme.primary }}>Shell:</span> zsh 5.9 (x86_64-portshell)
        </p>
        <p>
          <span style={{ color: theme.primary }}>Resolution:</span> 1920x1080 CRT Display
        </p>
        <p>
          <span style={{ color: theme.primary }}>Theme:</span> {theme.name} [{theme.badge}]
        </p>
        <p>
          <span style={{ color: theme.primary }}>Status:</span>{" "}
          {profile.available ? "Available for Opportunities" : "Occupied"}
        </p>

        {/* Color Palette Swatches */}
        <div className="mt-2.5 flex gap-1.5">
          {swatches.map((c, i) => (
            <span
              key={i}
              className="h-3 w-5 rounded-xs"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

NeofetchCard.propTypes = {
  uptime: PropTypes.string,
  theme: PropTypes.object.isRequired,
};

TerminalPortfolio.propTypes = {
  cursorMode: PropTypes.string,
  onCursorModeChange: PropTypes.func,
};

const HeaderTelemetry = React.memo(function HeaderTelemetry({ available }) {
  const [time, setTime] = useState("");
  const [uptime, setUptime] = useState("00m 00s");
  const startRef = useRef(Date.now());

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString("en-US", { hour12: false }));
      const diff = Math.floor((Date.now() - startRef.current) / 1000);
      const hrs = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      setUptime(
        `${hrs > 0 ? `${hrs}h ` : ""}${mins.toString().padStart(2, "0")}m ${secs
          .toString()
          .padStart(2, "0")}s`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center gap-3 text-[11px]"
      style={{ color: "var(--term-primary-dim)" }}
    >
      <span className="flex items-center gap-1 font-mono">
        <Clock size={12} />
        {time || "00:00:00"}
      </span>
      <span className="hidden sm:inline font-mono">up: {uptime}</span>
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: available ? "#4ade80" : "#9ca3af" }}
        />
        <span className="hidden sm:inline">{available ? "online" : "away"}</span>
      </div>
    </div>
  );
});

HeaderTelemetry.propTypes = {
  available: PropTypes.bool,
};

const HistoryStream = React.memo(function HistoryStream({
  history,
  theme,
  onRunCommand,
  onSwitchTab,
  onSwitchTheme,
}) {
  return (
    <div className="space-y-1.5 text-[12px] sm:text-[13px] leading-relaxed flex-1">
      {history.map((item) => (
        <div key={item.key} className="fade-in-line">
          <HistoryLine
            item={item}
            theme={theme}
            onRunCommand={onRunCommand}
            onSwitchTab={onSwitchTab}
            onSwitchTheme={onSwitchTheme}
          />
        </div>
      ))}
    </div>
  );
});

HistoryStream.propTypes = {
  history: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  onRunCommand: PropTypes.func.isRequired,
  onSwitchTab: PropTypes.func.isRequired,
  onSwitchTheme: PropTypes.func.isRequired,
};