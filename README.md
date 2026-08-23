# hafilrazz

Interactive **terminal-style portfolio** for [Hafil Razak](https://github.com/hafilrazz) — backgrounds, custom cursor, and a command-driven shell UI.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

---

## Features

- Terminal UI with boot sequence and live command input
- Random **style** wallpaper on every refresh (`wallpaper` command to change it)
- Custom green glow cursor (auto-disabled on touch devices)
- Commands: `help`, `about`, `skills`, `projects`, `contact`, `neofetch`, `github`, `clear`
- Project cards with stars, forks, topics, and live demos
- Glassmorphism panel, CRT scanlines, vignette overlays
- Fully responsive

---

## Tech Stack

| Layer        | Tools                                      |
|-------------|---------------------------------------------|
| Framework   | React 19, Vite 6                            |
| Styling     | Tailwind CSS 4, custom CSS                  |
| Animation   | Framer Motion                               |
| Icons       | Lucide React                                |
| Utils       | clsx, tailwind-merge                        |
| Deploy      | Vercel                                      |

---

## Commands

| Command      | Description                    |
|-------------|---------------------------------|
| `help`      | List all commands               |
| `about`     | About me                        |
| `skills`    | Tech stack                      |
| `projects`  | Featured GitHub projects        |
| `contact`   | Social / contact links          |
| `neofetch`  | Profile system card             |
| `wallpaper` | Load a new anime background     |
| `github`    | Open GitHub profile             |
| `clear`     | Clear the terminal              |

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