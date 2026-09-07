# hafilrazz

Interactive **terminal-style portfolio** backgrounds, custom cursor, and a command-driven shell UI.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

---

## Features

- **Interactive Terminal Shell**: Boot sequence, command history (<kbd>↑</kbd>/<kbd>↓</kbd>), <kbd>Tab</kbd> autocomplete, and inline ghost suggestions.
- **Multi-Theme Engine**: 6 retro/cyberpunk palettes (Phosphor CRT, Cyberpunk 2077, Dracula/Nord, Pip-Boy Amber, Monokai Pro, Tokyo Night) with cursor and glow adaptation.
- **Dual CLI & GUI Navigation**: Switch between terminal mode and visual tabs (`terminal.sh`, `projects.json`, `about.md`, `skills.yaml`, `contact.env`).
- **Matrix Screensaver**: Full-screen falling digital rain animation (`matrix` command or button).
- **Retro Audio FX**: Built-in Web Audio API synthesized mechanical keystrokes, enter chimes, and error beeps (with mute toggle).
- **Interactive Window Frame**: Clear buffer (red dot), compact mode (yellow dot), and fullscreen toggle (green dot), plus live clock and uptime counter.
- **Rich Project Showcase**: Star & fork counters, language tags, live demos, and one-click `git clone` copy.
- **Visual Skills Meter**: Categorized tech stack with animated progress bars.
- **Dynamic Wallpapers & CRT Overlays**: Waifu/aesthetic photo engine, scanline toggle, and vignette overlays.

---

## Commands

| Command      | Description                                       |
|--------------|---------------------------------------------------|
| `help`       | List all available commands                       |
| `about`      | Bio, timeline, education, and resume summary      |
| `skills`     | Tech stack proficiency breakdown                  |
| `projects`   | Featured GitHub repositories and demos            |
| `contact`    | Transmission endpoints and social links           |
| `neofetch`   | Profile system and hardware card                  |
| `theme`      | Switch color theme (`theme matrix/cyberpunk/...`) |
| `matrix`     | Launch falling digital rain screensaver           |
| `wallpaper`  | Load a fresh background                           |
| `time`       | Display current time and session uptime           |
| `history`    | View previously entered shell commands            |
| `resume`     | Download curriculum vitae (PDF)                   |
| `github`     | Open GitHub profile in browser                    |
| `clear`      | Clear terminal output buffer (Ctrl+L)             |


---

## Tech Stack

| Layer        | Tools                                      |
|-------------|---------------------------------------------|
| Framework   | React 19, Vite 6                            |
| Styling     | Tailwind CSS 4, custom CSS                  |
| Animation   | Framer Motion                               |
| Icons       | Lucide React                                |
| Utils       | clsx, tailwind-merge                        |
| Audio       | Web Audio API (zero external assets)        |
| Deploy      | Vercel                                      |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & run

```bash
git clone https://github.com/hafilrazz/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
npm install
npm run dev
