# Plan Viewer

Interactive visual dashboard for SDD (Spec-Driven Development) planning phases. Compose shadcn/ui pages from known components to present proposals, specs, decision matrices, architecture snapshots, and task boards — with bidirectional communication back to the orchestrator via WebSocket.

## Architecture

```
Browser (React) ←→ WebSocket / HTTP ←→ ws-server.cjs → .plan-actions.json → Orchestrator
                                                          plan-output.json ← Orchestrator
```

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui
- **Signal server**: Node.js WebSocket + HTTP fallback (`ws-server.cjs`)
- **Bootstrap**: `start-plan-viewer.cjs` — spawns both, no tmux required

## Quick Start

```bash
pnpm install
node start-plan-viewer.cjs
# → http://localhost:4199/preview
```

Ports are auto-allocated from 4199–4219 range. Status file at `/tmp/plan-viewer-status.json`.

## Skill: `ui-native-responder`

The companion skill at `skill/SKILL.md` teaches agents how to compose plan pages. It defines:

- **Activation contract**: when to trigger (SDD planning phases)
- **Design system**: Claude Code Dark Mode color tokens, typography, spacing
- **Component catalog**: all available shadcn/ui components with usage guidance
- **Blueprints A–E**: Plan Dashboard, Decision Matrix, Spec Walkthrough, Architecture Snapshot, Task Board
- **Bidirectional communication**: signal actions from browser → orchestrator

### Install the skill

```bash
# For OpenCode / Gentle AI
cp -r skill ~/.agents/skills/ui-native-responder

# Or symlink
ln -sf $(pwd)/skill ~/.agents/skills/ui-native-responder
```

## Deployment

When an orchestrator generates a plan page:

1. Write the `.tsx` component to `src/components/plan-page.tsx`
2. Vite HMR reloads automatically
3. User interacts with buttons → actions written to `.plan-actions.json`
4. Orchestrator reads actions and responds (launch SDD phases, incorporate decisions)

## Actions

| Action | Meaning | Orchestrator Response |
|--------|---------|-----------------------|
| `create-spec` | Proceed to `/sdd-spec` | Launch spec phase |
| `create-design` | Proceed to `/sdd-design` | Launch design phase |
| `create-tasks` | Task breakdown | Launch tasks phase |
| `approve-proposal` | Approve proposal | Mark accepted → spec |
| `reject-proposal` | Reject / modify | Gather feedback |
| `decision-chosen` | Selected option | Feed into proposal |
| `micro-decision` | Confirmed detail | Feed into design/tasks |
| `apply-change` | Start implementation | Launch apply phase |

## License

## Author

[Daniel Pirela](https://github.com/danielpirela)

## License

MIT — see [LICENSE](./LICENSE)
