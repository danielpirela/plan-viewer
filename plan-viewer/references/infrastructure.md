# Infrastructure — Plan Viewer Deployment & Bidirectional Communication

> **Note**: This document is reference material for the orchestrator.
> The `ui-native-responder` skill itself does NOT read or execute any of
> this — it is a pure composer that outputs a `.tsx` code block. The
> orchestrator handles deployment and action processing.
>
> **Repo**: The plan-viewer project lives at `~/work/plan-viewer` (or wherever
> the user cloned it). All paths below are relative to the repo root.
> The orchestrator must resolve `PLAN_VIEWER_HOME` before following
> any path in this document.

## Preview Deployment — Plan Viewer

After generating a `.tsx` component, deploy it to the **plan-viewer** project
for live browser preview. This project is a pre-configured Vite + React 19 +
Tailwind v4 + shadcn/ui app at `~/.config/opencode/plan-viewer/`.

### One-Time Setup (per machine)

If the plan-viewer project does not exist on the current machine, clone it:

```bash
git clone https://github.com/danielpirela/plan-viewer.git ~/work/plan-viewer
cd ~/work/plan-viewer
pnpm install
```

The project is pre-configured with Vite + React 19 + Tailwind v4 + shadcn/ui.
No additional scaffolding is needed.

### Deploy a Plan Page

When a `.tsx` plan component is generated:

1. **Write** the component file:
   ```bash
   # Write the generated .tsx content to:
   $PLAN_VIEWER_HOME/src/components/plan-page.tsx
   # (typically ~/work/plan-viewer/src/components/plan-page.tsx)
   ```

2. **Start the plan-viewer** (if not already running) via the bootstrap script:
   ```bash
   cd $PLAN_VIEWER_HOME
   node start-plan-viewer.cjs &
   ```

   The bootstrap script handles:
   - Port scanning (4199–4219 range)
   - Spawning Vite + WebSocket signal server as child processes
   - Writing `/tmp/plan-viewer-status.json` for health checks
   - Graceful shutdown on SIGTERM/SIGINT

3. **Health check** via the status file:
   ```bash
   if [ -f /tmp/plan-viewer-status.json ]; then
     URL=$(jq -r '.viteUrl' /tmp/plan-viewer-status.json 2>/dev/null)
     echo "Plan viewer running at $URL"
   else
     echo "Plan viewer not started"
   fi
   ```

   Or check via HTTP:
   ```bash
   curl -s http://localhost:4200/api/health | jq
   ```

### Server Lifecycle Rules

- **No tmux required**: The bootstrap script spawns both Vite and the WebSocket
  server as direct child processes. Tmux is not used.
- **Dynamic ports**: Ports are allocated from the 4199–4219 range. Default pair
  is Vite:4199 + WS:4200. If either is occupied, the next available pair is
  used.
- **Before overwrite**: The plan-viewer does NOT need to be killed before
  updating `plan-page.tsx`. Vite's HMR reloads the page automatically.
- **The `plan-page.tsx` file is the ONLY file modified** per deployment.
  Never touch `App.tsx`, `main.tsx`, or shadcn components.
- **Status file**: `/tmp/plan-viewer-status.json` contains `{ viteUrl, wsPort,
  pid }`. If it contains an `error` field, deployment failed.

## Bidirectional Communication — User → OpenCode via Plan UI

The plan viewer is not just read-only. Buttons in the plan can capture user
intentions and feed them back to the orchestrator without the user typing
commands in the chat.

### Architecture

```
Browser (click) → signalAction() → WebSocket (primary) / HTTP POST (fallback)
    │
    ├── WebSocket ──────────► ws-server.cjs (dynamic port)
    │   { type: "action", payload: { action, data } }
    │
    └── HTTP fallback ──────► POST /api/action
          (blocked WS or firewall)
                                    │
                                    ▼
                           .plan-actions.json
                                    │
                                    ▼
                           Orchestrator reads on "check actions"
```

### WebSocket Protocol

| Direction | Type | Shape |
|-----------|------|-------|
| Client → Server | `action` | `{ type: "action", payload: { action: string, data?: object } }` |
| Server → Client | `ack` | `{ type: "ack", id: string, status: "received" }` |
| Server → Client | `status` | `{ type: "status", connected: boolean, actionsQueued: number }` |

### Signal Client (`@/lib/signal.ts`)

The frontend uses a shared WebSocket client library at
`plan-viewer/src/lib/signal.ts`. It provides:

- `createSignalClient(port)` — open WebSocket with exponential backoff reconnection
- `signalAction(action, data?)` — send an action (WS primary, HTTP fallback)
- `getConnectionStatus()` — returns `"connected" | "connecting" | "disconnected" | "degraded"`
- `onConnectionStatusChange(fn)` — subscribe to status changes (returns unsubscribe)

**Reconnection**: Exponential backoff starting at 1s, doubling to max 30s.
Actions sent while disconnected are queued in memory and flushed on reconnect.

**HTTP fallback**: If the WebSocket connection fails or stays in "degraded"
mode, `signalAction()` automatically falls back to `POST /api/action`.

### Include in Every Plan Page

The plan page component should import `signalAction` from the shared library:

```tsx
import { signalAction, createSignalClient, getConnectionStatus } from "@/lib/signal"
```

No inline `signalAction` helper is needed. The WebSocket client is initialized
once per component mount with `createSignalClient()` in a `useEffect`.

### Action Naming Convention

Use consistent action names so the orchestrator can react predictably:

| Action | Meaning | Orchestrator Response |
|--------|---------|-----------------------|
| `create-spec` | User wants to proceed to `/sdd-spec` | Launch `sdd-spec` phase for current change |
| `create-design` | User wants to proceed to `/sdd-design` | Launch `sdd-design` phase |
| `create-tasks` | User wants task breakdown | Launch `sdd-tasks` phase |
| `approve-proposal` | User approves current proposal | Mark proposal accepted, proceed to spec |
| `reject-proposal` | User rejects or wants changes | Gather feedback, regenerate proposal |
| `edit-scope` | User wants to modify scope | Ask follow-up questions about scope |
| `show-risks` | User wants risk details | Expand risk analysis in current context |
| `apply-change` | User wants to start implementation | Launch `sdd-apply` phase |
| `decision-chosen` | User selected a decision option | Feed into proposal/spec generation |
| `micro-decision` | User confirmed a micro-decision | Feed into design/tasks generation |

### Example Button Integration

```tsx
<Button
  onClick={() => signalAction("create-spec", { changeName: "PDF Export" })}
  className="rounded-lg bg-[#89b4fa] text-[#11111b] font-mono font-bold text-xs"
>
  <FileText className="w-4 h-4 mr-2" />
  Crear Spec
</Button>
```

### WebSocket Status Badge

Display a connection status badge so the user knows whether actions are being
delivered in real time:

```tsx
const [status, setStatus] = useState(getConnectionStatus())
useEffect(() => onConnectionStatusChange(setStatus), [])
// Status: "connected" (green), "connecting" (yellow), "degraded" (red), "disconnected" (gray)
```

### Orchestrator Side

When the orchestrator receives `check actions` (or reads them on its own):

1. Read `$PLAN_VIEWER_HOME/.plan-actions.json`
2. Find the most recent unhandled action
3. Execute the corresponding SDD phase or command
4. Clear handled actions from the file

### Port Management

| Port | Service | Default | Notes |
|------|---------|---------|-------|
| N (4199–4219) | Vite dev server | 4199 | `pnpm dev --host --port N` |
| N+1 | WebSocket signal server | 4200 | `node ws-server.cjs N+1` |

Ports are allocated sequentially: if 4199 is occupied, try 4200/4201, then
4202/4203, up to 4218/4219. If the entire range is exhausted, the bootstrap
script exits with code 1 and an error message.

### URL to share with user

After deployment, tell the user:
```
Abrí http://localhost:{vitePort}/preview en tu navegador
```

Para ver acciones pendientes, el orchestrator lee:
```
$PLAN_VIEWER_HOME/.plan-actions.json
```

### Startup Sequence

**With tmux (automatic orchestrator wake-up):**

```bash
# 1. Start orchestrator in tmux (separate terminal)
tmux new -s pi
pi   # or: opencode

# 2. Start plan-viewer with TMUX_SESSION set (another terminal)
cd $PLAN_VIEWER_HOME
TMUX_SESSION=pi node start-plan-viewer.cjs &
```

**Without tmux (manual trigger):**

```bash
cd $PLAN_VIEWER_HOME
node start-plan-viewer.cjs &
# After clicking in browser, type any message in orchestrator to trigger action processing.
```

### Removed: File Watcher

The `file-watcher.cjs` script has been removed. Its responsibilities are now
handled by:

- **Action delivery**: WebSocket push replaces polling `.plan-actions.json`
  every 2 seconds.
- **Command injection**: Replaced by `tmux send-keys` — the ws-server
  automatically types a trigger message (`pv:<action>`) into the
  orchestrator's tmux session after each action. Set `TMUX_SESSION` env
  var (default: `pi`). Set `TMUX_WAKE_DISABLED=1` to disable.
- **Fallback without tmux**: The orchestrator reads `.plan-actions.json`
  on each user message as a manual trigger.

### Removed: Legacy Signal Server

The `signal-server.cjs` HTTP-only server has been replaced by `ws-server.cjs`,
which adds WebSocket support while preserving all HTTP endpoints:

- `POST /api/action` — submit an action (HTTP fallback)
- `GET /api/actions` — retrieve all pending actions
- `POST /api/reset-plan` — reset the plan output file
- `GET /api/health` — health check (NEW)
