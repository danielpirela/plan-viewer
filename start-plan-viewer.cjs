// Bootstrap script for plan-viewer preview
// Spawns Vite dev server + WebSocket signal server as child processes.
// No tmux required. Dynamic port allocation (4199–4219 range).
//
// Usage: node start-plan-viewer.cjs [--base-port PORT]
//
// Outputs clickable URLs to stdout.
// Writes /tmp/plan-viewer-status.json for orchestrator health checks.

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");

const BASE_PORT = parseInt(process.argv[2], 10) || 4199;
const MAX_PORT = 4219;
const STATUS_FILE = "/tmp/plan-viewer-status.json";

// ── Port utilities ──

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function findPortPair(startPort, maxPort) {
  for (let vitePort = startPort; vitePort <= maxPort - 1; vitePort += 2) {
    const wsPort = vitePort + 1;
    const viteFree = await checkPort(vitePort);
    if (!viteFree) {
      console.log(`⚠️  Port ${vitePort} occupied, trying next pair...`);
      continue;
    }
    const wsFree = await checkPort(wsPort);
    if (!wsFree) {
      console.log(`⚠️  Port ${wsPort} occupied, trying next pair...`);
      continue;
    }
    return { vitePort, wsPort, fallback: vitePort !== startPort };
  }
  return null;
}

// ── Child process management ──

const children = [];

function startChild(command, args, label) {
  const child = spawn(command, args, {
    cwd: path.join(__dirname),
    stdio: "inherit",
    env: { ...process.env },
  });
  child.on("error", (err) => {
    console.error(`❌ Failed to start ${label}: ${err.message}`);
    cleanup(1);
  });
  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`🛑 ${label} killed by ${signal}`);
    } else if (code !== 0) {
      console.error(`❌ ${label} exited with code ${code}`);
    }
  });
  children.push(child);
  return child;
}

function cleanup(exitCode = 0) {
  // Write status file with error
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify({
      error: "shutdown",
      stoppedAt: new Date().toISOString(),
    }, null, 2));
  } catch {}

  // Kill all children
  children.forEach((child) => {
    try { child.kill("SIGTERM"); } catch {}
  });

  // Clean up status file
  setTimeout(() => {
    try { fs.unlinkSync(STATUS_FILE); } catch {}
    process.exit(exitCode);
  }, 200);
}

// ── Signal handlers ──

process.on("SIGINT", () => {
  console.log("\n⏹️  Received SIGINT, shutting down...");
  cleanup(0);
});
process.on("SIGTERM", () => {
  console.log("\n⏹️  Received SIGTERM, shutting down...");
  cleanup(0);
});
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught exception:", err.message);
  cleanup(1);
});

// ── Main ──

async function main() {
  console.log("🔍 Scanning for available ports...");

  const pair = await findPortPair(BASE_PORT, MAX_PORT);
  if (!pair) {
    console.error(`❌ Error: all ports in range [${BASE_PORT}-${MAX_PORT}] are occupied`);
    try {
      fs.writeFileSync(STATUS_FILE, JSON.stringify({
        error: "all ports occupied",
        range: `${BASE_PORT}-${MAX_PORT}`,
        timestamp: new Date().toISOString(),
      }, null, 2));
    } catch {}
    process.exit(1);
  }

  const { vitePort, wsPort, fallback } = pair;

  if (fallback) {
    console.log(`⚠️  Default port ${BASE_PORT} occupied, using alternates:`);
  }

  // Start WebSocket server first (so it's ready when Vite launches)
  console.log(`🔌 Starting WebSocket signal server on port ${wsPort}...`);
  startChild("node", ["ws-server.cjs", String(wsPort)], `ws-server:${wsPort}`);

  // Small delay to let ws-server bind before Vite
  await new Promise(resolve => setTimeout(resolve, 500));

  // Start Vite dev server
  console.log(`🚀 Starting Vite dev server on port ${vitePort}...`);
  startChild("pnpm", ["dev", "--host", "--port", String(vitePort)], `vite:${vitePort}`);

  // Write status file
  const status = {
    viteUrl: `http://localhost:${vitePort}`,
    wsPort: wsPort,
    pid: process.pid,
    children: children.map(c => c.pid),
    startedAt: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
  } catch {}

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🎯 Plan Viewer Ready");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Preview:  http://localhost:${vitePort}/preview`);
  console.log(`  WS Port:  ${wsPort}`);
  console.log(`  Status:   ${STATUS_FILE}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Press Ctrl+C to stop all services");
  console.log("");
}

main();
