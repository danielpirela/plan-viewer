# Plan Viewer

Interactive visual dashboard for SDD (Spec-Driven Development) planning phases. Compose shadcn/ui pages to present proposals, specs, decision matrices, architecture snapshots, and task boards — with bidirectional communication back to the orchestrator via WebSocket.

## Architecture

```
Browser (React) ←→ WebSocket / HTTP ←→ ws-server.cjs → .plan-actions.json → Orchestrator
                                                          plan-output.json ← Orchestrator
                                                               │
                                                          tmux send-keys (auto wake-up)
```

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui
- **Signal server**: Node.js WebSocket + HTTP fallback (`ws-server.cjs`)
- **Bootstrap**: `start-plan-viewer.cjs` — spawns both, no tmux required for the viewer
- **Orchestrator wake-up**: `tmux send-keys` injects trigger message into your Pi/OpenCode session

## Quick Start

```bash
pnpm install
node start-plan-viewer.cjs
# → http://localhost:4199/preview
```

Ports are auto-allocated from 4199–4219 range. Status file at `/tmp/plan-viewer-status.json`.

---

## Setup: Full Orchestrator Integration

For the plan-viewer to automatically wake up your orchestrator (Pi or OpenCode) when you click buttons in the browser, you need the orchestrator running inside a **tmux session**.

### 1. Start your orchestrator inside tmux

```bash
# Create a tmux session named "pi"
tmux new -s pi

# Inside tmux, launch your orchestrator
pi        # or: opencode
```

### 2. Start the plan-viewer (in another terminal)

```bash
cd ~/work/plan-viewer

# TMUX_SESSION must match the session name above
TMUX_SESSION=pi node start-plan-viewer.cjs &

# Or export for convenience:
export TMUX_SESSION=pi
node start-plan-viewer.cjs &
```

### 3. Done — full bidirectional flow

Now when you click buttons in the plan-viewer browser:

| Step | What happens |
|------|-------------|
| You click a button in the browser | Action written to `.plan-actions.json` |
| Automatically | `tmux send-keys -t pi "pv:<action>" Enter` |
| Your orchestrator receives | `pv:decision-chosen` or `pv:create-spec` etc. |
| Orchestrator responds | Reads `.plan-actions.json`, generates plan, writes `plan-output.json` |
| Browser auto-refreshes | Polls `plan-output.json` every 1s, shows updated plan |

No need to type anything — the browser communicates with your orchestrator directly.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TMUX_SESSION` | `pi` | tmux session name where your orchestrator runs |
| `TMUX_WAKE_DISABLED` | (unset) | Set to `1` to disable automatic tmux wake-up |

### Without tmux (manual trigger)

If you don't want tmux, start the plan-viewer normally and type any message in your orchestrator after clicking in the browser. The orchestrator checks `.plan-actions.json` on each message:

```bash
# Start without tmux integration
node start-plan-viewer.cjs &

# After clicking in the browser, type anything in Pi/OpenCode
# e.g.: "check" or just press Enter
```

---

## SDD Workflow

### Phase 1: Decision (`/` route)

1. Orchestrator writes 3 decision options to `src/lib/plan-output.json`
2. You open `http://localhost:4199` → see 3 options
3. You pick one and click **"Enviar decisión"**
4. Orchestrator receives `pv:decision-chosen` → generates full plan

### Phase 2: Plan Dashboard (`/plan` route)

1. Browser auto-navigates to `/plan?decision=<id>`
2. Orchestrator writes the full PlanConfig to `plan-output.json`
3. You see: scope, tasks, risks, architecture, micro-decisions
4. You make micro-decisions and click **"Crear Spec"**
5. Orchestrator receives `pv:create-spec` → launches SDD spec phase
6. Plan is archived (spec created screen)

### Data Contracts

**Decision phase** (`/` — DecisionPanel reads this):
```json
{
  "heroTitle": "Feature name",
  "heroDescription": "One-line summary",
  "heroBadge": "Decision de Arquitectura",
  "heroBadgeVariant": "yellow",
  "decisionOptions": [
    {
      "id": "unique-id",
      "title": "Option title",
      "description": "What this approach does",
      "icon": "Database",
      "effort": "low",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"]
    }
  ]
}
```

Icons: `Server`, `Search`, `Database`, `Zap`, `Box`, `Activity`.
Effort: `low`, `medium`, `high`.

**Plan phase** (`/plan` — PlanDashboard reads this):
```json
{
  "heroTitle": "Feature name",
  "heroBadge": "Ready for Spec",
  "heroDescription": "Detailed summary",
  "scopeIn": ["What's included"],
  "scopeOut": ["What's excluded"],
  "tasks": [
    { "id": 1, "title": "Task name", "effort": "4h", "status": "pending", "risk": "low" }
  ],
  "risks": [
    { "label": "Risk description", "level": "medium" }
  ],
  "decisions": [
    { "label": "Decision made", "resolved": true }
  ],
  "archDetails": [
    { "icon": "server", "label": "API Layer", "value": "FastAPI + Pydantic", "badge": "v2" }
  ],
  "archStack": ["Python", "PostgreSQL", "Redis"],
  "microDecisions": [
    {
      "title": "ORM or Raw SQL?",
      "description": "Choose the data access pattern",
      "decisionKey": "orm-choice",
      "options": [
        { "id": "sqlalchemy", "name": "SQLAlchemy 2.0", "desc": "Full ORM with async", "effort": "medium" },
        { "id": "raw", "name": "Raw SQL + psycopg3", "desc": "Maximum control", "effort": "high" }
      ]
    }
  ],
  "specStatus": null
}
```

Set `"specStatus": "created"` to archive the plan (shows completion screen).

### Actions Reference

Actions sent from browser → orchestrator:

| Action | Trigger | Payload |
|--------|---------|---------|
| `decision-chosen` | "Enviar decisión" button | `{ decision, selected, title, timestamp }` |
| `create-spec` | "Crear Spec" button | `{ changeName, decision }` |
| `edit-proposal` | "Editar propuesta" button | `{ changeName }` |
| `micro-decision` | Micro-decision confirm | `{ decision, selected, section }` |

---

## Skill: `plan-viewer`

The companion skill at `plan-viewer/SKILL.md` teaches agents how to compose plan pages. It defines:

- **Activation contract**: when to trigger (SDD planning phases)
- **Design system**: Claude Code Dark Mode color tokens, typography, spacing
- **Component catalog**: all available shadcn/ui components with usage guidance
- **Blueprints A–E**: Plan Dashboard, Decision Matrix, Spec Walkthrough, Architecture Snapshot, Task Board
- **Bidirectional communication**: signal actions from browser → orchestrator

### Install the skill

```bash
# For Pi / OpenCode / Gentle AI
cp -r plan-viewer ~/.agents/skills/plan-viewer

# Or symlink
ln -sf $(pwd)/plan-viewer ~/.agents/skills/plan-viewer
```

The skill is also available globally — any orchestrator can use it by reading `plan-viewer/SKILL.md` and its references.

---

## Author

[Daniel Pirela](https://github.com/danielpirela)

## License

MIT — see [LICENSE](./LICENSE)
