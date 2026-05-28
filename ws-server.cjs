// WebSocket signal server for plan-viewer actions
// Replaces signal-server.cjs + file-watcher.cjs with unified WS + HTTP architecture.
// Run with: node ws-server.cjs [port]
//
// Protocol (WebSocket):
//   Client → Server: { type: "action", payload: { action: string, data?: object } }
//   Server → Client: { type: "ack", id: string, status: "received" }
//   Server → Client: { type: "status", connected: boolean, actionsQueued: number }
//
// HTTP fallback:
//   POST /api/action  → same JSON body as WS action
//   GET  /api/health  → { status: "ok", port: number }

const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = parseInt(process.argv[2], 10) || 4200;
const ACTIONS_FILE = path.join(__dirname, ".plan-actions.json");
const STATUS_FILE = "/tmp/plan-viewer-status.json";

// ── Action queue persistence ──

if (!fs.existsSync(ACTIONS_FILE)) {
  fs.writeFileSync(ACTIONS_FILE, JSON.stringify({ actions: [] }));
}

function readActions() {
  try {
    const data = fs.readFileSync(ACTIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return { actions: [] };
  }
}

function addAction(actionPayload) {
  const data = readActions();
  const entry = {
    ...actionPayload,
    timestamp: Date.now(),
    id: Math.random().toString(36).substring(2, 9),
  };
  data.actions.push(entry);
  // Keep only last 50 actions
  if (data.actions.length > 50) {
    data.actions = data.actions.slice(-50);
  }
  fs.writeFileSync(ACTIONS_FILE, JSON.stringify(data, null, 2));
  return entry;
}

// ── HTTP server (health + action API + CORS) ──

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === "/api/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      port: PORT,
      wsClients: wss ? wss.clients.size : 0,
    }));
    return;
  }

  // Read actions
  if (req.url === "/api/actions" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(readActions()));
    return;
  }

  // Submit action (HTTP fallback)
  if (req.url === "/api/action" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const { action, data, source } = JSON.parse(body);
        const entry = addAction({ action: action || "unknown", data, source: source || "http" });
        broadcastStatus();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, id: entry.id }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // Reset plan
  if (req.url === "/api/reset-plan" && req.method === "POST") {
    const planFile = path.join(__dirname, "src", "lib", "plan-output.json");
    fs.writeFileSync(planFile, "null");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Plan reset" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

// ── WebSocket server ──

const wss = new WebSocketServer({ server });

function broadcastStatus() {
  const payload = JSON.stringify({
    type: "status",
    connected: wss.clients.size > 0,
    actionsQueued: readActions().actions.length,
  });
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(payload);
  });
}

wss.on("connection", (ws) => {
  console.log(`🔗 WebSocket client connected (total: ${wss.clients.size})`);
  broadcastStatus();

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "action" && msg.payload) {
        const entry = addAction({
          action: msg.payload.action || "unknown",
          data: msg.payload.data,
          source: "websocket",
        });
        // Ack the action
        ws.send(JSON.stringify({
          type: "ack",
          id: entry.id,
          status: "received",
        }));
        console.log(`📮 WS action received: ${msg.payload.action} (${entry.id})`);
        broadcastStatus();
      }
    } catch (err) {
      console.error("❌ Invalid WS message:", err.message);
    }
  });

  ws.on("close", () => {
    console.log(`🔌 WebSocket client disconnected (total: ${wss.clients.size})`);
    broadcastStatus();
  });

  ws.on("error", (err) => {
    console.error("⚠️  WebSocket error:", err.message);
  });
});

// ── Status file for orchestrator health checks ──

function writeStatusFile() {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify({
      viteUrl: `http://localhost:${PORT - 1}`, // assumed sequential pair
      wsPort: PORT,
      pid: process.pid,
      startedAt: new Date().toISOString(),
    }, null, 2));
  } catch {}
}

// ── Start ──

server.listen(PORT, () => {
  writeStatusFile();
  console.log(`🔌 WebSocket signal server running on ws://localhost:${PORT}`);
  console.log(`🌐 HTTP fallback:  http://localhost:${PORT}/api/action`);
  console.log(`💚 Health check:   http://localhost:${PORT}/api/health`);
  console.log(`📁 Actions file:   ${ACTIONS_FILE}`);
  console.log(`📊 Status file:    ${STATUS_FILE}`);
});

// Update status file on exit
process.on("SIGTERM", () => {
  try { fs.unlinkSync(STATUS_FILE); } catch {}
  wss.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  try { fs.unlinkSync(STATUS_FILE); } catch {}
  wss.close(() => process.exit(0));
});
