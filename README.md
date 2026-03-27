# Obsidian Dashboard

Ein Linear-inspiriertes Project Management Dashboard, das einen Obsidian Vault als Datenquelle nutzt. Tasks, Projekte und Cycles werden als Markdown-Dateien mit YAML-Frontmatter verwaltet -- das Dashboard bietet die grafische Oberflaeche dazu.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8) ![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

### Dashboard Home
- **Stats Cards** -- Offene Tasks, In Progress, Completed, Overdue mit Trend-Indikatoren
- **Status Chart** -- Donut-Chart der Task-Verteilung nach Status
- **Priority Chart** -- Balkendiagramm nach Prioritaet
- **Velocity Chart** -- Erledigte Tasks pro Woche (Area Chart)
- **Active Cycle Widget** -- Aktueller Sprint mit Progress-Ring
- **Recent Activity** -- Letzte Aenderungen im Vault

### Kanban Board (`/board`)
- Drag & Drop zwischen Status-Spalten (Backlog, Todo, In Progress, In Review, Done)
- Automatisches Frontmatter-Update bei Statusaenderung
- Karten zeigen Priority, Labels, Assignee, Estimate, Due Date
- Farbcodierte Priority-Leiste an jeder Karte

### Issues Liste (`/issues`)
- Sortierbar nach Status, Priority, Title, Assignee, Due Date, Created, Updated
- Gruppierung nach Status, Priority, Project, Assignee oder Cycle
- Erweiterte Filter-Bar mit Chips (Multi-Select fuer alle Kriterien)
- Textsuche ueber Titel, ID und Inhalt
- Ueberfaellige Tasks werden rot hervorgehoben

### Projekte (`/projects`)
- Projekt-Karten mit Progress-Bar, Health-Indikator, Team-Tags
- Detail-Ansicht mit gefilterten Issues pro Projekt
- Health-Status: On Track (gruen), At Risk (orange), Off Track (rot)

### Cycles / Sprints (`/cycles`)
- Gruppiert in Active, Upcoming und Completed
- Kreisfoermiger Progress-Indikator
- Status-Verteilungsbalken pro Cycle
- Verbleibende Tage und Issue-Statistiken

### Timeline / Gantt (`/timeline`)
- SVG-basierte Gantt-Ansicht
- Zoom-Level: Woche oder Monat
- Projekt-Bars mit Progress-Overlay
- Today-Linie (rot) fuer aktuelles Datum
- Health-farbcodierte Balken

### Command Palette
- Oeffnen mit `Cmd+K` / `Ctrl+K`
- Suche ueber Tasks, Projekte und Navigation
- Sofortige Navigation per Tastatur

### Keyboard Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Command Palette oeffnen |
| `G` dann `H` | Home / Dashboard |
| `G` dann `I` | Issues Liste |
| `G` dann `B` | Board |
| `G` dann `P` | Projekte |
| `G` dann `C` | Cycles |
| `G` dann `T` | Timeline |

---

## Quickstart

### Voraussetzungen

- [Node.js](https://nodejs.org/) >= 18
- npm oder yarn

### Installation

```bash
git clone https://github.com/rolachnews-beep/Webseite.git
cd Webseite
npm install
```

### Konfiguration

Die Umgebungsvariable `VAULT_PATH` bestimmt den Pfad zum Obsidian Vault. Standard ist `./vault`.

```bash
# .env.local (optional, Standard ist ./vault)
VAULT_PATH=./vault
```

### Starten

```bash
# Entwicklung
npm run dev

# Production Build
npm run build
npm start
```

Das Dashboard ist dann unter **http://localhost:3000** erreichbar.

---

## Vault-Struktur

Das Dashboard liest und schreibt Markdown-Dateien aus drei Verzeichnissen im Vault:

```
vault/
├── tasks/          # Einzelne Task-Dateien
│   ├── task-001.md
│   ├── task-002.md
│   └── ...
├── projects/       # Projekt-Dateien
│   ├── website-redesign.md
│   └── ...
└── cycles/         # Sprint/Cycle-Dateien
    ├── sprint-26-07.md
    └── ...
```

### Task Schema

Jede Task-Datei hat YAML-Frontmatter und einen Markdown-Body:

```yaml
---
type: task
id: "TASK-001"
title: "Design system component library"
status: "in-progress"          # backlog | todo | in-progress | in-review | done | cancelled
priority: "high"               # urgent | high | medium | low | none
project: "Website Redesign"    # Verknuepfung zum Projekt (by title)
assignee: "Sarah Chen"
labels: ["design", "frontend"]
estimate: "L"                  # XS | S | M | L | XL
due_date: "2026-04-15"
start_date: "2026-03-20"
cycle: "Sprint 26-07"          # Verknuepfung zum Cycle (by title)
parent: ""                     # Uebergeordneter Task (ID)
blocked_by: []                 # Task-IDs die diesen Task blockieren
blocking: ["TASK-003"]         # Task-IDs die von diesem Task blockiert werden
created: "2026-03-15"
updated: "2026-03-25"
---

Beschreibung des Tasks in Markdown...
```

### Project Schema

```yaml
---
type: project
id: "PROJ-001"
title: "Website Redesign"
status: "active"               # planned | active | paused | completed | cancelled
lead: "Sarah Chen"
teams: ["Engineering", "Design"]
start_date: "2026-03-01"
target_date: "2026-06-01"
health: "on-track"             # on-track | at-risk | off-track
description: "Complete redesign of the company website"
---

## Goals
- Modern, responsive design
- Improved performance
```

### Cycle Schema

```yaml
---
type: cycle
id: "CYCLE-002"
title: "Sprint 26-07"
start_date: "2026-03-24"
end_date: "2026-04-07"
status: "active"               # upcoming | active | completed
---

Sprint-Ziele und Notizen...
```

---

## Wie es funktioniert

### Architektur

```
Obsidian Vault (.md Dateien)
        |
        v
  Vault Reader (gray-matter)  -->  API Routes (Next.js)  -->  React Frontend
        ^                                                          |
        |                                                          v
  Vault Writer (gray-matter)  <--  API Routes (PUT)       <--  User Actions
```

1. **Lesen**: Der Vault Reader parst alle `.md`-Dateien mit `gray-matter`, extrahiert YAML-Frontmatter und Markdown-Body, und gibt typisierte TypeScript-Objekte zurueck.

2. **Anzeigen**: Die API Routes (`/api/vault/tasks`, `/api/vault/projects`, `/api/vault/cycles`) stellen die Daten als JSON bereit. React-Hooks (`useTasks`, `useProjects`) laden die Daten in den Zustand.

3. **Aendern**: Bei Aktionen wie Drag & Drop im Board oder Property-Aenderungen wird ein `PUT`-Request an die API gesendet. Der Vault Writer aktualisiert nur die betroffenen Frontmatter-Felder und laesst den Markdown-Body unberuehrt.

4. **Sync**: Da die Dateien direkt im Obsidian Vault liegen, sind Aenderungen sofort in Obsidian sichtbar -- und umgekehrt.

### API Endpunkte

| Methode | Route | Beschreibung |
|---------|-------|-------------|
| `GET` | `/api/vault/tasks` | Alle Tasks als JSON |
| `PUT` | `/api/vault/tasks` | Task-Frontmatter aktualisieren |
| `GET` | `/api/vault/projects` | Alle Projekte als JSON |
| `PUT` | `/api/vault/projects` | Projekt-Frontmatter aktualisieren |
| `GET` | `/api/vault/cycles` | Alle Cycles als JSON |
| `PUT` | `/api/vault/cycles` | Cycle-Frontmatter aktualisieren |

**PUT Request Format:**
```json
{
  "filePath": "/pfad/zur/datei.md",
  "updates": {
    "status": "done",
    "priority": "high"
  }
}
```

---

## Tech Stack

| Technologie | Zweck |
|-------------|-------|
| [Next.js 14](https://nextjs.org/) | React Framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Typ-Sicherheit |
| [Tailwind CSS](https://tailwindcss.com/) | Styling (Custom Dark Theme) |
| [gray-matter](https://github.com/jonschlinkert/gray-matter) | YAML Frontmatter Parsing |
| [Zustand](https://zustand-demo.pmnd.rs/) | State Management |
| [@dnd-kit](https://dndkit.com/) | Drag & Drop (Kanban Board) |
| [Recharts](https://recharts.org/) | Charts & Diagramme |
| [cmdk](https://cmdk.paco.me/) | Command Palette |
| [date-fns](https://date-fns.org/) | Datum-Utilities |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown Rendering |
| [Lucide React](https://lucide.dev/) | Icons |

---

## Design System

Das UI orientiert sich am Design von [Linear.app](https://linear.app/) -- dark-first, minimal, keyboard-driven.

### Farbpalette

```
Hintergrund:     #0a0a0b     (near black)
Oberflaeche:     #1b1b1f     (cards, panels)
Hover:           #232328
Sidebar:         #111113
Border:          #2e2e32
Text Primary:    #ededef
Text Secondary:  #8a8a8e
Text Tertiary:   #5c5c60
Accent:          #5e6ad2     (Linear Purple)
```

### Status-Farben

| Status | Farbe | Hex |
|--------|-------|-----|
| Backlog | Grau | `#8a8a8e` |
| Todo | Hellgrau | `#e2e2e3` |
| In Progress | Gelb | `#f2c94c` |
| In Review | Blau | `#2d9cdb` |
| Done | Gruen | `#27ae60` |
| Cancelled | Rot | `#ef4444` |

### Priority-Farben

| Priority | Farbe | Hex |
|----------|-------|-----|
| Urgent | Rot | `#f76b6b` |
| High | Orange | `#e89b3e` |
| Medium | Gelb | `#f2c94c` |
| Low | Grau | `#6b7280` |
| None | Gedaempft | `#5c5c60` |

---

## Projektstruktur

```
Webseite/
├── app/
│   ├── layout.tsx                 # Root Layout (Dark Theme, Inter Font)
│   ├── page.tsx                   # Dashboard Home
│   ├── globals.css                # Globale Styles + CSS Utilities
│   ├── board/page.tsx             # Kanban Board
│   ├── issues/page.tsx            # Issues Liste
│   ├── issues/[id]/page.tsx       # Issue Detail
│   ├── projects/page.tsx          # Projekt-Uebersicht
│   ├── projects/[id]/page.tsx     # Projekt Detail
│   ├── cycles/page.tsx            # Cycles Uebersicht
│   ├── cycles/[id]/page.tsx       # Cycle Detail
│   ├── timeline/page.tsx          # Gantt Timeline
│   └── api/vault/                 # REST API fuer Vault-Zugriff
│       ├── tasks/route.ts
│       ├── projects/route.ts
│       └── cycles/route.ts
├── components/
│   ├── layout/                    # App Shell, Sidebar, Header, Command Palette
│   ├── dashboard/                 # Stats Cards, Charts, Activity Feed
│   ├── board/                     # Kanban Board, Columns, Cards
│   └── issues/                    # Issue List, Row, Filters
├── lib/
│   ├── vault/                     # Vault Reader & Writer (gray-matter)
│   ├── store/                     # Zustand Stores (UI, Tasks, Projects)
│   ├── hooks/                     # Custom Hooks (useTasks, useProjects, useKeyboard)
│   ├── types/                     # TypeScript Interfaces
│   ├── constants.ts               # Status/Priority/Label Konfiguration
│   └── utils.ts                   # Hilfsfunktionen (cn, etc.)
├── vault/                         # Obsidian Vault (Beispieldaten)
│   ├── tasks/                     # 12 Beispiel-Tasks
│   ├── projects/                  # 3 Beispiel-Projekte
│   └── cycles/                    # 3 Beispiel-Cycles
├── tailwind.config.ts             # Linear-Theme Konfiguration
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## Eigene Daten verwenden

1. Erstelle einen Ordner mit der Vault-Struktur (`tasks/`, `projects/`, `cycles/`)
2. Lege Markdown-Dateien nach den oben beschriebenen Schemas an
3. Setze `VAULT_PATH` in `.env.local` auf den Pfad zu deinem Ordner
4. Starte das Dashboard -- deine Daten erscheinen automatisch

Du kannst die Dateien auch direkt in Obsidian bearbeiten. Beim naechsten Laden des Dashboards werden die Aenderungen uebernommen.

---

## Scripts

```bash
npm run dev       # Entwicklungsserver starten (http://localhost:3000)
npm run build     # Production Build erstellen
npm start         # Production Server starten
npm run lint      # ESLint ausfuehren
```

---

## Lizenz

MIT
