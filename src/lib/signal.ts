// WebSocket signal client for plan-viewer UI
// Provides signalAction() — WebSocket-first with HTTP POST fallback.
// Auto-reconnects with exponential backoff (1s → 2s → 4s → ... → 30s max).
// Exports connectionStatus as a reactive ref for UI badges.

let wsClient: WebSocket | null = null;
let wsPort = 4200;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30000;

// In-memory queue for unsent actions while disconnected
const pendingQueue: Array<{ action: string; data?: Record<string, unknown> }> = [];

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "degraded";

let _connectionStatus: ConnectionStatus = "disconnected";
const statusListeners = new Set<(status: ConnectionStatus) => void>();

export function getConnectionStatus(): ConnectionStatus {
  return _connectionStatus;
}

export function onConnectionStatusChange(fn: (status: ConnectionStatus) => void) {
  statusListeners.add(fn);
  fn(_connectionStatus); // emit current immediately
  return () => statusListeners.delete(fn);
}

function setStatus(status: ConnectionStatus) {
  if (_connectionStatus === status) return;
  _connectionStatus = status;
  statusListeners.forEach((fn) => fn(status));
}

// ── WebSocket Client ──

export function createSignalClient(port: number = 4200) {
  wsPort = port;
  connect();
}

function connect() {
  if (wsClient && (wsClient.readyState === WebSocket.OPEN || wsClient.readyState === WebSocket.CONNECTING)) {
    return;
  }

  setStatus("connecting");

  try {
    wsClient = new WebSocket(`ws://localhost:${wsPort}`);
  } catch {
    // WebSocket constructor throws if URL is invalid
    setStatus("disconnected");
    scheduleReconnect();
    return;
  }

  wsClient.onopen = () => {
    console.log(`🔗 Signal WebSocket connected on port ${wsPort}`);
    setStatus("connected");
    reconnectDelay = 1000; // reset backoff

    // Flush pending queue
    while (pendingQueue.length > 0) {
      const action = pendingQueue.shift()!;
      sendViaWS(action.action, action.data);
    }
  };

  wsClient.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "status") {
        console.log(`📊 WS status: ${msg.connected ? "connected" : "disconnected"}, queued: ${msg.actionsQueued}`);
      }
    } catch {}
  };

  wsClient.onclose = () => {
    console.log("🔌 Signal WebSocket disconnected");
    setStatus("disconnected");
    scheduleReconnect();
  };

  wsClient.onerror = () => {
    // onclose will fire next — no need to change status here
    wsClient?.close();
  };
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  console.log(`⏳ Reconnecting in ${reconnectDelay / 1000}s...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
    connect();
  }, reconnectDelay);
}

function sendViaWS(action: string, data?: Record<string, unknown>) {
  if (!wsClient || wsClient.readyState !== WebSocket.OPEN) {
    // Queue for later
    pendingQueue.push({ action, data });
    return;
  }
  wsClient.send(JSON.stringify({
    type: "action",
    payload: { action, data },
  }));
}

// ── HTTP Fallback ──

async function sendViaHTTP(action: string, data?: Record<string, unknown>) {
  try {
    await fetch(`http://localhost:${wsPort}/api/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data, source: "plan-viewer" }),
    });
  } catch {
    console.log("No se pudo enviar la señal de acción.");
  }
}

// ── Public API ──

/**
 * Send an action to the orchestrator via WebSocket (primary) or HTTP POST (fallback).
 * Actions are queued in memory when disconnected and flushed on reconnect.
 */
export async function signalAction(action: string, data?: Record<string, unknown>) {
  if (_connectionStatus === "connected" && wsClient && wsClient.readyState === WebSocket.OPEN) {
    sendViaWS(action, data);
  } else if (_connectionStatus === "degraded") {
    // Already in degraded mode — use HTTP directly
    await sendViaHTTP(action, data);
  } else {
    // Try WS first, fall back to HTTP
    try {
      sendViaWS(action, data);
    } catch {
      setStatus("degraded");
      await sendViaHTTP(action, data);
    }
  }
}
